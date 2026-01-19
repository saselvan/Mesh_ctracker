# Spec: Dark Mode Theme

**Phase:** 6 - Polish & Accessibility
**Artist Influence:** Yayoi Kusama (infinity rooms, neon against darkness)
**Priority:** Medium
**Estimated Effort:** Medium

---

## Overview

Implement a dark mode theme inspired by Yayoi Kusama's infinity rooms—bold, unapologetic contrast with electric neon accents against true black voids. Unlike generic dark modes that simply invert colors, this theme should feel dramatic and intentional, with colors that POP rather than fade.

> **Note:** This spec aligns with the Night theme (Kusama) from S-001 Time-of-Day Theming.
> When user selects "Dark" mode manually, it applies the same Kusama palette as the automatic night theme.

## Requirements

### Color Palette — Kusama Dark Mode

```css
/* NIGHT — Yayoi Kusama
   Infinity rooms, bold dots in darkness, high drama
   Bold, infinite, unapologetic contrast */
.theme-night {
  /* Backgrounds — true black, infinity room voids */
  --color-cream: #0D0D0D;             /* True black background */
  --color-white: #1A1A1A;             /* Deep charcoal surfaces */

  /* Primary — Electric neon sage (like her neon installations) */
  --color-sage: #9FFFB0;              /* Electric sage — POPS */
  --color-sage-light: #B8FFC8;
  --color-sage-pale: #1A2A1E;         /* Dark sage surface */
  --color-sage-faint: #0F1A12;

  /* Accent — Hot coral (Kusama's vivid red dots) */
  --color-terracotta: #FF7A5C;        /* Hot coral — vivid */
  --color-terracotta-light: #FF9A80;
  --color-terracotta-pale: #2A1A18;

  /* Text — Pure white for maximum contrast */
  --color-espresso: #FFFFFF;          /* Pure white text */
  --color-warm-gray: #E0E0E0;
  --color-muted: #A0A0A0;

  /* Semantic colors — neon variants */
  --color-success: #9FFFB0;           /* Electric sage */
  --color-warning: #FFB080;           /* Warm coral */

  /* Macro colors — visible against black */
  --color-protein: #C4B4A0;
  --color-carbs: #E8D090;
  --color-fat: #D4A488;

  /* Shadows — subtle glow effects */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.5);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.6);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.7);
  --shadow-glow: 0 0 20px rgba(159, 255, 176, 0.15);
}
```

### Design Philosophy

Unlike traditional dark modes that simply desaturate and invert:

| Generic Dark Mode | Kusama-Inspired |
|-------------------|-----------------|
| Dark gray backgrounds | True black (#0D0D0D) |
| Muted, desaturated colors | Electric neon accents |
| Reduced contrast | High contrast, bold |
| Colors fade into darkness | Colors POP against void |

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

### Kusama-Inspired Dark Effects

```css
/* Infinity room ambient gradients */
body.theme-night::before {
  background: radial-gradient(
    ellipse at 25% 25%,
    rgba(159, 255, 176, 0.08) 0%,    /* Electric sage glow */
    transparent 45%
  );
}

body.theme-night::after {
  background: radial-gradient(
    ellipse at 75% 75%,
    rgba(255, 122, 92, 0.08) 0%,     /* Hot coral glow */
    transparent 45%
  );
}

/* Neon glow effects on interactive elements */
.theme-night .progress-ring-fill {
  filter: drop-shadow(0 0 12px currentColor);
}

.theme-night .btn--primary {
  box-shadow: 0 0 20px rgba(159, 255, 176, 0.3);
}

.theme-night .streak-dot {
  box-shadow: 0 0 8px var(--color-terracotta);
}

/* Kusama dots should POP, not fade */
.theme-night .kusama-dot {
  box-shadow: 0 0 16px currentColor;
}
```

### Time-of-Day + Dark Mode

Combine with artist-inspired time theming from S-001:

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

### Celebration Colors in Dark Mode (Kusama)

```css
.theme-night {
  /* Celebration dots glow brightly — Kusama's vivid dots */
  --celebration-terracotta: #FF7A5C;  /* Hot coral */
  --celebration-sage: #9FFFB0;        /* Electric sage */
  --celebration-gold: #FFD080;        /* Warm gold */
}

.theme-night .kusama-dot {
  box-shadow: 0 0 16px currentColor;  /* Strong neon glow */
  animation: kusama-pulse 2s ease-in-out infinite;
}

@keyframes kusama-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.9; }
}

.theme-night .celebration-message {
  text-shadow: 0 0 30px rgba(159, 255, 176, 0.3);
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
