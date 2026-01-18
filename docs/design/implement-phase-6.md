# Phase 6: Data Features

Meal categorization, favorites, recent foods, and templates.

**Prerequisite:** Phases 1-5 complete

## Tech Stack
- localStorage for favorites/templates
- IndexedDB queries for recent foods
- Preact components

## Specs to Implement

### S-011: Meal Categories

**Files to create:**
- CREATE `src/utils/meals.js`

**Files to modify:**
- MODIFY `src/components/EntryForm.jsx` (add meal selector)
- MODIFY `src/components/EntryList.jsx` (group by meal)
- MODIFY `src/utils/db.js` (add mealType to schema)

**Implementation:**

```javascript
// src/utils/meals.js
export const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', icon: '🌅', hours: [5, 10] },
  { id: 'lunch', label: 'Lunch', icon: '☀️', hours: [11, 14] },
  { id: 'dinner', label: 'Dinner', icon: '🌙', hours: [17, 21] },
  { id: 'snack', label: 'Snack', icon: '🍎', hours: null }
]

export function getSuggestedMealType() {
  const hour = new Date().getHours()

  for (const meal of MEAL_TYPES) {
    if (meal.hours && hour >= meal.hours[0] && hour <= meal.hours[1]) {
      return meal.id
    }
  }

  return 'snack'
}

export function getMealIcon(mealType) {
  return MEAL_TYPES.find(m => m.id === mealType)?.icon || '🍎'
}
```

**EntryForm.jsx additions:**
```jsx
import { MEAL_TYPES, getSuggestedMealType } from '../utils/meals'

// In state:
const [mealType, setMealType] = useState(getSuggestedMealType())

// In form, add meal selector:
<div class="meal-selector">
  {MEAL_TYPES.map(meal => (
    <button
      key={meal.id}
      type="button"
      class={`meal-btn ${mealType === meal.id ? 'active' : ''}`}
      onClick={() => setMealType(meal.id)}
    >
      <span>{meal.icon}</span>
      <span>{meal.label}</span>
    </button>
  ))}
</div>

// Include mealType in entry data
const entryData = { ...formData, mealType }
```

**EntryList.jsx additions:**
```jsx
import { MEAL_TYPES, getMealIcon } from '../utils/meals'

// Group entries by mealType
const grouped = MEAL_TYPES.reduce((acc, meal) => {
  acc[meal.id] = entries.filter(e => (e.mealType || 'snack') === meal.id)
  return acc
}, {})

// Render grouped:
{MEAL_TYPES.map(meal => {
  const mealEntries = grouped[meal.id]
  if (mealEntries.length === 0) return null

  const subtotal = mealEntries.reduce((sum, e) => sum + e.calories, 0)

  return (
    <div key={meal.id} class="meal-group">
      <h3>{meal.icon} {meal.label} <span class="meal-subtotal">{subtotal} cal</span></h3>
      {mealEntries.map(entry => (
        <EntryCard key={entry.id} entry={entry} ... />
      ))}
    </div>
  )
})}
```

**Migration:** Add default mealType to existing entries:
```javascript
// In db.js onupgradeneeded for version 3:
if (event.oldVersion < 3) {
  const store = event.target.transaction.objectStore('entries')
  store.openCursor().onsuccess = (e) => {
    const cursor = e.target.result
    if (cursor) {
      if (!cursor.value.mealType) {
        cursor.value.mealType = 'snack'
        cursor.update(cursor.value)
      }
      cursor.continue()
    }
  }
}
```

**Test:** `docs/design/tests/T-011-meal-categories.md`

---

### S-012: Quick Add Favorites

**Files to modify:**
- MODIFY `src/utils/storage.js` (add favorites functions)
- CREATE `src/components/FavoritesPicker.jsx`
- MODIFY `src/components/EntryList.jsx` (add star button)
- MODIFY `src/components/EntryForm.jsx` (add favorites picker)

**Implementation:**

```javascript
// Add to src/utils/storage.js
export function getFavorites(profileId) {
  const key = `favorites-${profileId || 'default'}`
  const stored = localStorage.getItem(key)
  return stored ? JSON.parse(stored) : []
}

export function saveFavorites(profileId, favorites) {
  const key = `favorites-${profileId || 'default'}`
  // Limit to 20 favorites
  const limited = favorites.slice(0, 20)
  localStorage.setItem(key, JSON.stringify(limited))
}

export function addToFavorites(profileId, entry) {
  const favorites = getFavorites(profileId)
  const template = {
    id: Date.now(),
    name: entry.name,
    calories: entry.calories,
    protein: entry.protein,
    carbs: entry.carbs,
    fat: entry.fat,
    mealType: entry.mealType
  }
  saveFavorites(profileId, [template, ...favorites])
}

export function removeFromFavorites(profileId, favoriteId) {
  const favorites = getFavorites(profileId)
  saveFavorites(profileId, favorites.filter(f => f.id !== favoriteId))
}
```

```jsx
// src/components/FavoritesPicker.jsx
import { getFavorites } from '../utils/storage'

export function FavoritesPicker({ profileId, onSelect, onClose }) {
  const favorites = getFavorites(profileId)

  return (
    <div class="favorites-picker">
      <div class="favorites-header">
        <h3>Favorites</h3>
        <button onClick={onClose}>×</button>
      </div>
      {favorites.length === 0 ? (
        <p class="favorites-empty">No favorites yet. Star an entry to add it.</p>
      ) : (
        <ul class="favorites-list">
          {favorites.map(fav => (
            <li key={fav.id}>
              <button onClick={() => onSelect(fav)}>
                <strong>{fav.name}</strong>
                <span>{fav.calories} cal</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

**EntryList.jsx - add star button:**
```jsx
import { addToFavorites } from '../utils/storage'

