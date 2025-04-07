"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Play, BrainCircuit, Briefcase, BookOpen, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { HexGrid } from "@/components/hex-grid" // Assuming these are available
import { FloatingOrbs } from "@/components/floating-orbs" // Assuming these are available
import { NeuralPathways } from "@/components/neural-pathways" // Assuming these are available
import Link from "next/link"
// Import the type from the server component file using the correct relative path
import type { CareerDetails } from "./[onetCode]/page";

// Define the props for the client component
interface CareerDetailClientProps {
  // Use 'occupation' as the prop name to match what page.tsx passes
  occupation: CareerDetails;
}

// --- Type Guards ---
// Generic check for object with a specific string property
function hasStringProperty<K extends PropertyKey>(obj: unknown, prop: K): obj is Record<K, string> {
  // Check if obj is an object and has the property, and the property is a string
  return typeof obj === 'object' && obj !== null && prop in obj && typeof (obj as Record<K, unknown>)[prop] === 'string';
}

// Specific type guards for data structures within CareerDetails
interface TaskItem { description: string }
function isTaskItem(item: unknown): item is TaskItem {
  return hasStringProperty(item, 'description');
}

interface SkillItem { name: string; level?: number; description?: string; importance?: number }
function isSkillItem(item: unknown): item is SkillItem {
  return hasStringProperty(item, 'name'); // Basic check, refine if needed
}

interface KnowledgeItem { name: string; description?: string; importance?: number }
function isKnowledgeItem(item: unknown): item is KnowledgeItem {
  return hasStringProperty(item, 'name');
}

interface WorkStyleItem { name: string; importance?: number }
function isWorkStyleItem(item: unknown): item is WorkStyleItem {
  return hasStringProperty(item, 'name');
}

interface WorkContextItem { description: string }
function isWorkContextItem(item: unknown): item is WorkContextItem {
  return hasStringProperty(item, 'description');
}
// --- End Type Guards ---


