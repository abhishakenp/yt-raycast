import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * ConsultingLogos — trusted-by client-logo strip for a management-consulting
 * firm landing page. A centered uppercase heading above a responsive grid of
 * client-name buttons that fade at rest and brighten on hover; each routes
 * through section-kit route links. Use as a credibility / social-proof logo strip for
 * consulting firms, professional-services groups, B2B advisories, or any
 * enterprise landing page. Renders fully with no props via six baked-in
 * default client names.
 */
export const ConsultingLogos = defineCapsule({
  name: 'ConsultingLogos',
  description:
    'Trusted-by client-logo strip for a management-consulting firm landing page: a centered uppercase heading above a responsive grid of client-name buttons that fade at rest and brighten on hover, each routing through section-kit route links. Use as a credibility / social-proof logo strip for consulting firms, professional-services groups, B2B advisories, or any enterprise landing page.',
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
          'border-b border-border bg-background py-16',
          props.className,
        )}
      >
        <LogoStripLabel>{heading}</LogoStripLabel>
        <LogoStripItems layout="flex" className="mt-8">
          {items.filter(Boolean).map((logo) => (
            <LogoStripItem key={logo} variant="opacity-hover" asChild>
              <NavbarRouteLink href={logo}>{logo}</NavbarRouteLink>
            </LogoStripItem>
          ))}
        </LogoStripItems>
      </LogoStrip>
    )
  },
})
