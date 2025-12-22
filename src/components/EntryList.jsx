export function EntryList({ entries = [], onEdit = () => {}, onDelete = () => {} }) {
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
