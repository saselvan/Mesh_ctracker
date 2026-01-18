# Tests: Gentle Coaching Messages

id: T-010
spec: S-010 (specs/10-coaching-messages.md)

---

## Functional Tests

### Scenario: Morning empty message

**Given:** It's 8:00 AM
**And:** No entries logged today
**When:** getMessage is called
**Then:** Returns a message from morning_empty category
**And:** Message is one of: "Good morning!...", "A new day...", "What's for breakfast?"

### Scenario: Progress good message

**Given:** Calories are at 50% of goal
**When:** getMessage is called
**Then:** Returns a message from progress_good category
**And:** Tone is encouraging

### Scenario: Near goal message

**Given:** Calories are at 90% of goal
**When:** getMessage is called
**Then:** Returns a message from near_goal category
**And:** Message like "Almost there!" or "Looking good!"

### Scenario: Goal reached message

**Given:** Calories are at 100% of goal
**When:** getMessage is called
**Then:** Returns a message from goal_reached category
**And:** Message is celebratory but calm

### Scenario: Over goal message

**Given:** Calories are at 115% of goal
**When:** getMessage is called
**Then:** Returns a message from over_goal category
**And:** Message is gentle, not shaming
**And:** Message like "A little over today. That's okay."

### Scenario: No message when under 30%

**Given:** Calories are at 20% of goal
**And:** It's afternoon
**When:** getMessage is called
**Then:** Returns null
**And:** CoachingMessage renders nothing

### Scenario: No message when goal is 0

**Given:** Goal is 0 or not set
**When:** getMessage is called
**Then:** Returns null (not NaN or error)
**And:** Division by zero is guarded

### Scenario: No message when goal is undefined

**Given:** goals.calories is undefined
**When:** getMessage is called
**Then:** Returns null safely
**And:** No JavaScript error thrown

---

## Edge Cases

### Scenario: Messages rotate randomly

**Given:** Context stays the same
**When:** getMessage is called multiple times
**Then:** Different messages returned (not always same one)
**And:** All messages are from correct category

### Scenario: Exactly at thresholds

**Given:** Ratio is exactly 0.85 (85%)
**When:** getMessage is called
**Then:** Returns near_goal message (includes boundary)

**Given:** Ratio is exactly 1.0 (100%)
**When:** getMessage is called
**Then:** Returns goal_reached message

### Scenario: Streak encouragement

**Given:** User has 5-day streak
**When:** Context includes streak data
**Then:** May return streak message like "Keep the streak alive!"

---

## Tone Validation Tests

### Scenario: No shaming language

**Given:** All messages in MESSAGES object
**When:** I audit message content
**Then:** No messages contain: "failed", "too much", "try harder"
**And:** All messages are supportive

### Scenario: Over-goal messages are gentle

**Given:** over_goal messages array
**When:** I review each message
**Then:** All acknowledge without judgment
**And:** Focus on future ("Tomorrow's a new day")

---

## Non-Functional Tests

### Performance

| Metric | Target | Test Method |
|--------|--------|-------------|
| getMessage execution | < 1ms | Timing |
| pickRandom | O(1) | Array length access |

### Accessibility

| Check | Tool | Pass Criteria |
|-------|------|---------------|
| Message readable | axe-core | Proper contrast |
| Not announced repeatedly | aria-live | polite, not assertive |

---

## Unit Test Implementation

