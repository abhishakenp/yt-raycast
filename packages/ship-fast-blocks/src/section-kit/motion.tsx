import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type RefObject,
} from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'

import { cn } from '#/lib/utils.ts'

/**
 * Section-kit motion helpers: SSR-safe building blocks for animated,
 * dimensional sections. Every helper renders plain, fully visible static
 * content during renderToString (static HTML export) and only enhances on the
 * client, so content is never hidden when JavaScript doesn't run.
 * Reduced-motion users get the static rendering too.
 */

/** useLayoutEffect on the client, useEffect during SSR (renderToString warns
 *  on useLayoutEffect). Lets reveal helpers hide below-fold content BEFORE
 *  first paint so there is no flash-of-visible-then-hidden. */
const useIsoLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

const REVEAL_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'

function finiteOr(value: unknown, fallback: number): number {
  return Number.isFinite(value) ? Number(value) : fallback
}

/** True only on the client when IntersectionObserver exists and the user has
 *  not requested reduced motion — the gate for every fancy behavior. Flips
 *  before first paint (layout effect) so there is no visible mode switch. */
function useMotionArmed(): boolean {
  const [armed, setArmed] = useState(false)
  useIsoLayoutEffect(() => {
    if (typeof window === 'undefined') return
    if (typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      return
    }
    setArmed(true)
  }, [])
  return armed
}

type RevealPhase = 'static' | 'hidden' | 'shown'

/** Global one-shot registry: entrance ids that have already played this page
 *  load. The preview runtime remounts sections when realtime data seeds, and
 *  replaying an entrance on remount reads as text flicker — an id in this set
 *  renders static forever after its first play. */
const playedEntrances = new Set<string>()

/** Shared IO-driven reveal state machine used by Reveal and WordReveal.
 *  'static' = SSR / reduced motion / no IO (content plain and visible),
 *  'hidden' = armed client, waiting to intersect, 'shown' = animating in.
 *  A watchdog force-reveals if the observer never reports at all. */
