import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * MarketingAgencyLogos — collapsed-border trusted-by ledger strip. A
 * hairline-bottomed band where a left-aligned mono micro-label caption (with a
 * primary tick) sits beside a hairline rule, above a collapsed-border grid of
 * wordmark cells (2 cols on mobile up to 6 on desktop) that share hairline
 * borders, carry a dimmed semibold wordmark and brighten on hover. Use directly
 * beneath a hero to add social proof for marketing / growth agencies, SaaS, or
 * any B2B landing page. Renders fully with no props via baked-in defaults.
 */
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { Container } from '#/section-kit/Container.tsx'
export const MarketingAgencyLogos = defineCapsule({
  name: 'MarketingAgencyLogos',
  description:
    'Collapsed-border trusted-by ledger strip: a hairline-bottomed band with a left-aligned mono micro-label caption beside a hairline rule, above a collapsed-border grid of client/brand wordmark cells (2 cols mobile up to 6 desktop) that share hairline borders and brighten on hover. Use directly beneath a hero to add social proof for marketing / growth agencies, SaaS products, or any B2B landing page.',
  props: z.object({
    heading: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Trusted by leading brands'
    const items = props.items?.length
      ? props.items
      : ['Stripe', 'Notion', 'Figma', 'Vercel', 'Linear', 'Webflow']
    return (
      <LogoStrip
        className={cn('border-b border-border bg-background', props.className)}
      >
        <Container className="py-10 sm:py-12">
          <div className="flex items-center gap-4">
            <span aria-hidden="true" className="size-1.5 shrink-0 bg-primary" />
            <LogoStripLabel className="min-w-0 text-left font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground sm:shrink-0">
              {heading}
            </LogoStripLabel>
            <span
              aria-hidden="true"
              className="hidden h-px flex-1 bg-border sm:block"
            />
          </div>
          <LogoStripItems
            layout="grid"
            className="mt-8 grid-cols-2 gap-0 border-l border-t border-border sm:grid-cols-3 md:grid-cols-6"
          >
            {items.filter(Boolean).map((logo) => (
              <LogoStripItem
                key={logo}
                variant="opacity-hover"
                className="border-b border-r border-border px-3 py-5 tracking-tight transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                {logo}
              </LogoStripItem>
            ))}
          </LogoStripItems>
        </Container>
      </LogoStrip>
    )
  },
})
