import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * ManufacturingLogos — a heavy-industrial "trusted by industry leaders" client
 * certification strip for a precision-manufacturing / industrial B2B site. A
 * thick top-and-bottom foreground-ruled band on a muted wash: a mono-uppercase
 * lead label sits at the left, and a right-aligned row of monochrome client
 * wordmarks in bold mono type brighten on hover and route through section-kit
 * route links. Quiet, credible, ticker-like social proof. Use directly beneath
 * the hero on machine-shop, fabricator, contract-manufacturer or industrial-
 * engineering landing pages. Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const ManufacturingLogos = defineCapsule({
  name: 'ManufacturingLogos',
  description:
    "A heavy-industrial 'trusted by industry leaders' client certification strip for a precision-manufacturing / industrial B2B site: a thick top-and-bottom foreground-ruled band on a muted wash with a mono-uppercase lead label at the left and a right-aligned row of monochrome bold-mono client wordmarks that brighten on hover and route through section-kit route links. Quiet, credible, ticker-like social proof. Use directly beneath the hero on machine-shop, fabricator, contract-manufacturer or industrial-engineering landing pages.",
  props: z.object({
    heading: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Trusted by Industry Leaders'
    const items = props.items?.length
      ? props.items
      : [
          'Boeing',
          'Siemens',
          'General Electric',
          'Caterpillar',
          'Lockheed Martin',
          'Tesla',
        ]
    return (
      <LogoStrip
        className={cn(
          'border-y-2 border-foreground bg-muted/40 py-10',
          props.className,
        )}
      >
        <Container>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <LogoStripLabel className="text-left font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground md:max-w-[13rem]">
              {heading}
            </LogoStripLabel>
            <LogoStripItems
              layout="flex"
              className="mt-0 flex-1 justify-start gap-x-8 gap-y-4 md:justify-end"
            >
              {items.filter(Boolean).map((logo) => (
                <LogoStripItem
                  key={logo}
                  variant="opacity-hover"
                  asChild
                  className="font-mono text-sm font-bold uppercase tracking-tight"
                >
                  <NavbarRouteLink href={logo}>{logo}</NavbarRouteLink>
                </LogoStripItem>
              ))}
            </LogoStripItems>
          </div>
        </Container>
      </LogoStrip>
    )
  },
})
