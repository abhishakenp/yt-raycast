import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * LogisticsNavbar — sticky, backdrop-blurred top navigation bar for a global-
 * logistics / freight-forwarding company. A border-bottomed header pinned to the
 * top: a bolt-mark brand tile + wordmark on the left, a horizontal set of nav
 * links in the center (desktop), and a rounded primary CTA on the right, with a
 * hamburger menu button on mobile. Clean, corporate and trust-forward on a light
 * surface with a deep slate primary. Every link and the CTA route through
 * useNavigate so labels can drive page-switching. Use as the sticky site header
 * for logistics providers, freight forwarders, shipping carriers, courier,
 * warehousing, customs-brokerage or cargo/transport companies. Renders fully with
 * no props via baked-in "SwiftFreight" defaults.
 */
export const LogisticsNavbar = defineComponent({
  name: 'LogisticsNavbar',
  description:
    'Sticky, backdrop-blurred top navigation bar for a global-logistics / freight-forwarding company: a border-bottomed header pinned to the top with a bolt-mark brand tile + wordmark on the left, horizontal nav links in the center (desktop), and a rounded primary CTA on the right, plus a hamburger menu on mobile. Clean, corporate and trust-forward on a light surface with a deep slate primary. Links and CTA route through useNavigate for page-switching. Use as the sticky site header for logistics providers, freight forwarders, shipping carriers, courier, warehousing, customs-brokerage, supply-chain, fulfillment or cargo/transport companies.',
  props: z.object({
    /** Brand / company name shown beside the mark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (should match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Rounded primary CTA label on the right. */
    cta: z.string().optional(),
    /** Navigation target for the CTA button. */
    ctaTarget: z.string().optional(),
    /** Navigation target for the brand mark and mobile menu button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'SwiftFreight'
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'Track', 'About', 'Pricing', 'Contact']
    const cta = props.cta ?? 'Get a Quote'
    const ctaTarget = props.ctaTarget ?? cta
    const homeTarget = props.homeTarget ?? nav[0] ?? 'Services'

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          className="size-[60%]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </span>
    )

    return (
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-20">
            <button
              type="button"
              onClick={() => go(homeTarget)}
              className="flex items-center gap-2"
            >
              <LogoMark className="size-8" />
              <span className="text-xl font-semibold tracking-tight">
                {brand}
              </span>
            </button>

            <nav className="hidden items-center gap-8 lg:flex">
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
                onClick={() => go(ctaTarget)}
                className="hidden items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
              >
                {cta}
              </button>
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => go(homeTarget)}
                className="p-2 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
              >
                <svg
                  className="size-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
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
