import { type CookieOptions, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Note: This function is intended for use in Server Components, Server Actions, and Route Handlers.
// It relies on the `cookies()` method from `next/headers`.
// WARNING: This pattern may show persistent type errors in the editor in this environment,
// but is the documented approach for server-side usage. Ignore related type errors for now.
export async function createClient() {
  const cookieStore = cookies() // Call cookies() at the top level

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // Middleware handles actual setting
            cookieStore.set(name, value, options)
          } catch (error) {
             console.warn(`Server context attempted to set cookie '${name}'. Middleware should handle this.`);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
             // Middleware handles actual removal
            cookieStore.delete(name, options)
          } catch (error) {
             console.warn(`Server context attempted to remove cookie '${name}'. Middleware should handle this.`);
          }
        },
      },
    }
  )
}
