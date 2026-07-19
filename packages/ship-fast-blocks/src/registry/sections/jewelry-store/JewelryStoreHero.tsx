import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { HeroSection, HeroContent } from '#/section-kit/HeroSection.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * JewelryStoreHero — full-bleed cinematic hero for a luxury fine-jewelry
 * boutique. A dimmed full-cover background image with a left-to-right
 * fade-to-background gradient overlay, fronting a left-aligned column with a
 * wide letter-spaced gold heritage eyebrow, an oversized two-line serif
 * display headline, a relaxed subheading, and dual CTAs (a solid gold primary
 * button + a bordered ghost button). A floating bottom-right featured-piece
 * card shows a label, serif piece name, and price. Use as the opening hero
 * for fine jewelers, diamond houses, engagement-ring boutiques, watch or
 * high-jewelry maisons. Renders fully with no props via baked-in defaults.
 */
export const JewelryStoreHero = defineCapsule({
  name: 'JewelryStoreHero',
  description:
    'Full-bleed cinematic hero for a luxury fine-jewelry boutique: a dimmed full-cover background image with a left-to-right fade-to-background gradient overlay, fronting a left-aligned column with a wide letter-spaced gold heritage eyebrow, an oversized two-line serif display headline, a relaxed subheading, and dual CTAs (solid gold primary + bordered ghost). A floating bottom-right featured-piece card shows a label, serif piece name, and price. Use as the opening hero for fine jewelers, diamond houses, engagement-ring boutiques, watch or high-jewelry maisons, or any premium luxury-retail brand.',
  lakebed: commerceCartLakebed,
  props: z.object({
    eyebrow: z.string().optional(),
    headingTop: z.string().optional(),
    headingBottom: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    featuredLabel: z.string().optional(),
    featuredName: z.string().optional(),
    featuredPrice: z.string().optional(),
    imageAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Est. 1892 • Paris'
    const headingTop = props.headingTop ?? 'The Art of'
    const headingBottom = props.headingBottom ?? 'Timeless Elegance'
    const subheading =
      props.subheading ??
      'Discover our heirloom collection of ethically sourced diamonds and masterfully crafted pieces, each telling a story of enduring beauty.'
    const primaryCta = props.primaryCta ?? 'Explore Collections'
    const secondaryCta = props.secondaryCta ?? 'Private Viewing'
    const featuredLabel = props.featuredLabel ?? 'Featured Piece'
    const featuredName = props.featuredName ?? 'Éternelle Diamond Pendant'
    const featuredPrice = props.featuredPrice ?? '$12,500'
    const imageAlt =
      props.imageAlt ??
      'elegant diamond necklace displayed on black velvet jewelry stand in luxury boutique lighting'
    useSyncCommerceCatalog(lakebed, [
      commerceProduct({
        imageAlt,
        label: featuredName,
        price: featuredPrice,
        subtitle: featuredLabel,
      }),
    ])

    return (
      <HeroSection
        variant="gradient"
        className={cn('items-center bg-background', props.className)}
      >
        <div className="absolute inset-0 bg-muted">
          <Image
            alt={imageAlt}
            w={1920}
            h={1200}
            className="h-full w-full object-cover opacity-40"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"
          />
        </div>
        <HeroContent className="w-full px-6 py-32 lg:px-12 lg:py-0 xl:px-20">
          <div className="max-w-3xl">
            <p className="mb-6 text-sm uppercase tracking-[0.3em] text-primary">
              {eyebrow}
            </p>
            <h1 className="mb-8 font-serif text-5xl leading-[1.1] text-foreground sm:text-6xl lg:text-7xl xl:text-8xl">
              {headingTop}
              <br />
              {headingBottom}
            </h1>
            <p className="mb-12 max-w-xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
              {subheading}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <NavbarRouteLink
                className="inline-flex items-center justify-center bg-primary px-8 py-4 text-sm font-medium uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
                href={primaryCta}
              >
                {primaryCta}
              </NavbarRouteLink>
              <NavbarRouteLink
                className="inline-flex items-center justify-center border border-border px-8 py-4 text-sm font-medium uppercase tracking-widest text-foreground transition-colors hover:border-primary hover:text-primary"
                href={secondaryCta}
              >
                {secondaryCta}
              </NavbarRouteLink>
            </div>
          </div>
        </HeroContent>
        <div className="absolute bottom-12 right-6 hidden lg:right-20 lg:block">
          <div className="text-right">
            <p className="mb-2 text-sm uppercase tracking-widest text-primary">
              {featuredLabel}
            </p>
            <p className="font-serif text-2xl text-foreground">
              {featuredName}
            </p>
            <p className="mt-1 text-muted-foreground">{featuredPrice}</p>
            <CommerceAddItemButton
              lakebed={lakebed}
              item={{ label: featuredName, price: featuredPrice }}
              aria-label={`Add ${featuredName} to cart`}
              pendingChildren={
                <CommerceMutationSpinner className="text-primary-foreground" />
              }
              className="mt-5 inline-flex items-center justify-center bg-primary px-5 py-3 text-xs font-medium uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
            >
              Add featured
            </CommerceAddItemButton>
          </div>
        </div>
      </HeroSection>
    )
  },
})
