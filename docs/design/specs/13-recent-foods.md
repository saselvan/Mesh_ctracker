# Spec: Recent Foods Suggestions

**Phase:** 4 - Smart Entry
**Priority:** Medium
**Estimated Effort:** Low

---

## Overview

Show recently logged foods as autocomplete suggestions when typing in the entry form. Reduces repetitive data entry for foods eaten regularly.

## Requirements

### Data Collection

Build recent foods list from existing entries:

```javascript
// src/utils/recents.js
export function getRecentFoods(profileId, entries, limit = 20) {
  const seen = new Map()

  // Sort entries by date, newest first
  const sorted = [...entries].sort((a, b) =>
    new Date(b.date) - new Date(a.date)
  )

  // Dedupe by name (case-insensitive), keep most recent values
  for (const entry of sorted) {
    const key = entry.name.toLowerCase().trim()
    if (!seen.has(key)) {
      seen.set(key, {
        name: entry.name,
        calories: entry.calories,
        protein: entry.protein,
        carbs: entry.carbs,
        fat: entry.fat,
        lastUsed: entry.date
      })
    }
    if (seen.size >= limit) break
  }

  return Array.from(seen.values())
}

export function searchRecentFoods(recents, query) {
  if (!query || query.length < 2) return []

  const q = query.toLowerCase()
  return recents.filter(food =>
    food.name.toLowerCase().includes(q)
  ).slice(0, 5)
}
```

### Autocomplete Component

```jsx
// src/components/FoodAutocomplete.jsx
import { useState, useEffect, useRef } from 'preact/hooks'

export function FoodAutocomplete({
  value,
  onChange,
  onSelect,
  recentFoods
}) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef()

  useEffect(() => {
    const matches = searchRecentFoods(recentFoods, value)
    setSuggestions(matches)
    setShowSuggestions(matches.length > 0)
    setSelectedIndex(-1)
  }, [value, recentFoods])

  const handleKeyDown = (e) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(i => Math.min(i + 1, suggestions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(i => Math.max(i - 1, 0))
        break
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault()
          handleSelect(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        break
    }
  }

  const handleSelect = (food) => {
    onSelect(food)
    setShowSuggestions(false)
  }

  return (
    <div class="autocomplete-wrapper">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onInput={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        placeholder="What did you eat?"
        class="form-input"
      />

      {showSuggestions && (
        <ul class="autocomplete-suggestions">
          {suggestions.map((food, i) => (
            <li
              key={food.name}
              class={`autocomplete-item ${i === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelect(food)}
            >
              <span class="autocomplete-name">{food.name}</span>
              <span class="autocomplete-details">
                {food.calories} cal · {food.protein}p {food.carbs}c {food.fat}f
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

### CSS Styling

```css
.autocomplete-wrapper {
  position: relative;
}

.autocomplete-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-top: none;
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  box-shadow: var(--shadow-md);
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 240px;
  overflow-y: auto;
  z-index: 100;
}

.autocomplete-item {
  padding: var(--space-3);
  cursor: pointer;
  border-bottom: 1px solid var(--color-border);
  transition: background 150ms ease;
}

.autocomplete-item:last-child {
  border-bottom: none;
}

.autocomplete-item:hover,
.autocomplete-item.selected {
  background: var(--color-sage-pale);
}

.autocomplete-name {
  display: block;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 2px;
}

.autocomplete-details {
  display: block;
  font-size: 0.75rem;
  color: var(--color-muted);
}
```

### Integration with EntryForm

```jsx
// In EntryForm.jsx
import { FoodAutocomplete } from './FoodAutocomplete'
import { getRecentFoods } from '../utils/recents'

export function EntryForm({ entries, profileId, onSubmit }) {
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')

  const recentFoods = useMemo(
    () => getRecentFoods(profileId, entries),
    [profileId, entries]
  )

  const handleFoodSelect = (food) => {
    setName(food.name)
    setCalories(food.calories.toString())
    setProtein(food.protein.toString())
    setCarbs(food.carbs.toString())
    setFat(food.fat.toString())
  }

  return (
    <form>
      <FoodAutocomplete
        value={name}
        onChange={setName}
        onSelect={handleFoodSelect}
        recentFoods={recentFoods}
      />
      {/* remaining form fields */}
    </form>
  )
}
```

## Acceptance Criteria

- [ ] Typing 2+ characters shows matching recent foods
- [ ] Suggestions show food name and macro summary
- [ ] Selecting suggestion fills all form fields
- [ ] Keyboard navigation (up/down/enter/escape)
- [ ] Tap/click selection works on mobile
- [ ] Suggestions dismiss on blur
- [ ] Maximum 5 suggestions shown
- [ ] Recent foods deduped by name
- [ ] Most recently used foods prioritized

## Files to Create/Modify

- `src/utils/recents.js` — Create
- `src/components/FoodAutocomplete.jsx` — Create
- `src/components/EntryForm.jsx` — Integrate autocomplete
- `src/styles.css` — Autocomplete styling

## Test Plan

1. Type "coff" → shows "Coffee" if logged before?
2. Arrow keys navigate suggestions?
3. Enter selects highlighted suggestion?
4. Escape dismisses dropdown?
5. Selecting fills all macro fields?
6. Works on mobile (tap)?
