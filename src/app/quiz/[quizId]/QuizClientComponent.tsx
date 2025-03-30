'use client'

import React, { useState, useTransition } from 'react';
// Import the correct action for updating progress
import { updateUserProgressAfterQuiz } from '../actions';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define types based on expected data structure
interface QuizQuestion {
    id: string;
    text: string;
    options: { id: string; text: string }[];
    correct_option_id: string;
    explanation?: string | null;
}

interface QuizClientComponentProps {
    userId: string;
    quizId: string;
    questions: QuizQuestion[]; // Use the defined type
    // Add previous responses if needed for resuming quizzes
}

export default function QuizClientComponent({ userId, quizId, questions }: QuizClientComponentProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    // Use Record<string, string> for answers { questionId: selectedOptionId }
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<Record<string, boolean>>({}); // { questionId: isCorrect }

    const currentQuestion = questions[currentQuestionIndex];

    const handleAnswerChange = (questionId: string, selectedOptionId: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: selectedOptionId }));
        // Clear feedback for the current question if user changes answer after submitting (if allowed)
        if (submitted) {
            setFeedback(prev => ({ ...prev, [questionId]: undefined } as Record<string, boolean>));
        }
    };

    const handleSubmit = () => {
        let calculatedScore = 0;
        const newFeedback: Record<string, boolean> = {};
        questions.forEach(q => {
            const isCorrect = answers[q.id] === q.correct_option_id;
            newFeedback[q.id] = isCorrect;
            if (isCorrect) {
                calculatedScore++;
            }
        });
        setScore(calculatedScore);
        setFeedback(newFeedback);
        setSubmitted(true);
        setError(null); // Clear previous errors

        // Trigger progress update using server action
        startTransition(async () => {
            // Call the action that fetches responses and updates progress/badges
            const result = await updateUserProgressAfterQuiz(userId, quizId);
            if (result.error) {
                setError(`Failed to update progress: ${result.error}`);
            } else {
                console.log("Quiz progress updated successfully:", result);
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
                    <Button onClick={() => window.location.reload()} className="mt-6">Retake Quiz</Button> {/* Simple retake */}
                     <Button variant="link" onClick={() => window.history.back()} className="mt-6 ml-4">Back</Button>
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
                <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0 || isPending}>
                    Previous
                </Button>
                <Button onClick={handleNext} disabled={!answers[currentQuestion.id] || isPending}>
                    {isPending ? 'Saving...' : (isLastQuestion ? 'Finish Quiz' : 'Next')}
                </Button>
            </CardFooter>
            {error && <p className="p-4 text-center text-sm text-red-600">{error}</p>}
        </Card>
    );
}
