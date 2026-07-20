import { useEffect, useRef } from 'react'

const BACKDROP_START_DELAY_MS = 550
const BACKDROP_IDLE_TIMEOUT_MS = 1200
const BACKDROP_MAX_FPS = 20
const BACKDROP_FRAME_INTERVAL_MS = 1000 / BACKDROP_MAX_FPS
const BACKDROP_ACTIVE_DURATION_MS = 7500

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout?: number },
  ) => number
  cancelIdleCallback?: (handle: number) => void
}

function initLaunchBackdrop(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) return () => {}
  const context = ctx

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
  let raf = 0
  let startedAt = 0
  let lastFrameAt = 0
  let running = false

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

  function resetParticle(p: (typeof particles)[number], edge?: 'left') {
    p.x = edge === 'left' ? -12 : Math.random() * width
    p.y = Math.random() * height
    p.life = 0.45 + Math.random() * 0.55
    p.speed = 0.45 + Math.random() * 1.35
    p.size = 0.45 + Math.random() * 1.05
    p.seed = Math.random() * 200
    p.hue = Math.random() > 0.42 ? 190 : 310
    p.alpha =
      p.hue === 310 ? 0.45 + Math.random() * 0.35 : 0.08 + Math.random() * 0.18
  }

  function resize() {
    width = Math.max(1, window.innerWidth)
    height = Math.max(1, window.innerHeight)
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    context.setTransform(dpr, 0, 0, dpr, 0, 0)

    const target = Math.max(
      width < 760 ? 54 : 96,
      Math.min(width < 760 ? 120 : 210, Math.floor((width * height) / 12000)),
    )
    while (particles.length < target) {
      const p = {
        x: 0,
        y: 0,
        life: 0,
        speed: 0,
        size: 0,
        seed: 0,
        hue: 0,
        alpha: 0,
      }
      resetParticle(p)
      particles.push(p)
    }
    particles.length = target
  }

  function draw(now = performance.now()) {
    if (!running) return
    if (!document.body.contains(canvas)) {
      stop()
      return
    }
    if (now - startedAt >= BACKDROP_ACTIVE_DURATION_MS) {
      stop()
      return
    }
    raf = window.requestAnimationFrame(draw)
    if (now - lastFrameAt < BACKDROP_FRAME_INTERVAL_MS) return
    lastFrameAt = now
    tick += 1

    context.globalCompositeOperation = 'source-over'
    context.fillStyle = 'rgba(2, 4, 18, 0.065)'
    context.fillRect(0, 0, width, height)
    context.globalCompositeOperation = 'lighter'

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

      if (
        p.life <= 0 ||
        p.x < -40 ||
        p.x > width + 40 ||
        p.y < -40 ||
        p.y > height + 40
      ) {
        resetParticle(p, Math.random() > 0.35 ? 'left' : undefined)
        continue
      }

      const pulse = 0.65 + Math.sin(tick * 0.035 + p.seed) * 0.35
      const alpha = Math.max(0, p.life) * p.alpha * pulse
      context.beginPath()
      context.moveTo(px, py)
      context.lineTo(p.x, p.y)
      context.strokeStyle = `hsla(${p.hue}, 100%, ${p.hue === 310 ? 80 : 62}%, ${alpha})`
      context.lineWidth = p.size
      context.stroke()
    }

    context.globalAlpha = 1
  }

  function start() {
    if (running) return
    running = true
    startedAt = performance.now()
    lastFrameAt = 0
    draw()
  }

  function stop() {
    running = false
    cancelAnimationFrame(raf)
    raf = 0
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      stop()
      return
    }
    start()
  }

  resize()
  window.addEventListener('resize', resize, { passive: true })
  document.addEventListener('visibilitychange', handleVisibilityChange)
  start()

  return () => {
    window.removeEventListener('resize', resize)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    stop()
  }
}

export function LaunchBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const idleWindow = window as IdleWindow
    let cleanup: (() => void) | undefined
    let cancelled = false
    let idleHandle: number | undefined
    let idleHandleUsesIdleCallback = false

    const start = () => {
      if (cancelled || document.hidden) return
      cleanup = initLaunchBackdrop(canvas)
    }

    const delayHandle = window.setTimeout(() => {
      if (idleWindow.requestIdleCallback) {
        idleHandleUsesIdleCallback = true
        idleHandle = idleWindow.requestIdleCallback(start, {
          timeout: BACKDROP_IDLE_TIMEOUT_MS,
        })
        return
      }
      idleHandleUsesIdleCallback = false
      idleHandle = window.setTimeout(start, BACKDROP_IDLE_TIMEOUT_MS)
    }, BACKDROP_START_DELAY_MS)

    return () => {
      cancelled = true
      cleanup?.()
      window.clearTimeout(delayHandle)
      if (idleHandle === undefined) return
      if (idleHandleUsesIdleCallback && idleWindow.cancelIdleCallback) {
        idleWindow.cancelIdleCallback(idleHandle)
      } else {
        window.clearTimeout(idleHandle)
      }
    }
  }, [])

  return (
    <div
      className="fixed inset-0 w-screen h-screen max-w-screen max-h-screen z-0 pointer-events-none overflow-hidden isolate"
      aria-hidden="true"
      style={{
        background: `
        radial-gradient(circle at 70% 30%, rgba(28, 171, 255, 0.16), transparent 29rem),
        radial-gradient(circle at 88% 26%, rgba(255, 55, 221, 0.12), transparent 25rem),
        radial-gradient(circle at 36% 84%, rgba(45, 217, 255, 0.08), transparent 32rem),
        linear-gradient(135deg, #020413 0%, #050822 44%, #12051f 100%)
      `,
      }}
    >
      <div
        className="absolute inset-[-12%_-18%_-18%_-24%] z-0 pointer-events-none opacity-58 blur-[7px] saturate-[1.4]"
        style={{
          background: `
          radial-gradient(circle at 67% 39%, rgba(28, 206, 255, 0.18), transparent 30rem),
          radial-gradient(circle at 78% 28%, rgba(255, 55, 221, 0.12), transparent 24rem)
        `,
          animation: 'heroAuraOnly 5.5s ease-in-out 2 alternate forwards',
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-1 w-full h-full pointer-events-none opacity-82 mix-blend-screen saturate-[1.35] contrast-[1.05]"
      />
    </div>
  )
}
