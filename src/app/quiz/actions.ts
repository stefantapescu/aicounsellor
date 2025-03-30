'use server'

import { createClient } from '@/utils/supabase/server' // Import server helper
import { revalidatePath } from 'next/cache'

// Type for simplified question data needed for scoring
interface QuestionScoreData {
  id: string;
  correct_answer: string | null;
  points_value: number;
}

// Type for simplified badge data
interface BadgeData {
    id: string;
    criteria: {
        quiz_completed?: string;
        points_required?: number;
        // Add other criteria types as needed
    }
}

export async function updateUserProgressAfterQuiz(userId: string, quizId: string) {
  if (!userId || !quizId) {
    console.error('Missing userId or quizId for progress update.')
    return { error: 'Missing user or quiz identifier.' }
  }

  const supabase = await createClient() // Await server helper

  try {
    // --- 1. Fetch user's responses for this quiz ---
    const { data: userResponses, error: responseError } = await supabase
      .from('quiz_responses')
      .select('question_id, response, is_correct, points_awarded') // Select existing values if needed
      .eq('user_id', userId)
      .eq('quiz_id', quizId)

    if (responseError) throw responseError
    if (!userResponses) throw new Error('No responses found for user/quiz.')

    // --- 2. Fetch corresponding question data (correct answers, points) ---
    const questionIds = userResponses.map(r => r.question_id)
    const { data: questionsData, error: questionError } = await supabase
      .from('quiz_questions')
      .select('id, correct_answer, points_value')
      .in('id', questionIds)

    if (questionError) throw questionError
    if (!questionsData) throw new Error('Could not fetch question data.')

    const questionsMap = new Map<string, QuestionScoreData>(
        questionsData.map(q => [q.id, q as QuestionScoreData])
    );

    // --- 3. Calculate score ---
    let totalPointsEarnedThisQuiz = 0;
    // Removed unused 'updates' variable mapping
    userResponses.forEach(response => {
        const question = questionsMap.get(response.question_id);
        let isCorrect = false; // Default to false
        let pointsAwarded = 0;

        if (question && question.correct_answer !== null) {
            // Simple equality check for now, might need refinement for different response types
            isCorrect = JSON.stringify(response.response) === JSON.stringify(question.correct_answer);
            if (isCorrect) {
                pointsAwarded = question.points_value || 0;
                totalPointsEarnedThisQuiz += pointsAwarded;
            }
        }
        // Note: We are not updating the quiz_responses table here, just calculating points.
    });

    // --- 4. Update quiz_responses table with scores (Optional) ---
    // Consider if you want to store correctness/points back in the response table
    // const { error: updateResponseError } = await supabase
    //   .from('quiz_responses')
    //   .upsert(updates, { onConflict: 'user_id, question_id' });
    // if (updateResponseError) console.error("Error updating response scores:", updateResponseError);


    // --- 5. Fetch current user progress ---
    const { data: currentProgress, error: progressError } = await supabase
      .from('user_progress')
      .select('points, earned_badge_ids')
      .eq('user_id', userId)
      .single()

    if (progressError) throw progressError
    if (!currentProgress) throw new Error('User progress record not found.')

    const newTotalPoints = (currentProgress.points || 0) + totalPointsEarnedThisQuiz;
    // Calculate level based on points
    const newLevel = Math.floor(newTotalPoints / 500) + 1; // Same logic as assessment

    // --- 6. Check for new badges ---
    const { data: badges, error: badgeError } = await supabase
        .from('badges')
        .select('id, criteria')

    if (badgeError) throw badgeError;

    const currentBadgeIds = new Set(currentProgress.earned_badge_ids || []);
    const newlyEarnedBadgeIds: string[] = [];

    badges?.forEach(badge => {
        const badgeData = badge as BadgeData;
        if (!currentBadgeIds.has(badgeData.id)) { // Check if already earned
            let earned = false;
            if (badgeData.criteria?.quiz_completed === quizId) {
                earned = true;
            }
            if (badgeData.criteria?.points_required && newTotalPoints >= badgeData.criteria.points_required) {
                 earned = true;
            }
            // Add more criteria checks here

            if (earned) {
                newlyEarnedBadgeIds.push(badgeData.id);
            }
        }
    });

    const finalBadgeIds = Array.from(new Set([...currentBadgeIds, ...newlyEarnedBadgeIds]));

    // --- 7. Update user_progress table ---
    const { error: updateProgressError } = await supabase
      .from('user_progress')
      .update({
        points: newTotalPoints,
        level: newLevel, // Update level
        earned_badge_ids: finalBadgeIds,
        updated_at: new Date().toISOString(),
       })
      .eq('user_id', userId)

    if (updateProgressError) throw updateProgressError

    console.log(`User ${userId} progress updated for quiz ${quizId}. Points: ${newTotalPoints}, Badges: ${finalBadgeIds.join(', ')}`);

    // Revalidate relevant paths if needed
    revalidatePath('/dashboard') // Revalidate dashboard where progress might be shown
    revalidatePath(`/quiz/${quizId}`) // Revalidate quiz page itself

    // Return new level info as well
    return { success: true, points: newTotalPoints, level: newLevel, badges: finalBadgeIds };

  } catch (error: unknown) { // Type error as unknown
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error updating progress for user ${userId}, quiz ${quizId}:`, message)
    return { error: message }
  }
}
