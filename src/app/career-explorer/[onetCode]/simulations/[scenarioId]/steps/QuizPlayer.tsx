'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScenarioStep, ScenarioResponse, QuizContent, QuizResponse } from '@/types/simulations';
import { CheckCircle2, AlertCircle, ArrowRight, RotateCcw } from 'lucide-react';

interface QuizPlayerProps {
  step: ScenarioStep;
  onComplete: (response: QuizResponse) => void;
  response?: ScenarioResponse;
}

export default function QuizPlayer({
  step,
  onComplete,
  response,
}: QuizPlayerProps) {
  const content = step.content as QuizContent;
  const questions = content.questions || [];
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [attempts, setAttempts] = useState(0);
  
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  // Calculate if passed based on score threshold
  const passingThreshold = content.passing_score || 70; // Default to 70% if not specified
  const scorePercentage = (score / questions.length) * 100;
  const passed = scorePercentage >= passingThreshold;
  
  // Allow retry if failed and less than max attempts
  const maxAttempts = 2; // Allow 2 attempts
  const canRetry = !passed && attempts < maxAttempts - 1;

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach(question => {
      const selectedOption = question.options.find(opt => opt.id === selectedAnswers[question.id]);
      if (selectedOption?.is_correct) {
        correctAnswers++;
      }
    });
    return (correctAnswers / questions.length) * 100;
  };

  const handleAnswer = (questionId: string, optionId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setShowResults(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSubmit = () => {
    const score = calculateScore();
    const passed = score >= content.passing_score;
    
    if (passed || attempts >= 2) { // Complete if passed or max attempts reached
      onComplete({
        answers: Object.entries(selectedAnswers).map(([questionId, optionId]) => ({
          question_id: questionId,
          selected_option_id: optionId,
          is_correct: questions
            .find(q => q.id === questionId)
            ?.options.find(opt => opt.id === optionId)
            ?.is_correct || false
        })),
        score,
        completed: passed,
        attempts: attempts + 1
      });
    } else {
      setAttempts(prev => prev + 1);
      setShowResults(false);
      setCurrentQuestionIndex(0);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
  };

  if (showResults) {
    const score = calculateScore();
    const passed = score >= content.passing_score;
    const canRetry = !passed && attempts < 2;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Quiz Results</CardTitle>
            <CardDescription>You scored {score}/{questions.length} questions correctly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {passed ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  Congratulations! You&apos;ve passed the quiz!
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-600">
                  {canRetry 
                    ? "You didn&apos;t reach the passing score. You can try again!"
                    : "You&apos;ve reached the maximum number of attempts. The quiz will be marked as complete."}
                </AlertDescription>
              </Alert>
            )}

            {/* Show correct answers and explanations */}
            <div className="space-y-4 mt-6">
              <h3 className="font-semibold">Review Your Answers:</h3>
              {questions.map((question, index) => {
                const selectedOption = question.options.find(opt => opt.id === selectedAnswers[question.id]);
                const isCorrect = selectedOption?.is_correct;

                return (
                  <div key={question.id} className="p-4 rounded-lg border">
                    <p className="font-medium mb-2">
                      {index + 1}. {question.text}
                    </p>
                    <p className={`text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      Your answer: {selectedOption?.text}
                    </p>
                    {!isCorrect && (
                      <p className="text-sm text-green-600 mt-1">
                        Correct answer: {question.options.find(opt => opt.is_correct)?.text}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-2">
                      {selectedOption?.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            {canRetry && (
              <Button onClick={handleRetry} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
            {(!canRetry || passed) && (
              <Button onClick={handleSubmit}>
                Complete Quiz
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
        <span>Attempt {attempts + 1}/2</span>
      </div>

      {/* Question */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{currentQuestion.text}</h3>
        
        <RadioGroup
          value={selectedAnswers[currentQuestion.id]}
          onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
        >
          {currentQuestion.options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem value={option.id} id={option.id} />
              <Label htmlFor={option.id}>{option.text}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Navigation */}
      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!selectedAnswers[currentQuestion.id]}
        >
          {isLastQuestion ? 'Show Results' : 'Next Question'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 