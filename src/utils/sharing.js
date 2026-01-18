export async function generateShareImage(streakData, profile) {
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 600
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#FDF6F0'
  ctx.fillRect(0, 0, 800, 600)

  // Decorative dots (Kusama-inspired)
  const dotColors = ['#8B9D82', '#C87864', '#E8DFD8']
  for (let i = 0; i < 30; i++) {
    ctx.beginPath()
    ctx.fillStyle = dotColors[i % 3]
    ctx.arc(
      Math.random() * 800,
      Math.random() * 600,
      Math.random() * 20 + 5,
      0,
      Math.PI * 2
    )
    ctx.globalAlpha = 0.3
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Main content
  ctx.fillStyle = '#3D3D3D'
  ctx.font = 'bold 120px system-ui'
  ctx.textAlign = 'center'
  ctx.fillText(`${streakData.current}`, 400, 280)

  ctx.font = '32px system-ui'
  ctx.fillText('day streak!', 400, 340)

  if (profile?.name) {
    ctx.font = '24px system-ui'
    ctx.fillStyle = '#666'
    ctx.fillText(`${profile.name}'s progress`, 400, 400)
  }

  // Milestone badge if applicable
  const milestones = [3, 7, 14, 30, 50, 100, 365]
  const currentMilestone = milestones.filter(m => streakData.current >= m).pop()
  if (currentMilestone) {
    ctx.fillStyle = '#8B9D82'
    ctx.font = '20px system-ui'
    ctx.fillText(`🏆 ${currentMilestone}-day milestone`, 400, 450)
  }

  // Footer
  ctx.fillStyle = '#999'
  ctx.font = '16px system-ui'
  ctx.fillText('Calorie Tracker', 400, 550)

  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), 'image/png')
  })
}

export async function shareAchievement(streakData, profile) {
  const text = `I'm on a ${streakData.current}-day streak with Calorie Tracker! 🎯`

  if (navigator.share) {
    try {
      const blob = await generateShareImage(streakData, profile)
      const file = new File([blob], 'streak.png', { type: 'image/png' })

      await navigator.share({
        text,
        files: [file]
      })
      return true
    } catch (e) {
      // Fall back to clipboard
    }
  }

  // Clipboard fallback
  await navigator.clipboard.writeText(text)
  return 'clipboard'
}

export async function copyToClipboard(text) {
  await navigator.clipboard.writeText(text)
}
