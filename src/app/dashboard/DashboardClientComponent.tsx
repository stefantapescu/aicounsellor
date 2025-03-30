'use client'

import React from 'react';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, ClipboardList, Puzzle, Star, ArrowRight } from 'lucide-react';

interface DashboardClientComponentProps {
  userEmail: string | undefined;
  progress: {
    points: number;
    level: number;
  } | null;
  earnedBadges: {
    id: string;
    name: string;
    description: string | null;
    icon_url: string | null;
  }[];
  hasVocationalResults: boolean;
  completedQuizzes: {
    quiz_id: string;
  }[];
}

const DashboardClientComponent: React.FC<DashboardClientComponentProps> = ({
  userEmail,
  progress,
  earnedBadges,
  hasVocationalResults,
  completedQuizzes
}) => {
  const currentLevel = progress?.level ?? 1;
  const currentPoints = progress?.points ?? 0;
  const pointsPerLevel = 500;
  const pointsForCurrentLevelStart = (currentLevel - 1) * pointsPerLevel;
  const pointsInLevel = currentPoints - pointsForCurrentLevelStart;
  const levelProgress = Math.min(100, Math.max(0, (pointsInLevel / pointsPerLevel) * 100));

  return (
    <>
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-6">
        Welcome back, {userEmail || 'User'}!
      </h2>

      <Card className="mt-8 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-900/20 dark:via-gray-800 dark:to-blue-900/20 border-purple-100 dark:border-purple-900/50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-purple-800 dark:text-purple-300">
            <Star className="h-6 w-6" /> Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="text-center rounded-lg bg-white dark:bg-gray-700/50 p-4 shadow-inner border dark:border-gray-600">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Level</p>
              <p className="text-4xl font-bold text-purple-700 dark:text-purple-400">{currentLevel}</p>
            </div>
            <div className="text-center rounded-lg bg-white dark:bg-gray-700/50 p-4 shadow-inner border dark:border-gray-600">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Points (XP)</p>
              <p className="text-4xl font-bold text-purple-700 dark:text-purple-400">{currentPoints}</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Progress to Level {currentLevel + 1}</p>
            <Progress value={levelProgress} className="h-2.5 [&>*]:bg-gradient-to-r [&>*]:from-purple-500 [&>*]:to-blue-500" />
            <p className="text-xs text-right text-gray-500 dark:text-gray-400">{pointsInLevel} / {pointsPerLevel} XP</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Badges Earned</p>
            <div className="flex flex-wrap gap-3">
              {earnedBadges.length > 0 ? (
                earnedBadges.map(badge => (
                  <Badge key={badge.id} variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-700 py-1.5 px-3 text-sm shadow-sm">
                    <Award className="h-4 w-4 mr-1.5" />
                    {badge.name}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No badges earned yet. Keep exploring!</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 pt-4 border-t dark:border-gray-700 mt-8">Your Journey</h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mt-8">
        <Card className="flex flex-col justify-between hover:shadow-lg transition-shadow duration-200 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Vocational Assessment
            </CardTitle>
            <CardDescription>Discover your interests, skills, and values to explore suitable career paths.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow"></CardContent>
          <CardFooter className="flex gap-3">
            <Link href="/assessment" passHref legacyBehavior>
              <Button className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800">
                {hasVocationalResults ? 'Retake Assessment' : 'Start Assessment'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            {hasVocationalResults && (
              <Link href="/results" passHref legacyBehavior>
                <Button variant="outline">
                  View Results
                </Button>
              </Link>
            )}
          </CardFooter>
        </Card>

        <Card className="flex flex-col justify-between hover:shadow-lg transition-shadow duration-200 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Puzzle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Quizzes
            </CardTitle>
            <CardDescription>Test your knowledge and earn points.</CardDescription>
          </CardHeader>
          <CardContent>
            {completedQuizzes.length > 0 ? (
              <>
                <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">Completed:</p>
                <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  {completedQuizzes.map(quiz => <li key={quiz.quiz_id}>{quiz.quiz_id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>)}
                </ul>
              </>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300 italic">No quizzes completed yet.</p>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/quiz" passHref legacyBehavior>
              <Button variant="outline" className="w-full">
                Explore Quizzes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default DashboardClientComponent;
