# Design Tokens: Calorie Tracker

id: T-001
date: 2026-01-17
aesthetic: Warm Wellness

## Typography

### Font Families

| Token | Value | Use |
|-------|-------|-----|
| `--font-display` | 'Fraunces', Georgia, serif | Headlines, large numbers |
| `--font-body` | 'Nunito Sans', sans-serif | Body text, labels, UI |

### Scale (modular, 1.25 ratio)

| Token | Size | Use |
|-------|------|-----|
| `--text-xs` | 0.75rem (12px) | Micro labels |
| `--text-sm` | 0.875rem (14px) | Secondary text |
| `--text-base` | 1rem (16px) | Body |
| `--text-lg` | 1.25rem (20px) | Subheadings |
| `--text-xl` | 1.5rem (24px) | Section titles |
| `--text-2xl` | 2rem (32px) | Page titles |
| `--text-3xl` | 2.5rem (40px) | Hero numbers |

### Weights

| Token | Value | Use |
|-------|-------|-----|
| `--font-normal` | 400 | Body text |
| `--font-medium` | 500 | Labels, emphasis |
| `--font-semibold` | 600 | Headings |
| `--font-bold` | 700 | Numbers, CTAs |

## Colors

### Core Palette

| Token | Value | Use |
|-------|-------|-----|
| `--color-cream` | #FAF7F2 | Page background |
| `--color-white` | #FFFFFF | Card surfaces |
| `--color-sage` | #5C6B54 | Primary actions, headings |
| `--color-sage-light` | #8A9A82 | Secondary, hover |
| `--color-sage-pale` | #E8EDE6 | Backgrounds, borders |
| `--color-terracotta` | #C17B5F | Accent, FAB, highlights |
| `--color-terracotta-light` | #D4A08A | Hover states |
| `--color-espresso` | #3D3D3D | Primary text |
| `--color-warm-gray` | #6B6B6B | Secondary text |
| `--color-muted` | #9B9B9B | Placeholder, disabled |

### Semantic

| Token | Value | Use |
|-------|-------|-----|
| `--color-success` | #7D9B76 | Goal achieved |
| `--color-warning` | #D4A574 | Near limit, over (no red!) |
| `--color-danger` | #C17B5F | Destructive (terracotta, not red) |

### Macros (warm, harmonious)

| Token | Value | Use |
|-------|-------|-----|
| `--color-protein` | #8B7355 | Warm brown |
| `--color-carbs` | #C4A35A | Golden amber |
| `--color-fat` | #B08D7A | Dusty rose |

## Spacing

Base unit: 4px

| Token | Value |
|-------|-------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |

## Borders & Radius

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | 8px | Buttons, inputs |
| `--radius-md` | 12px | Cards, small modals |
| `--radius-lg` | 20px | Large cards, sheets |
| `--radius-full` | 9999px | Pills, avatars, FAB |

## Shadows

| Token | Value | Use |
|-------|-------|-----|
| `--shadow-sm` | 0 1px 3px rgba(92,107,84,0.08) | Subtle elevation |
| `--shadow-md` | 0 4px 12px rgba(92,107,84,0.1) | Cards |
| `--shadow-lg` | 0 8px 24px rgba(92,107,84,0.12) | Modals, FAB |
| `--shadow-glow` | 0 0 30px rgba(193,123,95,0.25) | FAB hover, celebration |

## Motion

| Token | Value | Use |
|-------|-------|-----|
| `--duration-fast` | 150ms | Micro-interactions |
| `--duration-normal` | 250ms | Standard transitions |
| `--duration-slow` | 400ms | Page transitions, reveals |
| `--ease-out` | cubic-bezier(0.16, 1, 0.3, 1) | Entrances |
| `--ease-in-out` | cubic-bezier(0.65, 0, 0.35, 1) | State changes |

## Gradients

| Token | Value | Use |
|-------|-------|-----|
| `--gradient-warm` | linear-gradient(135deg, rgba(232,237,230,0.6) 0%, rgba(250,247,242,0.8) 100%) | Background orb |
| `--gradient-progress` | conic-gradient(from -90deg, var(--color-sage) var(--progress), var(--color-sage-pale) 0) | Radial progress |

## CSS Variables Block

```css
:root {
  /* Typography */
  --font-display: 'Fraunces', Georgia, serif;
  --font-body: 'Nunito Sans', -apple-system, sans-serif;

  /* Colors */
  --color-cream: #FAF7F2;
  --color-white: #FFFFFF;
  --color-sage: #5C6B54;
  --color-sage-light: #8A9A82;
  --color-sage-pale: #E8EDE6;
  --color-terracotta: #C17B5F;
  --color-terracotta-light: #D4A08A;
  --color-espresso: #3D3D3D;
  --color-warm-gray: #6B6B6B;
  --color-muted: #9B9B9B;
  --color-success: #7D9B76;
  --color-warning: #D4A574;
  --color-protein: #8B7355;
  --color-carbs: #C4A35A;
  --color-fat: #B08D7A;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;

  /* Borders */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(92,107,84,0.08);
  --shadow-md: 0 4px 12px rgba(92,107,84,0.1);
  --shadow-lg: 0 8px 24px rgba(92,107,84,0.12);
  --shadow-glow: 0 0 30px rgba(193,123,95,0.25);

  /* Motion */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```
