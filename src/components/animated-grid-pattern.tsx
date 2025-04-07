"use client"

import { useEffect, useRef } from "react"

export function AnimatedGridPattern() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Grid properties
    const gridSize = 30
    const lineWidth = 1
    const lineColor = "rgba(128, 90, 213, 0.2)" // Purple color with low opacity

    // Animation properties
    let animationFrameId: number
    let offset = 0
    const speed = 0.5

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = lineColor
      ctx.lineWidth = lineWidth

      // Calculate the number of lines needed
      const numHorizontalLines = Math.ceil(canvas.height / gridSize) + 1
      const numVerticalLines = Math.ceil(canvas.width / gridSize) + 1

      // Draw horizontal lines
      for (let i = 0; i < numHorizontalLines; i++) {
        const y = ((i * gridSize + offset) % (canvas.height + gridSize)) - gridSize
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Draw vertical lines
      for (let i = 0; i < numVerticalLines; i++) {
        const x = ((i * gridSize + offset) % (canvas.width + gridSize)) - gridSize
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      // Update offset for animation
      offset += speed
      if (offset > gridSize) offset = 0

      // Continue animation
      animationFrameId = requestAnimationFrame(drawGrid)
    }

    drawGrid()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="h-full w-full" />
}

