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
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * IllustratorHero — split-layout hero section for an illustrator / visual-artist
 * portfolio. Left side: an uppercase accent eyebrow label, a large serif
 * headline with two color-highlighted phrases, a supporting paragraph, and dual
 * rounded CTAs (filled primary with arrow + outlined secondary). Right side: a
 * tall 4:5 portrait photo with two soft blurred pastel accent orbs floating at
 * the corners. Every CTA routes through section-kit route links. Use as the opening hero
 * for illustrators, painters, picture-book artists, editorial illustrators, or
 * any warm, editorial creative portfolio. Renders fully with no props via
 * baked-in "Mira Chen" defaults.
 */
export const IllustratorHero = defineCapsule({
  name: 'IllustratorHero',
  description:
    'Split-layout hero section for an illustrator / visual-artist portfolio: left side with an uppercase accent eyebrow label, large serif headline with two color-highlighted phrases, supporting paragraph, and dual rounded CTAs (filled primary with arrow + outlined secondary); right side has a tall 4:5 portrait photo with two soft blurred pastel accent orbs at the corners. CTAs route through section-kit route links. Use as the opening hero for illustrators, painters, picture-book artists, editorial illustrators, or warm editorial creative portfolios.',
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
          'relative px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8 lg:pb-28 lg:pt-28',
          props.className,
        )}
      >
        <Container size="xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="order-2 lg:order-1">
              <p className="mb-4 text-sm font-medium uppercase tracking-wider text-chart-1">
                {eyebrow}
              </p>
              <HeroHeading className="mb-6 font-serif font-normal xl:text-7xl">
                {headingStart}{' '}
                <span className="text-chart-2">{highlightOne}</span>{' '}
                {headingMid}{' '}
                <span className="text-chart-3">{highlightTwo}</span>
              </HeroHeading>
              <HeroSubheading className="mb-8 mt-0 max-w-xl sm:text-xl">
                {subheading}
              </HeroSubheading>
              <HeroActions className="mt-0 flex-wrap gap-4">
                <HeroCta
                  asChild
                  className="gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-medium text-background hover:bg-muted-foreground"
                >
                  <NavbarRouteLink href={primaryCta}>
                    {primaryCta}
                    <ArrowRight className="size-4" />
                  </NavbarRouteLink>
                </HeroCta>
                <HeroCta
                  asChild
                  variant="outline"
                  className="rounded-full border-foreground px-8 py-4 text-sm font-medium hover:bg-foreground hover:text-background"
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
                  className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
                >
                  {addLabel}
                </CommerceAddItemButton>
              </HeroActions>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="aspect-[4/5] overflow-hidden rounded-xl bg-muted">
                <Image
                  alt={imageAlt}
                  w={800}
                  h={1000}
                  className="size-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
              <div
                aria-hidden="true"
                className="absolute -bottom-6 -left-6 size-32 rounded-full bg-chart-1/20 blur-2xl"
              />
              <div
                aria-hidden="true"
                className="absolute -right-6 -top-6 size-24 rounded-full bg-chart-2/20 blur-2xl"
              />
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
