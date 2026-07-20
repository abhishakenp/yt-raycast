import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * CloudInfraLogos — terminal-industrial "trusted by" strip for a cloud-
 * infrastructure / developer-platform SaaS landing page. A hairline-ruled row:
 * a mono uppercase label flanked by rule lines above a wrap of square bordered
 * logo chips (mono uppercase text buttons with press feedback). Each item is a
 * clickable button that routes through section-kit route links. Token-only
 * colors. Renders fully on zero arguments.
 */
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const CloudInfraLogos = defineCapsule({
  name: 'CloudInfraLogos',
  description:
    'Terminal-industrial trusted-by strip for a cloud-infrastructure / developer-platform SaaS landing page: a mono uppercase label flanked by hairline rules above a wrap of square bordered logo chips (mono uppercase text buttons with press feedback). Each item routes through section-kit route links. Use for social proof / credibility bands on cloud hosting, IaaS, PaaS, serverless, or developer-tooling sites.',
  props: z.object({
    /** Heading text above the logo grid. */
    heading: z.string().optional(),
    /** Logo labels displayed as bold text buttons. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Trusted by engineering teams at'
    const items = props.items?.length
      ? props.items
      : ['Stripe', 'Notion', 'Figma', 'Vercel', 'Linear', 'Raycast']
    return (
      <LogoStrip
        className={cn('border-b border-border py-12 sm:py-14', props.className)}
      >
        <Container>
          <div className="flex items-center gap-4">
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <LogoStripLabel className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {heading}
            </LogoStripLabel>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
          </div>
          <LogoStripItems
            layout="flex"
            className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
          >
            {items.filter(Boolean).map((logo) => (
              <LogoStripItem key={logo} variant="opacity-hover" asChild>
                <NavbarRouteLink
                  href={logo}
                  className="border border-border px-4 py-2 font-mono text-sm uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground active:translate-y-px sm:px-5"
                >
                  {logo}
                </NavbarRouteLink>
              </LogoStripItem>
            ))}
          </LogoStripItems>
        </Container>
      </LogoStrip>
    )
  },
})
