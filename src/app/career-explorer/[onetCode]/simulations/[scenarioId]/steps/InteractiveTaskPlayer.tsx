'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScenarioStep, ScenarioResponse, InteractiveTaskContent, InteractiveTaskResponse } from '@/types/simulations';
import { CheckCircle2, FileText, Link as LinkIcon, Video, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface InteractiveTaskPlayerProps {
  step: ScenarioStep;
  onComplete: (response: InteractiveTaskResponse) => void;
  response?: ScenarioResponse;
  isCompleted: boolean;
}

export default function InteractiveTaskPlayer({
  step,
  onComplete,
  response,
  isCompleted,
}: InteractiveTaskPlayerProps) {
  const content = step.content as InteractiveTaskContent;
  const previousResponse = response?.response_data as InteractiveTaskResponse;

  const [submission, setSubmission] = useState<string | string[]>(
    previousResponse?.submission.content || (content.submission_type === 'multiple_choice' ? [] : '')
  );

  const getResourceIcon = (type: 'document' | 'video' | 'tool') => {
    switch (type) {
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'tool':
        return <LinkIcon className="h-4 w-4" />;
    }
  };

  const handleSubmit = () => {
    onComplete({
      submission: {
        type: content.submission_type,
        content: submission,
      },
      completed: true,
    });
  };

  const renderSubmissionForm = () => {
    switch (content.submission_type) {
      case 'text':
        return (
          <Textarea
            value={submission as string}
            onChange={(e) => setSubmission(e.target.value)}
            placeholder={content.submission_instructions}
            className="min-h-[200px]"
          />
        );
      case 'multiple_choice':
        return (
          <RadioGroup
            value={Array.isArray(submission) ? submission[0] : submission}
            onValueChange={(value) => setSubmission([value])}
          >
            {(content.submission_instructions as unknown as string[]).map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'file':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{content.submission_instructions}</p>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => {}}>
                Upload File
              </Button>
              {Array.isArray(submission) && submission.length > 0 && (
                <p className="text-sm text-gray-600">
                  {submission.length} file(s) uploaded
                </p>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Task Description */}
      <div className="prose dark:prose-invert max-w-none">
        <p>{content.task_description}</p>
      </div>

      {/* Success Criteria */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Success Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2">
            {content.success_criteria.map((criterion, index) => (
              <li key={index} className="text-gray-600">{criterion}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Helpful Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.resources.map((resource, index) => (
              <Link
                key={index}
                href={resource.url}
                target="_blank"
                className="flex items-center gap-2 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {getResourceIcon(resource.type)}
                <span className="flex-1">{resource.title}</span>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submission Form */}
      {!isCompleted && (
        <div className="space-y-4">
          <h3 className="font-medium">Your Submission</h3>
          {renderSubmissionForm()}
          
          <Button
            onClick={handleSubmit}
            disabled={
              !submission ||
              (Array.isArray(submission) && submission.length === 0)
            }
            className="w-full"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Submit Task
          </Button>
        </div>
      )}

      {/* Completion Status */}
      {isCompleted && (
        <div className="flex items-center justify-center gap-2 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          <span>Task Completed!</span>
        </div>
      )}
    </div>
  );
} 