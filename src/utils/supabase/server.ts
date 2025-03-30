import { type CookieOptions, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Note: This function is intended for use in Server Components, Server Actions, and Route Handlers.
// It relies on the `cookies()` method from `next/headers`.
// WARNING: This pattern may show persistent type errors in the editor in this environment,
// but is the documented approach for server-side usage. Ignore related type errors for now.
// In Next.js 15, cookies API has changed - this is an updated implementation
export async function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Define as async arrow function, await cookieStore before calling get
        get: async (name: string) => {
          return (await cookieStore).get(name)?.value;
          // Ensure cookieStore is awaited if it's a promise (it is with next/headers)
          const store = await cookieStore;
          return store.get(name)?.value;
        },
        set: async (name: string, value: string, options: CookieOptions) => {
          // Ensure cookieStore is awaited and call set
          // This IS needed for Server Actions to set the auth cookie
          const store = await cookieStore;
          store.set({ name, value, ...options });
        },
        remove: async (name: string, options: CookieOptions) => {
          // Ensure cookieStore is awaited and call set with empty value/delete
          // This IS needed for Server Actions (like logout) to remove the auth cookie
          const store = await cookieStore;
          store.set({ name, value: '', ...options }); // Or store.delete(name, options) if preferred
        },
      },
    }
  )
}
