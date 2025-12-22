const GOALS_KEY = 'calorie-tracker-goals'

const DEFAULT_GOALS = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65
}

export function getGoals() {
  try {
    const stored = localStorage.getItem(GOALS_KEY)
    if (stored) {
      return { ...DEFAULT_GOALS, ...JSON.parse(stored) }
    }
  } catch (e) {
    console.error('Failed to load goals:', e)
  }
  return DEFAULT_GOALS
}

export function saveGoals(goals) {
  try {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals))
  } catch (e) {
    console.error('Failed to save goals:', e)
  }
}
