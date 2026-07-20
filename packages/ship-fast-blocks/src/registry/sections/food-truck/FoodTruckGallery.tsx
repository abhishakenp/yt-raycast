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
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * FoodTruckGallery — a sticker-poster masonry food GALLERY section. Under a giant ghost
 * "EATS" watermark, a rotated rubber-stamp caption + mono index eyebrow and an extrabold
 * slab heading sit above a 3-column grid where each column stacks two hard-bordered
 * rounded-none photo plates of staggered heights, alternately tilted for a hand-pinned
 * poster feel (the middle column inverts the tall/short rhythm). All imagery uses the
 * alt-driven Image component. Use as the visual showcase for food trucks, street-food
 * vendors, restaurants or cafes wanting to show dishes, prep and atmosphere.
 */
export const FoodTruckGallery = defineCapsule({
  name: 'FoodTruckGallery',
  description:
    'Sticker-poster masonry food GALLERY section: under a giant ghost "EATS" watermark, a rotated rubber-stamp caption + mono index eyebrow and an extrabold slab heading above a 3-column grid where each column stacks two hard-bordered rounded-none photo plates of staggered heights, alternately tilted for a hand-pinned poster feel (the middle column inverts the tall/short rhythm). All imagery uses the alt-driven Image component. Use as the visual showcase for food trucks, street-food vendors, restaurants, cafes or catering brands wanting to show dishes, prep and atmosphere.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    imageAlts: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const galleryEyebrow = props.eyebrow ?? 'The Experience'
    const galleryHeading = props.heading ?? 'Gallery'
    const galleryAlts = props.imageAlts?.length
      ? props.imageAlts
      : [
          'Close-up of chef plating gourmet street tacos with precision',
          'Vibrant fresh salad bowl with avocado and colorful vegetables',
          'Golden crispy fried chicken sandwich on brioche bun',
          'Food truck serving window with steam rising from fresh food',
          'Hand holding loaded fries with cheese and toppings',
          'Happy customers lining up at a food truck on a sunny day',
        ]

    const tilts = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2']

    return (
      <section
        className={cn(
          'relative overflow-hidden px-6 pt-24 pb-20',
          props.className,
        )}
      >
        <Watermark className="-right-4 top-6 text-[7rem] sm:text-[12rem] lg:text-[16rem]">
          EATS
        </Watermark>
        <Container size="lg" className="relative">
          <div className="mb-12 flex flex-wrap items-center gap-3">
            <span className="inline-flex -rotate-2 items-center rounded-full border-2 border-foreground bg-background px-3.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-foreground shadow-[3px_3px_0_0] shadow-primary/40">
              {galleryEyebrow}
            </span>
            <MonoTag>04 / Field notes</MonoTag>
          </div>
          <SectionHeading
            title={galleryHeading}
            className="mb-12 items-start gap-0 text-left"
            titleClassName="text-4xl font-extrabold tracking-tighter md:text-5xl"
          />
          <GalleryMasonry columns="1-3">
            {[0, 1, 2].map((col) => (
              <GalleryMasonryColumn key={col}>
                <MasonryTile
                  treatment={col === 1 ? 'h-48-xl' : 'h-64-xl'}
                  className={cn(
                    'rounded-none border-2 border-foreground',
                    tilts[col % tilts.length],
                  )}
                >
                  <Image
                    alt={galleryAlts[col * 2] ?? galleryHeading}
                    w={400}
                    h={500}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </MasonryTile>
                <MasonryTile
                  treatment={col === 1 ? 'h-64-xl' : 'h-48-xl'}
                  className={cn(
                    'rounded-none border-2 border-foreground',
                    tilts[(col + 2) % tilts.length],
                  )}
                >
                  <Image
                    alt={galleryAlts[col * 2 + 1] ?? galleryHeading}
                    w={400}
                    h={400}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </MasonryTile>
              </GalleryMasonryColumn>
            ))}
          </GalleryMasonry>
        </Container>
      </section>
    )
  },
})
