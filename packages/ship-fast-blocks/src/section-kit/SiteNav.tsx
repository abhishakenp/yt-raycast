import * as React from 'react'
import type { ReactNode } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'
import { useDesign } from '#/primitives/design-context.tsx'

import type { KitAction } from './types.ts'
import { kitActionClasses } from './types.ts'
import { SignInButton } from '#/section-kit/SignInButton.tsx'
import { MobileNavDrawer } from './MobileNavDrawer.tsx'
import { Logo, LogoImage, LogoLabel } from './Logo.tsx'
import { Container } from './Container.tsx'
import {
  SectionKitNavHrefProvider,
  useIsActiveSectionKitNavHref,
  useSectionKitNavClick,
  useSectionKitNavHref,
} from './nav-href.tsx'
import { RouterLink } from './RouterLink.tsx'

/**
 * Matches CTA labels that express an auth intent (sign in / log in / sign up /
 * sign out / account / profile). Used to auto-wire a nav CTA to the real
 * Shoo/lakebed auth instead of legacy page-switch navigation.
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
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors',
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
  HTMLElement,
  React.ComponentProps<'a'> & { asChild?: boolean }
>(({ className, href, asChild = false, ...props }, ref) => {
  const navHref = typeof href === 'string' ? href : undefined
  const resolvedHref = useSectionKitNavHref(navHref)
  const Comp = asChild ? Slot : resolvedHref ? RouterLink : 'div'
  const onNavClick = useSectionKitNavClick(navHref)
  return (
    <Comp
      data-slot="navbar-brand"
      href={resolvedHref}
      onClick={onNavClick}
      // Below `sm`, collapse the wordmark to the logo mark only so dense navbars
      // never overflow on phones. `sr-only` keeps it as the link's accessible
      // name; it returns to normal flow at `sm+`.
      className={cn(
        'flex items-center [&_[data-slot=logo-label]]:sr-only sm:[&_[data-slot=logo-label]]:not-sr-only',
        className,
      )}
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
  HTMLAnchorElement,
  React.ComponentProps<'a'> & { asChild?: boolean }
>(
  (
    { className, href, asChild = false, 'aria-current': ariaCurrent, ...props },
    ref,
  ) => {
    const navHref = typeof href === 'string' ? href : undefined
    const resolvedHref = useSectionKitNavHref(navHref)
    const isActive = useIsActiveSectionKitNavHref()(navHref)
    const onNavClick = useSectionKitNavClick(navHref)

    // When resolvedHref is truthy we use RouterLink (TanStack Router). Pass
    // exactActive so TanStack's Link only marks itself active on an exact
    // pathname match — otherwise the home route is "active" on every sub-page
    // because it's a parent route. Our custom isActive hook is the source of
    // truth for the aria-current attribute.
    const linkProps = {
      'data-slot': 'navbar-nav-link',
      href: resolvedHref,
      'aria-current': isActive ? 'page' : ariaCurrent,
      onClick: onNavClick,
      className: cn(
        'whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
        className,
        isActive &&
          'bg-muted text-foreground underline decoration-primary underline-offset-8',
      ),
      ref,
      ...props,
    }

    if (asChild) {
      return <Slot {...linkProps} />
    }
    if (resolvedHref) {
      return <RouterLink exactActive {...linkProps} />
    }
    return <a {...linkProps} />
  },
)
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

const NavbarRouteLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<'a'> & { asChild?: boolean }
>(({ className, href, asChild = false, onClick, ...props }, ref) => {
  const navHref = typeof href === 'string' ? href : undefined
  const resolvedHref = useSectionKitNavHref(navHref)
  const Comp = asChild ? Slot : resolvedHref ? RouterLink : 'a'
  const onNavClick = useSectionKitNavClick(navHref)
  return (
    <Comp
      data-slot="navbar-route-link"
      href={resolvedHref}
      onClick={(event) => {
        onNavClick(event)
        onClick?.(event)
      }}
      className={className}
      ref={ref}
      {...props}
    />
  )
})
NavbarRouteLink.displayName = 'NavbarRouteLink'

const NavbarCta = React.forwardRef<
  HTMLElement,
  Omit<React.ComponentProps<'a'>, 'type'> &
    Pick<React.ComponentProps<'button'>, 'type' | 'disabled'> &
    VariantProps<typeof navbarCtaVariants> & { asChild?: boolean }
>(({ className, href, variant, asChild = false, type, ...props }, ref) => {
  const navHref = typeof href === 'string' ? href : undefined
  const resolvedHref = useSectionKitNavHref(navHref)
  const Comp = asChild ? Slot : resolvedHref ? RouterLink : 'button'
  const onNavClick = useSectionKitNavClick(navHref)
  return (
    <Comp
      data-slot="navbar-cta"
      href={resolvedHref}
      onClick={onNavClick}
      type={resolvedHref ? undefined : (type ?? 'button')}
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
  /** Layout variant — controls brand/link/CTA arrangement. */
  variant?: 'default' | 'centered' | 'minimal' | 'split'
  // Compound props
  position?: 'sticky' | 'fixed'
  height?: 'compact' | 'default' | 'responsive' | 'outlier'
  containerClassName?: string
  rowClassName?: string
  /** Skip the Container + nav + row wrapping; render children directly inside the header. */
  bare?: boolean
  children?: ReactNode
}

