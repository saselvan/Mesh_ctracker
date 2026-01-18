# Tests: Share Achievements

id: T-018
spec: S-018 (specs/18-share-achievements.md)

---

## Functional Tests

### Scenario: ShareCard renders correctly

**Given:** Shareable data for 30-day streak
**When:** ShareCard renders
**Then:** Shows "30" as main stat
**And:** Shows "days" as label
**And:** Shows "30-Day Streak!" as title
**And:** Has branded styling with Kusama dots

### Scenario: Web Share API works

**Given:** Browser supports navigator.share
**When:** User clicks Share button
**Then:** Native share sheet opens
**And:** Contains title and message

### Scenario: Copy text fallback

**Given:** Share modal is open
**When:** User clicks "Copy Text"
**Then:** Message copied to clipboard
**And:** Toast confirms "Copied!"

### Scenario: Download PNG works

**Given:** Share modal open
**When:** User clicks "Save Image"
**Then:** PNG file downloads
**And:** Image is 600x600 at 2x scale
**And:** Contains branded card design

---

## Edge Cases

### Scenario: Browser without Web Share API

**Given:** navigator.share is undefined
**When:** ShareModal renders
**Then:** Share button not shown
**And:** Copy and Download still available

### Scenario: Monthly summary generation

**Given:** January has 20 days logged, 15 on target
**When:** generateMonthlySummary called
**Then:** stat shows "15/20"
**And:** message includes averages

---

## Unit Tests

```javascript
// src/utils/__tests__/sharing.test.js
import { generateMonthlySummary, SHAREABLE_EVENTS } from '../sharing'

describe('generateMonthlySummary', () => {
  const entries = Array.from({ length: 20 }, (_, i) => ({
    date: `2025-01-${String(i + 1).padStart(2, '0')}`,
    calories: i < 15 ? 2000 : 1500 // 15 on target
  }))
  const goals = { calories: 2000 }

  it('generates correct stat', () => {
    const result = generateMonthlySummary(entries, goals, '2025-01')
    expect(result.stat).toBe('15/20')
    expect(result.statLabel).toBe('days on target')
  })

  it('includes type', () => {
    const result = generateMonthlySummary(entries, goals, '2025-01')
    expect(result.type).toBe(SHAREABLE_EVENTS.MONTHLY_SUMMARY)
  })

  it('generates readable message', () => {
    const result = generateMonthlySummary(entries, goals, '2025-01')
    expect(result.message).toContain('January 2025')
    expect(result.message).toContain('15 days on target')
  })
})
```

---

## Component Tests

```javascript
// src/components/__tests__/ShareCard.test.jsx
import { render } from '@testing-library/preact'
import { ShareCard } from '../ShareCard'

describe('ShareCard', () => {
  const shareable = {
    type: 'streak_milestone',
    title: '30-Day Streak!',
    stat: '30',
    statLabel: 'days',
    message: 'I hit a 30-day streak!',
    date: '2025-01-17'
  }

  it('renders stat prominently', () => {
    const { getByText } = render(<ShareCard shareable={shareable} />)
    expect(getByText('30')).toBeTruthy()
  })

  it('renders stat label', () => {
    const { getByText } = render(<ShareCard shareable={shareable} />)
    expect(getByText('days')).toBeTruthy()
  })

  it('renders title', () => {
    const { getByText } = render(<ShareCard shareable={shareable} />)
    expect(getByText('30-Day Streak!')).toBeTruthy()
  })

  it('includes decorative dots', () => {
    const { container } = render(<ShareCard shareable={shareable} />)
    const dots = container.querySelectorAll('.share-dot')
    expect(dots.length).toBeGreaterThan(0)
  })

  it('has 1:1 aspect ratio', () => {
    const { container } = render(<ShareCard shareable={shareable} />)
    const card = container.querySelector('.share-card-inner')
    expect(getComputedStyle(card).aspectRatio).toBe('1')
  })
})

// src/components/__tests__/ShareModal.test.jsx
import { render, fireEvent } from '@testing-library/preact'
import { ShareModal } from '../ShareModal'

describe('ShareModal', () => {
  const shareable = {
    title: 'Goal Reached!',
    message: 'I hit my calorie goal!'
  }

  it('renders preview card', () => {
    const { container } = render(
      <ShareModal shareable={shareable} onClose={() => {}} />
    )
    expect(container.querySelector('.share-card')).toBeTruthy()
  })

  it('shows copy button', () => {
    const { getByText } = render(
      <ShareModal shareable={shareable} onClose={() => {}} />
    )
    expect(getByText(/copy text/i)).toBeTruthy()
  })

  it('shows download button', () => {
    const { getByText } = render(
      <ShareModal shareable={shareable} onClose={() => {}} />
    )
    expect(getByText(/save image/i)).toBeTruthy()
  })

  it('copies text to clipboard', async () => {
    const mockClipboard = { writeText: vi.fn().mockResolvedValue(undefined) }
    Object.assign(navigator, { clipboard: mockClipboard })

    const { getByText } = render(
      <ShareModal shareable={shareable} onClose={() => {}} />
    )
    fireEvent.click(getByText(/copy text/i))

    expect(mockClipboard.writeText).toHaveBeenCalledWith(shareable.message)
  })
})
```

---

## Visual Test

```javascript
// e2e/share-card.spec.js
test('share card renders branded design', async ({ page }) => {
  // Trigger a shareable event
  await page.goto('/?streak=30')

  const modal = page.locator('.share-modal')
  const card = modal.locator('.share-card')

  await expect(card).toHaveScreenshot('share-card-30-day-streak.png')
})
```
