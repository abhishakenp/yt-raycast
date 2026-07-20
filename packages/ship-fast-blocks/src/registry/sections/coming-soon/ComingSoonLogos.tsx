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
 * ComingSoonLogos — "trusted by" wordmark band for a "launching soon" /
 * waitlist pre-launch landing page. An asymmetric hairline band: a left-aligned
 * mono uppercase eyebrow with a rule line, then a flex row of sharp-cornered
 * bordered company-name chips (stand-ins for logos) in mono uppercase type with
 * press feedback. Each name is a clickable button that routes through
 * section-kit route links. Use as social-proof / trust-signal band on SaaS
 * waitlists, app pre-launch pages, or any early-access landing page. Renders
 * fully with no props via baked-in default names.
 */
export const ComingSoonLogos = defineCapsule({
  name: 'ComingSoonLogos',
  description:
    "'Trusted by' wordmark band for a 'launching soon' / waitlist pre-launch landing page: asymmetric hairline band with a left-aligned mono uppercase eyebrow and rule line above a flex row of sharp-cornered bordered company-name chips (stand-ins for logos) in mono uppercase type with press feedback. Each name routes through section-kit route links. Use as social-proof / trust-signal band on SaaS waitlists, app pre-launch pages, or early-access landing pages.",
  props: z.object({
    /** Eyebrow heading above the logo row. */
    heading: z.string().optional(),
    /** Company / brand names displayed as text stand-ins. */
    names: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Trusted by teams at'
    const names = props.names?.length
      ? props.names
      : ['Notion', 'Linear', 'Vercel', 'Figma', 'Stripe', 'Shopify']

    return (
      <LogoStrip
        className={cn(
          'w-full px-4 py-12 sm:px-6 sm:py-14 lg:px-8 xl:px-12',
          props.className,
        )}
      >
        <Container>
          <div className="flex items-center gap-4">
            <LogoStripLabel className="shrink-0 text-left font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              {heading}
            </LogoStripLabel>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <span
              aria-hidden="true"
              className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground/60 sm:block"
            >
              {String(names.length).padStart(2, '0')} / teams
            </span>
          </div>
          <LogoStripItems
            layout="flex"
            className="mt-6 justify-start gap-x-3 gap-y-3"
          >
            {names.filter(Boolean).map((logo) => (
              <LogoStripItem
                key={logo}
                className="rounded-none border border-border px-4 py-2 font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors duration-100 hover:border-foreground hover:text-foreground active:translate-y-px"
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
