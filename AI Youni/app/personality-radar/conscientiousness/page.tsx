"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Lightbulb, ArrowRight, ArrowLeft, AlertCircle, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Game data for Time Crunch Challenge with varied question types
const gameData = [
  {
    id: 1,
    type: "prioritization",
    title: "Task Prioritization",
    description: "You have a critical presentation tomorrow. Arrange these tasks in the order you would complete them.",
    tasks: [
      { id: "task1", title: "Gather data", importance: "High", urgency: "High", icon: "📊" },
      { id: "task2", title: "Create slides", importance: "High", urgency: "Medium", icon: "🖼️" },
      { id: "task3", title: "Send team reminders", importance: "Low", urgency: "Low", icon: "📧" },
      { id: "task4", title: "Rehearse presentation", importance: "Medium", urgency: "Medium", icon: "🎤" },
    ],
    // Ideal order: task1, task2, task4, task3 (based on importance/urgency)
  },
  {
    id: 2,
    type: "time_allocation",
    title: "Time Management",
    description: "You have 8 hours to complete your project. How would you allocate your time across these activities?",
    activities: [
      { id: "act1", name: "Research", description: "Gathering necessary information", icon: "🔍" },
      { id: "act2", name: "Planning", description: "Organizing your approach", icon: "📝" },
      { id: "act3", name: "Execution", description: "Doing the actual work", icon: "⚙️" },
      { id: "act4", name: "Review", description: "Checking for errors and improvements", icon: "✓" },
    ],
    totalHours: 8,
  },
  {
    id: 3,
    type: "decision_scenario",
    title: "Handling Interruptions",
    description: "You're deep in work when a colleague asks for help with an unrelated issue. What do you do?",
    options: [
      {
        id: "a",
        text: "Help them right away, even if it delays your work",
        score: 1,
        feedback: "You prioritize helping others, but this may impact your ability to meet deadlines.",
      },
      {
        id: "b",
        text: "Tell them you'll help after you finish your current task",
        score: 2,
        feedback: "You balance being helpful with maintaining your productivity.",
      },
      {
        id: "c",
        text: "Politely decline, explaining you need to focus on your deadline",
        score: 3,
        feedback: "You maintain strong boundaries to ensure you meet your commitments.",
      },
    ],
    image: "/placeholder.svg?height=300&width=500",
  },
  {
    id: 4,
    type: "quality_control",
    title: "Attention to Detail",
    description: "Review this document and identify the errors before submission.",
    document: {
      title: "Project Proposal",
      sections: [
        {
          heading: "Executive Summary",
          content: "This project aims to increase efficiency by 15% while reducing costs by 10%.",
          hasError: false,
        },
        {
          heading: "Budget Breakdown",
          content: "Total budget: $75,000\nPersonnel: $45,000\nEquipment: $20,000\nMiscellaneous: $15,000",
          hasError: true, // Math error: 45k + 20k + 15k = 80k, not 75k
          errorType: "calculation",
        },
        {
          heading: "Timeline",
          content:
            "Phase 1: January - March\nPhase 2: April - June\nPhase 3: July - September\nProject Completion: October 31st",
          hasError: false,
        },
        {
          heading: "Team Members",
          content: "Project Lead: Sarah Johnson\nAnalyst: Michael Chen\nDeveloper: David Smith\nDesigner: Emily Wong",
          hasError: true, // Inconsistent capitalization (Developer vs designer)
          errorType: "formatting",
        },
      ],
    },
  },
  {
    id: 5,
    type: "resource_management",
    title: "Resource Allocation",
    description:
      "You have limited resources for your project. Adjust the sliders to allocate your budget across different areas.",
    resources: [
      { id: "res1", name: "Quality", description: "Higher quality materials and processes", icon: "⭐" },
      { id: "res2", name: "Speed", description: "Faster delivery and implementation", icon: "⚡" },
      { id: "res3", name: "Cost", description: "Keeping expenses low", icon: "💰" },
    ],
    totalPoints: 100,
  },
]

