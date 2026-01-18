# Spec: Milestone Celebration Moments

**Phase:** 3 - Celebration & Streaks
**Priority:** Medium
**Estimated Effort:** Medium

---

## Overview

Celebrate streak milestones (7, 14, 30, 60, 100 days) with escalating celebrations. Each milestone feels more significant than the last.

## Requirements

### Milestone Definitions

```javascript
const MILESTONES = [
  { days: 7, label: 'One Week!', intensity: 'small', dotCount: 30 },
  { days: 14, label: 'Two Weeks!', intensity: 'medium', dotCount: 50 },
  { days: 30, label: 'One Month!', intensity: 'large', dotCount: 80 },
  { days: 60, label: 'Two Months!', intensity: 'large', dotCount: 100 },
  { days: 100, label: '100 Days!', intensity: 'epic', dotCount: 150 },
]
```

### Milestone Detection

```javascript
/**
 * Check for ALL milestone(s) crossed between previous and current streak.
 * Returns array of milestones (may be multiple if user jumps, e.g., from 5 to 35 days).
 */
export function checkMilestones(currentStreak, previousStreak) {
  return MILESTONES.filter(m =>
    currentStreak >= m.days && previousStreak < m.days
  )
}

// Usage:
const milestones = checkMilestones(currentStreak, previousStreak)
if (milestones.length > 0) {
  // Celebrate the highest milestone reached
  const topMilestone = milestones[milestones.length - 1]
  showCelebration(topMilestone)

  // Award ALL milestones (for badge tracking)
  milestones.forEach(m => awardMilestone(profileId, m))
}
```

### Celebration Variants

Reuse Kusama celebration with intensity scaling:

```jsx
<Celebration
  variant={milestone.intensity}
  message={milestone.label}
  dotCount={milestone.dotCount}
/>
```

```css
/* Epic celebration: rainbow colors, more dots, longer duration */
.celebration--epic .kusama-dot {
  animation-duration: 1000ms;
}

.celebration--epic {
  background: radial-gradient(
    circle at center,
    rgba(255,255,255,0.2) 0%,
    transparent 70%
  );
}
```

### Badge System (Optional)

Award permanent badges for milestones:

```javascript
export function getMilestones(profileId) {
  return JSON.parse(localStorage.getItem(`milestones-${profileId}`) || '[]')
}

export function awardMilestone(profileId, milestone) {
  const milestones = getMilestones(profileId)
  if (!milestones.includes(milestone.days)) {
    milestones.push(milestone.days)
    localStorage.setItem(`milestones-${profileId}`, JSON.stringify(milestones))
  }
}
```

## Acceptance Criteria

- [ ] 7-day streak triggers small celebration
- [ ] 30-day streak triggers large celebration
- [ ] 100-day streak triggers epic celebration
- [ ] Each milestone only celebrates once
- [ ] Milestone badges persist

## Files to Modify

- `src/components/Celebration.jsx` — Add variants
- `src/utils/storage.js` — Milestone tracking
- `src/components/App.jsx` — Detection logic
