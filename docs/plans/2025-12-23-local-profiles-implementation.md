# Local Profiles Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add local multi-user profiles with PIN privacy for household use.

**Architecture:** Extend existing localStorage/IndexedDB storage with profile awareness. Add ProfileSettings component for profile management. Update App.jsx to track active profile and filter data accordingly. Migration handles existing data.

**Tech Stack:** Preact, IndexedDB (with composite index), localStorage

---

## Task 1: Add Profile Storage Functions

**Files:**
- Modify: `src/utils/storage.js`

**Step 1: Add profile constants and functions**

Add to the top of storage.js:

```javascript
const PROFILES_KEY = 'calorie-tracker-profiles'

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
  // Clear goals for this profile
  localStorage.removeItem(`${GOALS_KEY}-${profileId}`)
}

export function verifyPin(profileId, pin) {
  const profiles = getProfiles()
  const profile = profiles.find(p => p.id === profileId)
  return profile && profile.pin === pin
}
```

**Step 2: Update getGoals and saveGoals for profile support**

Modify existing functions:

```javascript
export function getGoals(profileId = null) {
  try {
    // Try profile-specific key first
    if (profileId) {
      const profileGoals = localStorage.getItem(`${GOALS_KEY}-${profileId}`)
      if (profileGoals) {
        return { ...DEFAULT_GOALS, ...JSON.parse(profileGoals) }
      }
    }
    // Fallback to legacy key
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
```

**Step 3: Run build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/utils/storage.js
git commit -m "feat: add profile storage functions"
```

---

## Task 2: Update IndexedDB for Profile Support

**Files:**
- Modify: `src/utils/db.js`

**Step 1: Bump DB version and add composite index**

Update constants and openDB function:

```javascript
const DB_NAME = 'calorie-tracker'
const DB_VERSION = 2  // Bumped from 1
const STORE_NAME = 'entries'
```

Update the `onupgradeneeded` handler:

```javascript
request.onupgradeneeded = (event) => {
  const db = event.target.result
  let store

  if (!db.objectStoreNames.contains(STORE_NAME)) {
    store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
    store.createIndex('date', 'date', { unique: false })
  } else {
    store = event.target.transaction.objectStore(STORE_NAME)
  }

  // Add composite index for profile queries (v2)
  if (event.oldVersion < 2) {
    if (!store.indexNames.contains('profileDate')) {
      store.createIndex('profileDate', ['profileId', 'date'], { unique: false })
    }
  }
}
```

**Step 2: Add profile-aware query function**

Add new function:

```javascript
export async function getEntriesByDateAndProfile(date, profileId = null) {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)

  // If no profileId, get entries without profileId (legacy) or with null profileId
  if (!profileId) {
    const index = store.index('date')
    const request = index.getAll(date)
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        // Filter to only entries without profileId
        const entries = request.result.filter(e => !e.profileId)
        resolve(entries)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Use composite index for profile-specific queries
  const index = store.index('profileDate')
  const request = index.getAll([profileId, date])
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
```

**Step 3: Add function to update entry profileId (for migration)**

```javascript
export async function addProfileIdToAllEntries(profileId) {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  const request = store.getAll()

  return new Promise((resolve, reject) => {
    request.onsuccess = async () => {
      const entries = request.result
      for (const entry of entries) {
        if (!entry.profileId) {
          entry.profileId = profileId
          store.put(entry)
        }
      }
      tx.oncomplete = () => resolve(entries.length)
      tx.onerror = () => reject(tx.error)
    }
    request.onerror = () => reject(request.error)
  })
}
```

**Step 4: Add function to delete entries by profile**

```javascript
export async function deleteEntriesByProfile(profileId) {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  const request = store.getAll()

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const entries = request.result
      let deleted = 0
      for (const entry of entries) {
        if (entry.profileId === profileId) {
          store.delete(entry.id)
          deleted++
        }
      }
      tx.oncomplete = () => resolve(deleted)
      tx.onerror = () => reject(tx.error)
    }
    request.onerror = () => reject(request.error)
  })
}
```

**Step 5: Update addEntry to include profileId**

Modify `addEntry` function:

```javascript
export async function addEntry(entry) {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const newEntry = { ...entry, id }  // profileId comes from entry if provided
  store.add(newEntry)
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(newEntry)
    tx.onerror = () => reject(tx.error)
  })
}
```

**Step 6: Run build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 7: Commit**

```bash
git add src/utils/db.js
git commit -m "feat: add profile support to IndexedDB"
```

---

## Task 3: Create ProfileSettings Component

**Files:**
- Create: `src/components/ProfileSettings.jsx`

**Step 1: Create the component**

```javascript
import { useState } from 'preact/hooks'
import {
  getProfiles,
  createProfile,
  deleteProfile,
  verifyPin,
  setActiveProfileId,
  getActiveProfileId
} from '../utils/storage'
import { deleteEntriesByProfile } from '../utils/db'

