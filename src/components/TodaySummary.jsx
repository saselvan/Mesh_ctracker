import { useState, useEffect, useRef } from 'preact/hooks'

/**
 * TodaySummary - Conditional display of today's meal count and calories
 *
 * Behavioral design:
 * - Only shows after first meal logged (clean zero-state)
 * - Becomes feedback indicator after logging (green pulse + checkmark)
 * - Expandable to see full entry list
 * - Immediate reinforcement: updates <200ms after log action
 */
export function TodaySummary({ entries, totalCalories, expanded, onToggle, justLogged }) {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const prevCaloriesRef = useRef(totalCalories)

  // Detect when calories increase (meal was logged)
  useEffect(() => {
    if (justLogged && totalCalories > prevCaloriesRef.current) {
      setShowConfirmation(true)
      const timer = setTimeout(() => setShowConfirmation(false), 2000)
      return () => clearTimeout(timer)
    }
    prevCaloriesRef.current = totalCalories
  }, [totalCalories, justLogged])

  // Don't render if no meals logged yet
  if (entries.length === 0) {
    return null
  }

  const mealCount = entries.length
  const mealWord = mealCount === 1 ? 'meal' : 'meals'

  return (
    <button
      class={`today-summary ${showConfirmation ? 'today-summary--confirmed' : ''}`}
      onClick={onToggle}
      aria-expanded={expanded}
      aria-label={`Today: ${mealCount} ${mealWord}, ${Math.round(totalCalories)} calories. Click to ${expanded ? 'collapse' : 'expand'}`}
    >
      <span class="today-summary-text">
        Today: {mealCount} {mealWord}, {Math.round(totalCalories)} cal
      </span>
      {showConfirmation ? (
        <span class="today-summary-check" aria-hidden="true">✓</span>
      ) : (
        <span class={`today-summary-arrow ${expanded ? 'today-summary-arrow--up' : ''}`} aria-hidden="true">
          ▼
        </span>
      )}
    </button>
  )
}
