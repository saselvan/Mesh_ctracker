import { useState } from 'preact/hooks'
import { getTimeOfDay } from '../utils/theme'

const messages = {
  morning: {
    low: [
      "Good morning! Let's make today count.",
      "Fresh day, fresh start. You've got this!",
      "Rise and shine! Every meal is a choice."
    ],
    high: [
      "Great start! Keep the momentum going.",
      "You're already ahead today. Stay mindful.",
    ]
  },
  evening: {
    low: [
      "Evening check-in: How are you feeling about today?",
      "Still time to log what you've had.",
    ],
    high: [
      "Winding down strong! Great job today.",
      "You made good choices. Rest well.",
    ]
  },
  night: {
    low: [
      "Tomorrow is a new day. Don't stress.",
      "Rest up - you'll get back on track.",
    ],
    high: [
      "Another successful day in the books!",
      "Sleep well, champion.",
    ]
  }
}

export function CoachingMessage({ progress, profileName }) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || !(progress < 0.5 || progress > 1.1)) return null

  const timeOfDay = getTimeOfDay()
  const period = timeOfDay === 'midday' ? 'morning' : timeOfDay
  const level = progress < 0.5 ? 'low' : 'high'

  const periodMessages = messages[period]?.[level] || messages.morning.low
  const dateHash = new Date().toDateString().split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  const message = periodMessages[dateHash % periodMessages.length]

  const displayMessage = message.replace('{name}', profileName || 'friend')

  return (
    <div class="coaching-message">
      <p>{displayMessage}</p>
      <button
        class="coaching-dismiss"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
