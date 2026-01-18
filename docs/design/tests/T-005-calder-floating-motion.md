# Tests: Calder Floating Motion

id: T-005
spec: S-005 (specs/05-calder-floating-motion.md)

---

## Functional Tests

### Scenario: Header elements have floating animation

**Given:** The app is loaded
**When:** I inspect header elements
**Then:** animation property includes "gentle-float"
**And:** Animation is running (not paused)
**And:** Different elements have different animation-delay

### Scenario: FAB has floating animation

**Given:** The app is loaded
**When:** I inspect .fab element
**Then:** animation property includes floating animation
**And:** Animation creates subtle bobbing effect

### Scenario: Animation uses proper easing

**Given:** I inspect the @keyframes gentle-float
**When:** I check the animation-timing-function
**Then:** Uses cubic-bezier(0.4, 0, 0.2, 1) or similar ease-in-out
**And:** Motion feels organic, not mechanical

### Scenario: Elements have staggered delays

**Given:** Multiple header elements are animated
**When:** I compare their animation-delay values
**Then:** Each element has unique delay
**And:** Creates mobile-like weighted movement

---

## Edge Cases

### Scenario: Reduced motion disables animation

**Given:** User has prefers-reduced-motion: reduce enabled
**When:** The app loads
**Then:** animation property is "none" or duration is 0.01ms
**And:** Elements remain static
**And:** No motion-related accessibility issues

### Scenario: Animation doesn't cause layout shift

**Given:** The app is loaded with animations
**When:** I monitor Cumulative Layout Shift (CLS)
**Then:** CLS remains 0
**And:** Transform-only animations (no width/height changes)

### Scenario: Animation persists across re-renders

**Given:** An entry is added
**When:** The app re-renders
**Then:** Floating animations continue smoothly
**And:** No animation restart or jank

---

## Non-Functional Tests

### Performance

| Metric | Target | Test Method |
|--------|--------|-------------|
| Animation frame rate | 60fps | Chrome DevTools |
| CPU usage during animation | < 5% | Activity Monitor |
| No forced reflows | 0 | Performance panel |
| Uses compositor | Yes | Layers panel (transform-only) |

### Accessibility

| Check | Tool | Pass Criteria |
|-------|------|---------------|
| Reduced motion respected | Manual | No animation with setting |
| No vestibular triggers | Manual | Subtle motion only |
| Focus not affected | Manual | Focus visible during animation |

---

## Unit Test Implementation

```javascript
// src/__tests__/calder-motion.test.js
import { describe, it, expect, beforeEach } from 'vitest'

describe('Calder floating motion', () => {
  beforeEach(() => {
    // Load styles
    document.body.innerHTML = `
      <header class="header">
        <div class="header-element"></div>
      </header>
      <button class="fab">+</button>
    `
  })

  it('defines gentle-float keyframes', () => {
    const styleSheets = document.styleSheets
    let hasKeyframes = false

    for (const sheet of styleSheets) {
      for (const rule of sheet.cssRules) {
        if (rule.type === CSSRule.KEYFRAMES_RULE &&
            rule.name === 'gentle-float') {
          hasKeyframes = true
        }
      }
    }

    expect(hasKeyframes).toBe(true)
  })

  it('header elements have animation', () => {
    const element = document.querySelector('.header-element')
    const styles = getComputedStyle(element)
    expect(styles.animationName).toContain('float')
  })

  it('fab has animation', () => {
    const fab = document.querySelector('.fab')
    const styles = getComputedStyle(fab)
    expect(styles.animationName).toContain('float')
  })
})
```

---

## Reduced Motion Test

```javascript
// src/__tests__/calder-reduced-motion.test.js
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('Calder motion with reduced-motion', () => {
  beforeEach(() => {
    // Mock matchMedia for reduced motion
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  })

  it('disables animation when reduced motion preferred', () => {
    // This would need CSS media query testing
    // In real implementation, check computed styles
    const fab = document.querySelector('.fab')
    const styles = getComputedStyle(fab)

    // Animation should be none or minimal
    expect(
      styles.animationName === 'none' ||
      styles.animationDuration === '0.01ms'
    ).toBe(true)
  })
})
```

---

## Visual Regression Test

```javascript
// e2e/calder-motion.spec.js
test('floating animation is smooth', async ({ page }) => {
  await page.goto('/')

  // Record animation frames
  const frames = []
  for (let i = 0; i < 60; i++) {
    const fab = await page.locator('.fab')
    const box = await fab.boundingBox()
    frames.push(box.y)
    await page.waitForTimeout(16) // ~60fps
  }

  // Check for smooth transitions (no sudden jumps)
  for (let i = 1; i < frames.length; i++) {
    const delta = Math.abs(frames[i] - frames[i-1])
    expect(delta).toBeLessThan(5) // Max 5px change per frame
  }
})
```
