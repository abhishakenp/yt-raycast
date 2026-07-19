import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

/**
 * BakeryFeatures — "why our bread is different" value-proposition trio for an
 * artisan-bakery page, on a card surface. A centered heading + lead paragraph
 * above a responsive 3-up grid of centered feature cards; each has a rounded
 * tinted icon tile (rotating inline line-icons: grain, clock, check), a title,
 * and a description. Warm, editorial, light and craft-forward. Tokens-only, no
 * links. Use to explain a bakery's craft, sourcing, and process — local grains,
 * slow fermentation, no shortcuts — or any "what makes us different" trio for
 * food makers. Renders fully with no props via three baked-in default features.
 */
export const BakeryFeatures = defineCapsule({
  name: 'BakeryFeatures',
  description:
    "'Why our bread is different' value-proposition trio for an artisan-bakery page on a card surface: a centered heading and lead paragraph above a responsive 3-up grid of centered feature cards, each with a rounded tinted icon tile (rotating inline line-icons: grain, clock, check), a title and a description. Warm, editorial, light and craft-forward; tokens-only, no links. Use to explain a bakery's craft, sourcing and process (local grains, slow fermentation, no shortcuts) or any 'what makes us different' / how-we-work trio for food makers.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Feature cards: title + description. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Why our bread is different'
    const description =
      props.description ??
      'We believe great bread takes time. Our 36-hour fermentation process develops complex flavors that mass-produced bread simply cannot match.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Local Grains',
            description:
              'We partner with Camas Country Mill in Eugene for organic wheat, rye, and spelt. Our flour travels less than 100 miles from field to bakery.',
          },
          {
            title: 'Slow Fermentation',
            description:
              'Our sourdough levain matures for 12 hours before mixing. Each loaf undergoes a full 36-hour cold ferment for optimal flavor and digestibility.',
          },
          {
            title: 'No Shortcuts',
            description:
              'No commercial yeast, no dough conditioners, no preservatives. Just flour, water, salt, and time. The way bread has been made for millennia.',
          },
        ]

    return (
      <section className={cn('bg-card py-20 lg:py-28', props.className)}>
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mb-16 max-w-3xl gap-0"
            titleClassName="mb-4 lg:text-4xl"
            subtitleClassName="text-lg"
          />
          <FeatureGrid columns={3}>
            {items.map((f) => {
              const __iv__ = f as {
                title: string
                description: string
                icon?: React.ReactNode
                points?: string[]
                cta?: string
                price?: string
                imageAlt?: string
              }
              return (
                <FeatureCard key={__iv__.title}>
                  {__iv__.icon && <FeatureIcon>{__iv__.icon}</FeatureIcon>}
                  <FeatureTitle>{__iv__.title}</FeatureTitle>
                  <FeatureDescription>{__iv__.description}</FeatureDescription>
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
