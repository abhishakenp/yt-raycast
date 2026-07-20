import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'

/** Deterministic bar-glyph heights per wordmark cell. */
const GLYPH_BARS = [
  ['h-2', 'h-3.5', 'h-2.5'],
  ['h-3', 'h-2', 'h-3.5'],
  ['h-2.5', 'h-3.5', 'h-2'],
  ['h-3.5', 'h-2.5', 'h-3'],
  ['h-2', 'h-3', 'h-3.5'],
  ['h-3.5', 'h-2', 'h-2.5'],
]

/**
 * AnalyticsLogos — Swiss-grid "trusted by" social-proof band for an analytics
 * product site. An asymmetric hairline header row (mono uppercase lead line
 * left, tabular index counter right) above a collapsed-border grid of wordmark
 * cells: each company renders inside its own hairline cell as a tiny div-built
 * bar-glyph plus a crisp text lockup, de-emphasized in muted-foreground and
 * lifting to full foreground on hover with a faint wash. Token-only, no
 * images, sharp corners throughout. Use directly under the hero of any
 * analytics, BI, or data-product landing page to establish credibility.
 * Renders fully with no props via baked-in company defaults.
 */
export const AnalyticsLogos = defineCapsule({
  name: 'AnalyticsLogos',
  description:
    "Swiss-grid 'trusted by' social-proof band for an analytics product site: an asymmetric hairline header row (mono uppercase lead line left, tabular index counter right) above a collapsed-border grid of wordmark cells, each carrying a tiny div-built bar-glyph plus a crisp text lockup that lifts from muted-foreground to full foreground on hover. Token-only, no images, sharp corners. Use directly under the hero of any analytics, BI, or data-product landing page to establish credibility.",
  props: z.object({
    /** Lead line shown above the wordmark row. */
    lead: z.string().optional(),
    /** Company names rendered as wordmark lockups. */
    companies: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const lead = props.lead ?? 'Trusted by data teams at'
    const companies = props.companies?.length
      ? props.companies
      : ['Northwind', 'Vertex', 'Lumen', 'Cobalt', 'Meridian', 'Apex Labs']
    const list = companies.filter(Boolean)

    return (
      <LogoStrip
        className={cn(
          'border-b border-border bg-background py-10 sm:py-12',
          props.className,
        )}
      >
        <Container>
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-border pb-3">
            <LogoStripLabel className="text-left font-mono text-[11px] tracking-[0.2em]">
              {lead}
            </LogoStripLabel>
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 tabular-nums"
            >
              01 — {String(list.length).padStart(2, '0')}
            </MonoTag>
          </div>
          <LogoStripItems
            layout="flex"
            className="grid grid-cols-2 gap-0 border-l border-t border-border sm:grid-cols-3 lg:grid-cols-6"
          >
            {list.map((logo, i) => (
              <LogoStripItem
                key={logo}
                variant="text-bold"
                className="flex items-center justify-center gap-2.5 border-b border-r border-border px-4 py-6 transition-colors hover:bg-muted/40"
              >
                <span
                  aria-hidden="true"
                  className="flex items-end gap-0.5 text-current"
                >
                  {GLYPH_BARS[i % GLYPH_BARS.length].map((h, j) => (
                    <span key={j} className={cn('w-1 bg-current', h)} />
                  ))}
                </span>
                {logo}
              </LogoStripItem>
            ))}
          </LogoStripItems>
        </Container>
      </LogoStrip>
    )
  },
})
