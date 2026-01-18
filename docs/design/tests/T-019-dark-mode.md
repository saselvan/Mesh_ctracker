# Tests: Dark Mode Theme

id: T-019
spec: S-019 (specs/19-dark-mode.md)

---

## Functional Tests

### Scenario: Theme toggle switches mode

**Given:** App is in light mode
**When:** User clicks theme toggle
**Then:** data-theme="dark" set on documentElement
**And:** All colors update to dark palette

### Scenario: Theme persists across sessions

**Given:** User selected dark mode
**When:** Page is refreshed
**Then:** App loads in dark mode
**And:** No flash of light mode

### Scenario: System preference respected

**Given:** No theme preference saved
**And:** System prefers dark mode
**When:** App loads
**Then:** Dark mode applied

### Scenario: Auto mode follows system

**Given:** Theme set to "auto"
**When:** System preference changes light→dark
**Then:** App switches to dark mode

### Scenario: Light mode with time-of-day (aligned with S-001)

**Given:** Theme is "light" (not "dark")
**When:** getActiveTheme() is called at 8am
**Then:** Returns "light-morning" (uses getTimeOfDay from S-001)

**Given:** Theme is "light"
**When:** getActiveTheme() is called at 2pm
**Then:** Returns "light-midday"

**Given:** Theme is "light"
**When:** getActiveTheme() is called at 6pm
**Then:** Returns "light-evening"

**Given:** Theme is "light"
**When:** getActiveTheme() is called at 10pm
**Then:** Returns "light-night"

**Given:** Theme is "dark"
**When:** getActiveTheme() is called at any time
**Then:** Returns "dark" (ignores time-of-day)

---

## Color Contrast Tests

### Scenario: Text contrast in dark mode

**Given:** Dark mode active
**When:** I check text contrast
**Then:** --color-text on --color-background ≥ 4.5:1
**And:** --color-text-secondary on --color-background ≥ 4.5:1

### Scenario: Interactive elements visible

**Given:** Dark mode active
**When:** I inspect progress rings
**Then:** Rings visible against dark background
**And:** Glow effect enhances visibility

---

## Unit Tests

```javascript
// src/utils/__tests__/theme.test.js
import { getThemePreference, setTheme, toggleTheme, initTheme } from '../theme'

describe('theme utilities', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  describe('getThemePreference', () => {
    it('returns stored theme', () => {
      localStorage.setItem('theme', 'dark')
      expect(getThemePreference()).toBe('dark')
    })

    it('falls back to system preference', () => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: true })
      expect(getThemePreference()).toBe('dark')
    })

    it('defaults to light', () => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: false })
      expect(getThemePreference()).toBe('light')
    })
  })

  describe('setTheme', () => {
    it('sets data-theme attribute', () => {
      setTheme('dark')
      expect(document.documentElement.dataset.theme).toBe('dark')
    })

    it('saves to localStorage', () => {
      setTheme('dark')
      expect(localStorage.getItem('theme')).toBe('dark')
    })
  })

  describe('toggleTheme', () => {
    it('toggles light to dark', () => {
      localStorage.setItem('theme', 'light')
      const result = toggleTheme()
      expect(result).toBe('dark')
      expect(document.documentElement.dataset.theme).toBe('dark')
    })

    it('toggles dark to light', () => {
      localStorage.setItem('theme', 'dark')
      const result = toggleTheme()
      expect(result).toBe('light')
    })
  })

  describe('getActiveTheme (aligned with S-001)', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns dark when preference is dark', () => {
      localStorage.setItem('theme', 'dark')
      vi.setSystemTime(new Date(2025, 0, 17, 8, 0)) // 8am
      expect(getActiveTheme()).toBe('dark')
    })

    it('returns light-morning at 8am when light mode', () => {
      localStorage.setItem('theme', 'light')
      vi.setSystemTime(new Date(2025, 0, 17, 8, 0))
      expect(getActiveTheme()).toBe('light-morning')
    })

    it('returns light-midday at 2pm when light mode', () => {
      localStorage.setItem('theme', 'light')
      vi.setSystemTime(new Date(2025, 0, 17, 14, 0))
      expect(getActiveTheme()).toBe('light-midday')
    })

    it('returns light-evening at 6pm when light mode', () => {
      localStorage.setItem('theme', 'light')
      vi.setSystemTime(new Date(2025, 0, 17, 18, 0))
      expect(getActiveTheme()).toBe('light-evening')
    })

    it('returns light-night at 10pm when light mode', () => {
      localStorage.setItem('theme', 'light')
      vi.setSystemTime(new Date(2025, 0, 17, 22, 0))
      expect(getActiveTheme()).toBe('light-night')
    })

    // Boundary tests aligned with S-001
    it('uses S-001 boundaries: 5am is morning', () => {
      localStorage.setItem('theme', 'light')
      vi.setSystemTime(new Date(2025, 0, 17, 5, 0))
      expect(getActiveTheme()).toBe('light-morning')
    })

    it('uses S-001 boundaries: 11am is midday', () => {
      localStorage.setItem('theme', 'light')
      vi.setSystemTime(new Date(2025, 0, 17, 11, 0))
      expect(getActiveTheme()).toBe('light-midday')
    })

    it('uses S-001 boundaries: 16 (4pm) is evening', () => {
      localStorage.setItem('theme', 'light')
      vi.setSystemTime(new Date(2025, 0, 17, 16, 0))
      expect(getActiveTheme()).toBe('light-evening')
    })

    it('uses S-001 boundaries: 20 (8pm) is night', () => {
      localStorage.setItem('theme', 'light')
      vi.setSystemTime(new Date(2025, 0, 17, 20, 0))
      expect(getActiveTheme()).toBe('light-night')
    })
  })
})
```

