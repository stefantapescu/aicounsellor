import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/auth/actions'
import DashboardClientComponent from './DashboardClientComponent'

// Define types for fetched data
interface UserProgress {
  points: number;
  level: number;
  earned_badge_ids: string[] | null;
}
interface BadgeInfo {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
}
// Removed unused VocationalResultStatus type
// interface VocationalResultStatus {
//   has_results: boolean;
// }
interface CompletedQuiz {
    quiz_id: string;
    // Add more fields if needed, e.g., total score, completion date
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('Dashboard access error or no user (server component check):', userError?.message)
    redirect('/login?message=You must be logged in to view the dashboard.')
  }

  // Fetch user progress and badge definitions
  const { data: progress, error: progressError } = await supabase
    .from('user_progress')
    .select('points, level, earned_badge_ids')
    .eq('user_id', user.id)
    .single<UserProgress>(); // Specify type

  const { data: allBadges, error: badgesError } = await supabase
    .from('badges')
    .select('id, name, description, icon_url');

  if (progressError && progressError.code !== 'PGRST116') { // Ignore 'No rows found' for progress
    console.error('Error fetching user progress:', progressError.message);
  }
   if (badgesError) {
    console.error('Error fetching badges:', badgesError.message);
  }

  // Check for vocational results
  const { data: vocationalResult, error: vrError } = await supabase
    .from('vocational_results')
    .select('id') // Just check for existence
    .eq('user_id', user.id)
    .maybeSingle();

  if (vrError) {
    console.error('Error checking vocational results:', vrError.message);
  }
  const hasVocationalResults = !!vocationalResult;

  // Fetch completed quizzes
  const { data: quizResponses, error: quizError } = await supabase
    .from('quiz_responses')
    .select('quiz_id')
    .eq('user_id', user.id);

  if (quizError) {
    console.error('Error fetching completed quizzes:', quizError.message);
  }

  // Process to find unique quiz IDs
  const uniqueQuizIds = new Set<string>();
  if (quizResponses) {
    quizResponses.forEach((response: { quiz_id: string }) => {
      if (response.quiz_id) {
        uniqueQuizIds.add(response.quiz_id);
      }
    });
  }
  const completedQuizzes: CompletedQuiz[] = Array.from(uniqueQuizIds).map(id => ({ quiz_id: id }));


  // Filter earned badges
  const earnedBadgeIds = new Set(progress?.earned_badge_ids || []);
  const earnedBadges = (allBadges || []).filter(badge => earnedBadgeIds.has(badge.id)) as BadgeInfo[];

  // Define colors based on the image (assuming these are defined in tailwind.config.ts or use defaults)
  const primaryPurple = 'text-purple-900'; // Example, adjust as needed
  const primaryPink = 'bg-pink-600'; // Example for logout button
  const lightBg = 'bg-purple-50'; // Example for overall background

  // Pass fetched data to the Client Component
  return (
    // Use min-h-screen and a light purple background for the whole page
    <div className={`min-h-screen ${lightBg} dark:bg-gray-900 p-4 sm:p-8`}>
      <div className="container mx-auto max-w-4xl">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-4">
          <h1 className={`text-4xl font-bold ${primaryPurple} dark:text-purple-200`}>Dashboard</h1>
          <form>
            <button
              formAction={logout}
              className={`rounded-lg ${primaryPink} px-6 py-2 text-base font-semibold text-white hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors`}
            >
              Logout
            </button>
          </form>
        </div>

        {/* Welcome message moved to Client Component for consistency */}

        {/* Render the client component with fetched data */}
        <DashboardClientComponent
          userEmail={user.email}
          progress={progress ? { points: progress.points, level: progress.level } : null}
          // earnedBadges prop removed here
          hasVocationalResults={hasVocationalResults}
          completedQuizzes={completedQuizzes}
        />
      </div> {/* Close container div */}
    </div> // Close main div
  )
}
