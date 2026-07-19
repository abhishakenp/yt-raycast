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
 * EventLogos — a trusted-by sponsor / company logo strip for a conference or event
 * page. A muted, top-and-bottom-bordered band with a centered caption above a
 * wrapping row of dimmed wordmark buttons that brighten on hover. Each wordmark
 * routes through section-kit route links. Use directly beneath the hero of conference, summit,
 * meetup, or festival pages to show sponsors, partners, or featured companies.
 */
export const EventLogos = defineCapsule({
  name: 'EventLogos',
  description:
    'Trusted-by sponsor / company logo strip for a conference or event page: a muted, top-and-bottom-bordered band with a centered caption above a wrapping row of dimmed wordmark buttons that brighten on hover. Each wordmark routes through section-kit route links. Use directly beneath the hero of conference, summit, meetup, festival, or webinar pages to surface sponsors, partners, or featured companies.',
  props: z.object({
    /** Caption above the logo row. */
    label: z.string().optional(),
    /** Sponsor / company wordmarks. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Trusted by teams at leading companies'
    const items = props.items?.length
      ? props.items
      : ['Vercel', 'Notion', 'Linear', 'Figma', 'Stripe', 'Shopify']

    return (
      <LogoStrip
        className={cn(
          'border-y border-border bg-muted py-12 opacity-60',
          props.className,
        )}
      >
        <LogoStripLabel className="text-sm normal-case tracking-normal">
          {label}
        </LogoStripLabel>
        <LogoStripItems layout="flex" className="mt-8">
          {items.filter(Boolean).map((logo) => (
            <LogoStripItem
              key={logo}
              className="text-foreground transition-opacity hover:opacity-80"
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
