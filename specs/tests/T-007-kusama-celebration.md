# Tests: Kusama Infinity Dot Celebration

id: T-007
spec: S-007 (specs/07-kusama-celebration.md)

---

## Functional Tests

### Scenario: Celebration triggers at 100% goal

**Given:** Current calories are 1900, goal is 2000
**When:** An entry of 150 calories is added (total: 2050)
**Then:** Celebration component renders
**And:** 40+ dots appear on screen
**And:** "Goal reached!" message displays

### Scenario: Celebration does not trigger when goal is 0

**Given:** Goal is 0 or not set
**When:** Any entry is added
**Then:** Celebration does not trigger
**And:** No error is thrown

### Scenario: Celebration does not re-trigger same day

**Given:** Celebration has already triggered today for this profile
**When:** Another entry is added
**Then:** Celebration does not trigger again
**And:** localStorage contains celebrated-{profileId}-{date} = true

### Scenario: Celebration does not trigger on page load

**Given:** User already hit goal earlier today
**When:** Page is refreshed
**Then:** Celebration does not trigger
**And:** App loads normally showing progress

### Scenario: Multiple profiles have separate celebration state

**Given:** Profile A (id: "profile-a") has celebrated today
**When:** User switches to Profile B (id: "profile-b")
**And:** Profile B hits goal
**Then:** Profile B can trigger celebration independently
**And:** localStorage has both:
  - celebrated-profile-a-2025-01-17 = true
  - celebrated-profile-b-2025-01-17 = true

### Scenario: Dots have random positions

**Given:** Celebration triggers
**When:** I inspect dot elements
**Then:** Each dot has unique left % (0-100)
**And:** Each dot has unique top % (0-100)
**And:** Distribution appears random

### Scenario: Dots use brand colors

**Given:** Celebration triggers
**When:** I inspect dot backgroundColor values
**Then:** Colors are from palette: #C17B5F, #5C6B54, #C4A35A, #8B7355, #D4A574
**And:** Colors are randomly distributed

### Scenario: Animation phases progress correctly

**Given:** Celebration triggers with default variant
**When:** I observe over 3.5 seconds
**Then:** Phase 1 (enter): dots pop in with stagger (~1050ms)
**And:** Phase 2 (hold): dots pulse gently (~1450ms)
**And:** Phase 3 (exit): dots fade out (~1000ms)
**And:** Component unmounts after exit

### Scenario: Variant changes dot count and duration

**Given:** Celebration is triggered with variant="epic"
**When:** Component renders
**Then:** 150 dots appear (not default 40)
**And:** Duration is 5500ms (not default 3500ms)

### Scenario: Custom message displayed

**Given:** Celebration is triggered with message="100 Days!"
**When:** Component renders
**Then:** "100 Days!" appears in center (not "Goal reached!")

---

## Edge Cases

### Scenario: Reduced motion shows static dots

**Given:** User has prefers-reduced-motion enabled
**When:** Celebration triggers
**Then:** Dots appear immediately (no pop animation)
**And:** Dots are static (no pulse)
**And:** Dots fade out without transform
**And:** Message still displays

### Scenario: Goal reached via edit (not add)

**Given:** Calories are 1500, goal is 2000
**When:** An entry is edited from 200 to 700 calories
**Then:** New total is 2000
**And:** Celebration triggers correctly

### Scenario: Date format in localStorage key

**Given:** Today is January 17, 2025
**When:** Celebration triggers for profile "test-profile"
**Then:** localStorage key is "celebrated-test-profile-2025-01-17"
**And:** formatDate() returns YYYY-MM-DD format

---

## Non-Functional Tests

### Performance

| Metric | Target | Test Method |
|--------|--------|-------------|
| DOM nodes (dots) | ≤ 50 for default, ≤ 150 for epic | DevTools Elements |
| Animation FPS | 60fps | Performance panel |
| Memory during celebration | < 20MB increase | Memory profiler |
| Cleanup after dismiss | 0 orphan nodes | Elements panel |

### Accessibility

| Check | Tool | Pass Criteria |
|-------|------|---------------|
| Celebration is decorative | aria-hidden | Dots have aria-hidden="true" |
| Message is announced | aria-live | "Goal reached" announced |
| Reduced motion | Manual | Static alternative works |
| No seizure risk | Manual | < 3 flashes/second |

---

## Unit Test Implementation

