/**
 * Artist-Inspired Theme System with Gradual Transitions
 *
 * Instead of abrupt switches, colors interpolate smoothly based on exact time.
 * Each hour sees gradual shifts as we blend between artist palettes.
 */

// Theme anchor points (hour when each theme is at 100%)
const THEME_ANCHORS = {
  morning: 8,   // 8am = peak O'Keeffe
  midday: 13,   // 1pm = peak Calder
  evening: 18,  // 6pm = peak Turrell
  night: 23     // 11pm = peak Kusama
}

// Artist-inspired color palettes (matching CSS but for JS interpolation)
const PALETTES = {
  morning: {  // Georgia O'Keeffe - Desert Dawn
    cream: '#FFF8F0',    // Warm desert dawn
    white: '#FFFCF8',    // Luminous white
    sage: '#7BA393',     // Desert sage
    sageLight: '#9DBCAD',
    sagePale: '#E0EDE6',
    sageFaint: '#F0F6F3',
    terracotta: '#E8A080',  // Soft adobe coral
    terracottaLight: '#F0BDA8',
    terracottaPale: '#FCF0E8',
    espresso: '#4A4038',    // Warm earth
    warmGray: '#7A7068',
    muted: '#A09890',
    success: '#7BA393',     // Desert sage
    warning: '#F0C090',     // Desert gold
    // Macro rings — O'Keeffe's desert palette
    protein: '#E8A080',   // Adobe coral
    carbs: '#E8C878',     // Desert marigold
    fat: '#7BA393'        // Sage green
  },
  midday: {  // Alexander Calder - Bold Mobiles
    cream: '#FFFDF5',    // Warm gallery white
    white: '#FFFEF8',    // Warm white card
    sage: '#E63946',
    sageLight: '#F25C69',
    sagePale: '#FCECED',
    sageFaint: '#FEF5F5',
    terracotta: '#1D3557',
    terracottaLight: '#457B9D',
    terracottaPale: '#E8EEF4',
    espresso: '#1A1A1A',
    warmGray: '#4A4A4A',
    muted: '#7A7A7A',
    success: '#2A9D8F',
    warning: '#FFB703',
    // Macro rings — Calder's primary colors
    protein: '#1D3557',   // Deep blue
    carbs: '#FFB703',     // Signature yellow
    fat: '#E63946'        // Calder red
  },
  evening: {  // James Turrell - Twilight Light
    cream: '#E8E0F0',    // Soft lavender twilight
    white: '#F0EBF5',    // Light violet white
    sage: '#7B6B9E',     // Twilight purple
    sageLight: '#9A8BB8',
    sagePale: '#E0D8EB',
    sageFaint: '#F0ECF5',
    terracotta: '#E8A87C',  // Warm horizon glow
    terracottaLight: '#F0C4A0',
    terracottaPale: '#F8EEE5',
    espresso: '#3D3655',    // Deep twilight
    warmGray: '#605878',
    muted: '#8A82A0',
    success: '#88A0B8',     // Cool sky blue
    warning: '#E8B888',     // Horizon orange
    // Macro rings — Turrell's twilight spectrum
    protein: '#C87888',   // Dusky rose
    carbs: '#E8B078',     // Warm amber glow
    fat: '#88A0C0'        // Twilight blue
  },
  night: {  // Yayoi Kusama - Infinity Rooms
    cream: '#0D0D0D',
    white: '#1A1A1A',
    sage: '#9FFFB0',
    sageLight: '#B8FFC8',
    sagePale: '#1A2A1E',
    sageFaint: '#0F1A12',
    terracotta: '#FF1744',
    terracottaLight: '#FF5252',
    terracottaPale: '#2A1A18',
    espresso: '#FFFFFF',
    warmGray: '#E0E0E0',
    muted: '#A0A0A0',
    success: '#9FFFB0',
    warning: '#FFB080',
    // Macro rings — Kusama's infinity room neons, VIVID
    protein: '#FF3366',   // Hot magenta-pink — polka dot rooms
    carbs: '#FFFF00',     // Pure neon yellow — pumpkin installations
    fat: '#00FF88'        // Electric neon green — infinity mirrors
  }
}

// Convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// Convert RGB to hex
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

// Interpolate between two colors
function interpolateColor(color1, color2, factor) {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) return color1

  const r = rgb1.r + (rgb2.r - rgb1.r) * factor
  const g = rgb1.g + (rgb2.g - rgb1.g) * factor
  const b = rgb1.b + (rgb2.b - rgb1.b) * factor

  return rgbToHex(r, g, b)
}

