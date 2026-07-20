import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'
import {
  EventActionButton,
  EventMobileMenu,
  EventMutationSpinner,
  EventRegistrationBadge,
} from './event-interactions.tsx'
import { eventLakebed } from './event-lakebed.ts'

/**
 * EventNavbar — sticky kinetic-poster top navigation bar for a conference / event
 * landing page. A blurred, hairline-bottomed header pinned to the top with a
 * square brand-initials mark plus the event name on the left, a horizontal row of
 * nav links, a shared registration badge, a real mobile Sheet menu, and a
 * square-edged mono-uppercase "Get Tickets" CTA on the right that carries a hard
 * offset shadow and presses down on click. Nav links route through route hrefs;
 * the CTA records a Lakebed event/ticket action. Use as the sticky site header for
 * tech conferences, summits, meetups, workshops, festivals, or any ticketed event.
 */
export const EventNavbar = defineCapsule({
  name: 'EventNavbar',
  description:
    "Sticky kinetic-poster top navigation bar for a conference / event landing page: a blurred, hairline-bottomed header pinned to the top with a square brand-initials mark plus the event name on the left, a horizontal row of nav links, a shared Lakebed registration badge, a real mobile Sheet menu, and a square-edged mono-uppercase 'Get Tickets' CTA button with a hard offset shadow and press feedback on the right. Nav links route through route hrefs, and the CTA records a Lakebed event/ticket action. Use as the sticky site header for tech conferences, summits, meetups, workshops, festivals, webinars, hackathons, or any ticketed event.",
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
    const brand = props.brand ?? 'DesignFront'
    const nav = props.nav?.length
      ? props.nav
      : ['Agenda', 'Speakers', 'Venue', 'Tickets']
    const ctaLabel = props.ctaLabel ?? 'Get Tickets'
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaTarget = props.ctaTarget ?? nav[nav.length - 1]

    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn(
          'border-border bg-background/90 backdrop-blur',
          props.className,
        )}
        containerClassName="max-w-6xl px-4 sm:px-6 lg:px-8"
      >
        <NavbarBrand href={homeTarget}>
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={
                <span
                  className="grid size-7 place-items-center rounded-none bg-foreground text-[11px] font-extrabold tracking-tight text-background"
                  aria-hidden="true"
                >
                  {brand.slice(0, 2).toUpperCase()}
                </span>
              }
            />
            <LogoLabel className="text-lg font-extrabold tracking-tight" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="[&>a]:font-mono [&>a]:text-[11px] [&>a]:uppercase [&>a]:tracking-[0.14em] [&>button]:font-mono [&>button]:text-[11px] [&>button]:uppercase [&>button]:tracking-[0.14em]">
          {nav.map((label) => (
            <NavbarNavLink key={label} href={label}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-3">
          <EventRegistrationBadge
            lakebed={lakebed}
            className="rounded-none border-primary/30 font-mono text-[11px] uppercase tracking-[0.12em]"
          />
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
            className="hidden items-center gap-2 rounded-none border border-foreground bg-primary px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-primary-foreground shadow-[3px_3px_0_0] shadow-foreground transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-[4px_4px_0_0] hover:shadow-foreground active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:pointer-events-none disabled:opacity-70 sm:inline-flex"
          >
            {ctaLabel}
          </EventActionButton>
          <EventMobileMenu
            brand={brand}
            ctaLabel={ctaLabel}
            homeTarget={homeTarget}
            lakebed={lakebed}
            nav={nav}
            buttonClassName="rounded-none p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
