import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { TourList, TourItem } from '#/section-kit/TourList.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * MusicArtistTour — inverted kinetic-poster tour-date ledger for a music artist
 * / band page. A foreground-colored band with a slanted clip-path top seam and a
 * giant "TOUR" ghost watermark holds an asymmetric header (mono rail + giant
 * uppercase heading + lead), then a collapsed-border ledger of date rows: a mono
 * month over a giant tabular day numeral, an uppercase venue with mono city, a
 * rotated mono ticket-stub price/status chip, and a sharp "Get Tickets" link
 * (disabled for sold-out shows). A trailing mono "view all" link closes it. Bold
 * poster energy driven entirely by theme tokens (flips light/dark); binary
 * rounded-none radius. Each ticket link and the view-all link route through
 * section-kit route links. Use as the live-dates / tour schedule section for
 * musicians, bands, or tour-promotion pages. Renders fully with no props via
 * baked-in defaults.
 */
export const MusicArtistTour = defineCapsule({
  name: 'MusicArtistTour',
  description:
    "Inverted kinetic-poster tour-date ledger for a music artist / band page: a foreground-colored band with a slanted clip-path top seam and a giant 'TOUR' ghost watermark holds an asymmetric header (mono rail + giant uppercase heading + lead), then a collapsed-border ledger of date rows — a mono month over a giant tabular day numeral, an uppercase venue with mono city, a rotated mono ticket-stub price/status chip, and a sharp 'Get Tickets' link (disabled for sold-out shows) — with a trailing mono 'view all' link. Bold poster energy driven entirely by theme tokens (flips light/dark); binary rounded-none radius. Each ticket link and the view-all link route through section-kit route links. Use as the live-dates / tour schedule section for musicians, bands, indie/folk acts, or tour-promotion pages.",
  props: z.object({
    /** Small uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Thin-weight section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Trailing "view all" link label. */
    viewAll: z.string().optional(),
    /** Tour-date rows. */
    dates: z
      .array(
        z.object({
          month: z.string(),
          day: z.string(),
          venue: z.string(),
          city: z.string(),
          price: z.string(),
          soldOut: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'On Tour'
    const heading = props.heading ?? 'Tour Dates 2026'
    const description =
      props.description ??
      'Join us for an evening of intimate folk melodies and stories.'
    const viewAll = props.viewAll ?? 'View all tour dates'
    const dates = props.dates?.length
      ? props.dates
      : [
          {
            month: 'Jun',
            day: '14',
            venue: 'Crystal Ballroom',
            city: 'Portland, OR',
            price: 'Sold Out',
            soldOut: true,
          },
          {
            month: 'Jun',
            day: '18',
            venue: 'The Showbox',
            city: 'Seattle, WA',
            price: '$28',
          },
          {
            month: 'Jun',
            day: '22',
            venue: 'Revolution Hall',
            city: 'Portland, OR',
            price: '$28',
          },
          {
            month: 'Jul',
            day: '03',
            venue: 'The Fillmore',
            city: 'San Francisco, CA',
            price: '$32',
          },
          {
            month: 'Jul',
            day: '08',
            venue: 'Hollywood Bowl',
            city: 'Los Angeles, CA',
            price: 'Selling Fast',
          },
          {
            month: 'Jul',
            day: '15',
            venue: 'Red Rocks Amphitheatre',
            city: 'Morrison, CO',
            price: '$45',
          },
          {
            month: 'Jul',
            day: '22',
            venue: 'First Avenue',
            city: 'Minneapolis, MN',
            price: '$28',
          },
          {
            month: 'Aug',
            day: '05',
            venue: 'Bowery Ballroom',
            city: 'New York, NY',
            price: 'Sold Out',
            soldOut: true,
          },
        ]

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="3" y1="12" x2="17" y2="12" />
        <polyline points="11 6 17 12 11 18" />
      </svg>
    )

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground px-6 pt-24 pb-20 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] lg:px-8 lg:pt-36 lg:pb-28',
          props.className,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-14 -right-4 select-none font-extrabold uppercase leading-none tracking-tighter text-background/[0.05] text-[10rem] sm:text-[15rem] lg:text-[20rem]"
        >
          Tour
        </span>

        <Container size="lg" className="relative">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-background/60">
                  {eyebrow}
                </span>
                <span
                  aria-hidden="true"
                  className="h-px w-16 bg-background/25"
                />
                <span
                  aria-hidden="true"
                  className="font-mono text-[11px] uppercase tracking-[0.22em] text-background/60"
                >
                  Live
                </span>
              </div>
              <h2 className="mt-5 text-4xl font-extrabold uppercase leading-[0.9] tracking-tighter text-background sm:text-5xl lg:text-6xl">
                {heading}
              </h2>
            </div>
            <p className="max-w-sm text-pretty text-background/70 md:text-right">
              {description}
            </p>
          </div>

          <TourList className="mt-12 gap-0 border-t border-background/15 lg:mt-16">
            {dates.map((date) => (
              <TourItem asChild key={`${date.venue}-${date.day}`}>
                <div className="group flex flex-col gap-4 border-b border-background/15 py-6 transition-colors hover:bg-background/5 sm:flex-row sm:items-center sm:gap-8 sm:px-2">
                  <div className="flex w-24 shrink-0 items-baseline gap-2 sm:block">
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60">
                      {date.month}
                    </p>
                    <p className="text-4xl font-extrabold leading-none tabular-nums text-background">
                      {date.day}
                    </p>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-extrabold uppercase tracking-tight text-background">
                      {date.venue}
                    </h3>
                    <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-background/60">
                      {date.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        'inline-flex rotate-1 items-center rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em]',
                        date.soldOut
                          ? 'border-background/25 text-background/50'
                          : 'border-background/40 text-background',
                      )}
                    >
                      {date.price}
                    </span>
                    {date.soldOut ? (
                      <button
                        type="button"
                        disabled
                        className="cursor-not-allowed rounded-none border border-background/20 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-background/40"
                      >
                        Get Tickets
                      </button>
                    ) : (
                      <NavbarRouteLink
                        className="rounded-none border border-background bg-background px-5 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-foreground transition-colors hover:bg-background/80 active:translate-y-px"
                        href={`Tickets ${date.venue}`}
                      >
                        Get Tickets
                      </NavbarRouteLink>
                    )}
                  </div>
                </div>
              </TourItem>
            ))}
          </TourList>

          <div className="mt-10">
            <NavbarRouteLink
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-background/60 transition-colors hover:text-background"
              href={viewAll}
            >
              {viewAll}
              <ArrowRight className="size-4" />
            </NavbarRouteLink>
          </div>
        </Container>
      </section>
    )
  },
})