export default function CareerDetailClientComponent({ occupation }: CareerDetailClientProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const careerData = occupation; // Use the passed prop

  if (!careerData) {
    return <div>Loading career details or career not found...</div>;
  }

  // Helper to safely render JSONB array data
  const renderJsonbList = <T,>(items: unknown[] | undefined | null, renderItem: (item: T, index: number) => React.ReactNode) => {
    if (!Array.isArray(items) || items.length === 0) {
      return <p className="text-sm text-purple-400">No data available.</p>;
    }
    // Filter out null/undefined items just in case before mapping
    return <ul className="space-y-4">{items.filter(Boolean).map((item, index) => renderItem(item as T, index))}</ul>;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-black"></div>
        <HexGrid />
        <FloatingOrbs />
        <div className="absolute inset-0 backdrop-blur-[2px]"></div>
      </div>

      {/* Neural Network Background */}
      <div className="fixed inset-0 z-0 opacity-20">
        <NeuralPathways />
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/career-explorer/matches">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-purple-300 hover:bg-purple-900/20 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Matches
            </Button>
          </Link>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Left Column - Career Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="md:col-span-2"
          >
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <h1 className="text-3xl font-bold text-white md:text-4xl">{careerData.title}</h1>
              <div className="flex h-8 items-center rounded-full bg-gradient-to-r from-pink-600/20 to-purple-600/20 px-3 text-sm backdrop-blur-sm">
                <span className="text-pink-300">Match Score: {careerData.matchScore}%</span>
              </div>
            </div>

            <p className="mb-8 text-lg text-purple-200">{careerData.description}</p>

            <div className="mb-8 overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 backdrop-blur-md">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-black/60">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600/50 data-[state=active]:to-purple-600/50 data-[state=active]:text-white"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="tasks"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600/50 data-[state=active]:to-purple-600/50 data-[state=active]:text-white"
                  >
                    Tasks
                  </TabsTrigger>
                  <TabsTrigger
                    value="skills"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600/50 data-[state=active]:to-purple-600/50 data-[state=active]:text-white"
                  >
                    Skills & Knowledge
                  </TabsTrigger>
                  <TabsTrigger
                    value="work"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600/50 data-[state=active]:to-purple-600/50 data-[state=active]:text-white"
                  >
                    Work Environment
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-4 text-xl font-bold text-white">Career Overview</h3>
                      <p className="text-purple-200">
                        {careerData.description || "No overview available."}
                      </p>
                    </div>

                    <div>
                      <h3 className="mb-4 text-xl font-bold text-white">Neural Match Analysis</h3>
                      <p className="mb-4 text-purple-200">
                        Our AI has identified a strong alignment between your cognitive profile and the requirements for
                        this role. Your analytical abilities and technical aptitude are particularly well-suited for the
                        challenges of this career. {/* Generic text */}
                      </p>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-purple-500/20 bg-purple-900/10 p-4">
                          <h4 className="mb-2 font-medium text-white">Cognitive Alignment</h4>
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm text-purple-200">Match Strength</span>
                            <span className="text-sm text-purple-300">{careerData.matchScore}%</span>
                          </div>
                          <Progress
                            value={careerData.matchScore}
                            className="h-2 bg-purple-900/40 [&>*]:bg-gradient-to-r [&>*]:from-pink-500 [&>*]:to-purple-500"
                          />
                        </div>

                        <div className="rounded-xl border border-purple-500/20 bg-purple-900/10 p-4">
                          <h4 className="mb-2 font-medium text-white">Skill Compatibility</h4>
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm text-purple-200">Match Strength</span>
                            <span className="text-sm text-purple-300">N/A</span> {/* Placeholder */}
                          </div>
                          <Progress
                            value={0} // Placeholder
                            className="h-2 bg-purple-900/40 [&>*]:bg-gradient-to-r [&>*]:from-pink-500 [&>*]:to-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tasks" className="p-6">
                  <div>
                    <h3 className="mb-4 text-xl font-bold text-white">Key Tasks</h3>
                    <p className="mb-4 text-sm text-purple-300">Common responsibilities in this role</p>
                    {renderJsonbList(careerData.tasks, (item, index) => {
                      if (!isTaskItem(item)) return null;
                      return (
                        <li key={index} className="flex items-start gap-3">
                          <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-pink-600/50 to-purple-600/50">
                            <div className="h-2 w-2 rounded-full bg-white"></div>
                          </div>
                          <span className="text-purple-200">{item.description}</span>
                        </li>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="skills" className="p-6">
                  <div>
                    <h3 className="mb-4 text-xl font-bold text-white">Top Skills</h3>
                    <p className="mb-4 text-sm text-purple-300">Essential skills for success</p>
                    {renderJsonbList(careerData.skills, (item, index) => {
                      if (!isSkillItem(item)) return null;
                      const skill = item; // Now typed as SkillItem
                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-200">{skill.name}</span>
                            {skill.level && <span className="text-sm text-purple-300">{skill.level}% Level</span>}
                            {skill.importance && <span className="text-sm text-purple-300">{skill.importance}% Importance</span>}
                          </div>
                          {(skill.level || skill.importance) && (
                            <div className="h-2 overflow-hidden rounded-full bg-purple-900/40">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                                style={{ width: `${skill.level || skill.importance || 0}%` }}
                              ></div>
                            </div>
                          )}
                          {skill.description && <p className="text-xs text-purple-400">{skill.description}</p>}
                        </div>
                      );
                    })}
                    {careerData.knowledge && careerData.knowledge.length > 0 && (
                      <div className="mt-6">
                        <h3 className="mb-4 text-xl font-bold text-white">Knowledge Areas</h3>
                        {renderJsonbList(careerData.knowledge, (item, index) => {
                           if (!isKnowledgeItem(item)) return null;
                           return <div key={index} className="text-sm text-purple-200">- {item.name}</div>;
                        })}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="work" className="p-6">
                  <div>
                    <h3 className="mb-4 text-xl font-bold text-white">Work Styles</h3>
                    <p className="mb-4 text-sm text-purple-300">Important work characteristics</p>
                    {renderJsonbList(careerData.workStyles, (item, index) => {
                       if (!isWorkStyleItem(item)) return null;
                       const style = item; // Now typed as WorkStyleItem
                       return (
                         <div key={index} className="space-y-1">
                           <div className="flex items-center justify-between">
                             <span className="text-sm text-purple-200">{style.name}</span>
                             {style.importance && <span className="text-sm text-purple-300">{style.importance}% Importance</span>}
                           </div>
                           {style.importance && (
                             <div className="h-2 overflow-hidden rounded-full bg-purple-900/40">
                               <div
                                 className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                 style={{ width: `${style.importance || 0}%` }}
                               ></div>
                             </div>
                           )}
                         </div>
                       );
                    })}
                    {careerData.workContext && careerData.workContext.length > 0 && (
                      <div className="mt-6">
                        <h3 className="mb-4 text-xl font-bold text-white">Work Context</h3>
                        {renderJsonbList(careerData.workContext, (item, index) => {
                           if (!isWorkContextItem(item)) return null;
                           return <div key={index} className="text-sm text-purple-200">- {item.description}</div>;
                        })}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>

          {/* Right Column - Actions and Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 p-6 backdrop-blur-md">
              <h3 className="mb-4 text-xl font-bold text-white">Career Actions</h3>

              <div className="space-y-3">
                <Button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 transition-all duration-300 hover:scale-[1.02]">
                  <Play className="mr-2 h-4 w-4" /> Try Career Simulation
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-purple-500/30 bg-purple-900/20 text-purple-200 transition-all duration-300 hover:scale-[1.02] hover:border-purple-400/50 hover:bg-purple-800/30"
                >
                  <BrainCircuit className="mr-2 h-4 w-4" /> View Neural Match Details
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-purple-500/30 bg-purple-900/20 text-purple-200 transition-all duration-300 hover:scale-[1.02] hover:border-purple-400/50 hover:bg-purple-800/30"
                >
                  <Briefcase className="mr-2 h-4 w-4" /> Find Related Jobs
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-purple-500/30 bg-purple-900/20 text-purple-200 transition-all duration-300 hover:scale-[1.02] hover:border-purple-400/50 hover:bg-purple-800/30"
                >
                  <BookOpen className="mr-2 h-4 w-4" /> Explore Education Paths
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 p-6 backdrop-blur-md">
              <h3 className="mb-4 text-xl font-bold text-white">Career Statistics</h3>

              <div className="space-y-4">
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-purple-200">Job Growth</span>
                    <span className="text-sm text-purple-300">{careerData.growth || 'N/A'}</span>
                  </div>
                  <div className="text-xs text-purple-400">(Projected 2025-2035)</div>
                </div>

                <div className="rounded-xl border border-purple-500/20 bg-purple-900/10 p-4">
                  <h4 className="mb-2 font-medium text-white">Neural Match Score</h4>
                  <div className="relative h-24 w-full">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="h-full w-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#4B1D89" strokeWidth="8" />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          strokeDasharray="283"
                          strokeDashoffset={283 - (283 * careerData.matchScore) / 100}
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#EC4899" />
                            <stop offset="100%" stopColor="#8B5CF6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-2xl font-bold text-white">{careerData.matchScore}%</div>
                        <div className="text-xs text-purple-300">Match Score</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-purple-500/20 bg-purple-900/10 p-4">
                  <h4 className="mb-2 font-medium text-white">People Like You</h4>
                  <p className="mb-3 text-sm text-purple-200">
                    Users with similar neural profiles who explored this career
                  </p>
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-600/80 to-purple-600/80 text-xs font-medium text-white ring-2 ring-black"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-900/60 text-xs font-medium text-white ring-2 ring-black">
                      +12 {/* Placeholder count */}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 p-6 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-600/20 to-purple-600/40">
                  <Sparkles className="h-5 w-5 text-purple-300" />
                </div>
                <div>
                  <h3 className="font-bold text-white">AI Insight</h3>
                  <p className="text-sm text-purple-300">Personalized recommendation</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-purple-900/20 p-4 text-sm text-purple-200">
                Based on your neural profile, you may excel in roles that combine technical oversight with environmental
                stewardship. Consider exploring specialized certifications in renewable energy management to enhance
                your qualifications. {/* Generic text */}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
