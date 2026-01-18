import { formatDate, getYesterday, getStartOfWeek, calculateTotals } from './date'
import { SUCCESS_RATIO_MIN, SUCCESS_RATIO_MAX, HISTORY_LIMIT, MILESTONES } from './constants'

export function getStreakData(profileId) {
  const key = profileId ? `streak-${profileId}` : 'streak'
  const stored = localStorage.getItem(key)
  return stored ? JSON.parse(stored) : {
    current: 0,
    longest: 0,
    lastSuccessDate: null,
    history: [],
    weeklyGoal: 5,
    weeklyProgress: 0
  }
}

export function saveStreakData(profileId, data) {
  const key = profileId ? `streak-${profileId}` : 'streak'
  localStorage.setItem(key, JSON.stringify(data))
}

export function isSuccessfulDay(calories, goal) {
  if (!goal || goal === 0) return false
  const ratio = calories / goal
  return ratio >= SUCCESS_RATIO_MIN && ratio <= SUCCESS_RATIO_MAX
}

export function updateStreakForDay(profileId, date, calories, goal) {
  const data = getStreakData(profileId)
  const success = isSuccessfulDay(calories, goal)
  const today = formatDate(new Date())
  const yesterday = getYesterday(new Date())

  // Update history
  const existingIndex = data.history.findIndex(h => h.date === date)
  const historyEntry = {
    date,
    success,
    calories,
    goal,
    ratio: goal > 0 ? calories / goal : 0
  }

  if (existingIndex >= 0) {
    data.history[existingIndex] = historyEntry
  } else {
    data.history.push(historyEntry)
  }

  // Keep only last 30 days
  data.history = data.history
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, HISTORY_LIMIT)

  // Update streak
  if (date === today && success) {
    if (data.lastSuccessDate === yesterday) {
      // Continuing streak
      data.current++
    } else if (data.lastSuccessDate !== today) {
      // Starting new streak
      data.current = 1
    }
    data.lastSuccessDate = today
    data.longest = Math.max(data.longest, data.current)
  } else if (date === today && !success && data.lastSuccessDate !== today) {
    // Check if streak should break (day ended without success)
    if (data.lastSuccessDate !== yesterday && data.lastSuccessDate !== today) {
      data.current = 0
    }
  }

  // Update weekly progress
  data.weeklyProgress = calculateWeeklyProgress(data.history)

  saveStreakData(profileId, data)
  return data
}

function calculateWeeklyProgress(history) {
  const startOfWeek = getStartOfWeek(new Date())
  const startOfWeekStr = formatDate(startOfWeek)
  return history.filter(h =>
    h.success && h.date >= startOfWeekStr
  ).length
}

export function checkAndUpdateStreak(profileId, entries, goals) {
  const today = formatDate(new Date())
  const todayEntries = entries.filter(e => e.date === today)

  if (todayEntries.length > 0) {
    const totals = calculateTotals(todayEntries)
    updateStreakForDay(profileId, today, totals.calories, goals.calories)
  }

  // Check if streak broke due to missed yesterday
  const data = getStreakData(profileId)
  const yesterday = getYesterday(new Date())

  if (data.lastSuccessDate &&
      data.lastSuccessDate !== today &&
      data.lastSuccessDate !== yesterday) {
    // Streak is broken
    data.current = 0
    saveStreakData(profileId, data)
  }

  return getStreakData(profileId)
}

export function recalculateStreak(profileId, allEntries, goals) {
  // Sort entries by date
  const byDate = new Map()
  for (const entry of allEntries) {
    if (!byDate.has(entry.date)) {
      byDate.set(entry.date, [])
    }
    byDate.get(entry.date).push(entry)
  }

  // Calculate totals per day
  const dailyTotals = []
  for (const [date, entries] of byDate) {
    const totals = calculateTotals(entries)
    dailyTotals.push({
      date,
      success: isSuccessfulDay(totals.calories, goals.calories),
      calories: totals.calories,
      goal: goals.calories
    })
  }

  // Sort by date ascending
  dailyTotals.sort((a, b) => new Date(a.date) - new Date(b.date))

  // Calculate streaks
  let current = 0
  let longest = 0
  let lastSuccess = null

  for (const day of dailyTotals) {
    if (day.success) {
      if (lastSuccess) {
        const lastDate = new Date(lastSuccess)
        const thisDate = new Date(day.date)
        const diffDays = Math.round((thisDate - lastDate) / (1000 * 60 * 60 * 24))

        if (diffDays === 1) {
          current++
        } else {
          current = 1
        }
      } else {
        current = 1
      }
      lastSuccess = day.date
      longest = Math.max(longest, current)
    }
  }

  return {
    current,
    longest,
    lastSuccessDate: lastSuccess,
    history: dailyTotals.slice(-HISTORY_LIMIT),
    weeklyGoal: 5,
    weeklyProgress: calculateWeeklyProgress(dailyTotals.slice(-HISTORY_LIMIT))
  }
}

export function checkMilestones(streakData) {
  const achieved = streakData.milestones || []

  return MILESTONES.filter(days => {
    return streakData.current >= days && !achieved.includes(days)
  }).map(days => ({
    days,
    message: getMilestoneMessage(days),
    achieved: false
  }))
}

function getMilestoneMessage(days) {
  const messages = {
    3: '3-day streak! Building momentum!',
    7: 'One week strong!',
    14: 'Two weeks! You\'re on fire!',
    30: 'One month streak! Incredible!',
    50: '50 days! Unstoppable!',
    100: '100-day streak! Legendary!',
    365: 'One full year! Champion!'
  }
  return messages[days] || `${days}-day streak!`
}
