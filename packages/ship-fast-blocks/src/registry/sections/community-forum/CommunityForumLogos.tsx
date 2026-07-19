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
 * CommunityForumLogos — logo trust strip for a community-platform / discussion-forum
 * landing page. A centered section heading over a muted band, with a horizontal row
 * of faux-logos (initial-letter icon + name) that route through section-kit route links on click.
 * Use as a social-proof / trusted-by section for community platforms, SaaS products,
 * or online forums.
 */
export const CommunityForumLogos = defineCapsule({
  name: 'CommunityForumLogos',
  description:
    'Logo trust strip for a community-platform / discussion-forum landing page: a centered section heading over a muted band with a horizontal row of faux-logos (initial-letter icon + name) that route through section-kit route links on click. Use as a social-proof / trusted-by section for community platforms, SaaS products, or online forums.',
  props: z.object({
    /** Section heading text. */
    heading: z.string().optional(),
    /** Logo names displayed as faux-logos; each routes on click. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Trusted by teams at innovative companies'
    const items = props.items?.length
      ? props.items
      : ['Vercel', 'Notion', 'Linear', 'Figma', 'Stripe', 'Slack']

    return (
      <LogoStrip
        className={cn(
          'border-y border-border bg-muted/50 py-12 opacity-60',
          props.className,
        )}
      >
        <LogoStripLabel className="normal-case tracking-normal">
          {heading}
        </LogoStripLabel>
        <LogoStripItems layout="flex" className="mt-8">
          {items.filter(Boolean).map((logo) => (
            <LogoStripItem
              key={logo}
              variant="text-bold"
              className="text-foreground/80"
              asChild
            >
              <NavbarRouteLink href={logo}>{logo}</NavbarRouteLink>
            </LogoStripItem>
          ))}
        </LogoStripItems>
      </LogoStrip>
    )
  },
})
