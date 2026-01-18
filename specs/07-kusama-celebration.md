# Spec: Kusama Infinity Dot Celebration

**Phase:** 3 - Celebration & Streaks
**Artist Influence:** Yayoi Kusama (Infinity dots, obsessive repetition)
**Priority:** High
**Estimated Effort:** High

---

## Overview

When user hits their calorie goal, trigger a **Kusama-inspired celebration** — dots multiplying across the screen, creating a moment of infinity and joy. This transforms a mundane "100% complete" into a memorable, shareable moment.

## Artist Context

Yayoi Kusama has been painting polka dots for 70+ years. Her "Infinity Rooms" are immersive spaces filled with multiplying dots and mirrors. The effect: you lose yourself in infinite pattern. She calls them "self-obliteration" — the ego dissolves into the infinite.

**Key techniques to steal:**
- Dots that multiply and spread
- Bold, contrasting colors
- Sense of infinity and immersion
- Playful but profound
- Obsessive repetition that becomes meditative

## Requirements

### Trigger Conditions

```javascript
import { formatDate } from '../utils/date'

// Celebration triggers when:
// 1. Goal is set and > 0
// 2. Calories reach 100% of goal for first time today
// 3. NOT on subsequent entries (one celebration per day)
// 4. User hasn't dismissed it already today

const shouldCelebrate = (
  goals.calories > 0 &&                           // Guard: goal must be set
  totals.calories >= goals.calories &&
  !hasCelebratedToday &&
  previousTotals.calories < goals.calories
)

// Storage key includes profileId for per-profile tracking
// Date format: YYYY-MM-DD from formatDate()
const celebratedKey = `celebrated-${profileId}-${formatDate(new Date())}`
```

### Celebration Component

Create `src/components/Celebration.jsx`:

```jsx
import { useEffect, useState } from 'preact/hooks'

// Variant configurations (used by S-009 Milestone Moments)
const VARIANTS = {
  default: { dotCount: 40, duration: 3500 },
  small: { dotCount: 30, duration: 3000 },
  medium: { dotCount: 50, duration: 4000 },
  large: { dotCount: 80, duration: 4500 },
  epic: { dotCount: 150, duration: 5500 }
}

const COLORS = [
  '#C17B5F',  // Terracotta
  '#5C6B54',  // Sage
  '#C4A35A',  // Gold
  '#8B7355',  // Brown
  '#D4A574',  // Warm amber
]

/**
 * Celebration component
 * @param {Object} props
 * @param {Function} props.onComplete - Called when celebration animation finishes
 * @param {string} [props.variant='default'] - Size variant: 'small' | 'medium' | 'large' | 'epic'
 * @param {string} [props.message='Goal reached!'] - Custom celebration message
 */
export function Celebration({ onComplete, variant = 'default', message = 'Goal reached!' }) {
  const config = VARIANTS[variant] || VARIANTS.default
  const [dots, setDots] = useState([])
  const [phase, setPhase] = useState('enter') // enter, hold, exit

  useEffect(() => {
    // Generate random dots based on variant
    const newDots = Array.from({ length: config.dotCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 8 + Math.random() * 32,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 800,
      duration: 600 + Math.random() * 400,
    }))
    setDots(newDots)

    // Phase transitions - timing scales with variant duration
    const holdTime = config.duration * 0.3
    const exitTime = config.duration * 0.7
    setTimeout(() => setPhase('hold'), holdTime)
    setTimeout(() => setPhase('exit'), exitTime)
    setTimeout(() => onComplete(), config.duration)
  }, [config.duration])

  return (
    <div class={`celebration celebration--${phase} celebration--${variant}`}>
      <div class="celebration-message">
        <span class="celebration-emoji">✨</span>
        <span class="celebration-text">{message}</span>
      </div>
      {dots.map(dot => (
        <div
          key={dot.id}
          class="kusama-dot"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            backgroundColor: dot.color,
            animationDelay: `${dot.delay}ms`,
            animationDuration: `${dot.duration}ms`,
          }}
        />
      ))}
    </div>
  )
}
```

### CSS Animation

