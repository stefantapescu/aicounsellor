"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, BrainCircuit, Sparkles, Briefcase, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RoboYouniMascot } from "@/components/robo-youni-mascot"
import { VoiceWaveform } from "@/components/voice-waveform"

export default function NeuralProfilePage() {
  const router = useRouter()
  const [analysisStage, setAnalysisStage] = useState(0)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [displayedText, setDisplayedText] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const analysisStages = [
    {
      title: "Analyzing Personality Patterns",
      description: "Mapping neural pathways and cognitive preferences",
      icon: <BrainCircuit className="h-5 w-5" />,
      color: "from-pink-600 to-purple-600",
    },
    {
      title: "Processing Interest Clusters",
      description: "Identifying connections between your selected interests",
      icon: <Sparkles className="h-5 w-5" />,
      color: "from-indigo-600 to-blue-600",
    },
    {
      title: "Evaluating Career Alignment",
      description: "Matching your profile with optimal career paths",
      icon: <Briefcase className="h-5 w-5" />,
      color: "from-purple-600 to-indigo-600",
    },
    {
      title: "Generating Neural Profile",
      description: "Creating your personalized AI Youni experience",
      icon: <Target className="h-5 w-5" />,
      color: "from-blue-600 to-cyan-600",
    },
  ]

  const completionMessage =
    "Your neural profile has been successfully created! I've analyzed your personality traits, interests, and goals to create a personalized AI Youni experience tailored specifically to you. Your journey to discovering the perfect career path begins now!"

  // Simulate analysis progress
  useEffect(() => {
    if (analysisStage >= analysisStages.length) return

    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            if (analysisStage < analysisStages.length - 1) {
              setAnalysisStage((prevStage) => prevStage + 1)
              setAnalysisProgress(0)
            } else {
              setIsComplete(true)
              setIsAiSpeaking(true)
            }
          }, 500)
          return 100
        }
        return prev + 2
      })
    }, 50)

    return () => clearInterval(interval)
  }, [analysisStage, analysisStages.length])

  // Simulate AI speaking with text typing effect
  useEffect(() => {
    if (!isComplete) return

    let charIndex = 0
    setDisplayedText("")

    const typingInterval = setInterval(() => {
      if (charIndex < completionMessage.length) {
        setDisplayedText((prev) => prev + completionMessage.charAt(charIndex))
        charIndex++
      } else {
        clearInterval(typingInterval)
        setTimeout(() => {
          setIsAiSpeaking(false)
        }, 1000)
      }
    }, 30)

    return () => clearInterval(typingInterval)
  }, [isComplete])

  // Neural network visualization
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Create nodes
    const nodes: { x: number; y: number; size: number; color: string; vx: number; vy: number }[] = []
    const nodeCount = 50
    const colors = [
      "rgba(236, 72, 153, 0.7)", // pink
      "rgba(139, 92, 246, 0.7)", // purple
      "rgba(79, 70, 229, 0.7)", // indigo
    ]

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      })
    }

    // Animation variables
    let animationFrameId: number
    let time = 0

    // Draw function
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      time += 0.01

      // Update and draw nodes
      nodes.forEach((node) => {
        // Move node
        node.x += node.vx
        node.y += node.vy

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1

        // Draw node
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.fill()
      })

      // Draw connections
      ctx.globalAlpha = 0.2
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x
          const dy = nodes[j].y - nodes[i].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)

            const gradient = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y)
            gradient.addColorStop(0, nodes[i].color)
            gradient.addColorStop(1, nodes[j].color)

            ctx.strokeStyle = gradient
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  const handleContinue = () => {
    router.push("/dashboard")
  }

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
              <BrainCircuit className="mr-2 h-4 w-4 text-purple-300" />
              <span className="text-purple-300">Step 4: Neural Mapping</span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mb-2 text-center text-3xl font-bold md:text-4xl"
            >
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                {isComplete ? "Neural Profile Complete!" : "Creating Your Neural Profile"}
              </span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-center text-lg text-purple-200"
            >
              {isComplete
                ? "Your personalized AI Youni experience is ready"
                : "Please wait while our AI analyzes your responses"}
            </motion.p>
          </div>

          {!isComplete ? (
            <div className="mb-8">
              {/* Neural Network Visualization */}
              <div className="relative mb-8 h-64 overflow-hidden rounded-2xl border border-purple-500/20">
                <canvas ref={canvasRef} className="h-full w-full"></canvas>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-black/60 px-4 py-2 backdrop-blur-md">
                    <span className="text-sm text-purple-300">Neural Mapping in Progress</span>
                  </div>
                </div>
              </div>

              {/* Current Analysis Stage */}
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r ${analysisStages[analysisStage].color}`}
                    >
                      {analysisStages[analysisStage].icon}
                    </div>
                    <span className="font-medium text-white">{analysisStages[analysisStage].title}</span>
                  </div>
                  <span className="text-sm text-purple-300">{analysisProgress}%</span>
                </div>
                <Progress
                  value={analysisProgress}
                  className="h-2 bg-purple-900/40"
                  indicatorClassName={`bg-gradient-to-r ${analysisStages[analysisStage].color}`}
                />
                <p className="mt-2 text-sm text-purple-200">{analysisStages[analysisStage].description}</p>
              </div>

              {/* Other Stages */}
              <div className="space-y-4">
                {analysisStages.map((stage, index) => {
                  if (index === analysisStage) return null

                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-2 ${
                        index < analysisStage ? "text-purple-300" : "text-purple-500"
                      }`}
                    >
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full ${
                          index < analysisStage ? `bg-gradient-to-r ${stage.color}` : "bg-purple-900/40"
                        }`}
                      >
                        {stage.icon}
                      </div>
                      <span>{stage.title}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="mb-8 flex flex-col items-center md:flex-row md:items-start md:gap-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="mb-6 flex-shrink-0 md:mb-0"
              >
                <div className="relative">
                  <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-pink-600/20 via-purple-600/20 to-indigo-600/20 blur-xl"></div>
                  <RoboYouniMascot width={150} height={150} />
                  {isAiSpeaking && (
                    <div className="absolute -bottom-4 left-1/2 w-32 -translate-x-1/2 transform">
                      <VoiceWaveform isActive={true} className="h-8" />
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="flex-1"
              >
                <div className="relative min-h-[120px] rounded-2xl border border-purple-500/20 bg-purple-900/10 p-6">
                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-pink-600/5 blur-3xl"></div>
                  <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-purple-600/5 blur-3xl"></div>
                  <p className="relative z-10 text-lg text-purple-200">
                    {displayedText}
                    {isAiSpeaking && <span className="ml-1 animate-pulse">|</span>}
                  </p>
                </div>
              </motion.div>
            </div>
          )}

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex justify-center"
          >
            <Button
              onClick={handleContinue}
              disabled={!isComplete || isAiSpeaking}
              className="group relative overflow-hidden bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 text-lg font-medium transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center">
                Enter Your Neural Dashboard
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <span className="absolute inset-0 z-0 bg-gradient-to-r from-pink-700 to-purple-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

