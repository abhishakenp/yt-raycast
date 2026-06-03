import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * MusicFestivalNavbar — fixed, translucent top navigation bar for a music /
 * arts festival landing page. A blurred, border-bottomed header pinned to the
 * top with the festival wordmark on the left, a horizontal row of nav links in
 * the center, a primary pill "Get Tickets" CTA on the right, and a hamburger
 * menu button on mobile. Every nav link and the CTA route through useNavigate,
 * and the nav labels match site routes so page switching works. Use as the
 * sticky site header for music festivals, arts festivals, concert series,
 * camping/desert events, raves, or any multi-day ticketed live event.
 */
export const MusicFestivalNavbar = defineComponent({
  name: "MusicFestivalNavbar",
  description:
    "Fixed, translucent top navigation bar for a music / arts festival landing page: a blurred, border-bottomed header pinned to the top with the bold festival wordmark on the left, a horizontal row of nav links in the center, a primary pill 'Get Tickets' CTA on the right, and a hamburger menu button on mobile. Every nav link and the CTA route through useNavigate, and the nav labels match site routes so PageSwitch can swap pages. Use as the sticky site header for music festivals, arts festivals, concert series, camping/desert events, raves, or any multi-day ticketed live event.",
  props: z.object({
    /** Festival / brand name shown in the navbar. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Primary CTA button label. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the brand mark and mobile menu button. */
    homeTarget: z.string().optional(),
    /** Navigation target for the primary CTA button. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "HORIZON"
    const nav = props.nav?.length
      ? props.nav
      : ["Lineup", "Experience", "Schedule", "Tickets", "FAQ"]
    const ctaLabel = props.ctaLabel ?? "Get Tickets"
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaTarget = props.ctaTarget ?? "Buy Tickets"

    return (
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm",
          props.className,
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="text-xl font-bold tracking-tight lg:text-2xl"
          >
            {brand}
          </button>
          <div className="hidden items-center gap-8 md:flex">
            {nav.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => go(label)}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => go(ctaTarget)}
              className="hidden items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
            >
              {ctaLabel}
            </button>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => go(homeTarget)}
              className="p-2 md:hidden"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
      </header>
    )
  },
})
