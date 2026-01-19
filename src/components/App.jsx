import { useState, useEffect } from 'preact/hooks'
import { Header } from './Header'
import { DailyProgress } from './DailyProgress'
import { EntryList } from './EntryList'
import { EntryForm } from './EntryForm'
import { Settings } from './Settings'
import { Modal } from './Modal'
import { QuickAddButton } from './QuickAddButton'
import { TodaySummary } from './TodaySummary'
import { DatePicker } from './DatePicker'
import { ProfileSettings } from './ProfileSettings'
import { Celebration } from './Celebration'
import { StreakDisplay } from './StreakDisplay'
import { TemplateManager } from './TemplateManager'
import { InstallPrompt } from './InstallPrompt'
import { OfflineIndicator } from './OfflineIndicator'
import { getEntriesByDateAndProfile, addEntry, updateEntry, deleteEntry } from '../utils/db'
import { getGoals, saveGoals, getProfiles, getActiveProfileId, setActiveProfileId, needsMigration } from '../utils/storage'
import { getToday } from '../utils/date'
import { checkAndUpdateStreak } from '../utils/streaks'
import { applyTheme } from '../utils/theme'

/**
 * App - Log-First UI Design
 *
 * Layout order optimized for behavioral psychology:
 * 1. QuickAddButton - Primary action (3-6x daily) at top
 * 2. TodaySummary - Conditional feedback after logging
 * 3. DailyProgress - Compact ring + horizontal macros
 * 4. StreakDisplay - Collapsed motivational widget
 *
 * The most frequent action requires zero scrolling.
 */
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
  const [showCelebration, setShowCelebration] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showEntryList, setShowEntryList] = useState(false)
  const [justLogged, setJustLogged] = useState(false)

  const profiles = getProfiles()
  const hasProfiles = profiles.length > 0
  const currentProfile = profiles.find(p => p.id === activeProfileId)

  // Calculate totals for TodaySummary
  const totalCalories = entries.reduce((sum, e) => sum + (e.calories || 0), 0)

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
    const interval = setInterval(applyTheme, 15 * 60 * 1000)
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

    // Trigger feedback animation
    setJustLogged(true)
    setTimeout(() => setJustLogged(false), 2500)
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

  function handleCelebrationTrigger() {
    setShowCelebration(true)
  }

  async function handleApplyTemplate(template) {
    for (const entry of template.entries) {
      await addEntry({
        ...entry,
        date: currentDate,
        profileId: activeProfileId
      })
    }
    await loadEntries()
    setShowTemplates(false)
    setJustLogged(true)
    setTimeout(() => setJustLogged(false), 2500)
  }

  return (
    <div class="app">
      <OfflineIndicator />
      <InstallPrompt />

      <header role="banner">
        <Header
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onSettingsClick={() => setShowSettings(true)}
          onCalendarClick={() => setShowCalendar(true)}
          profileName={currentProfile?.name}
          onProfileClick={handleProfileClick}
        />
      </header>

      <main id="main-content" role="main">
        {/* PRIMARY ACTION - Log Meal Button */}
        <QuickAddButton onClick={() => setShowForm(true)} />

        {/* FEEDBACK - Today's Summary (conditional) */}
        <TodaySummary
          entries={entries}
          totalCalories={totalCalories}
          expanded={showEntryList}
          onToggle={() => setShowEntryList(!showEntryList)}
          justLogged={justLogged}
        />

        {/* Expandable Entry List */}
        {showEntryList && entries.length > 0 && (
          <EntryList
            entries={entries}
            onEdit={handleEditEntry}
            onDelete={setDeletingEntry}
            profileId={activeProfileId}
            onShowTemplates={() => setShowTemplates(true)}
            compact
          />
        )}

        {/* PROGRESS - Compact Ring + Horizontal Macros */}
        <DailyProgress
          entries={entries}
          goals={goals}
          profileId={activeProfileId}
          date={currentDate}
          onCelebrationTrigger={handleCelebrationTrigger}
          justLogged={justLogged}
        />

        {/* MOTIVATION - Collapsed Streak */}
        <StreakDisplay
          profileId={activeProfileId}
          profile={currentProfile}
          onDateClick={setCurrentDate}
        />
      </main>

      {/* No FAB - replaced by QuickAddButton at top */}

      {showForm && (
        <EntryForm
          entry={editingEntry}
          onSave={handleSaveEntry}
          onCancel={handleCloseForm}
          profileId={activeProfileId}
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

      {showCelebration && (
        <Celebration onComplete={() => setShowCelebration(false)} />
      )}

      {showTemplates && (
        <TemplateManager
          profileId={activeProfileId}
          onSelect={handleApplyTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  )
}
