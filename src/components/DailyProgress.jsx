import { useEffect } from 'preact/hooks'
import { SUCCESS_RATIO_MIN, SUCCESS_RATIO_MAX } from '../utils/constants'

const DEFAULT_GOALS = { calories: 2000, protein: 150, carbs: 250, fat: 65 }
const CLOSE_THRESHOLD = 0.9  // 90% of goal
const OVER_THRESHOLD = 1.0   // 100% of goal

// SVG arc calculations
const MAIN_RADIUS = 78
const MAIN_CIRCUMFERENCE = 2 * Math.PI * MAIN_RADIUS
const MACRO_RADIUS = 22
const MACRO_CIRCUMFERENCE = 2 * Math.PI * MACRO_RADIUS

export function DailyProgress({ entries = [], goals = DEFAULT_GOALS, profileId, date, onCelebrationTrigger }) {
  const totals = entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + (entry.calories || 0),
      protein: acc.protein + (entry.protein || 0),
      carbs: acc.carbs + (entry.carbs || 0),
      fat: acc.fat + (entry.fat || 0)
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

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
    { key: 'protein', label: 'Protein', value: totals.protein, goal: goals.protein },
    { key: 'carbs', label: 'Carbs', value: totals.carbs, goal: goals.carbs },
    { key: 'fat', label: 'Fat', value: totals.fat, goal: goals.fat }
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
    <div class="progress-card">
      {/* Main Calorie Ring */}
      <div class="progress-main">
        <div class="progress-ring">
          <svg viewBox="0 0 180 180">
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
              cx="90"
              cy="90"
              r={MAIN_RADIUS}
            />
            {/* Progress ring */}
            <circle
              class={`progress-ring-fill progress-ring-fill--${calorieStatus}`}
              cx="90"
              cy="90"
              r={MAIN_RADIUS}
              strokeDasharray={MAIN_CIRCUMFERENCE}
              strokeDashoffset={calorieOffset}
              stroke="url(#watercolor-sage)"
            />
          </svg>
          {/* Center content */}
          <div class="progress-ring-content">
            <span class="progress-value">{Math.round(totals.calories)}</span>
            <span class="progress-label">of {goals.calories} cal</span>
          </div>
        </div>
      </div>

      {/* Macro Rings */}
      <div class="progress-macros">
        {macros.map(macro => {
          const progress = getProgress(macro.value, macro.goal)
          const offset = MACRO_CIRCUMFERENCE * (1 - progress)

          return (
            <div class="macro" key={macro.key}>
              <div class="macro-ring">
                <svg viewBox="0 0 56 56">
                  <circle
                    class="macro-ring-bg"
                    cx="28"
                    cy="28"
                    r={MACRO_RADIUS}
                  />
                  <circle
                    class={`macro-ring-fill macro-ring-fill--${macro.key}`}
                    cx="28"
                    cy="28"
                    r={MACRO_RADIUS}
                    strokeDasharray={MACRO_CIRCUMFERENCE}
                    strokeDashoffset={offset}
                  />
                </svg>
                <span class="macro-ring-value">{Math.round(macro.value)}</span>
              </div>
              <span class="macro-label">{macro.label}</span>
              <span class="macro-detail">/ {macro.goal}g</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
