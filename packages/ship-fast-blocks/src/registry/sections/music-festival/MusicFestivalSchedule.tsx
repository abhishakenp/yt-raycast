import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * MusicFestivalSchedule — a three-day schedule grid for a music / arts festival
 * landing page. A centered eyebrow + heading + intro, then a row of three day
 * cards, each with a primary-filled header (day label, name, date), a timed
 * set list (title + stage detail on the left, time on the right), and a
 * full-width outlined "view full schedule" CTA. Each day CTA routes through
 * useNavigate. Use to lay out the daily program on music festivals, arts
 * festivals, concert series, or any multi-day live event.
 */
export const MusicFestivalSchedule = defineCapsule({
  name: 'MusicFestivalSchedule',
  description:
    "Three-day schedule grid for a music / arts festival landing page: a centered eyebrow + heading + intro paragraph, then a row of three day cards, each with a primary-filled header (day label, name, date), a timed set list (set title + stage detail on the left, time on the right), and a full-width outlined 'view full schedule' CTA. Each day CTA routes through useNavigate. Use to lay out the daily program on music festivals, arts festivals, concert series, conferences-with-lineups, or any multi-day live event.",
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
    const go = useNavigate()
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
              { title: 'Khruangbin', detail: 'Sunset Stage', time: '6:30 PM' },
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
              { title: 'Rosalia', detail: 'Main Stage', time: '7:30 PM' },
              { title: 'Tame Impala', detail: 'Main Stage', time: '9:30 PM' },
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
              { title: 'Big Thief', detail: 'Sunset Stage', time: '4:30 PM' },
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
      <section className={cn('py-24 lg:py-32', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
              {eyebrow}
            </p>
            <h2 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">
              {heading}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-foreground/70">
              {description}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {days.map((day) => (
              <div
                key={day.name}
                className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground"
              >
                <div className="bg-primary p-6 text-primary-foreground">
                  <p className="mb-1 text-sm opacity-70">{day.label}</p>
                  <h3 className="text-2xl font-bold">{day.name}</h3>
                  <p className="mt-1 text-sm opacity-70">{day.date}</p>
                </div>
                <div className="space-y-4 p-6">
                  {(day.items ?? []).map((item) => (
                    <div
                      key={item.title}
                      className="flex items-start justify-between"
                    >
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-sm text-card-foreground/60">
                          {item.detail}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-primary">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="px-6 pb-6">
                  <button
                    type="button"
                    onClick={() => go(day.cta)}
                    className="w-full rounded-lg border border-border py-3 text-center text-sm font-medium transition-colors hover:bg-accent"
                  >
                    {day.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
