"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Briefcase, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

// Interest categories with options
const interestCategories = [
  {
    name: "Technology",
    options: [
      { id: "tech-1", label: "Artificial Intelligence", icon: "🤖" },
      { id: "tech-2", label: "Web Development", icon: "🌐" },
      { id: "tech-3", label: "Data Science", icon: "📊" },
      { id: "tech-4", label: "Cybersecurity", icon: "🔒" },
      { id: "tech-5", label: "Mobile Development", icon: "📱" },
      { id: "tech-6", label: "Game Development", icon: "🎮" },
    ],
  },
  {
    name: "Business",
    options: [
      { id: "biz-1", label: "Entrepreneurship", icon: "💼" },
      { id: "biz-2", label: "Marketing", icon: "📢" },
      { id: "biz-3", label: "Finance", icon: "💰" },
      { id: "biz-4", label: "Management", icon: "📋" },
      { id: "biz-5", label: "Consulting", icon: "🤝" },
      { id: "biz-6", label: "E-commerce", icon: "🛒" },
    ],
  },
  {
    name: "Creative",
    options: [
      { id: "creative-1", label: "Graphic Design", icon: "🎨" },
      { id: "creative-2", label: "Content Creation", icon: "📝" },
      { id: "creative-3", label: "Photography", icon: "📷" },
      { id: "creative-4", label: "Music Production", icon: "🎵" },
      { id: "creative-5", label: "Film & Video", icon: "🎬" },
      { id: "creative-6", label: "Animation", icon: "🎭" },
    ],
  },
  {
    name: "Science",
    options: [
      { id: "science-1", label: "Research", icon: "🔬" },
      { id: "science-2", label: "Healthcare", icon: "⚕️" },
      { id: "science-3", label: "Environmental Science", icon: "🌱" },
      { id: "science-4", label: "Physics", icon: "⚛️" },
      { id: "science-5", label: "Biology", icon: "🧬" },
      { id: "science-6", label: "Chemistry", icon: "⚗️" },
    ],
  },
]

export default function InterestsPage() {
  const router = useRouter()
  const [currentCategory, setCurrentCategory] = useState(0)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleInterestToggle = (interestId: string) => {
    if (selectedInterests.includes(interestId)) {
      setSelectedInterests(selectedInterests.filter((id) => id !== interestId))
    } else {
      // Limit to 3 selections per category
      const categoryInterests = interestCategories[currentCategory].options.map((opt) => opt.id)
      const currentCategorySelections = selectedInterests.filter((id) => categoryInterests.includes(id))

      if (currentCategorySelections.length < 3) {
        setSelectedInterests([...selectedInterests, interestId])
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 2000)
      }
    }
  }

  const handleNext = () => {
    if (currentCategory < interestCategories.length - 1) {
      setCurrentCategory(currentCategory + 1)
    } else {
      setIsSubmitting(true)
      // Simulate API call to save results
      setTimeout(() => {
        router.push("/onboarding/goals")
      }, 1500)
    }
  }

  // Confetti effect
  useEffect(() => {
    if (!showConfetti || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const confettiPieces: {
      x: number
      y: number
      size: number
      color: string
      speed: number
      angle: number
      rotation: number
      rotationSpeed: number
    }[] = []

    // Create confetti pieces
    const colors = ["#EC4899", "#8B5CF6", "#6366F1", "#06B6D4", "#10B981"]
    for (let i = 0; i < 100; i++) {
      confettiPieces.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 100,
        size: Math.random() * 10 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 5 + 2,
        angle: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: Math.random() * 0.2 - 0.1,
      })
    }

    let animationFrameId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      let stillFalling = false
      confettiPieces.forEach((piece) => {
        piece.y += piece.speed
        piece.x += Math.sin(piece.angle) * 2
        piece.rotation += piece.rotationSpeed

        if (piece.y < canvas.height) {
          stillFalling = true
        }

        ctx.save()
        ctx.translate(piece.x, piece.y)
        ctx.rotate(piece.rotation)
        ctx.fillStyle = piece.color
        ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size)
        ctx.restore()
      })

      if (stillFalling && showConfetti) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [showConfetti])

  const category = interestCategories[currentCategory]
  const categoryInterests = category.options.map((opt) => opt.id)
  const currentCategorySelections = selectedInterests.filter((id) => categoryInterests.includes(id))
  const canContinue = currentCategorySelections.length > 0

  return (
    <div className="container mx-auto max-w-3xl">
      {showConfetti && <canvas ref={canvasRef} className="fixed inset-0 z-50 pointer-events-none" />}

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
              <Briefcase className="mr-2 h-4 w-4 text-purple-300" />
              <span className="text-purple-300">Step 2: Interest Mapping</span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mb-2 text-center text-3xl font-bold md:text-4xl"
            >
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                Select Your Interests
              </span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-center text-lg text-purple-200"
            >
              Choose up to 3 interests in each category
            </motion.p>
          </div>

          <div className="mb-8">
            {/* Progress indicators */}
            <div className="mb-8 flex justify-center gap-2">
              {interestCategories.map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                  className={`h-2 w-10 rounded-full ${
                    index === currentCategory
                      ? "bg-gradient-to-r from-pink-500 to-purple-500"
                      : index < currentCategory
                        ? "bg-purple-600"
                        : "bg-purple-900/40"
                  }`}
                ></motion.div>
              ))}
            </div>

            {/* Category Title */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCategory}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6 text-center"
              >
                <h2 className="text-2xl font-bold text-white">{category.name}</h2>
                <p className="text-purple-300">Selected: {currentCategorySelections.length}/3</p>
              </motion.div>
            </AnimatePresence>

            {/* Interest Options */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCategory}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="grid gap-4 sm:grid-cols-2 md:grid-cols-3"
              >
                {category.options.map((option, index) => {
                  const isSelected = selectedInterests.includes(option.id)

                  return (
                    <motion.div
                      key={option.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                      onClick={() => handleInterestToggle(option.id)}
                      className={`group relative cursor-pointer overflow-hidden rounded-xl border ${
                        isSelected
                          ? "border-pink-500/50 bg-gradient-to-br from-pink-900/30 to-purple-900/30"
                          : "border-purple-500/20 bg-purple-900/10 hover:border-purple-500/40"
                      } p-4 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10`}
                    >
                      <div className="absolute -right-10 -top-10 h-20 w-20 rounded-full bg-purple-600/10 opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-100"></div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600/20 to-purple-600/40 text-xl">
                          {option.icon}
                        </div>
                        <span className="font-medium text-white">{option.label}</span>

                        {isSelected && (
                          <div className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex justify-center"
          >
            <Button
              onClick={handleNext}
              disabled={isSubmitting || !canContinue}
              className="group relative overflow-hidden bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 text-lg font-medium transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center">
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : currentCategory < interestCategories.length - 1 ? (
                  <>
                    Next Category
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

