'use client'

import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { MiniChallengeQuestion } from '../assessmentData'; // Import specific type

// Define props for the component
interface MiniChallengeInputProps {
    question: MiniChallengeQuestion;
    currentAnswer: string | undefined; // Answer is string
    handleInputChange: (questionId: string, value: string) => void; // Value is string
    isPending: boolean;
}

const MiniChallengeInput: React.FC<MiniChallengeInputProps> = ({
    question,
    currentAnswer,
    handleInputChange,
    isPending
}) => {
    if (question.inputType === 'mini_challenge_text') {
        return (
            <div className="mt-4">
                <Input
                    type="text" // Or number if appropriate, but current logic uses string
                    placeholder="Your answer..."
                    value={currentAnswer || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(question.id, e.target.value)}
                    disabled={isPending}
                    className="block w-full rounded-md border-gray-300 p-3 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                />
            </div>
        );
    }

    if (question.inputType === 'mini_challenge_textarea') {
        return (
            <Textarea
                className="mt-4 block w-full rounded-md border-gray-300 p-3 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                rows={4}
                placeholder="Your ideas..."
                value={currentAnswer || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange(question.id, e.target.value)}
                disabled={isPending}
            />
        );
    }

    // Fallback if inputType doesn't match
    return <p>Error: Invalid input type for Mini Challenge.</p>;
};

export default MiniChallengeInput;