---

## Component Tests

```javascript
// src/components/__tests__/ThemeToggle.test.jsx
import { render, fireEvent } from '@testing-library/preact'
import { ThemeToggle } from '../ThemeToggle'

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('shows sun icon in dark mode', () => {
    localStorage.setItem('theme', 'dark')
    const { getByText } = render(<ThemeToggle />)
    expect(getByText('☀️')).toBeTruthy()
  })

  it('shows moon icon in light mode', () => {
    localStorage.setItem('theme', 'light')
    const { getByText } = render(<ThemeToggle />)
    expect(getByText('🌙')).toBeTruthy()
  })

  it('toggles theme on click', () => {
    localStorage.setItem('theme', 'light')
    const { getByRole } = render(<ThemeToggle />)
    fireEvent.click(getByRole('button'))
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('has accessible label', () => {
    localStorage.setItem('theme', 'light')
    const { getByRole } = render(<ThemeToggle />)
    expect(getByRole('button').getAttribute('aria-label')).toContain('dark')
  })
})
```

---

## CSS Tests

```javascript
// src/__tests__/dark-mode-css.test.js
describe('Dark mode CSS', () => {
  beforeEach(() => {
    document.documentElement.dataset.theme = 'dark'
    // Load styles
  })

  it('defines dark mode variables', () => {
    const root = document.documentElement
    const styles = getComputedStyle(root)

    expect(styles.getPropertyValue('--color-background').trim()).toBe('#1A1917')
    expect(styles.getPropertyValue('--color-text').trim()).toBe('#F5F2ED')
  })

  it('uses warm darks not pure black', () => {
    const root = document.documentElement
    const styles = getComputedStyle(root)
    const bg = styles.getPropertyValue('--color-background').trim()

    // #1A1917 is warm charcoal, not #000000
    expect(bg).not.toBe('#000000')
    expect(bg).not.toBe('black')
  })
})
```

---

## Visual Regression Test

```javascript
// e2e/dark-mode.spec.js
test('dark mode renders correctly', async ({ page }) => {
  await page.goto('/')
  await page.click('[aria-label*="dark"]')

  await expect(page).toHaveScreenshot('dark-mode-full.png')
})

test('progress card in dark mode', async ({ page }) => {
  await page.goto('/')
  await page.click('[aria-label*="dark"]')

  const card = page.locator('.progress-card')
  await expect(card).toHaveScreenshot('dark-mode-progress-card.png')
})
```
