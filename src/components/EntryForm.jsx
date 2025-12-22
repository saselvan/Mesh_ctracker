import { useState, useEffect } from 'preact/hooks'

export function EntryForm({ entry = null, onSave = () => {}, onCancel = () => {} }) {
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')

  const isEditing = !!entry

  useEffect(() => {
    if (entry) {
      setName(entry.name || '')
      setCalories(entry.calories?.toString() || '')
      setProtein(entry.protein?.toString() || '')
      setCarbs(entry.carbs?.toString() || '')
      setFat(entry.fat?.toString() || '')
    } else {
      setName('')
      setCalories('')
      setProtein('')
      setCarbs('')
      setFat('')
    }
  }, [entry])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || calories === '') return

    onSave({
      ...(entry || {}),
      name: name.trim(),
      calories: parseInt(calories) || 0,
      protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0,
      fat: parseInt(fat) || 0
    })
  }

  return (
    <div class="form-overlay" onClick={onCancel}>
      <form class="entry-form" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2 class="form-title">{isEditing ? 'Edit Entry' : 'Add Entry'}</h2>

        <div class="form-field">
          <label class="form-label" for="name">Food Name</label>
          <input
            id="name"
            type="text"
            class="form-input"
            value={name}
            onInput={e => setName(e.target.value)}
            placeholder="e.g., Chicken Salad"
            required
            autoFocus
          />
        </div>

        <div class="form-field">
          <label class="form-label" for="calories">Calories</label>
          <input
            id="calories"
            type="number"
            class="form-input"
            value={calories}
            onInput={e => setCalories(e.target.value)}
            placeholder="0"
            min="0"
            step="1"
            required
          />
        </div>

        <div class="form-row">
          <div class="form-field">
            <label class="form-label" for="protein">Protein (g)</label>
            <input
              id="protein"
              type="number"
              class="form-input"
              value={protein}
              onInput={e => setProtein(e.target.value)}
              placeholder="0"
              min="0"
              step="1"
            />
          </div>

          <div class="form-field">
            <label class="form-label" for="carbs">Carbs (g)</label>
            <input
              id="carbs"
              type="number"
              class="form-input"
              value={carbs}
              onInput={e => setCarbs(e.target.value)}
              placeholder="0"
              min="0"
              step="1"
            />
          </div>

          <div class="form-field">
            <label class="form-label" for="fat">Fat (g)</label>
            <input
              id="fat"
              type="number"
              class="form-input"
              value={fat}
              onInput={e => setFat(e.target.value)}
              placeholder="0"
              min="0"
              step="1"
            />
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn--secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" class="btn btn--primary">
            {isEditing ? 'Save Changes' : 'Add Entry'}
          </button>
        </div>
      </form>
    </div>
  )
}
