export function generateInsights(trends, streakData, goals) {
  const insights = []

  // Streak insights
  if (streakData.current >= 7) {
    insights.push({
      id: 'long-streak',
      type: 'motivational',
      priority: 'high',
      message: `${streakData.current}-day streak! You're building incredible consistency.`,
      actionable: false
    })
  } else if (streakData.current === 0 && streakData.longest > 0) {
    insights.push({
      id: 'broken-streak',
      type: 'helpful',
      priority: 'high',
      message: `Your ${streakData.longest}-day streak can be rebuilt. Start fresh today!`,
      actionable: true
    })
  }

  // Success rate insights
  if (trends.successRate < 50 && trends.daysLogged >= 3) {
    insights.push({
      id: 'low-success',
      type: 'critical',
      priority: 'critical',
      message: 'You\'re hitting your goal less than half the time. Consider adjusting your targets.',
      actionable: true
    })
  } else if (trends.successRate >= 80 && trends.daysLogged >= 5) {
    insights.push({
      id: 'high-success',
      type: 'motivational',
      priority: 'medium',
      message: `${trends.successRate}% success rate this week! Outstanding consistency.`,
      actionable: false
    })
  }

  // Protein insights
  if (goals.protein > 0 && trends.avgProtein < goals.protein * 0.7) {
    insights.push({
      id: 'low-protein',
      type: 'helpful',
      priority: 'high',
      message: `You're averaging ${trends.avgProtein}g protein vs ${goals.protein}g goal. Consider adding protein-rich foods.`,
      actionable: true
    })
  }

  // Calorie trend insights
  if (trends.trend === 'up') {
    insights.push({
      id: 'calorie-up',
      type: 'helpful',
      priority: 'medium',
      message: `Your weekly average (${trends.avgCalories} cal) is above your goal. Track weekend eating patterns.`,
      actionable: true
    })
  } else if (trends.trend === 'down') {
    insights.push({
      id: 'calorie-down',
      type: 'helpful',
      priority: 'medium',
      message: `You're averaging ${trends.avgCalories} cal, below your ${goals.calories} goal. Make sure you're eating enough.`,
      actionable: true
    })
  }

  // Sort by priority
  const priorityOrder = { critical: 3, high: 2, medium: 1, low: 0 }
  insights.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])

  return insights.slice(0, 3)
}
