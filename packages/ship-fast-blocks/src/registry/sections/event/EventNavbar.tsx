import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'
import {
  EventActionButton,
  EventMobileMenu,
  EventMutationSpinner,
  EventRegistrationBadge,
} from './event-interactions.tsx'
import { eventLakebed } from './event-lakebed.ts'

/**
 * EventNavbar — sticky translucent top navigation bar for a conference / event
 * landing page. A blurred, border-bottomed header pinned to the top with a square
 * brand-initials mark plus the event name on the left, a horizontal row of nav
 * links in the center, a shared registration badge, a real mobile Sheet menu,
 * and a primary "Get Tickets" CTA on the right. Nav links route through
 * useNavigate; the CTA records a Lakebed event/ticket action. Use as the sticky site header for tech conferences,
 * summits, meetups, workshops, festivals, webinars, or any ticketed event.
 */
export const EventNavbar = defineCapsule({
  name: 'EventNavbar',
  description:
    "Sticky translucent top navigation bar for a conference / event landing page: a blurred, border-bottomed header pinned to the top with a square brand-initials mark plus the event name on the left, a horizontal row of nav links in the center, a shared Lakebed registration badge, a real mobile Sheet menu, and a primary 'Get Tickets' CTA button on the right. Nav links route through useNavigate, and the CTA records a Lakebed event/ticket action. Use as the sticky site header for tech conferences, summits, meetups, workshops, festivals, webinars, hackathons, or any ticketed event.",
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
  lakebed: eventLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'DesignFront'
    const nav = props.nav?.length
      ? props.nav
      : ['Agenda', 'Speakers', 'Venue', 'Tickets']
    const ctaLabel = props.ctaLabel ?? 'Get Tickets'
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaTarget = props.ctaTarget ?? nav[nav.length - 1]

    return (
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur',
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
              <BrandLogo
                brand={brand}
                fallback={
                  <span
                    className="grid size-8 place-items-center rounded-lg bg-foreground text-sm font-bold text-background"
                    aria-hidden="true"
                  >
                    {brand.slice(0, 2).toUpperCase()}
                  </span>
                }
                labelClassName="text-lg font-semibold tracking-tight"
              />
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
            <div className="flex items-center gap-3">
              <EventRegistrationBadge lakebed={lakebed} />
              <EventActionButton
                lakebed={lakebed}
                action="ticket"
                label={ctaLabel}
                intentKey="navbar-ticket"
                source="navbar"
                tier={ctaTarget}
                pendingChildren={
                  <>
                    <EventMutationSpinner />
                    Reserving
                  </>
                }
                className="hidden items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70 sm:inline-flex"
              >
                {ctaLabel}
              </EventActionButton>
              <EventMobileMenu
                brand={brand}
                ctaLabel={ctaLabel}
                homeTarget={homeTarget}
                lakebed={lakebed}
                nav={nav}
                buttonClassName="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
              />
            </div>
          </div>
        </nav>
      </header>
    )
  },
})
