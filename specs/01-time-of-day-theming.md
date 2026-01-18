# Spec: Time-of-Day Theming

**Phase:** 1 - Atmosphere & Perception
**Artist Influence:** James Turrell (Skyspaces, perceptual light shifts)
**Priority:** High
**Estimated Effort:** Medium

---

## Overview

Implement a time-of-day theming system inspired by James Turrell's light installations. The app should gradually shift its color perception throughout the day — not jarring mode switches, but subtle perceptual transitions that make morning feel warm and evening feel calm.

## Artist Context

James Turrell creates "Skyspaces" — rooms with apertures to the sky where viewers experience light changing over time. The key insight: **light affects how we feel**, not just what we see. Our app should embody this — the 7am experience should *feel* different from 7pm.

## Requirements

### Time Periods

> **Note:** Hour boundaries are EXCLUSIVE of the end time (standard programming convention).
> Example: "5:00 - 11:00" means 5:00am through 10:59am.

| Period | Hours (24h) | Human Readable | Emotional Goal | Color Shift |
|--------|-------------|----------------|----------------|-------------|
| Morning | 5 to <11 | 5:00am - 10:59am | Warm, energizing, fresh start | Warmer creams, peachy undertones |
| Midday | 11 to <16 | 11:00am - 3:59pm | Clear, focused, productive | Neutral, current palette |
| Evening | 16 to <20 | 4:00pm - 7:59pm | Calm, winding down | Cooler sage, softer contrast |
| Night | 20 to <5 | 8:00pm - 4:59am | Restful, low stimulation | Dark mode, muted colors |

### Implementation

1. **CSS Custom Properties:** All colors must use CSS variables that can be swapped
2. **Smooth Transitions:** Colors transition over ~30 minutes, not instant switches
3. **JavaScript Time Detection:** Check system time, apply appropriate theme class
4. **No User Toggle (yet):** Automatic only — manual override is Phase 6

### CSS Transitions for Gradual Color Shift

To achieve Turrell-like gradual transitions, add smooth CSS transitions:

```css
/* Smooth color transitions between themes */
body,
.progress-card,
.entry-card,
.header {
  transition:
    background-color 1800s linear,   /* 30 minutes for major elements */
    color 1800s linear,
    border-color 1800s linear;
}

/* Faster transitions for interactive elements */
.btn, .fab, .entry-form {
  transition:
    background-color 300ms ease,     /* Keep interactive feedback snappy */
    transform 200ms ease;
}
```

### CSS Variables to Create

```css
/* Morning overrides */
.theme-morning {
  --color-cream: #FDF8F3;      /* Warmer */
  --color-sage: #6B7A62;       /* Slightly warmer green */
  --color-terracotta: #D4896B; /* More peachy */
}

/* Evening overrides */
.theme-evening {
  --color-cream: #F5F5F0;      /* Cooler */
  --color-sage: #5A6B58;       /* Cooler green */
  --color-terracotta: #B8776A; /* Muted coral */
}

/* Night overrides */
.theme-night {
  --color-cream: #1A1A1A;      /* Dark background */
  --color-white: #242424;      /* Dark surface */
  --color-sage: #8A9A82;       /* Lighter for contrast */
  --color-espresso: #E8E8E8;   /* Light text */
  /* ... full dark mode palette */
}
```

### JavaScript Logic

```javascript
// src/utils/theme.js
export function getTimeOfDay() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 16) return 'midday'
  if (hour >= 16 && hour < 20) return 'evening'
  return 'night'
}

export function applyTheme() {
  const period = getTimeOfDay()
  document.body.className = `theme-${period}`
}

// Call on app load and every 15 minutes
```

### App.jsx Integration

```javascript
import { useEffect } from 'preact/hooks'
import { applyTheme } from '../utils/theme'

export function App() {
  useEffect(() => {
    applyTheme()
    const interval = setInterval(applyTheme, 15 * 60 * 1000) // Check every 15min
    return () => clearInterval(interval)
  }, [])

  // ... rest of component
}
```

## Acceptance Criteria

- [ ] App detects current time and applies appropriate theme class
- [ ] Morning (5-11am) has warmer, peachy undertones
- [ ] Midday (11am-4pm) uses default palette
- [ ] Evening (4-8pm) has cooler, calmer tones
- [ ] Night (8pm-5am) activates full dark mode
- [ ] Theme checks every 15 minutes for gradual transitions
- [ ] All existing UI elements work correctly in all themes
- [ ] Contrast ratios maintain accessibility (4.5:1 minimum)

## Files to Modify

- `src/styles.css` — Add theme variant classes
- `src/utils/theme.js` — Create (new file)
- `src/components/App.jsx` — Add theme effect

## Test Plan

1. Manually set system time to 7am — verify morning theme
2. Set time to 2pm — verify midday theme
3. Set time to 6pm — verify evening theme
4. Set time to 10pm — verify night theme
5. Run Lighthouse accessibility check on all themes

## Edge Cases

| Edge Case | Behavior |
|-----------|----------|
| User's system time is wrong | Use system time as-is. No network time lookup (works offline). |
| User crosses midnight while using app | Theme will update on next 15-minute check. No jarring switch. |
| Timezone travel | Uses device's current timezone. Theme follows local time. |
| App opened at exact boundary (e.g., 11:00:00) | Follows code logic: 11:00 = midday, not morning |
| Device clock changes mid-session | Next applyTheme() call will catch up |

## Notes

- Night mode is critical for family use (checking before bed)
- Turrell's work emphasizes gradual perception shifts — avoid jarring changes
- Future: Add sunrise/sunset API for location-aware timing
