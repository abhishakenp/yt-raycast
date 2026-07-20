import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * CorporateLogos — Swiss-ledger client logo band for an enterprise / corporate
 * B2B homepage. A double-rule header row (mono uppercase heading left, tabular
 * partner count right) above a collapsed-border ledger of text wordmarks —
 * hairline-ruled cells (2 columns on mobile, 3 on tablet, 6 on desktop) with
 * square edges and no gaps, each wordmark a clickable button that routes
 * through section-kit route links. Use beneath the hero to establish
 * credibility for SaaS platforms, consultancies, or any B2B offering.
 */
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

export const CorporateLogos = defineCapsule({
  name: 'CorporateLogos',
  description:
    'Swiss-ledger client logo band for an enterprise / corporate B2B homepage: a double-rule header row (mono uppercase heading left, tabular partner count right) above a collapsed-border ledger of text wordmarks in hairline-ruled square-edged cells (2/3/6 columns), each clickable via section-kit route links. Use beneath the hero to establish credibility for SaaS platforms, consultancies, or any B2B offering.',
  props: z.object({
    /** Heading above the logo grid. */
    heading: z.string().optional(),
    /** Text labels shown as logo placeholders. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Trusted by leading enterprises worldwide'
    const items = props.items?.length
      ? props.items
      : ['AcmeCorp', 'Globex', 'Initech', 'Hooli', 'Massive', 'Soylent']
    const logos = items.filter(Boolean)
    return (
      <LogoStrip
        className={cn(
          'border-b border-border bg-background py-14 sm:py-16',
          props.className,
        )}
      >
        <Container>
          <div className="border-y border-border py-3">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
              <LogoStripLabel className="text-left font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
                {heading}
              </LogoStripLabel>
              <span
                aria-hidden="true"
                className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums text-muted-foreground/60"
              >
                {String(logos.length).padStart(2, '0')} / partners
              </span>
            </div>
            <LogoStripItems
              layout="flex"
              className="grid grid-cols-2 gap-0 border-l border-border sm:grid-cols-3 lg:grid-cols-6"
            >
              {logos.map((logo) => (
                <LogoStripItem key={logo} variant="opacity-hover" asChild>
                  <NavbarRouteLink
                    href={logo}
                    className="flex items-center justify-center border-b border-r border-border px-4 py-6 text-base transition-colors duration-150 hover:bg-muted/50 active:translate-y-px"
                  >
                    {logo}
                  </NavbarRouteLink>
                </LogoStripItem>
              ))}
            </LogoStripItems>
          </div>
        </Container>
      </LogoStrip>
    )
  },
})
