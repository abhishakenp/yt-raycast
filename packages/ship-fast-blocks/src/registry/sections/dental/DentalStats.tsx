import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * DentalStats — hairline credibility ledger for a dental practice site. A calm
 * border-y band on the page background with a mono "[ practice metrics ]" meta
 * line above a collapsed-border 2-to-4 column ledger of stat cells; each cell
 * carries a giant fluid-clamp extrabold tabular numeral, a short primary tick
 * dash, and a mono uppercase micro-label. Use as a credibility strip (years of
 * excellence, patients served, average rating, satisfaction) between content
 * sections on a dentist, dental office, or clinic site.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
export const DentalStats = defineCapsule({
  name: 'DentalStats',
  description:
    'Hairline credibility ledger for a dental practice site: a calm border-y band on the page background with a mono meta line above a collapsed-border 2-to-4 column ledger of stat cells, each with a giant fluid extrabold tabular numeral, a short primary tick dash, and a mono uppercase micro-label. Use as a credibility strip (years of excellence, patients served, average rating, satisfaction) between content sections on a dentist, dental office, or clinic site.',
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
    const statsItems = props.items?.length
      ? props.items
      : [
          {
            value: '15+',
            label: 'Years of Excellence',
          },
          {
            value: '10K+',
            label: 'Happy Patients',
          },
          {
            value: '4.9',
            label: 'Average Rating',
          },
          {
            value: '98%',
            label: 'Patient Satisfaction',
          },
        ]
    return (
      <section
        className={cn(
          'border-y border-border bg-background py-16 sm:py-20',
          props.className,
        )}
      >
        <Container>
          <MonoTag
            aria-hidden="true"
            tone="faint"
            className="mb-8 block sm:mb-10"
          >
            [ practice metrics ]
          </MonoTag>
          <StatGrid
            columns={4}
            className="gap-0 border-l border-t border-border"
          >
            {statsItems.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align={'left'}
                  className="gap-3 border-b border-r border-border p-6 sm:p-8"
                >
                  <StatValue
                    weight={'bold'}
                    size={'large'}
                    color={'default'}
                    className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-extrabold leading-none tracking-tight tabular-nums"
                  >
                    {__iv__.value}
                  </StatValue>
                  <span aria-hidden="true" className="h-px w-8 bg-primary" />
                  <StatLabel
                    color={'default'}
                    className="font-mono text-[11px] uppercase tracking-[0.2em]"
                  >
                    {__iv__.label}
                  </StatLabel>
                </StatItem>
              )
            })}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
