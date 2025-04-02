import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DreamscapesResultsClient from './DreamscapesResultsClient';
import { type VocationalProfile } from '@/types/profile'; // Removed unused DreamscapesAnalysis import

export default async function DreamscapesResultsPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login?message=Please log in to view workshop results.');
  }

  // Fetch Vocational Profile which contains the Dreamscapes analysis
  const { data: profileData, error: profileFetchError } = await supabase
    .from('vocational_profile')
    .select('dreamscapes_analysis') // Only select the needed field
    .eq('user_id', user.id)
    .maybeSingle<Pick<VocationalProfile, 'dreamscapes_analysis'>>(); // Type for partial selection

   if (profileFetchError) {
    console.error('Error fetching vocational profile for results:', profileFetchError.message);
    // Handle error - maybe show an error message or pass null
  }

  const dreamscapesAnalysis = profileData?.dreamscapes_analysis || null;

  // Define background color (can be customized)
  const lightBg = 'bg-purple-50';

  return (
    <div className={`min-h-screen ${lightBg} dark:bg-gray-900 p-4 sm:p-8 flex justify-center items-start`}>
      <div className="container mx-auto max-w-3xl w-full"> {/* Centered container */}
        <h1 className="mb-6 border-b pb-4 text-center text-3xl font-bold text-gray-800 dark:text-white">
          Dreamscapes Workshop Insights
        </h1>
        {/* Render the client component */}
        <DreamscapesResultsClient analysis={dreamscapesAnalysis} />
      </div>
    </div>
  );
}
// Removed unused type export
// export type { DreamscapesAnalysis };
