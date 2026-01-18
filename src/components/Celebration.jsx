import { useEffect, useRef } from 'preact/hooks'

export function Celebration({ onComplete }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const dots = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 0,
      maxRadius: Math.random() * 30 + 10,
      delay: Math.random() * 500,
      color: ['#5C6B54', '#C17B5F', '#FAF7F2'][Math.floor(Math.random() * 3)],
      startTime: Date.now()
    }))

    let animationId

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const now = Date.now()
      let allComplete = true

      for (const dot of dots) {
        const elapsed = now - dot.startTime - dot.delay
        if (elapsed < 0) {
          allComplete = false
          continue
        }

        const progress = Math.min(elapsed / 2000, 1)
        if (progress < 1) allComplete = false

        dot.radius = dot.maxRadius * progress
        const opacity = 1 - progress

        ctx.fillStyle = dot.color
        ctx.globalAlpha = opacity
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1

      if (!allComplete) {
        animationId = requestAnimationFrame(animate)
      } else if (onComplete) {
        onComplete()
      }
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [onComplete])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1000
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  )
}
