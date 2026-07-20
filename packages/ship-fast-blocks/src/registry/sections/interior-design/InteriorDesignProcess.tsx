import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  ProcessStep,
  ProcessTimeline,
  ProcessGrid,
} from '#/section-kit/ProcessTimeline.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'

/**
 * InteriorDesignProcess — editorial-spatial process ledger on a muted surface for
 * an upscale interior-design / architecture studio. An asymmetric header (mono
 * "04 / METHOD" rail + light-weight heading on the left, supporting paragraph on
 * the right) above a collapsed-hairline four-column step grid — each cell sharing
 * borders with a giant ghost two-digit ordinal watermark, a mono "STEP 0N" label,
 * a medium title and a short description. Editorial, airy, timeless, binary
 * radius. Use to explain a working methodology — discovery, concept, development,
 * delivery — for interior designers, design studios, architecture or renovation
 * firms. Renders fully with no props via baked-in defaults.
 */
export const InteriorDesignProcess = defineCapsule({
  name: 'InteriorDesignProcess',
  description:
    'Editorial-spatial process ledger on a muted surface for an upscale interior-design / architecture studio: an asymmetric header (mono "04 / METHOD" rail + light-weight heading on the left, supporting paragraph on the right) above a collapsed-hairline four-column step grid whose cells share borders and carry a giant ghost two-digit ordinal watermark, a mono "STEP 0N" label, a medium title and a short description. Editorial, airy, timeless, binary radius. Use to explain a working methodology such as discovery, concept, development and delivery for interior designers, design studios, architecture or renovation firms.',
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
    const eyebrow = props.eyebrow ?? 'Our Process'
    const heading = props.heading ?? 'How we work'
    const description =
      props.description ??
      'A refined approach to interior design that ensures every project receives the attention and expertise it deserves.'
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Discovery',
            description:
              'In-depth consultation to understand your vision, lifestyle, and spatial needs. We visit your site and assess every dimension.',
          },
          {
            title: 'Concept',
            description:
              'Mood boards, material palettes, and spatial layouts. We present 2-3 distinct design directions for your consideration.',
          },
          {
            title: 'Development',
            description:
              'Detailed drawings, 3D renderings, and furniture specifications. Every element is meticulously planned and documented.',
          },
          {
            title: 'Delivery',
            description:
              'Project management through installation and final styling. We ensure flawless execution down to the last accessory.',
          },
        ]

    return (
      <ProcessTimeline
        variant="muted"
        className={cn(
          'bg-muted/40 px-4 py-20 sm:px-6 md:py-28 lg:px-8',
          props.className,
        )}
      >
        <Container size="xl">
          <div className="mb-12 grid gap-6 md:mb-16 md:grid-cols-12 md:items-end md:gap-10">
            <div className="md:col-span-7">
              <MonoTag className="mb-5 flex items-center gap-3 tracking-[0.2em]">
                <span aria-hidden="true" className="size-2 bg-primary" />
                04 / {eyebrow}
              </MonoTag>
              <h2 className="max-w-lg text-balance text-3xl font-light tracking-tight text-foreground md:text-5xl">
                {heading}
              </h2>
            </div>
            <p className="max-w-md text-pretty leading-relaxed text-muted-foreground md:col-span-5 md:justify-self-end">
              {description}
            </p>
          </div>
          <ProcessGrid
            columns={4}
            className="grid-cols-1 gap-0 border-l border-t border-border sm:grid-cols-2 lg:grid-cols-4"
          >
            {steps.map((step, i) => (
              <ProcessStep
                key={step.title}
                className="relative overflow-hidden border-b border-r border-border p-6 sm:p-8"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-1 -top-3 select-none font-mono text-7xl font-extralight leading-none tabular-nums text-foreground/[0.06]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <MonoTag className="relative tracking-[0.2em] text-primary">
                  Step {String(i + 1).padStart(2, '0')}
                </MonoTag>
                <h3 className="relative mt-4 text-lg font-medium tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">
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
