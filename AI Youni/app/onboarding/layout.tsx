"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { HexGrid } from "@/components/hex-grid"
import { FloatingOrbs } from "@/components/floating-orbs"
import { NeuralPathways } from "@/components/neural-pathways"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)

  // Define the onboarding steps and their corresponding routes
  const steps = [
    { path: "/onboarding/welcome", label: "Welcome" },
    { path: "/onboarding/personality", label: "Personality" },
    { path: "/onboarding/interests", label: "Interests" },
    { path: "/onboarding/goals", label: "Goals" },
    { path: "/onboarding/neural-profile", label: "Neural Profile" },
  ]

  // Calculate progress based on current path
  useEffect(() => {
    const currentStepIndex = steps.findIndex((step) => step.path === pathname)
    if (currentStepIndex >= 0) {
      setProgress(((currentStepIndex + 1) / steps.length) * 100)
    }
  }, [pathname, steps])

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

      {/* Step Indicators */}
      <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 transform">
        <div className="flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 backdrop-blur-md">
          {steps.map((step, index) => {
            const isActive = pathname === step.path
            const isPast = steps.findIndex((s) => s.path === pathname) >= index

            return (
              <div key={index} className="flex items-center">
                {index > 0 && <div className={`mx-1 h-[1px] w-4 ${isPast ? "bg-purple-400" : "bg-purple-800"}`}></div>}
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    isActive
                      ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white"
                      : isPast
                        ? "bg-purple-800/60 text-purple-200"
                        : "bg-purple-900/40 text-purple-400"
                  }`}
                >
                  {index + 1}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex min-h-screen items-center justify-center p-4"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  )
}

