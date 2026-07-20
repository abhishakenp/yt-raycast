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
 * EcommerceLogos — editorial-commerce trust ledger for a general online store.
 * A hairline-bounded band (border top and bottom) with a left-aligned mono
 * uppercase eyebrow, a hairline rule, and a tabular item count, above a
 * collapsed-border ledger of trust cells (free shipping, secure checkout, easy
 * returns, support) — each cell sharing hairline rules and pairing a muted
 * index numeral with a mono uppercase label. Stays a tight 2-column ledger on
 * small screens and expands to 4 columns on desktop. Use directly under the
 * hero to reassure shoppers and reduce checkout friction for any retail or
 * ecommerce storefront.
 */
export const EcommerceLogos = defineCapsule({
  name: 'EcommerceLogos',
  description:
    'Editorial-commerce trust ledger for a general online store: a hairline-bounded band with a left-aligned mono uppercase eyebrow, hairline rule, and tabular item count above a collapsed-border ledger of trust cells (free shipping, secure checkout, easy returns, 24/7 support), each pairing a muted index numeral with a mono uppercase label; 2 columns on mobile, 4 on desktop. Use directly under the hero of any ecommerce or retail storefront to reassure shoppers and reduce checkout friction.',
  props: z.object({
    eyebrow: z.string().optional(),
    items: z
      .array(
        z.object({
          label: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const stripEyebrow = props.eyebrow ?? 'Why Shop With Us'
    const trustItems = props.items?.length
      ? props.items
      : [
          { label: 'Free Shipping Over $50' },
          { label: 'Secure Checkout' },
          { label: '30-Day Returns' },
          { label: '24/7 Support' },
        ]
    const trustLabels = trustItems.map((t) => t.label).filter(Boolean)

    return (
      <LogoStrip
        className={cn(
          'border-y border-border bg-background py-10 sm:py-12',
          props.className,
        )}
      >
        <Container>
          <div className="flex items-center gap-4">
            <LogoStripLabel className="shrink-0 text-left font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {stripEyebrow}
            </LogoStripLabel>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 tabular-nums"
            >
              {String(trustLabels.length).padStart(2, '0')} / Trust
            </span>
          </div>
          <LogoStripItems
            layout="flex"
            className="mt-6 grid grid-cols-2 gap-0 border-l border-t border-border lg:grid-cols-4"
          >
            {trustLabels.map((logo, i) => (
              <LogoStripItem
                key={logo}
                variant="text"
                className="flex items-center gap-3 border-b border-r border-border px-4 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-foreground sm:px-5"
              >
                <span
                  aria-hidden="true"
                  className="text-muted-foreground/50 tabular-nums"
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
