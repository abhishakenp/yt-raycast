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

/**
 * MarketingLogos — collapsed-border "trusted by" ledger strip for a SaaS /
 * product-marketing landing page. A hairline-bottomed band where a left-aligned
 * mono micro-label caption (with a primary tick) sits beside a hairline rule,
 * above a collapsed-border grid of muted wordmark cells that share hairline
 * borders and brighten on hover. Quiet, confident social-proof band that sits
 * directly under the hero. Use to show customer / partner logos on B2B SaaS,
 * developer-platform, or any modern software product page.
 */
export const MarketingLogos = defineCapsule({
  name: 'MarketingLogos',
  description:
    "Collapsed-border 'trusted by' ledger strip for a SaaS / product-marketing landing page: a hairline-bottomed band with a left-aligned mono micro-label caption (with a primary tick) beside a hairline rule, above a collapsed-border grid of muted wordmark cells that share hairline borders and brighten on hover. Quiet, confident social-proof band that sits directly under the hero. Use to show customer / partner logos on B2B SaaS, developer-platform, or any modern software product page.",
  props: z.object({
    label: z.string().optional(),
    names: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Trusted by teams at'
    const names = props.names?.length
      ? props.names
      : ['Acme Corp', 'Globex', 'Initech', 'Massive Dynamic', 'Stark Ind']

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
            className="mt-8 grid-cols-2 gap-0 border-l border-t border-border sm:grid-cols-3 md:grid-cols-5"
          >
            {names.filter(Boolean).map((logo) => (
              <LogoStripItem
                key={logo}
                variant="text"
                className="border-b border-r border-border px-3 py-5 font-bold tracking-tight text-muted-foreground/60 transition-colors hover:bg-muted/60 hover:text-foreground"
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
