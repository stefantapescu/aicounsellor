
import { createClient } from '@/utils/supabase/server' // Import server helper
import { redirect } from 'next/navigation'
import ChatInterface from './ChatInterface'

// Server component for the Assistant page
export default async function AssistantPage() {
  const supabase = await createClient() // Await server helper

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?message=Please log in to use the AI Assistant.')
  }

  // Fetch initial data if needed (e.g., recent chat history)
  // For now, just pass the user ID to the client component
  const userId = user.id

  return (
    <div className="container mx-auto flex h-[calc(100vh-100px)] max-w-4xl flex-col py-6">
       <h1 className="mb-4 border-b pb-2 text-center text-2xl font-bold text-gray-800">
         AI Educational Consultant
       </h1>
      {/* Client component will handle chat messages and input */}
      <ChatInterface userId={userId} />
    </div>
  )
}
