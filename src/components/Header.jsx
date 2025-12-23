import { formatDisplayDate, addDays, getToday } from '../utils/date'

export function Header({
  currentDate = getToday(),
  onDateChange = () => {},
  onSettingsClick = () => {},
  onCalendarClick = () => {},
  profileName = null,
  onProfileClick = () => {}
}) {
  const isToday = currentDate === getToday()

  const goBack = () => onDateChange(addDays(currentDate, -1))
  const goForward = () => onDateChange(addDays(currentDate, 1))

  return (
    <header class="header">
      <div class="header-top">
        <h1 class="header-title">Calorie Tracker</h1>
        <div class="header-profile">
          {profileName && (
            <>
              <span class="header-profile-name">{profileName}</span>
              <button class="btn-lock" onClick={onProfileClick} aria-label="Switch profile">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0110 0v4"></path>
                </svg>
              </button>
            </>
          )}
          <button class="btn-icon" onClick={onSettingsClick} aria-label="Settings">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
            </svg>
          </button>
        </div>
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
