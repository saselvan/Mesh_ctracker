export async function requestPermission() {
  if (!('Notification' in window)) {
    return 'unsupported'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  if (Notification.permission === 'denied') {
    return 'denied'
  }

  const permission = await Notification.requestPermission()
  return permission
}

export function scheduleReminder(title, body, time) {
  if (Notification.permission !== 'granted') {
    return false
  }

  const now = new Date()
  const [hours, minutes] = time.split(':')
  const scheduledTime = new Date(now)
  scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1)
  }

  const delay = scheduledTime - now

  setTimeout(() => {
    new Notification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png'
    })
  }, delay)

  return true
}

export function getNotificationSettings(profileId) {
  const key = profileId ? `notifications-${profileId}` : 'notifications'
  const stored = localStorage.getItem(key)
  return stored ? JSON.parse(stored) : {
    enabled: false,
    times: ['08:00', '12:00', '18:00']
  }
}

export function saveNotificationSettings(profileId, settings) {
  const key = profileId ? `notifications-${profileId}` : 'notifications'
  localStorage.setItem(key, JSON.stringify(settings))
}
