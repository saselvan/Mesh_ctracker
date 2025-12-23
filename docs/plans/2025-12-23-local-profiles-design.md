# Local Multi-User Profiles Design

## Goal

Allow multiple household members to track their calories separately on the same device with basic PIN privacy.

## User Flow

### No Profiles (Default)
- App works exactly as it does now (backwards compatible)
- "Add Profile" option available in Settings

### First Launch with Legacy Data
- If legacy data exists but no profiles, show one-time prompt:
  - "Want to add profiles? This lets multiple people track separately."
  - [Add Profiles] [Maybe Later]
- "Maybe Later" continues single-user mode, prompts again next launch
- "Add Profiles" triggers migration flow

### Creating First Profile
1. User enters name + 4-digit PIN
2. "Migrating..." modal shown
3. Existing entries assigned to this profile
4. Goals copied to profile-specific key
5. User logged in as this profile

### With Profiles Active
- App launch shows ProfileSettings as picker
- User taps name, enters PIN
- Correct PIN loads their data
- Header shows profile name + lock icon for quick switch
- Settings shows profile management options

### Switching Profiles
- Lock icon in header or Settings → Switch Profile
- Returns to profile picker
- App state cleared before loading new profile's data

## Data Storage

### Profile Storage (localStorage)
```javascript
// Key: 'calorie-tracker-profiles'
{
  profiles: [
    { id: "abc123", name: "Sam", pin: "1234" },
    { id: "def456", name: "Alex", pin: "5678" }
  ],
  activeProfileId: "abc123" | null
}
```

PIN stored as plaintext (4-digit PIN + localStorage = no real security - just casual privacy).

### Entry Storage (IndexedDB)
- Entries include `profileId` field
- Composite index on `[profileId, date]` for efficient queries
- DB_VERSION bumped to 2 for index migration
- Entries without profileId = legacy data

### Goals Storage (localStorage)
- Key pattern: `calorie-tracker-goals-{profileId}`
- Fallback to legacy key `calorie-tracker-goals` if profile key not found
- Ensures backwards compatibility

## Components

### ProfileSettings.jsx
Single component handles both profile picking and management:
- **No active profile:** Profile list with PIN entry for each
- **Profile active:** Current profile display, Switch/Add/Delete buttons

### PinInput (simplified)
```jsx
<input
  type="password"
  maxLength={4}
  inputMode="numeric"
  placeholder="PIN"
/>
```
Simple single input, no fancy 4-box UI for MVP.

### Header Changes
- Show profile name when logged in
- Lock icon button to switch profiles

### Settings Changes
- "Profiles" section
- Shows "Add Profile" when none exist
- Shows ProfileSettings when profiles active

## Data Layer Changes

### db.js
```javascript
const DB_VERSION = 2  // Bumped for composite index

// In onupgradeneeded:
if (oldVersion < 2) {
  store.createIndex('profileDate', ['profileId', 'date'])
}

// New query function
export async function getEntriesByDateAndProfile(date, profileId) {
  // Uses composite index
  // If no profileId, returns entries without profileId (legacy)
}
```

### storage.js
```javascript
// Profile functions
export function getProfiles() { ... }
export function saveProfiles(profiles) { ... }
export function getActiveProfileId() { ... }
export function setActiveProfileId(id) { ... }

// Goals with fallback
export function getGoals(profileId) {
  if (profileId) {
    const profileGoals = localStorage.getItem(`calorie-tracker-goals-${profileId}`)
    if (profileGoals) return JSON.parse(profileGoals)
  }
  // Fallback to legacy key
  return JSON.parse(localStorage.getItem('calorie-tracker-goals')) || DEFAULT_GOALS
}
```

## Migration

### Trigger
On app launch: legacy data exists + no profiles → show prompt.

### Migration Steps
1. Backup existing data to `calorie-tracker-pre-migration-backup`
2. Bump DB version, add composite index
3. Add profileId to all existing entries
4. Copy goals to profile-specific key (keep old key for rollback)
5. Save new profile, set as active
6. Mark migration complete: `calorie-tracker-migrated: true`

### Rollback
If migration fails, backup exists in localStorage for manual recovery.

## Import/Export

### Export Format v2
```javascript
{
  version: 2,
  exportedAt: "2025-12-23T...",
  profiles: [{ id, name, pin }, ...],  // If profiles exist
  activeProfileId: "...",
  entries: [{ id, date, profileId, ... }, ...],
  goals: {
    "profileId1": { calories, protein, carbs, fat },
    "profileId2": { ... }
  }
}
```

### Import Behavior
- **v1 format (no profiles):** Works as before
- **v2 format with profiles:**
  - Prompt: "Import as new profile or merge into current?"
  - New profile: creates profile from export data
  - Merge: adds entries to current profile

## Profile Management

### Add Profile
- Name (required) + 4-digit PIN (required)
- Creates profile with unique ID
- Does NOT auto-switch to new profile

### Delete Profile
- Confirmation: "Delete [name]'s profile? This removes all their entries and goals."
- Cannot delete last profile (button disabled)
- On confirm: remove entries, goals, and profile record
- If deleting active profile: switch to first remaining

### Forgot PIN
- Not in MVP - document that data is lost if forgotten
- Workaround: export all data, delete profile, create new, re-import

## Out of Scope (YAGNI)
- Edit profile (name/PIN change)
- Profile avatars/colors
- PIN hashing (no real security benefit)
- Biometric authentication
- Cloud sync
