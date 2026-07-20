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
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * CryptoLogos — trusted-by protocol ledger strip for a crypto / DeFi landing
 * page. A hairline-banded section with a left-aligned mono uppercase label
 * and a collapsed-border ledger grid of mono wordmark cells (2-up mobile,
 * 3-up tablet, 6-up desktop) separated by hairline rules — no card chrome,
 * no rounding. Each wordmark cell routes through section-kit route links.
 * Use to display protocol partners, institutional backers, integrated
 * chains, or ecosystem partners.
 */
export const CryptoLogos = defineCapsule({
  name: 'CryptoLogos',
  description:
    'Trusted-by protocol ledger strip for a crypto / DeFi landing page: hairline-banded section with a left-aligned mono uppercase label and a collapsed-border ledger grid of mono wordmark cells (2-up mobile, 3-up tablet, 6-up desktop) separated by hairline rules. Each wordmark routes through section-kit route links. Use to display protocol partners, institutional backers, integrated chains, or ecosystem partners.',
  props: z.object({
    /** Heading above the logo grid. */
    heading: z.string().optional(),
    /** Logo / partner names rendered as buttons. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading =
      props.heading ?? 'Trusted by leading protocols and institutions'
    const items = props.items?.length
      ? props.items
      : ['Aave', 'Compound', 'Uniswap', 'Chainlink', 'Polygon', 'Arbitrum']

    return (
      <LogoStrip
        className={cn('border-y border-border bg-card', props.className)}
      >
        <Container className="py-12 sm:py-14">
          <div className="mb-8 flex items-center gap-4">
            <LogoStripLabel className="min-w-0 text-left font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {heading}
            </LogoStripLabel>
            <span
              aria-hidden="true"
              className="hidden h-px min-w-8 flex-1 bg-border sm:block"
            />
          </div>
          <LogoStripItems
            layout="grid"
            className="grid-cols-2 gap-0 border-l border-t border-border sm:grid-cols-3 lg:grid-cols-6"
          >
            {items.filter(Boolean).map((logo) => (
              <LogoStripItem key={logo} variant="text-bold" asChild>
                <NavbarRouteLink
                  href={logo}
                  className="border-b border-r border-border px-4 py-6 text-center font-mono text-sm uppercase tracking-[0.15em] transition-colors hover:bg-muted active:translate-y-px"
                >
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
