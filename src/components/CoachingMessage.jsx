import { useState } from 'preact/hooks'
import { pickRandom } from '../utils/date'

const MESSAGES = {
  morning: [
    'Start your day strong! Log your breakfast to keep your streak going.',
    'Good morning! Your consistency is building great habits.',
    'New day, fresh start. You\'ve got this!'
  ],
  evening: [
    'Great work today! Remember to log your evening meal.',
    'You\'re doing amazing. Finish strong today!',
    'Almost there! Complete today\'s tracking.'
  ],
  night: [
    'Rest well knowing you stayed on track today.',
    'Consistency is key. You showed up today!',
    'Tomorrow is another opportunity to keep building.'
  ]
}

export function CoachingMessage({ progress, profileName }) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || (progress >= 0.5 && progress <= 1.1)) return null

  const hour = new Date().getHours()
  let period = 'evening'
  if (hour >= 5 && hour < 12) period = 'morning'
  if (hour >= 20 || hour < 5) period = 'night'

  const message = pickRandom(MESSAGES[period]).replace('{name}', profileName || 'there')

  return (
    <div style="background: var(--color-sage-faint); padding: var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-4); position: relative">
      <button
        onClick={() => setDismissed(true)}
        style="position: absolute; top: var(--space-2); right: var(--space-2); background: none; border: none; cursor: pointer; color: var(--color-muted); font-size: 1.25rem"
        aria-label="Dismiss"
      >
        ×
      </button>
      <div style="font-size: 0.875rem; color: var(--color-warm-gray); line-height: 1.5">
        {message}
      </div>
    </div>
  )
}
