import { createClient } from '@/utils/supabase/server'; // Use server client
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin; // Get the origin where the request came from

  if (code) {
    const supabase = await createClient(); // Use await for server client
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // URL to redirect to after sign in process completes
      // Redirect to dashboard or a generic success page
      return NextResponse.redirect(`${origin}/dashboard`);
    } else {
       console.error('Error exchanging code for session:', error.message);
       // Redirect to an error page or login page with an error message
       return NextResponse.redirect(`${origin}/login?message=Could not authenticate user`);
    }
  } else {
     console.error('No code found in callback URL');
     // Redirect to an error page or login page with an error message
     return NextResponse.redirect(`${origin}/login?message=Authentication callback error`);
  }

  // Fallback redirect if code is missing (should ideally not be reached)
  // return NextResponse.redirect(`${origin}/login?message=Invalid callback`);
}