export default function ConscientiousnessGame() {
  const router = useRouter()
  const [currentStage, setCurrentStage] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: any }>({})

  // State for prioritization game
  const [taskOrder, setTaskOrder] = useState<string[]>([])
  const [draggedTask, setDraggedTask] = useState<string | null>(null)

  // State for time allocation game
  const [timeAllocations, setTimeAllocations] = useState<{ [key: string]: number }>({
    act1: 2, // Default allocations
    act2: 2,
    act3: 2,
    act4: 2,
  })

  // State for quality control game
  const [foundErrors, setFoundErrors] = useState<{ [key: string]: boolean }>({})

  // State for resource management game
  const [resourceAllocations, setResourceAllocations] = useState<{ [key: string]: number }>({
    res1: 33, // Default allocations
    res2: 33,
    res3: 34,
  })

  // Start the game
  const startGame = () => {
    setShowInstructions(false)
  }

  // Handle completing the current stage
  const completeStage = (stageScore: number) => {
    // Save the score for this stage
    setScore((prevScore) => prevScore + stageScore)

    // Move to next stage or show results
    if (currentStage < gameData.length - 1) {
      setCurrentStage(currentStage + 1)
    } else {
      setShowResults(true)
    }
  }

  // Handle task prioritization
  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId)
  }

  const handleDragOver = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault()
    if (!draggedTask || draggedTask === targetTaskId) return

    // Reorder the tasks
    const newOrder = [...taskOrder]
    const draggedIndex = newOrder.indexOf(draggedTask)
    const targetIndex = newOrder.indexOf(targetTaskId)

    if (draggedIndex !== -1 && targetIndex !== -1) {
      newOrder.splice(draggedIndex, 1)
      newOrder.splice(targetIndex, 0, draggedTask)
      setTaskOrder(newOrder)
    }
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
  }

  const submitTaskOrder = () => {
    // Calculate score based on optimal order
    // Ideal order: High importance/urgency first, then medium, then low
    const stage = gameData[currentStage]
    if (stage.type !== "prioritization") return

    const tasks = stage.tasks
    const idealOrder = tasks
      .sort((a, b) => {
        const importanceScore = (imp: string) => (imp === "High" ? 3 : imp === "Medium" ? 2 : 1)
        const urgencyScore = (urg: string) => (urg === "High" ? 3 : urg === "Medium" ? 2 : 1)

        const scoreA = importanceScore(a.importance) * 2 + urgencyScore(a.urgency)
        const scoreB = importanceScore(b.importance) * 2 + urgencyScore(b.urgency)

        return scoreB - scoreA // Descending order
      })
      .map((task) => task.id)

    // Compare user order with ideal order
    let matchScore = 0
    taskOrder.forEach((taskId, index) => {
      const idealIndex = idealOrder.indexOf(taskId)
      // Award points based on how close to ideal position
      // 3 points if exact position, 2 if off by 1, 1 if off by 2, 0 if off by 3+
      const positionDiff = Math.abs(index - idealIndex)
      matchScore += positionDiff === 0 ? 3 : positionDiff === 1 ? 2 : positionDiff === 2 ? 1 : 0
    })

    // Convert to a 0-100 scale
    const maxPossibleScore = tasks.length * 3
    const normalizedScore = Math.round((matchScore / maxPossibleScore) * 100)

    // Save answer and score
    setAnswers({ ...answers, [stage.id]: taskOrder })
    completeStage(normalizedScore)
  }

  // Handle time allocation
  const updateTimeAllocation = (activityId: string, hours: number) => {
    // Calculate remaining hours
    const stage = gameData[currentStage]
    if (stage.type !== "time_allocation") return

    const currentTotal = Object.values(timeAllocations).reduce((sum, val) => sum + val, 0)
    const otherActivitiesHours = currentTotal - timeAllocations[activityId]
    const remainingHours = stage.totalHours - otherActivitiesHours

    // Ensure we don't exceed total hours
    const newHours = Math.min(hours, remainingHours)

    setTimeAllocations({ ...timeAllocations, [activityId]: newHours })
  }

  const submitTimeAllocation = () => {
    const stage = gameData[currentStage]
    if (stage.type !== "time_allocation") return

    // Calculate score based on balanced allocation
    // Ideal: Research (2h), Planning (2h), Execution (3h), Review (1h)
    const idealAllocation = {
      act1: 2, // Research
      act2: 2, // Planning
      act3: 3, // Execution
      act4: 1, // Review
    }

    // Calculate deviation from ideal
    let totalDeviation = 0
    Object.keys(idealAllocation).forEach((actId) => {
      const ideal = idealAllocation[actId as keyof typeof idealAllocation]
      const actual = timeAllocations[actId]
      totalDeviation += Math.abs(ideal - actual)
    })

    // Convert to a 0-100 scale (lower deviation = higher score)
    // Max possible deviation is 2x total hours = 16
    const normalizedScore = Math.round(100 - (totalDeviation / 16) * 100)

    // Save answer and score
    setAnswers({ ...answers, [stage.id]: timeAllocations })
    completeStage(normalizedScore)
  }

  // Handle decision scenario
  const submitDecision = (optionId: string, optionScore: number) => {
    const stage = gameData[currentStage]
    if (stage.type !== "decision_scenario") return

    // Convert option score (1-3) to 0-100 scale
    const normalizedScore = Math.round((optionScore / 3) * 100)

    // Save answer and score
    setAnswers({ ...answers, [stage.id]: optionId })
    completeStage(normalizedScore)
  }

  // Handle quality control
  const toggleError = (sectionIndex: number) => {
    const sectionId = `section${sectionIndex}`
    setFoundErrors({ ...foundErrors, [sectionId]: !foundErrors[sectionId] })
  }

  const submitQualityControl = () => {
    const stage = gameData[currentStage]
    if (stage.type !== "quality_control") return

    // Calculate score based on correctly identified errors
    const sections = stage.document.sections
    let correctIdentifications = 0
    let totalErrors = 0

    sections.forEach((section, index) => {
      const sectionId = `section${index}`
      if (section.hasError) {
        totalErrors++
        if (foundErrors[sectionId]) {
          correctIdentifications++
        }
      } else {
        // Penalize false positives
        if (foundErrors[sectionId]) {
          correctIdentifications--
        }
      }
    })

    // Convert to a 0-100 scale
    const normalizedScore = Math.round((correctIdentifications / totalErrors) * 100)

    // Save answer and score
    setAnswers({ ...answers, [stage.id]: foundErrors })
    completeStage(Math.max(0, normalizedScore)) // Ensure score isn't negative
  }

  // Handle resource management
  const updateResourceAllocation = (resourceId: string, value: number) => {
    const stage = gameData[currentStage]
    if (stage.type !== "resource_management") return

    // Calculate how to distribute the remaining points
    const currentTotal = Object.values(resourceAllocations).reduce((sum, val) => sum + val, 0)
    const otherResourcesPoints = currentTotal - resourceAllocations[resourceId]
    const remainingPoints = stage.totalPoints - otherResourcesPoints

    // Ensure we don't exceed total points
    const newValue = Math.min(value, remainingPoints)

    setResourceAllocations({ ...resourceAllocations, [resourceId]: newValue })
  }

  const submitResourceAllocation = () => {
    const stage = gameData[currentStage]
    if (stage.type !== "resource_management") return

    // Calculate score based on balanced allocation
    // Ideal: Quality (40%), Speed (30%), Cost (30%)
    const idealAllocation = {
      res1: 40, // Quality
      res2: 30, // Speed
      res3: 30, // Cost
    }

    // Calculate deviation from ideal
    let totalDeviation = 0
    Object.keys(idealAllocation).forEach((resId) => {
      const ideal = idealAllocation[resId as keyof typeof idealAllocation]
      const actual = resourceAllocations[resId]
      totalDeviation += Math.abs(ideal - actual)
    })

    // Convert to a 0-100 scale (lower deviation = higher score)
    // Max possible deviation is 2x total points = 200
    const normalizedScore = Math.round(100 - (totalDeviation / 200) * 100)

    // Save answer and score
    setAnswers({ ...answers, [stage.id]: resourceAllocations })
    completeStage(normalizedScore)
  }

  // Initialize task order when stage changes
  useEffect(() => {
    const stage = gameData[currentStage]
    if (stage.type === "prioritization") {
      // Initialize with random order
      setTaskOrder(stage.tasks.map((task) => task.id).sort(() => Math.random() - 0.5))
    }
  }, [currentStage])

  // Navigate to next game
  const handleContinue = () => {
    setIsCompleting(true)

    // Normalize final score to 0-100
    const finalScore = Math.round(score / gameData.length)

    // Store the score in localStorage
    localStorage.setItem("conscientiousness_score", finalScore.toString())

    // Navigate to next trait game
    setTimeout(() => {
      router.push("/personality-radar/extraversion")
    }, 1500)
  }

  // Current stage data
  const currentStageData = gameData[currentStage]

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-8 flex flex-col items-center justify-center text-center"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-6 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm backdrop-blur-sm"
        >
          <Lightbulb className="mr-2 h-4 w-4 text-purple-300" />
          <span className="text-purple-300">Conscientiousness Assessment</span>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-4 text-3xl font-bold md:text-4xl"
        >
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Time Crunch Challenge
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="max-w-3xl text-lg text-purple-200"
        >
          Manage your virtual workday by completing various challenges to reveal your organizational skills and
          attention to detail.
        </motion.p>
      </motion.div>

      {/* Progress Bar */}
      {!showInstructions && !showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mb-8"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-purple-300">
              Challenge {currentStage + 1} of {gameData.length}
            </span>
            <span className="text-sm text-purple-300">
              {Math.round(((currentStage + 1) / gameData.length) * 100)}% Complete
            </span>
          </div>
          <Progress
            value={((currentStage + 1) / gameData.length) * 100}
            className="h-2 bg-purple-900/40"
            indicatorClassName="bg-gradient-to-r from-indigo-500 to-blue-500"
          />
        </motion.div>
      )}

      {/* Instructions */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mb-8 overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 p-6 backdrop-blur-md"
          >
            <h2 className="mb-4 text-2xl font-bold text-white">How to Play</h2>

            <div className="mb-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600/30 text-indigo-300">
                  1
                </div>
                <p className="text-purple-200">
                  You'll face five different challenges that test your organizational skills, attention to detail, and
                  time management.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600/30 text-indigo-300">
                  2
                </div>
                <p className="text-purple-200">
                  Each challenge uses a different interaction method: prioritizing tasks, allocating time, making
                  decisions, finding errors, and managing resources.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600/30 text-indigo-300">
                  3
                </div>
                <p className="text-purple-200">
                  Your performance in each challenge will contribute to your overall Conscientiousness score.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600/30 text-indigo-300">
                  4
                </div>
                <p className="text-purple-200">
                  The more organized, detail-oriented, and methodical your approach, the higher your score will be.
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={startGame}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-300 hover:scale-105"
              >
                Start Challenge <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Content */}
      <AnimatePresence mode="wait">
        {!showInstructions && !showResults && (
          <motion.div
            key={currentStage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mb-8 overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 backdrop-blur-md"
          >
            <div className="p-6">
              <h2 className="mb-6 text-2xl font-bold text-white">{currentStageData.title}</h2>
              <p className="mb-8 text-lg text-purple-200">{currentStageData.description}</p>

              {/* Task Prioritization Game */}
              {currentStageData.type === "prioritization" && (
                <div className="space-y-6">
                  <div className="mb-4 rounded-xl bg-indigo-900/20 p-4">
                    <p className="text-purple-200">
                      Drag and drop the tasks to arrange them in the order you would complete them. Consider both
                      importance and urgency.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {taskOrder.map((taskId, index) => {
                      const task = currentStageData.tasks.find((t) => t.id === taskId)
                      if (!task) return null

                      return (
                        <div
                          key={taskId}
                          draggable
                          onDragStart={() => handleDragStart(taskId)}
                          onDragOver={(e) => handleDragOver(e, taskId)}
                          onDragEnd={handleDragEnd}
                          className={`flex cursor-grab items-center justify-between rounded-xl border ${
                            draggedTask === taskId
                              ? "border-indigo-500/50 bg-indigo-900/30"
                              : "border-purple-500/20 bg-purple-900/10"
                          } p-4 transition-all duration-200 hover:border-indigo-500/30 hover:bg-indigo-900/20 active:cursor-grabbing`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600/20 to-indigo-600/40 text-xl">
                              {task.icon}
                            </div>
                            <div>
                              <h3 className="font-medium text-white">{task.title}</h3>
                              <div className="flex gap-2 text-xs">
                                <span
                                  className={`rounded-full px-2 py-0.5 ${
                                    task.importance === "High"
                                      ? "bg-pink-900/30 text-pink-300"
                                      : task.importance === "Medium"
                                        ? "bg-purple-900/30 text-purple-300"
                                        : "bg-blue-900/30 text-blue-300"
                                  }`}
                                >
                                  Importance: {task.importance}
                                </span>
                                <span
                                  className={`rounded-full px-2 py-0.5 ${
                                    task.urgency === "High"
                                      ? "bg-red-900/30 text-red-300"
                                      : task.urgency === "Medium"
                                        ? "bg-yellow-900/30 text-yellow-300"
                                        : "bg-green-900/30 text-green-300"
                                  }`}
                                >
                                  Urgency: {task.urgency}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-900/40 text-indigo-300">
                            {index + 1}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex justify-center">
                    <Button
                      onClick={submitTaskOrder}
                      className="bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-300 hover:scale-105"
                    >
                      Submit Order <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Time Allocation Game */}
              {currentStageData.type === "time_allocation" && (
                <div className="space-y-6">
                  <div className="mb-4 rounded-xl bg-indigo-900/20 p-4">
                    <p className="text-purple-200">
                      Adjust the sliders to allocate your 8-hour workday across these activities. The total must equal 8
                      hours.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {currentStageData.activities.map((activity) => (
                      <div key={activity.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{activity.icon}</span>
                            <span className="font-medium text-white">{activity.name}</span>
                          </div>
                          <span className="rounded-full bg-indigo-900/30 px-3 py-1 text-sm text-indigo-300">
                            {timeAllocations[activity.id]} hours
                          </span>
                        </div>
                        <p className="mb-2 text-sm text-purple-200">{activity.description}</p>
                        <Slider
                          value={[timeAllocations[activity.id]]}
                          min={0}
                          max={8}
                          step={0.5}
                          onValueChange={(value) => updateTimeAllocation(activity.id, value[0])}
                          className="py-2"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl bg-indigo-900/20 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">Total Allocated</span>
                      <span
                        className={`font-bold ${
                          Object.values(timeAllocations).reduce((sum, val) => sum + val, 0) ===
                          currentStageData.totalHours
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {Object.values(timeAllocations).reduce((sum, val) => sum + val, 0)} /{" "}
                        {currentStageData.totalHours} hours
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      onClick={submitTimeAllocation}
                      disabled={
                        Object.values(timeAllocations).reduce((sum, val) => sum + val, 0) !==
                        currentStageData.totalHours
                      }
                      className="bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-300 hover:scale-105"
                    >
                      Submit Allocation <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Decision Scenario Game */}
              {currentStageData.type === "decision_scenario" && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2">
                    <div className="relative mb-6 overflow-hidden rounded-xl md:mb-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-blue-600/20"></div>
                      <img
                        src={currentStageData.image || "/placeholder.svg"}
                        alt={currentStageData.title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="space-y-4">
                      {currentStageData.options.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => submitDecision(option.id, option.score)}
                          className="w-full rounded-xl border border-purple-500/20 bg-purple-900/10 p-4 text-left transition-all duration-300 hover:border-indigo-500/30 hover:bg-indigo-900/20"
                        >
                          <p className="text-purple-200">{option.text}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quality Control Game */}
              {currentStageData.type === "quality_control" && (
                <div className="space-y-6">
                  <div className="mb-4 rounded-xl bg-indigo-900/20 p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="mt-1 h-5 w-5 shrink-0 text-indigo-300" />
                      <p className="text-purple-200">
                        Review the document below and click on any sections that contain errors. Look for calculation
                        mistakes, formatting inconsistencies, or other issues.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-purple-500/20 bg-purple-900/10 p-6">
                    <h3 className="mb-4 text-xl font-bold text-white">{currentStageData.document.title}</h3>

                    <div className="space-y-6">
                      {currentStageData.document.sections.map((section, index) => (
                        <div
                          key={index}
                          onClick={() => toggleError(index)}
                          className={`cursor-pointer rounded-lg p-4 transition-all duration-200 ${
                            foundErrors[`section${index}`]
                              ? "border border-indigo-500/50 bg-indigo-900/30"
                              : "bg-purple-900/10 hover:bg-indigo-900/20"
                          }`}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <h4 className="font-medium text-white">{section.heading}</h4>
                            {foundErrors[`section${index}`] && (
                              <div className="rounded-full bg-indigo-900/40 px-3 py-1 text-xs text-indigo-300">
                                Error Flagged
                              </div>
                            )}
                          </div>
                          <p className="whitespace-pre-line text-purple-200">{section.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      onClick={submitQualityControl}
                      className="bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-300 hover:scale-105"
                    >
                      Submit Review <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Resource Management Game */}
              {currentStageData.type === "resource_management" && (
                <div className="space-y-6">
                  <div className="mb-4 rounded-xl bg-indigo-900/20 p-4">
                    <div className="flex items-start gap-2">
                      <BarChart3 className="mt-1 h-5 w-5 shrink-0 text-indigo-300" />
                      <p className="text-purple-200">
                        Adjust the sliders to allocate your 100 points across these project priorities. Your allocation
                        reflects what you value most in project management.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {currentStageData.resources.map((resource) => (
                      <div key={resource.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{resource.icon}</span>
                            <span className="font-medium text-white">{resource.name}</span>
                          </div>
                          <span className="rounded-full bg-indigo-900/30 px-3 py-1 text-sm text-indigo-300">
                            {resourceAllocations[resource.id]} points
                          </span>
                        </div>
                        <p className="mb-2 text-sm text-purple-200">{resource.description}</p>
                        <Slider
                          value={[resourceAllocations[resource.id]]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(value) => updateResourceAllocation(resource.id, value[0])}
                          className="py-2"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl bg-indigo-900/20 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">Total Allocated</span>
                      <span
                        className={`font-bold ${
                          Object.values(resourceAllocations).reduce((sum, val) => sum + val, 0) ===
                          currentStageData.totalPoints
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {Object.values(resourceAllocations).reduce((sum, val) => sum + val, 0)} /{" "}
                        {currentStageData.totalPoints} points
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      onClick={submitResourceAllocation}
                      disabled={
                        Object.values(resourceAllocations).reduce((sum, val) => sum + val, 0) !==
                        currentStageData.totalPoints
                      }
                      className="bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-300 hover:scale-105"
                    >
                      Submit Allocation <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mb-8 overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 p-6 backdrop-blur-md"
          >
            <h2 className="mb-4 text-2xl font-bold text-white">Challenge Results</h2>

            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-lg font-medium text-purple-200">Conscientiousness Score</span>
                <span className="text-lg font-bold text-indigo-300">{Math.round(score / gameData.length)}/100</span>
              </div>
              <Progress
                value={Math.round(score / gameData.length)}
                className="h-3 bg-purple-900/40"
                indicatorClassName="bg-gradient-to-r from-indigo-500 to-blue-500"
              />
            </div>

            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-black/60">
                <TabsTrigger
                  value="summary"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600/50 data-[state=active]:to-blue-600/50 data-[state=active]:text-white"
                >
                  Summary
                </TabsTrigger>
                <TabsTrigger
                  value="breakdown"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600/50 data-[state=active]:to-blue-600/50 data-[state=active]:text-white"
                >
                  Challenge Breakdown
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-4 space-y-4">
                <div className="rounded-xl bg-indigo-900/10 p-4">
                  <h3 className="mb-2 font-medium text-white">Your Conscientiousness Profile</h3>
                  <p className="text-purple-200">
                    {Math.round(score / gameData.length) >= 80
                      ? "You demonstrated excellent organizational skills and attention to detail. You prioritize effectively, manage your time efficiently, and have a methodical approach to tasks."
                      : Math.round(score / gameData.length) >= 60
                        ? "You showed good organizational skills with room for improvement in prioritization and time management. You balance structure with flexibility in your approach to tasks."
                        : "You may benefit from developing stronger organizational skills and learning to prioritize tasks more effectively. You tend to be more spontaneous and flexible in your approach."}
                  </p>
                </div>

                <div className="rounded-xl bg-indigo-900/10 p-4">
                  <h3 className="mb-2 font-medium text-white">Career Implications</h3>
                  <p className="text-purple-200">
                    {Math.round(score / gameData.length) >= 80
                      ? "Your high conscientiousness suggests you may excel in roles requiring precision, planning, and reliability, such as project management, finance, quality assurance, or healthcare."
                      : Math.round(score / gameData.length) >= 60
                        ? "Your balanced approach makes you adaptable to both structured environments and those requiring flexibility, opening doors to a wide range of career options."
                        : "Your spontaneous nature may be valuable in fast-paced environments, creative fields, or roles that require adapting quickly to changing circumstances."}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="breakdown" className="mt-4 space-y-4">
                {gameData.map((stage, index) => (
                  <div key={index} className="rounded-xl bg-indigo-900/10 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-medium text-white">{stage.title}</h3>
                      <span className="rounded-full bg-indigo-900/30 px-3 py-1 text-xs text-indigo-300">
                        {index < currentStage || showResults
                          ? `${answers[stage.id] ? "Completed" : "Skipped"}`
                          : "Pending"}
                      </span>
                    </div>
                    <div className="mb-2 h-2 overflow-hidden rounded-full bg-purple-900/40">
                      {index < currentStage || showResults ? (
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"
                          style={{ width: `${index < currentStage ? (answers[stage.id] ? "100%" : "0%") : "0%"}` }}
                        ></div>
                      ) : null}
                    </div>
                    <p className="text-sm text-purple-200">{stage.description}</p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-center">
              <Button
                onClick={handleContinue}
                disabled={isCompleting}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-300 hover:scale-105"
              >
                {isCompleting ? (
                  <>
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Continue to Next Assessment <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      {!showInstructions && !showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="flex justify-between"
        >
          <Button
            onClick={() => router.push("/personality-radar/openness")}
            variant="outline"
            className="border-purple-500/30 bg-purple-900/20 text-purple-200 transition-all duration-300 hover:border-purple-400/50 hover:bg-purple-800/30"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Previous Assessment
          </Button>
        </motion.div>
      )}
    </div>
  )
}

