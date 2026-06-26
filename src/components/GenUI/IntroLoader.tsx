import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
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
  playSound = true,
}: {
  phase?: IntroPhase
  progress?: number
  playSound?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [logoClass, setLogoClass] = useState<
    'hidden' | 'visible' | 'shaking' | 'settled'
  >('visible')
  const [phaseVisible, setPhaseVisible] = useState(true)
  const [statusIdx, setStatusIdx] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const [autoProgress, setAutoProgress] = useState(0)
  const overlayRef = useRef<HTMLDivElement>(null)
  const effectiveProgress = Math.min(1, Math.max(progress, autoProgress))

  useWarpCanvas(canvasRef)

  useEffect(() => {
    setIsMounted(true)
    // Reset to hidden state to start animation after hydration
    setLogoClass('hidden')
    setPhaseVisible(false)
  }, [])

  useEffect(() => {
    setStatusIdx(0)
    setAutoProgress(0)
  }, [phase])

  useEffect(() => {
    // Only play audio after mount
    if (!isMounted || !playSound) return
    const audio = new Audio('/assets/launch.mp3')
    audio.volume = 0.72
    void audio.play().catch(() => undefined)
  }, [isMounted, playSound])

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
    // Only run logo animation after mount
    if (!isMounted) return

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
  }, [isMounted])

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
    }
  }, [effectiveProgress, isExiting])

  return (
    <div
      ref={overlayRef}
      className={cn(
        'group pointer-events-none fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_38%,rgba(41,232,255,0.2),transparent_22%),radial-gradient(circle_at_73%_20%,rgba(166,74,255,0.2),transparent_31%),radial-gradient(circle_at_22%_78%,rgba(17,72,214,0.2),transparent_34%),linear-gradient(180deg,#050714_0%,#0a0e25_46%,#030511_100%)] transition-[opacity,transform] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] before:absolute before:inset-[-20%] before:z-0 before:animate-pulse before:bg-[linear-gradient(105deg,transparent_0_38%,rgba(32,225,255,0.1)_43%,transparent_49%),linear-gradient(72deg,transparent_0_58%,rgba(170,70,255,0.12)_63%,transparent_69%)] before:opacity-80 before:blur-[2px] after:absolute after:inset-x-[-12%] after:bottom-[-16%] after:z-0 after:h-[50vh] after:translate-y-[var(--intro-glow-y,12vh)] after:bg-[radial-gradient(ellipse_at_50%_0%,rgba(31,228,255,0.18),transparent_62%),linear-gradient(90deg,transparent,rgba(45,232,255,0.16),transparent)] after:blur-[22px] after:transition-transform after:duration-1000',
        isExiting && 'is-exiting opacity-0',
      )}
      style={
        {
          '--intro-progress': effectiveProgress,
          '--intro-frame-y': `${58 - effectiveProgress * 58}vh`,
          '--intro-frame-scale': 0.9 + effectiveProgress * 0.1,
          '--intro-frame-opacity': effectiveProgress > 0.1 ? 1 : 0,
        } as React.CSSProperties
      }
      role="status"
      aria-live="polite"
      aria-busy={!isExiting}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        aria-hidden
      />
      <IntroBeams />
      <IntroPreviewFrame />
      <IntroLogo logoClass={logoClass} />
      <IntroTyping />
      <div
        className={cn(
          'absolute bottom-8 left-1/2 z-[2] -translate-x-1/2 font-mono text-[13px] uppercase tracking-[0.15em] text-[#4e5259] opacity-0 transition-[opacity,bottom,font-size,color,transform,letter-spacing,text-shadow,font-weight] duration-700',
          phaseVisible && 'text-gray-500 opacity-100',
        )}
      >
        {phaseVisible ? STATUS_LINE[statusIdx % STATUS_LINE.length] : '\u00a0'}
      </div>
    </div>
  )
}
