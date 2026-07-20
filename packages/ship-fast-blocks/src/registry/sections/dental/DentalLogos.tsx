import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * DentalLogos — insurance-provider ledger strip for a dental practice site. A
 * hairline border-y band with a left-aligned mono uppercase micro-label
 * ("Trusted by leading insurance providers") above a collapsed-border 2-to-6
 * column ledger grid of provider wordmarks, each a quiet centered cell that
 * sharpens to the foreground color on hover. Every wordmark routes through
 * section-kit route links. Use directly below the hero of a dentist, dental
 * office, or clinic site to signal accepted insurance and build trust.
 */
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const DentalLogos = defineCapsule({
  name: 'DentalLogos',
  description:
    'Insurance-provider ledger strip for a dental practice site: a hairline border-y band with a left-aligned mono uppercase micro-label above a collapsed-border 2-to-6 column ledger grid of provider wordmarks rendered as quiet centered cells that sharpen on hover. Every wordmark routes through section-kit route links. Use directly below the hero of a dentist, dental office, or clinic site to signal accepted insurance and build trust.',
  props: z.object({
    label: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const logosLabel = props.label ?? 'Trusted by leading insurance providers'
    const logoItems = props.items?.length
      ? props.items
      : ['Delta Dental', 'Cigna', 'Aetna', 'MetLife', 'Guardian', 'Humana']
    return (
      <LogoStrip
        className={cn('border-b border-border bg-background', props.className)}
      >
        <Container className="py-10 sm:py-12">
          <LogoStripLabel className="text-left font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {logosLabel}
          </LogoStripLabel>
          <LogoStripItems
            layout="flex"
            className="mt-6 grid grid-cols-2 gap-0 border-l border-t border-border sm:grid-cols-3 lg:grid-cols-6"
          >
            {logoItems.filter(Boolean).map((logo) => (
              <LogoStripItem
                key={logo}
                variant="opacity-hover"
                asChild
                className="flex h-14 items-center justify-center border-b border-r border-border text-sm font-semibold tracking-tight"
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
