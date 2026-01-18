# Spec: Share Achievements

**Phase:** 5 - Gamification & Insights
**Priority:** Low
**Estimated Effort:** Medium

---

## Overview

Allow users to share milestone achievements (streaks, goals) as shareable images or text. Creates a sense of accomplishment and community.

## Requirements

### Shareable Events

```javascript
export const SHAREABLE_EVENTS = {
  STREAK_MILESTONE: 'streak_milestone',
  WEEKLY_PERFECT: 'weekly_perfect',
  GOAL_HIT: 'goal_hit',
  MONTHLY_SUMMARY: 'monthly_summary'
}

// Shareable shape
{
  type: 'streak_milestone',
  title: '30-Day Streak!',
  subtitle: 'Calorie Tracker',
  stat: '30',
  statLabel: 'days',
  message: 'I just hit a 30-day tracking streak!',
  date: '2025-01-17'
}
```

### Shared Utilities

Import utilities from other specs:

```javascript
// src/utils/sharing.js
import { formatDate } from './date'  // From S-015
import { aggregateByDay } from './trends'  // From S-016

/**
 * Format a date for display in share cards
 */
export function formatShareDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

/**
 * Format a month string (YYYY-MM) for display
 */
export function formatMonthYear(monthStr) {
  const [year, month] = monthStr.split('-')
  const date = new Date(year, month - 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
```

### Share Card Generator

```jsx
// src/components/ShareCard.jsx
import { formatShareDate } from '../utils/sharing'

export function ShareCard({ shareable, forExport = false }) {
  return (
    <div class={`share-card ${forExport ? 'share-card--export' : ''}`}>
      <div class="share-card-inner">
        <div class="share-logo">
          <span class="share-logo-icon">🎯</span>
          <span class="share-logo-text">Calorie Tracker</span>
        </div>

        <div class="share-content">
          <span class="share-stat">{shareable.stat}</span>
          <span class="share-stat-label">{shareable.statLabel}</span>
          <h2 class="share-title">{shareable.title}</h2>
        </div>

        <div class="share-footer">
          <span class="share-date">{formatShareDate(shareable.date)}</span>
        </div>

        {/* Kusama-style dots decoration */}
        <div class="share-dots" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              class="share-dot"
              style={{
                left: `${10 + (i % 4) * 25}%`,
                top: `${10 + Math.floor(i / 4) * 30}%`,
                opacity: 0.1 + Math.random() * 0.15
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
```

### CSS for Share Card

```css
.share-card {
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
}

.share-card--export {
  width: 600px;
  height: 600px;
  max-width: none;
}

.share-card-inner {
  position: relative;
  background: linear-gradient(
    145deg,
    var(--color-cream) 0%,
    var(--color-sage-pale) 100%
  );
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  overflow: hidden;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.share-logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.share-logo-icon {
  font-size: 1.5rem;
}

.share-logo-text {
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-sage);
}

.share-content {
  text-align: center;
  position: relative;
  z-index: 1;
}

.share-stat {
  display: block;
  font-family: var(--font-display);
  font-size: 5rem;
  font-weight: 700;
  color: var(--color-terracotta);
  line-height: 1;
}

.share-stat-label {
  display: block;
  font-size: 1.25rem;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: var(--space-1);
}

.share-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  margin: var(--space-4) 0 0;
}

.share-footer {
  text-align: center;
}

.share-date {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.share-dots {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.share-dot {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-terracotta);
}
```

### Share Modal

