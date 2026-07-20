import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * LogisticsLogos — an industrial-manifest client trust strip for a global-
 * logistics / freight-forwarding company. A hairline border-bottomed band: a mono
 * uppercase caption flanked by rule lines above a centered wrap of square bordered
 * wordmark chips (mono uppercase text buttons with press feedback) for an
 * understated "trusted by" feel. Precise and operational, tokens-only; each logo
 * routes through section-kit route links. Use directly beneath the hero of a
 * logistics, freight-forwarding, shipping, courier or cargo/transport site to
 * establish credibility. Renders fully with no props.
 */
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const LogisticsLogos = defineCapsule({
  name: 'LogisticsLogos',
  description:
    'Industrial-manifest client trust strip for a global-logistics / freight-forwarding company: a hairline border-bottomed band with a mono uppercase caption flanked by rule lines above a centered wrap of square bordered wordmark chips (mono uppercase text buttons with press feedback). Precise and operational, tokens-only; each logo routes through section-kit route links. Use directly beneath the hero of a logistics, freight-forwarding, shipping, courier, supply-chain or cargo/transport site to establish credibility.',
  props: z.object({
    heading: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Trusted by industry leaders'
    const items = props.items?.length
      ? props.items
      : ['TechFlow', 'Globex', 'Acme Corp', 'Stark Ind', 'Wayne Ent', 'Oscorp']
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
