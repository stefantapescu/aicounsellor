"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RoboYouniMascot } from "@/components/robo-youni-mascot"
import { VoiceWaveform } from "@/components/voice-waveform"

export default function WelcomePage() {
  const router = useRouter()
  const [isAiSpeaking, setIsAiSpeaking] = useState(true)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isTextComplete, setIsTextComplete] = useState(false)

  const welcomeText = [
    "Welcome to AI Youni! I'm your personal neural guide.",
    "I'll help you discover your unique cognitive patterns and ideal career paths.",
    "Let's start by getting to know you better through a few interactive exercises.",
  ]

  // Simulate AI speaking with text typing effect
  useEffect(() => {
    if (currentTextIndex >= welcomeText.length) {
      setIsAiSpeaking(false)
      setIsTextComplete(true)
      return
    }

    const text = welcomeText[currentTextIndex]
    let charIndex = 0
    setDisplayedText("")

    const typingInterval = setInterval(() => {
      if (charIndex < text.length) {
        setDisplayedText((prev) => prev + text.charAt(charIndex))
        charIndex++
      } else {
        clearInterval(typingInterval)
        setTimeout(() => {
          setCurrentTextIndex((prev) => prev + 1)
        }, 1000)
      }
    }, 30)

    return () => clearInterval(typingInterval)
  }, [currentTextIndex, welcomeText])

  const handleContinue = () => {
    router.push("/onboarding/personality")
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
              <Sparkles className="mr-2 h-4 w-4 text-purple-300" />
              <span className="text-purple-300">Your Neural Journey Begins</span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mb-2 text-center text-3xl font-bold md:text-4xl"
            >
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                Welcome to AI Youni
              </span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-center text-lg text-purple-200"
            >
              Your personalized educational AI consultant
            </motion.p>
          </div>

          <div className="mb-8 flex flex-col items-center md:flex-row md:items-start md:gap-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
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
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex-1"
            >
              <div className="relative min-h-[120px] rounded-2xl border border-purple-500/20 bg-purple-900/10 p-6">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-pink-600/5 blur-3xl"></div>
                <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-purple-600/5 blur-3xl"></div>
                <p className="relative z-10 text-lg text-purple-200">
                  {displayedText}
                  {!isTextComplete && <span className="ml-1 animate-pulse">|</span>}
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex justify-center"
          >
            <Button
              onClick={handleContinue}
              disabled={!isTextComplete}
              className="group relative overflow-hidden bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 text-lg font-medium transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center">
                Begin Your Neural Journey
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

