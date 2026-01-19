/**
 * QuickAddButton - Primary CTA for logging meals
 *
 * Behavioral design: This is the most frequent action (3-6x daily)
 * so it gets the most prominent position and largest touch target.
 */
export function QuickAddButton({ onClick }) {
  return (
    <button class="quick-add-btn" onClick={onClick} aria-label="Log a meal">
      <span class="quick-add-icon">🍽️</span>
      <span class="quick-add-text">Log Meal</span>
    </button>
  )
}
