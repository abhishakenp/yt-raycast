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
 * CleaningServiceLogos — playful-Swiss "trusted by" ledger strip for a
 * home-cleaning / maid-service landing page. A hairline-banded section with a
 * left-aligned mono micro-label (with a small primary square) sitting above a
 * collapsed-border 2/3/6-column ledger of clickable company wordmark cells —
 * each cell shares hairline rules with its neighbors and each wordmark tilts
 * slightly and gains ink on hover, with press feedback on click. Each item
 * routes through section-kit route links. Use as social-proof / credibility
 * strip immediately below the hero for residential cleaning companies, local
 * services, or small-business landing pages. Renders fully with no props via
 * baked-in defaults.
 */
export const CleaningServiceLogos = defineCapsule({
  name: 'CleaningServiceLogos',
  description:
    "Playful-Swiss 'trusted by' ledger strip for a home-cleaning / maid-service landing page: hairline-banded section with a left-aligned mono micro-label (small primary square) above a collapsed-border 2/3/6-column ledger of clickable company wordmark cells sharing hairline rules; wordmarks tilt slightly and gain ink on hover with press feedback. Each item routes through section-kit route links. Use as social-proof credibility strip below the hero for residential cleaning companies, local services, or small-business landing pages.",
  props: z.object({
    /** Uppercase label above the logo grid. */
    label: z.string().optional(),
    /** Company / partner names shown in the grid. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Trusted by leading companies'
    const items = props.items?.length
      ? props.items
      : ['Airbnb', 'Zillow', 'Redfin', 'Compass', 'Opendoor', 'WeWork']

    return (
      <LogoStrip
        className={cn(
          'border-b border-border bg-background py-10 sm:py-12',
          props.className,
        )}
      >
        <Container>
          <LogoStripLabel className="flex items-center gap-3 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <span aria-hidden="true" className="size-2 shrink-0 bg-primary" />
            {label}
          </LogoStripLabel>
          <LogoStripItems
            layout="grid"
            className="mt-6 grid-cols-2 gap-0 border-l border-t border-border sm:grid-cols-3 md:grid-cols-6"
          >
            {items.filter(Boolean).map((logo) => (
              <LogoStripItem
                key={logo}
                variant="opacity-hover"
                asChild
                className="flex h-16 items-center justify-center border-b border-r border-border text-base font-bold tracking-tight text-muted-foreground transition-all duration-150 hover:-rotate-1 hover:bg-muted/40 hover:text-foreground active:translate-y-px"
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
