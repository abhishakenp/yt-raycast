import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { StatGrid } from '#/section-kit/StatGrid.tsx'

/**
 * PropertyListingStats — a marketplace-scale band for a property portal. A
 * primary-toned panel centers an optional header above a responsive 2/4-column
 * row of KPI cells; each cell shows a large figure over a softened label.
 * Defaults cover total listings, cities covered, partner agents, and monthly
 * visitors. Use to convey the reach and liquidity of a property marketplace.
 * Renders fully with no props via baked-in defaults.
 */
export const PropertyListingStats = defineComponent({
  name: 'PropertyListingStats',
  description:
    'Marketplace-scale band for a property portal: a primary-toned panel centering an optional header above a responsive 2/4-column row of KPI cells, each showing a large figure over a softened label. Defaults cover total listings, cities covered, partner agents, and monthly visitors. Use to convey the reach and liquidity of a property marketplace.',
  props: z.object({
    /** Optional section heading. */
    heading: z.string().optional(),
    /** Optional supporting line under the heading. */
    description: z.string().optional(),
    /** KPI cells. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'The marketplace renters trust'
    const description =
      props.description ??
      'More listings, more cities, more ways to find the right place.'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '120K+', label: 'Active listings' },
          { value: '340', label: 'Cities covered' },
          { value: '8,500', label: 'Partner agents' },
          { value: '4.2M', label: 'Monthly visitors' },
        ]

    return (
      <section
        className={cn(
          'bg-background px-6 py-20 lg:px-8 lg:py-28',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl">
          {heading || description ? (
            <SectionHeading title={heading} subtitle={description} />
          ) : null}
          <StatGrid stats={stats} columns={4} className="mt-12" />
        </div>
      </section>
    )
  },
})
