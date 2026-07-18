import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Card } from '#/section-kit/Card.tsx'
import {
  ScheduleList,
  ScheduleItem,
  ScheduleTime,
  ScheduleContent,
  ScheduleTitle,
  ScheduleDetail,
} from '#/section-kit/ScheduleList.tsx'
import { Container } from '#/section-kit/Container.tsx'

export const WebinarSchedule = defineCapsule({
  name: 'WebinarSchedule',
  description:
    'Agenda band for a webinar or virtual event: a SectionHeading over a vertical, divided list of timed agenda rows. Each row pairs an accented start time with a topic title and a short blurb describing what that segment covers. Use to show prospective attendees exactly what the session will walk through on a webinar registration page.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    items: z
      .array(
        z.object({
          time: z.string(),
          title: z.string(),
          blurb: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Agenda'
    const heading = props.heading ?? "What we'll cover"
    const subheading =
      props.subheading ??
      'Sixty focused minutes, mapped out segment by segment — plus live Q&A at the end.'
    const items = props.items?.length
      ? props.items
      : [
          {
            time: '11:00 AM',
            title: 'Welcome & the 2026 SaaS landscape',
            blurb:
              'Where the market is heading, the metrics that actually matter now, and how to read demand signals early.',
          },
          {
            time: '11:10 AM',
            title: 'From PMF to a repeatable growth engine',
            blurb:
              'Turning early traction into a system: positioning, pricing, and the first three channels worth your time.',
          },
          {
            time: '11:30 AM',
            title: 'Activation & retention that compounds',
            blurb:
              'The onboarding and lifecycle loops that quietly drive most of your net revenue retention.',
          },
          {
            time: '11:45 AM',
            title: 'Building the team & operating cadence',
            blurb:
              'How to structure growth, RevOps, and product so they push in the same direction every week.',
          },
          {
            time: '11:55 AM',
            title: 'Live Q&A',
            blurb:
              "Bring your hardest questions — we'll answer as many as we can before we wrap.",
          },
        ]

    return (
      <section
        className={cn(
          'bg-background py-20 text-foreground lg:py-28',
          props.className,
        )}
      >
        <Container size="sm" className="px-6 lg:px-6">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={subheading}
          />

          <Card
            asChild
            variant="default"
            rounded="2xl"
            padding="none"
            className="mt-14 overflow-hidden"
          >
            <ScheduleList layout="list">
              {items.map((item, i) => (
                <ScheduleItem key={`${item.title}-${i}`} className="px-6 py-6">
                  <ScheduleTime>{item.time}</ScheduleTime>
                  <ScheduleContent>
                    <ScheduleTitle>{item.title}</ScheduleTitle>
                    <ScheduleDetail className="leading-6">
                      {item.blurb}
                    </ScheduleDetail>
                  </ScheduleContent>
                </ScheduleItem>
              ))}
            </ScheduleList>
          </Card>
        </Container>
      </section>
    )
  },
})
