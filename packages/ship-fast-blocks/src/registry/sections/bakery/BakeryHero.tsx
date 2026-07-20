import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroSubheading,
  HeroActions,
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
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
import { DotGrid, MonoTag, Watermark } from '#/section-kit/Decor.tsx'

/**
 * BakeryHero — playful-geometric warm hero for an artisan-bakery landing page.
 * Asymmetric 7:5 split on a background washed with a giant blurred primary
 * blob, a faint dot grid, and an oversized ghost "❋" flour-star watermark. The
 * left column opens with a slightly-rotated sticker eyebrow chip (chunky 2px
 * border + soft offset shadow) mirrored by a mono "01 / Bakehouse" index, then
 * an oversized serif display headline, the supporting paragraph, two chunky
 * rounded-full pill CTAs (solid primary + outlined, both with 2px borders,
 * offset shadows, and mechanical press feedback), a rotated "today's bake"
 * ticket card with serif italic price and a real add-to-cart chip, and a
 * dotted-rule hours + address mono strip. The right column is an arch-topped
 * (rounded-t-full) hero photo with a chunky border and offset shadow over an
 * offset primary-wash arch echo, plus a counter-rotated sticker badge card
 * overlapping its corner. CTAs route through section-kit route links; the
 * photo is alt-driven and the featured bake seeds the shared commerce catalog
 * and Lakebed cart. Use as the opening hero for bakeries, patisseries, cafes,
 * or pastry shops. Renders fully with no props via baked-in "Flour & Stone"
 * defaults.
 */
export const BakeryHero = defineCapsule({
  name: 'BakeryHero',
  description:
    "Playful-geometric warm hero for an artisan-bakery landing page: an asymmetric 7:5 split over a blurred primary wash, faint dot grid and giant ghost flour-star watermark — left column has a rotated sticker eyebrow chip with chunky border and offset shadow, a mono index tag, an oversized serif display headline, a supporting paragraph, two chunky rounded-full pill CTAs with press feedback, a rotated 'today's bake' ticket card with serif italic price and a real add-to-cart chip, and a dotted-rule hours + address mono strip; right column is an arch-topped photo with chunky border and offset shadow over a primary-wash arch echo, plus a counter-rotated sticker badge card overlapping its corner. CTAs route through section-kit route links, the photo is alt-driven, and the featured bake seeds the shared commerce catalog and Lakebed cart. Use as the opening hero for bakeries, patisseries, sourdough/artisan-bread shops, cafes, or pastry kitchens.",
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
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

    const PinIcon = () => (
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
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )

    return (
      <HeroSection
        className={cn(
          'relative overflow-hidden border-b-2 border-foreground/10 bg-background',
          props.className,
        )}
      >
        {/* Warm wash blob + dot grid + giant flour-star ghost. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -top-32 right-[-10rem] size-[26rem] rounded-full bg-primary/10 blur-3xl sm:size-[34rem]" />
          <DotGrid
            density="loose"
            fade="bottom"
            className="inset-x-0 top-0 h-72"
          />
          <Watermark className="-bottom-20 -left-10 font-serif text-[14rem] italic text-foreground/[0.05] sm:text-[20rem] lg:text-[26rem]">
            ❋
          </Watermark>
        </div>

        <Container className="relative py-14 sm:py-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex -rotate-1 items-center gap-2 rounded-full border-2 border-foreground bg-background px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-foreground shadow-[3px_3px_0_0] shadow-foreground/20">
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-full bg-primary"
                  />
                  {eyebrow}
                </span>
                <MonoTag
                  aria-hidden="true"
                  className="hidden shrink-0 sm:inline"
                >
                  01 / Bakehouse
                </MonoTag>
              </div>

              <h1 className="mt-7 max-w-2xl font-serif text-[clamp(2.5rem,6vw,4.5rem)] font-medium leading-[1.02] tracking-tight text-foreground">
                {heading}
              </h1>
              <HeroSubheading className="mt-6 max-w-xl">
                {subheading}
              </HeroSubheading>

              <HeroActions className="mt-8 items-center gap-4">
                <NavbarRouteLink
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-foreground bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-[4px_4px_0_0] shadow-foreground transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0] hover:shadow-foreground active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  href={primaryTarget}
                >
                  {primaryCta}
                  <ArrowRight />
                </NavbarRouteLink>
                <NavbarRouteLink
                  className="inline-flex items-center justify-center rounded-full border-2 border-foreground bg-background px-7 py-3 text-sm font-semibold text-foreground shadow-[4px_4px_0_0] shadow-foreground/20 transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0] hover:shadow-foreground/20 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  href={secondaryTarget}
                >
                  {secondaryCta}
                </NavbarRouteLink>
              </HeroActions>

              {/* Today's bake ticket — sharp sticker card against the round pills. */}
              <div className="mt-8 flex max-w-full -rotate-1 flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl rounded-bl-none border-2 border-foreground/15 bg-card p-4 pr-5 shadow-[5px_5px_0_0] shadow-foreground/10 sm:inline-flex sm:gap-5">
                <div className="min-w-0 flex-1 basis-40 sm:flex-none sm:basis-auto">
                  <MonoTag className="text-[10px]">
                    {featuredItemSubtitle}
                  </MonoTag>
                  <p className="mt-1 font-serif text-lg font-medium text-card-foreground sm:truncate">
                    {featuredItemName}
                  </p>
                </div>
                <span className="shrink-0 font-serif text-3xl italic text-foreground">
                  {featuredItemPrice}
                </span>
                <CommerceAddItemButton
                  lakebed={lakebed}
                  item={{
                    label: featuredItemName,
                    price: featuredItemPrice,
                  }}
                  aria-label={`${addLabel} ${featuredItemName}`}
                  pendingChildren={<CommerceMutationSpinner />}
                  className="inline-flex shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-background px-4 py-2 text-xs font-semibold text-foreground transition-all duration-100 hover:bg-foreground hover:text-background active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                >
                  {addLabel}
                </CommerceAddItemButton>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t-2 border-dotted border-foreground/20 pt-5">
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  <span className="text-primary">
                    <ClockIcon />
                  </span>
                  <span>{hoursChip}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  <span className="text-primary">
                    <PinIcon />
                  </span>
                  <span>{addressChip}</span>
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
              {/* Arch echo behind the photo. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-4 top-5 h-full w-full rounded-t-full rounded-b-[2.5rem] bg-primary/15 sm:-left-6 sm:top-6"
              />
              <HeroMediaPanel
                alt={imageAlt}
                w={800}
                h={1000}
                className="relative h-[22rem] w-full rounded-t-full rounded-b-[2.5rem] border-2 border-foreground shadow-[7px_7px_0_0] shadow-foreground/15 sm:h-[26rem] lg:h-[32rem]"
              />
              <div className="absolute -bottom-5 -left-3 -rotate-3 rounded-2xl rounded-tr-none border-2 border-foreground bg-card p-3.5 shadow-[5px_5px_0_0] shadow-foreground/20 sm:-left-8 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-foreground/15 bg-primary/10 text-primary sm:size-12">
                    <svg
                      width="22"
                      height="22"
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
                    <p className="font-serif text-base font-medium text-card-foreground">
                      {badgeTitle}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
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
