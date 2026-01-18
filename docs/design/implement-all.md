# Calorie Tracker Implementation Guide

**DO NOT USE THIS FILE DIRECTLY WITH ZEROSHOT.**

Run each phase separately for reliable implementation.

## How to Run

Execute each phase sequentially, verifying between phases:

```bash
# Phase 1: Foundation (2 specs)
zeroshot run docs/design/implement-phase-1.md

# Verify Phase 1
npm run build && npm run dev  # Check theme switching works

# Phase 2: Visual Layer (3 specs)
zeroshot run docs/design/implement-phase-2.md

# Verify Phase 2
npm run build && npm run dev  # Visual inspection

# Phase 3: Motion Layer (2 specs)
zeroshot run docs/design/implement-phase-3.md

# Verify Phase 3
npm run build && npm run dev  # Check floating animations

# Phase 4: Data Layer (3 specs)
zeroshot run docs/design/implement-phase-4.md

# Verify Phase 4
npm run build  # Utilities are internal

# Phase 5: Feature Components (4 specs)
zeroshot run docs/design/implement-phase-5.md

# Verify Phase 5
npm run build && npm run dev  # Test celebrations, streaks

# Phase 6: Data Features (4 specs)
zeroshot run docs/design/implement-phase-6.md

# Verify Phase 6
npm run build && npm run dev  # Test favorites, templates

# Phase 7: Polish (4 specs)
zeroshot run docs/design/implement-phase-7.md

# Final verification
npm run build && npm run preview  # Lighthouse audit
```

## Phase Summary

| Phase | Specs | Focus |
|-------|-------|-------|
| 1 | S-015, S-001 | Foundation utilities (streak, theme) |
| 2 | S-002, S-003, S-004 | Visual CSS (Rothko, Agnes Martin, Frankenthaler) |
| 3 | S-006, S-005 | Motion (animated numbers, floating) |
| 4 | S-016, S-017, S-018 | Data utilities (trends, insights, sharing) |
| 5 | S-007, S-008, S-009, S-010 | Feature components (celebration, streaks, coaching) |
| 6 | S-011, S-012, S-013, S-014 | Data features (meals, favorites, recent, templates) |
| 7 | S-019, S-020, S-021, S-022 | Polish (dark mode, PWA, notifications, a11y) |

## Dependencies

- Phase 1 must complete before all others
- Phase 3 requires Phase 2 (CSS classes)
- Phase 5 requires Phases 1, 3, 4 (utilities + hooks)
- Phase 6 requires Phase 5 (component integration)
- Phase 7 requires Phase 6 (PWA needs all features)

## If a Phase Fails

1. Check validator output for specific errors
2. Fix issues manually if needed
3. Re-run the same phase
4. Don't proceed until phase passes validation

## Tech Stack Reference

- **Framework:** Preact + Vite
- **Storage:** IndexedDB (entries), localStorage (settings)
- **Styling:** CSS custom properties
- **PWA:** vite-plugin-pwa (Phase 7 only)

## Critical Implementation Notes

Across all phases:
- Time boundaries: 5-11-16-20 (exclusive end, e.g., `hour >= 5 && hour < 11`)
- checkMilestones uses `filter()` not `find()`
- localStorage keys include profileId: `streak-${profileId}`
- Guard division: check `goals.calories > 0` before ratio
- getYesterday returns STRING not Date
