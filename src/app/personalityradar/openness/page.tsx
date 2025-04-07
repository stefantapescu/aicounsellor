import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ExplorerDilemmaClient from './ExplorerDilemmaClient';

export default async function OpennessGamePage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login?message=You must be logged in to play the assessment games.');
  }

  // This page primarily renders the client component which handles the game logic
  return <ExplorerDilemmaClient userId={user.id} />;
}
