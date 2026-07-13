import * as React from 'react'
import type { ReactNode } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

import type { KitAction } from './types.ts'
import { kitActionClasses } from './types.ts'
import { SignInButton } from '#/section-kit/SignInButton.tsx'
import { MobileNavDrawer } from './MobileNavDrawer.tsx'
import { Logo } from './Logo.tsx'
import { Container } from './Container.tsx'

/**
 * Matches CTA labels that express an auth intent (sign in / log in / sign up /
 * sign out / account / profile). Used to auto-wire a nav CTA to the real
 * Shoo/lakebed auth instead of the dead `go(label)` page-switch.
 */
const AUTH_INTENT =
  /\b(sign\s?-?\s?in|log\s?-?\s?in|login|signin|sign\s?-?\s?up|signup|sign\s?-?\s?out|log\s?-?\s?out|logout|my\s?account|account|my\s?profile)\b/i

/* ---------------------------------------------------------------------------
 * CVA variant definitions
 * ------------------------------------------------------------------------- */

const siteNavHeaderVariants = cva('z-50 border-b border-border', {
  variants: {
    position: {
      sticky: 'sticky top-0 backdrop-blur-sm',
      fixed: 'fixed inset-x-0 top-0 backdrop-blur-md',
    },
  },
  defaultVariants: {
    position: 'fixed',
  },
})

const siteNavRowVariants = cva('flex items-center justify-between', {
  variants: {
    height: {
      compact: 'h-16',
      default: 'h-20',
      responsive: 'h-16 lg:h-20',
      outlier: '',
    },
  },
  defaultVariants: {
    height: 'default',
  },
})

const navbarCtaVariants = cva(
  'inline-flex items-center justify-center text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        primary:
          'rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90',
        'primary-pill':
          'rounded-full bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90',
        dark: 'rounded-lg bg-foreground px-4 py-2 text-background hover:bg-foreground/90',
        'dark-pill':
          'rounded-full bg-foreground px-4 py-2 text-background hover:bg-foreground/90',
        outline:
          'border border-border bg-background px-4 py-2 text-foreground hover:bg-muted',
        underline: 'border-b border-primary pb-0.5 text-primary',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
)

/* ---------------------------------------------------------------------------
 * Compound sub-components
 * ------------------------------------------------------------------------- */

const NavbarBrand = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="navbar-brand"
      className={cn('flex items-center', className)}
      ref={ref}
      {...props}
    />
  )
})
NavbarBrand.displayName = 'NavbarBrand'

const NavbarNav = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean; breakpoint?: 'md' | 'lg' }
>(({ className, asChild = false, breakpoint = 'md', ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  const bp = breakpoint === 'lg' ? 'lg:flex' : 'md:flex'
  return (
    <Comp
      data-slot="navbar-nav"
      className={cn('hidden items-center gap-8', bp, className)}
      ref={ref}
      {...props}
    />
  )
})
NavbarNav.displayName = 'NavbarNav'

const NavbarNavLink = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'>
>(({ className, ...props }, ref) => {
  return (
    <button
      data-slot="navbar-nav-link"
      className={cn(
        'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
NavbarNavLink.displayName = 'NavbarNavLink'

const NavbarActions = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="navbar-actions"
      className={cn('flex items-center gap-4', className)}
      ref={ref}
      {...props}
    />
  )
})
NavbarActions.displayName = 'NavbarActions'

const NavbarCta = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> &
    VariantProps<typeof navbarCtaVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      data-slot="navbar-cta"
      className={cn(navbarCtaVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  )
})
NavbarCta.displayName = 'NavbarCta'

/* ---------------------------------------------------------------------------
 * SiteNav — supports both legacy prop-driven and compound modes.
 *
 * Legacy mode (backward compat): pass `brand`, `nav`, `cta`, etc. as props.
 * Compound mode: pass `position`, `height`, and children (NavbarBrand,
 * NavbarNav, NavbarActions).
 * ------------------------------------------------------------------------- */

export type SiteNavProps = {
  className?: string
  // Legacy props
  brand?: string
  brandMark?: ReactNode
  nav?: string[]
  phone?: string
  cta?: KitAction
  signIn?: boolean
  homeTarget?: string
  sticky?: boolean
  brandClassName?: string
  // Compound props
  position?: 'sticky' | 'fixed'
  height?: 'compact' | 'default' | 'responsive' | 'outlier'
  containerClassName?: string
  rowClassName?: string
  children?: ReactNode
}

export function SiteNav(props: SiteNavProps) {
  if (props.children != null) {
    return <CompoundSiteNav {...props} />
  }
  return <LegacySiteNav {...props} />
}

/* --- Legacy implementation (unchanged) --- */

function LegacySiteNav(props: SiteNavProps) {
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
          <Logo
            brand={props.brand ?? ''}
            className="size-8"
            fallback={props.brandMark}
            labelClassName={cn(
              'text-xl font-medium text-foreground',
              props.brandClassName,
            )}
          />
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
            brand={props.brand ?? ''}
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

/* --- Compound implementation --- */

const CompoundSiteNav = React.forwardRef<
  HTMLElement,
  SiteNavProps & VariantProps<typeof siteNavHeaderVariants>
>(
  (
    {
      position,
      height = 'default',
      className,
      containerClassName,
      rowClassName,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <header
        data-slot="site-nav"
        className={cn(siteNavHeaderVariants({ position }), className)}
        ref={ref}
        {...props}
      >
        <Container asChild className={containerClassName}>
          <nav aria-label="Main navigation">
            <div className={cn(siteNavRowVariants({ height }), rowClassName)}>
              {children}
            </div>
          </nav>
        </Container>
      </header>
    )
  },
)
CompoundSiteNav.displayName = 'CompoundSiteNav'

export {
  NavbarBrand,
  NavbarNav,
  NavbarNavLink,
  NavbarActions,
  NavbarCta,
  siteNavHeaderVariants,
  siteNavRowVariants,
  navbarCtaVariants,
}
