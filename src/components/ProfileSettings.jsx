import { useState } from 'preact/hooks'
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
