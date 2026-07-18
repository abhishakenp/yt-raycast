import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
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
 * BarNightclubNavbar — fixed, translucent top navigation bar for a moody
 * cocktail-bar / nightclub site. A backdrop-blurred, hairline border-bottomed
 * header pinned to the top: a light-weight, wide letter-spaced uppercase brand
 * wordmark on the left, a horizontal set of muted nav links in the center
 * (desktop), command search, Shoo account dropdown, shared Lakebed cart drawer,
 * an outlined "book a table" CTA on the right, and a real mobile drawer. Brand,
 * links, and CTA route through useNavigate so labels can drive page-switching.
 * Use as the sticky site header for cocktail bars, nightclubs, lounges,
 * speakeasies, or any dark, premium after-dark venue page.
 */
export const BarNightclubNavbar = defineCapsule({
  name: 'BarNightclubNavbar',
  description:
    "Fixed translucent top navigation bar for a moody cocktail-bar / nightclub site: backdrop-blurred, hairline border-bottomed header pinned to the top with a light-weight wide letter-spaced uppercase brand wordmark on the left, horizontal muted nav links in the center (desktop), command search, Shoo account dropdown, shared Lakebed cart drawer with reactive badge, an outlined 'book a table' CTA on the right, and a real mobile drawer. Brand, links, and CTA route through useNavigate for page-switching. Use as the sticky site header for cocktail bars, nightclubs, lounges, speakeasies, or any dark premium after-dark venue page.",
  props: z.object({
    /** Bar / venue name shown as the uppercase wordmark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Outlined CTA label on the right. */
    cta: z.string().optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Navigation target for the CTA. */
    ctaTarget: z.string().optional(),
    /** Initial cart badge fallback before Lakebed state is available. */
    cartCount: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'NOIR'
    const nav = props.nav?.length
      ? props.nav
      : ['Events', 'Menu', 'Gallery', 'Reservations']
    const cta = props.cta ?? 'Book a Table'
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaTarget = props.ctaTarget ?? nav[nav.length - 1]
    const initialCartCount = Number.parseInt(props.cartCount ?? '0', 10) || 0

    return (
      <SiteNav
        position="fixed"
        height="responsive"
        className={cn('bg-background/80 backdrop-blur-md', props.className)}
      >
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="text-2xl font-light uppercase tracking-[0.2em] text-foreground"
          >
            <BrandLogo brand={brand} className="mr-2 size-7 align-middle">
              <LogoImage className="mr-2 size-7 align-middle" />
              <LogoLabel />
            </BrandLogo>
          </button>
        </NavbarBrand>

        <NavbarNav className="[&>button]:tracking-wide">
          {nav.map((label) => (
            <NavbarNavLink key={label} onClick={() => go(label)}>
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
            variant="outline"
            onClick={() => go(ctaTarget)}
            className="hidden border-foreground px-6 py-2 tracking-wide hover:bg-foreground hover:text-background md:inline-flex"
          >
            {cta}
          </NavbarCta>
          <CommerceMobileMenu
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            buttonClassName="p-2 text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