```javascript
// src/utils/__tests__/messages.test.js
import { getMessage, MESSAGES, pickRandom } from '../messages'

describe('getMessage', () => {
  it('returns morning_empty message in morning with no entries', () => {
    const context = {
      totals: { calories: 0 },
      goals: { calories: 2000 },
      timeOfDay: 'morning',
      streak: 0,
      hasEntries: false
    }

    const message = getMessage(context)
    expect(MESSAGES.morning_empty).toContain(message)
  })

  it('returns progress_good for 30-84% ratio', () => {
    const context = {
      totals: { calories: 1000 },
      goals: { calories: 2000 },
      timeOfDay: 'afternoon',
      hasEntries: true
    }

    const message = getMessage(context)
    expect(MESSAGES.progress_good).toContain(message)
  })

  it('returns near_goal for 85-99% ratio', () => {
    const context = {
      totals: { calories: 1800 },
      goals: { calories: 2000 },
      hasEntries: true
    }

    const message = getMessage(context)
    expect(MESSAGES.near_goal).toContain(message)
  })

  it('returns goal_reached for 100-109% ratio', () => {
    const context = {
      totals: { calories: 2050 },
      goals: { calories: 2000 },
      hasEntries: true
    }

    const message = getMessage(context)
    expect(MESSAGES.goal_reached).toContain(message)
  })

  it('returns over_goal for 110%+ ratio', () => {
    const context = {
      totals: { calories: 2300 },
      goals: { calories: 2000 },
      hasEntries: true
    }

    const message = getMessage(context)
    expect(MESSAGES.over_goal).toContain(message)
  })

  it('returns null for low progress outside morning', () => {
    const context = {
      totals: { calories: 400 },
      goals: { calories: 2000 },
      timeOfDay: 'afternoon',
      hasEntries: true
    }

    expect(getMessage(context)).toBeNull()
  })

  it('returns null when goal is 0 (division guard)', () => {
    const context = {
      totals: { calories: 1000 },
      goals: { calories: 0 },
      timeOfDay: 'afternoon',
      hasEntries: true
    }

    expect(getMessage(context)).toBeNull()
  })

  it('returns null when goal is undefined', () => {
    const context = {
      totals: { calories: 1000 },
      goals: {},
      timeOfDay: 'afternoon',
      hasEntries: true
    }

    expect(getMessage(context)).toBeNull()
  })

  it('does not throw when goals.calories is missing', () => {
    const context = {
      totals: { calories: 1000 },
      goals: null,
      timeOfDay: 'afternoon',
      hasEntries: true
    }

    expect(() => getMessage(context)).not.toThrow()
  })
})

describe('pickRandom', () => {
  it('returns item from array', () => {
    const arr = ['a', 'b', 'c']
    const result = pickRandom(arr)
    expect(arr).toContain(result)
  })

  it('returns different items over many calls', () => {
    const arr = ['a', 'b', 'c', 'd', 'e']
    const results = new Set()

    for (let i = 0; i < 100; i++) {
      results.add(pickRandom(arr))
    }

    // Should have picked at least 3 different items in 100 tries
    expect(results.size).toBeGreaterThanOrEqual(3)
  })
})
```

---

## Component Test

```javascript
// src/components/__tests__/CoachingMessage.test.jsx
import { render } from '@testing-library/preact'
import { CoachingMessage } from '../CoachingMessage'

describe('CoachingMessage', () => {
  it('renders message when provided', () => {
    const { getByText } = render(
      <CoachingMessage message="You're doing great!" />
    )
    expect(getByText("You're doing great!")).toBeTruthy()
  })

  it('renders nothing when message is null', () => {
    const { container } = render(
      <CoachingMessage message={null} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('applies coaching-message class', () => {
    const { container } = render(
      <CoachingMessage message="Test" />
    )
    expect(container.querySelector('.coaching-message')).toBeTruthy()
  })

  it('text is italic styled', () => {
    const { container } = render(
      <CoachingMessage message="Test" />
    )
    const styles = getComputedStyle(container.firstChild)
    expect(styles.fontStyle).toBe('italic')
  })
})
```

---

## Tone Audit Script

```javascript
// scripts/audit-message-tone.js
import { MESSAGES } from '../src/utils/messages'

const BANNED_WORDS = [
  'failed', 'failure', 'bad', 'terrible',
  'too much', 'try harder', 'disappointed',
  'lazy', 'wrong', 'mistake', 'ruined'
]

let issues = []

Object.entries(MESSAGES).forEach(([category, messages]) => {
  messages.forEach(msg => {
    BANNED_WORDS.forEach(word => {
      if (msg.toLowerCase().includes(word)) {
        issues.push(`[${category}] "${msg}" contains banned word: "${word}"`)
      }
    })
  })
})

if (issues.length > 0) {
  console.error('Tone issues found:')
  issues.forEach(i => console.error(`  - ${i}`))
  process.exit(1)
} else {
  console.log('✓ All messages pass tone check')
}
```
