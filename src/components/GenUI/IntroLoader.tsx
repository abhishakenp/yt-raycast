import { useEffect, useRef, useState } from 'react'
import styles from './IntroLoader.module.css'
import { IntroBeams } from './IntroBeams'
import { IntroPreviewFrame } from './IntroPreviewFrame'
import { IntroLogo } from './IntroLogo'
import { IntroTyping } from './IntroTyping'
import { useWarpCanvas } from '../../hooks/useWarpCanvas'

const STATUS_LINE = [
  'COMPOSING INTERFACE',
  'STREAMING LAYOUT',
  'ALIGNING VISUAL TOKENS',
  'MATERIALIZING COMPONENTS',
] as const

export type IntroPhase = 'compose' | 'restore'

export function IntroLoader({
  phase = 'compose',
  progress = 0,
  logs = [],
}: {
  phase?: IntroPhase
  progress?: number
  logs?: { eventType: string; message?: string; createdAt: number }[]
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [logoClass, setLogoClass] = useState<'hidden' | 'visible' | 'shaking' | 'settled'>('hidden')
  const [phaseVisible, setPhaseVisible] = useState(false)
  const [statusIdx, setStatusIdx] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const [autoProgress, setAutoProgress] = useState(0)
  const overlayRef = useRef<HTMLDivElement>(null)
  const effectiveProgress = Math.min(1, Math.max(progress, autoProgress))

  useWarpCanvas(canvasRef)

  useEffect(() => {
    setStatusIdx(0)
    setAutoProgress(0)
  }, [phase])

  useEffect(() => {
    const audio = new Audio('/assets/launch.mp3')
    audio.volume = 0.72
    void audio.play().catch(() => undefined)
  }, [])

  useEffect(() => {
    if (progress >= 1) {
      setAutoProgress(1)
      return
    }

    const startedAt = Date.now()
    const id = window.setInterval(() => {
      const elapsed = Date.now() - startedAt
      const next = Math.min(0.92, 0.16 + elapsed / 5200)
      setAutoProgress(next)
    }, 80)

    return () => window.clearInterval(id)
  }, [progress, phase])

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (reduce) {
      setLogoClass('visible')
      setPhaseVisible(true)
      return
    }

    const tVis = window.setTimeout(() => setLogoClass('visible'), 200)
    const tShake = window.setTimeout(() => {
      setLogoClass('shaking')
    }, 800)
    const tSettle = window.setTimeout(() => {
      setLogoClass('settled')
      setPhaseVisible(true)
    }, 1800)

    return () => {
      window.clearTimeout(tVis)
      window.clearTimeout(tShake)
      window.clearTimeout(tSettle)
    }
  }, [])

  useEffect(() => {
    if (!phaseVisible) return
    const n = STATUS_LINE.length
    const id = window.setInterval(() => {
      setStatusIdx((i) => (i + 1) % n)
    }, 2800)
    return () => window.clearInterval(id)
  }, [phaseVisible])

  useEffect(() => {
    if (effectiveProgress >= 1 && !isExiting) {
      setIsExiting(true)
      if (overlayRef.current) {
        overlayRef.current.classList.add(styles.exiting)
      }
    }
  }, [effectiveProgress, isExiting])

  return (
    <div 
      ref={overlayRef}
      className={`${styles.introOverlay} ${isExiting ? styles.exiting : ''}`}
      style={{
        '--intro-progress': effectiveProgress,
        '--intro-frame-y': `${58 - effectiveProgress * 58}vh`,
        '--intro-frame-scale': 0.9 + effectiveProgress * 0.1,
        '--intro-frame-opacity': effectiveProgress > 0.1 ? 1 : 0,
      } as React.CSSProperties}
      role="status"
      aria-live="polite"
      aria-busy={!isExiting}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden />
      <IntroBeams />
      <IntroPreviewFrame />
      <IntroLogo logoClass={logoClass} />
      <IntroTyping />
      {logs.length > 0 && (
        <div className={styles.logStack} aria-live="polite">
          {logs.slice(-4).map((log) => (
            <div className={styles.logLine} key={`${log.createdAt}-${log.eventType}-${log.message}`}>
              <span>{log.eventType}</span>
              <p>{log.message}</p>
            </div>
          ))}
        </div>
      )}
      <div className={`${styles.phaseLabel} ${phaseVisible ? styles.visible : ''}`}>
        {phaseVisible ? STATUS_LINE[statusIdx % STATUS_LINE.length] : '\u00a0'}
      </div>
    </div>
  )
}
