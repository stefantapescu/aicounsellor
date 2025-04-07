import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { processAndSaveAssessmentProfile } from '@/lib/assessment-processing';

export async function POST() {
  const supabase = await createClient();

  // 1. Check user authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('API Auth Error:', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log(`Assessment reprocessing request received for user: ${user.id}`);

  try {
    // 2. Process and save the assessment profile
    const result = await processAndSaveAssessmentProfile(user.id, 'main_vocational', supabase);

    if (result.error) {
      console.error('Error reprocessing assessment:', result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    console.log('Assessment successfully reprocessed:', result.profile);
    return NextResponse.json({ success: true, profile: result.profile });

  } catch (error) {
    console.error('Assessment Reprocessing API Error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 