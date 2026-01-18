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
import { getGoals, saveGoals, getProfiles, getActiveProfileId, setActiveProfileId, needsMigration } from '../utils/storage'
import { getToday } from '../utils/date'
import { checkAndUpdateStreak } from '../utils/streaks'
import { applyTheme } from '../utils/theme'

export function App() {
  const [currentDate, setCurrentDate] = useState(getToday())
  const [entries, setEntries] = useState([])
  const [activeProfileId, setActiveProfile] = useState(getActiveProfileId())
  const [goals, setGoals] = useState(getGoals(activeProfileId))
  const [showForm, setShowForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showProfilePicker, setShowProfilePicker] = useState(false)
  const [showMigrationPrompt, setShowMigrationPrompt] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [deletingEntry, setDeletingEntry] = useState(null)

  const profiles = getProfiles()
  const hasProfiles = profiles.length > 0
  const currentProfile = profiles.find(p => p.id === activeProfileId)

  useEffect(() => {
    if (hasProfiles && !activeProfileId) {
      setShowProfilePicker(true)
    }
  }, [hasProfiles, activeProfileId])

  useEffect(() => {
    if (needsMigration()) {
      setShowMigrationPrompt(true)
    }
  }, [])

  useEffect(() => {
    applyTheme()
    const interval = setInterval(applyTheme, 15 * 60 * 1000) // Check every 15min
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    loadEntries()
  }, [currentDate, activeProfileId])

  useEffect(() => {
    if (entries.length > 0 && goals.calories > 0) {
      checkAndUpdateStreak(activeProfileId, entries, goals)
    }
  }, [entries, goals, activeProfileId])

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
    </div>
  )
}
