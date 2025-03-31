'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server' // Import server helper

// Removed helper function

export async function login(formData: FormData) {
  // Use server-side client
  const supabase = await createClient() // Await the async helper

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = Object.fromEntries(formData);

  // Define expected shape for login data
  const loginData = {
    email: data.email as string,
    password: data.password as string,
  };

  // Basic validation
  if (!loginData.email || !loginData.password) {
    console.error('Login validation error: Email and password are required'); // Added console log
    return redirect('/login?message=Email and password are required');
  }

  console.log(`Attempting login for: ${loginData.email}`); // Added console log
  const { error } = await supabase.auth.signInWithPassword(loginData); // Use typed data

  if (error) {
    console.error('Supabase Login Error:', error); // Log the full error object
    // Return specific error message
    const errorMessage = encodeURIComponent(error.message || 'Unknown authentication error');
    return redirect(`/login?message=Login failed: ${errorMessage}`);
  }

  console.log(`Login successful for: ${loginData.email}`); // Added console log
  revalidatePath('/', 'layout') // Revalidate all paths after login
  redirect('/dashboard') // Redirect to dashboard after successful login
}

export async function signup(formData: FormData) {
   // Use server-side client
   const supabase = await createClient() // Await the async helper

  const data = Object.fromEntries(formData)

  // Basic validation example
  if (!data.email || !data.password) {
    return redirect('/signup?message=Email and password are required')
  }
  if (data.password !== data.confirmPassword) {
    return redirect('/signup?message=Passwords do not match')
  }

  const { error } = await supabase.auth.signUp({
    email: data.email as string,
    password: data.password as string,
    options: {
      // emailRedirectTo: '/auth/callback', // Optional: If email confirmation is enabled
      data: {
        // You can add additional metadata here if needed by your handle_new_user trigger
        // full_name: data.fullName as string, // Example
      },
    },
  })

  if (error) {
    console.error('Signup error:', error.message)
    // More specific error handling might be needed based on Supabase error codes
    return redirect('/signup?message=Could not authenticate user. User might already exist or password is too weak.')
  }

  // If email confirmation is required, redirect to a confirmation pending page
  // Otherwise, Supabase might automatically log the user in, or you might log them in manually
  // Redirect to login page with a message indicating email confirmation is needed
  revalidatePath('/', 'layout')
  redirect('/login?message=Signup successful! Check your email to confirm your account before logging in.')
}

export async function logout() {
    // Use server-side client
    const supabase = await createClient() // Await the async helper
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}

// Example OAuth Login (e.g., Google)
export async function oauthSignIn(provider: 'google' | 'github') { // Add other providers as needed
   // Use server-side client
   const supabase = await createClient() // Await the async helper
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`, // Ensure this URL is in your Supabase Auth settings
    },
  })

  if (error) {
    console.error(`OAuth sign-in error (${provider}):`, error.message)
    return redirect('/login?message=Could not authenticate with provider')
  }

  if (data.url) {
    redirect(data.url) // Redirect the user to the provider's authentication page
  } else {
     // Handle unexpected case where URL is missing
     return redirect('/login?message=OAuth provider configuration error')
  }
}
