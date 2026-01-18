# Spec: Accessibility & Inclusive Design

**Phase:** 6 - Polish & Accessibility
**Priority:** High
**Estimated Effort:** Medium

---

## Overview

Ensure the app is usable by everyone, including users with visual, motor, or cognitive disabilities. Follow WCAG 2.1 AA guidelines. Accessibility is not an afterthought — it's core to the Warm Wellness philosophy.

## Requirements

### Color Contrast

All text must meet WCAG AA contrast ratios:
- Normal text (< 18pt): 4.5:1 minimum
- Large text (≥ 18pt or 14pt bold): 3:1 minimum
- UI components and graphics: 3:1 minimum

```css
/* Verify these combinations pass */
:root {
  /* Light mode */
  --color-text: #2D2D2D;         /* On cream: 10.5:1 ✓ */
  --color-text-secondary: #5A5A5A; /* On cream: 5.2:1 ✓ */
  --color-muted: #7A756D;         /* On cream: 3.5:1 ✓ (large text only) */
  --color-sage: #5C6B54;          /* On cream: 4.6:1 ✓ */
  --color-terracotta: #C17B5F;    /* On cream: 3.2:1 ✓ (large/UI only) */
}

:root[data-theme="dark"] {
  --color-text: #F5F2ED;          /* On #1A1917: 12.5:1 ✓ */
  --color-text-secondary: #A8A299; /* On #1A1917: 6.8:1 ✓ */
  --color-muted: #7A756D;          /* On #1A1917: 3.8:1 ✓ */
}
```

### Focus Indicators

All interactive elements must have visible focus states:

```css
/* Base focus style */
:focus-visible {
  outline: 2px solid var(--color-sage);
  outline-offset: 2px;
}

/* Remove default for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}

/* Custom focus for specific elements */
.btn:focus-visible {
  outline: 2px solid var(--color-sage);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(92, 107, 84, 0.2);
}

.form-input:focus-visible {
  border-color: var(--color-sage);
  box-shadow: 0 0 0 3px rgba(92, 107, 84, 0.15);
}

.entry-card:focus-visible {
  outline: 2px solid var(--color-sage);
  outline-offset: 2px;
}
```

### Keyboard Navigation

All functionality accessible via keyboard:

```javascript
// Tab order should be logical
// 1. Header (date nav, settings)
// 2. Progress card
// 3. Entry list
// 4. FAB

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // 'n' - New entry (when not in input)
  if (e.key === 'n' && !isInputFocused()) {
    openEntryForm()
  }

  // Arrow left/right - Navigate dates
  if (e.key === 'ArrowLeft' && !isInputFocused()) {
    goToPreviousDay()
  }
  if (e.key === 'ArrowRight' && !isInputFocused()) {
    goToNextDay()
  }

  // Escape - Close modals/forms
  if (e.key === 'Escape') {
    closeActiveModal()
  }
})

function isInputFocused() {
  const active = document.activeElement
  return active.tagName === 'INPUT' ||
         active.tagName === 'TEXTAREA' ||
         active.isContentEditable
}
```

### Focus Trapping in Modals

```javascript
// src/utils/focus-trap.js
export function trapFocus(container) {
  const focusable = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  function handleKeyDown(e) {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus()
        e.preventDefault()
      }
    } else {
      if (document.activeElement === last) {
        first.focus()
        e.preventDefault()
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown)
  first?.focus()

  return () => container.removeEventListener('keydown', handleKeyDown)
}
```

### ARIA Labels & Roles

```jsx
// Progress ring needs ARIA
<div
  class="progress-ring"
  role="progressbar"
  aria-valuenow={Math.round(caloriePercent)}
  aria-valuemin="0"
  aria-valuemax="100"
  aria-label={`Calorie progress: ${Math.round(totals.calories)} of ${goals.calories} calories`}
>

// Entry list needs list semantics
<ul class="entry-list" role="list" aria-label="Food entries for today">
  {entries.map(entry => (
    <li key={entry.id} role="listitem">
      <EntryCard entry={entry} />
    </li>
  ))}
</ul>

// Buttons need descriptive labels
<button
  class="entry-delete-btn"
  aria-label={`Delete ${entry.name}`}
  onClick={() => handleDelete(entry.id)}
>
  🗑️
</button>

// FAB needs clear purpose
<button
  class="fab"
  aria-label="Add new food entry"
  onClick={openEntryForm}
>
  +
</button>
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .celebration {
    /* Still show celebration, just without animation */
  }

  .kusama-dot {
    animation: none !important;
    opacity: 0.7;
  }

  .progress-ring-fill {
    transition: none;
  }

  .entry-card {
    animation: none;
  }
}
```

