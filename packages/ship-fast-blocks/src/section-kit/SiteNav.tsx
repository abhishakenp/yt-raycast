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

/* ---------------------------------------------------------------------------
 * Scroll-collapse hook — shrinks the navbar on scroll (sliver effect).
 * The brand row smoothly collapses; nav links stay pinned.
 * Works inside any scroll container (window, .genui-preview, iframe, …).
 * ------------------------------------------------------------------------- */

function useScrollCollapse(threshold = 60) {
  const [collapsed, setCollapsed] = React.useState(false)
  const ref = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    // Find the nearest scrollable ancestor. Use a function so we can retry
    // after content loads (scrollHeight may equal clientHeight at mount).
    let scrollTarget: Element | Window = window
    let cleanup: (() => void) | undefined

    const findScrollTarget = () => {
      let parent: Element | null = el.parentElement
      while (parent) {
        const cs = getComputedStyle(parent)
        const canScroll =
          (cs.overflowY === 'auto' || cs.overflowY === 'scroll') &&
          parent.scrollHeight > parent.clientHeight
        if (canScroll) return parent
        parent = parent.parentElement
      }
      return null
    }

    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const scrollTop =
          scrollTarget === window
            ? window.scrollY
            : (scrollTarget as Element).scrollTop
        setCollapsed(scrollTop > threshold)
        ticking = false
      })
    }

    const attach = (target: Element | Window) => {
      target.addEventListener('scroll', onScroll, { passive: true })
      cleanup = () => target.removeEventListener('scroll', onScroll)
    }

    // Try immediately; if no scroll container found, retry after a tick
    // (content may still be loading).
    const found = findScrollTarget()
    if (found) {
      scrollTarget = found
      attach(scrollTarget)
      onScroll()
    } else {
      attach(window)
      onScroll()
      // Retry after content has a chance to load
      const id = setTimeout(() => {
        cleanup?.()
        const retry = findScrollTarget()
        if (retry) {
          scrollTarget = retry
          attach(scrollTarget)
          onScroll()
        }
      }, 300)
      cleanup = () => {
        clearTimeout(id)
        window.removeEventListener('scroll', onScroll)
      }
    }

    return () => cleanup?.()
  }, [threshold])

  return { collapsed, ref }
}

/* ---------------------------------------------------------------------------
 * NavSpacer — runtime-measured spacer that exactly matches the preceding
 * fixed-position header's height.
 *
 * PROVABLE GUARANTEE: The spacer height is always equal to the header height,
 * measured via ResizeObserver. No hardcoded values → no mismatch → content
 * can never be hidden behind a fixed navbar, regardless of variant, collapsed
 * state, or content. This eliminates the entire class of "fixed navbar covers
 * content" bugs by construction.
 * ------------------------------------------------------------------------- */

const HEIGHT_VARIANT_FALLBACK: Record<string, string> = {
  compact: 'h-16',
  default: 'h-20',
  responsive: 'h-16 lg:h-20',
  outlier: 'h-20',
}

