# Calorie Tracker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a local calorie and macro tracker web app that stores data in the browser, viewable by date, with add/edit/delete functionality.

**Architecture:** Single-page Preact app with IndexedDB for food entries (date-indexed) and localStorage for user goals. Date navigation allows viewing past days. Modal-based confirmation for destructive actions.

**Tech Stack:** Preact, Vite, IndexedDB (via idb-keyval), localStorage, CSS (no framework), GitHub Pages

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/index.jsx`
- Create: `src/styles.css`

**Step 1: Create package.json**

```json
{
  "name": "calorie-tracker",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  },
  "dependencies": {
    "preact": "^10.19.3"
  },
  "devDependencies": {
    "@preact/preset-vite": "^2.8.2",
    "vite": "^5.0.10",
    "gh-pages": "^6.1.1"
  }
}
```

**Step 2: Create vite.config.js**

```javascript
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig({
  plugins: [preact()],
  base: './'
})
```

**Step 3: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Calorie Tracker</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/index.jsx"></script>
  </body>
</html>
```

**Step 4: Create src/index.jsx**

```jsx
import { render } from 'preact'
import { App } from './components/App'
import './styles.css'

render(<App />, document.getElementById('app'))
```

**Step 5: Create src/styles.css with CSS variables**

```css
:root {
  --sage-50: #f6f7f6;
  --sage-100: #e3e7e3;
  --sage-200: #c7d1c7;
  --sage-300: #a3b3a3;
  --sage-400: #7d917d;
  --sage-500: #5f755f;
  --sage-600: #4a5d4a;
  --sage-700: #3d4b3d;
  --sage-800: #333f33;
  --sage-900: #2b352b;

  --white: #ffffff;
  --gray-50: #fafafa;
  --gray-100: #f4f4f5;
  --gray-200: #e4e4e7;
  --gray-300: #d4d4d8;
  --gray-400: #a1a1aa;
  --gray-500: #71717a;
  --gray-600: #52525b;
  --gray-700: #3f3f46;

  --red-500: #ef4444;
  --red-600: #dc2626;

  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --border-radius: 12px;
  --border-radius-sm: 8px;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family);
  background: var(--sage-50);
  color: var(--gray-700);
  line-height: 1.6;
  min-height: 100vh;
}

#app {
  max-width: 480px;
  margin: 0 auto;
  padding: 16px;
  padding-bottom: 100px;
}
```

**Step 6: Create placeholder App component**

Create `src/components/App.jsx`:

```jsx
export function App() {
  return (
    <div class="app">
      <h1>Calorie Tracker</h1>
      <p>App is working!</p>
    </div>
  )
}
```

**Step 7: Install dependencies and verify**

Run: `cd calorie-tracker && npm install`
Expected: Dependencies installed successfully

Run: `npm run dev`
Expected: Server starts, app displays "Calorie Tracker" heading

**Step 8: Commit**

```bash
git add .
git commit -m "feat: scaffold Preact + Vite project with sage green theme"
```

---

## Task 2: IndexedDB Storage Utility

**Files:**
- Create: `src/utils/db.js`

**Step 1: Create IndexedDB utility**

```javascript
const DB_NAME = 'calorie-tracker'
const DB_VERSION = 1
const STORE_NAME = 'entries'

let dbPromise = null

function openDB() {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('date', 'date', { unique: false })
      }
    }
  })

  return dbPromise
}

export async function addEntry(entry) {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  const id = Date.now().toString()
  const newEntry = { ...entry, id }
  store.add(newEntry)
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(newEntry)
    tx.onerror = () => reject(tx.error)
  })
}

export async function updateEntry(entry) {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  store.put(entry)
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(entry)
    tx.onerror = () => reject(tx.error)
  })
}

export async function deleteEntry(id) {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  store.delete(id)
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getEntriesByDate(date) {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)
  const index = store.index('date')
  const request = index.getAll(date)
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getAllEntries() {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)
  const request = store.getAll()
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
```

