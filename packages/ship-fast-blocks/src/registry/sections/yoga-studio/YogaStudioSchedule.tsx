import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  ScheduleList,
  ScheduleItem,
  ScheduleTitle,
  ScheduleDetail,
  ScheduleTime,
} from '#/section-kit/ScheduleList.tsx'

/**
 * YogaStudioSchedule — hairline weekly-timetable ledger for a yoga-studio page.
 * The page's signature move: on a clean background under a giant lowercase ghost
 * watermark word, an asymmetric left-aligned header (mono index eyebrow + calm
 * clean-sans heading + grounding intro, mono day-count meta on the right) sits
 * above a collapsed-border schedule ledger. Each day is a hairline-divided
 * row-group pairing a mono uppercase day label and a tabular class count with a
 * stack of ledger lines — a mono tabular time, a clean-sans class name, and a
 * mono "with teacher" tag, `MON · 7:00 AM · VINYASA · WITH AVA` grammar. Use to
 * show a studio's weekly timetable so visitors can find a class that fits their
 * routine. Renders fully with no props via baked-in defaults.
 */
export const YogaStudioSchedule = defineCapsule({
  name: 'YogaStudioSchedule',
  description:
    "Hairline weekly-timetable ledger for a yoga-studio page — the page's signature move: a clean background with a giant lowercase ghost watermark word, an asymmetric left-aligned header (mono index eyebrow + calm clean-sans heading + grounding intro, mono day-count meta right) above a collapsed-border schedule ledger. Each day is a hairline-divided row-group pairing a mono uppercase day label and a tabular class count with ledger lines — a mono tabular time, a clean-sans class name, and a mono with-teacher tag. Use to show a studio's weekly timetable so visitors can find a class that fits their routine.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting intro under the heading. */
    subheading: z.string().optional(),
    /** Day columns, each with an ordered list of classes. */
    days: z
      .array(
        z.object({
          day: z.string(),
          classes: z.array(
            z.object({
              name: z.string(),
              time: z.string(),
              teacher: z.string(),
            }),
          ),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'This week at the studio'
    const subheading =
      props.subheading ??
      'Drop in to any class on the schedule — no experience required.'
    const days = props.days?.length
      ? props.days
      : [
          {
            day: 'Monday',
            classes: [
              { name: 'Slow Flow', time: '7:00 AM', teacher: 'Ava' },
              { name: 'Vinyasa Flow', time: '12:00 PM', teacher: 'Noah' },
              { name: 'Restorative', time: '6:30 PM', teacher: 'Mia' },
            ],
          },
          {
            day: 'Tuesday',
            classes: [
              { name: 'Hot Power', time: '6:30 AM', teacher: 'Leo' },
              { name: 'Yin & Stretch', time: '5:30 PM', teacher: 'Ava' },
            ],
          },
          {
            day: 'Wednesday',
            classes: [
              { name: 'Vinyasa Flow', time: '8:00 AM', teacher: 'Noah' },
              { name: 'Meditation', time: '12:15 PM', teacher: 'Mia' },
              { name: 'Slow Flow', time: '6:00 PM', teacher: 'Ava' },
            ],
          },
          {
            day: 'Thursday',
            classes: [
              { name: 'Hot Power', time: '6:30 AM', teacher: 'Leo' },
              { name: 'Restorative', time: '7:00 PM', teacher: 'Mia' },
            ],
          },
          {
            day: 'Friday',
            classes: [
              { name: 'Vinyasa Flow', time: '7:30 AM', teacher: 'Noah' },
              { name: 'Yin & Stretch', time: '5:30 PM', teacher: 'Ava' },
            ],
          },
          {
            day: 'Saturday',
            classes: [
              { name: 'Community Flow', time: '9:00 AM', teacher: 'Leo' },
              { name: 'Slow Flow', time: '11:00 AM', teacher: 'Mia' },
            ],
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
        aria-labelledby="yoga-schedule-heading"
      >
        <Watermark className="-bottom-6 -right-4 text-[6rem] font-semibold tracking-tight sm:text-[9rem] lg:text-[13rem]">
          practice
        </Watermark>
        <Container size="xl" className="relative px-6">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">03 / Timetable</MonoTag>
              <h2
                id="yoga-schedule-heading"
                className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]"
              >
                {heading}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">{subheading}</p>
            </div>
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:pb-2"
            >
              {String(days.length).padStart(2, '0')} / days
            </MonoTag>
          </div>

          <div className="border-t border-border">
            {days.map((day) => (
              <div
                key={day.day}
                className="grid gap-y-4 border-b border-border py-6 md:grid-cols-[12rem_1fr] md:gap-x-10 md:py-8"
              >
                <div className="flex items-baseline justify-between gap-3 md:flex-col md:items-start md:justify-start md:gap-2">
                  <span className="font-mono text-sm uppercase tracking-[0.2em] text-foreground">
                    {day.day}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground/70 tabular-nums">
                    {String(day.classes.length).padStart(2, '0')} classes
                  </span>
                </div>
                <ScheduleList layout="list" className="divide-y-0">
                  {day.classes.map((cls) => (
                    <ScheduleItem
                      key={`${cls.name}-${cls.time}`}
                      className="flex flex-col gap-0.5 border-t border-border py-3 first:border-t-0 sm:grid sm:grid-cols-[6.5rem_1fr_9rem] sm:items-baseline sm:gap-x-6 sm:gap-y-0"
                    >
                      <ScheduleTime className="w-auto shrink-0 font-mono text-sm font-medium tabular-nums text-foreground sm:w-auto">
                        {cls.time}
                      </ScheduleTime>
                      <ScheduleTitle className="text-base font-medium text-foreground">
                        {cls.name}
                      </ScheduleTitle>
                      <ScheduleDetail className="mt-0 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground sm:text-right">
                        with {cls.teacher}
                      </ScheduleDetail>
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
