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
} from '#/section-kit/index.ts'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAccountButton,
  CommerceCartButton,
  CommerceMobileMenu,
  CommerceSearchButton,
} from '../commerce/commerce-interactions.tsx'

/**
 * CafeNavbar — fixed, translucent newsprint-masthead navigation bar for a cozy
 * neighborhood cafe / coffee shop. A backdrop-blurred hairline-ruled header
 * pinned to the top: an inline owl brand mark + serif cafe wordmark on the
 * left, mono uppercase nav links in the center (desktop), menu command search,
 * Shoo account dropdown, shared Lakebed cart drawer, a sharp square mono CTA
 * with press feedback, and a real mobile drawer on the right. Every link and
 * the CTA route through route hrefs so labels drive page-switching. Use as the
 * sticky site header for cafes, bakeries, tea houses, brunch spots, or any
 * warm food-and-drink landing page.
 */
export const CafeNavbar = defineCapsule({
  name: 'CafeNavbar',
  description:
    'Fixed translucent newsprint-masthead navigation bar for a cozy cafe / coffee shop: backdrop-blurred hairline-ruled header with an inline owl brand mark + serif cafe wordmark on the left, mono uppercase nav links in the center (desktop), menu command search, Shoo account dropdown, shared Lakebed cart drawer with reactive badge, a sharp square mono primary CTA with press feedback, and a real mobile drawer on the right. Every link and CTA route through route hrefs for page-switching. Use as the sticky site header for cafes, bakeries, tea houses, brunch spots, or warm food-and-drink landing pages.',
  props: z.object({
    /** Cafe / brand name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the logo / hamburger clicks. */
    homeTarget: z.string().optional(),
    /** Pill-shaped CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the pill CTA. */
    ctaTarget: z.string().optional(),
    /** Initial cart badge fallback before Lakebed state is available. */
    cartCount: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'Little Owl Coffee'
    const nav = props.nav?.length
      ? props.nav
      : ['Menu', 'Our Story', 'Location', 'Reviews']
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaLabel = props.ctaLabel ?? 'Visit Us'
    const ctaTarget = props.ctaTarget ?? 'Location'
    const initialCartCount = Number.parseInt(props.cartCount ?? '0', 10) || 0

    const OwlMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M12 2C10.9 2 10 2.9 10 4C10 5.1 10.9 6 12 6C13.1 6 14 5.1 14 4C14 2.9 13.1 2 12 2ZM12 18C10.9 18 10 18.9 10 20C10 21.1 10.9 22 12 22C13.1 22 14 21.1 14 20C14 18.9 13.1 18 12 18ZM6 12C6 10.9 5.1 10 4 10C2.9 10 2 10.9 2 12C2 13.1 2.9 14 4 14C5.1 14 6 13.1 6 12ZM20 10C18.9 10 18 10.9 18 12C18 13.1 18.9 14 20 14C21.1 14 22 13.1 22 12C22 10.9 21.1 10 20 10ZM16.24 17.24L14.83 15.83C14.09 16.57 13.11 17 12 17C9.79 17 8 15.21 8 13C8 11.89 8.43 10.91 9.17 10.17L7.76 8.76C6.67 9.85 6 11.35 6 13C6 16.31 8.69 19 12 19C13.65 19 15.15 18.33 16.24 17.24ZM15.72 7.3C15.89 7.68 16 8.07 16 8.5C16 10.43 14.43 12 12.5 12C12.07 12 11.68 11.89 11.3 11.72L9.88 13.14C10.38 13.64 10.97 14.03 11.62 14.29L12 16.5L12.38 14.29C14.07 13.62 15.25 12 15.25 10.13C15.25 9.25 14.99 8.43 14.54 7.73L15.72 7.3Z" />
      </svg>
    )

    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn('bg-background/95', props.className)}
      >
        <NavbarBrand href={homeTarget} className="gap-3">
          <BrandLogo brand={brand} className="flex items-center gap-2.5">
            <LogoImage fallback={<OwlMark className="size-8 text-primary" />} />
            <LogoLabel className="font-serif text-lg font-medium tracking-tight text-foreground sm:text-xl" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="gap-8">
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="font-mono text-[11px] uppercase tracking-[0.18em]"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions>
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
          <NavbarCta
            variant="dark-pill"
            href={ctaTarget}
            className="hidden rounded-none border border-foreground bg-foreground px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.15em] text-background transition-colors duration-150 hover:bg-background hover:text-foreground sm:inline-flex active:translate-y-px"
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
