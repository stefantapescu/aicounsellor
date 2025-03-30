'use client'

import React, { useState, useTransition, useEffect } from 'react'
// Restore original AI analysis action import
import { saveVocationalResponse, generateAndSaveAssessmentAnalysis } from './actions'
// Removed: import { generateAndSaveAssessmentProfile } from './actions'
import { useRouter } from 'next/navigation'
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

// Import data and types from the new file
import {
    allQuestions,
    sectionIntros,
    type AssessmentQuestion,
    type WarmupChoiceQuestion,
    type ScenarioChoiceQuestion,
    type LikertQuestion,
    type MiniChallengeQuestion,
    type ValueRankingQuestion,
    type TextareaQuestion,
    // Import the new types added in assessmentData.ts
    type AptitudeQuestion,
    type LearningStyleQuestion,
    type SectionId // Import the SectionId type as well
} from './assessmentData';

// Import the input components (no new ones needed for Phase 1 additions)
import MultipleChoiceInput from './components/MultipleChoiceInput';
import LikertInput from './components/LikertInput';
import MiniChallengeInput from './components/MiniChallengeInput';
import ValueRankingInput from './components/ValueRankingInput';
import TextareaInput from './components/TextareaInput';
import InterstitialPage from './components/InterstitialPage';
import StartPage from './components/StartPage'; // Import the StartPage component


interface AssessmentClientComponentProps {
  userId: string;
  // TODO: Add previousResponses prop to load saved state
}

