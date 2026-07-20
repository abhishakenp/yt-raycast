import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'

/**
 * LawFirmStats — the page's full ink inversion: a bg-foreground / text-background
 * credentials band that cuts in on a slanted clip-path seam. A mono uppercase
 * meta rule with a primary square and a tabular metric count sits above a
 * collapsed-border ledger of credential cells, each carrying a mono "No. 0x"
 * case index, a giant serif tabular numeral, and a mono tracked-uppercase label
 * — over a giant faint watermark word. High-contrast, restrained, authoritative
 * newsprint gravitas with sharp binary corners. Use between content sections on
 * law-firm, attorney, consulting or professional-services pages to surface firm
 * credentials (attorneys, years in practice, transactions closed, success rate).
 * Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
export const LawFirmStats = defineCapsule({
  name: 'LawFirmStats',
  description:
    'Full ink-inverted credentials band for a law firm (bg-foreground / text-background) that cuts in on a slanted clip-path seam: a mono uppercase meta rule with a primary square and a tabular metric count above a collapsed-border ledger of credential cells — each with a mono "No. 0x" case index, a giant serif tabular numeral and a mono tracked-uppercase label — over a giant faint watermark word. High-contrast, restrained, authoritative newsprint gravitas with sharp binary corners. Use between content sections on law-firm, attorney, consulting, accounting or professional-services pages to surface firm credentials such as number of attorneys, years in practice, transactions closed and success rate.',
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
    const items = props.items?.length
      ? props.items
      : [
          {
            value: '34',
            label: 'Attorneys',
          },
          {
            value: '37',
            label: 'Years in Practice',
          },
          {
            value: '$2.4B',
            label: 'Transactions Closed',
          },
          {
            value: '94%',
            label: 'Success Rate',
          },
        ]
    return (
      <section
        className={cn(
          // Slanted top edge: the inverted band starts on a diagonal seam
          // (clip-path on the band itself keeps it neighbor-independent).
          'relative overflow-hidden bg-foreground py-16 pt-24 text-background [clip-path:polygon(0_0,100%_2.5rem,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-24 lg:pt-32',
          props.className,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-12 -left-4 select-none font-serif text-[9rem] font-semibold leading-none tracking-tight text-background/[0.05] sm:text-[13rem] lg:text-[17rem]"
        >
          Counsel
        </span>
        <Container className="relative">
          <div className="mb-10 flex items-center justify-between gap-4 border-b border-background/20 pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              Credentials of record
            </span>
            <span className="tabular-nums">
              {String(items.length).padStart(2, '0')} metrics
            </span>
          </div>
          <StatGrid
            columns={4}
            className="gap-0 border-l border-t border-background/15"
          >
            {items.map((s, i) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align={'left'}
                  className="gap-3 border-b border-r border-background/15 p-6 sm:p-8"
                >
                  <span
                    aria-hidden="true"
                    className="font-mono text-[10px] uppercase tracking-[0.2em] tabular-nums text-primary"
                  >
                    No. {String(i + 1).padStart(2, '0')}
                  </span>
                  <StatValue
                    fontFamily={'serif'}
                    weight={'semibold'}
                    size={'xl'}
                    color={'inverted'}
                    className="leading-none"
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel
                    color={'inverted'}
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
