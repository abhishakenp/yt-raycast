import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  ProcessTimeline,
  ProcessGrid,
  ProcessStep,
} from '#/section-kit/ProcessTimeline.tsx'

/**
 * ConsultingProcess — Swiss-authority inverted "How We Work" proof band for a
 * management-consulting firm page. The page's single full ink inversion
 * (foreground background, background text) cutting in on a slanted clip-path
 * seam: a mono uppercase metadata rule with a tabular step count above an
 * asymmetric 4:8 split — a sticky left rail holding the serif heading + lede,
 * and on the right a hairline step ledger where each row pairs a giant serif
 * ghost numeral with a title and description across shared hairline rules.
 * A giant ghost "04" watermark anchors the band. Tokens-only, no links. Use as
 * a methodology / workflow / how-it-works section for consulting firms,
 * professional-services groups, or B2B advisory businesses. Renders fully with
 * no props via four baked-in default steps.
 */
export const ConsultingProcess = defineCapsule({
  name: 'ConsultingProcess',
  description:
    "Swiss-authority inverted 'How We Work' proof band for a management-consulting firm page: a full ink-inverted section entering on a slanted clip-path seam, with a mono uppercase metadata rule + tabular step count above an asymmetric 4:8 split — sticky left rail with serif heading + lede, and a hairline step ledger on the right pairing giant serif ghost numerals with titles and descriptions across shared rules, under a giant ghost watermark. Tokens-only, no links. Use as a methodology / workflow / how-it-works section for consulting firms, professional-services groups, or B2B advisory businesses.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Process steps: title + description. */
    steps: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'How We Work'
    const description =
      props.description ??
      'Our proven methodology ensures every engagement delivers measurable, sustainable results.'
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Discovery & Diagnosis',
            description:
              'We begin by deeply understanding your business, conducting rigorous analysis of your market position, operations, and strategic challenges to identify the core issues.',
          },
          {
            title: 'Strategy Development',
            description:
              'Working collaboratively with your team, we develop tailored strategies that leverage your strengths and address your most critical opportunities and challenges.',
          },
          {
            title: 'Implementation Support',
            description:
              'We roll up our sleeves to help execute the strategy, providing hands-on support for organizational changes, process improvements, and capability building.',
          },
          {
            title: 'Sustained Impact',
            description:
              'We measure success by lasting results. We build your internal capabilities and establish mechanisms to ensure improvements endure long after our engagement.',
          },
        ]

    return (
      <ProcessTimeline
        variant="inverted"
        className={cn(
          // Slanted top seam: the ink band cuts in on a diagonal
          // (clip-path on the band itself keeps it neighbor-independent).
          'relative overflow-hidden py-16 pt-24 [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-28 lg:pt-36',
          props.className,
        )}
      >
        {/* Giant ghost step-count watermark. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-8 -right-4 select-none font-serif text-[9rem] font-bold leading-none tracking-tighter text-background/[0.05] sm:text-[14rem] lg:text-[19rem]"
        >
          04
        </span>

        <Container className="relative">
          <div className="mb-12 flex items-center justify-between gap-4 border-b border-background/20 pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-background/40" />
              03 / Method
            </span>
            <span className="tabular-nums">
              {String(steps.length).padStart(2, '0')} Steps
            </span>
          </div>

          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-4">
              <SectionHeading
                align="left"
                title={heading}
                subtitle={description}
                className="gap-4 lg:sticky lg:top-28"
                titleClassName="font-serif text-4xl font-bold tracking-tight text-background sm:text-5xl"
                subtitleClassName="max-w-md text-lg text-background/60"
              />
            </div>

            <ProcessGrid
              columns={2}
              className="grid-cols-1 gap-0 border-t border-background/20 md:grid-cols-1 lg:col-span-8"
            >
              {steps.map((step, i) => (
                <ProcessStep
                  key={step.title}
                  className="grid grid-cols-[auto_1fr] items-start gap-5 border-b border-background/20 py-7 sm:gap-8 sm:py-9"
                >
                  <span
                    aria-hidden="true"
                    className="select-none font-serif text-5xl font-bold leading-[0.9] tracking-tight text-background/25 tabular-nums sm:text-7xl"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/40 tabular-nums">
                      Phase {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-2 font-serif text-2xl font-bold tracking-tight text-background">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-2xl leading-relaxed text-background/60">
                      {step.description}
                    </p>
                  </span>
                </ProcessStep>
              ))}
            </ProcessGrid>
          </div>
        </Container>
      </ProcessTimeline>
    )
  },
})
