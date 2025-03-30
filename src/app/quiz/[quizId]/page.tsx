import { createClient } from '@/utils/supabase/server' // Import server helper
import { notFound, redirect } from 'next/navigation'
import QuizClientComponent from './QuizClientComponent'

// Define the structure of a quiz question based on our schema
interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_order: number;
  question_text: string;
  question_type: string; // 'multiple_choice', 'likert', 'open_ended'
  options: { value: string; text: string }[] | null; // Array for multiple choice/likert
  // correct_answer: string | null; // Not needed for display initially
  // points_value: number;
}

export default async function QuizPage({ params }: { params: { quizId: string } }) {
  const supabase = await createClient() // Await server helper
  const quizId = params.quizId

  // Fetch user session - still needed to pass userId to client component
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rely on middleware for strict route protection, but keep this check just in case
  if (!user) {
     console.warn("Quiz page accessed without user, redirecting via component.");
     redirect(`/login?message=Please log in to take the quiz&redirectTo=/quiz/${quizId}`)
  }

  // Fetch quiz questions for the given quizId, ordered correctly
  const { data: questions, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('question_order', { ascending: true })

  if (error) {
    console.error('Error fetching quiz questions:', error.message)
    // Consider showing an error message to the user
    return <div className="p-6 text-red-500">Error loading quiz questions.</div>
  }

  if (!questions || questions.length === 0) {
    notFound(); // Show 404 if quizId is invalid or has no questions
  }

  // Pass questions to a client component to handle interaction
  return (
    <div className="container mx-auto mt-10 max-w-2xl">
       <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
         Quiz: {quizId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} {/* Basic title formatting */}
       </h1>
      <QuizClientComponent questions={questions as QuizQuestion[]} userId={user?.id} />
    </div>
  )
}
