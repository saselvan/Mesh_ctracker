# T-020: PWA Offline

## Feature
Progressive Web App with offline support, installability, and service worker caching

## Test Steps

### 1. Manifest Validation
1. Run `npm run build && npm run preview`
2. Open DevTools → Application → Manifest
3. Verify manifest contains:
   - name: "Calorie Tracker"
   - short_name: "Calories"
   - icons: 192x192 and 512x512
   - display: "standalone"
   - theme_color: "#5C6B54"
4. Check Network tab for `/icons/icon-192.png` and `/icons/icon-512.png` (200 OK)

### 2. Service Worker Registration
1. Open DevTools → Application → Service Workers
2. Verify service worker registered and active
3. Check status shows "activated and running"

### 3. Install Prompt
1. Serve app on HTTPS or localhost
2. Wait for install prompt UI (bottom of screen)
3. Verify prompt shows "Install Calorie Tracker" button
4. Click "Install"
5. Verify PWA installs and opens in standalone window

### 4. Offline Mode
1. Open app in browser
2. DevTools → Network → Check "Offline"
3. Reload page
4. Verify app loads from service worker cache
5. Verify OfflineIndicator banner appears at top
6. Add/edit entries (should work with IndexedDB)
7. Uncheck "Offline"
8. Verify OfflineIndicator disappears

### 5. Cache Strategy
1. Check DevTools → Application → Cache Storage
2. Verify workbox caches contain app assets (JS, CSS, HTML, icons)
3. Verify Google Fonts cached separately

## Expected Results
- Manifest valid with all required fields
- Service worker registers and caches assets
- Install prompt appears on supported browsers (Chrome/Edge)
- App works offline (loads from cache, IndexedDB functional)
- OfflineIndicator shows/hides based on connection status

## Pass Criteria
✅ Manifest validation passes in DevTools
✅ Service worker registered successfully
✅ App installable (test on Chrome/Edge)
✅ App loads and functions offline
✅ Lighthouse PWA score ≥90
