import { createClient } from '@supabase/supabase-js';
import { Occupation, getCareerMatchingData } from '../onet';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Types for database tables
export type DbOccupation = Occupation & {
  created_at: string;
  updated_at: string;
};

export type CareerMatch = {
  occupation_code: string;
  user_id: string;
  match_score: number;
  skills_match: number;
  interests_match: number;
  values_match: number;
  context_match: number;
  created_at: string;
  updated_at: string;
};

// Database operations
export async function upsertOccupation(occupation: Occupation) {
  const { data, error } = await supabase
    .from('occupations')
    .upsert({
      ...occupation,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOccupation(code: string) {
  const { data, error } = await supabase
    .from('occupations')
    .select('*')
    .eq('code', code)
    .single();

  if (error) throw error;
  return data;
}

export async function searchOccupations(query: string) {
  const { data, error } = await supabase
    .from('occupations')
    .select('*')
    .ilike('title', `%${query}%`)
    .limit(10);

  if (error) throw error;
  return data;
}

export async function saveCareerMatch(userId: string, occupationCode: string, matchScores: {
  skills_match: number;
  interests_match: number;
  values_match: number;
  context_match: number;
}) {
  const matchScore = (
    matchScores.skills_match * 0.4 +
    matchScores.interests_match * 0.3 +
    matchScores.values_match * 0.2 +
    matchScores.context_match * 0.1
  );

  const { data, error } = await supabase
    .from('career_matches')
    .upsert({
      user_id: userId,
      occupation_code: occupationCode,
      match_score: matchScore,
      ...matchScores,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserCareerMatches(userId: string) {
  const { data, error } = await supabase
    .from('career_matches')
    .select(`
      *,
      occupation:occupations(*)
    `)
    .eq('user_id', userId)
    .order('match_score', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data;
}

// Data synchronization
export async function syncOccupationData(occupationCode: string) {
  try {
    // Fetch fresh data from O*NET
    const matchingData = await getCareerMatchingData(occupationCode);
    
    // Store in Supabase
    await upsertOccupation(matchingData.occupation);
    
    return matchingData;
  } catch (error) {
    console.error('Error syncing occupation data:', error);
    throw error;
  }
}

// Career matching algorithm
export async function findMatchingCareers(
  userId: string,
  userProfile: {
    skills: string[];
    interests: string[];
    values: string[];
    workContext: string[];
  }
) {
  try {
    // Get all occupations that match any of the user's skills
    const { data: occupations, error } = await supabase
      .from('occupations')
      .select('*');

    if (error) throw error;

    // Calculate match scores for each occupation
    const matches = await Promise.all(
      occupations.map(async (occupation) => {
        const skillsMatch = calculateMatchScore(
          userProfile.skills,
          occupation.skills.map((s: { id: string }) => s.id)
        );
        
        const interestsMatch = calculateMatchScore(
          userProfile.interests,
          occupation.interests.map((i: { id: string }) => i.id)
        );
        
        const valuesMatch = calculateMatchScore(
          userProfile.values,
          occupation.work_values.map((v: { id: string }) => v.id)
        );
        
        const contextMatch = calculateMatchScore(
          userProfile.workContext,
          occupation.work_context.map((c: { id: string }) => c.id)
        );

        return {
          occupationCode: occupation.code,
          matchScores: {
            skills_match: skillsMatch,
            interests_match: interestsMatch,
            values_match: valuesMatch,
            context_match: contextMatch,
          },
        };
      })
    );

    // Sort by match score and save top matches
    const topMatches = matches
      .sort((a, b) => {
        const scoreA = calculateTotalScore(a.matchScores);
        const scoreB = calculateTotalScore(b.matchScores);
        return scoreB - scoreA;
      })
      .slice(0, 20);

    // Save matches to database
    await Promise.all(
      topMatches.map(match =>
        saveCareerMatch(userId, match.occupationCode, match.matchScores)
      )
    );

    return topMatches;
  } catch (error) {
    console.error('Error finding matching careers:', error);
    throw error;
  }
}

// Helper functions
function calculateMatchScore(userItems: string[], occupationItems: string[]): number {
  if (userItems.length === 0 || occupationItems.length === 0) return 0;
  
  const commonItems = userItems.filter(item => occupationItems.includes(item));
  return commonItems.length / Math.max(userItems.length, occupationItems.length);
}

function calculateTotalScore(scores: {
  skills_match: number;
  interests_match: number;
  values_match: number;
  context_match: number;
}): number {
  return (
    scores.skills_match * 0.4 +
    scores.interests_match * 0.3 +
    scores.values_match * 0.2 +
    scores.context_match * 0.1
  );
} 