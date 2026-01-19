# Spec: Time-of-Day Theming

**Phase:** 1 - Atmosphere & Perception
**Artist Influence:** Multi-artist palette system (Hockney, Calder, Rothko, Kusama)
**Priority:** High
**Estimated Effort:** Medium

---

## Overview

Implement a time-of-day theming system where each period has a distinct artistic personality—not just mechanical color shifts, but intentional palettes inspired by specific artists. Each time period should evoke a different emotional experience through carefully curated color relationships.

## Artist Context

Rather than generic "warm/cool/dark" shifts, each time period draws from a specific artist's visual language:

| Period | Artist | Era/Style | Emotional Goal |
|--------|--------|-----------|----------------|
| Morning | **David Hockney** | "A Bigger Splash" — crystalline California light | Fresh, optimistic, energizing but gentle |
| Midday | **Alexander Calder** | Bold mobiles — primary confidence | Peak productivity, balanced, confident |
| Evening | **Mark Rothko** | Color field paintings — contemplative warmth | Winding down, reflective, warm embrace |
| Night | **Yayoi Kusama** | Infinity rooms — bold dots in darkness | Bold, infinite, unapologetic contrast |

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

### CSS Variables — Artist-Inspired Palettes

```css
/* MORNING — David Hockney
   "A Bigger Splash" LA pool series — vivid California light
   Crisp, energizing, makes you want to dive in */
.theme-morning {
  --color-cream: #F0F9FF;           /* Light sky blue — California morning */
  --color-white: #F8FDFF;           /* Cyan-tinted card — poolside feel */
  --color-sage: #00B4D8;            /* Vivid pool cyan — iconic Hockney blue */
  --color-sage-light: #48CAE4;
  --color-sage-pale: #CAF0F8;
  --color-sage-faint: #E8F8FB;
  --color-terracotta: #E07A5F;      /* Bold terracotta pink — poolside tiles */
  --color-terracotta-light: #F2A490;
  --color-terracotta-pale: #FCE8E4;
  --color-espresso: #2B2D42;        /* Cool confident dark */
  /* Macro rings — Hockney's poolside palette */
  --color-protein: #E07A5F;         /* Terracotta tiles */
  --color-carbs: #F4A261;           /* Warm California orange */
  --color-fat: #00B4D8;             /* Pool water cyan */
}

/* MIDDAY — Alexander Calder
   Bold mobiles — primary colors, playful confidence
   Peak energy, bold contrasts, decisive action */
.theme-midday {
  --color-cream: #FFFDF5;           /* Warm gallery white — sunlit museum */
  --color-white: #FFFEF8;           /* Warm white card — gallery paper */
  --color-sage: #E63946;            /* Calder RED — his signature bold */
  --color-sage-light: #F25C69;
  --color-sage-pale: #FCECED;
  --color-sage-faint: #FEF5F5;
  --color-terracotta: #1D3557;      /* Deep blue — mobile contrast */
  --color-terracotta-light: #457B9D;
  --color-terracotta-pale: #E8EEF4;
  --color-espresso: #1A1A1A;        /* True black — wire frames */
  --color-warning: #FFB703;         /* Calder yellow — bold sunshine */
  /* Macro rings — Calder's primary colors */
  --color-protein: #1D3557;         /* Deep blue */
  --color-carbs: #FFB703;           /* Signature yellow */
  --color-fat: #E63946;             /* Calder red */
}

/* EVENING — Mark Rothko
   Color field paintings, contemplative warmth, settling
   Hazy amber glow, diffused edges */
.theme-evening {
  --color-cream: #F0E8DC;           /* Deeper warm — like aged paper */
  --color-white: #FAF5EE;
  --color-sage: #5A5545;            /* Burnt umber sage — brown undertone */
  --color-sage-light: #7A7565;
  --color-sage-pale: #DDD8CC;
  --color-sage-faint: #EBE8E0;
  --color-terracotta: #CA724A;      /* Deep orange-amber — Rothko's oranges */
  --color-terracotta-light: #D99070;
  --color-terracotta-pale: #F0E0D4;
  --color-espresso: #352F28;        /* Deep espresso */
  /* Macro rings — Rothko's warm color fields */
  --color-protein: #8B4513;         /* Sienna brown */
  --color-carbs: #CA724A;           /* Rothko orange */
  --color-fat: #DAA520;             /* Goldenrod amber */
}

/* NIGHT — Yayoi Kusama
   Infinity rooms, bold dots in darkness, high drama
   Neon accents against infinite void — VIVID */
.theme-night {
  --color-cream: #0D0D0D;           /* True black — infinity room voids */
  --color-white: #1A1A1A;           /* Deep charcoal — surfaces */
  --color-sage: #9FFFB0;            /* Electric sage — neon installations */
  --color-sage-light: #B8FFC8;
  --color-sage-pale: #1A2A1E;
  --color-sage-faint: #0F1A12;
  --color-terracotta: #FF1744;      /* HOT RED — Kusama's polka dots */
  --color-terracotta-light: #FF5252;
  --color-terracotta-pale: #2A1A18;
  --color-espresso: #FFFFFF;        /* Pure white — text */
  /* Macro rings — Kusama's infinity room neons, VIVID */
  --color-protein: #FF3366;         /* Hot magenta-pink — polka dot rooms */
  --color-carbs: #FFFF00;           /* Pure neon yellow — pumpkin installations */
  --color-fat: #00FF88;             /* Electric neon green — infinity mirrors */
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
- [ ] Morning (5-11am): Hockney palette — vivid pool cyan (#00B4D8), bold terracotta (#E07A5F), light sky blue bg (#F0F9FF)
- [ ] Midday (11am-4pm): Calder palette — signature red (#E63946), bold yellow (#FFB703), deep blue (#1D3557), warm gallery white (#FFFDF5)
- [ ] Evening (4-8pm): Rothko palette — burnt umber (#5A5545), deep orange-amber (#CA724A), aged paper (#F0E8DC)
- [ ] Night (8pm-5am): Kusama palette — electric sage (#9FFFB0), HOT RED (#FF1744), true black (#0D0D0D), neon macros (#FF3366, #FFFF00, #00FF88)
- [ ] Each theme has artist-appropriate ambient gradients
- [ ] **Macro ring colors align with each artist's palette** — every element reinforces the artistic world
- [ ] **Gradual hourly transitions** — colors interpolate smoothly between themes (last 40% of each period blends to next)
- [ ] All existing UI elements work correctly in all themes
- [ ] Contrast ratios maintain accessibility (4.5:1 minimum)

## Gradual Transition System

Instead of abrupt switches at theme boundaries, colors interpolate based on exact time:

```javascript
// Last 40% of each period blends into the next theme
// Example: At 10am (83% through morning), colors blend toward midday

