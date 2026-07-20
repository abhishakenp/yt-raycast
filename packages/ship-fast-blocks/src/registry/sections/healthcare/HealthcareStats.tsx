import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * HealthcareStats — hairline care-outcomes ledger for a medical-clinic page. A
 * calm border-y band on the page background with a mono "[ patient outcomes ]"
 * meta line above a collapsed-border 2-to-4 column ledger of stat cells; each
 * cell carries a giant fluid-clamp extrabold tabular numeral, a short primary
 * tick dash, and a mono uppercase micro-label. Tokens-only, no links. Use as a
 * credibility / "by the numbers" band between sections of a doctors' office,
 * primary-care practice or hospital to surface patient count, wait time,
 * satisfaction and years of service. Renders fully with no props via baked-in
 * clinic-metric defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
export const HealthcareStats = defineCapsule({
  name: 'HealthcareStats',
  description:
    "Hairline care-outcomes ledger for a medical-clinic page: a calm border-y band on the page background with a mono meta line above a collapsed-border 2-to-4 column ledger of stat cells, each with a giant fluid extrabold tabular numeral, a short primary tick dash, and a mono uppercase micro-label. Tokens-only, no links. Use as a credibility / 'by the numbers' band between sections of a doctors' office, primary-care practice or hospital to surface patient count, wait time, satisfaction and years of service.",
  props: z.object({
    /** Metric figures: value + label. */
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
            value: '4,900+',
            label: 'Active Patients',
          },
          {
            value: '15 min',
            label: 'Avg. Wait Time',
          },
          {
            value: '98%',
            label: 'Patient Satisfaction',
          },
          {
            value: '9+',
            label: 'Years of Service',
          },
        ]
    return (
      <section
        className={cn(
          'border-y border-border bg-background py-16 sm:py-20',
          props.className,
        )}
        aria-label="Clinic statistics"
      >
        <Container>
          <MonoTag
            aria-hidden="true"
            tone="faint"
            className="mb-8 block sm:mb-10"
          >
            [ patient outcomes ]
          </MonoTag>
          <StatGrid
            columns={4}
            className="gap-0 border-l border-t border-border"
          >
            {items.map((s) => {
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
