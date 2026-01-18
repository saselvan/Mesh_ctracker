# Constraints: Calorie Tracker Redesign

id: C-001
date: 2026-01-17

## Technical Boundaries

### Stack (Fixed)
- **Framework:** Preact + Vite (keep — lightweight, fast)
- **Styling:** CSS with custom properties (keep — no build deps)
- **Storage:** IndexedDB + localStorage (keep — local-first)
- **Deployment:** GitHub Pages (keep — free, static)

### No New Dependencies
- Must work with vanilla CSS (no Tailwind, no CSS-in-JS)
- Animations via CSS only (no Framer Motion, no GSAP)
- Fonts via Google Fonts CDN

### Browser Support
- Modern browsers only (Chrome, Safari, Firefox, Edge)
- No IE11, no legacy

## Performance Budgets

| Metric | Target | Current |
|--------|--------|---------|
| First paint | <1s | Good |
| Bundle size | <100KB | Good |
| CSS size | <20KB | ~10KB |
| Animation FPS | 60fps | N/A |

## Resource Reality

- **Timeline:** Single session redesign
- **Scope:** Visual refresh, not feature addition
- **Risk tolerance:** Medium (can break current look)

## Non-Negotiables

1. **Mobile-first** — Must work at 320px, optimized for 480px
2. **Accessibility** — Color contrast 4.5:1, keyboard nav, focus states
3. **Local-first** — No external API calls for core function
4. **Existing functionality** — All current features must work

## Explicit Descopes

| Descoped | Reason |
|----------|--------|
| Dark mode | Future feature, not this session |
| Component library | Overkill for single app |
| Design system docs | Just need working code |
| Animation library | CSS transitions sufficient |
| New features | Visual refresh only |

## Files to Modify

### Primary (will change)
- `src/styles.css` — Complete overhaul
- `src/components/DailyProgress.jsx` — New radial progress
- `index.html` — Add Google Fonts

### Secondary (may change)
- `src/components/Header.jsx` — Typography refresh
- `src/components/EntryForm.jsx` — Form styling
- `src/components/EntryList.jsx` — Card treatment

### Untouched
- `src/utils/*` — Business logic unchanged
- `src/components/App.jsx` — Structure unchanged