**Step 2: Verify in browser console**

Run dev server, open browser console, test:
```javascript
import('./src/utils/db.js').then(db => {
  db.addEntry({ name: 'Test', calories: 100, protein: 10, carbs: 5, fat: 3, date: '2025-12-22' })
    .then(console.log)
})
```
Expected: Entry object logged with id

**Step 3: Commit**

```bash
git add src/utils/db.js
git commit -m "feat: add IndexedDB utility for entry storage"
```

---

## Task 3: localStorage Goals Utility

**Files:**
- Create: `src/utils/storage.js`

**Step 1: Create localStorage utility**

```javascript
const GOALS_KEY = 'calorie-tracker-goals'

const DEFAULT_GOALS = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65
}

export function getGoals() {
  try {
    const stored = localStorage.getItem(GOALS_KEY)
    if (stored) {
      return { ...DEFAULT_GOALS, ...JSON.parse(stored) }
    }
  } catch (e) {
    console.error('Failed to load goals:', e)
  }
  return DEFAULT_GOALS
}

export function saveGoals(goals) {
  try {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals))
  } catch (e) {
    console.error('Failed to save goals:', e)
  }
}
```

**Step 2: Commit**

```bash
git add src/utils/storage.js
git commit -m "feat: add localStorage utility for goals"
```

---

## Task 4: Date Helper Utility

**Files:**
- Create: `src/utils/date.js`

**Step 1: Create date utility**

```javascript
export function formatDate(date) {
  return date.toISOString().split('T')[0]
}

export function formatDisplayDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (dateStr === formatDate(today)) {
    return 'Today'
  }
  if (dateStr === formatDate(yesterday)) {
    return 'Yesterday'
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

export function addDays(dateStr, days) {
  const date = new Date(dateStr + 'T00:00:00')
  date.setDate(date.getDate() + days)
  return formatDate(date)
}

export function getToday() {
  return formatDate(new Date())
}
```

**Step 2: Commit**

```bash
git add src/utils/date.js
git commit -m "feat: add date formatting utilities"
```

---

## Task 5: Header Component with Date Navigation

**Files:**
- Create: `src/components/Header.jsx`
- Modify: `src/styles.css`

**Step 1: Create Header component**

```jsx
import { formatDisplayDate, addDays, getToday } from '../utils/date'

export function Header({ currentDate, onDateChange, onSettingsClick }) {
  const isToday = currentDate === getToday()

  const goBack = () => onDateChange(addDays(currentDate, -1))
  const goForward = () => onDateChange(addDays(currentDate, 1))
  const goToToday = () => onDateChange(getToday())

  return (
    <header class="header">
      <div class="header-top">
        <h1 class="header-title">Calorie Tracker</h1>
        <button class="btn-icon" onClick={onSettingsClick} aria-label="Settings">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
          </svg>
        </button>
      </div>
      <div class="date-nav">
        <button class="btn-icon" onClick={goBack} aria-label="Previous day">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"></path>
          </svg>
        </button>
        <button class="date-display" onClick={goToToday}>
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

**Step 2: Add header styles to src/styles.css**

```css
/* Header */
.header {
  margin-bottom: 24px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--sage-700);
}

.date-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.date-display {
  background: var(--white);
  border: 1px solid var(--sage-200);
  border-radius: var(--border-radius-sm);
  padding: 8px 20px;
  font-size: 1rem;
  font-weight: 500;
  color: var(--sage-700);
  cursor: pointer;
  transition: all 0.2s;
}

.date-display:hover {
  background: var(--sage-100);
  border-color: var(--sage-300);
}

.btn-icon {
  background: var(--white);
  border: 1px solid var(--sage-200);
  border-radius: var(--border-radius-sm);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--sage-600);
  transition: all 0.2s;
}

.btn-icon:hover:not(:disabled) {
  background: var(--sage-100);
  border-color: var(--sage-300);
}

