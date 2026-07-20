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
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * ConsultingLogos — Swiss-ledger trusted-by client strip for a
 * management-consulting firm landing page. An asymmetric mono metadata rail
 * (primary index square + uppercase mono heading left, hairline rule, "06
 * Clients" tabular count right) above a collapsed-border ledger of client
 * wordmarks: serif client names in shared hairline cells (2-up on mobile,
 * 3-up, then 6-up) that sharpen from muted to foreground on hover with press
 * feedback; each routes through section-kit route links. Use as a credibility /
 * social-proof logo strip for consulting firms, professional-services groups,
 * B2B advisories, or any enterprise landing page. Renders fully with no props
 * via six baked-in default client names.
 */
export const ConsultingLogos = defineCapsule({
  name: 'ConsultingLogos',
  description:
    'Swiss-ledger trusted-by client strip for a management-consulting firm landing page: an asymmetric mono metadata rail (primary index square + uppercase mono heading, hairline rule, tabular client count) above a collapsed-border ledger of serif client wordmarks in shared hairline cells (2-up mobile to 6-up desktop) that sharpen to foreground on hover with press feedback, each routing through section-kit route links. Use as a credibility / social-proof logo strip for consulting firms, professional-services groups, B2B advisories, or any enterprise landing page.',
  props: z.object({
    /** Section heading above the logo grid. */
    heading: z.string().optional(),
    /** Client name labels shown as logo placeholders. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading =
      props.heading ?? 'Trusted by Industry Leaders Across Sectors'
    const items = props.items?.length
      ? props.items
      : ['Alphabet', 'Microsoft', 'JPMorgan', 'Pfizer', 'Siemens', 'Unilever']

    return (
      <LogoStrip
        className={cn(
          'border-b border-border bg-background py-14 sm:py-16',
          props.className,
        )}
      >
        <Container>
          <div className="mb-8 flex items-center gap-4">
            <span aria-hidden="true" className="size-2 shrink-0 bg-primary" />
            <LogoStripLabel className="text-left font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground">
              {heading}
            </LogoStripLabel>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <MonoTag tone="faint" className="hidden tabular-nums sm:inline">
              {String(items.filter(Boolean).length).padStart(2, '0')} Clients
            </MonoTag>
          </div>
          <LogoStripItems
            layout="grid"
            className="grid-cols-2 gap-0 border-l border-t border-border sm:grid-cols-3 md:grid-cols-6"
          >
            {items.filter(Boolean).map((logo) => (
              <LogoStripItem
                key={logo}
                variant="opacity-hover"
                asChild
                className="border-b border-r border-border px-4 py-6 font-serif text-lg font-semibold tracking-tight text-muted-foreground transition-colors duration-150 hover:bg-muted/40 hover:text-foreground active:translate-y-px"
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
