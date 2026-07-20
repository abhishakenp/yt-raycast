import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  CtaBand,
  CtaBandInner,
  CtaBandEyebrow,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'
import { kitActionClasses } from '#/section-kit/types.ts'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
} from '../commerce/commerce-interactions.tsx'
import { isProductPurchaseIntent } from './product-purchase-intent.ts'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const ProductDetailCta = defineCapsule({
  name: 'ProductDetailCta',
  description:
    'Editorial-product closing call-to-action band for the Product Detail page family, styled for the premium Aurora brand. A full ink inversion (bg-foreground / text-background) cuts in on a slanted clip-path seam behind a giant ghost brand watermark, with a mono eyebrow over a hairline rule, an oversized extrabold tight-tracked headline, a supporting paragraph, and a square button row where the primary action drives real Lakebed cart mutations for Add to Cart and secondary actions route through navigation, each with press feedback. Exposes optional eyebrow, title, subtitle, productTitle, productPrice, and actions props so prompts can retarget the messaging and buttons, while Aurora-branded defaults — free shipping, 30-day returns, and Add to Cart / Learn More actions — keep the section ready to ship. Use as the last band of a product detail page or as a focused CTA inside a larger generated site.',
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
      <CtaBand
        tone="primary"
        className={cn(
          'relative overflow-hidden bg-foreground text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)]',
          props.className,
        )}
      >
        <Watermark className="right-[-0.06em] top-[0.3em] text-[clamp(6rem,18vw,14rem)] uppercase text-background/[0.05]">
          {productTitle.split(' ')[0]}
        </Watermark>
        <CtaBandInner
          align="left"
          className="relative max-w-5xl px-6 pt-24 pb-16 sm:pt-28 lg:px-8"
        >
          <CtaBandEyebrow className="flex w-full items-center gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-background/50 opacity-100">
            {eyebrow}
            <span aria-hidden="true" className="h-px flex-1 bg-background/20" />
          </CtaBandEyebrow>
          <CtaBandTitle className="max-w-2xl text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[0.98] tracking-tighter text-background">
            {title}
          </CtaBandTitle>
          <CtaBandSubtitle className="max-w-xl text-background/70 opacity-100">
            {subtitle}
          </CtaBandSubtitle>
          <div className="mt-4 flex flex-wrap justify-start gap-3">
            {actions.map((action) => {
              const isAddToCart = isProductPurchaseIntent(action.label)
              const isInvert =
                (action.variant ?? 'primary') === 'primary' || isAddToCart
              const className = `${kitActionClasses(action.variant, isInvert)} inline-flex items-center justify-center gap-2 rounded-none font-mono text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-70`

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
                <CtaAction
                  key={action.label}
                  variant={action.variant}
                  invert={isInvert}
                  className="gap-2 rounded-none font-mono text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                  asChild
                >
                  <NavbarRouteLink href={action.target ?? action.label}>
                    {action.label}
                  </NavbarRouteLink>
                </CtaAction>
              )
            })}
          </div>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
