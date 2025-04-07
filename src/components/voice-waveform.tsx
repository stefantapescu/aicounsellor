"use client"

import { useEffect, useRef } from "react"

interface VoiceWaveformProps {
  isActive: boolean
  className?: string
}

export function VoiceWaveform({ isActive, className }: VoiceWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Animation properties
    let animationFrameId: number
    let time = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      time += 0.1

      const centerY = canvas.height / 2
      const waveWidth = canvas.width

      ctx.beginPath()

      // Draw the waveform
      for (let x = 0; x < waveWidth; x++) {
        const amplitude = isActive ? 10 : 2
        const frequency = isActive ? 0.05 : 0.02
        const speed = isActive ? 0.3 : 0.1

        // Create multiple overlapping sine waves for a more complex waveform
        const y1 = Math.sin(x * frequency + time * speed) * amplitude
        const y2 = Math.sin(x * frequency * 2 + time * speed * 1.5) * amplitude * 0.5
        const y3 = Math.sin(x * frequency * 0.5 + time * speed * 0.7) * amplitude * 0.3

        const y = centerY + y1 + y2 + y3

        if (x === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
      gradient.addColorStop(0, "#EC4899") // pink
      gradient.addColorStop(0.5, "#8B5CF6") // purple
      gradient.addColorStop(1, "#6366F1") // indigo

      ctx.strokeStyle = gradient
      ctx.lineWidth = 2
      ctx.stroke()

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [isActive])

  return <canvas ref={canvasRef} className={className} />
}

