# Tests: Kusama Streak Visualization

id: T-008
spec: S-008 (specs/08-streak-visualization.md)

---

## Functional Tests

### Scenario: Streak display shows correct dot count

**Given:** Current streak is 5 days
**When:** StreakDisplay renders
**Then:** 5 dots are visible
**And:** Each dot has streak-dot class

### Scenario: Maximum 14 dots displayed

**Given:** Current streak is 20 days
**When:** StreakDisplay renders
**Then:** 14 dots are visible
**And:** "+6" indicator shows remaining count

### Scenario: Dots fade into distance

**Given:** 10 dots are displayed
**When:** I inspect dot styles
**Then:** Dot 1 has opacity 1.0
**And:** Dot 5 has opacity ~0.8
**And:** Dot 10 has opacity ~0.6
**And:** Earlier dots are more prominent

### Scenario: Dots shrink into distance

**Given:** 10 dots are displayed
**When:** I inspect dot transform
**Then:** Dot 1 has scale(1.0)
**And:** Dot 5 has scale ~0.85
**And:** Dot 10 has scale ~0.7

### Scenario: Streak count persists across sessions

**Given:** I have a 7-day streak
**When:** I close and reopen the app
**Then:** Streak still shows 7 days
**And:** 7 dots are displayed

---

## Storage Tests

### Scenario: getStreakData returns stored data

**Given:** localStorage has streak data
**When:** getStreakData(profileId) is called
**Then:** Returns object with current, longest, lastDate
**And:** Values match stored data

### Scenario: updateStreak increments on consecutive day

**Given:** Last successful date was yesterday
**When:** updateStreak is called with today, hitGoal=true
**Then:** current streak increments by 1
**And:** lastDate updates to today
**And:** longest updates if current > longest

### Scenario: updateStreak resets on missed day

**Given:** Last successful date was 3 days ago
**When:** updateStreak is called with today, hitGoal=true
**Then:** current streak resets to 1
**And:** lastDate updates to today

---

## Edge Cases

### Scenario: Zero streak shows no dots

**Given:** Current streak is 0
**When:** StreakDisplay renders
**Then:** No dots are displayed
**And:** Shows "0 day streak" label

### Scenario: First day of streak

**Given:** No previous streak data
**When:** User hits goal for first time
**Then:** Streak becomes 1
**And:** 1 dot is displayed

### Scenario: Streak at exactly 14

**Given:** Current streak is 14
**When:** StreakDisplay renders
**Then:** 14 dots displayed
**And:** No "+N" indicator (exactly at limit)

---

## Non-Functional Tests

### Performance

| Metric | Target | Test Method |
|--------|--------|-------------|
| Render time | < 10ms | Performance.now() |
| localStorage read | < 1ms | Timing measurement |
| DOM nodes | ≤ 17 | 14 dots + 3 containers |

### Accessibility

| Check | Tool | Pass Criteria |
|-------|------|---------------|
| Streak announced | aria-label | "5 day streak" accessible |
| Dots decorative | aria-hidden | Dots hidden from SR |

---

## Unit Test Implementation

```javascript
// src/components/__tests__/StreakDisplay.test.jsx
import { render } from '@testing-library/preact'
import { StreakDisplay } from '../StreakDisplay'

describe('StreakDisplay', () => {
  it('renders correct number of dots', () => {
    const { container } = render(
      <StreakDisplay currentStreak={5} longestStreak={10} />
    )
    const dots = container.querySelectorAll('.streak-dot')
    expect(dots.length).toBe(5)
  })

  it('caps at 14 dots with overflow indicator', () => {
    const { container, getByText } = render(
      <StreakDisplay currentStreak={20} longestStreak={20} />
    )
    const dots = container.querySelectorAll('.streak-dot')
    expect(dots.length).toBe(14)
    expect(getByText('+6')).toBeTruthy()
  })

  it('dots have decreasing opacity', () => {
    const { container } = render(
      <StreakDisplay currentStreak={10} longestStreak={10} />
    )
    const dots = container.querySelectorAll('.streak-dot')

    const opacities = Array.from(dots).map(d =>
      parseFloat(d.style.opacity)
    )

    // Each dot should have lower opacity than previous
    for (let i = 1; i < opacities.length; i++) {
      expect(opacities[i]).toBeLessThan(opacities[i-1])
    }
  })

  it('dots have decreasing scale', () => {
    const { container } = render(
      <StreakDisplay currentStreak={10} longestStreak={10} />
    )
    const dots = container.querySelectorAll('.streak-dot')

    const scales = Array.from(dots).map(d => {
      const transform = d.style.transform
      const match = transform.match(/scale\(([\d.]+)\)/)
      return match ? parseFloat(match[1]) : 1
    })

    for (let i = 1; i < scales.length; i++) {
      expect(scales[i]).toBeLessThan(scales[i-1])
    }
  })

  it('shows zero state correctly', () => {
    const { container, getByText } = render(
      <StreakDisplay currentStreak={0} longestStreak={5} />
    )
    const dots = container.querySelectorAll('.streak-dot')
    expect(dots.length).toBe(0)
    expect(getByText('0')).toBeTruthy()
  })
})
```

---

## Storage Test Implementation

```javascript
// src/utils/__tests__/storage.streak.test.js
import { getStreakData, updateStreak } from '../storage'

describe('Streak storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns default data when empty', () => {
    const data = getStreakData('test')
    expect(data).toEqual({
      current: 0,
      longest: 0,
      lastDate: null
    })
  })

  it('increments streak on consecutive day', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const todayStr = new Date().toISOString().split('T')[0]

    localStorage.setItem('streak-test', JSON.stringify({
      current: 5,
      longest: 10,
      lastDate: yesterdayStr
    }))

    const result = updateStreak('test', true, todayStr)

    expect(result.current).toBe(6)
    expect(result.lastDate).toBe(todayStr)
  })

  it('resets streak on missed day', () => {
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    const oldDateStr = threeDaysAgo.toISOString().split('T')[0]
    const todayStr = new Date().toISOString().split('T')[0]

    localStorage.setItem('streak-test', JSON.stringify({
      current: 5,
      longest: 10,
      lastDate: oldDateStr
    }))

    const result = updateStreak('test', true, todayStr)

    expect(result.current).toBe(1)
    expect(result.longest).toBe(10) // Longest unchanged
  })

  it('updates longest when current exceeds', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const todayStr = new Date().toISOString().split('T')[0]

    localStorage.setItem('streak-test', JSON.stringify({
      current: 10,
      longest: 10,
      lastDate: yesterdayStr
    }))

    const result = updateStreak('test', true, todayStr)

    expect(result.current).toBe(11)
    expect(result.longest).toBe(11)
  })
})
```
