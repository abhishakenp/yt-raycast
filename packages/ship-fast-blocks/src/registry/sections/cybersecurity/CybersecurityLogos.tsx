import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * CybersecurityLogos — terminal-stealth cleared-vendor register. A muted,
 * top-and-bottom hairline-bordered band: a mono uppercase eyebrow rule (primary
 * status square + heading left, tabular "N=0X CLEARED" tag right) above a
 * square-edged, collapsed-border 2-to-6 column ledger of mono wordmark cells
 * that brighten on hover. Each wordmark routes through section-kit route
 * links. Use directly under a hero to establish credibility for cybersecurity
 * vendors, SOC/MDR providers, or any B2B security SaaS. Renders fully with no
 * props via baked-in enterprise-customer defaults.
 */
export const CybersecurityLogos = defineCapsule({
  name: 'CybersecurityLogos',
  description:
    "Terminal-stealth cleared-vendor register: a muted, hairline-bordered band with a mono eyebrow rule (status square + heading left, tabular 'N=0X cleared' tag right) above a square-edged, collapsed-border 2-to-6 column ledger of mono wordmark cells (styled text, not brand assets) that brighten on hover, each routing through section-kit route links. Use directly under a hero to establish credibility for cybersecurity vendors, SOC/MDR providers, or any B2B security SaaS.",
  props: z.object({
    /** Uppercase eyebrow line above the logos. */
    heading: z.string().optional(),
    /** Logo wordmark labels (rendered as styled text). */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading =
      props.heading ?? 'Trusted by security teams at leading enterprises'
    const items = props.items?.length
      ? props.items
      : ['Google', 'Amazon', 'Microsoft', 'Apple', 'Netflix', 'Tesla']

    return (
      <LogoStrip
        className={cn(
          'border-y border-border bg-muted/40 py-10 sm:py-12',
          props.className,
        )}
      >
        <Container>
          <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
            <LogoStripLabel className="flex items-center gap-3 text-left font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground">
              <span aria-hidden="true" className="size-2 bg-primary" />
              {heading}
            </LogoStripLabel>
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 tabular-nums"
            >
              n={String(items.filter(Boolean).length).padStart(2, '0')} cleared
            </span>
          </div>
          <LogoStripItems
            layout="flex"
            className="mt-8 grid grid-cols-2 gap-0 border-l border-t border-border sm:grid-cols-3 lg:grid-cols-6"
          >
            {items.filter(Boolean).map((logo) => (
              <LogoStripItem key={logo} variant="opacity-hover" asChild>
                <NavbarRouteLink
                  href={logo}
                  className="border-b border-r border-border px-4 py-6 text-center font-mono text-sm uppercase tracking-[0.15em] transition-colors hover:bg-background"
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
