import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'

/**
 * FoodDeliveryStats — inverted KPI stats strip for a food-delivery /
 * restaurant-marketplace site. A full-width foreground-on-background dark band
 * with a responsive 2/4-up grid of big bold metric values over muted labels
 * (happy customers, restaurant partners, cities served, avg. delivery time). Use
 * as a punchy social-proof divider between lighter sections for food-delivery
 * apps, restaurant aggregators, or online-ordering platforms. Renders fully with
 * no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { StatGrid } from '#/section-kit/StatGrid.tsx'
export const FoodDeliveryStats = defineCapsule({
  name: 'FoodDeliveryStats',
  description:
    'Inverted KPI stats strip for a food-delivery / restaurant-marketplace site: a full-width foreground-on-background dark band with a responsive 2/4-up grid of big bold metric values over muted labels (happy customers, restaurant partners, cities served, avg. delivery time). Use as a punchy social-proof divider between lighter sections for food-delivery apps, restaurant aggregators, online-ordering platforms, or takeout services.',
  props: z.object({
    /** KPI items (value + label). */
    items: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const statItems = props.items?.length
      ? props.items
      : [
          {
            value: '2M+',
            label: 'Happy customers',
          },
          {
            value: '500+',
            label: 'Restaurant partners',
          },
          {
            value: '45',
            label: 'Cities served',
          },
          {
            value: '15min',
            label: 'Avg. delivery time',
          },
        ]
    return (
      <section
        className={cn(
          'bg-foreground pt-28 pb-16 text-background',
          props.className,
        )}
      >
        <Container>
          <StatGrid
            stats={statItems}
            columns={4}
            gap="wide"
            align="center"
            weight="bold"
            size="large"
            valueColor="inverted"
            labelColor="inverted"
          />
        </Container>
      </section>
    )
  },
})
