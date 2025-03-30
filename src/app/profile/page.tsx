import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { allQuestions, type AssessmentQuestion } from '@/app/assessment/assessmentData'; // Import questions for context
// Import the client component
import ProfileClientComponent from './ProfileClientComponent';

// Helper function to organize responses
const organizeResponses = (responses: any[], questions: AssessmentQuestion[]) => {
  const organized: Record<string, { questionText: string; answer: any }> = {};
  const questionMap = new Map(questions.map(q => [q.id, q]));

  responses.forEach(sectionResponse => {
    if (sectionResponse.response_data && typeof sectionResponse.response_data === 'object') {
      for (const [questionId, answer] of Object.entries(sectionResponse.response_data)) {
        const question = questionMap.get(questionId);
        if (question) {
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
  } = await supabase.auth.getUser();

  if (!user) {
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
    <div className="container mx-auto mt-10 max-w-3xl rounded-lg bg-white p-8 shadow-md">
      <h1 className="mb-6 border-b pb-4 text-center text-3xl font-bold text-gray-800">
        Your Assessment Answers
      </h1>
      {/* Render the client component with fetched data */}
      <ProfileClientComponent userId={user.id} userAnswers={userAnswers} allQuestionsMap={allQuestionsMap} />
    </div>
  );
}
