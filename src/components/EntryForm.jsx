import { useState, useEffect } from 'preact/hooks'
import { MEAL_TYPES, getSuggestedMealType } from '../utils/meals'
import { getRecentFoods } from '../utils/db'
import { FavoritesPicker } from './FavoritesPicker'

export function EntryForm({ entry = null, onSave = () => {}, onCancel = () => {}, profileId = null }) {
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [mealType, setMealType] = useState(getSuggestedMealType())
  const [recentFoods, setRecentFoods] = useState([])
  const [showFavorites, setShowFavorites] = useState(false)

  const isEditing = !!entry

  useEffect(() => {
    if (entry) {
      setName(entry.name || '')
      setCalories(entry.calories?.toString() || '')
      setProtein(entry.protein?.toString() || '')
      setCarbs(entry.carbs?.toString() || '')
      setFat(entry.fat?.toString() || '')
      setMealType(entry.mealType || getSuggestedMealType())
    } else {
      setName('')
      setCalories('')
      setProtein('')
      setCarbs('')
      setFat('')
      setMealType(getSuggestedMealType())
    }
  }, [entry])

  useEffect(() => {
    getRecentFoods(profileId).then(setRecentFoods)
  }, [profileId])

  const populateForm = (food) => {
    setName(food.name)
    setCalories(food.calories?.toString() || '')
    setProtein(food.protein?.toString() || '')
    setCarbs(food.carbs?.toString() || '')
    setFat(food.fat?.toString() || '')
    if (food.mealType) {
      setMealType(food.mealType)
    }
  }

  const handleFavoriteSelect = (favorite) => {
    populateForm(favorite)
    setShowFavorites(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || calories === '') return

    onSave({
      ...(entry || {}),
      name: name.trim(),
      calories: parseInt(calories) || 0,
      protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0,
      fat: parseInt(fat) || 0,
      mealType
    })
  }

  return (
    <>
      {showFavorites && (
        <FavoritesPicker
          profileId={profileId}
          onSelect={handleFavoriteSelect}
          onClose={() => setShowFavorites(false)}
        />
      )}
      <div class="form-overlay" onClick={onCancel}>
        <form class="entry-form" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
          <h2 class="form-title">{isEditing ? 'Edit Entry' : 'Add Entry'}</h2>

          <div class="meal-selector">
            {MEAL_TYPES.map(meal => (
              <button
                key={meal.id}
                type="button"
                class={`meal-btn ${mealType === meal.id ? 'active' : ''}`}
                onClick={() => setMealType(meal.id)}
              >
                <span>{meal.icon}</span>
                <span>{meal.label}</span>
              </button>
            ))}
          </div>

          {!isEditing && (
            <>
              {recentFoods.length > 0 && (
                <div class="recent-foods">
                  <label class="recent-label">Recently logged:</label>
                  <div class="recent-chips">
                    {recentFoods.map((food, idx) => (
                      <button
                        key={idx}
                        type="button"
                        class="recent-chip"
                        onClick={() => populateForm(food)}
                      >
                        {food.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div class="favorites-section">
                <button
                  type="button"
                  class="btn-favorites"
                  onClick={() => setShowFavorites(true)}
                >
                  ⭐ Favorites
                </button>
              </div>
            </>
          )}

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
            step="1"
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
              step="1"
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
              step="1"
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
              step="1"
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
    </>
  )
}
