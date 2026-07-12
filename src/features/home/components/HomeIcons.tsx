import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export const LogoMark = () => (
  <img
    src="/assets/logo-transparent.png"
    alt="Ship Fast Logo"
    className="w-full h-full object-contain"
    aria-hidden="true"
  />
)

export const SearchIcon = () => (
  <svg
    className="size-4 shrink-0 text-white/35"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)

export const CloseIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

export const ZapIcon = () => (
  <svg
    className="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

export function ShareIcon({
  children,
  className,
  id,
  label,
  title,
  onClick,
}: {
  children: ReactNode
  className?: string
  id: string
  label: string
  title: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      className={cn(
        'grid size-9 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-white/75 shadow-[0_8px_24px_rgba(0,0,0,0.22)] transition-all duration-200 hover:-translate-y-px hover:bg-white/[0.1] hover:text-white',
        className,
      )}
      id={id}
      title={title}
      aria-label={label}
      onClick={onClick}
    >
      <svg
        className="size-[18px]"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        aria-hidden="true"
      >
        {children}
      </svg>
    </button>
  )
}
