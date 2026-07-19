import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * FurnitureStoreFeatures — a centered guarantees / value-prop grid. A padded
 * section with a centered eyebrow + heading above a 4-up grid (1/2/4 columns
 * responsive) of items, each a centered circular muted icon tile over a title and
 * a short supporting paragraph. Decorative outline icons rotate through a baked-in
 * set (check / clock / cube / refresh) tinted with the primary token. Use to
 * showcase store guarantees, perks, or why-choose-us value props for furniture,
 * home-decor, interiors, or any warm retail brand. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
export const FurnitureStoreFeatures = defineCapsule({
  name: 'FurnitureStoreFeatures',
  description:
    'Centered guarantees / value-prop grid: a padded section with a centered eyebrow + heading above a 4-up grid (1/2/4 columns responsive) of items, each a centered circular muted icon tile over a title and short paragraph; decorative outline icons rotate through a baked-in check / clock / cube / refresh set tinted primary. Use to showcase store guarantees, perks, or why-choose-us value props for furniture, home-decor, interiors, or any warm retail brand.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    items: z
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
    const eyebrow = props.eyebrow ?? 'Why Haven & Home'
    const heading = props.heading ?? 'Designed for how you live'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Certified Sustainable',
            description:
              'FSC-certified wood, recycled fabrics, and non-toxic finishes on every piece.',
          },
          {
            title: '10-Year Warranty',
            description:
              'Built to last. Every frame, cushion, and joint guaranteed for a decade.',
          },
          {
            title: 'White Glove Delivery',
            description:
              'Room-of-choice delivery, assembly, and packaging removal included.',
          },
          {
            title: '30-Day Returns',
            description:
              'Not the perfect fit? Return or exchange within 30 days, no questions asked.',
          },
        ]
    return (
      <section
        className={cn('py-16 lg:py-24', props.className)}
        aria-labelledby="furniture-features-heading"
      >
        <Container>
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            titleId="furniture-features-heading"
            className="mb-12 lg:mb-16 gap-0"
            eyebrowClassName="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground"
            titleClassName="text-3xl font-medium lg:text-4xl"
          />
          <FeatureGrid columns={4}>
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
