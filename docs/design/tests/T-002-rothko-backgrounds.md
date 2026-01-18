# Tests: Rothko Gradient Backgrounds

id: T-002
spec: S-002 (specs/02-rothko-backgrounds.md)

---

## Functional Tests

### Scenario: Progress card has gradient background

**Given:** The app is loaded
**When:** I inspect .progress-card element
**Then:** background-image contains "linear-gradient"
**And:** Gradient includes sage and cream color values
**And:** Gradient has soft transition (no hard edges)

### Scenario: Header has gradient background

**Given:** The app is loaded
**When:** I inspect .header element
**Then:** background-image contains "linear-gradient"
**And:** Gradient creates luminous depth effect

### Scenario: Gradient breathing animation exists

**Given:** The app is loaded
**When:** I inspect .progress-card computed styles
**Then:** animation property includes "gradient-breathe"
**And:** animation-duration is approximately 20s
**And:** animation-iteration-count is infinite

### Scenario: Gradients respect time of day

**Given:** The app is loaded at evening time
**When:** I inspect .progress-card background
**Then:** Gradient includes warmer evening tones
**And:** Colors shift toward golden/amber palette

---

## Visual Tests

### Scenario: No hard color bands visible

**Given:** The app is rendered
**When:** I visually inspect the progress card
**Then:** Color transitions appear smooth and continuous
**And:** No visible "banding" artifacts
**And:** Effect resembles Rothko color field painting

### Scenario: Layered gradient depth

**Given:** The app is rendered
**When:** I inspect the background visually
**Then:** Multiple gradient layers create depth
**And:** Colors appear to glow from within
**And:** Background doesn't compete with foreground content

---

## Edge Cases

### Scenario: High contrast mode compatibility

**Given:** User has prefers-contrast: more enabled
**When:** The app loads
**Then:** Gradients simplified or removed
**And:** Solid backgrounds used instead
**And:** Content remains readable

### Scenario: Print stylesheet

**Given:** User prints the page
**When:** Print preview renders
**Then:** Gradients don't print (saves ink)
**And:** Solid light background used

---

## Non-Functional Tests

### Performance

| Metric | Target | Test Method |
|--------|--------|-------------|
| Gradient paint time | < 16ms | Chrome DevTools Performance |
| Animation frame rate | 60fps | No jank during breathing |
| GPU memory | < 10MB | Chrome Task Manager |

### Accessibility

| Check | Tool | Pass Criteria |
|-------|------|---------------|
| Text over gradient | Manual | All text readable |
| Focus indicators | axe-core | Visible on gradient bg |

---

## CSS Test Implementation

```javascript
// src/__tests__/styles.test.js
import { describe, it, expect } from 'vitest'

describe('Rothko backgrounds', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div class="progress-card"></div>'
    // Load styles
  })

  it('progress-card has gradient background', () => {
    const card = document.querySelector('.progress-card')
    const styles = getComputedStyle(card)
    expect(styles.backgroundImage).toContain('gradient')
  })

  it('gradient animation is defined', () => {
    const card = document.querySelector('.progress-card')
    const styles = getComputedStyle(card)
    expect(styles.animationName).toBe('gradient-breathe')
    expect(styles.animationDuration).toBe('20s')
  })
})
```

---

## Visual Regression Test

```javascript
// Using Playwright or Cypress
describe('Rothko backgrounds visual', () => {
  it('progress card matches snapshot', async () => {
    await page.goto('/')
    const card = await page.$('.progress-card')
    expect(await card.screenshot()).toMatchSnapshot('rothko-progress-card.png')
  })
})
```
