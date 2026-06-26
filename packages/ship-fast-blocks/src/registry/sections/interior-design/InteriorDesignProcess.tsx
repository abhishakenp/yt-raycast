import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * InteriorDesignProcess — numbered process band on a muted surface for an
 * upscale interior-design / architecture studio. A centered uppercase eyebrow +
 * light-weight heading + supporting paragraph above a responsive four-column row
 * of steps, each prefixed with a large faded two-digit ordinal (01–04) over a
 * medium title and a short description. Editorial, airy and timeless. Use to
 * explain a working methodology — discovery, concept, development, delivery —
 * for interior designers, design studios, architecture or renovation firms.
 * Renders fully with no props via baked-in defaults.
 */
export const InteriorDesignProcess = defineComponent({
  name: 'InteriorDesignProcess',
  description:
    'Numbered process band on a muted surface for an upscale interior-design / architecture studio: a centered uppercase eyebrow + light-weight heading + supporting paragraph above a responsive four-column row of steps, each prefixed with a large faded two-digit ordinal (01–04) over a medium title and a short description. Editorial, airy and timeless. Use to explain a working methodology such as discovery, concept, development and delivery for interior designers, design studios, architecture or renovation firms.',
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
      <section
        className={cn(
          'bg-muted px-4 py-20 sm:px-6 md:py-32 lg:px-8',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-16 max-w-2xl text-center md:mb-24">
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mb-6 text-3xl font-light text-foreground md:text-4xl">
              {heading}
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-4 md:gap-6 lg:gap-12">
            {steps.map((step, i) => (
              <div key={step.title} className="relative">
                <span className="absolute -left-2 -top-4 text-5xl font-extralight text-muted-foreground/40">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="pt-12">
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
        </div>
      </section>
    )
  },
})
