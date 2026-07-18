import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { MasonryTile } from '#/section-kit/MasonryTile.tsx'
import {
  GalleryMasonry,
  GalleryMasonryColumn,
} from '#/section-kit/GalleryGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * CafeGallery — masonry photo gallery for a cozy cafe / coffee shop page,
 * sitting on a card-colored band. A responsive 3-column masonry grid: column
 * 1 holds a 3:4 shot above a square, column 2 holds a square above a 3:4,
 * and column 3 (hidden below md) holds a 3:4 above a square. Every image
 * zooms on hover. All imagery uses the alt-driven <Image> component. Use to
 * showcase interiors, latte art, pastries, and ambiance for cafes, bakeries,
 * or tea houses. Renders fully with no props via six baked-in default alt
 * strings.
 */
export const CafeGallery = defineCapsule({
  name: 'CafeGallery',
  description:
    'Masonry photo gallery for a cozy cafe page on a card-colored band: responsive 3-column masonry grid with alternating 3:4 and square aspect ratios, each image zooming on hover. All imagery uses the alt-driven Image component. Use to showcase interiors, latte art, pastries, and ambiance for cafes, bakeries, or tea houses.',
  props: z.object({
    /** Alt text strings driving the gallery photos (expects 6 items). */
    images: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const images = props.images?.length
      ? props.images
      : [
          'Close-up of latte art being poured by a barista, showing a detailed rosetta pattern in creamy foam',
          'Freshly baked golden croissants displayed on a marble counter in natural light',
          'Barista using a professional espresso machine with steam wand, pouring milk into a ceramic cup',
          'Cozy cafe seating area with wooden chairs, exposed brick wall, and customers working on laptops',
          'Overhead view of coffee beans in various stages of roasting, displayed in wooden bowls',
          'Glass carafe of pour over coffee dripping through a V60 filter into a ceramic cup',
        ]

    return (
      <section className={cn('bg-card pt-28 pb-20', props.className)}>
        <Container size="xl" className="px-6">
          <GalleryMasonry columns="2-3">
            <GalleryMasonryColumn>
              <MasonryTile treatment="3-4-xl">
                <Image
                  alt={images[0]}
                  w={600}
                  h={800}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </MasonryTile>
              <MasonryTile treatment="square-xl">
                <Image
                  alt={images[1]}
                  w={600}
                  h={600}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </MasonryTile>
            </GalleryMasonryColumn>
            <GalleryMasonryColumn>
              <MasonryTile treatment="square-xl">
                <Image
                  alt={images[2]}
                  w={600}
                  h={600}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </MasonryTile>
              <MasonryTile treatment="3-4-xl">
                <Image
                  alt={images[3]}
                  w={600}
                  h={800}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </MasonryTile>
            </GalleryMasonryColumn>
            <GalleryMasonryColumn className="hidden md:block">
              <MasonryTile treatment="3-4-xl">
                <Image
                  alt={images[4]}
                  w={600}
                  h={800}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </MasonryTile>
              <MasonryTile treatment="square-xl">
                <Image
                  alt={images[5]}
                  w={600}
                  h={600}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </MasonryTile>
            </GalleryMasonryColumn>
          </GalleryMasonry>
        </Container>
      </section>
    )
  },
})
