import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * ElectronicsStoreFeatures — a tech-brutalist 3-up benefits / trust ledger for an
 * electronics storefront. Each cell is a squared border-2 hard-shadow card led by
 * a giant ghost mono index numeral over an extrabold title and a muted
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
    'Tech-brutalist 3-up benefits / trust ledger for an electronics storefront: each cell is a squared border-2 hard-shadow card led by a giant ghost mono index numeral over an extrabold title and a muted description. Use to surface shipping, authenticity and returns guarantees (e.g. Certified Authentic, Free Express Shipping, 30-Day Returns) on electronics stores, gadget shops, consumer-tech retailers, or any product catalog that wants quick reassurance beneath the hero.',
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
            {features.map((f, i) => {
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
                <FeatureCard
                  key={__iv__.title}
                  className="relative gap-3 overflow-hidden rounded-none border-2 border-foreground p-6 transition-all duration-150 hover:-translate-y-1 hover:border-foreground hover:shadow-[8px_8px_0_0] hover:shadow-foreground motion-reduce:transform-none"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-2 -top-4 select-none font-mono text-7xl font-extrabold tabular-nums leading-none text-foreground/[0.06]"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {__iv__.icon && <FeatureIcon>{__iv__.icon}</FeatureIcon>}
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                    Guarantee {String(i + 1).padStart(2, '0')}
                  </span>
                  <FeatureTitle className="text-xl font-extrabold tracking-tight">
                    {__iv__.title}
                  </FeatureTitle>
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
