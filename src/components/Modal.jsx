import { useEffect } from 'preact/hooks'

export function Modal({
  title = 'Confirm',
  message = '',
  onConfirm = () => {},
  onCancel = () => {},
  confirmText = 'Delete',
  danger = false
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onCancel])

  return (
    <div class="modal-overlay" onClick={onCancel}>
      <div class="modal" onClick={e => e.stopPropagation()}>
        <h3 class="modal-title">{title}</h3>
        <p class="modal-message">{message}</p>
        <div class="modal-actions">
          <button class="btn btn--secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            class={`btn ${danger ? 'btn--danger' : 'btn--primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
