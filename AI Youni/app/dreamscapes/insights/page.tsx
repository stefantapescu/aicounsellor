"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, RefreshCw, Sparkles, BrainCircuit, Lightbulb, Briefcase, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HexGrid } from "@/components/hex-grid"
import { FloatingOrbs } from "@/components/floating-orbs"
import { NeuralPathways } from "@/components/neural-pathways"
import Link from "next/link"

// Sample data for the Dreamscapes Workshop Insights
const insightsData = {
  summary:
    "The user demonstrates a strong interest in entrepreneurship, particularly in the hospitality sector, with a focus on financial success, personal growth, and collaborative ventures. Their values of aspiration and business diversification align with potential career paths in the hotel industry, business ownership, and international trade, driven by motivators such as financial gain and entrepreneurial spirit.",
  themes: [
    { name: "entrepreneurship", strength: 92 },
    { name: "hospitality", strength: 85 },
    { name: "business diversification", strength: 78 },
    { name: "international business", strength: 70 },
  ],
  coreValues: [
    { name: "financial success", strength: 95 },
    { name: "personal growth", strength: 88 },
    { name: " collaboration", strength: 75 },
    { name: "aspiration", strength: 82 },
  ],
  interests: [
    { name: "hotel industry", strength: 90 },
    { name: "business ownership", strength: 88 },
    { name: "collaborative ventures", strength: 75 },
    { name: "international trade", strength: 72 },
  ],
  motivators: [
    { name: "financial gain", strength: 94 },
    { name: "personal well-being", strength: 80 },
    { name: "success", strength: 88 },
    { name: "entrepreneurial spirit", strength: 90 },
  ],
  careerPaths: [
    { name: "Hotel Management", match: 92 },
    { name: "Entrepreneurship", match: 90 },
    { name: "Business Development", match: 85 },
    { name: "International Trade", match: 78 },
    { name: "Hospitality Consulting", match: 88 },
  ],
  personalityTraits: [
    { name: "Ambitious", score: 90 },
    { name: "Innovative", score: 85 },
    { name: "Collaborative", score: 75 },
    { name: "Risk-taking", score: 82 },
    { name: "Adaptable", score: 78 },
  ],
}

// Neural network connections for visualization
const connections = [
  { source: "entrepreneurship", target: "hotel industry", strength: 0.8 },
  { source: "entrepreneurship", target: "business ownership", strength: 0.9 },
  { source: "hospitality", target: "hotel industry", strength: 0.95 },
  { source: "business diversification", target: "collaborative ventures", strength: 0.7 },
  { source: "international business", target: "international trade", strength: 0.85 },
  { source: "financial success", target: "financial gain", strength: 0.9 },
  { source: "personal growth", target: "personal well-being", strength: 0.8 },
  { source: "collaboration", target: "collaborative ventures", strength: 0.85 },
  { source: "aspiration", target: "entrepreneurial spirit", strength: 0.75 },
]

