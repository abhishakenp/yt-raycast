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

/**
 * EventGallery — a dark photo highlights gallery for a conference or event page. A
 * full-bleed inverted (foreground-background) band with a centered heading +
 * description above a responsive 3-up grid of 4:3 alt-driven photos that gently
 * zoom on hover. Use to show last year's highlights, venue atmosphere, or past
 * event photos on tech conference, summit, festival, or meetup pages.
 */
export const EventGallery = defineCapsule({
  name: 'EventGallery',
  description:
    "Dark photo highlights gallery for a conference or event page: a full-bleed inverted (foreground background, light text) band with a centered heading + description above a responsive 3-up grid of 4:3 alt-driven photos that gently zoom on hover. Use to show last year's highlights, venue atmosphere, networking moments, or past event photos on tech conference, summit, festival, or meetup pages.",
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
          'bg-foreground py-20 text-background lg:py-28',
          props.className,
        )}
      >
        <Container size="lg">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-background/70">{description}</p>
          </div>
          <GalleryGrid>
            <GalleryGridItems columns={3}>
              {items
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
