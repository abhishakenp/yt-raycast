import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Card } from '#/section-kit/Card.tsx'

/**
 * WineryBreweryEvents — tastings, tours, and seasonal-event list for a winery
 * or brewery page. A centered eyebrow + serif heading + supporting line sit
 * above a responsive grid of event cards. Each card pairs a date badge with an
 * event name, a short blurb, an optional price, and a routable CTA, all
 * clickable through useNavigate to a booking / events target. Use to promote
 * sunset tastings, barrel-room tours, harvest festivals, member nights, or
 * live-music evenings for wineries, vineyards, cellar doors, breweries,
 * taprooms, or cideries. Renders fully with no props via baked-in defaults.
 */
export const WineryBreweryEvents = defineCapsule({
  name: 'WineryBreweryEvents',
  description:
    'Tastings, tours, and seasonal-event list for a winery or brewery page: centered eyebrow + serif heading + supporting line above a responsive grid of event cards. Each card pairs a date badge with an event name, a short blurb, an optional price, and a routable CTA, clicking through useNavigate to a booking / events target. Use to promote sunset tastings, barrel-room tours, harvest festivals, member nights, or live-music evenings for wineries, vineyards, breweries, taprooms, or cideries.',
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
    const go = useNavigate()
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
      <section className={cn('pt-28 pb-20 lg:pt-32 lg:pb-28', props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={description}
            titleClassName="font-serif"
            className="mb-16"
          />

          <div className="grid gap-6 md:grid-cols-2">
            {events.map((event) => (
              <Card
                asChild
                key={event.name}
                variant="default"
                rounded="2xl"
                padding="md"
                className="group flex flex-col gap-4 text-left transition-colors hover:border-primary sm:flex-row sm:items-start"
              >
                <button type="button" onClick={() => go(eventsTarget)}>
                  <span className="inline-flex shrink-0 items-center justify-center rounded-xl bg-muted px-4 py-3 text-center font-serif text-sm font-medium uppercase tracking-wide text-foreground">
                    {event.date}
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <h3 className="font-serif text-xl font-medium text-foreground transition-colors group-hover:text-primary">
                        {event.name}
                      </h3>
                      {event.price ? (
                        <span className="text-sm font-medium text-muted-foreground">
                          {event.price}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {event.blurb}
                    </p>
                    {event.cta ? (
                      <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                        {event.cta}
                        <span
                          aria-hidden="true"
                          className="ml-1 transition-transform group-hover:translate-x-0.5"
                        >
                          →
                        </span>
                      </span>
                    ) : null}
                  </div>
                </button>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
