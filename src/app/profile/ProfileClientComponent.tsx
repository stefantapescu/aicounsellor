'use client'

import React from 'react';
import { type AssessmentQuestion, type ChoiceOption, scales, valueItems, type WarmupChoiceQuestion, type ScenarioChoiceQuestion, type AptitudeQuestion, type LearningStyleQuestion, type LikertQuestion } from '@/app/assessment/assessmentData';
import { Label } from '@/components/ui/label';

interface ProfileClientComponentProps {
  userAnswers: Record<string, { questionText: string; answer: string | number | string[] }>;
  allQuestionsMap: Map<string, AssessmentQuestion>;
}

export default function ProfileClientComponent({ userAnswers, allQuestionsMap }: ProfileClientComponentProps) {

  // Define a type guard for questions with options
  type QuestionWithOptions = WarmupChoiceQuestion | ScenarioChoiceQuestion | AptitudeQuestion | LearningStyleQuestion;
  const hasOptions = (q: AssessmentQuestion): q is QuestionWithOptions => 'options' in q;

  return (
    <div className="space-y-6">
      {Array.from(allQuestionsMap.values()).map((question) => {
        const answerData = userAnswers[question.id];
        const answer = answerData?.answer;
        let formattedAnswer: string | React.JSX.Element = "Not Answered";

        if (answer !== undefined && answer !== null) {
            switch (question.inputType) {
                case 'multiple_choice':
                case 'scenario_choice':
                  if (hasOptions(question)) {
                    const chosenOption = question.options.find((opt: ChoiceOption) => opt.id === answer);
                    formattedAnswer = chosenOption ? chosenOption.text : `Unknown Option (${answer})`;
                  } else {
                    formattedAnswer = `Error: Options missing`;
                  }
                  break;
                case 'likert':
                  const likertQuestion = question as LikertQuestion;
                  const scale = scales[likertQuestion.scaleType];
                  const scaleOption = scale?.find(opt => opt.value === Number(answer));
                  formattedAnswer = scaleOption ? `${scaleOption.label} (${answer})` : `Invalid Value (${answer})`;
                  break;
                case 'mini_challenge_text':
                case 'textarea':
                  formattedAnswer = String(answer);
                  break;
                case 'mini_challenge_textarea':
                   const text = String(answer);
                   formattedAnswer = text.length > 100 ? text.substring(0, 100) + '...' : text;
                   break;
                case 'value_ranking':
                  if (Array.isArray(answer)) {
                    const valueMap = new Map(valueItems.map(item => [item.id, item.text]));
                    formattedAnswer = answer.map((valueId: string, index: number) => {
                        const fullText = valueMap.get(valueId) || valueId;
                        const valueText = fullText.includes(': ') ? fullText.split(': ')[1] : fullText;
                        return `${index + 1}. ${valueText}`;
                    }).join('\n');
                  } else {
                    formattedAnswer = JSON.stringify(answer);
                  }
                  break;
                // No default case needed if union type is correct
            }
        }

        return (
          <div key={question.id} className="rounded border border-gray-200 p-4 dark:border-gray-700">
            <Label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-300">
              {question.text}
            </Label>
            {question.inputType === 'value_ranking' ? (
              <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-100">
                {formattedAnswer}
              </pre>
            ) : (
              <div className="text-sm text-gray-800 dark:text-gray-100">
                {formattedAnswer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
