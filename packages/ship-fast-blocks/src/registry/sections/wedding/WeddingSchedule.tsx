import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Card } from '#/section-kit/Card.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  ScheduleList,
  ScheduleItem,
  ScheduleContent,
} from '#/section-kit/ScheduleList.tsx'

export const WeddingSchedule = defineCapsule({
  name: 'WeddingSchedule',
  description:
    'Romantic-editorial event-details band for a wedding site: a mono metadata rail (primary diamond + eyebrow, hairline rule, tabular event count) above a serif-italic heading and lede, then a two-column collapsed-border ledger of hairline-shared cells for the ceremony and reception. Each cell leads with a mono tabular time locator (e.g. 4:00 PM · 01 / 02), a serif-italic title, and mono-labeled place, address, and dress-code rows with an optional italic note. Use to give guests the practical schedule and logistics on a wedding invitation or celebration page.',
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
          'bg-background py-20 text-foreground lg:py-28',
          props.className,
        )}
      >
        <Container size="lg" className="px-6">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="size-1.5 rotate-45 bg-primary"
              />
              <MonoTag>{eyebrow}</MonoTag>
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <MonoTag aria-hidden="true" tone="faint" className="tabular-nums">
              {String(events.length).padStart(2, '0')} / events
            </MonoTag>
          </div>

          <div className="mt-8 max-w-2xl">
            <h2 className="font-serif text-4xl font-normal italic leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              {heading}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {subheading}
            </p>
          </div>

          <ScheduleList
            layout="grid"
            className="mt-12 grid-cols-1 gap-0 border-l border-t border-border sm:mt-16 sm:grid-cols-2"
          >
            {events.map((event, i) => (
              <ScheduleItem
                key={`${event.title}-${i}`}
                asChild
                className="flex-col"
              >
                <Card
                  variant="outline"
                  className="rounded-none border-0 border-b border-r border-border p-8 text-foreground sm:p-10"
                >
                  <ScheduleContent>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-mono text-lg tabular-nums tracking-[0.12em] text-primary">
                        {event.time}
                      </span>
                      <MonoTag
                        aria-hidden="true"
                        tone="faint"
                        className="tabular-nums"
                      >
                        {String(i + 1).padStart(2, '0')} /{' '}
                        {String(events.length).padStart(2, '0')}
                      </MonoTag>
                    </div>
                    <h3 className="mt-4 font-serif text-3xl font-normal italic text-foreground">
                      {event.title}
                    </h3>
                    <div
                      className="mt-6 h-px w-full bg-border"
                      aria-hidden="true"
                    />

                    <dl className="mt-6 space-y-5">
                      <div>
                        <dt>
                          <MonoTag tone="faint" className="tracking-[0.14em]">
                            Place
                          </MonoTag>
                        </dt>
                        <dd className="mt-1.5 text-base text-foreground">
                          {event.place}
                        </dd>
                        <dd className="mt-1 text-sm text-muted-foreground">
                          {event.address}
                        </dd>
                      </div>
                      <div>
                        <dt>
                          <MonoTag tone="faint" className="tracking-[0.14em]">
                            Dress code
                          </MonoTag>
                        </dt>
                        <dd className="mt-1.5 text-base text-foreground">
                          {event.dressCode}
                        </dd>
                      </div>
                    </dl>

                    {event.note ? (
                      <p className="mt-6 border-t border-border pt-4 font-serif text-sm italic leading-6 text-muted-foreground">
                        {event.note}
                      </p>
                    ) : null}
                  </ScheduleContent>
                </Card>
              </ScheduleItem>
            ))}
          </ScheduleList>
        </Container>
      </section>
    )
  },
})
