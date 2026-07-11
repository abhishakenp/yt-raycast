import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { Card } from '#/section-kit/Card.tsx'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * CrmSteps — centered 3-step onboarding flow for a CRM / SaaS landing page on a
 * subtle muted band. A heading + supporting paragraph above a responsive
 * (1/3-up) row of numbered step cards: a circular primary number badge above a
 * bordered card with a centered title, description and an alt-driven image,
 * joined by thin connector lines on desktop. Reassuring and guided. Use to
 * explain getting-started / setup / how-it-works flows for CRM, sales-pipeline
 * or B2B SaaS products. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
export const CrmSteps = defineCapsule({
  name: 'CrmSteps',
  description:
    'Centered 3-step onboarding flow for a CRM / SaaS landing page on a subtle muted band: a heading + supporting paragraph above a responsive (1/3-up) row of numbered step cards, each a circular primary number badge above a bordered card with a centered title, description and an alt-driven image, joined by thin connector lines on desktop. Reassuring and guided. Use to explain getting-started / setup / how-it-works flows for CRM, sales-pipeline or B2B SaaS products.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Ordered step cards (rendered with auto-incrementing numbers). */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Get started in minutes, not months'
    const description =
      props.description ??
      'Our guided setup process helps you import data, configure your pipeline, and start closing deals quickly.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Import your data',
            description:
              'Connect your existing tools or upload a CSV. We automatically map fields and detect duplicates during import.',
            imageAlt:
              'computer screen showing data migration interface with progress bars',
          },
          {
            title: 'Customize pipeline',
            description:
              'Define your stages, set probability weights, and create custom fields that match your unique sales process.',
            imageAlt:
              'digital kanban board showing workflow columns on tablet screen',
          },
          {
            title: 'Close more deals',
            description:
              'Start tracking opportunities, automate follow-ups, and watch your conversion rates improve week over week.',
            imageAlt:
              'business professionals shaking hands in modern office meeting room',
          },
        ]
    return (
      <section className={cn('bg-muted/50 py-20 lg:py-32', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
            {items.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <Card shadow="sm">
                  <h3 className="mb-3 text-center text-xl font-semibold text-card-foreground">
                    {step.title}
                  </h3>
                  <p className="mb-4 text-center leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                  <Image
                    alt={step.imageAlt}
                    w={400}
                    h={200}
                    loading="lazy"
                    className="h-40 w-full rounded-lg object-cover"
                  />
                </Card>
                {i < items.length - 1 ? (
                  <div className="absolute left-full top-8 hidden h-0.5 w-12 -translate-x-6 bg-border md:block" />
                ) : null}
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
