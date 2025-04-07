"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  BookOpen,
  BrainCircuit,
  Briefcase,
  LogOut,
  Sparkles,
  ChevronRight,
  Zap,
  Award,
  MessageSquare,
  User,
  Settings,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RoboYouniMascot } from "@/components/robo-youni-mascot"
import { cn } from "@/lib/utils"
import { HexGrid } from "@/components/hex-grid"
import { FloatingOrbs } from "@/components/floating-orbs"
import { NeuralPathways } from "@/components/neural-pathways"

export default function DashboardPage() {
  const [user] = useState({
    email: "cosmic_explorer@universe.ai",
    name: "Cosmic Explorer",
    level: 7,
    points: 1750,
    pointsToNextLevel: 2500,
    completedAssessment: true,
    achievements: [
      { id: 1, name: "First Login", icon: "🚀", completed: true },
      { id: 2, name: "Assessment Master", icon: "🧠", completed: true },
      { id: 3, name: "Quiz Champion", icon: "🏆", completed: false },
      { id: 4, name: "Career Pathfinder", icon: "🧭", completed: false },
    ],
    skills: [
      { name: "Creativity", level: 85 },
      { name: "Analysis", level: 70 },
      { name: "Leadership", level: 60 },
      { name: "Technical", level: 90 },
    ],
  })

  const [activeSection, setActiveSection] = useState("journey")
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [showAiChat, setShowAiChat] = useState(false)
  const [aiMessages, setAiMessages] = useState([
    { role: "ai", content: "Hello Cosmic Explorer! How can I assist with your educational journey today?" },
  ])
  const [userInput, setUserInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [aiMessages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userInput.trim()) return

    // Add user message
    setAiMessages([...aiMessages, { role: "user", content: userInput }])
    setUserInput("")

    // Simulate AI thinking and response
    setIsAiSpeaking(true)
    setTimeout(() => {
      setAiMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: `Based on your career interests and assessment results, I recommend exploring the ${
            Math.random() > 0.5 ? "creative technology" : "data science"
          } pathway. Would you like me to provide more specific resources?`,
        },
      ])
      setIsAiSpeaking(false)
    }, 2000)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-black"></div>
        <HexGrid />
        <FloatingOrbs />
        <div className="absolute inset-0 backdrop-blur-[2px]"></div>
      </div>

      {/* Neural Network Background for Journey Section */}
      {activeSection === "journey" && (
        <div className="fixed inset-0 z-0 opacity-30">
          <NeuralPathways />
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-purple-800/80 text-white backdrop-blur-md md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Side Navigation */}
        <motion.nav
          className={cn(
            "fixed bottom-0 left-0 top-0 z-40 w-16 flex-col items-center justify-between border-r border-purple-500/20 bg-black/40 py-6 backdrop-blur-xl md:flex",
            showMobileMenu ? "flex" : "hidden",
          )}
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex flex-col items-center space-y-2">
            <motion.div
              className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-xl font-bold">AI</span>
            </motion.div>

            <NavButton
              icon={<User className="h-5 w-5" />}
              isActive={activeSection === "profile"}
              onClick={() => setActiveSection("profile")}
              tooltip="Profile"
            />
            <NavButton
              icon={<Zap className="h-5 w-5" />}
              isActive={activeSection === "journey"}
              onClick={() => setActiveSection("journey")}
              tooltip="Journey"
            />
            <NavButton
              icon={<Award className="h-5 w-5" />}
              isActive={activeSection === "achievements"}
              onClick={() => setActiveSection("achievements")}
              tooltip="Achievements"
            />
            <NavButton
              icon={<Settings className="h-5 w-5" />}
              isActive={activeSection === "settings"}
              onClick={() => setActiveSection("settings")}
              tooltip="Settings"
            />
          </div>

          <div className="flex flex-col items-center space-y-4">
            <NavButton
              icon={<LogOut className="h-5 w-5" />}
              isActive={false}
              onClick={() => console.log("Logout")}
              tooltip="Logout"
            />
          </div>
        </motion.nav>

        {/* Main Dashboard Area */}
        <main className="ml-0 min-h-screen p-4 md:ml-16 md:p-8">
          {/* AI Assistant Button */}
          <motion.button
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-pink-600 to-purple-600 shadow-lg shadow-purple-500/20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAiChat(!showAiChat)}
          >
            <MessageSquare className="h-6 w-6" />
          </motion.button>

          {/* AI Chat Panel */}
          <motion.div
            className={cn(
              "fixed bottom-24 right-6 z-50 w-80 overflow-hidden rounded-2xl border border-purple-500/30 bg-black/80 shadow-xl backdrop-blur-xl md:w-96",
              showAiChat ? "flex flex-col" : "hidden",
            )}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            style={{ height: "500px" }}
          >
            <div className="flex items-center justify-between border-b border-purple-500/20 bg-purple-900/30 p-4">
              <div className="flex items-center gap-3">
                <div className="relative h-8 w-8">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"></div>
                  <div className="absolute inset-1 flex items-center justify-center rounded-full bg-black">
                    <Sparkles className="h-4 w-4 text-pink-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Youni AI Assistant</h3>
                </div>
              </div>
              <button onClick={() => setShowAiChat(false)} className="text-white/70 hover:text-white">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {aiMessages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    "mb-4 max-w-[85%] rounded-2xl p-3",
                    msg.role === "ai" ? "bg-purple-900/40 text-white" : "ml-auto bg-pink-600/40 text-white",
                  )}
                >
                  {msg.content}
                </div>
              ))}
              {isAiSpeaking && (
                <div className="mb-4 max-w-[85%] rounded-2xl bg-purple-900/40 p-3 text-white">
                  <div className="flex h-6 items-center gap-1">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-pink-500"></div>
                    <div
                      className="h-2 w-2 animate-pulse rounded-full bg-pink-500"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="h-2 w-2 animate-pulse rounded-full bg-pink-500"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="border-t border-purple-500/20 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 rounded-full border border-purple-500/30 bg-purple-900/20 px-4 py-2 text-white placeholder-purple-300/50 outline-none focus:border-pink-500/50"
                />
                <button
                  type="submit"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-pink-600 to-purple-600"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </form>
          </motion.div>

          {/* Header with User Info */}
          <motion.header
            className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div>
              <motion.h1
                className="text-3xl font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                  Neural Dashboard
                </span>
              </motion.h1>
              <motion.p
                className="text-lg text-purple-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Welcome back, <span className="font-medium text-pink-400">{user.name}</span>
              </motion.p>
            </div>

            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-10 items-center gap-1 rounded-full bg-purple-900/40 px-4 backdrop-blur-sm">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span className="font-medium text-yellow-300">{user.points} XP</span>
                </div>
                <div className="flex h-10 items-center gap-1 rounded-full bg-purple-900/40 px-4 backdrop-blur-sm">
                  <Award className="h-4 w-4 text-pink-400" />
                  <span className="font-medium text-pink-300">Level {user.level}</span>
                </div>
              </div>
            </motion.div>
          </motion.header>

          {/* Content Sections */}
          <div className="space-y-8">
            {/* Profile Section */}
            {activeSection === "profile" && <ProfileSection user={user} />}

            {/* Journey Section */}
            {activeSection === "journey" && <JourneySection user={user} />}

            {/* Achievements Section */}
            {activeSection === "achievements" && <AchievementsSection user={user} />}

            {/* Settings Section */}
            {activeSection === "settings" && <SettingsSection />}
          </div>
        </main>
      </div>
    </div>
  )
}

