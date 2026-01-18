# Spec: PWA & Offline Support

**Phase:** 6 - Polish & Accessibility
**Priority:** High
**Estimated Effort:** High

---

## Overview

Transform the app into a Progressive Web App (PWA) with full offline support. Users can install it on their home screen and use it without internet connection. All data is local-first anyway, so offline should be seamless.

## Requirements

### Web App Manifest

```json
// public/manifest.json
{
  "name": "Calorie Tracker",
  "short_name": "Calories",
  "description": "Track calories and macros with a beautiful, mindful interface",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FAF7F2",
  "theme_color": "#5C6B54",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["health", "fitness", "lifestyle"],
  "shortcuts": [
    {
      "name": "Add Entry",
      "short_name": "Add",
      "description": "Log a new food entry",
      "url": "/?action=add",
      "icons": [{ "src": "/icons/add-96.png", "sizes": "96x96" }]
    }
  ]
}
```

### Service Worker (Reference Only)

> **Implementation Note:** Use the **Vite PWA Plugin** approach (see below) instead of
> manually creating `sw.js`. The plugin auto-generates the service worker with proper
> asset hashing and cache versioning. The manual approach below is for reference only.

```javascript
// public/sw.js (REFERENCE - use Vite PWA plugin instead)
const CACHE_NAME = 'calorie-tracker-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/index.js',
  '/assets/index.css',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
]

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// Fetch: cache-first for static, network-first for API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Static assets: cache-first
  if (STATIC_ASSETS.some(asset => url.pathname.endsWith(asset))) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone)
          })
          return response
        })
      })
    )
    return
  }

  // Everything else: network-first with cache fallback
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request)
    })
  )
})

// Background sync for future cloud features
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-entries') {
    event.waitUntil(syncEntries())
  }
})
```

### Service Worker Registration

```javascript
// src/utils/sw-register.js
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            showUpdatePrompt()
          }
        })
      })

      console.log('SW registered:', registration.scope)
    } catch (error) {
      console.error('SW registration failed:', error)
    }
  }
}

function showUpdatePrompt() {
  // Show a toast/banner prompting user to refresh
  const event = new CustomEvent('sw-update-available')
  window.dispatchEvent(event)
}
```

### Install Prompt Component

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

      // Only show if not dismissed recently
      const dismissed = localStorage.getItem('install-dismissed')
      if (!dismissed || Date.now() - parseInt(dismissed) > 7 * 24 * 60 * 60 * 1000) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('App installed')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    localStorage.setItem('install-dismissed', Date.now().toString())
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div class="install-prompt">
      <div class="install-prompt-content">
        <span class="install-prompt-icon">📲</span>
        <div class="install-prompt-text">
          <span class="install-prompt-title">Install App</span>
          <span class="install-prompt-desc">Add to home screen for quick access</span>
        </div>
      </div>
      <div class="install-prompt-actions">
        <button class="install-btn" onClick={handleInstall}>Install</button>
        <button class="install-dismiss" onClick={handleDismiss}>Not now</button>
      </div>
    </div>
  )
}
```

### Offline Indicator

```jsx
// src/components/OfflineIndicator.jsx
import { useState, useEffect } from 'preact/hooks'

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div class="offline-indicator">
      <span class="offline-icon">📴</span>
      <span class="offline-text">Offline — changes saved locally</span>
    </div>
  )
}
```

### CSS Styling

```css
.install-prompt {
  position: fixed;
  bottom: var(--space-4);
  left: var(--space-4);
  right: var(--space-4);
  background: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--space-4);
  z-index: 1000;
  animation: slide-up 300ms ease-out;
}

.install-prompt-content {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.install-prompt-icon {
  font-size: 2rem;
}

.install-prompt-title {
  display: block;
  font-weight: 600;
  color: var(--color-text);
}

.install-prompt-desc {
  display: block;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.install-prompt-actions {
  display: flex;
  gap: var(--space-2);
}

.install-btn {
  flex: 1;
  padding: var(--space-3);
  background: var(--color-sage);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
}

.install-dismiss {
  padding: var(--space-3);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-muted);
  cursor: pointer;
}

.offline-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--color-terracotta);
  color: white;
  padding: var(--space-2);
  text-align: center;
  font-size: 0.875rem;
  z-index: 1001;
}

.offline-icon {
  margin-right: var(--space-1);
}
```

### Update Available Toast

```jsx
// src/components/UpdateToast.jsx
export function UpdateToast({ onRefresh }) {
  return (
    <div class="update-toast">
      <span>New version available!</span>
      <button onClick={onRefresh}>Refresh</button>
    </div>
  )
}
```

### Vite PWA Plugin Configuration (Recommended)

> **Use this approach.** The Vite PWA plugin handles service worker generation,
> cache versioning, and asset management automatically.

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    preact(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'Calorie Tracker',
        short_name: 'Calories',
        theme_color: '#5C6B54',
        background_color: '#FAF7F2',
        display: 'standalone',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ]
})
```

## Acceptance Criteria

- [ ] App installable on iOS Safari (Add to Home Screen)
- [ ] App installable on Android Chrome
- [ ] App works fully offline
- [ ] Static assets cached
- [ ] IndexedDB works offline (already does)
- [ ] Offline indicator shows when disconnected
- [ ] Install prompt appears (once per week if dismissed)
- [ ] App updates prompt user to refresh
- [ ] Proper icons at all sizes
- [ ] Standalone display mode (no browser chrome)

## Files to Create/Modify

- `public/manifest.json` — Create
- `public/sw.js` — Create (or use Vite PWA plugin)
- `public/icons/` — Create app icons
- `src/utils/sw-register.js` — Create
- `src/components/InstallPrompt.jsx` — Create
- `src/components/OfflineIndicator.jsx` — Create
- `src/components/UpdateToast.jsx` — Create
- `vite.config.js` — Add PWA plugin
- `index.html` — Add manifest link, meta tags

## Test Plan

1. Chrome DevTools > Application > Manifest — valid?
2. Lighthouse PWA audit — passes?
3. Android Chrome install prompt appears?
4. iOS Safari "Add to Home Screen" works?
5. Airplane mode — app loads and works?
6. Add entry offline → saves locally?
7. Force update → refresh prompt appears?
