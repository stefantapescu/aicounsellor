"use client"

import { useEffect, useRef } from "react"

interface Node {
  x: number
  y: number
  size: number
  connections: number[]
  pulseSpeed: number
  pulseOffset: number
  color: string
}

export function NeuralPathways() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

    // Create nodes
    const nodes: Node[] = []
    const nodeCount = 40
    const colors = [
      "#EC4899", // pink
      "#8B5CF6", // purple
      "#6366F1", // indigo
    ]

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        connections: [],
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    // Create connections between nodes
    nodes.forEach((node, i) => {
      const connectionCount = Math.floor(Math.random() * 3) + 1
      for (let j = 0; j < connectionCount; j++) {
        const targetIndex = Math.floor(Math.random() * nodeCount)
        if (targetIndex !== i && !node.connections.includes(targetIndex)) {
          node.connections.push(targetIndex)
        }
      }
    })

    // Animation properties
    let animationFrameId: number
    let time = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      time += 0.01

      // Draw connections
      nodes.forEach((node, i) => {
        node.connections.forEach((targetIndex) => {
          const target = nodes[targetIndex]

          // Calculate distance for pulse effect
          const dx = target.x - node.x
          const dy = target.y - node.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          // Draw connection line with pulse effect
          const pulse = Math.sin(time * node.pulseSpeed * 5 + node.pulseOffset) * 0.5 + 0.5

          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(target.x, target.y)

          const gradient = ctx.createLinearGradient(node.x, node.y, target.x, target.y)
          gradient.addColorStop(0, node.color + "40") // 25% opacity
          gradient.addColorStop(pulse, node.color + "80") // 50% opacity at pulse position
          gradient.addColorStop(1, target.color + "40") // 25% opacity

          ctx.strokeStyle = gradient
          ctx.lineWidth = 0.5
          ctx.stroke()
        })
      })

      // Draw nodes
      nodes.forEach((node) => {
        const pulse = Math.sin(time * node.pulseSpeed + node.pulseOffset) * 0.5 + 0.5
        const size = node.size * (1 + pulse * 0.5)

        ctx.beginPath()
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0" />
}

