# Phase 7: Polish

Dark mode, PWA support, notifications, and accessibility.

**Prerequisite:** Phases 1-6 complete

## Tech Stack
- vite-plugin-pwa
- Notification API
- ARIA attributes
- Service Worker

## Specs to Implement

### S-019: Dark Mode

**Files to create:**
- CREATE `src/components/ThemeToggle.jsx`

**Files to modify:**
- MODIFY `src/utils/theme.js` (add preference management)
- MODIFY `src/components/Settings.jsx` (add toggle)
- MODIFY `src/styles.css` (ensure dark theme contrast)

**Implementation:**

```javascript
// Add to src/utils/theme.js
export function getThemePreference() {
  return localStorage.getItem('theme-preference') || 'auto'
}

export function setThemePreference(preference) {
  localStorage.setItem('theme-preference', preference)
  applyTheme()
}

// Update applyTheme to check preference
export function applyTheme() {
  const preference = getThemePreference()

  if (preference === 'dark') {
    document.body.className = 'theme-night'
    return
  }

  if (preference === 'light') {
    document.body.className = 'theme-midday'
    return
  }

  // Auto: use time of day
  const period = getTimeOfDay()
  document.body.className = `theme-${period}`
}
```

```jsx
// src/components/ThemeToggle.jsx
import { getThemePreference, setThemePreference } from '../utils/theme'

export function ThemeToggle() {
  const [preference, setPreference] = useState(getThemePreference())

  const options = [
    { value: 'auto', label: 'Auto' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' }
  ]

  const handleChange = (value) => {
    setPreference(value)
    setThemePreference(value)
  }

  return (
    <div class="theme-toggle">
      <label>Theme:</label>
      <div class="theme-options">
        {options.map(opt => (
          <button
            key={opt.value}
            class={preference === opt.value ? 'active' : ''}
            onClick={() => handleChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
```

**Ensure dark theme contrast (>4.5:1) in styles.css:**
```css
.theme-night {
  --color-cream: #1A1A1A;
  --color-espresso: #F0F0F0;
  --color-sage: #A8C090;
  --color-terracotta: #E0907A;
  --bg-surface: #2A2A2A;
  --color-muted: #888888;
}
```

**Test:** `docs/design/tests/T-019-dark-mode.md`

---

### S-020: PWA Offline

**Files to create:**
- CREATE `public/manifest.json`
- CREATE `public/icons/icon-192.png` (generate from app icon)
- CREATE `public/icons/icon-512.png` (generate from app icon)
- CREATE `src/components/InstallPrompt.jsx`
- CREATE `src/components/OfflineIndicator.jsx`

**Files to modify:**
- MODIFY `vite.config.js` (add PWA plugin)
- MODIFY `index.html` (add manifest link)

**Implementation:**

1. Install plugin:
```bash
npm install -D vite-plugin-pwa
```

2. Update vite.config.js:
```javascript
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'Calorie Tracker',
        short_name: 'Calories',
        description: 'Track your daily calories and macros',
        theme_color: '#8B9D82',
        background_color: '#FDF6F0',
        display: 'standalone',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})
```

3. Create manifest.json (backup):
```json
{
  "name": "Calorie Tracker",
  "short_name": "Calories",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FDF6F0",
  "theme_color": "#8B9D82",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

4. **CRITICAL: Create icon files**
```bash
# Create simple icons (replace with actual app icon)
mkdir -p public/icons
# Generate 192x192 and 512x512 PNG icons
# Can use any image editor or online tool
```

5. Components:
```jsx
// src/components/InstallPrompt.jsx
import { useState, useEffect } from 'preact/hooks'

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div class="install-prompt">
      <p>Install Calorie Tracker for quick access!</p>
      <button onClick={handleInstall}>Install</button>
      <button onClick={() => setShowPrompt(false)}>Not now</button>
    </div>
  )
}
```

```jsx
// src/components/OfflineIndicator.jsx
import { useState, useEffect } from 'preact/hooks'

export function OfflineIndicator() {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (online) return null

  return (
    <div class="offline-indicator" role="alert">
      You're offline. Changes will sync when reconnected.
    </div>
  )
}
```

6. Add to index.html:
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#8B9D82">
```

**Test:** `docs/design/tests/T-020-pwa-offline.md`

---

### S-021: Notifications

**Files to create:**
- CREATE `src/utils/notifications.js`

**Files to modify:**
- MODIFY `src/components/Settings.jsx` (add notification toggles)

**Implementation:**

```javascript
// src/utils/notifications.js
export async function requestPermission() {
  if (!('Notification' in window)) {
    return 'unsupported'
  }

  const permission = await Notification.requestPermission()
  return permission
}

export function getNotificationSettings(profileId) {
  const key = `notifications-${profileId || 'default'}`
  const stored = localStorage.getItem(key)
  return stored ? JSON.parse(stored) : {
    enabled: false,
    breakfast: true,
    lunch: true,
    dinner: true
  }
}

export function saveNotificationSettings(profileId, settings) {
  const key = `notifications-${profileId || 'default'}`
  localStorage.setItem(key, JSON.stringify(settings))
}

export function scheduleReminder(title, body, tag) {
  if (Notification.permission !== 'granted') return

  new Notification(title, {
    body,
    tag,
    icon: '/icons/icon-192.png'
  })
}

// Check and send streak warning
export function checkStreakWarning(streakData) {
  if (!streakData.current || streakData.current < 3) return

  const lastSuccess = new Date(streakData.lastSuccessDate)
  const today = new Date()
  const daysSince = Math.floor((today - lastSuccess) / (1000 * 60 * 60 * 24))

  if (daysSince >= 1) {
    scheduleReminder(
      'Streak Alert! 🔥',
      `Don't break your ${streakData.current}-day streak! Log your meals today.`,
      'streak-warning'
    )
  }
}
```

**Settings.jsx additions:**
```jsx
import { requestPermission, getNotificationSettings, saveNotificationSettings } from '../utils/notifications'

