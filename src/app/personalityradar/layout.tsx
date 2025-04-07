"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation" // Removed unused useRouter
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
  const pathname = usePathname() // Get current path
  const [progress, setProgress] = useState(0)

  // Define the personality radar paths in order
  const paths = [
    { path: "/personalityradar", label: "Introduction" }, // Assuming this is the intro page
    { path: "/personalityradar/openness", label: "Openness" },
    { path: "/personalityradar/conscientiousness", label: "Conscientiousness" },
    { path: "/personalityradar/extraversion", label: "Extraversion" },
    { path: "/personalityradar/agreeableness", label: "Agreeableness" },
    { path: "/personalityradar/neuroticism", label: "Neuroticism" },
    { path: "/workshop/dreamscapes/results", label: "Results" }, // Updated results path
  ];

  // Calculate progress based on current path
  useEffect(() => {
    // Find the index of the current path segment
    const currentPathIndex = paths.findIndex((p) => pathname === p.path); // Use exact match for progress

    if (currentPathIndex >= 0) {
      // Calculate progress based on the index (0-based) + 1
      setProgress(((currentPathIndex + 1) / paths.length) * 100);
    } else {
      // Handle cases where the path might not be in the defined list (e.g., base /personalityradar)
      // Set to 0 or a small initial value if needed
      setProgress(pathname === "/personalityradar" ? (1 / paths.length) * 100 : 0);
    }
  }, [pathname]); // Removed paths from dependency array as it's constant

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
          className="h-1 rounded-none bg-purple-900/40 [&>*]:bg-gradient-to-r [&>*]:from-pink-500 [&>*]:to-purple-500" // Corrected gradient application
          // indicatorClassName removed
        />
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname} // Use pathname as key for transitions
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 min-h-screen pt-8" // Added padding-top to account for progress bar
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  )
}
