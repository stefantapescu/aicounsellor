// Attempt to explicitly import the type definition
import type {} from '../../types/jsx'; // Adjust path if necessary

import Link from 'next/link';
import { login, oauthSignIn } from '@/app/auth/actions'; // Import oauthSignIn
import RoboYouniMascot from '@/components/RoboYouniMascot'; // Import mascot
import Image from 'next/image'; // Import Next Image for potential logo use

// Helper component for OAuth buttons using hidden input for provider
const OAuthButton = ({ provider, label, icon }: { provider: 'google' | 'apple', label: string, icon: React.ReactNode }) => (
  <form className="w-full">
    {/* Pass provider via hidden input */}
    <input type="hidden" name="provider" value={provider} />
    <button
      formAction={oauthSignIn} // Pass Server Action directly
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-600 bg-gray-800/50 px-4 py-3 text-sm font-medium text-gray-200 hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
    >
      {icon}
      {label}
    </button>
  </form>
);

export default function Page() {
  // URL encode the space in the filename
  const backgroundImageUrl = '/Logo%20baground.png';

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: `url('${backgroundImageUrl}')` }}
    >
      {/* Overlay to darken the background image */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Content Container */}
      <div className="relative z-10 flex w-full max-w-4xl items-center justify-center lg:justify-between">

        {/* Left Side: Welcome Text & Logo (Hidden on smaller screens) */}
        <div className="hidden lg:block w-1/2 text-white pr-10">
           <div className="mb-4 flex items-center gap-3">
             {/* Assuming a logo component or image */}
             <Image src="/robo-youni.png" alt="Youni Logo" width={40} height={40} />
             <span className="text-2xl font-bold">Youni</span>
           </div>
           <h1 className="mb-2 text-4xl font-bold">
             <span role="img" aria-label="waving hand">👋</span> Welcome back!
           </h1>
           <p className="text-lg text-gray-300">
             Discover your future, your way.
           </p>
        </div>

        {/* Right Side: Login Form Card */}
        <div className="w-full max-w-md rounded-2xl bg-gray-900/80 p-8 shadow-xl backdrop-blur-md relative overflow-hidden">
          {/* Mobile Header (Visible only on smaller screens) */}
          <div className="lg:hidden text-center mb-6">
            <div className="mb-2 flex items-center justify-center gap-2">
              <Image src="/robo-youni.png" alt="Youni Logo" width={30} height={30} />
              <span className="text-xl font-bold text-white">Youni</span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              <span role="img" aria-label="waving hand">👋</span> Welcome back!
            </h1>
            <p className="text-sm text-gray-300">
              Discover your future, your way.
            </p>
          </div>

          <form className="space-y-5">
            {/* Email Input */}
            <input
              id="email"
              className="w-full rounded-lg border border-gray-700 bg-gray-800/70 p-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
              type="email"
              name="email"
              placeholder="Email address"
              required
              aria-label="Email address"
            />
            {/* Password Input */}
            <div className="relative">
              <input
                id="password"
                className="w-full rounded-lg border border-gray-700 bg-gray-800/70 p-3 pr-10 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
                type="password"
                name="password"
                placeholder="Password"
                required
                aria-label="Password"
              />
              {/* Ion-icon removed temporarily due to persistent TS errors */}
              {/* <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                <ion-icon name="lock-closed-outline" class="text-gray-500"></ion-icon>
              </span> */}
            </div>

            {/* Login Button - Pass Server Action directly */}
            <button
              formAction={login} // Pass Server Action directly
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-base font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
            >
              Log In
            </button>
          </form>

          {/* OR Separator */}
          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="mx-4 flex-shrink text-xs font-medium text-gray-400">OR</span>
            <div className="flex-grow border-t border-gray-600"></div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            {/* Note: Apple Sign in requires specific setup */}
            <OAuthButton
              provider="apple"
              label="Sign in with Apple"
              // Ion-icon removed temporarily
              icon={<span></span> /* Placeholder */}
            />
            <OAuthButton
              provider="google"
              label="Sign in with Google"
              // Ion-icon removed temporarily
              icon={<span>G</span> /* Placeholder */}
            />
          </div>

          {/* Bottom Links & Mascot */}
          <div className="mt-6 flex items-end justify-between">
            <div className="text-sm">
              <Link href="/forgot-password" // Added Forgot Password link (needs implementation)
                    className="font-medium text-indigo-400 hover:text-indigo-300 block mb-1">
                Forgot password?
              </Link>
              {/* Rephrased to avoid apostrophe */}
              <span className="text-gray-400">Do not have an account? </span>
              <Link href="/signup" className="font-medium text-indigo-400 hover:text-indigo-300">
                Sign up now
              </Link>
            </div>
            <div className="w-16 h-16 flex-shrink-0">
              <RoboYouniMascot width={64} height={64} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
