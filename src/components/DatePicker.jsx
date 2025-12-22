import { useState, useEffect } from 'preact/hooks'
import { formatDate, getToday } from '../utils/date'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December']

export function DatePicker({ currentDate, onSelect, onClose }) {
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date(currentDate + 'T00:00:00')
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const today = getToday()
  const todayDate = new Date(today + 'T00:00:00')

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

  const daysInMonth = getDaysInMonth(viewDate.year, viewDate.month)
  const firstDay = getFirstDayOfMonth(viewDate.year, viewDate.month)

  const prevMonth = () => {
    setViewDate(v => {
      if (v.month === 0) return { year: v.year - 1, month: 11 }
      return { ...v, month: v.month - 1 }
    })
  }

  const nextMonth = () => {
    const now = new Date()
    const nextDate = new Date(viewDate.year, viewDate.month + 1, 1)
    if (nextDate > now) return
    setViewDate(v => {
      if (v.month === 11) return { year: v.year + 1, month: 0 }
      return { ...v, month: v.month + 1 }
    })
  }

  const selectDate = (day) => {
    const selected = new Date(viewDate.year, viewDate.month, day)
    if (selected > todayDate) return
    onSelect(formatDate(selected))
    onClose()
  }

  const goToToday = () => {
    onSelect(today)
    onClose()
  }

  const isCurrentMonth = viewDate.year === todayDate.getFullYear() &&
                         viewDate.month === todayDate.getMonth()

  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} class="calendar-day calendar-day--empty" />)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(new Date(viewDate.year, viewDate.month, day))
    const isToday = dateStr === today
    const isSelected = dateStr === currentDate
    const isFuture = new Date(viewDate.year, viewDate.month, day) > todayDate

    days.push(
      <button
        key={day}
        class={`calendar-day ${isToday ? 'calendar-day--today' : ''} ${isSelected ? 'calendar-day--selected' : ''} ${isFuture ? 'calendar-day--disabled' : ''}`}
        onClick={() => selectDate(day)}
        disabled={isFuture}
      >
        {day}
      </button>
    )
  }

  return (
    <div class="modal-overlay" onClick={onClose}>
      <div class="calendar-modal" onClick={e => e.stopPropagation()}>
        <div class="calendar-header">
          <button class="btn-icon" onClick={prevMonth} aria-label="Previous month">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"></path>
            </svg>
          </button>
          <span class="calendar-title">{MONTHS[viewDate.month]} {viewDate.year}</span>
          <button
            class="btn-icon"
            onClick={nextMonth}
            disabled={isCurrentMonth}
            aria-label="Next month"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"></path>
            </svg>
          </button>
        </div>
        <div class="calendar-weekdays">
          {DAYS.map(day => <div key={day} class="calendar-weekday">{day}</div>)}
        </div>
        <div class="calendar-days">
          {days}
        </div>
        <button class="btn btn--secondary calendar-today-btn" onClick={goToToday}>
          Go to Today
        </button>
      </div>
    </div>
  )
}
