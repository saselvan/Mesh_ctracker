export async function generateShareImage(streakData, profile) {
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 600
  const ctx = canvas.getContext('2d')

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 600)
  gradient.addColorStop(0, '#FAF7F2')
  gradient.addColorStop(1, '#E8EDE6')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 800, 600)

  // Decorative dots (Kusama-inspired)
  ctx.fillStyle = 'rgba(92, 107, 84, 0.1)'
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * 800
    const y = Math.random() * 600
    const r = Math.random() * 20 + 10
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // Streak number
  ctx.fillStyle = '#5C6B54'
  ctx.font = 'bold 120px Georgia'
  ctx.textAlign = 'center'
  ctx.fillText(streakData.current, 400, 280)

  // Text
  ctx.fillStyle = '#3D3D3D'
  ctx.font = '40px Georgia'
  ctx.fillText('DAY STREAK', 400, 340)

  if (profile) {
    ctx.font = '24px sans-serif'
    ctx.fillStyle = '#6B6B6B'
    ctx.fillText(profile.name, 400, 450)
  }

  // Convert to blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}

export async function shareAchievement(streakData, profile) {
  const text = `${streakData.current} day streak! 🔥`

  if (navigator.share) {
    try {
      const blob = await generateShareImage(streakData, profile)
      const file = new File([blob], 'streak.png', { type: 'image/png' })
      await navigator.share({
        text,
        files: [file]
      })
      return true
    } catch (err) {
      // Fallback to text only
      try {
        await navigator.share({ text })
        return true
      } catch {
        return await copyToClipboard(text)
      }
    }
  } else {
    return await copyToClipboard(text)
  }
}
