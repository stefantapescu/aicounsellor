import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ResultsClientSection from './ResultsClientSection' // Re-import client section

// Define the structure of the profile data for type safety
interface AssessmentProfile {
  riasec_scores: any;
  personality_scores: any;
  aptitude_scores: any;
  work_values: any;
  learning_style: string | null;
  // Add other fields if needed, but keep it minimal for props
}

export default async function ResultsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?message=Please log in to view your results.')
  }

  // Fetch both the latest AI analysis and the calculated profile in parallel
  const [resultsFetch, profileFetch] = await Promise.all([
    supabase
      .from('vocational_results') // Fetch AI report and story
      .select('full_ai_analysis, narrative_story, updated_at') // Added narrative_story
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('user_assessment_profiles') // Fetch calculated scores
      .select('riasec_scores, personality_scores, aptitude_scores, work_values, learning_style') // Select only needed fields
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false }) // Assuming profile is updated around the same time
      .limit(1)
      .single()
  ]);

  const { data: results, error: fetchResultsError } = resultsFetch;
  // Explicitly type profileScores or default to null
  const profileScores: AssessmentProfile | null = profileFetch.data as AssessmentProfile | null;
  const fetchProfileError = profileFetch.error;


  if (fetchResultsError && fetchResultsError.code !== 'PGRST116') { // Ignore 'No rows found'
    console.error('Error fetching vocational results:', fetchResultsError.message)
    // TODO: Add user-facing error message component
  }
   if (fetchProfileError && fetchProfileError.code !== 'PGRST116') { // Ignore 'No rows found'
     console.error('Error fetching assessment profile:', fetchProfileError.message)
     // TODO: Add user-facing error message component
   }

  // Extract AI analysis data safely
  const analysisData = results?.full_ai_analysis as any; // Cast for easier access
  const analysisSuccess = analysisData?.success ?? false; // Success of the structured report part
  const aiReportText = analysisData?.raw_response ?? 'Structured report not available.'; // Get the structured report text
  const narrativeStoryText = results?.narrative_story ?? 'Personalized story not available.'; // Get the narrative story text

  return (
    // Use max-w-7xl for a wider container on larger screens, add dark mode bg
    <div className="container mx-auto mt-10 max-w-7xl rounded-lg bg-white p-6 shadow-md dark:bg-gray-900 md:p-8">
      <h1 className="mb-6 border-b pb-4 text-center text-3xl font-bold text-gray-800 dark:text-gray-100 dark:border-gray-700">
        Your Vocational Assessment Report
      </h1>

      {/* Render AI report using the client component */}
      <ResultsClientSection
        userId={user.id} // user is guaranteed non-null here due to redirect above
        // Pass both report texts
        initialReport={results ? { text: aiReportText, success: analysisSuccess, updatedAt: results.updated_at } : null}
        initialStory={results ? narrativeStoryText : null}
        profileScores={profileScores} // Pass the fetched scores (can be null)
      />
    </div>
  )
}
