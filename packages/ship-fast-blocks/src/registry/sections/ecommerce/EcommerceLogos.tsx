import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'

/**
 * EcommerceLogos — trust/brand strip for a general online store. A slim band
 * bordered top and bottom with an optional centered uppercase tracked eyebrow
 * above a wrapping, centered row of trust badges (free shipping, secure
 * checkout, easy returns, support), each rendered as a small inline-flex item
 * with a generic shield/check icon next to its label. Use directly under the
 * hero to reassure shoppers and reduce checkout friction for any retail or
 * ecommerce storefront.
 */
export const EcommerceLogos = defineCapsule({
  name: 'EcommerceLogos',
  description:
    'Trust/brand strip for a general online store: a slim band bordered top and bottom with an optional centered uppercase tracked eyebrow above a wrapping, centered row of trust badges (free shipping, secure checkout, easy returns, 24/7 support), each a small inline-flex item with a generic shield icon next to its label. Use directly under the hero of any ecommerce or retail storefront to reassure shoppers and reduce checkout friction.',
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

    return (
      <LogoStrip
        className={cn('border-y border-border py-10 sm:py-12', props.className)}
      >
        <LogoStripLabel>{stripEyebrow}</LogoStripLabel>
        <LogoStripItems layout="flex" className="mt-8">
          {trustItems
            .map((t) => t.label)
            .filter(Boolean)
            .map((logo) => (
              <LogoStripItem key={logo} variant="text">
                {logo}
              </LogoStripItem>
            ))}
        </LogoStripItems>
      </LogoStrip>
    )
  },
})
