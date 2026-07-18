import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import {
  NavbarActions,
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
 * JewelryStoreNavbar — fixed, translucent top navigation bar for a luxury
 * fine-jewelry boutique on a near-black canvas. A backdrop-blurred bordered
 * header pinned to the top: a serif gold maison wordmark on the left,
 * wide letter-spaced uppercase nav links in the center (desktop), and a
 * product command search, Shoo account dropdown, shared cart drawer, mobile
 * drawer, and an underlined "Book Appointment" CTA on the right. Every link and
 * the CTA route through useNavigate so labels drive page-switching. Use as the
 * sticky site header for fine jewelers, diamond houses, engagement-ring
 * boutiques, watch or high-jewelry maisons. Renders fully with no props via
 * baked-in "Maison Noir" defaults.
 */
export const JewelryStoreNavbar = defineCapsule({
  name: 'JewelryStoreNavbar',
  description:
    'Fixed translucent top navigation bar for a luxury fine-jewelry boutique on a near-black canvas: backdrop-blurred bordered header with a serif gold maison wordmark on the left, wide letter-spaced uppercase nav links in the center (desktop), product command search, Shoo account dropdown, shared Lakebed cart drawer with a reactive quantity badge, a real mobile drawer, and an underlined Book Appointment CTA on the right. Every link and CTA route through useNavigate for page-switching. Use as the sticky site header for fine jewelers, diamond houses, engagement-ring boutiques, watch or high-jewelry maisons, or any premium luxury-retail brand.',
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
    const go = useNavigate()
    const brand = props.brand ?? 'Maison Noir'
    const nav = props.nav?.length
      ? props.nav
      : ['Collections', 'Pieces', 'Craftsmanship', 'Heritage']
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaLabel = props.ctaLabel ?? 'Book Appointment'
    const ctaTarget = props.ctaTarget ?? 'Book Private Appointment'
    const initialCartCount = Number.parseInt(props.cartCount ?? '0', 10) || 0
    const utilityButtonClass =
      'text-muted-foreground transition-colors hover:text-primary'

    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn('bg-background/90', props.className)}
        containerClassName="px-6 lg:px-12 xl:px-20"
      >
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="font-serif text-2xl tracking-wider text-primary"
          >
            <BrandLogo brand={brand} className="mr-2 size-7 align-middle">
              <LogoImage className="mr-2 size-7 align-middle" />
              <LogoLabel />
            </BrandLogo>
          </button>
        </NavbarBrand>

        <NavbarNav className="[&>button]:uppercase [&>button]:tracking-widest [&>button]:hover:text-primary">
          {nav.map((label) => (
            <NavbarNavLink key={label} onClick={() => go(label)}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-6">
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
          <button
            type="button"
            onClick={() => go(ctaTarget)}
            className="hidden border-b border-primary pb-0.5 text-sm uppercase tracking-widest text-primary sm:block"
          >
            {ctaLabel}
          </button>
          <CommerceMobileMenu
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            buttonClassName="text-muted-foreground transition-colors hover:text-primary md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
