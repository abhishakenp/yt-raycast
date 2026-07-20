import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'

/**
 * EventGallery — kinetic-poster inverted highlights gallery for a conference or
 * event page. A full-bleed inverted (foreground background, light text) band that
 * cuts in on a slanted clip-path seam, with an asymmetric header (mono index
 * eyebrow + oversized heading + lede) over a giant ghost watermark, above a
 * staggered 3-up grid of square-edged 4:3 alt-driven photos that gently zoom on
 * hover. Use to show last year's highlights, venue atmosphere, or past event
 * photos on tech conference, summit, festival, or meetup pages.
 */
export const EventGallery = defineCapsule({
  name: 'EventGallery',
  description:
    "Kinetic-poster inverted highlights gallery for a conference or event page: a full-bleed inverted (foreground background, light text) band cut on a slanted clip-path seam, with an asymmetric header (mono index eyebrow + oversized heading + lede) over a giant ghost watermark, above a staggered 3-up grid of square-edged 4:3 alt-driven photos that gently zoom on hover. Use to show last year's highlights, venue atmosphere, networking moments, or past event photos on tech conference, summit, festival, or meetup pages.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description beneath the heading. */
    description: z.string().optional(),
    /** Photo alt-text descriptions (drive the images). */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? "Last Year's Highlights"
    const description =
      props.description ?? 'A glimpse of what awaits you at DesignFront 2024.'
    const items = props.items?.length
      ? props.items
      : [
          'Conference attendees watching a presentation in a large theater with stage lighting',
          'Speaker on stage presenting to a large audience at a tech conference',
          'Conference attendees networking during a coffee break in a modern venue',
          'Workshop session with participants collaborating around laptops at tables',
          'Evening social event with attendees mingling under string lights',
          'Palace of Fine Arts dome architecture in San Francisco venue exterior',
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground py-20 pt-28 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] lg:py-28 lg:pt-36',
          props.className,
        )}
      >
        <Watermark className="-right-4 top-10 text-[9rem] leading-none text-background/[0.06] sm:text-[15rem] lg:text-[20rem]">
          2024
        </Watermark>
        <Container size="lg" className="relative">
          <SectionHeading
            align="left"
            eyebrow="08 / Recap"
            title={heading}
            subtitle={description}
            className="mb-12 max-w-2xl gap-4"
            eyebrowClassName="text-background/50"
            titleClassName="text-4xl font-extrabold tracking-tight text-background sm:text-5xl"
            subtitleClassName="text-lg text-background/70"
          />
          <GalleryGrid>
            <GalleryGridItems columns={3}>
              {items
                .map((alt) => ({ alt }))
                .map((img, i) => {
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
                        'overflow-hidden rounded-none border border-background/20',
                        i % 2 === 1 ? 'lg:translate-y-6' : '',
                      )}
                    >
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
