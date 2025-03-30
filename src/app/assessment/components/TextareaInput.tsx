'use client'

import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import type { TextareaQuestion } from '../assessmentData'; // Import specific type

// Define props for the component
interface TextareaInputProps {
    question: TextareaQuestion;
    currentAnswer: string | undefined; // Answer is string
    handleInputChange: (questionId: string, value: string) => void; // Value is string
    isPending: boolean;
}

const TextareaInput: React.FC<TextareaInputProps> = ({
    question,
    currentAnswer,
    handleInputChange,
    isPending
}) => {
    return (
        <Textarea
            className="mt-4 block w-full rounded-md border-gray-300 p-3 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            rows={6}
            placeholder="Describe..."
            value={currentAnswer || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange(question.id, e.target.value)}
            disabled={isPending}
        />
    );
};

export default TextareaInput;
