import { useEffect, useRef, useState } from 'react'
import styles from './IntroLoader.module.css'
import { IntroBeams } from './IntroBeams'
import { IntroPreviewFrame } from './IntroPreviewFrame'
import { IntroMediaChips } from './IntroMediaChips'
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

export function IntroLoader({ phase = 'compose', progress = 0 }: { phase?: IntroPhase; progress?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [logoClass, setLogoClass] = useState<'hidden' | 'visible' | 'shaking' | 'settled'>('hidden')
  const [phaseVisible, setPhaseVisible] = useState(false)
  const [statusIdx, setStatusIdx] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  useWarpCanvas(canvasRef)

  useEffect(() => {
    setStatusIdx(0)
  }, [phase])

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
    if (progress >= 1 && !isExiting) {
      setIsExiting(true)
      if (overlayRef.current) {
        overlayRef.current.classList.add(styles.exiting)
      }
    }
  }, [progress, isExiting])

  return (
    <div 
      ref={overlayRef}
      className={`${styles.introOverlay} ${isExiting ? styles.exiting : ''}`}
      style={{
        '--intro-progress': progress,
        '--intro-frame-y': `${58 - progress * 58}vh`,
        '--intro-frame-scale': 0.9 + progress * 0.1,
        '--intro-frame-opacity': progress > 0.1 ? 1 : 0,
      } as React.CSSProperties}
      role="status"
      aria-live="polite"
      aria-busy={!isExiting}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden />
      <IntroBeams />
      <IntroMediaChips />
      <IntroPreviewFrame />
      <IntroLogo logoClass={logoClass} />
      <IntroTyping />
      <div className={`${styles.phaseLabel} ${phaseVisible ? styles.visible : ''}`}>
        {phaseVisible ? STATUS_LINE[statusIdx % STATUS_LINE.length] : '\u00a0'}
      </div>
    </div>
  )
}