### Screen Reader Announcements

```jsx
// src/components/LiveRegion.jsx
export function LiveRegion({ message }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {message}
    </div>
  )
}

// Usage: Announce changes
const [announcement, setAnnouncement] = useState('')

const handleAddEntry = async (entry) => {
  await addEntry(entry)
  setAnnouncement(`Added ${entry.name}, ${entry.calories} calories`)
}

// In render:
<LiveRegion message={announcement} />
```

### Skip Links

```html
<!-- At top of body -->
<a href="#main-content" class="skip-link">Skip to main content</a>
<a href="#add-entry" class="skip-link">Skip to add entry</a>
```

```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  background: var(--color-sage);
  color: white;
  padding: var(--space-2) var(--space-4);
  z-index: 9999;
  text-decoration: none;
}

.skip-link:focus {
  top: 0;
}
```

### Form Accessibility

```jsx
<form onSubmit={handleSubmit}>
  <div class="form-group">
    <label for="food-name" class="form-label">
      Food name
      <span class="required" aria-hidden="true">*</span>
    </label>
    <input
      type="text"
      id="food-name"
      name="name"
      class="form-input"
      required
      aria-required="true"
      aria-describedby="food-name-hint"
    />
    <span id="food-name-hint" class="form-hint">
      Enter what you ate (e.g., "Chicken salad")
    </span>
  </div>

  <div class="form-group">
    <label for="calories" class="form-label">Calories</label>
    <input
      type="number"
      id="calories"
      name="calories"
      class="form-input"
      min="0"
      max="10000"
      aria-describedby="calories-error"
      aria-invalid={errors.calories ? 'true' : 'false'}
    />
    {errors.calories && (
      <span id="calories-error" class="form-error" role="alert">
        {errors.calories}
      </span>
    )}
  </div>
</form>
```

### Touch Target Sizes

```css
/* Minimum 44x44px touch targets */
.btn,
.entry-card button,
.meal-type-btn,
.quick-add-chip {
  min-height: 44px;
  min-width: 44px;
}

/* Increase spacing between small targets */
.entry-actions {
  gap: var(--space-3); /* At least 8px between buttons */
}

.quick-add-scroll {
  gap: var(--space-2);
}
```

### High Contrast Mode

```css
@media (prefers-contrast: more) {
  :root {
    --color-text: #000000;
    --color-background: #FFFFFF;
    --color-border: #000000;
  }

  .btn {
    border: 2px solid currentColor;
  }

  .progress-ring-fill {
    stroke-width: 10;
  }

  .entry-card {
    border: 2px solid var(--color-border);
  }
}
```

### Screen Reader Only Utility

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## Acceptance Criteria

- [ ] All text meets WCAG AA contrast (4.5:1 / 3:1)
- [ ] All interactive elements keyboard accessible
- [ ] Visible focus indicators on all focusables
- [ ] Tab order is logical
- [ ] Modals trap focus
- [ ] Escape closes modals
- [ ] Skip links present
- [ ] All images have alt text (or aria-hidden)
- [ ] Form inputs have labels
- [ ] Error messages linked to inputs
- [ ] Progress bars have ARIA
- [ ] Touch targets ≥ 44px
- [ ] Reduced motion respected
- [ ] Screen reader announces changes
- [ ] Works with VoiceOver/NVDA

## Testing Checklist

### Manual Tests

1. [ ] Navigate entire app with keyboard only
2. [ ] Complete add entry flow with keyboard
3. [ ] Verify focus visible at all times
4. [ ] Escape closes all modals/forms
5. [ ] Test with macOS VoiceOver
6. [ ] Test with browser zoom at 200%

### Automated Tests

1. [ ] Run axe-core on all pages
2. [ ] Run Lighthouse accessibility audit
3. [ ] Run eslint-plugin-jsx-a11y

## Files to Create/Modify

- `src/utils/focus-trap.js` — Create
- `src/components/LiveRegion.jsx` — Create
- `src/components/SkipLinks.jsx` — Create
- `src/styles.css` — Focus styles, sr-only, high contrast
- All components — ARIA labels, roles, keyboard handling

## Resources

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe DevTools](https://www.deque.com/axe/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
