# Tests: Streak Tracking Core Logic

id: T-015
spec: S-015 (specs/15-streak-tracking-logic.md)

---

## Functional Tests

### Scenario: isSuccessfulDay with 90-110% range

**Given:** Goal is 2000 calories
**When:** isSuccessfulDay(1800, 2000) called (90%)
**Then:** Returns true

**When:** isSuccessfulDay(2200, 2000) called (110%)
**Then:** Returns true

**When:** isSuccessfulDay(1700, 2000) called (85%)
**Then:** Returns false

**When:** isSuccessfulDay(2300, 2000) called (115%)
**Then:** Returns false

### Scenario: Streak continues on consecutive day

**Given:** Last success date was yesterday, streak is 5
**When:** updateStreakForDay called with today, success=true
**Then:** current becomes 6
**And:** lastSuccessDate becomes today
**And:** longest updates if current > longest

### Scenario: Streak breaks on missed day

**Given:** Last success was 3 days ago, streak is 5
**When:** updateStreakForDay called with today, success=true
**Then:** current resets to 1
**And:** lastSuccessDate becomes today
**And:** longest remains 5

### Scenario: Same day update doesn't double-count

**Given:** Today already counted, streak is 5
**When:** updateStreakForDay called again for today
**Then:** current remains 5 (not 6)

---

## Edge Cases

### Scenario: First ever streak day

**Given:** No streak data exists
**When:** User hits goal for first time
**Then:** current becomes 1
**And:** longest becomes 1
**And:** lastSuccessDate set

### Scenario: recalculateStreak from entries

**Given:** Entries exist for consecutive 10 days
**When:** recalculateStreak called
**Then:** Returns current=10, longest=10
**And:** History contains 10 days

### Scenario: Weekly progress calculation

**Given:** 5 successful days this week
**When:** calculateWeeklyProgress called
**Then:** Returns 5
**And:** Only counts Mon-Sun of current week

---

## Unit Tests

