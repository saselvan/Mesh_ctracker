# Tests: Meal Templates (Combos)

id: T-014
spec: S-014 (specs/14-meal-templates.md)

---

## Functional Tests

### Scenario: Create template with multiple foods

**Given:** Create template modal is open
**When:** User selects "Oatmeal", "Banana", "Coffee"
**And:** Names it "Morning Combo"
**And:** Clicks Save
**Then:** Template saved with 3 items
**And:** Totals calculated correctly

### Scenario: Template shows combined totals

**Given:** Template has 3 items (300 + 105 + 50 = 455 cal)
**When:** TemplateCard renders
**Then:** Shows "455 cal" as combined total
**And:** Shows combined P/C/F totals

### Scenario: Add All creates individual entries

**Given:** Template "Morning Combo" has 3 items
**When:** User clicks "Add All"
**Then:** 3 separate entries created
**And:** Each entry has correct calories/macros
**And:** All entries have same date and mealType

### Scenario: Template usage tracked

**Given:** Template exists with usageCount 5
**When:** User clicks "Add All"
**Then:** usageCount becomes 6
**And:** Template moves up in sort order

---

## Edge Cases

### Scenario: Minimum 2 items required

**Given:** Create template modal open
**When:** User selects only 1 item
**Then:** Save button disabled
**And:** Validation message shown

### Scenario: Delete template

**Given:** Template "Old Combo" exists
**When:** User clicks delete button
**Then:** Confirmation shown
**And:** Template removed from storage
**And:** Template disappears from list

---

## Unit Tests

```javascript
// src/utils/__tests__/templates.test.js
import { getTemplates, saveTemplate, deleteTemplate, incrementTemplateUsage } from '../templates'

describe('Templates storage', () => {
  beforeEach(() => localStorage.clear())

  it('saves template with items and totals', () => {
    const items = [
      { name: 'Oatmeal', calories: 300, protein: 10, carbs: 50, fat: 6 },
      { name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0 },
    ]
    saveTemplate('test', 'Breakfast', items)

    const templates = getTemplates('test')
    expect(templates.length).toBe(1)
    expect(templates[0].name).toBe('Breakfast')
    expect(templates[0].items.length).toBe(2)
    expect(templates[0].totals.calories).toBe(405)
    expect(templates[0].totals.protein).toBe(11)
  })

  it('increments usage count', () => {
    const items = [{ name: 'A', calories: 100 }]
    saveTemplate('test', 'T1', items)
    const tmpl = getTemplates('test')[0]

    incrementTemplateUsage('test', tmpl.id)
    expect(getTemplates('test')[0].usageCount).toBe(1)
  })

  it('deletes template', () => {
    saveTemplate('test', 'T1', [{ name: 'A', calories: 100 }])
    const tmpl = getTemplates('test')[0]
    deleteTemplate('test', tmpl.id)
    expect(getTemplates('test').length).toBe(0)
  })
})
```

---

## Component Tests

```javascript
// src/components/__tests__/TemplateCard.test.jsx
import { render, fireEvent } from '@testing-library/preact'
import { TemplateCard } from '../TemplateCard'

describe('TemplateCard', () => {
  const template = {
    id: '1',
    name: 'Morning Combo',
    items: [
      { name: 'Oatmeal', calories: 300 },
      { name: 'Banana', calories: 105 },
      { name: 'Coffee', calories: 50 },
    ],
    totals: { calories: 455, protein: 12, carbs: 80, fat: 8 },
    usageCount: 5
  }

  it('renders template name', () => {
    const { getByText } = render(
      <TemplateCard template={template} onUse={() => {}} />
    )
    expect(getByText('Morning Combo')).toBeTruthy()
  })

  it('shows item count', () => {
    const { getByText } = render(
      <TemplateCard template={template} onUse={() => {}} />
    )
    expect(getByText('3 items')).toBeTruthy()
  })

  it('shows combined calories', () => {
    const { getByText } = render(
      <TemplateCard template={template} onUse={() => {}} />
    )
    expect(getByText('455 cal')).toBeTruthy()
  })

  it('displays item chips', () => {
    const { getByText } = render(
      <TemplateCard template={template} onUse={() => {}} />
    )
    expect(getByText('Oatmeal')).toBeTruthy()
    expect(getByText('Banana')).toBeTruthy()
    expect(getByText('Coffee')).toBeTruthy()
  })

  it('calls onUse when Add All clicked', () => {
    const onUse = vi.fn()
    const { getByText } = render(
      <TemplateCard template={template} onUse={onUse} />
    )
    fireEvent.click(getByText('+ Add All'))
    expect(onUse).toHaveBeenCalledWith(template)
  })
})
```

---

## Integration Test

```javascript
// src/components/__tests__/App.templates.test.jsx
describe('Template integration', () => {
  it('Add All creates multiple entries', async () => {
    // Setup template
    const template = {
      items: [
        { name: 'A', calories: 100, protein: 10, carbs: 5, fat: 5 },
        { name: 'B', calories: 200, protein: 20, carbs: 10, fat: 10 },
      ]
    }

    // Use template
    await useTemplate(template, '2025-01-17', 'test', 'breakfast')

    // Verify entries created
    const entries = await getEntries('test', '2025-01-17')
    expect(entries.length).toBe(2)
    expect(entries.find(e => e.name === 'A')).toBeTruthy()
    expect(entries.find(e => e.name === 'B')).toBeTruthy()
    expect(entries.every(e => e.mealType === 'breakfast')).toBe(true)
  })
})
```
