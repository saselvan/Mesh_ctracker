export function generateInsights(trends, streakData, goals) {
  const insights = []

  // Low protein pattern
  if (trends.avgProtein < goals.protein * 0.7) {
    insights.push({
      id: 'low-protein',
      type: 'warning',
      priority: 2,
      message: `Your protein is averaging ${trends.avgProtein}g, below your ${goals.protein}g goal. Try adding eggs or Greek yogurt.`,
      actionable: true
    })
  }

  // Streak celebration
  if (streakData.current >= 7) {
    insights.push({
      id: 'streak-week',
      type: 'success',
      priority: 1,
      message: `Amazing! You're on a ${streakData.current}-day streak!`,
      actionable: false
    })
  }

  // High success rate
  if (trends.successRate >= 80) {
    insights.push({
      id: 'high-success',
      type: 'success',
      priority: 2,
      message: `${trends.successRate}% success rate this week - you're crushing it!`,
      actionable: false
    })
  }

  // Low success rate
  if (trends.successRate < 50 && trends.daysLogged >= 3) {
    insights.push({
      id: 'low-success',
      type: 'warning',
      priority: 1,
      message: `Only ${trends.successRate}% on target this week. Consider adjusting your calorie goal.`,
      actionable: true
    })
  }

  // Trending up (overeating)
  if (trends.trend === 'up' && trends.avgCalories > goals.calories) {
    insights.push({
      id: 'trending-up',
      type: 'warning',
      priority: 2,
      message: `Calorie intake trending upward. Watch portion sizes.`,
      actionable: true
    })
  }

  // Trending down (under-eating)
  if (trends.trend === 'down' && trends.avgCalories < goals.calories * 0.8) {
    insights.push({
      id: 'trending-down',
      type: 'warning',
      priority: 2,
      message: `You're eating less each day. Make sure you're fueling properly.`,
      actionable: true
    })
  }

  // Not logging
  if (trends.daysLogged < 3) {
    insights.push({
      id: 'log-more',
      type: 'info',
      priority: 3,
      message: `Log more days this week for better insights.`,
      actionable: true
    })
  }

  // Sort by priority and return top 3
  return insights
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3)
}
