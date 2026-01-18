# Spec: Weekly Trends Visualization

**Phase:** 5 - Gamification & Insights
**Priority:** Medium
**Estimated Effort:** Medium

---

## Overview

Visualize weekly calorie and macro trends with Agnes Martin-inspired minimal bar charts. Show patterns over time to help users understand their eating habits.

## Requirements

### Data Aggregation

```javascript
// src/utils/trends.js
// Import shared utilities from S-015
import { getStartOfWeek, formatDate } from '../utils/date'

export function getWeeklyTrends(entries, goals, weeksBack = 4) {
  const weeks = []
  const today = new Date()

  for (let i = 0; i < weeksBack; i++) {
    const weekStart = getStartOfWeek(today)
    weekStart.setDate(weekStart.getDate() - (i * 7))
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const weekEntries = entries.filter(e => {
      const d = new Date(e.date)
      return d >= weekStart && d <= weekEnd
    })

    const dailyTotals = aggregateByDay(weekEntries)

    weeks.push({
      weekStart: formatDate(weekStart),
      weekEnd: formatDate(weekEnd),
      label: i === 0 ? 'This week' : i === 1 ? 'Last week' : `${i} weeks ago`,
      days: dailyTotals,
      averages: calculateAverages(dailyTotals),
      daysLogged: dailyTotals.length,
      daysOnTarget: dailyTotals.filter(d =>
        d.calories >= goals.calories * 0.9 &&
        d.calories <= goals.calories * 1.1
      ).length
    })
  }

  return weeks.reverse() // Oldest first
}

function aggregateByDay(entries) {
  const byDay = new Map()

  for (const entry of entries) {
    if (!byDay.has(entry.date)) {
      byDay.set(entry.date, { calories: 0, protein: 0, carbs: 0, fat: 0 })
    }
    const day = byDay.get(entry.date)
    day.calories += entry.calories
    day.protein += entry.protein
    day.carbs += entry.carbs
    day.fat += entry.fat
  }

  return Array.from(byDay.entries()).map(([date, totals]) => ({
    date,
    ...totals
  }))
}

function calculateAverages(days) {
  if (days.length === 0) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 }
  }

  const sum = days.reduce((acc, d) => ({
    calories: acc.calories + d.calories,
    protein: acc.protein + d.protein,
    carbs: acc.carbs + d.carbs,
    fat: acc.fat + d.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

  return {
    calories: Math.round(sum.calories / days.length),
    protein: Math.round(sum.protein / days.length),
    carbs: Math.round(sum.carbs / days.length),
    fat: Math.round(sum.fat / days.length)
  }
}
```

### Weekly Bar Chart Component

```jsx
// src/components/WeeklyChart.jsx
export function WeeklyChart({ weeks, goals, metric = 'calories' }) {
  const maxValue = Math.max(
    goals[metric] * 1.2,
    ...weeks.flatMap(w => w.days.map(d => d[metric]))
  )

  return (
    <div class="weekly-chart">
      <div class="chart-header">
        <h3 class="chart-title">Weekly {metric}</h3>
        <span class="chart-goal">Goal: {goals[metric]}</span>
      </div>

      <div class="chart-weeks">
        {weeks.map((week, wi) => (
          <div key={wi} class="chart-week">
            <div class="chart-bars">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, di) => {
                const dayData = week.days.find(d =>
                  new Date(d.date).getDay() === (di + 1) % 7
                )
                const value = dayData?.[metric] || 0
                const height = (value / maxValue) * 100
                const onTarget = dayData &&
                  value >= goals[metric] * 0.9 &&
                  value <= goals[metric] * 1.1

                return (
                  <div key={di} class="chart-bar-wrapper">
                    <div
                      class={`chart-bar ${onTarget ? 'on-target' : ''} ${!dayData ? 'empty' : ''}`}
                      style={{ height: `${height}%` }}
                    />
                    <span class="chart-day-label">{day[0]}</span>
                  </div>
                )
              })}
            </div>
            <span class="chart-week-label">{week.label}</span>
          </div>
        ))}
      </div>

      <div class="chart-goal-line" style={{
        bottom: `${(goals[metric] / maxValue) * 100}%`
      }} />
    </div>
  )
}
```

