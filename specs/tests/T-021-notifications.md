# Tests: Gentle Reminder Notifications

id: T-021
spec: S-021 (specs/21-notifications.md)

---

## Functional Tests

### Scenario: Permission request flow

**Given:** Notifications never requested
**When:** User enables reminders
**Then:** Browser permission prompt appears
**When:** User grants permission
**Then:** Settings UI shows enabled state

### Scenario: Denied permission state

**Given:** User previously denied notifications
**When:** NotificationSettings renders
**Then:** Shows "blocked" message
**And:** Instructs to enable in browser settings

### Scenario: Schedule meal reminders

**Given:** Notifications enabled
**When:** User enables breakfast at 8:00 AM
**Then:** Reminder scheduled for 8:00 AM daily
**And:** Notification contains friendly message

### Scenario: Messages rotate randomly

**Given:** Breakfast reminder set
**When:** Multiple days pass
**Then:** Different messages shown each day
**And:** All messages from breakfast category

---

## Edge Cases

### Scenario: Quiet hours respected

**Given:** Quiet hours 10pm-7am set
**When:** Scheduled reminder at 11pm
**Then:** Notification not sent
**And:** Sent at 7am instead

### Scenario: Streak at risk reminder

**Given:** User has 5-day streak
**And:** No entries logged today by 8pm
**When:** Evening check runs
**Then:** Streak warning notification sent
**And:** Message includes streak count

---

## Unit Tests

```javascript
// src/utils/__tests__/notifications.test.js
import {
  requestNotificationPermission,
  getNotificationSettings,
  saveNotificationSettings,
  getRandomMessage
} from '../notifications'

describe('requestNotificationPermission', () => {
  it('returns granted when already granted', async () => {
    Object.defineProperty(Notification, 'permission', { value: 'granted' })
    const result = await requestNotificationPermission()
    expect(result).toBe('granted')
  })

  it('returns denied when blocked', async () => {
    Object.defineProperty(Notification, 'permission', { value: 'denied' })
    const result = await requestNotificationPermission()
    expect(result).toBe('denied')
  })

  it('returns unsupported when not available', async () => {
    delete window.Notification
    const result = await requestNotificationPermission()
    expect(result).toBe('unsupported')
  })
})

describe('getNotificationSettings', () => {
  beforeEach(() => localStorage.clear())

  it('returns defaults when no settings', () => {
    const settings = getNotificationSettings('test')
    expect(settings.enabled).toBe(false)
    expect(settings.reminders.breakfast.time).toBe('08:00')
  })

  it('merges stored with defaults', () => {
    localStorage.setItem('notification-settings-test', JSON.stringify({
      enabled: true
    }))
    const settings = getNotificationSettings('test')
    expect(settings.enabled).toBe(true)
    expect(settings.reminders).toBeDefined() // From defaults
  })
})

describe('getRandomMessage', () => {
  it('returns message from correct category', () => {
    const MESSAGES = {
      breakfast: ['Msg1', 'Msg2', 'Msg3']
    }
    const msg = getRandomMessage('breakfast')
    expect(MESSAGES.breakfast).toContain(msg)
  })

  it('substitutes streak count', () => {
    const msg = getRandomMessage('streakWarning', { streak: 5 })
    expect(msg).toContain('5')
  })
})
```

---

## Component Tests

```javascript
// src/components/__tests__/NotificationSettings.test.jsx
import { render, fireEvent, waitFor } from '@testing-library/preact'
import { NotificationSettings } from '../NotificationSettings'

describe('NotificationSettings', () => {
  beforeEach(() => {
    localStorage.clear()
    Object.defineProperty(Notification, 'permission', { value: 'default', configurable: true })
  })

  it('shows enable button when not enabled', () => {
    const { getByText } = render(<NotificationSettings profileId="test" />)
    expect(getByText(/enable reminders/i)).toBeTruthy()
  })

  it('shows blocked message when denied', () => {
    Object.defineProperty(Notification, 'permission', { value: 'denied' })
    const { getByText } = render(<NotificationSettings profileId="test" />)
    expect(getByText(/blocked/i)).toBeTruthy()
  })

  it('shows meal toggles when enabled', () => {
    localStorage.setItem('notification-settings-test', JSON.stringify({ enabled: true }))
    Object.defineProperty(Notification, 'permission', { value: 'granted' })

    const { getByText } = render(<NotificationSettings profileId="test" />)
    expect(getByText('Breakfast')).toBeTruthy()
    expect(getByText('Lunch')).toBeTruthy()
    expect(getByText('Dinner')).toBeTruthy()
  })

  it('saves settings on toggle', () => {
    localStorage.setItem('notification-settings-test', JSON.stringify({ enabled: true }))
    Object.defineProperty(Notification, 'permission', { value: 'granted' })

    const { getByLabelText } = render(<NotificationSettings profileId="test" />)
    fireEvent.click(getByLabelText('Breakfast'))

    const saved = JSON.parse(localStorage.getItem('notification-settings-test'))
    expect(saved.reminders.breakfast.enabled).toBe(true)
  })

  it('allows time customization', () => {
    localStorage.setItem('notification-settings-test', JSON.stringify({
      enabled: true,
      reminders: { breakfast: { enabled: true, time: '08:00' } }
    }))
    Object.defineProperty(Notification, 'permission', { value: 'granted' })

    const { container } = render(<NotificationSettings profileId="test" />)
    const timeInput = container.querySelector('input[type="time"]')

    fireEvent.change(timeInput, { target: { value: '07:30' } })

    const saved = JSON.parse(localStorage.getItem('notification-settings-test'))
    expect(saved.reminders.breakfast.time).toBe('07:30')
  })
})
```

---

## Service Worker Notification Tests

```javascript
// sw.test.js (run in SW context)
describe('SW Notification handling', () => {
  it('shows notification with correct content', async () => {
    const showSpy = vi.spyOn(self.registration, 'showNotification')

    await checkAndSendNotifications()

    expect(showSpy).toHaveBeenCalledWith(
      'Calorie Tracker',
      expect.objectContaining({
        body: expect.any(String),
        icon: '/icons/icon-192.png'
      })
    )
  })

  it('handles notification click', async () => {
    const openSpy = vi.spyOn(clients, 'openWindow')

    await handleNotificationClick({ action: 'log' })

    expect(openSpy).toHaveBeenCalledWith('/?action=add')
  })
})
```
