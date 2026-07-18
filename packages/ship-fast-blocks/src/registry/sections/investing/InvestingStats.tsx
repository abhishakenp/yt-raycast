import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * InvestingStats — key-metrics stat band for an investing / fintech page. A
 * bordered-top-and-bottom band on the page surface containing a responsive
 * 1/2/4-column grid of centered metrics, each a big bold value above a muted
 * label. Tokens only, no links. Use to surface headline trust numbers — assets
 * under management, active investors, countries supported, uptime — between
 * richer sections on a brokerage or trading-app page. Renders fully with no
 * props via four baked-in metrics.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
export const InvestingStats = defineCapsule({
  name: 'InvestingStats',
  description:
    'Key-metrics stat band for an investing / fintech page: a bordered band on the page surface with a responsive 1/2/4-column grid of centered metrics, each a big bold value above a muted label. Tokens only, no links. Use to surface headline trust numbers (assets under management, active investors, countries supported, uptime) between richer sections on a brokerage or trading-app page.',
  props: z.object({
    /** Metric items: value + label. */
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
            value: '$12B+',
            label: 'Assets under management',
          },
          {
            value: '2.4M',
            label: 'Active investors',
          },
          {
            value: '150+',
            label: 'Countries supported',
          },
          {
            value: '99.99%',
            label: 'Platform uptime',
          },
        ]
    return (
      <section
        className={cn(
          'border-y border-border bg-background py-24',
          props.className,
        )}
      >
        <Container>
          <StatGrid columns={4} gap={'wide'}>
            {items.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem key={__iv__.label} align={'center'}>
                  <StatValue weight={'semibold'} size={'large'}>
                    {__iv__.value}
                  </StatValue>
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