<button
  class="btn-star"
  onClick={() => addToFavorites(profileId, entry)}
  aria-label={`Add ${entry.name} to favorites`}
>
  ⭐
</button>
```

**Test:** `docs/design/tests/T-012-quick-add-favorites.md`

---

### S-013: Recent Foods

**Files to modify:**
- MODIFY `src/utils/db.js` (add getRecentFoods)
- MODIFY `src/components/EntryForm.jsx` (show recent as chips)

**Implementation:**

```javascript
// Add to src/utils/db.js
export async function getRecentFoods(profileId, limit = 10) {
  const db = await openDB()
  const tx = db.transaction('entries', 'readonly')
  const store = tx.objectStore('entries')

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const startDate = sevenDaysAgo.toISOString().split('T')[0]

  return new Promise((resolve) => {
    const entries = []
    const request = store.openCursor()

    request.onsuccess = (e) => {
      const cursor = e.target.result
      if (cursor) {
        const entry = cursor.value
        if (entry.profileId === profileId && entry.date >= startDate) {
          entries.push(entry)
        }
        cursor.continue()
      } else {
        // Deduplicate by name and count frequency
        const counts = {}
        entries.forEach(e => {
          const key = e.name.toLowerCase()
          if (!counts[key]) {
            counts[key] = { entry: e, count: 0 }
          }
          counts[key].count++
        })

        // Sort by frequency and return top N
        const sorted = Object.values(counts)
          .sort((a, b) => b.count - a.count)
          .slice(0, limit)
          .map(c => c.entry)

        resolve(sorted)
      }
    }
  })
}
```

**EntryForm.jsx additions:**
```jsx
import { getRecentFoods } from '../utils/db'

const [recentFoods, setRecentFoods] = useState([])

useEffect(() => {
  getRecentFoods(profileId).then(setRecentFoods)
}, [profileId])

// Render chips:
{recentFoods.length > 0 && (
  <div class="recent-foods">
    <label>Recently logged:</label>
    <div class="recent-chips">
      {recentFoods.map(food => (
        <button
          key={food.id}
          type="button"
          class="recent-chip"
          onClick={() => populateForm(food)}
        >
          {food.name}
        </button>
      ))}
    </div>
  </div>
)}
```

**Test:** `docs/design/tests/T-013-recent-foods.md`

---

### S-014: Meal Templates

**Files to modify:**
- MODIFY `src/utils/storage.js` (add template functions)
- CREATE `src/components/TemplateManager.jsx`
- MODIFY `src/components/EntryForm.jsx` (template picker)

**Implementation:**

```javascript
// Add to src/utils/storage.js
export function getTemplates(profileId) {
  const key = `templates-${profileId || 'default'}`
  const stored = localStorage.getItem(key)
  return stored ? JSON.parse(stored) : []
}

export function saveTemplates(profileId, templates) {
  const key = `templates-${profileId || 'default'}`
  localStorage.setItem(key, JSON.stringify(templates))
}

export function createTemplate(profileId, name, entries, mealType) {
  const templates = getTemplates(profileId)
  const template = {
    id: Date.now(),
    name,
    mealType,
    entries: entries.map(e => ({
      name: e.name,
      calories: e.calories,
      protein: e.protein,
      carbs: e.carbs,
      fat: e.fat
    })),
    createdAt: new Date().toISOString()
  }
  saveTemplates(profileId, [...templates, template])
  return template
}

export function deleteTemplate(profileId, templateId) {
  const templates = getTemplates(profileId)
  saveTemplates(profileId, templates.filter(t => t.id !== templateId))
}
```

```jsx
// src/components/TemplateManager.jsx
import { getTemplates, deleteTemplate } from '../utils/storage'

export function TemplateManager({ profileId, onSelect, onClose }) {
  const [templates, setTemplates] = useState(getTemplates(profileId))

  const handleDelete = (id) => {
    deleteTemplate(profileId, id)
    setTemplates(getTemplates(profileId))
  }

  return (
    <div class="template-manager">
      <div class="template-header">
        <h3>Meal Templates</h3>
        <button onClick={onClose}>×</button>
      </div>
      {templates.length === 0 ? (
        <p>No templates yet. Create one from multiple entries.</p>
      ) : (
        <ul class="template-list">
          {templates.map(t => (
            <li key={t.id}>
              <button onClick={() => onSelect(t)}>
                <strong>{t.name}</strong>
                <span>{t.entries.length} items</span>
              </button>
              <button onClick={() => handleDelete(t.id)}>🗑️</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

**Test:** `docs/design/tests/T-014-meal-templates.md`

---

## Integration Checklist

After implementation, verify:

- [ ] Meal selector appears in EntryForm with 4 options
- [ ] Auto-suggests meal based on time
- [ ] EntryList groups entries by meal type
- [ ] Meal subtotals displayed correctly
- [ ] Star button adds entry to favorites
- [ ] FavoritesPicker shows favorites list
- [ ] Click favorite populates form
- [ ] Max 20 favorites enforced
- [ ] Recent foods chips appear in form
- [ ] Recent foods sorted by frequency
- [ ] Template creation works
- [ ] Template applies all entries to today
- [ ] Database migration handles existing entries

## Verification

```bash
npm run build
npm run dev
# Test full flow: add entries, star favorites, create templates
```

## Success Criteria

Phase 6 is complete when:
1. Meal categorization working end-to-end
2. Favorites star/picker functional
3. Recent foods showing correctly
4. Templates create and apply
5. Build succeeds
