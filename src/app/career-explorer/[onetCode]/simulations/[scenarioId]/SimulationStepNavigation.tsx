'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, BookOpen, Brain, Briefcase, ArrowLeft, ArrowRight } from 'lucide-react';

interface SimulationStepNavigationProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  stepTypes: ('quiz' | 'interactive_task' | 'reflection')[];
  scenarioId: string;
  onetCode: string;
}

export default function SimulationStepNavigation({
  currentStep,
  totalSteps,
  completedSteps,
  stepTypes,
  scenarioId,
  onetCode,
}: SimulationStepNavigationProps) {
  const router = useRouter();
  const [steps, setSteps] = useState<{ 
    type: 'quiz' | 'interactive_task' | 'reflection';
    label: string;
    icon: React.ReactNode;
    isCompleted: boolean;
  }[]>([]);

  useEffect(() => {
    // Map step types to more descriptive labels and icons
    const mappedSteps = stepTypes.map((type, index) => {
      let label = '';
      let icon;

      switch (type) {
        case 'quiz':
          label = 'Knowledge Assessment';
          icon = <BookOpen className="w-5 h-5" />;
          break;
        case 'interactive_task':
          label = 'Job Simulation';
          icon = <Briefcase className="w-5 h-5" />;
          break;
        case 'reflection':
          label = 'Reflection';
          icon = <Brain className="w-5 h-5" />;
          break;
        default:
          label = `Step ${index + 1}`;
          icon = null;
      }

      return {
        type,
        label,
        icon,
        isCompleted: completedSteps.includes(
          // Getting the step ID is tricky here, since we only have types.
          // In a real implementation, you would pass the actual step IDs.
          `step-${index}`
        ),
      };
    });

    setSteps(mappedSteps);
  }, [stepTypes, completedSteps]);

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < totalSteps) {
      router.push(`/career-explorer/${onetCode}/simulations/${scenarioId}?step=${stepIndex}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200 dark:bg-primary-900 dark:text-primary-200">
              Progress
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-primary-600 dark:text-primary-400">
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200 dark:bg-gray-700">
          <div
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
          ></div>
        </div>
      </div>

      {/* Step Pills */}
      <div className="flex items-center justify-between">
        <div className="hidden md:flex items-center space-x-2 overflow-x-auto">
          {steps.map((step, index) => (
            <button
              key={index}
              onClick={() => goToStep(index)}
              disabled={index > currentStep + 1} // Can only go to next step or previous steps
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                index === currentStep
                  ? 'bg-primary-500 text-white'
                  : step.isCompleted
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : index <= currentStep + 1
                  ? 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
              }`}
            >
              <span className="flex-shrink-0">{step.icon}</span>
              <span className="hidden sm:inline">{step.label}</span>
              {step.isCompleted && (
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
              )}
            </button>
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => goToStep(currentStep - 1)}
            disabled={currentStep === 0}
            className={`p-2 rounded-full flex items-center justify-center ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
            aria-label="Previous step"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="md:hidden flex items-center text-sm font-medium">
            {steps[currentStep]?.label || `Step ${currentStep + 1}`}
          </div>

          <button
            onClick={() => goToStep(currentStep + 1)}
            disabled={currentStep === totalSteps - 1 || currentStep + 1 > steps.filter(s => s.isCompleted).length}
            className={`p-2 rounded-full flex items-center justify-center ${
              currentStep === totalSteps - 1 || currentStep + 1 > steps.filter(s => s.isCompleted).length
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
            aria-label="Next step"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
} 