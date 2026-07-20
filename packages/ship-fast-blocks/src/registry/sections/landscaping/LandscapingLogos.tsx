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
 * LandscapingLogos — organic-editorial "trusted by" social-proof strip for a
 * landscaping / outdoor-design company. A hairline-bordered band on a muted wash
 * pairs a mono uppercase caption on the left with a collapsed-border ledger of
 * partner / neighborhood property names — each name a mono cell sharing hairline
 * rules with its neighbors (2 cols on mobile, up to 6 on large screens), dimmed
 * until hover. Calm and understated to lend credibility without stealing focus.
 * Use directly beneath a hero for landscapers, lawn-care services, garden
 * designers or property-maintenance companies. Renders fully with no props via
 * baked-in Portland-neighborhood defaults.
 */
export const LandscapingLogos = defineCapsule({
  name: 'LandscapingLogos',
  description:
    "Organic-editorial 'trusted by' social-proof strip for a landscaping / outdoor-design company: a hairline-bordered band on a muted wash pairing a mono uppercase caption on the left with a collapsed-border ledger of partner / neighborhood property names, each a mono cell sharing hairline rules with its neighbors (2 cols on mobile, up to 6 on large screens) and dimmed until hover. Calm and understated to lend credibility without stealing focus. Use directly beneath a hero for landscapers, lawn-care services, garden designers or property-maintenance companies.",
  props: z.object({
    label: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Trusted by leading Portland properties'
    const items = props.items?.length
      ? props.items
      : [
          'Pearl District Condos',
          'Hawthorne Gardens',
          'Alberta Arts Lofts',
          'Sellwood Heights',
          'Laurelhurst Estates',
          'Forest Park HOA',
        ]

    return (
      <LogoStrip
        className={cn(
          'border-y border-border bg-muted/30 py-12',
          props.className,
        )}
      >
        <Container>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
            <LogoStripLabel className="max-w-[16rem] shrink-0 text-left font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground lg:self-center">
              {label}
            </LogoStripLabel>
            <LogoStripItems
              layout="grid"
              className="flex-1 grid-cols-2 gap-0 border-l border-t border-border md:grid-cols-3 lg:grid-cols-6"
            >
              {items.filter(Boolean).map((logo) => (
                <LogoStripItem
                  key={logo}
                  variant="opacity-hover"
                  className="flex items-center justify-center border-b border-r border-border px-3 py-5 text-center font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {logo}
                </LogoStripItem>
              ))}
            </LogoStripItems>
          </div>
        </Container>
      </LogoStrip>
    )
  },
})
