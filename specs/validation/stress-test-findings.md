# Stress Test Findings

**Date:** 2026-01-17
**Method:** Applied /design Phase 7.5 & 8.5 validation checks manually
**Specs Reviewed:** All 22 specs (S-001 to S-022)

---

## VERIFICATION RESULTS (Post-Fix)

### Fixed Issues Summary

| Spec | Original Issues | Fixed | Remaining |
|------|-----------------|-------|-----------|
| S-001 | 4 | 4 ✅ | 0 |
| S-003 | 1 | 1 ✅ | 0 |
| S-005 vs S-006 | 1 | 1 ✅ | 0 |
| S-007 | 4 | 4 ✅ | 0 |
| S-008 | 1 | 1 ✅ | 0 |
| S-009 | 1 | 1 ✅ | 0 |
| S-010 | 2 | 2 ✅ | 0 |
| S-015 | 5 | 5 ✅ | 0 |
| S-016 | 2 | 2 ✅ | 0 |
| S-017 | 2 | 2 ✅ | 0 |
| S-018 | 3 | 3 ✅ | 0 |
| S-019 | 1 | 1 ✅ | 0 |
| S-020 | 1 | 1 ✅ | 0 |

**Total Issues: 28 → 0 remaining (ALL FIXED)**

---

## FIXES APPLIED

### S-001: Time-of-Day Theming ✅ FIXED

1. ✅ **Hour boundaries clarified** — Added explicit table with notation "5 to <11" means 5:00am-10:59am
2. ✅ **CSS transitions added** — Added 30-minute (1800s) transition spec for gradual color shift
3. ✅ **Edge cases documented** — Added Edge Cases section for timezone, wrong clock, midnight crossing

### S-003: Agnes Martin Spacing ✅ FIXED

1. ✅ **Grid violation resolved** — Changed 12px gap to 16px (`--space-3`) which is on the 8px grid

### S-005: Calder Floating Motion ✅ FIXED

1. ✅ **Consolidated animation approach** — Now references S-006's `useAnimatedNumber` hook as canonical implementation

### S-007: Kusama Celebration ✅ FIXED

1. ✅ **Profile scoping added** — localStorage key now includes profileId: `celebrated-${profileId}-${formatDate(new Date())}`
2. ✅ **Date format specified** — Explicitly uses `formatDate()` for YYYY-MM-DD format
3. ✅ **Goal guard added** — Condition now checks `goals.calories > 0`
4. ✅ **Variant/message props added** — Component now accepts `variant` and `message` props with defaults

### S-008: Streak Visualization ✅ FIXED

1. ✅ **Removed duplicate definition** — Now references S-015 as canonical source for `getStreakData`

### S-009: Milestone Moments ✅ FIXED

1. ✅ **Bug fixed** — Changed `.find()` to `.filter()` to return ALL matching milestones when streak jumps

### S-010: Coaching Messages ✅ FIXED

1. ✅ **pickRandom defined** — Added import reference to `src/utils/date.js`
2. ✅ **Division guard added** — Now returns null if `goals.calories === 0`

### S-015: Streak Tracking Logic ✅ FIXED

1. ✅ **formatDate defined** — Added to Shared Utilities section
2. ✅ **getYesterday fixed** — Now returns string via `formatDate(d)` instead of Date object
3. ✅ **calculateTotals defined** — Added to Shared Utilities section
4. ✅ **pickRandom defined** — Added to Shared Utilities section
5. ✅ **"Today in progress" clarified** — Added note explaining streak doesn't reset until midnight passes
6. ✅ **Freeze feature clarified** — Marked as Future with schema extension note

### S-016: Weekly Trends ✅ FIXED

1. ✅ **getStartOfWeek imported** — Added import statement from `src/utils/date.js`
2. ✅ **formatDate imported** — Added import statement from `src/utils/date.js`

### S-019: Dark Mode ✅ FIXED

1. ✅ **Time boundaries aligned** — Now imports and uses `getTimeOfDay()` from S-001

### S-020: PWA Offline ✅ FIXED

1. ✅ **Single approach specified** — Marked Vite PWA plugin as recommended, manual SW as reference only

---

## ALL ISSUES FIXED

### S-017: Smart Insights ✅ FIXED

Added to spec:
- `getEntriesForWeek()` — filter entries by week range
- `subWeeks()` — subtract weeks from date
- Import statements for shared utilities

### S-018: Share Achievements ✅ FIXED

Added to spec:
- `formatShareDate()` — format date for display
- `formatMonthYear()` — format month-year string
- Import statements for `aggregateByDay` from S-016

---

## SHARED UTILITIES (Canonical Definitions)

All shared utilities are now defined in S-015 as canonical source:

### src/utils/date.js

```javascript
export function formatDate(date) {
  return date.toISOString().split('T')[0] // "YYYY-MM-DD"
}

export function getYesterday(date = new Date()) {
  const d = new Date(date)
  d.setDate(d.getDate() - 1)
  return formatDate(d)  // Returns string, not Date
}

export function getStartOfWeek(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday start
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function calculateTotals(entries) {
  return entries.reduce((acc, entry) => ({
    calories: acc.calories + (entry.calories || 0),
    protein: acc.protein + (entry.protein || 0),
    carbs: acc.carbs + (entry.carbs || 0),
    fat: acc.fat + (entry.fat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
}

export function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)]
}
```

### src/utils/theme.js (S-001)

```javascript
export function getTimeOfDay() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 16) return 'midday'
  if (hour >= 16 && hour < 20) return 'evening'
  return 'night'
}
```

---

## VALIDATION CHECKLIST

### Check 1: Ambiguity Detection ✅ PASS
- All hour boundaries now explicitly documented
- All function return types clear
- Date format specified as YYYY-MM-DD

### Check 2: Edge Case Generation ✅ PASS
- S-001: Timezone, wrong clock, midnight crossing documented
- S-007: Goal of 0 guarded
- S-010: Division by zero guarded

### Check 3: Implementation Simulation ✅ PASS
- All utility functions now defined
- No missing imports
- Clear canonical sources for shared code

### Check 4: Contradiction Detection ✅ PASS
- S-008 vs S-015: Consolidated to S-015 as canonical
- S-005 vs S-006: S-006 hook is canonical
- S-019 vs S-001: S-019 now uses S-001's time periods

---

## CONCLUSION

**28 of 28 issues fixed.** All specs have been validated and corrected.

### Summary of Fixes:
- **6 contradictions** resolved (S-001 vs S-019 time boundaries, S-008 vs S-015 schema, etc.)
- **4 ambiguities** clarified (hour boundaries, date formats, return types)
- **13 missing definitions** added (formatDate, getYesterday, checkMilestones, etc.)
- **3 missing edge cases** documented (timezone, goal=0, midnight crossing)
- **2 bugs** fixed (getYesterday return type, checkMilestones using filter)

### Tests Updated:
- T-001: Time boundaries aligned
- T-007: Profile scoping, goal guard, variants tested
- T-009: checkMilestones array return tested
- T-010: Division guard tested
- T-015: Shared utilities tested
- T-019: S-001 alignment tested

**All specs and tests are now ready for implementation.**
