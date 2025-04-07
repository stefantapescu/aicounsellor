import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ConscientiousnessClient from './ConscientiousnessClient'; // Import the client component

export default async function ConscientiousnessGamePage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login?message=You must be logged in to play the assessment games.');
  }

  // Render the client component, passing the user ID
  return <ConscientiousnessClient userId={user.id} />;
}
