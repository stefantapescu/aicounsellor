'use client'

import React, { useState } from 'react';
// Import valueItems as well
import { allQuestions, type AssessmentQuestion, type ChoiceOption, scales, valueItems } from '@/app/assessment/assessmentData';
import { Button } from '@/components/ui/button'; // For potential future edit buttons
import { Label } from '@/components/ui/label';

interface ProfileClientComponentProps {
  userId: string;
  // Organized answers: { questionId: { questionText: string; answer: any } }
  userAnswers: Record<string, { questionText: string; answer: any }>;
  // Pass allQuestions for context like options, scale types etc.
  allQuestionsMap: Map<string, AssessmentQuestion>; // Pass as a Map for easier lookup
}

// Helper to display the answer in a readable format
// Return type can be string or JSX.Element for the italic span
const formatAnswer = (question: AssessmentQuestion | undefined, answer: any): string | React.JSX.Element => {
  if (answer === undefined || answer === null) {
    // Return string for consistency now, can style later if needed
    return "Not Answered";
  }
  if (!question) {
    return JSON.stringify(answer); // Fallback if question definition not found
  }

  switch (question.inputType) {
    case 'multiple_choice': // Covers warmup, aptitude, learning_style
    case 'scenario_choice': // Covers interests, skills
      // Find the chosen option text
      const choiceQuestion = question as any; // Cast for options access (adjust if needed for stricter typing)
      const chosenOption = choiceQuestion.options?.find((opt: ChoiceOption) => opt.id === answer);
      return chosenOption ? chosenOption.text : `Unknown Option (${answer})`;
    case 'likert':
      // Find the label for the chosen scale value
      const likertQuestion = question as any; // Cast for scaleType access
      const scale = scales[likertQuestion.scaleType as keyof typeof scales];
      const scaleOption = scale?.find(opt => opt.value === Number(answer));
      return scaleOption ? `${scaleOption.label} (${answer})` : `Invalid Value (${answer})`;
    case 'mini_challenge_text':
    case 'textarea':
      return answer.toString(); // Display text directly
    case 'mini_challenge_textarea':
       // Display textarea content, maybe truncated if too long for summary view
       const text = answer.toString();
       return text.length > 100 ? text.substring(0, 100) + '...' : text;
    case 'value_ranking':
      // Display the ranked list
      if (Array.isArray(answer)) {
        // Use the imported valueItems to map IDs to text
        const valueMap = new Map(valueItems.map(item => [item.id, item.text]));
        return answer.map((valueId, index) => {
            // Extract text after ': ' if present, otherwise use full text
            const fullText = valueMap.get(valueId) || valueId;
            const valueText = fullText.includes(': ') ? fullText.split(': ')[1] : fullText;
            return `${index + 1}. ${valueText}`;
        }).join('\n'); // Join with newline for display in <pre> or similar
      }
      return JSON.stringify(answer); // Fallback
    default:
      return JSON.stringify(answer);
  }
};

export default function ProfileClientComponent({ userId, userAnswers, allQuestionsMap }: ProfileClientComponentProps) {
  // State for potential future editing mode
  const [isEditing, setIsEditing] = useState(false);
  const [currentAnswers, setCurrentAnswers] = useState(userAnswers);

  // TODO: Implement edit functionality later

  return (
    <div className="space-y-6">
      {/* Iterate through all defined questions to maintain order and show unanswered */}
      {Array.from(allQuestionsMap.values()).map((question) => {
        const answerData = currentAnswers[question.id];
        const answer = answerData?.answer; // Get the answer value

        // Skip follow-up enjoyment questions if their parent challenge wasn't answered? Or show as unanswered.
        // For now, show all questions defined.

        return (
          <div key={question.id} className="rounded border border-gray-200 p-4 dark:border-gray-700">
            <Label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-300">
              {question.text}
            </Label>
            <div className="text-sm text-gray-800 dark:text-gray-100">
              {formatAnswer(question, answer)}
            </div>
            {/* Placeholder for Edit Button */}
            {/* <Button variant="outline" size="sm" className="mt-2" onClick={() => alert('Edit not implemented yet')}>Edit</Button> */}
          </div>
        );
      })}

      {/* Placeholder for Save Button (when editing) */}
      {/* {isEditing && <Button>Save Changes</Button>} */}
    </div>
  );
}
