import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { StatGrid } from '#/section-kit/StatGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * FintechStats — trust-building metrics band for a fintech / neobank landing
 * page. A padded section with an optional centered heading above the shared
 * StatGrid composite, surfacing headline numbers (active users, total
 * transactions processed, uptime percentage). Theme-token only; the grid is
 * layout-only so this capsule supplies the section wrapper and container
 * padding. Renders fully with no props via baked-in "Vault" defaults.
 */
export const FintechStats = defineCapsule({
  name: 'FintechStats',
  description:
    'Trust-building metrics band for a fintech / neobank landing page: a padded section with an optional centered heading above the shared StatGrid composite, surfacing headline numbers (active users, total transactions processed, uptime percentage). Theme-token only; the capsule supplies the section wrapper and container padding around the layout-only grid.',
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
    const heading = props.heading ?? 'Trusted by people who move money'
    const subheading =
      props.subheading ??
      'Millions rely on Vault every day to send, save, and spend with confidence.'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '3.2M+', label: 'Active users' },
          { value: '$48B', label: 'Transactions processed' },
          { value: '99.99%', label: 'Uptime guaranteed' },
        ]

    return (
      <section className={cn('pt-28 pb-20 lg:pt-32 lg:pb-28', props.className)}>
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 lg:px-8">
          {heading ? (
            <SectionHeading title={heading} subtitle={subheading} />
          ) : null}
          <StatGrid stats={stats} columns={3} />
        </div>
      </section>
    )
  },
})
