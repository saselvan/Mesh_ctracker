# Tests: Agnes Martin Spacing System

id: T-003
spec: S-003 (specs/03-agnes-martin-spacing.md)

---

## Functional Tests

### Scenario: Space tokens are defined

**Given:** The styles.css is loaded
**When:** I inspect :root CSS variables
**Then:** --space-1 equals 4px (0.25rem)
**And:** --space-2 equals 8px (0.5rem)
**And:** --space-3 equals 12px (0.75rem)
**And:** --space-4 equals 16px (1rem)
**And:** --space-6 equals 24px (1.5rem)
**And:** --space-8 equals 32px (2rem)
**And:** --space-12 equals 48px (3rem)

### Scenario: Components use space tokens

**Given:** The app is loaded
**When:** I inspect .entry-card padding
**Then:** padding uses var(--space-N) tokens
**And:** No hardcoded pixel values for spacing

### Scenario: Consistent vertical rhythm

**Given:** Multiple entry cards are displayed
**When:** I measure gaps between cards
**Then:** All gaps are multiples of 8px
**And:** Spacing feels rhythmic and consistent

### Scenario: Grid pattern overlay (optional)

**Given:** The .agnes-grid class is applied to body
**When:** I inspect the background
**Then:** Subtle grid lines visible at 0.03 opacity
**And:** Grid aligns to 8px intervals

---

## Edge Cases

### Scenario: No spacing collisions

**Given:** Multiple spacing rules apply to an element
**When:** Styles cascade
**Then:** No unexpected spacing additions
**And:** Margins don't collapse unexpectedly

### Scenario: Responsive spacing

**Given:** The viewport is mobile width (320px)
**When:** I inspect component spacing
**Then:** Spacing remains proportional
**And:** Touch targets maintain adequate size

---

## Audit Tests

### Scenario: No hardcoded spacing values

**Given:** I search styles.css for spacing patterns
**When:** I grep for "padding:|margin:|gap:" followed by px values
**Then:** Zero matches found (all use tokens)
**And:** Only var(--space-N) used for spacing

### Scenario: Consistent component spacing

**Given:** I audit DailyProgress.jsx styles
**When:** I check all spacing declarations
**Then:** All use --space-N tokens
**And:** Same audit passes for EntryList, EntryForm, Header

---

## Non-Functional Tests

### Performance

| Metric | Target | Test Method |
|--------|--------|-------------|
| CSS variable resolution | < 1ms | No perf impact from tokens |
| Grid overlay render | < 5ms | Optional feature |

### Accessibility

| Check | Tool | Pass Criteria |
|-------|------|---------------|
| Touch targets | Manual | All buttons ≥ 44px |
| Content spacing | Manual | Readable line spacing |

---

## Unit Test Implementation

```javascript
// src/__tests__/spacing.test.js
import { describe, it, expect } from 'vitest'

describe('Agnes Martin spacing system', () => {
  beforeEach(() => {
    // Load styles into JSDOM
  })

  it('defines all space tokens', () => {
    const root = document.documentElement
    const styles = getComputedStyle(root)

    expect(styles.getPropertyValue('--space-1').trim()).toBe('0.25rem')
    expect(styles.getPropertyValue('--space-2').trim()).toBe('0.5rem')
    expect(styles.getPropertyValue('--space-3').trim()).toBe('0.75rem')
    expect(styles.getPropertyValue('--space-4').trim()).toBe('1rem')
    expect(styles.getPropertyValue('--space-6').trim()).toBe('1.5rem')
    expect(styles.getPropertyValue('--space-8').trim()).toBe('2rem')
    expect(styles.getPropertyValue('--space-12').trim()).toBe('3rem')
  })

  it('space tokens follow 8px grid', () => {
    const root = document.documentElement
    const styles = getComputedStyle(root)

    // Convert rem to px (assuming 16px base)
    const space2 = parseFloat(styles.getPropertyValue('--space-2')) * 16
    const space4 = parseFloat(styles.getPropertyValue('--space-4')) * 16
    const space8 = parseFloat(styles.getPropertyValue('--space-8')) * 16

    expect(space2).toBe(8)
    expect(space4).toBe(16)
    expect(space8).toBe(32)
  })
})
```

---

## CSS Audit Script

```javascript
// scripts/audit-spacing.js
const fs = require('fs')
const css = fs.readFileSync('src/styles.css', 'utf8')

// Find hardcoded spacing
const hardcodedPattern = /(padding|margin|gap):\s*\d+px/g
const matches = css.match(hardcodedPattern)

if (matches && matches.length > 0) {
  console.error('Found hardcoded spacing values:')
  matches.forEach(m => console.error(`  - ${m}`))
  process.exit(1)
} else {
  console.log('✓ All spacing uses tokens')
}
```
