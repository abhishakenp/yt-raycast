import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { TourList, TourItem } from '#/section-kit/TourList.tsx'

/**
 * MusicArtistTour — long tour-date list for a music artist / band page. A
 * centered eyebrow + thin heading + lead over a soft muted band, then a stacked
 * list of date rows (month/day block, venue + city, price/status, and a "Get
 * Tickets" pill that disables for sold-out shows), with a trailing "view all"
 * link with an arrow. Warm, airy, editorial indie-folk aesthetic. Each ticket
 * link and the view-all link route through useNavigate. Use as the live-dates /
 * tour schedule section for musicians, bands, or tour-promotion pages. Renders
 * fully with no props via baked-in defaults.
 */
export const MusicArtistTour = defineCapsule({
  name: 'MusicArtistTour',
  description:
    "Long tour-date list for a music artist / band page: a centered eyebrow, thin heading and lead over a soft muted band, then a stacked list of date rows (month/day block, venue and city, price/status, and a 'Get Tickets' pill that disables for sold-out shows), with a trailing 'view all' link with an arrow. Warm, airy editorial indie-folk aesthetic. Each ticket link and the view-all link route through useNavigate. Use as the live-dates / tour schedule section for musicians, bands, indie/folk acts, or tour-promotion pages.",
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
    const go = useNavigate()
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
          'bg-muted px-6 pt-28 pb-20 lg:px-8 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={description}
            align="center"
            eyebrowClassName="text-muted-foreground tracking-wide"
            titleClassName="text-3xl font-light lg:text-5xl"
            subtitleClassName="text-lg"
            className="mb-16 gap-6 lg:mb-24"
          />

          <TourList className="mx-auto max-w-3xl">
            {dates.map((date, i) => (
              <TourItem asChild key={`${date.venue}-${date.day}`}>
                <div
                  className={cn(
                    'group flex flex-col gap-4 py-6 transition-all hover:bg-card hover:px-6 sm:flex-row sm:items-center sm:gap-8',
                    i < dates.length - 1 && 'border-b border-border',
                  )}
                >
                <div className="w-20 shrink-0 text-center">
                  <p className="text-sm uppercase text-muted-foreground">
                    {date.month}
                  </p>
                  <p className="text-3xl font-light text-foreground">
                    {date.day}
                  </p>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{date.venue}</h3>
                  <p className="text-sm text-muted-foreground">{date.city}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      'text-sm',
                      date.soldOut
                        ? 'text-muted-foreground/60'
                        : 'text-muted-foreground',
                    )}
                  >
                    {date.price}
                  </span>
                  {date.soldOut ? (
                    <button
                      type="button"
                      disabled
                      className="cursor-not-allowed rounded-full border border-border px-5 py-2 text-sm text-muted-foreground/60"
                    >
                      Get Tickets
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => go(`Tickets ${date.venue}`)}
                      className="rounded-full border border-muted-foreground/40 px-5 py-2 text-sm text-foreground/80 transition-colors hover:border-foreground hover:bg-primary hover:text-primary-foreground"
                    >
                      Get Tickets
                    </button>
                  )}
                </div>
                </div>
              </TourItem>
            ))}
          </TourList>

          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => go(viewAll)}
              className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {viewAll}
              <ArrowRight className="ml-1 size-4" />
            </button>
          </div>
        </div>
      </section>
    )
  },
})
