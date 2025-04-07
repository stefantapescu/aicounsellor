'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import Link from 'next/link';

interface OccupationData {
  code: string;
  title: string;
  description: string | null;
  tasks: Array<{
    id?: string;
    type?: string;
    frequency?: string;
    importance?: string;
    description: string;
  }>;
  skills: Array<{
    id?: string;
    name: string;
    description?: string;
    importance?: number;
    level?: number;
  }>;
  knowledge: Array<{
    id?: string;
    name: string;
    description?: string;
    importance?: number;
  }>;
  abilities: Array<{
    id?: string;
    name: string;
    description?: string;
    importance?: number;
  }>;
  workActivities: Array<{
    id?: string;
    name: string;
    description?: string;
    importance?: number;
  }>;
  workContext: Array<{
    id?: string;
    name?: string;
    description: string;
  }>;
  interests: any[];
  workValues: any[];
  workStyles: Array<{
    id?: string;
    name: string;
    importance?: number;
  }>;
}

interface CareerDetailClientComponentProps {
  occupation: OccupationData;
  userId: string;
}

export default function CareerDetailClientComponent({
  occupation,
  userId
}: CareerDetailClientComponentProps) {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">{occupation.title}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {occupation.description}
        </p>
        <div className="flex gap-4">
          <Link href={`/career-explorer/${occupation.code}/simulations`}>
            <Button>
              <PlayCircle className="mr-2 h-4 w-4" />
              Try Career Simulation
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="skills">Skills & Knowledge</TabsTrigger>
          <TabsTrigger value="work">Work Environment</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Tasks</CardTitle>
              <CardDescription>Common responsibilities in this role</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                {occupation.tasks.slice(0, 5).map((task, index) => (
                  <li key={index} className="text-gray-600 dark:text-gray-400">
                    {task.description}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Skills</CardTitle>
                <CardDescription>Essential skills for success</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {occupation.skills.slice(0, 8).map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Work Styles</CardTitle>
                <CardDescription>Important work characteristics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {occupation.workStyles.slice(0, 8).map((style, index) => (
                    <Badge key={index} variant="secondary">
                      {style.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Tasks & Responsibilities</CardTitle>
              <CardDescription>Detailed list of tasks performed in this role</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-3">
                {occupation.tasks.map((task, index) => (
                  <li key={index} className="text-gray-600 dark:text-gray-400">
                    {task.description}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardDescription>Required skills and competencies</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {occupation.skills.map((skill, index) => (
                    <li key={index}>
                      <div className="font-medium">{skill.name}</div>
                      {skill.description && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {skill.description}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Knowledge Areas</CardTitle>
                <CardDescription>Required knowledge and expertise</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {occupation.knowledge.map((item, index) => (
                    <li key={index}>
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {item.description}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Work Environment Tab */}
        <TabsContent value="work" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Work Activities</CardTitle>
                <CardDescription>Common activities in this role</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {occupation.workActivities.map((activity, index) => (
                    <li key={index}>
                      <div className="font-medium">{activity.name}</div>
                      {activity.description && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.description}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Work Context</CardTitle>
                <CardDescription>Working conditions and environment</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {occupation.workContext.map((context, index) => (
                    <li key={index} className="text-gray-600 dark:text-gray-400">
                      {context.description}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 