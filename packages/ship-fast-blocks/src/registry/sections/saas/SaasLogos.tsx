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

/**
 * SaasLogos — collapsed-border "trusted by" ledger strip for a SaaS landing
 * page. A hairline-bottomed band where a left-aligned mono micro-label caption
 * (with a primary tick) sits beside a hairline rule, above a collapsed-border
 * grid of wordmark cells (2 cols on mobile up to 4 on desktop) that share
 * hairline borders, carry a dimmed semibold wordmark, and brighten on hover.
 * Tokens-only, no links, no images (names render as styled text). Use directly
 * beneath a hero to establish credibility for AI tools, SaaS apps, developer
 * tools, or B2B startups. Renders fully with no props via baked-in default brand
 * names.
 */
export const SaasLogos = defineCapsule({
  name: 'SaasLogos',
  description:
    "Collapsed-border 'trusted by' ledger strip for a SaaS landing page: a hairline-bottomed band with a left-aligned mono micro-label caption (with a primary tick) beside a hairline rule, above a collapsed-border grid of wordmark cells (2 cols on mobile up to 4 on desktop) that share hairline borders, carry a dimmed semibold wordmark, and brighten on hover. Tokens-only, no links, no images (names render as styled text). Use directly beneath a hero to establish credibility for AI tools, SaaS apps, developer tools, or B2B startups.",
  props: z.object({
    /** Uppercase eyebrow label above the logo row. */
    label: z.string().optional(),
    /** Company / brand wordmark names shown in the strip. */
    names: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Trusted by teams at'
    const names = props.names?.length
      ? props.names
      : [
          'Linear',
          'Notion',
          'Vercel',
          'Figma',
          'Stripe',
          'Slack',
          'GitHub',
          'Anthropic',
        ]

    return (
      <LogoStrip
        className={cn('border-b border-border bg-background', props.className)}
      >
        <Container className="py-10 sm:py-12">
          <div className="flex items-center gap-4">
            <span aria-hidden="true" className="size-1.5 shrink-0 bg-primary" />
            <LogoStripLabel className="min-w-0 text-left font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground sm:shrink-0">
              {label}
            </LogoStripLabel>
            <span
              aria-hidden="true"
              className="hidden h-px flex-1 bg-border sm:block"
            />
          </div>
          <LogoStripItems
            layout="grid"
            className="mt-8 grid-cols-2 gap-0 border-l border-t border-border sm:grid-cols-3 md:grid-cols-4"
          >
            {names.filter(Boolean).map((logo) => (
              <LogoStripItem
                key={logo}
                variant="opacity-hover"
                className="border-b border-r border-border px-3 py-5 text-lg font-extrabold tracking-tight transition-colors hover:bg-muted/60"
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
