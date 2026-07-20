import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * MobileAppLogos — a kinetic collapsed-border "featured in" press ledger with a
 * hairline bottom. A left-aligned mono micro-label caption (with a primary tick)
 * sits beside a hairline rule, above a collapsed-border grid of wordmark cells
 * (2 cols on mobile up to 5 on desktop) — every cell shares hairline borders,
 * carries a dimmed semibold wordmark and brightens on hover. Pure text logos, no
 * imagery, no links. Use as a slim social-proof / press-credibility band placed
 * directly under the hero of a mobile-app, SaaS or consumer-product landing
 * page. Renders fully with no props via baked-in defaults.
 */
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { Container } from '#/section-kit/Container.tsx'
export const MobileAppLogos = defineCapsule({
  name: 'MobileAppLogos',
  description:
    "Kinetic collapsed-border 'featured in' press ledger with a hairline bottom: a left-aligned mono micro-label caption beside a hairline rule, above a collapsed-border grid of wordmark cells (2 cols on mobile up to 5 on desktop) that share hairline borders and brighten on hover (pure text logos, no imagery). Use as a slim social-proof / press-credibility band placed directly under the hero of a mobile-app, SaaS or consumer-product landing page.",
  props: z.object({
    label: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Featured in'
    const items = props.items?.length
      ? props.items
      : ['TechCrunch', 'Product Hunt', 'Wired', 'The Verge', 'Fast Company']
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
            {items.filter(Boolean).map((logo) => (
              <LogoStripItem
                key={logo}
                variant="opacity-hover"
                className="border-b border-r border-border px-3 py-5 tracking-tight transition-colors hover:bg-muted/60"
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
