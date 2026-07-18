import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * ManufacturingLogos — a "trusted by industry leaders" client-logo strip for a
 * precision-manufacturing / industrial B2B site. A muted, top-and-bottom-
 * bordered band: a small uppercase tracked heading above a responsive grid of
 * monochrome client wordmarks, each a small cube glyph plus name that brightens
 * on hover and routes through useNavigate. Quiet, credible social proof. Use
 * directly beneath the hero on machine-shop, fabricator, contract-manufacturer
 * or industrial-engineering landing pages. Renders fully with no props via
 * baked-in defaults.
 */
import { LogoStrip } from '#/section-kit/LogoStrip.tsx'
export const ManufacturingLogos = defineCapsule({
  name: 'ManufacturingLogos',
  description:
    "A 'trusted by industry leaders' client-logo strip for a precision-manufacturing / industrial B2B site: a muted, top-and-bottom-bordered band with a small uppercase tracked heading above a responsive grid of monochrome client wordmarks, each a small cube glyph plus name that brightens on hover and routes through useNavigate. Quiet, credible social proof. Use directly beneath the hero on machine-shop, fabricator, contract-manufacturer or industrial-engineering landing pages.",
  props: z.object({
    heading: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
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
        lead={heading}
        logos={items}
        logoStyle="opacity-hover"
        onClickLogo={go}
        className={cn('border-y border-border bg-muted py-12', props.className)}
      />
    )
  },
})
