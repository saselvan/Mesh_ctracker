# Spec to Commit Tracking

Maps design specs to implementation commits for traceability.

## Phase 1: Foundation

| Spec | Description | Commit | Status |
|------|-------------|--------|--------|
| S-015 | Streak Tracking Logic | `baa9aa4` | Done |
| S-001 | Time-of-Day Theming | `baa9aa4` | Done |

**Commit:** `baa9aa4` feat: implement phases 1-3 of experience overhaul

---

## Phase 2: Visual Layer

| Spec | Description | Commit | Status |
|------|-------------|--------|--------|
| S-002 | Rothko Backgrounds | `baa9aa4` | Done |
| S-003 | Agnes Martin Spacing | `baa9aa4` | Done |
| S-004 | Frankenthaler Effects | `baa9aa4` | Done |

**Commit:** `baa9aa4` feat: implement phases 1-3 of experience overhaul

---

## Phase 3: Motion Layer

| Spec | Description | Commit | Status |
|------|-------------|--------|--------|
| S-006 | Staggered Animations | `baa9aa4` | Done |
| S-005 | Calder Floating Motion | `baa9aa4` | Done |

**Commit:** `baa9aa4` feat: implement phases 1-3 of experience overhaul

---

## Phase 4: Data Layer

| Spec | Description | Commit | Status |
|------|-------------|--------|--------|
| S-016 | Weekly Trends | `0a813dc` | Done |
| S-017 | Insights Engine | `0a813dc` | Done |
| S-018 | Sharing | `0a813dc` | Done |

**Commit:** `0a813dc` feat: complete phase 4 data utilities

---

## Fixes

| Issue | Fix | Commit | Status |
|-------|-----|--------|--------|
| Date comparison bug (trends.js) | Use formatDate(weekStart) | `933ad20` | Done |
| CSS selectors (.theme-x body::) | Change to body.theme-x:: | `933ad20` | Done |
| Missing exports (trends.js) | Export aggregateByDay/calculateAverages | `933ad20` | Done |
| 1800s transition duration | Change to 2s ease-in-out | `933ad20` | Done |
| Magic numbers (streaks.js) | Extract to constants.js | `933ad20` | Done |

**Commit:** `933ad20` fix: apply code review fixes for phases 1-4

---

## Phase 5: Feature Components (Pending)

| Spec | Description | Commit | Status |
|------|-------------|--------|--------|
| S-007 | Celebration Modal | - | Pending |
| S-008 | Streak Display | - | Pending |
| S-009 | Milestone System | - | Pending |
| S-010 | Coaching Messages | - | Pending |

---

## Phase 6: Data Features (Pending)

| Spec | Description | Commit | Status |
|------|-------------|--------|--------|
| S-011 | Trends Dashboard | - | Pending |
| S-012 | Weekly Summary | - | Pending |
| S-013 | History Calendar | - | Pending |
| S-014 | Export Sharing | - | Pending |

---

## Phase 7: Polish (Pending)

| Spec | Description | Commit | Status |
|------|-------------|--------|--------|
| S-019 | Loading States | - | Pending |
| S-020 | Error Boundaries | - | Pending |
| S-021 | Accessibility | - | Pending |
| S-022 | Performance | - | Pending |
