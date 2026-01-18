# Tests: PWA & Offline Support

id: T-020
spec: S-020 (specs/20-pwa-offline.md)

---

## Functional Tests

### Scenario: Service worker registers

**Given:** App loads in supported browser
**When:** Registration completes
**Then:** SW registered at "/" scope
**And:** Console shows success message

### Scenario: Static assets cached

**Given:** App has loaded once
**When:** I check Cache Storage
**Then:** index.html cached
**And:** JS bundle cached
**And:** CSS cached
**And:** Icons cached

### Scenario: App works offline

**Given:** App has cached assets
**When:** Network disconnected
**Then:** App still loads
**And:** Can view existing entries
**And:** Can add new entries (saved locally)

### Scenario: Install prompt appears

**Given:** App not installed, meets PWA criteria
**When:** beforeinstallprompt fires
**Then:** Install prompt banner shows
**And:** User can install or dismiss

### Scenario: Offline indicator shows

**Given:** App is running
**When:** Network goes offline
**Then:** Offline banner appears
**And:** Shows "Offline — changes saved locally"

---

## Manifest Tests

### Scenario: Manifest is valid

**Given:** I fetch /manifest.json
**When:** I parse the JSON
**Then:** name is "Calorie Tracker"
**And:** display is "standalone"
**And:** icons array has 192 and 512 sizes
**And:** theme_color matches brand

---

## Unit Tests

```javascript
// src/utils/__tests__/sw-register.test.js
import { registerServiceWorker } from '../sw-register'

describe('Service Worker Registration', () => {
  it('registers SW when supported', async () => {
    const mockRegister = vi.fn().mockResolvedValue({
      scope: '/',
      addEventListener: vi.fn()
    })
    navigator.serviceWorker = { register: mockRegister }

    await registerServiceWorker()

    expect(mockRegister).toHaveBeenCalledWith('/sw.js', { scope: '/' })
  })

  it('handles unsupported browsers', async () => {
    delete navigator.serviceWorker

    // Should not throw
    await expect(registerServiceWorker()).resolves.not.toThrow()
  })
})
```

---

## Component Tests

```javascript
// src/components/__tests__/InstallPrompt.test.jsx
import { render, fireEvent, act } from '@testing-library/preact'
import { InstallPrompt } from '../InstallPrompt'

describe('InstallPrompt', () => {
  let deferredPrompt

  beforeEach(() => {
    localStorage.clear()
    deferredPrompt = {
      prompt: vi.fn(),
      userChoice: Promise.resolve({ outcome: 'accepted' })
    }
  })

  it('shows prompt when beforeinstallprompt fires', () => {
    const { getByText, container } = render(<InstallPrompt />)

    act(() => {
      window.dispatchEvent(new CustomEvent('beforeinstallprompt', {
        ...deferredPrompt,
        preventDefault: vi.fn()
      }))
    })

    expect(getByText(/install app/i)).toBeTruthy()
  })

  it('dismisses and sets cooldown', () => {
    const { getByText, queryByText } = render(<InstallPrompt />)

    act(() => {
      window.dispatchEvent(new CustomEvent('beforeinstallprompt'))
    })

    fireEvent.click(getByText(/not now/i))

    expect(queryByText(/install app/i)).toBeNull()
    expect(localStorage.getItem('install-dismissed')).toBeTruthy()
  })

  it('respects 7-day cooldown', () => {
    // Set dismissed 3 days ago
    localStorage.setItem('install-dismissed', String(Date.now() - 3 * 24 * 60 * 60 * 1000))

    const { queryByText } = render(<InstallPrompt />)

    act(() => {
      window.dispatchEvent(new CustomEvent('beforeinstallprompt'))
    })

    // Should not show (within cooldown)
    expect(queryByText(/install app/i)).toBeNull()
  })
})

// src/components/__tests__/OfflineIndicator.test.jsx
import { render, act } from '@testing-library/preact'
import { OfflineIndicator } from '../OfflineIndicator'

describe('OfflineIndicator', () => {
  it('shows when offline', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
    const { getByText } = render(<OfflineIndicator />)
    expect(getByText(/offline/i)).toBeTruthy()
  })

  it('hides when online', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
    const { container } = render(<OfflineIndicator />)
    expect(container.firstChild).toBeNull()
  })

  it('responds to online/offline events', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
    const { queryByText } = render(<OfflineIndicator />)

    expect(queryByText(/offline/i)).toBeNull()

    act(() => {
      window.dispatchEvent(new Event('offline'))
    })

    expect(queryByText(/offline/i)).toBeTruthy()

    act(() => {
      window.dispatchEvent(new Event('online'))
    })

    expect(queryByText(/offline/i)).toBeNull()
  })
})
```

---

## E2E/Lighthouse Tests

```javascript
// e2e/pwa.spec.js
test('passes Lighthouse PWA audit', async ({ page }) => {
  // Run Lighthouse programmatically
  const result = await lighthouse(page.url(), {
    onlyCategories: ['pwa']
  })

  expect(result.categories.pwa.score).toBeGreaterThanOrEqual(0.9)
})

test('works offline', async ({ page, context }) => {
  await page.goto('/')

  // Cache assets
  await page.waitForLoadState('networkidle')

  // Go offline
  await context.setOffline(true)

  // Reload
  await page.reload()

  // Should still work
  await expect(page.locator('.progress-card')).toBeVisible()
})
```
