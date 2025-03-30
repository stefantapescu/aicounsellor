'use server'

import { createClient } from '@/utils/supabase/server'
import { type SupabaseClient } from '@supabase/supabase-js' // Import type from main package
import { revalidatePath } from 'next/cache'
import OpenAI from 'openai';

import {
    allQuestions,
    type AssessmentQuestion,
    type ScenarioChoiceQuestion,
    type AptitudeQuestion,
    type LearningStyleQuestion,
    // Removed unused: LikertQuestion, ChoiceOption, SectionId
    valueItems // Import valueItems for prompt helper
} from './assessmentData';

// Type for simplified badge data (can be shared)
interface BadgeData {
    id: string;
    name: string; // Added name for feedback
    criteria: {
        quiz_completed?: string;
        points_required?: number;
        section_completed?: string;
    }
}

// Define a more specific type for response data
type ResponseData = Record<string, number | string | string[]>;

interface VocationalResponsePayload {
  userId: string;
  assessmentId?: string;
  sectionId: string; // Use string here, SectionId type was unused
  responseData: ResponseData; // Use defined type
}

// --- Function to save raw answers per section ---
export async function saveVocationalResponse({
  userId,
  assessmentId = 'main_vocational',
  sectionId,
  responseData,
}: VocationalResponsePayload) {
  if (!userId || !sectionId || !responseData) {
    console.error('Missing data for saving vocational response.')
    return { error: 'Missing required fields.' }
  }
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from('vocational_responses')
      .upsert( { user_id: userId, assessment_id: assessmentId, section_id: sectionId, response_data: responseData, updated_at: new Date().toISOString() }, { onConflict: 'user_id, assessment_id, section_id' } )
      .select().single()
    if (error) throw error
    console.log(`Vocational response saved for user ${userId}, section ${sectionId}:`, data)
    revalidatePath('/results')

    // --- Start Gamification Logic ---
    const sectionPoints = 50;
    // Use const as it's only pushed to, not reassigned
    const newlyEarnedBadges: BadgeData[] = [];
    let finalPoints = 0;
    let finalLevel = 1;
    try {
        const [progressResult, badgesResult] = await Promise.all([
            supabase.from('user_progress').select('points, level, earned_badge_ids').eq('user_id', userId).single(),
            supabase.from('badges').select('id, name, criteria')
        ]);
        // Define type for progress data
        type UserProgress = { points: number; level: number; earned_badge_ids: string[] | null };
        const currentProgress: UserProgress = progressResult.data || { points: 0, level: 1, earned_badge_ids: [] };
        if (progressResult.error && progressResult.error.code !== 'PGRST116') throw progressResult.error;
        if (badgesResult.error) throw badgesResult.error;
        const badges = (badgesResult.data || []) as BadgeData[];
        finalPoints = (currentProgress.points || 0) + sectionPoints;
        finalLevel = Math.floor(finalPoints / 500) + 1;
        const currentBadgeIds = new Set(currentProgress.earned_badge_ids || []);
        badges.forEach(badge => {
            if (!currentBadgeIds.has(badge.id)) {
                let earned = false;
                if (badge.criteria?.section_completed === sectionId) earned = true;
                if (badge.criteria?.points_required && finalPoints >= badge.criteria.points_required) earned = true;
                if (earned) { newlyEarnedBadges.push(badge); currentBadgeIds.add(badge.id); }
            }
        });
        const finalBadgeIds = Array.from(currentBadgeIds);
        const { error: updateProgressError } = await supabase.from('user_progress').update({ points: finalPoints, level: finalLevel, earned_badge_ids: finalBadgeIds, updated_at: new Date().toISOString() }).eq('user_id', userId);
        if (updateProgressError) throw updateProgressError;
        console.log(`User ${userId} progress updated for section ${sectionId}. Points: ${finalPoints}, Level: ${finalLevel}, New Badges: ${newlyEarnedBadges.map(b => b.name).join(', ')}`);
    } catch (gamificationError: unknown) { // Type error as unknown
         const message = gamificationError instanceof Error ? gamificationError.message : String(gamificationError);
         console.error(`Error during gamification update for user ${userId}, section ${sectionId}:`, message);
    }
    // --- End Gamification Logic ---
    return { success: true, savedResponse: data, pointsAwarded: sectionPoints, newBadges: newlyEarnedBadges.map(b => ({ id: b.id, name: b.name })) };
  } catch (error: unknown) { // Type error as unknown
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error saving vocational response for user ${userId}, section ${sectionId}:`, message);
    return { error: message }
  }
}

// Define type for raw response row
interface RawResponseRow {
    section_id: string;
    response_data: ResponseData | null;
}

// Define type for profile row
interface ProfileRow {
    riasec_scores: Record<string, number> | null;
    personality_scores: Record<string, number> | null;
    aptitude_scores: { verbalCorrect: number, numericalCorrect: number, abstractCorrect: number, totalCorrect: number, totalAttempted: number } | null;
    work_values: { ranked: string[] } | null;
    learning_style: string | null;
}


// --- Helper Function to fetch and format data for prompts ---
// Added specific type for supabase client
async function getAssessmentDataForPrompt(userId: string, assessmentId: string, supabase: SupabaseClient): Promise<string> {
    const [responsesResult, profileResult] = await Promise.all([
      supabase.from('vocational_responses').select('section_id, response_data').eq('user_id', userId).eq('assessment_id', assessmentId),
      supabase.from('user_assessment_profiles').select('riasec_scores, personality_scores, aptitude_scores, work_values, learning_style').eq('user_id', userId).limit(1).single<ProfileRow>() // Use ProfileRow type
    ]);
    const { data: responses, error: fetchResponsesError } = responsesResult;
    const { data: profile, error: fetchProfileError } = profileResult;
    if (fetchResponsesError) throw fetchResponsesError;
    if (fetchProfileError && fetchProfileError.code !== 'PGRST116') { console.warn(`Could not fetch calculated profile for AI prompt: ${fetchProfileError.message}`); }
    if (!responses || responses.length === 0) { throw new Error('No vocational responses found for this user.'); }

    // Format data
    let promptData = `**1. Calculated Profile Scores (if available):**\n`;
    if (profile) {
        promptData += `- RIASEC Scores (Interests - Realistic, Investigative, Artistic, Social, Enterprising, Conventional): ${JSON.stringify(profile.riasec_scores || 'Not calculated')}\n`;
        promptData += `- Personality (Big Five - Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism): ${JSON.stringify(profile.personality_scores || 'Not calculated')}\n`;
        promptData += `- Aptitude Scores (Correct answers): ${JSON.stringify(profile.aptitude_scores || 'Not calculated')}\n`;
        const rankedValuesText = profile.work_values?.ranked?.map((id: string) => {
            const item = valueItems.find(v => v.id === id);
            return item?.text.split(': ')[1] || id;
        }).join(', ') || 'Not ranked';
        promptData += `- Top Work Values (Ranked): ${rankedValuesText}\n`;
        promptData += `- Preferred Learning Style (VARK): ${profile.learning_style || 'Not determined'}\n\n`;
    } else { promptData += `(Calculated profile data was not available or failed to load.)\n\n`; }

    promptData += `**2. Raw Answers Provided by Student:**\n`;
    // Added type for res
    (responses as RawResponseRow[]).forEach((res: RawResponseRow) => { // Cast responses array
      promptData += `- Section: ${res.section_id}\n`;
      promptData += `  Responses: ${res.response_data ? JSON.stringify(res.response_data) : '[No data]'}\n`;
    });
    return promptData;
}

// --- Function to Prepare the STRUCTURED REPORT AI Prompt ---
export async function prepareAnalysisPrompt(userId: string, assessmentId: string = 'main_vocational') {
  const supabase = await createClient();
  try {
    const promptData = await getAssessmentDataForPrompt(userId, assessmentId, supabase);
    const analysisPrompt = `You are YOUNI, an expert career counselor AI. Your task is to analyze the following vocational assessment data for a high school student (user ID: ${userId}) and generate ONLY the structured sections of a report (Introduction, Summary, Strengths, Exploration, Pathways, Next Steps) suitable for the student and their parents. DO NOT include a narrative 'story' section.

**Assessment Data Provided:**
${promptData}

**Report Generation Requirements:**

1.  **Introduction:** Start with a brief, friendly paragraph explaining that this report summarizes their assessment results and aims to provide insights for exploring future career and education paths. Mention that it's a starting point for discovery.

2.  **Your Unique Profile Summary:**
    *   Synthesize the most prominent themes across their interests, personality, aptitudes, values, and learning style.
    *   **Crucially, reference the specific calculated scores** (RIASEC, Big Five, Aptitude, Values, Learning Style) provided above when discussing these themes. Briefly explain what high/low scores in RIASEC or Big Five might mean in simple terms (e.g., "Your highest RIASEC score is 'Artistic', suggesting you enjoy creative expression...").
    *   Highlight **connections and potential contradictions** between different areas. For example: "Your interest in 'Social' careers seems to align well with your 'Agreeableness' personality trait. However, your preference for 'Independence' as a work value might require finding roles where you can help others but still have autonomy."
    *   Use clear, encouraging language. Avoid overly technical jargon.

3.  **Spotlight on Your Strengths:**
    *   Identify 3-5 key strengths based on the *entire* assessment data (scores and raw answers).
    *   For each strength, provide a **concrete example** from the data. Examples:
        *   "**Creative Problem Solving:** You demonstrated this by [mention specific answer to a challenge question or high Artistic/Openness score]."
        *   "**Strong Interpersonal Skills:** This is suggested by your high 'Social' interest score and your answers indicating enjoyment in collaborative tasks like [mention specific scenario answer]."
        *   "**Attention to Detail:** Your high score in 'Conscientiousness' and your answers in the [mention relevant section] suggest you value accuracy."

4.  **Areas for Exploration & Growth:**
    *   Suggest 2-3 areas for further exploration or development, framed positively as opportunities.
    *   Link these suggestions back to the assessment results. Examples:
        *   "**Exploring Leadership:** While you indicated comfort in [specific task], your 'Enterprising' score suggests exploring activities where you can take initiative or lead a small project might be rewarding."
        *   "**Building Confidence in [Specific Aptitude Area]:** Your results showed [specific aptitude score]. Trying activities like [debate club for verbal, math challenges for numerical] could build confidence in this area."
        *   "**Finding Balance:** Consider how your strong preference for [Value X] might fit with careers typically associated with your high interest in [Interest Y]."

5.  **Potential Career Pathways to Consider:**
    *   Suggest 3-5 **broad career fields or clusters** (not specific job titles) that align well with the overall profile synthesis.
    *   For each field, briefly explain *why* it's suggested, linking it back to 2-3 specific data points (e.g., interests, personality, values, aptitude). Example: "**Healthcare Services:** This field often suits individuals with strong 'Social' interests (Score: X) and a high value placed on 'Helping Others'. Your aptitude in [relevant aptitude] could also be beneficial here."

6.  **Actionable Next Steps:**
    *   Provide a few concrete, actionable next steps the student can take.
    *   Tailor these based on the profile. Examples:
        *   "Research the suggested career fields further using online resources like O*NET or career exploration websites."
        *   "Talk to your school counselor or a trusted teacher about your results and interests."
        *   "Look for extracurricular activities or volunteer opportunities related to [Specific Interest/Strength]."
        *   "Consider informational interviews with people working in fields that interest you."

**Formatting & Tone Guidelines:**
*   Use clear, distinct headings for each section (using Markdown **bolding**).
*   Use bullet points for lists.
*   Maintain a positive, encouraging, and supportive tone throughout.
*   **Crucially, base all analysis strictly on the provided data.** Do not add external information or make assumptions. Acknowledge if data (like calculated scores) was unavailable.`;
    return { success: true, prompt: analysisPrompt };
  } catch (error: unknown) { // Type error as unknown
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error preparing analysis prompt for user ${userId}:`, message);
    return { error: message }
  }
}

