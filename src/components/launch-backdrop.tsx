import { useEffect, useRef } from 'react'

import {
  LAUNCH_BACKDROP_PARTICLE_STRIDE,
  loadLaunchBackdropWasm,
  type LaunchBackdropWasmExports,
} from './launch-backdrop-wasm'

const BACKDROP_START_DELAY_MS = 550
const BACKDROP_IDLE_TIMEOUT_MS = 1200
const BACKDROP_CYAN_TRAIL = 'hsl(190 100% 62%)'
const BACKDROP_MAGENTA_TRAIL = 'hsl(310 100% 80%)'
const BACKDROP_CYAN_ROCKET = 'hsl(190 100% 74%)'
const BACKDROP_MAGENTA_ROCKET = 'hsl(310 100% 86%)'
const BACKDROP_ROCKET_CORE = 'hsl(198 100% 92%)'
const BACKDROP_ROCKET_FLAME = 'hsl(36 100% 68%)'
const BACKDROP_ROCKET_SPRITE_ANGLES = 32
const BACKDROP_ROCKET_SPRITE_SIZES = [2.4, 3.2, 4.1] as const

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout?: number },
  ) => number
  cancelIdleCallback?: (handle: number) => void
}

type RocketSprite = {
  canvas: HTMLCanvasElement
  offset: number
}

type RocketSpriteSet = {
  cyan: RocketSprite[][]
  magenta: RocketSprite[][]
}

const drawRocketSprite = (size: number, angle: number, bodyColor: string) => {
  const spriteSize = Math.ceil(size * 8)
  const center = spriteSize / 2
  const canvas = document.createElement('canvas')
  canvas.width = spriteSize
  canvas.height = spriteSize
  const spriteContext = canvas.getContext('2d', { alpha: true })
  if (!spriteContext) return { canvas, offset: center }

  spriteContext.translate(center, center)
  spriteContext.rotate(angle)
  spriteContext.lineCap = 'round'
  spriteContext.lineJoin = 'round'
  spriteContext.globalCompositeOperation = 'lighter'

  spriteContext.globalAlpha = 0.82
  spriteContext.strokeStyle = bodyColor
  spriteContext.lineWidth = Math.max(0.75, size * 0.45)
  spriteContext.beginPath()
  spriteContext.moveTo(-size * 1.65, 0)
  spriteContext.lineTo(size * 0.65, 0)
  spriteContext.stroke()

  spriteContext.globalAlpha = 0.95
  spriteContext.strokeStyle = BACKDROP_ROCKET_CORE
  spriteContext.lineWidth = Math.max(0.5, size * 0.16)
  spriteContext.beginPath()
  spriteContext.moveTo(-size * 1.65, 0)
  spriteContext.lineTo(size * 0.65, 0)
  spriteContext.stroke()

  spriteContext.globalAlpha = 0.86
  spriteContext.fillStyle = bodyColor
  spriteContext.beginPath()
  spriteContext.moveTo(size * 2.15, 0)
  spriteContext.lineTo(size * 0.65, size * 0.48)
  spriteContext.lineTo(size * 0.65, -size * 0.48)
  spriteContext.closePath()
  spriteContext.fill()

  spriteContext.strokeStyle = bodyColor
  spriteContext.lineWidth = Math.max(0.45, size * 0.18)
  spriteContext.beginPath()
  spriteContext.moveTo(-size * 1.2, size * 0.25)
  spriteContext.lineTo(-size * 1.65, size * 0.88)
  spriteContext.moveTo(-size * 1.2, -size * 0.25)
  spriteContext.lineTo(-size * 1.65, -size * 0.88)
  spriteContext.stroke()

  spriteContext.globalAlpha = 0.64
  spriteContext.strokeStyle = BACKDROP_ROCKET_FLAME
  spriteContext.lineWidth = Math.max(0.5, size * 0.22)
  spriteContext.beginPath()
  spriteContext.moveTo(-size * 1.65, 0)
  spriteContext.lineTo(-size * 3, 0)
  spriteContext.stroke()

  return { canvas, offset: center }
}

const createRocketSprites = () => {
  const createColorSprites = (bodyColor: string) =>
    BACKDROP_ROCKET_SPRITE_SIZES.map((size) =>
      Array.from(
        { length: BACKDROP_ROCKET_SPRITE_ANGLES },
        (_value, angleIndex) =>
          drawRocketSprite(
            size,
            (angleIndex / BACKDROP_ROCKET_SPRITE_ANGLES) * Math.PI * 2,
            bodyColor,
          ),
      ),
    )

  return {
    cyan: createColorSprites(BACKDROP_CYAN_ROCKET),
    magenta: createColorSprites(BACKDROP_MAGENTA_ROCKET),
  }
}

