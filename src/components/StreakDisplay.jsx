import { getStreakData } from '../utils/streaks'
import { shareAchievement } from '../utils/sharing'

export function StreakDisplay({ profileId, profile }) {
  const streakData = getStreakData(profileId)

  async function handleShare() {
    await shareAchievement(streakData, profile)
  }

  return (
    <div class="progress-card" style="margin-bottom: var(--space-6)">
      <div style="text-align: center">
        <div style="font-family: var(--font-display); font-size: 3rem; font-weight: 700; color: var(--color-sage)">
          {streakData.current}
        </div>
        <div style="font-size: 0.875rem; color: var(--color-muted); margin-bottom: var(--space-3)">
          Day Streak
        </div>
        <div style="font-size: 0.75rem; color: var(--color-warm-gray)">
          Best: {streakData.longest} days
        </div>
        {streakData.current > 0 && (
          <button
            class="btn btn--secondary"
            style="margin-top: var(--space-4); font-size: 0.875rem"
            onClick={handleShare}
          >
            Share Achievement
          </button>
        )}
      </div>
    </div>
  )
}
