import Link from 'next/link';
import { signup, oauthSignIn } from '@/app/auth/actions'; // Import signup and oauthSignIn
import RoboYouniMascot from '@/components/RoboYouniMascot'; // Import mascot
import Image from 'next/image'; // Import Next Image

// Re-use OAuthButton component structure from login page
const OAuthButton = ({ provider, label, icon }: { provider: 'google' | 'apple', label: string, icon: React.ReactNode }) => (
  <form className="w-full">
    <input type="hidden" name="provider" value={provider} />
    <button
      formAction={oauthSignIn} // Use oauthSignIn action
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-600 bg-gray-800/50 px-4 py-3 text-sm font-medium text-gray-200 hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
    >
      {icon}
      {label}
    </button>
  </form>
);


export default function Page() {
  // Use the specific signup background image (URL encoded)
  const backgroundImageUrl = '/Sign%20Up%20image.png';

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
             <Image src="/robo-youni.png" alt="Youni Logo" width={40} height={40} />
             <span className="text-2xl font-bold">Youni</span>
           </div>
           <h1 className="mb-2 text-4xl font-bold">
             🚀 Start Your Journey!
           </h1>
           <p className="text-lg text-gray-300">
             Create an account to unlock personalized insights.
           </p>
        </div>

        {/* Right Side: Signup Form Card */}
        <div className="w-full max-w-md rounded-2xl bg-gray-900/80 p-8 shadow-xl backdrop-blur-md relative overflow-hidden">
          {/* Mobile Header (Visible only on smaller screens) */}
          <div className="lg:hidden text-center mb-6">
            <div className="mb-2 flex items-center justify-center gap-2">
              <Image src="/robo-youni.png" alt="Youni Logo" width={30} height={30} />
              <span className="text-xl font-bold text-white">Youni</span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              🚀 Start Your Journey!
            </h1>
            <p className="text-sm text-gray-300">
              Create an account to unlock personalized insights.
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
              {/* Icon removed temporarily */}
            </div>
             {/* Confirm Password Input */}
             <div className="relative">
               <input
                 id="confirmPassword"
                 className="w-full rounded-lg border border-gray-700 bg-gray-800/70 p-3 pr-10 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
                 type="password"
                 name="confirmPassword"
                 placeholder="Confirm Password"
                 required
                 aria-label="Confirm Password"
               />
               {/* Icon removed temporarily */}
             </div>

            {/* Email Confirmation Note - Rephrased to avoid apostrophe */}
            <p className="text-center text-xs text-gray-400 pt-1">
              You will receive an email to confirm your account.
            </p>

            {/* Signup Button */}
            <button
              formAction={signup}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-base font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
            >
              Sign Up
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
            <OAuthButton
              provider="apple"
              label="Sign up with Apple"
              icon={<span></span> /* Placeholder */}
            />
            <OAuthButton
              provider="google"
              label="Sign up with Google"
              icon={<span>G</span> /* Placeholder */}
            />
          </div>

          {/* Bottom Links & Mascot */}
          <div className="mt-6 flex items-end justify-between">
            <div className="text-sm">
              <span className="text-gray-400">Already have an account? </span>
              <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
                Log in
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
