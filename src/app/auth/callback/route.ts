import { createServerClient, type CookieOptions } from '@supabase/ssr' // Use direct import
import { type NextRequest, NextResponse } from 'next/server' // Use NextRequest

export async function GET(request: NextRequest) { // Use NextRequest
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the `@supabase/ssr` package. It exchanges an auth code for the user's session.
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    // Create client specifically for Route Handler context
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            return request.cookies.get(name)?.value
          },
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          set(name: string, value: string, options: CookieOptions) {
            // Setting cookies in Route Handlers needs the response object
            // This pattern might need adjustment if setting is required here
            // For exchangeCodeForSession, usually only reading is needed initially
          },
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          remove(name: string, options: CookieOptions) {
             // Setting cookies in Route Handlers needs the response object
          },
        },
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // URL to redirect to after successful auth exchange
      return NextResponse.redirect(`${origin}/dashboard`) // Redirect to dashboard on success
    }
  }

  // URL to redirect to after sign in process completes
  console.error('OAuth callback error:', 'Could not exchange code for session or code missing.');
  return NextResponse.redirect(`${origin}/login?message=Could not log in with provider`)
}
