import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * CorporateStats — dark KPI / stats band for an enterprise / corporate B2B site.
 * A full-width section with an inverted foreground background and large centered
 * numbers above labels, on a responsive 2/4-column grid. Use to showcase credibility
 * metrics like revenue, client count, uptime, or global presence.
 */
import { Container } from '#/section-kit/Container.tsx'
export const CorporateStats = defineCapsule({
  name: 'CorporateStats',
  description:
    'Dark KPI / stats band for an enterprise / corporate B2B site: full-width inverted foreground background with a responsive 2/4-column grid of large centered numbers above labels. Use to showcase credibility metrics like revenue, client count, uptime SLA, or global presence.',
  props: z.object({
    /** Stat items: value + label pairs. */
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
            value: '$2.4B',
            label: 'Customer cost savings delivered',
          },
          {
            value: '500+',
            label: 'Enterprise clients worldwide',
          },
          {
            value: '99.99%',
            label: 'Platform uptime SLA',
          },
          {
            value: '14',
            label: 'Global office locations',
          },
        ]
    return (
      <section className={cn('bg-foreground py-20 lg:py-24', props.className)}>
        <Container>
          <ResponsiveGrid cols="2-lg-4" gap="lg" className="lg:gap-12">
            {items.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="mb-2 text-4xl font-semibold text-background lg:text-5xl">
                  {stat.value}
                </p>
                <p className="text-sm text-background/70">{stat.label}</p>
              </div>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
