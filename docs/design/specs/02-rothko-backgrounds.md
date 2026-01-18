# Spec: Rothko-Inspired Luminous Backgrounds

**Phase:** 1 - Atmosphere & Perception
**Artist Influence:** Mark Rothko (Color Field paintings, luminous rectangles)
**Priority:** High
**Estimated Effort:** Medium

---

## Overview

Transform flat gradient backgrounds into **luminous, Rothko-inspired color fields** that appear to glow from within. Rothko's paintings aren't just colored rectangles — they vibrate with internal light. Our backgrounds should feel atmospheric and alive, not flat and digital.

## Artist Context

Mark Rothko layered thin washes of paint to create colors that seem to emanate light rather than reflect it. His signature "multiforms" stack soft-edged rectangles that blur into each other. The effect is meditative and emotional — viewers often cry in front of his paintings.

**Key techniques to steal:**
- Multiple translucent layers, not single opaque colors
- Soft, feathered edges between zones
- Colors that "breathe" — subtle variation within areas
- Warm glow emanating from center

## Requirements

### Background Structure

```
┌─────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ ← Top glow (warm, faint)
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                     │
│          Main content area          │ ← Center (base cream)
│                                     │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ ← Bottom glow (cool, faint)
└─────────────────────────────────────┘
```

### CSS Implementation

Replace current body::before and ::after with richer, more Rothko-like layers:

```css
/* Base atmosphere layer */
body {
  background: var(--color-cream);
  position: relative;
}

/* Rothko layer 1: Top warm glow */
body::before {
  content: '';
  position: fixed;
  top: -30%;
  left: -20%;
  right: -20%;
  height: 70%;
  background: radial-gradient(
    ellipse 80% 50% at 50% 0%,
    rgba(212, 168, 144, 0.15) 0%,    /* Warm terracotta tint */
    rgba(212, 168, 144, 0.08) 30%,
    rgba(212, 168, 144, 0.02) 60%,
    transparent 100%
  );
  pointer-events: none;
  z-index: -2;
}

/* Rothko layer 2: Bottom cool glow */
body::after {
  content: '';
  position: fixed;
  bottom: -30%;
  left: -20%;
  right: -20%;
  height: 70%;
  background: radial-gradient(
    ellipse 80% 50% at 50% 100%,
    rgba(138, 154, 130, 0.12) 0%,    /* Cool sage tint */
    rgba(138, 154, 130, 0.06) 30%,
    rgba(138, 154, 130, 0.02) 60%,
    transparent 100%
  );
  pointer-events: none;
  z-index: -2;
}

/* Rothko layer 3: Central luminosity (on #app wrapper) */
#app::before {
  content: '';
  position: fixed;
  top: 20%;
  left: 10%;
  right: 10%;
  bottom: 20%;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 255, 255, 0.4) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  pointer-events: none;
  z-index: -1;
  filter: blur(60px);
}
```

### Time-of-Day Variations

Each time period should have its own Rothko palette:

```css
/* Morning: Warm peach top, soft gold bottom */
.theme-morning body::before {
  background: radial-gradient(
    ellipse 80% 50% at 50% 0%,
    rgba(244, 196, 168, 0.18) 0%,
    transparent 100%
  );
}

/* Evening: Cooler sage top, lavender bottom */
.theme-evening body::before {
  background: radial-gradient(
    ellipse 80% 50% at 50% 0%,
    rgba(168, 180, 168, 0.15) 0%,
    transparent 100%
  );
}

/* Night: Deep, minimal glow */
.theme-night body::before {
  background: radial-gradient(
    ellipse 80% 50% at 50% 0%,
    rgba(100, 110, 100, 0.08) 0%,
    transparent 100%
  );
}
```

### Subtle Animation (Optional Enhancement)

Add very slow "breathing" to the luminous center:

```css
@keyframes rothko-breathe {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.02); }
}

#app::before {
  animation: rothko-breathe 8s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  #app::before {
    animation: none;
  }
}
```

## Acceptance Criteria

- [ ] Background has visible warm glow at top (not flat)
- [ ] Background has visible cool glow at bottom
- [ ] Center area has subtle luminosity that makes content "float"
- [ ] Colors blend softly at edges (no hard lines)
- [ ] Each time-of-day theme has appropriate Rothko palette
- [ ] Breathing animation is subtle (8+ second cycle)
- [ ] Reduced motion preference disables animation
- [ ] Performance: No jank, smooth scrolling maintained

## Files to Modify

- `src/styles.css` — Replace background pseudo-elements

## Test Plan

1. Visual inspection: Does background feel luminous, not flat?
2. Compare to Rothko paintings — similar soft glow effect?
3. Check all four time themes have distinct but harmonious palettes
4. Lighthouse performance check (backgrounds shouldn't hurt FPS)
5. Test with prefers-reduced-motion enabled

## Reference Images

Search "Mark Rothko Orange and Yellow" or "Mark Rothko No. 61" — notice how colors seem to emit light from within, edges blur softly, and there's depth despite being "flat."

## Notes

- Less is more — too much gradient looks gaudy
- The effect should be felt subconsciously, not noticed consciously
- Key insight: Rothko's power is in the EDGES — soft feathering between zones
