import { getStartOfWeek, formatDate, calculateTotals } from './date'

export function getWeeklyTrends(entries, goals) {
  const weekStart = getStartOfWeek(new Date())
  const weekEntries = entries.filter(e => e.date >= weekStart)

  // Group by date
  const byDate = {}
  weekEntries.forEach(entry => {
    if (!byDate[entry.date]) byDate[entry.date] = []
    byDate[entry.date].push(entry)
  })

  const dailyTotals = Object.entries(byDate).map(([date, dayEntries]) => ({
    date,
    ...calculateTotals(dayEntries)
  }))

  const daysLogged = dailyTotals.length
  if (daysLogged === 0) {
    return {
      avgCalories: 0,
      avgProtein: 0,
      avgCarbs: 0,
      avgFat: 0,
      successRate: 0,
      successCount: 0,
      daysLogged: 0,
      trend: 'stable'
    }
  }

  const avgCalories = dailyTotals.reduce((sum, d) => sum + d.calories, 0) / daysLogged
  const avgProtein = dailyTotals.reduce((sum, d) => sum + d.protein, 0) / daysLogged
  const avgCarbs = dailyTotals.reduce((sum, d) => sum + d.carbs, 0) / daysLogged
  const avgFat = dailyTotals.reduce((sum, d) => sum + d.fat, 0) / daysLogged

  // Success rate (within 90-110% of goal)
  let successCount = 0
  dailyTotals.forEach(d => {
    if (goals.calories > 0) {
      const ratio = d.calories / goals.calories
      if (ratio >= 0.9 && ratio <= 1.1) {
        successCount++
      }
    }
  })

  const successRate = (successCount / daysLogged) * 100

  // Trend calculation (compare first half to second half of week)
  const midpoint = Math.floor(daysLogged / 2)
  const firstHalf = dailyTotals.slice(0, midpoint)
  const secondHalf = dailyTotals.slice(midpoint)

  const firstAvg = firstHalf.length > 0
    ? firstHalf.reduce((sum, d) => sum + d.calories, 0) / firstHalf.length
    : 0
  const secondAvg = secondHalf.length > 0
    ? secondHalf.reduce((sum, d) => sum + d.calories, 0) / secondHalf.length
    : 0

  let trend = 'stable'
  if (secondAvg > firstAvg * 1.1) trend = 'up'
  if (secondAvg < firstAvg * 0.9) trend = 'down'

  return {
    avgCalories: Math.round(avgCalories),
    avgProtein: Math.round(avgProtein),
    avgCarbs: Math.round(avgCarbs),
    avgFat: Math.round(avgFat),
    successRate: Math.round(successRate),
    successCount,
    daysLogged,
    trend
  }
}