```javascript
// src/utils/__tests__/streaks.test.js
import {
  isSuccessfulDay,
  getStreakData,
  updateStreakForDay,
  recalculateStreak,
  calculateWeeklyProgress
} from '../streaks'
import {
  formatDate,
  getYesterday,
  getStartOfWeek,
  calculateTotals,
  pickRandom
} from '../date'

// Tests for shared utilities from S-015
describe('formatDate', () => {
  it('returns YYYY-MM-DD format', () => {
    const date = new Date(2025, 0, 17) // Jan 17, 2025
    expect(formatDate(date)).toBe('2025-01-17')
  })

  it('pads single digit months', () => {
    const date = new Date(2025, 0, 5) // Jan 5
    expect(formatDate(date)).toBe('2025-01-05')
  })

  it('pads single digit days', () => {
    const date = new Date(2025, 8, 3) // Sep 3
    expect(formatDate(date)).toBe('2025-09-03')
  })
})

describe('getYesterday', () => {
  it('returns string not Date object', () => {
    const result = getYesterday(new Date(2025, 0, 17))
    expect(typeof result).toBe('string')
  })

  it('returns previous day in YYYY-MM-DD format', () => {
    const result = getYesterday(new Date(2025, 0, 17))
    expect(result).toBe('2025-01-16')
  })

  it('handles month boundary', () => {
    const result = getYesterday(new Date(2025, 1, 1)) // Feb 1
    expect(result).toBe('2025-01-31')
  })

  it('handles year boundary', () => {
    const result = getYesterday(new Date(2025, 0, 1)) // Jan 1
    expect(result).toBe('2024-12-31')
  })
})

describe('getStartOfWeek', () => {
  it('returns Monday as start of week', () => {
    const wed = new Date(2025, 0, 15) // Wednesday
    const result = getStartOfWeek(wed)
    expect(result.getDay()).toBe(1) // Monday
  })

  it('returns Date object', () => {
    const result = getStartOfWeek(new Date())
    expect(result instanceof Date).toBe(true)
  })
})

describe('calculateTotals', () => {
  it('sums calories from entries', () => {
    const entries = [
      { calories: 100, protein: 10, carbs: 20, fat: 5 },
      { calories: 200, protein: 15, carbs: 30, fat: 10 }
    ]
    const result = calculateTotals(entries)
    expect(result.calories).toBe(300)
    expect(result.protein).toBe(25)
    expect(result.carbs).toBe(50)
    expect(result.fat).toBe(15)
  })

  it('returns zeros for empty array', () => {
    const result = calculateTotals([])
    expect(result).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 })
  })

  it('handles missing fields', () => {
    const entries = [{ calories: 100 }]
    const result = calculateTotals(entries)
    expect(result.protein).toBe(0)
  })
})

describe('pickRandom', () => {
  it('returns item from array', () => {
    const arr = ['a', 'b', 'c']
    const result = pickRandom(arr)
    expect(arr).toContain(result)
  })
})

describe('isSuccessfulDay', () => {
  it('returns true for 90% of goal', () => {
    expect(isSuccessfulDay(1800, 2000)).toBe(true)
  })

  it('returns true for 100% of goal', () => {
    expect(isSuccessfulDay(2000, 2000)).toBe(true)
  })

  it('returns true for 110% of goal', () => {
    expect(isSuccessfulDay(2200, 2000)).toBe(true)
  })

  it('returns false for 89% of goal', () => {
    expect(isSuccessfulDay(1780, 2000)).toBe(false)
  })

  it('returns false for 111% of goal', () => {
    expect(isSuccessfulDay(2220, 2000)).toBe(false)
  })

  it('returns false for zero goal', () => {
    expect(isSuccessfulDay(100, 0)).toBe(false)
  })
})

describe('updateStreakForDay', () => {
  beforeEach(() => localStorage.clear())

  it('starts streak at 1 for first day', () => {
    const result = updateStreakForDay('test', '2025-01-17', 2000, 2000)
    expect(result.current).toBe(1)
    expect(result.longest).toBe(1)
  })

  it('increments streak on consecutive day', () => {
    localStorage.setItem('streak-test', JSON.stringify({
      current: 5,
      longest: 5,
      lastSuccessDate: '2025-01-16'
    }))

    const result = updateStreakForDay('test', '2025-01-17', 2000, 2000)
    expect(result.current).toBe(6)
    expect(result.longest).toBe(6)
  })

  it('resets streak on gap', () => {
    localStorage.setItem('streak-test', JSON.stringify({
      current: 5,
      longest: 10,
      lastSuccessDate: '2025-01-14' // 3 days ago
    }))

    const result = updateStreakForDay('test', '2025-01-17', 2000, 2000)
    expect(result.current).toBe(1)
    expect(result.longest).toBe(10) // Unchanged
  })

  it('does not double-count same day', () => {
    localStorage.setItem('streak-test', JSON.stringify({
      current: 5,
      longest: 5,
      lastSuccessDate: '2025-01-17'
    }))

    const result = updateStreakForDay('test', '2025-01-17', 2000, 2000)
    expect(result.current).toBe(5) // Not 6
  })
})

describe('recalculateStreak', () => {
  it('calculates streak from entries', () => {
    const entries = [
      { date: '2025-01-15', calories: 2000 },
      { date: '2025-01-16', calories: 2000 },
      { date: '2025-01-17', calories: 2000 },
    ]
    const goals = { calories: 2000 }

    const result = recalculateStreak('test', entries, goals)
    expect(result.current).toBe(3)
    expect(result.longest).toBe(3)
  })

  it('handles gaps correctly', () => {
    const entries = [
      { date: '2025-01-10', calories: 2000 },
      { date: '2025-01-11', calories: 2000 },
      // Gap: 12, 13
      { date: '2025-01-14', calories: 2000 },
      { date: '2025-01-15', calories: 2000 },
      { date: '2025-01-16', calories: 2000 },
    ]
    const goals = { calories: 2000 }

    const result = recalculateStreak('test', entries, goals)
    expect(result.current).toBe(3)
    expect(result.longest).toBe(3) // Not 5
  })
})
```
