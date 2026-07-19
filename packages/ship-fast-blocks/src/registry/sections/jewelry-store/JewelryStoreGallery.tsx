import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { MasonryTile } from '#/section-kit/MasonryTile.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  GalleryMasonry,
  GalleryMasonryColumn,
} from '#/section-kit/GalleryGrid.tsx'

/**
 * JewelryStoreGallery — lifestyle masonry gallery for a luxury jewelry brand
 * on a subtle muted band. A centered gold eyebrow + serif heading introduce a
 * three-column masonry-style collage of editorial lifestyle images with mixed
 * aspect ratios (3:4, square, 4:5) and the middle column nudged down, each
 * image zooming gently on hover. Use to evoke the brand experience — clients,
 * boutiques, gifting moments — for fine jewelers, diamond houses, or any
 * premium luxury-retail brand. Renders fully with no props via baked-in defaults.
 */
export const JewelryStoreGallery = defineCapsule({
  name: 'JewelryStoreGallery',
  description:
    'Lifestyle masonry gallery for a luxury jewelry brand on a subtle muted band: a centered gold eyebrow + serif heading introduce a three-column masonry-style collage of editorial lifestyle images with mixed aspect ratios (3:4, square, 4:5) and the middle column nudged down, each image zooming gently on hover. Use to evoke the brand experience — clients, boutiques, gifting moments — for fine jewelers, diamond houses, or any premium luxury-retail brand.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    imageAlts: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'The Maison Experience'
    const heading = props.heading ?? 'Moments of Brilliance'
    const alts = props.imageAlts?.length
      ? props.imageAlts
      : [
          'couple examining engagement ring in elegant jewelry boutique',
          'woman wearing pearl necklace at formal evening event',
          'close-up of hands with gold bracelet and diamond ring on velvet',
          'luxury jewelry gift box with ribbon on marble counter',
          'jewelry store interior with glass display cases and chandeliers',
          'bride wearing diamond necklace and earrings on wedding day',
          'stack of gold bangles on wrist with watch',
        ]

    const imgCls =
      'h-full w-full object-cover transition-transform duration-700 hover:scale-105'

    return (
      <section
        className={cn(
          'bg-muted pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            className="mb-20 max-w-2xl gap-0"
            eyebrowClassName="mb-4 text-sm uppercase tracking-[0.3em] text-primary"
            titleClassName="font-serif text-4xl text-foreground lg:text-5xl"
          />
          <GalleryMasonry columns="1-3">
            <GalleryMasonryColumn>
              <MasonryTile treatment="3-4-card">
                <Image
                  alt={alts[0]}
                  w={600}
                  h={800}
                  loading="lazy"
                  className={imgCls}
                />
              </MasonryTile>
              <MasonryTile treatment="square-card">
                <Image
                  alt={alts[1]}
                  w={600}
                  h={600}
                  loading="lazy"
                  className={imgCls}
                />
              </MasonryTile>
            </GalleryMasonryColumn>
            <GalleryMasonryColumn className="md:mt-12">
              <MasonryTile treatment="square-card">
                <Image
                  alt={alts[2]}
                  w={600}
                  h={600}
                  loading="lazy"
                  className={imgCls}
                />
              </MasonryTile>
              <MasonryTile treatment="4-5-card">
                <Image
                  alt={alts[3]}
                  w={600}
                  h={750}
                  loading="lazy"
                  className={imgCls}
                />
              </MasonryTile>
              <MasonryTile treatment="square-card">
                <Image
                  alt={alts[4]}
                  w={600}
                  h={600}
                  loading="lazy"
                  className={imgCls}
                />
              </MasonryTile>
            </GalleryMasonryColumn>
            <GalleryMasonryColumn>
              <MasonryTile treatment="3-4-card">
                <Image
                  alt={alts[5]}
                  w={600}
                  h={800}
                  loading="lazy"
                  className={imgCls}
                />
              </MasonryTile>
              <MasonryTile treatment="square-card">
                <Image
                  alt={alts[6]}
                  w={600}
                  h={600}
                  loading="lazy"
                  className={imgCls}
                />
              </MasonryTile>
            </GalleryMasonryColumn>
          </GalleryMasonry>
        </div>
      </section>
    )
  },
})
