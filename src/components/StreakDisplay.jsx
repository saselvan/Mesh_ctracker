import { getStreakData } from '../utils/streaks'
import { formatDate } from '../utils/date'

export function StreakDisplay({ profileId, profile, onDateClick }) {
  const streakData = getStreakData(profileId)

  // Generate last 30 days
  const days = []
  const today = new Date()
  const todayStr = formatDate(today)

  for (let i = 29; i >= 0; i--) {
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

  return (
    <div class="streak-display">
      <div class="streak-stats">
        <div class="streak-current">
          <span class="streak-number">{streakData.current || 0}</span>
          <span class="streak-label">day streak</span>
        </div>
        <div class="streak-longest">
          <span class="streak-number">{streakData.longest || 0}</span>
          <span class="streak-label">longest</span>
        </div>
      </div>

      {streakData.weeklyGoal && (
        <div class="weekly-progress">
          <span class="weekly-count">{streakData.weeklyProgress || 0}/{streakData.weeklyGoal}</span>
          <span class="weekly-label">this week</span>
        </div>
      )}

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
  )
}
