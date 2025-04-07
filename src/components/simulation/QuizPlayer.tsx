'use client';

import { useState, useEffect, useCallback } from 'react';
import { Check, X, ChevronRight, ChevronLeft, MessageSquare, Lightbulb } from 'lucide-react';

interface QuizPlayerProps {
  step: {
    id: string;
    type: 'quiz';
    title: string;
    description: string;
    content: {
      questions: Array<{
        id: string;
        text: string;
        options: string[];
        correctAnswer: number;
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

export default function QuizPlayer({
  step,
  occupation,
  onComplete,
  isCompleted,
}: QuizPlayerProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis>({
    isLoading: false,
    feedback: null
  });
  
  // Debug logging
  useEffect(() => {
    console.log('Quiz step data:', step);
    console.log('Quiz content:', step.content);
    if (step.content?.questions) {
      console.log('Quiz questions:', step.content.questions);
      console.log('Questions is array?', Array.isArray(step.content.questions));
    } else {
      console.error('No questions found in content!', step.content);
    }
  }, [step]);

  // Watch for changes to selectedAnswers to ensure UI updates
  useEffect(() => {
    const currentQuestion = step.content.questions[currentQuestionIndex];
    if (currentQuestion) {
      console.log(
        'Selected answer for current question:',
        currentQuestion.id,
        selectedAnswers[currentQuestion.id]
      );
    }
  }, [selectedAnswers, currentQuestionIndex, step.content.questions]);

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    console.log('Selected answer:', questionId, answerIndex);
    // Create a new object to ensure state change is detected
    const newSelectedAnswers = {
      ...selectedAnswers,
      [questionId]: answerIndex,
    };
    setSelectedAnswers(newSelectedAnswers);
    
    // Force re-render if this is the last question
    if (currentQuestionIndex === step.content.questions.length - 1) {
      console.log('Last question answered:', newSelectedAnswers);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
    
    // Check if all answers are correct
    const allCorrect = step.content.questions.every(
      (q) => selectedAnswers[q.id] === q.correctAnswer
    );

    if (allCorrect) {
      onComplete();
    }
    
    // Generate AI analysis based on quiz results
    generateAnalysis();
  };

  // Function to generate AI analysis based on quiz performance
  const generateAnalysis = useCallback(() => {
    setAiAnalysis({
      isLoading: true,
      feedback: null
    });
    
    // Calculate percentage of correct answers
    const correctCount = step.content.questions.filter(q => selectedAnswers[q.id] === q.correctAnswer).length;
    const totalQuestions = step.content.questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    
    // Determine performance level
    let performanceLevel = 'beginner';
    if (percentage >= 80) {
      performanceLevel = 'expert';
    } else if (percentage >= 60) {
      performanceLevel = 'intermediate';
    }
    
    // Identify question categories based on content
    const questionCategories = step.content.questions.map(q => {
      if (q.text.toLowerCase().includes('analys') || q.text.toLowerCase().includes('evaluat')) {
        return 'analytical';
      } else if (q.text.toLowerCase().includes('budget') || q.text.toLowerCase().includes('forecast')) {
        return 'budgeting';
      } else if (q.text.toLowerCase().includes('investment') || q.text.toLowerCase().includes('roi')) {
        return 'investment';
      } else if (q.text.toLowerCase().includes('risk') || q.text.toLowerCase().includes('compliance')) {
        return 'risk';
      } else {
        return 'general';
      }
    });
    
    // Calculate category performance
    const categoryPerformance: Record<string, { correct: number, total: number }> = {};
    questionCategories.forEach((category, index) => {
      if (!categoryPerformance[category]) {
        categoryPerformance[category] = { correct: 0, total: 0 };
      }
      categoryPerformance[category].total += 1;
      if (selectedAnswers[step.content.questions[index].id] === step.content.questions[index].correctAnswer) {
        categoryPerformance[category].correct += 1;
      }
    });
    
    // Find strengths and areas for improvement
    const strengths: string[] = [];
    const areasForImprovement: string[] = [];
    
    Object.entries(categoryPerformance).forEach(([category, performance]) => {
      const categoryPercentage = Math.round((performance.correct / performance.total) * 100);
      if (categoryPercentage >= 75) {
        strengths.push(category);
      } else {
        areasForImprovement.push(category);
      }
    });
    
    // Simulate API call delay
    setTimeout(() => {
      // Check if it's a financial manager simulation
      const isFinancialRole = 
        (typeof occupation.title === 'string' && 
        occupation.title.toLowerCase().includes('financial')) || 
        step.content.questions.some(q => 
          q.text.toLowerCase().includes('budget') || 
          q.text.toLowerCase().includes('financial') ||
          q.text.toLowerCase().includes('investment')
        );
      
      if (isFinancialRole) {
        setAiAnalysis({
          isLoading: false,
          feedback: {
            summary: `Your quiz performance demonstrates ${performanceLevel}-level knowledge of financial management concepts. You correctly answered ${correctCount} out of ${totalQuestions} questions (${percentage}%), showing ${percentage >= 70 ? 'strong' : 'developing'} understanding of key financial analysis principles.`,
            strengths: [
              strengths.includes('analytical') ? 
                "Financial Analysis: You demonstrated strong analytical abilities in identifying financial trends, interpreting variance data, and evaluating performance metrics." : 
                "Core Concepts: You have a solid foundation in essential financial management principles.",
              
              strengths.includes('budgeting') ? 
                "Budgeting & Forecasting: You excel at budget allocation decisions, understanding variance analysis, and implementing cost control measures." : 
                "Decision Making: You showed good judgment in selecting appropriate financial strategies for different scenarios.",
              
              strengths.includes('investment') ? 
                "Investment Analysis: You demonstrated strong skills in evaluating ROI, understanding opportunity costs, and making data-driven investment decisions." : 
                "Financial Terminology: You have a good grasp of professional financial terminology and concepts.",
              
              strengths.includes('risk') ? 
                "Risk Management: You showed excellent understanding of financial risk factors, compliance requirements, and mitigation strategies." : 
                `Performance: Your overall score of ${percentage}% demonstrates ${percentage >= 70 ? 'solid' : 'developing'} financial management knowledge.`
            ],
            areas_for_improvement: [
              areasForImprovement.includes('analytical') ? 
                "Financial Analysis: Work on strengthening your analytical skills in interpreting financial data, particularly variance analysis and performance metrics." : 
                "Conceptual Application: Practice applying theoretical concepts to complex real-world financial scenarios.",
              
              areasForImprovement.includes('budgeting') ? 
                "Budgeting & Forecasting: Focus on developing stronger budget allocation strategies and variance analysis techniques to improve decision-making." : 
                "Critical Thinking: Enhance your ability to evaluate multiple financial alternatives before making decisions.",
              
              areasForImprovement.includes('investment') ? 
                "Investment Analysis: Work on strengthening your understanding of ROI calculation, capital budgeting techniques, and investment evaluation methods." : 
                "Financial Modeling: Consider developing more advanced financial modeling skills to enhance your decision-making.",
              
              areasForImprovement.includes('risk') ? 
                "Risk Management: Focus on developing a stronger understanding of financial risk factors, compliance requirements, and mitigation strategies." : 
                "Continual Learning: Stay current with evolving financial regulations and industry best practices."
            ],
            industry_insight: `Financial management professionals at the ${performanceLevel} level typically combine strong analytical skills with strategic business perspective. ${
              performanceLevel === 'expert' ? 
                "Your exceptional quiz performance suggests you're developing the analytical foundation needed for senior financial roles. To continue advancing, focus on connecting financial analysis to strategic business objectives and developing more sophisticated financial modeling skills." : 
              performanceLevel === 'intermediate' ? 
                "Your solid quiz performance indicates good progress toward professional-level financial knowledge. To advance further, consider deepening your expertise in financial modeling, risk assessment, and connecting financial decisions to broader business strategy." : 
                "Your quiz results show you're building a foundation in financial management concepts. To continue developing, focus on strengthening core analytical skills, practice working with financial data, and study how financial decisions impact business outcomes."
            }`
          }
        });
      } else {
        setAiAnalysis({
          isLoading: false,
          feedback: {
            summary: `Your quiz results show you answered ${correctCount} out of ${totalQuestions} questions correctly (${percentage}%), demonstrating a ${percentage >= 70 ? 'solid' : 'developing'} understanding of key concepts in this field.`,
            strengths: [
              `You demonstrated good understanding in ${strengths.length > 0 ? strengths.join(', ') : 'multiple areas'}`,
              "Your responses showed thoughtful consideration of the options presented",
              "You successfully applied theoretical concepts to practical scenarios",
              `Your score of ${percentage}% indicates ${percentage >= 70 ? 'strong' : 'developing'} knowledge in this subject area`
            ],
            areas_for_improvement: [
              `Focus on strengthening your knowledge in ${areasForImprovement.length > 0 ? areasForImprovement.join(', ') : 'challenging topic areas'}`,
              "Review concepts where you selected incorrect answers",
              "Practice applying theoretical knowledge to more complex scenarios",
              "Consider exploring additional resources to deepen your understanding of key principles"
            ],
            industry_insight: `Professionals in this field typically combine theoretical knowledge with practical application skills. Your quiz performance indicates ${percentage >= 80 ? 'strong potential' : percentage >= 60 ? 'good progress' : 'a developing foundation'} in this area. Continue building both your knowledge base and practical skills to advance in this career path.`
          }
        });
      }
    }, 2000);
  }, [selectedAnswers, step.content.questions, occupation.title]);

  const isQuizComplete = step.content.questions && step.content.questions.every((q) => 
    selectedAnswers[q.id] !== undefined
  );

  const handleNextQuestion = () => {
    if (currentQuestionIndex < step.content.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const getCorrectAnswersCount = () => {
    if (!step.content.questions) return 0;
    
    return step.content.questions.filter(
      (q) => selectedAnswers[q.id] === q.correctAnswer
    ).length;
  };

  if (!step.content?.questions) {
    return (
      <div className="p-4 text-red-600 dark:text-red-400">
        No quiz questions found in the step data.
      </div>
    );
  }

  // In results view, show all questions with their answers
  if (showResults) {
    const correctCount = getCorrectAnswersCount();
    const totalQuestions = step.content.questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    
    return (
      <div className="space-y-8">
        {/* Results summary */}
        <div className="text-center p-6 bg-gray-50 rounded-lg dark:bg-gray-800">
          <h3 className="text-xl font-semibold mb-2">Quiz Results</h3>
          <div className="text-3xl font-bold mb-2 text-primary-600 dark:text-primary-400">
            {correctCount} / {totalQuestions} correct
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            {percentage}% accuracy
          </div>
          
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-primary-600 h-2.5 rounded-full" 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            {percentage >= 70 
              ? 'Good job! You demonstrated solid knowledge.' 
              : 'Review the questions below to improve your knowledge.'}
          </div>
        </div>
        
        {/* All questions with answers */}
        <div className="space-y-6">
          {step.content.questions.map((question, index) => {
            const selectedAnswer = selectedAnswers[question.id];
            const isCorrect = selectedAnswer === question.correctAnswer;
            
            return (
              <div key={question.id} className={`p-4 border rounded-lg ${
                isCorrect 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                  : 'border-red-500 bg-red-50 dark:bg-red-900/20'
              }`}>
                <div className="flex items-start mb-2">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                    isCorrect 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400' 
                      : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                  }`}>
                    {isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {index + 1}. {question.text}
                  </p>
                </div>
                
                <div className="ml-8 space-y-2">
                  {question.options.map((option, optIndex) => {
                    let optionClassName = 'p-3 rounded-md text-sm ';
                    
                    if (optIndex === question.correctAnswer) {
                      optionClassName += 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
                    } else if (optIndex === selectedAnswer) {
                      optionClassName += 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
                    } else {
                      optionClassName += 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
                    }
                    
                    return (
                      <div key={optIndex} className={optionClassName}>
                        {option}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* AI Analysis Feedback Section */}
        <div className="border border-blue-200 rounded-lg overflow-hidden dark:border-blue-800">
          <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-3 flex items-center">
            <MessageSquare className="text-blue-600 dark:text-blue-400 w-5 h-5 mr-2" />
            <h3 className="font-medium text-blue-800 dark:text-blue-300">AI Analysis of Your Knowledge</h3>
          </div>
          
          <div className="p-4">
            {aiAnalysis.isLoading ? (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-gray-600 dark:text-gray-400">Analyzing your quiz results...</p>
              </div>
            ) : aiAnalysis.feedback ? (
              <div className="space-y-4">
                <p className="text-gray-800 dark:text-gray-200">{aiAnalysis.feedback.summary}</p>
                
                <div>
                  <h4 className="font-medium text-green-700 dark:text-green-400 mb-2 flex items-center">
                    <Check className="w-4 h-4 mr-1" /> 
                    Strengths
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {aiAnalysis.feedback.strengths.map((strength, i) => (
                      <li key={i} className="text-gray-700 dark:text-gray-300">{strength}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-amber-700 dark:text-amber-400 mb-2">Recommendations</h4>
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
                      <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Professional Insight</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {aiAnalysis.feedback.industry_insight}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                Analysis not available. Please complete the quiz to receive feedback.
              </p>
            )}
          </div>
        </div>
        
        {/* Retry button if not completed */}
        {!isCompleted && (
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg shadow-md mt-6">
            <button
              onClick={() => {
                setShowResults(false);
                setSelectedAnswers({});
                setCurrentQuestionIndex(0);
              }}
              className="w-full px-8 py-4 text-base font-bold rounded-md bg-green-600 text-white hover:bg-green-700 shadow-md border-2 border-green-700 dark:bg-green-600 dark:border-green-500 outline outline-2 outline-offset-2 outline-green-300 dark:outline-green-800"
            >
              Try Again
            </button>
          </div>
        )}
        
        {/* Completion message */}
        {isCompleted && (
          <div className="p-4 bg-green-50 text-green-800 rounded-lg dark:bg-green-900/20 dark:text-green-200">
            <div className="flex items-center mb-2">
              <Check className="w-5 h-5 mr-2" />
              <span className="font-medium">Quiz completed successfully!</span>
            </div>
            <p>You can now move on to the next step.</p>
          </div>
        )}
      </div>
    );
  }

  // In regular view, show one question at a time
  const currentQuestion = step.content.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === step.content.questions.length - 1;
  const selectedAnswer = selectedAnswers[currentQuestion?.id];
  const isCurrentQuestionAnswered = selectedAnswer !== undefined;

  return (
    <div className="space-y-8 relative pb-20">
      {/* Question progress indicator */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Question {currentQuestionIndex + 1} of {step.content.questions.length}
        </span>
        <div className="flex items-center space-x-1">
          {step.content.questions.map((_, index) => (
            <div 
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentQuestionIndex 
                  ? 'bg-primary-600 dark:bg-primary-400' 
                  : selectedAnswers[step.content.questions[index]?.id] !== undefined
                    ? 'bg-green-500 dark:bg-green-400'
                    : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Current question */}
      {currentQuestion && (
        <div className="space-y-4">
          <p className="font-medium text-lg text-gray-900 dark:text-white">
            {currentQuestion.text}
          </p>
          <div className="space-y-2">
            {Array.isArray(currentQuestion.options) && currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const optionClassName = 
                'flex items-center w-full p-4 text-left border rounded-lg transition-colors cursor-pointer ' +
                (isSelected
                  ? 'border-primary-500 bg-primary-100 text-primary-900 font-medium dark:bg-primary-900/30 dark:text-primary-100 dark:border-primary-400'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800/50');

              return (
                <div 
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                  className={optionClassName}
                >
                  <div className={`flex-shrink-0 w-6 h-6 mr-3 border-2 rounded-full flex items-center justify-center ${
                    isSelected 
                      ? 'border-primary-600 bg-white dark:border-primary-400 dark:bg-gray-800' 
                      : 'border-gray-400 bg-white dark:border-gray-400 dark:bg-gray-800'
                  }`}>
                    {isSelected && (
                      <div className="w-3 h-3 rounded-full bg-primary-600 dark:bg-primary-400"></div>
                    )}
                  </div>
                  <span className={isSelected ? 'font-medium' : ''}>{option}</span>
                </div>
              );
            })}
          </div>

          {/* Selected answer indicator */}
          {isCurrentQuestionAnswered && (
            <div className="mt-2 text-sm text-primary-600 dark:text-primary-400">
              You selected option {selectedAnswer + 1}
            </div>
          )}
        </div>
      )}
      
      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-4 mt-8 border-t border-gray-200 dark:border-gray-700" style={{ minHeight: '60px' }}>
        <button
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
          className={`flex items-center px-3 py-1.5 rounded-md text-sm ${
            currentQuestionIndex === 0
              ? 'text-gray-400 cursor-not-allowed dark:text-gray-600'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>
        
        {!isLastQuestion ? (
          <button
            onClick={handleNextQuestion}
            disabled={!isCurrentQuestionAnswered}
            className={`flex items-center px-5 py-2 rounded-md text-sm ${
              isCurrentQuestionAnswered
                ? 'text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 font-medium'
                : 'text-gray-400 cursor-not-allowed dark:text-gray-600'
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        ) : (
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg shadow-md mt-4 mb-2">
            <button
              onClick={handleSubmit}
              disabled={!isCurrentQuestionAnswered}
              className={`px-8 py-4 text-base font-bold rounded-md w-full ${
                isCurrentQuestionAnswered
                  ? 'bg-green-600 !text-white hover:bg-green-700 shadow-md border-2 border-green-700 dark:bg-green-600 dark:border-green-500 outline outline-2 outline-offset-2 outline-green-300 dark:outline-green-800'
                  : 'bg-gray-300 border-2 border-gray-400 text-gray-700 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300'
              }`}
            >
              <span className="relative inline-flex items-center justify-center">
                <span className="z-10 !text-white dark:!text-white text-lg">Submit Quiz</span>
                {isCurrentQuestionAnswered && (
                  <span className="absolute -right-1 -top-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                )}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 