.btn-icon:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

**Step 3: Commit**

```bash
git add src/components/Header.jsx src/styles.css
git commit -m "feat: add Header with date navigation"
```

---

## Task 6: Daily Progress Component

**Files:**
- Create: `src/components/DailyProgress.jsx`
- Modify: `src/styles.css`

**Step 1: Create DailyProgress component**

```jsx
export function DailyProgress({ entries, goals }) {
  const totals = entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + (entry.calories || 0),
      protein: acc.protein + (entry.protein || 0),
      carbs: acc.carbs + (entry.carbs || 0),
      fat: acc.fat + (entry.fat || 0)
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const getProgress = (current, goal) => Math.min((current / goal) * 100, 100)
  const getStatus = (current, goal) => {
    const ratio = current / goal
    if (ratio > 1) return 'over'
    if (ratio >= 0.9) return 'close'
    return 'under'
  }

  return (
    <div class="progress-card">
      <div class="progress-main">
        <div class="progress-calories">
          <span class="progress-value">{Math.round(totals.calories)}</span>
          <span class="progress-label">/ {goals.calories} cal</span>
        </div>
        <div class="progress-bar-container">
          <div
            class={`progress-bar progress-bar--${getStatus(totals.calories, goals.calories)}`}
            style={{ width: `${getProgress(totals.calories, goals.calories)}%` }}
          />
        </div>
      </div>
      <div class="progress-macros">
        <div class="macro">
          <div class="macro-header">
            <span class="macro-label">Protein</span>
            <span class="macro-value">{Math.round(totals.protein)}g / {goals.protein}g</span>
          </div>
          <div class="progress-bar-container progress-bar-container--sm">
            <div
              class="progress-bar progress-bar--protein"
              style={{ width: `${getProgress(totals.protein, goals.protein)}%` }}
            />
          </div>
        </div>
        <div class="macro">
          <div class="macro-header">
            <span class="macro-label">Carbs</span>
            <span class="macro-value">{Math.round(totals.carbs)}g / {goals.carbs}g</span>
          </div>
          <div class="progress-bar-container progress-bar-container--sm">
            <div
              class="progress-bar progress-bar--carbs"
              style={{ width: `${getProgress(totals.carbs, goals.carbs)}%` }}
            />
          </div>
        </div>
        <div class="macro">
          <div class="macro-header">
            <span class="macro-label">Fat</span>
            <span class="macro-value">{Math.round(totals.fat)}g / {goals.fat}g</span>
          </div>
          <div class="progress-bar-container progress-bar-container--sm">
            <div
              class="progress-bar progress-bar--fat"
              style={{ width: `${getProgress(totals.fat, goals.fat)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Add progress styles to src/styles.css**

```css
/* Progress Card */
.progress-card {
  background: var(--white);
  border-radius: var(--border-radius);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 20px;
}

.progress-main {
  margin-bottom: 20px;
}

.progress-calories {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
}

.progress-value {
  font-size: 2rem;
  font-weight: 600;
  color: var(--sage-700);
}

.progress-label {
  font-size: 0.875rem;
  color: var(--gray-500);
}

.progress-bar-container {
  height: 12px;
  background: var(--sage-100);
  border-radius: 6px;
  overflow: hidden;
}

.progress-bar-container--sm {
  height: 6px;
  border-radius: 3px;
}

.progress-bar {
  height: 100%;
  border-radius: inherit;
  transition: width 0.3s ease;
}

.progress-bar--under {
  background: var(--sage-400);
}

.progress-bar--close {
  background: var(--sage-500);
}

.progress-bar--over {
  background: var(--red-500);
}

.progress-bar--protein {
  background: #8b5cf6;
}

.progress-bar--carbs {
  background: #f59e0b;
}

.progress-bar--fat {
  background: #ec4899;
}

.progress-macros {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.macro {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.macro-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.macro-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--gray-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.macro-value {
  font-size: 0.875rem;
  color: var(--gray-500);
}
```

**Step 3: Commit**

```bash
git add src/components/DailyProgress.jsx src/styles.css
git commit -m "feat: add DailyProgress component with macros"
```

---

## Task 7: Entry List Component

**Files:**
- Create: `src/components/EntryList.jsx`
- Modify: `src/styles.css`

**Step 1: Create EntryList component**

```jsx
export function EntryList({ entries, onEdit, onDelete }) {
  if (entries.length === 0) {
    return (
      <div class="entry-list-empty">
        <p>No entries yet</p>
        <p class="entry-list-empty-hint">Tap + to add your first meal</p>
      </div>
    )
  }

  return (
    <div class="entry-list">
      <h2 class="entry-list-title">Today's Meals</h2>
      {entries.map(entry => (
        <div key={entry.id} class="entry-card">
          <div class="entry-main" onClick={() => onEdit(entry)}>
            <span class="entry-name">{entry.name}</span>
            <span class="entry-calories">{entry.calories} cal</span>
          </div>
          <div class="entry-macros">
            <span class="entry-macro">P: {entry.protein}g</span>
            <span class="entry-macro">C: {entry.carbs}g</span>
            <span class="entry-macro">F: {entry.fat}g</span>
          </div>
          <button
            class="entry-delete"
            onClick={() => onDelete(entry)}
            aria-label={`Delete ${entry.name}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
```

**Step 2: Add entry list styles to src/styles.css**

```css
/* Entry List */
.entry-list {
  margin-bottom: 20px;
}

.entry-list-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.entry-list-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--gray-400);
}

