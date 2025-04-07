"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  BrainCircuit,
  ChevronDown,
  Lightbulb,
  LogIn,
  MessageSquare,
  Sparkles,
  Star,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { RoboYouniMascot } from "@/components/robo-youni-mascot"
import { HexGrid } from "@/components/hex-grid"
import { FloatingOrbs } from "@/components/floating-orbs"
import { NeuralPathways } from "@/components/neural-pathways"
import { ParticleField } from "@/components/particle-field"
import { cn } from "@/lib/utils"

export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const howItWorksRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()

  const features = [
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Neural AI Consultant",
      description:
        "Engage with our advanced AI consultant that adapts to your unique cognitive patterns and learning style.",
      color: "from-pink-600/20 to-pink-600/40",
      textColor: "text-pink-300",
    },
    {
      icon: <BrainCircuit className="h-8 w-8" />,
      title: "Cognitive Assessments",
      description:
        "Discover your unique neural profile through comprehensive assessments that map your strengths and potential.",
      color: "from-purple-600/20 to-purple-600/40",
      textColor: "text-purple-300",
    },
    {
      icon: <Lightbulb className="h-8 w-8" />,
      title: "Quantum Career Matching",
      description:
        "Our advanced algorithms analyze thousands of career paths to find your optimal professional trajectory.",
      color: "from-indigo-600/20 to-indigo-600/40",
      textColor: "text-indigo-300",
    },
  ]

  const steps = [
    {
      icon: <User className="h-8 w-8" />,
      title: "Create Neural Profile",
      description: "Sign up and create your unique neural profile to begin your personalized journey.",
    },
    {
      icon: <BrainCircuit className="h-8 w-8" />,
      title: "Complete Assessments",
      description: "Take our comprehensive cognitive assessments to map your unique neural pathways.",
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Explore With AI",
      description:
        "Interact with our AI consultant to explore personalized career paths and educational opportunities.",
    },
  ]

  // Parallax effects
  const heroTextY = useTransform(scrollYProgress, [0, 0.2], [0, -100])
  const heroMascotY = useTransform(scrollYProgress, [0, 0.2], [0, 100])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [features.length])

  // Scroll to section
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" })
    }
    setIsMenuOpen(false)
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

      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full border-b border-purple-500/20 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600"
            >
              <span className="text-lg font-bold">AI</span>
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl font-bold text-white"
            >
              Youni
            </motion.span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <NavLink onClick={() => scrollToSection(heroRef)}>Home</NavLink>
            <NavLink onClick={() => scrollToSection(featuresRef)}>Features</NavLink>
            <NavLink onClick={() => scrollToSection(howItWorksRef)}>How It Works</NavLink>
            <NavLink href="/login">Log In</NavLink>
            <Button
              asChild
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 transition-all duration-300 hover:scale-105"
            >
              <Link href="/signup">Sign Up</Link>
            </Button>
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-purple-500/20 bg-black/80 backdrop-blur-xl"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                <NavLink mobile onClick={() => scrollToSection(heroRef)}>
                  Home
                </NavLink>
                <NavLink mobile onClick={() => scrollToSection(featuresRef)}>
                  Features
                </NavLink>
                <NavLink mobile onClick={() => scrollToSection(howItWorksRef)}>
                  How It Works
                </NavLink>
                <NavLink mobile href="/login">
                  Log In
                </NavLink>
                <Button asChild className="bg-gradient-to-r from-pink-600 to-purple-600 w-full">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section ref={heroRef} className="relative min-h-screen overflow-hidden pt-16">
          <div className="absolute inset-0 z-0">
            <NeuralPathways />
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black"></div>
          </div>

          <div className="container relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center md:px-6">
            <motion.div style={{ y: heroTextY, opacity: heroOpacity }} className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-2 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm backdrop-blur-sm"
              >
                <Sparkles className="mr-2 h-4 w-4 text-purple-300" />
                <span className="text-purple-300">The Future of Educational AI</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl"
              >
                Discover Your Future with
                <span className="relative mt-2 block bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                  Your Neural AI Educational Consultant
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mx-auto mb-8 max-w-2xl text-lg text-purple-200 md:text-xl"
              >
                Navigate career paths, understand your cognitive strengths, and get personalized guidance with AI
                Youni's advanced neural mapping technology.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col items-center justify-center gap-4 sm:flex-row"
              >
                <Button
                  asChild
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-pink-600 to-purple-600 transition-all duration-300 hover:scale-105"
                >
                  <Link href="/signup">
                    <span className="relative z-10">Begin Your Neural Journey</span>
                    <span className="absolute inset-0 z-0 bg-gradient-to-r from-pink-700 to-purple-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-purple-500/30 bg-purple-900/10 text-purple-300 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-purple-400/50 hover:bg-purple-800/20"
                >
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" /> Log In
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="link"
                  size="lg"
                  className="text-purple-300 transition-all duration-300 hover:scale-105 hover:text-purple-200"
                  onClick={() => scrollToSection(featuresRef)}
                >
                  <div className="flex items-center gap-2">
                    Learn More <ChevronDown className="h-4 w-4" />
                  </div>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              style={{ y: heroMascotY, opacity: heroOpacity }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="relative"
              >
                <div className="absolute -inset-10 rounded-full bg-gradient-to-r from-pink-600/20 via-purple-600/20 to-indigo-600/20 blur-3xl"></div>
                <RoboYouniMascot width={180} height={180} />
              </motion.div>
            </motion.div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-6 w-6 text-purple-300" />
          </div>
        </section>

        {/* Features Section */}
        <section ref={featuresRef} className="relative py-24">
          <div className="absolute inset-0 z-0">
            <ParticleField />
          </div>

          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <div className="mb-16 text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="mb-4 text-3xl font-bold md:text-4xl"
              >
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                  Quantum Neural Features
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mx-auto max-w-2xl text-lg text-purple-200"
              >
                Explore AI Youni's advanced capabilities powered by cutting-edge neural technology
              </motion.p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                  className={cn(
                    "group relative overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 p-6 backdrop-blur-md transition-all duration-500 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10",
                    activeFeature === index ? "border-purple-500/40 shadow-lg shadow-purple-500/10" : "",
                  )}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-purple-600/10 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"></div>
                  <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-pink-600/10 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"></div>

                  <div
                    className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} backdrop-blur-md`}
                  >
                    <div className={feature.textColor}>{feature.icon}</div>
                  </div>

                  <h3 className="mb-3 text-xl font-bold text-white">{feature.title}</h3>
                  <p className="text-purple-200">{feature.description}</p>

                  <div className="mt-6">
                    <Button className="bg-gradient-to-r from-pink-600/80 to-purple-600/80 text-white transition-all duration-300 hover:from-pink-600 hover:to-purple-600">
                      Explore Feature
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Feature Showcase */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-24 overflow-hidden rounded-3xl border border-purple-500/20 bg-black/40 backdrop-blur-md"
            >
              <div className="grid md:grid-cols-2">
                <div className="p-8 md:p-12">
                  <div className="mb-6 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm backdrop-blur-sm">
                    <Star className="mr-2 h-4 w-4 text-purple-300" />
                    <span className="text-purple-300">Featured Technology</span>
                  </div>

                  <h3 className="mb-4 text-2xl font-bold text-white md:text-3xl">Neural Mapping Technology</h3>
                  <p className="mb-6 text-purple-200">
                    Our proprietary neural mapping technology creates a comprehensive cognitive profile that identifies
                    your unique strengths, learning patterns, and career compatibility.
                  </p>

                  <ul className="mb-8 space-y-3">
                    {[
                      "Advanced pattern recognition algorithms",
                      "Personalized learning pathway generation",
                      "Career compatibility scoring with 98% accuracy",
                      "Adaptive AI that evolves with your growth",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start">
                        <div className="mr-3 mt-1 h-5 w-5 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 flex items-center justify-center">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10 3L4.5 8.5L2 6"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <span className="text-purple-200">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className="bg-gradient-to-r from-pink-600 to-purple-600 text-white transition-all duration-300 hover:scale-105">
                    Learn About Neural Mapping <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="relative flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-black p-8">
                  <div className="absolute inset-0">
                    <NeuralPathways />
                  </div>
                  <div className="relative z-10 aspect-square w-full max-w-md rounded-3xl bg-black/40 p-4 backdrop-blur-md">
                    <div className="h-full w-full rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-black/40 p-6">
                      <div className="flex h-full w-full flex-col items-center justify-center">
                        <div className="relative mb-6 h-40 w-40">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="h-full w-full" viewBox="0 0 160 160">
                              <circle
                                cx="80"
                                cy="80"
                                r="70"
                                fill="none"
                                stroke="#4B1D89"
                                strokeWidth="4"
                                strokeDasharray="439.8"
                                strokeDashoffset="0"
                              />
                              <circle
                                cx="80"
                                cy="80"
                                r="70"
                                fill="none"
                                stroke="url(#gradient)"
                                strokeWidth="8"
                                strokeDasharray="439.8"
                                strokeDashoffset="110"
                                strokeLinecap="round"
                              />
                              <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#EC4899" />
                                  <stop offset="100%" stopColor="#8B5CF6" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <div className="text-2xl font-bold text-white">75%</div>
                              <div className="text-sm text-purple-300">Compatibility</div>
                            </div>
                          </div>
                        </div>

                        <div className="w-full space-y-4">
                          <div>
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-sm text-purple-200">Analytical Thinking</span>
                              <span className="text-sm text-purple-300">92%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-purple-900/40">
                              <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-pink-500 to-purple-500"></div>
                            </div>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-sm text-purple-200">Creative Problem Solving</span>
                              <span className="text-sm text-purple-300">78%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-purple-900/40">
                              <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-pink-500 to-purple-500"></div>
                            </div>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-sm text-purple-200">Technical Aptitude</span>
                              <span className="text-sm text-purple-300">85%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-purple-900/40">
                              <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-pink-500 to-purple-500"></div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 w-full rounded-xl border border-purple-500/20 bg-purple-900/20 p-4">
                          <div className="text-center">
                            <div className="text-sm text-purple-300">Recommended Career Path</div>
                            <div className="text-lg font-bold text-white">Data Science & AI Development</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section ref={howItWorksRef} className="relative py-24">
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-black via-purple-900/20 to-black"></div>

          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <div className="mb-16 text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="mb-4 text-3xl font-bold md:text-4xl"
              >
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                  Your Neural Journey
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mx-auto max-w-2xl text-lg text-purple-200"
              >
                Embark on a transformative educational experience with AI Youni
              </motion.p>
            </div>

            <div className="relative mx-auto max-w-4xl">
              {/* Connection Line */}
              <div className="absolute left-[50%] top-0 h-full w-1 -translate-x-1/2 bg-gradient-to-b from-pink-600/50 via-purple-600/50 to-indigo-600/50 md:left-[7rem]"></div>

              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 + index * 0.2 }}
                  className="relative mb-16 md:ml-[7rem]"
                >
                  <div className="absolute left-[50%] top-0 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border-4 border-black bg-gradient-to-br from-pink-600 to-purple-600 md:left-[-7rem]">
                    {step.icon}
                  </div>

                  <div className="ml-0 rounded-3xl border border-purple-500/20 bg-black/40 p-6 backdrop-blur-md md:ml-8">
                    <h3 className="mb-2 text-xl font-bold text-white">{step.title}</h3>
                    <p className="text-purple-200">{step.description}</p>
                  </div>
                </motion.div>
              ))}

              {/* Final Step */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="relative mx-auto flex max-w-md flex-col items-center text-center"
              >
                <div className="absolute -inset-10 rounded-full bg-gradient-to-r from-pink-600/10 via-purple-600/10 to-indigo-600/10 blur-3xl"></div>
                <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-600 to-purple-600">
                  <Sparkles className="h-10 w-10" />
                </div>

                <h3 className="mb-2 text-2xl font-bold text-white">Begin Your Transformation</h3>
                <p className="mb-6 text-purple-200">
                  Start your journey today and discover the career path that aligns with your unique neural profile.
                </p>

                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-pink-600 to-purple-600 text-white transition-all duration-300 hover:scale-105"
                >
                  <Link href="/signup">Start Your Neural Journey</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-purple-500/20 bg-black/60 py-8 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600">
                <span className="text-lg font-bold">AI</span>
              </div>
              <span className="text-xl font-bold text-white">Youni</span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 md:justify-end">
              <Link href="#" className="text-sm text-purple-300 transition-colors hover:text-white">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-purple-300 transition-colors hover:text-white">
                Terms of Service
              </Link>
              <Link href="#" className="text-sm text-purple-300 transition-colors hover:text-white">
                Contact Us
              </Link>
              <Link href="#" className="text-sm text-purple-300 transition-colors hover:text-white">
                About
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-purple-300">© 2025 AI Youni. All rights reserved.</p>
            <p className="mt-2 text-xs text-purple-400">Powered by advanced neural mapping technology</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Navigation Link Component
function NavLink({
  children,
  href,
  onClick,
  mobile = false,
}: {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  mobile?: boolean
}) {
  const Component = href ? Link : "button"

  return (
    <Component
      href={href || "#"}
      onClick={onClick}
      className={cn(
        "relative font-medium transition-colors",
        mobile
          ? "w-full text-left text-base text-purple-300 hover:text-white"
          : "text-sm text-purple-300 hover:text-white",
      )}
    >
      {children}
      <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300 group-hover:w-full" />
    </Component>
  )
}

