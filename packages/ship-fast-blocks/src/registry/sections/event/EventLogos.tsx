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
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * EventLogos — kinetic-poster sponsor ticker strip for a conference or event page.
 * A hairline top-and-bottom-bordered band carrying a mono uppercase caption on the
 * left and a static, non-animated ticker row of sponsor wordmarks separated by
 * mono index bullets on the right. Each wordmark is a mono uppercase route link
 * that brightens on hover. Use directly beneath the hero of conference, summit,
 * meetup, or festival pages to show sponsors, partners, or featured companies.
 */
export const EventLogos = defineCapsule({
  name: 'EventLogos',
  description:
    'Kinetic-poster sponsor ticker strip for a conference or event page: a hairline top-and-bottom-bordered band with a mono uppercase caption on the left and a static, non-animated ticker row of sponsor wordmarks separated by mono index bullets on the right. Each wordmark is a mono uppercase route link that brightens on hover. Use directly beneath the hero of conference, summit, meetup, festival, or webinar pages to surface sponsors, partners, or featured companies.',
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
        className={cn('border-y border-border bg-muted py-6', props.className)}
      >
        <Container size="xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
            <LogoStripLabel className="shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {label}
            </LogoStripLabel>
            <LogoStripItems
              layout="flex"
              className="flex-1 flex-wrap items-center gap-x-6 gap-y-3 lg:justify-end"
            >
              {items.filter(Boolean).map((logo, i) => (
                <span key={logo} className="flex items-center gap-6">
                  {i > 0 ? (
                    <span
                      aria-hidden="true"
                      className="hidden font-mono text-xs text-border sm:inline"
                    >
                      /
                    </span>
                  ) : null}
                  <LogoStripItem
                    className="font-mono text-sm uppercase tracking-[0.12em] text-foreground/70 transition-colors hover:text-foreground"
                    asChild
                  >
                    <NavbarRouteLink href={logo}>{logo}</NavbarRouteLink>
                  </LogoStripItem>
                </span>
              ))}
            </LogoStripItems>
          </div>
        </Container>
      </LogoStrip>
    )
  },
})
