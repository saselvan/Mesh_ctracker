# Spec: Meal Category Organization

**Phase:** 4 - Smart Entry
**Priority:** High
**Estimated Effort:** Medium

---

## Overview

Allow users to categorize food entries by meal type (Breakfast, Lunch, Dinner, Snacks). Entries are grouped visually, and the UI suggests the appropriate category based on time of day.

## Requirements

### Data Model

Add `mealType` field to entries:

```javascript
// Entry shape
{
  id: 1,
  name: "Oatmeal with berries",
  calories: 350,
  protein: 12,
  carbs: 58,
  fat: 8,
  mealType: "breakfast", // breakfast | lunch | dinner | snack
  date: "2025-01-17",
  profileId: "default"
}
```

### Meal Type Definitions

```javascript
export const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', icon: '🌅', timeRange: [5, 10] },
  { id: 'lunch', label: 'Lunch', icon: '☀️', timeRange: [11, 14] },
  { id: 'dinner', label: 'Dinner', icon: '🌙', timeRange: [17, 21] },
  { id: 'snack', label: 'Snacks', icon: '🍎', timeRange: null },
]

export function getSuggestedMealType() {
  const hour = new Date().getHours()
  const meal = MEAL_TYPES.find(m =>
    m.timeRange && hour >= m.timeRange[0] && hour <= m.timeRange[1]
  )
  return meal?.id || 'snack'
}
```

### Entry Form Enhancement

```jsx
function EntryForm({ onSubmit, initialMealType }) {
  const [mealType, setMealType] = useState(
    initialMealType || getSuggestedMealType()
  )

  return (
    <form>
      <div class="meal-type-selector">
        {MEAL_TYPES.map(type => (
          <button
            type="button"
            class={`meal-type-btn ${mealType === type.id ? 'active' : ''}`}
            onClick={() => setMealType(type.id)}
          >
            <span class="meal-type-icon">{type.icon}</span>
            <span class="meal-type-label">{type.label}</span>
          </button>
        ))}
      </div>
      {/* existing form fields */}
    </form>
  )
}
```

### CSS for Meal Type Selector

```css
.meal-type-selector {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--space-3);
}

.meal-type-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2);
  background: var(--color-surface);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 200ms ease;
}

.meal-type-btn:hover {
  background: var(--color-sage-pale);
}

.meal-type-btn.active {
  border-color: var(--color-sage);
  background: var(--color-sage-pale);
}

.meal-type-icon {
  font-size: 1.25rem;
}

.meal-type-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-muted);
}

.meal-type-btn.active .meal-type-label {
  color: var(--color-sage);
}
```

### Grouped Entry List

```jsx
function EntryList({ entries }) {
  const grouped = groupByMealType(entries)

  return (
    <div class="entry-list">
      {MEAL_TYPES.map(type => {
        const mealEntries = grouped[type.id] || []
        if (mealEntries.length === 0) return null

        return (
          <div key={type.id} class="meal-group">
            <div class="meal-group-header">
              <span class="meal-group-icon">{type.icon}</span>
              <span class="meal-group-label">{type.label}</span>
              <span class="meal-group-calories">
                {sumCalories(mealEntries)} cal
              </span>
            </div>
            <div class="meal-group-entries">
              {mealEntries.map(entry => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

### Migration

For existing entries without `mealType`:

```javascript
export function migrateEntryMealTypes(entries) {
  return entries.map(entry => ({
    ...entry,
    mealType: entry.mealType || 'snack' // Default to snack
  }))
}
```

## Acceptance Criteria

- [ ] Entries have mealType field (breakfast/lunch/dinner/snack)
- [ ] Form suggests meal type based on current time
- [ ] User can override suggested meal type
- [ ] Entries grouped by meal type in list
- [ ] Each meal group shows subtotal calories
- [ ] Existing entries default to "snack"
- [ ] IndexedDB schema updated

## Files to Create/Modify

- `src/utils/db.js` — Add mealType to schema
- `src/utils/meals.js` — Create (meal type utilities)
- `src/components/EntryForm.jsx` — Add meal selector
- `src/components/EntryList.jsx` — Group by meal type
- `src/styles.css` — Meal styling

## Test Plan

1. Open form at 8am — suggests Breakfast?
2. Open form at 1pm — suggests Lunch?
3. Open form at 7pm — suggests Dinner?
4. Open form at 3pm — suggests Snack?
5. Override suggestion — respects user choice?
6. View entries — grouped correctly?
