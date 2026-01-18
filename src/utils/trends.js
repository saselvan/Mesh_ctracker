import { getStartOfWeek, formatDate, calculateTotals } from './date'
import { SUCCESS_RATIO_MIN, SUCCESS_RATIO_MAX, TREND_THRESHOLD } from './constants'

export function aggregateByDay(entries) {
  const byDate = {}
  entries.forEach(entry => {
    if (!byDate[entry.date]) byDate[entry.date] = []
    byDate[entry.date].push(entry)
  })
  return byDate
}

export function calculateAverages(dailyTotals) {
  const daysLogged = dailyTotals.length
  if (daysLogged === 0) {
    return { avgCalories: 0, avgProtein: 0, avgCarbs: 0, avgFat: 0 }
  }

  return {
    avgCalories: Math.round(dailyTotals.reduce((sum, d) => sum + d.calories, 0) / daysLogged),
    avgProtein: Math.round(dailyTotals.reduce((sum, d) => sum + d.protein, 0) / daysLogged),
    avgCarbs: Math.round(dailyTotals.reduce((sum, d) => sum + d.carbs, 0) / daysLogged),
    avgFat: Math.round(dailyTotals.reduce((sum, d) => sum + d.fat, 0) / daysLogged)
  }
}

export function getWeeklyTrends(entries, goals) {
  const weekStart = getStartOfWeek(new Date())
  const weekStartStr = formatDate(weekStart)
  const weekEntries = entries.filter(e => e.date >= weekStartStr)

  // Group by date
  const byDate = aggregateByDay(weekEntries)

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

  const averages = calculateAverages(dailyTotals)

  // Success rate (within 90-110% of goal)
  let successCount = 0
  dailyTotals.forEach(d => {
    if (goals.calories > 0) {
      const ratio = d.calories / goals.calories
      if (ratio >= SUCCESS_RATIO_MIN && ratio <= SUCCESS_RATIO_MAX) {
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
  if (secondAvg > firstAvg * TREND_THRESHOLD) trend = 'up'
  if (secondAvg < firstAvg * SUCCESS_RATIO_MIN) trend = 'down'

  return {
    ...averages,
    successRate: Math.round(successRate),
    successCount,
    daysLogged,
    trend
  }
}
