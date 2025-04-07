"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, BrainCircuit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

// Personality trait questions
const personalityQuestions = [
  {
    trait: "Analytical",
    question: "I enjoy solving complex problems and analyzing data.",
    icon: "🧠",
    color: "from-pink-600 to-purple-600",
  },
  {
    trait: "Creative",
    question: "I often come up with unique ideas and innovative solutions.",
    icon: "💡",
    color: "from-indigo-600 to-blue-600",
  },
  {
    trait: "Social",
    question: "I enjoy working with others and building relationships.",
    icon: "👥",
    color: "from-purple-600 to-indigo-600",
  },
  {
    trait: "Leadership",
    question: "I'm comfortable taking charge and directing others.",
    icon: "👑",
    color: "from-blue-600 to-cyan-600",
  },
  {
    trait: "Detail-oriented",
    question: "I pay close attention to details and prefer structured work.",
    icon: "🔍",
    color: "from-cyan-600 to-teal-600",
  },
]

export default function PersonalityPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>(Array(personalityQuestions.length).fill(50))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSliderChange = (value: number[]) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = value[0]
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < personalityQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setIsSubmitting(true)
      // Simulate API call to save results
      setTimeout(() => {
        router.push("/onboarding/interests")
      }, 1500)
    }
  }

  const question = personalityQuestions[currentQuestion]

  return (
    <div className="container mx-auto max-w-3xl">
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
              <BrainCircuit className="mr-2 h-4 w-4 text-purple-300" />
              <span className="text-purple-300">Step 1: Personality Assessment</span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mb-2 text-center text-3xl font-bold md:text-4xl"
            >
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                Discover Your Neural Patterns
              </span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-center text-lg text-purple-200"
            >
              Rate how strongly you identify with each statement
            </motion.p>
          </div>

          <div className="mb-12">
            {/* Progress indicators */}
            <div className="mb-8 flex justify-center gap-2">
              {personalityQuestions.map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                  className={`h-2 w-10 rounded-full ${
                    index === currentQuestion
                      ? "bg-gradient-to-r from-pink-500 to-purple-500"
                      : index < currentQuestion
                        ? "bg-purple-600"
                        : "bg-purple-900/40"
                  }`}
                ></motion.div>
              ))}
            </div>

            {/* Question */}
            <motion.div
              key={currentQuestion}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 rounded-2xl border border-purple-500/20 bg-purple-900/10 p-6"
            >
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-600/20 to-purple-600/40 text-2xl">
                  {question.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{question.trait}</h3>
                </div>
              </div>
              <p className="text-lg text-purple-200">{question.question}</p>
            </motion.div>

            {/* Slider */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mb-8"
            >
              <div className="mb-2 flex justify-between text-sm text-purple-300">
                <span>Strongly Disagree</span>
                <span>Strongly Agree</span>
              </div>
              <Slider
                value={[answers[currentQuestion]]}
                min={0}
                max={100}
                step={1}
                onValueChange={handleSliderChange}
                className="py-4"
              />
              <div className="mt-2 flex justify-center">
                <div
                  className={`rounded-full bg-gradient-to-r ${question.color} px-3 py-1 text-sm font-medium text-white`}
                >
                  {answers[currentQuestion]}%
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex justify-center"
          >
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="group relative overflow-hidden bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 text-lg font-medium transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center">
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : currentQuestion < personalityQuestions.length - 1 ? (
                  <>
                    Next Question
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
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

