import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * CommunityForumLogos — playful sticker-chip logo trust strip for a
 * community-platform / discussion-forum landing page. A hairline-bordered band
 * with a mono uppercase micro-label lead flanked by rule lines, above a row of
 * wordmark sticker chips: rounded-full bordered pills, each tilted a hair in
 * alternating directions, that lift on hover and press down on click. Each
 * chip routes through section-kit route links. Use as a social-proof /
 * trusted-by section for community platforms, SaaS products, or online forums.
 */
export const CommunityForumLogos = defineCapsule({
  name: 'CommunityForumLogos',
  description:
    'Playful sticker-chip logo trust strip for a community-platform / discussion-forum landing page: a hairline-bordered band with a mono uppercase micro-label lead flanked by rule lines, above a row of rounded-full bordered wordmark sticker chips tilted a hair in alternating directions that lift on hover and press on click. Each chip routes through section-kit route links. Use as a social-proof / trusted-by section for community platforms, SaaS products, or online forums.',
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
    const tilts = [
      '-rotate-1',
      'rotate-1',
      'rotate-0',
      'rotate-1',
      '-rotate-1',
      'rotate-0',
    ]

    return (
      <LogoStrip
        className={cn(
          'border-y border-border bg-background py-10 sm:py-12',
          props.className,
        )}
      >
        <Container>
          <div className="flex items-center gap-4">
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <LogoStripLabel className="font-mono text-[11px] normal-case tracking-[0.18em] uppercase text-muted-foreground">
              {heading}
            </LogoStripLabel>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
          </div>
          <LogoStripItems
            layout="flex"
            className="mt-8 gap-x-3 gap-y-3 sm:gap-x-4"
          >
            {items.filter(Boolean).map((logo, i) => (
              <LogoStripItem
                key={logo}
                variant="text-bold"
                className={cn(
                  'inline-flex items-center rounded-full border-2 border-foreground/15 bg-card px-5 py-2 text-sm font-semibold tracking-tight text-foreground/70 transition-all duration-150 hover:-translate-y-0.5 hover:border-foreground/40 hover:text-foreground active:translate-y-px',
                  tilts[i % tilts.length],
                )}
                asChild
              >
                <NavbarRouteLink href={logo}>{logo}</NavbarRouteLink>
              </LogoStripItem>
            ))}
          </LogoStripItems>
        </Container>
      </LogoStrip>
    )
  },
})