```css
/* Celebration overlay */
.celebration {
  position: fixed;
  inset: 0;
  z-index: 1000;
  pointer-events: none;
  overflow: hidden;
}

/* Celebration message */
.celebration-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 1001;
}

.celebration-emoji {
  display: block;
  font-size: 3rem;
  animation: celebration-pop 600ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.celebration-text {
  display: block;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-sage);
  margin-top: var(--space-2);
  opacity: 0;
  animation: celebration-fade-in 400ms ease-out 300ms forwards;
}

@keyframes celebration-pop {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes celebration-fade-in {
  to { opacity: 1; }
}

/* Kusama dots */
.kusama-dot {
  position: absolute;
  border-radius: 50%;
  opacity: 0;
  transform: scale(0);
}

.celebration--enter .kusama-dot {
  animation: kusama-appear var(--duration, 600ms) cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: var(--delay, 0ms);
}

.celebration--hold .kusama-dot {
  opacity: 1;
  transform: scale(1);
  animation: kusama-pulse 2s ease-in-out infinite;
}

.celebration--exit .kusama-dot {
  animation: kusama-disappear 800ms ease-in forwards;
}

@keyframes kusama-appear {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  60% {
    opacity: 1;
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes kusama-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes kusama-disappear {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.5) translateY(20px);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .celebration-message {
    animation: none;
    opacity: 1;
  }

  .kusama-dot {
    animation: none !important;
    opacity: 0.7;
    transform: scale(1);
  }

  .celebration--exit .kusama-dot {
    transition: opacity 400ms ease;
    opacity: 0;
  }
}
```

### Integration with App.jsx

```jsx
import { Celebration } from './Celebration'
import { formatDate } from '../utils/date'

// In App component:
const currentDate = formatDate(new Date())  // YYYY-MM-DD format
const celebratedKey = `celebrated-${profileId}-${currentDate}`

const [showCelebration, setShowCelebration] = useState(false)
const [hasCelebratedToday, setHasCelebratedToday] = useState(
  localStorage.getItem(celebratedKey) === 'true'
)

// Check for goal completion
useEffect(() => {
  const totals = calculateTotals(entries)
  const prevTotals = previousTotalsRef.current

  // Guard: only celebrate if goal is set and > 0
  if (
    goals.calories > 0 &&
    totals.calories >= goals.calories &&
    prevTotals.calories < goals.calories &&
    !hasCelebratedToday
  ) {
    setShowCelebration(true)
    setHasCelebratedToday(true)
    localStorage.setItem(celebratedKey, 'true')
  }

  previousTotalsRef.current = totals
}, [entries, goals, currentDate, hasCelebratedToday, profileId])

// In render:
{showCelebration && (
  <Celebration onComplete={() => setShowCelebration(false)} />
)}
```

### Variations for Milestones

Different celebrations for different achievements:

```javascript
const CELEBRATION_VARIANTS = {
  daily_goal: { dotCount: 40, duration: 3500 },
  weekly_streak_7: { dotCount: 70, duration: 4500, colors: GOLD_PALETTE },
  monthly_streak_30: { dotCount: 100, duration: 5500, colors: RAINBOW_PALETTE },
}
```

## Acceptance Criteria

- [ ] Celebration triggers when calories first reach 100% of goal
- [ ] Dots appear with staggered pop animation
- [ ] 40+ dots spread across screen
- [ ] Dots use brand colors (terracotta, sage, gold)
- [ ] "Goal reached!" message appears in center
- [ ] Celebration auto-dismisses after ~3.5 seconds
- [ ] Celebration only triggers once per day per goal
- [ ] Reduced motion shows static dots, no animation
- [ ] No celebration on page load if already at goal

## Files to Create/Modify

- `src/components/Celebration.jsx` — Create (new file)
- `src/styles.css` — Add celebration styles
- `src/components/App.jsx` — Integration logic

## Test Plan

1. Add entries to reach exactly 100% — celebration triggers?
2. Add more entries — celebration doesn't re-trigger?
3. Refresh page — celebration doesn't trigger again?
4. Next day — celebration can trigger again?
5. Test with prefers-reduced-motion
6. Record celebration, compare to Kusama infinity rooms

## Future Enhancements

- Haptic feedback on mobile (vibrate API)
- Sound effect (optional, user-enabled)
- Screenshot/share button during celebration
- Different dot patterns for different achievements
- Infinity mirror effect using CSS reflections

## Reference Images

Search "Yayoi Kusama Infinity Room" — notice dots filling entire space, bold colors, sense of infinite repetition. Also "Kusama pumpkin" for her signature dot patterns.

## Notes

- This is the EMOTIONAL PEAK of the app experience
- Should feel joyful but not obnoxious
- Duration matters: too short = missed, too long = annoying
- Kusama's work is about finding infinity in simple patterns
- The dots should feel like a reward, not a distraction
