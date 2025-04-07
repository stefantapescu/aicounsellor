"use client" // Add "use client" for state hooks

import type React from "react" // Add React import
import { useState } from "react" // Add useState import
import Link from 'next/link';
import { Apple, Eye, EyeOff, Mail, Lock, UserPlus } from "lucide-react" // Add lucide icons
import { signup, oauthSignIn } from '@/app/auth/actions';
import RoboYouniMascot from '@/components/RoboYouniMascot';
// Removed unused Image import
import { Button } from "@/components/ui/button" // Add Button import
import { Input } from "@/components/ui/input" // Add Input import
import { Separator } from "@/components/ui/separator" // Add Separator import

// Keep existing OAuthButton helper
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


export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  // Remove client-side state for inputs as we use server actions
  // const [email, setEmail] = useState("")
  // const [password, setPassword] = useState("")
  // const [confirmPassword, setConfirmPassword] = useState("")

  // Remove client-side handleSubmit
  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault()
  //   // Handle signup logic here
  //   console.log("Signup with:", email, password, confirmPassword)
  // }

  // Keep existing background image logic
  const backgroundImageUrl = '/Sign%20Up%20image.png';

  return (
    // Use v0 layout structure but keep existing background image style
    <div
      className="relative flex min-h-screen flex-col items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: `url('${backgroundImageUrl}')` }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Use v0 container structure */}
      <div className="container relative z-10 flex flex-col items-center px-4 md:px-6 lg:flex-row lg:items-stretch lg:gap-8">
        {/* Use v0 left side text block */}
        <div className="mb-8 text-center text-white lg:mb-0 lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:text-left">
          <h1 className="mb-2 text-3xl font-bold md:text-4xl">Join AI Youni Today</h1>
          <p className="text-lg text-gray-300">Create an account to start your educational journey</p>
        </div>

        {/* Use v0 right side card structure */}
        <div className="w-full max-w-md lg:w-1/2">
          <div className="relative overflow-hidden rounded-xl bg-gray-900/80 p-6 shadow-xl backdrop-blur-sm md:p-8">
             {/* Keep existing mascot placement */}
             <div className="absolute -right-4 -bottom-4 opacity-50 lg:opacity-100">
               <RoboYouniMascot width={80} height={80} />
             </div>

            <h2 className="mb-6 text-2xl font-bold text-white">Sign Up</h2>

            {/* Keep existing form tag for server action */}
            <form className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  {/* Use shadcn Input, keep name="email" */}
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email address"
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500" // Apply v0 styles
                    name="email" // Keep name
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  {/* Use shadcn Input, keep name="password" */}
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500" // Apply v0 styles
                    name="password" // Keep name
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  {/* Use shadcn Input, keep name="confirmPassword" */}
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500" // Apply v0 styles
                    name="confirmPassword" // Keep name
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Keep existing confirmation note */}
               <p className="text-center text-xs text-gray-400 pt-1">
                 You will receive an email to confirm your account.
               </p>

              {/* Keep existing signup button with formAction */}
              <Button
                formAction={signup}
                type="submit" // Ensure type is submit
                className="w-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2" // Use v0 styles + existing flex/gap
              >
                <UserPlus className="mr-2 h-4 w-4" /> Sign Up
              </Button>
            </form> {/* Close form for email/password */}

            {/* Use v0 Separator */}
            <div className="relative my-4">
              <Separator className="bg-gray-700" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 px-2 text-sm text-gray-400">
                OR
              </span>
            </div>

            {/* Use existing OAuthButton component but apply v0 styling */}
            <div className="grid gap-3">
               <OAuthButton
                 provider="google"
                 label="Continue with Google"
                 icon={
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
                     <path
                       fill="#4285F4"
                       d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                     />
                     <path
                       fill="#34A853"
                       d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                     />
                     <path
                       fill="#FBBC05"
                       d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                     />
                     <path
                       fill="#EA4335"
                       d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                     />
                   </svg>
                 }
               />
               <OAuthButton
                 provider="apple"
                 label="Continue with Apple"
                 icon={<Apple className="h-5 w-5" />}
               />
            </div>

            {/* Use v0 bottom link structure */}
            <div className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-purple-400 hover:text-purple-300">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