.entry-list-empty-hint {
  font-size: 0.875rem;
  margin-top: 4px;
}

.entry-card {
  background: var(--white);
  border-radius: var(--border-radius-sm);
  padding: 14px 16px;
  margin-bottom: 8px;
  box-shadow: var(--shadow-sm);
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 4px 12px;
  align-items: center;
}

.entry-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  grid-column: 1;
}

.entry-name {
  font-weight: 500;
  color: var(--gray-700);
}

.entry-calories {
  font-weight: 600;
  color: var(--sage-600);
}

.entry-macros {
  grid-column: 1;
  display: flex;
  gap: 12px;
}

.entry-macro {
  font-size: 0.75rem;
  color: var(--gray-400);
}

.entry-delete {
  grid-column: 2;
  grid-row: 1 / 3;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: var(--gray-400);
  transition: color 0.2s;
  border-radius: var(--border-radius-sm);
}

.entry-delete:hover {
  color: var(--red-500);
  background: var(--gray-50);
}
```

**Step 3: Commit**

```bash
git add src/components/EntryList.jsx src/styles.css
git commit -m "feat: add EntryList component with edit/delete"
```

---

## Task 8: Entry Form Component

**Files:**
- Create: `src/components/EntryForm.jsx`
- Modify: `src/styles.css`

**Step 1: Create EntryForm component**

```jsx
import { useState, useEffect } from 'preact/hooks'

