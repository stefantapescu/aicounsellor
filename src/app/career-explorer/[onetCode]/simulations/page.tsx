import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, Play, Star, Clock, ChevronRight } from 'lucide-react';

interface Props {
  params: { 
    onetCode: string;
  };
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const supabase = await createClient();
  const onetCode = params.onetCode;
  
  try {
    // Fetch occupation details
    const { data: occupation, error } = await supabase
      .from('occupations')
      .select('title')
      .eq('code', onetCode)
      .single();

    if (error) throw error;

    if (!occupation) {
      return {
        title: 'Career Simulations',
        description: 'Experience career simulations',
      };
    }

    return {
      title: `${occupation.title} - Career Simulations`,
      description: `Experience a day in the life of a ${occupation.title} through interactive simulations.`,
    };
  } catch (error) {
    console.error('Error fetching occupation for metadata:', error);
    return {
      title: 'Career Simulations',
      description: 'Experience career simulations',
    };
  }
}

export default async function SimulationsPage({ params }: Props) {
  const supabase = await createClient();
  // Use local variables to avoid direct access to dynamic params
  const onetCode = params.onetCode;
  
  try {
    // Get occupation details
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

    // Get available scenarios for this occupation
    const { data: scenarios, error: scenariosError } = await supabase
      .from('career_scenarios')
      .select('*')
      .eq('onet_code', onetCode);

    if (scenariosError) {
      console.error('Error fetching scenarios:', scenariosError);
      throw new Error('Failed to load available simulations');
    }

    let availableScenarios = scenarios || [];
    
    // If no scenarios exist, trigger the scenario generation
    if (availableScenarios.length === 0) {
      console.log("No scenarios found, triggering generation...");
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/scenarios/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            onetCode: onetCode,
            occupationTitle: occupation.title,
          }),
        });
        
        if (response.ok) {
          const newScenario = await response.json();
          console.log("Successfully generated new scenario:", newScenario.id);
          availableScenarios = [newScenario];
        } else {
          console.error("Failed to generate scenario:", await response.text());
        }
      } catch (error) {
        console.error("Error generating scenario:", error);
      }
    }

    // Get user progress for available scenarios
    let userProgress = [];
    if (availableScenarios.length > 0) {
      const { data: progress, error: progressError } = await supabase
        .from('user_scenario_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('scenario_id', availableScenarios.map(s => s.id));

      if (progressError) {
        console.error('Error fetching user progress:', progressError);
      } else {
        userProgress = progress || [];
      }
    }

    // Combine scenarios with user progress
    const scenariosWithProgress = availableScenarios.map(scenario => {
      const progress = userProgress.find(p => p.scenario_id === scenario.id);
      return {
        ...scenario,
        progress: progress || null,
        completion: progress ? Math.floor((progress.completed_steps.length / scenario.steps.length) * 100) : 0
      };
    });

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{occupation.title} Simulations</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Experience what it&apos;s like to work as a {occupation.title} through these interactive simulations.
          </p>
        </div>

        {scenariosWithProgress.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
            <div className="animate-pulse">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-primary-400" />
              <h3 className="text-xl font-medium mb-3">Creating Simulations...</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We&apos;re building interactive simulations for this career. Please check back in a moment.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {scenariosWithProgress.map((scenario) => (
              <div key={scenario.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start">
                    <div className="flex-grow">
                      <h3 className="text-xl font-semibold mb-1">{scenario.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{scenario.description}</p>
                      
                      <div className="flex flex-wrap gap-4 mb-6">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{scenario.estimated_duration_minutes} minutes</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Star className="w-4 h-4 mr-1" />
                          <span>{scenario.points_reward} points</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            scenario.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            scenario.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {scenario.difficulty_level.charAt(0).toUpperCase() + scenario.difficulty_level.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Progress bar if user has started */}
                      {scenario.completion > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-4">
                          <div 
                            className="bg-primary-600 h-2.5 rounded-full" 
                            style={{ width: `${scenario.completion}%` }}
                          ></div>
                        </div>
                      )}
                      
                      <Link
                        href={`/career-explorer/${onetCode}/simulations/${scenario.id}${
                          scenario.progress && scenario.progress.current_step > 0 
                            ? `?step=${scenario.progress.current_step}` 
                            : '?step=0'
                        }`}
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {scenario.progress ? 'Continue Simulation' : 'Start Simulation'}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error in SimulationsPage:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">Error Loading Simulations</h2>
          <p className="text-red-600 dark:text-red-300">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
} 