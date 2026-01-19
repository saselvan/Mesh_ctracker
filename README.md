# Calorie Tracker

A local-first calorie and macro tracking progressive web app. All data stays in your browser — no accounts, no servers, no subscriptions.

## Features

- **Calorie & Macro Tracking** — Log calories, protein, carbs, and fat
- **Daily Goals** — Set custom targets and track progress
- **Streak Tracking** — Build consistency with streak counts and history
- **Multi-Profile Support** — Multiple users on one device with optional PIN protection
- **Offline-First** — Works without internet; data stored in IndexedDB
- **PWA** — Installable on mobile and desktop
- **Import/Export** — JSON backup and restore

## Tech Stack

- [Preact](https://preactjs.com/) — 3KB React alternative
- [Vite](https://vitejs.dev/) — Build tool
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) — Service worker and manifest
- IndexedDB — Entry storage
- localStorage — Settings and profile data

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/yourusername/calorie-tracker.git
cd calorie-tracker
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Build

```bash
npm run build
```

Output in `dist/`

### Deploy to GitHub Pages

```bash
npm run deploy
```

## Project Structure

```
src/
├── components/       # Preact components
│   ├── App.jsx          # Main app shell
│   ├── EntryForm.jsx    # Meal entry form
│   ├── DailyProgress.jsx # Progress ring and macro bars
│   ├── StreakDisplay.jsx # Streak counter and calendar
│   └── ...
├── utils/
│   ├── db.js            # IndexedDB operations
│   ├── storage.js       # localStorage (goals, profiles)
│   ├── date.js          # Date formatting helpers
│   ├── streaks.js       # Streak calculation logic
│   └── theme.js         # Time-based theme switching
└── styles.css           # All styles
```

## Data Storage

| Data | Storage | Key |
|------|---------|-----|
| Entries | IndexedDB | `calorie-tracker-db` |
| Goals | localStorage | `goals-{profileId}` |
| Profiles | localStorage | `profiles` |
| Streaks | localStorage | `streak-{profileId}` |

### IndexedDB Schema

**entries** store:
- `id` — Auto-incremented primary key
- `name` — Meal name
- `calories` — Number
- `protein`, `carbs`, `fat` — Optional numbers
- `date` — ISO date string (YYYY-MM-DD)
- `profileId` — Profile identifier

Indexes: `date`, `profileId`, `profileDate` (composite)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run deploy` | Build and deploy to GitHub Pages |
| `npm run test:e2e` | Run Playwright tests |
| `npm run test:e2e:ui` | Run tests with UI |

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+

Requires IndexedDB and CSS custom properties.

## License

MIT
