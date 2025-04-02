'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Import useParams and useRouter
import { createClient } from '@/utils/supabase/client'; // Import client-side Supabase
import { updateUserProgressAfterQuiz } from '../actions';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

// Define types
interface QuizQuestion {
    id: string;
    text: string;
    options: { id: string; text: string }[];
    correct_option_id: string;
    explanation?: string | null;
}

// Define the database question type (needed for mapping)
interface DbQuizQuestion {
  id: string;
  quiz_id: string;
  question_order: number;
  question_text: string;
  correct_answer?: string;
  options: { value: string; text: string }[];
}

// Map database question format to client format (moved inside or imported)
function mapDatabaseQuestionToClientFormat(dbQuestion: DbQuizQuestion): QuizQuestion {
  return {
    id: dbQuestion.id,
    text: dbQuestion.question_text,
    options: dbQuestion.options.map((opt) => ({
      id: opt.value,
      text: opt.text
    })),
    correct_option_id: dbQuestion.correct_answer || '',
    explanation: null // Or fetch explanation if available
  };
}


// No props needed anymore, component fetches its own data
export default function QuizClientComponent() {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [quizId, setQuizId] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [isPending, startTransition] = useTransition();
    const [submitError, setSubmitError] = useState<string | null>(null); // Renamed error state for clarity

    const params = useParams();
    const router = useRouter();
    const supabase = createClient(); // Initialize client Supabase

    useEffect(() => {
        const loadQuizData = async () => {
            setIsLoading(true);
            setFetchError(null);

            // 1. Get Quiz ID from URL
            const idFromParams = params.quizId;
            if (!idFromParams || typeof idFromParams !== 'string') {
                setFetchError("Invalid Quiz ID.");
                setIsLoading(false);
                return;
            }
            setQuizId(idFromParams);

            // 2. Get User Session
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                console.warn("Quiz page accessed without user, redirecting.");
                router.push(`/login?message=Please log in to take the quiz&redirectTo=/quiz/${idFromParams}`);
                // Don't set loading false here, let redirect happen
                return;
            }
            setUserId(user.id);

            // 3. Fetch Quiz Questions
            const { data: dbQuestions, error: questionsError } = await supabase
                .from('quiz_questions')
                .select('*')
                .eq('quiz_id', idFromParams)
                .order('question_order', { ascending: true });

            if (questionsError) {
                console.error('Error fetching quiz questions:', questionsError.message);
                setFetchError('Error loading quiz questions.');
                setIsLoading(false);
                return;
            }

            if (!dbQuestions || dbQuestions.length === 0) {
                setFetchError('Quiz not found or has no questions.');
                setIsLoading(false);
                // Consider redirecting or showing a 'not found' message
                return;
            }

            // 4. Map and set questions
            const mappedQuestions = (dbQuestions as DbQuizQuestion[]).map(mapDatabaseQuestionToClientFormat);
            setQuestions(mappedQuestions);
            setIsLoading(false);
        };

        loadQuizData();
    }, [params, router, supabase]); // Add dependencies

    // Return loading/error states before trying to access questions[index]
    if (isLoading) {
        return <div>Loading quiz...</div>;
    }

    if (fetchError) {
        return <div className="p-6 text-center text-red-500">{fetchError}</div>;
    }

    // Ensure questions array is not empty before accessing
     if (questions.length === 0) {
        return <div className="p-6 text-center text-gray-500">No questions available for this quiz.</div>;
    }

    const currentQuestion = questions[currentQuestionIndex];
     // Ensure currentQuestion is defined before proceeding (should be covered by above checks, but good practice)
    if (!currentQuestion) {
        console.error("Error: currentQuestion is undefined despite checks.");
        return <div className="p-6 text-center text-red-500">An unexpected error occurred loading the question.</div>;
    }


    const handleAnswerChange = (questionId: string, selectedOptionId: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: selectedOptionId }));
    };

    const handleSubmit = () => {
        if (!userId || !quizId) {
             setSubmitError("User or Quiz ID missing, cannot submit.");
             return;
        }

        let calculatedScore = 0;
        questions.forEach(q => {
            const isCorrect = answers[q.id] === q.correct_option_id;
            if (isCorrect) {
                calculatedScore++;
            }
        });
        setScore(calculatedScore);
        setSubmitted(true);
        setSubmitError(null); // Clear previous errors

        // Trigger progress update using server action
        startTransition(async () => {
            // Ensure userId and quizId are available before calling action
            if (userId && quizId) {
                const result = await updateUserProgressAfterQuiz(userId, quizId);
                if (result.error) {
                    setSubmitError(`Failed to update progress: ${result.error}`);
                } else {
                    console.log("Quiz progress updated successfully:", result);
                    // Optionally use returned points/level/badges for immediate UI feedback
                }
            } else {
                 setSubmitError("Cannot update progress: User or Quiz ID is missing.");
                // Optionally use returned points/level/badges for immediate UI feedback
            }
        });
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // If on last question, trigger submit
            handleSubmit();
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    if (!currentQuestion) {
        return <div>Loading quiz...</div>; // Or handle quiz not found
    }

    if (submitted) {
        // Display results summary
        const successRate = (score / questions.length) * 100;
        // Use const for successMsg
        const successMsg = successRate >= 70 ? "Great job!" : "Keep practicing!";

        return (
            <Card className="w-full max-w-lg mx-auto mt-10">
                <CardHeader className="text-center">
                    <CardTitle>Quiz Complete!</CardTitle>
                    <CardDescription>{successMsg}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-xl font-semibold">Your Score: {score} / {questions.length} ({successRate.toFixed(0)}%)</p>
                    {/* Optionally add a button to review answers or go back to dashboard */}
                    <Button onClick={() => window.location.reload()} className="mt-6 inline-flex items-center gap-1"> {/* Added flex items-center gap */}
                       {/* <ion-icon name="refresh-outline"></ion-icon> */} {/* Ion-icon removed temporarily */}
                       Retake Quiz
                    </Button>
                     <Button variant="link" onClick={() => window.history.back()} className="mt-6 ml-4 inline-flex items-center gap-1"> {/* Added flex items-center gap */}
                       {/* <ion-icon name="arrow-back-outline"></ion-icon> */} {/* Ion-icon removed temporarily */}
                       Back
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Display current question
    return (
        <Card className="w-full max-w-lg mx-auto mt-10">
            <CardHeader>
                <CardTitle>Question {currentQuestionIndex + 1} / {questions.length}</CardTitle>
                <CardDescription>{currentQuestion.text}</CardDescription>
            </CardHeader>
            <CardContent>
                <RadioGroup
                    value={answers[currentQuestion.id] || ''}
                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                    className="space-y-3"
                >
                    {currentQuestion.options.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.id} id={`${currentQuestion.id}-${option.id}`} />
                            <Label htmlFor={`${currentQuestion.id}-${option.id}`}>{option.text}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0 || isPending} className="inline-flex items-center gap-1"> {/* Added flex, items-center, gap */}
                    {/* <ion-icon name="arrow-back-outline"></ion-icon> */} {/* Ion-icon removed temporarily */}
                    Previous
                </Button>
                <Button onClick={handleNext} disabled={!answers[currentQuestion.id] || isPending} className="inline-flex items-center gap-1"> {/* Added flex, items-center, gap */}
                    {isPending ? 'Saving...' : (isLastQuestion ? 'Finish Quiz' : 'Next')}
                    {/* {!isLastQuestion && <ion-icon name="arrow-forward-outline" class="ml-1"></ion-icon>} */} {/* Ion-icon removed temporarily */}
                    {/* {isLastQuestion && <ion-icon name="checkmark-done-outline" class="ml-1"></ion-icon>} */} {/* Ion-icon removed temporarily */}
                </Button>
            </CardFooter>
            {submitError && <p className="p-4 text-center text-sm text-red-600">{submitError}</p>}
        </Card>
    );
}