// Navigation Button Component
function NavButton({
  icon,
  isActive,
  onClick,
  tooltip,
}: {
  icon: React.ReactNode
  isActive: boolean
  onClick: () => void
  tooltip: string
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
              isActive
                ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white"
                : "bg-purple-900/20 text-purple-300 hover:bg-purple-800/40 hover:text-white",
            )}
            onClick={onClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {icon}
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Profile Section Component
function ProfileSection({ user }: { user: any }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Profile Card */}
        <motion.div
          className="overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 backdrop-blur-md"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative h-40 bg-gradient-to-r from-purple-600 to-pink-600">
            <div className="absolute -bottom-16 left-6 h-32 w-32 overflow-hidden rounded-full border-4 border-black">
              <div className="flex h-full w-full items-center justify-center bg-purple-800 text-4xl font-bold">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
          <div className="mt-20 p-6">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-purple-300">{user.email}</p>

            <div className="mt-6 space-y-4">
              <h3 className="font-medium text-pink-400">Core Skills</h3>
              <div className="space-y-3">
                {user.skills.map((skill: any, index: number) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-200">{skill.name}</span>
                      <span className="text-sm text-purple-300">{skill.level}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-purple-900/40">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.level}%` }}
                        transition={{ delay: 0.4 + index * 0.1, duration: 1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Career Path Card */}
        <motion.div
          className="overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 backdrop-blur-md"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="p-6">
            <h2 className="text-xl font-bold text-white">Career Pathways</h2>
            <p className="text-purple-300">Based on your assessment results</p>

            <div className="mt-6 space-y-4">
              <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-purple-900/20 p-4">
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-pink-600/20 blur-2xl"></div>
                <h3 className="text-lg font-medium text-pink-300">Data Science</h3>
                <p className="mt-1 text-sm text-purple-200">92% match with your skills and interests</p>
                <div className="mt-4 flex gap-2">
                  <span className="rounded-full bg-purple-800/60 px-2 py-1 text-xs text-purple-200">Python</span>
                  <span className="rounded-full bg-purple-800/60 px-2 py-1 text-xs text-purple-200">
                    Machine Learning
                  </span>
                  <span className="rounded-full bg-purple-800/60 px-2 py-1 text-xs text-purple-200">Analytics</span>
                </div>
                <Button className="mt-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white">Explore Path</Button>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-purple-900/20 p-4">
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-indigo-600/20 blur-2xl"></div>
                <h3 className="text-lg font-medium text-indigo-300">UX/UI Design</h3>
                <p className="mt-1 text-sm text-purple-200">87% match with your skills and interests</p>
                <div className="mt-4 flex gap-2">
                  <span className="rounded-full bg-purple-800/60 px-2 py-1 text-xs text-purple-200">Design</span>
                  <span className="rounded-full bg-purple-800/60 px-2 py-1 text-xs text-purple-200">User Research</span>
                  <span className="rounded-full bg-purple-800/60 px-2 py-1 text-xs text-purple-200">Prototyping</span>
                </div>
                <Button className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">Explore Path</Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Learning Progress */}
      <motion.div
        className="overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 backdrop-blur-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-white">Learning Progress</h2>
          <p className="text-purple-300">Track your educational journey</p>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/40 to-purple-800/20 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-600/30">
                  <BookOpen className="h-5 w-5 text-pink-300" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Courses</h3>
                  <p className="text-sm text-purple-300">3 completed</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-300">Progress</span>
                  <span className="text-xs text-purple-300">60%</span>
                </div>
                <Progress
                  value={60}
                  className="mt-1 h-1.5 bg-purple-900/40"
                  indicatorClassName="bg-gradient-to-r from-pink-500 to-purple-500"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/40 to-purple-800/20 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600/30">
                  <BrainCircuit className="h-5 w-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Assessments</h3>
                  <p className="text-sm text-purple-300">2 completed</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-300">Progress</span>
                  <span className="text-xs text-purple-300">80%</span>
                </div>
                <Progress
                  value={80}
                  className="mt-1 h-1.5 bg-purple-900/40"
                  indicatorClassName="bg-gradient-to-r from-indigo-500 to-purple-500"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/40 to-purple-800/20 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600/30">
                  <Briefcase className="h-5 w-5 text-purple-300" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Career Prep</h3>
                  <p className="text-sm text-purple-300">1 completed</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-300">Progress</span>
                  <span className="text-xs text-purple-300">40%</span>
                </div>
                <Progress
                  value={40}
                  className="mt-1 h-1.5 bg-purple-900/40"
                  indicatorClassName="bg-gradient-to-r from-purple-500 to-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Journey Section Component
function JourneySection({ user }: { user: any }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-6">
      {/* Level Progress */}
      <motion.div
        className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 backdrop-blur-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl"></div>
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-pink-600/10 blur-3xl"></div>

        <div className="relative flex flex-col items-center gap-8 p-8 md:flex-row">
          <div className="relative h-40 w-40 flex-shrink-0">
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
                  strokeDashoffset={283 - (283 * user.points) / user.pointsToNextLevel}
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
                <RoboYouniMascot width={60} height={60} />
                <div className="mt-1 text-center">
                  <div className="text-xl font-bold text-white">Level {user.level}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Your Neural Journey</h2>
              <p className="text-purple-300">Expanding your cognitive pathways</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-purple-200">Progress to Level {user.level + 1}</span>
                <span className="font-medium text-purple-200">
                  {user.points} / {user.pointsToNextLevel} XP
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-purple-900/40">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(user.points / user.pointsToNextLevel) * 100}%` }}
                  transition={{ delay: 0.4, duration: 1.5 }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-full bg-purple-900/40 px-3 py-1.5 text-sm text-purple-200">
                <span className="mr-1 text-pink-400">+200 XP</span> Complete Assessment
              </div>
              <div className="rounded-full bg-purple-900/40 px-3 py-1.5 text-sm text-purple-200">
                <span className="mr-1 text-pink-400">+150 XP</span> Finish Career Quiz
              </div>
              <div className="rounded-full bg-purple-900/40 px-3 py-1.5 text-sm text-purple-200">
                <span className="mr-1 text-pink-400">+100 XP</span> Daily Login Streak
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Journey Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Vocational Assessment Card */}
        <motion.div
          className="group relative overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 backdrop-blur-md"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-pink-600/20 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"></div>
          <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-purple-600/20 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"></div>

          <div className="relative p-6">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-600/20 to-pink-600/40 backdrop-blur-md">
              <BrainCircuit className="h-7 w-7 text-pink-300" />
            </div>

            <h3 className="mb-2 text-xl font-bold text-white">Neural Assessment</h3>
            <p className="mb-6 text-purple-200">
              Discover your cognitive strengths and ideal career paths with our advanced neural mapping assessment.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button className="bg-gradient-to-r from-pink-600 to-purple-600 text-white transition-transform duration-300 hover:scale-105">
                {user.completedAssessment ? "Retake Assessment" : "Start Assessment"}
              </Button>
              {user.completedAssessment && (
                <Button
                  variant="outline"
                  className="border-purple-500/30 bg-purple-900/20 text-purple-200 transition-transform duration-300 hover:scale-105 hover:border-purple-400/50 hover:bg-purple-800/30"
                >
                  View Results
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quizzes Card */}
        <motion.div
          className="group relative overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 backdrop-blur-md"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-indigo-600/20 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"></div>
          <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-purple-600/20 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"></div>

          <div className="relative p-6">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600/20 to-indigo-600/40 backdrop-blur-md">
              <BookOpen className="h-7 w-7 text-indigo-300" />
            </div>

            <h3 className="mb-2 text-xl font-bold text-white">Quantum Quizzes</h3>
            <p className="mb-6 text-purple-200">
              Test your knowledge and earn XP with our interactive quizzes on various career fields and cognitive
              domains.
            </p>

            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white transition-transform duration-300 hover:scale-105">
              Explore Quizzes
            </Button>
          </div>
        </motion.div>

        {/* Dreamscapes Workshop Card */}
        <motion.div
          className="group relative overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 backdrop-blur-md"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-purple-600/20 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"></div>
          <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-pink-600/20 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"></div>

          <div className="relative p-6">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-600/40 backdrop-blur-md">
              <Sparkles className="h-7 w-7 text-purple-300" />
            </div>

            <h3 className="mb-2 text-xl font-bold text-white">Dreamscape Workshop</h3>
            <p className="mb-6 text-purple-200">
              Visualize your ideal future and explore creative career possibilities through immersive guided neural
              exercises.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white transition-transform duration-300 hover:scale-105">
                Enter Dreamscape
              </Button>
              <Button
                variant="outline"
                className="border-purple-500/30 bg-purple-900/20 text-purple-200 transition-transform duration-300 hover:scale-105 hover:border-purple-400/50 hover:bg-purple-800/30"
              >
                View Insights
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Career Explorer Card */}
        <motion.div
          className="group relative overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 backdrop-blur-md"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-pink-600/20 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"></div>
          <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-indigo-600/20 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"></div>

          <div className="relative p-6">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-600/20 to-indigo-600/40 backdrop-blur-md">
              <Briefcase className="h-7 w-7 text-pink-300" />
            </div>

            <h3 className="mb-2 text-xl font-bold text-white">Career Nexus</h3>
            <p className="mb-6 text-purple-200">
              Explore a multidimensional map of career paths that match your neural profile and cognitive strengths.
            </p>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      className="bg-gradient-to-r from-pink-600 to-indigo-600 text-white transition-transform duration-300 hover:scale-105"
                      disabled={!user.completedAssessment}
                    >
                      Enter Career Nexus
                    </Button>
                  </div>
                </TooltipTrigger>
                {!user.completedAssessment && (
                  <TooltipContent className="border border-purple-500/30 bg-black/90 text-purple-200">
                    <p>Complete the Neural Assessment first</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

// Achievements Section Component
function AchievementsSection({ user }: { user: any }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-6">
      {/* Achievements Overview */}
      <motion.div
        className="overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 backdrop-blur-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white">Neural Achievements</h2>
          <p className="text-purple-300">Track your milestones and unlock rewards</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="flex flex-col items-center rounded-2xl bg-purple-900/20 p-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-600/20 to-pink-600/40">
                <Award className="h-8 w-8 text-pink-300" />
              </div>
              <h3 className="mt-3 font-medium text-white">Total Achievements</h3>
              <p className="text-2xl font-bold text-pink-400">12</p>
            </div>

            <div className="flex flex-col items-center rounded-2xl bg-purple-900/20 p-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600/20 to-indigo-600/40">
                <Zap className="h-8 w-8 text-indigo-300" />
              </div>
              <h3 className="mt-3 font-medium text-white">XP Earned</h3>
              <p className="text-2xl font-bold text-indigo-400">1,750</p>
            </div>

            <div className="flex flex-col items-center rounded-2xl bg-purple-900/20 p-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600/20 to-purple-600/40">
                <BrainCircuit className="h-8 w-8 text-purple-300" />
              </div>
              <h3 className="mt-3 font-medium text-white">Assessments</h3>
              <p className="text-2xl font-bold text-purple-400">3</p>
            </div>

            <div className="flex flex-col items-center rounded-2xl bg-purple-900/20 p-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-600/20 to-indigo-600/40">
                <Briefcase className="h-8 w-8 text-pink-300" />
              </div>
              <h3 className="mt-3 font-medium text-white">Career Paths</h3>
              <p className="text-2xl font-bold text-pink-400">2</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Achievement Cards */}
      <motion.div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {/* Achievement 1 */}
        <motion.div
          className="group relative overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 backdrop-blur-md"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-pink-600/20 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"></div>

          <div className="relative p-6">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-600/20 to-pink-600/40">
              <div className="text-3xl">🚀</div>
            </div>

            <h3 className="mb-2 text-xl font-bold text-white">First Login</h3>
            <p className="mb-4 text-purple-200">You've taken your first step into the AI Youni universe!</p>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-pink-400">+50 XP</span>
              <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
                Completed
              </span>
            </div>
          </div>
        </motion.div>

        {/* Achievement 2 */}
        <motion.div
          className="group relative overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 backdrop-blur-md"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-indigo-600/20 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"></div>

          <div className="relative p-6">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600/20 to-indigo-600/40">
              <div className="text-3xl">🧠</div>
            </div>

            <h3 className="mb-2 text-xl font-bold text-white">Assessment Master</h3>
            <p className="mb-4 text-purple-200">Complete your first neural assessment and discover your strengths.</p>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-400">+200 XP</span>
              <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
                Completed
              </span>
            </div>
          </div>
        </motion.div>

        {/* Achievement 3 */}
        <motion.div
          className="group relative overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 backdrop-blur-md"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-purple-600/20 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"></div>

          <div className="relative p-6">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-600/40">
              <div className="text-3xl">🏆</div>
            </div>

            <h3 className="mb-2 text-xl font-bold text-white">Quiz Champion</h3>
            <p className="mb-4 text-purple-200">Complete 5 quizzes with a score of 80% or higher.</p>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-400">+150 XP</span>
              <span className="rounded-full bg-purple-500/20 px-2 py-1 text-xs font-medium text-purple-300">
                In Progress (3/5)
              </span>
            </div>
          </div>
        </motion.div>

        {/* Achievement 4 */}
        <motion.div
          className="group relative overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 backdrop-blur-md"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-pink-600/20 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"></div>

          <div className="relative p-6">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-600/20 to-indigo-600/40">
              <div className="text-3xl">🧭</div>
            </div>

            <h3 className="mb-2 text-xl font-bold text-white">Career Pathfinder</h3>
            <p className="mb-4 text-purple-200">Explore 3 different career paths in the Career Nexus.</p>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-pink-400">+100 XP</span>
              <span className="rounded-full bg-purple-500/20 px-2 py-1 text-xs font-medium text-purple-300">
                In Progress (1/3)
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// Settings Section Component
function SettingsSection() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-6">
      <motion.div
        className="overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 backdrop-blur-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white">Neural Interface Settings</h2>
          <p className="text-purple-300">Customize your AI Youni experience</p>

          <div className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-pink-400">Account</h3>

              <div className="rounded-2xl border border-purple-500/20 bg-purple-900/20 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="font-medium text-white">Profile Information</h4>
                    <p className="text-sm text-purple-200">Update your account details and preferences</p>
                  </div>
                  <Button className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">Edit Profile</Button>
                </div>
              </div>

              <div className="rounded-2xl border border-purple-500/20 bg-purple-900/20 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="font-medium text-white">Password</h4>
                    <p className="text-sm text-purple-200">Change your password and security settings</p>
                  </div>
                  <Button className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">Change Password</Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-indigo-400">Preferences</h3>

              <div className="rounded-2xl border border-purple-500/20 bg-purple-900/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Neural Interface Theme</h4>
                    <p className="text-sm text-purple-200">Choose your preferred visual experience</p>
                  </div>
                  <select className="rounded-lg border border-purple-500/30 bg-black/50 px-3 py-2 text-purple-200 outline-none focus:border-pink-500/50">
                    <option>Cosmic Void (Dark)</option>
                    <option>Neural Network</option>
                    <option>Quantum Field</option>
                    <option>Nebula (Light)</option>
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-purple-500/20 bg-purple-900/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">AI Assistant Voice</h4>
                    <p className="text-sm text-purple-200">Select the voice for your AI assistant</p>
                  </div>
                  <select className="rounded-lg border border-purple-500/30 bg-black/50 px-3 py-2 text-purple-200 outline-none focus:border-pink-500/50">
                    <option>Cosmic Guide</option>
                    <option>Neural Navigator</option>
                    <option>Quantum Companion</option>
                    <option>Stellar Mentor</option>
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-purple-500/20 bg-purple-900/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Notifications</h4>
                    <p className="text-sm text-purple-200">Manage your notification preferences</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-purple-500/30 bg-purple-900/20 text-purple-200 hover:border-purple-400/50 hover:bg-purple-800/30"
                  >
                    Configure
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-purple-400">Privacy</h3>

              <div className="rounded-2xl border border-purple-500/20 bg-purple-900/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Data Sharing</h4>
                    <p className="text-sm text-purple-200">Manage how your data is used and shared</p>
                  </div>
                  <div className="flex h-6 w-12 cursor-pointer items-center rounded-full bg-purple-900 p-1">
                    <div className="h-4 w-4 translate-x-6 rounded-full bg-pink-500 transition-transform"></div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-purple-500/20 bg-purple-900/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">AI Learning</h4>
                    <p className="text-sm text-purple-200">Allow AI to learn from your interactions</p>
                  </div>
                  <div className="flex h-6 w-12 cursor-pointer items-center rounded-full bg-purple-900 p-1">
                    <div className="h-4 w-4 translate-x-6 rounded-full bg-pink-500 transition-transform"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

