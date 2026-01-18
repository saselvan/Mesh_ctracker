# Tests: Staggered Animations & Number Counting

id: T-006
spec: S-006 (specs/06-staggered-animations.md)

---

## Functional Tests

### Scenario: Entry cards have staggered animation

**Given:** 5 entries exist for today
**When:** The entry list renders
**Then:** Each card has animation "entry-settle"
**And:** Card 1 has animation-delay: 0ms
**And:** Card 2 has animation-delay: 50ms
**And:** Card 3 has animation-delay: 100ms
**And:** Cards appear sequentially, not simultaneously

### Scenario: useAnimatedNumber counts up

**Given:** Total calories are 0
**When:** An entry of 500 calories is added
**Then:** The displayed number animates from 0 to 500
**And:** Animation takes approximately 400ms
**And:** Animation uses ease-out easing (fast start, slow end)

### Scenario: useAnimatedNumber counts down

**Given:** Total calories are 1000
**When:** An entry of 500 calories is deleted
**Then:** The displayed number animates from 1000 to 500
**And:** Animation is smooth (no jumps)

### Scenario: Macro numbers animate independently

**Given:** Protein is 50g, Carbs is 100g, Fat is 40g
**When:** A new entry adds 20g protein only
**Then:** Protein animates from 50 to 70
**And:** Carbs and Fat remain at their values (no animation)

### Scenario: Entry settle animation has overshoot

**Given:** A new entry is added
**When:** The card animates in
**Then:** Card moves down from -12px
**And:** Overshoots to +3px at 70% progress
**And:** Settles to 0px at 100%

---

## Edge Cases

### Scenario: Reduced motion shows instant values

**Given:** User has prefers-reduced-motion enabled
**When:** An entry is added
**Then:** Numbers update instantly (no counting animation)
**And:** Cards appear without stagger delay
**And:** No transform animations

### Scenario: Rapid value changes

**Given:** User adds entries quickly
**When:** Multiple entries added within 400ms
**Then:** Animation target updates mid-animation
**And:** Number smoothly redirects to new target
**And:** No animation glitches or jumps

### Scenario: Large number changes

**Given:** Current calories are 100
**When:** An entry of 2000 calories is added
**Then:** Animation still completes in ~400ms
**And:** Number counts up smoothly (not too fast)

### Scenario: Zero to zero

**Given:** Current calories are 0
**When:** Component re-renders with 0
**Then:** No animation occurs
**And:** Display remains at 0

---

## Non-Functional Tests

### Performance

| Metric | Target | Test Method |
|--------|--------|-------------|
| Animation frame rate | 60fps | requestAnimationFrame timing |
| No layout thrashing | 0 forced reflows | Performance panel |
| Stagger doesn't block render | < 50ms total | First contentful paint |

### Accessibility

| Check | Tool | Pass Criteria |
|-------|------|---------------|
| Reduced motion | Manual | Instant updates |
| Screen reader | VoiceOver | Final value announced |
| No seizure risk | Manual | Subtle motion only |

---

## Unit Test Implementation

```javascript
// src/hooks/__tests__/useAnimatedNumber.test.js
import { renderHook, act } from '@testing-library/preact'
import { useAnimatedNumber } from '../useAnimatedNumber'

describe('useAnimatedNumber', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useAnimatedNumber(100))
    expect(result.current).toBe(100)
  })

  it('animates to new value', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useAnimatedNumber(value),
      { initialProps: { value: 0 } }
    )

    expect(result.current).toBe(0)

    rerender({ value: 100 })

    // Advance time partially
    act(() => {
      vi.advanceTimersByTime(200)
    })

    // Should be mid-animation
    expect(result.current).toBeGreaterThan(0)
    expect(result.current).toBeLessThan(100)

    // Complete animation
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe(100)
  })

  it('uses ease-out easing', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useAnimatedNumber(value, 400),
      { initialProps: { value: 0 } }
    )

    rerender({ value: 100 })

    const values = []

    // Sample at regular intervals
    for (let t = 0; t <= 400; t += 50) {
      act(() => vi.advanceTimersByTime(50))
      values.push(result.current)
    }

    // Ease-out: faster at start, slower at end
    const firstHalfProgress = values[4] // at 200ms
    const secondHalfProgress = values[8] - values[4] // 200-400ms

    expect(firstHalfProgress).toBeGreaterThan(secondHalfProgress)
  })

  it('handles value changes mid-animation', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useAnimatedNumber(value),
      { initialProps: { value: 0 } }
    )

    rerender({ value: 100 })

    act(() => vi.advanceTimersByTime(200))

    // Change target mid-animation
    rerender({ value: 50 })

    act(() => vi.advanceTimersByTime(400))

    expect(result.current).toBe(50)
  })
})
```

---

## Integration Test

```javascript
// src/components/__tests__/DailyProgress.animation.test.jsx
import { render, act } from '@testing-library/preact'
import { DailyProgress } from '../DailyProgress'

describe('DailyProgress number animation', () => {
  it('animates calorie count on entry add', async () => {
    const { rerender, getByText } = render(
      <DailyProgress entries={[]} goals={{ calories: 2000 }} />
    )

    // Initially 0
    expect(getByText('0')).toBeTruthy()

    // Add entry
    rerender(
      <DailyProgress
        entries={[{ calories: 500, protein: 20, carbs: 50, fat: 15 }]}
        goals={{ calories: 2000 }}
      />
    )

    // After animation completes
    await act(() => new Promise(r => setTimeout(r, 500)))

    expect(getByText('500')).toBeTruthy()
  })
})
```

---

## CSS Test

```javascript
// src/__tests__/stagger-animation.test.js
describe('Entry stagger animation', () => {
  it('defines entry-settle keyframes', () => {
    // Check keyframes exist in stylesheet
    const hasKeyframes = Array.from(document.styleSheets)
      .flatMap(s => Array.from(s.cssRules))
      .some(r => r.name === 'entry-settle')

    expect(hasKeyframes).toBe(true)
  })

  it('nth-child selectors have staggered delays', () => {
    document.body.innerHTML = `
      <div class="entry-card"></div>
      <div class="entry-card"></div>
      <div class="entry-card"></div>
    `

    const cards = document.querySelectorAll('.entry-card')
    const delays = Array.from(cards).map(
      c => getComputedStyle(c).animationDelay
    )

    expect(delays[0]).toBe('0ms')
    expect(delays[1]).toBe('50ms')
    expect(delays[2]).toBe('100ms')
  })
})
```
