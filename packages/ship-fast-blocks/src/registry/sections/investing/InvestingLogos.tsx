import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  LogoStrip,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * InvestingLogos — Swiss-fintech press / trust-logo band for an investing site.
 * A hairline-bordered muted band whose content sits in a plain Container: a mono
 * micro-label lead line with a tabular outlet count sits above a collapsed-
 * border grid of press wordmark cells (shared hairline rules, binary radius, no
 * gaps) — outlets such as Bloomberg, Reuters, CNBC, WSJ. Each cell is a
 * clickable route link that dims to full ink on hover. Precise, institutional
 * social proof; use directly beneath a hero to establish credibility via press
 * mentions or partner brands. Renders fully with no props.
 */
export const InvestingLogos = defineCapsule({
  name: 'InvestingLogos',
  description:
    'Swiss-fintech press / trust-logo band for an investing / brokerage site: a hairline-bordered muted band whose content sits in a plain Container, with a mono micro-label lead line + tabular outlet count above a collapsed-border grid of clickable press wordmark cells (shared hairline rules, binary radius, dim-to-ink hover) such as Bloomberg, Reuters, CNBC, WSJ. Each logo routes through route links. Use beneath a hero to establish credibility via press mentions or partner brands.',
  props: z.object({
    /** Small centered caption above the logo grid. */
    label: z.string().optional(),
    /** Wordmark text logos. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Trusted by investors worldwide'
    const items = props.items?.length
      ? props.items
      : ['Bloomberg', 'Reuters', 'CNBC', 'WSJ', "Barron's", 'FT']
    const cells = items.filter(Boolean)

    return (
      <LogoStrip
        className={cn(
          'border-y border-border bg-muted/40 py-14 lg:py-16',
          props.className,
        )}
      >
        <Container>
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4">
            <MonoTag>{label}</MonoTag>
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 tabular-nums"
            >
              {String(cells.length).padStart(2, '0')} outlets
            </MonoTag>
          </div>
          <LogoStripItems
            layout="grid"
            className="grid-cols-2 gap-0 border-l border-t border-border sm:grid-cols-3 md:grid-cols-6"
          >
            {cells.map((logo, i) => (
              <LogoStripItem
                key={logo}
                className="flex items-center justify-center border-b border-r border-border px-4 py-7 text-base font-semibold tracking-tight text-foreground/55 transition-colors hover:text-foreground"
                asChild
              >
                <NavbarRouteLink href={logo}>
                  <span
                    aria-hidden="true"
                    className="mr-2 font-mono text-[10px] tabular-nums text-muted-foreground/40"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {logo}
                </NavbarRouteLink>
              </LogoStripItem>
            ))}
          </LogoStripItems>
        </Container>
      </LogoStrip>
    )
  },
})
