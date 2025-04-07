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

export async function saveConscientiousnessScore(userId: string, scaledScore: number) {
  const supabase = await createClient(); // Ensure client is awaited

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
      console.error('Error fetching profile to save conscientiousness score:', fetchError);
      throw new Error('Could not fetch user profile.');
    }

    let currentScores: PersonalityScores = {};
    let profileId: string | null = null;

    if (profile && profile.personality_scores) {
      if (typeof profile.personality_scores === 'object' && profile.personality_scores !== null) {
         currentScores = profile.personality_scores as PersonalityScores;
      }
      profileId = profile.id;
    }

    // 2. Update the scores object with the new Conscientiousness score
    const updatedScores: PersonalityScores = {
      ...currentScores,
      Conscientiousness: scaledScore, // Save the specific trait score
    };

    // 3. Upsert the profile with the updated scores
    const upsertData = {
      user_id: userId,
      personality_scores: updatedScores,
      ...(profileId ? { id: profileId } : {})
    };

    const { error: upsertError } = await supabase
      .from('user_assessment_profiles')
      .upsert(upsertData, { onConflict: 'user_id' }); // Assuming user_id is unique or primary key for upsert

    if (upsertError) {
      console.error('Error upserting conscientiousness score:', upsertError);
      throw new Error('Could not save conscientiousness score.');
    }

    console.log(`Saved Conscientiousness score for user ${userId}:`, scaledScore);

    // Revalidate relevant paths
    revalidatePath('/workshop/dreamscapes/results');
    revalidatePath('/dashboard');

  } catch (error) {
    console.error('Server action error:', error);
    throw error; // Re-throw to be caught by the client if needed
  }
}
