import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  HeroSection,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroMediaPanel,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'

/**
 * BakeryHero — split, two-column hero band for an artisan-bakery landing page,
 * on a soft muted surface. Left column: an uppercase "Est." eyebrow, a large
 * serif-leaning display headline, a supporting paragraph, dual CTAs (filled
 * dark primary + outlined secondary), and an open-hours + address chip row with
 * clock/pin icons. Right column: a large rounded hero photo with a floating
 * "Certified Organic" badge card overlapping its corner. Warm, editorial, light
 * and craft-forward. CTAs route through useNavigate; the photo is alt-driven.
 * Use as the opening hero for bakeries, patisseries, cafes, or pastry shops.
 * Renders fully with no props via baked-in "Flour & Stone" defaults.
 */
export const BakeryHero = defineCapsule({
  name: 'BakeryHero',
  description:
    "Split two-column hero band for an artisan-bakery landing page on a soft muted surface: left column has an uppercase 'Est.' eyebrow, a large display headline, a supporting paragraph, dual CTAs (filled dark primary + outlined secondary), and an open-hours + address chip row with clock/pin icons; right column is a large rounded hero photo with a floating 'Certified Organic' badge card overlapping its corner. Warm, editorial, light and craft-forward; CTAs route through useNavigate and the photo is alt-driven. Use as the opening hero for bakeries, patisseries, sourdough/artisan-bread shops, cafes, or pastry kitchens.",
  props: z.object({
    /** Uppercase eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** Main display headline. */
    heading: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Navigation target for the primary CTA. */
    primaryTarget: z.string().optional(),
    /** Navigation target for the secondary CTA. */
    secondaryTarget: z.string().optional(),
    featuredItemName: z.string().optional(),
    featuredItemPrice: z.string().optional(),
    featuredItemSubtitle: z.string().optional(),
    addLabel: z.string().optional(),
    /** Open-hours chip text. */
    hoursChip: z.string().optional(),
    /** Address chip text. */
    addressChip: z.string().optional(),
    /** Alt text driving the hero photo. */
    imageAlt: z.string().optional(),
    /** Floating badge card title. */
    badgeTitle: z.string().optional(),
    /** Floating badge card subtitle. */
    badgeSubtitle: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Est. 2018 — Portland, Oregon'
    const heading =
      props.heading ??
      'Artisan breads & pastries baked daily with stone-milled flour'
    const subheading =
      props.subheading ??
      'Every loaf tells a story of slow fermentation, organic grains, and time-honored techniques. From our signature sourdough to buttery croissants, we craft each item with intention and care.'
    const primaryCta = props.primaryCta ?? 'Order for Pickup'
    const secondaryCta = props.secondaryCta ?? 'Visit Our Bakery'
    const primaryTarget = props.primaryTarget ?? 'Order'
    const secondaryTarget = props.secondaryTarget ?? 'Visit'
    const featuredItemName = props.featuredItemName ?? 'Country Sourdough'
    const featuredItemPrice = props.featuredItemPrice ?? '$9'
    const featuredItemSubtitle =
      props.featuredItemSubtitle ?? 'Daily bake · organic grains'
    const addLabel = props.addLabel ?? 'Add to cart'
    const hoursChip = props.hoursChip ?? 'Open 7am–4pm Daily'
    const addressChip = props.addressChip ?? '1423 Oak Street'
    const imageAlt =
      props.imageAlt ??
      'Golden crusty artisan sourdough bread loaves arranged on a wooden cutting board in a sunlit bakery'
    const badgeTitle = props.badgeTitle ?? 'Certified Organic'
    const badgeSubtitle = props.badgeSubtitle ?? 'Stone-milled grains'

    useSyncCommerceCatalog(lakebed, [
      commerceProduct({
        imageAlt,
        label: featuredItemName,
        price: featuredItemPrice,
        subtitle: featuredItemSubtitle,
      }),
    ])

    const ArrowRight = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const ClockIcon = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

    const PinIcon = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )

    return (
      <HeroSection className={cn('relative bg-muted', props.className)}>
        <Container size="xl" className="py-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-sm font-medium uppercase tracking-wider text-primary">
                  {eyebrow}
                </p>
                <HeroHeading className="font-semibold">{heading}</HeroHeading>
                <HeroSubheading className="mt-0 max-w-xl">
                  {subheading}
                </HeroSubheading>
              </div>
              <HeroActions className="mt-0 flex-wrap gap-4">
                <HeroCta
                  asChild
                  className="rounded-lg bg-foreground px-6 py-3 font-medium text-background hover:bg-foreground/90"
                >
                  <button type="button" onClick={() => go(primaryTarget)}>
                    {primaryCta}
                    <span className="ml-2">
                      <ArrowRight />
                    </span>
                  </button>
                </HeroCta>
                <HeroCta
                  asChild
                  variant="outline"
                  className="rounded-lg px-6 py-3 font-medium hover:bg-card"
                >
                  <button type="button" onClick={() => go(secondaryTarget)}>
                    {secondaryCta}
                  </button>
                </HeroCta>
                <CommerceAddItemButton
                  lakebed={lakebed}
                  item={{
                    label: featuredItemName,
                    price: featuredItemPrice,
                  }}
                  aria-label={`${addLabel} ${featuredItemName}`}
                  pendingChildren={<CommerceMutationSpinner />}
                  className="inline-flex items-center rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
                >
                  {addLabel}
                </CommerceAddItemButton>
              </HeroActions>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="text-primary">
                    <ClockIcon />
                  </span>
                  <span>{hoursChip}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary">
                    <PinIcon />
                  </span>
                  <span>{addressChip}</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <HeroMediaPanel
                alt={imageAlt}
                w={800}
                h={600}
                rounded="xl"
                className="h-[400px] w-full shadow-xl lg:h-[500px]"
              />
              <div className="absolute -bottom-6 -left-6 hidden rounded-xl bg-card p-4 shadow-lg sm:block">
                <div className="flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-card-foreground">
                      {badgeTitle}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {badgeSubtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
