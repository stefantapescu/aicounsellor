import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ResultsClientSection from './ResultsClientSection'

// Define the structure of the profile data for type safety
interface AssessmentProfile {
  riasec_scores: Record<string, number> | null;
  personality_scores: Record<string, number> | null;
  aptitude_scores: { verbalCorrect: number, numericalCorrect: number, abstractCorrect: number, totalCorrect: number, totalAttempted: number } | null;
  work_values: { ranked: string[] } | null;
  learning_style: string | null;
}

// Define structure for the full_ai_analysis JSONB field
interface FullAIAnalysis {
    raw_response?: string | null;
    generated_at?: string;
    success?: boolean;
}

// Define structure for the vocational_results table row
interface VocationalResult {
    full_ai_analysis: FullAIAnalysis | null;
    narrative_story: string | null;
    updated_at: string;
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
      .from('vocational_results')
      .select('full_ai_analysis, narrative_story, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single<VocationalResult>(), // Apply type here
    supabase
      .from('user_assessment_profiles')
      .select('riasec_scores, personality_scores, aptitude_scores, work_values, learning_style')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single<AssessmentProfile>() // Apply type here
  ]);

  const { data: results, error: fetchResultsError } = resultsFetch;
  const { data: profileScores, error: fetchProfileError } = profileFetch; // Use fetched data directly

  if (fetchResultsError && fetchResultsError.code !== 'PGRST116') {
    console.error('Error fetching vocational results:', fetchResultsError.message)
  }
   if (fetchProfileError && fetchProfileError.code !== 'PGRST116') {
     console.error('Error fetching assessment profile:', fetchProfileError.message)
   }

  // Extract AI analysis data safely using the defined types
  const analysisData: FullAIAnalysis | null = results?.full_ai_analysis ?? null;
  const analysisSuccess = analysisData?.success ?? false;
  const aiReportText = analysisData?.raw_response ?? 'Structured report not available.';
  const narrativeStoryText = results?.narrative_story ?? 'Personalized story not available.';

  return (
    <div className="container mx-auto mt-10 max-w-7xl rounded-lg bg-white p-6 shadow-md dark:bg-gray-900 md:p-8">
      <h1 className="mb-6 border-b pb-4 text-center text-3xl font-bold text-gray-800 dark:text-gray-100 dark:border-gray-700">
        Your Vocational Assessment Report
      </h1>

      <ResultsClientSection
        userId={user.id}
        initialReport={results ? { text: aiReportText, success: analysisSuccess, updatedAt: results.updated_at } : null}
        initialStory={narrativeStoryText} // Pass story text directly
        profileScores={profileScores} // Pass the fetched scores (can be null)
      />
    </div>
  )
}