export function ProfileSettings({ onProfileSelect, onClose, isPickerMode = false }) {
  const [profiles, setProfiles] = useState(getProfiles())
  const [showAddForm, setShowAddForm] = useState(false)
  const [showPinFor, setShowPinFor] = useState(null)
  const [pin, setPin] = useState('')
  const [newName, setNewName] = useState('')
  const [newPin, setNewPin] = useState('')
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const activeProfileId = getActiveProfileId()

  const handlePinSubmit = (profileId) => {
    if (verifyPin(profileId, pin)) {
      setActiveProfileId(profileId)
      setPin('')
      setError('')
      onProfileSelect(profileId)
    } else {
      setError('Wrong PIN')
      setPin('')
    }
  }

  const handleAddProfile = () => {
    if (!newName.trim()) {
      setError('Name required')
      return
    }
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setError('PIN must be 4 digits')
      return
    }
    createProfile(newName.trim(), newPin)
    setProfiles(getProfiles())
    setNewName('')
    setNewPin('')
    setShowAddForm(false)
    setError('')
  }

  const handleDeleteProfile = async (profileId) => {
    await deleteEntriesByProfile(profileId)
    deleteProfile(profileId)
    setProfiles(getProfiles())
    setDeleteConfirm(null)

    // If deleted active profile, clear it
    if (profileId === activeProfileId) {
      const remaining = getProfiles()
      if (remaining.length > 0) {
        setActiveProfileId(remaining[0].id)
        onProfileSelect(remaining[0].id)
      } else {
        setActiveProfileId(null)
      }
    }
  }

  const handleSwitchProfile = () => {
    setActiveProfileId(null)
    onProfileSelect(null)
  }

  // Picker mode: show profile list with PIN entry
  if (isPickerMode || !activeProfileId) {
    return (
      <div class="modal-overlay" onClick={onClose}>
        <div class="profile-modal" onClick={e => e.stopPropagation()}>
          <h2 class="form-title">Who's tracking?</h2>

          {profiles.length === 0 ? (
            <p class="profile-empty">No profiles yet. Add one to get started!</p>
          ) : (
            <div class="profile-list">
              {profiles.map(profile => (
                <div key={profile.id} class="profile-item">
                  {showPinFor === profile.id ? (
                    <div class="profile-pin-entry">
                      <span class="profile-name">{profile.name}</span>
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="PIN"
                        value={pin}
                        onInput={e => setPin(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handlePinSubmit(profile.id)}
                        autoFocus
                        class="pin-input"
                      />
                      <button
                        class="btn btn--primary btn--sm"
                        onClick={() => handlePinSubmit(profile.id)}
                      >
                        Go
                      </button>
                      <button
                        class="btn btn--secondary btn--sm"
                        onClick={() => { setShowPinFor(null); setPin(''); setError('') }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      class="profile-select-btn"
                      onClick={() => setShowPinFor(profile.id)}
                    >
                      {profile.name}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {error && <p class="error-message">{error}</p>}

          {showAddForm ? (
            <div class="profile-add-form">
              <input
                type="text"
                placeholder="Name"
                value={newName}
                onInput={e => setNewName(e.target.value)}
                class="form-input"
                autoFocus
              />
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="4-digit PIN"
                value={newPin}
                onInput={e => setNewPin(e.target.value)}
                class="form-input"
              />
              <div class="form-actions">
                <button class="btn btn--secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button class="btn btn--primary" onClick={handleAddProfile}>
                  Create Profile
                </button>
              </div>
            </div>
          ) : (
            <button
              class="btn btn--secondary profile-add-btn"
              onClick={() => setShowAddForm(true)}
            >
              + Add Profile
            </button>
          )}
        </div>
      </div>
    )
  }

  // Management mode: show current profile and options
  const currentProfile = profiles.find(p => p.id === activeProfileId)

  return (
    <div class="profile-management">
      <h3 class="form-section-title">Current Profile</h3>
      <p class="current-profile-name">{currentProfile?.name || 'Unknown'}</p>

      <div class="profile-actions">
        <button class="btn btn--secondary" onClick={handleSwitchProfile}>
          Switch Profile
        </button>
        <button class="btn btn--secondary" onClick={() => setShowAddForm(true)}>
          Add Profile
        </button>
        {profiles.length > 1 && (
          <button
            class="btn btn--danger"
            onClick={() => setDeleteConfirm(activeProfileId)}
          >
            Delete Profile
          </button>
        )}
      </div>

      {showAddForm && (
        <div class="profile-add-form">
          <input
            type="text"
            placeholder="Name"
            value={newName}
            onInput={e => setNewName(e.target.value)}
            class="form-input"
          />
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="4-digit PIN"
            value={newPin}
            onInput={e => setNewPin(e.target.value)}
            class="form-input"
          />
          <div class="form-actions">
            <button class="btn btn--secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
            <button class="btn btn--primary" onClick={handleAddProfile}>
              Create
            </button>
          </div>
        </div>
      )}

      {error && <p class="error-message">{error}</p>}

      {deleteConfirm && (
        <div class="delete-confirm">
          <p>Delete {currentProfile?.name}'s profile? This removes all their data.</p>
          <div class="form-actions">
            <button class="btn btn--secondary" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </button>
            <button class="btn btn--danger" onClick={() => handleDeleteProfile(deleteConfirm)}>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Run build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/ProfileSettings.jsx
git commit -m "feat: create ProfileSettings component"
```

---

## Task 4: Add Profile Styles

**Files:**
- Modify: `src/styles.css`

**Step 1: Add profile-related styles**

Add at the end of styles.css:

```css
/* Profile Styles */
.profile-modal {
  background: var(--white);
  border-radius: var(--border-radius);
  padding: 24px;
  width: 100%;
  max-width: 340px;
  animation: scaleIn 0.2s ease;
}

.profile-empty {
  text-align: center;
  color: var(--gray-500);
  padding: 20px 0;
}

.profile-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.profile-item {
  width: 100%;
}

.profile-select-btn {
  width: 100%;
  padding: 16px;
  font-size: 1.125rem;
  font-weight: 500;
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all 0.2s;
  color: var(--gray-700);
}

.profile-select-btn:hover {
  background: var(--primary-100);
  border-color: var(--primary-400);
}

.profile-pin-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--gray-50);
  border-radius: var(--border-radius-sm);
}

.profile-name {
  font-weight: 500;
  flex: 1;
}

.pin-input {
  width: 60px;
  padding: 8px;
  font-size: 1rem;
  text-align: center;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-sm);
}

.pin-input:focus {
  outline: none;
  border-color: var(--primary-500);
}

.btn--sm {
  padding: 8px 12px;
  font-size: 0.875rem;
}

.profile-add-btn {
  width: 100%;
  margin-top: 8px;
}

.profile-add-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--gray-200);
}

.error-message {
  color: var(--red-500);
  font-size: 0.875rem;
  text-align: center;
  margin-top: 8px;
}

.profile-management {
  margin-bottom: 20px;
}

.current-profile-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-700);
  margin-bottom: 12px;
}

.profile-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.profile-actions .btn {
  flex: 1;
  min-width: 120px;
}

.delete-confirm {
  margin-top: 16px;
  padding: 16px;
  background: var(--gray-50);
  border-radius: var(--border-radius-sm);
}

.delete-confirm p {
  margin-bottom: 12px;
  color: var(--gray-600);
}

/* Header profile indicator */
.header-profile {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-profile-name {
  font-size: 0.875rem;
  color: var(--gray-500);
}

.btn-lock {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--gray-400);
  transition: color 0.2s;
}

.btn-lock:hover {
  color: var(--primary-600);
}
```

**Step 2: Run build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/styles.css
git commit -m "feat: add profile styles"
```

---

## Task 5: Update Header with Profile Display

**Files:**
- Modify: `src/components/Header.jsx`

**Step 1: Update Header to show profile**

```javascript
import { formatDisplayDate, addDays, getToday } from '../utils/date'

export function Header({
  currentDate = getToday(),
  onDateChange = () => {},
  onSettingsClick = () => {},
  onCalendarClick = () => {},
  profileName = null,
  onProfileClick = () => {}
}) {
  const isToday = currentDate === getToday()

  const goBack = () => onDateChange(addDays(currentDate, -1))
  const goForward = () => onDateChange(addDays(currentDate, 1))

  return (
    <header class="header">
      <div class="header-top">
        <h1 class="header-title">Calorie Tracker</h1>
        <div class="header-profile">
          {profileName && (
            <>
              <span class="header-profile-name">{profileName}</span>
              <button class="btn-lock" onClick={onProfileClick} aria-label="Switch profile">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0110 0v4"></path>
                </svg>
              </button>
            </>
          )}
          <button class="btn-icon" onClick={onSettingsClick} aria-label="Settings">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="date-nav">
        <button class="btn-icon" onClick={goBack} aria-label="Previous day">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"></path>
          </svg>
        </button>
        <button class="date-display" onClick={onCalendarClick}>
          {formatDisplayDate(currentDate)}
        </button>
        <button
          class="btn-icon"
          onClick={goForward}
          disabled={isToday}
          aria-label="Next day"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"></path>
          </svg>
        </button>
      </div>
    </header>
  )
}
```

**Step 2: Run build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/Header.jsx
git commit -m "feat: add profile display to header"
```

---

## Task 6: Update Settings with Profile Section

**Files:**
- Modify: `src/components/Settings.jsx`

**Step 1: Add ProfileSettings to Settings**

```javascript
import { useState, useEffect, useRef } from 'preact/hooks'
import { exportAllData, importData } from '../utils/db'
import { ProfileSettings } from './ProfileSettings'
import { getProfiles, getActiveProfileId } from '../utils/storage'

export function Settings({
  goals = {},
  onSave = () => {},
  onClose = () => {},
  onDataChange = () => {},
  onProfileChange = () => {},
  activeProfileId = null
}) {
  const [calories, setCalories] = useState(goals.calories?.toString() || '2000')
  const [protein, setProtein] = useState(goals.protein?.toString() || '150')
  const [carbs, setCarbs] = useState(goals.carbs?.toString() || '250')
  const [fat, setFat] = useState(goals.fat?.toString() || '65')
  const [status, setStatus] = useState('')
  const fileInputRef = useRef(null)

  const profiles = getProfiles()
  const hasProfiles = profiles.length > 0

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

  const handleProfileSelect = (profileId) => {
    onProfileChange(profileId)
  }

  return (
    <div class="form-overlay" onClick={onClose}>
      <form class="entry-form" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2 class="form-title">Settings</h2>

        {/* Profile Section */}
        {hasProfiles && (
          <ProfileSettings
            onProfileSelect={handleProfileSelect}
            onClose={() => {}}
            isPickerMode={false}
          />
        )}

        {!hasProfiles && (
          <div class="profile-management">
            <h3 class="form-section-title">Profiles</h3>
            <p class="profile-hint">Add profiles for multiple users on this device.</p>
            <ProfileSettings
              onProfileSelect={handleProfileSelect}
              onClose={() => {}}
              isPickerMode={true}
            />
          </div>
        )}

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
```

**Step 2: Run build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/Settings.jsx
git commit -m "feat: add profile section to settings"
```

---

## Task 7: Update App.jsx with Profile Support

**Files:**
- Modify: `src/components/App.jsx`

**Step 1: Update App with profile state and logic**

```javascript
import { useState, useEffect } from 'preact/hooks'
import { Header } from './Header'
import { DailyProgress } from './DailyProgress'
import { EntryList } from './EntryList'
import { EntryForm } from './EntryForm'
import { Settings } from './Settings'
import { Modal } from './Modal'
import { FAB } from './FAB'
import { DatePicker } from './DatePicker'
import { ProfileSettings } from './ProfileSettings'
import { getEntriesByDateAndProfile, addEntry, updateEntry, deleteEntry } from '../utils/db'
import { getGoals, saveGoals, getProfiles, getActiveProfileId, setActiveProfileId } from '../utils/storage'
import { getToday } from '../utils/date'

export function App() {
  const [currentDate, setCurrentDate] = useState(getToday())
  const [entries, setEntries] = useState([])
  const [activeProfileId, setActiveProfile] = useState(getActiveProfileId())
  const [goals, setGoals] = useState(getGoals(activeProfileId))
  const [showForm, setShowForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showProfilePicker, setShowProfilePicker] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [deletingEntry, setDeletingEntry] = useState(null)

  const profiles = getProfiles()
  const hasProfiles = profiles.length > 0
  const currentProfile = profiles.find(p => p.id === activeProfileId)

  // Show profile picker on launch if profiles exist but none active
  useEffect(() => {
    if (hasProfiles && !activeProfileId) {
      setShowProfilePicker(true)
    }
  }, [hasProfiles, activeProfileId])

  useEffect(() => {
    loadEntries()
  }, [currentDate, activeProfileId])

  useEffect(() => {
    setGoals(getGoals(activeProfileId))
  }, [activeProfileId])

  async function loadEntries() {
    const data = await getEntriesByDateAndProfile(currentDate, activeProfileId)
    setEntries(data)
  }

  async function handleSaveEntry(entryData) {
    if (entryData.id) {
      await updateEntry(entryData)
    } else {
      await addEntry({ ...entryData, date: currentDate, profileId: activeProfileId })
    }
    await loadEntries()
    setShowForm(false)
    setEditingEntry(null)
  }

  async function handleDeleteEntry() {
    if (deletingEntry) {
      await deleteEntry(deletingEntry.id)
      await loadEntries()
      setDeletingEntry(null)
    }
  }

  function handleEditEntry(entry) {
    setEditingEntry(entry)
    setShowForm(true)
  }

  function handleSaveGoals(newGoals) {
    saveGoals(newGoals, activeProfileId)
    setGoals(newGoals)
    setShowSettings(false)
  }

  function handleCloseForm() {
    setShowForm(false)
    setEditingEntry(null)
  }

  function handleProfileChange(profileId) {
    setActiveProfileId(profileId)
    setActiveProfile(profileId)
    setShowProfilePicker(false)
    setShowSettings(false)
  }

  function handleProfileClick() {
    setActiveProfileId(null)
    setActiveProfile(null)
    setShowProfilePicker(true)
  }

  return (
    <div class="app">
      <Header
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onSettingsClick={() => setShowSettings(true)}
        onCalendarClick={() => setShowCalendar(true)}
        profileName={currentProfile?.name}
        onProfileClick={handleProfileClick}
      />

      <DailyProgress entries={entries} goals={goals} />

      <EntryList
        entries={entries}
        onEdit={handleEditEntry}
        onDelete={setDeletingEntry}
      />

      <FAB onClick={() => setShowForm(true)} />

      {showForm && (
        <EntryForm
          entry={editingEntry}
          onSave={handleSaveEntry}
          onCancel={handleCloseForm}
        />
      )}

      {showSettings && (
        <Settings
          goals={goals}
          onSave={handleSaveGoals}
          onClose={() => setShowSettings(false)}
          onDataChange={loadEntries}
          onProfileChange={handleProfileChange}
          activeProfileId={activeProfileId}
        />
      )}

      {deletingEntry && (
        <Modal
          title="Delete Entry"
          message={`Are you sure you want to delete "${deletingEntry.name}"?`}
          confirmText="Delete"
          danger
          onConfirm={handleDeleteEntry}
          onCancel={() => setDeletingEntry(null)}
        />
      )}

      {showCalendar && (
        <DatePicker
          currentDate={currentDate}
          onSelect={setCurrentDate}
          onClose={() => setShowCalendar(false)}
        />
      )}

      {showProfilePicker && hasProfiles && (
        <ProfileSettings
          onProfileSelect={handleProfileChange}
          onClose={() => activeProfileId && setShowProfilePicker(false)}
          isPickerMode={true}
        />
      )}
    </div>
  )
}
```

**Step 2: Run build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/App.jsx
git commit -m "feat: integrate profile support into app"
```

---

## Task 8: Add Migration Support

**Files:**
- Modify: `src/utils/storage.js`
- Modify: `src/components/App.jsx`

**Step 1: Add migration functions to storage.js**

Add to storage.js:

```javascript
const MIGRATION_KEY = 'calorie-tracker-migrated'
const BACKUP_KEY = 'calorie-tracker-pre-migration-backup'

export function needsMigration() {
  // Has legacy goals but no profiles and not migrated
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
```

**Step 2: Add migration prompt to App.jsx**

Add state and effect to App.jsx (add after other state declarations):

```javascript
const [showMigrationPrompt, setShowMigrationPrompt] = useState(false)
```

Add import for needsMigration:

```javascript
import {
  getGoals,
  saveGoals,
  getProfiles,
  getActiveProfileId,
  setActiveProfileId,
  needsMigration
} from '../utils/storage'
```

Add import for migration functions in db.js:

```javascript
import {
  getEntriesByDateAndProfile,
  addEntry,
  updateEntry,
  deleteEntry,
  addProfileIdToAllEntries,
  exportAllData
} from '../utils/db'
```

Add effect to check for migration:

```javascript
useEffect(() => {
  if (needsMigration()) {
    setShowMigrationPrompt(true)
  }
}, [])
```

Add MigrationPrompt component render (before closing </div>):

```javascript
{showMigrationPrompt && (
  <Modal
    title="Add Profiles?"
    message="Multiple people can track their calories separately on this device. Want to set up profiles?"
    confirmText="Add Profiles"
    onConfirm={() => {
      setShowMigrationPrompt(false)
      setShowProfilePicker(true)
    }}
    onCancel={() => setShowMigrationPrompt(false)}
  />
)}
```

**Step 3: Run build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/utils/storage.js src/components/App.jsx
git commit -m "feat: add migration prompt for profiles"
```

---

## Task 9: Complete Migration Flow in ProfileSettings

**Files:**
- Modify: `src/components/ProfileSettings.jsx`

**Step 1: Add migration logic when creating first profile**

Update imports:

```javascript
import {
  getProfiles,
  createProfile,
  deleteProfile,
  verifyPin,
  setActiveProfileId,
  getActiveProfileId,
  needsMigration,
  markMigrationComplete,
  backupForMigration,
  migrateGoalsToProfile
} from '../utils/storage'
import { deleteEntriesByProfile, addProfileIdToAllEntries, exportAllData } from '../utils/db'
```

Update handleAddProfile function:

```javascript
const handleAddProfile = async () => {
  if (!newName.trim()) {
    setError('Name required')
    return
  }
  if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
    setError('PIN must be 4 digits')
    return
  }

  const isFirstProfile = getProfiles().length === 0

  // Create profile
  const profile = createProfile(newName.trim(), newPin)

  // If first profile and has legacy data, migrate
  if (isFirstProfile && needsMigration()) {
    try {
      // Backup first
      const backup = await exportAllData()
      backupForMigration(backup)

      // Migrate entries
      await addProfileIdToAllEntries(profile.id)

      // Migrate goals
      migrateGoalsToProfile(profile.id)

      // Mark complete
      markMigrationComplete()
    } catch (e) {
      console.error('Migration failed:', e)
      setError('Migration failed. Your data is backed up.')
    }
  }

  setProfiles(getProfiles())
  setNewName('')
  setNewPin('')
  setShowAddForm(false)
  setError('')

  // Auto-login to first profile
  if (isFirstProfile) {
    setActiveProfileId(profile.id)
    onProfileSelect(profile.id)
  }
}
```

**Step 2: Run build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/ProfileSettings.jsx
git commit -m "feat: add migration flow for first profile"
```

---

## Task 10: Final Verification and Push

**Step 1: Run final build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 2: Verify dev server**

Run: `npm run dev`
Expected: App starts, profiles can be created, PIN entry works

**Step 3: Check git status**

Run: `git status`
Expected: Working tree clean

**Step 4: Push to GitHub**

```bash
git push origin main
```

Expected: Push succeeds, GitHub Actions deploys

---

## Summary

Total tasks: 10
Key files modified:
- `src/utils/storage.js` - Profile storage functions
- `src/utils/db.js` - Profile-aware IndexedDB queries
- `src/components/ProfileSettings.jsx` - New profile management UI
- `src/components/Header.jsx` - Profile display
- `src/components/Settings.jsx` - Profile section
- `src/components/App.jsx` - Profile state management
- `src/styles.css` - Profile styles