function useRevealPhase(ref: RefObject<HTMLElement | null>): RevealPhase {
  const [phase, setPhase] = useState<RevealPhase>('static')

  useIsoLayoutEffect(() => {
    if (typeof window === 'undefined') return
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      return
    }

    setPhase('hidden')
    let revealed = false
    let sawCallback = false
    const show = () => {
      if (revealed) return
      revealed = true
      setPhase('shown')
      observer.disconnect()
      window.clearTimeout(watchdog)
    }
    const observer = new IntersectionObserver(
      (entries) => {
        sawCallback = true
        for (const entry of entries) {
          if (entry.isIntersecting) show()
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )
    observer.observe(el)
    const watchdog = window.setTimeout(() => {
      if (!sawCallback) show()
    }, 2000)
    return () => {
      observer.disconnect()
      window.clearTimeout(watchdog)
    }
  }, [])

  return phase
}

/**
 * Reveal — scroll-triggered entrance for section content. Wrap any block; on
 * the client it fades/slides in when it enters the viewport, with optional
 * per-item `delay` for staggering. Server-side (and with reduced motion or no
 * IntersectionObserver) it renders children fully visible with zero styling,
 * so SSR output, hydration, and no-JS exports stay correct. A watchdog
 * timeout force-reveals if the observer never reports, so content can never
 * be lost to a hidden state.
 */
export function Reveal(props: {
  children?: ReactNode
  /** Extra classes on the wrapper div. */
  className?: string
  /** Transition delay in ms for staggered groups. */
  delay?: number
  /** Entrance travel distance in px (translateY). */
  y?: number
  /** Add a slight scale-up on entrance. */
  scale?: boolean
  /** Entrance duration in ms. */
  duration?: number
  /** Global one-shot id: once played, remounts with the same id render
   *  static (prevents entrance replay / flicker on runtime remounts). */
  once?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const alreadyPlayed =
    typeof props.once === 'string' && playedEntrances.has(props.once)
  const rawPhase = useRevealPhase(ref)
  const phase = alreadyPlayed ? 'static' : rawPhase
  const onceId = typeof props.once === 'string' ? props.once : null
  useEffect(() => {
    if (phase === 'shown' && onceId) playedEntrances.add(onceId)
  }, [phase, onceId])

  const delay = finiteOr(props.delay, 0)
  const y = finiteOr(props.y, 24)
  const duration = finiteOr(props.duration, 700)

  const style: CSSProperties | undefined =
    phase === 'static'
      ? undefined
      : {
          opacity: phase === 'hidden' ? 0 : 1,
          transform:
            phase === 'hidden'
              ? `translateY(${y}px)${props.scale ? ' scale(0.96)' : ''}`
              : 'translateY(0)',
          transition: `opacity ${duration}ms ${REVEAL_EASING}, transform ${duration}ms ${REVEAL_EASING}`,
          transitionDelay: `${delay}ms`,
          willChange: phase === 'hidden' ? 'opacity, transform' : undefined,
        }

  return (
    <div ref={ref} className={props.className} style={style}>
      {props.children}
    </div>
  )
}

/**
 * WordReveal — kinetic display typography. Splits `text` into words and, when
 * the element scrolls into view, rises each word in with a stagger while it
 * un-blurs — the classic flagship-landing headline entrance. SSR / reduced
 * motion renders the plain text (single text node, no spans). Use for hero
 * and section headlines; pass `as` for the right heading tag.
 */
export function WordReveal(props: {
  text?: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'
  /** Delay in ms before the first word. */
  delay?: number
  /** Per-word stagger in ms. */
  stagger?: number
  /** Per-word rise distance in px. */
  y?: number
}) {
  const ref = useRef<HTMLElement | null>(null)
  const phase = useRevealPhase(ref)
  const Tag = (props.as ?? 'span') as ElementType

  const text = typeof props.text === 'string' ? props.text : ''
  const delay = finiteOr(props.delay, 0)
  const stagger = finiteOr(props.stagger, 45)
  const y = finiteOr(props.y, 26)

  if (phase === 'static') {
    return (
      <Tag ref={ref} className={props.className}>
        {text}
      </Tag>
    )
  }

  const words = text.split(/\s+/).filter(Boolean)
  return (
    <Tag ref={ref} className={props.className}>
      {words.flatMap((word, index) => [
        <span
          key={`${word}-${index}`}
          className="inline-block will-change-transform"
          style={{
            opacity: phase === 'hidden' ? 0 : 1,
            transform:
              phase === 'hidden' ? `translateY(${y}px)` : 'translateY(0)',
            filter: phase === 'hidden' ? 'blur(10px)' : 'blur(0px)',
            transition: `opacity 0.7s ${REVEAL_EASING}, transform 0.7s ${REVEAL_EASING}, filter 0.7s ${REVEAL_EASING}`,
            transitionDelay: `${delay + index * stagger}ms`,
          }}
        >
          {word}
        </span>,
        index < words.length - 1 ? ' ' : null,
      ])}
    </Tag>
  )
}

/**
 * Tilt — pointer-tracked 3D tilt wrapper for cards and hero media. Rotates
 * toward the cursor with a perspective transform and glides back on leave.
 * Optional `glare` renders a pointer-following specular sheen. Mouse-only
 * (touch pointers are ignored), no window listeners — the transform is
 * written straight to the element, so it costs nothing on the server and
 * degrades to a plain div without JavaScript.
 */
export function Tilt(props: {
  children?: ReactNode
  className?: string
  /** Max rotation in degrees. */
  max?: number
  /** Perspective distance in px. */
  perspective?: number
  /** Render a pointer-following specular sheen overlay. */
  glare?: boolean
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const glareRef = useRef<HTMLDivElement | null>(null)
  const max = finiteOr(props.max, 7)
  const perspective = finiteOr(props.perspective, 1200)

  const handleMove = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'touch') return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const px = (event.clientX - rect.left) / rect.width
    const py = (event.clientY - rect.top) / rect.height
    const rx = (0.5 - py) * max
    const ry = (px - 0.5) * max
    el.style.transform = `perspective(${perspective}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`
    const glareEl = glareRef.current
    if (glareEl) {
      glareEl.style.opacity = '1'
      glareEl.style.background = `radial-gradient(65% 65% at ${(px * 100).toFixed(1)}% ${(py * 100).toFixed(1)}%, currentColor, transparent 70%)`
    }
  }

  const handleLeave = () => {
    const el = ref.current
    if (el) el.style.transform = ''
    const glareEl = glareRef.current
    if (glareEl) glareEl.style.opacity = '0'
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={cn(
        'transition-transform duration-300 ease-out will-change-transform [transform-style:preserve-3d]',
        props.className,
      )}
    >
      {props.children}
      {props.glare ? (
        <div
          ref={glareRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] text-foreground/15 opacity-0 transition-opacity duration-500"
        />
      ) : null}
    </div>
  )
}

/**
 * Glow — decorative blurred token-gradient blob used to light sections from
 * behind. Purely presentational (aria-hidden, pointer-events-none); position
 * and size it with className. Token colors only, so it re-themes with the
 * site.
 */
export function Glow(props: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute rounded-full bg-primary/20 blur-3xl',
        props.className,
      )}
    />
  )
}

/**
 * Float — continuous, gentle vertical bob for floating chips, proof cards,
 * and decorative elements, powered by a framer-motion keyframe loop. Renders
 * a plain static div during SSR and for reduced-motion users, so no export
 * target ever depends on the animation running.
 */
