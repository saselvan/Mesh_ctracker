export function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDisplayDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (dateStr === formatDate(today)) {
    return 'Today'
  }
  if (dateStr === formatDate(yesterday)) {
    return 'Yesterday'
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

export function addDays(dateStr, days) {
  const date = new Date(dateStr + 'T00:00:00')
  date.setDate(date.getDate() + days)
  return formatDate(date)
}

export function getToday() {
  return formatDate(new Date())
}

/**
 * Get yesterday's date as YYYY-MM-DD string
 */
export function getYesterday(date = new Date()) {
  const d = new Date(date)
  d.setDate(d.getDate() - 1)
  return formatDate(d)
}

/**
 * Get start of week (Monday) as Date object
 */
export function getStartOfWeek(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Calculate totals from an array of entries
 */
export function calculateTotals(entries) {
  return entries.reduce((acc, entry) => ({
    calories: acc.calories + (entry.calories || 0),
    protein: acc.protein + (entry.protein || 0),
    carbs: acc.carbs + (entry.carbs || 0),
    fat: acc.fat + (entry.fat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
}

/**
 * Pick a random element from an array
 */
export function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)]
}
