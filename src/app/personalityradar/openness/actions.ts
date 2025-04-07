'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Define the structure for personality scores again for clarity
interface PersonalityScores {
  Openness?: number;
  Conscientiousness?: number;
  Extraversion?: number;
  Agreeableness?: number;
  Neuroticism?: number;
  [key: string]: number | undefined;
}

export async function saveOpennessScore(userId: string, scaledScore: number) {
  // Ensure we await the client creation if it's async, or handle it appropriately based on its definition
  const supabase = await createClient(); // Added await

  try {
    // 1. Fetch the latest user assessment profile
    const { data: profile, error: fetchError } = await supabase
      .from('user_assessment_profiles')
      .select('id, personality_scores')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching profile to save openness score:', fetchError);
      throw new Error('Could not fetch user profile.');
    }

    let currentScores: PersonalityScores = {};
    let profileId: string | null = null;

    if (profile && profile.personality_scores) {
      // Ensure personality_scores is treated as an object
      if (typeof profile.personality_scores === 'object' && profile.personality_scores !== null) {
         currentScores = profile.personality_scores as PersonalityScores;
      }
      profileId = profile.id;
    }

    // 2. Update the scores object with the new Openness score
    const updatedScores: PersonalityScores = {
      ...currentScores,
      Openness: scaledScore,
    };

    // 3. Upsert the profile with the updated scores
    // If profile exists (profileId is not null), update it. Otherwise, insert a new one.
    const upsertData = {
      user_id: userId,
      personality_scores: updatedScores,
      ...(profileId ? { id: profileId } : {}) // Include id only if updating
    };

    const { error: upsertError } = await supabase
      .from('user_assessment_profiles')
      .upsert(upsertData, { onConflict: 'user_id' }); // Consider using user_id as conflict target if unique

    if (upsertError) {
      console.error('Error upserting openness score:', upsertError);
      // Check for specific errors, e.g., constraint violations
      if (upsertError.message.includes('violates foreign key constraint')) {
         console.error('User ID might not exist or profile ID mismatch.');
      }
       if (upsertError.message.includes('violates unique constraint') && !profileId) {
         // This might happen if upsert on user_id fails and we tried inserting without an existing profile check
         // A more robust solution might involve separate insert/update logic or better conflict handling
         console.error('Potential race condition or unique constraint issue.');
       }
      throw new Error('Could not save openness score.');
    }

    console.log(`Saved Openness score for user ${userId}:`, scaledScore);

    // Revalidate relevant paths if needed, e.g., the results page
    revalidatePath('/workshop/dreamscapes/results');
    revalidatePath('/dashboard'); // Revalidate dashboard as well

  } catch (error) {
    console.error('Server action error:', error);
    // Re-throw or return an error object for the client to handle
    throw error;
  }
}
