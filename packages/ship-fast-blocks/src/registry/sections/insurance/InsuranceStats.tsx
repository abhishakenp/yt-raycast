import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'

/**
 * InsuranceStats — compact 4-up impact stats strip for an insurance page. A
 * centered responsive grid (2 up on mobile, 4 up on desktop) of big brand-
 * colored metric values over muted labels, on a plain background band. Use
 * between content sections to surface social proof like families protected,
 * claims processed/approved, and customer rating. Renders fully with no props
 * via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { StatGrid } from '#/section-kit/StatGrid.tsx'
export const InsuranceStats = defineCapsule({
  name: 'InsuranceStats',
  description:
    'Compact 4-up impact stats strip for an insurance page: a centered responsive grid (2 up on mobile, 4 up on desktop) of big brand-colored metric values over muted labels, on a plain background band. Use between content sections to surface social proof like families protected, claims processed/approved dollar amounts, claims-approved rate, and customer rating.',
  props: z.object({
    /** Stat items (big value + label). */
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
    const items = props.items?.length
      ? props.items
      : [
          {
            value: '50K+',
            label: 'Families Protected',
          },
          {
            value: '$2.4B',
            label: 'Claims Processed',
          },
          {
            value: '98%',
            label: 'Claims Approved',
          },
          {
            value: '4.9/5',
            label: 'Customer Rating',
          },
        ]
    return (
      <section className={cn('bg-background py-16 lg:py-20', props.className)}>
        <Container>
          <StatGrid
            stats={items}
            columns={4}
            gap="wide"
            align="center"
            weight="bold"
            size="large"
            className="lg:gap-12"
          />
        </Container>
      </section>
    )
  },
})
