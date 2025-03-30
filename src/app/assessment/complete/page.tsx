'use client' // Make it a client component

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
// Removed unused useRouter
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client' // Use client helper
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress' // Import Progress
import { CheckCircle2, AlertTriangle } from 'lucide-react' // Added AlertTriangle

// Function to check if results are ready
async function checkResults(userId: string): Promise<boolean> {
    const supabase = createClient(); // Create client instance inside function
    const { data, error } = await supabase
        .from('vocational_results')
        .select('id') // Just check if a row exists
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle to handle null without error

    if (error) {
        console.error("Error checking results:", error);
        return false; // Assume not ready if error
    }
    return !!data; // Return true if data exists, false otherwise
}


export default function AssessmentCompletePage() {
  // Removed unused router variable
  const searchParams = useSearchParams();
  const initialError = searchParams.get('error'); // Check if analysis failed immediately

  const [isLoading, setIsLoading] = useState(!initialError); // Start loading unless immediate error
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(initialError ? "Analysis generation failed. Please try again later or contact support." : null);
  const [userId, setUserId] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState(10); // For visual progress

   // Get user ID on mount
   useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
            setUserId(data.user.id);
        } else {
             setError("Could not verify user session.");
             setIsLoading(false);
        }
    });
   }, []);

  // Polling effect to check for results
  useEffect(() => {
    if (!userId || !isLoading || error) return; // Stop if no user, not loading, or error occurred

    let attempts = 0;
    const maxAttempts = 12; // Poll for max 60 seconds (12 * 5s)
    const intervalTime = 5000; // Poll every 5 seconds

    const intervalId = setInterval(async () => {
      attempts++;
      console.log(`Checking for results... Attempt ${attempts}`);
      setProgressValue(prev => Math.min(90, prev + (90 / maxAttempts))); // Increment progress visually

      try {
        const ready = await checkResults(userId);
        if (ready) {
          console.log("Results are ready!");
          setIsReady(true);
          setIsLoading(false);
          setProgressValue(100);
          clearInterval(intervalId);
        } else if (attempts >= maxAttempts) {
          console.error("Results check timed out.");
          setError("Analysis is taking longer than expected. Please check back later or contact support.");
          setIsLoading(false);
          clearInterval(intervalId);
        }
      } catch (err: unknown) { // Type error as unknown
         const message = err instanceof Error ? err.message : String(err);
         console.error("Error in polling interval:", message);
         setError("An error occurred while checking for results.");
         setIsLoading(false);
         clearInterval(intervalId);
      }
    }, intervalTime);

    // Cleanup interval on unmount or when loading stops
    return () => clearInterval(intervalId);

  }, [userId, isLoading, error]); // Rerun effect if userId changes or loading state changes

  return (
    <div className="container mx-auto mt-10 flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 text-center shadow-xl dark:bg-gray-800">

        {isLoading && !error && (
          <>
            <h1 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">Generating Analysis...</h1>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              {/* Escaped apostrophe */}
              Thank you for completing the assessment! We are now processing your responses using AI to generate personalized insights. This may take up to a minute.
            </p>
            <Progress value={progressValue} className="w-full" />
             <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Please wait...</p>
          </>
        )}

        {isReady && !error && (
           <>
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h1 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">Analysis Complete!</h1>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Your personalized vocational assessment results are ready. Explore your strengths, interests, and potential career paths.
            </p>
            <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800">
              <Link href="/results">View My Results</Link>
            </Button>
          </>
        )}

         {error && (
           <>
            {/* Added AlertTriangle icon */}
            <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-500" />
            <h1 className="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">Analysis Failed</h1>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              {error}
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
             {/* Optionally add a retry button? */}
          </>
        )}

         {/* Fallback state removed as it's covered by isLoading/isReady/error logic */}
         {/* {!isLoading && !isReady && !error && ( ... )} */}

      </div>
    </div>
  )
}
