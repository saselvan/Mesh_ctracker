# Spec: Agnes Martin Grid Rhythm & Stillness

**Phase:** 1 - Atmosphere & Perception
**Artist Influence:** Agnes Martin (Minimalist grids, meditative stillness)
**Priority:** Medium
**Estimated Effort:** Low-Medium

---

## Overview

Refine the app's spacing and visual rhythm to embody Agnes Martin's meditative minimalism. Her paintings use subtle grids and extremely pale colors to create a sense of **quiet stillness**. Our UI should feel calm and mathematically harmonious — every pixel intentional.

## Artist Context

Agnes Martin painted 6-foot square canvases with barely-visible pencil grids and pale washes of color. Standing in front of her work induces a meditative state — there's nothing to "look at" in the traditional sense, yet you can't look away. She said her paintings were about "perfection" and "innocence."

**Key techniques to steal:**
- Mathematical grid rhythm (not arbitrary spacing)
- Extreme restraint in color (pale, quiet)
- Generous negative space that "breathes"
- Hand-drawn imperfection within structure (subtle wobble)
- Stillness — nothing competes for attention

## Requirements

### Spacing System: 8px Base Grid

All spacing should align to an 8px grid for mathematical harmony:

```css
:root {
  /* Agnes Martin spacing scale — 8px base */
  --space-0: 0;
  --space-1: 4px;     /* Half-unit for micro-adjustments */
  --space-2: 8px;     /* Base unit */
  --space-3: 16px;    /* 2x */
  --space-4: 24px;    /* 3x */
  --space-5: 32px;    /* 4x */
  --space-6: 48px;    /* 6x */
  --space-8: 64px;    /* 8x */
  --space-10: 80px;   /* 10x */
  --space-12: 96px;   /* 12x */
}
```

### Component Spacing Audit

Review and adjust all components to use grid-aligned spacing:

| Component | Current | Agnes Martin Treatment |
|-----------|---------|----------------------|
| Progress card padding | 24px | 32px (`--space-5`) — more breathing room |
| Entry card padding | 14px 16px | 16px 24px (`--space-3` `--space-4`) |
| Entry card gap | 8px | 16px (`--space-3`) — aligned to grid |
| Section margins | 20px | 32px (`--space-5`) |
| Form field gaps | 16px | 24px (`--space-4`) |
| Header margin-bottom | 24px | 32px (`--space-5`) |

### Generous Whitespace

Increase negative space throughout:

```css
/* More breathing room in main container */
#app {
  padding: var(--space-5);        /* Was 20px, now 32px */
  padding-bottom: 120px;
}

/* More space between sections */
.progress-card {
  margin-bottom: var(--space-6);   /* Was 24px, now 48px */
  padding: var(--space-5);         /* Was 24px, now 32px */
}

.entry-list {
  margin-bottom: var(--space-6);
}

/* Entry cards need breathing room */
.entry-card {
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-3);   /* Was 8px, now 16px */
}
```

### Pale Color Refinement

Agnes Martin used barely-there colors. Our palette should be quieter:

```css
:root {
  /* Quieter, more Agnes-like palette */
  --color-cream: #FAFAF7;          /* Even more subtle */
  --color-sage-pale: #F0F2EE;      /* Paler */
  --color-sage-faint: #F5F7F3;     /* Almost white */
  --color-muted: #A8A8A8;          /* Softer gray */
}
```

### Visual Rhythm in Lists

Entry cards should have consistent rhythm:

```css
.entry-card {
  /* Consistent height for visual grid */
  min-height: 72px;                /* 9 × 8px grid */
}

/* Equal visual weight */
.entry-card + .entry-card {
  margin-top: var(--space-3);
}
```

### Stillness: Reduce Visual Noise

Remove or soften anything that creates visual tension:

```css
/* Softer shadows — less dramatic */
:root {
  --shadow-sm: 0 1px 2px rgba(92,107,84,0.04);
  --shadow-md: 0 2px 8px rgba(92,107,84,0.06);
}

/* Softer borders */
.date-display,
.btn-icon {
  border: 1px solid rgba(92,107,84,0.1);  /* More transparent */
}

/* Remove hover transforms that create motion */
.entry-card:hover {
  transform: none;                         /* Stillness */
  box-shadow: var(--shadow-md);           /* Just subtle shadow change */
}
```

### Empty State: Embrace the Void

Agnes Martin's work is about finding beauty in emptiness:

```css
.entry-list-empty {
  padding: var(--space-10) var(--space-5);  /* Very generous */
  color: var(--color-muted);
}

.entry-list-empty p {
  font-size: 1.125rem;
  font-weight: 400;                        /* Lighter weight */
  letter-spacing: 0.01em;
}
```

## Acceptance Criteria

- [ ] All spacing values align to 8px grid (or documented exceptions)
- [ ] Progress card has noticeably more padding (32px)
- [ ] Entry cards have consistent min-height (72px)
- [ ] Gaps between sections increased to 48px
- [ ] Shadows are subtler (04-06% opacity)
- [ ] Hover states don't create jarring motion
- [ ] Empty state feels peaceful, not broken
- [ ] Overall impression: "quiet" and "still"

## Files to Modify

- `src/styles.css` — Spacing values, shadows, colors

## Test Plan

1. Visual grid overlay: Do elements align to 8px grid?
2. Squint test: Does the app feel calm when defocused?
3. Compare to Agnes Martin paintings — similar quietness?
4. A/B comparison: Show before/after to neutral observer
5. Check that increased spacing works on small screens (320px)

## Reference Images

Search "Agnes Martin Friendship" or "Agnes Martin Untitled #5" — notice the barely-visible grid, the extreme paleness, the sense that nothing is competing for attention.

## Notes

- This spec is about RESTRAINT, not addition
- If something feels "designed," it's probably too loud
- Agnes Martin: "My paintings are not about what is seen. They are about what is known forever in the mind."
- Goal: User should feel calm using the app without knowing why
