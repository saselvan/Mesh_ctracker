# Tests: Weekly Trends Visualization

id: T-016
spec: S-016 (specs/16-weekly-trends.md)

---

## Functional Tests

### Scenario: getWeeklyTrends returns 4 weeks

**Given:** Entries exist for past month
**When:** getWeeklyTrends(entries, goals, 4) called
**Then:** Returns array of 4 week objects
**And:** Most recent week is last in array

### Scenario: Week contains daily totals

**Given:** 5 entries on Monday, 3 on Tuesday
**When:** Week data calculated
**Then:** days array contains aggregated daily totals
**And:** Monday shows sum of 5 entries
**And:** Tuesday shows sum of 3 entries

### Scenario: Bar chart renders 7 bars per week

**Given:** WeeklyChart receives week data
**When:** Component renders
**Then:** 7 bars visible per week (Mon-Sun)
**And:** Empty days show faded bar

### Scenario: On-target days highlighted

**Given:** Day has 95% of goal (on target)
**When:** Bar renders
**Then:** Bar has "on-target" class
**And:** Bar colored sage (not gray)

### Scenario: Goal line displayed

**Given:** Goal is 2000 calories, max value is 2400
**When:** Chart renders
**Then:** Horizontal line at 2000/2400 = 83% height
**And:** Line colored terracotta

---

## Edge Cases

### Scenario: Week with no entries

**Given:** No entries for a week
**When:** getWeeklyTrends calculates
**Then:** Week has days: []
**And:** averages: { calories: 0, ... }
**And:** daysLogged: 0

### Scenario: Switching metrics

**Given:** Chart showing calories
**When:** User clicks "protein" tab
**Then:** Chart re-renders with protein values
**And:** Goal line updates to protein goal

---

## Unit Tests

```javascript
// src/utils/__tests__/trends.test.js
import { getWeeklyTrends, aggregateByDay, calculateAverages } from '../trends'

describe('getWeeklyTrends', () => {
  it('returns specified number of weeks', () => {
    const entries = []
    const goals = { calories: 2000 }
    const result = getWeeklyTrends(entries, goals, 4)
    expect(result.length).toBe(4)
  })

  it('calculates week averages', () => {
    const entries = [
      { date: '2025-01-13', calories: 2000, protein: 100 },
      { date: '2025-01-14', calories: 2200, protein: 110 },
      { date: '2025-01-15', calories: 1800, protein: 90 },
    ]
    const goals = { calories: 2000, protein: 100 }
    const result = getWeeklyTrends(entries, goals, 1)

    expect(result[0].averages.calories).toBe(2000)
    expect(result[0].averages.protein).toBe(100)
  })

  it('counts days on target', () => {
    const entries = [
      { date: '2025-01-13', calories: 2000 }, // 100% - on target
      { date: '2025-01-14', calories: 1800 }, // 90% - on target
      { date: '2025-01-15', calories: 1500 }, // 75% - off target
    ]
    const goals = { calories: 2000 }
    const result = getWeeklyTrends(entries, goals, 1)

    expect(result[0].daysOnTarget).toBe(2)
    expect(result[0].daysLogged).toBe(3)
  })
})

describe('aggregateByDay', () => {
  it('sums multiple entries per day', () => {
    const entries = [
      { date: '2025-01-17', calories: 300 },
      { date: '2025-01-17', calories: 500 },
      { date: '2025-01-17', calories: 200 },
    ]
    const result = aggregateByDay(entries)
    expect(result.length).toBe(1)
    expect(result[0].calories).toBe(1000)
  })
})
```

---

## Component Tests

```javascript
// src/components/__tests__/WeeklyChart.test.jsx
import { render, fireEvent } from '@testing-library/preact'
import { WeeklyChart } from '../WeeklyChart'

describe('WeeklyChart', () => {
  const weeks = [{
    label: 'This week',
    days: [
      { date: '2025-01-13', calories: 2000 },
      { date: '2025-01-14', calories: 1800 },
      { date: '2025-01-15', calories: 2200 },
    ]
  }]
  const goals = { calories: 2000 }

  it('renders 7 bars per week', () => {
    const { container } = render(
      <WeeklyChart weeks={weeks} goals={goals} metric="calories" />
    )
    const bars = container.querySelectorAll('.chart-bar')
    expect(bars.length).toBe(7)
  })

  it('highlights on-target days', () => {
    const { container } = render(
      <WeeklyChart weeks={weeks} goals={goals} metric="calories" />
    )
    const onTargetBars = container.querySelectorAll('.chart-bar.on-target')
    expect(onTargetBars.length).toBeGreaterThan(0)
  })

  it('shows empty state for missing days', () => {
    const { container } = render(
      <WeeklyChart weeks={weeks} goals={goals} metric="calories" />
    )
    const emptyBars = container.querySelectorAll('.chart-bar.empty')
    expect(emptyBars.length).toBe(4) // 7 - 3 = 4 empty days
  })

  it('renders goal line', () => {
    const { container } = render(
      <WeeklyChart weeks={weeks} goals={goals} metric="calories" />
    )
    const goalLine = container.querySelector('.chart-goal-line')
    expect(goalLine).toBeTruthy()
  })
})
```
