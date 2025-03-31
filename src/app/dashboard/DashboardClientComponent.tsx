'use client'

import React from 'react';
import Link from 'next/link';
// Removed Badge import
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ClipboardList, Puzzle, ArrowRight, HelpCircle, FileText, Sparkles } from 'lucide-react'; // Added Sparkles
import RoboYouniMascot from '@/components/RoboYouniMascot'; // Import the mascot component

interface DashboardClientComponentProps {
  userEmail: string | undefined; // Keep userEmail prop
  progress: { // Keep progress prop
    points: number;
    level: number;
  } | null;
  // earnedBadges prop removed as it's not in the new design
  // earnedBadges: {
  //   id: string;
  //   name: string;
  //   description: string | null;
  //   icon_url: string | null;
  // }[];
  hasVocationalResults: boolean; // Keep hasVocationalResults prop
  completedQuizzes: { // Keep completedQuizzes prop
    quiz_id: string;
  }[]; // Keep closing bracket
}

const DashboardClientComponent: React.FC<DashboardClientComponentProps> = ({
  userEmail,
  progress,
  // earnedBadges removed from destructuring
  hasVocationalResults,
  completedQuizzes
}) => {
  const currentLevel = progress?.level ?? 9; // Default to 9 as per image
  const currentPoints = progress?.points ?? 4250; // Default to 4250 as per image
  const pointsPerLevel = 500; // Keep this logic, but use default value from image
  const pointsInLevel = 250; // Use value from image
  const levelProgress = Math.min(100, Math.max(0, (pointsInLevel / pointsPerLevel) * 100)); // Calculate progress based on image values

  // Define colors based on the image (assuming these are defined in tailwind.config.ts or use defaults)
  const primaryPurple = 'text-purple-900'; // Example, adjust as needed
  const darkPurpleBg = 'bg-purple-800'; // Example for journey cards
  const lightPurpleBg = 'bg-purple-100'; // Example for progress card background
  const progressBarColor = 'bg-purple-500'; // Example for progress bar
  const pinkButtonBg = 'bg-pink-600'; // Example for buttons
  const pinkButtonHoverBg = 'hover:bg-pink-700'; // Example for button hover

  return (
    <div className="space-y-8">
      {/* Welcome Message - Added responsive text size */}
      <h2 className={`text-xl md:text-2xl ${primaryPurple} dark:text-purple-300`}>
        Welcome back, {userEmail || 'User'}!
      </h2>

      {/* Progress Card - Adjusted flex direction and padding for medium screens */}
      <Card className={`rounded-2xl ${lightPurpleBg} dark:bg-gray-800 p-4 md:p-6 shadow-lg border-none`}>
        {/* Changed flex-col to md:flex-row, adjusted spacing */}
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
          {/* Replaced Star icon placeholder with RoboYouniMascot */}
          <div className="flex-shrink-0"> {/* Removed yellow background */}
            <RoboYouniMascot width={60} height={60} className="md:w-[70px] md:h-[70px]" /> {/* Adjusted size */}
          </div>
          <div className="flex-1 w-full md:w-auto"> {/* Ensure flex-1 takes width on mobile */}
            <CardTitle className={`text-lg font-semibold ${primaryPurple} dark:text-purple-200 mb-4`}>Your Progress</CardTitle>
            {/* Adjusted grid columns for responsiveness */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
              <div className="text-center rounded-lg bg-white dark:bg-gray-700 p-3 shadow-sm">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Level</p>
                <p className={`text-2xl sm:text-3xl font-bold ${primaryPurple} dark:text-purple-300`}>{currentLevel}</p> {/* Responsive text */}
              </div>
              <div className="text-center rounded-lg bg-white dark:bg-gray-700 p-3 shadow-sm">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Points (XP)</p>
                <p className={`text-2xl sm:text-3xl font-bold ${primaryPurple} dark:text-purple-300`}>{currentPoints}</p> {/* Responsive text */}
              </div> {/* Close points div */}
            </div> {/* Close grid div */}
            {/* Progress bar section */}
            <Progress value={levelProgress} className={`h-2.5 rounded-full bg-purple-200 dark:bg-gray-700 [&>*]:${progressBarColor}`} />
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
              <span>Progress to Level {currentLevel + 1}</span>
              <span>{pointsInLevel} / {pointsPerLevel} XP</span>
            </div>
          </div> {/* Close flex-1 div */}
        </div> {/* Close main flex container div */}
      </Card> {/* Close Progress Card */}

      {/* Journey Section - Added grid layout for responsiveness */}
      <Card className={`rounded-2xl ${darkPurpleBg} dark:bg-gray-800 p-4 md:p-6 shadow-lg border-none text-white`}>
        <CardHeader className="p-0 mb-6">
          {/* Responsive title size */}
          <CardTitle className="text-xl md:text-2xl font-bold">Your Journey</CardTitle>
        </CardHeader>
        {/* Use grid for the journey cards, adjust columns for different screen sizes */}
        <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Vocational Assessment Card */}
          <div className="bg-purple-700/50 dark:bg-gray-700/50 rounded-xl p-5 flex flex-col space-y-4 relative"> {/* Changed to flex-col */}
             <div className="flex items-start space-x-4"> {/* Icon and Title row */}
                <FileText className="h-6 w-6 text-yellow-400 mt-1 flex-shrink-0" />
                <h4 className="font-semibold text-lg flex-1">Vocational Assessment</h4>
                 {/* Question Mark Icon Placeholder */}
                <div className="absolute top-4 right-4 bg-yellow-400 p-2 rounded-full hidden sm:block"> {/* Hide on very small screens */}
                  <HelpCircle className="h-6 w-6 text-purple-900" />
                </div>
             </div>
             <p className="text-sm text-purple-100 dark:text-gray-300 flex-grow min-h-[60px]">Discover your interests, skills, and values to explore suitable career paths.</p> {/* Added min-height */}
             <div className="flex flex-wrap gap-3 pt-2"> {/* Added padding-top */}
                <Link href="/assessment" passHref legacyBehavior>
                  <Button className={`${pinkButtonBg} ${pinkButtonHoverBg} text-white rounded-lg px-5 py-2 text-sm font-medium`}>
                    {hasVocationalResults ? 'Retake Assessment' : 'Start Assessment'}
                  </Button>
                </Link>
                {hasVocationalResults && (
                  <Link href="/results" passHref legacyBehavior>
                    <Button variant="secondary" className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg px-5 py-2 text-sm font-medium">
                      View Results
                    </Button>
                  </Link>
                )}
              </div>
          </div>

          {/* Quizzes Card */}
          <div className="bg-purple-700/50 dark:bg-gray-700/50 rounded-xl p-5 flex flex-col space-y-4"> {/* Changed to flex-col */}
             <div className="flex items-start space-x-4"> {/* Icon and Title row */}
                <Puzzle className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" /> {/* Changed icon */}
                <h4 className="font-semibold text-lg flex-1">Quizzes</h4>
             </div>
             <p className="text-sm text-purple-100 dark:text-gray-300 flex-grow min-h-[60px]">Test your knowledge and earn points.</p> {/* Added min-height */}
             <div className="pt-2"> {/* Added padding-top */}
                <Link href="/quiz" passHref legacyBehavior>
                  <Button className={`${pinkButtonBg} ${pinkButtonHoverBg} text-white rounded-lg px-5 py-2 text-sm font-medium inline-flex items-center`}>
                    Explore Quizzes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
             </div>
          </div>

           {/* Dreamscapes Workshop Card */}
           <div className="bg-purple-700/50 dark:bg-gray-700/50 rounded-xl p-5 flex flex-col space-y-4 md:col-span-2 lg:col-span-1"> {/* Spans 2 cols on md, 1 on lg */}
             <div className="flex items-start space-x-4"> {/* Icon and Title row */}
                <Sparkles className="h-6 w-6 text-pink-400 mt-1 flex-shrink-0" /> {/* New Icon */}
                <h4 className="font-semibold text-lg flex-1">Dreamscapes Workshop</h4>
             </div>
             <p className="text-sm text-purple-100 dark:text-gray-300 flex-grow min-h-[60px]">Envision your future and reflect on your core motivations.</p> {/* Added min-height */}
             <div className="pt-2 flex flex-wrap gap-3"> {/* Added padding-top and flex for buttons */}
                <Link href="/workshop/dreamscapes" passHref legacyBehavior>
                  <Button className={`${pinkButtonBg} ${pinkButtonHoverBg} text-white rounded-lg px-5 py-2 text-sm font-medium inline-flex items-center`}>
                    Start/Retake Workshop {/* Changed text slightly */}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                 {/* Add Link to Results Page */}
                 <Link href="/workshop/dreamscapes/results" passHref legacyBehavior>
                    <Button variant="secondary" className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg px-5 py-2 text-sm font-medium">
                      View Insights
                    </Button>
                  </Link>
             </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardClientComponent;