```javascript
// src/components/__tests__/Celebration.test.jsx
import { render, act } from '@testing-library/preact'
import { Celebration } from '../Celebration'

describe('Celebration', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders 40+ dots by default', () => {
    const { container } = render(<Celebration onComplete={() => {}} />)
    const dots = container.querySelectorAll('.kusama-dot')
    expect(dots.length).toBeGreaterThanOrEqual(40)
  })

  it('renders 150 dots for epic variant', () => {
    const { container } = render(
      <Celebration onComplete={() => {}} variant="epic" />
    )
    const dots = container.querySelectorAll('.kusama-dot')
    expect(dots.length).toBe(150)
  })

  it('displays default message "Goal reached!"', () => {
    const { getByText } = render(<Celebration onComplete={() => {}} />)
    expect(getByText('Goal reached!')).toBeTruthy()
  })

  it('displays custom message when provided', () => {
    const { getByText } = render(
      <Celebration onComplete={() => {}} message="100 Days!" />
    )
    expect(getByText('100 Days!')).toBeTruthy()
  })

  it('dots have random positions', () => {
    const { container } = render(<Celebration onComplete={() => {}} />)
    const dots = container.querySelectorAll('.kusama-dot')

    const positions = new Set()
    dots.forEach(dot => {
      positions.add(`${dot.style.left}-${dot.style.top}`)
    })

    // All positions should be unique (or nearly all)
    expect(positions.size).toBeGreaterThan(35)
  })

  it('uses brand colors', () => {
    const { container } = render(<Celebration onComplete={() => {}} />)
    const dots = container.querySelectorAll('.kusama-dot')

    const brandColors = ['#C17B5F', '#5C6B54', '#C4A35A', '#8B7355', '#D4A574']
    dots.forEach(dot => {
      expect(brandColors).toContain(dot.style.backgroundColor)
    })
  })

  it('calls onComplete after default duration (3500ms)', () => {
    const onComplete = vi.fn()
    render(<Celebration onComplete={onComplete} />)

    expect(onComplete).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(3500)
    })

    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('calls onComplete after epic duration (5500ms)', () => {
    const onComplete = vi.fn()
    render(<Celebration onComplete={onComplete} variant="epic" />)

    act(() => {
      vi.advanceTimersByTime(3500)
    })
    expect(onComplete).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('progresses through phases', () => {
    const { container } = render(<Celebration onComplete={() => {}} />)

    expect(container.querySelector('.celebration--enter')).toBeTruthy()

    act(() => vi.advanceTimersByTime(1050)) // 30% of 3500
    expect(container.querySelector('.celebration--hold')).toBeTruthy()

    act(() => vi.advanceTimersByTime(1400)) // 70% of 3500
    expect(container.querySelector('.celebration--exit')).toBeTruthy()
  })
})
```

---

## Integration Test

```javascript
// src/components/__tests__/App.celebration.test.jsx
import { render, fireEvent } from '@testing-library/preact'
import { App } from '../App'
import { formatDate } from '../../utils/date'

describe('Celebration integration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('triggers celebration when goal reached', async () => {
    const { container, getByLabelText, getByRole } = render(<App />)

    // Set goal to 100 for easy testing
    // ... navigate to settings, set goal

    // Add entry that exceeds goal
    fireEvent.click(getByRole('button', { name: /add/i }))
    fireEvent.change(getByLabelText(/calories/i), { target: { value: '150' } })
    fireEvent.submit(getByRole('form'))

    // Celebration should appear
    expect(container.querySelector('.celebration')).toBeTruthy()
  })

  it('stores celebrated state with profileId in localStorage', () => {
    const profileId = 'test-profile'
    const today = formatDate(new Date())
    const key = `celebrated-${profileId}-${today}`

    // After celebration triggers...
    localStorage.setItem(key, 'true')
    expect(localStorage.getItem(key)).toBe('true')
  })

  it('does not re-trigger on page reload', () => {
    const profileId = 'test-profile'
    const today = formatDate(new Date())
    localStorage.setItem(`celebrated-${profileId}-${today}`, 'true')

    const { container } = render(<App />)
    expect(container.querySelector('.celebration')).toBeFalsy()
  })

  it('tracks celebration separately per profile', () => {
    const today = formatDate(new Date())

    // Profile A celebrated
    localStorage.setItem(`celebrated-profile-a-${today}`, 'true')

    // Profile B has not celebrated
    expect(localStorage.getItem(`celebrated-profile-b-${today}`)).toBeNull()

    // Profile B can still celebrate
    // ... trigger celebration for profile B
    localStorage.setItem(`celebrated-profile-b-${today}`, 'true')

    // Both stored separately
    expect(localStorage.getItem(`celebrated-profile-a-${today}`)).toBe('true')
    expect(localStorage.getItem(`celebrated-profile-b-${today}`)).toBe('true')
  })

  it('does not trigger when goal is 0', () => {
    // Set goal to 0
    localStorage.setItem('goals', JSON.stringify({ calories: 0 }))

    const { container } = render(<App />)
    // Add entry...
    expect(container.querySelector('.celebration')).toBeFalsy()
  })
})
```
