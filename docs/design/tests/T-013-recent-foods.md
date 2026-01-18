# Tests: Recent Foods Suggestions

id: T-013
spec: S-013 (specs/13-recent-foods.md)

---

## Functional Tests

### Scenario: Autocomplete shows suggestions

**Given:** Recent entries include "Chicken Salad"
**When:** User types "chi" in food name field
**Then:** Dropdown shows "Chicken Salad" suggestion
**And:** Shows calories and macros

### Scenario: Selecting suggestion fills form

**Given:** "Chicken Salad" suggestion shown (400 cal, 35p, 20c, 18f)
**When:** User clicks the suggestion
**Then:** Name field fills with "Chicken Salad"
**And:** Calories fills with 400
**And:** Protein fills with 35
**And:** Carbs fills with 20
**And:** Fat fills with 18

### Scenario: Keyboard navigation works

**Given:** 3 suggestions shown
**When:** User presses ArrowDown
**Then:** First suggestion highlighted
**When:** User presses ArrowDown again
**Then:** Second suggestion highlighted
**When:** User presses Enter
**Then:** Second suggestion selected

### Scenario: Escape dismisses dropdown

**Given:** Suggestions dropdown is open
**When:** User presses Escape
**Then:** Dropdown closes
**And:** Input retains current value

### Scenario: No suggestions under 2 characters

**Given:** User types "c" (1 character)
**When:** I check for dropdown
**Then:** No suggestions shown
**When:** User types "ch" (2 characters)
**Then:** Suggestions appear

---

## Edge Cases

### Scenario: Case-insensitive search

**Given:** Entry "Chicken Salad" exists
**When:** User types "CHICKEN"
**Then:** Suggestion shows "Chicken Salad"

### Scenario: Deduped by name

**Given:** Multiple entries named "Coffee"
**When:** Recent foods calculated
**Then:** Only one "Coffee" in suggestions
**And:** Uses most recent entry's values

---

## Unit Tests

```javascript
// src/utils/__tests__/recents.test.js
import { getRecentFoods, searchRecentFoods } from '../recents'

describe('getRecentFoods', () => {
  const entries = [
    { name: 'Coffee', calories: 50, date: '2025-01-17' },
    { name: 'Coffee', calories: 55, date: '2025-01-16' },
    { name: 'Salad', calories: 300, date: '2025-01-17' },
    { name: 'Chicken', calories: 400, date: '2025-01-15' },
  ]

  it('returns unique foods', () => {
    const recents = getRecentFoods(null, entries)
    const names = recents.map(r => r.name.toLowerCase())
    expect(names.filter(n => n === 'coffee').length).toBe(1)
  })

  it('uses most recent entry values', () => {
    const recents = getRecentFoods(null, entries)
    const coffee = recents.find(r => r.name === 'Coffee')
    expect(coffee.calories).toBe(50) // From 01-17, not 01-16
  })

  it('limits to specified count', () => {
    const recents = getRecentFoods(null, entries, 2)
    expect(recents.length).toBe(2)
  })
})

describe('searchRecentFoods', () => {
  const recents = [
    { name: 'Coffee', calories: 50 },
    { name: 'Chicken Salad', calories: 400 },
    { name: 'Chocolate', calories: 200 },
  ]

  it('returns matches for query', () => {
    const results = searchRecentFoods(recents, 'ch')
    expect(results.length).toBe(2) // Chicken, Chocolate
  })

  it('is case insensitive', () => {
    const results = searchRecentFoods(recents, 'COFFEE')
    expect(results.length).toBe(1)
    expect(results[0].name).toBe('Coffee')
  })

  it('returns empty for short query', () => {
    expect(searchRecentFoods(recents, 'c').length).toBe(0)
  })

  it('limits to 5 results', () => {
    const manyRecents = Array.from({ length: 20 }, (_, i) => ({
      name: `Food ${i}`,
      calories: 100
    }))
    const results = searchRecentFoods(manyRecents, 'Food')
    expect(results.length).toBe(5)
  })
})
```

---

## Component Tests

```javascript
// src/components/__tests__/FoodAutocomplete.test.jsx
import { render, fireEvent } from '@testing-library/preact'
import { FoodAutocomplete } from '../FoodAutocomplete'

describe('FoodAutocomplete', () => {
  const recents = [
    { name: 'Coffee', calories: 50, protein: 1, carbs: 2, fat: 3 },
    { name: 'Chicken', calories: 400, protein: 35, carbs: 0, fat: 18 },
  ]

  it('shows suggestions on input', () => {
    const { getByPlaceholderText, getByText } = render(
      <FoodAutocomplete recentFoods={recents} onChange={() => {}} onSelect={() => {}} />
    )
    fireEvent.input(getByPlaceholderText(/what did you eat/i), { target: { value: 'co' } })
    expect(getByText('Coffee')).toBeTruthy()
  })

  it('calls onSelect with full food data', () => {
    const onSelect = vi.fn()
    const { getByPlaceholderText, getByText } = render(
      <FoodAutocomplete recentFoods={recents} onChange={() => {}} onSelect={onSelect} />
    )
    fireEvent.input(getByPlaceholderText(/what did you eat/i), { target: { value: 'co' } })
    fireEvent.click(getByText('Coffee'))
    expect(onSelect).toHaveBeenCalledWith(recents[0])
  })

  it('navigates with keyboard', () => {
    const { getByPlaceholderText, container } = render(
      <FoodAutocomplete recentFoods={recents} onChange={() => {}} onSelect={() => {}} />
    )
    const input = getByPlaceholderText(/what did you eat/i)
    fireEvent.input(input, { target: { value: 'c' } })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(container.querySelector('.autocomplete-item.selected')).toBeTruthy()
  })

  it('closes on escape', () => {
    const { getByPlaceholderText, queryByRole } = render(
      <FoodAutocomplete recentFoods={recents} onChange={() => {}} onSelect={() => {}} />
    )
    const input = getByPlaceholderText(/what did you eat/i)
    fireEvent.input(input, { target: { value: 'co' } })
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(queryByRole('listbox')).toBeNull()
  })
})
```
