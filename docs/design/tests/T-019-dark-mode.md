# T-019: Dark Mode

## Feature
Dark mode with manual user preference override (auto/light/dark)

## Test Steps

### 1. Theme Preference UI
1. Open Settings (gear icon)
2. Verify "Theme" dropdown exists with options: Auto (time-based), Light, Dark
3. Select "Dark"
4. Verify body className changes to `theme-night`
5. Verify localStorage contains `theme-preference: "dark"`

### 2. Theme Persistence
1. Select theme preference (Dark or Light)
2. Reload page
3. Verify theme persists (body still has theme-night or theme-midday class)

### 3. Auto Mode
1. Select "Auto (time-based)"
2. Verify theme changes based on time of day:
   - 5am-11am: theme-morning
   - 11am-4pm: theme-midday
   - 4pm-8pm: theme-evening
   - 8pm-5am: theme-night

### 4. Contrast Verification
1. Select Dark theme
2. Inspect computed CSS variables:
   - --color-cream should be #1A1A1A (dark background)
   - --color-espresso should be #E8E8E8 or similar (light text)
3. Run Lighthouse accessibility audit
4. Verify contrast ratio >4.5:1 for all text

## Expected Results
- Theme toggle functional in Settings
- Dark mode applies theme-night class with high contrast colors
- Preference persists across page reloads
- Auto mode uses time-based theme selection
- All text meets WCAG AA contrast standards (4.5:1)

## Pass Criteria
✅ All test steps complete without errors
✅ Lighthouse accessibility score ≥90
✅ Dark mode contrast ratio verified >4.5:1
