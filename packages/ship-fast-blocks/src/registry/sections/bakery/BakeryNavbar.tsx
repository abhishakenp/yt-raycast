import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * BakeryNavbar — sticky, blurred top navigation bar for an artisan-bakery /
 * craft-bread shop site. A border-bottomed, backdrop-blurred header pinned to
 * the top of the viewport: the bakery name as a wordmark on the left, a
 * horizontal set of nav links in the center (desktop), and an "Order Online"
 * pill CTA on the right plus a hamburger menu button on mobile. Warm, editorial,
 * light aesthetic with neutral surfaces. Every link and the CTA route through
 * useNavigate so labels can drive page-switching. Use as the sticky site header
 * for bakeries, patisseries, cafes, pastry kitchens, or any local food maker.
 * Renders fully with no props via baked-in "Flour & Stone" defaults.
 */
export const BakeryNavbar = defineComponent({
  name: 'BakeryNavbar',
  description:
    "Sticky, backdrop-blurred top navigation bar for an artisan-bakery / craft-bread shop site: a border-bottomed header pinned to the top with the bakery name as a wordmark on the left, horizontal nav links in the center (desktop), and an 'Order Online' pill CTA on the right plus a hamburger menu button on mobile. Warm, editorial, light aesthetic on neutral card surfaces; links and CTA route through useNavigate for page-switching. Use as the sticky site header for bakeries, patisseries, sourdough/artisan-bread shops, cafes, pastry kitchens, dessert and cake studios, or any local food maker.",
  props: z.object({
    /** Brand / bakery name shown as the wordmark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (should match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Label for the right-hand "Order Online" pill CTA. */
    orderCta: z.string().optional(),
    /** Navigation target for the order CTA and mobile menu. */
    orderTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Flour & Stone'
    const nav = props.nav?.length
      ? props.nav
      : ['Menu', 'Our Story', 'Gallery', 'Order', 'Visit']
    const orderCta = props.orderCta ?? 'Order Online'
    const orderTarget = props.orderTarget ?? 'Order'

    return (
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-20">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground lg:text-2xl"
            >
              {brand}
            </button>
            <nav className="hidden items-center gap-8 md:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => go(orderTarget)}
                className="hidden items-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90 sm:inline-flex"
              >
                {orderCta}
              </button>
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => go(nav[0])}
                className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
    )
  },
})
