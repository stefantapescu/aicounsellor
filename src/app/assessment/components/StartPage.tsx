'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
// Removed unused Image import

interface StartPageProps {
    onStart: () => void; // Function to call when the start button is clicked
}

const StartPage: React.FC<StartPageProps> = ({ onStart }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 md:p-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl">
            {/* Optional: Add Logo */}
            {/* <Image src="/path/to/your/logo.svg" alt="YOUNI Logo" width={80} height={80} className="mb-4" /> */}
            <h2 className="text-2xl md:text-3xl font-bold mb-3">YOUNI's Career Assessment</h2>
            <p className="text-base md:text-lg mb-6 max-w-md mx-auto">
                Answer these questions about your interests, skills, and values to receive an AI-powered recommendation tailored specifically for you!
            </p>
            <Button
                onClick={onStart}
                size="lg" // Make button larger
                className="bg-white text-purple-700 hover:bg-gray-100 focus:ring-white focus:ring-offset-purple-500"
            >
                Start Now!
            </Button>
        </div>
    );
};

export default StartPage;
