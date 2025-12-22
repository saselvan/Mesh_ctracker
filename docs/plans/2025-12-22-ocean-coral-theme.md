# Ocean Coral Theme Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the calorie tracker from dull sage green to a vibrant, energizing Ocean Coral theme with teal primary colors and coral accents.

**Architecture:** Pure CSS variable replacement in styles.css. No component changes needed - all styling flows through CSS custom properties. Update color variables, shadows, and a few specific color applications.

**Tech Stack:** CSS custom properties, Vite build

---

## Task 1: Replace Color Variables

**Files:**
- Modify: `src/styles.css:1-36`

**Step 1: Replace the `:root` color variables**

Replace the entire `:root` block with the new Ocean Coral palette:

```css
:root {
  /* Primary - Teal */
  --primary-50: #ecfeff;
  --primary-100: #cffafe;
  --primary-200: #a5f3fc;
  --primary-400: #22d3ee;
  --primary-500: #06b6d4;
  --primary-600: #0891b2;
  --primary-700: #0e7490;

  /* Accent - Coral */
  --accent-400: #fb923c;
  --accent-500: #f97316;
  --accent-600: #ea580c;

  /* Neutrals - Warm tinted */
  --white: #ffffff;
  --gray-50: #fafaf9;
  --gray-100: #f5f5f4;
  --gray-200: #e7e5e4;
  --gray-300: #d6d3d1;
  --gray-400: #a8a29e;
  --gray-500: #78716c;
  --gray-600: #57534e;
  --gray-700: #44403c;

  /* Danger */
  --red-500: #ef4444;
  --red-600: #dc2626;

  /* Macros */
  --color-protein: #8b5cf6;
  --color-carbs: #f59e0b;
  --color-fat: #ec4899;

  /* Typography & Layout */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --border-radius: 12px;
  --border-radius-sm: 8px;

  /* Shadows - Teal tinted */
  --shadow-sm: 0 1px 2px rgba(6, 182, 212, 0.08);
  --shadow: 0 4px 6px -1px rgba(6, 182, 212, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(6, 182, 212, 0.15);
  --shadow-coral: 0 8px 24px rgba(249, 115, 22, 0.3);
}
```

**Step 2: Run build to verify no errors**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/styles.css
git commit -m "feat: add Ocean Coral color palette variables"
```

---

## Task 2: Update Body and Background

**Files:**
- Modify: `src/styles.css:44-50`

**Step 1: Update body styles**

Replace the body styles to use the new teal background:

```css
body {
  font-family: var(--font-family);
  background: var(--primary-50);
  color: var(--gray-700);
  line-height: 1.6;
  min-height: 100vh;
}
```

**Step 2: Run build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/styles.css
git commit -m "feat: update body background to teal wash"
```

---

## Task 3: Update Header Styles

**Files:**
- Modify: `src/styles.css:59-129`

**Step 1: Update header title color**

Find `.header-title` and change color:

```css
.header-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-700);
}
```

**Step 2: Update date display styles**

Find `.date-display` and update:

```css
.date-display {
  background: var(--white);
  border: 1px solid var(--primary-200);
  border-radius: var(--border-radius-sm);
  padding: 8px 20px;
  font-size: 1rem;
  font-weight: 500;
  color: var(--primary-700);
  cursor: pointer;
  transition: all 0.2s;
}

.date-display:hover {
  background: var(--primary-100);
  border-color: var(--primary-400);
}
```

**Step 3: Update icon button styles**

Find `.btn-icon` and update:

```css
.btn-icon {
  background: var(--white);
  border: 1px solid var(--primary-200);
  border-radius: var(--border-radius-sm);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--primary-600);
  transition: all 0.2s;
}

.btn-icon:hover:not(:disabled) {
  background: var(--primary-100);
  border-color: var(--primary-400);
}
```

**Step 4: Update focus styles**

Find the focus-visible rules and update:

```css
.btn-icon:focus-visible,
.date-display:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

**Step 5: Run build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add src/styles.css
git commit -m "feat: update header to Ocean Coral theme"
```

---

## Task 4: Update Progress Card Styles

**Files:**
- Modify: `src/styles.css:131-203`

**Step 1: Update progress value color to coral**

Find `.progress-value` and make it coral (hero number):

```css
.progress-value {
  font-size: 2rem;
  font-weight: 600;
  color: var(--accent-500);
}
```

**Step 2: Update progress bar container**

Find `.progress-bar-container` and update:

```css
.progress-bar-container {
  height: 12px;
  background: var(--primary-200);
  border-radius: 6px;
  overflow: hidden;
}
```

**Step 3: Update progress bar states**

Find the progress bar modifier classes and update:

```css
.progress-bar--under {
  background: var(--primary-500);
}

.progress-bar--close {
  background: var(--accent-500);
}

.progress-bar--over {
  background: var(--red-500);
}
```

