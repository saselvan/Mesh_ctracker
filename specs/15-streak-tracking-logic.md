# Spec: Streak Tracking Core Logic

**Phase:** 5 - Gamification & Insights
**Priority:** High
**Estimated Effort:** Medium

---

## Overview

Comprehensive streak tracking system that tracks consecutive days of hitting calorie goals. Handles edge cases like timezone changes, missed days, and partial goal achievement.

## Requirements

### Streak Rules

1. **Day Counts as Success** when:
   - Calories are within range: `goal * 0.9 <= actual <= goal * 1.1`
   - At least one entry logged that day

2. **Streak Continues** when:
   - Yesterday was successful AND today is successful
   - **Note:** "Today in progress" means the streak count doesn't reset until midnight passes without success. The user sees their current streak while they still have time to log entries. Streak only breaks on the NEXT day when we check if yesterday was successful.

3. **Streak Breaks** when:
   - App loads on a new day and yesterday was NOT successful
   - A full day passed with no entries
   - A full day ended outside calorie range

4. **Streak Display Logic:**
   - Show current streak count even if today not yet successful
   - Streak counter updates in real-time when goal is hit
   - Visual indicator (dimmed dots?) can show "today pending" state

### Data Model

```javascript
// src/utils/streaks.js

// Stored in localStorage: streak-{profileId}
const STREAK_SCHEMA = {
  current: 0,           // Current streak count
  longest: 0,           // All-time longest streak
  lastSuccessDate: null, // ISO date string of last successful day
  history: [],          // Last 30 days of success/fail
  weeklyGoal: 5,        // Days per week target (optional)
  weeklyProgress: 0     // Days hit this week
}

// History entry
{
  date: "2025-01-17",
  success: true,
  calories: 2150,
  goal: 2200,
  ratio: 0.98
}
```

### Shared Utilities

These utility functions are used throughout streak logic. They should be defined in `src/utils/date.js`:

```javascript
// src/utils/date.js

/**
 * Format a Date object to YYYY-MM-DD string
 */
export function formatDate(date) {
  return date.toISOString().split('T')[0]
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
```

### Core Functions

```javascript
// src/utils/streaks.js
import { formatDate, getYesterday, getStartOfWeek, calculateTotals } from './date'

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
  return ratio >= 0.9 && ratio <= 1.1
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
    ratio: goal ? calories / goal : 0
  }

  if (existingIndex >= 0) {
    data.history[existingIndex] = historyEntry
  } else {
    data.history.push(historyEntry)
  }

  // Keep only last 30 days
  data.history = data.history
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 30)

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
    // This is called at end of day or on new day load
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
  return history.filter(h =>
    h.success && new Date(h.date) >= startOfWeek
  ).length
}

// Note: getStartOfWeek and getYesterday are imported from src/utils/date.js
```

### Streak Check on App Load

```javascript
// In App.jsx or useEffect
import { formatDate, getYesterday, calculateTotals } from '../utils/date'
import { getStreakData, saveStreakData, updateStreakForDay } from '../utils/streaks'

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
```

### Streak Freeze (Future Feature)

> **Note:** This feature requires schema extension. When implemented, add these fields to STREAK_SCHEMA:
> - `freezesAvailable: 1` — Number of freeze days available per week
> - `frozenDates: []` — Array of YYYY-MM-DD strings for frozen days

```javascript
// FUTURE: Allow one "freeze" per week to protect streak
// Requires adding freezesAvailable and frozenDates to schema first
export function useStreakFreeze(profileId, date) {
  const data = getStreakData(profileId)

  // Guard: Ensure schema has freeze fields
  if (typeof data.freezesAvailable === 'undefined') {
    console.warn('Streak freeze requires schema migration')
    return false
  }

  if (data.freezesAvailable > 0) {
    data.freezesAvailable--
    data.frozenDates = data.frozenDates || []
    data.frozenDates.push(date)
    // Frozen day counts as neutral (doesn't break or extend)
    saveStreakData(profileId, data)
    return true
  }
  return false
}
```

### Recalculate Streak

For data recovery or migration:

```javascript
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
    history: dailyTotals.slice(-30)
  }
}
```

## Acceptance Criteria

- [ ] Streak increments when goal hit (90-110% range)
- [ ] Streak resets when day missed
- [ ] Streak persists across sessions
- [ ] Longest streak tracked separately
- [ ] Last 30 days history stored
- [ ] Weekly progress calculated (Mon-Sun)
- [ ] Streak recalculation works for data recovery
- [ ] Per-profile streak data

## Files to Create/Modify

- `src/utils/streaks.js` — Create (core logic)
- `src/utils/storage.js` — Add streak storage helpers
- `src/components/App.jsx` — Call streak check on load
- `src/hooks/useStreak.js` — Optional: reactive hook

## Test Plan

1. Add entries hitting goal → streak = 1?
2. Next day hit goal → streak = 2?
3. Miss a day → streak resets?
4. Reload app → streak persists?
5. Hit 100% exactly → counts as success?
6. Hit 89% → doesn't count?
7. Hit 111% → doesn't count?
8. Recalculate from entries → correct streak?

## Edge Cases

- Timezone change mid-streak
- User changes goal mid-streak
- Entries deleted after day ended
- Multiple profiles with separate streaks
- App not opened for several days
