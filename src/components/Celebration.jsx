import { useEffect, useRef } from 'preact/hooks'

export function Celebration({ onComplete }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const colors = ['#8B9D82', '#C87864', '#E8DFD8', '#FDF6F0']
    const dots = []

    // Create 50 random dots
    for (let i = 0; i < 50; i++) {
      dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 0,
        maxRadius: Math.random() * 40 + 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 500,
        opacity: 1
      })
    }

    let startTime = null
    const duration = 2000

    function animate(timestamp) {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      let allComplete = true

      dots.forEach(dot => {
        const dotElapsed = elapsed - dot.delay
        if (dotElapsed < 0) {
          allComplete = false
          return
        }

        const progress = Math.min(dotElapsed / duration, 1)
        dot.radius = dot.maxRadius * Math.sin(progress * Math.PI)
        dot.opacity = 1 - progress

        if (progress < 1) allComplete = false

        ctx.beginPath()
        ctx.fillStyle = dot.color
        ctx.globalAlpha = dot.opacity * 0.7
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      ctx.globalAlpha = 1

      if (!allComplete) {
        requestAnimationFrame(animate)
      } else {
        onComplete?.()
      }
    }

    requestAnimationFrame(animate)
  }, [onComplete])

  return (
    <div role="status" aria-live="assertive">
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1000
        }}
        aria-hidden="true"
      />
      <div class="sr-only">Congratulations! You hit your calorie goal!</div>
    </div>
  )
}
