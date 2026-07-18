import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'

/**
 * BeautyStoreGallery — a behind-the-scenes mosaic image gallery for a beauty /
 * skincare storefront. Centered eyebrow, heading, and short paragraph above a
 * responsive grid: a large feature image with an overlay gradient and caption
 * (top-left tile, spans 2 columns and 2 rows on desktop), surrounded by smaller
 * square images. Every image uses alt-driven lazy <Image>. Use for editorial product
 * moments, brand storytelling, spa/lifestyle photography, or any cosmetics / wellness
 * visual showcase block.
 */
export const BeautyStoreGallery = defineCapsule({
  name: 'BeautyStoreGallery',
  description:
    'Behind-the-scenes mosaic image gallery for a beauty / skincare storefront: centered eyebrow, heading, and short paragraph above a responsive grid. A large feature image with an overlay gradient and caption (top-left tile, spanning 2 columns and 2 rows on desktop) surrounded by smaller square images. All images use alt-driven lazy <Image>. Use for editorial product moments, brand storytelling, spa/lifestyle photography, or any cosmetics / wellness visual showcase block.',
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
      <section className={cn('py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-primary">
              {eyebrow}
            </span>
            <h2 className="mb-4 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <GalleryGrid>
            <GalleryGridItems columns={4}>
              {imageAlts
                .map((alt) => ({ alt }))
                .map((img) => {
                  const __iv__ = img as {
                    alt: string
                    caption?: string
                    title?: string
                    location?: string
                  }
                  return (
                    <GalleryTile key={__iv__.alt}>
                      <GalleryTileImage alt={__iv__.alt} />
                      {__iv__.caption && (
                        <GalleryTileCaption>
                          {__iv__.caption}
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
