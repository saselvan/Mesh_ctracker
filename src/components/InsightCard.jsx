export function InsightCard({ insights }) {
  if (!insights || insights.length === 0) return null

  return (
    <div style="margin-bottom: var(--space-6)">
      {insights.map(insight => (
        <div
          key={insight.id}
          style={`
            background: ${insight.priority === 'critical' ? 'var(--color-terracotta-pale)' : 'var(--color-sage-faint)'};
            padding: var(--space-4);
            border-radius: var(--radius-md);
            margin-bottom: var(--space-3);
          `}
        >
          <div style="font-size: 0.875rem; color: var(--color-espresso); line-height: 1.5">
            {insight.message}
          </div>
        </div>
      ))}
    </div>
  )
}
