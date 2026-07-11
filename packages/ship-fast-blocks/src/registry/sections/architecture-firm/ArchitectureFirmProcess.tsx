import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'

/**
 * ArchitectureFirmProcess — numbered process / how-we-work section for an
 * architecture-studio / design-practice page. A centered eyebrow + light
 * heading above a responsive 1/3-column grid of steps; each step shows an
 * oversized faint two-digit ordinal behind a title + paragraph. Calm, editorial,
 * monochrome. Tokens-only, no links. Use as a process / methodology /
 * how-it-works / "our approach" timeline (discovery, design development,
 * realization) for architecture firms, design studios, interior designers or any
 * service practice that wants to explain its workflow. Renders fully with no
 * props via three baked-in steps.
 */
export const ArchitectureFirmProcess = defineCapsule({
  name: 'ArchitectureFirmProcess',
  description:
    "Numbered process / how-we-work section for an architecture-studio / design-practice page: a centered eyebrow + light heading above a responsive 1/3-column grid of steps, each with an oversized faint two-digit ordinal behind a title + paragraph. Calm, editorial, monochrome. Tokens-only, no links. Use as a process / methodology / how-it-works / 'our approach' timeline (discovery, design development, realization) for architecture firms, design studios, interior designers or any service practice explaining its workflow.",
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
      <section
        aria-labelledby="architecture-firm-process-heading"
        className={cn('py-24 lg:py-32', props.className)}
      >
        <Container>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
            <h2
              id="architecture-firm-process-heading"
              className="text-3xl font-light text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
            {steps.map((step, i) => (
              <div key={step.title} className="relative">
                <span className="absolute -left-2 -top-4 select-none text-7xl font-light text-muted-foreground/30">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="relative pt-8">
                  <h3 className="mb-3 text-lg font-medium text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
