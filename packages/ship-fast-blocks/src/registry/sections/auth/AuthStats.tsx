import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { StatGrid } from '#/section-kit/StatGrid.tsx'

/**
 * AuthStats — proof-by-numbers band for Authly, a developer authentication product.
 * A token section wraps an optional centered SectionHeading above the shared
 * `StatGrid` composite rendered at 4 columns. Baked metrics quantify the
 * platform's scale and reliability — logins served per month, developers
 * building on it, an uptime SLA, and countries covered. Use to back an auth
 * platform, identity API, or login SDK with hard numbers. Renders fully with no
 * props.
 */
export const AuthStats = defineComponent({
  name: 'AuthStats',
  description:
    'Proof-by-numbers band for a developer-auth product: a token section wrapping an optional centered SectionHeading above the shared StatGrid composite at 4 columns. Baked metrics quantify scale and reliability — logins served per month, developers building on the platform, an uptime SLA, and countries covered. Use to back an auth platform, identity API, or login SDK with hard numbers.',
  props: z.object({
    /** Optional section heading above the stats. */
    heading: z.string().optional(),
    /** Optional subheading. */
    subheading: z.string().optional(),
    /** Stats: value + label. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Identity infrastructure at scale'
    const subheading =
      props.subheading ??
      'Teams of every size trust Authly to authenticate their users every second of every day.'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '5B+', label: 'Logins / mo' },
          { value: '40K+', label: 'Developers' },
          { value: '99.99%', label: 'Uptime SLA' },
          { value: '190+', label: 'Countries' },
        ]

    return (
      <section className={cn('bg-muted', props.className)}>
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
          <SectionHeading
            title={heading}
            subtitle={subheading}
            align="center"
          />
          <div className="mt-12">
            <StatGrid stats={stats} columns={4} />
          </div>
        </div>
      </section>
    )
  },
})
