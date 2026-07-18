import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * BootcampLogos — employer-logo trust strip for a coding bootcamp / career-school
 * landing page. A single-row section with a centered label above a flex-wrap
 * grid of clickable company-name buttons; each button shows an initial-letter
 * tile in muted tones and routes through useNavigate. Use immediately after
 * the hero to build credibility for bootcamps, dev academies, or vocational
 * programs by showing where graduates are placed.
 */
import { LogoStrip } from '#/section-kit/LogoStrip.tsx'
export const BootcampLogos = defineCapsule({
  name: 'BootcampLogos',
  description:
    'Employer-logo trust strip for a coding bootcamp / career-school landing page: centered label above a flex-wrap grid of clickable company-name buttons, each with an initial-letter tile in muted tones that routes through useNavigate. Use immediately after the hero to build credibility for bootcamps, dev academies, or vocational programs by showing where graduates are placed.',
  props: z.object({
    /** Label above the logo strip. */
    label: z.string().optional(),
    /** Company name strings shown as clickable logo items. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const logosLabel =
      props.label ?? 'Our graduates work at leading tech companies'
    const logoItems = props.items?.length
      ? props.items
      : ['GitHub', 'Google', 'Stripe', 'Airbnb', 'Shopify', 'Spotify']
    return (
      <LogoStrip
        lead={logosLabel}
        logos={logoItems}
        logoStyle="opacity-hover"
        onClickLogo={go}
        className={cn(
          'border-b border-border bg-background py-12',
          props.className,
        )}
      />
    )
  },
})