function NavSpacer({
  fallbackHeight,
}: {
  fallbackHeight?: string
}): React.ReactElement {
  const ref = React.useRef<HTMLDivElement>(null)
  const [measured, setMeasured] = React.useState<number | null>(null)

  React.useLayoutEffect(() => {
    const spacer = ref.current
    if (!spacer) return
    const header = spacer.previousElementSibling as HTMLElement | null
    if (!header) return

    const update = () => {
      const h = header.getBoundingClientRect().height
      if (h > 0) setMeasured(h)
    }
    update()

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(update)
      observer.observe(header)
      return () => observer.disconnect()
    }
    // Fallback: poll once after a short delay for late layout
    const id = setTimeout(update, 100)
    return () => clearTimeout(id)
  }, [])

  return (
    <div
      aria-hidden="true"
      ref={ref}
      className={measured === null ? fallbackHeight : undefined}
      style={measured !== null ? { height: `${measured}px` } : undefined}
    />
  )
}

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
        'relative whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-200 ease-out hover:bg-muted hover:text-foreground',
        'after:absolute after:bottom-0.5 after:left-1/2 after:h-0.5 after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-primary after:transition-all after:duration-200 after:ease-out hover:after:w-3/4',
        className,
        isActive && 'bg-muted text-foreground after:w-3/4',
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
  const { collapsed, ref: scrollRef } = useScrollCollapse()

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

  const ctaButton =
    cta && ctaIsAuth ? (
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
  // Sliver effect: on scroll, brand row collapses and a compact brand
  // smoothly slides into the links row (left side). Links stay pinned.
  if (variant === 'centered') {
    return (
      <>
        <header
          ref={scrollRef}
          className={cn(
            headerClasses,
            'transition-all duration-300 ease-out',
            collapsed && 'shadow-sm',
            props.className,
          )}
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {/* Top row: large centered brand — collapses on scroll */}
            <div
              className={cn(
                'flex items-center justify-center overflow-hidden transition-all duration-300 ease-out',
                collapsed ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100',
                heightClass,
              )}
            >
              {brandLink}
            </div>
            {/* Bottom row: links + compact brand that slides in on scroll */}
            <div
              className={cn(
                'flex items-center gap-8 border-t border-border py-3 transition-all duration-300 ease-out',
                'hidden md:flex',
                collapsed ? 'justify-between' : 'justify-center',
              )}
            >
              {/* Compact brand — invisible when expanded, slides in from left on scroll */}
              <div
                className={cn(
                  'flex items-center gap-2 transition-all duration-300 ease-out',
                  collapsed
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-2 pointer-events-none',
                )}
              >
                <Logo brand={props.brand ?? ''}>
                  <LogoImage className="size-6" fallback={props.brandMark} />
                  <LogoLabel
                    className={cn(
                      'text-sm font-medium text-foreground',
                      brandFontClass,
                      props.brandClassName,
                    )}
                  />
                </Logo>
              </div>
              <div className="flex items-center gap-8">
                {props.nav?.map((label) => (
                  <NavbarNavLink key={label} href={label}>
                    {label}
                  </NavbarNavLink>
                ))}
                {ctaButton}
                {phoneLink}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end px-6 lg:px-8 md:hidden">
            {mobileDrawer}
          </div>
        </header>
        {sticky && (
          <NavSpacer
            fallbackHeight={cn(
              'transition-all duration-300 ease-out',
              collapsed ? 'h-14' : 'h-20',
            )}
          />
        )}
      </>
    )
  }

  // ── Variant: minimal — brand left, CTA right, no visible links ──
  // Sliver: shrinks height on scroll, brand mark stays.
  if (variant === 'minimal') {
    return (
      <>
        <header
          ref={scrollRef}
          className={cn(
            headerClasses,
            'transition-all duration-300 ease-out',
            collapsed && 'shadow-sm',
            props.className,
          )}
        >
          <nav
            className={cn(
              'mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-300 ease-out lg:px-8',
              collapsed ? 'h-12' : heightClass,
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
        {sticky && (
          <NavSpacer fallbackHeight={collapsed ? 'h-12' : heightClass} />
        )}
      </>
    )
  }

  // ── Variant: split — brand left, links right, CTA far right ──
  // Sliver: shrinks height on scroll.
  if (variant === 'split') {
    return (
      <>
        <header
          ref={scrollRef}
          className={cn(
            headerClasses,
            'transition-all duration-300 ease-out',
            collapsed && 'shadow-sm',
            props.className,
          )}
        >
          <nav
            className={cn(
              'mx-auto flex max-w-7xl items-center gap-8 px-6 transition-all duration-300 ease-out lg:px-8',
              collapsed ? 'h-12' : heightClass,
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
        {sticky && (
          <NavSpacer fallbackHeight={collapsed ? 'h-12' : heightClass} />
        )}
      </>
    )
  }

  // ── Variant: default — brand left, links center, CTA right ──
  // Sliver: shrinks height on scroll.
  return (
    <>
      <header
        ref={scrollRef}
        className={cn(
          headerClasses,
          'transition-all duration-300 ease-out',
          collapsed && 'shadow-sm',
          props.className,
        )}
      >
        <nav
          className={cn(
            'mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-300 ease-out lg:px-8',
            collapsed ? 'h-12' : heightClass,
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
      {sticky && (
        <NavSpacer fallbackHeight={collapsed ? 'h-12' : heightClass} />
      )}
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
    const isFixed = position === 'fixed'
    const fallback = HEIGHT_VARIANT_FALLBACK[height ?? 'default'] ?? 'h-20'
    if (bare) {
      return (
        <>
          <Comp
            data-slot="site-nav"
            className={headerClasses}
            ref={ref}
            {...props}
          >
            {children}
          </Comp>
          {isFixed && <NavSpacer fallbackHeight={fallback} />}
        </>
      )
    }
    return (
      <>
        <Comp
          data-slot="site-nav"
          className={headerClasses}
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
        </Comp>
        {isFixed && <NavSpacer fallbackHeight={fallback} />}
      </>
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
