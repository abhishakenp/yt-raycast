import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * ConstructionLogos — industrial-brutalist client register for a construction /
 * general contractor page. A hairline-ruled band whose header row pairs a
 * primary marker square + mono uppercase heading with a tabular partner count,
 * above a collapsed-border ledger grid of uppercase extrabold wordmark cells
 * (2-up on mobile, 3-up, then 6-up) sharing hairline rules. Use as a
 * social-proof logo strip beneath the hero for construction companies,
 * contractors, builders, or any service business showcasing trusted
 * partnerships. Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
export const ConstructionLogos = defineCapsule({
  name: 'ConstructionLogos',
  description:
    'Industrial-brutalist client register for a construction / general contractor page: a hairline-ruled band with a mono uppercase heading + primary marker square and tabular partner count header row above a collapsed-border ledger grid of uppercase extrabold wordmark cells sharing hairline rules (2-up mobile / 6-up desktop). Use as a social-proof logo strip beneath the hero for construction firms, contractors, builders, or any service business showcasing trusted partnerships.',
  props: z.object({
    /** Section heading above the logo grid. */
    heading: z.string().optional(),
    /** Logo names displayed as text placeholders. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Trusted by leading organizations'
    const items = props.items?.length
      ? props.items
      : ['Microsoft', 'Amazon', 'Starbucks', 'Boeing', 'Nordstrom', 'Costco']
    const shown = items.filter(Boolean)
    return (
      <LogoStrip
        className={cn(
          'border-b border-border bg-background py-10 sm:py-14',
          props.className,
        )}
      >
        <Container>
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-border pb-3">
            <LogoStripLabel className="flex items-center gap-3 text-left font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              <span aria-hidden="true" className="size-2 bg-primary" />
              {heading}
            </LogoStripLabel>
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums text-muted-foreground/60"
            >
              {String(shown.length).padStart(2, '0')} / register
            </span>
          </div>
          <LogoStripItems
            layout="grid"
            className="grid-cols-2 gap-0 border-l border-t border-border sm:grid-cols-3 lg:grid-cols-6"
          >
            {shown.map((logo) => (
              <LogoStripItem
                key={logo}
                variant="opacity-hover"
                className="border-b border-r border-border px-3 py-6 text-sm font-extrabold uppercase tracking-tight transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                {logo}
              </LogoStripItem>
            ))}
          </LogoStripItems>
        </Container>
      </LogoStrip>
    )
  },
})
