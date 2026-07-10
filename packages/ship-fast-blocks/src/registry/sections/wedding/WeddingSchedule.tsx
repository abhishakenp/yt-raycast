import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Card } from '#/section-kit/Card.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

export const WeddingSchedule = defineCapsule({
  name: 'WeddingSchedule',
  description:
    'Event details band for a wedding site: a SectionHeading over a two-column grid of elegant cards covering the ceremony and reception. Each card shows a serif title plus labeled time, place, and dress-code rows with an optional note. Use to give guests the practical schedule and logistics on a wedding invitation or celebration page.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    events: z
      .array(
        z.object({
          title: z.string(),
          time: z.string(),
          place: z.string(),
          address: z.string(),
          dressCode: z.string(),
          note: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'The Details'
    const heading = props.heading ?? 'Ceremony & Reception'
    const subheading =
      props.subheading ??
      'Everything you need to know to celebrate the day with us — timings, locations, and what to wear.'
    const events = props.events?.length
      ? props.events
      : [
          {
            title: 'The Ceremony',
            time: '4:00 PM',
            place: 'Willowbrook Gardens',
            address: '1420 Vineyard Lane, Napa Valley, CA',
            dressCode: 'Garden formal',
            note: 'Arrive by 3:30 PM to find your seat among the roses.',
          },
          {
            title: 'The Reception',
            time: '6:00 PM',
            place: 'The Grand Pavilion',
            address: '1420 Vineyard Lane, Napa Valley, CA',
            dressCode: 'Cocktail attire',
          },
        ]

    return (
      <section
        className={cn(
          'bg-background py-20 text-foreground lg:py-32',
          props.className,
        )}
      >
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={subheading}
            titleClassName="font-serif"
          />

          <div className="mt-16 grid gap-8 md:grid-cols-2">
            {events.map((event, i) => (
              <Card
                key={`${event.title}-${i}`}
                padding="lg"
                className="text-card-foreground"
              >
                <h3 className="font-serif text-2xl font-medium text-foreground">
                  {event.title}
                </h3>
                <div className="mt-6 h-px w-12 bg-primary" aria-hidden="true" />

                <dl className="mt-6 space-y-4">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                      Time
                    </dt>
                    <dd className="mt-1 text-base text-foreground">
                      {event.time}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                      Place
                    </dt>
                    <dd className="mt-1 text-base text-foreground">
                      {event.place}
                    </dd>
                    <dd className="mt-1 text-sm text-muted-foreground">
                      {event.address}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                      Dress code
                    </dt>
                    <dd className="mt-1 text-base text-foreground">
                      {event.dressCode}
                    </dd>
                  </div>
                </dl>

                {event.note ? (
                  <p className="mt-6 border-t border-border pt-4 text-sm italic leading-6 text-muted-foreground">
                    {event.note}
                  </p>
                ) : null}
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
