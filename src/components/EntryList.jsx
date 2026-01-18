import { MEAL_TYPES } from '../utils/meals'
import { getFavorites, saveFavorites } from '../utils/storage'

export function EntryList({ entries = [], onEdit = () => {}, onDelete = () => {}, profileId = null, onShowTemplates = () => {} }) {
  const handleAddToFavorites = (entry) => {
    const favorites = getFavorites(profileId)
    const newFav = {
      id: Date.now(),
      name: entry.name,
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat,
      mealType: entry.mealType
    }
    saveFavorites([newFav, ...favorites], profileId)
  }

  if (entries.length === 0) {
    return (
      <div class="entry-list-empty">
        <p>No entries yet</p>
        <p class="entry-list-empty-hint">Tap + to add your first meal</p>
        <button class="btn-templates" onClick={onShowTemplates}>
          Use a Template
        </button>
      </div>
    )
  }

  const grouped = MEAL_TYPES.reduce((acc, meal) => {
    acc[meal.id] = entries.filter(e => (e.mealType || 'snack') === meal.id)
    return acc
  }, {})

  return (
    <div class="entry-list">
      {MEAL_TYPES.map(meal => {
        const mealEntries = grouped[meal.id]
        if (mealEntries.length === 0) return null

        const subtotal = mealEntries.reduce((sum, e) => sum + e.calories, 0)

        return (
          <div key={meal.id} class="meal-group">
            <h3 class="meal-group-header">
              {meal.icon} {meal.label} <span class="meal-subtotal">{subtotal} cal</span>
            </h3>
            {mealEntries.map(entry => (
              <div key={entry.id} class="entry-card">
                <div class="entry-main" onClick={() => onEdit(entry)}>
                  <span class="entry-name">{entry.name}</span>
                  <span class="entry-calories">{entry.calories} cal</span>
                </div>
                <div class="entry-macros">
                  <span class="entry-macro entry-macro--protein">{entry.protein}g</span>
                  <span class="entry-macro entry-macro--carbs">{entry.carbs}g</span>
                  <span class="entry-macro entry-macro--fat">{entry.fat}g</span>
                </div>
                <div class="entry-actions">
                  <button
                    class="btn-star"
                    onClick={(e) => { e.stopPropagation(); handleAddToFavorites(entry); }}
                    aria-label={`Add ${entry.name} to favorites`}
                  >
                    ⭐
                  </button>
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
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
