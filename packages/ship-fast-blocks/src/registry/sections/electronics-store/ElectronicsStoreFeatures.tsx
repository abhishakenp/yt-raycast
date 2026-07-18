import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * ElectronicsStoreFeatures — a centered 3-up benefits / trust row for an
 * electronics storefront. Each cell stacks a rounded muted icon tile (check /
 * box / refresh glyphs rotated across cells) above a bold title and a muted
 * description. Use to surface shipping, authenticity and returns guarantees on
 * electronics stores, gadget shops, consumer-tech retailers, or any product
 * catalog that wants quick reassurance under the hero.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
export const ElectronicsStoreFeatures = defineCapsule({
  name: 'ElectronicsStoreFeatures',
  description:
    'Centered 3-up benefits / trust row for an electronics storefront: each cell stacks a rounded muted icon tile (check / box / refresh glyphs rotated across cells) above a bold title and a muted description. Use to surface shipping, authenticity and returns guarantees (e.g. Certified Authentic, Free Express Shipping, 30-Day Returns) on electronics stores, gadget shops, consumer-tech retailers, or any product catalog that wants quick reassurance beneath the hero.',
  props: z.object({
    /** Benefit cells. */
    features: z
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
    const features = props.features?.length
      ? props.features
      : [
          {
            title: 'Certified Authentic',
            description:
              'Every product is 100% genuine with full manufacturer warranty and support.',
          },
          {
            title: 'Free Express Shipping',
            description:
              'Orders over $75 ship free within 2 business days to all 50 states.',
          },
          {
            title: '30-Day Returns',
            description:
              'Not satisfied? Return any item within 30 days for a full refund, no questions asked.',
          },
        ]
    return (
      <section className={cn('py-16 lg:py-24', props.className)}>
        <Container>
          <FeatureGrid columns={3}>
            {features.map((f) => {
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
