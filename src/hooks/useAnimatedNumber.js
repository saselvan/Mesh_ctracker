import { useState, useEffect, useRef } from 'preact/hooks'

// Easing function for smooth deceleration
function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4)
}

export function useAnimatedNumber(target, duration = 800) {
  const [current, setCurrent] = useState(0)
  const frameRef = useRef(null)
  const startTimeRef = useRef(null)
  const startValueRef = useRef(0)

  useEffect(() => {
    // Cancel any running animation
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
    }

    startValueRef.current = current
    startTimeRef.current = null

    function animate(timestamp) {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutQuart(progress)

      const newValue = startValueRef.current + (target - startValueRef.current) * easedProgress
      setCurrent(newValue)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    // Cleanup on unmount
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [target, duration])

  return Math.round(current)
}