// --- Main Component ---
export default function AssessmentClientComponent({ userId }: AssessmentClientComponentProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // Explicitly type the answers state
  const [answers, setAnswers] = useState<Record<string, number | string | string[]>>({});
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // Use SectionId for the saveStatus keys for better type safety
  const [saveStatus, setSaveStatus] = useState<Partial<Record<SectionId, 'idle' | 'saving' | 'saved' | 'error'>>>({});
  // New state for interstitial pages
  const [isShowingInterstitial, setIsShowingInterstitial] = useState(false);
  // Use SectionId for the nextSectionId state
  const [nextSectionId, setNextSectionId] = useState<SectionId | null>(null);
  // New state for the start page
  const [hasStarted, setHasStarted] = useState(false);


  const currentQuestion = allQuestions[currentQuestionIndex];
  const totalQuestions = allQuestions.length;

  // TODO: Load previous answers if available

  // Ensure handleInputChange has a consistent signature if possible, or use overloads if necessary
  // For now, keep it general, but sub-components will pass correctly typed values
  const handleInputChange = (questionId: string, value: number | string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setError(null); // Clear error on input change
  };

  // Function to save answers for a specific section
  // Use SectionId for the parameter type
  const triggerSaveSection = async (sectionIdToSave: SectionId) => {
     setSaveStatus(prev => ({ ...prev, [sectionIdToSave]: 'saving' }));
    setError(null);
    const sectionAnswers = Object.entries(answers)
      .filter(([key]) => allQuestions.find(q => q.id === key)?.sectionId === sectionIdToSave)
      .reduce((acc, [key, value]) => { acc[key] = value; return acc; }, {} as Record<string, number | string | string[]>);
    if (Object.keys(sectionAnswers).length === 0) {
      console.log(`No answers to save for section ${sectionIdToSave}`);
      setSaveStatus(prev => ({ ...prev, [sectionIdToSave]: 'idle' }));
      return true;
    }
    const result = await saveVocationalResponse({ userId, sectionId: sectionIdToSave, responseData: sectionAnswers });
    if (result.error) {
      setError(`Failed to save ${sectionIdToSave} section: ${result.error}`);
      setSaveStatus(prev => ({ ...prev, [sectionIdToSave]: 'error' }));
      return false;
    } else {
      console.log(`${sectionIdToSave} section saved. Points: ${result.pointsAwarded}, New Badges: ${result.newBadges?.map(b => b.name).join(', ')}`);
      setSaveStatus(prev => ({ ...prev, [sectionIdToSave]: 'saved' }));
      return true;
    }
  };

  const handleNext = () => {
    console.log(`handleNext called. Current Index: ${currentQuestionIndex}, Current Section: ${currentQuestion.sectionId}, QID: ${currentQuestion.id}`); // Log entry + QID
    if (currentQuestionIndex < totalQuestions - 1) {
      const nextQuestion = allQuestions[currentQuestionIndex + 1];
      console.log(`Next Index: ${currentQuestionIndex + 1}, Next Section: ${nextQuestion.sectionId}, QID: ${nextQuestion.id}`); // Log next question info + QID

      // Check if moving to a new section
      if (nextQuestion.sectionId !== currentQuestion.sectionId) {
        console.log(`Section change detected: ${currentQuestion.sectionId} -> ${nextQuestion.sectionId}. Triggering save and interstitial.`); // Log section change
        startTransition(async () => {
          const saveSuccess = await triggerSaveSection(currentQuestion.sectionId);
          if (saveSuccess) {
            // Show interstitial instead of directly advancing index
            setNextSectionId(nextQuestion.sectionId);
            setIsShowingInterstitial(true);
            setError(null);
          } else {
            // Error handled within triggerSaveSection by setting setError
            console.error("Save failed, not showing interstitial.");
          }
        });
      } else {
        console.log(`Staying in section ${currentQuestion.sectionId}. Advancing index.`); // Log staying in section
        // Still within the same section, just advance index
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setError(null); // Clear error on navigation
      }
    } else {
        console.log("Already at the last question."); // Log end condition
    }
  };

  // New handler for the interstitial page button
  const handleContinueFromInterstitial = () => {
    if (nextSectionId) {
      // Find the index of the first question of the next section
      const nextSectionStartIndex = allQuestions.findIndex(q => q.sectionId === nextSectionId);
      if (nextSectionStartIndex !== -1) {
        setCurrentQuestionIndex(nextSectionStartIndex);
      } else {
        console.error("Could not find start index for section:", nextSectionId);
        // Fallback or error handling needed? For now, just stay put.
      }
      setIsShowingInterstitial(false);
      setNextSectionId(null);
      setError(null);
    }
  };

  const handleStartAssessment = () => {
    setHasStarted(true);
  };

  const handlePrevious = () => {
    // Prevent going back from the first question (index 0)
    if (currentQuestionIndex > 0) {
        // Simply decrement the index when going back.
        // No interstitial needed when moving backward.
        setCurrentQuestionIndex(currentQuestionIndex - 1);
        setError(null); // Clear error on navigation
    }
    // Do nothing if on the first question
  };

  const handleFinish = () => {
     startTransition(async () => {
        // 1. Save the raw answers for the final section
        const saveSuccess = await triggerSaveSection(currentQuestion.sectionId);
        if (saveSuccess) {
            // 2. Trigger the new analysis and profile generation/saving function
            // 2. Trigger the AI analysis generation and saving function
            console.log("Triggering AI assessment analysis...");
            const analysisResult = await generateAndSaveAssessmentAnalysis(userId); // Call the original AI action

            if (!analysisResult.success || analysisResult.error) { // Check analysis result
                console.error("AI Analysis failed:", analysisResult.error);
                // Redirect to results page with an error state
                router.push('/results?error=analysis_failed');
            } else {
                console.log("AI Analysis successful.");
                // Redirect to the main results page upon success
                router.push('/results'); // Results page will fetch the saved AI text
            }
        } else {
            console.error("Final save failed, not triggering analysis/profile generation.");
            setError("Could not save the final answers. Please try again.");
        }
     });
  };

  // --- Render Input Area (Simplified using Sub-components) ---
  const renderQuestionInput = (question: AssessmentQuestion) => {
    const currentAnswer = answers[question.id];

    switch (question.inputType) {
      // Combine all multiple_choice types that use the same component
      case 'multiple_choice': // Covers Warmup, Aptitude, Learning Style
      case 'scenario_choice': // Covers Interests, some Skills
        // Use type guards or more specific casting if needed, but MultipleChoiceInput should be flexible
        return (
          <MultipleChoiceInput
            // Cast to a union of all possible types using this component
            question={question as WarmupChoiceQuestion | ScenarioChoiceQuestion | AptitudeQuestion | LearningStyleQuestion}
            currentAnswer={currentAnswer as string | undefined} // Answer is typically the option ID (string)
            handleInputChange={handleInputChange as (id: string, val: string) => void} // Ensure correct signature
            isPending={isPending}
          />
        );
      case 'likert':
        return (
          <LikertInput
            question={question as LikertQuestion}
            currentAnswer={currentAnswer as number | undefined}
            handleInputChange={handleInputChange as (id: string, val: number) => void} // Ensure correct signature
            isPending={isPending}
          />
        );
      case 'mini_challenge_text':
      case 'mini_challenge_textarea':
            return (
                <MiniChallengeInput
                    question={question as MiniChallengeQuestion}
                    currentAnswer={currentAnswer as string | undefined}
                    handleInputChange={handleInputChange as (id: string, val: string) => void}
                    isPending={isPending}
                />
            );
      case 'value_ranking':
          return (
            <ValueRankingInput
                question={question as ValueRankingQuestion}
                currentAnswer={currentAnswer as string[] | undefined}
                handleInputChange={handleInputChange as (id: string, val: string[]) => void}
                allAnswers={answers} // Pass all answers for dependency check
                isPending={isPending}
            />
          );
      case 'textarea':
        return (
          <TextareaInput
            question={question as TextareaQuestion}
            currentAnswer={currentAnswer as string | undefined}
            handleInputChange={handleInputChange as (id: string, val: string) => void}
            isPending={isPending}
          />
        );
      default:
        // Optional: Add exhaustive check for unhandled types during development
        // const _exhaustiveCheck: never = question;
        console.warn("Unhandled question input type:", question);
        return <p>Error: Unknown question type.</p>;
    }
  };

  // --- Render Progress Dots ---
  const renderProgressDots = () => {
    // This function remains the same as it doesn't depend on the removed data
    // ... (keep existing renderProgressDots logic)
     return (
      <div className="flex justify-center space-x-1.5">
        {allQuestions.map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-2 w-2 rounded-full transition-colors duration-300",
              index === currentQuestionIndex ? "bg-purple-600 dark:bg-purple-400 scale-125" : "bg-gray-300 dark:bg-gray-600"
            )}
          />
        ))}
      </div>
    );
  };

  // --- Main Return ---
  return (
    // Main container div
    <div className="relative max-w-2xl mx-auto rounded-xl border border-transparent bg-white p-1 shadow-xl dark:bg-gray-800
                    before:absolute before:-inset-1 before:block before:-z-10 before:rounded-[calc(theme(borderRadius.xl)+1px)]
                    before:bg-gradient-to-r before:from-blue-400 before:to-purple-600 dark:before:from-blue-600 dark:before:to-purple-800">

        {/* Header Section - Always visible */}
        <div className="mb-6 rounded-t-lg bg-gradient-to-r from-blue-400 to-purple-600 p-5 text-center dark:from-blue-600 dark:to-purple-800">
            <h2 className="text-xl font-semibold text-white tracking-wide">YOUNI's CAREER ASSESSMENT</h2>
        </div>

        {/* Content Area - Conditionally render StartPage OR the Assessment Flow */}
        {!hasStarted
            ? ( // If not started, render StartPage
                <div className="px-6 pb-6 md:px-8 md:pb-8">
                    <StartPage onStart={handleStartAssessment} />
                </div>
            )
            : ( // If started, render the main assessment content area
                <div className="px-6 pb-6 md:px-8 md:pb-8">
                    {/* Question/Interstitial Area */}
                    <div className="mb-8 min-h-[300px] md:min-h-[350px]">
                        {isShowingInterstitial && nextSectionId ? (
                            // Render Interstitial
                            <InterstitialPage
                                // Use SectionId type for safer access
                                sectionTitle={(nextSectionId as SectionId).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                introText={sectionIntros[nextSectionId as SectionId] || "Get ready for the next set of questions!"}
                                onContinue={handleContinueFromInterstitial}
                                isPending={isPending}
                            />
                        ) : (
                            // Render Current Question
                            <>
                                <Label className="block text-center text-lg font-medium text-gray-700 dark:text-gray-200 md:text-xl leading-tight mb-6">
                                    {currentQuestion.text}
                                </Label>
                                {renderQuestionInput(currentQuestion)}
                            </>
                        )}
                    </div>

                    {/* Error Display */}
                    {error && (
                        <p className="my-4 rounded bg-red-100 p-3 text-center text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                            {error}
                        </p>
                    )}
                    {/* Save Status Feedback - Use SectionId type */}
                    {saveStatus[currentQuestion.sectionId as SectionId] === 'saved' && !error && !isShowingInterstitial && (
                        <p className="my-2 text-xs text-green-600 dark:text-green-400 text-center">Progress saved.</p>
                    )}

                    {/* Progress Dots & Navigation - Only show when a question is visible */}
                    {!isShowingInterstitial && (
                        <>
                            <div className="my-8">
                                {renderProgressDots()}
                            </div>
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="outline"
                                    onClick={handlePrevious}
                                    disabled={currentQuestionIndex === 0 || isPending}
                                    className="gap-1 pl-2.5 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </Button>

                                {currentQuestionIndex < totalQuestions - 1 ? (
                                    <Button
                                        onClick={handleNext}
                                        disabled={isPending || answers[currentQuestion.id] === undefined}
                                        className="gap-1 pr-2.5 bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-700 dark:hover:bg-purple-800"
                                    >
                                        Next
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleFinish}
                                        disabled={isPending || answers[currentQuestion.id] === undefined}
                                        className="bg-pink-600 hover:bg-pink-700 text-white dark:bg-pink-700 dark:hover:bg-pink-800"
                                    >
                                        {isPending ? 'Finishing...' : 'Finish Assessment'}
                                        <Check className="ml-1 h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                </div> // Closes the main assessment content div
            )
        }
        {/* End of conditional rendering */}
    </div> // Closes the main container div
  );
}
