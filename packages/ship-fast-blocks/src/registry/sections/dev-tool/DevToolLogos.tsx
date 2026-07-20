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
 * DevToolLogos — collapsed-border "trusted by" ledger strip for a developer
 * tool / API platform. A hairline-bottomed band where a left-aligned mono
 * caption behind a "$" prompt glyph sits beside a stretching hairline rule and
 * an aria-hidden "--verified" flag tag; below, a collapsed-border grid of
 * wordmark cells (2 cols on mobile up to 6 on desktop) sharing hairline
 * borders, each a dimmed mono wordmark that brightens on hover. Each routes
 * through section-kit route links. Use directly beneath a hero to establish
 * credibility for developer tools, API platforms, or technical SaaS.
 */
export const DevToolLogos = defineCapsule({
  name: 'DevToolLogos',
  description:
    "Collapsed-border 'trusted by' ledger strip for a developer tool / API platform: a hairline-bottomed band with a left-aligned mono '$'-prompt caption beside a hairline rule and an aria-hidden '--verified' flag tag, above a collapsed-border grid of mono wordmark cells (2 cols on mobile up to 6 on desktop) that share hairline borders and brighten on hover. Each routes through section-kit route links. Use beneath a hero to establish credibility for developer tools, API platforms, or technical SaaS.",
  props: z.object({
    label: z.string().optional(),
    companies: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Trusted by engineering teams at'
    const companies = props.companies?.length
      ? props.companies
      : ['Stripe', 'Notion', 'Linear', 'Vercel', 'Shopify', 'Slack']

    return (
      <LogoStrip
        className={cn('border-b border-border bg-background', props.className)}
      >
        <Container className="py-10 sm:py-12">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] text-primary"
            >
              $
            </span>
            <LogoStripLabel className="min-w-0 text-left font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground sm:shrink-0">
              {label}
            </LogoStripLabel>
            <span
              aria-hidden="true"
              className="hidden h-px flex-1 bg-border sm:block"
            />
            <span
              aria-hidden="true"
              className="hidden shrink-0 font-mono text-[11px] tracking-[0.12em] text-muted-foreground/60 sm:inline"
            >
              --verified
            </span>
          </div>
          <LogoStripItems
            layout="grid"
            className="mt-8 grid-cols-2 gap-0 border-l border-t border-border sm:grid-cols-3 md:grid-cols-6"
          >
            {companies.filter(Boolean).map((logo) => (
              <LogoStripItem key={logo} variant="opacity-hover" asChild>
                <NavbarRouteLink
                  href={logo}
                  className="border-b border-r border-border px-3 py-5 font-mono text-base tracking-tight text-muted-foreground/70 transition-colors hover:bg-muted/60 hover:text-foreground"
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
