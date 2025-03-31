'use client';

import React, { useState } from 'react'; // Import useState
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; // Added CardFooter
import { Badge } from '@/components/ui/badge';
import { type DreamscapesAnalysis } from '@/types/profile'; // Import shared type
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react'; // Import icons

interface DreamscapesResultsClientProps {
  analysis: DreamscapesAnalysis | null; // Initial analysis passed from server
}

const DreamscapesResultsClient: React.FC<DreamscapesResultsClientProps> = ({ analysis: initialAnalysis }) => {
  const [analysis, setAnalysis] = useState<DreamscapesAnalysis | null>(initialAnalysis); // State to hold current/updated analysis
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReanalyze = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/workshop/dreamscapes/analyze', {
        method: 'POST',
        // No body needed, API fetches latest response based on user auth
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to trigger analysis');
      }

      // Update the displayed analysis with the new result from the API response
      setAnalysis(result.analysis);
      alert('Re-analysis complete! Insights updated.'); // Simple feedback

    } catch (err: any) {
      console.error("Re-analysis error:", err);
      setError(`Failed to re-analyze: ${err.message}`);
      alert(`Error: ${err.message}`); // Simple error feedback
    } finally {
      setIsLoading(false);
    }
  };


  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Analysis Available Yet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            It seems the AI analysis for your Dreamscapes workshop hasn't run yet or no responses were found.
            Please ensure you have completed the workshop.
          </p>
          <div className="flex gap-2">
             <Button onClick={handleReanalyze} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Try Analyzing Now
             </Button>
             <Link href="/dashboard">
                 <Button variant="outline">Back to Dashboard</Button>
             </Link>
          </div>
           {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
        </CardContent>
      </Card>
    );
  }

  // Display Analysis Results
  return (
    <Card className="bg-white dark:bg-gray-800/50 shadow-md">
      {/* Removed CardHeader as title is on page */}
      <CardContent className="space-y-6 p-6">
        <div>
          <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-100">AI Summary</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border dark:border-gray-700">
            {analysis.summary || <span className="italic">No summary generated.</span>}
          </p>
        </div>

        {analysis.themes?.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-200">Identified Themes</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.themes.map((theme, i) => (
                <Badge key={`theme-${i}`} variant="secondary" className="text-sm">
                  {theme}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {analysis.values?.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-200">Core Values</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.values.map((value, i) => (
                <Badge key={`value-${i}`} variant="outline" className="text-sm border-purple-500 text-purple-700 dark:border-purple-400 dark:text-purple-300">
                  {value}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {analysis.interests?.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-200">Potential Interests</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.interests.map((interest, i) => (
                <Badge key={`interest-${i}`} variant="default" className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {analysis.motivators?.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-200">Key Motivators</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.motivators.map((motivator, i) => (
                <Badge key={`motivator-${i}`} variant="default" className="text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {motivator}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
       {/* Add Footer with Re-analyze button */}
       <CardFooter className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
            <Link href="/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
            </Link>
            <Button onClick={handleReanalyze} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Re-Analyze Responses
            </Button>
       </CardFooter>
       {error && <p className="text-red-500 mt-2 text-sm px-6 pb-4">{error}</p>} {/* Display error below footer */}
    </Card>
  );
};

export default DreamscapesResultsClient;
