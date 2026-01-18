# Spec: Dark Mode Theme

**Phase:** 6 - Polish & Accessibility
**Artist Influence:** Rothko (luminous darks, color relationships)
**Priority:** Medium
**Estimated Effort:** Medium

---

## Overview

Implement a dark mode theme that maintains the Warm Wellness aesthetic. Dark mode should feel cozy and restful, not cold and stark. Inspired by Rothko's dark period paintings where colors glow from within darkness.

## Requirements

### Color Palette — Dark Mode

```css
:root[data-theme="dark"] {
  /* Backgrounds — warm darks, not pure black */
  --color-background: #1A1917;        /* Warm charcoal */
  --color-surface: #252422;           /* Elevated surface */
  --color-surface-raised: #2D2B28;    /* Cards, modals */

  /* Cream becomes muted warm */
  --color-cream: #1A1917;

  /* Sage adjusts for dark background */
  --color-sage: #8BA382;              /* Lightened for contrast */
  --color-sage-light: #6B7D64;
  --color-sage-pale: #2A2F28;         /* Very dark sage */

  /* Terracotta glows in dark */
  --color-terracotta: #D4896E;        /* Lightened */
  --color-terracotta-light: #C17B5F;

  /* Text hierarchy */
  --color-text: #F5F2ED;              /* Warm white */
  --color-text-secondary: #A8A299;    /* Muted */
  --color-muted: #7A756D;

  /* Borders and dividers */
  --color-border: #3D3A36;
  --color-divider: #2D2B28;

  /* Macro colors — slightly desaturated for dark mode */
  --color-protein: #A89580;
  --color-carbs: #D4BC70;
  --color-fat: #C09E8F;

  /* Shadows — more subtle in dark mode */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
}
```

### Theme Toggle

```javascript
// src/utils/theme.js
export function getThemePreference() {
  // Check localStorage first
  const stored = localStorage.getItem('theme')
  if (stored) return stored

  // Fall back to system preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

export function toggleTheme() {
  const current = getThemePreference()
  const next = current === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}

// Initialize on page load
export function initTheme() {
  const theme = getThemePreference()
  setTheme(theme)

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    })
}
```

### Theme Toggle Component

```jsx
// src/components/ThemeToggle.jsx
import { useState, useEffect } from 'preact/hooks'
import { getThemePreference, toggleTheme } from '../utils/theme'

export function ThemeToggle() {
  const [theme, setTheme] = useState(getThemePreference())

  const handleToggle = () => {
    const newTheme = toggleTheme()
    setTheme(newTheme)
  }

  return (
    <button
      class="theme-toggle"
      onClick={handleToggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span class="theme-toggle-icon">
        {theme === 'dark' ? '☀️' : '🌙'}
      </span>
    </button>
  )
}
```

### CSS for Theme Toggle

```css
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background 200ms ease, transform 200ms ease;
}

.theme-toggle:hover {
  background: var(--color-sage-pale);
}

.theme-toggle:active {
  transform: scale(0.95);
}

.theme-toggle-icon {
  font-size: 1.25rem;
  transition: transform 300ms ease;
}

.theme-toggle:hover .theme-toggle-icon {
  transform: rotate(15deg);
}
```

### Rothko-Inspired Dark Backgrounds

```css
/* Dark mode gradient backgrounds */
:root[data-theme="dark"] .progress-card {
  background: linear-gradient(
    180deg,
    #252422 0%,
    #1E1D1B 100%
  );
}

:root[data-theme="dark"] .header {
  background: linear-gradient(
    180deg,
    #1A1917 0%,
    rgba(26, 25, 23, 0.95) 100%
  );
}

/* Rothko glow effect on rings */
:root[data-theme="dark"] .progress-ring-fill {
  filter: drop-shadow(0 0 8px currentColor);
}

:root[data-theme="dark"] .streak-dot {
  box-shadow: 0 0 6px var(--color-terracotta);
}
```

### Time-of-Day + Dark Mode

Combine with Turrell-inspired time theming from S-001:

> **Note:** Time boundaries must align with S-001 (Time-of-Day Theming).
> Use `getTimeOfDay()` from S-001 for consistency.

```javascript
// In theme.js
import { getTimeOfDay } from '../utils/theme'  // From S-001

export function getActiveTheme() {
  const base = getThemePreference()

  if (base === 'dark') {
    return 'dark'
  }

  // Light mode shifts with time of day (aligned with S-001 boundaries)
  // Morning: 5-11, Midday: 11-16, Evening: 16-20, Night: 20-5
  const timeOfDay = getTimeOfDay()
  return `light-${timeOfDay}`
}
```

### Settings Integration

```jsx
// In Settings.jsx
function ThemeSettings() {
  const [theme, setThemeState] = useState(getThemePreference())

  const handleChange = (newTheme) => {
    setTheme(newTheme)
    setThemeState(newTheme)
  }

  return (
    <div class="settings-section">
      <h3>Appearance</h3>
      <div class="theme-options">
        <button
          class={`theme-option ${theme === 'light' ? 'active' : ''}`}
          onClick={() => handleChange('light')}
        >
          <span class="theme-option-icon">☀️</span>
          <span class="theme-option-label">Light</span>
        </button>
        <button
          class={`theme-option ${theme === 'dark' ? 'active' : ''}`}
          onClick={() => handleChange('dark')}
        >
          <span class="theme-option-icon">🌙</span>
          <span class="theme-option-label">Dark</span>
        </button>
        <button
          class={`theme-option ${theme === 'auto' ? 'active' : ''}`}
          onClick={() => handleChange('auto')}
        >
          <span class="theme-option-icon">⚙️</span>
          <span class="theme-option-label">Auto</span>
        </button>
      </div>
    </div>
  )
}
```

### Celebration Colors in Dark Mode

```css
:root[data-theme="dark"] {
  /* Celebration dots glow more in dark */
  --celebration-terracotta: #E5957A;
  --celebration-sage: #9DB894;
  --celebration-gold: #E5C86A;
}

:root[data-theme="dark"] .kusama-dot {
  box-shadow: 0 0 12px currentColor;
}

:root[data-theme="dark"] .celebration-message {
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
}
```

## Acceptance Criteria

- [ ] Dark mode toggle in settings
- [ ] Theme persists across sessions
- [ ] Respects system preference by default
- [ ] "Auto" mode follows system
- [ ] All text meets WCAG contrast in both modes
- [ ] Progress rings visible in dark mode
- [ ] Charts/graphs readable in dark mode
- [ ] Celebration effects work in dark mode
- [ ] Smooth transition between modes
- [ ] No flash of wrong theme on load

## Files to Create/Modify

- `src/utils/theme.js` — Create
- `src/components/ThemeToggle.jsx` — Create
- `src/components/Settings.jsx` — Add theme section
- `src/styles.css` — Dark mode variables
- `src/index.jsx` — Initialize theme on load

## Test Plan

1. Default with no preference → follows system?
2. Toggle to dark → persists on reload?
3. Change system preference → updates if "auto"?
4. All text readable in dark mode?
5. Progress rings visible?
6. Celebration dots glow nicely?
7. No FOUC (flash of unstyled content)?
