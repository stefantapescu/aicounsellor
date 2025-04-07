"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Target, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Career goals
const careerGoals = [
  {
    id: "goal-1",
    title: "Career Advancement",
    description: "Climb the corporate ladder and reach leadership positions",
    icon: "📈",
  },
  {
    id: "goal-2",
    title: "Career Change",
    description: "Transition to a new industry or field",
    icon: "🔄",
  },
  {
    id: "goal-3",
    title: "Skill Development",
    description: "Acquire new skills and knowledge",
    icon: "🧠",
  },
  {
    id: "goal-4",
    title: "Entrepreneurship",
    description: "Start or grow your own business",
    icon: "🚀",
  },
  {
    id: "goal-5",
    title: "Work-Life Balance",
    description: "Find a career that allows for personal time and flexibility",
    icon: "⚖️",
  },
  {
    id: "goal-6",
    title: "Financial Growth",
    description: "Maximize earning potential and financial stability",
    icon: "💰",
  },
  {
    id: "goal-7",
    title: "Social Impact",
    description: "Make a positive difference in society through your work",
    icon: "🌍",
  },
  {
    id: "goal-8",
    title: "Creative Expression",
    description: "Find outlets for creativity and innovation",
    icon: "🎨",
  },
]

export default function GoalsPage() {
  const router = useRouter()
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [customGoal, setCustomGoal] = useState("")
  const [customGoals, setCustomGoals] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleGoalToggle = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter((id) => id !== goalId))
    } else {
      setSelectedGoals([...selectedGoals, goalId])
    }
  }

  const handleAddCustomGoal = () => {
    if (customGoal.trim() && !customGoals.includes(customGoal.trim())) {
      setCustomGoals([...customGoals, customGoal.trim()])
      setCustomGoal("")
    }
  }

  const handleRemoveCustomGoal = (goal: string) => {
    setCustomGoals(customGoals.filter((g) => g !== goal))
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    // Simulate API call to save results
    setTimeout(() => {
      router.push("/onboarding/neural-profile")
    }, 1500)
  }

  const canContinue = selectedGoals.length > 0 || customGoals.length > 0

  return (
    <div className="container mx-auto max-w-4xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 backdrop-blur-md"
      >
        <div className="p-8 md:p-12">
          <div className="mb-8 flex flex-col items-center justify-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mb-6 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm backdrop-blur-sm"
            >
              <Target className="mr-2 h-4 w-4 text-purple-300" />
              <span className="text-purple-300">Step 3: Career Goals</span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mb-2 text-center text-3xl font-bold md:text-4xl"
            >
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                What Are Your Goals?
              </span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-center text-lg text-purple-200"
            >
              Select the career goals that matter most to you
            </motion.p>
          </div>

          <div className="mb-8">
            {/* Career Goals Grid */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {careerGoals.map((goal, index) => {
                const isSelected = selectedGoals.includes(goal.id)

                return (
                  <motion.div
                    key={goal.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.05, duration: 0.5 }}
                    onClick={() => handleGoalToggle(goal.id)}
                    className={`group relative cursor-pointer overflow-hidden rounded-xl border ${
                      isSelected
                        ? "border-pink-500/50 bg-gradient-to-br from-pink-900/30 to-purple-900/30"
                        : "border-purple-500/20 bg-purple-900/10 hover:border-purple-500/40"
                    } p-4 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10`}
                  >
                    <div className="absolute -right-10 -top-10 h-20 w-20 rounded-full bg-purple-600/10 opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-100"></div>

                    <div className="mb-2 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600/20 to-purple-600/40 text-xl">
                        {goal.icon}
                      </div>

                      {isSelected && (
                        <div className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>

                    <h3 className="mb-1 font-medium text-white">{goal.title}</h3>
                    <p className="text-sm text-purple-200">{goal.description}</p>
                  </motion.div>
                )
              })}
            </div>

            {/* Custom Goal Input */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mb-6 rounded-xl border border-purple-500/20 bg-purple-900/10 p-4"
            >
              <h3 className="mb-4 font-medium text-white">Add Your Own Goals</h3>

              <div className="mb-4 flex gap-2">
                <Input
                  type="text"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="Enter a custom career goal..."
                  className="flex-1 border-purple-500/30 bg-black/40 text-white placeholder-purple-300 focus:border-pink-500/50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddCustomGoal()
                    }
                  }}
                />
                <Button
                  onClick={handleAddCustomGoal}
                  disabled={!customGoal.trim()}
                  className="bg-gradient-to-r from-pink-600 to-purple-600"
                >
                  Add
                </Button>
              </div>

              {/* Custom Goals List */}
              <AnimatePresence>
                {customGoals.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    {customGoals.map((goal, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-between rounded-lg bg-purple-800/20 px-3 py-2"
                      >
                        <span className="text-purple-200">{goal}</span>
                        <button
                          onClick={() => handleRemoveCustomGoal(goal)}
                          className="text-purple-300 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex justify-center"
          >
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !canContinue}
              className="group relative overflow-hidden bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 text-lg font-medium transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center">
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </span>
              <span className="absolute inset-0 z-0 bg-gradient-to-r from-pink-700 to-purple-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

