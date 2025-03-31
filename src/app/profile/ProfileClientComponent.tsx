'use client'

import React from 'react';
import { type AssessmentQuestion, type ChoiceOption, scales, valueItems, type WarmupChoiceQuestion, type ScenarioChoiceQuestion, type AptitudeQuestion, type LearningStyleQuestion, type LikertQuestion } from '@/app/assessment/assessmentData';
import { Label } from '@/components/ui/label';
// Removed Card, Badge, and duplicate Label imports

interface ProfileClientComponentProps {
  userAnswers: Record<string, { questionText: string; answer: string | number | string[] }>; // Reverted prop name
  allQuestionsMap: Map<string, AssessmentQuestion>;
  // Removed dreamscapesAnalysis prop
}

export default function ProfileClientComponent({
  userAnswers, // Use original prop name
  allQuestionsMap
  // Removed dreamscapesAnalysis from destructuring
}: ProfileClientComponentProps) {

  // Define a type guard for assessment questions with options
  type QuestionWithOptions = WarmupChoiceQuestion | ScenarioChoiceQuestion | AptitudeQuestion | LearningStyleQuestion; // Reverted type name
  const hasOptions = (q: AssessmentQuestion): q is QuestionWithOptions => 'options' in q; // Reverted function name

  return (
    <div className="space-y-6"> {/* Reverted spacing */}
      {/* Removed Dreamscapes Analysis Section */}

       {/* Existing Assessment Answers Section - Reverted title */}
       {/* <h2 className="text-2xl font-semibold text-gray-800 dark:text-white pt-4 border-t dark:border-gray-700">
         Detailed Assessment Answers
       </h2> */}
      {Array.from(allQuestionsMap.values()).map((question) => {
        const answerData = userAnswers[question.id]; // Use original prop name
        const answer = answerData?.answer;
        let formattedAnswer: string | React.JSX.Element = "Not Answered"; // Reverted "Not Answered" style

        if (answer !== undefined && answer !== null) { // Reverted check for empty string
            switch (question.inputType) {
                case 'multiple_choice':
                case 'scenario_choice':
                  if (hasOptions(question)) { // Use original type guard name
                    const chosenOption = question.options.find((opt: ChoiceOption) => opt.id === answer);
                    formattedAnswer = chosenOption ? chosenOption.text : `Unknown Option (${answer})`; // Reverted error display
                  } else {
                    formattedAnswer = `Error: Options missing`; // Reverted error display
                  }
                  break;
                case 'likert':
                  const likertQuestion = question as LikertQuestion;
                  const scale = scales[likertQuestion.scaleType];
                  const scaleOption = scale?.find(opt => opt.value === Number(answer));
                  formattedAnswer = scaleOption ? `${scaleOption.label} (${answer})` : `Invalid Value (${answer})`; // Reverted error display
                  break;
                case 'mini_challenge_text':
                case 'textarea':
                  formattedAnswer = String(answer);
                  break;
                case 'mini_challenge_textarea':
                   const text = String(answer);
                   formattedAnswer = text.length > 100 ? text.substring(0, 100) + '...' : text; // Reverted display logic
                   break;
                case 'value_ranking':
                  if (Array.isArray(answer)) {
                    const valueMap = new Map(valueItems.map(item => [item.id, item.text]));
                    formattedAnswer = answer.map((valueId: string, index: number) => { // Reverted display logic
                        const fullText = valueMap.get(valueId) || valueId;
                        const valueText = fullText.includes(': ') ? fullText.split(': ')[1] : fullText;
                        return `${index + 1}. ${valueText}`;
                    }).join('\n');
                  } else {
                    formattedAnswer = JSON.stringify(answer); // Reverted error display
                  }
                  break;
                // No default case needed if union type is correct
            }
        }

        return (
          <div key={question.id} className="rounded border border-gray-200 p-4 dark:border-gray-700"> {/* Reverted background/shadow */}
            <Label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-300"> {/* Reverted font weight */}
              {question.text}
            </Label>
            {/* Reverted display logic for value ranking */}
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
