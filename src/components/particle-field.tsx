"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
  opacity: number
  life: number
  maxLife: number
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0, radius: 150 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }

    window.addEventListener("mousemove", handleMouseMove)

    // Create particles
    const particles: Particle[] = []
    const particleCount = 100
    const colors = [
      "#EC4899", // pink
      "#8B5CF6", // purple
      "#6366F1", // indigo
    ]

    for (let i = 0; i < particleCount; i++) {
      createParticle(particles, colors, canvas)
    }

    // Animation properties
    let animationFrameId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Update life
        p.life--

        // If particle is dead, create a new one
        if (p.life <= 0) {
          particles[i] = createNewParticle(colors, canvas)
          continue
        }

        // Calculate opacity based on life
        p.opacity = p.life / p.maxLife

        // Move particle
        p.x += p.speedX
        p.y += p.speedY

        // Check if particle is near mouse
        const dx = mouseRef.current.x - p.x
        const dy = mouseRef.current.y - p.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < mouseRef.current.radius) {
          const angle = Math.atan2(dy, dx)
          const force = (mouseRef.current.radius - distance) / mouseRef.current.radius

          p.speedX -= Math.cos(angle) * force * 0.2
          p.speedY -= Math.sin(angle) * force * 0.2
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color.replace("1)", `${p.opacity})`)
        ctx.fill()

        // Draw connections between nearby particles
        connectParticles(particles, i, ctx)
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  // Create a new particle
  function createNewParticle(colors: string[], canvas: HTMLCanvasElement): Particle {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)].replace(")", ", 1)"),
      opacity: 1,
      life: Math.random() * 200 + 50,
      maxLife: Math.random() * 200 + 50,
    }
  }

  // Create initial particles
  function createParticle(particles: Particle[], colors: string[], canvas: HTMLCanvasElement) {
    particles.push(createNewParticle(colors, canvas))
  }

  // Connect particles that are close to each other
  function connectParticles(particles: Particle[], index: number, ctx: CanvasRenderingContext2D) {
    const connectionDistance = 100

    for (let j = index + 1; j < particles.length; j++) {
      const dx = particles[index].x - particles[j].x
      const dy = particles[index].y - particles[j].y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < connectionDistance) {
        const opacity = (1 - distance / connectionDistance) * 0.5 * particles[index].opacity * particles[j].opacity

        ctx.beginPath()
        ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`
        ctx.lineWidth = 0.5
        ctx.moveTo(particles[index].x, particles[index].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.stroke()
      }
    }
  }

  return <canvas ref={canvasRef} className="fixed inset-0 z-0" />
}

