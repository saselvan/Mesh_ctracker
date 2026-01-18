import { useState } from 'preact/hooks'
import { getThemePreference, setThemePreference } from '../utils/theme'

export function ThemeToggle() {
  const [preference, setPreference] = useState(getThemePreference())

  const handleChange = (value) => {
    setPreference(value)
    setThemePreference(value)
  }

  return (
    <div style="margin-bottom: var(--space-4)">
      <label class="form-label">Theme</label>
      <select
        class="form-input"
        value={preference}
        onChange={e => handleChange(e.target.value)}
      >
        <option value="auto">Auto (time-based)</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  )
}
