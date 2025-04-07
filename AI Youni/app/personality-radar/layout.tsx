"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { HexGrid } from "@/components/hex-grid"
import { FloatingOrbs } from "@/components/floating-orbs"
import { NeuralPathways } from "@/components/neural-pathways"

export default function PersonalityRadarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)

  // Define the personality radar paths
  const paths = [
    { path: "/personality-radar", label: "Introduction" },
    { path: "/personality-radar/openness", label: "Openness" },
    { path: "/personality-radar/conscientiousness", label: "Conscientiousness" },
    { path: "/personality-radar/extraversion", label: "Extraversion" },
    { path: "/personality-radar/agreeableness", label: "Agreeableness" },
    { path: "/personality-radar/neuroticism", label: "Neuroticism" },
    { path: "/personality-radar/results", label: "Results" },
  ]

  // Calculate progress based on current path
  useEffect(() => {
    const currentPathIndex = paths.findIndex((p) => pathname.startsWith(p.path))
    if (currentPathIndex >= 0) {
      setProgress(((currentPathIndex + 1) / paths.length) * 100)
    }
  }, [pathname, paths])

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

      {/* Progress Bar */}
      <div className="fixed left-0 right-0 top-0 z-50">
        <Progress
          value={progress}
          className="h-1 rounded-none bg-purple-900/40"
          indicatorClassName="bg-gradient-to-r from-pink-500 to-purple-500"
        />
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 min-h-screen pt-8"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  )
}

