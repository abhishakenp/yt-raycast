import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * AccountingFirmLogos — Swiss-ledger "trusted by" client strip for a CPA /
 * accounting-firm site. A newsprint-style collapsed-border cell grid: a mono
 * uppercase column-header row (heading on the left, a tabular zero-padded firm
 * count on the right) above a hairline-ruled grid of word-mark cells that share
 * borders with no gaps; each cell floods with a muted wash and darkens its text
 * on hover. Sharp corners, hairline rules, ledger discipline — social proof set
 * like a table of accounts. Each name routes through section-kit route links.
 * Use directly below the hero on accounting firms, CPA practices,
 * tax-preparation services, bookkeeping/payroll providers, audit/assurance
 * firms, or financial advisory practices. Renders fully with no props via
 * baked-in defaults.
 */
export const AccountingFirmLogos = defineCapsule({
  name: 'AccountingFirmLogos',
  description:
    'Swiss-ledger trusted-by client strip for a CPA / accounting-firm site: a mono uppercase column-header row (heading left, tabular zero-padded firm count right) above a newsprint collapsed-border grid of word-mark cells sharing hairline rules with no gaps; each cell floods with a muted wash and darkens on hover. Sharp-cornered, hairline-ruled ledger-table social proof; each name routes through section-kit route links. Use directly below the hero on accounting firms, CPA practices, tax-preparation services, bookkeeping/payroll providers, audit/assurance firms, or financial advisory practices.',
  props: z.object({
    /** Small uppercase heading above the logo row. */
    heading: z.string().optional(),
    /** Client word-mark names rendered as the logo row. */
    names: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Trusted by leading businesses'
    const names = props.names?.length
      ? props.names
      : [
          'Cascade Tech',
          'Evergreen Co.',
          'Summit Holdings',
          'Pacific Realty',
          'Harbor Logistics',
          'Vista Medical',
        ]
    const visibleNames = names.filter(Boolean)

    return (
      <LogoStrip
        className={cn('border-b border-border bg-background', props.className)}
      >
        <Container className="py-10 sm:py-12 lg:py-16">
          <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
            <LogoStripLabel className="text-left font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground">
              {heading}
            </LogoStripLabel>
            <span
              aria-hidden="true"
              className="font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums text-muted-foreground"
            >
              {String(visibleNames.length).padStart(2, '0')} firms
            </span>
          </div>
          <LogoStripItems
            layout="grid"
            className="grid-cols-2 items-stretch gap-0 border-l border-t border-border sm:grid-cols-3 md:grid-cols-6"
          >
            {visibleNames.map((logo) => (
              <LogoStripItem
                key={logo}
                variant="opacity-hover"
                asChild
                className="flex items-center justify-center border-b border-r border-border px-3 py-5 text-center text-sm font-semibold tracking-tight transition-colors duration-150 hover:bg-muted hover:text-foreground sm:px-4 sm:py-7 sm:text-base"
              >
                <NavbarRouteLink href={logo}>{logo}</NavbarRouteLink>
              </LogoStripItem>
            ))}
          </LogoStripItems>
        </Container>
      </LogoStrip>
    )
  },
})
