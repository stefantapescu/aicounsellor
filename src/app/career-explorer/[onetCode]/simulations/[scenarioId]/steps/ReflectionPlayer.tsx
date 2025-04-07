'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScenarioStep, ScenarioResponse, ReflectionContent, ReflectionResponse } from '@/types/simulations';
import { CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';

interface ReflectionPlayerProps {
  step: ScenarioStep;
  onComplete: (response: ReflectionResponse) => void;
  response?: ScenarioResponse;
  isCompleted: boolean;
}

export default function ReflectionPlayer({
  step,
  onComplete,
  response,
  isCompleted,
}: ReflectionPlayerProps) {
  const content = step.content as ReflectionContent;
  const previousResponse = response?.response_data as ReflectionResponse;

  const [responses, setResponses] = useState<{ prompt_index: number; text: string; }[]>(
    previousResponse?.responses || content.prompts.map((_, index) => ({ prompt_index: index, text: '' }))
  );

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getWordCountStatus = (text: string) => {
    const wordCount = countWords(text);
    const minWords = content.min_words_per_prompt;
    
    if (wordCount === 0) {
      return { color: 'text-gray-400', message: `Minimum ${minWords} words` };
    } else if (wordCount < minWords) {
      return { color: 'text-yellow-600', message: `${minWords - wordCount} more words needed` };
    } else {
      return { color: 'text-green-600', message: `${wordCount} words` };
    }
  };

  const handleResponseChange = (index: number, text: string) => {
    setResponses(prev => prev.map(r => 
      r.prompt_index === index ? { ...r, text } : r
    ));
  };

  const isComplete = () => {
    return responses.every(r => countWords(r.text) >= content.min_words_per_prompt);
  };

  const handleSubmit = () => {
    onComplete({
      responses: responses.map(r => ({
        ...r,
        word_count: countWords(r.text)
      })),
      completed: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-gray-600">
          Take some time to reflect on what you&apos;ve learned and experienced.
          Your responses help reinforce your understanding and provide valuable insights.
        </p>
      </div>

      {/* Example Responses */}
      {content.example_responses && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Example Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {content.example_responses.map((example, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{example}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reflection Prompts */}
      <div className="space-y-6">
        {content.prompts.map((prompt, index) => {
          const response = responses.find(r => r.prompt_index === index);
          const wordCountStatus = getWordCountStatus(response?.text || '');

          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-baseline">
                <label className="text-sm font-medium">
                  {index + 1}. {prompt}
                </label>
                <span className={`text-xs ${wordCountStatus.color}`}>
                  {wordCountStatus.message}
                </span>
              </div>
              <Textarea
                value={response?.text || ''}
                onChange={(e) => handleResponseChange(index, e.target.value)}
                placeholder="Write your reflection here..."
                className="min-h-[150px]"
                disabled={isCompleted}
              />
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      {!isCompleted && (
        <div className="space-y-4">
          {!isComplete() && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-600">
                Please ensure all responses meet the minimum word count requirement.
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!isComplete()}
            className="w-full"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Submit Reflections
          </Button>
        </div>
      )}

      {/* Completion Status */}
      {isCompleted && (
        <div className="flex items-center justify-center gap-2 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          <span>Reflections Submitted!</span>
        </div>
      )}
    </div>
  );
} 