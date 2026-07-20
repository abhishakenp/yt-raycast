import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * InsuranceLogos — Swiss-trust press / partner strip for an insurance page. A
 * hairline-bordered band whose content sits in a plain Container: a mono micro-
 * label lead line with a tabular partner count sits above a collapsed-border
 * grid of wordmark cells (shared hairline rules, binary radius, no gaps), each
 * carrying a mono index numeral and dimming to full ink on hover. Precise, calm
 * social proof; use right under the hero to establish credibility with press
 * mentions or partner brands for insurance carriers, insurtech, brokers, or
 * financial-protection products. Renders fully with no props via baked-in
 * defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  LogoStrip,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
export const InsuranceLogos = defineCapsule({
  name: 'InsuranceLogos',
  description:
    'Swiss-trust press / partner strip for an insurance / fintech page: a hairline-bordered band whose content sits in a plain Container, with a mono micro-label lead line + tabular partner count above a collapsed-border grid of wordmark cells (shared hairline rules, binary radius, mono index numerals, dim-to-ink hover). Use right under the hero to establish credibility with press mentions or partner brands.',
  props: z.object({
    /** Uppercase eyebrow label above the logos. */
    label: z.string().optional(),
    /** Wordmark labels rendered as text logos. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Trusted by industry leaders'
    const items = props.items?.length
      ? props.items
      : ['Forbes', 'Bloomberg', 'TechCrunch', 'WSJ', 'Inc. 5000', 'NerdWallet']
    const cells = items.filter(Boolean)
    return (
      <LogoStrip
        className={cn(
          'border-y border-border bg-muted/40 py-14',
          props.className,
        )}
      >
        <Container>
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4">
            <MonoTag>{label}</MonoTag>
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 tabular-nums"
            >
              {String(cells.length).padStart(2, '0')} partners
            </MonoTag>
          </div>
          <LogoStripItems
            layout="grid"
            className="grid-cols-2 gap-0 border-l border-t border-border sm:grid-cols-3 md:grid-cols-6"
          >
            {cells.map((logo, i) => (
              <LogoStripItem
                key={logo}
                variant="opacity-hover"
                className="flex items-center justify-center border-b border-r border-border px-4 py-7 text-base font-semibold tracking-tight text-foreground/55 transition-colors hover:text-foreground"
              >
                <span
                  aria-hidden="true"
                  className="mr-2 font-mono text-[10px] tabular-nums text-muted-foreground/40"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                {logo}
              </LogoStripItem>
            ))}
          </LogoStripItems>
        </Container>
      </LogoStrip>
    )
  },
})
