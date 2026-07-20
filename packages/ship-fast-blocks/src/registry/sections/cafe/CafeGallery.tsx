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
import { MonoTag } from '#/section-kit/Decor.tsx'

/**
 * CafeGallery — newsprint photo-spread gallery for a cozy cafe / coffee shop
 * page. A mono "The Spread / Fig. 01–06" dateline rail with a hairline rule
 * leads a responsive 3-column masonry grid of sharp-cornered photo plates:
 * column 1 holds a 3:4 shot above a square, column 2 a square above a 3:4,
 * and column 3 (hidden below md) a 3:4 above a square, each framed by a
 * hairline border with inner padding and a mono "Fig." caption row beneath;
 * the middle column is nudged downward for a staggered contact-sheet rhythm.
 * Every image zooms gently on hover. All imagery uses the alt-driven <Image>
 * component. Use to showcase interiors, latte art, pastries, and ambiance for
 * cafes, bakeries, or tea houses. Renders fully with no props via six
 * baked-in default alt strings.
 */
export const CafeGallery = defineCapsule({
  name: 'CafeGallery',
  description:
    "Newsprint photo-spread gallery for a cozy cafe page: a mono dateline rail with hairline rule leads a responsive 3-column masonry grid of sharp-cornered photo plates alternating 3:4 and square aspect ratios, each framed by a hairline border with inner padding and a mono 'Fig.' caption row, with the middle column nudged downward for a staggered contact-sheet rhythm and gentle zoom on hover. All imagery uses the alt-driven Image component. Use to showcase interiors, latte art, pastries, and ambiance for cafes, bakeries, or tea houses.",
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

    const GalleryPlate = ({
      alt,
      index,
      treatment,
    }: {
      alt: string
      index: number
      treatment: '3-4-xl' | 'square-xl'
    }) => (
      <div className="border border-foreground/20 bg-card p-2">
        <MasonryTile treatment={treatment} className="rounded-none">
          <Image
            alt={alt}
            w={600}
            h={treatment === '3-4-xl' ? 800 : 600}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </MasonryTile>
        <div className="flex items-center gap-2 px-0.5 pt-2">
          <MonoTag tone="faint" className="text-[10px]">
            Fig. {String(index + 1).padStart(2, '0')}
          </MonoTag>
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
        </div>
      </div>
    )

    return (
      <section
        className={cn(
          'bg-background pt-16 pb-16 lg:pt-20 lg:pb-20',
          props.className,
        )}
      >
        <Container size="xl" className="px-6">
          <div className="mb-8 flex items-center gap-4">
            <MonoTag>The Spread</MonoTag>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <MonoTag tone="faint" className="hidden sm:inline">
              Fig. 01–06
            </MonoTag>
          </div>
          <GalleryMasonry columns="2-3">
            <GalleryMasonryColumn>
              <GalleryPlate alt={images[0]} index={0} treatment="3-4-xl" />
              <GalleryPlate alt={images[1]} index={1} treatment="square-xl" />
            </GalleryMasonryColumn>
            <GalleryMasonryColumn className="mt-8 md:mt-12">
              <GalleryPlate alt={images[2]} index={2} treatment="square-xl" />
              <GalleryPlate alt={images[3]} index={3} treatment="3-4-xl" />
            </GalleryMasonryColumn>
            <GalleryMasonryColumn className="hidden md:block">
              <GalleryPlate alt={images[4]} index={4} treatment="3-4-xl" />
              <GalleryPlate alt={images[5]} index={5} treatment="square-xl" />
            </GalleryMasonryColumn>
          </GalleryMasonry>
        </Container>
      </section>
    )
  },
})
