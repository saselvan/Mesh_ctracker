# Phase 5: Feature Components

UI components for celebrations, streaks, milestones, and coaching.

**Prerequisite:** Phases 1, 3, 4 complete (utilities exist)

## Tech Stack
- Preact components
- Canvas API (celebration)
- Existing streak/insight utilities

## Specs to Implement

### S-007: Kusama Celebration

**Files to create:**
- CREATE `src/components/Celebration.jsx`

**Files to modify:**
- MODIFY `src/components/DailyProgress.jsx` (trigger celebration)
- MODIFY `src/components/App.jsx` (render Celebration)

**Implementation:**

```jsx
// src/components/Celebration.jsx
import { useEffect, useRef } from 'preact/hooks'

export function Celebration({ onComplete }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const colors = ['#8B9D82', '#C87864', '#E8DFD8', '#FDF6F0']
    const dots = []

    // Create 50 random dots
    for (let i = 0; i < 50; i++) {
      dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 0,
        maxRadius: Math.random() * 40 + 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 500,
        opacity: 1
      })
    }

    let startTime = null
    const duration = 2000

    function animate(timestamp) {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      let allComplete = true

      dots.forEach(dot => {
        const dotElapsed = elapsed - dot.delay
        if (dotElapsed < 0) {
          allComplete = false
          return
        }

        const progress = Math.min(dotElapsed / duration, 1)
        dot.radius = dot.maxRadius * Math.sin(progress * Math.PI)
        dot.opacity = 1 - progress

        if (progress < 1) allComplete = false

        ctx.beginPath()
        ctx.fillStyle = dot.color
        ctx.globalAlpha = dot.opacity * 0.7
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      ctx.globalAlpha = 1

      if (!allComplete) {
        requestAnimationFrame(animate)
      } else {
        onComplete?.()
      }
    }

    requestAnimationFrame(animate)
  }, [onComplete])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000
      }}
    />
  )
}
```

**Integration in DailyProgress.jsx:**
```jsx
// Add celebration trigger check
const ratio = totals.calories / goals.calories
const celebrationKey = `celebrated-${profileId}-${date}`
const alreadyCelebrated = localStorage.getItem(celebrationKey)

if (ratio >= 0.9 && ratio <= 1.1 && !alreadyCelebrated) {
  localStorage.setItem(celebrationKey, 'true')
  setShowCelebration(true)
}
```

**Integration in App.jsx:**
```jsx
import { Celebration } from './Celebration'

// In render:
{showCelebration && (
  <Celebration onComplete={() => setShowCelebration(false)} />
)}
```

**Test:** `docs/design/tests/T-007-kusama-celebration.md`

---

### S-008: Streak Visualization

**Files to create:**
- CREATE `src/components/StreakDisplay.jsx`

**Files to modify:**
- MODIFY `src/components/App.jsx` (render StreakDisplay)

**Implementation:**

```jsx
// src/components/StreakDisplay.jsx
import { getStreakData } from '../utils/streaks'

export function StreakDisplay({ profileId, onDateClick }) {
  const streakData = getStreakData(profileId)

  // Generate last 30 days
  const days = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const historyEntry = streakData.history?.find(h => h.date === dateStr)

    days.push({
      date: dateStr,
      status: historyEntry?.success ? 'success' : (dateStr === today.toISOString().split('T')[0] ? 'pending' : 'missed'),
      isToday: i === 0
    })
  }

  return (
    <div class="streak-display">
      <div class="streak-stats">
        <div class="streak-current">
          <span class="streak-number">{streakData.current || 0}</span>
          <span class="streak-label">day streak</span>
        </div>
        <div class="streak-longest">
          <span class="streak-number">{streakData.longest || 0}</span>
          <span class="streak-label">longest</span>
        </div>
      </div>

      <div class="streak-calendar">
        {days.map(day => (
          <button
            key={day.date}
            class={`streak-dot streak-${day.status} ${day.isToday ? 'streak-today' : ''}`}
            onClick={() => onDateClick?.(day.date)}
            aria-label={`${day.date}: ${day.status}`}
          />
        ))}
      </div>

      {streakData.weeklyGoal && (
        <div class="weekly-progress">
          <span>{streakData.weeklyProgress || 0}/{streakData.weeklyGoal} this week</span>
        </div>
      )}
    </div>
  )
}
```

**Add CSS:**
```css
.streak-display {
  padding: var(--space-4);
  background: var(--bg-surface);
  border-radius: var(--radius-md);
}

.streak-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: var(--space-4);
}

.streak-number {
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-sage);
}

.streak-label {
  font-size: 0.875rem;
  color: var(--color-muted);
}

.streak-calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.streak-dot {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  border: none;
  cursor: pointer;
}

.streak-success { background: var(--color-sage); }
.streak-missed { background: var(--color-muted); opacity: 0.3; }
.streak-pending { background: var(--color-sage); opacity: 0.5; }
.streak-today { box-shadow: 0 0 0 2px var(--color-terracotta); }
```

**Integration in App.jsx:**
```jsx
import { StreakDisplay } from './StreakDisplay'

// In render, below DailyProgress:
<StreakDisplay profileId={profile?.id} onDateClick={handleDateChange} />
```

