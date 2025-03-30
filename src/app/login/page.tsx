import Link from 'next/link'
// Removed unused redirect, oauthSignIn imports
import { login } from '@/app/auth/actions'

// Removed explicit props interface and type annotation
// Make component non-async, remove server-side auth check
export default function LoginPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {

  // Middleware handles redirecting logged-in users away from this page

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">Log In</h1>

        {searchParams?.message && typeof searchParams.message === 'string' && (
          <p className="mb-4 rounded bg-red-100 p-3 text-center text-sm text-red-700">
            {searchParams.message}
          </p>
        )}

        <form className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              className="w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
              type="email"
              name="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              className="w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            formAction={login}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Log In
          </button>
        </form>

        {/* Optional: OAuth Buttons */}
        {/* <div className="mt-6 border-t pt-6 text-center">
          <p className="mb-4 text-sm text-gray-600">Or log in with</p>
          <div className="flex justify-center space-x-4">
             <form>
               <button
                 formAction={() => oauthSignIn('google')} // Wrap in arrow function if needed
                 className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
               >
                 Google
               </button>
             </form>
             <form>
               <button
                 formAction={() => oauthSignIn('github')} // Wrap in arrow function if needed
                 className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
               >
                 GitHub
               </button>
             </form>
           </div>
        </div> */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
