'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QuizPlayer from '@/components/simulation/QuizPlayer';
import InteractiveTaskPlayer from '@/components/simulation/InteractiveTaskPlayer';
import ReflectionPlayer from '@/components/simulation/ReflectionPlayer';
import { CheckCircle2, Trophy } from 'lucide-react';

// --- Specific Types for Simulation Step Content ---

interface VideoStepContent {
  video_url: string;
  key_points?: string[];
  reflection_questions?: string[];
}

interface QuizQuestionOption {
  id: string;
  text: string;
  is_correct: boolean;
}

interface QuizQuestion {
  id: string;
  text: string;
  options: QuizQuestionOption[];
  correctAnswer?: number; // Keep optional here for internal processing
}

interface QuizStepContent {
  questions: QuizQuestion[];
  passing_score?: number;
}

// Type for simulated data expected by InteractiveTaskPlayer
interface SimulatedDataType {
  type: "text" | "table" | "image" | "chart";
  content: unknown; // Use unknown for flexibility
}

interface InteractiveTaskResource {
  title: string;
  url: string;
  type?: 'link' | 'document' | 'video';
}

interface InteractiveTask {
  id: string;
  text: string;
  hint?: string;
  simulatedData?: SimulatedDataType | unknown; // Allow unknown for flexibility during processing
}

interface InteractiveTaskStepContent {
  tasks: InteractiveTask[];
  task_description?: string; // Keep for processing if needed
  success_criteria?: string[];
  resources?: InteractiveTaskResource[];
}

interface ReflectionPrompt {
  id: string;
  text: string;
  minWords?: number;
  example?: string;
}

interface ReflectionStepContent {
  prompts: ReflectionPrompt[];
}

// Union type for step content
type SimulationStepContent =
  | VideoStepContent
  | QuizStepContent
  | InteractiveTaskStepContent
  | ReflectionStepContent
  | Record<string, unknown>;

// --- Updated Simulation Step Type ---
interface SimulationStep {
  id: string;
  type: 'quiz' | 'interactive_task' | 'reflection' | 'video';
  title: string;
  description: string;
  content: SimulationStepContent; // Use the union type here
  sequence_number?: number;
}

// Helper function to generate UUID
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Update Props to use the correct SimulationStep type
interface SimulationPlayerClientComponentProps {
  simulation: {
    id: string;
    title: string;
    description: string;
    steps: SimulationStep[]; // Use the updated SimulationStep type
  };
  occupation: {
    code: string;
    title: string;
    description: string;
  };
  completed_steps?: string[];
  currentStepIndex: number;
  totalSteps: number;
  scenarioId: string;
  onetCode: string;
}

