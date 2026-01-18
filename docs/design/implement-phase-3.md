# Phase 3: Motion Layer

Animation hooks and floating motion effects.

**Prerequisite:** Phase 1 and 2 complete

## Tech Stack
- Preact hooks
- CSS keyframes
- requestAnimationFrame

## Specs to Implement

### S-006: Staggered Animations

**Files to create:**
- CREATE `src/hooks/useAnimatedNumber.js`

**Implementation:**

```javascript
import { useState, useEffect, useRef } from 'preact/hooks'

// Easing function for smooth deceleration
function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4)
}

export function useAnimatedNumber(target, duration = 800) {
  const [current, setCurrent] = useState(0)
  const frameRef = useRef(null)
  const startTimeRef = useRef(null)
  const startValueRef = useRef(0)

  useEffect(() => {
    // Cancel any running animation
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
    }

    startValueRef.current = current
    startTimeRef.current = null

    function animate(timestamp) {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutQuart(progress)

      const newValue = startValueRef.current + (target - startValueRef.current) * easedProgress
      setCurrent(newValue)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    // Cleanup on unmount
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [target, duration])

  return Math.round(current)
}
```

**Usage in components:**
```jsx
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'

function CalorieCounter({ value }) {
  const animatedValue = useAnimatedNumber(value, 800)
  return <span>{animatedValue}</span>
}
```

**Test:** `docs/design/tests/T-006-staggered-animations.md`

---

### S-005: Calder Floating Motion

**Files to modify:**
- MODIFY `src/styles.css`

**Implementation:**

Add CSS keyframes for gentle floating:

```css
/* Calder-inspired floating motion */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

@keyframes float-subtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@keyframes float-gentle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

/* Apply to elements with staggered delays */
.fab {
  animation: float 3s ease-in-out infinite;
  animation-delay: 0s;
}

.progress-ring {
  animation: float-subtle 4s ease-in-out infinite;
  animation-delay: 0.5s;
}

.macro-ring {
  animation: float-gentle 5s ease-in-out infinite;
}

.macro-ring:nth-child(1) { animation-delay: 0s; }
.macro-ring:nth-child(2) { animation-delay: 0.3s; }
.macro-ring:nth-child(3) { animation-delay: 0.6s; }

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .fab,
  .progress-ring,
  .macro-ring {
    animation: none;
  }
}
```

**Test:** `docs/design/tests/T-005-calder-floating-motion.md`

---

## Integration Checklist

After implementation, verify:

- [ ] useAnimatedNumber hook exists and exports correctly
- [ ] Hook uses easeOutQuart easing
- [ ] Hook cancels animation frame on unmount
- [ ] Hook cancels previous animation when target changes
- [ ] @keyframes float animation defined in CSS
- [ ] FAB has float animation (8px amplitude, 3s)
- [ ] Progress ring has float-subtle (4px amplitude, 4s)
- [ ] Macro rings have float-gentle with staggered delays
- [ ] prefers-reduced-motion disables all floating

## Verification

```bash
npm run build
npm run dev
# Observe floating elements, test reduced motion
```

## Success Criteria

Phase 3 is complete when:
1. useAnimatedNumber hook works with number counters
2. All floating animations visible
3. Staggered delays create mobile-like effect
4. Reduced motion preference respected
5. Build succeeds
