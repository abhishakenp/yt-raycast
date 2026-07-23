import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarCta,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/SiteNav.tsx'
import { SignInButton } from '#/section-kit/SignInButton.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAccountButton,
  CommerceCartButton,
  CommerceMobileMenu,
  CommerceSearchButton,
} from '../commerce/commerce-interactions.tsx'

/**
 * WineryBreweryNavbar — sticky, artisan-editorial site header for a winery,
 * vineyard estate, or craft brewery / taproom. A warm serif wordmark beside an
 * inline grape-cluster mark anchors the left; the desktop nav links read as a
 * spaced mono-tracked label row; on the right sit a product/tasting command
 * search, a Shoo account dropdown, a shared Lakebed cart drawer with a reactive
 * badge, a tasting-room phone number, and a square-edged "Plan a Visit" CTA
 * (binary radius, label-stamp gravitas, press feedback) that collapses into a
 * real mobile drawer on small screens. Backdrop-blurred surface. Use as the
 * header for wineries, cellar doors, vineyards, breweries, taprooms, cideries,
 * or any rustic-premium drinks brand where bookings and visits matter.
 */
function GrapeClusterMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 4c1.2 0 2-1 2-2" />
      <path d="M12 7v0" />
      <circle cx="12" cy="9" r="2.1" />
      <circle cx="8.4" cy="12" r="2.1" />
      <circle cx="15.6" cy="12" r="2.1" />
      <circle cx="10.2" cy="15.4" r="2.1" />
      <circle cx="13.8" cy="15.4" r="2.1" />
      <circle cx="12" cy="19" r="2.1" />
    </svg>
  )
}

export const WineryBreweryNavbar = defineCapsule({
  name: 'WineryBreweryNavbar',
  description:
    "Sticky, artisan-editorial winery / brewery site header (vineyard estate or craft taproom): warm serif wordmark + inline grape-cluster mark, a spaced mono-tracked desktop nav row, product/tasting command search, Shoo account dropdown, shared Lakebed cart drawer with reactive badge, a tasting-room phone number, a square-edged 'Plan a Visit' CTA with press feedback, and a real mobile drawer, all on a backdrop-blurred surface. Use as the header for wineries, cellar doors, vineyards, breweries, taprooms, cideries, or any rustic-premium drinks brand where bookings and visits matter.",
  props: z.object({
    /** Winery / brewery brand name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Tasting-room phone number shown on the right (desktop). */
    phone: z.string().optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Pill-shaped CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the pill CTA. */
    ctaTarget: z.string().optional(),
    /** Initial cart badge fallback before Lakebed state is available. */
    cartCount: z.string().optional(),
    /** Label for the sign-in button. */
    signIn: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Wines', 'Visit', 'Events', 'Gallery', 'Contact']
    const brand = props.brand ?? 'Cellar & Cask'
    const homeTarget = props.homeTarget ?? nav[0]
    const phone = props.phone ?? '(707) 555-0148'
    const ctaLabel = props.ctaLabel ?? 'Plan a Visit'
    const ctaTarget = props.ctaTarget ?? 'Visit'
    const initialCartCount = Number.parseInt(props.cartCount ?? '0', 10) || 0
    const signIn = props.signIn ?? 'Sign in'

    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn('bg-background/95', props.className)}
      >
        <NavbarBrand href={homeTarget}>
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<GrapeClusterMark className="size-7 text-primary" />}
            />
            <LogoLabel className="font-serif text-xl font-medium text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="text-[13px] font-medium uppercase tracking-[0.12em] text-muted-foreground"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions>
          <SignInButton
            variant="ghost"
            label={signIn}
            className="hidden sm:block"
          />
          <CommerceSearchButton
            lakebed={lakebed}
            buttonClassName="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          />
          <CommerceAccountButton
            lakebed={lakebed}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground"
          />
          <CommerceCartButton
            lakebed={lakebed}
            fallbackCount={initialCartCount}
            buttonClassName="relative p-2 text-muted-foreground transition-colors hover:text-foreground"
          />
          {phone.trim() ? (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, '')}`}
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground lg:inline"
            >
              {phone}
            </a>
          ) : null}
          <NavbarCta
            variant="primary-pill"
            href={ctaTarget}
            className="hidden rounded-none px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-transform duration-150 active:translate-y-px sm:inline-flex"
          >
            {ctaLabel}
          </NavbarCta>
          <CommerceMobileMenu
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
