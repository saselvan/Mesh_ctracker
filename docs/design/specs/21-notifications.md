# Spec: Gentle Reminder Notifications

**Phase:** 6 - Polish & Accessibility
**Artist Influence:** Headspace (non-intrusive, mindful prompts)
**Priority:** Low
**Estimated Effort:** Medium

---

## Overview

Optional push notifications to remind users to log meals. Notifications should feel like gentle nudges from a supportive friend, not nagging alerts. Users control timing and can disable completely.

## Requirements

### Permission Request

```javascript
// src/utils/notifications.js
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return 'unsupported'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  if (Notification.permission === 'denied') {
    return 'denied'
  }

  const permission = await Notification.requestPermission()
  return permission
}

export function getNotificationStatus() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}
```

### Notification Settings

```javascript
// Stored in localStorage: notification-settings-{profileId}
const DEFAULT_SETTINGS = {
  enabled: false,
  reminders: {
    breakfast: { enabled: false, time: '08:00' },
    lunch: { enabled: false, time: '12:30' },
    dinner: { enabled: false, time: '18:30' },
    evening: { enabled: false, time: '20:00' } // "Did you log today?"
  },
  streakReminder: true, // Remind if about to lose streak
  quietHours: { start: '22:00', end: '07:00' }
}

export function getNotificationSettings(profileId) {
  const key = profileId ? `notification-settings-${profileId}` : 'notification-settings'
  const stored = localStorage.getItem(key)
  return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS
}

export function saveNotificationSettings(profileId, settings) {
  const key = profileId ? `notification-settings-${profileId}` : 'notification-settings'
  localStorage.setItem(key, JSON.stringify(settings))
  scheduleNotifications(profileId, settings)
}
```

### Notification Messages

```javascript
const MESSAGES = {
  breakfast: [
    "Good morning! Ready to log breakfast? 🌅",
    "Rise and shine! What's fueling your day?",
    "Morning! Quick check-in before you start."
  ],
  lunch: [
    "Lunchtime! What's on the menu?",
    "Midday check-in. How's your day going?",
    "Taking a break? Perfect time to log."
  ],
  dinner: [
    "Evening! Time to log dinner?",
    "Winding down? Let's capture dinner.",
    "Dinner time. A few taps and you're done."
  ],
  evening: [
    "Quick check: did you log everything today?",
    "Day's almost done. Anything to add?",
    "Before you relax — all logged for today?"
  ],
  streakWarning: [
    "Your {n}-day streak is at risk! Log today to keep it.",
    "Don't let your streak slip! Just a quick log.",
    "One entry keeps your {n}-day streak alive."
  ]
}

export function getRandomMessage(type, data = {}) {
  const messages = MESSAGES[type] || MESSAGES.evening
  const message = messages[Math.floor(Math.random() * messages.length)]
  return message.replace('{n}', data.streak || '')
}
```

### Scheduling Notifications

```javascript
// Service worker handles actual scheduling
export function scheduleNotifications(profileId, settings) {
  if (!settings.enabled) {
    cancelAllNotifications()
    return
  }

  // Store schedule in localStorage for SW to read
  const schedule = []

  for (const [meal, config] of Object.entries(settings.reminders)) {
    if (config.enabled) {
      schedule.push({
        id: `${profileId}-${meal}`,
        type: meal,
        time: config.time,
        recurring: true
      })
    }
  }

  localStorage.setItem('notification-schedule', JSON.stringify(schedule))

  // Trigger SW to update schedule
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'UPDATE_NOTIFICATION_SCHEDULE',
      schedule
    })
  }
}
```

### Service Worker Notification Handler

```javascript
// In sw.js
self.addEventListener('message', (event) => {
  if (event.data.type === 'UPDATE_NOTIFICATION_SCHEDULE') {
    updateSchedule(event.data.schedule)
  }
})

// Check schedule periodically
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-notifications') {
    event.waitUntil(checkAndSendNotifications())
  }
})

async function checkAndSendNotifications() {
  const schedule = await getSchedule()
  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  for (const item of schedule) {
    if (shouldNotify(item, currentTime)) {
      await showNotification(item)
    }
  }
}

async function showNotification(item) {
  const message = getRandomMessage(item.type)

  await self.registration.showNotification('Calorie Tracker', {
    body: message,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    tag: item.id, // Prevents duplicates
    renotify: false,
    requireInteraction: false,
    actions: [
      { action: 'log', title: 'Log Now' },
      { action: 'dismiss', title: 'Later' }
    ]
  })
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'log') {
    event.waitUntil(
      clients.openWindow('/?action=add')
    )
  }
})
```

