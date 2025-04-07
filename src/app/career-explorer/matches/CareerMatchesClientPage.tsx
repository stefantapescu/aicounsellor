"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Search, Filter, BrainCircuit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HexGrid } from "@/components/hex-grid"
import { FloatingOrbs } from "@/components/floating-orbs"
import { NeuralPathways } from "@/components/neural-pathways"
import Link from "next/link"
// Import the type from the server component in the same directory
import type { CareerMatch } from "./page";

interface CareerMatchesClientPageProps {
  careerMatches: CareerMatch[]; // Accept real data via props
}

export default function CareerMatchesClientPage({ careerMatches }: CareerMatchesClientPageProps) {
  const [searchTerm, setSearchTerm] = useState("")
  // Initialize filteredCareers with the data passed via props
  const [filteredCareers, setFilteredCareers] = useState(careerMatches || [])
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null)

  useEffect(() => {
    // Filter based on the title from the passed props
    const filtered = (careerMatches || []).filter((career) =>
      career.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCareers(filtered);
  }, [searchTerm, careerMatches]); // Re-run filter when props or search term change

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
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-2 text-center text-4xl font-bold md:text-5xl"
        >
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Career Explorer
          </span>
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-8 text-center text-2xl font-bold text-white"
        >
          Your Matches
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-400" />
            <Input
              type="text"
              placeholder="Search careers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border-purple-500/30 bg-black/40 pl-10 text-white placeholder-purple-300 backdrop-blur-md focus:border-pink-500/50 focus:ring-pink-500/50"
            />
          </div>
          <Button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-600/80 to-purple-600/80 hover:from-pink-600 hover:to-purple-600">
            <Filter className="h-5 w-5" /> Filter Results
          </Button>
        </motion.div>

        {/* Display message if no matches found */}
        {filteredCareers.length === 0 && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="text-center text-purple-300 py-10"
           >
             No matching careers found for your search term.
           </motion.div>
         )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCareers.map((career, index) => (
            <motion.div
              key={career.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
              className={`group relative overflow-hidden rounded-3xl border ${
                selectedCareer === career.id
                  ? "border-pink-500/50 shadow-lg shadow-pink-500/10"
                  : "border-purple-500/20 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10"
              } bg-black/40 backdrop-blur-md transition-all duration-300`}
              onClick={() => setSelectedCareer(career.id)}
            >
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-purple-600/10 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"></div>
              <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-pink-600/10 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"></div>

              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">{career.title}</h3>
                  <div className="flex h-8 items-center rounded-full bg-gradient-to-r from-pink-600/20 to-purple-600/20 px-3 text-sm backdrop-blur-sm">
                    <span className="text-pink-300">Score: {career.score}%</span>
                  </div>
                </div>

                <div className="mb-2 inline-flex items-center rounded-full bg-black/40 px-2 py-1 text-xs text-purple-300">
                  {/* Use the tag from the data */}
                  <span>{career.tag}</span>
                </div>

                <p className="mb-4 line-clamp-3 text-sm text-purple-200">{career.description}</p>

                <div className="mb-4 flex items-center gap-2 text-sm text-purple-300">
                  <BrainCircuit className="h-4 w-4" />
                  {/* Use growth from data */}
                  <span>Job Growth: {career.growth}</span>
                  <span className="text-xs">(Projected 2025-2035)</span>
                </div>

                {/* Link to the specific career page using the ID (occupation code) */}
                {/* Note: The dynamic route in the project is [onetCode], not careers/[id] */}
                <Link href={`/career-explorer/${career.id}`}>
                  <Button className="w-full bg-gradient-to-r from-pink-600/80 to-purple-600/80 transition-all duration-300 hover:from-pink-600 hover:to-purple-600 group-hover:scale-[1.02]">
                    Explore Career
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
