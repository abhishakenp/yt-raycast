import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'

/**
 * LawFirmStats — a dark full-width stats band on the primary surface. A
 * responsive 2-up / 4-up row of credential metrics, each a large serif value
 * above a tracked-uppercase muted label. High-contrast, restrained,
 * authoritative editorial aesthetic. Use between content sections on law-firm,
 * attorney, consulting or professional-services pages to surface firm
 * credentials (attorneys, years in practice, transactions closed, success rate).
 * Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { StatGrid } from '#/section-kit/StatGrid.tsx'
export const LawFirmStats = defineCapsule({
  name: 'LawFirmStats',
  description:
    'Dark full-width stats band on the primary surface: a responsive 2-up / 4-up row of credential metrics, each a large serif value above a tracked-uppercase muted label. High-contrast, restrained, authoritative editorial aesthetic. Use between content sections on law-firm, attorney, consulting, accounting or professional-services pages to surface firm credentials such as number of attorneys, years in practice, transactions closed and success rate.',
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
            value: '34',
            label: 'Attorneys',
          },
          {
            value: '37',
            label: 'Years in Practice',
          },
          {
            value: '$2.4B',
            label: 'Transactions Closed',
          },
          {
            value: '94%',
            label: 'Success Rate',
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
            size="xl"
            valueColor="inverted"
            labelColor="inverted"
            className="text-center lg:gap-12"
          />
        </Container>
      </section>
    )
  },
})
