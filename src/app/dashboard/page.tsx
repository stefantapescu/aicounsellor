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
// Removed unused BadgeInfo type
// interface BadgeInfo {
//   id: string;
//   name: string;
//   description: string | null;
//   icon_url: string | null;
// }
// Removed unused CompletedQuiz type
// interface CompletedQuiz {
//     quiz_id: string;
// }

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
    .single<UserProgress>();

  // Removed unused allBadges fetch
  // const { data: allBadges, error: badgesError } = await supabase
  //   .from('badges')
  //   .select('id, name, description, icon_url');

  if (progressError && progressError.code !== 'PGRST116') {
    console.error('Error fetching user progress:', progressError.message);
  }
  // Removed badgesError check
  //  if (badgesError) {
  //   console.error('Error fetching badges:', badgesError.message);
  // }

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
  // Removed completedQuizzes variable assignment


  // Removed earnedBadgeIds variable assignment
  // const earnedBadgeIds = new Set(progress?.earned_badge_ids || []);

  // Define colors based on the image (assuming these are defined in tailwind.config.ts or use defaults)
  const primaryPurple = 'text-purple-900';
  const primaryPink = 'bg-pink-600'; // Example for logout button
  const lightBg = 'bg-purple-50'; // Example for overall background

  // Pass fetched data to the Client Component
  return (
    // Use min-h-screen and a light purple background for the whole page
    <div className={`min-h-screen ${lightBg} dark:bg-gray-900 p-4 sm:p-8`}>
      {/* Removed max-w-4xl to allow content to expand */}
      <div className="container mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-4">
          {/* Adjusted title size for responsiveness */}
          <h1 className={`text-3xl sm:text-4xl font-bold ${primaryPurple} dark:text-purple-200`}>Dashboard</h1>
          <form>
            <button
              formAction={logout}
              className={`flex items-center gap-2 rounded-lg ${primaryPink} px-4 sm:px-6 py-2 text-base font-semibold text-white hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors`} // Added flex, items-center, gap-2, adjusted padding
            >
              {/* <ion-icon name="log-out-outline" class="text-xl"></ion-icon> */} {/* Ion-icon removed temporarily */}
              Logout
            </button>
          </form>
        </div>

        {/* Welcome message moved to Client Component for consistency */}

        {/* Render the client component with fetched data */}
        <DashboardClientComponent
          userEmail={user.email}
          progress={progress ? { points: progress.points, level: progress.level } : null}
          hasVocationalResults={hasVocationalResults}
          // completedQuizzes prop removed here
        />
      </div> {/* Close container div */}
    </div> // Close main div
  )
}
