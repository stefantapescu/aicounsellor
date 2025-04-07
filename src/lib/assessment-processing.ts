// Purpose: Contains the core logic for processing assessment results and updating profiles.
// This file is separated from server actions to be usable in scripts.

import { type SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache'; // Note: revalidatePath might not work outside Next.js context, but we'll keep it for now. Script execution doesn't strictly need it.
import {
    allQuestions,
    type AssessmentQuestion,
    type ScenarioChoiceQuestion,
    type AptitudeQuestion,
    type LearningStyleQuestion,
} from '../app/assessment/assessmentData'; // Use relative path from src/lib

// --- Type Definitions (Copied from actions.ts) ---

// Define a more specific type for response data
type ResponseData = Record<string, number | string | string[]>;

// Define type for raw response row
interface RawResponseRow {
    section_id: string;
    response_data: ResponseData | null;
}

// Define type for the data being upserted into vocational_profile
type VocationalProfileUpdate = {
    user_id: string;
    assessment_summary: { holland_codes: string[]; } | null; // Structure needed by career match API
    suggested_onet_codes: string[] | null; // Needed by career match API
    last_updated: string;
};

// --- Core Processing Function (Previously _internal_generateAndSaveProfile) ---

export async function processAndSaveAssessmentProfile(
    userId: string,
    assessmentId: string,
    supabase: SupabaseClient // Requires a client instance
) {
   if (!userId) { throw new Error('User ID is required for profile generation.'); }
   try {
     // Fetch raw responses using the provided client
     const { data: rawResponsesData, error: fetchError } = await supabase
        .from('vocational_responses')
        .select('section_id, response_data')
        .eq('user_id', userId)
        .eq('assessment_id', assessmentId);
    const rawResponses = rawResponsesData as RawResponseRow[] | null; // Cast fetched data
    if (fetchError) throw fetchError;
    if (!rawResponses || rawResponses.length === 0) { return { error: 'No vocational responses found to generate profile.' }; }

    // Use specific type for allAnswers
    const allAnswers: Record<string, string | number | string[]> = rawResponses.reduce((acc, section) => {
        if (section.response_data && typeof section.response_data === 'object') {
            Object.assign(acc, section.response_data);
        } else {
            console.warn(`Unexpected response_data format for section ${section.section_id}:`, section.response_data);
        }
        return acc;
    }, {} as Record<string, string | number | string[]>); // Ensure initial value type

    // --- Score Calculation (Existing Logic - Keep As Is) ---
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
    const workValuesRanked: string[] | null = (allAnswers['value_ranking_top3'] && Array.isArray(allAnswers['value_ranking_top3']))
        ? allAnswers['value_ranking_top3'] as string[] // Cast to string[]
        : null;

    console.log("Calculated RIASEC:", riasecScores);
    console.log("Calculated Personality:", personalityScores);
    console.log("Calculated Aptitude:", finalAptitudeScores);
    console.log("Determined Learning Style:", learningStyleResult);
    console.log("Processed Work Values:", workValuesRanked);

    // Note: The 'user_assessment_profiles' table and related saving logic have been removed
    // as the primary data needed for career matching is now stored in 'vocational_profile'.
    // If 'user_assessment_profiles' is needed elsewhere, the saving logic can be reinstated.

    // --- Generate Data for vocational_profile ---

    // 1. Determine Top Holland Codes
    const sortedHolland = Object.entries(riasecScores)
        .filter(([, score]) => score > 0) // Only consider codes with score > 0
        .sort(([, a], [, b]) => b - a); // Sort descending by score
    const topHollandCodes = sortedHolland.slice(0, 3).map(([code]) => code); // Get top 3 codes

    // 2. Create assessment_summary
    const assessmentSummary = topHollandCodes.length > 0 ? { holland_codes: topHollandCodes } : null;

    // 3. Generate suggested_onet_codes (Simple approach: based on top 1-2 Holland codes)
    let suggestedOnetCodes: string[] = [];
    if (topHollandCodes.length > 0) {
        const primaryCode = topHollandCodes[0];
        const secondaryCode = topHollandCodes.length > 1 ? topHollandCodes[1] : null;

        console.log(`Generating ONET codes for Holland codes: Primary=${primaryCode}, Secondary=${secondaryCode}`);

        // Query occupations matching primary code (limit 5)
        const { data: primaryMatches, error: primaryError } = await supabase
            .from('occupations')
            .select('code')
            .eq('riasec_code', primaryCode) // Use exact match instead of ilike
            .limit(5);

        if (primaryError) {
            console.error("Error fetching primary ONET suggestions:", primaryError);
            console.error("Failed query details:", {
                table: 'occupations',
                riasec_code: primaryCode,
                limit: 5
            });
        } else if (primaryMatches) {
            console.log(`Found ${primaryMatches.length} primary matches for code ${primaryCode}`);
            suggestedOnetCodes.push(...primaryMatches.map(c => c.code));
        }

        // If few primary matches and secondary code exists, query secondary (limit 5 more)
        if (suggestedOnetCodes.length < 5 && secondaryCode) {
            console.log(`Fetching secondary matches for code ${secondaryCode}`);
            const { data: secondaryMatches, error: secondaryError } = await supabase
                .from('occupations')
                .select('code')
                .eq('riasec_code', secondaryCode) // Use exact match instead of ilike
                .not('code', 'in', `(${suggestedOnetCodes.map(code => `'${code}'`).join(',')})`)
                .limit(5 - suggestedOnetCodes.length);

            if (secondaryError) {
                console.error("Error fetching secondary ONET suggestions:", secondaryError);
                console.error("Failed query details:", {
                    table: 'occupations',
                    riasec_code: secondaryCode,
                    exclude_codes: suggestedOnetCodes,
                    limit: 5 - suggestedOnetCodes.length
                });
            } else if (secondaryMatches) {
                console.log(`Found ${secondaryMatches.length} secondary matches for code ${secondaryCode}`);
                suggestedOnetCodes.push(...secondaryMatches.map(c => c.code));
            }
        }
        // Remove duplicates just in case
        suggestedOnetCodes = [...new Set(suggestedOnetCodes)];
        console.log(`Final suggested ONET codes: ${suggestedOnetCodes.join(', ')}`);
    } else {
        console.log("No Holland codes found to generate ONET suggestions");
    }
    console.log("Generated Suggested ONET Codes:", suggestedOnetCodes);
    console.log("Generated Assessment Summary:", assessmentSummary);


    // --- Upsert into vocational_profile ---
    const vocationalProfileUpdateData: VocationalProfileUpdate = {
        user_id: userId,
        assessment_summary: assessmentSummary,
        suggested_onet_codes: suggestedOnetCodes.length > 0 ? suggestedOnetCodes : null,
        last_updated: new Date().toISOString(),
    };

    const { data: savedVocationalProfile, error: saveVocationalError } = await supabase
        .from('vocational_profile')
        .upsert(vocationalProfileUpdateData, { onConflict: 'user_id' })
        .select()
        .single();

    if (saveVocationalError) throw saveVocationalError;

    console.log(`Vocational profile updated for user ${userId}:`, savedVocationalProfile);

    // Attempt revalidation - might not work in script context but harmless
    try {
        revalidatePath('/results');
        revalidatePath('/career-explorer');
        revalidatePath('/dashboard');
    } catch (revalError) {
        console.warn("Revalidation failed (expected outside Next.js context):", revalError);
    }

     // Return success, potentially with the saved vocational profile data
     return { success: true, profile: savedVocationalProfile };
   } catch (error: unknown) { // Type error as unknown
     const message = error instanceof Error ? error.message : String(error);
     console.error(`Error in processAndSaveAssessmentProfile for user ${userId}:`, message);
     // Re-throw or return an error structure consistent with callers
     return { error: message };
   }
}
