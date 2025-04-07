import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import SimulationStepNavigation from './SimulationStepNavigation';
import SimulationPlayerClientComponent from './SimulationPlayerClientComponent';
import { Loader2 } from 'lucide-react';
import SimulationErrorMessage from './SimulationErrorMessage';
import crypto from 'crypto';

type Props = {
  params: { 
    onetCode: string;
    scenarioId: string;
  };
  searchParams: { 
    step?: string;
    [key: string]: string | string[] | undefined 
  };
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const supabase = await createClient();
  const onetCode = params.onetCode;
  
  try {
    const { data: occupation, error: occupationError } = await supabase
      .from('occupations')
      .select('title')
      .eq('code', onetCode)
      .single();

    if (occupationError) throw occupationError;

    if (!occupation) {
      return {
        title: 'Career Simulation',
        description: 'Interactive career simulation',
      };
    }

    return {
      title: `${occupation.title} - Career Simulation`,
      description: `Experience a day in the life of a ${occupation.title} through this interactive simulation.`,
    };
  } catch (error) {
    console.error('Error fetching occupation for metadata:', error);
    return {
      title: 'Career Simulation',
      description: 'Interactive career simulation',
    };
  }
}

export default async function SimulationPlayerPage(props: Props) {
  const supabase = await createClient();
  // Await both params and searchParams
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const onetCode = params.onetCode;
  const scenarioId = params.scenarioId;
  const stepParam = searchParams.step;
  const currentStepIndex = stepParam ? parseInt(stepParam as string) : 0;
  
  try {
    // Fetch occupation details
    const { data: occupation, error: occupationError } = await supabase
      .from('occupations')
      .select('title, description')
      .eq('code', onetCode)
      .single();

    if (occupationError) {
      console.error('Error fetching occupation:', occupationError);
      throw new Error('Failed to load occupation details');
    }

    if (!occupation) {
      return notFound();
    }

    // Get the authenticated user
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('Error fetching user:', userError);
      throw new Error('Failed to authenticate user');
    }

    if (!user) {
      throw new Error('Authentication required');
    }

    // Check if scenario exists in the database
    const { data: existingScenario, error: scenarioError } = await supabase
      .from('career_scenarios')
      .select('*')
      .eq('id', scenarioId)
      .single();

    console.log('Fetched scenario:', existingScenario ? 'Found' : 'Not found', 'Error:', scenarioError?.message || 'None');

    if (scenarioError && scenarioError.code !== 'PGRST116') { // Not found error
      console.error('Error fetching scenario:', scenarioError);
      throw new Error('Failed to check scenario existence');
    }

    // Get or create user progress
    let userProgress;
    if (existingScenario) {
      const { data: progress, error: progressError } = await supabase
        .from('user_scenario_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('scenario_id', scenarioId)
        .single();

      console.log('User progress:', progress ? 'Found' : 'Not found', 'Error:', progressError?.message || 'None');

      if (progressError && progressError.code !== 'PGRST116') {
        console.error('Error fetching progress:', progressError);
        throw new Error('Failed to fetch progress');
      }

      if (!progress) {
        // Create new progress record for existing scenario
        const { data: newProgress, error: createError } = await supabase
          .from('user_scenario_progress')
          .insert([{
            id: crypto.randomUUID(),
            user_id: user.id,
            scenario_id: scenarioId,
            current_step: 0,
            completed: false,
            completed_steps: [],
            started_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString()
          }])
          .select()
          .single();

        console.log('Created new progress:', newProgress ? 'Success' : 'Failed', 'Error:', createError?.message || 'None');

        if (createError) {
          console.error('Error creating progress:', createError);
          throw new Error('Failed to create progress');
        }

        userProgress = newProgress;
      } else {
        userProgress = progress;
      }
    }

    // Get total steps for navigation
    const totalSteps = existingScenario?.steps?.length || 0;
    
    // Determine the correct step to display
    let displayStepIndex = currentStepIndex;
    let shouldRedirect = false;
    
    // If scenario exists but no step is specified, use step 0
    if (existingScenario && stepParam === undefined) {
      displayStepIndex = 0;
      shouldRedirect = true;
    }
    
    // Validate current step number
    if (displayStepIndex < 0 || (totalSteps > 0 && displayStepIndex >= totalSteps)) {
      displayStepIndex = 0;
      shouldRedirect = true;
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{occupation.title} Simulation</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Experience what it&apos;s like to work as a {occupation.title} through this interactive simulation.
          </p>
        </div>
        
        {!existingScenario ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg font-medium">Generating your personalized simulation...</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Our AI is creating an interactive scenario based on real-world {occupation.title} experiences.
            </p>
            <div className="w-full max-w-md mt-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                If this takes too long, you can try:
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="w-full px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                Refresh the page
              </button>
            </div>
          </div>
        ) : shouldRedirect ? (
          // Display a loading message instead of using redirect()
          <div className="flex flex-col items-center justify-center p-12 space-y-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg font-medium">Loading the correct step...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <SimulationStepNavigation
              currentStep={displayStepIndex}
              totalSteps={totalSteps}
              completedSteps={userProgress?.completed_steps || []}
              stepTypes={existingScenario.steps.map((step: { type: 'quiz' | 'interactive_task' | 'reflection' }) => step.type)}
              scenarioId={scenarioId}
              onetCode={onetCode}
            />

            <SimulationPlayerClientComponent
              simulation={existingScenario}
              occupation={{
                code: onetCode,
                title: occupation.title,
                description: occupation.description || ''
              }}
              completed_steps={userProgress?.completed_steps || []}
              currentStepIndex={displayStepIndex}
              totalSteps={totalSteps}
              scenarioId={scenarioId}
              onetCode={onetCode}
            />
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error in SimulationPlayerPage:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <SimulationErrorMessage errorMessage={error instanceof Error ? error.message : 'An unknown error occurred'} />
      </div>
    );
  }
} 