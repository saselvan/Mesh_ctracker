# Tests: Time-of-Day Theming

id: T-001
spec: S-001 (specs/01-time-of-day-theming.md)

---

## Functional Tests

### Scenario: Morning theme applied at 7am

**Given:** The current time is 7:00 AM (hour 7)
**When:** The app loads
**Then:** document.body has class "theme-morning"
**And:** --color-cream equals #FDF8F3 (warmer)
**And:** Background has warm peachy tones

### Scenario: Midday theme applied at 2pm

**Given:** The current time is 2:00 PM (hour 14)
**When:** The app loads
**Then:** document.body has class "theme-midday"
**And:** Default palette values applied
**And:** Background has neutral tones

### Scenario: Evening theme applied at 6pm

**Given:** The current time is 6:00 PM (hour 18)
**When:** The app loads
**Then:** document.body has class "theme-evening"
**And:** --color-sage equals #5A6B58 (cooler)
**And:** Background has cooler sage tones

### Scenario: Night theme applied at 10pm

**Given:** The current time is 10:00 PM (hour 22)
**When:** The app loads
**Then:** document.body has class "theme-night"
**And:** --color-cream equals #1A1A1A (dark background)
**And:** Full dark mode palette active

### Scenario: Theme refreshes every 15 minutes

**Given:** The app is open at 10:45 AM
**When:** 15 minutes pass (11:00 AM)
**Then:** applyTheme() is called
**And:** Theme updates from morning to midday

### Scenario: getTimeOfDay returns correct period

**Given:** I import getTimeOfDay from utils/theme.js
**When:** I call getTimeOfDay() with various hours
**Then:** Results match boundary table:

| Hour | Expected | Why |
|------|----------|-----|
| 5 | morning | >= 5 and < 11 |
| 10 | morning | >= 5 and < 11 |
| 11 | midday | >= 11 and < 16 |
| 15 | midday | >= 11 and < 16 |
| 16 | evening | >= 16 and < 20 |
| 19 | evening | >= 16 and < 20 |
| 20 | night | >= 20 or < 5 |
| 0 | night | >= 20 or < 5 |
| 4 | night | >= 20 or < 5 |

---

## Edge Cases

### Scenario: Boundary hour - morning to midday

**Given:** The current time is 10:59 AM (hour 10)
**When:** getTimeOfDay() is called
**Then:** Returns "morning"

**Given:** The current time is 11:00 AM (hour 11)
**When:** getTimeOfDay() is called
**Then:** Returns "midday"

### Scenario: Boundary hour - evening to night

**Given:** The current time is 7:59 PM (hour 19)
**When:** getTimeOfDay() is called
**Then:** Returns "evening"

**Given:** The current time is 8:00 PM (hour 20)
**When:** getTimeOfDay() is called
**Then:** Returns "night"

### Scenario: Midnight handling

**Given:** The current time is 12:00 AM (hour 0)
**When:** getTimeOfDay() is called
**Then:** Returns "night" (not undefined or error)

### Scenario: User's system time is wrong

**Given:** User's device clock shows wrong time
**When:** App loads
**Then:** Theme applies based on device time (no network lookup)
**And:** App works offline

### Scenario: Timezone travel

**Given:** User travels to different timezone
**When:** Device timezone updates
**Then:** Next theme check uses new local time

### Scenario: Midnight crossing while using app

**Given:** App is open at 11:55 PM
**When:** Clock passes midnight
**Then:** Theme remains night (no jarring change)
**And:** Updates on next 15-minute check

---

## Non-Functional Tests

### Performance

| Metric | Target | Test Method |
|--------|--------|-------------|
| getTimeOfDay execution | < 1ms | performance.now() measurement |
| CSS transition | 1800s (30min) | Inspect computed transition-duration |
| Theme refresh interval | Every 15min | setInterval verification |

### Accessibility

| Check | Tool | Pass Criteria |
|-------|------|---------------|
| Color contrast (morning) | axe-core | All text 4.5:1 ratio |
| Color contrast (midday) | axe-core | All text 4.5:1 ratio |
| Color contrast (evening) | axe-core | All text 4.5:1 ratio |
| Color contrast (night) | axe-core | All text 4.5:1 ratio |

