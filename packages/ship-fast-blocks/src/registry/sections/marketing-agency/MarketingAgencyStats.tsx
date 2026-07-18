import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'

/**
 * MarketingAgencyStats — a high-contrast dark KPI / results band. A full-width
 * band on the primary surface holding a responsive grid (2-up mobile, 4-up
 * desktop) of centered metrics, each a large bold value above a small muted
 * label. Use as a punchy results / proof strip between content sections on a
 * marketing-agency, growth, or B2B SaaS landing page. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { StatGrid } from '#/section-kit/StatGrid.tsx'
export const MarketingAgencyStats = defineCapsule({
  name: 'MarketingAgencyStats',
  description:
    'High-contrast dark KPI / results band on the primary surface: a responsive grid (2-up mobile, 4-up desktop) of centered metrics, each a large bold value above a small muted label. Use as a punchy results / proof strip between content sections on a marketing-agency, growth, or B2B SaaS landing page to highlight revenue generated, clients served, ROI, and leads.',
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
            value: '$47M+',
            label: 'Revenue Generated',
          },
          {
            value: '127',
            label: 'Clients Served',
          },
          {
            value: '340%',
            label: 'Avg. ROI Increase',
          },
          {
            value: '5.8M',
            label: 'Leads Generated',
          },
        ]
    return (
      <section
        className={cn(
          'bg-primary py-20 text-primary-foreground',
          props.className,
        )}
      >
        <Container>
          <StatGrid
            stats={items}
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
