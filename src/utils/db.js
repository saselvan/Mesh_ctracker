const DB_NAME = 'calorie-tracker'
const DB_VERSION = 2
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
      let store

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('date', 'date', { unique: false })
      } else {
        store = event.target.transaction.objectStore(STORE_NAME)
      }

      if (event.oldVersion < 2) {
        if (!store.indexNames.contains('profileDate')) {
          store.createIndex('profileDate', ['profileId', 'date'], { unique: false })
        }
      }
    }
  })

  return dbPromise
}

export async function addEntry(entry) {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
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

export async function getEntriesByDateAndProfile(date, profileId = null) {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)

  if (!profileId) {
    const index = store.index('date')
    const request = index.getAll(date)
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const entries = request.result.filter(e => !e.profileId)
        resolve(entries)
      }
      request.onerror = () => reject(request.error)
    })
  }

  const index = store.index('profileDate')
  const request = index.getAll([profileId, date])
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function addProfileIdToAllEntries(profileId) {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  const request = store.getAll()

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
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
