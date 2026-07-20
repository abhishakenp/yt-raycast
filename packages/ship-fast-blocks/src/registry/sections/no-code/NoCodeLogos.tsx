import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * NoCodeLogos — collapsed-border "trusted by" ledger strip for a no-code /
 * app-builder SaaS landing page. A hairline-bottomed band where a left-aligned
 * mono micro-label caption (with a primary tick) sits beside a hairline rule,
 * above a collapsed-border grid of lowercase wordmark cells (2 cols on mobile
 * up to 6 on desktop) — every cell shares hairline borders, carries a dimmed
 * lowercase wordmark and brightens on hover. Quiet, ledger-precise social proof
 * meant to sit just below a hero. Use as the logo / "trusted by" strip on any
 * SaaS, no-code builder, marketplace, or product landing page. Renders fully
 * with no props.
 */
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { Container } from '#/section-kit/Container.tsx'
export const NoCodeLogos = defineCapsule({
  name: 'NoCodeLogos',
  description:
    "Collapsed-border trusted-by ledger strip for a no-code / app-builder SaaS landing page: a hairline-bottomed band with a left-aligned mono micro-label caption (with a primary tick) beside a hairline rule, above a collapsed-border grid of lowercase wordmark cells (2 cols on mobile up to 6 on desktop) that share hairline borders and brighten on hover. Quiet social proof meant to sit just below a hero. Use as the logo / 'trusted by' strip on any SaaS, no-code builder, marketplace, or product landing page.",
  props: z.object({
    /** Uppercase label above the logos. */
    label: z.string().optional(),
    /** Wordmark / company names rendered as lowercase text. */
    names: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Trusted by 50,000+ teams worldwide'
    const names = props.names?.length
      ? props.names
      : ['stripe', 'notion', 'linear', 'vercel', 'shopify', 'slack']
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
            className="mt-8 grid-cols-2 gap-0 border-l border-t border-border sm:grid-cols-3 md:grid-cols-6"
          >
            {names.filter(Boolean).map((logo) => (
              <LogoStripItem
                key={logo}
                variant="opacity-hover"
                className="border-b border-r border-border px-3 py-5 lowercase tracking-tight transition-colors hover:bg-muted/60"
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