function getThemeBlend() {
  const progressInPeriod = (currentHour - periodStart) / periodLength
  if (progressInPeriod > 0.6) {
    blendFactor = (progressInPeriod - 0.6) / 0.4  // 0 to 1
  }
  return interpolateColors(currentPalette, nextPalette, blendFactor)
}
```

This creates smooth hourly shifts rather than jarring theme switches.

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

- Night mode (Kusama) is critical for family use (checking before bed)
- Each artist's palette should feel intentional, not just color-shifted
- The progression tells a story: optimism (Hockney) → confidence (Calder) → reflection (Rothko) → drama (Kusama)
- Future: Add sunrise/sunset API for location-aware timing

## Artist Reference

| Theme | Artist | Key Visual Elements | Macro Ring Colors |
|-------|--------|---------------------|-------------------|
| Morning | David Hockney | Pool cyan (#00B4D8), terracotta tiles, light sky blue bg | Terracotta/Orange/Cyan |
| Midday | Alexander Calder | Signature red (#E63946), bold yellow (#FFB703), deep blue | Blue/Yellow/Red |
| Evening | Mark Rothko | Burnt umber, orange-amber (#CA724A), warm aged paper | Sienna/Orange/Gold |
| Night | Yayoi Kusama | Electric sage (#9FFFB0), HOT RED (#FF1744), true black void | Magenta/Neon Yellow/Neon Green |

## Macro Ring Philosophy

Each artist's world extends to the macro tracking rings (protein, carbs, fat):

- **Hockney Morning**: Poolside palette — terracotta tiles, California orange, pool water cyan
- **Calder Midday**: Primary mobiles — deep blue, signature yellow, Calder red
- **Rothko Evening**: Color fields — sienna brown, Rothko orange, goldenrod amber
- **Kusama Night**: Infinity neons — hot magenta-pink, pure neon yellow, electric green
