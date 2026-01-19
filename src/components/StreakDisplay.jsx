import { useState } from 'preact/hooks'
import { getStreakData } from '../utils/streaks'
import { formatDate } from '../utils/date'

/**
 * StreakDisplay - Collapsed by default, expandable for details
 *
 * Behavioral design: Motivation widgets are secondary to the core loop.
 * Show just enough to reinforce habit (streak count) without taking space
 * from the primary action (logging meals).
 */
export function StreakDisplay({ profileId, profile, onDateClick }) {
  const [expanded, setExpanded] = useState(false)
  const streakData = getStreakData(profileId)

  // Generate last 14 days (2 weeks) for expanded view
  const days = []
  const today = new Date()
  const todayStr = formatDate(today)

  for (let i = 13; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = formatDate(date)
    const historyEntry = streakData.history?.find(h => h.date === dateStr)

    let status = 'missed'
    if (historyEntry?.success) {
      status = 'success'
    } else if (dateStr === todayStr) {
      status = 'pending'
    }

    days.push({
      date: dateStr,
      status,
      isToday: dateStr === todayStr
    })
  }

  const currentStreak = streakData.current || 0

  return (
    <div class="streak-display streak-display--collapsible">
      {/* Collapsed view - always visible */}
      <button
        class="streak-collapsed"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-label={`${currentStreak} day streak. Click to ${expanded ? 'collapse' : 'view details'}`}
      >
        <span class="streak-collapsed-content">
          <span class="streak-fire">🔥</span>
          <span class="streak-count">{currentStreak} day streak</span>
        </span>
        <span class={`streak-expand-arrow ${expanded ? 'streak-expand-arrow--up' : ''}`}>
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {/* Expanded view - calendar and details */}
      {expanded && (
        <div class="streak-expanded">
          <div class="streak-stats">
            <div class="streak-stat">
              <span class="streak-stat-number">{currentStreak}</span>
              <span class="streak-stat-label">current</span>
            </div>
            <div class="streak-stat">
              <span class="streak-stat-number">{streakData.longest || 0}</span>
              <span class="streak-stat-label">longest</span>
            </div>
            {streakData.weeklyGoal && (
              <div class="streak-stat">
                <span class="streak-stat-number">{streakData.weeklyProgress || 0}/{streakData.weeklyGoal}</span>
                <span class="streak-stat-label">this week</span>
              </div>
            )}
          </div>

          <div class="streak-calendar">
            <div class="calendar-day-labels">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <span key={i} class="day-label">{day}</span>
              ))}
            </div>
            <div class="calendar-dots">
              {days.map(day => (
                <button
                  key={day.date}
                  class={`streak-dot streak-${day.status} ${day.isToday ? 'streak-today' : ''}`}
                  onClick={() => onDateClick?.(day.date)}
                  aria-label={`${day.date}: ${day.status}`}
                />
              ))}
            </div>
          </div>

          {(streakData.milestones || []).length > 0 && (
            <div class="milestone-badges">
              {(streakData.milestones || []).map(m => (
                <span key={m} class="milestone-badge">🏆 {m}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
