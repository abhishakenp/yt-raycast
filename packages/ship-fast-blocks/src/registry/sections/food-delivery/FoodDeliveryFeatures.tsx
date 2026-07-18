import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * FoodDeliveryFeatures — centered 3-up features grid for a food-delivery /
 * restaurant-marketplace site. A centered heading + supporting paragraph above
 * three soft-bordered card panels, each with a rounded muted icon tile (clock /
 * check-badge / heart line icons), a title and a body paragraph. Use to explain
 * the core value props (real-time tracking, curated selection, saved favorites)
 * for food-delivery apps, restaurant aggregators, or online-ordering platforms.
 * Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
export const FoodDeliveryFeatures = defineCapsule({
  name: 'FoodDeliveryFeatures',
  description:
    'Centered 3-up features grid for a food-delivery / restaurant-marketplace site: a centered heading + supporting paragraph above three soft-bordered card panels, each with a rounded muted icon tile (clock / check-badge / heart line icons), a title and a body paragraph. Use to explain core value props like real-time GPS tracking, curated/vetted selection, and saved favorites for food-delivery apps, restaurant aggregators, online-ordering platforms, or takeout services.',
  props: z.object({
    /** Centered section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Feature cards (title + description); icons rotate by index. */
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
    const featuresHeading = props.heading ?? 'Everything you need'
    const featuresDesc =
      props.description ??
      'We have thought through every detail to make your food delivery experience effortless.'
    const featureItems = props.items?.length
      ? props.items
      : [
          {
            title: 'Real-Time Tracking',
            description:
              'Know exactly where your order is with live GPS tracking from restaurant to your doorstep. Get updates at every step.',
          },
          {
            title: 'Curated Selection',
            description:
              'Every restaurant is vetted for quality. We partner only with kitchens that meet our high standards for food and service.',
          },
          {
            title: 'Saved Favorites',
            description:
              'Reorder your go-to meals in seconds. Your favorite dishes and restaurants are always just one tap away.',
          },
        ]
    return (
      <section className={cn('pt-28 pb-20 lg:pt-32 lg:pb-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {featuresHeading}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{featuresDesc}</p>
          </div>
          <FeatureGrid columns={3}>
            {featureItems.map((f) => {
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
