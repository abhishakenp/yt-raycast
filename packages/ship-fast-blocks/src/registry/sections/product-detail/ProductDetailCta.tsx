import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { kitActionClasses } from '#/section-kit/types.ts'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
} from '../commerce/commerce-interactions.tsx'
import { isProductPurchaseIntent } from './product-purchase-intent.ts'

export const ProductDetailCta = defineCapsule({
  name: 'ProductDetailCta',
  description:
    'Closing call-to-action band for the Product Detail page family, styled for the premium Aurora brand. Drives the final conversion on a single-product detail page for the Aurora Pro Headphones with real Lakebed cart mutations for Add to Cart actions and route navigation for secondary actions. Exposes optional eyebrow, title, subtitle, productTitle, productPrice, and actions props so prompts can retarget the messaging and buttons, while Aurora-branded defaults — free shipping, 30-day returns, and Add to Cart / Learn More actions — keep the section ready to ship. Use as the last band of a product detail page or as a focused CTA inside a larger generated site.',
  lakebed: commerceCartLakebed,
  props: z.object({
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    productTitle: z.string().optional(),
    productPrice: z.string().optional(),
    actions: z
      .array(
        z.object({
          label: z.string(),
          target: z.string().optional(),
          variant: z.enum(['primary', 'outline', 'ghost']).optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Ready when you are'
    const title = props.title ?? 'Get yours today'
    const subtitle =
      props.subtitle ??
      'Free express shipping and a no-questions 30-day return — premium sound, zero risk.'
    const productTitle = props.productTitle ?? 'Aurora Pro Headphones'
    const productPrice = props.productPrice ?? '$299'
    const actions = props.actions?.length
      ? props.actions
      : [
          {
            label: 'Add to Cart',
            target: 'Overview',
            variant: 'primary' as const,
          },
          {
            label: 'Learn More',
            target: 'Features',
            variant: 'outline' as const,
          },
        ]

    return (
      <section
        className={cn(
          'w-full bg-primary text-primary-foreground',
          props.className,
        )}
      >
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 px-6 py-16 text-center lg:px-8">
          {eyebrow ? (
            <span className="text-sm font-medium uppercase tracking-wide opacity-80">
              {eyebrow}
            </span>
          ) : null}
          <h2 className="text-3xl font-semibold md:text-4xl">{title}</h2>
          {subtitle ? (
            <p className="max-w-2xl text-base opacity-90 md:text-lg">
              {subtitle}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-center gap-3">
            {actions.map((action) => {
              const isAddToCart = isProductPurchaseIntent(action.label)
              const isInvert =
                (action.variant ?? 'primary') === 'primary' || isAddToCart
              const className = cn(
                kitActionClasses(action.variant, isInvert),
                'inline-flex items-center justify-center gap-2 disabled:pointer-events-none disabled:opacity-70',
              )

              if (isAddToCart) {
                return (
                  <CommerceAddItemButton
                    key={action.label}
                    lakebed={lakebed}
                    item={{ label: productTitle, price: productPrice }}
                    pendingChildren={
                      <>
                        <CommerceMutationSpinner />
                        Adding
                      </>
                    }
                    className={className}
                  >
                    {action.label}
                  </CommerceAddItemButton>
                )
              }

              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => {
                    go(action.target ?? action.label)
                  }}
                  className={className}
                >
                  {action.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>
    )
  },
})
