export const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', icon: '🌅', hours: [5, 10] },
  { id: 'lunch', label: 'Lunch', icon: '☀️', hours: [11, 14] },
  { id: 'dinner', label: 'Dinner', icon: '🌙', hours: [17, 21] },
  { id: 'snack', label: 'Snack', icon: '🍎', hours: null }
]

export function getSuggestedMealType() {
  const hour = new Date().getHours()

  for (const meal of MEAL_TYPES) {
    if (meal.hours && hour >= meal.hours[0] && hour <= meal.hours[1]) {
      return meal.id
    }
  }

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
