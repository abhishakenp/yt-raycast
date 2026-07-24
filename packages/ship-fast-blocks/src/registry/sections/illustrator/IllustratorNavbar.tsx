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
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAccountButton,
  CommerceCartButton,
  CommerceMobileMenu,
  CommerceSearchButton,
} from '../commerce/commerce-interactions.tsx'

/**
 * IllustratorNavbar — sticky sketchbook header for an illustrator / visual-artist
 * portfolio. A backdrop-blurred bar sealed to the page with a hand-drawn dashed
 * bottom rule: a serif wordmark on the left, plain-text nav links in the middle
 * (desktop), and a rounded-full "sticker" CTA with a hard offset shadow that
 * presses flat on click, alongside search / account / cart controls and a
 * hamburger menu. Every link and the CTA route through route hrefs so labels
 * drive page-switching. Use as the sticky site header for illustrators,
 * painters, picture-book artists, surface designers, or any warm hand-made
 * creative portfolio. Renders fully with no props via baked-in "Mira Chen"
 * defaults.
 */
export const IllustratorNavbar = defineCapsule({
  name: 'IllustratorNavbar',
  description:
    'Sticky sketchbook header for an illustrator / visual-artist portfolio: a backdrop-blurred bar with a hand-drawn dashed bottom rule, a serif wordmark on the left, plain-text nav links in the middle (desktop), a rounded-full sticker CTA with a hard offset shadow that presses flat, plus search / account / cart controls and a hamburger menu. Every link and CTA route through route hrefs for page-switching. Use as the sticky site header for illustrators, painters, picture-book artists, surface designers, or warm hand-made creative portfolios.',
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
        className={cn(
          'border-b-2 border-dashed border-border/70 bg-background/95',
          props.className,
        )}
      >
        <NavbarBrand
          href={homeTarget}
          className="font-serif text-xl tracking-tight transition-opacity hover:opacity-70 sm:text-2xl"
        >
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage className="size-7" />
            <LogoLabel />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="gap-6">
          {nav.map((label, i) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="rounded-none font-mono text-xs uppercase tracking-[0.14em] hover:bg-transparent hover:underline hover:decoration-primary hover:decoration-dashed hover:underline-offset-4"
            >
              <span
                aria-hidden="true"
                className="mr-1.5 text-muted-foreground/60"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
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
            className="hidden -rotate-2 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.14em] shadow-[3px_3px_0_0_var(--color-primary)] transition-[transform,box-shadow] duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--color-primary)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none md:inline-flex"
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
