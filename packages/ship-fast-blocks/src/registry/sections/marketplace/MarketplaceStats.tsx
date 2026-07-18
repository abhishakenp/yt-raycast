import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * MarketplaceStats — scale / trust metrics band for a multi-vendor marketplace
 * / e-commerce landing page. A padded section with an optional centered heading
 * above the shared `StatGrid` composite, surfacing headline marketplace numbers
 * (active buyers, verified sellers, live listings, countries served). Theme-token
 * only; the grid is layout-only so this capsule supplies the section wrapper and
 * container padding. Use to convey reach and momentum on online marketplaces,
 * multi-vendor or maker/artisan platforms, and retail aggregators. Renders fully
 * with no props via baked-in "MarketHub" defaults.
 */
export const MarketplaceStats = defineCapsule({
  name: 'MarketplaceStats',
  description:
    'Scale / trust metrics band for a multi-vendor marketplace / e-commerce landing page: a padded section with an optional centered heading above the shared StatGrid composite, surfacing headline marketplace numbers (active buyers, verified sellers, live listings, countries served). Theme-token only; the capsule supplies the section wrapper and container padding around the layout-only grid. Use to convey reach and momentum on online marketplaces, multi-vendor or maker/artisan platforms, and retail aggregators.',
  props: z.object({
    /** Optional centered section heading. */
    heading: z.string().optional(),
    /** Optional supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Stat cells: value + label. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'A marketplace that keeps growing'
    const subheading =
      props.subheading ??
      'Millions of buyers and independent sellers trade on MarketHub every day, across every corner of the world.'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '2M+', label: 'Active buyers' },
          { value: '180K', label: 'Verified sellers' },
          { value: '8M+', label: 'Live listings' },
          { value: '120+', label: 'Countries served' },
        ]

    return (
      <section className={cn('py-20 lg:py-28', props.className)}>
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 lg:px-8">
          {heading ? (
            <SectionHeading title={heading} subtitle={subheading} />
          ) : null}
          <StatGrid columns={4}>
            {stats.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem key={__iv__.label}>
                  <StatValue>{__iv__.value}</StatValue>
                  <StatLabel>{__iv__.label}</StatLabel>
                </StatItem>
              )
            })}
          </StatGrid>
        </div>
      </section>
    )
  },
})
