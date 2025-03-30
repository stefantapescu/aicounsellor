import { createClient } from '@/utils/supabase/server' // Import server helper
import { redirect } from 'next/navigation'
import AssessmentClientComponent from './AssessmentClientComponent'

export default async function AssessmentPage() {
  const supabase = await createClient() // Await server helper

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?message=Please log in to start the assessment.')
  }

  // In a real app, you might fetch:
  // - Assessment structure/sections
  // - User's previous responses to allow resuming
  // const { data: previousResponses, error } = await supabase
  //   .from('vocational_responses')
  //   .select('section_id, response_data')
  //   .eq('user_id', user.id)
  //   .eq('assessment_id', 'main_vocational');

  // For now, we pass only the user ID
  const userId = user.id;

  return (
    <div className="container mx-auto mt-10 max-w-3xl">
      <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
        Vocational Assessment
      </h1>
      <AssessmentClientComponent userId={userId} /* previousResponses={previousResponses || []} */ />
    </div>
  )
}
