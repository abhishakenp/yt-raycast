import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { EventList, EventCard } from '#/section-kit/EventList.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * WineryBreweryEvents — artisan-editorial tastings, tours, and seasonal-event
 * ledger for a winery or brewery page. A left-aligned mono meta rail + serif
 * heading + supporting line sit over a giant faint ghost watermark, then a
 * collapsed-border event ledger: each row is an [date · detail · price]
 * ledger line with a rotated mono date label-stamp, a serif event name, a
 * short blurb, an optional tabular mono price, and a routable arrow CTA — the
 * whole row clickable through section-kit route links to a booking / events
 * target with a warm hover tint and press feedback. Use to promote sunset
 * tastings, barrel-room tours, harvest festivals, member nights, or
 * live-music evenings for wineries, vineyards, cellar doors, breweries,
 * taprooms, or cideries. Renders fully with no props via baked-in defaults.
 */
export const WineryBreweryEvents = defineCapsule({
  name: 'WineryBreweryEvents',
  description:
    'Artisan-editorial tastings, tours, and seasonal-event ledger for a winery or brewery page: a left-aligned mono meta rail + serif heading + supporting line over a giant faint ghost watermark, then a collapsed-border event ledger. Each row pairs a rotated mono date label-stamp with a serif event name, a short blurb, an optional tabular mono price, and a routable arrow CTA, the whole row clicking through section-kit route links to a booking / events target with a warm hover tint and press feedback. Use to promote sunset tastings, barrel-room tours, harvest festivals, member nights, or live-music evenings for wineries, vineyards, breweries, taprooms, or cideries.',
  props: z.object({
    /** Small uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Upcoming events: date, name, blurb, optional price + CTA. */
    events: z
      .array(
        z.object({
          date: z.string(),
          name: z.string(),
          blurb: z.string(),
          price: z.string().optional(),
          cta: z.string().optional(),
        }),
      )
      .optional(),
    /** Navigation target when an event card / CTA is clicked. */
    eventsTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'On the estate'
    const heading = props.heading ?? 'Tastings, tours & gatherings'
    const description =
      props.description ??
      'Pull up a chair under the oaks or wander the cellar with our winemaker. Spots are limited and most evenings sell out — reserve ahead.'
    const eventsTarget = props.eventsTarget ?? 'Events'
    const events = props.events?.length
      ? props.events
      : [
          {
            date: 'Fri · Jun 27',
            name: 'Sunset Vineyard Tasting',
            blurb:
              'A guided flight of estate reds poured among the rows as the light fades, paired with local cheese and warm bread.',
            price: '$45 / guest',
            cta: 'Reserve a spot',
          },
          {
            date: 'Sat · Jul 12',
            name: 'Barrel Room Tour',
            blurb:
              'Step into the cellar with our winemaker to taste straight from the barrel and learn how each vintage is coaxed to life.',
            price: '$60 / guest',
            cta: 'Book the tour',
          },
          {
            date: 'Sun · Aug 24',
            name: 'Brewhouse & Vine Pairing',
            blurb:
              'An afternoon flight that runs barrel-aged ales beside estate wines, matched course by course with our kitchen.',
            price: '$55 / guest',
            cta: 'Save my seat',
          },
          {
            date: 'Sat · Sep 20',
            name: 'Harvest Festival',
            blurb:
              'Our biggest day of the year — grape stomping, live music under the oaks, food trucks, and the first pour of the new vintage.',
            price: 'Free entry',
            cta: 'Plan your day',
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden pt-24 pb-20 lg:pt-28 lg:pb-28',
          props.className,
        )}
      >
        <Watermark className="-top-8 -left-4 font-serif text-[7rem] font-medium italic sm:text-[11rem] lg:text-[15rem]">
          Estate
        </Watermark>

        <Container size="xl" className="relative px-6">
          <div className="mb-8 flex items-center gap-4">
            <span aria-hidden="true" className="size-1.5 shrink-0 bg-primary" />
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              {eyebrow}
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
          </div>

          <SectionHeading
            align="left"
            title={heading}
            subtitle={description}
            titleClassName="font-serif text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl"
            className="mb-14 max-w-2xl gap-5"
          />

          <EventList
            variant="list"
            className="space-y-0 border-t border-border"
          >
            {events.map((event) => (
              <EventCard
                asChild
                key={event.name}
                className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 border-b border-border py-6 text-left transition-colors duration-150 hover:bg-muted/40 active:translate-y-px sm:grid-cols-[8.5rem_1fr_auto] sm:items-baseline sm:gap-x-8"
              >
                <NavbarRouteLink href={eventsTarget}>
                  <span className="inline-flex h-fit -rotate-1 items-center justify-center self-start whitespace-nowrap border border-border bg-background px-3 py-2 text-center font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-foreground">
                    {event.date}
                  </span>
                  <div className="col-start-2 sm:col-start-2">
                    <h3 className="font-serif text-xl font-medium text-foreground transition-colors group-hover:text-primary">
                      {event.name}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                      {event.blurb}
                    </p>
                    {event.cta ? (
                      <span className="mt-4 inline-flex items-center font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-primary">
                        {event.cta}
                        <span
                          aria-hidden="true"
                          className="ml-1.5 transition-transform group-hover:translate-x-0.5"
                        >
                          →
                        </span>
                      </span>
                    ) : null}
                  </div>
                  {event.price ? (
                    <span className="col-start-2 font-mono text-sm font-medium tabular-nums text-muted-foreground sm:col-start-3 sm:text-right">
                      {event.price}
                    </span>
                  ) : null}
                </NavbarRouteLink>
              </EventCard>
            ))}
          </EventList>
        </Container>
      </section>
    )
  },
})
