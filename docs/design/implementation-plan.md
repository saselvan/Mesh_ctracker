# Zeroshot Implementation Plan

**Approach:** Specs contain complete, copy-paste-ready code. Implementation = extract code from specs, write to files, run tests until green.

**Philosophy:** No interpretation needed. Specs are the source of truth. Tests are the contracts.

---

## Dependency Graph

```
                    ┌─────────────────────────────────────────┐
                    │           FOUNDATION LAYER              │
                    │                                         │
                    │  src/utils/date.js (from S-015)         │
                    │  src/utils/theme.js (from S-001)        │
                    └─────────────────┬───────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
          ▼                           ▼                           ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  VISUAL LAYER   │       │  DATA LAYER     │       │  MOTION LAYER   │
│                 │       │                 │       │                 │
│ S-001 Theming   │       │ S-015 Streaks   │       │ S-006 Animation │
│ S-002 Rothko    │       │ S-016 Trends    │       │ S-005 Calder    │
│ S-003 Spacing   │       │ S-017 Insights  │       │                 │
│ S-004 Progress  │       │ S-018 Sharing   │       │                 │
│ S-019 Dark Mode │       │                 │       │                 │
└────────┬────────┘       └────────┬────────┘       └────────┬────────┘
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────────────────┐
                    │           FEATURE LAYER                 │
                    │                                         │
                    │  S-007 Celebration (needs streaks)      │
                    │  S-008 Streak Display (needs streaks)   │
                    │  S-009 Milestones (needs streaks)       │
                    │  S-010 Coaching (needs streaks)         │
                    └─────────────────┬───────────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────────────┐
                    │           DATA FEATURES                 │
                    │                                         │
                    │  S-011 Meal Categories                  │
                    │  S-012 Quick Add Favorites              │
                    │  S-013 Recent Foods                     │
                    │  S-014 Meal Templates                   │
                    └─────────────────┬───────────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────────────┐
                    │           POLISH LAYER                  │
                    │                                         │
                    │  S-020 PWA Offline                      │
                    │  S-021 Notifications                    │
                    │  S-022 Accessibility                    │
                    └─────────────────────────────────────────┘
```

---

## Execution Lanes

### Lane 1: Foundation (Sequential - Do First)

| Step | Spec | Creates | Test |
|------|------|---------|------|
| 1.1 | S-015 | `src/utils/date.js` | T-015 |
| 1.2 | S-001 | `src/utils/theme.js` | T-001 |

**Why sequential:** All other specs import from these.

---

### Lane 2: Visual (Parallel after Foundation)

| Spec | Creates | Depends On | Test |
|------|---------|------------|------|
| S-001 | CSS theme classes in `styles.css` | date.js | T-001 |
| S-002 | Rothko backgrounds in `styles.css` | — | T-002 |
| S-003 | Spacing system in `styles.css` | — | T-003 |
| S-004 | Progress component styles | — | T-004 |

**Can run in parallel:** These only modify CSS, no code deps.

---

### Lane 3: Data (Parallel after Foundation)

| Spec | Creates | Depends On | Test |
|------|---------|------------|------|
| S-015 | `src/utils/streaks.js` | date.js | T-015 |
| S-016 | `src/utils/trends.js` | date.js | T-016 |
| S-017 | `src/utils/insights.js` | date.js, trends.js | T-017 |
| S-018 | `src/utils/sharing.js` | date.js, trends.js | T-018 |

**Order:** S-015 → S-016 → (S-017, S-018 parallel)

---

### Lane 4: Motion (Parallel after Foundation)

| Spec | Creates | Depends On | Test |
|------|---------|------------|------|
| S-006 | `src/hooks/useAnimatedNumber.js` | — | T-006 |
| S-005 | FAB/Modal animations in `styles.css` | S-006 hook | T-005 |

**Order:** S-006 → S-005

---

### Lane 5: Features (After Data Layer)

| Spec | Creates | Depends On | Test |
|------|---------|------------|------|
| S-007 | `src/components/Celebration.jsx` | streaks.js, date.js | T-007 |
| S-008 | `src/components/StreakDisplay.jsx` | streaks.js | T-008 |
| S-009 | Milestones in `streaks.js` | streaks.js | T-009 |
| S-010 | `src/components/CoachingMessage.jsx` | date.js | T-010 |

**Can run in parallel:** Different components, same deps.

---

### Lane 6: Data Features (Parallel, Independent)

| Spec | Creates | Depends On | Test |
|------|---------|------------|------|
| S-011 | Meal categories | db.js | T-011 |
| S-012 | Quick add favorites | db.js | T-012 |
| S-013 | Recent foods | db.js | T-013 |
| S-014 | Meal templates | db.js | T-014 |

**Fully parallel:** No cross-dependencies.

---

### Lane 7: Dark Mode (After Visual + Theme)

