import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * AutoDealershipLogos — showroom-kinetic marque strip for an auto dealership
 * site. A hairline border-bottomed band where a mono uppercase caption with a
 * primary skew tick sits on the left and a row of oversized italic font-black
 * uppercase brand wordmarks (BMW, Mercedes, Audi, Lexus, Tesla, Toyota)
 * stretches across the rest of the band at ghost opacity, snapping to full
 * foreground on hover. Each wordmark routes through section-kit route links.
 * Use as a social-proof / inventory-coverage strip directly under the hero for
 * dealerships, used-car lots, or multi-marque showrooms. Renders fully with no
 * props via baked-in defaults.
 */
export const AutoDealershipLogos = defineCapsule({
  name: 'AutoDealershipLogos',
  description:
    'Showroom-kinetic marque strip for an auto dealership site: a hairline border-bottomed band with a mono uppercase caption and primary skew tick on the left and a row of oversized italic font-black uppercase brand wordmarks (BMW, Mercedes, Audi, Lexus, Tesla, Toyota) at ghost opacity that snap to full foreground on hover. Each wordmark routes through section-kit route links. Use as a social-proof / inventory-coverage strip directly under the hero for dealerships, used-car lots, or multi-marque showrooms.',
  props: z.object({
    /** Uppercase caption above the wordmark grid. */
    heading: z.string().optional(),
    /** Brand names rendered as wordmarks. */
    brands: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Trusted Brands We Carry'
    const brands = props.brands?.length
      ? props.brands
      : ['BMW', 'Mercedes', 'Audi', 'Lexus', 'Tesla', 'Toyota']

    return (
      <LogoStrip
        className={cn(
          'border-b border-border bg-background px-4 py-10 sm:px-6 lg:px-8',
          props.className,
        )}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-center lg:gap-12">
          <LogoStripLabel className="flex shrink-0 items-center gap-3 text-left font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground">
            <span
              aria-hidden="true"
              className="inline-block h-2 w-6 -skew-x-12 bg-primary"
            />
            {heading}
          </LogoStripLabel>
          <LogoStripItems
            layout="flex"
            className="flex-1 justify-start gap-x-8 gap-y-3 lg:justify-between"
          >
            {brands.filter(Boolean).map((logo) => (
              <LogoStripItem
                key={logo}
                variant="opacity-hover"
                asChild
                className="text-xl font-black uppercase italic tracking-tight text-foreground/25 transition-colors duration-150 hover:text-foreground sm:text-2xl"
              >
                <NavbarRouteLink href={logo}>{logo}</NavbarRouteLink>
              </LogoStripItem>
            ))}
          </LogoStripItems>
        </div>
      </LogoStrip>
    )
  },
})
