export const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { id: 'lunch', label: 'Lunch', icon: '☀️' },
  { id: 'dinner', label: 'Dinner', icon: '🌙' },
  { id: 'snack', label: 'Snack', icon: '🍎' }
]

export function getSuggestedMealType() {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 10) return 'breakfast'
  if (hour >= 11 && hour < 14) return 'lunch'
  if (hour >= 17 && hour < 21) return 'dinner'
  return 'snack'
}

export function getMealTypeLabel(mealType) {
  const meal = MEAL_TYPES.find(m => m.id === mealType)
  return meal ? meal.label : 'Snack'
}

export function getMealTypeIcon(mealType) {
  const meal = MEAL_TYPES.find(m => m.id === mealType)
  return meal ? meal.icon : '🍎'
}
