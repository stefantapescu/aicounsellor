"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { BrainCircuit, ArrowRight, Sparkles, Lightbulb, Users, Heart, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RoboYouniMascot } from "@/components/robo-youni-mascot"

export default function PersonalityRadarIntro() {
  const router = useRouter()
  const [isStarting, setIsStarting] = useState(false)

  const handleStart = () => {
    setIsStarting(true)
    setTimeout(() => {
      router.push("/personalityradar/openness") // Navigate to the first game
    }, 1000)
  }

  const traits = [
    {
      name: "Openness",
      description: "Creativity, curiosity, and openness to new experiences",
      icon: <Sparkles className="h-5 w-5" />,
      color: "from-pink-600 to-purple-600",
      game: "Explorer's Dilemma",
    },
    {
      name: "Conscientiousness",
      description: "Organization, responsibility, and attention to detail",
      icon: <Lightbulb className="h-5 w-5" />,
      color: "from-indigo-600 to-blue-600",
      game: "Time Crunch Challenge",
    },
    {
      name: "Extraversion",
      description: "Sociability, assertiveness, and energy in social settings",
      icon: <Users className="h-5 w-5" />,
      color: "from-purple-600 to-indigo-600",
      game: "Crowd Connector",
    },
    {
      name: "Agreeableness",
      description: "Empathy, cooperation, and supportiveness",
      icon: <Heart className="h-5 w-5" />,
      color: "from-blue-600 to-cyan-600",
      game: "Bridge Builder",
    },
    {
      name: "Neuroticism",
      description: "Emotional stability, resilience, and stress management",
      icon: <Zap className="h-5 w-5" />,
      color: "from-cyan-600 to-teal-600",
      game: "Chaos Control",
    },
  ]

  return (
    // This component will be wrapped by the layout, so no need for background elements here
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
          <span className="text-purple-300">Personality Assessment</span>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-4 text-4xl font-bold md:text-5xl"
        >
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Personality Radar
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="max-w-3xl text-lg text-purple-200"
        >
          Discover your unique personality traits through a series of engaging games. Your results will help identify
          career paths that align with your natural strengths.
        </motion.p>
      </motion.div>

      <div className="mb-12 grid gap-8 md:grid-cols-2">
        {/* Left Column - Explanation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col justify-center"
        >
          <div className="mb-6 overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 p-6 backdrop-blur-md">
            <h2 className="mb-4 text-2xl font-bold text-white">How It Works</h2>
            <p className="mb-4 text-purple-200">
              The Personality Radar uses the scientifically validated Big Five personality model to assess your traits
              through interactive games rather than traditional questionnaires.
            </p>
            <p className="mb-4 text-purple-200">
              Complete all five games to generate your personalized radar chart and receive career recommendations based
              on your unique personality profile.
            </p>
            <p className="text-purple-200">
              Each game takes approximately 2-5 minutes to complete, and you can take breaks between games if needed.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 p-6 backdrop-blur-md">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-600/20 to-purple-600/40">
                <RoboYouniMascot width={30} height={30} />
              </div>
              <h3 className="text-xl font-bold text-white">AI Youni Tip</h3>
            </div>
            <p className="text-purple-200">
              Be honest in your responses! There are no right or wrong answers, and the most accurate results come from
              authentic choices that reflect your natural tendencies.
            </p>
          </div>
        </motion.div>

        {/* Right Column - Trait Cards */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="space-y-4"
        >
          {traits.map((trait, index) => (
            <motion.div
              key={trait.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
              className="group overflow-hidden rounded-xl border border-purple-500/20 bg-black/40 p-4 backdrop-blur-md transition-all duration-300 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r ${trait.color}`}
                >
                  {trait.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{trait.name}</h3>
                  <p className="text-sm text-purple-200">{trait.description}</p>
                </div>
                <div className="rounded-lg bg-purple-900/40 px-2 py-1 text-xs text-purple-300">{trait.game}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.8 }}
        className="flex justify-center"
      >
        <Button
          onClick={handleStart}
          disabled={isStarting}
          className="group relative overflow-hidden bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 text-lg font-medium transition-all duration-300 hover:scale-105"
        >
          <span className="relative z-10 flex items-center">
            {isStarting ? (
              <>
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Preparing Games...
              </>
            ) : (
              <>
                Begin Personality Radar
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </span>
          <span className="absolute inset-0 z-0 bg-gradient-to-r from-pink-700 to-purple-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
        </Button>
      </motion.div>
    </div>
  )
}
