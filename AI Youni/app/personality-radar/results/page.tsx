"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { BrainCircuit, ArrowRight, Briefcase, Sparkles, Lightbulb, Users, Heart, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RoboYouniMascot } from "@/components/robo-youni-mascot"

// Career recommendations based on personality traits
const careerRecommendations = {
  highOpenness: [
    { title: "Research Scientist", match: 95 },
    { title: "Creative Director", match: 92 },
    { title: "UX Designer", match: 88 },
  ],
  highConscientiousness: [
    { title: "Project Manager", match: 96 },
    { title: "Financial Analyst", match: 93 },
    { title: "Quality Assurance Specialist", match: 90 },
  ],
  highExtraversion: [
    { title: "Sales Director", match: 97 },
    { title: "Public Relations Specialist", match: 94 },
    { title: "Event Coordinator", match: 91 },
  ],
  highAgreeableness: [
    { title: "Human Resources Manager", match: 95 },
    { title: "Counselor", match: 93 },
    { title: "Customer Success Manager", match: 89 },
  ],
  lowNeuroticism: [
    { title: "Emergency Response Coordinator", match: 94 },
    { title: "Air Traffic Controller", match: 92 },
    { title: "Crisis Manager", match: 90 },
  ],
}

export default function PersonalityRadarResults() {
  const router = useRouter()
  const [scores, setScores] = useState({
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("radar")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Load scores from localStorage
  useEffect(() => {
    // In a real app, these would come from a database
    // For demo purposes, we'll use localStorage or generate random scores
    const openness =
      Number.parseInt(localStorage.getItem("openness_score") || "0") || Math.floor(Math.random() * 40) + 60
    const conscientiousness =
      Number.parseInt(localStorage.getItem("conscientiousness_score") || "0") || Math.floor(Math.random() * 40) + 60
    const extraversion =
      Number.parseInt(localStorage.getItem("extraversion_score") || "0") || Math.floor(Math.random() * 40) + 60
    const agreeableness =
      Number.parseInt(localStorage.getItem("agreeableness_score") || "0") || Math.floor(Math.random() * 40) + 60
    const neuroticism =
      Number.parseInt(localStorage.getItem("neuroticism_score") || "0") || Math.floor(Math.random() * 40) + 60

    setScores({
      openness,
      conscientiousness,
      extraversion,
      agreeableness,
      neuroticism,
    })

    setIsLoading(false)
  }, [])

  // Draw radar chart
  useEffect(() => {
    if (isLoading || !canvasRef.current || activeTab !== "radar") return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Calculate center and radius
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) * 0.8

    // Define the 5 axes
    const traits = [
      { name: "Openness", score: scores.openness, color: "#EC4899", icon: <Sparkles className="h-5 w-5" /> },
      {
        name: "Conscientiousness",
        score: scores.conscientiousness,
        color: "#6366F1",
        icon: <Lightbulb className="h-5 w-5" />,
      },
      { name: "Extraversion", score: scores.extraversion, color: "#8B5CF6", icon: <Users className="h-5 w-5" /> },
      { name: "Agreeableness", score: scores.agreeableness, color: "#3B82F6", icon: <Heart className="h-5 w-5" /> },
      { name: "Neuroticism", score: scores.neuroticism, color: "#06B6D4", icon: <Zap className="h-5 w-5" /> },
    ]

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
        const gridRadius = radius * (level / 5)

        ctx.beginPath()
        for (let i = 0; i < traits.length; i++) {
          const angle = (Math.PI * 2 * i) / traits.length - Math.PI / 2
          const x = centerX + Math.cos(angle) * gridRadius
          const y = centerY + Math.sin(angle) * gridRadius

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
      for (let i = 0; i < traits.length; i++) {
        const angle = (Math.PI * 2 * i) / traits.length - Math.PI / 2
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius

        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(x, y)
        ctx.strokeStyle = "rgba(139, 92, 246, 0.3)"
        ctx.lineWidth = 1
        ctx.stroke()

        // Draw labels
        ctx.font = "14px Arial"
        ctx.fillStyle = "white"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        const labelX = centerX + Math.cos(angle) * (radius + 30)
        const labelY = centerY + Math.sin(angle) * (radius + 30)
        ctx.fillText(traits[i].name, labelX, labelY)
      }

      // Draw data
      ctx.beginPath()
      for (let i = 0; i < traits.length; i++) {
        const angle = (Math.PI * 2 * i) / traits.length - Math.PI / 2
        const value = traits[i].score / 100
        const pointRadius = radius * value * progress
        const x = centerX + Math.cos(angle) * pointRadius
        const y = centerY + Math.sin(angle) * pointRadius

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()

      // Create gradient fill
      const gradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius)
      gradient.addColorStop(0, "rgba(236, 72, 153, 0.3)")
      gradient.addColorStop(0.5, "rgba(139, 92, 246, 0.3)")
      gradient.addColorStop(1, "rgba(99, 102, 241, 0.3)")

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
      for (let i = 0; i < traits.length; i++) {
        const angle = (Math.PI * 2 * i) / traits.length - Math.PI / 2
        const value = traits[i].score / 100
        const pointRadius = radius * value * progress
        const x = centerX + Math.cos(angle) * pointRadius
        const y = centerY + Math.sin(angle) * pointRadius

        // Pulsing effect
        const pulse = Math.sin(time * 3 + i) * 0.2 + 0.8

        // Draw glow
        const pointGradient = ctx.createRadialGradient(x, y, 0, x, y, 10 * pulse)
        pointGradient.addColorStop(0, traits[i].color + "CC")
        pointGradient.addColorStop(1, traits[i].color + "00")

        ctx.beginPath()
        ctx.arc(x, y, 10 * pulse, 0, Math.PI * 2)
        ctx.fillStyle = pointGradient
        ctx.fill()

        // Draw point
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = traits[i].color
        ctx.fill()
        ctx.strokeStyle = "white"
        ctx.lineWidth = 1
        ctx.stroke()

        // Draw score
        const scoreX = centerX + Math.cos(angle) * (pointRadius + 20)
        const scoreY = centerY + Math.sin(angle) * (pointRadius + 20)
        ctx.font = "bold 12px Arial"
        ctx.fillStyle = "white"
        ctx.fillText(traits[i].score.toString(), scoreX, scoreY)
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [isLoading, scores, activeTab])

  // Get top trait and career recommendations
  const getTopTrait = () => {
    const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = scores
    const traits = [
      { name: "openness", score: openness, key: "highOpenness" },
      { name: "conscientiousness", score: conscientiousness, key: "highConscientiousness" },
      { name: "extraversion", score: extraversion, key: "highExtraversion" },
      { name: "agreeableness", score: agreeableness, key: "highAgreeableness" },
      { name: "neuroticism", score: 100 - neuroticism, key: "lowNeuroticism" }, // Invert neuroticism for "emotional stability"
    ]

    return traits.sort((a, b) => b.score - a.score)[0]
  }

  const topTrait = !isLoading ? getTopTrait() : { name: "", score: 0, key: "" }
  const recommendations = !isLoading ? careerRecommendations[topTrait.key as keyof typeof careerRecommendations] : []

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
          <BrainCircuit className="mr-2 h-4 w-4 text-purple-300" />
          <span className="text-purple-300">Assessment Complete</span>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-4 text-4xl font-bold md:text-5xl"
        >
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Your Personality Profile
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="max-w-3xl text-lg text-purple-200"
        >
          Based on your responses to the interactive games, we've created a comprehensive personality profile to help
          guide your career journey.
        </motion.p>
      </motion.div>

      {/* Tabs Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mb-8 flex flex-wrap justify-center gap-4"
      >
        <Button
          variant={activeTab === "radar" ? "default" : "outline"}
          onClick={() => setActiveTab("radar")}
          className={`${
            activeTab === "radar"
              ? "bg-gradient-to-r from-pink-600 to-purple-600"
              : "border-purple-500/30 bg-purple-900/20 text-purple-200"
          }`}
        >
          <BrainCircuit className="mr-2 h-4 w-4" /> Radar Chart
        </Button>
        <Button
          variant={activeTab === "traits" ? "default" : "outline"}
          onClick={() => setActiveTab("traits")}
          className={`${
            activeTab === "traits"
              ? "bg-gradient-to-r from-pink-600 to-purple-600"
              : "border-purple-500/30 bg-purple-900/20 text-purple-200"
          }`}
        >
          <Sparkles className="mr-2 h-4 w-4" /> Trait Analysis
        </Button>
        <Button
          variant={activeTab === "careers" ? "default" : "outline"}
          onClick={() => setActiveTab("careers")}
          className={`${
            activeTab === "careers"
              ? "bg-gradient-to-r from-pink-600 to-purple-600"
              : "border-purple-500/30 bg-purple-900/20 text-purple-200"
          }`}
        >
          <Briefcase className="mr-2 h-4 w-4" /> Career Matches
        </Button>
      </motion.div>

      {/* Tab Content */}
      {isLoading ? (
        <div className="flex h-80 items-center justify-center rounded-3xl border border-purple-500/20 bg-black/40 backdrop-blur-md">
          <div className="flex flex-col items-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
            <p className="text-purple-200">Loading your personality profile...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Radar Chart Tab */}
          {activeTab === "radar" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 p-6 backdrop-blur-md"
            >
              <h2 className="mb-6 text-2xl font-bold text-white">Personality Radar</h2>

              <div className="relative mx-auto aspect-square max-w-2xl">
                <canvas ref={canvasRef} className="h-full w-full"></canvas>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-black/40 px-4 py-2 text-center backdrop-blur-md">
                    <span className="text-sm text-purple-300">Your Big Five Profile</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center text-sm text-purple-200">
                This radar chart visualizes your scores across the Big Five personality traits. The further a point
                extends from the center, the stronger that trait is in your personality.
              </div>
            </motion.div>
          )}

          {/* Trait Analysis Tab */}
          {activeTab === "traits" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 p-6 backdrop-blur-md"
            >
              <h2 className="mb-6 text-2xl font-bold text-white">Trait Analysis</h2>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Openness */}
                <div className="overflow-hidden rounded-xl border border-pink-500/20 bg-pink-900/10 p-4">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-600/20 to-pink-600/40">
                      <Sparkles className="h-5 w-5 text-pink-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Openness</h3>
                      <div className="text-sm text-pink-300">Score: {scores.openness}/100</div>
                    </div>
                  </div>

                  <p className="mb-4 text-purple-200">
                    {scores.openness >= 70
                      ? "You have a high degree of openness, showing creativity, curiosity, and a willingness to explore new ideas. You likely enjoy intellectual challenges and appreciate art, beauty, and innovation."
                      : scores.openness >= 40
                        ? "You have a balanced level of openness, appreciating both new experiences and familiar routines. You can be creative while still maintaining practical considerations."
                        : "You tend to prefer familiar routines and conventional approaches. You may value tradition and practicality over abstract or theoretical concepts."}
                  </p>

                  <div className="rounded-lg bg-pink-900/20 p-3">
                    <h4 className="mb-2 font-medium text-white">Career Implications</h4>
                    <p className="text-sm text-purple-200">
                      {scores.openness >= 70
                        ? "Your openness suggests you may thrive in creative fields, research, innovation, or roles that involve developing new ideas and approaches."
                        : scores.openness >= 40
                          ? "Your balanced openness allows you to adapt to both creative and structured work environments, making you versatile across many career paths."
                          : "Your preference for structure may be well-suited for roles that value consistency, attention to established procedures, and practical implementation."}
                    </p>
                  </div>
                </div>

                {/* Conscientiousness */}
                <div className="overflow-hidden rounded-xl border border-indigo-500/20 bg-indigo-900/10 p-4">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600/20 to-indigo-600/40">
                      <Lightbulb className="h-5 w-5 text-indigo-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Conscientiousness</h3>
                      <div className="text-sm text-indigo-300">Score: {scores.conscientiousness}/100</div>
                    </div>
                  </div>

                  <p className="mb-4 text-purple-200">
                    {scores.conscientiousness >= 70
                      ? "You are highly conscientious, showing strong organization, responsibility, and attention to detail. You likely plan ahead, follow through on commitments, and strive for excellence in your work."
                      : scores.conscientiousness >= 40
                        ? "You have a moderate level of conscientiousness, balancing organization with flexibility. You can be reliable while still adapting to changing circumstances."
                        : "You tend to be more spontaneous and flexible in your approach to tasks. You may prefer to adapt to situations as they arise rather than following strict plans or schedules."}
                  </p>

                  <div className="rounded-lg bg-indigo-900/20 p-3">
                    <h4 className="mb-2 font-medium text-white">Career Implications</h4>
                    <p className="text-sm text-purple-200">
                      {scores.conscientiousness >= 70
                        ? "Your conscientiousness is well-suited for roles requiring precision, planning, and reliability, such as project management, finance, or quality assurance."
                        : scores.conscientiousness >= 40
                          ? "Your balanced approach makes you adaptable to both structured environments and those requiring flexibility, opening doors to a wide range of career options."
                          : "Your spontaneous nature may be valuable in fast-paced environments, creative fields, or roles that require adapting quickly to changing circumstances."}
                    </p>
                  </div>
                </div>

                {/* Extraversion */}
                <div className="overflow-hidden rounded-xl border border-purple-500/20 bg-purple-900/10 p-4">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600/20 to-purple-600/40">
                      <Users className="h-5 w-5 text-purple-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Extraversion</h3>
                      <div className="text-sm text-purple-300">Score: {scores.extraversion}/100</div>
                    </div>
                  </div>

                  <p className="mb-4 text-purple-200">
                    {scores.extraversion >= 70
                      ? "You are highly extraverted, energized by social interaction and external stimulation. You likely enjoy being around others, taking charge in groups, and engaging in active, dynamic environments."
                      : scores.extraversion >= 40
                        ? "You have a balanced level of extraversion, comfortable in both social settings and solitary activities. You can engage with others while also valuing your personal space."
                        : "You tend to be more introverted, preferring deeper one-on-one connections or solitary activities. You may find social interactions draining and need time alone to recharge."}
                  </p>

                  <div className="rounded-lg bg-purple-900/20 p-3">
                    <h4 className="mb-2 font-medium text-white">Career Implications</h4>
                    <p className="text-sm text-purple-200">
                      {scores.extraversion >= 70
                        ? "Your extraversion suggests you may excel in roles involving frequent interaction with others, such as sales, management, public relations, or teaching."
                        : scores.extraversion >= 40
                          ? "Your balanced social energy allows you to thrive in roles requiring both teamwork and independent work, giving you versatility across many career paths."
                          : "Your introspective nature may be well-suited for roles that involve focused, independent work, such as research, writing, analysis, or technical specialties."}
                    </p>
                  </div>
                </div>

                {/* Agreeableness */}
                <div className="overflow-hidden rounded-xl border border-blue-500/20 bg-blue-900/10 p-4">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600/20 to-blue-600/40">
                      <Heart className="h-5 w-5 text-blue-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Agreeableness</h3>
                      <div className="text-sm text-blue-300">Score: {scores.agreeableness}/100</div>
                    </div>
                  </div>

                  <p className="mb-4 text-purple-200">
                    {scores.agreeableness >= 70
                      ? "You are highly agreeable, showing empathy, cooperation, and a focus on harmonious relationships. You likely prioritize others' needs and avoid conflict when possible."
                      : scores.agreeableness >= 40
                        ? "You have a balanced level of agreeableness, able to cooperate with others while still maintaining your own perspective. You can be supportive while setting appropriate boundaries."
                        : "You tend to be more direct and focused on objectives rather than social harmony. You may prioritize truth and efficiency over sparing others' feelings."}
                  </p>

                  <div className="rounded-lg bg-blue-900/20 p-3">
                    <h4 className="mb-2 font-medium text-white">Career Implications</h4>
                    <p className="text-sm text-purple-200">
                      {scores.agreeableness >= 70
                        ? "Your agreeableness suggests you may excel in helping professions, such as counseling, healthcare, education, or customer service roles."
                        : scores.agreeableness >= 40
                          ? "Your balanced approach to relationships makes you adaptable to both collaborative and competitive environments, opening doors to various career paths."
                          : "Your direct approach may be valuable in roles requiring objective decision-making, critical analysis, or negotiation, such as law, management, or technical leadership."}
                    </p>
                  </div>
                </div>

                {/* Neuroticism (Emotional Stability) */}
                <div className="overflow-hidden rounded-xl border border-cyan-500/20 bg-cyan-900/10 p-4 md:col-span-2">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600/20 to-cyan-600/40">
                      <Zap className="h-5 w-5 text-cyan-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Emotional Stability</h3>
                      <div className="text-sm text-cyan-300">Score: {100 - scores.neuroticism}/100</div>
                    </div>
                  </div>

                  <p className="mb-4 text-purple-200">
                    {scores.neuroticism <= 30
                      ? "You show high emotional stability, remaining calm under pressure and recovering quickly from setbacks. You likely maintain perspective in stressful situations and have confidence in your abilities."
                      : scores.neuroticism <= 60
                        ? "You have a moderate level of emotional reactivity, experiencing normal ups and downs while generally maintaining equilibrium. You're aware of your emotions without being overwhelmed by them."
                        : "You may experience emotions more intensely and be more sensitive to stress. While this can enhance your empathy and creativity, it may also make challenging situations more difficult to navigate."}
                  </p>

                  <div className="rounded-lg bg-cyan-900/20 p-3">
                    <h4 className="mb-2 font-medium text-white">Career Implications</h4>
                    <p className="text-sm text-purple-200">
                      {scores.neuroticism <= 30
                        ? "Your emotional stability suggests you may excel in high-pressure environments, leadership roles, emergency services, or positions requiring calm decision-making."
                        : scores.neuroticism <= 60
                          ? "Your balanced emotional responses allow you to function well in most work environments, giving you flexibility in career choices."
                          : "Your emotional sensitivity may be valuable in creative fields, counseling roles, or positions requiring empathy and attention to emotional nuance."}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Career Matches Tab */}
          {activeTab === "careers" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 p-6 backdrop-blur-md"
            >
              <h2 className="mb-6 text-2xl font-bold text-white">Career Recommendations</h2>

              <div className="mb-6 rounded-xl bg-gradient-to-r from-pink-900/20 to-purple-900/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-600/20 to-purple-600/40">
                    <RoboYouniMascot width={30} height={30} />
                  </div>
                  <p className="text-purple-200">
                    Based on your personality profile, we've identified career paths that align with your strongest
                    trait:
                    <span className="ml-1 font-medium text-white">
                      {topTrait.name.charAt(0).toUpperCase() + topTrait.name.slice(1)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mb-8 grid gap-4 md:grid-cols-3">
                {recommendations.map((career, index) => (
                  <motion.div
                    key={career.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                    className="group overflow-hidden rounded-xl border border-purple-500/20 bg-black/40 p-4 backdrop-blur-md transition-all duration-300 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-bold text-white">{career.title}</h3>
                      <div className="rounded-full bg-gradient-to-r from-pink-600/20 to-purple-600/20 px-2 py-1 text-xs text-pink-300">
                        {career.match}% Match
                      </div>
                    </div>

                    <div className="mb-3 h-2 overflow-hidden rounded-full bg-purple-900/40">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                        style={{ width: `${career.match}%` }}
                      ></div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-purple-500/30 bg-purple-900/20 text-purple-200 transition-all duration-300 hover:border-purple-400/50 hover:bg-purple-800/30"
                    >
                      Explore Career <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <p className="mb-4 text-purple-200">
                  Want to explore more career options based on your personality profile?
                </p>
                <Button className="bg-gradient-to-r from-pink-600 to-purple-600 transition-all duration-300 hover:scale-105">
                  View Full Career Report <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Navigation Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="mt-8 flex justify-center"
      >
        <Button
          onClick={() => router.push("/dashboard")}
          className="bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 text-lg font-medium transition-all duration-300 hover:scale-105"
        >
          Return to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </motion.div>
    </div>
  )
}

