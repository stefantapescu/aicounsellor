'use client'

import React from 'react';
import { cn } from '@/lib/utils';
// Import all relevant question types that use multiple choice
import type {
    WarmupChoiceQuestion,
    ScenarioChoiceQuestion,
    AptitudeQuestion,
    LearningStyleQuestion
} from '../assessmentData';

// Define props for the component
interface MultipleChoiceInputProps {
    // Update the union type to include all MC question types
    question: WarmupChoiceQuestion | ScenarioChoiceQuestion | AptitudeQuestion | LearningStyleQuestion;
    currentAnswer: string | undefined; // The currently selected answer ID
    handleInputChange: (questionId: string, value: string) => void; // Function to update the answer
    isPending: boolean; // To disable buttons during transitions
}

// Reusable function to render an option button (extracted from original component)
const renderOptionButton = (
    questionId: string,
    optionId: string,
    optionText: string,
    optionIndex: number,
    isSelected: boolean,
    isPending: boolean,
    handleInputChange: (questionId: string, value: string) => void
) => {
    const optionLetter = String.fromCharCode(97 + optionIndex);

    return (
        <button
            key={optionId}
            type="button"
            onClick={() => handleInputChange(questionId, optionId)}
            className={cn(
                "flex w-full items-center rounded-lg border p-3 md:p-4 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2",
                "bg-pink-50/70 hover:bg-pink-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40",
                isSelected ? "border-purple-500 ring-2 ring-purple-400 dark:border-purple-600 dark:ring-purple-500" : "border-gray-200 dark:border-gray-700",
                isPending ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            )}
            disabled={isPending}
        >
            <span className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-purple-700 dark:bg-gray-700 dark:text-purple-300">
                {optionLetter}
            </span>
            <span className="flex-1 text-sm md:text-base text-gray-800 dark:text-gray-100">{optionText}</span>
        </button>
    );
};


const MultipleChoiceInput: React.FC<MultipleChoiceInputProps> = ({
    question,
    currentAnswer,
    handleInputChange,
    isPending
}) => {
    // Check if the question has options (TypeScript should ensure this, but good practice)
    if (!question.options) {
        return <p>Error: Question is missing options.</p>;
    }

    return (
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            {question.options.map((option, index) =>
                renderOptionButton(
                    question.id,
                    option.id,
                    option.text,
                    index,
                    currentAnswer === option.id, // Check if this option is selected
                    isPending,
                    handleInputChange
                )
            )}
        </div>
    );
};

export default MultipleChoiceInput;
