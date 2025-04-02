import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
// Removed unused cookies import
// import { cookies } from 'next/headers';

export async function POST(request: Request) {
  // Corrected: createClient likely doesn't need cookieStore here
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('API access error or no user:', userError?.message);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let requestData;
  try {
    requestData = await request.json();
    // Basic validation: Ensure 'responses' field exists and is an object
    if (!requestData || typeof requestData.responses !== 'object' || requestData.responses === null) {
      throw new Error('Invalid data format: "responses" object is required.');
    }
  } catch (error) {
    console.error('Error parsing request body:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { responses } = requestData;
  const completed_at = new Date().toISOString(); // Mark completion time

  const { data, error } = await supabase
    .from('dreamscapes_responses')
    .insert([
      {
        user_id: user.id,
        responses: responses, // Store the entire responses object in the JSONB column
        completed_at: completed_at,
      },
    ])
    .select() // Optionally select the inserted data to return it
    .single(); // Assuming only one record is inserted per request

  if (error) {
    console.error('Error saving Dreamscapes response:', error.message);
    return NextResponse.json({ error: 'Failed to save workshop response', details: error.message }, { status: 500 });
  }

  console.log('Dreamscapes response saved successfully for user:', user.id);
  return NextResponse.json({ message: 'Workshop response saved successfully', data: data }, { status: 201 });
}
