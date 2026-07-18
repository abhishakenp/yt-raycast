import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'

/**
 * CorporateStats — dark KPI / stats band for an enterprise / corporate B2B site.
 * A full-width section with an inverted foreground background and large centered
 * numbers above labels, on a responsive 2/4-column grid. Use to showcase credibility
 * metrics like revenue, client count, uptime, or global presence.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
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
          <StatGrid columns={4} gap={'wide'} className={'lg:gap-12'}>
            {items.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem key={__iv__.label} align={'center'}>
                  <StatValue
                    weight={'semibold'}
                    size={'large'}
                    color={'inverted'}
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel color={'inverted'}>{__iv__.label}</StatLabel>
                </StatItem>
              )
            })}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
