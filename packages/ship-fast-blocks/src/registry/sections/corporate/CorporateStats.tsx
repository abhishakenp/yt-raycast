import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'

/**
 * CorporateStats — Swiss-corporate inverted KPI ledger for an enterprise /
 * corporate B2B site. A full ink inversion band (foreground background,
 * background text) that cuts in on a slanted clip-path seam, with a giant
 * ghost index watermark behind, a hairline mono meta rule (primary index
 * square + tabular figure count), and a collapsed-border 2/4-column ledger of
 * left-aligned stat cells — each carrying a giant clamped tabular numeral, a
 * mono uppercase label, and a primary tick mark. Use to showcase credibility
 * metrics like revenue, client count, uptime, or global presence.
 */
import { Container } from '#/section-kit/Container.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
export const CorporateStats = defineCapsule({
  name: 'CorporateStats',
  description:
    'Swiss-corporate inverted KPI ledger for an enterprise / corporate B2B site: a full ink-inversion band with a slanted clip-path top seam, a giant ghost index watermark, a hairline mono meta rule (primary index square + tabular figure count), and a collapsed-border 2/4-column ledger of left-aligned stat cells with giant clamped tabular numerals, mono uppercase labels, and primary tick marks. Use to showcase credibility metrics like revenue, client count, uptime SLA, or global presence.',
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
      <section
        className={cn(
          'relative overflow-hidden bg-foreground py-14 pt-20 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-24 lg:pt-32',
          props.className,
        )}
      >
        <Watermark className="-right-6 -top-4 text-[9rem] text-background/[0.05] sm:text-[13rem]">
          {String(items.length).padStart(2, '0')}
        </Watermark>
        <Container className="relative">
          <div className="mb-10 flex items-center justify-between gap-4 border-b border-background/20 pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              By the numbers
            </span>
            <span className="tabular-nums">
              {String(items.length).padStart(2, '0')} figures
            </span>
          </div>
          <StatGrid
            columns={4}
            className="gap-0 border-l border-t border-background/20"
          >
            {items.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align={'left'}
                  className="gap-3 border-b border-r border-background/20 p-5 sm:p-8"
                >
                  <StatValue
                    weight={'semibold'}
                    size={'large'}
                    color={'inverted'}
                    className="mb-0 text-[clamp(2.25rem,4.5vw,4rem)] leading-none tracking-tight tabular-nums"
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel
                    color={'inverted'}
                    className="font-mono text-[11px] uppercase tracking-[0.18em]"
                  >
                    {__iv__.label}
                  </StatLabel>
                  <span
                    aria-hidden="true"
                    className="mt-1 flex items-center gap-1"
                  >
                    <span className="h-1 w-8 bg-primary" />
                    <span className="h-1 w-1 bg-background/30" />
                    <span className="h-1 w-1 bg-background/30" />
                  </span>
                </StatItem>
              )
            })}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