export function SiteNav(props: SiteNavProps) {
  return (
    <SectionKitNavHrefProvider>
      {props.children != null ? (
        <CompoundSiteNav {...props} />
      ) : (
        <LegacySiteNav {...props} />
      )}
    </SectionKitNavHrefProvider>
  )
}

/* --- Legacy implementation (unchanged) --- */

function LegacySiteNav(props: SiteNavProps) {
  const d = useDesign()
  const sticky = props.sticky ?? true
  const cta = props.cta
  const ctaIsAuth = Boolean(
    props.signIn || (cta && AUTH_INTENT.test(cta.label)),
  )
  const homeHref = useSectionKitNavHref(props.homeTarget ?? 'Home')
  const ctaHref = useSectionKitNavHref(cta?.target ?? cta?.label)
  const variant = props.variant ?? 'default'

  // Design-aware nav height: compact=h-16, balanced=h-20, airy=h-24
  const heightClass = d.density.section.includes('py-10')
    ? 'h-16'
    : d.density.section.includes('py-24')
      ? 'h-24'
      : 'h-20'

  // Design-aware border: brutalist=border-2, sharp=border-b-2, others=border-b
  const borderClass = d.shadow.card.includes('shadow-[8px_8px_0')
    ? 'border-b-2 border-foreground'
    : d.radius.btn.includes('rounded-none')
      ? 'border-b-2 border-border'
      : 'border-b border-border'

  const headerClasses = sticky
    ? `fixed inset-x-0 top-0 z-50 bg-background/95 backdrop-blur-sm ${borderClass}`
    : `relative z-50 bg-background ${borderClass}`

  // Design-aware brand font: detect typography from display classes
  const isTechnical = d.typography.display.includes('tabular-nums')
  const isEditorial =
    d.typography.display.includes('uppercase') &&
    d.typography.display.includes('font-extrabold')
  const isDisplay = d.typography.display.includes('font-black')
  const brandFontClass = isEditorial
    ? 'font-serif italic'
    : isTechnical
      ? 'font-mono'
      : isDisplay
        ? 'font-black uppercase tracking-tight'
        : ''

  const isHomeActive = useIsActiveSectionKitNavHref()(
    props.homeTarget ?? 'Home',
  )

  // Shared sub-elements
  const brandLink = (
    <RouterLink
      href={homeHref ?? '/'}
      exactActive
      aria-current={isHomeActive ? 'page' : undefined}
      className="flex items-center gap-3"
    >
      <Logo brand={props.brand ?? ''}>
        <LogoImage className="size-8" fallback={props.brandMark} />
        <LogoLabel
          className={cn(
            'text-xl font-medium text-foreground',
            brandFontClass,
            props.brandClassName,
          )}
        />
      </Logo>
    </RouterLink>
  )

  const navLinks = (
    <div className="hidden items-center gap-8 md:flex">
      {props.nav?.map((label) => (
        <NavbarNavLink key={label} href={label}>
          {label}
        </NavbarNavLink>
      ))}
    </div>
  )

  const ctaButton = cta && ctaIsAuth ? (
    <SignInButton
      label={cta.label}
      variant={cta.variant}
      className="hidden sm:inline-flex"
    />
  ) : cta ? (
    <RouterLink
      href={ctaHref ?? '#'}
      className={cn(
        kitActionClasses(cta.variant),
        d.radius.btn,
        'hidden sm:inline-flex',
      )}
    >
      {cta.label}
    </RouterLink>
  ) : null

  const mobileDrawer = (
    <MobileNavDrawer
      brand={props.brand ?? ''}
      nav={props.nav ?? []}
      homeTarget={props.homeTarget}
      cta={cta && !ctaIsAuth ? cta : undefined}
      buttonClassName="p-2 text-muted-foreground hover:text-foreground md:hidden"
      footer={
        cta && ctaIsAuth ? (
          <SignInButton
            label={cta.label}
            variant={cta.variant}
            className="min-h-11 w-full"
          />
        ) : null
      }
    />
  )

  const phoneLink =
    typeof props.phone === 'string' && props.phone.trim() ? (
      <a
        href={`tel:${props.phone.replace(/[^\d+]/g, '')}`}
        className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
      >
        {props.phone}
      </a>
    ) : null

  // ── Variant: centered — brand centered on top row, links on bottom row ──
  if (variant === 'centered') {
    return (
      <>
        <header className={cn(headerClasses, props.className)}>
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className={cn('flex items-center justify-center', heightClass)}>
              {brandLink}
            </div>
            <div className="hidden items-center justify-center gap-8 border-t border-border py-3 md:flex">
              {props.nav?.map((label) => (
                <NavbarNavLink key={label} href={label}>
                  {label}
                </NavbarNavLink>
              ))}
              {ctaButton}
              {phoneLink}
            </div>
          </div>
          <div className="flex items-center justify-end px-6 lg:px-8 md:hidden">
            {mobileDrawer}
          </div>
        </header>
        {sticky && <div aria-hidden="true" className="h-20" />}
      </>
    )
  }

  // ── Variant: minimal — brand left, CTA right, no visible links ──
  if (variant === 'minimal') {
    return (
      <>
        <header className={cn(headerClasses, props.className)}>
          <nav
            className={cn(
              'mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8',
              heightClass,
            )}
          >
            {brandLink}
            <div className="flex items-center gap-4">
              {phoneLink}
              {ctaButton}
              {mobileDrawer}
            </div>
          </nav>
        </header>
        {sticky && <div aria-hidden="true" className="h-20" />}
      </>
    )
  }

  // ── Variant: split — brand left, links right, CTA far right ──
  if (variant === 'split') {
    return (
      <>
        <header className={cn(headerClasses, props.className)}>
          <nav
            className={cn(
              'mx-auto flex max-w-7xl items-center gap-8 px-6 lg:px-8',
              heightClass,
            )}
          >
            {brandLink}
            <div className="ml-auto hidden items-center gap-8 md:flex">
              {props.nav?.map((label) => (
                <NavbarNavLink key={label} href={label}>
                  {label}
                </NavbarNavLink>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-4">
              {phoneLink}
              {ctaButton}
              {mobileDrawer}
            </div>
          </nav>
        </header>
        {sticky && <div aria-hidden="true" className="h-20" />}
      </>
    )
  }

  // ── Variant: default — brand left, links center, CTA right ──
  return (
    <>
      <header className={cn(headerClasses, props.className)}>
        <nav
          className={cn(
            'mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8',
            heightClass,
          )}
        >
          {brandLink}
          {navLinks}
          <div className="flex items-center gap-4">
            {phoneLink}
            {ctaButton}
            {mobileDrawer}
          </div>
        </nav>
      </header>
      {/* Spacer to offset fixed header so page content isn't hidden behind nav */}
      {sticky && <div aria-hidden="true" className="h-20" />}
    </>
  )
}

/* --- Compound implementation --- */

const CompoundSiteNav = React.forwardRef<
  HTMLElement,
  SiteNavProps &
    VariantProps<typeof siteNavHeaderVariants> & {
      asChild?: boolean
    }
>(
  (
    {
      position,
      height = 'default',
      className,
      containerClassName,
      rowClassName,
      bare = false,
      children,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'header'
    const headerClasses = cn(siteNavHeaderVariants({ position }), className)
    if (bare) {
      return (
        <Comp
          data-slot="site-nav"
          className={headerClasses}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
      )
    }
    return (
      <Comp data-slot="site-nav" className={headerClasses} ref={ref} {...props}>
        <Container asChild className={containerClassName}>
          <nav aria-label="Main navigation">
            <div className={cn(siteNavRowVariants({ height }), rowClassName)}>
              {children}
            </div>
          </nav>
        </Container>
      </Comp>
    )
  },
)
CompoundSiteNav.displayName = 'CompoundSiteNav'

export {
  NavbarBrand,
  NavbarNav,
  NavbarNavLink,
  NavbarActions,
  NavbarRouteLink,
  NavbarCta,
  siteNavHeaderVariants,
  siteNavRowVariants,
  navbarCtaVariants,
}
