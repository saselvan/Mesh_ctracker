import { useState, useEffect } from 'preact/hooks'

export function ThemeToggle() {
  const [preference, setPreference] = useState(() => {
    return localStorage.getItem('theme-preference') || 'auto'
  })

  useEffect(() => {
    localStorage.setItem('theme-preference', preference)

    if (preference !== 'auto') {
      const themeClass = preference === 'dark' ? 'theme-night' : 'theme-midday'
      document.body.className = themeClass
    }
  }, [preference])

  return (
    <div style="margin-bottom: var(--space-4)">
      <label class="form-label">Theme</label>
      <select
        class="form-input"
        value={preference}
        onChange={e => setPreference(e.target.value)}
      >
        <option value="auto">Auto (time-based)</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  )
}