// Get the two adjacent themes and blend factor based on current time
function getThemeBlend() {
  const now = new Date()
  const hour = now.getHours()
  const minutes = now.getMinutes()
  const exactHour = hour + minutes / 60

  // Define theme periods (start hour, end hour, theme name)
  const periods = [
    { start: 5, end: 11, theme: 'morning', peak: 8 },
    { start: 11, end: 16, theme: 'midday', peak: 13.5 },
    { start: 16, end: 20, theme: 'evening', peak: 18 },
    { start: 20, end: 29, theme: 'night', peak: 24 },  // 29 = 5am next day
    { start: 0, end: 5, theme: 'night', peak: 2.5 }    // Early morning night
  ]

  // Find current period
  let currentPeriod = periods.find(p => exactHour >= p.start && exactHour < p.end)
  if (!currentPeriod) currentPeriod = periods[3] // Default to night

  // Find next period for blending
  const periodOrder = ['morning', 'midday', 'evening', 'night']
  const currentIdx = periodOrder.indexOf(currentPeriod.theme)
  const nextTheme = periodOrder[(currentIdx + 1) % 4]

  // Calculate blend factor (0 = current theme, 1 = next theme)
  // Blend starts at 75% through the current period
  const periodLength = currentPeriod.end - currentPeriod.start
  const progressInPeriod = (exactHour - currentPeriod.start) / periodLength

  let blendFactor = 0
  if (progressInPeriod > 0.6) {
    // Last 40% of period: gradually blend to next
    blendFactor = (progressInPeriod - 0.6) / 0.4
  }

  return {
    primary: currentPeriod.theme,
    secondary: nextTheme,
    factor: blendFactor
  }
}

// Generate interpolated palette
function getInterpolatedPalette() {
  const { primary, secondary, factor } = getThemeBlend()
  const palette1 = PALETTES[primary]
  const palette2 = PALETTES[secondary]

  const interpolated = {}
  for (const key of Object.keys(palette1)) {
    interpolated[key] = interpolateColor(palette1[key], palette2[key], factor)
  }

  return { palette: interpolated, primary, secondary, factor }
}

// Apply interpolated colors to CSS custom properties
function applyInterpolatedColors() {
  const { palette, primary } = getInterpolatedPalette()
  const root = document.documentElement

  // Set base theme class (for any CSS that depends on it)
  document.body.className = `theme-${primary}`

  // Override with interpolated values
  root.style.setProperty('--color-cream', palette.cream)
  root.style.setProperty('--color-white', palette.white)
  root.style.setProperty('--color-sage', palette.sage)
  root.style.setProperty('--color-sage-light', palette.sageLight)
  root.style.setProperty('--color-sage-pale', palette.sagePale)
  root.style.setProperty('--color-sage-faint', palette.sageFaint)
  root.style.setProperty('--color-terracotta', palette.terracotta)
  root.style.setProperty('--color-terracotta-light', palette.terracottaLight)
  root.style.setProperty('--color-terracotta-pale', palette.terracottaPale)
  root.style.setProperty('--color-espresso', palette.espresso)
  root.style.setProperty('--color-warm-gray', palette.warmGray)
  root.style.setProperty('--color-muted', palette.muted)
  root.style.setProperty('--color-success', palette.success)
  root.style.setProperty('--color-warning', palette.warning)
  // Macro ring colors — part of the artist's world
  root.style.setProperty('--color-protein', palette.protein)
  root.style.setProperty('--color-carbs', palette.carbs)
  root.style.setProperty('--color-fat', palette.fat)
}

// Clear interpolated styles (used when switching to manual theme)
function clearInterpolatedStyles() {
  const root = document.documentElement
  const props = [
    '--color-cream', '--color-white', '--color-sage', '--color-sage-light',
    '--color-sage-pale', '--color-sage-faint', '--color-terracotta',
    '--color-terracotta-light', '--color-terracotta-pale', '--color-espresso',
    '--color-warm-gray', '--color-muted', '--color-success', '--color-warning',
    '--color-protein', '--color-carbs', '--color-fat'
  ]
  props.forEach(prop => root.style.removeProperty(prop))
}

// Original functions (kept for compatibility)
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
    clearInterpolatedStyles()
    document.body.className = 'theme-night'
    return
  }

  if (preference === 'light') {
    clearInterpolatedStyles()
    document.body.className = 'theme-midday'
    return
  }

  // Auto: use gradual interpolation
  applyInterpolatedColors()
}

// Export for debugging/testing
export { getThemeBlend, getInterpolatedPalette, PALETTES }
