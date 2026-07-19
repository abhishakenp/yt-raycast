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
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * FoodTruckGallery — a masonry-style food GALLERY section. A centered eyebrow +
 * heading sits above a 3-column grid where each column stacks two rounded photos of
 * staggered heights (the middle column inverts the tall/short rhythm) to create a
 * masonry feel. All imagery uses the alt-driven Image component. Use as the visual
 * showcase for food trucks, street-food vendors, restaurants or cafes wanting to show
 * dishes, prep and atmosphere.
 */
export const FoodTruckGallery = defineCapsule({
  name: 'FoodTruckGallery',
  description:
    'Masonry-style food GALLERY section: a centered eyebrow + heading above a 3-column grid where each column stacks two rounded photos of staggered heights (the middle column inverts the tall/short rhythm) for a masonry feel. All imagery uses the alt-driven Image component. Use as the visual showcase for food trucks, street-food vendors, restaurants, cafes or catering brands wanting to show dishes, prep and atmosphere.',
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

    return (
      <section className={cn('px-6 pt-28 pb-20', props.className)}>
        <Container size="lg">
          <div className="mb-16 space-y-4 text-center">
            <span className="text-sm uppercase tracking-widest text-muted-foreground">
              {galleryEyebrow}
            </span>
            <SectionHeading
              title={galleryHeading}
              className="gap-0"
              titleClassName="text-3xl font-bold md:text-4xl"
            />
          </div>
          <GalleryMasonry columns="1-3">
            {[0, 1, 2].map((col) => (
              <GalleryMasonryColumn key={col}>
                <MasonryTile treatment={col === 1 ? 'h-48-xl' : 'h-64-xl'}>
                  <Image
                    alt={galleryAlts[col * 2] ?? galleryHeading}
                    w={400}
                    h={500}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </MasonryTile>
                <MasonryTile treatment={col === 1 ? 'h-64-xl' : 'h-48-xl'}>
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
