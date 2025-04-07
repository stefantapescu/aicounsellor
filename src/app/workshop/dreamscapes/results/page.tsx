import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import InsightsClientPage from './InsightsClientPage'; // Import the client component we will create

// Define the expected structure for personality scores
// Assuming Big Five traits based on the description
export interface PersonalityScores {
  Openness?: number;
  Conscientiousness?: number;
  Extraversion?: number;
  Agreeableness?: number;
  Neuroticism?: number;
  // Add other potential traits if the structure is different
  [key: string]: number | undefined; // Allow for other potential keys
}

// Define the structure for the props passed to the client component
export interface InsightsPageData {
  personalityScores: PersonalityScores | null;
  // Add other insights data if needed later (summary, themes, etc.)
}

export default async function DreamscapesResultsServerPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Dreamscape Results page access error or no user:', userError?.message);
    redirect('/login?message=You must be logged in to view Dreamscape results.');
  }

  // Fetch personality scores from the user's assessment profile
  let personalityScoresData: PersonalityScores | null = null;
  const { data: profile, error: profileError } = await supabase
    .from('user_assessment_profiles')
    .select('personality_scores')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false }) // Get the latest profile
    .limit(1)
    .maybeSingle(); // Use maybeSingle as user might not have a profile yet

  if (profileError) {
    console.error('Error fetching user assessment profile:', profileError.message);
    // Handle error appropriately, maybe show an error message or default state
  } else if (profile && profile.personality_scores) {
    // Ensure the fetched data conforms to the PersonalityScores interface
    // Supabase returns JSONB as is, so we cast it. Add validation if needed.
    personalityScoresData = profile.personality_scores as PersonalityScores;
  }

  const insightsData: InsightsPageData = {
    personalityScores: personalityScoresData,
    // Initialize other data points as null or fetch them here
  };

  return (
    // Render the client component, passing the fetched data
    <InsightsClientPage insightsData={insightsData} />
  );
}
