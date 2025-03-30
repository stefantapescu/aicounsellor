'use client'

import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { valueItems } from '../assessmentData'; // Import value items list
import type { ValueRankingQuestion } from '../assessmentData'; // Import specific type

// Define props for the component
interface ValueRankingInputProps {
    question: ValueRankingQuestion;
    // The answer is an array of selected value IDs (strings)
    currentAnswer: string[] | undefined;
    // Function to update the answer array
    handleInputChange: (questionId: string, value: string[]) => void;
    // Need all answers to check dependencies
    allAnswers: Record<string, number | string | string[]>;
    isPending: boolean;
}

const ValueRankingInput: React.FC<ValueRankingInputProps> = ({
    question,
    currentAnswer,
    handleInputChange,
    allAnswers, // Receive all answers
    isPending
}) => {
    const selectedValues = currentAnswer || [];

    // --- Add Logging ---
    console.log("ValueRankingInput received allAnswers:", JSON.stringify(allAnswers));
    // --- End Logging ---

    // Get items rated 4 or 5 from allAnswers
    const highRatedValues = valueItems.filter(item => {
        // Construct the rating question ID correctly
        const ratingQuestionId = `value_rating_${item.id.split('_').pop()}`;
        const rating = allAnswers[ratingQuestionId]; // Check against allAnswers

        // --- Add Logging ---
        console.log(`Checking rating for ${ratingQuestionId}: Raw value = ${rating}, Type = ${typeof rating}`);
        // --- End Logging ---

        // Ensure rating is treated as a number for comparison
        const numericRating = Number(rating);
        const isHighRated = numericRating === 4 || numericRating === 5;

        // --- Add Logging ---
        if (isHighRated) {
            console.log(` -> ${item.id} (${item.text}) IS high rated.`);
        }
        // --- End Logging ---

        return isHighRated;
    });

    // --- Add Logging ---
    console.log("Filtered highRatedValues:", highRatedValues.map(v => v.id));
    // --- End Logging ---


    // Display message if not enough values are rated highly
    if (highRatedValues.length < 3 && question.dependsOnRatings) { // Check dependency flag
        return <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Please rate at least 3 values as 'Important' (4) or 'Very Important' (5) in the previous section first to enable ranking.</p>;
    }
     if (highRatedValues.length === 0) {
         // Fallback if dependsOnRatings is false but still no high values (shouldn't happen with current data)
         return <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">No values rated highly enough for ranking.</p>;
     }


    const handleCheckboxChange = (valueId: string, checked: boolean) => {
        let currentSelection = [...selectedValues];
        if (checked) {
            // Add if less than 3 selected
            if (currentSelection.length < 3) {
                currentSelection.push(valueId);
            } else {
                // Optionally provide feedback or just prevent adding more
                console.warn("Maximum 3 values can be selected");
                return; // Prevent adding more than 3
            }
        } else {
            // Remove if unchecked
            currentSelection = currentSelection.filter(id => id !== valueId);
        }
        // Update the state with the new array of selected IDs
        handleInputChange(question.id, currentSelection);
    };

    return (
        <div className="mt-6 space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Select your top 3 most important values from the list below:</p>
            {highRatedValues.map((item: { id: string; text: string }) => (
                <div key={item.id} className="flex items-center space-x-2 rounded-md border p-3 bg-pink-50/70 dark:bg-purple-900/20 dark:border-gray-700">
                    <Checkbox
                        id={`${question.id}-${item.id}`} // Create unique ID for checkbox
                        checked={selectedValues.includes(item.id)}
                        onCheckedChange={(checked) => handleCheckboxChange(item.id, Boolean(checked))} // Ensure boolean
                        disabled={isPending || (selectedValues.length >= 3 && !selectedValues.includes(item.id))}
                        aria-labelledby={`${question.id}-${item.id}-label`} // For accessibility
                    />
                    <Label
                        htmlFor={`${question.id}-${item.id}`}
                        id={`${question.id}-${item.id}-label`} // For accessibility
                        className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-100"
                    >
                        {item.text}
                    </Label>
                </div>
            ))}
            {selectedValues.length >= 3 && <p className="text-xs text-center text-purple-600 dark:text-purple-400 mt-3">You have selected the maximum of 3 values.</p>}
        </div>
    );
};

export default ValueRankingInput;
