import { useEffect, useRef, useState } from 'preact/hooks'
import { SUCCESS_RATIO_MIN, SUCCESS_RATIO_MAX } from '../utils/constants'

const DEFAULT_GOALS = { calories: 2000, protein: 150, carbs: 250, fat: 65 }
const CLOSE_THRESHOLD = 0.9  // 90% of goal
const OVER_THRESHOLD = 1.0   // 100% of goal

// Compact ring - 120px diameter, 52px radius
const MAIN_RADIUS = 52
const MAIN_CIRCUMFERENCE = 2 * Math.PI * MAIN_RADIUS

export function DailyProgress({ entries = [], goals = DEFAULT_GOALS, profileId, date, onCelebrationTrigger, justLogged }) {
  const [displayCalories, setDisplayCalories] = useState(0)
  const prevCaloriesRef = useRef(0)

  const totals = entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + (entry.calories || 0),
      protein: acc.protein + (entry.protein || 0),
      carbs: acc.carbs + (entry.carbs || 0),
      fat: acc.fat + (entry.fat || 0)
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  // Animated count-up effect when calories change
  useEffect(() => {
    const targetCalories = totals.calories
    const startCalories = prevCaloriesRef.current

    if (justLogged && targetCalories > startCalories) {
      // Animate from previous value to new value
      const duration = 600 // ms
      const startTime = performance.now()

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        const current = Math.round(startCalories + (targetCalories - startCalories) * eased)
        setDisplayCalories(current)

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    } else {
      setDisplayCalories(targetCalories)
    }

    prevCaloriesRef.current = targetCalories
  }, [totals.calories, justLogged])

  const getProgress = (current, goal) => Math.min(current / goal, 1)
  const getStatus = (current, goal) => {
    const ratio = current / goal
    if (ratio > OVER_THRESHOLD) return 'over'
    if (ratio >= CLOSE_THRESHOLD) return 'close'
    return 'under'
  }

  const calorieProgress = getProgress(totals.calories, goals.calories)
  const calorieStatus = getStatus(totals.calories, goals.calories)
  const calorieOffset = MAIN_CIRCUMFERENCE * (1 - calorieProgress)

  const macros = [
    { key: 'protein', label: 'P', value: totals.protein, goal: goals.protein, color: 'var(--color-protein)' },
    { key: 'carbs', label: 'C', value: totals.carbs, goal: goals.carbs, color: 'var(--color-carbs)' },
    { key: 'fat', label: 'F', value: totals.fat, goal: goals.fat, color: 'var(--color-fat)' }
  ]

  // Check celebration trigger
  useEffect(() => {
    if (!profileId || !date || !onCelebrationTrigger) return

    const ratio = totals.calories / goals.calories
    const celebrationKey = `celebrated-${profileId}-${date}`
    const alreadyCelebrated = localStorage.getItem(celebrationKey)

    if (ratio >= SUCCESS_RATIO_MIN && ratio <= SUCCESS_RATIO_MAX && !alreadyCelebrated) {
      localStorage.setItem(celebrationKey, 'true')
      onCelebrationTrigger()
    }
  }, [totals.calories, goals.calories, profileId, date, onCelebrationTrigger])

  return (
    <div class={`progress-card progress-card--compact ${justLogged ? 'progress-card--pulse' : ''}`}>
      <div class="progress-compact">
        {/* Compact Calorie Ring - 120px */}
        <div class="progress-ring progress-ring--compact">
          <svg viewBox="0 0 120 120">
            <defs>
              <linearGradient id="watercolor-sage" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-sage)" stopOpacity="0.9" />
                <stop offset="50%" stopColor="var(--color-sage)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="var(--color-terracotta)" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            {/* Background ring */}
            <circle
              class="progress-ring-bg"
              cx="60"
              cy="60"
              r={MAIN_RADIUS}
            />
            {/* Progress ring */}
            <circle
              class={`progress-ring-fill progress-ring-fill--${calorieStatus}`}
              cx="60"
              cy="60"
              r={MAIN_RADIUS}
              strokeDasharray={MAIN_CIRCUMFERENCE}
              strokeDashoffset={calorieOffset}
              stroke="url(#watercolor-sage)"
            />
          </svg>
          {/* Center content */}
          <div class="progress-ring-content">
            <span class="progress-value progress-value--compact">{Math.round(displayCalories)}</span>
            <span class="progress-label progress-label--compact">of {goals.calories}</span>
          </div>
          <div aria-live="polite" class="sr-only">
            {Math.round(totals.calories)} of {goals.calories} calories consumed
          </div>
        </div>

        {/* Horizontal Macro Bars */}
        <div class="macro-bars">
          {macros.map(macro => {
            const progress = getProgress(macro.value, macro.goal)
            const percent = Math.round(progress * 100)

            return (
              <div class="macro-bar-row" key={macro.key}>
                <span class="macro-bar-label">{macro.label}</span>
                <div class="macro-bar-track">
                  <div
                    class={`macro-bar-fill macro-bar-fill--${macro.key}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span class="macro-bar-value">{Math.round(macro.value)}g</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
