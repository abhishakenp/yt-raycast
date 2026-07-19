import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * NoCodeStats — compact 4-up stats band on a bright canvas with top and bottom
 * borders. A responsive 1-to-4 column grid of centered metrics, each with a
 * large bold value over a muted label. Quiet, confident social proof meant to
 * sit between content sections. Use as the KPI / metrics band on a no-code
 * builder, SaaS, or product landing page. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
export const NoCodeStats = defineCapsule({
  name: 'NoCodeStats',
  description:
    'Compact 4-up stats band on a bright canvas with top and bottom borders: a responsive 1-to-4 column grid of centered metrics, each with a large bold value over a muted label. Quiet, confident social proof meant to sit between content sections. Use as the KPI / metrics band on a no-code / app-builder SaaS or product landing page.',
  props: z.object({
    /** Stat items (value + label). */
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
            value: '50K+',
            label: 'Apps created',
          },
          {
            value: '200+',
            label: 'Templates available',
          },
          {
            value: '99.9%',
            label: 'Uptime guaranteed',
          },
          {
            value: '<1s',
            label: 'Average load time',
          },
        ]
    return (
      <section
        className={cn(
          'border-y border-border bg-background py-24',
          props.className,
        )}
        aria-label="Company statistics"
      >
        <Container>
          <StatGrid columns={4} className="gap-12">
            {items
              .map((s) => ({ value: s.value, label: s.label }))
              .map((s) => {
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
