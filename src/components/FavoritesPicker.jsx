import { getFavorites } from '../utils/storage'

export function FavoritesPicker({ profileId, onSelect, onClose }) {
  const favorites = getFavorites(profileId)

  return (
    <div class="favorites-picker-overlay" onClick={onClose}>
      <div class="favorites-picker" onClick={e => e.stopPropagation()}>
        <div class="favorites-header">
          <h3>Favorites</h3>
          <button class="close-btn" onClick={onClose} aria-label="Close">×</button>
        </div>
        {favorites.length === 0 ? (
          <p class="favorites-empty">No favorites yet. Star an entry to add it.</p>
        ) : (
          <ul class="favorites-list">
            {favorites.map(fav => (
              <li key={fav.id}>
                <button class="favorite-item" onClick={() => onSelect(fav)}>
                  <strong>{fav.name}</strong>
                  <span>{fav.calories} cal</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