// --- NEW Function to Prepare the NARRATIVE STORY AI Prompt ---
export async function prepareStoryPrompt(userId: string, assessmentId: string = 'main_vocational') {
  const supabase = await createClient();
  try {
    const promptData = await getAssessmentDataForPrompt(userId, assessmentId, supabase);
    const storyPrompt = `You are YOUNI, a creative and insightful career storyteller AI. Your task is to analyze the following vocational assessment data for a high school student (user ID: ${userId}) and write an engaging, personalized narrative (story) that weaves together their key results. This story should be separate from a structured report and focus on making the results feel relatable and inspiring.

**Assessment Data Provided:**
${promptData}

**Story Generation Requirements:**

*   **Goal:** Write a narrative (approximately 4-6 paragraphs) that highlights the student's unique combination of interests, personality traits, values, and potential strengths, based *only* on the provided data.
*   **Narrative Flow:** Create a flowing narrative. Start by acknowledging their journey of self-discovery. Weave together their prominent RIASEC interests, key Big Five personality traits, and top work values. Connect these threads – how might their personality influence the way they pursue their interests? How do their values align with their potential strengths? Use insights from their goals/raw answers where relevant.
*   **Tone:** Positive, encouraging, insightful, and slightly informal/conversational. Imagine you're a friendly mentor reflecting their potential back to them. Use "you" language.
*   **Focus:** Emphasize potential, self-discovery, and exploration. Avoid definitive statements or predictions. Use phrases like "It seems you thrive when...", "Your results suggest a potential strength in...", "You might find environments where... particularly rewarding."
*   **Data Integration:** Subtly reference key findings (e.g., "Your interest in 'Artistic' activities seems connected to your high 'Openness' score...") but **do not list raw scores** within the story itself. Refer to themes and patterns rather than numbers. Use examples from raw answers if they strongly illustrate a point (e.g., "Your answer about enjoying [specific scenario task] really highlights your 'Social' interest.").
*   **Length:** Aim for 4-6 paragraphs.
*   **Output:** Provide *only* the narrative story text, without any introductory/concluding remarks outside the story itself. Do not include headings within the story.`;
    return { success: true, prompt: storyPrompt };
  } catch (error: unknown) { // Type error as unknown
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error preparing story prompt for user ${userId}:`, message);
    return { error: message }
  }
}

// --- Updated Function to Save Analysis Result (including story) ---
export async function saveAnalysisResult(
    userId: string,
    analysisText: string | null,
    narrativeStory: string | null,
    analysisSuccess: boolean,
    assessmentId: string = 'main_vocational'
) {
    if (!userId) { console.error('Missing userId for saving result.'); return { error: 'Missing required data to save analysis.' }; }
    const supabase = await createClient();
    try {
        // Define type for the data being upserted
        // Use Record<string, unknown> for jsonb fields to avoid 'any'
        type VocationalResultUpsert = {
            user_id: string;
            assessment_id: string;
            riasec_scores?: Record<string, unknown> | null;
            strengths_analysis?: string | null;
            areas_for_development?: string | null;
            potential_contradictions?: string | null;
            full_ai_analysis: { raw_response: string; generated_at: string; success: boolean; };
            narrative_story: string;
            updated_at: string;
        };

        const upsertData: VocationalResultUpsert = {
            user_id: userId,
            assessment_id: assessmentId,
            riasec_scores: null,
            strengths_analysis: null,
            areas_for_development: null,
            potential_contradictions: null,
            full_ai_analysis: {
                raw_response: analysisText ?? "Structured report generation failed.",
                generated_at: new Date().toISOString(),
                success: analysisSuccess,
            },
            narrative_story: narrativeStory ?? "Personalized story generation failed.",
            updated_at: new Date().toISOString(),
        };

        const { data: savedResult, error: saveError } = await supabase
            .from('vocational_results')
            .upsert(upsertData, { onConflict: 'user_id, assessment_id' })
            .select().single();

        if (saveError) throw saveError;
        console.log(`Analysis result and story saved/updated for user ${userId}:`, savedResult);
        revalidatePath('/results');
        return { success: true, savedResult };
    } catch (error: unknown) { // Type error as unknown
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Error saving analysis result/story for user ${userId}:`, message);
        return { error: message };
    }
}

