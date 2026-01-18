# Phase 4: Data Layer

Analytics utilities for trends, insights, and sharing.

**Prerequisite:** Phase 1 complete (streak utilities exist)

## Tech Stack
- Pure JavaScript utilities
- Canvas API for sharing
- Existing date/streak utilities

## Specs to Implement

### S-016: Weekly Trends

**Files to create:**
- CREATE `src/utils/trends.js`

**Implementation:**

```javascript
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
```

**Test:** `docs/design/tests/T-016-weekly-trends.md`

---

### S-017: Smart Insights

**Files to create:**
- CREATE `src/utils/insights.js`

**Implementation:**

```javascript
export function generateInsights(trends, streakData, goals) {
  const insights = []

  // Low protein pattern
  if (trends.avgProtein < goals.protein * 0.7) {
    insights.push({
      id: 'low-protein',
      type: 'warning',
      priority: 2,
      message: `Your protein is averaging ${trends.avgProtein}g, below your ${goals.protein}g goal. Try adding eggs or Greek yogurt.`,
      actionable: true
    })
  }

  // Streak celebration
  if (streakData.current >= 7) {
    insights.push({
      id: 'streak-week',
      type: 'success',
      priority: 1,
      message: `Amazing! You're on a ${streakData.current}-day streak!`,
      actionable: false
    })
  }

  // High success rate
  if (trends.successRate >= 80) {
    insights.push({
      id: 'high-success',
      type: 'success',
      priority: 2,
      message: `${trends.successRate}% success rate this week - you're crushing it!`,
      actionable: false
    })
  }

  // Low success rate
  if (trends.successRate < 50 && trends.daysLogged >= 3) {
    insights.push({
      id: 'low-success',
      type: 'warning',
      priority: 1,
      message: `Only ${trends.successRate}% on target this week. Consider adjusting your calorie goal.`,
      actionable: true
    })
  }

  // Trending up (overeating)
  if (trends.trend === 'up' && trends.avgCalories > goals.calories) {
    insights.push({
      id: 'trending-up',
      type: 'warning',
      priority: 2,
      message: `Calorie intake trending upward. Watch portion sizes.`,
      actionable: true
    })
  }

  // Trending down (under-eating)
  if (trends.trend === 'down' && trends.avgCalories < goals.calories * 0.8) {
    insights.push({
      id: 'trending-down',
      type: 'warning',
      priority: 2,
      message: `You're eating less each day. Make sure you're fueling properly.`,
      actionable: true
    })
  }

  // Not logging
  if (trends.daysLogged < 3) {
    insights.push({
      id: 'log-more',
      type: 'info',
      priority: 3,
      message: `Log more days this week for better insights.`,
      actionable: true
    })
  }

  // Sort by priority and return top 3
  return insights
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3)
}
```

**Test:** `docs/design/tests/T-017-smart-insights.md`

---

### S-018: Share Achievements

**Files to create:**
- CREATE `src/utils/sharing.js`

**Implementation:**

```javascript
export async function generateShareImage(streakData, profile) {
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 600
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#FDF6F0'
  ctx.fillRect(0, 0, 800, 600)

  // Decorative dots (Kusama-inspired)
  const dotColors = ['#8B9D82', '#C87864', '#E8DFD8']
  for (let i = 0; i < 30; i++) {
    ctx.beginPath()
    ctx.fillStyle = dotColors[i % 3]
    ctx.arc(
      Math.random() * 800,
      Math.random() * 600,
      Math.random() * 20 + 5,
      0,
      Math.PI * 2
    )
    ctx.globalAlpha = 0.3
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Main content
  ctx.fillStyle = '#3D3D3D'
  ctx.font = 'bold 120px system-ui'
  ctx.textAlign = 'center'
  ctx.fillText(`${streakData.current}`, 400, 280)

  ctx.font = '32px system-ui'
  ctx.fillText('day streak!', 400, 340)

  if (profile?.name) {
    ctx.font = '24px system-ui'
    ctx.fillStyle = '#666'
    ctx.fillText(`${profile.name}'s progress`, 400, 400)
  }

  // Milestone badge if applicable
  const milestones = [3, 7, 14, 30, 50, 100, 365]
  const currentMilestone = milestones.filter(m => streakData.current >= m).pop()
  if (currentMilestone) {
    ctx.fillStyle = '#8B9D82'
    ctx.font = '20px system-ui'
    ctx.fillText(`🏆 ${currentMilestone}-day milestone`, 400, 450)
  }

  // Footer
  ctx.fillStyle = '#999'
  ctx.font = '16px system-ui'
  ctx.fillText('Calorie Tracker', 400, 550)

  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), 'image/png')
  })
}

export async function shareAchievement(streakData, profile) {
  const text = `I'm on a ${streakData.current}-day streak with Calorie Tracker! 🎯`

  if (navigator.share) {
    try {
      const blob = await generateShareImage(streakData, profile)
      const file = new File([blob], 'streak.png', { type: 'image/png' })

      await navigator.share({
        text,
        files: [file]
      })
      return true
    } catch (e) {
      // Fall back to clipboard
    }
  }

  // Clipboard fallback
  await navigator.clipboard.writeText(text)
  return 'clipboard'
}

export async function copyToClipboard(text) {
  await navigator.clipboard.writeText(text)
}
```

**Test:** `docs/design/tests/T-018-share-achievements.md`

---

## Integration Checklist

After implementation, verify:

- [ ] getWeeklyTrends returns correct averages
- [ ] successRate calculated correctly (0.9-1.1 ratio)
- [ ] trend detects 'up', 'down', 'stable'
- [ ] generateInsights returns max 3 insights
- [ ] insights sorted by priority
- [ ] generateShareImage creates valid PNG blob
- [ ] shareAchievement uses Web Share API with fallback
- [ ] Canvas shows streak number and decorative dots

## Verification

```bash
npm run build
npm run dev
# Test in console: import functions and test with sample data
```

## Success Criteria

Phase 4 is complete when:
1. All three utility files exist
2. Functions handle edge cases (empty data, zero goals)
3. Share image generates correctly
4. Build succeeds
