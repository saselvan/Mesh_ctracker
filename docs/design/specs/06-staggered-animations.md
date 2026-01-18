# Spec: Staggered Entry Animations & Number Counting

**Phase:** 2 - Organic Motion
**Artist Influence:** Calder (settling motion)
**Priority:** Medium
**Estimated Effort:** Low

---

## Overview

Implement staggered reveal animations for entry cards and smooth number counting for calorie/macro values. Elements should feel like they're settling into place, not popping in instantly.

## Requirements

### Entry Card Stagger

When entries load or date changes, cards animate in sequence:

```css
@keyframes entry-settle {
  0% {
    opacity: 0;
    transform: translateY(-12px);
  }
  70% {
    opacity: 1;
    transform: translateY(3px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.entry-card {
  animation: entry-settle 450ms ease-out backwards;
}

.entry-card:nth-child(1) { animation-delay: 0ms; }
.entry-card:nth-child(2) { animation-delay: 50ms; }
.entry-card:nth-child(3) { animation-delay: 100ms; }
.entry-card:nth-child(4) { animation-delay: 150ms; }
.entry-card:nth-child(5) { animation-delay: 200ms; }
.entry-card:nth-child(n+6) { animation-delay: 250ms; }
```

### Number Counting Animation

Create `src/hooks/useAnimatedNumber.js`:

```javascript
import { useState, useEffect, useRef } from 'preact/hooks'

export function useAnimatedNumber(targetValue, duration = 400) {
  const [displayValue, setDisplayValue] = useState(targetValue)
  const previousValue = useRef(targetValue)

  useEffect(() => {
    const start = previousValue.current
    const end = targetValue
    const startTime = performance.now()

    if (start === end) return

    function animate(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(start + (end - start) * eased)

      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        previousValue.current = end
      }
    }

    requestAnimationFrame(animate)
  }, [targetValue, duration])

  return displayValue
}
```

### Usage in DailyProgress

```jsx
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'

export function DailyProgress({ entries, goals }) {
  const totals = calculateTotals(entries)

  const animatedCalories = useAnimatedNumber(totals.calories)
  const animatedProtein = useAnimatedNumber(totals.protein)
  const animatedCarbs = useAnimatedNumber(totals.carbs)
  const animatedFat = useAnimatedNumber(totals.fat)

  return (
    <div class="progress-card">
      <span class="progress-value">{animatedCalories}</span>
      {/* ... */}
    </div>
  )
}
```

### Progress Ring Animation

Smooth ring fill when values change:

```css
.progress-ring-fill {
  transition: stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1);
}

.macro-ring-fill {
  transition: stroke-dashoffset 400ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

## Acceptance Criteria

- [ ] Entry cards stagger in with 50ms delays
- [ ] Cards settle with slight overshoot animation
- [ ] Calorie number counts up/down smoothly
- [ ] Macro numbers animate independently
- [ ] Progress rings fill smoothly (600ms)
- [ ] Reduced motion: instant values, no stagger

## Files to Create/Modify

- `src/hooks/useAnimatedNumber.js` — Create
- `src/components/DailyProgress.jsx` — Use hook
- `src/styles.css` — Entry animations

## Test Plan

1. Load page with entries — stagger visible?
2. Add entry — number counts up?
3. Delete entry — number counts down?
4. Change date — cards re-animate?
