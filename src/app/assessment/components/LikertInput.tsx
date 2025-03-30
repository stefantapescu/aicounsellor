'use client'

import React from 'react';
import { cn } from '@/lib/utils';
import { scales } from '../assessmentData'; // Import scales from data file
import type { LikertQuestion } from '../assessmentData'; // Import specific type

// Define props for the component
interface LikertInputProps {
    question: LikertQuestion;
    currentAnswer: number | undefined; // Likert answers are numbers
    handleInputChange: (questionId: string, value: number) => void; // Value is number
    isPending: boolean;
}

// Reusable function to render a Likert option button (extracted from original component)
const renderLikertOptionButton = (
    question: LikertQuestion,
    optionValue: number, // Correct type: number
    optionLabel: string,
    isSelected: boolean,
    isPending: boolean,
    handleInputChange: (questionId: string, value: number) => void
) => {
    // Use index from the correct scale for the letter
    const scaleOptions = scales[question.scaleType];
    // Ensure comparison is number vs number
    const optionIndex = scaleOptions.findIndex(o => o.value === optionValue);
    const optionLetter = String.fromCharCode(97 + optionIndex);

    return (
        <button
            key={optionValue} // Key can be number
            type="button"
            onClick={() => handleInputChange(question.id, optionValue)} // Pass number directly
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
            <span className="flex-1 text-sm md:text-base text-gray-800 dark:text-gray-100">{optionLabel}</span>
        </button>
    );
};

const LikertInput: React.FC<LikertInputProps> = ({
    question,
    currentAnswer,
    handleInputChange,
    isPending
}) => {
    const scaleOptions = scales[question.scaleType];

    if (!scaleOptions) {
        return <p>Error: Invalid scale type for Likert question.</p>;
    }

    return (
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            {scaleOptions.map((option) =>
                renderLikertOptionButton(
                    question,
                    option.value,
                    option.label,
                    currentAnswer === option.value, // Compare number with number
                    isPending,
                    handleInputChange
                )
            )}
        </div>
    );
};

export default LikertInput;
