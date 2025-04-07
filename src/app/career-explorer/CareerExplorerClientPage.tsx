'use client'; // Make this a client component

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import CareerListClientComponent from './CareerListClientComponent';
import type { MatchedCareer } from '@/types/profile'; // Import the shared type
import { AlertCircle } from 'lucide-react'; // Import the alert icon

// No props needed as it fetches its own data
export default function CareerExplorerClientPage() {
  const [matchedCareers, setMatchedCareers] = useState<MatchedCareer[]>([]); // Use the imported type
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false); // Track if fetch has been attempted
  const [isPending, startTransition] = useTransition(); // For button loading state
  const [isReprocessing, setIsReprocessing] = useState(false);

  const handleFetchMatches = () => {
    setIsLoading(true);
    setError(null);
    setHasFetched(true); // Mark that fetch has been attempted
    setMatchedCareers([]); // Clear previous results

    startTransition(async () => {
      try {
        // Client-side fetch to our API route
        // Browser handles sending necessary auth cookies automatically
        const response = await fetch('/api/career-match', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.error(`API request failed with status ${response.status}: ${errorBody}`);
          throw new Error(`Failed to fetch matches. Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          console.error("API returned an error:", data.error);
          throw new Error(data.error);
        }

        console.log(`Received ${data.matches?.length || 0} matches from API.`);
        setMatchedCareers(data.matches || []);

      } catch (err) {
        console.error('Error fetching matched careers:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleReprocessAssessment = async () => {
    setIsReprocessing(true);
    setError(null);

    try {
      const response = await fetch('/api/reprocess-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Reprocessing request failed with status ${response.status}: ${errorBody}`);
        throw new Error(`Failed to reprocess assessment. Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        console.error("Reprocessing API returned an error:", data.error);
        throw new Error(data.error);
      }

      console.log('Assessment successfully reprocessed:', data.profile);
      
      // After successful reprocessing, fetch matches again
      await handleFetchMatches();

    } catch (err) {
      console.error('Error reprocessing assessment:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsReprocessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Career Explorer</h1>

      {!hasFetched && (
        <div className="text-center mt-10">
          <p className="mb-4 text-gray-600">
            Ready to see careers matched to your profile?
          </p>
          <Button onClick={handleFetchMatches} disabled={isPending || isLoading}>
            {isLoading ? 'Finding Matches...' : 'Find My Career Matches'}
          </Button>
        </div>
      )}

      {isLoading && hasFetched && (
         <p className="text-center text-gray-600 mt-10">Loading matches...</p>
      )}

      {error && hasFetched && (
         <div className="text-center text-red-600 mt-10">
           <div className="flex items-center justify-center gap-2 mb-4">
             <AlertCircle className="h-5 w-5" />
             <p>Error: {error}</p>
           </div>
           <Button 
             onClick={handleReprocessAssessment} 
             disabled={isReprocessing}
             variant="outline"
             className="mt-4"
           >
             {isReprocessing ? 'Reprocessing...' : 'Reprocess Assessment'}
           </Button>
         </div>
      )}

      {!isLoading && !error && hasFetched && (
        <>
          <h2 className="text-2xl font-semibold mb-4 text-center">Your Matches</h2>
          {matchedCareers.length > 0 ? (
            <CareerListClientComponent careers={matchedCareers} />
          ) : (
            <div className="text-center text-gray-600 mt-10">
              <p className="mb-4">No career matches found. Ensure you have completed the vocational assessment.</p>
              <Button 
                onClick={handleReprocessAssessment} 
                disabled={isReprocessing}
                variant="outline"
              >
                {isReprocessing ? 'Reprocessing...' : 'Reprocess Assessment'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
