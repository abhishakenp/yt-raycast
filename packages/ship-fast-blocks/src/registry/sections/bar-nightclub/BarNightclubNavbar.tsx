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
 * BarNightclubNavbar — fixed poster-marquee top navigation bar for a
 * dark-kinetic cocktail-bar / nightclub site. A backdrop-blurred header pinned
 * to the top with a heavy 2px bottom rule: a black-weight, wide letter-spaced
 * uppercase brand wordmark on the left, mono uppercase ticket-counter nav
 * links in the center (desktop), command search, Shoo account dropdown, shared
 * Lakebed cart drawer, a sharp inverted "book a table" block CTA with press
 * feedback on the right, and a real mobile drawer. Brand, links, and CTA route
 * through route hrefs so labels can drive page-switching. Use as the sticky
 * site header for cocktail bars, nightclubs, lounges, speakeasies, or any
 * dark, premium after-dark venue page.
 */
export const BarNightclubNavbar = defineCapsule({
  name: 'BarNightclubNavbar',
  description:
    "Fixed poster-marquee top navigation bar for a dark-kinetic cocktail-bar / nightclub site: backdrop-blurred header pinned to the top with a heavy 2px bottom rule, a black-weight wide letter-spaced uppercase brand wordmark on the left, mono uppercase ticket-counter nav links in the center (desktop), command search, Shoo account dropdown, shared Lakebed cart drawer with reactive badge, a sharp inverted 'book a table' block CTA with press feedback on the right, and a real mobile drawer. Brand, links, and CTA route through route hrefs for page-switching. Use as the sticky site header for cocktail bars, nightclubs, lounges, speakeasies, or any dark premium after-dark venue page.",
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
    /** Label for the sign-in button. */
    signIn: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'NOIR'
    const nav = props.nav?.length
      ? props.nav
      : ['Events', 'Menu', 'Gallery', 'Reservations']
    const cta = props.cta ?? 'Book a Table'
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaTarget = props.ctaTarget ?? nav[nav.length - 1]
    const initialCartCount = Number.parseInt(props.cartCount ?? '0', 10) || 0
    const signIn = props.signIn ?? 'Sign in'

    return (
      <SiteNav
        position="fixed"
        height="responsive"
        className={cn(
          'border-b-2 border-foreground bg-background/85 backdrop-blur-md',
          props.className,
        )}
      >
        <NavbarBrand
          href={homeTarget}
          className="text-xl font-black uppercase tracking-[0.3em] text-foreground"
        >
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage className="size-7" />
            <LogoLabel />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="[&>button]:font-mono [&>button]:text-[11px] [&>button]:font-semibold [&>button]:uppercase [&>button]:tracking-[0.2em]">
          {nav.map((label) => (
            <NavbarNavLink key={label} href={label}>
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
          <NavbarCta
            variant="outline"
            href={ctaTarget}
            className="hidden rounded-none border-2 border-foreground bg-foreground px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-background transition-all duration-100 hover:bg-background hover:text-foreground active:translate-y-px md:inline-flex"
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