### Notification Settings UI

```jsx
// src/components/NotificationSettings.jsx
export function NotificationSettings({ profileId }) {
  const [settings, setSettings] = useState(getNotificationSettings(profileId))
  const [permission, setPermission] = useState(getNotificationStatus())

  const handleEnable = async () => {
    const result = await requestNotificationPermission()
    setPermission(result)

    if (result === 'granted') {
      const newSettings = { ...settings, enabled: true }
      setSettings(newSettings)
      saveNotificationSettings(profileId, newSettings)
    }
  }

  const handleToggleReminder = (meal) => {
    const newSettings = {
      ...settings,
      reminders: {
        ...settings.reminders,
        [meal]: {
          ...settings.reminders[meal],
          enabled: !settings.reminders[meal].enabled
        }
      }
    }
    setSettings(newSettings)
    saveNotificationSettings(profileId, newSettings)
  }

  const handleTimeChange = (meal, time) => {
    const newSettings = {
      ...settings,
      reminders: {
        ...settings.reminders,
        [meal]: { ...settings.reminders[meal], time }
      }
    }
    setSettings(newSettings)
    saveNotificationSettings(profileId, newSettings)
  }

  if (permission === 'unsupported') {
    return <p class="text-muted">Notifications not supported in this browser.</p>
  }

  if (permission === 'denied') {
    return (
      <div class="notification-denied">
        <p>Notifications are blocked. Enable in browser settings to receive reminders.</p>
      </div>
    )
  }

  if (!settings.enabled) {
    return (
      <div class="notification-prompt">
        <p>Get gentle reminders to log your meals?</p>
        <button class="btn btn-secondary" onClick={handleEnable}>
          Enable Reminders
        </button>
      </div>
    )
  }

  return (
    <div class="notification-settings">
      <h4>Meal Reminders</h4>

      {Object.entries(settings.reminders).map(([meal, config]) => (
        <div key={meal} class="reminder-row">
          <label class="reminder-toggle">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={() => handleToggleReminder(meal)}
            />
            <span class="reminder-label">{capitalize(meal)}</span>
          </label>
          {config.enabled && (
            <input
              type="time"
              value={config.time}
              onChange={(e) => handleTimeChange(meal, e.target.value)}
              class="reminder-time"
            />
          )}
        </div>
      ))}

      <div class="reminder-row">
        <label class="reminder-toggle">
          <input
            type="checkbox"
            checked={settings.streakReminder}
            onChange={() => {
              const newSettings = { ...settings, streakReminder: !settings.streakReminder }
              setSettings(newSettings)
              saveNotificationSettings(profileId, newSettings)
            }}
          />
          <span class="reminder-label">Streak at risk reminder</span>
        </label>
      </div>
    </div>
  )
}
```

### CSS Styling

```css
.notification-settings {
  padding: var(--space-3) 0;
}

.reminder-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border);
}

.reminder-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.reminder-toggle input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: var(--color-sage);
}

.reminder-label {
  font-weight: 500;
}

.reminder-time {
  padding: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}

.notification-prompt {
  text-align: center;
  padding: var(--space-4);
  background: var(--color-sage-pale);
  border-radius: var(--radius-md);
}

.notification-denied {
  padding: var(--space-3);
  background: rgba(193, 123, 95, 0.1);
  border-radius: var(--radius-md);
  color: var(--color-terracotta);
}
```

## Acceptance Criteria

- [ ] Permission request shows native prompt
- [ ] Can enable/disable reminders per meal
- [ ] Custom time for each reminder
- [ ] Streak-at-risk reminder (if enabled)
- [ ] Quiet hours respected
- [ ] Notifications non-intrusive
- [ ] Tapping notification opens app
- [ ] "Log Now" action opens entry form
- [ ] Works when app is closed (via SW)
- [ ] Messages rotate randomly

## Files to Create/Modify

- `src/utils/notifications.js` — Create
- `src/components/NotificationSettings.jsx` — Create
- `src/components/Settings.jsx` — Add notifications section
- `public/sw.js` — Add notification handling
- `src/styles.css` — Notification settings styling

## Test Plan

1. First enable → permission prompt appears?
2. Grant permission → can set reminders?
3. Set breakfast at 8am → notification arrives?
4. Tap notification → app opens?
5. Tap "Log Now" → goes to entry form?
6. Deny permission → shows blocked message?
7. Disable all → no more notifications?

## Privacy Considerations

- Notifications are completely optional
- No notification content sent to server
- All scheduling done locally
- Clear explanation of what notifications do
