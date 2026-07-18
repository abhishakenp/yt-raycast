import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * MobileAppLogos — a compact, centered "Featured in" press-logo strip with a
 * bordered bottom. A small uppercase eyebrow label sits over a wrapping,
 * dimmed row of bold wordmark-style publication names. Pure text logos, no
 * imagery, no links. Use as a slim social-proof / press-credibility band placed
 * directly under the hero of a mobile-app, SaaS or consumer-product landing
 * page. Renders fully with no props via baked-in defaults.
 */
import { LogoStrip } from '#/section-kit/LogoStrip.tsx'
export const MobileAppLogos = defineCapsule({
  name: 'MobileAppLogos',
  description:
    "Compact centered 'Featured in' press-logo strip with a bordered bottom: a small uppercase eyebrow label over a wrapping, dimmed row of bold wordmark-style publication names (pure text logos, no imagery). Use as a slim social-proof / press-credibility band placed directly under the hero of a mobile-app, SaaS or consumer-product landing page.",
  props: z.object({
    label: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Featured in'
    const items = props.items?.length
      ? props.items
      : ['TechCrunch', 'Product Hunt', 'Wired', 'The Verge', 'Fast Company']
    return (
      <LogoStrip
        lead={label}
        logos={items}
        logoStyle="opacity-hover"
        className={cn('border-b border-border pt-28 pb-12', props.className)}
      />
    )
  },
})
