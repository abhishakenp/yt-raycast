import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import {
  NavbarActions,
  NavbarRouteLink,
  NavbarBrand,
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
 * JewelryStoreNavbar — fixed, backdrop-blurred vitrine top navigation bar for a
 * luxury fine-jewelry maison. A hairline-bottomed translucent header pinned to
 * the top on the airiest chrome in the catalog: a large serif maison wordmark
 * on the left as the luxury signature, quietly spaced mono micro-label uppercase
 * nav links on the center-right (desktop), a trio of minimal-chrome commerce
 * icon actions (product command search, Shoo account dropdown, shared Lakebed
 * cart drawer with a reactive quantity badge), an underlined mono Book
 * Appointment CTA, and a real mobile drawer below lg. Every link and the CTA
 * route through route hrefs so labels drive page-switching. Use as the sticky
 * site header for fine jewelers, diamond houses, engagement-ring boutiques,
 * watch or high-jewelry maisons. Renders fully with no props via baked-in
 * "Maison Noir" defaults.
 */
export const JewelryStoreNavbar = defineCapsule({
  name: 'JewelryStoreNavbar',
  description:
    'Fixed, backdrop-blurred vitrine top navigation bar for a luxury fine-jewelry maison: a hairline-bottomed translucent header pinned to the top with a large serif maison wordmark on the left as the luxury signature, quietly spaced mono micro-label uppercase nav links on the center-right (desktop), a trio of minimal-chrome commerce actions on the right (product command search, Shoo account dropdown, shared Lakebed cart drawer with a reactive quantity badge), an underlined mono Book Appointment CTA, and a real mobile drawer below lg. Every link and CTA route through route hrefs for page-switching. Use as the sticky site header for fine jewelers, diamond houses, engagement-ring boutiques, watch or high-jewelry maisons, or any premium luxury-retail brand.',
  props: z.object({
    /** Maison / brand name shown as the wordmark. */
    brand: z.string().optional(),
    /** Top-level nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the wordmark. */
    homeTarget: z.string().optional(),
    /** Underlined CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the Book Appointment CTA. */
    ctaTarget: z.string().optional(),
    /** Initial cart badge fallback before Lakebed state is available. */
    cartCount: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'Maison Noir'
    const nav = props.nav?.length
      ? props.nav
      : ['Collections', 'Pieces', 'Craftsmanship', 'Heritage']
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaLabel = props.ctaLabel ?? 'Book Appointment'
    const ctaTarget = props.ctaTarget ?? 'Book Private Appointment'
    const initialCartCount = Number.parseInt(props.cartCount ?? '0', 10) || 0
    const utilityButtonClass =
      'p-2 text-muted-foreground transition-colors hover:text-foreground'

    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn('bg-background/90', props.className)}
        containerClassName="px-6 lg:px-12 xl:px-20"
      >
        <NavbarBrand href={homeTarget} className="flex items-center gap-2">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage className="size-7" />
            <LogoLabel className="font-serif text-2xl tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav breakpoint="lg" className="gap-10">
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="rounded-none px-0 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.24em] hover:bg-transparent hover:text-foreground"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-5">
          <CommerceSearchButton
            lakebed={lakebed}
            buttonClassName={utilityButtonClass}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </CommerceSearchButton>
          <CommerceAccountButton
            lakebed={lakebed}
            buttonClassName={utilityButtonClass}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
              />
            </svg>
          </CommerceAccountButton>
          <CommerceCartButton
            lakebed={lakebed}
            fallbackCount={initialCartCount}
            buttonClassName={cn('relative', utilityButtonClass)}
            label="Cart"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.35 12A1.5 1.5 0 0 1 19.466 22H4.534a1.5 1.5 0 0 1-1.49-1.493l1.35-12A1.5 1.5 0 0 1 5.884 7.2h12.232a1.5 1.5 0 0 1 1.49 1.307Z"
              />
            </svg>
          </CommerceCartButton>
          <NavbarRouteLink
            href={ctaTarget}
            className="hidden border-b border-foreground pb-1 font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-foreground transition-colors hover:border-muted-foreground hover:text-muted-foreground lg:inline-block"
          >
            {ctaLabel}
          </NavbarRouteLink>
          <CommerceMobileMenu
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
