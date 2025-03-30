import Link from 'next/link'
// Removed server-side auth imports: headers, createClient
import { redirect } from 'next/navigation' // Keep redirect if needed elsewhere
import { signup } from '@/app/auth/actions'

// Make component non-async, remove server-side auth check
export default function SignupPage({ searchParams }: { searchParams: { message: string } }) {

  // Middleware handles redirecting logged-in users away from this page

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">Sign Up</h1>

        {searchParams?.message && (
          <p className="mb-4 rounded bg-red-100 p-3 text-center text-sm text-red-700">
            {searchParams.message}
          </p>
        )}

        <form className="space-y-4">
          {/* Optional: Add Full Name input if needed for profile */}
          {/* <div>
            <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
            <input id="fullName" className="w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500" type="text" name="fullName" placeholder="Your Name" />
          </div> */}
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
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              className="w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            formAction={signup}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
