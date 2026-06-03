import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * EventNavbar — sticky translucent top navigation bar for a conference / event
 * landing page. A blurred, border-bottomed header pinned to the top with a square
 * brand-initials mark plus the event name on the left, a horizontal row of nav
 * links in the center, and a primary "Get Tickets" CTA on the right. Every link
 * and the CTA route through useNavigate, and the nav labels match site routes so
 * page switching works. Use as the sticky site header for tech conferences,
 * summits, meetups, workshops, festivals, webinars, or any ticketed event.
 */
export const EventNavbar = defineComponent({
  name: "EventNavbar",
  description:
    "Sticky translucent top navigation bar for a conference / event landing page: a blurred, border-bottomed header pinned to the top with a square brand-initials mark plus the event name on the left, a horizontal row of nav links in the center, and a primary 'Get Tickets' CTA button on the right. Every nav link and the CTA route through useNavigate, and the nav labels match site routes so PageSwitch can swap pages. Use as the sticky site header for tech conferences, summits, meetups, workshops, festivals, webinars, hackathons, or any ticketed event.",
  props: z.object({
    /** Brand / event name shown in the navbar. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Primary CTA button label. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the brand mark. */
    homeTarget: z.string().optional(),
    /** Navigation target for the primary CTA button. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "DesignFront"
    const nav = props.nav?.length
      ? props.nav
      : ["Agenda", "Speakers", "Venue", "Tickets"]
    const ctaLabel = props.ctaLabel ?? "Get Tickets"
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaTarget = props.ctaTarget ?? nav[nav.length - 1]

    return (
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur",
          props.className,
        )}
      >
        <nav
          className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          <div className="flex h-16 items-center justify-between">
            <button
              type="button"
              onClick={() => go(homeTarget)}
              className="flex items-center gap-2"
            >
              <span
                className="grid size-8 place-items-center rounded-lg bg-foreground text-sm font-bold text-background"
                aria-hidden="true"
              >
                {brand.slice(0, 2).toUpperCase()}
              </span>
              <span className="text-lg font-semibold tracking-tight">
                {brand}
              </span>
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
            </div>
            <button
              type="button"
              onClick={() => go(ctaTarget)}
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {ctaLabel}
            </button>
          </div>
        </nav>
      </header>
    )
  },
})
