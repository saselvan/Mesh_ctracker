# Tests: Smart Insights Engine

id: T-017
spec: S-017 (specs/17-smart-insights.md)

---

## Functional Tests

### Scenario: Perfect week insight generated

**Given:** User logged all 7 days this week
**When:** generateInsights called
**Then:** Returns insight with title "Perfect Week"
**And:** Type is "achievement"
**And:** Priority is high (4)

### Scenario: Protein champion insight

**Given:** User hit protein goal 5+ days this week
**When:** generateInsights called
**Then:** Returns insight "Protein Champion"
**And:** Message includes day count

### Scenario: Week comparison insight

**Given:** This week avg 200 cal less than last week
**When:** generateInsights called
**Then:** Returns comparison insight
**And:** Shows percent change

### Scenario: Upcoming milestone insight

**Given:** Streak is 28 days (2 away from 30)
**When:** generateInsights called
**Then:** Returns streak insight
**And:** Message: "Just 2 more days to hit 30!"

### Scenario: Maximum 3 insights returned

**Given:** Multiple insights would trigger
**When:** generateInsights called
**Then:** Returns array of max 3 insights
**And:** Sorted by priority (highest first)

---

## Edge Cases

### Scenario: Dismissed insight doesn't reappear

**Given:** "Perfect Week" insight dismissed
**When:** generateInsights called next time
**Then:** Does not include "Perfect Week"
**And:** Other insights still returned

### Scenario: No insights when no patterns

**Given:** Only 2 days logged, no patterns
**When:** generateInsights called
**Then:** Returns empty array
**And:** InsightsPanel renders nothing

---

## Unit Tests

```javascript
// src/utils/__tests__/insights.test.js
import {
  generateInsights,
  checkLoggingConsistency,
  checkMacroBalance,
  compareWeeks,
  checkUpcomingMilestone,
  filterDismissedInsights
} from '../insights'

describe('checkLoggingConsistency', () => {
  it('returns Perfect Week for 7 days logged', () => {
    const weekEntries = Array.from({ length: 7 }, (_, i) => ({
      date: `2025-01-1${i + 1}`
    }))
    const result = checkLoggingConsistency(weekEntries)
    expect(result.title).toBe('Perfect Week')
    expect(result.priority).toBe(4)
  })

  it('returns Consistent Logger for 5-6 days', () => {
    const weekEntries = Array.from({ length: 5 }, (_, i) => ({
      date: `2025-01-1${i + 1}`
    }))
    const result = checkLoggingConsistency(weekEntries)
    expect(result.title).toBe('Consistent Logger')
    expect(result.priority).toBe(2)
  })

  it('returns null for under 5 days', () => {
    const weekEntries = [{ date: '2025-01-17' }]
    expect(checkLoggingConsistency(weekEntries)).toBeNull()
  })
})

describe('checkMacroBalance', () => {
  it('returns Protein Champion for 5+ days on target', () => {
    const dailyTotals = Array.from({ length: 5 }, () => ({
      protein: 100
    }))
    const goals = { protein: 100 }
    const result = checkMacroBalance(dailyTotals, goals)
    expect(result.title).toBe('Protein Champion')
  })
})

describe('checkUpcomingMilestone', () => {
  it('returns hint when 2 days from milestone', () => {
    const streakData = { current: 28 }
    const result = checkUpcomingMilestone(streakData)
    expect(result.title).toBe('30-Day Streak Ahead')
    expect(result.message).toContain('2 more days')
  })

  it('returns null when not near milestone', () => {
    const streakData = { current: 15 }
    expect(checkUpcomingMilestone(streakData)).toBeNull()
  })
})

describe('filterDismissedInsights', () => {
  beforeEach(() => localStorage.clear())

  it('filters out dismissed insights', () => {
    localStorage.setItem('insights-dismissed-test', JSON.stringify([
      { id: 'perfect_week_123' }
    ]))

    const insights = [
      { id: 'perfect_week_123', title: 'Perfect Week' },
      { id: 'protein_456', title: 'Protein Champion' }
    ]

    const result = filterDismissedInsights(insights, 'test')
    expect(result.length).toBe(1)
    expect(result[0].title).toBe('Protein Champion')
  })
})
```

---

## Component Tests

```javascript
// src/components/__tests__/InsightsPanel.test.jsx
import { render, fireEvent } from '@testing-library/preact'
import { InsightsPanel } from '../InsightsPanel'

describe('InsightsPanel', () => {
  const insights = [
    { id: '1', type: 'achievement', title: 'Perfect Week', message: 'All 7 days!', emoji: '📝', priority: 4 },
    { id: '2', type: 'pattern', title: 'Protein Champion', message: '5 days strong', emoji: '💪', priority: 3 },
  ]

  it('renders all insights', () => {
    const { getByText } = render(
      <InsightsPanel insights={insights} onDismiss={() => {}} />
    )
    expect(getByText('Perfect Week')).toBeTruthy()
    expect(getByText('Protein Champion')).toBeTruthy()
  })

  it('shows emoji and message', () => {
    const { getByText } = render(
      <InsightsPanel insights={insights} onDismiss={() => {}} />
    )
    expect(getByText('📝')).toBeTruthy()
    expect(getByText('All 7 days!')).toBeTruthy()
  })

  it('calls onDismiss when X clicked', () => {
    const onDismiss = vi.fn()
    const { container } = render(
      <InsightsPanel insights={insights} onDismiss={onDismiss} />
    )
    const dismissBtn = container.querySelector('.insight-dismiss')
    fireEvent.click(dismissBtn)
    expect(onDismiss).toHaveBeenCalledWith('1')
  })

  it('renders nothing for empty insights', () => {
    const { container } = render(
      <InsightsPanel insights={[]} onDismiss={() => {}} />
    )
    expect(container.firstChild).toBeNull()
  })
})
```
