const GOALS_KEY = 'calorie-tracker-goals'
const PROFILES_KEY = 'calorie-tracker-profiles'
const MIGRATION_KEY = 'calorie-tracker-migrated'
const BACKUP_KEY = 'calorie-tracker-pre-migration-backup'

const DEFAULT_GOALS = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65
}

export function getProfiles() {
  try {
    const data = localStorage.getItem(PROFILES_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      return parsed.profiles || []
    }
  } catch (e) {
    console.error('Failed to load profiles:', e)
  }
  return []
}

export function saveProfiles(profiles) {
  try {
    const data = JSON.parse(localStorage.getItem(PROFILES_KEY) || '{}')
    data.profiles = profiles
    localStorage.setItem(PROFILES_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save profiles:', e)
  }
}

export function getActiveProfileId() {
  try {
    const data = localStorage.getItem(PROFILES_KEY)
    if (data) {
      return JSON.parse(data).activeProfileId || null
    }
  } catch (e) {
    console.error('Failed to load active profile:', e)
  }
  return null
}

export function setActiveProfileId(profileId) {
  try {
    const data = JSON.parse(localStorage.getItem(PROFILES_KEY) || '{}')
    data.activeProfileId = profileId
    localStorage.setItem(PROFILES_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save active profile:', e)
  }
}

export function createProfile(name, pin) {
  const profiles = getProfiles()
  const newProfile = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    pin
  }
  profiles.push(newProfile)
  saveProfiles(profiles)
  return newProfile
}

export function deleteProfile(profileId) {
  const profiles = getProfiles().filter(p => p.id !== profileId)
  saveProfiles(profiles)
  localStorage.removeItem(`${GOALS_KEY}-${profileId}`)
}

export function verifyPin(profileId, pin) {
  const profiles = getProfiles()
  const profile = profiles.find(p => p.id === profileId)
  return profile && profile.pin === pin
}

export function needsMigration() {
  const hasLegacyGoals = localStorage.getItem(GOALS_KEY) !== null
  const hasProfiles = getProfiles().length > 0
  const alreadyMigrated = localStorage.getItem(MIGRATION_KEY) === 'true'
  return hasLegacyGoals && !hasProfiles && !alreadyMigrated
}

export function markMigrationComplete() {
  localStorage.setItem(MIGRATION_KEY, 'true')
}

export function backupForMigration(data) {
  localStorage.setItem(BACKUP_KEY, data)
}

export function migrateGoalsToProfile(profileId) {
  const legacyGoals = localStorage.getItem(GOALS_KEY)
  if (legacyGoals) {
    localStorage.setItem(`${GOALS_KEY}-${profileId}`, legacyGoals)
  }
}

export function getGoals(profileId = null) {
  try {
    if (profileId) {
      const profileGoals = localStorage.getItem(`${GOALS_KEY}-${profileId}`)
      if (profileGoals) {
        return { ...DEFAULT_GOALS, ...JSON.parse(profileGoals) }
      }
    }
    const stored = localStorage.getItem(GOALS_KEY)
    if (stored) {
      return { ...DEFAULT_GOALS, ...JSON.parse(stored) }
    }
  } catch (e) {
    console.error('Failed to load goals:', e)
  }
  return DEFAULT_GOALS
}

export function saveGoals(goals, profileId = null) {
  try {
    const key = profileId ? `${GOALS_KEY}-${profileId}` : GOALS_KEY
    localStorage.setItem(key, JSON.stringify(goals))
  } catch (e) {
    console.error('Failed to save goals:', e)
  }
}
