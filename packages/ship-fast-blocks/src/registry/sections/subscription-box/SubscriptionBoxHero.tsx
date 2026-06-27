import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'

/**
 * SubscriptionBoxHero — bespoke split hero for a subscription-box brand built
 * for playful, delightful unboxing. The left column stacks a playful eyebrow
 * pill, a headline with a key phrase tinted in the primary color, supporting
 * copy, a primary "Build your box" CTA paired with a secondary "How it works"
 * link, and a row of small delight badges (free shipping, cancel anytime). The
 * right column frames a single alt-driven Image of a curated box unboxing in a
 * rounded, shadowed card. Theme-token only and fully routable via useNavigate.
 * Renders complete with no props.
 */
export const SubscriptionBoxHero = defineCapsule({
  name: 'SubscriptionBoxHero',
  description:
    "Bespoke split hero for a subscription-box brand with a playful unboxing aesthetic: an eyebrow pill, a headline with a primary-tinted phrase, supporting copy, dual CTAs (primary 'Build your box' + secondary 'How it works'), and small delight badges over a framed alt-driven unboxing image. Use as the opening viewport for any curated monthly box or recurring-delivery brand.",
  props: z.object({
    eyebrow: z.string().optional(),
    headline: z.string().optional(),
    headlineAccent: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    featuredBoxName: z.string().optional(),
    featuredBoxPrice: z.string().optional(),
    featuredBoxSubtitle: z.string().optional(),
    addLabel: z.string().optional(),
    badges: z.array(z.string()).optional(),
    imageAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'New boxes every month'
    const headline = props.headline ?? 'A little box of joy, delivered to'
    const headlineAccent = props.headlineAccent ?? 'your door'
    const subheading =
      props.subheading ??
      'Hand-picked treats, gadgets, and surprises curated around what you love. Build a box, unwrap the delight, repeat every month.'
    const primaryCta = props.primaryCta ?? 'Build your box'
    const secondaryCta = props.secondaryCta ?? 'How it works'
    const featuredBoxName = props.featuredBoxName ?? 'Classic starter box'
    const featuredBoxPrice = props.featuredBoxPrice ?? '$39/mo'
    const featuredBoxSubtitle =
      props.featuredBoxSubtitle ?? 'Personalized monthly box'
    const addLabel = props.addLabel ?? 'Add to cart'
    const badges = props.badges?.length
      ? props.badges
      : ['Free shipping', 'Cancel anytime', 'Skip a month']
    const imageAlt =
      props.imageAlt ?? 'curated subscription box unboxing products'

    useSyncCommerceCatalog(lakebed, [
      commerceProduct({
        imageAlt,
        label: featuredBoxName,
        price: featuredBoxPrice,
        subtitle: featuredBoxSubtitle,
      }),
    ])

    return (
      <section
        className={cn(
          'overflow-hidden bg-background py-20 text-foreground sm:py-24',
          props.className,
        )}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
              <span
                className="size-2 rounded-full bg-accent"
                aria-hidden="true"
              />
              {eyebrow}
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {headline} <span className="text-primary">{headlineAccent}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              {subheading}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => go(primaryCta)}
                className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                {primaryCta}
              </button>
              <button
                type="button"
                onClick={() => go(secondaryCta)}
                className="inline-flex items-center justify-center rounded-full border border-border bg-background px-7 py-3.5 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                {secondaryCta}
              </button>
              <CommerceAddItemButton
                lakebed={lakebed}
                item={{
                  label: featuredBoxName,
                  price: featuredBoxPrice,
                }}
                aria-label={`${addLabel} ${featuredBoxName}`}
                pendingChildren={<CommerceMutationSpinner />}
                className="inline-flex items-center justify-center rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-background transition hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-70"
              >
                {addLabel}
              </CommerceAddItemButton>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground"
                >
                  <svg
                    className="size-4 shrink-0 text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m5 13 4 4L19 7"
                    />
                  </svg>
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div
              className="absolute -inset-4 rounded-[2rem] bg-primary/10 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_24px_80px_rgba(0,0,0,0.14)]">
              <Image
                alt={imageAlt}
                w={900}
                h={760}
                className="aspect-[5/4] w-full object-cover"
              />
              <div className="absolute right-5 top-5 rotate-3 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg">
                Unbox the joy
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
