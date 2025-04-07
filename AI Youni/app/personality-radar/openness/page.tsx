"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, ArrowLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

// Game scenarios for Explorer's Dilemma
const scenarios = [
  {
    id: 1,
    question: "You discover an unmarked path while hiking. What do you do?",
    options: [
      { id: "a", text: "Follow it to see where it leads", score: 10 },
      { id: "b", text: "Mark it on your map for future exploration", score: 7 },
      { id: "c", text: "Research it first before deciding", score: 4 },
      { id: "d", text: "Stick to the main trail for safety", score: 1 },
    ],
    image: "/placeholder.svg?height=300&width=500",
  },
  {
    id: 2,
    question: "You're offered a chance to try an unusual food from another culture. Your response?",
    options: [
      { id: "a", text: "Try it enthusiastically", score: 10 },
      { id: "b", text: "Try a small portion cautiously", score: 7 },
      { id: "c", text: "Ask about the ingredients first", score: 4 },
      { id: "d", text: "Politely decline", score: 1 },
    ],
    image: "/placeholder.svg?height=300&width=500",
  },
  {
    id: 3,
    question: "A friend suggests an abstract art exhibition. How do you feel?",
    options: [
      { id: "a", text: "Excited to experience something different", score: 10 },
      { id: "b", text: "Curious but not sure if you'll enjoy it", score: 7 },
      { id: "c", text: "Hesitant but willing to give it a try", score: 4 },
      { id: "d", text: "Prefer something more conventional", score: 1 },
    ],
    image: "/placeholder.svg?height=300&width=500",
  },
  {
    id: 4,
    question: "You have free time to learn something new. What would you choose?",
    options: [
      { id: "a", text: "An experimental art form or philosophy", score: 10 },
      { id: "b", text: "A new language or cultural practice", score: 7 },
      { id: "c", text: "A practical skill with clear applications", score: 4 },
      { id: "d", text: "Deepen knowledge in a familiar area", score: 1 },
    ],
    image: "/placeholder.svg?height=300&width=500",
  },
  {
    id: 5,
    question: "Your team needs to solve a complex problem. Your approach?",
    options: [
      { id: "a", text: "Suggest unconventional, creative solutions", score: 10 },
      { id: "b", text: "Combine traditional methods with new ideas", score: 7 },
      { id: "c", text: "Apply established methods with some tweaks", score: 4 },
      { id: "d", text: "Follow proven procedures that worked before", score: 1 },
    ],
    image: "/placeholder.svg?height=300&width=500",
  },
]