**Step 4: Run build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/styles.css
git commit -m "feat: update progress card to Ocean Coral theme"
```

---

## Task 5: Update Entry List Styles

**Files:**
- Modify: `src/styles.css:260-327`

**Step 1: Update entry calories color**

Find `.entry-calories` and update to teal:

```css
.entry-calories {
  font-weight: 600;
  color: var(--primary-600);
}
```

**Step 2: Update entry delete focus**

Find `.entry-delete:focus-visible` and update:

```css
.entry-delete:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

**Step 3: Run build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/styles.css
git commit -m "feat: update entry list to Ocean Coral theme"
```

---

## Task 6: Update Form Styles

**Files:**
- Modify: `src/styles.css:329-411`

**Step 1: Update form overlay**

Find `.form-overlay` and update to teal-tinted overlay:

```css
.form-overlay {
  position: fixed;
  inset: 0;
  background: rgba(14, 116, 144, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.2s ease;
}
```

**Step 2: Update form title**

Find `.form-title` and update:

```css
.form-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-700);
  margin-bottom: 20px;
}
```

**Step 3: Update form input focus**

Find `.form-input:focus` and update:

```css
.form-input:focus {
  outline: none;
  border-color: var(--primary-400);
  background: var(--white);
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15);
}
```

**Step 4: Run build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/styles.css
git commit -m "feat: update forms to Ocean Coral theme"
```

---

## Task 7: Update Button Styles

**Files:**
- Modify: `src/styles.css:413-456`

**Step 1: Update primary button**

Find `.btn--primary` rules and update:

```css
.btn--primary {
  background: var(--primary-600);
  color: var(--white);
}

.btn--primary:hover {
  background: var(--primary-700);
}
```

**Step 2: Update button focus**

Find `.btn:focus-visible` and update:

```css
.btn:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

**Step 3: Run build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/styles.css
git commit -m "feat: update buttons to Ocean Coral theme"
```

---

## Task 8: Update Modal Styles

**Files:**
- Modify: `src/styles.css:458-506`

**Step 1: Update modal overlay**

Find `.modal-overlay` and update:

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(14, 116, 144, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}
```

**Step 2: Run build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/styles.css
git commit -m "feat: update modal overlay to teal tint"
```

---

## Task 9: Update FAB Styles

**Files:**
- Modify: `src/styles.css:508-545`

**Step 1: Update FAB with coral glow**

Find `.fab` rules and update:

```css
.fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--primary-600);
  color: var(--white);
  border: none;
  box-shadow: var(--shadow-coral);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.fab:hover {
  background: var(--primary-700);
  transform: scale(1.05);
}

.fab:focus-visible {
  outline: 2px solid var(--primary-700);
  outline-offset: 2px;
}
```

**Step 2: Run build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/styles.css
git commit -m "feat: update FAB with coral glow shadow"
```

---

## Task 10: Update Calendar Styles

**Files:**
- Modify: `src/styles.css:547-636`

**Step 1: Update calendar title**

Find `.calendar-title` and update:

```css
.calendar-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-700);
}
```

**Step 2: Update calendar day hover**

Find `.calendar-day:hover` rule and update:

```css
.calendar-day:hover:not(:disabled):not(.calendar-day--empty) {
  background: var(--primary-100);
}
```

**Step 3: Update calendar day today**

Find `.calendar-day--today` and update:

```css
.calendar-day--today {
  font-weight: 600;
  color: var(--primary-600);
  border: 2px solid var(--primary-400);
}
```

**Step 4: Update calendar day selected**

Find `.calendar-day--selected` rules and update:

```css
.calendar-day--selected {
  background: var(--primary-600);
  color: var(--white);
}

.calendar-day--selected:hover:not(:disabled) {
  background: var(--primary-700);
}
```

**Step 5: Run build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add src/styles.css
git commit -m "feat: update calendar to Ocean Coral theme"
```

---

## Task 11: Update Settings Styles

**Files:**
- Modify: `src/styles.css:638-671`

**Step 1: Update status message color**

Find `.status-message` and update:

```css
.status-message {
  text-align: center;
  font-size: 0.875rem;
  color: var(--primary-600);
  margin-bottom: 16px;
}
```

**Step 2: Run build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/styles.css
git commit -m "feat: update settings to Ocean Coral theme"
```

---

## Task 12: Final Verification and Push

**Step 1: Run final build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 2: Start dev server and visually verify**

Run: `npm run dev`
Expected: App displays with vibrant teal background, coral calorie number, teal buttons, coral FAB glow

**Step 3: Create final commit with all changes**

Run: `git status`
Expected: All changes committed (working tree clean)

**Step 4: Push to GitHub**

```bash
git push origin main
```

Expected: Push succeeds, GitHub Actions deploys updated theme

---

## Summary

Total tasks: 12
Estimated time: 20-30 minutes

The transformation replaces:
- Dull sage green → Vibrant cyan-teal primary
- Gray accents → Warm coral accents
- Black shadows → Teal-tinted shadows
- Flat buttons → Coral glow on FAB
- Cold neutrals → Warm stone-tinted grays
