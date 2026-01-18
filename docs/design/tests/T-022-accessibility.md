# T-022: Accessibility

## Feature
Comprehensive accessibility support: ARIA attributes, keyboard navigation, screen reader support, focus indicators

## Test Steps

### 1. Skip Link
1. Load app, press Tab (first focus)
2. Verify "Skip to content" link appears
3. Press Enter
4. Verify focus jumps to main content area (#main-content)

### 2. Keyboard Navigation
1. Unplug mouse (keyboard-only test)
2. Tab through entire app:
   - Header buttons (settings, calendar, profile)
   - Daily progress (focusable if interactive)
   - Entry list: Edit/delete buttons
   - FAB (floating action button)
3. Verify all interactive elements reachable via Tab
4. Verify tab order is logical (top-to-bottom, left-to-right)
5. Press Enter/Space on focused buttons → actions trigger
6. Press Escape on modal → modal closes

### 3. Focus Indicators
1. Tab through app
2. Verify all focused elements show visible outline:
   - 2px solid outline in theme color
   - outline-offset: 2px
3. Click elements with mouse
4. Verify NO outline on mouse click (focus-visible behavior)

### 4. ARIA Attributes
1. Inspect Modal component:
   - role="dialog"
   - aria-modal="true"
   - aria-labelledby="modal-title"
2. Inspect delete buttons in EntryList:
   - aria-label="Delete {food name}"
3. Inspect DailyProgress:
   - aria-live="polite" region for calorie updates
4. Inspect Celebration:
   - role="status" aria-live="assertive"
5. Run axe DevTools or WAVE extension
6. Verify 0 critical ARIA errors

### 5. Screen Reader Testing
1. Enable VoiceOver (Mac: Cmd+F5) or NVDA (Windows)
2. Navigate app with screen reader
3. Verify announcements:
   - Skip link announced
   - Modal title announced on open
   - Delete button announces "Delete {food}"
   - DailyProgress announces calorie updates
   - Celebration announces success message
4. Verify semantic landmarks navigable (header, main, nav)

### 6. Heading Hierarchy
1. Install headingsMap browser extension or use axe DevTools
2. Inspect heading outline:
   - One h1: "Calorie Tracker"
   - Multiple h2: "Settings", "Add Entry", etc.
   - h3 under h2: "Daily Goals", "Notifications", meal groups
3. Verify no skipped levels (e.g., h3 without h2)

### 7. Lighthouse Audit
1. Open DevTools → Lighthouse
2. Run Accessibility audit
3. Verify score ≥90

### 8. Semantic HTML
1. Inspect App.jsx DOM:
   - <header role="banner">
   - <main id="main-content" role="main">
   - <nav role="navigation" aria-label="Quick actions">
2. Verify landmarks present and correctly nested

## Expected Results
- Skip link functional
- All features accessible via keyboard only
- Focus indicators visible on keyboard focus, hidden on mouse click
- ARIA attributes correct (dialog, aria-live, aria-label)
- Screen reader announces dynamic content
- Heading hierarchy correct (h1 → h2 → h3)
- Lighthouse accessibility score ≥90

## Pass Criteria
✅ Skip link works
✅ 100% keyboard navigable
✅ Focus indicators visible (keyboard) and hidden (mouse)
✅ axe/WAVE shows 0 critical errors
✅ Screen reader announcements correct
✅ Heading hierarchy valid
✅ Lighthouse accessibility ≥90
