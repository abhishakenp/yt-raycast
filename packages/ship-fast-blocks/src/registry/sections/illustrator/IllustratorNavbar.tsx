import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'
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
 * right. Every link and the CTA route through useNavigate so labels drive
 * page-switching. Use as the sticky site header for illustrators, painters,
 * picture-book artists, surface designers, or any warm, editorial creative
 * portfolio. Renders fully with no props via baked-in "Mira Chen" defaults.
 */
export const IllustratorNavbar = defineCapsule({
  name: 'IllustratorNavbar',
  description:
    'Sticky translucent top navigation bar for an illustrator / visual-artist portfolio: backdrop-blurred header with a serif wordmark brand on the left, horizontal nav links in the center (desktop), a pill-shaped primary CTA and a hamburger menu on the right. Every link and CTA route through useNavigate for page-switching. Use as the sticky site header for illustrators, painters, picture-book artists, surface designers, or warm editorial creative portfolios.',
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
    const go = useNavigate()
    const brand = props.brand ?? 'Mira Chen'
    const nav = props.nav?.length
      ? props.nav
      : ['Work', 'Shop', 'About', 'Contact']
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaLabel = props.ctaLabel ?? 'Visit Shop'
    const ctaTarget = props.ctaTarget ?? 'Shop'
    const initialCartCount = Number.parseInt(props.cartCount ?? '0', 10) || 0

    return (
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-sm',
          props.className,
        )}
      >
        <nav
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          <div className="flex h-16 items-center justify-between sm:h-20">
            <button
              type="button"
              onClick={() => go(homeTarget)}
              className="font-serif text-xl tracking-tight transition-opacity hover:opacity-70 sm:text-2xl"
            >
              <BrandLogo brand={brand} className="mr-2 size-7 align-middle" />
            </button>
            <div className="hidden items-center gap-8 md:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
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
              <button
                type="button"
                onClick={() => go(ctaTarget)}
                className="rounded-full bg-foreground px-5 py-2.5 text-sm text-background transition-colors hover:bg-muted-foreground"
              >
                {ctaLabel}
              </button>
            </div>
            <div className="flex items-center gap-3 md:hidden">
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
              <CommerceMobileMenu
                brand={brand}
                nav={nav}
                homeTarget={homeTarget}
                buttonClassName="p-2 text-foreground"
              />
            </div>
          </div>
        </nav>
      </header>
    )
  },
})