export default function DreamscapesInsightsPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeSection, setActiveSection] = useState("summary")
  const [showNetworkGraph, setShowNetworkGraph] = useState(false)
  const networkCanvasRef = useRef<HTMLCanvasElement>(null)
  const radarCanvasRef = useRef<HTMLCanvasElement>(null)
  const bubbleCanvasRef = useRef<HTMLCanvasElement>(null)

  const handleReanalyze = () => {
    setIsAnalyzing(true)
    // Simulate reanalysis
    setTimeout(() => {
      setIsAnalyzing(false)
    }, 3000)
  }

  // Draw network graph visualization
  useEffect(() => {
    if (!networkCanvasRef.current || !showNetworkGraph) return

    const canvas = networkCanvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Create nodes from themes, interests, values, and motivators
    const nodes: {
      [key: string]: { x: number; y: number; radius: number; color: string; category: string; name: string }
    } = {}

    // Add themes as nodes
    insightsData.themes.forEach((theme, i) => {
      const angle = ((Math.PI * 2) / insightsData.themes.length) * i
      const radius = canvas.width * 0.25
      nodes[theme.name] = {
        x: canvas.width / 2 + Math.cos(angle) * radius,
        y: canvas.height / 2 + Math.sin(angle) * radius,
        radius: theme.strength / 10 + 5,
        color: "rgba(139, 92, 246, 0.7)", // Purple
        category: "theme",
        name: theme.name,
      }
    })

    // Add interests as nodes
    insightsData.interests.forEach((interest, i) => {
      const angle = ((Math.PI * 2) / insightsData.interests.length) * i + Math.PI / 4
      const radius = canvas.width * 0.4
      nodes[interest.name] = {
        x: canvas.width / 2 + Math.cos(angle) * radius,
        y: canvas.height / 2 + Math.sin(angle) * radius,
        radius: interest.strength / 10 + 5,
        color: "rgba(79, 70, 229, 0.7)", // Indigo
        category: "interest",
        name: interest.name,
      }
    })

    // Add values as nodes
    insightsData.coreValues.forEach((value, i) => {
      const angle = ((Math.PI * 2) / insightsData.coreValues.length) * i + Math.PI / 2
      const radius = canvas.width * 0.3
      nodes[value.name] = {
        x: canvas.width / 2 + Math.cos(angle) * radius,
        y: canvas.height / 2 + Math.sin(angle) * radius,
        radius: value.strength / 10 + 5,
        color: "rgba(236, 72, 153, 0.7)", // Pink
        category: "value",
        name: value.name,
      }
    })

    // Add motivators as nodes
    insightsData.motivators.forEach((motivator, i) => {
      const angle = ((Math.PI * 2) / insightsData.motivators.length) * i + Math.PI / 3
      const radius = canvas.width * 0.25 // Declare radius here
      nodes[motivator.name] = {
        x: canvas.width / 2 + Math.cos(angle) * radius,
        y: canvas.height / 2 + Math.sin(angle) * radius,
        radius: motivator.strength / 10 + 5,
        color: "rgba(16, 185, 129, 0.7)", // Green
        category: "motivator",
        name: motivator.name,
      }
    })

    // Animation variables
    let animationFrameId: number
    let time = 0

    // Draw function
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      time += 0.005

      // Draw connections
      connections.forEach((connection) => {
        const source = nodes[connection.source]
        const target = nodes[connection.target]

        if (source && target) {
          // Create pulsing effect
          const pulse = Math.sin(time * 2) * 0.5 + 0.5
          const opacity = 0.2 + pulse * 0.3 * connection.strength

          // Draw connection line
          ctx.beginPath()
          ctx.moveTo(source.x, source.y)
          ctx.lineTo(target.x, target.y)

          // Create gradient for connection
          const gradient = ctx.createLinearGradient(source.x, source.y, target.x, target.y)
          gradient.addColorStop(0, source.color.replace("0.7", String(opacity)))
          gradient.addColorStop(1, target.color.replace("0.7", String(opacity)))

          ctx.strokeStyle = gradient
          ctx.lineWidth = 2 * connection.strength
          ctx.stroke()

          // Draw flow particles along the connection
          const particleCount = Math.floor(connection.strength * 3)
          for (let i = 0; i < particleCount; i++) {
            const t = (time * 0.5 + i / particleCount) % 1
            const x = source.x + (target.x - source.x) * t
            const y = source.y + (target.y - source.y) * t

            ctx.beginPath()
            ctx.arc(x, y, 2, 0, Math.PI * 2)
            ctx.fillStyle = gradient
            ctx.fill()
          }
        }
      })

      // Draw nodes
      Object.values(nodes).forEach((node) => {
        // Create pulsing effect
        const pulse = Math.sin(time * 3 + node.x * 0.01) * 0.2 + 0.8

        // Draw glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 2)
        gradient.addColorStop(0, node.color.replace("0.7", "0.7"))
        gradient.addColorStop(1, node.color.replace("0.7", "0"))

        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius * 2 * pulse, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Draw node
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.fill()

        // Draw node border
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
        ctx.lineWidth = 1
        ctx.stroke()

        // Draw node label
        ctx.font = "10px Arial"
        ctx.fillStyle = "white"
        ctx.textAlign = "center"
        ctx.fillText(node.name, node.x, node.y + node.radius + 15)
      })

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [showNetworkGraph])

  // Draw radar chart
  useEffect(() => {
    if (!radarCanvasRef.current) return

    const canvas = radarCanvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Prepare data for radar chart
    const traits = insightsData.personalityTraits.map((trait) => trait.name)
    const scores = insightsData.personalityTraits.map((trait) => trait.score)
    const numTraits = traits.length
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const maxRadius = Math.min(centerX, centerY) * 0.8

    // Animation variables
    let animationFrameId: number
    let progress = 0
    let time = 0

    // Draw function
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      time += 0.01

      if (progress < 1) {
        progress += 0.02
      }

      // Draw radar grid
      for (let level = 1; level <= 5; level++) {
        const radius = maxRadius * (level / 5)

        ctx.beginPath()
        for (let i = 0; i < numTraits; i++) {
          const angle = (Math.PI * 2 * i) / numTraits - Math.PI / 2
          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * radius

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.closePath()
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 + level * 0.05})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Draw axis lines
      for (let i = 0; i < numTraits; i++) {
        const angle = (Math.PI * 2 * i) / numTraits - Math.PI / 2
        const x = centerX + Math.cos(angle) * maxRadius
        const y = centerY + Math.sin(angle) * maxRadius

        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(x, y)
        ctx.strokeStyle = "rgba(139, 92, 246, 0.3)"
        ctx.lineWidth = 1
        ctx.stroke()

        // Draw labels
        ctx.font = "12px Arial"
        ctx.fillStyle = "white"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        const labelX = centerX + Math.cos(angle) * (maxRadius + 20)
        const labelY = centerY + Math.sin(angle) * (maxRadius + 20)
        ctx.fillText(traits[i], labelX, labelY)
      }

      // Draw data
      ctx.beginPath()
      for (let i = 0; i < numTraits; i++) {
        const angle = (Math.PI * 2 * i) / numTraits - Math.PI / 2
        const value = scores[i] / 100
        const radius = maxRadius * value * progress
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()

      // Create gradient fill
      const gradient = ctx.createLinearGradient(
        centerX - maxRadius,
        centerY - maxRadius,
        centerX + maxRadius,
        centerY + maxRadius,
      )
      gradient.addColorStop(0, "rgba(236, 72, 153, 0.3)")
      gradient.addColorStop(1, "rgba(139, 92, 246, 0.3)")

      ctx.fillStyle = gradient
      ctx.fill()

      // Draw stroke with animated dash
      ctx.strokeStyle = "rgba(236, 72, 153, 0.8)"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.lineDashOffset = -time * 50
      ctx.stroke()
      ctx.setLineDash([])

      // Draw data points
      for (let i = 0; i < numTraits; i++) {
        const angle = (Math.PI * 2 * i) / numTraits - Math.PI / 2
        const value = scores[i] / 100
        const radius = maxRadius * value * progress
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius

        // Pulsing effect
        const pulse = Math.sin(time * 3 + i) * 0.2 + 0.8

        // Draw glow
        const pointGradient = ctx.createRadialGradient(x, y, 0, x, y, 10 * pulse)
        pointGradient.addColorStop(0, "rgba(236, 72, 153, 0.8)")
        pointGradient.addColorStop(1, "rgba(236, 72, 153, 0)")

        ctx.beginPath()
        ctx.arc(x, y, 10 * pulse, 0, Math.PI * 2)
        ctx.fillStyle = pointGradient
        ctx.fill()

        // Draw point
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(236, 72, 153, 1)"
        ctx.fill()
        ctx.strokeStyle = "white"
        ctx.lineWidth = 1
        ctx.stroke()
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  // Draw bubble chart for career paths
  useEffect(() => {
    if (!bubbleCanvasRef.current) return

    const canvas = bubbleCanvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Prepare bubble data
    const bubbles = insightsData.careerPaths.map((path, index) => {
      const size = (path.match / 100) * 50 + 20 // Scale bubble size based on match percentage

      // Position bubbles in a circular pattern
      const angle = (Math.PI * 2 * index) / insightsData.careerPaths.length
      const radius = canvas.width * 0.3

      return {
        x: canvas.width / 2 + Math.cos(angle) * radius,
        y: canvas.height / 2 + Math.sin(angle) * radius,
        size,
        name: path.name,
        match: path.match,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      }
    })

    // Animation variables
    let animationFrameId: number
    let time = 0

    // Draw function
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      time += 0.01

      // Update bubble positions with gentle floating motion
      bubbles.forEach((bubble) => {
        // Add slight random movement
        bubble.x += Math.sin(time * 2 + bubble.y * 0.01) * 0.5
        bubble.y += Math.cos(time * 2 + bubble.x * 0.01) * 0.5

        // Keep bubbles within bounds
        if (bubble.x < bubble.size) bubble.x = bubble.size
        if (bubble.x > canvas.width - bubble.size) bubble.x = canvas.width - bubble.size
        if (bubble.y < bubble.size) bubble.y = bubble.size
        if (bubble.y > canvas.height - bubble.size) bubble.y = canvas.height - bubble.size
      })

      // Draw connections between bubbles
      ctx.globalAlpha = 0.2
      for (let i = 0; i < bubbles.length; i++) {
        for (let j = i + 1; j < bubbles.length; j++) {
          const b1 = bubbles[i]
          const b2 = bubbles[j]

          // Calculate distance
          const dx = b2.x - b1.x
          const dy = b2.y - b1.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          // Only draw connections if bubbles are close enough
          if (distance < 200) {
            const opacity = 1 - distance / 200

            // Create gradient for connection
            const gradient = ctx.createLinearGradient(b1.x, b1.y, b2.x, b2.y)
            gradient.addColorStop(0, `rgba(236, 72, 153, ${opacity})`)
            gradient.addColorStop(1, `rgba(139, 92, 246, ${opacity})`)

            ctx.beginPath()
            ctx.moveTo(b1.x, b1.y)
            ctx.lineTo(b2.x, b2.y)
            ctx.strokeStyle = gradient
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1

      // Draw bubbles
      bubbles.forEach((bubble) => {
        // Create pulsing effect
        const pulse = Math.sin(time * 2 + bubble.x * 0.01) * 0.1 + 0.9
        const size = bubble.size * pulse

        // Create gradient for bubble
        const gradient = ctx.createRadialGradient(bubble.x, bubble.y, 0, bubble.x, bubble.y, size)

        // Color based on match percentage
        const hue = 280 + (bubble.match - 70) * 2 // Purple to pink gradient
        gradient.addColorStop(0, `hsla(${hue}, 70%, 60%, 0.8)`)
        gradient.addColorStop(1, `hsla(${hue}, 70%, 60%, 0.1)`)

        // Draw bubble glow
        ctx.beginPath()
        ctx.arc(bubble.x, bubble.y, size * 1.2, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Draw bubble
        ctx.beginPath()
        ctx.arc(bubble.x, bubble.y, size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.6)`
        ctx.fill()
        ctx.strokeStyle = `hsla(${hue}, 70%, 70%, 0.8)`
        ctx.lineWidth = 2
        ctx.stroke()

        // Draw match percentage
        ctx.font = "bold 16px Arial"
        ctx.fillStyle = "white"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(`${bubble.match}%`, bubble.x, bubble.y)

        // Draw label
        ctx.font = "12px Arial"
        ctx.fillStyle = "white"
        ctx.fillText(bubble.name, bubble.x, bubble.y + size + 15)
      })

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

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
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-purple-300 hover:bg-purple-900/20 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 text-center text-3xl font-bold md:text-4xl"
        >
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Dreamscapes Workshop Insights
          </span>
        </motion.h1>

        {/* Visualization Tabs */}
        <div className="mb-8 flex flex-wrap justify-center gap-4">
          <Button
            variant={activeSection === "summary" ? "default" : "outline"}
            onClick={() => setActiveSection("summary")}
            className={`${
              activeSection === "summary"
                ? "bg-gradient-to-r from-pink-600 to-purple-600"
                : "border-purple-500/30 bg-purple-900/20 text-purple-200"
            }`}
          >
            <BrainCircuit className="mr-2 h-4 w-4" /> AI Summary
          </Button>
          <Button
            variant={activeSection === "personality" ? "default" : "outline"}
            onClick={() => setActiveSection("personality")}
            className={`${
              activeSection === "personality"
                ? "bg-gradient-to-r from-pink-600 to-purple-600"
                : "border-purple-500/30 bg-purple-900/20 text-purple-200"
            }`}
          >
            <Sparkles className="mr-2 h-4 w-4" /> Personality Radar
          </Button>
          <Button
            variant={activeSection === "careers" ? "default" : "outline"}
            onClick={() => setActiveSection("careers")}
            className={`${
              activeSection === "careers"
                ? "bg-gradient-to-r from-pink-600 to-purple-600"
                : "border-purple-500/30 bg-purple-900/20 text-purple-200"
            }`}
          >
            <Briefcase className="mr-2 h-4 w-4" /> Career Matches
          </Button>
          <Button
            variant={activeSection === "network" ? "default" : "outline"}
            onClick={() => {
              setActiveSection("network")
              setShowNetworkGraph(true)
            }}
            className={`${
              activeSection === "network"
                ? "bg-gradient-to-r from-pink-600 to-purple-600"
                : "border-purple-500/30 bg-purple-900/20 text-purple-200"
            }`}
          >
            <Lightbulb className="mr-2 h-4 w-4" /> Neural Network
          </Button>
        </div>

        {/* Content Sections */}
        <AnimatePresence mode="wait">
          {activeSection === "summary" && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid gap-8 md:grid-cols-2"
            >
              {/* AI Summary */}
              <div className="overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 backdrop-blur-md">
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-600/20 to-purple-600/40">
                      <BrainCircuit className="h-5 w-5 text-pink-300" />
                    </div>
                    <h2 className="text-xl font-bold text-white">AI Summary</h2>
                  </div>

                  <div className="relative rounded-2xl border border-purple-500/20 bg-purple-900/10 p-6">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-pink-600/5 blur-3xl"></div>
                    <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-purple-600/5 blur-3xl"></div>
                    <p className="relative z-10 text-purple-200">{insightsData.summary}</p>
                  </div>
                </div>
              </div>

              {/* Core Values Visualization */}
              <div className="overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 backdrop-blur-md">
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-600/20 to-pink-600/40">
                      <Sparkles className="h-5 w-5 text-pink-300" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Core Values</h2>
                  </div>

                  <div className="space-y-4">
                    {insightsData.coreValues.map((value, index) => (
                      <motion.div
                        key={index}
                        initial={{ width: 0 }}
                        animate={{ width: `${value.strength}%` }}
                        transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                        className="relative h-10 overflow-hidden rounded-full"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-purple-600/20"></div>
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                          style={{ width: `${value.strength}%` }}
                        >
                          <div className="flex h-full items-center justify-between px-4">
                            <span className="font-medium text-white">{value.name}</span>
                            <span className="font-bold text-white">{value.strength}%</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Identified Themes */}
              <div className="overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 backdrop-blur-md">
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600/20 to-indigo-600/40">
                      <Lightbulb className="h-5 w-5 text-indigo-300" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Identified Themes</h2>
                  </div>

                  <div className="space-y-4">
                    {insightsData.themes.map((theme, index) => (
                      <motion.div
                        key={index}
                        initial={{ width: 0 }}
                        animate={{ width: `${theme.strength}%` }}
                        transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                        className="relative h-10 overflow-hidden rounded-full"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20"></div>
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                          style={{ width: `${theme.strength}%` }}
                        >
                          <div className="flex h-full items-center justify-between px-4">
                            <span className="font-medium text-white">{theme.name}</span>
                            <span className="font-bold text-white">{theme.strength}%</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Key Motivators */}
              <div className="overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 backdrop-blur-md">
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-600/20 to-green-600/40">
                      <Sparkles className="h-5 w-5 text-green-300" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Key Motivators</h2>
                  </div>

                  <div className="space-y-4">
                    {insightsData.motivators.map((motivator, index) => (
                      <motion.div
                        key={index}
                        initial={{ width: 0 }}
                        animate={{ width: `${motivator.strength}%` }}
                        transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                        className="relative h-10 overflow-hidden rounded-full"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-teal-600/20"></div>
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-green-500 to-teal-500"
                          style={{ width: `${motivator.strength}%` }}
                        >
                          <div className="flex h-full items-center justify-between px-4">
                            <span className="font-medium text-white">{motivator.name}</span>
                            <span className="font-bold text-white">{motivator.strength}%</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === "personality" && (
            <motion.div
              key="personality"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 backdrop-blur-md"
            >
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-600/20 to-purple-600/40">
                      <Sparkles className="h-5 w-5 text-pink-300" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Personality Traits Radar</h2>
                  </div>
                  <div className="rounded-full bg-purple-900/40 px-3 py-1 text-sm text-purple-200">
                    Interactive Visualization
                  </div>
                </div>

                <div className="relative mx-auto aspect-square max-w-2xl">
                  <canvas ref={radarCanvasRef} className="h-full w-full"></canvas>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-black/40 px-4 py-2 text-center backdrop-blur-md">
                      <span className="text-sm text-purple-300">Personality Profile</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  {insightsData.personalityTraits.map((trait, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-purple-500/20 bg-purple-900/10 p-3 text-center"
                    >
                      <div className="font-medium text-white">{trait.name}</div>
                      <div className="text-sm text-purple-300">{trait.score}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === "careers" && (
            <motion.div
              key="careers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 backdrop-blur-md"
            >
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-600/20 to-purple-600/40">
                      <Briefcase className="h-5 w-5 text-pink-300" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Career Path Matches</h2>
                  </div>
                  <div className="rounded-full bg-purple-900/40 px-3 py-1 text-sm text-purple-200">
                    Based on your dreamscape
                  </div>
                </div>

                <div className="relative mx-auto aspect-square max-w-2xl">
                  <canvas ref={bubbleCanvasRef} className="h-full w-full"></canvas>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-black/40 px-4 py-2 text-center backdrop-blur-md">
                      <span className="text-sm text-purple-300">Bubble size indicates match strength</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 transition-all duration-300 hover:scale-[1.02]">
                    <ExternalLink className="mr-2 h-4 w-4" /> Explore These Career Paths
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === "network" && (
            <motion.div
              key="network"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 backdrop-blur-md"
            >
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600/20 to-purple-600/40">
                      <Lightbulb className="h-5 w-5 text-indigo-300" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Neural Network Visualization</h2>
                  </div>
                  <div className="rounded-full bg-purple-900/40 px-3 py-1 text-sm text-purple-200">
                    Interactive Connections
                  </div>
                </div>

                <div className="relative mx-auto aspect-video max-w-4xl">
                  <canvas ref={networkCanvasRef} className="h-full w-full"></canvas>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-black/40 px-4 py-2 text-center backdrop-blur-md">
                      <span className="text-sm text-purple-300">
                        <span className="inline-block h-3 w-3 rounded-full bg-purple-500"></span> Themes
                        <span className="ml-3 inline-block h-3 w-3 rounded-full bg-indigo-500"></span> Interests
                        <span className="ml-3 inline-block h-3 w-3 rounded-full bg-pink-500"></span> Values
                        <span className="ml-3 inline-block h-3 w-3 rounded-full bg-green-500"></span> Motivators
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center text-sm text-purple-300">
                  This neural network visualization shows the connections between your identified themes, interests,
                  values, and motivators. Stronger connections indicate stronger relationships between elements.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-between"
        >
          <Button
            variant="outline"
            className="border-purple-500/30 bg-purple-900/20 text-purple-200 transition-all duration-300 hover:border-purple-400/50 hover:bg-purple-800/30"
            onClick={() => (window.location.href = "/dashboard")}
          >
            Back to Dashboard
          </Button>

          <Button
            className="bg-gradient-to-r from-pink-600 to-purple-600 transition-all duration-300 hover:from-pink-700 hover:to-purple-700"
            onClick={handleReanalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" /> Re-Analyze Responses
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

