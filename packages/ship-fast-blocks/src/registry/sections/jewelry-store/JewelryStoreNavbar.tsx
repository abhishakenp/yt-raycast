import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * JewelryStoreNavbar — fixed, translucent top navigation bar for a luxury
 * fine-jewelry boutique on a near-black canvas. A backdrop-blurred bordered
 * header pinned to the top: a serif gold maison wordmark on the left,
 * wide letter-spaced uppercase nav links in the center (desktop), and a
 * search icon, wishlist icon, and an underlined "Book Appointment" CTA on
 * the right. Every link and the CTA route through useNavigate so labels
 * drive page-switching. Use as the sticky site header for fine jewelers,
 * diamond houses, engagement-ring boutiques, watch or high-jewelry maisons.
 * Renders fully with no props via baked-in "Maison Noir" defaults.
 */
export const JewelryStoreNavbar = defineComponent({
  name: 'JewelryStoreNavbar',
  description:
    'Fixed translucent top navigation bar for a luxury fine-jewelry boutique on a near-black canvas: backdrop-blurred bordered header with a serif gold maison wordmark on the left, wide letter-spaced uppercase nav links in the center (desktop), and search + wishlist icons plus an underlined Book Appointment CTA on the right. Every link and CTA route through useNavigate for page-switching. Use as the sticky site header for fine jewelers, diamond houses, engagement-ring boutiques, watch or high-jewelry maisons, or any premium luxury-retail brand.',
  props: z.object({
    /** Maison / brand name shown as the wordmark. */
    brand: z.string().optional(),
    /** Top-level nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the wordmark / search clicks. */
    homeTarget: z.string().optional(),
    /** Navigation target for the wishlist icon. */
    wishlistTarget: z.string().optional(),
    /** Underlined CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the Book Appointment CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Maison Noir'
    const nav = props.nav?.length
      ? props.nav
      : ['Collections', 'Pieces', 'Craftsmanship', 'Heritage']
    const homeTarget = props.homeTarget ?? nav[0]
    const wishlistTarget = props.wishlistTarget ?? nav[1] ?? nav[0]
    const ctaLabel = props.ctaLabel ?? 'Book Appointment'
    const ctaTarget = props.ctaTarget ?? 'Book Private Appointment'

    return (
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md',
          props.className,
        )}
      >
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <div className="flex h-20 items-center justify-between">
            <button
              type="button"
              onClick={() => go(homeTarget)}
              className="font-serif text-2xl tracking-wider text-primary"
            >
              {brand}
            </button>
            <nav className="hidden items-center space-x-10 md:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
                >
                  {label}
                </button>
              ))}
            </nav>
            <div className="flex items-center space-x-6">
              <button
                type="button"
                aria-label="Search"
                onClick={() => go(homeTarget)}
                className="text-muted-foreground transition-colors hover:text-primary"
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
              </button>
              <button
                type="button"
                aria-label="Wishlist"
                onClick={() => go(wishlistTarget)}
                className="text-muted-foreground transition-colors hover:text-primary"
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
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => go(ctaTarget)}
                className="hidden border-b border-primary pb-0.5 text-sm uppercase tracking-widest text-primary sm:block"
              >
                {ctaLabel}
              </button>
            </div>
          </div>
        </div>
      </header>
    )
  },
})