const getRocketSprite = (
  sprites: RocketSpriteSet,
  isMagenta: boolean,
  size: number,
  angle: number,
) => {
  const sizeIndex =
    size < 2.8 ? 0 : size < 3.65 ? 1 : BACKDROP_ROCKET_SPRITE_SIZES.length - 1
  const normalizedAngle = angle < 0 ? angle + Math.PI * 2 : angle
  const angleIndex =
    Math.round(
      (normalizedAngle / (Math.PI * 2)) * BACKDROP_ROCKET_SPRITE_ANGLES,
    ) % BACKDROP_ROCKET_SPRITE_ANGLES
  return (isMagenta ? sprites.magenta : sprites.cyan)[sizeIndex][angleIndex]
}

function initLaunchBackdrop(
  trailCanvas: HTMLCanvasElement,
  rocketCanvas: HTMLCanvasElement,
) {
  const trailCtx = trailCanvas.getContext('2d', { alpha: true })
  const rocketCtx = rocketCanvas.getContext('2d', { alpha: true })
  if (!trailCtx || !rocketCtx) return () => {}
  const trailContext = trailCtx
  const rocketContext = rocketCtx

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  let width = 0
  let height = 0
  let raf = 0
  let lastFrameAt = 0
  let running = false
<<<<<<< Updated upstream

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

  function resetParticle(p: (typeof particles)[number], edge?: 'left' | 'middle' | 'right') {
    const section = edge || (Math.random() > 0.75 ? 'left' : Math.random() > 0.25 ? 'middle' : 'right')
    
    if (section === 'left') {
      p.x = Math.random() * (width * 0.25)
    } else if (section === 'middle') {
      p.x = (width * 0.25) + Math.random() * (width * 0.5)
    } else {
      p.x = (width * 0.75) + Math.random() * (width * 0.25)
    }
    
    p.y = Math.random() * height
    p.life = 0.45 + Math.random() * 0.55
    p.speed = 0.45 + Math.random() * 1.35
    p.size = 0.45 + Math.random() * 1.05
    p.seed = Math.random() * 200
    p.hue = Math.random() > 0.42 ? 190 : 310
    p.alpha =
      p.hue === 310 ? 0.45 + Math.random() * 0.35 : 0.08 + Math.random() * 0.18
  }
=======
  let wasm: LaunchBackdropWasmExports | undefined
  let sprites: RocketSpriteSet | undefined
>>>>>>> Stashed changes

  function resize() {
    width = Math.max(1, window.innerWidth)
    height = Math.max(1, window.innerHeight)
<<<<<<< Updated upstream
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    context.setTransform(dpr, 0, 0, dpr, 0, 0)

    const target = Math.max(
      width < 760 ? 540 : 960, // 10x more particles
      Math.min(width < 760 ? 1200 : 2100, Math.floor((width * height) / 1200)), // 10x more particles
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
=======
    trailCanvas.width = Math.floor(width * dpr)
    trailCanvas.height = Math.floor(height * dpr)
    rocketCanvas.width = trailCanvas.width
    rocketCanvas.height = trailCanvas.height
    trailContext.setTransform(dpr, 0, 0, dpr, 0, 0)
    rocketContext.setTransform(dpr, 0, 0, dpr, 0, 0)
    wasm?.backdrop_resize(width, height)
>>>>>>> Stashed changes
  }

  function draw(now = performance.now()) {
    if (!running) return
    if (
      !document.body.contains(trailCanvas) ||
      !document.body.contains(rocketCanvas)
    ) {
      stop()
      return
    }
    raf = window.requestAnimationFrame(draw)
    if (!wasm) return
    const deltaMs = lastFrameAt === 0 ? 16.7 : now - lastFrameAt
    lastFrameAt = now
    const count = wasm.backdrop_count()
    const pointer = wasm.backdrop_step(deltaMs)
    if (!sprites) return
    const frame = new Float32Array(
      wasm.memory.buffer,
      pointer,
      count * LAUNCH_BACKDROP_PARTICLE_STRIDE,
    )

    trailContext.globalCompositeOperation = 'source-over'
    trailContext.globalAlpha = 1
    trailContext.fillStyle = 'rgba(2, 4, 18, 0.065)'
    trailContext.fillRect(0, 0, width, height)
    trailContext.globalCompositeOperation = 'lighter'
    rocketContext.clearRect(0, 0, width, height)
    rocketContext.globalCompositeOperation = 'lighter'
    rocketContext.lineCap = 'round'
    rocketContext.lineJoin = 'round'

    for (
      let offset = 0;
      offset < frame.length;
      offset += LAUNCH_BACKDROP_PARTICLE_STRIDE
    ) {
      const alpha = frame[offset + 6]
      if (alpha <= 0) continue
      const hue = frame[offset + 5]
      const fromX = frame[offset]
      const fromY = frame[offset + 1]
      const toX = frame[offset + 2]
      const toY = frame[offset + 3]
      const dx = toX - fromX
      const dy = toY - fromY
      const distance = Math.hypot(dx, dy)
      if (distance < 0.2) continue
      const isMagenta = hue === 310

      trailContext.globalAlpha = alpha
      trailContext.beginPath()
      trailContext.moveTo(fromX, fromY)
      trailContext.lineTo(toX, toY)
      trailContext.strokeStyle = isMagenta
        ? BACKDROP_MAGENTA_TRAIL
        : BACKDROP_CYAN_TRAIL
      trailContext.lineWidth = frame[offset + 4]
      trailContext.stroke()

<<<<<<< Updated upstream
      if (
        p.life <= 0 ||
        p.x < -40 ||
        p.x > width + 40 ||
        p.y < -40 ||
        p.y > height + 40
      ) {
        resetParticle(p)
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
=======
      const size = Math.max(1.3, frame[offset + 4] * 1.95)
      const angle = Math.atan2(dy, dx)
      const sprite = getRocketSprite(sprites, isMagenta, size, angle)
      rocketContext.globalAlpha = Math.min(0.9, alpha * 1.7)
      rocketContext.drawImage(
        sprite.canvas,
        toX - sprite.offset,
        toY - sprite.offset,
      )
>>>>>>> Stashed changes
    }

    trailContext.globalAlpha = 1
    rocketContext.globalAlpha = 1
  }

  function start() {
    if (running) return
    running = true
    lastFrameAt = 0
    sprites ??= createRocketSprites()
    if (wasm) {
      wasm.backdrop_init(width, height)
      draw()
      return
    }
    void loadLaunchBackdropWasm().then((loadedWasm) => {
      if (!running) return
      wasm = loadedWasm
      wasm.backdrop_init(width, height)
      draw()
    })
  }

  function stop() {
    running = false
    cancelAnimationFrame(raf)
    raf = 0
    rocketContext.clearRect(0, 0, width, height)
  }

  function pause() {
    stop()
  }

  function resume() {
    if (document.hidden) return
    start()
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
  window.addEventListener('blur', pause)
  window.addEventListener('focus', resume)
  window.addEventListener('pagehide', pause)
  window.addEventListener('pageshow', resume)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  start()

  return () => {
    window.removeEventListener('resize', resize)
    window.removeEventListener('blur', pause)
    window.removeEventListener('focus', resume)
    window.removeEventListener('pagehide', pause)
    window.removeEventListener('pageshow', resume)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    stop()
  }
}

export function LaunchBackdrop() {
  const trailCanvasRef = useRef<HTMLCanvasElement>(null)
  const rocketCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const trailCanvas = trailCanvasRef.current
    const rocketCanvas = rocketCanvasRef.current
    if (!trailCanvas || !rocketCanvas) return
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
      cleanup = initLaunchBackdrop(trailCanvas, rocketCanvas)
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
        className="absolute inset-[-12%_-18%_-18%_-24%] z-0 pointer-events-none opacity-58 blur-[7px] saturate-[1.4] animate-pulse"
        style={{
          background: `
          radial-gradient(circle at 67% 39%, rgba(28, 206, 255, 0.18), transparent 30rem),
          radial-gradient(circle at 78% 28%, rgba(255, 55, 221, 0.12), transparent 24rem)
        `,
          animation: 'heroAuraOnly 5.5s ease-in-out infinite alternate',
        }}
      />
      <canvas
        ref={trailCanvasRef}
        className="absolute inset-0 z-1 w-full h-full pointer-events-none opacity-82 mix-blend-screen saturate-[1.35] contrast-[1.05]"
      />
      <canvas
        ref={rocketCanvasRef}
        className="absolute inset-0 z-1 w-full h-full pointer-events-none opacity-82 mix-blend-screen saturate-[1.35] contrast-[1.05]"
      />
    </div>
  )
}