export function EntryForm({ entry, onSave, onCancel }) {
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')

  const isEditing = !!entry

  useEffect(() => {
    if (entry) {
      setName(entry.name || '')
      setCalories(entry.calories?.toString() || '')
      setProtein(entry.protein?.toString() || '')
      setCarbs(entry.carbs?.toString() || '')
      setFat(entry.fat?.toString() || '')
    } else {
      setName('')
      setCalories('')
      setProtein('')
      setCarbs('')
      setFat('')
    }
  }, [entry])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !calories) return

    onSave({
      ...(entry || {}),
      name: name.trim(),
      calories: parseInt(calories) || 0,
      protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0,
      fat: parseInt(fat) || 0
    })
  }

  return (
    <div class="form-overlay" onClick={onCancel}>
      <form class="entry-form" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2 class="form-title">{isEditing ? 'Edit Entry' : 'Add Entry'}</h2>

        <div class="form-field">
          <label class="form-label" for="name">Food Name</label>
          <input
            id="name"
            type="text"
            class="form-input"
            value={name}
            onInput={e => setName(e.target.value)}
            placeholder="e.g., Chicken Salad"
            required
            autoFocus
          />
        </div>

        <div class="form-field">
          <label class="form-label" for="calories">Calories</label>
          <input
            id="calories"
            type="number"
            class="form-input"
            value={calories}
            onInput={e => setCalories(e.target.value)}
            placeholder="0"
            min="0"
            required
          />
        </div>

        <div class="form-row">
          <div class="form-field">
            <label class="form-label" for="protein">Protein (g)</label>
            <input
              id="protein"
              type="number"
              class="form-input"
              value={protein}
              onInput={e => setProtein(e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>

          <div class="form-field">
            <label class="form-label" for="carbs">Carbs (g)</label>
            <input
              id="carbs"
              type="number"
              class="form-input"
              value={carbs}
              onInput={e => setCarbs(e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>

          <div class="form-field">
            <label class="form-label" for="fat">Fat (g)</label>
            <input
              id="fat"
              type="number"
              class="form-input"
              value={fat}
              onInput={e => setFat(e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn--secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" class="btn btn--primary">
            {isEditing ? 'Save Changes' : 'Add Entry'}
          </button>
        </div>
      </form>
    </div>
  )
}
```

**Step 2: Add form styles to src/styles.css**

```css
/* Form Overlay */
.form-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.entry-form {
  background: var(--white);
  border-radius: var(--border-radius) var(--border-radius) 0 0;
  padding: 24px;
  width: 100%;
  max-width: 480px;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.form-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--sage-700);
  margin-bottom: 20px;
}

.form-field {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-600);
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  font-size: 1rem;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius-sm);
  background: var(--gray-50);
  color: var(--gray-700);
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--sage-400);
  background: var(--white);
  box-shadow: 0 0 0 3px rgba(127, 145, 127, 0.1);
}

.form-input::placeholder {
  color: var(--gray-400);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

/* Buttons */
.btn {
  flex: 1;
  padding: 14px 20px;
  font-size: 1rem;
  font-weight: 500;
  border-radius: var(--border-radius-sm);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn--primary {
  background: var(--sage-500);
  color: var(--white);
}

.btn--primary:hover {
  background: var(--sage-600);
}

.btn--secondary {
  background: var(--gray-100);
  color: var(--gray-600);
}

.btn--secondary:hover {
  background: var(--gray-200);
}
```

**Step 3: Commit**

```bash
git add src/components/EntryForm.jsx src/styles.css
git commit -m "feat: add EntryForm component with slide-up animation"
```

---

## Task 9: Confirmation Modal Component

**Files:**
- Create: `src/components/Modal.jsx`
- Modify: `src/styles.css`

**Step 1: Create Modal component**

```jsx
export function Modal({ title, message, onConfirm, onCancel, confirmText = 'Delete', danger = false }) {
  return (
    <div class="modal-overlay" onClick={onCancel}>
      <div class="modal" onClick={e => e.stopPropagation()}>
        <h3 class="modal-title">{title}</h3>
        <p class="modal-message">{message}</p>
        <div class="modal-actions">
          <button class="btn btn--secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            class={`btn ${danger ? 'btn--danger' : 'btn--primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Add modal styles to src/styles.css**

```css
/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

.modal {
  background: var(--white);
  border-radius: var(--border-radius);
  padding: 24px;
  width: 100%;
  max-width: 340px;
  animation: scaleIn 0.2s ease;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 8px;
}

.modal-message {
  font-size: 0.9375rem;
  color: var(--gray-500);
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.btn--danger {
  background: var(--red-500);
  color: var(--white);
}

.btn--danger:hover {
  background: var(--red-600);
}
```

**Step 3: Commit**

```bash
git add src/components/Modal.jsx src/styles.css
git commit -m "feat: add confirmation Modal component"
```

---

## Task 10: Settings Component

**Files:**
- Create: `src/components/Settings.jsx`
- Modify: `src/styles.css`

**Step 1: Create Settings component**

```jsx
import { useState, useEffect } from 'preact/hooks'

export function Settings({ goals, onSave, onClose }) {
  const [calories, setCalories] = useState(goals.calories.toString())
  const [protein, setProtein] = useState(goals.protein.toString())
  const [carbs, setCarbs] = useState(goals.carbs.toString())
  const [fat, setFat] = useState(goals.fat.toString())

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      calories: parseInt(calories) || 2000,
      protein: parseInt(protein) || 150,
      carbs: parseInt(carbs) || 250,
      fat: parseInt(fat) || 65
    })
  }

  return (
    <div class="form-overlay" onClick={onClose}>
      <form class="entry-form" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2 class="form-title">Daily Goals</h2>

        <div class="form-field">
          <label class="form-label" for="goal-calories">Calories</label>
          <input
            id="goal-calories"
            type="number"
            class="form-input"
            value={calories}
            onInput={e => setCalories(e.target.value)}
            min="0"
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
            />
          </div>
        </div>

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

**Step 2: Commit**

```bash
git add src/components/Settings.jsx
git commit -m "feat: add Settings component for daily goals"
```

---

## Task 11: Floating Action Button Component

**Files:**
- Create: `src/components/FAB.jsx`
- Modify: `src/styles.css`

**Step 1: Create FAB component**

```jsx
export function FAB({ onClick }) {
  return (
    <button class="fab" onClick={onClick} aria-label="Add entry">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>
  )
}
```

**Step 2: Add FAB styles to src/styles.css**

```css
/* FAB */
.fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--sage-500);
  color: var(--white);
  border: none;
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.fab:hover {
  background: var(--sage-600);
  transform: scale(1.05);
}

.fab:active {
  transform: scale(0.95);
}

@media (min-width: 480px) {
  .fab {
    right: calc(50% - 240px + 24px);
  }
}
```

**Step 3: Commit**

```bash
git add src/components/FAB.jsx src/styles.css
git commit -m "feat: add floating action button"
```

---

## Task 12: Main App Component - Wire Everything Together

**Files:**
- Modify: `src/components/App.jsx`

**Step 1: Update App component with full functionality**

```jsx
import { useState, useEffect } from 'preact/hooks'
import { Header } from './Header'
import { DailyProgress } from './DailyProgress'
import { EntryList } from './EntryList'
import { EntryForm } from './EntryForm'
import { Settings } from './Settings'
import { Modal } from './Modal'
import { FAB } from './FAB'
import { getEntriesByDate, addEntry, updateEntry, deleteEntry } from '../utils/db'
import { getGoals, saveGoals } from '../utils/storage'
import { getToday } from '../utils/date'

export function App() {
  const [currentDate, setCurrentDate] = useState(getToday())
  const [entries, setEntries] = useState([])
  const [goals, setGoals] = useState(getGoals())
  const [showForm, setShowForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
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
    </div>
  )
}
```

**Step 2: Verify everything works**

Run: `npm run dev`
Expected: Full app working with all features

**Step 3: Commit**

```bash
git add src/components/App.jsx
git commit -m "feat: wire up App component with all functionality"
```

---

## Task 13: Data Export/Import Feature

**Files:**
- Modify: `src/components/Settings.jsx`
- Modify: `src/utils/db.js`

**Step 1: Add export/import functions to db.js**

Add to bottom of `src/utils/db.js`:

```javascript
export async function exportAllData() {
  const entries = await getAllEntries()
  return JSON.stringify({ entries, exportedAt: new Date().toISOString() }, null, 2)
}

export async function importData(jsonString) {
  const data = JSON.parse(jsonString)
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)

  for (const entry of data.entries) {
    store.put(entry)
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(data.entries.length)
    tx.onerror = () => reject(tx.error)
  })
}
```

**Step 2: Update Settings with export/import buttons**

Replace `src/components/Settings.jsx`:

```jsx
import { useState, useRef } from 'preact/hooks'
import { exportAllData, importData } from '../utils/db'

export function Settings({ goals, onSave, onClose, onDataChange }) {
  const [calories, setCalories] = useState(goals.calories.toString())
  const [protein, setProtein] = useState(goals.protein.toString())
  const [carbs, setCarbs] = useState(goals.carbs.toString())
  const [fat, setFat] = useState(goals.fat.toString())
  const [status, setStatus] = useState('')
  const fileInputRef = useRef(null)

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

  return (
    <div class="form-overlay" onClick={onClose}>
      <form class="entry-form" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2 class="form-title">Settings</h2>

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

**Step 3: Add section title and data action styles**

Add to `src/styles.css`:

```css
.form-section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 20px;
  margin-bottom: 12px;
}

.form-section-title:first-of-type {
  margin-top: 0;
}

.data-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.data-actions .btn {
  flex: 1;
  font-size: 0.875rem;
  padding: 10px 16px;
}

.status-message {
  text-align: center;
  font-size: 0.875rem;
  color: var(--sage-600);
  margin-bottom: 16px;
}
```

**Step 4: Update App.jsx to pass onDataChange**

In `src/components/App.jsx`, update the Settings component usage:

```jsx
{showSettings && (
  <Settings
    goals={goals}
    onSave={handleSaveGoals}
    onClose={() => setShowSettings(false)}
    onDataChange={loadEntries}
  />
)}
```

**Step 5: Commit**

```bash
git add src/components/Settings.jsx src/utils/db.js src/components/App.jsx src/styles.css
git commit -m "feat: add data export/import functionality"
```

---

## Task 14: GitHub Pages Deployment Configuration

**Files:**
- Create: `.github/workflows/deploy.yml`
- Verify: `vite.config.js` base path

**Step 1: Create GitHub Actions workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Step 2: Update package.json with homepage**

Add to `package.json` after version:

```json
"homepage": "https://YOUR_USERNAME.github.io/calorie-tracker",
```

**Step 3: Commit**

```bash
mkdir -p .github/workflows
git add .github/workflows/deploy.yml package.json
git commit -m "feat: add GitHub Pages deployment workflow"
```

---

## Task 15: Final Testing & Polish

**Step 1: Test all features manually**

- [ ] Add new entry
- [ ] Edit existing entry
- [ ] Delete entry with confirmation
- [ ] Navigate between dates
- [ ] View progress bars update
- [ ] Change daily goals
- [ ] Export data
- [ ] Import data
- [ ] Responsive on mobile

**Step 2: Run production build**

Run: `npm run build`
Expected: Build completes without errors

Run: `npm run preview`
Expected: Production build works correctly

**Step 3: Final commit**

```bash
git add .
git commit -m "chore: final testing and polish"
```

**Step 4: Push to GitHub**

```bash
git push origin main
```

Expected: GitHub Actions workflow triggers and deploys to GitHub Pages

---

## Summary

**Total Tasks:** 15
**Estimated Commits:** 15

**Key Files Created:**
- `package.json`, `vite.config.js`, `index.html`
- `src/index.jsx`, `src/styles.css`
- `src/utils/db.js`, `src/utils/storage.js`, `src/utils/date.js`
- `src/components/App.jsx`, `Header.jsx`, `DailyProgress.jsx`
- `src/components/EntryList.jsx`, `EntryForm.jsx`, `Modal.jsx`
- `src/components/Settings.jsx`, `FAB.jsx`
- `.github/workflows/deploy.yml`

**Features Delivered:**
- Add/edit/delete food entries
- Track calories + protein/carbs/fat
- View entries by date with navigation
- Progress visualization toward goals
- Customizable daily goals
- Data export/import for backup
- Sage green calming design
- GitHub Pages deployment
