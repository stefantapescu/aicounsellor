"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Briefcase, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HexGrid } from "@/components/hex-grid"
import { FloatingOrbs } from "@/components/floating-orbs"
import { NeuralPathways } from "@/components/neural-pathways"

export default function CareerExplorerPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleFindMatches = () => {
    setIsLoading(true)
    // Simulate loading for demonstration
    setTimeout(() => {
      // Use Next.js router for navigation instead of window.location
      // Assuming you have access to the router or can import it
      // import { useRouter } from 'next/navigation';
      // const router = useRouter();
      // router.push('/career-explorer/matches');
      // For now, using window.location as a placeholder if router isn't set up
      window.location.href = "/career-explorer/matches"
    }, 2000)
  }

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
      <div className="fixed inset-0 z-0 opacity-30">
        <NeuralPathways />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-2 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm backdrop-blur-sm"
        >
          <Briefcase className="mr-2 h-4 w-4 text-purple-300" />
          <span className="text-purple-300">Neural Career Mapping</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-6 text-center text-4xl font-bold md:text-5xl"
        >
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Career Explorer
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mb-12 max-w-2xl rounded-3xl border border-purple-500/20 bg-black/40 p-8 text-center backdrop-blur-md"
        >
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-r from-pink-600/5 via-purple-600/5 to-indigo-600/5 blur-xl"></div>

          <h2 className="mb-6 text-2xl font-bold text-white">Ready to see careers matched to your neural profile?</h2>

          <p className="mb-8 text-lg text-purple-200">
            Our quantum neural mapping technology has analyzed your cognitive patterns, skills, and interests to
            identify optimal career paths aligned with your unique profile.
          </p>

          <div className="flex justify-center">
            <Button
              onClick={handleFindMatches}
              disabled={isLoading}
              className="group relative overflow-hidden bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 text-lg font-medium transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center">
                {isLoading ? (
                  <>
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Analyzing Neural Patterns...
                  </>
                ) : (
                  <>
                    Find My Career Matches
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </span>
              <span className="absolute inset-0 z-0 bg-gradient-to-r from-pink-700 to-purple-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col items-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600/20 to-purple-600/40 backdrop-blur-md">
            <Sparkles className="h-8 w-8 text-purple-300" />
          </div>
          <p className="max-w-md text-center text-purple-300">
            Our AI has already processed over 10,000 data points from your assessments and interactions to create your
            unique neural career map.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