```jsx
// src/components/ShareModal.jsx
import { useRef } from 'preact/hooks'

export function ShareModal({ shareable, onClose }) {
  const cardRef = useRef()

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareable.title,
          text: shareable.message,
          // url: optional app URL
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err)
        }
      }
    }
  }

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareable.message)
      // Show toast: "Copied!"
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const handleDownloadImage = async () => {
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null
      })
      const link = document.createElement('a')
      link.download = `achievement-${shareable.type}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Download failed:', err)
    }
  }

  return (
    <Modal title="Share Achievement" onClose={onClose}>
      <div class="share-preview" ref={cardRef}>
        <ShareCard shareable={shareable} forExport />
      </div>

      <div class="share-actions">
        {navigator.share && (
          <button class="share-btn share-btn--primary" onClick={handleShare}>
            📤 Share
          </button>
        )}
        <button class="share-btn" onClick={handleCopyText}>
          📋 Copy Text
        </button>
        <button class="share-btn" onClick={handleDownloadImage}>
          📷 Save Image
        </button>
      </div>

      <div class="share-message-preview">
        <p>{shareable.message}</p>
      </div>
    </Modal>
  )
}
```

### Share Button Integration

```jsx
// Add to Celebration.jsx after goal reached
{showSharePrompt && (
  <button
    class="celebration-share-btn"
    onClick={() => openShareModal({
      type: SHAREABLE_EVENTS.GOAL_HIT,
      title: 'Goal Reached!',
      stat: '100%',
      statLabel: 'daily goal',
      message: 'I hit my calorie goal today! 🎯',
      date: currentDate
    })}
  >
    Share 📤
  </button>
)}

// Add to StreakDisplay for milestone streaks
{isNewMilestone && (
  <button
    class="streak-share-btn"
    onClick={() => openShareModal({
      type: SHAREABLE_EVENTS.STREAK_MILESTONE,
      title: `${currentStreak}-Day Streak!`,
      stat: currentStreak.toString(),
      statLabel: 'days',
      message: `I just hit a ${currentStreak}-day tracking streak! 🔥`,
      date: formatDate(new Date())
    })}
  >
    Share
  </button>
)}
```

### Monthly Summary Shareable

```javascript
// Uses aggregateByDay from S-016 and formatMonthYear from above
import { aggregateByDay } from './trends'
import { formatMonthYear } from './sharing'

export function generateMonthlySummary(entries, goals, month) {
  const monthEntries = entries.filter(e =>
    e.date.startsWith(month) // "2025-01"
  )

  const dailyTotals = aggregateByDay(monthEntries)
  const daysLogged = dailyTotals.length
  const daysOnTarget = dailyTotals.filter(d =>
    d.calories >= goals.calories * 0.9 &&
    d.calories <= goals.calories * 1.1
  ).length

  const avgCalories = Math.round(
    dailyTotals.reduce((sum, d) => sum + d.calories, 0) / daysLogged
  )

  return {
    type: SHAREABLE_EVENTS.MONTHLY_SUMMARY,
    title: `${formatMonthYear(month)} Summary`,
    stat: `${daysOnTarget}/${daysLogged}`,
    statLabel: 'days on target',
    message: `My ${formatMonthYear(month)} recap: ${daysOnTarget} days on target, averaging ${avgCalories} cal/day. 📊`,
    date: new Date().toISOString()
  }
}
```

## Acceptance Criteria

- [ ] Share card renders with achievement data
- [ ] Web Share API works on supported devices
- [ ] Copy text fallback works
- [ ] Download as PNG works
- [ ] Streak milestones are shareable
- [ ] Goal completion is shareable
- [ ] Monthly summary shareable
- [ ] Card has branded design (logo, colors)
- [ ] Kusama dots decoration on card
- [ ] Image is high quality (2x scale)

## Files to Create/Modify

- `src/components/ShareCard.jsx` — Create
- `src/components/ShareModal.jsx` — Create
- `src/utils/sharing.js` — Create
- `src/components/Celebration.jsx` — Add share button
- `src/components/StreakDisplay.jsx` — Add share button
- `src/styles.css` — Share styling

## Dependencies

- `html2canvas` — For image generation (add to package.json)

## Test Plan

1. Hit goal → share button appears after celebration?
2. Tap share → modal opens with preview?
3. Web Share API (mobile) → opens share sheet?
4. Copy text → clipboard contains message?
5. Download image → PNG saved?
6. Share card looks good at 600x600?
7. Monthly summary generates correctly?

## Privacy Considerations

- No personal data in shared content
- User explicitly triggers share
- No automatic posting
- No tracking of shared content
