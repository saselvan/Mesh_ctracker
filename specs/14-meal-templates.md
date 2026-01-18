# Spec: Meal Templates (Combos)

**Phase:** 4 - Smart Entry
**Priority:** Medium
**Estimated Effort:** Medium

---

## Overview

Allow users to save groups of foods as "meal templates" (combos) for one-tap logging of entire meals. Example: "Usual Breakfast" = oatmeal + banana + coffee.

## Requirements

### Data Model

```javascript
// Template shape
{
  id: "tmpl_1",
  name: "Morning Combo",
  items: [
    { name: "Oatmeal", calories: 300, protein: 10, carbs: 50, fat: 6 },
    { name: "Banana", calories: 105, protein: 1, carbs: 27, fat: 0 },
    { name: "Black Coffee", calories: 5, protein: 0, carbs: 0, fat: 0 }
  ],
  totals: { calories: 410, protein: 11, carbs: 77, fat: 6 },
  profileId: "default",
  usageCount: 15,
  createdAt: "2025-01-01"
}

// Storage key: templates-{profileId}
```

### Storage Functions

```javascript
// src/utils/templates.js
export function getTemplates(profileId) {
  const key = profileId ? `templates-${profileId}` : 'templates'
  return JSON.parse(localStorage.getItem(key) || '[]')
}

export function saveTemplate(profileId, name, items) {
  const templates = getTemplates(profileId)
  const template = {
    id: `tmpl_${Date.now()}`,
    name,
    items,
    totals: calculateTemplateTotals(items),
    profileId,
    usageCount: 0,
    createdAt: new Date().toISOString()
  }
  templates.push(template)
  localStorage.setItem(
    profileId ? `templates-${profileId}` : 'templates',
    JSON.stringify(templates)
  )
  return template
}

function calculateTemplateTotals(items) {
  return items.reduce((acc, item) => ({
    calories: acc.calories + item.calories,
    protein: acc.protein + item.protein,
    carbs: acc.carbs + item.carbs,
    fat: acc.fat + item.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
}

export function incrementTemplateUsage(profileId, templateId) {
  const templates = getTemplates(profileId)
  const updated = templates.map(t =>
    t.id === templateId
      ? { ...t, usageCount: t.usageCount + 1 }
      : t
  )
  localStorage.setItem(
    profileId ? `templates-${profileId}` : 'templates',
    JSON.stringify(updated)
  )
}

export function deleteTemplate(profileId, templateId) {
  const templates = getTemplates(profileId)
  localStorage.setItem(
    profileId ? `templates-${profileId}` : 'templates',
    JSON.stringify(templates.filter(t => t.id !== templateId))
  )
}
```

### Template Card Component

```jsx
// src/components/TemplateCard.jsx
export function TemplateCard({ template, onUse, onEdit, onDelete }) {
  return (
    <div class="template-card">
      <div class="template-header">
        <h3 class="template-name">{template.name}</h3>
        <span class="template-count">{template.items.length} items</span>
      </div>

      <div class="template-items">
        {template.items.map((item, i) => (
          <span key={i} class="template-item-chip">
            {item.name}
          </span>
        ))}
      </div>

      <div class="template-totals">
        <span class="template-calories">{template.totals.calories} cal</span>
        <span class="template-macros">
          P:{template.totals.protein} C:{template.totals.carbs} F:{template.totals.fat}
        </span>
      </div>

      <div class="template-actions">
        <button class="template-use-btn" onClick={() => onUse(template)}>
          + Add All
        </button>
        <button class="template-edit-btn" onClick={() => onEdit(template)}>
          ✏️
        </button>
        <button class="template-delete-btn" onClick={() => onDelete(template.id)}>
          🗑️
        </button>
      </div>
    </div>
  )
}
```

### Create Template Flow