// --- Function to Calculate and Save Structured Profile ---
// Define type for the profile data being upserted
type UserProfileUpsert = {
    user_id: string;
    assessment_session_id?: string | null;
    riasec_scores: Record<string, number>;
    personality_scores: Record<string, number>;
    aptitude_scores: { verbalCorrect: number; numericalCorrect: number; abstractCorrect: number; totalCorrect: number; totalAttempted: number; };
    work_values?: { ranked: string[]; } | null;
    learning_style: string;
    raw_responses_snapshot?: Record<string, any>; // Use Record<string, any> for flexibility
    updated_at: string;
};

export async function generateAndSaveAssessmentProfile(userId: string, assessmentId: string = 'main_vocational') {
  if (!userId) { console.error('Missing userId for profile generation.'); return { error: 'User ID is required for profile generation.' } }
  const supabase = await createClient()
  try {
    const { data: rawResponsesData, error: fetchError } = await supabase.from('vocational_responses').select('section_id, response_data').eq('user_id', userId).eq('assessment_id', assessmentId);
    const rawResponses = rawResponsesData as RawResponseRow[] | null; // Cast fetched data
    if (fetchError) throw fetchError;
    if (!rawResponses || rawResponses.length === 0) { return { error: 'No vocational responses found to generate profile.' }; }

    // Use Record<string, any> for allAnswers
    const allAnswers: Record<string, any> = rawResponses.reduce((acc, section) => { if (section.response_data && typeof section.response_data === 'object') { Object.assign(acc, section.response_data); } else { console.warn(`Unexpected response_data format for section ${section.section_id}:`, section.response_data); } return acc; }, {});

    const riasecScores: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    const personalityScores: Record<string, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    const aptitudeScores = { verbalCorrect: 0, numericalCorrect: 0, abstractCorrect: 0, totalAttempted: 0 };
    const learningStyleCounts: Record<string, number> = { V: 0, A: 0, R: 0, K: 0 };

    allQuestions.forEach((question: AssessmentQuestion) => {
        const answer = allAnswers[question.id]; if (answer === undefined || answer === null) { return; }
        if (question.sectionId === 'interests' && question.inputType === 'scenario_choice') { const scenarioQuestion = question as ScenarioChoiceQuestion; const chosenOption = scenarioQuestion.options.find(opt => opt.id === answer); if (chosenOption?.theme && riasecScores.hasOwnProperty(chosenOption.theme)) { riasecScores[chosenOption.theme]++; } }
        if (question.sectionId === 'personality' && question.inputType === 'likert') { const score = Number(answer); if (!isNaN(score)) { if (question.id.startsWith('pers_openness')) personalityScores.O += score; else if (question.id.startsWith('pers_consc')) personalityScores.C += score; else if (question.id.startsWith('pers_extra')) personalityScores.E += score; else if (question.id.startsWith('pers_agree')) personalityScores.A += score; else if (question.id.startsWith('pers_neuro')) { if (question.id === 'pers_neuro_calm') { personalityScores.N += score; } else if (question.id === 'pers_neuro_worry') { personalityScores.N += (6 - score); } } } }
        if (question.sectionId === 'aptitude' && question.inputType === 'multiple_choice') { const aptitudeQuestion = question as AptitudeQuestion; aptitudeScores.totalAttempted++; if (answer === aptitudeQuestion.correctAnswerId) { if (question.id.startsWith('apt_verbal')) aptitudeScores.verbalCorrect++; else if (question.id.startsWith('apt_numerical')) aptitudeScores.numericalCorrect++; else if (question.id.startsWith('apt_abstract')) aptitudeScores.abstractCorrect++; } }
        if (question.sectionId === 'learning_style' && question.inputType === 'multiple_choice') { const lsQuestion = question as LearningStyleQuestion; const chosenOption = lsQuestion.options.find(opt => opt.id === answer); if (chosenOption?.learningStyle && learningStyleCounts.hasOwnProperty(chosenOption.learningStyle)) { learningStyleCounts[chosenOption.learningStyle]++; } }
    });

    const finalAptitudeScores = { verbalCorrect: aptitudeScores.verbalCorrect, numericalCorrect: aptitudeScores.numericalCorrect, abstractCorrect: aptitudeScores.abstractCorrect, totalCorrect: aptitudeScores.verbalCorrect + aptitudeScores.numericalCorrect + aptitudeScores.abstractCorrect, totalAttempted: aptitudeScores.totalAttempted };
    let dominantLearningStyles: string[] = []; let maxCount = 0; for (const style in learningStyleCounts) { if (learningStyleCounts[style] > maxCount) { maxCount = learningStyleCounts[style]; dominantLearningStyles = [style]; } else if (learningStyleCounts[style] === maxCount && maxCount > 0) { dominantLearningStyles.push(style); } } const styleMap: Record<string, string> = { V: 'Visual', A: 'Auditory', R: 'Read/Write', K: 'Kinesthetic' }; const learningStyleResult = dominantLearningStyles.map(s => styleMap[s] || s).join('/') || 'Not determined';
    const workValuesRanked: string[] | null = (allAnswers['value_ranking_top3'] && Array.isArray(allAnswers['value_ranking_top3'])) ? allAnswers['value_ranking_top3'] : null;

    console.log("Calculated RIASEC:", riasecScores); console.log("Calculated Personality:", personalityScores); console.log("Calculated Aptitude:", finalAptitudeScores); console.log("Determined Learning Style:", learningStyleResult); console.log("Processed Work Values:", workValuesRanked);

    const profileUpsertData: UserProfileUpsert = {
        user_id: userId,
        assessment_session_id: null,
        riasec_scores: riasecScores,
        personality_scores: personalityScores,
        aptitude_scores: finalAptitudeScores,
        work_values: workValuesRanked ? { ranked: workValuesRanked } : null,
        learning_style: learningStyleResult,
        raw_responses_snapshot: allAnswers,
        updated_at: new Date().toISOString()
    };

    const { data: savedProfile, error: saveError } = await supabase.from('user_assessment_profiles').upsert(profileUpsertData, { onConflict: 'user_id' }).select().single();
    if (saveError) throw saveError;
    console.log(`Assessment profile generated and saved/updated for user ${userId}:`, savedProfile);
    revalidatePath('/results');
    return { success: true, profile: savedProfile };
  } catch (error: unknown) { // Type error as unknown
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error generating/saving assessment profile for user ${userId}:`, message);
    return { error: message };
  }
}


// --- Updated Combined Function to Generate and Save Report + Story ---
export async function generateAndSaveAssessmentAnalysis(userId: string, assessmentId: string = 'main_vocational') {
  if (!userId) { console.error('Missing userId for analysis.'); return { error: 'User ID is required for analysis.' } }

  // 1. --- Ensure Structured Profile Exists First ---
  try {
    const profileResult = await generateAndSaveAssessmentProfile(userId, assessmentId);
    if (profileResult.error) {
      console.error(`Profile generation failed before AI analysis could start: ${profileResult.error}`);
      await saveAnalysisResult(userId, `Error: Prerequisite profile calculation failed - ${profileResult.error}`, null, false, assessmentId);
      return { success: false, error: `Prerequisite profile calculation failed: ${profileResult.error}`, analysis: null };
    }
    console.log("Structured profile generated/updated successfully before AI analysis.");
  } catch (profileError: unknown) { // Type error as unknown
    const message = profileError instanceof Error ? profileError.message : String(profileError);
    console.error(`Unexpected error during profile generation step: ${message}`);
    await saveAnalysisResult(userId, `Error: Unexpected error during prerequisite profile calculation - ${message}`, null, false, assessmentId);
    return { success: false, error: `Unexpected error during profile calculation: ${message}`, analysis: null };
  }

  // 2. --- Prepare Prompts ---
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) { console.error('Missing OPENAI_API_KEY environment variable.'); await saveAnalysisResult(userId, 'Error: AI configuration error.', null, false, assessmentId); return { error: 'AI configuration error.' } }

  let structuredReportPrompt: string | undefined;
  let narrativeStoryPrompt: string | undefined;
  try {
    const [analysisPromptResult, storyPromptResult] = await Promise.all([
        prepareAnalysisPrompt(userId, assessmentId),
        prepareStoryPrompt(userId, assessmentId)
    ]);
    if (analysisPromptResult.error || !analysisPromptResult.prompt) { throw new Error(analysisPromptResult.error || 'Failed to prepare structured report prompt.'); }
    structuredReportPrompt = analysisPromptResult.prompt;
    if (storyPromptResult.error || !storyPromptResult.prompt) { throw new Error(storyPromptResult.error || 'Failed to prepare narrative story prompt.'); }
    narrativeStoryPrompt = storyPromptResult.prompt;
  } catch (promptError: unknown) { // Type error as unknown
      const message = promptError instanceof Error ? promptError.message : String(promptError);
      console.error(`Error preparing prompts: ${message}`);
      await saveAnalysisResult(userId, `Error preparing prompts: ${message}`, null, false, assessmentId);
      return { success: false, error: `Error preparing prompts: ${message}`, analysis: null };
  }

  // 3. --- Call OpenAI API (in Parallel) ---
  const openai = new OpenAI({ apiKey });
  let structuredReportText: string | null = null;
  let narrativeStoryText: string | null = null;
  let overallSuccess = true;

  try {
      console.log(`Sending prompts to OpenAI for user ${userId}...`);
      const [reportCompletion, storyCompletion] = await Promise.allSettled([
          openai.chat.completions.create({ messages: [ { role: "system", content: "You are an AI assistant generating the structured sections of a vocational assessment report." }, { role: "user", content: structuredReportPrompt } ], model: "gpt-3.5-turbo" }),
          openai.chat.completions.create({ messages: [ { role: "system", content: "You are a creative AI storyteller writing a personalized narrative based on assessment results." }, { role: "user", content: narrativeStoryPrompt } ], model: "gpt-3.5-turbo" })
      ]);

      if (reportCompletion.status === 'fulfilled' && reportCompletion.value.choices[0]?.message?.content) {
          structuredReportText = reportCompletion.value.choices[0].message.content;
          console.log(`OpenAI structured report received for user ${userId}.`);
      } else {
          const errorMsg = reportCompletion.status === 'rejected' ? (reportCompletion.reason as Error).message : 'Invalid response structure from OpenAI for report.';
          console.error(`Error generating structured report: ${errorMsg}`);
          structuredReportText = `Error generating structured report: ${errorMsg}`;
          overallSuccess = false;
      }

      if (storyCompletion.status === 'fulfilled' && storyCompletion.value.choices[0]?.message?.content) {
          narrativeStoryText = storyCompletion.value.choices[0].message.content;
          console.log(`OpenAI narrative story received for user ${userId}.`);
      } else {
          const errorMsg = storyCompletion.status === 'rejected' ? (storyCompletion.reason as Error).message : 'Invalid response structure from OpenAI for story.';
          console.error(`Error generating narrative story: ${errorMsg}`);
          narrativeStoryText = `Error generating narrative story: ${errorMsg}`;
      }

  } catch (error: unknown) { // Type error as unknown
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Error during OpenAI analysis generation for user ${userId}:`, message);
      structuredReportText = structuredReportText ?? `Error during analysis: ${message}`;
      narrativeStoryText = narrativeStoryText ?? `Error during analysis: ${message}`;
      overallSuccess = false;
  }

  // 4. --- Save Both Results ---
  try {
    const saveOpResult = await saveAnalysisResult(userId, structuredReportText, narrativeStoryText, overallSuccess, assessmentId);
    if (saveOpResult.error) {
         return { success: false, error: `Failed to save results: ${saveOpResult.error}`, analysis: null };
    }
    return { success: overallSuccess, analysis: saveOpResult.savedResult, error: !overallSuccess ? "Error during AI generation." : null };

  } catch (error: unknown) { // Type error as unknown
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Unexpected error saving analysis result/story for user ${userId}:`, message);
    return { success: false, error: `Unexpected error saving results: ${message}` };
  }
}
