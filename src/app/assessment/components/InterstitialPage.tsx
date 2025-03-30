'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface InterstitialPageProps {
    sectionTitle: string;
    introText: string;
    onContinue: () => void; // Function to call when the continue button is clicked
    isPending?: boolean; // Optional: To disable button during transitions
}

const InterstitialPage: React.FC<InterstitialPageProps> = ({
    sectionTitle,
    introText,
    onContinue,
    isPending = false // Default to false if not provided
}) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <h3 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                Next Section: {sectionTitle}
            </h3>
            <p className="mb-8 text-base text-gray-600 dark:text-gray-400 max-w-lg">
                {introText}
            </p>
            <Button
                onClick={onContinue}
                disabled={isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-700 dark:hover:bg-purple-800"
            >
                {isPending ? 'Loading...' : 'Continue'}
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
    );
};

export default InterstitialPage;
