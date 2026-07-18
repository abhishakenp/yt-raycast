import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'

/**
 * LogisticsStats — a compact KPI stat band for a global-logistics / freight-
 * forwarding company. A centered, responsive grid (2 → 4 columns) of large
 * semibold metric values over small muted captions (countries served, shipments
 * delivered, years in operation, team members). Clean and corporate on a light
 * surface with generous vertical padding. Use beneath the hero or logo strip of a
 * logistics, freight-forwarding, shipping, courier, warehousing or cargo/transport
 * site to quantify scale and trust. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { StatGrid } from '#/section-kit/StatGrid.tsx'
export const LogisticsStats = defineCapsule({
  name: 'LogisticsStats',
  description:
    'Compact KPI stat band for a global-logistics / freight-forwarding company: a centered, responsive grid (2 → 4 columns) of large semibold metric values over small muted captions (e.g. countries served, shipments delivered, years in operation, team members worldwide). Clean and corporate on a light surface with generous vertical padding. Use beneath the hero or logo strip of a logistics, freight-forwarding, shipping, courier, warehousing, supply-chain or cargo/transport site to quantify scale and trust.',
  props: z.object({
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
            value: '180+',
            label: 'Countries served',
          },
          {
            value: '2.4M',
            label: 'Shipments delivered (2024)',
          },
          {
            value: '24',
            label: 'Years in operation',
          },
          {
            value: '4,200',
            label: 'Team members worldwide',
          },
        ]
    return (
      <section className={cn('py-16 lg:py-24', props.className)}>
        <Container>
          <StatGrid
            stats={items}
            columns={4}
            gap="wide"
            align="center"
            weight="semibold"
            size="large"
            className="lg:gap-12"
          />
        </Container>
      </section>
    )
  },
})
