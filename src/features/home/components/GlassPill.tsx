import type { ReactNode } from 'react'

import { GLASS_LENS_FILTER_ID } from '@/lib/glass-pill-html'
import { cn } from '@/lib/utils'

export const GlassDefs = () => (
  <svg
    className="absolute -m-px size-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <filter
        id={GLASS_LENS_FILTER_ID}
        x="-50%"
        y="-50%"
        width="200%"
        height="200%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.0082 0.0058"
          numOctaves="3"
          seed="41"
          result="noise"
        />
        <feGaussianBlur in="noise" stdDeviation="2" result="smooth" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="smooth"
          scale="24"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>
)

const PillDecorations = () => (
  <>
    <span
      className={`pointer-events-none absolute inset-0 z-0 rounded-[inherit] backdrop-blur-[32px] backdrop-saturate-[2.1] backdrop-brightness-[1.03] backdrop-contrast-[1.04] [filter:url(#${GLASS_LENS_FILTER_ID})]`}
      aria-hidden="true"
    />
    <span
      className="pointer-events-none absolute inset-0 z-[1] translate-x-px -translate-y-[0.4px] rounded-[inherit] bg-[rgba(255,210,198,0.07)] opacity-30 mix-blend-screen backdrop-blur-[28px] backdrop-saturate-[2.2] backdrop-contrast-[1.04]"
      aria-hidden="true"
    />
    <span
      className="pointer-events-none absolute inset-0 z-[2] -translate-x-px translate-y-[0.4px] rounded-[inherit] bg-[rgba(175,205,228,0.07)] opacity-30 mix-blend-screen backdrop-blur-[28px] backdrop-saturate-[2.2] backdrop-contrast-[1.04]"
      aria-hidden="true"
    />
    <span
      className="pointer-events-none absolute inset-0 z-[3] rounded-[inherit] bg-[linear-gradient(180deg,rgba(8,10,18,0.22)_0%,rgba(255,255,255,0.04)_48%,rgba(218,224,232,0.1)_100%),radial-gradient(ellipse_100%_70%_at_88%_12%,rgba(255,255,255,0.06)_0%,transparent_45%)] opacity-55"
      aria-hidden="true"
    />
    <span
      className="pointer-events-none absolute inset-0 z-[4] rounded-[inherit] bg-[conic-gradient(from_200deg_at_35%_25%,rgba(235,238,242,0.07),rgba(210,216,224,0.08),rgba(225,228,234,0.07),rgba(205,212,222,0.08),rgba(235,238,242,0.07))] opacity-25 mix-blend-soft-light"
      aria-hidden="true"
    />
    <span
      className="pointer-events-none absolute inset-0 z-[5] rounded-[inherit] bg-[linear-gradient(172deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0)_42%),linear-gradient(358deg,rgba(255,255,255,0)_54%,rgba(255,255,255,0.05)_100%)] opacity-55 mix-blend-soft-light"
      aria-hidden="true"
    />
    <span
      className="pointer-events-none absolute inset-0 z-[6] rounded-[inherit] shadow-[inset_0_1px_0_rgba(255,255,255,0.75),inset_0_0_0_1px_rgba(255,255,255,0.16),inset_0_-12px_28px_rgba(0,6,30,0.28)]"
      aria-hidden="true"
    />
  </>
)

type PillButtonProps = {
  children: ReactNode
  className?: string
  disabled?: boolean
  id?: string
  type?: 'button' | 'submit'
  ariaLabel?: string
  onClick?: () => void
  onAnimationEnd?: () => void
}

export const GlassPillButton = ({
  children,
  className = '',
  disabled,
  id,
  type = 'button',
  ariaLabel,
  onClick,
  onAnimationEnd,
}: PillButtonProps) => (
  <button
    type={type}
    className={cn(
      'pill relative isolate inline-flex min-h-12 cursor-pointer items-center justify-center overflow-hidden rounded-full border-0 bg-transparent px-5 py-3 font-[inherit] font-semibold tracking-[-0.015em] text-inherit shadow-[0_14px_32px_rgba(0,0,0,0.38)] transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.25)] [-webkit-tap-highlight-color:transparent] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white',
      className,
    )}
    id={id}
    disabled={disabled}
    aria-label={ariaLabel}
    onClick={onClick}
    onAnimationEnd={onAnimationEnd}
  >
    <PillDecorations />
    <span className="pill__body relative z-[7] inline-flex items-center justify-center gap-2 [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">
      {children}
    </span>
  </button>
)

export const GlassPillAnchor = ({
  children,
  className = '',
  href,
}: {
  children: ReactNode
  className?: string
  href: string
}) => (
  <a
    href={href}
    className={cn(
      'pill relative isolate inline-flex min-h-12 cursor-pointer items-center justify-center overflow-hidden rounded-full border-0 bg-transparent px-5 py-3 font-[inherit] font-semibold tracking-[-0.015em] text-inherit shadow-[0_14px_32px_rgba(0,0,0,0.38)] transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.25)] [-webkit-tap-highlight-color:transparent] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white',
      className,
    )}
  >
    <PillDecorations />
    <span className="pill__body relative z-[7] inline-flex items-center justify-center gap-2 [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">
      {children}
    </span>
  </a>
)