export function Float(props: {
  children?: ReactNode
  className?: string
  /** Peak vertical travel in px. */
  amplitude?: number
  /** Seconds for one full bob cycle. */
  duration?: number
  /** Seconds to wait before the loop starts (desynchronizes siblings). */
  delay?: number
}) {
  const reduced = useReducedMotion()
  const amplitude = finiteOr(props.amplitude, 10)
  const duration = finiteOr(props.duration, 6)
  const delay = finiteOr(props.delay, 0)

  if (reduced) {
    return <div className={props.className}>{props.children}</div>
  }

  return (
    <motion.div
      className={props.className}
      animate={{ y: [0, -amplitude, 0] }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {props.children}
    </motion.div>
  )
}

/**
 * GridField — architectural blueprint grid backdrop. A static, token-colored
 * line grid (1px hairlines on a configurable cell size) faded by a mask so it
 * reads as drafting-paper structure behind content, never as a texture wall.
 * Color comes from currentColor — set a `text-foreground/[0.05]`-style class.
 * Purely presentational: aria-hidden, pointer-events-none, zero motion.
 */
export function GridField(props: {
  className?: string
  /** Grid cell size in px. */
  size?: number
  /** CSS mask-image controlling where the grid is visible. */
  mask?: string
}) {
  const size = finiteOr(props.size, 64)
  const mask =
    typeof props.mask === 'string' && props.mask
      ? props.mask
      : 'radial-gradient(ellipse 100% 80% at 50% 0%, black 25%, transparent 75%)'
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 text-foreground/[0.05]',
        props.className,
      )}
      style={{
        backgroundImage:
          'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
        backgroundSize: `${size}px ${size}px`,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  )
}

/**
 * Drift — very slow ambient drift loop for background light (wrap Glow blobs
 * or decorative layers). The wrapped layer wanders a few dozen pixels over
 * 20–30s and back, giving sections a living, connected atmosphere without
 * drawing attention. SSR and reduced-motion render a static layer.
 */
export function Drift(props: {
  children?: ReactNode
  className?: string
  /** Horizontal wander in px. */
  x?: number
  /** Vertical wander in px. */
  y?: number
  /** Seconds for one full wander cycle. */
  duration?: number
  /** Seconds of phase offset (desynchronizes siblings). */
  delay?: number
}) {
  const reduced = useReducedMotion()
  const x = finiteOr(props.x, 30)
  const y = finiteOr(props.y, -20)
  const duration = finiteOr(props.duration, 24)
  const delay = finiteOr(props.delay, 0)

  if (reduced) {
    return <div className={props.className}>{props.children}</div>
  }

  return (
    <motion.div
      className={props.className}
      animate={{ x: [0, x, 0], y: [0, y, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {props.children}
    </motion.div>
  )
}

/**
 * Magnetic — pointer-attracted wrapper for CTAs. The content is pulled a few
 * pixels toward the cursor on hover with a spring, and snaps back on leave.
 * SSR renders a plain wrapper (motion values start at 0); touch pointers are
 * ignored. Wrap a single button.
 */
export function Magnetic(props: {
  children?: ReactNode
  className?: string
  /** 0..1 — how strongly the content follows the pointer. */
  strength?: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const strength = Math.min(Math.max(finiteOr(props.strength, 0.3), 0), 1)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 260, damping: 18 })
  const springY = useSpring(y, { stiffness: 260, damping: 18 })

  const handleMove = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'touch') return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength)
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength)
  }

  const handleLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{ x: springX, y: springY }}
      className={cn('inline-block', props.className)}
    >
      {props.children}
    </motion.div>
  )
}

/**
 * Marquee — infinite horizontal loop for logo rows, testimonial walls, and
 * keyword strips. The children are duplicated into a seamless track that
 * scrolls forever (linear, framer-powered — no CSS keyframes). SSR and
 * reduced-motion render a single static row clipped by the container, so
 * content is always present. `reverse` flips direction for layered rows.
 */
export function Marquee(props: {
  children?: ReactNode
  className?: string
  /** Seconds for one full loop of the content. */
  duration?: number
  /** Scroll right-to-left by default; true scrolls left-to-right. */
  reverse?: boolean
  /** Gap between items (and between the duplicated copies), in px. */
  gap?: number
}) {
  const armed = useMotionArmed()
  const duration = finiteOr(props.duration, 36)
  const gap = finiteOr(props.gap, 24)

  const copy = (hidden: boolean) => (
    <div
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-stretch"
      style={{ gap: `${gap}px`, paddingRight: `${gap}px` }}
    >
      {props.children}
    </div>
  )

  if (!armed) {
    return (
      <div className={cn('flex overflow-hidden', props.className)}>
        {copy(false)}
      </div>
    )
  }

  return (
    <div className={cn('flex overflow-hidden', props.className)}>
      <motion.div
        className="flex shrink-0 items-stretch"
        animate={{ x: props.reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ duration, ease: 'linear', repeat: Infinity }}
      >
        {copy(false)}
        {copy(true)}
      </motion.div>
    </div>
  )
}

