# Spec: Smart Insights Engine

**Phase:** 5 - Gamification & Insights
**Priority:** Medium
**Estimated Effort:** Medium

---

## Overview

Generate personalized, actionable insights based on user's eating patterns. Surface observations that help users understand their habits without being preachy or judgmental.

## Requirements

### Insight Types

```javascript
// src/utils/insights.js
export const INSIGHT_TYPES = {
  PATTERN: 'pattern',           // Observed behavior patterns
  ACHIEVEMENT: 'achievement',   // Positive milestone reached
  SUGGESTION: 'suggestion',     // Gentle nudge
  COMPARISON: 'comparison',     // This week vs last
  STREAK: 'streak'              // Streak-related
}

// Insight shape
{
  id: 'insight_1',
  type: 'pattern',
  title: 'Protein Champion',
  message: 'You hit your protein goal 5 out of 7 days this week!',
  emoji: '💪',
  priority: 2,  // 1-5, higher = more important
  date: '2025-01-17',
  dismissed: false
}
```

### Shared Utilities

Import date utilities from S-015 and trends utilities from S-016:

```javascript
// src/utils/insights.js
import { formatDate, getStartOfWeek } from './date'  // From S-015
import { aggregateByDay, calculateAverages } from './trends'  // From S-016

/**
 * Subtract weeks from a date
 */
export function subWeeks(date, weeks) {
  const d = new Date(date)
  d.setDate(d.getDate() - (weeks * 7))
  return d
}

/**
 * Get entries for a specific week (Mon-Sun)
 */
export function getEntriesForWeek(entries, referenceDate) {
  const weekStart = getStartOfWeek(referenceDate)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  return entries.filter(e => {
    const entryDate = new Date(e.date)
    return entryDate >= weekStart && entryDate <= weekEnd
  })
}
```

### Insight Generators

```javascript
export function generateInsights(entries, goals, streakData) {
  const insights = []
  const today = new Date()
  const thisWeek = getEntriesForWeek(entries, today)
  const lastWeek = getEntriesForWeek(entries, subWeeks(today, 1))

  // Pattern: Consistent logging
  const loggingInsight = checkLoggingConsistency(thisWeek)
  if (loggingInsight) insights.push(loggingInsight)

  // Pattern: Macro balance
  const macroInsight = checkMacroBalance(thisWeek, goals)
  if (macroInsight) insights.push(macroInsight)

  // Comparison: Week over week
  const comparisonInsight = compareWeeks(thisWeek, lastWeek, goals)
  if (comparisonInsight) insights.push(comparisonInsight)

  // Achievement: Personal bests
  const achievementInsights = checkAchievements(entries, goals, streakData)
  insights.push(...achievementInsights)

  // Streak: Milestones approaching
  const streakInsight = checkUpcomingMilestone(streakData)
  if (streakInsight) insights.push(streakInsight)

  // Sort by priority, limit to top 3
  return insights
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3)
}

function checkLoggingConsistency(weekEntries) {
  const daysLogged = new Set(weekEntries.map(e => e.date)).size

  if (daysLogged === 7) {
    return {
      id: `log_${Date.now()}`,
      type: INSIGHT_TYPES.ACHIEVEMENT,
      title: 'Perfect Week',
      message: 'You logged every single day this week!',
      emoji: '📝',
      priority: 4
    }
  }

  if (daysLogged >= 5) {
    return {
      id: `log_${Date.now()}`,
      type: INSIGHT_TYPES.PATTERN,
      title: 'Consistent Logger',
      message: `${daysLogged} out of 7 days logged. Great consistency!`,
      emoji: '✓',
      priority: 2
    }
  }

  return null
}

function checkMacroBalance(weekEntries, goals) {
  const dailyTotals = aggregateByDay(weekEntries)
  let proteinWins = 0
  let carbsWins = 0
  let fatWins = 0

  for (const day of dailyTotals) {
    if (day.protein >= goals.protein * 0.9) proteinWins++
    if (day.carbs <= goals.carbs * 1.1) carbsWins++
    if (day.fat <= goals.fat * 1.1) fatWins++
  }

  if (proteinWins >= 5) {
    return {
      id: `macro_${Date.now()}`,
      type: INSIGHT_TYPES.PATTERN,
      title: 'Protein Champion',
      message: `You hit your protein goal ${proteinWins} days this week!`,
      emoji: '💪',
      priority: 3
    }
  }

  if (fatWins >= 5 && goals.fat > 0) {
    return {
      id: `macro_${Date.now()}`,
      type: INSIGHT_TYPES.PATTERN,
      title: 'Fat on Track',
      message: `Kept fat in check ${fatWins} days this week.`,
      emoji: '🎯',
      priority: 2
    }
  }

  return null
}

function compareWeeks(thisWeek, lastWeek, goals) {
  const thisAvg = calculateAverages(aggregateByDay(thisWeek))
  const lastAvg = calculateAverages(aggregateByDay(lastWeek))

  if (lastAvg.calories === 0) return null

  const diff = thisAvg.calories - lastAvg.calories
  const percentChange = Math.abs(diff / lastAvg.calories * 100)

  if (Math.abs(diff) < 50) {
    return {
      id: `comp_${Date.now()}`,
      type: INSIGHT_TYPES.COMPARISON,
      title: 'Steady as She Goes',
      message: 'Your intake is consistent with last week.',
      emoji: '⚖️',
      priority: 1
    }
  }

  if (diff < 0 && thisAvg.calories < goals.calories) {
    return {
      id: `comp_${Date.now()}`,
      type: INSIGHT_TYPES.COMPARISON,
      title: 'Lighter Week',
      message: `Averaging ${Math.round(percentChange)}% less than last week.`,
      emoji: '📉',
      priority: 2
    }
  }

  return null
}

function checkAchievements(entries, goals, streakData) {
  const achievements = []

  // First 100 entries
  if (entries.length >= 100 && entries.length < 110) {
    achievements.push({
      id: 'ach_100',
      type: INSIGHT_TYPES.ACHIEVEMENT,
      title: 'Century Club',
      message: "You've logged 100+ food entries!",
      emoji: '🎉',
      priority: 5
    })
  }

  // First 30-day streak
  if (streakData.longest >= 30 && streakData.longest < 32) {
    achievements.push({
      id: 'ach_30d',
      type: INSIGHT_TYPES.ACHIEVEMENT,
      title: 'Monthly Master',
      message: 'Achieved a 30-day streak!',
      emoji: '🏆',
      priority: 5
    })
  }

  return achievements
}

function checkUpcomingMilestone(streakData) {
  const { current } = streakData
  const milestones = [7, 14, 30, 60, 100]

  for (const m of milestones) {
    if (current >= m - 2 && current < m) {
      return {
        id: `streak_${m}`,
        type: INSIGHT_TYPES.STREAK,
        title: `${m}-Day Streak Ahead`,
        message: `Just ${m - current} more days to hit ${m}!`,
        emoji: '🔥',
        priority: 3
      }
    }
  }

  return null
}
```

