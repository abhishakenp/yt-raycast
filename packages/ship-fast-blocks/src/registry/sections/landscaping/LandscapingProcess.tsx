import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * LandscapingProcess — a centered-header "how we work" process band for a
 * landscaping / outdoor-design company on a soft accent surface. A heading +
 * description introduce a responsive 4-column row of numbered steps, each with a
 * solid round primary number badge, a title and a descriptive paragraph, joined
 * by a faint connector line between badges on desktop. Calm, organic and premium
 * with a sage-green accent. Use to explain an engagement / project workflow for
 * landscapers, garden designers, hardscaping contractors or maintenance services.
 * Renders fully with no props via baked-in four-step defaults.
 */
export const LandscapingProcess = defineComponent({
  name: 'LandscapingProcess',
  description:
    "Centered-header 'how we work' process band for a landscaping / outdoor-design company on a soft accent surface: a heading + description introduce a responsive 4-column row of numbered steps, each with a solid round primary number badge, a title and a descriptive paragraph, joined by a faint connector line between badges on desktop. Calm, organic and premium with a sage-green accent. Use to explain an engagement / project workflow (consultation, design, installation, care) for landscapers, garden designers, hardscaping contractors or maintenance services.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'How we work'
    const description =
      props.description ??
      'A proven process refined over 16 years and 500+ projects. Clear communication at every step.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Consultation',
            description:
              'Free 60-minute site visit. We assess your space, discuss your vision, and identify opportunities and constraints. No obligation.',
          },
          {
            title: 'Design',
            description:
              '2-3 weeks to create detailed plans and 3D renderings. Two revision rounds included. Transparent pricing with no hidden fees.',
          },
          {
            title: 'Installation',
            description:
              'Scheduled within 2-4 weeks of approval. Daily progress updates. Clean, respectful crews. Minimal disruption to your routine.',
          },
          {
            title: 'Care',
            description:
              "Optional maintenance packages. Seasonal check-ins. 2-year plant guarantee. We're with you long after the last stone is set.",
          },
        ]

    return (
      <section className={cn('bg-accent py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            {items.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="mb-6 flex size-12 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
                  {i + 1}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                {i < items.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="absolute left-12 top-6 hidden h-0.5 w-full bg-primary/20 md:block"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