| Spec | Creates | Depends On | Test |
|------|---------|------------|------|
| S-019 | `src/components/ThemeToggle.jsx`, dark CSS | theme.js (S-001) | T-019 |

---

### Lane 8: Polish (Last)

| Spec | Creates | Depends On | Test |
|------|---------|------------|------|
| S-020 | PWA manifest, service worker | — | T-020 |
| S-021 | Notifications | — | T-021 |
| S-022 | Accessibility audit | all components | T-022 |

---

## Implementation Protocol

### For Each Spec

```
1. Read spec: specs/{NN}-{name}.md
2. Read test: specs/tests/T-{NNN}-{name}.md
3. Create/modify files listed in spec
4. Copy code blocks from spec verbatim
5. Run test: npm test -- {test-file}
6. If tests fail, re-read spec for missed details
7. Commit: "feat: implement S-{NNN} {name}"
```

### Verification

After each lane completes:
```bash
npm run build   # Must pass
npm test        # All tests green
```

---

## Parallel Execution Matrix

```
Time →

Lane 1 (Foundation): [S-015][S-001]
                           ↓
Lane 2 (Visual):          [S-002][S-003][S-004]─────────────────────[S-019]
Lane 3 (Data):            [S-015]→[S-016]→[S-017][S-018]
Lane 4 (Motion):          [S-006]→[S-005]
                                          ↓
Lane 5 (Features):                       [S-007][S-008][S-009][S-010]
Lane 6 (Data Features):                  [S-011][S-012][S-013][S-014]
                                                                    ↓
Lane 7 (Polish):                                                   [S-020][S-021][S-022]
```

---

## File Creation Order

### Phase 1: Utilities (Must be first)

```
src/utils/date.js        ← S-015 (shared utilities section)
src/utils/theme.js       ← S-001
```

### Phase 2: Core Logic

```
src/utils/streaks.js     ← S-015
src/utils/trends.js      ← S-016
src/utils/insights.js    ← S-017
src/utils/sharing.js     ← S-018
src/utils/messages.js    ← S-010
```

### Phase 3: Hooks

```
src/hooks/useAnimatedNumber.js  ← S-006
src/hooks/useStreak.js          ← S-015 (optional)
```

### Phase 4: Components

```
src/components/Celebration.jsx      ← S-007
src/components/StreakDisplay.jsx    ← S-008
src/components/CoachingMessage.jsx  ← S-010
src/components/WeeklyChart.jsx      ← S-016
src/components/TrendsView.jsx       ← S-016
src/components/InsightsPanel.jsx    ← S-017
src/components/ShareCard.jsx        ← S-018
src/components/ShareModal.jsx       ← S-018
src/components/ThemeToggle.jsx      ← S-019
src/components/InstallPrompt.jsx    ← S-020
src/components/OfflineIndicator.jsx ← S-020
```

### Phase 5: Styles

```
src/styles.css           ← S-001, S-002, S-003, S-004, S-005, S-019
```

### Phase 6: Config

```
vite.config.js           ← S-020 (PWA plugin)
public/manifest.json     ← S-020
```

---

## Test Execution Order

```bash
# Foundation
npm test -- src/utils/__tests__/date.test.js
npm test -- src/utils/__tests__/theme.test.js

# Data Layer
npm test -- src/utils/__tests__/streaks.test.js
npm test -- src/utils/__tests__/trends.test.js
npm test -- src/utils/__tests__/insights.test.js
npm test -- src/utils/__tests__/sharing.test.js

# Components
npm test -- src/components/__tests__/Celebration.test.jsx
npm test -- src/components/__tests__/StreakDisplay.test.jsx
npm test -- src/components/__tests__/CoachingMessage.test.jsx
npm test -- src/components/__tests__/ThemeToggle.test.jsx

# Full suite
npm test
```

---

## Critical Implementation Notes

### From Stress Testing (28 issues fixed)

1. **Time boundaries are EXCLUSIVE:** `5 to <11` means 5:00am-10:59am
2. **checkMilestones uses filter(), not find()** — returns array of ALL milestones
3. **localStorage key includes profileId:** `celebrated-${profileId}-${formatDate(new Date())}`
4. **Division guard before ratio:** `if (!goals.calories || goals.calories === 0) return null`
5. **getYesterday returns STRING** via `formatDate(d)`, not Date object
6. **S-019 imports getTimeOfDay from S-001** — don't redefine time logic

### Copy-Paste Gotchas

- Specs use ES6 imports — ensure bundler handles them
- Some specs reference other specs — follow the dependency order
- CSS custom properties must be defined before use
- Profile isolation: always pass profileId to storage functions

---

## Success Criteria

Each spec is complete when:

1. All files from "Files to Create/Modify" exist
2. Code matches spec exactly (no interpretation)
3. Corresponding test passes
4. No lint errors
5. Build succeeds

Project is complete when:

1. All 22 specs implemented
2. All 22 test files pass
3. `npm run build` succeeds
4. Manual smoke test of key flows
