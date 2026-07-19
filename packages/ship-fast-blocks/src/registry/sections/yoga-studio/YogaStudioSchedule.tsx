import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Card } from '#/section-kit/Card.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import {
  ScheduleList,
  ScheduleItem,
  ScheduleContent,
  ScheduleTitle,
  ScheduleDetail,
  ScheduleTime,
} from '#/section-kit/ScheduleList.tsx'

/**
 * YogaStudioSchedule — weekly class-schedule grid for a yoga-studio page. A
 * clean background band with a centered heading + intro above a responsive set
 * of day columns, each listing its classes with name, time, and teacher. Use to
 * show a studio's weekly timetable so visitors can find a class that fits their
 * routine. Renders fully with no props via baked-in defaults.
 */
export const YogaStudioSchedule = defineCapsule({
  name: 'YogaStudioSchedule',
  description:
    "Weekly class-schedule grid for a yoga-studio page: a clean band with a centered heading + intro above a responsive set of day columns, each listing its classes with name, time, and teacher. Use to show a studio's weekly timetable so visitors can find a class that fits their routine.",
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
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
        aria-labelledby="yoga-schedule-heading"
      >
        <Container size="xl" className="px-6">
          <SectionHeading
            title={heading}
            subtitle={subheading}
            titleId="yoga-schedule-heading"
            className="mb-16 max-w-3xl gap-0"
            titleClassName="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />

          <ResponsiveGrid cols="1-2-3" gap="sm">
            {days.map((day) => (
              <Card
                key={day.day}
                className="p-5 text-card-foreground rounded-2xl p-4"
              >
                <h3 className="border-b border-border pb-3 text-sm font-semibold uppercase tracking-wide text-foreground">
                  {day.day}
                </h3>
                <ScheduleList layout="timeline" className="mt-4 space-y-4">
                  {day.classes.map((cls) => (
                    <ScheduleItem
                      key={`${cls.name}-${cls.time}`}
                      className="flex-row items-start justify-between gap-3 sm:flex-row sm:gap-3"
                    >
                      <ScheduleContent>
                        <ScheduleTitle className="text-sm font-medium text-foreground">
                          {cls.name}
                        </ScheduleTitle>
                        <ScheduleDetail className="mt-0 text-xs text-muted-foreground">
                          with {cls.teacher}
                        </ScheduleDetail>
                      </ScheduleContent>
                      <ScheduleTime className="whitespace-nowrap text-xs font-medium text-accent sm:w-auto">
                        {cls.time}
                      </ScheduleTime>
                    </ScheduleItem>
                  ))}
                </ScheduleList>
              </Card>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
