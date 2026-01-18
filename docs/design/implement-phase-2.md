# Phase 2: Visual Layer

CSS-only visual enhancements. No JS changes required.

**Prerequisite:** Phase 1 complete (theme classes exist)

## Tech Stack
- CSS custom properties
- Existing styles.css

## Specs to Implement

### S-002: Rothko Backgrounds

**Files to modify:**
- MODIFY `src/styles.css`

**Implementation:**
Add layered color field backgrounds:

```css
/* Rothko-inspired ambient backgrounds */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at 30% 20%, rgba(139, 157, 130, 0.15) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}

body::after {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at 70% 80%, rgba(200, 120, 100, 0.1) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}

.progress-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(139, 157, 130, 0.08) 0%,
    rgba(200, 120, 100, 0.05) 100%
  );
  border-radius: inherit;
  pointer-events: none;
}

/* Time-responsive Rothko palettes */
.theme-morning body::before {
  background: radial-gradient(ellipse at 30% 20%, rgba(255, 200, 150, 0.15) 0%, transparent 50%);
}

.theme-evening body::before {
  background: radial-gradient(ellipse at 30% 20%, rgba(100, 120, 140, 0.15) 0%, transparent 50%);
}

.theme-night body::before {
  background: radial-gradient(ellipse at 30% 20%, rgba(50, 50, 80, 0.2) 0%, transparent 50%);
}
```

**Test:** `docs/design/tests/T-002-rothko-backgrounds.md`

---

### S-003: Agnes Martin Spacing

**Files to modify:**
- MODIFY `src/styles.css`

**Implementation:**
Increase breathing room and add subtle grid:

```css
/* Agnes Martin inspired spacing - increase by 1.2x */
:root {
  --space-1: 5px;   /* was 4px */
  --space-2: 10px;  /* was 8px */
  --space-3: 14px;  /* was 12px */
  --space-4: 19px;  /* was 16px */
  --space-6: 29px;  /* was 24px */
  --space-8: 38px;  /* was 32px */
}

/* Subtle 1px line grid overlay */
.app::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
  z-index: -1;
}

/* Increase gap between macro rings */
.macro-rings {
  gap: var(--space-6); /* was --space-4 */
}

/* More padding on cards */
.entry-card,
.progress-card {
  padding: var(--space-6);
}
```

**Test:** `docs/design/tests/T-003-agnes-martin-spacing.md`

---

### S-004: Frankenthaler Progress

**Files to modify:**
- MODIFY `src/styles.css`
- MODIFY `src/components/DailyProgress.jsx` (add SVG gradients)

**Implementation:**

1. Add CSS for watercolor effect:
```css
/* Frankenthaler watercolor progress */
.progress-ring-fill {
  filter: blur(0.5px);
  opacity: 0.85;
}

.progress-bar-fill {
  background: linear-gradient(
    90deg,
    var(--color-sage) 0%,
    rgba(139, 157, 130, 0.7) 50%,
    var(--color-terracotta) 100%
  );
  background-size: 200% 100%;
  animation: watercolor-flow 8s ease-in-out infinite;
}

@keyframes watercolor-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

2. Add SVG gradient defs to DailyProgress.jsx:
```jsx
<defs>
  <linearGradient id="watercolor-sage" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stopColor="var(--color-sage)" stopOpacity="0.9" />
    <stop offset="50%" stopColor="var(--color-sage)" stopOpacity="0.6" />
    <stop offset="100%" stopColor="var(--color-terracotta)" stopOpacity="0.8" />
  </linearGradient>
</defs>
```

Use `stroke="url(#watercolor-sage)"` on progress ring circle.

**Test:** `docs/design/tests/T-004-frankenthaler-progress.md`

---

## Integration Checklist

After implementation, verify:

- [ ] body::before and body::after create ambient glow layers
- [ ] .progress-card::after has gradient overlay
- [ ] Theme-specific Rothko colors apply
- [ ] Spacing values increased by ~1.2x
- [ ] .app::before shows subtle grid (barely visible)
- [ ] .macro-rings gap is --space-6
- [ ] Progress ring has blur filter
- [ ] Watercolor animation runs on progress bar
- [ ] SVG gradient defined in DailyProgress

## Verification

```bash
npm run build
npm run dev
# Visually inspect: ambient colors, spacing, progress styling
```

## Success Criteria

Phase 2 is complete when:
1. All CSS additions compile without errors
2. Visual effects are visible at each breakpoint
3. Theme changes affect Rothko colors
4. Build succeeds
