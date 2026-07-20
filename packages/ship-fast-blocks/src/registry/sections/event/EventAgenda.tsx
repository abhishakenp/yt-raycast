import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  ScheduleList,
  ScheduleItem,
  ScheduleTime,
  ScheduleContent,
  ScheduleTitle,
  ScheduleDetail,
} from '#/section-kit/ScheduleList.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * EventAgenda — kinetic-poster day-by-day agenda ledger for a conference or event
 * page. An asymmetric header (mono index eyebrow + oversized heading + lede) above
 * a two-column grid of day blocks; each day opens with a giant square day numeral
 * and a title + mono subtitle, followed by a hairline collapsed-border session
 * ledger where every row pairs a mono tabular time column with a session title and
 * detail, and highlights on hover. Use to lay out the full schedule of tech
 * conference, summit, multi-day workshop, or festival pages.
 */
export const EventAgenda = defineCapsule({
  name: 'EventAgenda',
  description:
    'Kinetic-poster day-by-day agenda ledger for a conference or event page: an asymmetric header (mono index eyebrow + oversized heading + lede) above a two-column grid of day blocks; each day opens with a giant square day numeral and a title + mono subtitle, followed by a hairline collapsed-border session ledger whose rows pair a mono tabular time column with a session title and detail and highlight on hover. Use to lay out the full schedule of tech conference, summit, multi-day workshop, meetup, or festival pages.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description beneath the heading. */
    description: z.string().optional(),
    /** Agenda days, each with a list of sessions. */
    days: z
      .array(
        z.object({
          dayNum: z.string(),
          title: z.string(),
          subtitle: z.string(),
          sessions: z.array(
            z.object({
              time: z.string(),
              title: z.string(),
              detail: z.string(),
            }),
          ),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Conference Agenda'
    const description =
      props.description ??
      'Two days packed with insights, workshops, and networking opportunities.'
    const days = props.days?.length
      ? props.days
      : [
          {
            dayNum: '12',
            title: 'Thursday, September 12',
            subtitle: 'Day One — Foundations & Strategy',
            sessions: [
              {
                time: '8:00',
                title: 'Registration & Breakfast',
                detail:
                  'Pick up your badge and enjoy coffee with fellow attendees',
              },
              {
                time: '9:30',
                title: 'Opening Keynote: The Future of Frontend',
                detail: 'Marcus Rodriguez — Main Stage',
              },
              {
                time: '10:30',
                title: 'Building Scalable Design Systems',
                detail: 'Sarah Chen — Theater A',
              },
              {
                time: '11:30',
                title: 'Coffee Break',
                detail: 'Networking in the Exhibition Hall',
              },
              {
                time: '12:00',
                title: 'Accessible Design for Everyone',
                detail: 'Priya Sharma — Theater B',
              },
              {
                time: '1:00',
                title: 'Lunch & Networking',
                detail:
                  'Catered lunch with vegetarian, vegan, and gluten-free options',
              },
              {
                time: '2:30',
                title: 'Workshop: React Server Components',
                detail: 'Marcus Rodriguez — Workshop Room 1',
              },
              {
                time: '4:00',
                title: 'Panel: Design/Dev Collaboration',
                detail: 'Multiple speakers — Main Stage',
              },
              {
                time: '5:30',
                title: 'Day One Closing',
                detail: 'Lightning talks from community members',
              },
            ],
          },
          {
            dayNum: '13',
            title: 'Friday, September 13',
            subtitle: 'Day Two — Advanced & Practical',
            sessions: [
              {
                time: '8:30',
                title: 'Breakfast Meetups',
                detail: 'Topic-based tables for focused networking',
              },
              {
                time: '9:30',
                title: 'Designing for Delight',
                detail: 'Emily Watson — Main Stage',
              },
              {
                time: '10:30',
                title: 'Web Performance Masterclass',
                detail: 'David Park — Theater A',
              },
              {
                time: '11:30',
                title: 'Coffee & Sponsor Demos',
                detail: 'Explore the latest tools in the Exhibition Hall',
              },
              {
                time: '12:00',
                title: 'Creative Coding in Production',
                detail: 'Alex Thompson — Theater B',
              },
              {
                time: '1:00',
                title: 'Lunch',
                detail: 'Food trucks in the courtyard',
              },
              {
                time: '2:30',
                title: 'Workshop: Advanced CSS',
                detail: 'James Mitchell — Workshop Room 1',
              },
              {
                time: '4:00',
                title: 'Research-Driven Design',
                detail: 'Lisa Nakamura — Theater A',
              },
              {
                time: '5:00',
                title: 'Closing Keynote & Party',
                detail: 'Main Stage followed by evening celebration',
              },
            ],
          },
        ]

    return (
      <section className={cn('py-20 lg:py-28', props.className)}>
        <Container size="lg">
          <SectionHeading
            align="left"
            eyebrow="04 / Schedule"
            title={heading}
            subtitle={description}
            className="mb-12 max-w-2xl gap-4"
            eyebrowClassName="text-muted-foreground"
            titleClassName="text-4xl font-extrabold tracking-tight sm:text-5xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <div className="grid gap-x-10 gap-y-14 lg:grid-cols-2">
            {days.map((day) => (
              <div key={day.title}>
                <div className="mb-6 flex items-center gap-4 border-b border-foreground pb-5">
                  <div className="grid size-14 shrink-0 place-items-center rounded-none bg-foreground text-2xl font-extrabold tabular-nums text-background">
                    {day.dayNum}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight">
                      {day.title}
                    </h3>
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      {day.subtitle}
                    </p>
                  </div>
                </div>
                <ScheduleList
                  layout="timeline"
                  className="border-t border-border"
                >
                  {day.sessions.map((s) => (
                    <ScheduleItem
                      key={`${day.dayNum}-${s.time}-${s.title}`}
                      className="group flex-row items-baseline gap-4 border-b border-border p-4 transition-colors hover:bg-muted"
                    >
                      <ScheduleTime className="w-14 shrink-0 border-r border-border pr-3 font-mono text-sm tabular-nums text-muted-foreground group-hover:text-primary">
                        {s.time}
                      </ScheduleTime>
                      <ScheduleContent>
                        <ScheduleTitle className="font-semibold tracking-tight">
                          {s.title}
                        </ScheduleTitle>
                        <ScheduleDetail className="text-sm text-muted-foreground">
                          {s.detail}
                        </ScheduleDetail>
                      </ScheduleContent>
                    </ScheduleItem>
                  ))}
                </ScheduleList>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
