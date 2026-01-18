import { useState } from 'preact/hooks'
import { getTemplates, saveTemplates } from '../utils/storage'

export function TemplateManager({ profileId, onSelect, onClose }) {
  const [templates, setTemplates] = useState(getTemplates(profileId))

  const handleDelete = (id) => {
    const updated = templates.filter(t => t.id !== id)
    saveTemplates(updated, profileId)
    setTemplates(updated)
  }

  return (
    <div class="template-manager-overlay" onClick={onClose}>
      <div class="template-manager" onClick={e => e.stopPropagation()}>
        <div class="template-header">
          <h3>Meal Templates</h3>
          <button class="close-btn" onClick={onClose} aria-label="Close">×</button>
        </div>
        {templates.length === 0 ? (
          <p class="template-empty">No templates yet. Create one from multiple entries.</p>
        ) : (
          <ul class="template-list">
            {templates.map(t => (
              <li key={t.id}>
                <button class="template-item" onClick={() => onSelect(t)}>
                  <strong>{t.name}</strong>
                  <span>{t.entries.length} items</span>
                </button>
                <button class="template-delete" onClick={(e) => { e.stopPropagation(); handleDelete(t.id) }} aria-label={`Delete ${t.name}`}>
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
