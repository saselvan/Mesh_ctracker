# Tests: Milestone Celebration Moments

id: T-009
spec: S-009 (specs/09-milestone-moments.md)

---

## Functional Tests

### Scenario: 7-day milestone triggers small celebration

**Given:** Previous streak was 6 days
**When:** Streak becomes 7 days
**Then:** checkMilestones(7, 6) returns array with 7-day milestone
**And:** Celebration triggers with variant="small"
**And:** dotCount is 30
**And:** Message shows "One Week!"

### Scenario: 30-day milestone triggers large celebration

**Given:** Previous streak was 29 days
**When:** Streak becomes 30 days
**Then:** checkMilestones(30, 29) returns array with 30-day milestone
**And:** Celebration triggers with variant="large"
**And:** dotCount is 80
**And:** Message shows "One Month!"

### Scenario: 100-day milestone triggers epic celebration

**Given:** Previous streak was 99 days
**When:** Streak becomes 100 days
**Then:** checkMilestones(100, 99) returns array with 100-day milestone
**And:** Celebration triggers with variant="epic"
**And:** dotCount is 150
**And:** Epic CSS effects applied (rainbow, longer duration)

### Scenario: checkMilestones returns array of ALL crossed milestones

**Given:** User data was recalculated and streak jumped
**When:** I call checkMilestones(35, 5)
**Then:** Returns array with THREE milestones: [7-day, 14-day, 30-day]
**And:** All three should be awarded as badges
**And:** Only highest milestone (30) triggers celebration

### Scenario: checkMilestones returns empty array when no milestone

**Given:** I call checkMilestones(8, 7)
**When:** Function executes
**Then:** Returns empty array [] (8 is not a milestone)

---

## Edge Cases

### Scenario: Milestone only celebrates once

**Given:** 7-day milestone was already celebrated
**When:** App reloads with streak still at 7
**Then:** Celebration does not re-trigger
**And:** Badge remains in storage

### Scenario: Multiple milestones in sequence

**Given:** Streak goes from 6 to 7 (7-day milestone)
**When:** Tomorrow streak goes to 8
**Then:** checkMilestones(8, 7) returns empty array
**When:** Later streak reaches 14
**Then:** checkMilestones(14, 13) returns [14-day milestone]

### Scenario: Skipped milestones all awarded as badges

**Given:** Streak jumped from 5 to 35 (data import/recalculation)
**When:** checkMilestones(35, 5) is called
**Then:** Returns array with 7, 14, and 30 day milestones
**And:** awardMilestone called for EACH milestone
**And:** User gets badges for all three

---

## Non-Functional Tests

### Performance

| Metric | Target | Test Method |
|--------|--------|-------------|
| Epic celebration FPS | 60fps | 150 dots animated |
| DOM cleanup | 0 orphans | After celebration ends |
| checkMilestones | O(n) | Filters MILESTONES array |

### Accessibility

| Check | Tool | Pass Criteria |
|-------|------|---------------|
| Milestone announced | Screen reader | "One Month!" announced |
| Epic doesn't strobe | Manual | < 3 flashes/second |

---

## Unit Test Implementation

