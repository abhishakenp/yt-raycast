import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import { useEffect, useRef, useState } from 'react'
import { ZapIcon } from 'lucide-react'
import HeaderUser from '../integrations/clerk/header-user'
import styles from './index.module.css'

const getRecentSessions = createServerFn({ method: 'GET' }).handler(async () => {
  const { createFilesystemSessionRepository } = await import(
    '../session-domain/filesystem-session-repository.js'
  )
  return createFilesystemSessionRepository().list().slice(0, 6)
})

const createStartGeneration = createServerFn({ method: 'POST' })
  .validator((data: { prompt?: string; preferredLanguage?: string; preferredExportTarget?: string; authToken?: string }) => ({
    prompt: data?.prompt || '',
    preferredLanguage: data?.preferredLanguage || 'en',
    preferredExportTarget: data?.preferredExportTarget || 'html',
    authToken: data?.authToken || '',
  }))
  .handler(async ({ data }) => {
    const { createShipfastGeneration } = await import('../start/create-session-request.js')
    const { resolveStartClerkUser } = await import('../session-domain/start-auth.js')
    return createShipfastGeneration(data, {
      resolveAuthUser: resolveStartClerkUser,
    })
  })

const SAMPLE_PROMPTS = [
  'A cinematic travel landing page for curated weekend escapes with reviews and fast booking.',
  'A polished SaaS homepage for an AI sales copilot with pipeline analytics and clear pricing.',
  'A premium architecture studio site with immersive case studies, awards, and inquiry scheduling.',
  'A bold ecommerce homepage for handcrafted coffee gear with bundles and subscriptions.',
  'A sleek fintech landing page for founders tracking runway, burn, and investor updates.',
  'A modern fitness club website with class schedules, trainer profiles, and membership plans.',
]

const EXAMPLE_CHIPS = [
  { label: 'Image studio', text: 'This app is going to be an image generation studio using various AI models to turn a prompt into images. Design a mocked version (no backend). It should be dark mode. Focus on making it beautiful.' },
  { label: 'Pet wellness', text: 'Build a bold landing page for a premium pet wellness app with a booking section and customer testimonials.' },
  { label: 'SaaS dashboard', text: 'Create a clean SaaS marketing dashboard for a remote team productivity platform with charts and responsive cards.' },
  { label: 'Hindi gym site', text: 'Mere local gym ke liye ek powerful modern website banao with membership plans' },
]

export const Route = createFileRoute('/')({
  loader: () => getRecentSessions(),
  component: StartHome,
})

