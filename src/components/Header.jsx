import { formatDisplayDate, addDays, getToday } from '../utils/date'

export function Header({
  currentDate = getToday(),
  onDateChange = () => {},
  onSettingsClick = () => {},
  onCalendarClick = () => {}
}) {
  const isToday = currentDate === getToday()

  const goBack = () => onDateChange(addDays(currentDate, -1))
  const goForward = () => onDateChange(addDays(currentDate, 1))

  return (
    <header class="header">
      <div class="header-top">
        <h1 class="header-title">Calorie Tracker</h1>
        <button class="btn-icon" onClick={onSettingsClick} aria-label="Settings">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
          </svg>
        </button>
      </div>
      <div class="date-nav">
        <button class="btn-icon" onClick={goBack} aria-label="Previous day">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"></path>
          </svg>
        </button>
        <button class="date-display" onClick={onCalendarClick}>
          {formatDisplayDate(currentDate)}
        </button>
        <button
          class="btn-icon"
          onClick={goForward}
          disabled={isToday}
          aria-label="Next day"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"></path>
          </svg>
        </button>
      </div>
    </header>
  )
}
