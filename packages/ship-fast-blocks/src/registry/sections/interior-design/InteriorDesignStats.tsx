import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * InteriorDesignStats — editorial-spatial metrics ledger on a muted surface for
 * an upscale interior-design / architecture studio. A hairline-ruled muted band
 * (border-top-and-bottom) with a mono meta rule up top (label left, tabular
 * index right) above a collapsed-hairline 2/4-column grid of stat cells, each a
 * large light-weight tabular value over a mono uppercase label and a small
 * primary tick swatch. Editorial, understated, binary radius. Use as a social-
 * proof strip — projects completed, years of experience, awards, satisfaction —
 * for interior designers, design studios or architecture firms. Renders fully
 * with no props via baked-in defaults.
 */
export const InteriorDesignStats = defineCapsule({
  name: 'InteriorDesignStats',
  description:
    'Editorial-spatial metrics ledger on a muted surface for an upscale interior-design / architecture studio: a hairline-ruled muted band (border-top-and-bottom) with a mono meta rule (label left, tabular index right) above a collapsed-hairline 2/4-column grid of stat cells, each a large light-weight tabular value over a mono uppercase label and a small primary tick swatch. Editorial, understated, binary radius. Use as a social-proof strip — projects completed, years of experience, awards, client satisfaction — for interior designers, design studios or architecture firms.',
  props: z.object({
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          { value: '250+', label: 'Projects Completed' },
          { value: '10', label: 'Years Experience' },
          { value: '15', label: 'Design Awards' },
          { value: '98%', label: 'Client Satisfaction' },
        ]

    return (
      <section
        className={cn(
          'border-y border-border bg-muted/40 px-4 py-14 sm:px-6 md:py-20 lg:px-8',
          props.className,
        )}
      >
        <Container size="xl">
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4">
            <MonoTag className="flex items-center gap-3 tracking-[0.2em]">
              <span aria-hidden="true" className="size-2 bg-primary" />
              Studio Index
            </MonoTag>
            <MonoTag aria-hidden="true" tone="faint" className="tabular-nums">
              {String(items.length).padStart(2, '0')} / metrics
            </MonoTag>
          </div>
          <StatGrid
            columns={4}
            className="grid-cols-2 gap-0 border-l border-t border-border text-left md:grid-cols-4"
          >
            {items.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align={'left'}
                  className="gap-3 border-b border-r border-border p-5 sm:p-8"
                >
                  <StatValue
                    weight={'light'}
                    size={'large'}
                    className="tabular-nums tracking-tight"
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {__iv__.label}
                  </StatLabel>
                  <span
                    aria-hidden="true"
                    className="mt-1 flex items-center gap-1"
                  >
                    <span className="h-0.5 w-6 bg-primary" />
                    <span className="h-0.5 w-1 bg-muted-foreground/40" />
                    <span className="h-0.5 w-1 bg-muted-foreground/40" />
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