```jsx
// src/components/CreateTemplateModal.jsx
export function CreateTemplateModal({ entries, recentFoods, favorites, onSave, onClose }) {
  const [name, setName] = useState('')
  const [selectedItems, setSelectedItems] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // Combine sources for selection
  const availableItems = useMemo(() => {
    const all = [
      ...recentFoods.map(f => ({ ...f, source: 'recent' })),
      ...favorites.map(f => ({ ...f, source: 'favorite' })),
      ...entries.map(e => ({ ...e, source: 'entry' }))
    ]
    // Dedupe by name
    const seen = new Set()
    return all.filter(item => {
      const key = item.name.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [entries, recentFoods, favorites])

  const filteredItems = searchQuery.length >= 2
    ? availableItems.filter(i =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableItems.slice(0, 10)

  const handleToggleItem = (item) => {
    const exists = selectedItems.find(i => i.name === item.name)
    if (exists) {
      setSelectedItems(selectedItems.filter(i => i.name !== item.name))
    } else {
      setSelectedItems([...selectedItems, item])
    }
  }

  const handleSave = () => {
    if (name.trim() && selectedItems.length >= 2) {
      onSave(name.trim(), selectedItems)
      onClose()
    }
  }

  return (
    <Modal title="Create Meal Template" onClose={onClose}>
      <input
        type="text"
        class="form-input"
        placeholder="Template name (e.g., 'Usual Breakfast')"
        value={name}
        onInput={(e) => setName(e.target.value)}
      />

      <div class="template-selected">
        <h4>Selected Items ({selectedItems.length})</h4>
        {selectedItems.map((item, i) => (
          <div key={i} class="template-selected-item">
            <span>{item.name}</span>
            <span>{item.calories} cal</span>
            <button onClick={() => handleToggleItem(item)}>×</button>
          </div>
        ))}
      </div>

      <div class="template-search">
        <input
          type="text"
          class="form-input"
          placeholder="Search foods..."
          value={searchQuery}
          onInput={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div class="template-available">
        {filteredItems.map((item, i) => (
          <button
            key={i}
            class={`template-available-item ${
              selectedItems.find(s => s.name === item.name) ? 'selected' : ''
            }`}
            onClick={() => handleToggleItem(item)}
          >
            <span>{item.name}</span>
            <span>{item.calories} cal</span>
          </button>
        ))}
      </div>

      <button
        class="btn btn-primary"
        onClick={handleSave}
        disabled={!name.trim() || selectedItems.length < 2}
      >
        Save Template
      </button>
    </Modal>
  )
}
```

### CSS Styling

```css
.template-card {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--space-3);
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.template-name {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.template-count {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.template-items {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-bottom: var(--space-3);
}

.template-item-chip {
  font-size: 0.75rem;
  padding: var(--space-1) var(--space-2);
  background: var(--color-sage-pale);
  border-radius: var(--radius-full);
  color: var(--color-sage);
}

.template-totals {
  display: flex;
  justify-content: space-between;
  padding: var(--space-2) 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--space-3);
}

.template-calories {
  font-weight: 600;
  color: var(--color-sage);
}

.template-macros {
  font-size: 0.875rem;
  color: var(--color-muted);
}

.template-actions {
  display: flex;
  gap: var(--space-2);
}

.template-use-btn {
  flex: 1;
  padding: var(--space-2);
  background: var(--color-sage);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
}

.template-edit-btn,
.template-delete-btn {
  padding: var(--space-2);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
}
```

### Using a Template

When user taps "Add All":

```javascript
async function useTemplate(template, date, profileId, mealType) {
  const entries = template.items.map(item => ({
    ...item,
    date,
    profileId,
    mealType
  }))

  // Add all entries at once
  for (const entry of entries) {
    await addEntry(entry)
  }

  incrementTemplateUsage(profileId, template.id)
}
```

## Acceptance Criteria

- [ ] Create templates from 2+ foods
- [ ] Templates show all included items
- [ ] Templates show combined totals
- [ ] "Add All" creates entries for each item
- [ ] Templates sorted by usage frequency
- [ ] Can edit template (rename, add/remove items)
- [ ] Can delete templates
- [ ] Per-profile templates

## Files to Create/Modify

- `src/utils/templates.js` — Create
- `src/components/TemplateCard.jsx` — Create
- `src/components/CreateTemplateModal.jsx` — Create
- `src/components/TemplateList.jsx` — Create
- `src/components/App.jsx` — Integration
- `src/styles.css` — Template styling

## Test Plan

1. Create template with 3 foods → saves correctly?
2. Tap "Add All" → creates 3 separate entries?
3. Entries have correct date and meal type?
4. Edit template → changes persist?
5. Delete template → removed from list?
6. Usage count increments on use?
