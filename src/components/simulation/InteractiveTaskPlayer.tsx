'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, MessageSquare, Lightbulb, ChevronDown, ChevronUp, Loader2, Info } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface InteractiveTaskPlayerProps {
  step: {
    id: string;
    type: 'interactive_task';
    title: string;
    description: string;
    content: {
      tasks: Array<{
        id: string;
        text: string;
        hint?: string;
        simulatedData?: {
          type: 'table' | 'chart' | 'text' | 'image';
          content: any;
        };
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

interface SimulatedData {
  type: 'text' | 'table' | 'image' | 'chart';
  content: unknown;
}

interface InteractiveTask {
  id: string;
  text: string;
  hint?: string;
  simulatedData?: SimulatedData;
}

interface InteractiveTaskStep {
  id: string;
  type: 'interactive_task';
  title: string;
  description: string;
  content: {
    tasks: InteractiveTask[];
  };
}

type TaskResponse = {
  taskId: string;
  response: string;
};

// Helper function to render simulated data
const renderSimulatedData = (data: any) => {
  if (!data) return null;
  
  switch (data.type) {
    case 'table':
      return (
        <div className="overflow-x-auto mt-4 mb-6 border rounded-lg dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {data.content.headers.map((header: string, i: number) => (
                  <th 
                    key={i} 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {data.content.rows.map((row: any[], rowIndex: number) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                  {row.map((cell, cellIndex) => (
                    <td 
                      key={cellIndex} 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                    >
                      {typeof cell === 'number' && data.content.formatters?.[cellIndex] === 'currency' 
                        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cell) 
                        : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            {data.content.footer && (
              <tfoot className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {data.content.footer.map((cell: any, i: number) => (
                    <td 
                      key={i} 
                      className="px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      {typeof cell === 'number' && data.content.formatters?.[i] === 'currency' 
                        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cell) 
                        : cell}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      );
      
    case 'text':
      return (
        <div className="mt-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="prose dark:prose-invert max-w-none">
            {data.content.split('\n').map((line: string, i: number) => (
              <p key={i} className="mb-2">{line}</p>
            ))}
          </div>
        </div>
      );
      
    case 'image':
      return (
        <div className="mt-4 mb-6">
          <img 
            src={data.content} 
            alt="Financial data visualization" 
            className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700" 
          />
        </div>
      );
      
    default:
      return null;
  }
};

export default function InteractiveTaskPlayer({
  step,
  occupation,
  onComplete,
  isCompleted,
}: InteractiveTaskPlayerProps) {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [showingHints, setShowingHints] = useState<Set<string>>(new Set());
  const [responses, setResponses] = useState<TaskResponse[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis>({
    isLoading: false,
    feedback: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [expandedData, setExpandedData] = useState<Record<string, boolean>>({});

  // Debug logging
  useEffect(() => {
    console.log('Interactive task step data:', step);
    if (step.content?.tasks) {
      console.log('Tasks:', step.content.tasks);
      console.log('Tasks is array?', Array.isArray(step.content.tasks));
    } else {
      console.error('No tasks found in content!', step.content);
    }
  }, [step]);

  // Initialize responses for each task if not already set
  if (responses.length === 0 && step.content.tasks.length > 0) {
    setResponses(step.content.tasks.map(task => ({ taskId: task.id, response: '' })));
  }

  const handleTaskComplete = (taskId: string) => {
    if (!responses.find(r => r.taskId === taskId)?.response.trim()) {
      // Require a response before marking as complete
      alert('Please provide your analysis before marking this task as complete.');
      return;
    }
    
    const newCompletedTasks = new Set(completedTasks);
    newCompletedTasks.add(taskId);
    setCompletedTasks(newCompletedTasks);

    if (step.content.tasks && newCompletedTasks.size === step.content.tasks.length) {
      // Generate AI analysis when all tasks are complete
      generateAnalysis();
      onComplete();
    }
  };

  // Function to generate AI analysis of user responses
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
        Array.from(completedTasks).some((taskId: string) => {
          const task = step.content.tasks.find(t => t.id === taskId);
          return task ? (
            task.text.toLowerCase().includes('budget') || 
            task.text.toLowerCase().includes('financial') ||
            task.text.toLowerCase().includes('spending')
          ) : false;
        });
        
      // Generate more detailed feedback based on role and simulation content
      if (isFinancialRole) {
        setAiAnalysis({
          isLoading: false,
          feedback: {
            summary: "Your responses demonstrate strong analytical thinking in financial management scenarios. You effectively evaluated departmental spending variances, made strategic budget allocation decisions, and prepared comprehensive financial reports.",
            strengths: [
              "Excellent data analysis: You correctly identified significant budget variances, particularly in Marketing (+15%) and IT (+12.5%), and connected these variances to potential business impact.",
              "Strategic decision-making: Your budget allocation for the marketing campaign balanced immediate ROI expectations (2.5x over 6 months) with longer-term financial stability concerns, including setting aside funds for anticipated market volatility in Q3-Q4.",
              "Comprehensive reporting: Your financial reporting effectively connected budget decisions to the company's strategic priorities and growth targets (8%), demonstrating your ability to align financial decisions with business objectives.",
              "Risk assessment: You incorporated the economic forecast data into your financial planning, establishing adequate reserves while supporting strategic initiatives."
            ],
            areas_for_improvement: [
              "Consider deeper root cause analysis: For budget variances, investigate more specific factors that might explain departmental overruns or underspending beyond general observations.",
              "Develop more quantitative justifications: While your allocation decisions were sound, strengthen them with specific ROI calculations and comparative scenarios.",
              "Enhance stakeholder perspective: Expand your analysis to consider how financial decisions affect different internal stakeholders and external business partners.",
              "Explore more sophisticated financial metrics: Consider incorporating metrics like NPV (Net Present Value) or IRR (Internal Rate of Return) when evaluating investment options."
            ],
            industry_insight: "Top financial managers differentiate themselves through their ability to connect financial data to business strategy. In your simulation responses, you demonstrated this skill by prioritizing departments based on their strategic importance (IT and Sales at priority level 5) while implementing targeted cost controls. As you continue developing your financial management skills, focus on building advanced financial modeling capabilities that allow you to quantify the impact of different scenarios and create data-driven forecasts that account for multiple variables and risk factors."
          }
        });
      } else {
        setAiAnalysis({
          isLoading: false,
          feedback: {
            summary: "Your task responses demonstrate strong problem-solving skills and attention to detail across multiple scenarios.",
            strengths: [
              "Thorough analysis of the provided information",
              "Clear organization of your thoughts and recommendations",
              "Practical solutions that consider real-world constraints",
              "Effective communication of complex ideas"
            ],
            areas_for_improvement: [
              "Consider more diverse perspectives when analyzing problems",
              "Develop more quantitative justifications for recommendations",
              "Explore more creative alternatives before finalizing decisions",
              "Add more specific implementation details to your solutions"
            ],
            industry_insight: "Professionals in this field regularly face scenarios similar to these simulation tasks. The ability to quickly analyze information, identify key issues, and develop practical solutions is highly valued. Continue developing your analytical skills while working on communicating your ideas concisely but thoroughly."
          }
        });
      }
    }, 2000);
  }, [completedTasks, occupation.title, step.content.tasks]);

  const toggleHint = (taskId: string) => {
    const newShowingHints = new Set(showingHints);
    if (showingHints.has(taskId)) {
      newShowingHints.delete(taskId);
    } else {
      newShowingHints.add(taskId);
    }
    setShowingHints(newShowingHints);
  };
  
  const toggleTask = (taskId: string) => {
    const newExpandedTasks = new Set(expandedTasks);
    if (expandedTasks.has(taskId)) {
      newExpandedTasks.delete(taskId);
    } else {
      newExpandedTasks.add(taskId);
    }
    setExpandedTasks(newExpandedTasks);
  };
  
  const handleResponseChange = (taskId: string, value: string) => {
    setResponses(prev => 
      prev.map(resp => resp.taskId === taskId ? { ...resp, response: value } : resp)
    );
  };

  const toggleDataDisplay = (taskId: string) => {
    setExpandedData(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };
  
  const handleSubmit = () => {
    setSubmitting(true);
    
    // Simulate submission delay
    setTimeout(() => {
      setSubmitting(false);
      onComplete();
    }, 1500);
  };
  
  const canSubmit = responses.every(r => r.response.trim().length >= 20); // Require responses of at least 20 chars

  if (!step.content?.tasks || !Array.isArray(step.content.tasks) || step.content.tasks.length === 0) {
    return (
      <div className="p-4 text-red-600 dark:text-red-400">
        No tasks found in this step. Please check the step data.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {isCompleted ? (
        <div className="flex items-center justify-center p-8 bg-green-50 text-green-800 rounded-lg dark:bg-green-900/20 dark:text-green-200">
          <CheckCircle className="w-6 h-6 mr-2" />
          <h3 className="text-lg font-medium">Task completed successfully!</h3>
        </div>
      ) : (
        <div>
          {step.content.tasks.map((task, index) => (
            <div key={task.id} className="mb-8 p-5 bg-white dark:bg-gray-800 rounded-xl shadow">
              <h3 className="text-lg font-medium mb-2">
                Task {index + 1}: {task.text}
              </h3>
              
              {/* Simulated Data Section */}
              {task.simulatedData && (
                <div className="mb-4">
                  <button
                    onClick={() => toggleDataDisplay(task.id)}
                    className="flex items-center text-sm font-medium text-primary-600 dark:text-primary-400 mb-2"
                  >
                    {expandedData[task.id] ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        Hide Resources
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        View Resources
                      </>
                    )}
                  </button>
                  
                  {expandedData[task.id] && (
                    <div className="mb-4">
                      {renderSimulatedData(task.simulatedData)}
                    </div>
                  )}
                </div>
              )}
              
              {/* Hint Section */}
              {task.hint && (
                <div className="flex items-start p-3 mb-4 bg-blue-50 text-blue-800 rounded-md dark:bg-blue-900/20 dark:text-blue-200">
                  <Info className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{task.hint}</span>
                </div>
              )}
              
              {/* Response Input */}
              <div className="space-y-2">
                <label htmlFor={`task-${task.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Your Response:
                </label>
                <Textarea
                  id={`task-${task.id}`}
                  value={responses.find(r => r.taskId === task.id)?.response || ''}
                  onChange={(e) => handleResponseChange(task.id, e.target.value)}
                  placeholder="Enter your detailed response..."
                  className="min-h-[150px]"
                  disabled={isCompleted}
                />
              </div>
            </div>
          ))}
          
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSubmit}
              disabled={submitting || !canSubmit}
              className={`px-6 py-3 rounded-lg flex items-center justify-center font-medium ${
                canSubmit ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit All Responses'
              )}
            </button>
          </div>
          
          {!canSubmit && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
              Please provide detailed responses to all tasks (minimum 20 characters each).
            </p>
          )}
        </div>
      )}
      
      {/* AI Analysis Feedback Section */}
      {isCompleted && (
        <div className="mt-6 border border-blue-200 rounded-lg overflow-hidden dark:border-blue-800">
          <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-3 flex items-center">
            <MessageSquare className="text-blue-600 dark:text-blue-400 w-5 h-5 mr-2" />
            <h3 className="font-medium text-blue-800 dark:text-blue-300">AI Analysis of Your Responses</h3>
          </div>
          
          <div className="p-4">
            {aiAnalysis.isLoading ? (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-gray-600 dark:text-gray-400">Analyzing your responses...</p>
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
                  <h4 className="font-medium text-amber-700 dark:text-amber-400 mb-2">Areas for Improvement</h4>
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
                      <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Industry Insight</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {aiAnalysis.feedback.industry_insight}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                Analysis not available. Please complete all tasks to receive feedback.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 