const [notifSettings, setNotifSettings] = useState(getNotificationSettings(profileId))
const [permissionStatus, setPermissionStatus] = useState(Notification.permission)

const handleEnableNotifications = async () => {
  const result = await requestPermission()
  setPermissionStatus(result)
  if (result === 'granted') {
    const newSettings = { ...notifSettings, enabled: true }
    setNotifSettings(newSettings)
    saveNotificationSettings(profileId, newSettings)
  }
}

// Render toggle:
<div class="notification-settings">
  <h4>Notifications</h4>
  {permissionStatus === 'denied' ? (
    <p>Notifications blocked. Enable in browser settings.</p>
  ) : notifSettings.enabled ? (
    <>
      <label><input type="checkbox" checked={notifSettings.breakfast} onChange={...} /> Breakfast reminder (8am)</label>
      <label><input type="checkbox" checked={notifSettings.lunch} onChange={...} /> Lunch reminder (12pm)</label>
      <label><input type="checkbox" checked={notifSettings.dinner} onChange={...} /> Dinner reminder (6pm)</label>
    </>
  ) : (
    <button onClick={handleEnableNotifications}>Enable Notifications</button>
  )}
</div>
```

**Test:** `docs/design/tests/T-021-notifications.md`

---

### S-022: Accessibility

**Files to modify:**
- All component files (add ARIA)
- MODIFY `src/styles.css` (focus indicators)
- MODIFY `index.html` (skip link, landmarks)

**Implementation:**

1. **Add skip-to-content link in index.html:**
```html
<body>
  <a href="#main-content" class="skip-link">Skip to content</a>
  <div id="app"></div>
</body>
```

2. **Add CSS for skip link and focus:**
```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-sage);
  color: white;
  padding: 8px;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}

/* Focus indicators for all interactive elements */
button:focus-visible,
input:focus-visible,
select:focus-visible,
a:focus-visible {
  outline: 2px solid var(--color-sage);
  outline-offset: 2px;
}

/* Remove default outline since we use focus-visible */
button:focus:not(:focus-visible),
input:focus:not(:focus-visible) {
  outline: none;
}
```

3. **Component ARIA updates:**

```jsx
// EntryList.jsx - add labels to buttons
<button
  onClick={() => onDelete(entry.id)}
  aria-label={`Delete ${entry.name}`}
  class="btn-delete"
>
  🗑️
</button>

// Modal.jsx - trap focus and add ARIA
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">{title}</h2>
  ...
</div>

// DailyProgress.jsx - live region for updates
<div aria-live="polite" class="sr-only">
  {calories} of {goalCalories} calories consumed
</div>

// Celebration.jsx - announce celebration
<div role="status" aria-live="assertive" class="sr-only">
  Congratulations! You hit your calorie goal!
</div>
```

4. **Add landmarks to App.jsx:**
```jsx
<div class="app">
  <header role="banner">
    <Header ... />
  </header>

  <main id="main-content" role="main">
    <DailyProgress ... />
    <EntryList ... />
  </main>

  <nav role="navigation" aria-label="Quick actions">
    <FAB ... />
  </nav>
</div>
```

5. **Form validation with ARIA:**
```jsx
// EntryForm.jsx
<input
  type="number"
  value={calories}
  aria-invalid={errors.calories ? 'true' : 'false'}
  aria-describedby={errors.calories ? 'calories-error' : undefined}
/>
{errors.calories && (
  <span id="calories-error" role="alert">{errors.calories}</span>
)}
```

6. **Heading hierarchy check:**
- h1: App title (one per page)
- h2: Section titles (Daily Progress, Entries, Settings)
- h3: Subsections (Meal groups, Setting categories)

**Test:** `docs/design/tests/T-022-accessibility.md`

---

## Integration Checklist

After implementation, verify:

- [ ] Theme toggle works (auto/light/dark)
- [ ] Dark mode has >4.5:1 contrast ratio
- [ ] PWA icons exist (192x192, 512x512)
- [ ] Manifest.json valid
- [ ] Service worker registers
- [ ] App installable (test with Lighthouse)
- [ ] Offline indicator shows when disconnected
- [ ] Notification permission request works
- [ ] Notification settings persist
- [ ] All buttons have aria-labels
- [ ] Modals trap focus
- [ ] Skip link works
- [ ] Focus indicators visible
- [ ] Screen reader announces dynamic content
- [ ] Heading hierarchy correct

## Verification

```bash
npm run build
npm run preview
# Test PWA with Lighthouse
# Test with screen reader (VoiceOver on Mac)
# Test keyboard-only navigation
```

## Success Criteria

Phase 7 is complete when:
1. Dark mode toggle functional
2. PWA installable and works offline
3. Notifications requestable and configurable
4. Lighthouse accessibility score >90
5. All interactive elements keyboard accessible
6. Build succeeds
