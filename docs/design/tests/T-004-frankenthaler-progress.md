# Tests: Frankenthaler Soft-Edge Progress

id: T-004
spec: S-004 (specs/04-frankenthaler-progress.md)

---

## Functional Tests

### Scenario: SVG filter definitions exist

**Given:** DailyProgress component is rendered
**When:** I inspect the SVG element
**Then:** A <defs> section contains filter definitions
**And:** Filter includes feGaussianBlur element
**And:** Filter has unique id for reference

### Scenario: Progress ring uses blur filter

**Given:** DailyProgress component is rendered
**When:** I inspect .progress-ring-fill element
**Then:** filter attribute references the blur filter
**And:** Edges appear soft, not crisp

### Scenario: Gradient fill on progress ring

**Given:** Progress is at 50%
**When:** I inspect the progress ring stroke
**Then:** stroke references a gradient definition
**And:** Gradient has soft color stops (not abrupt)

### Scenario: Organic edge variation

**Given:** DailyProgress component is rendered
**When:** I inspect the SVG filters
**Then:** feTurbulence element adds organic variation
**And:** Edges have subtle irregularity (watercolor effect)

---

## Edge Cases

### Scenario: Reduced motion removes blur animation

**Given:** User has prefers-reduced-motion enabled
**When:** The component renders
**Then:** Blur filter still applies (static)
**And:** No animated filter transitions
**And:** Solid fill alternative available

### Scenario: Zero progress state

**Given:** No entries logged today
**When:** Progress is 0%
**Then:** Ring shows empty state
**And:** No blur artifacts on empty ring

### Scenario: Over 100% progress

**Given:** User exceeds calorie goal
**When:** Progress is 115%
**Then:** Ring shows full with overflow indicator
**And:** Blur effect still applies correctly

---

## Non-Functional Tests

### Performance

| Metric | Target | Test Method |
|--------|--------|-------------|
| SVG filter render | < 10ms | DevTools Performance |
| Filter not causing repaints | 0 repaints on scroll | Paint flashing |
| GPU acceleration | Used | will-change hint |

### Accessibility

| Check | Tool | Pass Criteria |
|-------|------|---------------|
| Progress ring ARIA | axe-core | role="progressbar" present |
| Blur doesn't hide info | Manual | Numbers still readable |

---

## Unit Test Implementation

```javascript
// src/components/__tests__/DailyProgress.filter.test.jsx
import { render } from '@testing-library/preact'
import { DailyProgress } from '../DailyProgress'

describe('Frankenthaler soft-edge progress', () => {
  it('renders SVG filter definitions', () => {
    const { container } = render(
      <DailyProgress entries={[]} goals={{ calories: 2000 }} />
    )

    const defs = container.querySelector('svg defs')
    expect(defs).toBeTruthy()

    const filter = defs.querySelector('filter')
    expect(filter).toBeTruthy()
    expect(filter.id).toBeTruthy()
  })

  it('filter includes Gaussian blur', () => {
    const { container } = render(
      <DailyProgress entries={[]} goals={{ calories: 2000 }} />
    )

    const blur = container.querySelector('feGaussianBlur')
    expect(blur).toBeTruthy()
    expect(blur.getAttribute('stdDeviation')).toBeTruthy()
  })

  it('progress ring references filter', () => {
    const { container } = render(
      <DailyProgress
        entries={[{ calories: 1000, protein: 50, carbs: 100, fat: 30 }]}
        goals={{ calories: 2000 }}
      />
    )

    const fill = container.querySelector('.progress-ring-fill')
    expect(fill.getAttribute('filter')).toContain('url(#')
  })

  it('includes gradient definition', () => {
    const { container } = render(
      <DailyProgress entries={[]} goals={{ calories: 2000 }} />
    )

    const gradient = container.querySelector('linearGradient, radialGradient')
    expect(gradient).toBeTruthy()
  })
})
```

---

## Visual Test

```javascript
// e2e/frankenthaler.spec.js
test('progress ring has soft edges', async ({ page }) => {
  await page.goto('/')
  // Add entry to show progress
  await page.click('[data-testid="fab"]')
  await page.fill('[name="calories"]', '1000')
  await page.click('[type="submit"]')

  const ring = page.locator('.progress-ring-fill')
  await expect(ring).toHaveScreenshot('frankenthaler-ring.png')
})
```
