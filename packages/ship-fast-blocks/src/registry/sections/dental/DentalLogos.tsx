import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * DentalLogos — insurance-provider / trust logo strip for a dental practice
 * site. A border-bottomed band on the page surface with a small uppercase
 * caption ("Trusted by leading insurance providers") above a faded, responsive
 * 2-to-6 column grid of provider wordmarks rendered as text buttons that brighten
 * on hover. Every wordmark routes through section-kit route links. Use directly below the
 * hero of a dentist, dental office, or clinic site to signal accepted insurance
 * and build trust.
 */
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

export const DentalLogos = defineCapsule({
  name: 'DentalLogos',
  description:
    'Insurance-provider / trust logo strip for a dental practice site: a border-bottomed band on the page surface with a small uppercase caption above a faded, responsive 2-to-6 column grid of provider wordmarks rendered as text buttons that brighten on hover. Every wordmark routes through section-kit route links. Use directly below the hero of a dentist, dental office, or clinic site to signal accepted insurance and build trust.',
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
        className={cn(
          'border-b border-border bg-background py-16',
          props.className,
        )}
      >
        <LogoStripLabel>{logosLabel}</LogoStripLabel>
        <LogoStripItems layout="flex" className="mt-8">
          {logoItems.filter(Boolean).map((logo) => (
            <LogoStripItem key={logo} variant="opacity-hover" asChild>
              <NavbarRouteLink href={logo}>{logo}</NavbarRouteLink>
            </LogoStripItem>
          ))}
        </LogoStripItems>
      </LogoStrip>
    )
  },
})
