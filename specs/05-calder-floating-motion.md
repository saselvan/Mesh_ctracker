# Spec: Calder Floating Motion & Balance

**Phase:** 2 - Organic Motion
**Artist Influence:** Alexander Calder (Mobiles, kinetic sculpture)
**Priority:** Medium
**Estimated Effort:** Medium

---

## Overview

Add **Calder-inspired kinetic motion** to UI elements — subtle floating, bobbing, and settling that makes the interface feel alive and balanced. Like Calder's mobiles, elements should appear to move with invisible air currents, responding to use with gentle, weighted motion.

## Artist Context

Alexander Calder invented the mobile — suspended sculptures that move with air currents. His work embodies:
- **Balance** — Elements counterweight each other
- **Gentle motion** — Never frantic, always graceful
- **Playfulness** — Serious art that doesn't take itself seriously
- **Weight** — You can feel the mass of each element

The key insight: Motion should feel like it has **physics** — elements have weight, they settle, they bob.

## Requirements

### FAB (Floating Action Button): Idle Bob

The FAB should gently float when idle, like a buoy on calm water:

```css
@keyframes calder-float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.fab {
  animation: calder-float 4s ease-in-out infinite;
}

.fab:hover {
  animation: none;
  transform: scale(1.08);
}

@media (prefers-reduced-motion: reduce) {
  .fab {
    animation: none;
  }
}
```

### FAB: Weighted Press Response

When tapped, the FAB should "sink" with weight then bounce back:

```css
@keyframes calder-press {
  0% { transform: scale(1); }
  30% { transform: scale(0.92); }
  50% { transform: scale(1.04); }
  70% { transform: scale(0.98); }
  100% { transform: scale(1); }
}

.fab:active {
  animation: calder-press 400ms ease-out;
}
```

### Entry Cards: Staggered Settle

When entries load, they should settle into place like mobile elements finding balance:

```css
@keyframes calder-settle {
  0% {
    opacity: 0;
    transform: translateY(-8px);
  }
  60% {
    opacity: 1;
    transform: translateY(2px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.entry-card {
  animation: calder-settle 500ms ease-out backwards;
}

/* Stagger each card */
.entry-card:nth-child(1) { animation-delay: 0ms; }
.entry-card:nth-child(2) { animation-delay: 60ms; }
.entry-card:nth-child(3) { animation-delay: 120ms; }
.entry-card:nth-child(4) { animation-delay: 180ms; }
.entry-card:nth-child(5) { animation-delay: 240ms; }
.entry-card:nth-child(6) { animation-delay: 300ms; }
.entry-card:nth-child(n+7) { animation-delay: 350ms; }

@media (prefers-reduced-motion: reduce) {
  .entry-card {
    animation: none;
    opacity: 1;
  }
}
```

### Progress Ring: Weighted Fill

When progress changes, it should overshoot slightly then settle (like a pendulum):

```css
/* Applied via JS when value changes */
@keyframes calder-fill-settle {
  0% { stroke-dashoffset: var(--from-offset); }
  70% { stroke-dashoffset: calc(var(--to-offset) - 10); } /* Overshoot */
  85% { stroke-dashoffset: calc(var(--to-offset) + 3); }  /* Bounce back */
  100% { stroke-dashoffset: var(--to-offset); }
}
```

### Date Navigation: Swing Motion

Date navigation buttons should have a slight swing when clicked:

```css
@keyframes calder-swing {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(-3deg); }
  75% { transform: rotate(2deg); }
  100% { transform: rotate(0deg); }
}

.btn-icon:active {
  animation: calder-swing 300ms ease-out;
}
```

### Modal Entry: Drop and Settle

Modals should drop in with weight, not just fade:

```css
@keyframes calder-drop {
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  60% {
    opacity: 1;
    transform: scale(1.02) translateY(4px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal,
.entry-form {
  animation: calder-drop 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Number Counting: Weighted Increment

> **Note:** For number animation, use the `useAnimatedNumber` hook from S-006 (Staggered Animations).
> That spec provides the canonical Preact hook implementation. The example below shows the easing concept only.

When calorie numbers change, they should count with easing that feels weighted:

```jsx
// PREFERRED: Use hook from S-006
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'

const animatedCalories = useAnimatedNumber(totals.calories, 600)

// The hook uses ease-out-cubic. For Calder-style overshoot,
// the hook could be extended with a custom easing function:
//
// Calder easing concept (for reference):
// const eased = progress < 0.7
//   ? progress / 0.7 * 1.1  // Overshoot to 110%
//   : 1.1 - (progress - 0.7) / 0.3 * 0.1  // Settle back to 100%
```

### Interaction Feedback: Subtle Wobble

Interactive elements should have micro-wobble feedback:

```css
.date-display:active,
.profile-select-btn:active {
  transform: scale(0.98);
  transition: transform 100ms ease-out;
}
```

## Acceptance Criteria

- [ ] FAB gently bobs when idle (4s cycle)
- [ ] FAB has weighted press response (sinks, bounces)
- [ ] Entry cards stagger in on load (60ms delay each)
- [ ] Entry cards settle with slight overshoot
- [ ] Modals drop in with weight, not just fade
- [ ] Date nav buttons have swing feedback
- [ ] All animations respect prefers-reduced-motion
- [ ] Motion feels "weighted," not floaty

## Files to Modify

- `src/styles.css` — Keyframe animations, transitions
- `src/components/DailyProgress.jsx` — Number animation
- `src/utils/animation.js` — Create (new file)

## Test Plan

1. Watch FAB idle for 30 seconds — feels natural?
2. Rapid-tap FAB — does animation feel responsive?
3. Load page with 5+ entries — stagger looks good?
4. Compare to Calder mobile videos — similar sense of balance?
5. Test with prefers-reduced-motion enabled

## Performance Notes

- Use `transform` and `opacity` only (GPU-accelerated)
- Avoid animating `width`, `height`, `margin`, `padding`
- `will-change: transform` on frequently animated elements
- Keep animation count low — too many = chaos, not calm

## Reference Videos

Search "Calder mobile video" on YouTube — notice how elements move slowly, overshoot slightly, settle gradually. The motion is never frantic.

## Notes

- Calder's mobiles are about BALANCE — every motion has a countermotion
- The goal is "alive but calm," not "busy and animated"
- If animation draws attention to itself, it's too much
- User should feel the motion subconsciously
