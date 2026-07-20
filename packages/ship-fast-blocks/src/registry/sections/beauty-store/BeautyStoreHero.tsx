import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Watermark, MonoTag } from '#/section-kit/Decor.tsx'
import {
  HeroSection,
  HeroHeading,
  HeroHighlight,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroMediaPanel,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { StarRating } from '#/section-kit/StarRating.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * BeautyStoreHero — editorial vogue hero for a beauty / skincare / cosmetics
 * e-commerce storefront. A magazine-cover composition: a giant ghost serif
 * "N°01" issue numeral floats behind an asymmetric 7:5 grid. Left side opens
 * with a mono issue rail ("N° 01" — hairline rule — eyebrow), then a huge
 * clamp-scaled serif headline whose highlight line turns italic in the primary
 * accent, a hairline-ruled supporting paragraph, dual sharp-edged CTAs
 * (uppercase-tracked solid foreground + hairline outline that inverts on
 * hover, both with press feedback), and a social-proof strip (overlapping
 * customer avatars, star rating + count in mono). Right side is an asymmetric
 * product plate: a tall 4:5 photo in a hairline frame over an offset hairline
 * outline with a vertical mono edition label on its edge, and a sharp hairline
 * badge card (check chip, cruelty-free title/subtitle and a shoppable
 * add-to-cart button) breaching the plate's lower-left corner. CTAs route
 * through section-kit route links. Use as the opening hero for beauty stores,
 * skincare shops, cosmetics brands, clean beauty retailers, or premium
 * personal-care DTC storefronts.
 */
export const BeautyStoreHero = defineCapsule({
  name: 'BeautyStoreHero',
  description:
    'Editorial vogue hero for a beauty / skincare / cosmetics e-commerce storefront: a magazine-cover composition with a giant ghost serif "N°01" issue numeral behind an asymmetric 7:5 grid. Left side has a mono issue rail with hairline rule and eyebrow, a huge clamp-scaled serif headline with an italic primary-accent highlight line, a hairline-ruled supporting paragraph, dual sharp uppercase-tracked CTAs (solid foreground + hairline outline inverting on hover, press feedback), and a social-proof strip with overlapping customer avatars, star rating and mono rating count. Right side is an asymmetric product plate: a tall 4:5 photo in a hairline frame over an offset hairline outline with a vertical mono edition label, plus a sharp hairline badge card (cruelty-free check chip and shoppable add-to-cart button) breaching its lower-left corner. CTAs route through section-kit route links. Use as the opening hero for beauty stores, skincare shops, cosmetics brands, or premium personal-care DTC storefronts.',
  lakebed: commerceCartLakebed,
  props: z.object({
    /** Eyebrow / collection label above the headline. */
    eyebrow: z.string().optional(),
    /** First heading line (rendered before the highlighted line). */
    headingTop: z.string().optional(),
    /** Phrase rendered in the primary accent color on its own line. */
    highlight: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Rating summary text (e.g. '12,000+ Happy Customers'). */
    ratingCount: z.string().optional(),
    /** Rating value text (e.g. '4.9/5'). */
    ratingValue: z.string().optional(),
    /** Alt text driving the hero product image. */
    imageAlt: z.string().optional(),
    /** Floating badge title. */
    badgeTitle: z.string().optional(),
    /** Floating badge subtitle. */
    badgeSubtitle: z.string().optional(),
    /** Shoppable hero product or bundle name. */
    heroProductName: z.string().optional(),
    /** Shoppable hero product or bundle price. */
    heroProductPrice: z.string().optional(),
    /** Alt texts for the small overlapping customer avatars. */
    customerAlts: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'New Collection'
    const headingTop = props.headingTop ?? 'Radiant Beauty,'
    const highlight = props.highlight ?? 'Naturally Yours'
    const subheading =
      props.subheading ??
      'Discover our curated collection of clean, cruelty-free beauty products. From skincare essentials to makeup must-haves, embrace your natural glow with formulas that care for your skin and the planet.'
    const primaryCta = props.primaryCta ?? 'Shop Bestsellers'
    const secondaryCta = props.secondaryCta ?? 'Explore New Arrivals'
    const ratingCount = props.ratingCount ?? '12,000+ Happy Customers'
    const ratingValue = props.ratingValue ?? '4.9/5'
    const imageAlt =
      props.imageAlt ??
      'arrangement of luxury skincare products including serums creams and face oils on marble surface'
    const badgeTitle = props.badgeTitle ?? '100% Cruelty-Free'
    const badgeSubtitle = props.badgeSubtitle ?? 'Certified Clean Beauty'
    const heroProductName = props.heroProductName ?? 'Clean Beauty Glow Set'
    const heroProductPrice = props.heroProductPrice ?? '$58.00'
    const customerAlts = props.customerAlts?.length
      ? props.customerAlts
      : [
          'happy customer with clear glowing skin',
          'young woman with natural makeup smiling',
          'woman with radiant healthy skin portrait',
          'beautiful woman with dewy makeup look',
        ]
    useSyncCommerceCatalog(lakebed, [
      commerceProduct({
        imageAlt,
        label: heroProductName,
        price: heroProductPrice,
        subtitle: badgeSubtitle,
      }),
    ])

    return (
      <HeroSection
        className={cn(
          'relative overflow-hidden border-b border-border bg-background',
          props.className,
        )}
      >
        {/* Giant ghost issue numeral — the vogue masthead grammar. */}
        <Watermark className="-top-8 right-0 font-serif text-[8rem] font-medium italic tracking-tight text-foreground/[0.05] sm:text-[13rem] lg:-top-14 lg:text-[19rem]">
          N°01
        </Watermark>

        <Container size="xl" className="relative py-16 sm:py-20 lg:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              {/* Mono issue rail: numeral — hairline rule — eyebrow. */}
              <div className="mb-8 flex items-center gap-4">
                <MonoTag className="shrink-0 text-foreground">N° 01</MonoTag>
                <span
                  aria-hidden="true"
                  className="h-px w-10 bg-border sm:max-w-24 sm:flex-1"
                />
                <MonoTag tone="primary" className="min-w-0">
                  {eyebrow}
                </MonoTag>
              </div>
              <HeroHeading className="font-serif text-[clamp(2.9rem,6.4vw,5.9rem)] font-medium leading-[1.02] tracking-tight">
                {headingTop}
                <br />
                <HeroHighlight className="font-serif font-normal italic">
                  {highlight}
                </HeroHighlight>
              </HeroHeading>
              <HeroSubheading className="mt-7 max-w-lg border-l border-border pl-5 text-base leading-relaxed sm:text-lg">
                {subheading}
              </HeroSubheading>
              <HeroActions className="mt-9 flex-wrap gap-3 sm:gap-4">
                <HeroCta
                  asChild
                  className="rounded-none bg-foreground px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-background transition-all duration-150 hover:bg-foreground/90 active:translate-y-px"
                >
                  <NavbarRouteLink href={primaryCta}>
                    {primaryCta}
                  </NavbarRouteLink>
                </HeroCta>
                <HeroCta
                  asChild
                  variant="outline"
                  className="rounded-none border-foreground px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-foreground transition-colors duration-150 hover:bg-foreground hover:text-background active:translate-y-px"
                >
                  <NavbarRouteLink href={secondaryCta}>
                    {secondaryCta}
                  </NavbarRouteLink>
                </HeroCta>
              </HeroActions>
              {/* Social-proof strip under a hairline rule. */}
              <div className="mt-10 flex items-center gap-6 border-t border-border pt-6">
                <div className="flex -space-x-3">
                  {customerAlts.map((alt) => (
                    <Image
                      key={alt}
                      alt={alt}
                      w={100}
                      h={100}
                      className="size-10 rounded-full border-2 border-background object-cover"
                    />
                  ))}
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">
                    {ratingCount}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <StarRating rating={5} size="sm" color="primary" />
                    <span className="font-serif text-sm italic text-muted-foreground">
                      {ratingValue}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative mr-3 sm:mr-0">
                {/* Vertical mono edition label on the plate's edge. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-9 top-0 hidden font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground [writing-mode:vertical-rl] lg:block"
                >
                  Édition — N° 01
                </span>
                {/* Offset hairline outline behind the plate — double-rule framing. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border border-border"
                />
                <HeroMediaPanel
                  alt={imageAlt}
                  w={800}
                  h={1000}
                  className="relative aspect-[4/5] rounded-none border border-foreground/25 shadow-none"
                />
                {/* Badge card breaching the plate's lower-left corner. */}
                <div className="relative z-10 -mt-12 ml-3 w-[calc(100%-1.5rem)] border border-border bg-background p-4 sm:absolute sm:-bottom-6 sm:-left-6 sm:ml-0 sm:mt-0 sm:w-auto sm:max-w-[85%]">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center border border-primary/40 text-primary">
                      <svg
                        className="size-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="font-serif text-base font-medium italic text-foreground">
                        {badgeTitle}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {badgeSubtitle}
                      </p>
                      <CommerceAddItemButton
                        lakebed={lakebed}
                        item={{
                          label: heroProductName,
                          price: heroProductPrice,
                        }}
                        aria-label={`Add ${heroProductName} to cart`}
                        pendingChildren={<CommerceMutationSpinner />}
                        className="mt-3 inline-flex items-center border border-foreground px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground transition-colors duration-150 hover:bg-foreground hover:text-background active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                      >
                        Add set · {heroProductPrice}
                      </CommerceAddItemButton>
                    </div>
                  </div>
                </div>
                {/* Mobile: the vertical edition label becomes a horizontal mono strip. */}
                <span
                  aria-hidden="true"
                  className="mt-6 flex items-center gap-3 lg:hidden"
                >
                  <span className="h-px flex-1 bg-border" />
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    Édition — N° 01
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </span>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
