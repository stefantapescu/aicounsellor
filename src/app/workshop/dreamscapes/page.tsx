import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DreamscapesClientComponent from '@/app/workshop/dreamscapes/DreamscapesClientComponent'; // Using path alias

export default async function DreamscapesWorkshopPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Dreamscapes access error or no user:', userError?.message);
    redirect('/login?message=You must be logged in to access the workshop.');
  }

  // Define colors or theme elements if needed, similar to dashboard
  const lightBg = 'bg-purple-50'; // Example

  return (
    <div className={`min-h-screen ${lightBg} dark:bg-gray-900 p-4 sm:p-8 flex justify-center items-start`}>
      <div className="container mx-auto max-w-2xl w-full"> {/* Centered container */}
        {/* Render the client component - removed userId prop */}
        <DreamscapesClientComponent />
      </div>
    </div>
  );
}
