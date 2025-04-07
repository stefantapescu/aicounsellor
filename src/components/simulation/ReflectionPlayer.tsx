'use client';

import { useState, useCallback, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, Lightbulb, CheckCircle } from 'lucide-react';

interface ReflectionPlayerProps {
  step: {
    id: string;
    type: 'reflection';
    title: string;
    description: string;
    content: {
      prompts: Array<{
        id: string;
        text: string;
        minWords?: number;
        example?: string;
      }>;
    };
  };
  occupation: {
    code: string;
    title: string;
    description: string;
  };
  onComplete: () => void;
  isCompleted: boolean;
}

interface AIAnalysis {
  isLoading: boolean;
  feedback: {
    summary: string;
    strengths: string[];
    areas_for_improvement: string[];
    industry_insight: string;
  } | null;
}

export default function ReflectionPlayer({
  step,
  occupation,
  onComplete,
  isCompleted,
}: ReflectionPlayerProps) {
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [showExamples, setShowExamples] = useState<Set<string>>(new Set());
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis>({
    isLoading: false,
    feedback: null
  });

  // Debug logging
  useEffect(() => {
    console.log('Reflection step data:', step);
    if (step.content?.prompts) {
      console.log('Prompts:', step.content.prompts);
      console.log('Prompts is array?', Array.isArray(step.content.prompts));
    } else {
      console.error('No prompts found in content!', step.content);
    }
  }, [step]);

  const countWords = useCallback((text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }, []);

  const handleResponseChange = (promptId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [promptId]: value,
    }));
  };

  const toggleExample = (promptId: string) => {
    setShowExamples((prev) => {
      const next = new Set(prev);
      if (next.has(promptId)) {
        next.delete(promptId);
      } else {
        next.add(promptId);
      }
      return next;
    });
  };

  const isPromptComplete = (promptId: string, minWords?: number) => {
    const response = responses[promptId] || '';
    if (!minWords) return response.trim().length > 0;
    return countWords(response) >= minWords;
  };

  const areAllPromptsComplete = step.content.prompts && Array.isArray(step.content.prompts) 
    ? step.content.prompts.every((prompt) => isPromptComplete(prompt.id, prompt.minWords))
    : false;

  const handleSubmit = () => {
    if (areAllPromptsComplete) {
      // Generate AI analysis of reflections
      generateAnalysis();
      onComplete();
    }
  };
  
  // Function to generate AI analysis of user reflections
  const generateAnalysis = useCallback(() => {
    setAiAnalysis({
      isLoading: true,
      feedback: null
    });
    
    // Simulate API call delay
    setTimeout(() => {
      // Check if it's a financial manager simulation
      const isFinancialRole = 
        (typeof occupation.title === 'string' && 
        occupation.title.toLowerCase().includes('financial')) || 
        (step.content.prompts.some((prompt) => 
          prompt.text.toLowerCase().includes('budget') || 
          prompt.text.toLowerCase().includes('financial') ||
          prompt.text.toLowerCase().includes('spending')
        ));
      
      if (isFinancialRole) {
        setAiAnalysis({
          isLoading: false,
          feedback: {
            summary: "Your reflections demonstrate sophisticated analytical thinking about financial management challenges and decision-making processes. You've effectively connected theoretical concepts to practical applications.",
            strengths: [
              "Strategic perspective: You thoughtfully analyzed how budget decisions balance immediate business needs with long-term financial stability, addressing the tension between growth initiatives and fiscal discipline.",
              "Contextual analysis: Your reflection on incomplete information showed strong critical thinking about data quality and how additional metrics would enhance decision-making, particularly in evaluating department performance.",
              "Stakeholder awareness: You demonstrated excellent understanding of how financial decisions impact different organizational stakeholders, including the downstream effects on operations, employee morale, and leadership priorities.",
              "Real-world application: Your connection between simulation exercises and actual workplace challenges showed practical understanding of financial management principles in authentic contexts."
            ],
            areas_for_improvement: [
              "Consider more quantitative frameworks: While your reflections were thoughtful, incorporating specific financial metrics and decision-making models would strengthen your analytical approach.",
              "Develop scenario planning perspectives: Expand your reflection on how different economic scenarios might impact financial strategies, particularly in volatile market conditions.",
              "Enhance communication strategies: Further develop your thoughts on effectively communicating complex financial decisions to non-financial stakeholders.",
              "Explore ethical dimensions: Consider incorporating ethical perspectives into your financial decision-making framework, especially when balancing competing priorities."
            ],
            industry_insight: "Leading financial professionals distinguish themselves through their ability to integrate quantitative analysis with strategic business thinking. Your reflections show promising development in this direction, particularly in how you evaluated the strategic priority framework against departmental budget allocations. As you continue developing your financial management expertise, focus on building more sophisticated financial modeling skills that allow you to quantify different decision outcomes while maintaining the strategic perspective you've already demonstrated."
          }
        });
      } else {
        setAiAnalysis({
          isLoading: false,
          feedback: {
            summary: "Your reflections show thoughtful consideration of the challenges and opportunities in this professional domain.",
            strengths: [
              "Excellent self-awareness regarding your professional strengths and areas for growth",
              "Thoughtful analysis of how theoretical concepts apply to practical situations",
              "Strong consideration of different stakeholder perspectives",
              "Clear connections between your personal experiences and professional requirements"
            ],
            areas_for_improvement: [
              "Consider how to quantify or measure success in these professional scenarios",
              "Explore more diverse approaches to the challenges you identified",
              "Develop more specific strategies for addressing the challenges you discussed",
              "Reflect on how industry trends might impact these professional practices in the future"
            ],
            industry_insight: "Professionals in this field regularly balance technical expertise with interpersonal skills. Your reflections indicate good awareness of this balance. Continue developing both analytical frameworks and communication strategies to excel in this career path."
          }
        });
      }
    }, 2000);
  }, [step.content.prompts, occupation.title]);

  if (!step.content?.prompts || !Array.isArray(step.content.prompts) || step.content.prompts.length === 0) {
    return (
      <div className="p-4 text-red-600 dark:text-red-400">
        No reflection prompts found in this step. Please check the step data.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="prose dark:prose-invert max-w-none">
        <p>{step.description}</p>
      </div>

      <div className="space-y-6">
        {step.content.prompts.map((prompt) => {
          const response = responses[prompt.id] || '';
          const wordCount = countWords(response);
          const isComplete = isPromptComplete(prompt.id, prompt.minWords);
          const showingExample = showExamples.has(prompt.id);

          return (
            <div key={prompt.id} className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <label
                  htmlFor={prompt.id}
                  className="block font-medium text-gray-900 dark:text-white"
                >
                  {prompt.text}
                  {prompt.minWords && (
                    <span className="ml-1 text-sm text-gray-500">
                      (minimum {prompt.minWords} words)
                    </span>
                  )}
                </label>
                {prompt.example && (
                  <button
                    type="button"
                    onClick={() => toggleExample(prompt.id)}
                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    {showingExample ? 'Hide Example' : 'Show Example'}
                  </button>
                )}
              </div>

              {showingExample && prompt.example && (
                <Alert>
                  <AlertDescription>
                    Example: {prompt.example}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <textarea
                  id={prompt.id}
                  value={response}
                  onChange={(e) => handleResponseChange(prompt.id, e.target.value)}
                  className="w-full min-h-[120px] p-3 border rounded-lg resize-y bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  placeholder="Type your response here..."
                />
                <div className="flex justify-between text-sm">
                  <span
                    className={`${
                      prompt.minWords && wordCount < prompt.minWords
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}
                  >
                    {wordCount} word{wordCount !== 1 ? 's' : ''}
                  </span>
                  {isComplete && (
                    <span className="text-green-600 dark:text-green-400">
                      ✓ Complete
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!areAllPromptsComplete || isCompleted}
        className={`w-full px-8 py-4 text-base font-bold rounded-md ${
          areAllPromptsComplete && !isCompleted
            ? 'bg-green-600 !text-white hover:bg-green-700 shadow-md border-2 border-green-700 dark:bg-green-600 dark:border-green-500 outline outline-2 outline-offset-2 outline-green-300 dark:outline-green-800'
            : 'bg-gray-300 border-2 border-gray-400 text-gray-700 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300'
        }`}
      >
        <span className="relative inline-flex items-center justify-center">
          <span className="z-10 !text-white dark:!text-white">Submit Reflections</span>
          {areAllPromptsComplete && !isCompleted && (
            <span className="absolute -right-1 -top-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          )}
        </span>
      </button>

      {isCompleted && (
        <div className="p-4 bg-green-50 text-green-800 rounded-lg dark:bg-green-900/20 dark:text-green-200">
          <div className="flex items-center mb-2">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Reflections submitted successfully!</span>
          </div>
          <p>You can now move on to the next step.</p>
        </div>
      )}
      
      {/* AI Analysis Feedback Section */}
      {isCompleted && (
        <div className="mt-6 border border-blue-200 rounded-lg overflow-hidden dark:border-blue-800">
          <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-3 flex items-center">
            <MessageSquare className="text-blue-600 dark:text-blue-400 w-5 h-5 mr-2" />
            <h3 className="font-medium text-blue-800 dark:text-blue-300">AI Analysis of Your Reflections</h3>
          </div>
          
          <div className="p-4">
            {aiAnalysis.isLoading ? (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-gray-600 dark:text-gray-400">Analyzing your reflections...</p>
              </div>
            ) : aiAnalysis.feedback ? (
              <div className="space-y-4">
                <p className="text-gray-800 dark:text-gray-200">{aiAnalysis.feedback.summary}</p>
                
                <div>
                  <h4 className="font-medium text-green-700 dark:text-green-400 mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" /> 
                    Strengths
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {aiAnalysis.feedback.strengths.map((strength, i) => (
                      <li key={i} className="text-gray-700 dark:text-gray-300">{strength}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-amber-700 dark:text-amber-400 mb-2">Areas for Development</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {aiAnalysis.feedback.areas_for_improvement.map((area, i) => (
                      <li key={i} className="text-gray-700 dark:text-gray-300">{area}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100 dark:border-blue-800 mt-4">
                  <div className="flex items-start">
                    <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Career Development Insight</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {aiAnalysis.feedback.industry_insight}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                Analysis not available. Please submit your reflections to receive feedback.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 