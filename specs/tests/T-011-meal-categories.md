# Tests: Meal Category Organization

id: T-011
spec: S-011 (specs/11-meal-categories.md)

---

## Functional Tests

### Scenario: getSuggestedMealType returns correct type

**Given:** Current time is 8:00 AM
**When:** getSuggestedMealType() is called
**Then:** Returns "breakfast"

**Given:** Current time is 1:00 PM
**When:** getSuggestedMealType() is called
**Then:** Returns "lunch"

**Given:** Current time is 7:00 PM
**When:** getSuggestedMealType() is called
**Then:** Returns "dinner"

**Given:** Current time is 3:00 PM
**When:** getSuggestedMealType() is called
**Then:** Returns "snack"

### Scenario: Entry form shows meal type selector

**Given:** Entry form is open
**When:** I inspect the form
**Then:** 4 meal type buttons visible (Breakfast, Lunch, Dinner, Snacks)
**And:** Current suggested meal type is pre-selected

### Scenario: User can override suggested meal type

**Given:** Form suggests "lunch" at 1pm
**When:** User clicks "breakfast" button
**Then:** Breakfast becomes selected
**And:** Entry saves with mealType: "breakfast"

### Scenario: Entries grouped by meal type

**Given:** 5 entries exist: 2 breakfast, 2 lunch, 1 snack
**When:** EntryList renders
**Then:** 3 groups visible (Breakfast, Lunch, Snacks)
**And:** Dinner group not shown (no entries)
**And:** Each group shows calorie subtotal

---

## Edge Cases

### Scenario: Existing entries without mealType

**Given:** Entries exist from before migration
**When:** App loads
**Then:** Entries without mealType default to "snack"
**And:** Appear in Snacks group

### Scenario: All entries same meal type

**Given:** All 5 entries are breakfast
**When:** EntryList renders
**Then:** Only Breakfast group shown
**And:** No empty group headers

---

## Unit Test Implementation

```javascript
// src/utils/__tests__/meals.test.js
import { getSuggestedMealType, MEAL_TYPES, groupByMealType } from '../meals'

describe('getSuggestedMealType', () => {
  it('returns breakfast for morning hours', () => {
    expect(getSuggestedMealType(7)).toBe('breakfast')
    expect(getSuggestedMealType(10)).toBe('breakfast')
  })

  it('returns lunch for midday hours', () => {
    expect(getSuggestedMealType(12)).toBe('lunch')
    expect(getSuggestedMealType(14)).toBe('lunch')
  })

  it('returns dinner for evening hours', () => {
    expect(getSuggestedMealType(18)).toBe('dinner')
    expect(getSuggestedMealType(20)).toBe('dinner')
  })

  it('returns snack for in-between hours', () => {
    expect(getSuggestedMealType(15)).toBe('snack')
    expect(getSuggestedMealType(22)).toBe('snack')
  })
})

describe('groupByMealType', () => {
  const entries = [
    { id: 1, mealType: 'breakfast', calories: 300 },
    { id: 2, mealType: 'breakfast', calories: 200 },
    { id: 3, mealType: 'lunch', calories: 600 },
    { id: 4, mealType: 'snack', calories: 150 },
  ]

  it('groups entries correctly', () => {
    const grouped = groupByMealType(entries)
    expect(grouped.breakfast.length).toBe(2)
    expect(grouped.lunch.length).toBe(1)
    expect(grouped.snack.length).toBe(1)
    expect(grouped.dinner).toBeUndefined()
  })
})
```

---

## Component Tests

```javascript
// src/components/__tests__/EntryForm.mealType.test.jsx
import { render, fireEvent } from '@testing-library/preact'
import { EntryForm } from '../EntryForm'

describe('EntryForm meal type selector', () => {
  it('renders all 4 meal type buttons', () => {
    const { getByText } = render(<EntryForm onSubmit={() => {}} />)
    expect(getByText('Breakfast')).toBeTruthy()
    expect(getByText('Lunch')).toBeTruthy()
    expect(getByText('Dinner')).toBeTruthy()
    expect(getByText('Snacks')).toBeTruthy()
  })

  it('pre-selects suggested meal type', () => {
    vi.setSystemTime(new Date(2025, 0, 17, 8, 0)) // 8am
    const { container } = render(<EntryForm onSubmit={() => {}} />)
    const activeBtn = container.querySelector('.meal-type-btn.active')
    expect(activeBtn.textContent).toContain('Breakfast')
  })

  it('allows changing meal type', () => {
    const onSubmit = vi.fn()
    const { getByText, getByLabelText } = render(<EntryForm onSubmit={onSubmit} />)

    fireEvent.click(getByText('Dinner'))
    fireEvent.change(getByLabelText(/calories/i), { target: { value: '500' } })
    fireEvent.submit(document.querySelector('form'))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ mealType: 'dinner' })
    )
  })
})
```
