const DEFAULT_GOALS = { calories: 2000, protein: 150, carbs: 250, fat: 65 }
const CLOSE_THRESHOLD = 0.9  // 90% of goal
const OVER_THRESHOLD = 1.0   // 100% of goal

export function DailyProgress({ entries = [], goals = DEFAULT_GOALS }) {
  const totals = entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + (entry.calories || 0),
      protein: acc.protein + (entry.protein || 0),
      carbs: acc.carbs + (entry.carbs || 0),
      fat: acc.fat + (entry.fat || 0)
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const getProgress = (current, goal) => Math.min((current / goal) * 100, 100)
  const getStatus = (current, goal) => {
    const ratio = current / goal
    if (ratio > OVER_THRESHOLD) return 'over'
    if (ratio >= CLOSE_THRESHOLD) return 'close'
    return 'under'
  }

  return (
    <div class="progress-card">
      <div class="progress-main">
        <div class="progress-calories">
          <span class="progress-value">{Math.round(totals.calories)}</span>
          <span class="progress-label">/ {goals.calories} cal</span>
        </div>
        <div class="progress-bar-container">
          <div
            class={`progress-bar progress-bar--${getStatus(totals.calories, goals.calories)}`}
            style={{ width: `${getProgress(totals.calories, goals.calories)}%` }}
          />
        </div>
      </div>
      <div class="progress-macros">
        <div class="macro">
          <div class="macro-header">
            <span class="macro-label">Protein</span>
            <span class="macro-value">{Math.round(totals.protein)}g / {goals.protein}g</span>
          </div>
          <div class="progress-bar-container progress-bar-container--sm">
            <div
              class="progress-bar progress-bar--protein"
              style={{ width: `${getProgress(totals.protein, goals.protein)}%` }}
            />
          </div>
        </div>
        <div class="macro">
          <div class="macro-header">
            <span class="macro-label">Carbs</span>
            <span class="macro-value">{Math.round(totals.carbs)}g / {goals.carbs}g</span>
          </div>
          <div class="progress-bar-container progress-bar-container--sm">
            <div
              class="progress-bar progress-bar--carbs"
              style={{ width: `${getProgress(totals.carbs, goals.carbs)}%` }}
            />
          </div>
        </div>
        <div class="macro">
          <div class="macro-header">
            <span class="macro-label">Fat</span>
            <span class="macro-value">{Math.round(totals.fat)}g / {goals.fat}g</span>
          </div>
          <div class="progress-bar-container progress-bar-container--sm">
            <div
              class="progress-bar progress-bar--fat"
              style={{ width: `${getProgress(totals.fat, goals.fat)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
