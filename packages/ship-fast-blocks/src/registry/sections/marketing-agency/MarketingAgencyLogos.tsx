import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * MarketingAgencyLogos — a horizontal client trust strip. A muted, border-banded
 * full-width band with a centered "trusted by" caption above a responsive grid of
 * client/brand wordmarks rendered as muted semibold text at reduced opacity (2-up
 * on mobile, 3-up on tablet, 6-up on desktop). Use directly beneath a hero to add
 * social proof for marketing / growth agencies, SaaS, or any B2B landing page.
 * Renders fully with no props via baked-in defaults.
 */
import { LogoStrip } from '#/section-kit/LogoStrip.tsx'
export const MarketingAgencyLogos = defineCapsule({
  name: 'MarketingAgencyLogos',
  description:
    "Horizontal client trust strip: a muted, border-banded full-width band with a centered 'trusted by' caption above a responsive grid of client/brand wordmarks rendered as muted semibold text at reduced opacity (2-up mobile, 3-up tablet, 6-up desktop). Use directly beneath a hero to add social proof for marketing / growth agencies, SaaS products, or any B2B landing page.",
  props: z.object({
    heading: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Trusted by leading brands'
    const items = props.items?.length
      ? props.items
      : ['Stripe', 'Notion', 'Figma', 'Vercel', 'Linear', 'Webflow']
    return (
      <LogoStrip
        lead={heading}
        logos={items}
        logoStyle="opacity-hover"
        className={cn('border-y border-border bg-muted py-12', props.className)}
      />
    )
  },
})
