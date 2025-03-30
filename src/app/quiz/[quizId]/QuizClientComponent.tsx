'use client'

import { useState, useEffect, useTransition } from 'react' // Added useTransition
import { createClient } from '@/utils/supabase/client' // Use client-side client
import { useRouter } from 'next/navigation'
import { updateUserProgressAfterQuiz } from '../actions' // Import the server action

// Re-use the interface from the server component (or define in a shared types file)
interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_order: number;
  question_text: string;
  question_type: string;
  options: { value: string; text: string }[] | null;
}

interface QuizClientComponentProps {
  questions: QuizQuestion[];
  userId?: string; // Pass userId if available from server
}

interface Answers {
  [questionId: string]: any; // Store answer based on question ID
}

export default function QuizClientComponent({ questions, userId }: QuizClientComponentProps) {
  const supabase = createClient()
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  // Use useTransition for server action loading state
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length

  // Pre-fill answers if needed (e.g., fetching previous responses) - Skipped for now

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = async () => {
    if (!userId) {
      setError('User not identified. Cannot save responses.')
      // Optionally redirect to login
      // router.push(`/login?message=Please log in to save your quiz results&redirectTo=/quiz/${currentQuestion.quiz_id}`)
      return
    }

    // Use transition for loading state
    startTransition(async () => {
      setError(null)

      const responsesToSave = Object.entries(answers).map(([questionId, responseValue]) => {
      const question = questions.find(q => q.id === questionId);
      return {
        user_id: userId,
        question_id: questionId,
        quiz_id: question?.quiz_id || questions[0].quiz_id, // Get quiz_id from question or first question
        response: responseValue, // Store the actual answer value
        // is_correct and points_awarded could be calculated server-side via edge function/trigger if needed
      };
    });

    // Use upsert to handle potential re-submissions or updates
    const { error: insertError } = await supabase
      .from('quiz_responses')
        .upsert(responsesToSave, { onConflict: 'user_id, question_id' }) // Assumes UNIQUE constraint

      if (insertError) {
        console.error('Error saving quiz responses:', insertError.message)
        setError(`Failed to save responses: ${insertError.message}`)
        return // Stop if saving responses failed
      }

      console.log('Quiz responses saved successfully.')

      // --- Call the server action to update progress ---
      const progressResult = await updateUserProgressAfterQuiz(userId, currentQuestion.quiz_id)

      if (progressResult?.error) {
        console.error('Error updating progress:', progressResult.error)
        // Decide how to handle progress update errors - maybe still redirect?
        setError(`Responses saved, but failed to update progress: ${progressResult.error}`);
        // Redirect anyway, show error on dashboard
        router.push(`/dashboard?message=${encodeURIComponent(`Quiz ${currentQuestion.quiz_id} completed, but progress update failed.`)}`);
      } else {
        console.log('User progress updated:', progressResult);
        // Construct success message with points/badges
        // Note: progressResult.points is the *new total*, not points earned this quiz.
        // We'd need the action to return pointsEarnedThisQuiz for accurate feedback here.
        // For now, just confirm completion and badge info.
        let successMsg = `Quiz ${currentQuestion.quiz_id} completed! Progress updated!`;
        // TODO: Enhance action to return newly earned badges for better feedback
        // if (progressResult.newBadges && progressResult.newBadges.length > 0) {
        //    successMsg += ` You earned: ${progressResult.newBadges.map(b => b.name).join(', ')}! 🎉`;
        // }
        // Redirect to dashboard on full success, passing feedback
        router.push(`/dashboard?message=${encodeURIComponent(successMsg)}`);
      }
    })
  }

  const renderQuestion = (question: QuizQuestion) => {
    const currentAnswer = answers[question.id]

    switch (question.question_type) {
      case 'multiple_choice':
        return (
          <fieldset className="mt-4 space-y-2">
            <legend className="sr-only">{question.question_text}</legend>
            {question.options?.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  id={`${question.id}-${option.value}`}
                  name={question.id}
                  type="radio"
                  value={option.value}
                  checked={currentAnswer === option.value}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor={`${question.id}-${option.value}`}
                  className="ml-3 block text-sm text-gray-700"
                >
                  {option.text}
                </label>
              </div>
            ))}
          </fieldset>
        )
      case 'open_ended':
        return (
          <div className="mt-4">
            <label htmlFor={question.id} className="sr-only">
              {question.question_text}
            </label>
            <textarea
              id={question.id}
              name={question.id}
              rows={4}
              className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Your answer..."
              value={currentAnswer || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            />
          </div>
        )
      // Add cases for 'likert' or other types as needed
      default:
        return <p className="mt-4 text-sm text-gray-500">Unsupported question type.</p>
    }
  }

  return (
    <div className="rounded-lg bg-white p-8 shadow-md">
      <div className="mb-6 border-b pb-4">
        <p className="text-sm text-gray-500">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </p>
        <h2 className="mt-1 text-xl font-semibold text-gray-900">
          {currentQuestion.question_text}
        </h2>
      </div>

      {renderQuestion(currentQuestion)}

      {error && (
        <p className="mt-4 rounded bg-red-100 p-3 text-center text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-8 flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0 || isPending} // Use isPending
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>

        {currentQuestionIndex < totalQuestions - 1 ? (
          <button
            onClick={handleNext}
            disabled={isPending} // Use isPending
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isPending} // Use isPending
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isPending ? 'Submitting...' : 'Submit Answers'}
          </button>
        )}
      </div>
    </div>
  )
}
