# Calorie Tracker Experience Overhaul

**Date:** 2026-01-17
**Status:** Approved
**Approach:** Multi-session, spec-per-feature, Zeroshot execution

---

## Vision

Transform a functional calorie tracker into a **distinctive, emotionally resonant experience** by stealing aggressively from fine artists, architects, and best-in-class wellness apps.

**Target feeling:** The app should feel like a calm, supportive companion — not a judgmental scoreboard.

---

## Artistic Influences

| Artist | Era | Known For | Application |
|--------|-----|-----------|-------------|
| Mark Rothko | Abstract Expressionism | Luminous color fields, emotional resonance | Background atmosphere — colors that glow from within |
| James Turrell | Light Art | Skyspaces, perceptual shifts, light as medium | Time-of-day theming — perception changes, not just color swaps |
| Agnes Martin | Minimalism | Pale grids, meditative stillness, quiet | Spacing rhythm, pale palette, intentional emptiness |
| Helen Frankenthaler | Color Field | Stained canvas, organic bleeds, watercolor feel | Progress fills with soft edges, not hard stops |
| Alexander Calder | Kinetic Art | Mobiles, balance, playful movement | Floating micro-motion, elements that settle with weight |
| Yayoi Kusama | Contemporary | Infinity dots, obsessive repetition, immersion | Celebration states, streak visualization |

## App Influences

| App | Steal This |
|-----|------------|
| Headspace | Breathing animations, celebration moments, coaching tone |
| Zero | Elegant arc progress, dark mode luxury, meditative feel |
| Oura Ring | Weekly trends, minimal data density, premium feel |
| Apple Health | Ring progress, clean gradients |

## Cross-Domain Influences

| Domain | Source | Steal This |
|--------|--------|------------|
| Japanese aesthetics | Wabi-sabi, Ma | Intentional emptiness, imperfection as beauty |
| Architecture | Tadao Ando | Light/shadow play, time-of-day awareness |
| Industrial Design | Dieter Rams | Less but better, timeless over trendy |

---

## Phase Breakdown

### Phase 1: Atmosphere & Perception
**Artists:** Rothko, Turrell, Agnes Martin

| Spec | Feature |
|------|---------|
| `01-time-of-day-theming` | Gradual color shifts: morning warmth → midday clarity → evening calm → night dark |
| `02-rothko-backgrounds` | Layered, luminous color fields that glow from within |
| `03-agnes-martin-spacing` | Mathematical grid rhythm, generous whitespace, quiet stillness |

### Phase 2: Organic Motion
**Artists:** Frankenthaler, Calder

| Spec | Feature |
|------|---------|
| `04-frankenthaler-progress` | Soft-edge progress fills that bleed like watercolor |
| `05-calder-floating-motion` | Floating FAB, elements that bob and settle |
| `06-staggered-animations` | Entry cards fade in with delays, numbers count up |

### Phase 3: Celebration & Streaks
**Artists:** Kusama, Calder

| Spec | Feature |
|------|---------|
| `07-kusama-celebration` | Goal-hit triggers multiplying dots across screen |
| `08-streak-visualization` | Dots extending into infinity — chain of successful days |
| `09-milestone-moments` | 7-day, 30-day, 100-day celebrations |
| `10-coaching-messages` | Gentle Headspace-style encouragement |

### Phase 4: Daily Experience Features

| Spec | Feature |
|------|---------|
| `11-meal-categories` | Breakfast / Lunch / Dinner / Snacks sections |
| `12-quick-add-favorites` | Star foods, one-tap re-add |
| `13-recent-foods` | Last 10 items, instant re-add |
| `14-meal-templates` | "My usual breakfast" = multiple items at once |

### Phase 5: Progress & Motivation

| Spec | Feature |
|------|---------|
| `15-streak-tracking` | Visual dot chain, streak freeze option |
| `16-weekly-trends` | This week vs last week comparison |
| `17-insights` | "You tend to overeat on Fridays" |
| `18-share-achievements` | Export milestone cards |

### Phase 6: Polish & PWA

| Spec | Feature |
|------|---------|
| `19-dark-mode` | Turrell-inspired night perception |
| `20-pwa-offline` | Service worker, install prompt |
| `21-notifications` | Gentle meal reminders |
| `22-accessibility` | Screen reader, keyboard nav, reduced motion |

---

## Technical Constraints

- **Framework:** Preact + Vite (keep)
- **Styling:** CSS with custom properties (no Tailwind)
- **Animations:** CSS only (no JS animation libraries)
- **Storage:** IndexedDB + localStorage (local-first)
- **Deployment:** GitHub Pages

---

## Design Tokens (Current)

See `docs/design/tokens.md` for full token system.

**Palette:** Warm Wellness (sage, terracotta, cream)
**Typography:** Fraunces (display) + Nunito Sans (body)

---

## Success Criteria

1. **Distinctive:** Someone seeing a screenshot knows it's not a generic app
2. **Calm:** Using it feels peaceful, not stressful
3. **Delightful:** Hitting goals feels celebratory
4. **Fast:** Logging takes <10 seconds
5. **Sustainable:** Encourages long-term habits, not short-term guilt

---

## Zeroshot Execution

```bash
# Run individual specs
zeroshot run specs/01-time-of-day-theming.md

# Run all Phase 1 specs
zeroshot run specs/0[1-3]-*.md

# Run full overhaul
zeroshot run specs/
```

---

## Session Plan

| Session | Specs | Focus |
|---------|-------|-------|
| 1 | 01-03 | Atmosphere & time-of-day |
| 2 | 04-06 | Motion & organic fills |
| 3 | 07-10 | Celebrations & streaks |
| 4 | 11-14 | Daily experience features |
| 5 | 15-18 | Progress & motivation |
| 6 | 19-22 | Polish & PWA |
