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
import { Watermark } from '#/section-kit/Decor.tsx'

export const WebinarSchedule = defineCapsule({
  name: 'WebinarSchedule',
  description:
    'Kinetic-event agenda ledger for a webinar or virtual event on an asymmetric 5/7 split: a left header (mono index eyebrow + oversized heading + lede) beside a hairline collapsed-border session ledger whose rows pair a mono tabular start time with a topic title and a short blurb and highlight on hover. A giant ghost watermark bleeds behind. Use to show prospective attendees exactly what the session will walk through, segment by segment, on a webinar registration page.',
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
          'relative overflow-hidden bg-background py-20 text-foreground lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-right-6 top-10 text-[7rem] leading-none sm:text-[12rem] lg:text-[15rem]">
          AGENDA
        </Watermark>
        <Container size="lg" className="relative">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <SectionHeading
                align="left"
                eyebrow={`02 / ${eyebrow}`}
                title={heading}
                subtitle={subheading}
                className="gap-4 lg:sticky lg:top-28"
                eyebrowClassName="text-muted-foreground"
                titleClassName="text-4xl font-extrabold tracking-tight sm:text-5xl"
                subtitleClassName="text-lg text-muted-foreground"
              />
            </div>
            <div className="lg:col-span-7">
              <ScheduleList
                layout="timeline"
                className="border-t border-foreground"
              >
                {items.map((item, i) => (
                  <ScheduleItem
                    key={`${item.title}-${i}`}
                    className="group flex-row items-baseline gap-4 border-b border-border p-4 transition-colors hover:bg-muted sm:gap-6 sm:p-5"
                  >
                    <ScheduleTime className="w-20 shrink-0 border-r border-border pr-3 font-mono text-sm tabular-nums text-muted-foreground group-hover:text-primary sm:w-24">
                      {item.time}
                    </ScheduleTime>
                    <ScheduleContent>
                      <ScheduleTitle className="font-bold tracking-tight">
                        {item.title}
                      </ScheduleTitle>
                      <ScheduleDetail className="leading-6">
                        {item.blurb}
                      </ScheduleDetail>
                    </ScheduleContent>
                  </ScheduleItem>
                ))}
              </ScheduleList>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
