import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import {
  GalleryGrid,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'

/**
 * RestaurantGallery — captioned editorial image gallery for a restaurant page.
 * A left-aligned mono eyebrow and warm serif header sit over a giant faint
 * "TABLE" ghost watermark, above a staggered, non-uniform grid of square-edged
 * hairline-framed plates (a wider lead plate, alternating vertical offsets) of
 * dishes and ambiance. Each tile is a 4:3 photo with a hover zoom and an
 * indexed mono museum-label caption. All imagery is alt-driven. Use to showcase
 * signature plates, the dining room, and the bar for restaurants, bistros, or
 * fine-dining venues. Renders fully with no props via baked-in defaults (six
 * dishes + captions).
 */
export const RestaurantGallery = defineCapsule({
  name: 'RestaurantGallery',
  description:
    'Captioned editorial gallery for a restaurant page: a left-aligned mono eyebrow and warm serif header over a giant faint "TABLE" ghost watermark, above a staggered non-uniform grid of square-edged hairline-framed plates (a wider lead plate, alternating vertical offsets) of dishes and ambiance. Each tile is a 4:3 photo with a hover zoom and an indexed mono museum-label caption. All imagery is alt-driven via the Image component. Use to showcase signature plates, the dining room, and the bar for restaurants, bistros, or fine-dining venues.',
  props: z.object({
    /** Section heading (serif, large). */
    heading: z.string().optional(),
    /** Supporting line under the heading (maps to GalleryGrid subheading). */
    description: z.string().optional(),
    /** Gallery tiles — each has alt text driving the photo and an optional caption. */
    images: z
      .array(z.object({ alt: z.string(), caption: z.string().optional() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const images = props.images?.length
      ? props.images
      : [
          {
            alt: 'Wood-fired whole branzino on a ceramic platter with charred lemon, capers, and fresh herbs',
            caption: 'Wood-fired branzino',
          },
          {
            alt: 'Warm restaurant dining room at dusk with linen-set tables, soft pendant lighting, and bentwood chairs',
            caption: 'The dining room',
          },
          {
            alt: 'Hand-rolled fresh pasta dusted with flour resting on a wooden board in a restaurant kitchen',
            caption: 'Hand-rolled pasta',
          },
          {
            alt: 'Bartender pouring a craft cocktail into a coupe glass over a dark marble bar with amber bottles behind',
            caption: 'At the bar',
          },
          {
            alt: 'Seared scallops plated with golden corn puree and microgreens, drizzled with brown butter',
            caption: 'Seared scallops',
          },
          {
            alt: 'Decadent chocolate dessert with raspberry coulis and gold leaf on a slate plate under warm light',
            caption: 'Dessert, finally',
          },
        ]
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-16 lg:py-24',
          props.className,
        )}
      >
        <Watermark className="-left-4 top-6 text-[7rem] leading-none sm:text-[12rem] lg:text-[16rem]">
          TABLE
        </Watermark>
        <Container className="relative">
          <GalleryGrid className="gap-8">
            <SectionHeading
              align="left"
              eyebrow="Gallery"
              title={props.heading ?? 'A taste of the evening'}
              subtitle={
                props.description ??
                'Seasonal plates, a sunlit dining room, and the little details that make a night out feel like an occasion.'
              }
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground"
              titleClassName="font-serif text-4xl font-medium tracking-tight sm:text-5xl"
              subtitleClassName="text-muted-foreground"
              className="max-w-2xl gap-4"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((img, i) => {
                const __iv__ = img as {
                  alt: string
                  caption?: string
                  title?: string
                  location?: string
                }
                return (
                  <GalleryTile
                    key={__iv__.alt}
                    className={cn(
                      'rounded-none border-foreground/15',
                      i === 0 && 'sm:col-span-2 lg:row-span-2 lg:aspect-[4/5]',
                      i % 3 === 2 && 'lg:translate-y-8',
                    )}
                  >
                    <GalleryTileImage alt={__iv__.alt} />
                    {__iv__.caption && (
                      <GalleryTileCaption className="rounded-none bg-background/85 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">
                        <span className="mr-2 tabular-nums text-muted-foreground">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {__iv__.caption}
                      </GalleryTileCaption>
                    )}
                  </GalleryTile>
                )
              })}
            </div>
          </GalleryGrid>
        </Container>
      </section>
    )
  },
})