export default function SimulationPlayerClientComponent({
  simulation,
  occupation,
  completed_steps = [],
  currentStepIndex,
  totalSteps,
  scenarioId,
  onetCode,
}: SimulationPlayerClientComponentProps) {
  const router = useRouter();
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(
    new Set(completed_steps)
  );

  useEffect(() => {
    console.log('Simulation data:', simulation);
    console.log('Current step index:', currentStepIndex);
    if (simulation?.steps) {
      simulation.steps.forEach((step, index) => {
        console.log(`Step ${index} (${step.type}):`, step);
      });
    }
  }, [simulation, currentStepIndex]);

  const handleStepComplete = async (stepId: string) => {
    setCompletedSteps((prev) => new Set([...prev, stepId]));
    try {
      const response = await fetch(`/api/simulations/${scenarioId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId, completed: true }),
      });
      if (!response.ok) throw new Error('Failed to update progress');
      console.log(`Successfully completed step ${stepId}`);
      setTimeout(() => {
        if (currentStepIndex < totalSteps - 1) {
          const nextStepUrl = `/career-explorer/${onetCode}/simulations/${scenarioId}?step=${currentStepIndex + 1}`;
          console.log(`Navigating to next step: ${nextStepUrl}`);
          router.push(nextStepUrl);
        } else {
          console.log('Final step completed!');
        }
      }, 500);
    } catch (error) {
      console.error('Error updating progress:', error);
      setCompletedSteps((prev) => {
        const newSet = new Set([...prev]);
        newSet.delete(stepId);
        return newSet;
      });
    }
  };

  if (!simulation?.steps?.length) {
    return <div className="p-4 text-center text-gray-600 dark:text-gray-400">No steps available.</div>;
  }

  const step = simulation.steps[currentStepIndex];
  if (!step) {
     return <div className="p-4 text-center text-red-600 dark:text-red-400">Current step not found.</div>;
  }

  const isCompleted = completedSteps.has(step.id);

  // --- Process Content with Type Safety ---
  const processContent = (step: SimulationStep): SimulationStep => {
    let processedContent: SimulationStepContent = {};
    if (typeof step.content === 'object' && step.content !== null) {
        processedContent = { ...step.content };
    } else {
        console.error('Step content is not an object:', step.content);
    }

    if (step.type === 'quiz') {
        const currentContent = processedContent as Partial<QuizStepContent>;
        let questions: QuizQuestion[] = [];
        if (Array.isArray(currentContent.questions)) {
            questions = currentContent.questions.map((q: unknown): QuizQuestion => {
                const questionData = q as Partial<QuizQuestion>;
                return {
                    id: questionData?.id || generateUUID(),
                    text: questionData?.text || 'Question not available',
                    options: Array.isArray(questionData?.options) ? questionData.options.map((opt: unknown): QuizQuestionOption => {
                        const optionData = opt as Partial<QuizQuestionOption>;
                        return {
                            id: optionData?.id || generateUUID(),
                            text: optionData?.text || 'Option not available',
                            is_correct: !!optionData?.is_correct,
                        };
                    }) : [],
                    correctAnswer: typeof questionData?.correctAnswer === 'number' ? questionData.correctAnswer : 0,
                };
            });
        } else {
             console.warn('Quiz questions is not an array or missing:', currentContent.questions);
        }
        processedContent = { questions, passing_score: currentContent.passing_score };
    } else if (step.type === 'interactive_task') {
        const currentContent = processedContent as Partial<InteractiveTaskStepContent>;
        let tasks: InteractiveTask[] = [];
        if (Array.isArray(currentContent.tasks)) {
            tasks = currentContent.tasks.map((t: unknown): InteractiveTask => {
                const taskData = t as Partial<InteractiveTask>;
                // Ensure simulatedData conforms to expected type or is undefined
                let simulatedData: SimulatedDataType | undefined = undefined;
                if (
                    typeof taskData?.simulatedData === 'object' &&
                    taskData.simulatedData !== null &&
                    'type' in taskData.simulatedData &&
                    'content' in taskData.simulatedData
                ) {
                     const sd = taskData.simulatedData as { type: unknown, content: unknown };
                     if (typeof sd.type === 'string' && ["text", "table", "image", "chart"].includes(sd.type)) {
                        simulatedData = sd as SimulatedDataType;
                     }
                }
                return {
                    id: taskData?.id || generateUUID(),
                    text: taskData?.text || 'Task not available',
                    hint: taskData?.hint,
                    simulatedData: simulatedData, // Assign typed or undefined
                };
            });
        } else {
             console.warn('Interactive tasks is not an array or missing:', currentContent.tasks);
        }
         // Add default data logic...
         if (occupation.title.toLowerCase().includes('financial') && tasks.length > 0) {
             if (tasks[0] && !tasks[0].simulatedData) {
                 tasks[0].simulatedData = { type: 'table', content: { /* ... default table data ... */ } };
                 tasks[0].text = "Analyze last year's financial spending...";
                 tasks[0].hint = "Look for departments with the highest variance...";
             }
             if (tasks[1] && !tasks[1].simulatedData) {
                 tasks[1].simulatedData = { type: 'text', content: `Available Budget Information:...` };
                 tasks[1].text = "Allocate budget for a new marketing campaign...";
                 tasks[1].hint = "Consider that you have $70,000...";
             }
             if (tasks[2] && !tasks[2].simulatedData) {
                 tasks[2].simulatedData = { type: 'table', content: { /* ... default table data ... */ } };
                 tasks[2].text = "Prepare a comprehensive report...";
                 tasks[2].hint = "Your report should connect financial decisions...";
             }
         }
        processedContent = { tasks, task_description: currentContent.task_description, success_criteria: currentContent.success_criteria, resources: currentContent.resources };
    } else if (step.type === 'reflection') {
        const currentContent = processedContent as Partial<ReflectionStepContent>;
        let prompts: ReflectionPrompt[] = [];
        if (Array.isArray(currentContent.prompts)) {
            prompts = currentContent.prompts.map((p: unknown): ReflectionPrompt => {
                const promptData = p as Partial<ReflectionPrompt>;
                return {
                    id: promptData?.id || generateUUID(),
                    text: promptData?.text || 'Prompt not available',
                    minWords: promptData?.minWords || 50,
                    example: promptData?.example,
                };
            });
        } else {
             console.warn('Reflection prompts is not an array or missing:', currentContent.prompts);
        }
         // Add default data logic...
         if (occupation.title.toLowerCase().includes('financial') && prompts.length === 0) {
             prompts = [ /* ... default reflection prompts ... */ ];
         }
        processedContent = { prompts };
    }

    return { ...step, content: processedContent };
  };

  const processedStep = processContent(step);
  console.log('Processed step content:', processedStep.content);


  // Render the step based on its type
  const renderStep = () => {
    switch (processedStep.type) {
      case 'quiz':
        const quizContent = processedStep.content as QuizStepContent;
        // Map questions to the structure expected by QuizPlayer
        const quizPlayerQuestions = (quizContent.questions || []).map(q => ({
            id: q.id,
            text: q.text,
            options: q.options.map(opt => opt.text), // Map to string array
            correctAnswer: q.correctAnswer ?? 0 // Provide default if undefined
        }));
        return (
          <QuizPlayer
            key={processedStep.id}
            step={{
              ...processedStep,
              type: 'quiz',
              content: {
                questions: quizPlayerQuestions,
                // passing_score: quizContent.passing_score // Omit passing_score if not expected
              },
            }}
            occupation={occupation}
            onComplete={() => handleStepComplete(processedStep.id)}
            isCompleted={isCompleted}
          />
        );
      case 'interactive_task':
        const taskContent = processedStep.content as InteractiveTaskStepContent;
         // Map tasks to the structure expected by InteractiveTaskPlayer
         const interactivePlayerTasks = (taskContent.tasks || []).map(t => ({
             id: t.id,
             text: t.text,
             hint: t.hint,
             simulatedData: t.simulatedData as SimulatedDataType | undefined // Assert type
         }));
        return (
          <InteractiveTaskPlayer
            key={processedStep.id}
            step={{
              ...processedStep,
              type: 'interactive_task',
              content: {
                tasks: interactivePlayerTasks, // Pass only tasks array
                // Omit other properties like task_description, success_criteria, resources
              },
            }}
            occupation={occupation}
            onComplete={() => handleStepComplete(processedStep.id)}
            isCompleted={isCompleted}
          />
        );
      case 'reflection':
        const reflectionContent = processedStep.content as ReflectionStepContent;
        return (
          <ReflectionPlayer
            key={processedStep.id}
            step={{
              ...processedStep,
              type: 'reflection',
              content: {
                prompts: reflectionContent.prompts || [],
              },
            }}
            occupation={occupation}
            onComplete={() => handleStepComplete(processedStep.id)}
            isCompleted={isCompleted}
          />
        );
      default:
        return (
          <div className="p-4 text-red-600 dark:text-red-400">
            Unknown or unsupported step type: {processedStep.type}
          </div>
        );
    }
  };

  // Show completion screen if the user has completed the last step
  if (isCompleted && currentStepIndex === totalSteps - 1) {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full dark:bg-green-900/30">
          <Trophy className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Congratulations!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          You&apos;ve completed the {occupation.title} simulation. You now have a better
          understanding of what it&apos;s like to work in this role.
        </p>
        <div className="pt-4">
          <button
            onClick={() => router.push(`/career-explorer/${onetCode}`)}
            className="px-6 py-3 text-base font-bold rounded-md bg-green-600 text-white hover:bg-green-700 shadow-md border-2 border-green-700 dark:bg-green-600 dark:border-green-500 outline outline-2 outline-offset-2 outline-green-300 dark:outline-green-800"
          >
            Return to Career Explorer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-100 text-primary-700 font-medium dark:bg-primary-900/40 dark:text-primary-400">
          {currentStepIndex + 1}
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {processedStep.title}
        </h2>
        {isCompleted && (
          <span className="ml-auto flex items-center text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Completed
          </span>
        )}
      </div>

      <div className="prose dark:prose-invert max-w-none mb-6">
        <p>{processedStep.description}</p>
      </div>

      {renderStep()}

      {/* Show step completion message and next button if step is completed but not the last one */}
      {isCompleted && currentStepIndex < totalSteps - 1 && (
        <div className="mt-8 p-4 bg-green-50 text-green-800 rounded-lg dark:bg-green-900/20 dark:text-green-200 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            <span>Step completed successfully!</span>
          </div>
          <button
            onClick={() => router.push(`/career-explorer/${onetCode}/simulations/${scenarioId}?step=${currentStepIndex + 1}`)}
            className="px-6 py-3 text-base font-bold rounded-md bg-green-600 text-white hover:bg-green-700 shadow-md border-2 border-green-700 dark:bg-green-600 dark:border-green-500 outline outline-2 outline-offset-2 outline-green-300 dark:outline-green-800"
          >
            Continue to Next Step
          </button>
        </div>
      )}
    </div>
  );
}
