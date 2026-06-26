import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

export const WebinarSchedule = defineComponent({
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
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={subheading}
          />

          <ul className="mt-14 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card text-card-foreground">
            {items.map((item, i) => (
              <li
                key={`${item.title}-${i}`}
                className="flex flex-col gap-2 px-6 py-6 sm:flex-row sm:gap-8"
              >
                <p className="shrink-0 text-sm font-semibold tabular-nums text-primary sm:w-24">
                  {item.time}
                </p>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {item.blurb}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    )
  },
})