### Insights Component

```jsx
// src/components/InsightsPanel.jsx
export function InsightsPanel({ insights, onDismiss }) {
  if (insights.length === 0) return null

  return (
    <div class="insights-panel">
      <h3 class="insights-title">Insights</h3>
      <div class="insights-list">
        {insights.map(insight => (
          <div
            key={insight.id}
            class={`insight-card insight-card--${insight.type}`}
          >
            <span class="insight-emoji">{insight.emoji}</span>
            <div class="insight-content">
              <span class="insight-headline">{insight.title}</span>
              <span class="insight-message">{insight.message}</span>
            </div>
            <button
              class="insight-dismiss"
              onClick={() => onDismiss(insight.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### CSS Styling

```css
.insights-panel {
  margin: var(--space-4) 0;
}

.insights-title {
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 var(--space-3) 0;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.insight-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-white);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--color-sage);
}

.insight-card--achievement {
  border-left-color: var(--color-terracotta);
  background: linear-gradient(
    135deg,
    var(--color-white) 0%,
    rgba(193, 123, 95, 0.05) 100%
  );
}

.insight-card--streak {
  border-left-color: #C4A35A;
}

.insight-emoji {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.insight-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.insight-headline {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-text);
}

.insight-message {
  font-size: 0.8125rem;
  color: var(--color-muted);
}

.insight-dismiss {
  padding: var(--space-1);
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 150ms;
}

.insight-dismiss:hover {
  opacity: 1;
}
```

### Insight Persistence

```javascript
// Track dismissed insights to avoid repeating
export function getDismissedInsights(profileId) {
  const key = profileId ? `insights-dismissed-${profileId}` : 'insights-dismissed'
  return JSON.parse(localStorage.getItem(key) || '[]')
}

export function dismissInsight(profileId, insightId) {
  const dismissed = getDismissedInsights(profileId)
  dismissed.push({
    id: insightId,
    dismissedAt: new Date().toISOString()
  })
  // Keep only last 50
  const trimmed = dismissed.slice(-50)
  localStorage.setItem(
    profileId ? `insights-dismissed-${profileId}` : 'insights-dismissed',
    JSON.stringify(trimmed)
  )
}

export function filterDismissedInsights(insights, profileId) {
  const dismissed = getDismissedInsights(profileId)
  const dismissedIds = new Set(dismissed.map(d => d.id))
  return insights.filter(i => !dismissedIds.has(i.id))
}
```

## Acceptance Criteria

- [ ] Insights generated based on actual data
- [ ] Maximum 3 insights shown at once
- [ ] Insights sorted by priority
- [ ] Can dismiss insights
- [ ] Dismissed insights don't reappear
- [ ] Achievement insights for milestones
- [ ] Pattern insights for habits
- [ ] Comparison insights week-over-week
- [ ] Streak milestone previews
- [ ] Tone is positive, never shaming

## Files to Create/Modify

- `src/utils/insights.js` — Create
- `src/components/InsightsPanel.jsx` — Create
- `src/components/App.jsx` — Integration
- `src/styles.css` — Insights styling

## Test Plan

1. Log 7 days → "Perfect Week" appears?
2. Hit protein 5+ days → protein insight?
3. Dismiss insight → doesn't reappear?
4. Approaching 7-day streak → milestone preview?
5. 100 entries → achievement unlocked?
