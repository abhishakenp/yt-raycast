import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  HeroSection,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { DotGrid, MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * IllustratorHero — sketchbook split hero for an illustrator / visual-artist
 * portfolio. Left (7 cols): a mono index micro-label, a large serif headline
 * whose key phrases are hit with a tilted primary marker swipe and a dashed
 * hand-underline, a supporting paragraph, and sticker-style rounded-full CTAs
 * with hard offset shadows that press flat on click. Right (5 cols): a tall 4:5
 * portrait pinned inside a hand-drawn dashed frame with an offset paper frame
 * behind it and a rotated "featured print" price label taped to a corner. A
 * giant ghost watermark word and a faint dot-grid wash sit behind everything.
 * Every CTA routes through route links. Use as the opening hero for
 * illustrators, painters, picture-book artists, editorial illustrators, or any
 * warm hand-made creative portfolio. Renders fully with no props via baked-in
 * "Mira Chen" defaults.
 */
export const IllustratorHero = defineCapsule({
  name: 'IllustratorHero',
  description:
    'Sketchbook split hero for an illustrator / visual-artist portfolio: left column with a mono index micro-label, a large serif headline whose key phrases carry a tilted primary marker swipe and a dashed hand-underline, a supporting paragraph, and sticker-style rounded-full CTAs with hard offset shadows that press flat; right column with a tall 4:5 portrait pinned inside a hand-drawn dashed frame over an offset paper frame, plus a rotated featured-print price label. A giant ghost watermark word and a faint dot-grid wash sit behind. CTAs route through route links. Use as the opening hero for illustrators, painters, picture-book artists, editorial illustrators, or warm hand-made creative portfolios.',
  props: z.object({
    /** Uppercase accent eyebrow label. */
    eyebrow: z.string().optional(),
    /** Heading text before the first colored phrase. */
    headingStart: z.string().optional(),
    /** First accent-highlighted phrase. */
    highlightOne: z.string().optional(),
    /** Connector text between the two highlighted phrases. */
    headingMid: z.string().optional(),
    /** Second accent-highlighted phrase. */
    highlightTwo: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    featuredPrintName: z.string().optional(),
    featuredPrintPrice: z.string().optional(),
    featuredPrintMeta: z.string().optional(),
    addLabel: z.string().optional(),
    /** Alt text driving the tall portrait photo. */
    imageAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Illustrator & Visual Artist'
    const headingStart = props.headingStart ?? 'Creating worlds through'
    const highlightOne = props.highlightOne ?? 'color'
    const headingMid = props.headingMid ?? 'and'
    const highlightTwo = props.highlightTwo ?? 'story'
    const subheading =
      props.subheading ??
      "I'm Mira Chen, an independent illustrator based in Portland, Oregon. I craft whimsical illustrations for children's books, editorial features, and digital prints that spark imagination."
    const primaryCta = props.primaryCta ?? 'View Portfolio'
    const secondaryCta = props.secondaryCta ?? 'Browse Prints'
    const featuredPrintName = props.featuredPrintName ?? 'Golden Hour Mountains'
    const featuredPrintPrice = props.featuredPrintPrice ?? '$48'
    const featuredPrintMeta = props.featuredPrintMeta ?? 'Featured giclee print'
    const addLabel = props.addLabel ?? 'Add to cart'
    const imageAlt =
      props.imageAlt ??
      'Artist studio workspace with watercolor paintings, brushes, and colorful illustration drafts spread across a wooden desk near a sunny window'

    useSyncCommerceCatalog(lakebed, [
      commerceProduct({
        imageAlt,
        label: featuredPrintName,
        price: featuredPrintPrice,
        subtitle: featuredPrintMeta,
      }),
    ])

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
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

    return (
      <HeroSection
        className={cn(
          'relative isolate overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8 lg:pb-28 lg:pt-28',
          props.className,
        )}
      >
        <DotGrid
          density="loose"
          tone="faint"
          fade="bottom"
          className="inset-x-0 top-0 h-72"
        />
        <Watermark className="-right-6 top-10 text-[9rem] leading-none sm:text-[14rem]">
          studio
        </Watermark>
        <Container size="xl" className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="order-2 lg:order-1 lg:col-span-7">
              <MonoTag className="mb-5 inline-flex items-center gap-2 text-primary">
                <span aria-hidden="true">01 /</span>
                {eyebrow}
              </MonoTag>
              <HeroHeading className="mb-6 font-serif font-normal xl:text-7xl">
                {headingStart}{' '}
                <span className="relative inline-block -rotate-1 bg-primary px-1.5 text-primary-foreground">
                  {highlightOne}
                </span>{' '}
                {headingMid}{' '}
                <span className="underline decoration-foreground/50 decoration-dashed decoration-2 underline-offset-[6px]">
                  {highlightTwo}
                </span>
              </HeroHeading>
              <HeroSubheading className="mb-8 mt-0 max-w-xl border-l-2 border-dashed border-border pl-5 sm:text-xl">
                {subheading}
              </HeroSubheading>
              <HeroActions className="mt-0 flex-wrap gap-4">
                <HeroCta
                  asChild
                  className="gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-medium text-background shadow-[4px_4px_0_0_var(--color-primary)] transition-[transform,box-shadow] duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-primary)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                >
                  <NavbarRouteLink href={primaryCta}>
                    {primaryCta}
                    <ArrowRight className="size-4" />
                  </NavbarRouteLink>
                </HeroCta>
                <HeroCta
                  asChild
                  variant="outline"
                  className="rounded-full border-2 border-dashed border-foreground px-8 py-4 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
                >
                  <NavbarRouteLink href={secondaryCta}>
                    {secondaryCta}
                  </NavbarRouteLink>
                </HeroCta>
                <CommerceAddItemButton
                  lakebed={lakebed}
                  item={{
                    label: featuredPrintName,
                    price: featuredPrintPrice,
                  }}
                  aria-label={`${addLabel} ${featuredPrintName}`}
                  pendingChildren={<CommerceMutationSpinner />}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground shadow-[4px_4px_0_0_var(--color-foreground)] transition-[transform,box-shadow] duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-foreground)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:pointer-events-none disabled:opacity-70"
                >
                  {addLabel}
                </CommerceAddItemButton>
              </HeroActions>
            </div>
            <div className="relative order-1 lg:order-2 lg:col-span-5">
              <div
                aria-hidden="true"
                className="absolute inset-0 translate-x-3 translate-y-3 rounded-none border-2 border-dashed border-border"
              />
              <div className="relative aspect-[4/5] overflow-hidden rounded-none border-2 border-foreground bg-muted">
                <Image
                  alt={imageAlt}
                  w={800}
                  h={1000}
                  className="size-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
              <div className="absolute -bottom-5 left-2 -rotate-3 rounded-none border-2 border-dashed border-foreground bg-background px-4 py-3 shadow-[4px_4px_0_0_var(--color-foreground)] sm:-left-4">
                <p className="font-serif text-lg leading-none text-foreground">
                  {featuredPrintName}
                </p>
                <p className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                    {featuredPrintPrice}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {featuredPrintMeta}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
