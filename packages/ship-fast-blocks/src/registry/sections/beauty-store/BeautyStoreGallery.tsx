import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'

/**
 * BeautyStoreGallery — editorial-vogue photo folio for a beauty / skincare
 * storefront. An asymmetric masthead: mono index rail ("N° 04" — hairline rule
 * — eyebrow) and a serif heading on the left with the supporting paragraph on
 * the right behind a hairline rule. Below, a mosaic of sharp hairline-framed
 * plates: the first image is a large feature plate spanning 2 columns and 2
 * rows on desktop (optionally overlaid with the featureCaption), the rest are
 * smaller plates — every plate carries a tiny mono plate numeral ("01"–"05")
 * pinned to its corner and renders in muted grayscale that regains full color
 * on hover. Every image uses alt-driven lazy <Image>. Use for editorial
 * product moments, brand storytelling, spa/lifestyle photography, or any
 * cosmetics / wellness visual showcase block.
 */
export const BeautyStoreGallery = defineCapsule({
  name: 'BeautyStoreGallery',
  description:
    'Editorial-vogue photo folio for a beauty / skincare storefront: an asymmetric masthead with a mono index rail and serif heading on the left and the supporting paragraph behind a hairline rule on the right, above a mosaic of sharp hairline-framed plates. The first image is a large feature plate spanning 2 columns and 2 rows on desktop (optionally overlaid with the featureCaption); every plate carries a tiny mono plate numeral pinned to its corner and renders in muted grayscale that regains full color on hover. All images use alt-driven lazy <Image>. Use for editorial product moments, brand storytelling, spa/lifestyle photography, or any cosmetics / wellness visual showcase block.',
  props: z.object({
    /** Eyebrow text above heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Caption overlaid on the large feature image. */
    featureCaption: z.string().optional(),
    /** Alt text for each gallery tile (first tile is the large feature). */
    imageAlts: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Behind the Scenes'
    const heading = props.heading ?? 'Beauty in Every Detail'
    const description =
      props.description ??
      'From our curated collections to your daily routine, discover moments of beauty that inspire.'
    const featureCaption = props.featureCaption
    const imageAlts = props.imageAlts?.length
      ? props.imageAlts
      : [
          'woman receiving facial treatment at luxury spa with soft ambient lighting',
          'flat lay of organic skincare products with dried flowers',
          'collection of colorful lipsticks arranged artistically',
          'elegant perfume bottle with soft rose petals',
          'minimalist skincare routine products on marble countertop',
        ]

    return (
      <section className={cn('py-16 sm:py-20 lg:py-24', props.className)}>
        <Container>
          {/* Asymmetric masthead: rail + serif heading left, paragraph right. */}
          <div className="mb-10 grid gap-6 sm:mb-14 lg:grid-cols-12 lg:items-end lg:gap-10">
            <div className="lg:col-span-7">
              <div className="mb-5 flex items-center gap-4">
                <MonoTag className="shrink-0 text-foreground">N° 04</MonoTag>
                <span
                  aria-hidden="true"
                  className="h-px w-10 bg-border sm:max-w-24 sm:flex-1"
                />
                <MonoTag tone="primary" className="min-w-0">
                  {eyebrow}
                </MonoTag>
              </div>
              <SectionHeading
                align="left"
                title={heading}
                className="gap-0"
                titleClassName="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              />
            </div>
            <p className="max-w-md border-l border-border pl-5 text-muted-foreground lg:col-span-5 lg:justify-self-end">
              {description}
            </p>
          </div>
          <GalleryGrid>
            <GalleryGridItems columns={4} className="gap-4 lg:gap-5">
              {imageAlts
                .map((alt) => ({ alt }))
                .map((img, i) => {
                  const __iv__ = img as {
                    alt: string
                    caption?: string
                    title?: string
                    location?: string
                  }
                  const caption =
                    __iv__.caption ?? (i === 0 ? featureCaption : undefined)
                  return (
                    <GalleryTile
                      key={__iv__.alt}
                      className={cn(
                        'rounded-none border-border',
                        i === 0 && 'sm:col-span-2 sm:row-span-2 sm:aspect-auto',
                      )}
                    >
                      <GalleryTileImage
                        alt={__iv__.alt}
                        className="size-full object-cover grayscale-[35%] transition-[filter,transform] duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
                      />
                      {/* Mono plate numeral pinned to the corner. */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-3 border border-foreground/20 bg-background/85 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-foreground backdrop-blur-sm"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {caption && (
                        <GalleryTileCaption className="font-serif text-lg italic">
                          {caption}
                        </GalleryTileCaption>
                      )}
                    </GalleryTile>
                  )
                })}
            </GalleryGridItems>
          </GalleryGrid>
        </Container>
      </section>
    )
  },
})
