import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { HeroSection, HeroMediaPanel } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * SubscriptionBoxHero — playful-commerce split hero for a subscription-box
 * brand. An asymmetric 7:5 grid pairs a mono index eyebrow, a chunky extrabold
 * headline whose key phrase sits inside a tilted primary marker highlight,
 * supporting copy, three squared CTAs (routable primary + secondary links and a
 * shared Lakebed add-to-cart, all with hard offset token shadows and press
 * feedback), and a row of rotated rounded-full sticker badges. The right column
 * frames a single alt-driven unboxing Image inside a token-bordered box motif
 * with a lid flap, an offset shadow frame, a rotated "Unbox the joy" sticker,
 * and a mono price tag. A giant ghost "UNBOX" watermark bleeds behind the whole
 * band. Theme-token only, fully routable via section-kit route links. Renders
 * complete with no props.
 */
export const SubscriptionBoxHero = defineCapsule({
  name: 'SubscriptionBoxHero',
  description:
    "Playful-commerce split hero for a subscription-box brand: an asymmetric 7:5 grid with a mono index eyebrow, a chunky extrabold headline whose key phrase sits inside a tilted primary marker highlight, supporting copy, three squared CTAs (routable primary 'Build your box' + secondary 'How it works' links and a shared Lakebed add-to-cart, all with hard offset token shadows and press feedback), and rotated rounded-full sticker badges, over a token-bordered box-motif frame around an alt-driven unboxing image plus a giant ghost 'UNBOX' watermark. Use as the opening viewport for any curated monthly box or recurring-delivery brand.",
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
      <HeroSection
        className={cn(
          'relative overflow-hidden bg-background py-20 text-foreground sm:py-24',
          props.className,
        )}
      >
        <Watermark className="-right-8 top-10 text-[7rem] sm:text-[12rem] lg:text-[17rem]">
          UNBOX
        </Watermark>
        <Container className="relative grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <div className="mb-6 flex items-center gap-3">
              <span
                className="size-1.5 shrink-0 bg-primary"
                aria-hidden="true"
              />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {eyebrow}
              </span>
              <span className="h-px flex-1 bg-border" aria-hidden="true" />
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.02] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {headline}{' '}
              <span className="relative inline-block whitespace-nowrap">
                <span
                  aria-hidden="true"
                  className="absolute -inset-x-2 inset-y-1 -rotate-1 bg-primary"
                />
                <span className="relative text-primary-foreground">
                  {headlineAccent}
                </span>
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              {subheading}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <NavbarRouteLink
                href={primaryCta}
                className="inline-flex items-center justify-center rounded-none border-2 border-foreground bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-[5px_5px_0_0] shadow-foreground transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0] active:translate-y-px active:shadow-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {primaryCta}
              </NavbarRouteLink>
              <NavbarRouteLink
                href={secondaryCta}
                className="inline-flex items-center justify-center rounded-none border-2 border-foreground bg-background px-7 py-3.5 text-sm font-bold text-foreground shadow-[5px_5px_0_0] shadow-foreground/20 transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 active:translate-y-px active:shadow-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {secondaryCta}
              </NavbarRouteLink>
              <CommerceAddItemButton
                lakebed={lakebed}
                item={{
                  label: featuredBoxName,
                  price: featuredBoxPrice,
                }}
                aria-label={`${addLabel} ${featuredBoxName}`}
                pendingChildren={<CommerceMutationSpinner />}
                className="inline-flex items-center justify-center gap-2 rounded-none border-2 border-foreground bg-foreground px-7 py-3.5 text-sm font-bold text-background shadow-[5px_5px_0_0] shadow-foreground/25 transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 active:translate-y-px active:shadow-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-70"
              >
                {addLabel}
              </CommerceAddItemButton>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {badges.map((badge, i) => (
                <span
                  key={badge}
                  className={cn(
                    'inline-flex items-center rounded-full border-2 border-foreground bg-background px-3.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-foreground shadow-[3px_3px_0_0] shadow-foreground/20',
                    i % 2 === 0 ? '-rotate-1' : 'rotate-1',
                  )}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="relative lg:col-span-5">
            <div
              className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border-2 border-primary/40 bg-primary/10"
              aria-hidden="true"
            />
            <div className="relative border-2 border-foreground bg-card shadow-[10px_10px_0_0] shadow-foreground">
              <div
                className="flex items-center justify-between border-b-2 border-foreground px-4 py-2"
                aria-hidden="true"
              >
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">
                  This month
                </span>
                <span className="flex gap-1">
                  <span className="size-2 rounded-full bg-primary" />
                  <span className="size-2 rounded-full border border-foreground" />
                  <span className="size-2 rounded-full border border-foreground" />
                </span>
              </div>
              <div className="relative">
                <HeroMediaPanel
                  alt={imageAlt}
                  w={900}
                  h={760}
                  className="aspect-[5/4] rounded-none"
                />
                <span className="absolute -right-3 top-4 rotate-3 rounded-full border-2 border-foreground bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground shadow-[3px_3px_0_0] shadow-foreground">
                  Unbox the joy
                </span>
              </div>
              <div className="flex items-end justify-between gap-3 border-t-2 border-foreground px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">
                    {featuredBoxName}
                  </p>
                  <p className="truncate font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {featuredBoxSubtitle}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-lg font-bold tabular-nums text-foreground">
                  {featuredBoxPrice}
                </span>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
