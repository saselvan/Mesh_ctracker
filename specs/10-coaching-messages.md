# Spec: Gentle Coaching Messages

**Phase:** 3 - Celebration & Streaks
**Artist Influence:** Headspace (gentle, supportive tone)
**Priority:** Low
**Estimated Effort:** Low

---

## Overview

Add contextual, **Headspace-style coaching messages** that encourage without judging. Messages should feel like a supportive friend, not a drill sergeant.

## Requirements

### Message Types

```javascript
const MESSAGES = {
  morning_empty: [
    "Good morning! Ready to fuel your day?",
    "A new day, a fresh start.",
    "What's for breakfast?",
  ],

  progress_good: [
    "You're doing great!",
    "Nice and steady.",
    "On track for the day.",
  ],

  near_goal: [
    "Almost there!",
    "Looking good!",
    "Just a little more room.",
  ],

  goal_reached: [
    "You did it!",
    "Goal reached. Well done.",
    "Perfect day!",
  ],

  over_goal: [
    "A little over today. That's okay.",
    "Tomorrow's a new day.",
    "One day doesn't define you.",
  ],

  streak_encouragement: [
    "Keep the streak alive!",
    "{n} days strong!",
    "Consistency is key.",
  ],
}
```

### Utility Function

```javascript
// Import from src/utils/date.js (defined in S-015)
import { pickRandom } from '../utils/date'

// Or define locally if preferred:
// function pickRandom(array) {
//   return array[Math.floor(Math.random() * array.length)]
// }
```

### Message Selection Logic

```javascript
export function getMessage(context) {
  const { totals, goals, timeOfDay, streak, hasEntries } = context

  // Guard: handle missing or zero goals
  if (!goals.calories || goals.calories === 0) {
    return null // No message when goals not set
  }

  const ratio = totals.calories / goals.calories

  if (!hasEntries && timeOfDay === 'morning') {
    return pickRandom(MESSAGES.morning_empty)
  }

  if (ratio >= 1.1) return pickRandom(MESSAGES.over_goal)
  if (ratio >= 1.0) return pickRandom(MESSAGES.goal_reached)
  if (ratio >= 0.85) return pickRandom(MESSAGES.near_goal)
  if (ratio >= 0.3) return pickRandom(MESSAGES.progress_good)

  return null // No message needed
}
```

### Display Component

```jsx
function CoachingMessage({ message }) {
  if (!message) return null

  return (
    <div class="coaching-message">
      <p>{message}</p>
    </div>
  )
}
```

### CSS

```css
.coaching-message {
  text-align: center;
  padding: var(--space-3) var(--space-4);
  color: var(--color-warm-gray);
  font-size: 0.9375rem;
  font-style: italic;
}

.coaching-message p {
  margin: 0;
}
```

### Placement

Below progress card, above entry list:

```jsx
<DailyProgress ... />
<CoachingMessage message={getMessage(context)} />
<EntryList ... />
```

## Acceptance Criteria

- [ ] Messages appear based on context
- [ ] Tone is encouraging, never shaming
- [ ] "Over goal" messages are gentle
- [ ] Messages rotate (not same one always)
- [ ] Can be disabled in settings (future)

## Files to Create/Modify

- `src/utils/messages.js` — Create
- `src/components/CoachingMessage.jsx` — Create
- `src/components/App.jsx` — Integration

## Tone Guidelines

**DO:**
- "You're doing great!"
- "Tomorrow's a new day."
- "Nice and steady."

**DON'T:**
- "You ate too much!"
- "You failed today."
- "Try harder tomorrow."
