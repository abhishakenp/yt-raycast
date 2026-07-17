import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { LogoStrip } from '#/section-kit/LogoStrip.tsx'

/**
 * CommunityForumLogos — logo trust strip for a community-platform / discussion-forum
 * landing page. A centered section heading over a muted band, with a horizontal row
 * of faux-logos (initial-letter icon + name) that route through useNavigate on click.
 * Use as a social-proof / trusted-by section for community platforms, SaaS products,
 * or online forums.
 */
export const CommunityForumLogos = defineCapsule({
  name: 'CommunityForumLogos',
  description:
    'Logo trust strip for a community-platform / discussion-forum landing page: a centered section heading over a muted band with a horizontal row of faux-logos (initial-letter icon + name) that route through useNavigate on click. Use as a social-proof / trusted-by section for community platforms, SaaS products, or online forums.',
  props: z.object({
    /** Section heading text. */
    heading: z.string().optional(),
    /** Logo names displayed as faux-logos; each routes on click. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Trusted by teams at innovative companies'
    const items = props.items?.length
      ? props.items
      : ['Vercel', 'Notion', 'Linear', 'Figma', 'Stripe', 'Slack']

    return (
      <LogoStrip
        lead={heading}
        logos={items}
        logoStyle="text-bold"
        onClickLogo={(logo) => go(logo)}
        leadClassName="normal-case tracking-normal"
        logoClassName="text-foreground/80"
        className={cn(
          'border-y border-border bg-muted/50 py-12 opacity-60',
          props.className,
        )}
      />
    )
  },
})
