import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/auth/actions'
// Badge and Image components are now used in the client component
// import { Badge } from "@/components/ui/badge"
// import Image from 'next/image'
import DashboardClientComponent from './DashboardClientComponent' // Import the new client component

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
interface VocationalResultStatus {
  has_results: boolean;
}
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
    // This check is redundant if middleware is working, but good for robustness
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

  if (progressError) {
    console.error('Error fetching user progress:', progressError.message);
    // Handle error - maybe show default values?
  }
   if (badgesError) {
    console.error('Error fetching badges:', badgesError.message);
  }

  // Check for vocational results
  const { data: vocationalResult, error: vrError } = await supabase
    .from('vocational_results')
    .select('id') // Just check for existence
    .eq('user_id', user.id)
    .maybeSingle(); // Use maybeSingle as results might not exist

  if (vrError) {
    console.error('Error checking vocational results:', vrError.message);
  }
  const hasVocationalResults = !!vocationalResult;

  // Fetch completed quizzes (distinct quiz_ids from responses)
  // Note: This is a simple check. Calculating scores would be more complex.
  // Fetch all quiz_ids for the user, then filter for unique ones in code.
  const { data: quizResponses, error: quizError } = await supabase
    .from('quiz_responses')
    .select('quiz_id') // Select only the quiz_id column
    .eq('user_id', user.id);

  if (quizError) {
    console.error('Error fetching completed quizzes:', quizError.message);
  }

  // Process to find unique quiz IDs
  const uniqueQuizIds = new Set<string>();
  if (quizResponses) {
    // Add explicit type for 'response'
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

  // Fetch profile data if needed (optional for basic display)
  // const { data: profile, error: profileError } = await supabase
  //   .from('profiles')
  //   .select('username, full_name')
  //   .eq('user_id', user.id)
  //   .single()

  // if (profileError) {
  //   console.error('Error fetching profile:', profileError.message)
  //   // Handle error appropriately, maybe show a default state
  // }

  // Fetch profile data if needed (optional for basic display)
  // const { data: profile, error: profileError } = await supabase
  //   .from('profiles')
  //   .select('username, full_name')
  //   .eq('user_id', user.id) // Use user.id from server-side check
  //   .single()

  // if (profileError) {
  //   console.error('Error fetching profile:', profileError.message)
  // }

  // Pass fetched data to the Client Component
  return (
    <div className="container mx-auto mt-10 max-w-4xl rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
        <form>
          <button
            formAction={logout}
            className="rounded-md bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Logout
          </button>
        </form>
      </div>

      {/* Render the client component with fetched data */}
      <DashboardClientComponent
        userEmail={user.email}
        progress={progress ? { points: progress.points, level: progress.level } : null}
        earnedBadges={earnedBadges}
        hasVocationalResults={hasVocationalResults}
        completedQuizzes={completedQuizzes}
      />
    </div>
  )
}
