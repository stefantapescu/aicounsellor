'use client';

import React, { useState } from 'react'; // Removed unused useEffect
// Removed unused Card components
import { Button } from "@/components/ui/button";
// Removed unused Badge import
// Removed unused Progress import
import { PlayCircle, Loader2 } from "lucide-react"; // Removed unused Clock, Star, Trophy
import { CareerScenario } from '@/types/simulations'; // Removed unused UserScenarioProgress
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface SimulationsClientComponentProps {
  occupation: {
    code: string;
    title: string;
    description: string;
  };
  scenarios: CareerScenario[];
  userProgress: Array<{
    scenario_id: string;
    completed: boolean;
    current_step: number;
    score?: number;
  }>;
}

export default function SimulationsClientComponent({
  occupation,
  scenarios: initialScenarios,
  userProgress,
}: SimulationsClientComponentProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [scenarios, setScenarios] = useState<CareerScenario[]>(initialScenarios);
  const router = useRouter();
  const supabase = createClient();
  // Removed unused error state: const [error, setError] = useState<string | null>(null);

  const filteredScenarios = selectedDifficulty === 'all'
    ? scenarios
    : scenarios.filter(s => s.difficulty_level === selectedDifficulty);

  const getScenarioProgress = (scenarioId: string) => {
    return userProgress.find(p => p.scenario_id === scenarioId);
  };

  const getDifficultyLabel = (level: 'beginner' | 'intermediate' | 'advanced') => {
    switch (level) {
      case 'beginner':
        return 'Beginner';
      case 'intermediate':
        return 'Intermediate';
      case 'advanced':
        return 'Advanced';
      default:
        return 'Unknown';
    }
  };

  const getDifficultyColor = (level: 'beginner' | 'intermediate' | 'advanced') => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleGenerateScenario = async () => {
    try {
      setIsGenerating(true);
      // Removed setError(null);

      // Check if there's already an unstarted scenario
      let existingScenarioId = null;
      try {
        const { data: existingScenarios, error: checkError } = await supabase
          .from('career_scenarios')
          .select('id')
          .eq('onet_code', occupation.code)
          .limit(1);

        if (!checkError && existingScenarios && existingScenarios.length > 0) {
          existingScenarioId = existingScenarios[0].id;
        }
      } catch (checkError) {
        // If the check fails (e.g., table doesn't exist yet), continue to generate
        console.warn('Failed to check existing scenarios:', checkError);
      }

      if (existingScenarioId) {
        // Scenario exists already, navigate to it
        setIsGenerating(false); // Stop loading before navigation
        router.push(`/career-explorer/${occupation.code}/simulations/${existingScenarioId}`);
        return;
      }

      // Generate new scenario
      const response = await fetch('/api/scenarios/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          onetCode: occupation.code,
          occupationTitle: occupation.title,
          occupationDescription: occupation.description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate scenario');
      }

      // Update local state with new scenario
      setScenarios(prev => [...prev, data]);
      
      // Set loading state to false before navigation to avoid UI getting stuck
      setIsGenerating(false);
      
      // Navigate to the scenario
      router.push(`/career-explorer/${occupation.code}/simulations/${data.id}`);
    } catch (error) { // Keep the error variable for the catch block scope
      console.error('Error handling scenario:', error);
      // Removed setError(...) call
      toast.error(error instanceof Error ? error.message : 'Failed to start simulation. Please try again.');
      setIsGenerating(false); // Ensure loading state is reset on error
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter by Difficulty
          </label>
          <select
            id="difficulty"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as 'all' | 'beginner' | 'intermediate' | 'advanced')}
            className="block w-full max-w-xs rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <Button
          onClick={handleGenerateScenario}
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting Simulation...
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4" />
              Try New Simulation
            </>
          )}
        </Button>
      </div>

      {filteredScenarios.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No scenarios available for this difficulty level yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredScenarios.map((scenario) => {
            const progress = getScenarioProgress(scenario.id);
            const isCompleted = progress?.completed;
            const currentStep = progress?.current_step || 0;
            const totalSteps = scenario.steps?.length || 0;
            const progressPercentage = totalSteps > 0 
              ? Math.round((currentStep / totalSteps) * 100)
              : 0;

            return (
              <div
                key={scenario.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getDifficultyColor(scenario.difficulty_level)}`}>
                    {getDifficultyLabel(scenario.difficulty_level)}
                  </span>
                </div>

                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                  {scenario.title}
                </h3>

                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  {scenario.description}
                </p>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {progressPercentage}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2 rounded-full bg-primary-600"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                <Link
                  href={`/career-explorer/${occupation.code}/simulations/${scenario.id}`}
                  className={`inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium ${
                    isCompleted
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : currentStep > 0
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {isCompleted
                    ? 'Review Completed Simulation'
                    : currentStep > 0
                    ? 'Continue Simulation'
                    : 'Start Simulation'}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
