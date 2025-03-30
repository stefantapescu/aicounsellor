import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createServerClient, type CookieOptions } from '@supabase/ssr' // Import directly

export async function middleware(request: NextRequest) {
  // update user's auth session using the helper
  // This response object is essential for setting cookies correctly.
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is set, update the request and response cookies.
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request }) // Recreate response with updated request cookies
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the request and response cookies.
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request }) // Recreate response with updated request cookies
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )


  // Refresh session if expired - important for Server Components
  // Must be called AFTER creating the client and BEFORE accessing `auth.getUser()`
   await supabase.auth.getUser()


  // Check auth state AFTER potentially refreshing the session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

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