**Test:** `docs/design/tests/T-008-streak-visualization.md`

---

### S-009: Milestone Moments

**Files to modify:**
- MODIFY `src/utils/streaks.js` (enhance checkMilestones)
- MODIFY `src/components/StreakDisplay.jsx` (show badges)

**Implementation:**

Enhance checkMilestones in streaks.js:
```javascript
export function checkMilestones(streakData) {
  const milestones = [3, 7, 14, 30, 50, 100, 365]
  const achieved = streakData.milestones || []

  // Use filter() NOT find() - return ALL crossed milestones
  const newMilestones = milestones.filter(m =>
    streakData.current >= m && !achieved.includes(m)
  )

  return newMilestones.map(days => ({
    days,
    message: getMilestoneMessage(days),
    achieved: true
  }))
}

function getMilestoneMessage(days) {
  const messages = {
    3: 'Three days strong!',
    7: 'One week warrior!',
    14: 'Two week champion!',
    30: 'Monthly master!',
    50: 'Fifty day legend!',
    100: 'Century club!',
    365: 'Full year hero!'
  }
  return messages[days] || `${days} days!`
}
```

Add badges to StreakDisplay.jsx:
```jsx
{(streakData.milestones || []).map(m => (
  <span key={m} class="milestone-badge">🏆 {m}</span>
))}
```

**Test:** `docs/design/tests/T-009-milestone-moments.md`

---

### S-010: Coaching Messages

**Files to create:**
- CREATE `src/components/CoachingMessage.jsx`

**Files to modify:**
- MODIFY `src/components/App.jsx` (render CoachingMessage)

**Implementation:**

```jsx
// src/components/CoachingMessage.jsx
import { getTimeOfDay } from '../utils/theme'

const messages = {
  morning: {
    low: [
      "Good morning! Let's make today count.",
      "Fresh day, fresh start. You've got this!",
      "Rise and shine! Every meal is a choice."
    ],
    high: [
      "Great start! Keep the momentum going.",
      "You're already ahead today. Stay mindful.",
    ]
  },
  evening: {
    low: [
      "Evening check-in: How are you feeling about today?",
      "Still time to log what you've had.",
    ],
    high: [
      "Winding down strong! Great job today.",
      "You made good choices. Rest well.",
    ]
  },
  night: {
    low: [
      "Tomorrow is a new day. Don't stress.",
      "Rest up - you'll get back on track.",
    ],
    high: [
      "Another successful day in the books!",
      "Sleep well, champion.",
    ]
  }
}

export function CoachingMessage({ progress, onDismiss, profileName }) {
  const timeOfDay = getTimeOfDay()
  const period = timeOfDay === 'midday' ? 'morning' : timeOfDay
  const level = progress < 0.5 ? 'low' : 'high'

  const periodMessages = messages[period]?.[level] || messages.morning.low
  const dateHash = new Date().toDateString().split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  const message = periodMessages[dateHash % periodMessages.length]

  const displayMessage = message.replace('{name}', profileName || 'friend')

  return (
    <div class="coaching-message">
      <p>{displayMessage}</p>
      <button onClick={onDismiss} aria-label="Dismiss" class="coaching-dismiss">×</button>
    </div>
  )
}
```

**Add CSS:**
```css
.coaching-message {
  background: linear-gradient(135deg, var(--color-sage-light), var(--color-cream));
  padding: var(--space-4);
  border-radius: var(--radius-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.coaching-dismiss {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.5;
}
```

**Integration in App.jsx:**
```jsx
import { CoachingMessage } from './CoachingMessage'

// Show when progress < 50% or > 110%
const showCoaching = progress < 0.5 || progress > 1.1

{showCoaching && !dismissedCoaching && (
  <CoachingMessage
    progress={progress}
    profileName={profile?.name}
    onDismiss={() => setDismissedCoaching(true)}
  />
)}
```

**Test:** `docs/design/tests/T-010-coaching-messages.md`

---

## Integration Checklist

After implementation, verify:

- [ ] Celebration triggers when ratio hits 0.9-1.1
- [ ] Celebration only shows once per day (localStorage check)
- [ ] Celebration auto-dismisses after animation
- [ ] StreakDisplay shows current and longest streak
- [ ] Calendar heatmap shows 30 days
- [ ] Click on dot navigates to that date
- [ ] Today's dot is highlighted
- [ ] Pending state (dimmed) for incomplete today
- [ ] checkMilestones uses filter() not find()
- [ ] Milestone badges display in StreakDisplay
- [ ] CoachingMessage shows based on time and progress
- [ ] Dismiss button hides message
- [ ] All components render in App.jsx

## Verification

```bash
npm run build
npm run dev
# Test: hit calorie goal, see celebration
# Test: check streak display updates
# Test: coaching message appears at different times
```

## Success Criteria

Phase 5 is complete when:
1. All four components exist and render
2. Celebration triggers correctly on goal achievement
3. StreakDisplay shows accurate data
4. Milestone badges appear at correct thresholds
5. Coaching messages are contextual
6. Build succeeds
