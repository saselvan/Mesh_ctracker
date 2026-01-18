# Phase 1: Foundation

Implement core utilities that all other phases depend on.

## Tech Stack
- Preact + Vite
- IndexedDB for entries
- localStorage for settings/profiles
- CSS custom properties

## Specs to Implement

### S-015: Streak Tracking Logic

**Files to create/modify:**
- CREATE `src/utils/streaks.js`
- MODIFY `src/utils/date.js` (add helpers)

**Implementation:**
1. Add to `src/utils/date.js`:
   - `getYesterday()` - returns STRING like "2025-01-16"
   - `getStartOfWeek(date)` - returns start of week date string
   - `calculateTotals(entries)` - sum calories, protein, carbs, fat

2. Create `src/utils/streaks.js`:
   - `isSuccessfulDay(totalCalories, goalCalories)` - returns true if ratio 0.9-1.1
   - `getStreakData(profileId)` - read from localStorage
   - `saveStreakData(profileId, data)` - write to localStorage
   - `updateStreakForDay(profileId, date, wasSuccessful)` - update current/longest
   - `checkMilestones(streakData)` - uses filter() NOT find(), milestones [3,7,14,30,50,100,365]

**Critical implementation notes:**
- Guard division: `if (goalCalories <= 0) return false`
- History stores last 30 days: `slice(-30)` after sort
- localStorage key: `streak-${profileId}`
- getYesterday returns STRING not Date object

**Test:** `docs/design/tests/T-015-streak-tracking-logic.md`

---

### S-001: Time-of-Day Theming

**Files to create/modify:**
- CREATE `src/utils/theme.js`
- MODIFY `src/styles.css` (add theme classes)
- MODIFY `src/components/App.jsx` (integrate theming)

**Implementation:**
1. Create `src/utils/theme.js`:
   - `getTimeOfDay()` - returns 'morning'|'midday'|'evening'|'night'
   - `applyTheme()` - sets `document.body.className = \`theme-${period}\``

2. Time boundaries (EXCLUSIVE end):
   - morning: hour >= 5 && hour < 11
   - midday: hour >= 11 && hour < 16
   - evening: hour >= 16 && hour < 20
   - night: all other hours

3. Add to `src/styles.css`:
   ```css
   .theme-morning { --color-cream: #FDF8F3; /* warmer peachy */ }
   .theme-midday { /* default theme */ }
   .theme-evening { --color-cream: #F5F5F0; /* cooler sage */ }
   .theme-night {
     --color-cream: #1A1A1A;
     --color-espresso: #E8E8E8;
   }
   body { transition: background-color 1800s linear; }
   ```

4. Integrate in `src/components/App.jsx`:
   - Call `applyTheme()` on mount
   - Set interval every 15 minutes to recheck

**Test:** `docs/design/tests/T-001-time-of-day-theming.md`

---

## Integration Checklist

After implementation, verify:

- [ ] `isSuccessfulDay(1800, 2000)` returns `true` (90%)
- [ ] `isSuccessfulDay(2200, 2000)` returns `true` (110%)
- [ ] `isSuccessfulDay(1700, 2000)` returns `false` (below 90%)
- [ ] `isSuccessfulDay(100, 0)` returns `false` (zero goal guard)
- [ ] `getYesterday()` returns a string like "2025-01-16"
- [ ] `getTimeOfDay()` at hour 5 returns "morning"
- [ ] `getTimeOfDay()` at hour 11 returns "midday"
- [ ] `getTimeOfDay()` at hour 16 returns "evening"
- [ ] `getTimeOfDay()` at hour 20 returns "night"
- [ ] App.jsx imports and calls applyTheme on mount
- [ ] Theme classes exist in styles.css

## Verification

```bash
npm run build
# Should build without errors
```

## Success Criteria

Phase 1 is complete when:
1. Both utility files exist and export all functions
2. App.jsx integrates theme on mount with interval
3. CSS has all 4 theme classes
4. Build succeeds
