import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * MusicFestivalSchedule — a kinetic-poster three-day schedule ledger for a
 * music / arts festival landing page. An asymmetric mono-index header, then a
 * row of three square-cornered day cards, each with an inverted
 * (foreground-background) header carrying a mono day label, a big uppercase day
 * name and a date, a hairline-divided set list (set title + mono stage detail
 * on the left, tabular-nums time on the right), and a full-width outlined
 * "view full schedule" CTA with press feedback. Each day CTA routes through
 * section-kit route links. Use to lay out the daily program on music festivals,
 * arts festivals, concert series, or any multi-day live event.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Card } from '#/section-kit/Card.tsx'
import {
  EventList,
  EventCard,
  EventDate,
  EventDetails,
} from '#/section-kit/EventList.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const MusicFestivalSchedule = defineCapsule({
  name: 'MusicFestivalSchedule',
  description:
    "Kinetic-poster three-day schedule ledger for a music / arts festival landing page: an asymmetric mono-index header, then a row of three square-cornered day cards, each with an inverted (foreground background) header carrying a mono day label, a big uppercase day name and a date, a hairline-divided set list (set title + mono stage detail on the left, tabular-nums time on the right), and a full-width outlined 'view full schedule' CTA with press feedback. Each day CTA routes through section-kit route links. Use to lay out the daily program on music festivals, arts festivals, concert series, conferences-with-lineups, or any multi-day live event.",
  props: z.object({
    /** Eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Intro paragraph beneath the heading. */
    description: z.string().optional(),
    /** Day cards with their set lists. */
    days: z
      .array(
        z.object({
          label: z.string(),
          name: z.string(),
          date: z.string(),
          items: z.array(
            z.object({
              title: z.string(),
              detail: z.string(),
              time: z.string(),
            }),
          ),
          cta: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'The Schedule'
    const heading = props.heading ?? 'Festival Days'
    const description =
      props.description ??
      'Gates open at 2:00 PM daily. Music runs from 3:00 PM to 1:00 AM on Friday and Saturday, until midnight on Sunday.'
    const days = props.days?.length
      ? props.days
      : [
          {
            label: 'Day 1',
            name: 'Friday',
            date: 'August 15, 2025',
            items: [
              {
                title: 'Gates Open',
                detail: 'Welcome to the desert',
                time: '2:00 PM',
              },
              {
                title: 'Khruangbin',
                detail: 'Sunset Stage',
                time: '6:30 PM',
              },
              {
                title: 'Fred Again..',
                detail: 'Electronic Oasis',
                time: '8:00 PM',
              },
              {
                title: 'Arctic Monkeys',
                detail: 'Main Stage',
                time: '10:00 PM',
              },
              {
                title: 'Late Night Silent Disco',
                detail: 'Campground',
                time: '12:00 AM',
              },
            ],
            cta: 'View Full Friday Schedule',
          },
          {
            label: 'Day 2',
            name: 'Saturday',
            date: 'August 16, 2025',
            items: [
              {
                title: 'Sunrise Yoga',
                detail: 'Wellness Oasis',
                time: '7:00 AM',
              },
              {
                title: 'Caroline Polachek',
                detail: 'Sunset Stage',
                time: '5:30 PM',
              },
              {
                title: 'Rosalia',
                detail: 'Main Stage',
                time: '7:30 PM',
              },
              {
                title: 'Tame Impala',
                detail: 'Main Stage',
                time: '9:30 PM',
              },
              {
                title: 'Bicep DJ Set',
                detail: 'Electronic Oasis',
                time: '11:30 PM',
              },
            ],
            cta: 'View Full Saturday Schedule',
          },
          {
            label: 'Day 3',
            name: 'Sunday',
            date: 'August 17, 2025',
            items: [
              {
                title: 'Sound Healing',
                detail: 'Wellness Oasis',
                time: '9:00 AM',
              },
              {
                title: 'Big Thief',
                detail: 'Sunset Stage',
                time: '4:30 PM',
              },
              {
                title: 'Four Tet',
                detail: 'Electronic Oasis',
                time: '6:30 PM',
              },
              {
                title: 'LCD Soundsystem',
                detail: 'Main Stage',
                time: '8:30 PM',
              },
              {
                title: 'Closing Fireworks',
                detail: 'Main Stage',
                time: '11:30 PM',
              },
            ],
            cta: 'View Full Sunday Schedule',
          },
        ]
    return (
      <section
        className={cn(
          'bg-muted/40 pb-24 pt-24 sm:pt-28 lg:pb-28 lg:pt-32',
          props.className,
        )}
      >
        <Container>
          <div className="mb-14 flex flex-col gap-4 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
              titleClassName="text-4xl font-extrabold uppercase tracking-tight lg:text-6xl"
              subtitleClassName="max-w-xl text-lg text-foreground/70"
            />
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/40"
            >
              [ 3 days ]
            </span>
          </div>
          <EventList className="grid gap-6 md:grid-cols-3">
            {days.map((day, i) => (
              <EventCard asChild key={day.name}>
                <Card
                  variant="default"
                  className="overflow-hidden rounded-none border-border p-0"
                >
                  <div className="flex items-end justify-between bg-foreground p-6 text-background">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60">
                        {day.label}
                      </p>
                      <h3 className="mt-1 text-3xl font-extrabold uppercase tracking-tight">
                        {day.name}
                      </h3>
                      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-background/60">
                        {day.date}
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="font-mono text-5xl font-extrabold tabular-nums leading-none text-background/20"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="divide-y divide-border">
                    {(day.items ?? []).map((item) => (
                      <div
                        key={item.title}
                        className="flex items-start justify-between gap-3 px-6 py-3.5"
                      >
                        <EventDetails>
                          <p className="font-semibold tracking-tight">
                            {item.title}
                          </p>
                          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-card-foreground/60">
                            {item.detail}
                          </p>
                        </EventDetails>
                        <EventDate className="font-mono text-sm font-semibold tabular-nums text-foreground">
                          {item.time}
                        </EventDate>
                      </div>
                    ))}
                  </div>
                  <div className="p-6">
                    <NavbarRouteLink
                      className="block w-full rounded-none border border-foreground py-3 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.16em] transition-[transform,background-color] duration-150 hover:bg-foreground hover:text-background active:translate-y-px motion-reduce:transform-none"
                      href={day.cta}
                    >
                      {day.cta}
                    </NavbarRouteLink>
                  </div>
                </Card>
              </EventCard>
            ))}
          </EventList>
        </Container>
      </section>
    )
  },
})
