import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * BarNightclubNavbar — fixed, translucent top navigation bar for a moody
 * cocktail-bar / nightclub site. A backdrop-blurred, hairline border-bottomed
 * header pinned to the top: a light-weight, wide letter-spaced uppercase brand
 * wordmark on the left, a horizontal set of muted nav links in the center
 * (desktop), an outlined "book a table" CTA on the right, and a hamburger menu
 * button on mobile. Brand routes to the first nav target, the CTA routes to the
 * last nav target, and every link routes through useNavigate so labels can drive
 * page-switching. Use as the sticky site header for cocktail bars, nightclubs,
 * lounges, speakeasies, or any dark, premium after-dark venue page. Renders
 * fully with no props via baked-in "NOIR" defaults.
 */
export const BarNightclubNavbar = defineComponent({
  name: 'BarNightclubNavbar',
  description:
    "Fixed translucent top navigation bar for a moody cocktail-bar / nightclub site: backdrop-blurred, hairline border-bottomed header pinned to the top with a light-weight wide letter-spaced uppercase brand wordmark on the left, horizontal muted nav links in the center (desktop), an outlined 'book a table' CTA on the right, and a hamburger menu button on mobile. Brand routes to the first nav target, the CTA to the last, and every link routes through useNavigate for page-switching. Use as the sticky site header for cocktail bars, nightclubs, lounges, speakeasies, or any dark premium after-dark venue page.",
  props: z.object({
    /** Bar / venue name shown as the uppercase wordmark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Outlined CTA label on the right. */
    cta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'NOIR'
    const nav = props.nav?.length
      ? props.nav
      : ['Events', 'Menu', 'Gallery', 'Reservations']
    const cta = props.cta ?? 'Book a Table'

    return (
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-20">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="text-2xl font-light uppercase tracking-[0.2em] text-foreground"
            >
              {brand}
            </button>
            <div className="hidden items-center gap-8 md:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(nav[nav.length - 1])}
              className="hidden items-center border border-foreground px-6 py-2 text-sm tracking-wide text-foreground transition-colors hover:bg-foreground hover:text-background md:inline-flex"
            >
              {cta}
            </button>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => go(nav[0])}
              className="p-2 text-foreground md:hidden"
            >
              <svg
                className="size-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>
    )
  },
})
