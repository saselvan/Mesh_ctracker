import { useState, useEffect } from 'preact/hooks'

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div style="position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: var(--color-white); padding: var(--space-4); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); z-index: 50; max-width: 320px">
      <div style="font-size: 0.875rem; color: var(--color-espresso); margin-bottom: var(--space-3)">
        Install this app for quick access and offline use
      </div>
      <div style="display: flex; gap: var(--space-2)">
        <button class="btn btn--primary btn--sm" onClick={handleInstall}>
          Install
        </button>
        <button class="btn btn--secondary btn--sm" onClick={() => setShowPrompt(false)}>
          Not now
        </button>
      </div>
    </div>
  )
}