### Agnes Martin-Inspired Styling

```css
.weekly-chart {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
  position: relative;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: var(--space-4);
}

.chart-title {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text);
  margin: 0;
}

.chart-goal {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.chart-weeks {
  display: flex;
  gap: var(--space-3);
}

.chart-week {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 120px;
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.chart-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.chart-bar {
  width: 100%;
  background: var(--color-sage-pale);
  border-radius: 2px 2px 0 0;
  transition: height 400ms ease-out;
  min-height: 2px;
}

.chart-bar.on-target {
  background: var(--color-sage);
}

.chart-bar.empty {
  background: var(--color-border);
  opacity: 0.3;
}

.chart-day-label {
  position: absolute;
  bottom: 0;
  font-size: 0.625rem;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.chart-week-label {
  font-size: 0.6875rem;
  color: var(--color-muted);
  text-align: center;
}

.chart-goal-line {
  position: absolute;
  left: var(--space-4);
  right: var(--space-4);
  height: 1px;
  background: var(--color-terracotta);
  opacity: 0.4;
}

/* Agnes Martin influence: subtle grid overlay */
.weekly-chart::before {
  content: '';
  position: absolute;
  inset: var(--space-4);
  background-image:
    linear-gradient(var(--color-border) 1px, transparent 1px);
  background-size: 100% 30px;
  opacity: 0.3;
  pointer-events: none;
}
```

### Summary Stats Component

```jsx
function WeeklySummary({ week, goals }) {
  const { averages, daysLogged, daysOnTarget } = week

  return (
    <div class="weekly-summary">
      <div class="summary-stat">
        <span class="summary-value">{averages.calories}</span>
        <span class="summary-label">avg cal/day</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">{daysLogged}/7</span>
        <span class="summary-label">days logged</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">{daysOnTarget}/7</span>
        <span class="summary-label">on target</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">{averages.protein}g</span>
        <span class="summary-label">avg protein</span>
      </div>
    </div>
  )
}
```

### Trends Page/Section

```jsx
// src/components/TrendsView.jsx
export function TrendsView({ entries, goals, profileId }) {
  const weeks = useMemo(
    () => getWeeklyTrends(entries, goals, 4),
    [entries, goals]
  )

  const [selectedMetric, setSelectedMetric] = useState('calories')

  return (
    <div class="trends-view">
      <div class="trends-header">
        <h2>Trends</h2>
        <div class="metric-tabs">
          {['calories', 'protein', 'carbs', 'fat'].map(m => (
            <button
              key={m}
              class={`metric-tab ${selectedMetric === m ? 'active' : ''}`}
              onClick={() => setSelectedMetric(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <WeeklyChart
        weeks={weeks}
        goals={goals}
        metric={selectedMetric}
      />

      <WeeklySummary
        week={weeks[weeks.length - 1]}
        goals={goals}
      />
    </div>
  )
}
```

## Acceptance Criteria

- [ ] Shows last 4 weeks of data
- [ ] Bar chart for each day (7 bars per week)
- [ ] On-target days highlighted
- [ ] Empty days shown as faded
- [ ] Goal line visible
- [ ] Can switch between calories/protein/carbs/fat
- [ ] Weekly averages calculated
- [ ] Days logged count shown
- [ ] Responsive on mobile (scrollable if needed)

## Files to Create/Modify

- `src/utils/trends.js` — Create
- `src/components/WeeklyChart.jsx` — Create
- `src/components/WeeklySummary.jsx` — Create
- `src/components/TrendsView.jsx` — Create
- `src/components/App.jsx` — Add trends navigation
- `src/styles.css` — Trends styling

## Test Plan

1. View trends with 4 weeks data → all weeks show?
2. Day on target → highlighted?
3. Empty day → faded bar?
4. Switch to protein → chart updates?
5. Averages match manual calculation?
6. Mobile view scrolls properly?
