# Spec: Frankenthaler Soft-Edge Progress Fills

**Phase:** 2 - Organic Motion
**Artist Influence:** Helen Frankenthaler (Stained canvas, organic bleeds)
**Priority:** High
**Estimated Effort:** Medium

---

## Overview

Transform hard-edged progress indicators into **soft, organic fills** inspired by Helen Frankenthaler's "soak-stain" technique. Progress should feel like watercolor bleeding into paper — alive and organic, not mechanical and digital.

## Artist Context

Helen Frankenthaler pioneered the "soak-stain" technique: thinning paint and pouring it onto raw canvas so it soaked in rather than sitting on top. The result: colors that bleed into each other with soft, organic edges. Her breakthrough painting "Mountains and Sea" (1952) changed abstract art.

**Key techniques to steal:**
- Edges that feather and bleed, not hard stops
- Colors that look "soaked in" to the surface
- Organic, imperfect shapes
- Translucency — colors showing through each other
- Movement frozen mid-flow

## Requirements

### Progress Ring: Soft Edge Treatment

Current: Hard-edged SVG stroke
Goal: Stroke that feathers at the leading edge

```css
/* Add glow/feather to progress ring */
.progress-ring-fill {
  filter: url(#frankenthaler-blur);
}

/* SVG filter for soft edge */
/* Add to DailyProgress.jsx SVG */
<defs>
  <filter id="frankenthaler-blur" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
  </filter>
  <filter id="frankenthaler-glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
    <feMerge>
      <feMergeNode in="blur" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
</defs>
```

### Alternative: CSS Approach with Gradients

If SVG filters are too heavy, use gradient stroke simulation:

```css
.progress-ring-fill {
  /* Soft glow behind the stroke */
  filter: drop-shadow(0 0 6px currentColor);
}

.progress-ring-fill--under {
  stroke: var(--color-sage);
  filter: drop-shadow(0 0 8px rgba(92, 107, 84, 0.4));
}

.progress-ring-fill--close {
  stroke: var(--color-terracotta);
  filter: drop-shadow(0 0 8px rgba(193, 123, 95, 0.5));
}
```

### Macro Rings: Watercolor Treatment

Smaller macro rings should also feel organic:

```css
.macro-ring-fill {
  filter: drop-shadow(0 0 4px currentColor);
  opacity: 0.9;  /* Slight translucency like watercolor */
}

.macro-ring-fill--protein {
  filter: drop-shadow(0 0 4px rgba(139, 115, 85, 0.5));
}

.macro-ring-fill--carbs {
  filter: drop-shadow(0 0 4px rgba(196, 163, 90, 0.5));
}

.macro-ring-fill--fat {
  filter: drop-shadow(0 0 4px rgba(176, 141, 122, 0.5));
}
```

### Progress Bar Fallback (for accessibility)

If using linear progress bars, add gradient feathering:

```css
.progress-bar {
  /* Gradient that feathers at the end */
  background: linear-gradient(
    to right,
    var(--color-sage) 0%,
    var(--color-sage) 85%,
    rgba(92, 107, 84, 0.5) 95%,
    rgba(92, 107, 84, 0) 100%
  );
}
```

### Animation: Organic Fill Motion

When progress increases, it should flow like liquid, not tick like a meter:

```css
.progress-ring-fill {
  transition:
    stroke-dashoffset 800ms cubic-bezier(0.4, 0, 0.2, 1),
    filter 400ms ease;
}

/* Ease function mimics liquid settling */
@keyframes liquid-settle {
  0% { transform: scale(1.02); }
  50% { transform: scale(0.99); }
  100% { transform: scale(1); }
}
```

### Color Bleeding Between Macros

Where macro indicators meet, colors should subtly blend:

```css
.progress-macros {
  /* Slight overlap creates Frankenthaler bleed effect */
  gap: var(--space-3);
}

.macro-ring {
  /* Rings slightly overlap visually through glow */
  margin: 0 -4px;
}
```

## DailyProgress.jsx Updates

```jsx
// Add SVG filters to the component
<svg viewBox="0 0 180 180">
  <defs>
    <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <circle class="progress-ring-bg" ... />
  <circle
    class={`progress-ring-fill progress-ring-fill--${status}`}
    filter="url(#soft-glow)"
    ...
  />
</svg>
```

## Acceptance Criteria

- [ ] Main calorie ring has soft glowing edge
- [ ] Macro rings have subtle glow matching their color
- [ ] Progress fill animation feels liquid, not mechanical (800ms ease)
- [ ] Edges feather rather than hard-stop
- [ ] Colors appear slightly translucent
- [ ] Effect is subtle — noticeable but not overwhelming
- [ ] Performance: No jank on mobile (test filter performance)
- [ ] Reduced motion: Simpler transitions if preferred

## Files to Modify

- `src/components/DailyProgress.jsx` — Add SVG filters
- `src/styles.css` — Add filter and glow styles

## Test Plan

1. Visual comparison to Frankenthaler paintings — similar softness?
2. Animation smoothness test (60fps during transitions)
3. Mobile performance check (filters can be expensive)
4. Compare hard-edge vs soft-edge — which feels more "alive"?
5. Test with prefers-reduced-motion

## Performance Notes

SVG filters can impact performance. Mitigations:
- Use `will-change: filter` sparingly
- Consider CSS `drop-shadow` over SVG `feGaussianBlur` for mobile
- Disable filters on low-power mode if detectable

## Reference Images

Search "Helen Frankenthaler Mountains and Sea" — notice how blue bleeds into green, edges are organic not sharp, colors look soaked into the surface rather than painted on top.
