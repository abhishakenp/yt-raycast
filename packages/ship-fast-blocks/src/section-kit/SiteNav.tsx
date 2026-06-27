import type { ReactNode } from 'react'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

import type { KitAction } from './types.ts'
import { kitActionClasses } from './types.ts'
import { SignInButton } from '#/section-kit/SignInButton.tsx'
import { MobileNavDrawer } from './MobileNavDrawer.tsx'

/**
 * Matches CTA labels that express an auth intent (sign in / log in / sign up /
 * sign out / account / profile). Used to auto-wire a nav CTA to the real
 * Shoo/lakebed auth instead of the dead `go(label)` page-switch.
 */
const AUTH_INTENT =
  /\b(sign\s?-?\s?in|log\s?-?\s?in|login|signin|sign\s?-?\s?up|signup|sign\s?-?\s?out|log\s?-?\s?out|logout|my\s?account|account|my\s?profile)\b/i

/**
 * Generic, prop-driven site navigation header with a real mobile drawer.
 * Renders a brand, optional desktop nav links, phone, and CTA, plus a Sheet
 * hamburger on small screens. Replaces the inline nav duplication that each
 * vertical section capsule used to hand-roll.
 */
export function SiteNav(props: {
  brand: string
  brandMark?: ReactNode
  nav?: string[]
  phone?: string
  cta?: KitAction
  signIn?: boolean
  homeTarget?: string
  sticky?: boolean
  brandClassName?: string
  className?: string
}) {
  const go = useNavigate()
  const sticky = props.sticky ?? true
  const ctaIsAuth = Boolean(
    props.signIn || (props.cta && AUTH_INTENT.test(props.cta.label)),
  )

  const headerClasses = sticky
    ? 'fixed inset-x-0 top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border'
    : 'relative z-50 bg-background border-b border-border'

  return (
    <header className={cn(headerClasses, props.className)}>
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <button
          type="button"
          onClick={() => go(props.homeTarget ?? 'Home')}
          className="flex items-center gap-3"
        >
          {props.brandMark}
          <span
            className={cn(
              'text-xl font-medium text-foreground',
              props.brandClassName,
            )}
          >
            {props.brand}
          </span>
        </button>

        <div className="hidden items-center gap-8 md:flex">
          {props.nav?.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => go(label)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {typeof props.phone === 'string' && props.phone.trim() ? (
            <a
              href={`tel:${props.phone.replace(/[^\d+]/g, '')}`}
              className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
            >
              {props.phone}
            </a>
          ) : null}

          {props.cta && ctaIsAuth ? (
            <SignInButton
              label={props.cta.label}
              variant={props.cta.variant}
              className="hidden sm:inline-flex"
            />
          ) : props.cta ? (
            <button
              type="button"
              onClick={() => go(props.cta!.target ?? props.cta!.label)}
              className={cn(
                kitActionClasses(props.cta.variant),
                'hidden sm:inline-flex',
              )}
            >
              {props.cta.label}
            </button>
          ) : null}

          <MobileNavDrawer
            brand={props.brand}
            nav={props.nav ?? []}
            homeTarget={props.homeTarget}
            cta={props.cta && !ctaIsAuth ? props.cta : undefined}
            buttonClassName="p-2 text-muted-foreground hover:text-foreground md:hidden"
            footer={
              props.cta && ctaIsAuth ? (
                <SignInButton
                  label={props.cta.label}
                  variant={props.cta.variant}
                  className="min-h-11 w-full"
                />
              ) : null
            }
          />
        </div>
      </nav>
    </header>
  )
}
