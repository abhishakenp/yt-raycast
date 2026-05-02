import { createPreviewWarpController } from '@/lib/preview-warp-canvas'
import { useEffect, useRef, useState } from 'react'
// CSS loaded via <link> from /preview/:id HTML shell

const STATUS_LINE = [
  'COMPOSING INTERFACE',
  'STREAMING LAYOUT',
  'ALIGNING VISUAL TOKENS',
  'MATERIALIZING COMPONENTS',
] as const

const RESTORE_STATUS_LINE = [
  'RETRIEVING SAVED INTERFACE',
  'SYNCING VISUAL LAYERS',
  'RESTORING COMPONENT TREE',
  'LOCKING TRANSPONDER ON PREVIEW',
] as const

function ShipLogo() {
  return (
    <div className="logo-icon">
      <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M26 4L8 20L14 22L26 10L38 22L44 20L26 4Z" fill="url(#sfLaunchG1)" opacity="0.9" />
        <path d="M14 22L14 40L22 36V24L14 22Z" fill="url(#sfLaunchG2)" opacity="0.8" />
        <path d="M38 22L38 40L30 36V24L38 22Z" fill="url(#sfLaunchG2)" opacity="0.8" />
        <path d="M22 24V36L26 38L30 36V24L26 20L22 24Z" fill="url(#sfLaunchG1)" />
        <path d="M22 38L26 48L30 38L26 40L22 38Z" fill="#888888" opacity="0.7" />
        <circle cx="26" cy="16" r="2" fill="#ededed" />
        <defs>
          <linearGradient id="sfLaunchG1" x1="8" y1="4" x2="44" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" />
            <stop offset="1" stopColor="#ededed" />
          </linearGradient>
          <linearGradient id="sfLaunchG2" x1="14" y1="22" x2="38" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#888888" />
            <stop offset="1" stopColor="#555555" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export type OpenUIPreviewLaunchPhase = 'compose' | 'restore'

/**
 * Same experiential thread as the main dashboard intro: warp canvas, launch SFX, logo beat, status line.
 */
export function OpenUIPreviewLaunchLoading({ phase = 'compose' }: { phase?: OpenUIPreviewLaunchPhase } = {}) {
  const lines = phase === 'restore' ? RESTORE_STATUS_LINE : STATUS_LINE
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const warpRef = useRef<ReturnType<typeof createPreviewWarpController> | null>(null)
  const [logoClass, setLogoClass] = useState<'hidden' | 'visible' | 'shaking' | 'settled'>('hidden')
  const [phaseVisible, setPhaseVisible] = useState(false)
  const [statusIdx, setStatusIdx] = useState(0)

  useEffect(() => {
    setStatusIdx(0)
  }, [phase])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduce) {
      const ctrl = createPreviewWarpController(canvas)
      warpRef.current = ctrl
      ctrl.start()
    }
    const tVis = window.setTimeout(() => setLogoClass('visible'), 200)
    const tShake = window.setTimeout(() => {
      setLogoClass('shaking')
      const el = audioRef.current
      if (el) {
        el.volume = 0.7
        void el.play().catch(() => {})
      }
    }, 1000)
    const tSettle = window.setTimeout(() => {
      setLogoClass('settled')
      setPhaseVisible(true)
    }, 2000)

    return () => {
      window.clearTimeout(tVis)
      window.clearTimeout(tShake)
      window.clearTimeout(tSettle)
      warpRef.current?.stop()
      warpRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!phaseVisible) return
    const n = lines.length
    const id = window.setInterval(() => {
      setStatusIdx((i) => (i + 1) % n)
    }, 2800)
    return () => window.clearInterval(id)
  }, [phaseVisible, lines.length])

  const logoClassName = ['sf-openui-launch-logo']
  if (logoClass !== 'hidden') logoClassName.push(`is-${logoClass}`)

  return (
    <div className="sf-openui-launch-root" role="status" aria-live="polite" aria-busy="true">
      <audio ref={audioRef} preload="auto" src="/assets/launch.mp3" />
      <canvas ref={canvasRef} className="sf-openui-launch-warp" aria-hidden />
      <div className="sf-openui-launch-brand-wrap">
        <div className={logoClassName.join(' ')}>
          <ShipLogo />
          <span className="logo-text">SHIP FAST</span>
        </div>
      </div>
      <div className={`sf-openui-launch-phase ${phaseVisible ? 'is-visible' : ''}`}>
        {phaseVisible ? lines[statusIdx % lines.length] : '\u00a0'}
      </div>
    </div>
  )
}
