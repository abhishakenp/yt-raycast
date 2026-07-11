import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'

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

    const eyebrowCls =
      'text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground'

    return (
      <section
        aria-label="Store guarantees"
        className={cn('border-y border-border py-10 sm:py-12', props.className)}
      >
        <Container>
          {stripEyebrow ? (
            <p className={cn(eyebrowCls, 'mb-8 text-center')}>{stripEyebrow}</p>
          ) : null}
          <ul className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 lg:gap-14">
            {trustItems.map((item) => (
              <li
                key={item.label}
                className="inline-flex items-center gap-2.5 text-sm font-medium text-foreground sm:text-base"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 shrink-0 text-muted-foreground sm:h-6 sm:w-6"
                >
                  <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    )
  },
})
