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
 * IllustratorNavbar — sticky, translucent top navigation bar for an illustrator
 * / visual-artist portfolio. A backdrop-blurred header pinned to the top: a
 * serif wordmark brand on the left, horizontal nav links in the center
 * (desktop), and a pill-shaped "Visit Shop" CTA plus a hamburger menu on the
 * right. Every link and the CTA route through route hrefs so labels drive
 * page-switching. Use as the sticky site header for illustrators, painters,
 * picture-book artists, surface designers, or any warm, editorial creative
 * portfolio. Renders fully with no props via baked-in "Mira Chen" defaults.
 */
export const IllustratorNavbar = defineCapsule({
  name: 'IllustratorNavbar',
  description:
    'Sticky translucent top navigation bar for an illustrator / visual-artist portfolio: backdrop-blurred header with a serif wordmark brand on the left, horizontal nav links in the center (desktop), a pill-shaped primary CTA and a hamburger menu on the right. Every link and CTA route through route hrefs for page-switching. Use as the sticky site header for illustrators, painters, picture-book artists, surface designers, or warm editorial creative portfolios.',
  props: z.object({
    /** Artist / brand name shown as the serif wordmark. */
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
    const brand = props.brand ?? 'Mira Chen'
    const nav = props.nav?.length
      ? props.nav
      : ['Work', 'Shop', 'About', 'Contact']
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaLabel = props.ctaLabel ?? 'Visit Shop'
    const ctaTarget = props.ctaTarget ?? 'Shop'
    const initialCartCount = Number.parseInt(props.cartCount ?? '0', 10) || 0

    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn('border-border/60 bg-background/95', props.className)}
      >
        <NavbarBrand
          href={homeTarget}
          className="font-serif text-xl tracking-tight transition-opacity hover:opacity-70 sm:text-2xl"
        >
          <BrandLogo brand={brand} className="mr-2 size-7 align-middle">
            <LogoImage className="mr-2 size-7 align-middle" />
            <LogoLabel />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} href={label}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-3">
          <CommerceSearchButton
            lakebed={lakebed}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground"
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
            className="hidden px-5 py-2.5 md:inline-flex"
          >
            {ctaLabel}
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
