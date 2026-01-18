# Calorie Tracker

Local-first calorie/macro tracking app. Browser storage only (IndexedDB + localStorage).

## Tech Stack

- **Framework:** Preact + Vite
- **Storage:** IndexedDB (entries), localStorage (goals, profiles)
- **Styling:** CSS custom properties (Ocean Coral theme)
- **Deploy:** GitHub Pages via `.github/workflows/deploy.yml`

## Project Structure

```
src/
  components/     # Preact components (App, Header, EntryForm, etc.)
  utils/
    db.js         # IndexedDB operations
    storage.js    # localStorage (goals, profiles)
    date.js       # Date helpers
```

## Run Commands

```bash
npm run dev      # localhost:5173
npm run build    # Production build
```

## Key Implementation Notes

- **IndexedDB v2** has composite index `profileDate` for profile+date queries
- **Profiles** optional - works in single-user mode without them
- **Migration** auto-prompts existing users to create profile and migrates data
- **PIN** is basic privacy only (localStorage, not cryptographically secure)

## Current State

MVP complete: entries, goals, date navigation, profiles, import/export. Mobile-first (max-width 480px).
