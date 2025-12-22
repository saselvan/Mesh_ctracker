import { useState, useEffect } from 'preact/hooks'
import { Header } from './Header'
import { DailyProgress } from './DailyProgress'
import { EntryList } from './EntryList'
import { EntryForm } from './EntryForm'
import { Settings } from './Settings'
import { Modal } from './Modal'
import { FAB } from './FAB'
import { DatePicker } from './DatePicker'
import { getEntriesByDate, addEntry, updateEntry, deleteEntry } from '../utils/db'
import { getGoals, saveGoals } from '../utils/storage'
import { getToday } from '../utils/date'

export function App() {
  const [currentDate, setCurrentDate] = useState(getToday())
  const [entries, setEntries] = useState([])
  const [goals, setGoals] = useState(getGoals())
  const [showForm, setShowForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [deletingEntry, setDeletingEntry] = useState(null)

  useEffect(() => {
    loadEntries()
  }, [currentDate])

  async function loadEntries() {
    const data = await getEntriesByDate(currentDate)
    setEntries(data)
  }

  async function handleSaveEntry(entryData) {
    if (entryData.id) {
      await updateEntry(entryData)
    } else {
      await addEntry({ ...entryData, date: currentDate })
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
    saveGoals(newGoals)
    setGoals(newGoals)
    setShowSettings(false)
  }

  function handleCloseForm() {
    setShowForm(false)
    setEditingEntry(null)
  }

  return (
    <div class="app">
      <Header
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onSettingsClick={() => setShowSettings(true)}
        onCalendarClick={() => setShowCalendar(true)}
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
    </div>
  )
}
