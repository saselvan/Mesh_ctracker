# Tests: Accessibility & Inclusive Design

id: T-022
spec: S-022 (specs/22-accessibility.md)

---

## Color Contrast Tests

### Scenario: Text contrast meets WCAG AA

**Given:** Light mode active
**When:** I check --color-text on --color-background
**Then:** Contrast ratio ≥ 4.5:1

**Given:** Dark mode active
**When:** I check --color-text on --color-background
**Then:** Contrast ratio ≥ 4.5:1

### Scenario: UI elements have sufficient contrast

**Given:** App rendered
**When:** I check button backgrounds
**Then:** All buttons have 3:1 contrast minimum

---

## Keyboard Navigation Tests

### Scenario: Tab order is logical

**Given:** App loaded, focus at top
**When:** I press Tab repeatedly
**Then:** Focus moves: Header → Progress → Entries → FAB
**And:** Order matches visual layout

### Scenario: All interactive elements focusable

**Given:** App has entries
**When:** I Tab through entire app
**Then:** Every button, input, link receives focus
**And:** No focus traps (except modals)

### Scenario: Keyboard shortcuts work

**Given:** No input focused
**When:** I press "n"
**Then:** Entry form opens

**When:** I press ArrowLeft
**Then:** Previous day shown

**When:** I press Escape
**Then:** Any open modal closes

---

## Screen Reader Tests

### Scenario: Progress ring announced correctly

**Given:** Calories at 1500 of 2000
**When:** Screen reader reads progress ring
**Then:** Announces "Calorie progress: 1500 of 2000 calories"
**And:** Has role="progressbar"
**And:** aria-valuenow="75"

### Scenario: Entry list has proper structure

**Given:** 3 entries visible
**When:** Screen reader reads entry list
**Then:** Announces "Food entries for today, list, 3 items"
**And:** Each entry is a list item

### Scenario: Live region announces changes

**Given:** User adds entry "Coffee"
**When:** Entry saved
**Then:** Screen reader announces "Added Coffee, 50 calories"

---

## Focus Indicator Tests

### Scenario: Focus visible on all elements

**Given:** User navigating with keyboard
**When:** Element receives focus
**Then:** 2px outline visible
**And:** Outline color is --color-sage
**And:** Outline offset provides spacing

### Scenario: Focus trapped in modals

**Given:** Modal is open
**When:** User Tabs past last element
**Then:** Focus moves to first element in modal
**And:** Focus cannot escape to background

---

## Reduced Motion Tests

### Scenario: Animations disabled

**Given:** User prefers-reduced-motion
**When:** App loads with entries
**Then:** No stagger animation on cards
**And:** Numbers update instantly
**And:** Celebration dots static

---

## Automated Tests

```javascript
// src/__tests__/accessibility.test.js
import { axe, toHaveNoViolations } from 'jest-axe'
import { render } from '@testing-library/preact'
import { App } from '../components/App'

expect.extend(toHaveNoViolations)

describe('Accessibility', () => {
  it('has no axe violations', async () => {
    const { container } = render(<App />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

---

## Unit Tests

```javascript
// src/utils/__tests__/focus-trap.test.js
import { trapFocus } from '../focus-trap'

describe('trapFocus', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    container.innerHTML = `
      <button id="first">First</button>
      <input id="middle" />
      <button id="last">Last</button>
    `
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('focuses first element on init', () => {
    trapFocus(container)
    expect(document.activeElement.id).toBe('first')
  })

  it('wraps focus from last to first', () => {
    trapFocus(container)
    document.getElementById('last').focus()

    const event = new KeyboardEvent('keydown', { key: 'Tab' })
    container.dispatchEvent(event)

    expect(document.activeElement.id).toBe('first')
  })

  it('wraps focus from first to last with shift+tab', () => {
    trapFocus(container)
    document.getElementById('first').focus()

    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true })
    container.dispatchEvent(event)

    expect(document.activeElement.id).toBe('last')
  })
})
```

---

## Component Tests

```javascript
// src/components/__tests__/LiveRegion.test.jsx
import { render } from '@testing-library/preact'
import { LiveRegion } from '../LiveRegion'

describe('LiveRegion', () => {
  it('has correct ARIA attributes', () => {
    const { container } = render(<LiveRegion message="Test" />)
    const region = container.firstChild

    expect(region.getAttribute('role')).toBe('status')
    expect(region.getAttribute('aria-live')).toBe('polite')
    expect(region.getAttribute('aria-atomic')).toBe('true')
  })

  it('is visually hidden but accessible', () => {
    const { container } = render(<LiveRegion message="Test" />)
    expect(container.querySelector('.sr-only')).toBeTruthy()
  })

  it('contains message text', () => {
    const { getByText } = render(<LiveRegion message="Entry added" />)
    expect(getByText('Entry added')).toBeTruthy()
  })
})

// src/components/__tests__/SkipLinks.test.jsx
import { render, fireEvent } from '@testing-library/preact'
import { SkipLinks } from '../SkipLinks'

describe('SkipLinks', () => {
  it('renders skip to main content link', () => {
    const { getByText } = render(<SkipLinks />)
    expect(getByText('Skip to main content')).toBeTruthy()
  })

  it('links have correct hrefs', () => {
    const { container } = render(<SkipLinks />)
    const links = container.querySelectorAll('a')

    expect(links[0].getAttribute('href')).toBe('#main-content')
  })

  it('becomes visible on focus', () => {
    const { getByText } = render(<SkipLinks />)
    const link = getByText('Skip to main content')

    link.focus()

    const styles = getComputedStyle(link)
    expect(styles.top).not.toBe('-100%')
  })
})
```

---

## Touch Target Tests

```javascript
describe('Touch targets', () => {
  it('buttons are at least 44px', () => {
    const { container } = render(<App />)
    const buttons = container.querySelectorAll('button')

    buttons.forEach(btn => {
      const rect = btn.getBoundingClientRect()
      expect(rect.height).toBeGreaterThanOrEqual(44)
      expect(rect.width).toBeGreaterThanOrEqual(44)
    })
  })
})
```

---

## E2E Accessibility Tests

```javascript
// e2e/accessibility.spec.js
import { injectAxe, checkA11y } from 'axe-playwright'

test('home page is accessible', async ({ page }) => {
  await page.goto('/')
  await injectAxe(page)
  await checkA11y(page)
})

test('keyboard navigation works', async ({ page }) => {
  await page.goto('/')

  // Tab to FAB
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')

  const fab = page.locator('.fab')
  await expect(fab).toBeFocused()

  // Press Enter to open form
  await page.keyboard.press('Enter')
  await expect(page.locator('.entry-form')).toBeVisible()

  // Escape to close
  await page.keyboard.press('Escape')
  await expect(page.locator('.entry-form')).not.toBeVisible()
})

test('screen reader announces entry add', async ({ page }) => {
  await page.goto('/')
  // Add entry and verify live region updates
  // This requires screen reader testing tools
})
```