function StartHome() {
  const sessions = Route.useLoaderData()
  const navigate = useNavigate()
  const createGeneration = useServerFn(createStartGeneration)
  const [inputValue, setInputValue] = useState('')
  const [placeholderText, setPlaceholderText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const animRef = useRef<{ index: number; length: number; mode: 'typing' | 'holding' | 'deleting'; timer: number | null }>({ index: 0, length: 0, mode: 'typing', timer: null })
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return
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
        150,
        Math.min(260, Math.floor((width * height) / 9000)),
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

    function draw() {
      if (!document.body.contains(canvas)) return
      raf = window.requestAnimationFrame(draw)
      tick += 1

      context.globalCompositeOperation = 'source-over'
      context.fillStyle = 'rgba(2, 4, 18, 0.065)'
      context.fillRect(0, 0, width, height)
      context.globalCompositeOperation = 'lighter'

      for (const p of particles) {
        const px = p.x
        const py = p.y
        const n = smoothNoise(
          p.x * 0.0036 + tick * 0.0007,
          p.y * 0.0036 + p.seed,
        )
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

    resize()
    window.addEventListener('resize', resize, { passive: true })
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [])

  async function go(prompt: string) {
    const value = prompt.trim()
    if (!value) return

    setIsGenerating(true)
    try {
      const authToken = await getStartClerkToken()
      const result = await createGeneration({
        data: {
          prompt: value,
          preferredLanguage: 'en',
          preferredExportTarget: 'html',
          authToken,
        },
      })
      if (result.anonOwnerSecret && typeof window !== 'undefined') {
        window.localStorage.setItem(
          `ship-fast:anon-owner:${result.sessionId}`,
          result.anonOwnerSecret,
        )
      }
      await navigate({
        to: '/generate/$sessionId',
        params: { sessionId: result.sessionId },
      })
    } catch (err) {
      console.error('Generation failed:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    function randomDelay(min: number, max: number) {
      return Math.floor(Math.random() * (max - min + 1)) + min
    }
    function render() {
      const current = SAMPLE_PROMPTS[animRef.current.index]
      setPlaceholderText(current.slice(0, animRef.current.length))
    }
    function step() {
      animRef.current.timer = null
      if (inputValue.length > 0) return
      const current = SAMPLE_PROMPTS[animRef.current.index]
      if (animRef.current.mode === 'typing') {
        animRef.current.length += 1
        render()
        if (animRef.current.length < current.length) {
          animRef.current.timer = window.setTimeout(step, randomDelay(16, 30))
          return
        }
        animRef.current.mode = 'holding'
        animRef.current.timer = window.setTimeout(step, 1800)
        return
      }
      if (animRef.current.mode === 'holding') {
        animRef.current.mode = 'deleting'
        animRef.current.timer = window.setTimeout(step, 640)
        return
      }
      animRef.current.length = Math.max(0, animRef.current.length - 1)
      render()
      if (animRef.current.length > 0) {
        animRef.current.timer = window.setTimeout(step, randomDelay(10, 18))
        return
      }
      animRef.current.index = (animRef.current.index + 1) % SAMPLE_PROMPTS.length
      animRef.current.mode = 'typing'
      animRef.current.timer = window.setTimeout(step, 260)
    }
    animRef.current.timer = window.setTimeout(step, 320)
    return () => {
      if (animRef.current.timer) clearTimeout(animRef.current.timer)
    }
  }, [inputValue])

  const hasValue = inputValue.length > 0
  const placeholderLabel = hasValue ? 'Your prompt' : 'Try a prompt like'

  return (
    <>
      <div className={styles.backdrop}>
        <div className={styles.backdropBg}>
          <div className={styles.backdropAura} />
          <canvas ref={canvasRef} className={styles.backdropCanvas} />
        </div>
      </div>
      <nav className={styles.nav}>
        <HeaderUser />
      </nav>

      <div className={styles.layout}>
        <div className={styles.logoContainer}>
          <div className={styles.logoInner}>
            <div className={styles.logoIcon}>
              <LogoBolt />
            </div>
            <span className={styles.logoText}>SHIP FAST</span>
          </div>
        </div>

        <div className={styles.heroSection}>
          <p className={styles.eyebrow}>Prompt. Generate. Launch.</p>
          <h1 className={styles.title}>
            Print your mind<br />in seconds
          </h1>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formContainer}>
            <div className={styles.formCard}>
              <div className={styles.formInner}>
                <form
                  className="flex flex-col"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const text = inputValue.trim()
                    if (text) go(text)
                  }}
                >
                  <div className="relative">
                    <textarea
                      autoFocus
                      placeholder=""
                      className={styles.textarea}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      rows={3}
                    />
                    <div className={`${styles.placeholder} ${hasValue ? styles.hidden : ''}`} aria-hidden="true">
                      <span className={styles.placeholderLabel}>{placeholderLabel}</span>
                      <span className={styles.placeholderText}>
                        {!hasValue ? placeholderText : ''}
                        {!hasValue && <span className={styles.caret} />}
                      </span>
                    </div>
                  </div>
                  <div className={styles.formActions}>
                    <button
                      type="submit"
                      className={styles.submitBtn}
                      disabled={inputValue.trim().length === 0 || isGenerating}
                    >
                      <ZapIcon className="w-4 h-4 flex-shrink-0" />
                      <span className={styles.submitTextMobile}>{isGenerating ? 'Generating...' : 'Generate'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className={styles.chips}>
              {EXAMPLE_CHIPS.map((chip, idx) => (
                <button
                  key={chip.label}
                  type="button"
                  className={styles.chip}
                  title={chip.text}
                  onClick={() => go(chip.text)}
                >
                  <span className={styles.chipNumber}>{idx + 1}</span>
                  <span className={styles.chipLabel}>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <span className={styles.footerText}>SHIP FAST © 2026</span>
        <nav className={styles.footerNav} aria-label="Footer links">
          <Link to="/" className={styles.footerLink}>Home</Link>
          {sessions[0] ? (
            <Link
              className={styles.footerLink}
              to="/generate/$sessionId"
              params={{ sessionId: sessions[0].id }}
            >
              Latest session
            </Link>
          ) : null}
        </nav>
      </footer>
    </>
  )
}

function LogoBolt() {
  return (
    <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M30.9 3.5 9.8 28.6h14.3l-4.2 19.9 22.3-27H27.7L30.9 3.5Z"
        fill="url(#homepageBoltG1)"
      />
      <path
        d="M30.9 3.5 9.8 28.6h14.3l-4.2 19.9 22.3-27H27.7L30.9 3.5Z"
        stroke="url(#homepageBoltG2)"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="homepageBoltG1"
          x1="11"
          y1="5"
          x2="42"
          y2="47"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#69f8ff" />
          <stop offset="0.54" stopColor="#1ab8ff" />
          <stop offset="1" stopColor="#6b3cff" />
        </linearGradient>
        <linearGradient
          id="homepageBoltG2"
          x1="8"
          y1="3"
          x2="44"
          y2="49"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#dffcff" />
          <stop offset="1" stopColor="#31dfff" stopOpacity="0.15" />
        </linearGradient>
      </defs>
    </svg>
  )
}

async function getStartClerkToken() {
  const clerk = typeof window !== 'undefined' ? (window as any).Clerk : null
  if (!clerk?.session) return ''
  try {
    return (await clerk.session.getToken()) || ''
  } catch {
    return ''
  }
}
