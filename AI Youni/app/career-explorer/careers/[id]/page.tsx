"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Play, BrainCircuit, Briefcase, BookOpen, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { HexGrid } from "@/components/hex-grid"
import { FloatingOrbs } from "@/components/floating-orbs"
import { NeuralPathways } from "@/components/neural-pathways"
import Link from "next/link"

// This is a sample for the Hydroelectric Production Managers career
const careerData = {
  id: "hydroelectric-production-managers",
  title: "Hydroelectric Production Managers",
  description:
    "Manage operations at hydroelectric power generation facilities. Maintain and monitor hydroelectric plant equipment for efficient and safe plant operations.",
  tasks: [
    "Direct operations, maintenance, or repair of hydroelectric power facilities.",
    "Identify and communicate power system emergencies.",
    "Maintain records of hydroelectric facility operations, maintenance, or repairs.",
    "Perform or direct preventive or corrective containment or cleanup to protect the environment.",
    "Monitor or inspect hydroelectric equipment, such as hydro-turbines, generators, or control systems.",
  ],
  skills: [
    { name: "Operations Analysis", level: 85 },
    { name: "Management of Personnel Resources", level: 78 },
    { name: "Critical Thinking", level: 92 },
    { name: "Complex Problem Solving", level: 88 },
    { name: "Systems Evaluation", level: 75 },
  ],
  workStyles: [
    { name: "Attention to Detail", level: 90 },
    { name: "Dependability", level: 85 },
    { name: "Analytical Thinking", level: 88 },
    { name: "Integrity", level: 92 },
    { name: "Stress Tolerance", level: 80 },
  ],
  matchScore: 90,
  growth: "0%",
}

export default function CareerDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("overview")

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
                        Hydroelectric Production Managers oversee the operations, maintenance, and safety of
                        hydroelectric power generation facilities. They ensure efficient power production while
                        maintaining environmental compliance and equipment reliability.
                      </p>
                    </div>

                    <div>
                      <h3 className="mb-4 text-xl font-bold text-white">Neural Match Analysis</h3>
                      <p className="mb-4 text-purple-200">
                        Our AI has identified a strong alignment between your cognitive profile and the requirements for
                        this role. Your analytical abilities and technical aptitude are particularly well-suited for the
                        challenges of hydroelectric production management.
                      </p>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-purple-500/20 bg-purple-900/10 p-4">
                          <h4 className="mb-2 font-medium text-white">Cognitive Alignment</h4>
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm text-purple-200">Match Strength</span>
                            <span className="text-sm text-purple-300">92%</span>
                          </div>
                          <Progress
                            value={92}
                            className="h-2 bg-purple-900/40"
                            indicatorClassName="bg-gradient-to-r from-pink-500 to-purple-500"
                          />
                        </div>

                        <div className="rounded-xl border border-purple-500/20 bg-purple-900/10 p-4">
                          <h4 className="mb-2 font-medium text-white">Skill Compatibility</h4>
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm text-purple-200">Match Strength</span>
                            <span className="text-sm text-purple-300">88%</span>
                          </div>
                          <Progress
                            value={88}
                            className="h-2 bg-purple-900/40"
                            indicatorClassName="bg-gradient-to-r from-pink-500 to-purple-500"
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

                    <ul className="space-y-4">
                      {careerData.tasks.map((task, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-pink-600/50 to-purple-600/50">
                            <div className="h-2 w-2 rounded-full bg-white"></div>
                          </div>
                          <span className="text-purple-200">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="skills" className="p-6">
                  <div>
                    <h3 className="mb-4 text-xl font-bold text-white">Top Skills</h3>
                    <p className="mb-4 text-sm text-purple-300">Essential skills for success</p>

                    <div className="space-y-4">
                      {careerData.skills.map((skill, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-200">{skill.name}</span>
                            <span className="text-sm text-purple-300">{skill.level}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-purple-900/40">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                              style={{ width: `${skill.level}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="work" className="p-6">
                  <div>
                    <h3 className="mb-4 text-xl font-bold text-white">Work Styles</h3>
                    <p className="mb-4 text-sm text-purple-300">Important work characteristics</p>

                    <div className="space-y-4">
                      {careerData.workStyles.map((style, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-200">{style.name}</span>
                            <span className="text-sm text-purple-300">{style.level}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-purple-900/40">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                              style={{ width: `${style.level}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
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
                    <span className="text-sm text-purple-300">{careerData.growth}</span>
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
                      +12
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
                your qualifications.
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

