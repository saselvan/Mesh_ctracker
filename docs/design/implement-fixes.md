# Code Review Fixes

Fix issues found in phases 1-4 code review.

## Critical Fixes

### Fix 1: trends.js - Date Comparison Bug

**File:** `src/utils/trends.js`

**Problem:** Line 7-8 compares string dates to Date objects:
```javascript
const weekStart = getStartOfWeek(new Date())
const weekEntries = entries.filter(e => e.date >= weekStart)
```

**Fix:** Convert weekStart to string format for comparison:
```javascript
import { getStartOfWeek, formatDate, calculateTotals } from './date'

export function getWeeklyTrends(entries, goals) {
  const weekStart = getStartOfWeek(new Date())
  const weekStartStr = formatDate(weekStart)
  const weekEntries = entries.filter(e => e.date >= weekStartStr)
  // ... rest of function
}
```

---

### Fix 2: styles.css - Theme Selectors Wrong

**File:** `src/styles.css`

**Problem:** Selectors like `.theme-morning body::before` look for `body` inside `.theme-morning`, but the class is ON body.

**Find and replace these selectors:**

| Wrong | Correct |
|-------|---------|
| `.theme-morning body::before` | `body.theme-morning::before` |
| `.theme-morning body::after` | `body.theme-morning::after` |
| `.theme-evening body::before` | `body.theme-evening::before` |
| `.theme-evening body::after` | `body.theme-evening::after` |
| `.theme-night body::before` | `body.theme-night::before` |
| `.theme-night body::after` | `body.theme-night::after` |

Also check for any `.theme-midday body::` selectors and fix similarly.

---

## Important Fixes

### Fix 3: trends.js - Export Helper Functions

**File:** `src/utils/trends.js`

**Problem:** insights.js expects to import `aggregateByDay` and `calculateAverages` but they're not exported.

**Fix:** Extract and export these functions:

```javascript
export function aggregateByDay(entries) {
  const byDate = {}
  entries.forEach(entry => {
    if (!byDate[entry.date]) byDate[entry.date] = []
    byDate[entry.date].push(entry)
  })
  return byDate
}

export function calculateAverages(dailyTotals) {
  const daysLogged = dailyTotals.length
  if (daysLogged === 0) {
    return { avgCalories: 0, avgProtein: 0, avgCarbs: 0, avgFat: 0 }
  }

  return {
    avgCalories: Math.round(dailyTotals.reduce((sum, d) => sum + d.calories, 0) / daysLogged),
    avgProtein: Math.round(dailyTotals.reduce((sum, d) => sum + d.protein, 0) / daysLogged),
    avgCarbs: Math.round(dailyTotals.reduce((sum, d) => sum + d.carbs, 0) / daysLogged),
    avgFat: Math.round(dailyTotals.reduce((sum, d) => sum + d.fat, 0) / daysLogged)
  }
}
```

Then refactor `getWeeklyTrends` to use these exported functions.

---

### Fix 4: styles.css - Transition Duration

**File:** `src/styles.css`

**Problem:** `transition: background-color 1800s` is 30 minutes. This may cause issues since theme checks every 15 minutes.

**Fix:** Change to a smoother but shorter transition:
```css
body {
  transition: background-color 2s ease-in-out, color 2s ease-in-out;
}
```

This provides a noticeable but not jarring transition when themes change.

---

### Fix 5: Add Constants for Magic Numbers

**File:** `src/utils/streaks.js`

**Add at top of file:**
```javascript
const HISTORY_LIMIT = 30
const MILESTONES = [3, 7, 14, 30, 50, 100, 365]
const SUCCESS_RATIO_MIN = 0.9
const SUCCESS_RATIO_MAX = 1.1
```

**Then use these constants throughout:**
- `.slice(0, HISTORY_LIMIT)` instead of `.slice(0, 30)`
- `ratio >= SUCCESS_RATIO_MIN && ratio <= SUCCESS_RATIO_MAX`

---

## Verification

After fixes, verify:

```bash
npm run build
```

Check that:
- [ ] No build errors
- [ ] Theme transitions work (body class changes, colors shift)
- [ ] Weekly trends calculate correctly for current week
- [ ] exports from trends.js are available

## Files to Modify

1. `src/utils/trends.js` - Fixes 1, 3
2. `src/styles.css` - Fixes 2, 4
3. `src/utils/streaks.js` - Fix 5
