import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  ProcessStep,
  ProcessTimeline,
  ProcessGrid,
} from '#/section-kit/ProcessTimeline.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * EventPlannerProcess — kinetic-poster inverted "how we work" band. A full ink
 * inversion (foreground background, background text) that cuts in on a slanted
 * clip-path seam: a mono uppercase meta rule with a primary square and a tabular
 * step count above a left-aligned giant tight-tracked heading and lede, then a
 * 4-column collapsed-border step ledger whose cells share hairline rules and
 * carry giant ghost numeral watermarks, mono primary step labels, bold titles,
 * and relaxed descriptions. Use to explain a planning workflow (Discovery,
 * Design, Planning, Execution) for event/wedding planners or service businesses.
 */
export const EventPlannerProcess = defineCapsule({
  name: 'EventPlannerProcess',
  description:
    "Kinetic-poster inverted 'how we work' band: a full ink-inverted section (foreground background, background text) that cuts in on a slanted clip-path seam, with a mono uppercase meta rule + primary square + tabular step count, a left-aligned giant tight-tracked heading and lede, and a 4-column collapsed-border step ledger whose cells share hairline rules and carry giant ghost numeral watermarks, mono primary step labels, bold titles, and relaxed descriptions. Use to explain a planning workflow (e.g. Discovery, Design, Planning, Execution) for event/wedding planners, agencies, or service businesses.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    steps: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const processEyebrow = props.eyebrow ?? 'Our Process'
    const processHeading = props.heading ?? 'How We Work'
    const processDesc =
      props.description ??
      'A proven four-step approach that ensures every event exceeds expectations while respecting your time and vision.'
    const processSteps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Discovery',
            description:
              'We begin with an in-depth consultation to understand your vision, preferences, budget, and the feeling you want to create. This is where the magic begins.',
          },
          {
            title: 'Design',
            description:
              'Our creative team develops a comprehensive concept including mood boards, color palettes, venue recommendations, and vendor selections tailored to your story.',
          },
          {
            title: 'Planning',
            description:
              'We handle all logistics: contract negotiations, timeline creation, RSVP management, and coordination meetings. You stay informed without the stress.',
          },
          {
            title: 'Execution',
            description:
              'On the big day, we manage every detail from setup to breakdown. You simply enjoy the moment while we ensure everything unfolds perfectly.',
          },
        ]

    return (
      <ProcessTimeline
        variant="inverted"
        className={cn(
          // Slanted top edge: the inverted band starts on a diagonal seam
          // (clip-path on the band itself keeps it neighbor-independent).
          'relative overflow-hidden py-16 pt-24 [clip-path:polygon(0_0,100%_3rem,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-28 lg:pt-36',
          props.className,
        )}
      >
        <Container size="xl" className="relative">
          <div className="mb-10 flex items-center justify-between gap-4 border-b border-background/20 pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              {processEyebrow}
            </span>
            <span className="tabular-nums">
              {String(processSteps.length).padStart(2, '0')} steps
            </span>
          </div>

          <SectionHeading
            align="left"
            title={processHeading}
            subtitle={processDesc}
            className="mb-10 max-w-3xl gap-4 sm:mb-14 lg:mb-16"
            titleClassName="text-4xl font-extrabold tracking-tighter text-background sm:text-5xl lg:text-6xl"
            subtitleClassName="max-w-xl text-lg text-background/60"
          />

          <ProcessGrid
            columns={4}
            className="gap-0 border-l border-t border-background/20"
          >
            {processSteps.map((step, i) => (
              <ProcessStep
                key={step.title}
                className="relative border-b border-r border-background/20 p-6 sm:p-8"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-4 select-none font-mono text-6xl font-bold tabular-nums leading-none text-background/15 sm:right-5 sm:top-5 sm:text-7xl"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                  Step {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 text-xl font-bold tracking-tight text-background">
                  {step.title}
                </h3>
                <p className="mt-3 leading-relaxed text-background/70">
                  {step.description}
                </p>
              </ProcessStep>
            ))}
          </ProcessGrid>
        </Container>
      </ProcessTimeline>
    )
  },
})
