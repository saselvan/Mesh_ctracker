import { useState, useEffect, useRef } from 'preact/hooks'
import { exportAllData, importData } from '../utils/db'

export function Settings({ goals = {}, onSave = () => {}, onClose = () => {}, onDataChange = () => {} }) {
  const [calories, setCalories] = useState(goals.calories?.toString() || '2000')
  const [protein, setProtein] = useState(goals.protein?.toString() || '150')
  const [carbs, setCarbs] = useState(goals.carbs?.toString() || '250')
  const [fat, setFat] = useState(goals.fat?.toString() || '65')
  const [status, setStatus] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      calories: parseInt(calories) || 2000,
      protein: parseInt(protein) || 150,
      carbs: parseInt(carbs) || 250,
      fat: parseInt(fat) || 65
    })
  }

  const handleExport = async () => {
    try {
      const data = await exportAllData()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `calorie-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      setStatus('Data exported!')
      setTimeout(() => setStatus(''), 2000)
    } catch (e) {
      setStatus('Export failed')
    }
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const count = await importData(text)
      setStatus(`Imported ${count} entries!`)
      onDataChange?.()
      setTimeout(() => setStatus(''), 2000)
    } catch (e) {
      setStatus('Import failed')
    }
    e.target.value = ''
  }

  return (
    <div class="form-overlay" onClick={onClose}>
      <form class="entry-form" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2 class="form-title">Settings</h2>

        <h3 class="form-section-title">Daily Goals</h3>

        <div class="form-field">
          <label class="form-label" for="goal-calories">Calories</label>
          <input
            id="goal-calories"
            type="number"
            class="form-input"
            value={calories}
            onInput={e => setCalories(e.target.value)}
            min="0"
            step="1"
          />
        </div>

        <div class="form-row">
          <div class="form-field">
            <label class="form-label" for="goal-protein">Protein (g)</label>
            <input
              id="goal-protein"
              type="number"
              class="form-input"
              value={protein}
              onInput={e => setProtein(e.target.value)}
              min="0"
              step="1"
            />
          </div>

          <div class="form-field">
            <label class="form-label" for="goal-carbs">Carbs (g)</label>
            <input
              id="goal-carbs"
              type="number"
              class="form-input"
              value={carbs}
              onInput={e => setCarbs(e.target.value)}
              min="0"
              step="1"
            />
          </div>

          <div class="form-field">
            <label class="form-label" for="goal-fat">Fat (g)</label>
            <input
              id="goal-fat"
              type="number"
              class="form-input"
              value={fat}
              onInput={e => setFat(e.target.value)}
              min="0"
              step="1"
            />
          </div>
        </div>

        <h3 class="form-section-title">Data</h3>

        <div class="data-actions">
          <button type="button" class="btn btn--secondary" onClick={handleExport}>
            Export Data
          </button>
          <button type="button" class="btn btn--secondary" onClick={() => fileInputRef.current?.click()}>
            Import Data
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
        </div>

        {status && <p class="status-message">{status}</p>}

        <div class="form-actions">
          <button type="button" class="btn btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" class="btn btn--primary">
            Save Goals
          </button>
        </div>
      </form>
    </div>
  )
}
