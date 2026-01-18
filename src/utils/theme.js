export function getTimeOfDay() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 16) return 'midday'
  if (hour >= 16 && hour < 20) return 'evening'
  return 'night'
}

export function getThemePreference() {
  return localStorage.getItem('theme-preference') || 'auto'
}

export function setThemePreference(preference) {
  localStorage.setItem('theme-preference', preference)
  applyTheme()
}

export function applyTheme() {
  const preference = getThemePreference()

  if (preference === 'dark') {
    document.body.className = 'theme-night'
    return
  }

  if (preference === 'light') {
    document.body.className = 'theme-midday'
    return
  }

  // Auto: use time of day
  const period = getTimeOfDay()
  document.body.className = `theme-${period}`
}
