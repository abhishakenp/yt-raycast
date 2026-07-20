import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { GraphPaper, MonoTag } from '#/section-kit/Decor.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  ProcessTimeline,
  ProcessGrid,
  ProcessStep,
} from '#/section-kit/ProcessTimeline.tsx'

/**
 * ArchitectureFirmProcess — blueprint phase-schedule process section for an
 * architecture-studio / design-practice page. Over a faint graph-paper wash:
 * an asymmetric header row — mono annotation rail ("03 /" + eyebrow +
 * hairline rule) and huge ultra-thin heading on the left, an aria-hidden mono
 * "SCALE 1:100 / REV. C" annotation on the right — above a full-width
 * measurement dimension line with end ticks, then a collapsed-border
 * 1/3-column grid of phase cells. Each hairline cell carries a giant
 * ultra-thin ghost ordinal, a mono "PHASE 01" tag, a light title and a
 * paragraph. Precise, monochrome, drafting-table calm. Tokens-only, no links.
 * Use as a process / methodology / how-it-works / "our approach" timeline
 * (discovery, design development, realization) for architecture firms, design
 * studios, interior designers or any service practice that wants to explain
 * its workflow. Renders fully with no props via three baked-in steps.
 */
export const ArchitectureFirmProcess = defineCapsule({
  name: 'ArchitectureFirmProcess',
  description:
    'Blueprint phase-schedule process section for an architecture-studio / design-practice page: over a faint graph-paper wash, an asymmetric header row (mono annotation rail + huge ultra-thin heading left, aria-hidden mono scale annotation right) above a full-width measurement dimension line with end ticks, then a collapsed-border 1/3-column grid of hairline phase cells — each with a giant ultra-thin ghost ordinal, a mono "PHASE 01" tag, a light title and a paragraph. Precise, monochrome, drafting-table calm. Tokens-only, no links. Use as a process / methodology / how-it-works / "our approach" timeline (discovery, design development, realization) for architecture firms, design studios, interior designers or any service practice explaining its workflow.',
  props: z.object({
    /** Wide letter-spaced eyebrow label. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Process steps: title + description (numbered automatically). */
    steps: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'How We Work'
    const heading = props.heading ?? 'Our Process'
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Discovery & Strategy',
            description:
              "We begin with deep listening—understanding your needs, the site's constraints and opportunities, and the broader context. This phase includes site analysis, programming, and establishing project goals.",
          },
          {
            title: 'Design Development',
            description:
              'Through iterative exploration, we develop concepts into refined solutions. Physical models, detailed drawings, and material studies help us perfect every detail before construction begins.',
          },
          {
            title: 'Realization',
            description:
              'We maintain involvement through construction, conducting site reviews and collaborating closely with builders to ensure the built work matches the design intent.',
          },
        ]

    return (
      <ProcessTimeline
        aria-labelledby="architecture-firm-process-heading"
        className={cn(
          'relative overflow-hidden py-16 sm:py-24 lg:py-28',
          props.className,
        )}
      >
        <GraphPaper className="inset-y-0 right-0 w-1/2 [mask-image:linear-gradient(to_left,black,transparent)]" />
        <Container className="relative">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-12">
            <div className="max-w-2xl">
              <div className="mb-6 flex items-center gap-4">
                <MonoTag className="shrink-0 text-foreground">03 /</MonoTag>
                <MonoTag className="shrink-0">{eyebrow}</MonoTag>
                <span aria-hidden="true" className="h-px w-16 bg-border" />
              </div>
              <SectionHeading
                align="left"
                title={heading}
                titleId="architecture-firm-process-heading"
                className="gap-0"
                titleClassName="text-4xl font-extralight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              />
            </div>
            <MonoTag
              aria-hidden="true"
              className="shrink-0 text-muted-foreground/50"
            >
              Scale 1:100 / Rev. C
            </MonoTag>
          </div>

          {/* Full-width measurement dimension line above the phase cells. */}
          <span
            aria-hidden="true"
            className="mb-0 flex items-center gap-2 pb-8 text-border"
          >
            <span className="h-2.5 w-px bg-current" />
            <span className="h-px flex-1 bg-current" />
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {String(steps.length).padStart(2, '0')} phases
            </span>
            <span className="h-px flex-1 bg-current" />
            <span className="h-2.5 w-px bg-current" />
          </span>

          <ProcessGrid
            columns={3}
            className="grid-cols-1 gap-0 border-l border-t border-border sm:grid-cols-3"
          >
            {steps.map((step, i) => (
              <ProcessStep
                key={step.title}
                className="relative overflow-hidden border-b border-r border-border p-6 sm:p-8"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-2 -top-6 select-none text-[6rem] font-extralight leading-none tracking-tighter text-foreground/[0.06] sm:text-[7rem]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="relative">
                  <MonoTag className="text-foreground">
                    Phase {String(i + 1).padStart(2, '0')}
                  </MonoTag>
                  <h3 className="mb-3 mt-5 text-xl font-light tracking-tight text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </ProcessStep>
            ))}
          </ProcessGrid>
        </Container>
      </ProcessTimeline>
    )
  },
})
