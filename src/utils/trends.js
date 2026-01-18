import { getStartOfWeek, calculateTotals, formatDate } from './date'

export function getWeeklyTrends(entries, goals) {
  const startOfWeek = getStartOfWeek(new Date())
  const weekEntries = entries.filter(e => new Date(e.date + 'T00:00:00') >= startOfWeek)

  if (weekEntries.length === 0) {
    return {
      avgCalories: 0,
      avgProtein: 0,
      avgCarbs: 0,
      avgFat: 0,
      successRate: 0,
      trend: 'stable',
      daysLogged: 0
    }
  }

  // Group by date
  const byDate = new Map()
  for (const entry of weekEntries) {
    if (!byDate.has(entry.date)) {
      byDate.set(entry.date, [])
    }
    byDate.get(entry.date).push(entry)
  }

  const dailyTotals = []
  let successCount = 0

  for (const [date, dateEntries] of byDate) {
    const totals = calculateTotals(dateEntries)
    dailyTotals.push(totals)

    const ratio = goals.calories > 0 ? totals.calories / goals.calories : 0
    if (ratio >= 0.9 && ratio <= 1.1) {
      successCount++
    }
  }

  const daysLogged = dailyTotals.length
  const avgCalories = dailyTotals.reduce((sum, t) => sum + t.calories, 0) / daysLogged
  const avgProtein = dailyTotals.reduce((sum, t) => sum + t.protein, 0) / daysLogged
  const avgCarbs = dailyTotals.reduce((sum, t) => sum + t.carbs, 0) / daysLogged
  const avgFat = dailyTotals.reduce((sum, t) => sum + t.fat, 0) / daysLogged

  const successRate = (successCount / daysLogged) * 100

  // Determine trend
  let trend = 'stable'
  if (avgCalories > goals.calories * 1.05) {
    trend = 'up'
  } else if (avgCalories < goals.calories * 0.95) {
    trend = 'down'
  }

  return {
    avgCalories: Math.round(avgCalories),
    avgProtein: Math.round(avgProtein),
    avgCarbs: Math.round(avgCarbs),
    avgFat: Math.round(avgFat),
    successRate: Math.round(successRate),
    trend,
    daysLogged
  }
}