---

## Unit Test Implementation

```javascript
// src/utils/__tests__/theme.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getTimeOfDay, applyTheme } from '../theme'

describe('getTimeOfDay', () => {
  // Morning: 5 to <11
  it('returns morning for hour 5', () => {
    expect(getTimeOfDay(5)).toBe('morning')
  })

  it('returns morning for hour 10', () => {
    expect(getTimeOfDay(10)).toBe('morning')
  })

  // Midday: 11 to <16
  it('returns midday for hour 11', () => {
    expect(getTimeOfDay(11)).toBe('midday')
  })

  it('returns midday for hour 15', () => {
    expect(getTimeOfDay(15)).toBe('midday')
  })

  // Evening: 16 to <20
  it('returns evening for hour 16', () => {
    expect(getTimeOfDay(16)).toBe('evening')
  })

  it('returns evening for hour 19', () => {
    expect(getTimeOfDay(19)).toBe('evening')
  })

  // Night: 20 to <5
  it('returns night for hour 20', () => {
    expect(getTimeOfDay(20)).toBe('night')
  })

  it('returns night for hour 0 (midnight)', () => {
    expect(getTimeOfDay(0)).toBe('night')
  })

  it('returns night for hour 4', () => {
    expect(getTimeOfDay(4)).toBe('night')
  })

  // Boundary tests
  it('boundary: 10 is morning, 11 is midday', () => {
    expect(getTimeOfDay(10)).toBe('morning')
    expect(getTimeOfDay(11)).toBe('midday')
  })

  it('boundary: 15 is midday, 16 is evening', () => {
    expect(getTimeOfDay(15)).toBe('midday')
    expect(getTimeOfDay(16)).toBe('evening')
  })

  it('boundary: 19 is evening, 20 is night', () => {
    expect(getTimeOfDay(19)).toBe('evening')
    expect(getTimeOfDay(20)).toBe('night')
  })

  it('boundary: 4 is night, 5 is morning', () => {
    expect(getTimeOfDay(4)).toBe('night')
    expect(getTimeOfDay(5)).toBe('morning')
  })
})

describe('applyTheme', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.className = ''
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('applies theme-morning class at 8am', () => {
    vi.setSystemTime(new Date(2025, 0, 17, 8, 0))
    applyTheme()
    expect(document.body.className).toBe('theme-morning')
  })

  it('applies theme-midday class at 2pm', () => {
    vi.setSystemTime(new Date(2025, 0, 17, 14, 0))
    applyTheme()
    expect(document.body.className).toBe('theme-midday')
  })

  it('applies theme-evening class at 6pm', () => {
    vi.setSystemTime(new Date(2025, 0, 17, 18, 0))
    applyTheme()
    expect(document.body.className).toBe('theme-evening')
  })

  it('applies theme-night class at 10pm', () => {
    vi.setSystemTime(new Date(2025, 0, 17, 22, 0))
    applyTheme()
    expect(document.body.className).toBe('theme-night')
  })
})
```

---

## Integration Test Implementation

```javascript
// src/components/__tests__/App.theme.test.jsx
import { render } from '@testing-library/preact'
import { App } from '../App'

describe('Time-of-day theming', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('sets morning theme at 8am', () => {
    vi.setSystemTime(new Date(2025, 0, 17, 8, 0))
    render(<App />)
    expect(document.body.className).toContain('theme-morning')
  })

  it('sets midday theme at 1pm', () => {
    vi.setSystemTime(new Date(2025, 0, 17, 13, 0))
    render(<App />)
    expect(document.body.className).toContain('theme-midday')
  })

  it('sets evening theme at 6pm', () => {
    vi.setSystemTime(new Date(2025, 0, 17, 18, 0))
    render(<App />)
    expect(document.body.className).toContain('theme-evening')
  })

  it('sets night theme at 10pm', () => {
    vi.setSystemTime(new Date(2025, 0, 17, 22, 0))
    render(<App />)
    expect(document.body.className).toContain('theme-night')
  })
})
```
