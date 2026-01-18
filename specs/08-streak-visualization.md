# Spec: Kusama Streak Visualization

**Phase:** 3 - Celebration & Streaks
**Artist Influence:** Yayoi Kusama (Infinity dots)
**Priority:** Medium
**Estimated Effort:** Medium

---

## Overview

Visualize daily streaks as **Kusama-inspired infinity dots** — a chain of dots extending into the distance, representing successful tracking days. Each dot is a day you hit your goal.

## Requirements

### Data Model

> **Note:** Streak data functions are defined in S-015 (Streak Tracking Logic). This spec uses those functions for display purposes.

```javascript
// Import from src/utils/streaks.js (defined in S-015)
import { getStreakData } from '../utils/streaks'

// Streak data schema (from S-015):
// {
//   current: 0,           // Current streak count
//   longest: 0,           // All-time longest streak
//   lastSuccessDate: null, // YYYY-MM-DD string of last successful day
//   history: [],          // Last 30 days of success/fail
//   weeklyGoal: 5,        // Days per week target
//   weeklyProgress: 0     // Days hit this week
// }

// This component is display-only. Updates are handled by:
// - updateStreakForDay() in S-015 when entries change
// - checkAndUpdateStreak() in S-015 on app load
```

### Streak Display Component

Create `src/components/StreakDisplay.jsx`:

```jsx
export function StreakDisplay({ currentStreak, longestStreak }) {
  const dots = Math.min(currentStreak, 14) // Show max 14 dots
  const hasMore = currentStreak > 14

  return (
    <div class="streak-display">
      <div class="streak-dots">
        {Array.from({ length: dots }, (_, i) => (
          <div
            key={i}
            class="streak-dot"
            style={{
              animationDelay: `${i * 50}ms`,
              opacity: 1 - (i * 0.04), // Fade into distance
              transform: `scale(${1 - i * 0.03})` // Shrink into distance
            }}
          />
        ))}
        {hasMore && <span class="streak-more">+{currentStreak - 14}</span>}
      </div>
      <div class="streak-label">
        <span class="streak-count">{currentStreak}</span>
        <span class="streak-text">day streak</span>
      </div>
    </div>
  )
}
```

### CSS Styling

```css
.streak-display {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.streak-dots {
  display: flex;
  align-items: center;
  gap: 6px;
}

.streak-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-terracotta);
  animation: streak-pop 300ms ease-out backwards;
}

@keyframes streak-pop {
  0% { transform: scale(0); }
  70% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.streak-more {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin-left: 4px;
}

.streak-label {
  display: flex;
  flex-direction: column;
}

.streak-count {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-sage);
  line-height: 1;
}

.streak-text {
  font-size: 0.75rem;
  color: var(--color-muted);
}
```

### Placement

Add to header or below progress card:

```jsx
// In App.jsx or Header.jsx
<StreakDisplay
  currentStreak={streakData.current}
  longestStreak={streakData.longest}
/>
```

## Acceptance Criteria

- [ ] Streak count persists across sessions
- [ ] Dots appear for each streak day (max 14 visible)
- [ ] Dots fade/shrink to suggest infinity
- [ ] Streak resets if day missed
- [ ] Longest streak tracked separately
- [ ] Per-profile streak tracking

## Files to Create/Modify

- `src/utils/storage.js` — Add streak functions
- `src/components/StreakDisplay.jsx` — Create
- `src/styles.css` — Streak styles
- `src/components/App.jsx` — Integration