```javascript
// src/utils/__tests__/milestones.test.js
import { checkMilestones, MILESTONES } from '../milestones'

describe('checkMilestones', () => {
  it('returns array with 7-day milestone', () => {
    const result = checkMilestones(7, 6)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      days: 7,
      label: 'One Week!',
      intensity: 'small',
      dotCount: 30
    })
  })

  it('returns array with 14-day milestone', () => {
    const result = checkMilestones(14, 13)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      days: 14,
      label: 'Two Weeks!',
      intensity: 'medium',
      dotCount: 50
    })
  })

  it('returns array with 30-day milestone', () => {
    const result = checkMilestones(30, 29)
    expect(result).toHaveLength(1)
    expect(result[0].days).toBe(30)
    expect(result[0].intensity).toBe('large')
  })

  it('returns array with 100-day milestone', () => {
    const result = checkMilestones(100, 99)
    expect(result).toHaveLength(1)
    expect(result[0].days).toBe(100)
    expect(result[0].intensity).toBe('epic')
    expect(result[0].dotCount).toBe(150)
  })

  it('returns empty array for non-milestone days', () => {
    expect(checkMilestones(8, 7)).toEqual([])
    expect(checkMilestones(15, 14)).toEqual([])
    expect(checkMilestones(50, 49)).toEqual([])
  })

  it('returns empty array when already past milestone', () => {
    // Already celebrated 7, now at 8
    expect(checkMilestones(8, 8)).toEqual([])
  })

  it('returns ALL skipped milestones when streak jumps', () => {
    // Jumped from 5 to 35, should get 7, 14, and 30
    const result = checkMilestones(35, 5)
    expect(result).toHaveLength(3)
    expect(result.map(m => m.days)).toEqual([7, 14, 30])
  })

  it('returns multiple milestones when crossing several', () => {
    // Jumped from 0 to 100 (extreme case)
    const result = checkMilestones(100, 0)
    expect(result).toHaveLength(5)
    expect(result.map(m => m.days)).toEqual([7, 14, 30, 60, 100])
  })

  it('uses filter not find to get all matches', () => {
    // This test verifies the fix from spec validation
    const result = checkMilestones(100, 6)
    // Should have all 5 milestones, not just the first one (7)
    expect(result.length).toBe(5)
    expect(result[0].days).toBe(7)  // First
    expect(result[4].days).toBe(100) // Last
  })
})

describe('milestone celebration logic', () => {
  it('celebrates highest milestone when multiple crossed', () => {
    const milestones = checkMilestones(35, 5)
    // Should show celebration for 30 (highest)
    const topMilestone = milestones[milestones.length - 1]
    expect(topMilestone.days).toBe(30)
    expect(topMilestone.intensity).toBe('large')
  })

  it('awards all milestones for badges', () => {
    const milestones = checkMilestones(35, 5)
    // All three should be awarded
    expect(milestones.map(m => m.days)).toContain(7)
    expect(milestones.map(m => m.days)).toContain(14)
    expect(milestones.map(m => m.days)).toContain(30)
  })
})
```

---

## Celebration Variant Test

```javascript
// src/components/__tests__/Celebration.variants.test.jsx
import { render } from '@testing-library/preact'
import { Celebration } from '../Celebration'

describe('Celebration variants', () => {
  it('small variant has 30 dots', () => {
    const { container } = render(
      <Celebration variant="small" message="One Week!" onComplete={() => {}} />
    )
    const dots = container.querySelectorAll('.kusama-dot')
    expect(dots.length).toBe(30)
  })

  it('medium variant has 50 dots', () => {
    const { container } = render(
      <Celebration variant="medium" message="Two Weeks!" onComplete={() => {}} />
    )
    const dots = container.querySelectorAll('.kusama-dot')
    expect(dots.length).toBe(50)
  })

  it('large variant has 80 dots', () => {
    const { container } = render(
      <Celebration variant="large" message="One Month!" onComplete={() => {}} />
    )
    const dots = container.querySelectorAll('.kusama-dot')
    expect(dots.length).toBe(80)
  })

  it('epic variant has 150 dots', () => {
    const { container } = render(
      <Celebration variant="epic" message="100 Days!" onComplete={() => {}} />
    )
    const dots = container.querySelectorAll('.kusama-dot')
    expect(dots.length).toBe(150)
  })

  it('epic variant has special class', () => {
    const { container } = render(
      <Celebration variant="epic" message="100 Days!" onComplete={() => {}} />
    )
    expect(container.querySelector('.celebration--epic')).toBeTruthy()
  })

  it('displays custom message', () => {
    const { getByText } = render(
      <Celebration variant="large" message="One Month!" onComplete={() => {}} />
    )
    expect(getByText('One Month!')).toBeTruthy()
  })
})
```

---

## Badge Persistence Test

```javascript
// src/utils/__tests__/milestones.storage.test.js
import { getMilestones, awardMilestone } from '../storage'

describe('Milestone badges', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns empty array when no milestones', () => {
    expect(getMilestones('test')).toEqual([])
  })

  it('awards milestone badge', () => {
    awardMilestone('test', { days: 7 })
    expect(getMilestones('test')).toContain(7)
  })

  it('does not duplicate badges', () => {
    awardMilestone('test', { days: 7 })
    awardMilestone('test', { days: 7 })
    expect(getMilestones('test').filter(m => m === 7).length).toBe(1)
  })

  it('stores multiple badges', () => {
    awardMilestone('test', { days: 7 })
    awardMilestone('test', { days: 14 })
    awardMilestone('test', { days: 30 })
    expect(getMilestones('test')).toEqual([7, 14, 30])
  })

  it('awards all milestones when streak jumps', () => {
    const milestones = [
      { days: 7, label: 'One Week!' },
      { days: 14, label: 'Two Weeks!' },
      { days: 30, label: 'One Month!' }
    ]

    milestones.forEach(m => awardMilestone('test', m))

    const awarded = getMilestones('test')
    expect(awarded).toContain(7)
    expect(awarded).toContain(14)
    expect(awarded).toContain(30)
  })
})
```