/**
 * CountUp — animated numeric stat. Accepts values like "400+", "$1,200" or
 * 98: the numeric part counts up from 0 when the stat scrolls into view,
 * prefix/suffix stay put. SSR, reduced motion, and no-JS all render the FINAL
 * value, so the real number is never missing. Renders an inline span.
 */
export function CountUp(props: {
  value?: string | number
  className?: string
  /** Seconds for the count animation. */
  duration?: number
}) {
  const raw =
    typeof props.value === 'number' && Number.isFinite(props.value)
      ? String(props.value)
      : typeof props.value === 'string'
        ? props.value
        : ''
  const ref = useRef<HTMLSpanElement | null>(null)
  const [display, setDisplay] = useState(raw)
  const duration = finiteOr(props.duration, 1.6)

  useEffect(() => {
    setDisplay(raw)
    if (typeof window === 'undefined') return
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      return
    }
    const match = raw.match(/^([^0-9]*)([\d,]+(?:\.\d+)?)(.*)$/)
    if (!match) return
    const [, prefix, digits, suffix] = match
    const target = Number(digits.replace(/,/g, ''))
    if (!Number.isFinite(target)) return
    const useGrouping = digits.includes(',')
    const decimals = digits.includes('.')
      ? (digits.split('.')[1]?.length ?? 0)
      : 0
    const format = (value: number) =>
      value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping,
      })

    let controls: ReturnType<typeof animate> | null = null
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || controls) continue
          controls = animate(0, target, {
            duration,
            ease: [0.22, 1, 0.36, 1],
            onUpdate: (value) => {
              setDisplay(`${prefix}${format(value)}${suffix}`)
            },
            onComplete: () => setDisplay(raw),
          })
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      controls?.stop()
    }
  }, [raw, duration])

  return (
    <span ref={ref} className={props.className}>
      {display}
    </span>
  )
}

/**
 * Spotlight — cursor-reactive card lighting. Wrap a card; a soft radial glow
 * follows the pointer across the surface (the Linear/Vercel card treatment).
 * The overlay uses currentColor via a token text class, so it re-themes and
 * works across every export target; it is invisible on the server and fades
 * in only under a mouse pointer.
 */
export function Spotlight(props: {
  children?: ReactNode
  className?: string
  /** Spot radius in px. */
  radius?: number
  /** Token text-color class driving the glow color. */
  colorClassName?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState(false)
  const radius = finiteOr(props.radius, 260)

  const handleMove = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'touch') return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
    el.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
    setActive(true)
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={() => setActive(false)}
      className={cn('relative', props.className)}
    >
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 z-10 rounded-[inherit] transition-opacity duration-500',
          props.colorClassName ?? 'text-primary',
        )}
        style={{
          opacity: active ? 0.14 : 0,
          background: `radial-gradient(${radius}px circle at var(--spot-x, 50%) var(--spot-y, 50%), currentColor, transparent 70%)`,
        }}
      />
      {props.children}
    </div>
  )
}

/**
 * ParallaxLayer — scroll-linked depth. The layer drifts vertically as it
 * moves through the viewport (spring-smoothed), creating multi-plane depth
 * when siblings use different speeds. speed > 0 moves against scroll
 * (background feel), speed < 0 moves with it (foreground feel). SSR and
 * reduced motion render a static div at rest position.
 */
export function ParallaxLayer(props: {
  children?: ReactNode
  className?: string
  /** -1..1 — direction and fraction of `range`. */
  speed?: number
  /** Max drift in px at |speed| = 1 (default 120). */
  range?: number
}) {
  const armed = useMotionArmed()
  const ref = useRef<HTMLDivElement | null>(null)
  const speed = Math.min(Math.max(finiteOr(props.speed, 0.3), -1), 1)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const range = finiteOr(props.range, 120) * speed
  const drift = useTransform(scrollYProgress, [0, 1], [range, -range])
  const y = useSpring(drift, { stiffness: 60, damping: 20, mass: 0.6 })

  if (!armed) {
    return (
      <div ref={ref} className={props.className}>
        {props.children}
      </div>
    )
  }

  return (
    <motion.div ref={ref} style={{ y }} className={props.className}>
      {props.children}
    </motion.div>
  )
}
