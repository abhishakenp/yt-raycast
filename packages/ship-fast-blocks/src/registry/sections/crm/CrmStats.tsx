import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'

/**
 * CrmStats — compact KPI stats band for a CRM / SaaS landing page. A
 * top-and-bottom-bordered strip with a responsive 2/4-up grid of centered
 * metrics, each a large bold value above a muted label. Quietly authoritative
 * social proof. Use between content sections to surface headline numbers
 * (active teams, pipeline managed, conversion lift, rating) for CRM,
 * sales-pipeline or B2B SaaS products. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { StatGrid } from '#/section-kit/StatGrid.tsx'
export const CrmStats = defineCapsule({
  name: 'CrmStats',
  description:
    'Compact KPI stats band for a CRM / SaaS landing page: a top-and-bottom-bordered strip with a responsive 2/4-up grid of centered metrics, each a large bold value above a muted label. Quietly authoritative social proof. Use between content sections to surface headline numbers (active teams, pipeline managed, conversion lift, rating) for CRM, sales-pipeline or B2B SaaS products.',
  props: z.object({
    /** KPI metrics. */
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
            value: '15,000+',
            label: 'Active teams',
          },
          {
            value: '$2.4B',
            label: 'Pipeline managed',
          },
          {
            value: '34%',
            label: 'Avg. conversion lift',
          },
          {
            value: '4.9/5',
            label: 'Customer rating',
          },
        ]
    return (
      <section
        className={cn(
          'border-y border-border bg-background py-16',
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
          />
        </Container>
      </section>
    )
  },
})
