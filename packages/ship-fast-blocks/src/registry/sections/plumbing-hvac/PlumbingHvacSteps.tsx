import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  StepTimeline,
  StepTimelineGrid,
  StepItem,
} from '#/section-kit/StepTimeline.tsx'

/**
 * PlumbingHvacSteps — the inverted "How it works" band for a plumbing & HVAC
 * trade site, and the page's dramatic ink-inversion anchor. A full
 * bg-foreground / text-background section that opens on a slanted clip-path seam,
 * with a mono meta rule + tabular step count above a left-aligned extrabold
 * heading + intro, then a 3-column collapsed-border step ledger — each cell
 * sharing hairline rules and carrying a giant ghost numeral watermark, a mono
 * step label, a squared light number chip, a title, and a description. Defaults
 * walk a customer through the booking experience — Call us, We diagnose, We fix
 * it. Use to set expectations and reduce friction for homeowners calling a
 * plumber or HVAC contractor. Renders fully with no props via baked-in defaults.
 */
export const PlumbingHvacSteps = defineCapsule({
  name: 'PlumbingHvacSteps',
  description:
    "The inverted 'How it works' band for a plumbing & HVAC trade site and the page's ink-inversion anchor: a full bg-foreground / text-background section opening on a slanted clip-path seam, with a mono meta rule + tabular step count above a left-aligned extrabold heading + intro, then a 3-column collapsed-border step ledger whose cells share hairline rules and carry giant ghost numeral watermarks, mono step labels, squared light number chips, titles, and descriptions. Defaults walk a customer through the booking experience — Call us, We diagnose, We fix it. Use to set expectations and reduce friction for homeowners calling a plumber or HVAC contractor.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Optional supporting intro under the heading. */
    subheading: z.string().optional(),
    /** Ordered steps; each renders a numbered badge, title, and description. */
    steps: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Getting help is simple'
    const subheading =
      props.subheading ??
      'No runaround, no hidden fees. Three easy steps from your first call to a fully working home.'
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Call us',
            description:
              "Reach a real person 24/7. Tell us what's wrong and we'll book a same-day or next-day visit that fits your schedule.",
          },
          {
            title: 'We diagnose',
            description:
              'A licensed technician arrives on time, inspects the issue, and gives you a clear, upfront quote before any work begins.',
          },
          {
            title: 'We fix it',
            description:
              'We complete the repair or installation right the first time, clean up after ourselves, and back it with our guarantee.',
          },
        ]

    return (
      <StepTimeline
        variant="inverted"
        className={cn(
          // Slanted top seam: the inverted band starts on a diagonal
          // (clip-path on the band itself keeps it neighbor-independent).
          'relative overflow-hidden pb-20 pt-32 [clip-path:polygon(0_0,100%_3rem,100%_100%,0_100%)] lg:pb-28 lg:pt-40',
          props.className,
        )}
        aria-labelledby="plumbing-hvac-steps-heading"
      >
        <Container className="relative">
          <div className="mb-10 flex items-center justify-between gap-4 border-b-2 border-background/25 pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              How it works
            </span>
            <span className="tabular-nums">
              {String(steps.length).padStart(2, '0')} steps
            </span>
          </div>
          <SectionHeading
            title={heading}
            subtitle={subheading}
            titleId="plumbing-hvac-steps-heading"
            align="left"
            className="mb-12 max-w-3xl gap-0"
            titleClassName="mb-4 text-3xl font-extrabold tracking-tight text-background sm:text-4xl"
            subtitleClassName="text-lg text-background/60"
          />
          <StepTimelineGrid
            columns={3}
            className="gap-0 border-l-2 border-t-2 border-background/25"
          >
            {steps.map((step, i) => (
              <StepItem
                key={i}
                className="relative flex flex-col items-start border-b-2 border-r-2 border-background/25 p-6 text-left sm:p-8"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-5 top-4 select-none font-mono text-7xl font-extrabold leading-none tabular-nums text-background/[0.08]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="mb-5 grid size-12 place-items-center rounded-none bg-background text-xl font-extrabold tabular-nums text-foreground">
                  {i + 1}
                </span>
                <span className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
                  Step {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mb-2 text-lg font-bold tracking-tight text-background">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-background/70">
                  {step.description}
                </p>
              </StepItem>
            ))}
          </StepTimelineGrid>
        </Container>
      </StepTimeline>
    )
  },
})
