import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware' // Import the helper
import { createClient } from '@/utils/supabase/server' // Import server client for auth check

export async function middleware(request: NextRequest) {
  // 1. Update the session and get the response object
  const response = await updateSession(request)

  // 2. Check authentication status using a server client AFTER session update
  //    (Note: Creating another client here is necessary because the one in updateSession
  //     might not reflect the *final* state after potential cookie updates within updateSession itself)
  const supabase = await createClient() // Use the server helper from utils/supabase/server.ts and AWAIT it
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // 3. Apply redirect logic based on auth status and path
  // Auth condition: If user is not logged in and tries to access protected routes
  if (!user && pathname.startsWith('/dashboard')) { // Add other protected routes as needed
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set(`message`, `Please log in to access this page.`)
    return NextResponse.redirect(url)
  }

  // Auth condition: If user is logged in and tries to access login/signup
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response // Continue with the response from updateSession
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
