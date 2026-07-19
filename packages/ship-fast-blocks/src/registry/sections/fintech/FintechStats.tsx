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
import { Container } from '#/section-kit/Container.tsx'

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
        <Container className="flex flex-col gap-12">
          {heading ? (
            <SectionHeading title={heading} subtitle={subheading} />
          ) : null}
          <StatGrid columns={3}>
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
        </Container>
      </section>
    )
  },
})
