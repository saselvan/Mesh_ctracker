# Spec: Quick-Add Favorites

**Phase:** 4 - Smart Entry
**Priority:** High
**Estimated Effort:** Medium

---

## Overview

Allow users to save frequently eaten foods as "favorites" for one-tap logging. Favorites appear as chips above the entry form, enabling rapid food logging without re-entering nutritional data.

## Requirements

### Data Model

```javascript
// Favorite shape
{
  id: "fav_1",
  name: "Morning Coffee",
  calories: 50,
  protein: 1,
  carbs: 2,
  fat: 3,
  profileId: "default",
  usageCount: 42,
  lastUsed: "2025-01-17"
}

// Storage key: favorites-{profileId}
```

### Storage Functions

```javascript
// src/utils/storage.js
export function getFavorites(profileId) {
  const key = profileId ? `favorites-${profileId}` : 'favorites'
  return JSON.parse(localStorage.getItem(key) || '[]')
}

export function saveFavorite(profileId, food) {
  const favorites = getFavorites(profileId)
  const favorite = {
    id: `fav_${Date.now()}`,
    name: food.name,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    profileId,
    usageCount: 0,
    lastUsed: null
  }
  favorites.push(favorite)
  localStorage.setItem(
    profileId ? `favorites-${profileId}` : 'favorites',
    JSON.stringify(favorites)
  )
  return favorite
}

export function incrementFavoriteUsage(profileId, favoriteId) {
  const favorites = getFavorites(profileId)
  const updated = favorites.map(f =>
    f.id === favoriteId
      ? { ...f, usageCount: f.usageCount + 1, lastUsed: new Date().toISOString() }
      : f
  )
  localStorage.setItem(
    profileId ? `favorites-${profileId}` : 'favorites',
    JSON.stringify(updated)
  )
}

export function deleteFavorite(profileId, favoriteId) {
  const favorites = getFavorites(profileId)
  const filtered = favorites.filter(f => f.id !== favoriteId)
  localStorage.setItem(
    profileId ? `favorites-${profileId}` : 'favorites',
    JSON.stringify(filtered)
  )
}
```

### Quick-Add Bar Component

```jsx
// src/components/QuickAddBar.jsx
export function QuickAddBar({ favorites, onSelect, onManage }) {
  const sortedFavorites = [...favorites]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 8) // Show top 8

  if (sortedFavorites.length === 0) {
    return null
  }

  return (
    <div class="quick-add-bar">
      <div class="quick-add-scroll">
        {sortedFavorites.map(fav => (
          <button
            key={fav.id}
            class="quick-add-chip"
            onClick={() => onSelect(fav)}
          >
            <span class="quick-add-name">{fav.name}</span>
            <span class="quick-add-cal">{fav.calories}</span>
          </button>
        ))}
        <button class="quick-add-manage" onClick={onManage}>
          ⚙️
        </button>
      </div>
    </div>
  )
}
```

### CSS Styling

```css
.quick-add-bar {
  padding: var(--space-2) 0;
  margin-bottom: var(--space-3);
}

.quick-add-scroll {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  padding: var(--space-1);
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.quick-add-scroll::-webkit-scrollbar {
  display: none;
}

.quick-add-chip {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-white);
  border: 1px solid var(--color-sage-pale);
  border-radius: var(--radius-full);
  white-space: nowrap;
  cursor: pointer;
  transition: all 200ms ease;
}

.quick-add-chip:hover {
  background: var(--color-sage-pale);
  border-color: var(--color-sage);
}

.quick-add-chip:active {
  transform: scale(0.95);
}

.quick-add-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

.quick-add-cal {
  font-size: 0.75rem;
  color: var(--color-sage);
  font-weight: 600;
}

.quick-add-manage {
  padding: var(--space-2);
  background: transparent;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-full);
  cursor: pointer;
}
```

### Save to Favorites Button

Add to EntryForm after successful save:

```jsx
function EntryForm({ onSubmit }) {
  const [showSavePrompt, setShowSavePrompt] = useState(false)
  const [lastEntry, setLastEntry] = useState(null)

  const handleSubmit = async (entry) => {
    await onSubmit(entry)
    setLastEntry(entry)
    setShowSavePrompt(true)
  }

  return (
    <>
      {/* form fields */}

      {showSavePrompt && (
        <div class="save-favorite-prompt">
          <p>Save "{lastEntry.name}" as a favorite?</p>
          <button onClick={() => saveFavoriteAndDismiss()}>
            ⭐ Save
          </button>
          <button onClick={() => setShowSavePrompt(false)}>
            Not now
          </button>
        </div>
      )}
    </>
  )
}
```

### Favorites Management Modal

```jsx
function FavoritesModal({ favorites, onDelete, onClose }) {
  return (
    <Modal title="Manage Favorites" onClose={onClose}>
      <div class="favorites-list">
        {favorites.map(fav => (
          <div key={fav.id} class="favorite-item">
            <div class="favorite-info">
              <span class="favorite-name">{fav.name}</span>
              <span class="favorite-details">
                {fav.calories} cal · Used {fav.usageCount} times
              </span>
            </div>
            <button
              class="favorite-delete"
              onClick={() => onDelete(fav.id)}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </Modal>
  )
}
```

## Acceptance Criteria

- [ ] Users can save foods as favorites after adding entry
- [ ] Favorites appear as horizontal scrolling chips
- [ ] Tapping favorite creates new entry with that food's data
- [ ] Favorites sorted by usage frequency
- [ ] Maximum 8 favorites shown (most used)
- [ ] Can manage/delete favorites in modal
- [ ] Usage count tracked per favorite
- [ ] Per-profile favorites

## Files to Create/Modify

- `src/utils/storage.js` — Favorite functions
- `src/components/QuickAddBar.jsx` — Create
- `src/components/FavoritesModal.jsx` — Create
- `src/components/EntryForm.jsx` — Save favorite prompt
- `src/components/App.jsx` — Integration
- `src/styles.css` — Favorite styling

## Test Plan

1. Add entry → prompt to save appears?
2. Save favorite → appears in quick-add bar?
3. Tap favorite → creates entry with correct values?
4. Usage count increments?
5. Most-used favorites appear first?
6. Delete favorite → removed from bar?
