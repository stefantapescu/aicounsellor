import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
// Import the client component
import DashboardClientComponent from './DashboardClientComponent'
// Remove unused props type import
// import type { DashboardClientComponentProps } from './DashboardClientComponent'

// Define types for fetched data
interface UserProgress {
  points: number;
  level: number;
  earned_badge_ids: string[] | null;
}

interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  criteria?: unknown;
  xp_reward?: number;
}

interface Recommendation {
  id: string;
  career_name: string;
  match_percentage: number;
  tags?: string[];
}

// Define type for the assessment profile data we need
interface UserAssessmentProfile {
  personality_scores: Record<string, number> | null; // Expecting {"Trait": score}
}

// Define the expected type for the career match query result
type CareerMatchQueryResult = {
  match_score: number | null;
  occupations: { code: string; title: string; description: string | null } | null;
};


export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('Dashboard access error or no user:', userError?.message)
    redirect('/login?message=You must be logged in to view the dashboard.')
  }

  // --- Fetch Data Concurrently ---
  const [
    progressResult,
    vocationalResultResult,
    assessmentProfileResult,
    careerMatchesResult
  ] = await Promise.all([
    supabase
      .from('user_progress')
      .select('points, level, earned_badge_ids')
      .eq('user_id', user.id)
      .single<UserProgress>(),
    supabase
      .from('vocational_results')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('user_assessment_profiles')
      .select('personality_scores')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle<UserAssessmentProfile>(),
    supabase
      .from('career_matches')
      .select('match_score, occupations(code, title, description)')
      .eq('user_id', user.id)
      .order('match_score', { ascending: false })
      .limit(2) // Fetch top 2 recommendations
      .returns<CareerMatchQueryResult[]>()
  ]);

  // --- Process Progress ---
  const progress = progressResult.data;
  if (progressResult.error && progressResult.error.code !== 'PGRST116') {
    console.error('Error fetching user progress:', progressResult.error.message);
  }

  // --- Process Vocational Results ---
  if (vocationalResultResult.error) {
    console.error('Error checking vocational results:', vocationalResultResult.error.message);
  }
  const hasVocationalResults = !!vocationalResultResult.data;

  // --- Process Assessment Profile (Personality) ---
  let hasPersonalityResults = false;
  if (assessmentProfileResult.error) {
     console.error('Error fetching assessment profile:', assessmentProfileResult.error.message);
  } else if (assessmentProfileResult.data && assessmentProfileResult.data.personality_scores) {
     // Check if the personality_scores object is not null and has keys
     hasPersonalityResults = Object.keys(assessmentProfileResult.data.personality_scores).length > 0;
  }

  // --- Process Career Recommendations ---
  let recommendations: Recommendation[] = [];
  if (careerMatchesResult.error) {
    console.error('Error fetching career recommendations:', careerMatchesResult.error.message);
  } else if (careerMatchesResult.data) {
    recommendations = careerMatchesResult.data
      .map(match => {
        const occupationData = match.occupations;
        if (occupationData && occupationData.code && occupationData.title) {
          // Explicitly create the object matching the Recommendation type
          const rec: Recommendation = {
            id: occupationData.code,
            career_name: occupationData.title,
            match_percentage: Math.round((match.match_score ?? 0) * 100),
            tags: [], // Placeholder
          };
          return rec;
        }
        return null;
      })
      .filter((match): match is Recommendation => match !== null); // Keep the type predicate
  }

  // --- Fetch Earned Badges (Depends on Progress) ---
  let earnedBadges: Badge[] = [];
  const earnedBadgeIds = progress?.earned_badge_ids;
  if (earnedBadgeIds && earnedBadgeIds.length > 0) {
    const { data: badgesData, error: badgesError } = await supabase
      .from('badges')
      .select('id, name, description, icon_url')
      .in('id', earnedBadgeIds)
      .returns<Badge[]>();

    if (badgesError) {
      console.error('Error fetching earned badges:', badgesError.message);
    } else {
      earnedBadges = badgesData || [];
    }
  }

  // Prepare props for the client component
  // We will add hasPersonalityResults to the client component's props interface next
  const clientProps = {
    userEmail: user.email,
    userName: user.user_metadata?.full_name || user.email?.split('@')[0],
    progress: progress ? { points: progress.points, level: progress.level } : null,
    hasVocationalResults: hasVocationalResults,
    hasPersonalityResults: hasPersonalityResults, // Pass the new status
    recommendations: recommendations,
    earnedBadges: earnedBadges,
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
       <div className="fixed inset-0 z-0">
         <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-black"></div>
         <div className="absolute inset-0 backdrop-blur-[2px]"></div>
       </div>
       {/* Ensure DashboardClientComponentProps includes hasPersonalityResults */}
       <DashboardClientComponent {...clientProps} />
    </div>
  )
}
