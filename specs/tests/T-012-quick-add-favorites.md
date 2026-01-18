# Tests: Quick-Add Favorites

id: T-012
spec: S-012 (specs/12-quick-add-favorites.md)

---

## Functional Tests

### Scenario: Favorites appear as chips

**Given:** 3 favorites saved
**When:** QuickAddBar renders
**Then:** 3 chips visible
**And:** Each chip shows food name and calories

### Scenario: Tapping favorite creates entry

**Given:** Favorite "Morning Coffee" (50 cal) exists
**When:** User taps the chip
**Then:** New entry created with name "Morning Coffee"
**And:** Entry has 50 calories and correct macros
**And:** Usage count increments

### Scenario: Favorites sorted by usage

**Given:** Favorites A (used 5x), B (used 10x), C (used 3x)
**When:** QuickAddBar renders
**Then:** Order is B, A, C (most used first)

### Scenario: Maximum 8 favorites shown

**Given:** 12 favorites exist
**When:** QuickAddBar renders
**Then:** Only top 8 by usage shown
**And:** Manage button (⚙️) at end

### Scenario: Save favorite prompt after entry

**Given:** User just added "Chicken Salad"
**When:** Entry form closes
**Then:** Prompt appears: "Save as favorite?"
**And:** User can accept or dismiss

---

## Storage Tests

```javascript
// src/utils/__tests__/storage.favorites.test.js
import { getFavorites, saveFavorite, deleteFavorite, incrementFavoriteUsage } from '../storage'

describe('Favorites storage', () => {
  beforeEach(() => localStorage.clear())

  it('returns empty array when no favorites', () => {
    expect(getFavorites('test')).toEqual([])
  })

  it('saves new favorite', () => {
    saveFavorite('test', { name: 'Coffee', calories: 50, protein: 1, carbs: 2, fat: 3 })
    const favorites = getFavorites('test')
    expect(favorites.length).toBe(1)
    expect(favorites[0].name).toBe('Coffee')
    expect(favorites[0].usageCount).toBe(0)
  })

  it('increments usage count', () => {
    saveFavorite('test', { name: 'Coffee', calories: 50 })
    const fav = getFavorites('test')[0]
    incrementFavoriteUsage('test', fav.id)
    expect(getFavorites('test')[0].usageCount).toBe(1)
  })

  it('deletes favorite', () => {
    saveFavorite('test', { name: 'Coffee', calories: 50 })
    const fav = getFavorites('test')[0]
    deleteFavorite('test', fav.id)
    expect(getFavorites('test').length).toBe(0)
  })
})
```

---

## Component Tests

```javascript
// src/components/__tests__/QuickAddBar.test.jsx
import { render, fireEvent } from '@testing-library/preact'
import { QuickAddBar } from '../QuickAddBar'

describe('QuickAddBar', () => {
  const favorites = [
    { id: '1', name: 'Coffee', calories: 50, usageCount: 10 },
    { id: '2', name: 'Apple', calories: 95, usageCount: 5 },
    { id: '3', name: 'Yogurt', calories: 150, usageCount: 8 },
  ]

  it('renders favorite chips', () => {
    const { getByText } = render(
      <QuickAddBar favorites={favorites} onSelect={() => {}} />
    )
    expect(getByText('Coffee')).toBeTruthy()
    expect(getByText('Apple')).toBeTruthy()
    expect(getByText('Yogurt')).toBeTruthy()
  })

  it('shows calories on chips', () => {
    const { getByText } = render(
      <QuickAddBar favorites={favorites} onSelect={() => {}} />
    )
    expect(getByText('50')).toBeTruthy()
    expect(getByText('95')).toBeTruthy()
  })

  it('calls onSelect when chip clicked', () => {
    const onSelect = vi.fn()
    const { getByText } = render(
      <QuickAddBar favorites={favorites} onSelect={onSelect} />
    )
    fireEvent.click(getByText('Coffee'))
    expect(onSelect).toHaveBeenCalledWith(favorites[0])
  })

  it('sorts by usage count descending', () => {
    const { container } = render(
      <QuickAddBar favorites={favorites} onSelect={() => {}} />
    )
    const chips = container.querySelectorAll('.quick-add-chip')
    expect(chips[0].textContent).toContain('Coffee') // 10 uses
    expect(chips[1].textContent).toContain('Yogurt') // 8 uses
    expect(chips[2].textContent).toContain('Apple') // 5 uses
  })

  it('limits to 8 favorites', () => {
    const manyFavorites = Array.from({ length: 12 }, (_, i) => ({
      id: String(i),
      name: `Food ${i}`,
      calories: 100,
      usageCount: i
    }))
    const { container } = render(
      <QuickAddBar favorites={manyFavorites} onSelect={() => {}} />
    )
    const chips = container.querySelectorAll('.quick-add-chip')
    expect(chips.length).toBe(8)
  })

  it('renders nothing when no favorites', () => {
    const { container } = render(
      <QuickAddBar favorites={[]} onSelect={() => {}} />
    )
    expect(container.firstChild).toBeNull()
  })
})
```