export default function OpennessGame() {
  const router = useRouter()
  const [currentScenario, setCurrentScenario] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<{ [key: number]: string }>({})
  const [score, setScore] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")

  const handleOptionSelect = (scenarioId: number, optionId: string, optionScore: number) => {
    // Store the selection
    setSelectedOptions({
      ...selectedOptions,
      [scenarioId]: optionId,
    })

    // Calculate feedback based on score
    let feedback = ""
    if (optionScore >= 8) {
      feedback = "You chose to embrace the unknown! Your curiosity and openness to new experiences are notable traits."
    } else if (optionScore >= 5) {
      feedback =
        "You're balancing curiosity with caution. You're open to new experiences while maintaining some practical considerations."
    } else {
      feedback = "You prefer the familiar and established paths. Stability and predictability are important to you."
    }

    setFeedbackText(feedback)
    setShowFeedback(true)

    // Update the total score
    const scenarioScore = optionScore
    setScore((prevScore) => prevScore + scenarioScore)

    // Auto-advance after feedback
    setTimeout(() => {
      setShowFeedback(false)
      setTimeout(() => {
        if (currentScenario < scenarios.length - 1) {
          setCurrentScenario(currentScenario + 1)
        } else {
          completeGame()
        }
      }, 300)
    }, 2000)
  }

  const completeGame = () => {
    setIsCompleting(true)

    // Normalize score to 0-100 scale
    const maxPossibleScore = scenarios.length * 10
    const normalizedScore = Math.round((score / maxPossibleScore) * 100)

    // Store the score in localStorage or sessionStorage
    localStorage.setItem("openness_score", normalizedScore.toString())

    // Navigate to next trait game
    setTimeout(() => {
      router.push("/personality-radar/conscientiousness")
    }, 1500)
  }

  const scenario = scenarios[currentScenario]
  const progress = ((currentScenario + 1) / scenarios.length) * 100

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
          <Sparkles className="mr-2 h-4 w-4 text-purple-300" />
          <span className="text-purple-300">Openness Assessment</span>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-4 text-3xl font-bold md:text-4xl"
        >
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Explorer's Dilemma
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="max-w-3xl text-lg text-purple-200"
        >
          Navigate through scenarios that reveal your creativity, curiosity, and openness to new experiences.
        </motion.p>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mb-8"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-purple-300">
            Scenario {currentScenario + 1} of {scenarios.length}
          </span>
          <span className="text-sm text-purple-300">{Math.round(progress)}% Complete</span>
        </div>
        <Progress
          value={progress}
          className="h-2 bg-purple-900/40"
          indicatorClassName="bg-gradient-to-r from-pink-500 to-purple-500"
        />
      </motion.div>

      {/* Game Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScenario}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="mb-8 overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 backdrop-blur-md"
        >
          <div className="grid md:grid-cols-2">
            {/* Scenario Image */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 to-purple-600/20"></div>
              <img
                src={scenario.image || "/placeholder.svg"}
                alt={`Scenario ${currentScenario + 1}`}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Scenario Question and Options */}
            <div className="p-6">
              <h2 className="mb-6 text-xl font-bold text-white">{scenario.question}</h2>

              <div className="space-y-4">
                {scenario.options.map((option) => (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay:
                        0.7 +
                        Number.parseInt(
                          option.id.replace("a", "0").replace("b", "1").replace("c", "2").replace("d", "3"),
                        ) *
                          0.1,
                      duration: 0.5,
                    }}
                    onClick={() => handleOptionSelect(scenario.id, option.id, option.score)}
                    disabled={showFeedback || isCompleting}
                    className={`group relative w-full overflow-hidden rounded-xl border border-purple-500/20 bg-purple-900/10 p-4 text-left transition-all duration-300 hover:border-purple-500/40 hover:bg-purple-900/20 ${
                      selectedOptions[scenario.id] === option.id
                        ? "border-pink-500/50 bg-gradient-to-br from-pink-900/30 to-purple-900/30"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          selectedOptions[scenario.id] === option.id
                            ? "bg-gradient-to-r from-pink-500 to-purple-500"
                            : "bg-purple-900/40"
                        }`}
                      >
                        {selectedOptions[scenario.id] === option.id ? (
                          <Check className="h-4 w-4 text-white" />
                        ) : (
                          <span className="text-sm font-medium text-purple-200">{option.id.toUpperCase()}</span>
                        )}
                      </div>
                      <span className="text-purple-200">{option.text}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Feedback Message */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8 rounded-xl border border-pink-500/30 bg-gradient-to-r from-pink-900/20 to-purple-900/20 p-4 text-center"
          >
            <p className="text-lg text-purple-200">{feedbackText}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="flex justify-between"
      >
        <Button
          onClick={() => router.push("/personality-radar")}
          variant="outline"
          className="border-purple-500/30 bg-purple-900/20 text-purple-200 transition-all duration-300 hover:border-purple-400/50 hover:bg-purple-800/30"
          disabled={isCompleting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Introduction
        </Button>

        {isCompleting && (
          <Button disabled className="bg-gradient-to-r from-pink-600 to-purple-600">
            <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            Calculating Results...
          </Button>
        )}
      </motion.div>
    </div>
  )
}

