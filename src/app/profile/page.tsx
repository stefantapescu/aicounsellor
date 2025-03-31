import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { allQuestions, type AssessmentQuestion } from '@/app/assessment/assessmentData'; // Import questions for context
// Import the client component
import ProfileClientComponent from './ProfileClientComponent';
import { type VocationalProfile, type DreamscapesAnalysis } from '@/types/profile'; // Import shared types

// Define type for the raw response data from Supabase (assessment only)
type RawAssessmentResponse = {
  section_id: string;
  response_data: Record<string, string | number | string[]> | null;
};

// Helper function to organize assessment responses
const organizeResponses = (responses: RawAssessmentResponse[], questions: AssessmentQuestion[]) => {
  const organized: Record<string, { questionText: string; answer: string | number | string[] }> = {};
  const questionMap = new Map(questions.map(q => [q.id, q]));

  (responses || []).forEach(sectionResponse => { // Added check for null/undefined responses
    if (sectionResponse.response_data && typeof sectionResponse.response_data === 'object') {
      for (const [questionId, answer] of Object.entries(sectionResponse.response_data)) {
        const question = questionMap.get(questionId);
        if (question && answer !== null && answer !== undefined) { // Added check for non-null answer
          organized[questionId] = {
            questionText: question.text,
            answer: answer,
          };
        }
      }
    }
  });
  return organized;
};


export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError, // Capture user fetch error
  } = await supabase.auth.getUser();

  if (userError || !user) { // Check for error or no user
    console.error('Profile access error or no user:', userError?.message);
    redirect('/login?message=Please log in to view your profile.');
  }

  // Fetch all raw responses for the user for the main assessment
  const { data: responses, error: fetchError } = await supabase
    .from('vocational_responses')
    .select('section_id, response_data')
    .eq('user_id', user.id)
    .eq('assessment_id', 'main_vocational'); // Assuming 'main_vocational' is the ID

  if (fetchError) {
    console.error('Error fetching vocational responses:', fetchError.message);
    // Handle error display - maybe show an error message on the page
    // For now, we'll pass empty data
  }

  const userAnswers = organizeResponses(responses || [], allQuestions);
  const allQuestionsMap = new Map(allQuestions.map(q => [q.id, q]));

  return (
    <div className="container mx-auto mt-10 max-w-3xl rounded-lg bg-white p-8 shadow-md dark:bg-gray-800"> {/* Reverted max-width */}
      <h1 className="mb-6 border-b pb-4 text-center text-3xl font-bold text-gray-800 dark:text-white"> {/* Reverted dark mode text */}
        Your Assessment Answers
      </h1>
      {/* Render the client component with original props */}
      <ProfileClientComponent userAnswers={userAnswers} allQuestionsMap={allQuestionsMap} />
    </div>
  );
}
