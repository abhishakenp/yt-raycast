function initLaunchBackdrop() {
  const root = document.querySelector<HTMLElement>('.global-launch-backdrop')
  const canvas = root?.querySelector<HTMLCanvasElement>('.global-launch-backdrop__canvas')
  if (!root || !canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) return

  const particles: Array<{
    x: number
    y: number
    life: number
    speed: number
    size: number
    seed: number
    hue: number
    alpha: number
  }> = []

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  let width = 0
  let height = 0
  let tick = 0

  function noise2d(x: number, y: number) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
    return n - Math.floor(n)
  }

  function smoothNoise(x: number, y: number) {
    const ix = Math.floor(x)
    const iy = Math.floor(y)
    const fx = x - ix
    const fy = y - iy
    const a = noise2d(ix, iy)
    const b = noise2d(ix + 1, iy)
    const c = noise2d(ix, iy + 1)
    const d = noise2d(ix + 1, iy + 1)
    const ux = fx * fx * (3 - 2 * fx)
    const uy = fy * fy * (3 - 2 * fy)
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy
  }

  function resetParticle(
    p: (typeof particles)[number],
    edge?: 'left',
  ) {
    p.x = edge === 'left' ? -12 : Math.random() * width
    p.y = Math.random() * height
    p.life = 0.45 + Math.random() * 0.55
    p.speed = 0.45 + Math.random() * 1.35
    p.size = 0.45 + Math.random() * 1.05
    p.seed = Math.random() * 200
    p.hue = Math.random() > 0.42 ? 190 : 310
    p.alpha = p.hue === 310 ? 0.45 + Math.random() * 0.35 : 0.08 + Math.random() * 0.18
  }

  function resize() {
    width = Math.max(1, window.innerWidth)
    height = Math.max(1, window.innerHeight)
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const target = Math.max(150, Math.min(260, Math.floor((width * height) / 9000)))
    while (particles.length < target) {
      const p = { x: 0, y: 0, life: 0, speed: 0, size: 0, seed: 0, hue: 0, alpha: 0 }
      resetParticle(p)
      particles.push(p)
    }
    particles.length = target
  }

  function draw() {
    if (!document.body.contains(canvas)) return
    window.requestAnimationFrame(draw)
    tick += 1

    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = 'rgba(2, 4, 18, 0.065)'
    ctx.fillRect(0, 0, width, height)
    ctx.globalCompositeOperation = 'lighter'

    for (const p of particles) {
      const px = p.x
      const py = p.y
      const n = smoothNoise(p.x * 0.0036 + tick * 0.0007, p.y * 0.0036 + p.seed)
      const drift = smoothNoise(p.x * 0.0022, p.y * 0.0022 + 50)
      const angle = n * Math.PI * 5.4 - Math.PI * 0.22
      const speed = p.speed * (0.75 + drift * 1.45)

      p.x += Math.cos(angle) * speed + 0.34
      p.y += Math.sin(angle) * speed * 0.82
      p.life -= 0.0011

      if (p.life <= 0 || p.x < -40 || p.x > width + 40 || p.y < -40 || p.y > height + 40) {
        resetParticle(p, Math.random() > 0.35 ? 'left' : undefined)
        continue
      }

      const pulse = 0.65 + Math.sin(tick * 0.035 + p.seed) * 0.35
      const alpha = Math.max(0, p.life) * p.alpha * pulse
      ctx.beginPath()
      ctx.moveTo(px, py)
      ctx.lineTo(p.x, p.y)
      ctx.strokeStyle = `hsla(${p.hue}, 100%, ${p.hue === 310 ? 80 : 62}%, ${alpha})`
      ctx.lineWidth = p.size
      ctx.stroke()
    }

    ctx.globalAlpha = 1
  }

  resize()
  window.addEventListener('resize', resize, { passive: true })
  draw()
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLaunchBackdrop, { once: true })
  } else {
    initLaunchBackdrop()
  }
}
