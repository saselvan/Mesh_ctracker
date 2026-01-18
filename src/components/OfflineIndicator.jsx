import { useState, useEffect } from 'preact/hooks'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div style="position: fixed; top: var(--space-4); left: 50%; transform: translateX(-50%); background: var(--color-warning); color: var(--color-white); padding: var(--space-2) var(--space-4); border-radius: var(--radius-full); font-size: 0.875rem; z-index: 1000; box-shadow: var(--shadow-md)">
      Offline Mode
    </div>
  )
}
