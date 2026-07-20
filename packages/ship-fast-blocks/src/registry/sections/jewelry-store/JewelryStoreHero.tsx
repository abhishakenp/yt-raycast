import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { HeroSection, HeroContent } from '#/section-kit/HeroSection.tsx'
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
 * JewelryStoreHero — full-bleed vitrine hero for a luxury fine-jewelry maison.
 * A dimmed full-cover photograph under a left-to-right fade-to-background scrim
 * and a giant ghost serif watermark, fronting a generous left-aligned column: a
 * hairline rule beside a mono heritage micro-label, an oversized two-line serif
 * display headline, a light supporting paragraph, and dual square CTAs (a solid
 * dark primary + a hairline-outline ghost, both with press feedback). A floating
 * bottom-right featured-piece vitrine card — a hairline glass-case frame with a
 * single restrained hard offset shadow — carries a mono label, serif piece name,
 * tabular price, and a Lakebed add-to-cart button. Both CTAs route through
 * section-kit route links and the background uses the alt-driven Image component.
 * Use as the opening hero for fine jewelers, diamond houses, engagement-ring
 * boutiques, watch or high-jewelry maisons. Renders fully with no props.
 */
export const JewelryStoreHero = defineCapsule({
  name: 'JewelryStoreHero',
  description:
    'Full-bleed vitrine hero for a luxury fine-jewelry maison: a dimmed full-cover photograph under a left-to-right fade-to-background scrim and a giant ghost serif watermark, fronting a generous left-aligned column with a hairline rule beside a mono heritage micro-label, an oversized two-line serif display headline, a light supporting paragraph, and dual square CTAs (a solid dark primary + a hairline-outline ghost, both with press feedback). A floating bottom-right featured-piece vitrine card — a hairline glass-case frame with a single restrained hard offset shadow — carries a mono label, serif piece name, tabular price, and a Lakebed add-to-cart button. Both CTAs route through section-kit route links. Use as the opening hero for fine jewelers, diamond houses, engagement-ring boutiques, watch or high-jewelry maisons, or any premium luxury-retail brand.',
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
            className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent"
          />
        </div>
        <Watermark className="-left-2 bottom-[-0.12em] font-serif text-[26vw] font-normal tracking-tighter">
          Éclat
        </Watermark>
        <HeroContent className="w-full px-6 py-32 lg:px-12 lg:py-0 xl:px-20">
          <div className="max-w-3xl">
            <div className="mb-8 flex items-center gap-4">
              <span aria-hidden="true" className="h-px w-12 bg-primary" />
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                {eyebrow}
              </p>
            </div>
            <h1 className="font-serif text-5xl font-normal leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl xl:text-8xl">
              {headingTop}
              <br />
              {headingBottom}
            </h1>
            <p className="mt-8 max-w-xl text-lg font-light leading-relaxed text-muted-foreground lg:text-xl">
              {subheading}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none bg-foreground px-8 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-background transition-[background-color,transform] duration-150 hover:bg-foreground/90 active:translate-y-px"
                href={primaryCta}
              >
                {primaryCta}
              </NavbarRouteLink>
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none border border-border px-8 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-foreground transition-[border-color,color,transform] duration-150 hover:border-foreground active:translate-y-px"
                href={secondaryCta}
              >
                {secondaryCta}
              </NavbarRouteLink>
            </div>
          </div>
        </HeroContent>
        <div className="absolute bottom-12 right-6 hidden lg:right-20 lg:block">
          <div className="w-64 border border-border bg-background/95 p-6 text-right shadow-[10px_10px_0_0] shadow-foreground/10 backdrop-blur-sm">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              {featuredLabel}
            </p>
            <p className="mt-3 font-serif text-2xl text-foreground">
              {featuredName}
            </p>
            <p className="mt-1 text-sm text-foreground tabular-nums">
              {featuredPrice}
            </p>
            <CommerceAddItemButton
              lakebed={lakebed}
              item={{ label: featuredName, price: featuredPrice }}
              aria-label={`Add ${featuredName} to cart`}
              pendingChildren={
                <CommerceMutationSpinner className="text-primary-foreground" />
              }
              className="mt-5 inline-flex w-full items-center justify-center rounded-none bg-primary px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-primary-foreground transition-[background-color,transform] duration-150 hover:bg-primary/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
            >
              Add featured
            </CommerceAddItemButton>
          </div>
        </div>
      </HeroSection>
    )
  },
})
