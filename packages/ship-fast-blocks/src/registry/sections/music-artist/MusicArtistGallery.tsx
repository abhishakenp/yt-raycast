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
 * MusicArtistGallery — "behind the music" poster photo grid for a music artist
 * / band page. An asymmetric mono-rail header (label — hairline — "PHOTOS"
 * index + giant uppercase heading) over a staggered grid of hard-bordered square
 * tiles where the first tile spans a 2×2 feature block and alternating tiles
 * offset vertically for a kinetic masonry rhythm; each image gently scales on
 * hover, all behind a giant ghost watermark. Bold poster aesthetic driven
 * entirely by theme tokens (flips light/dark); binary rounded-none radius. All
 * imagery uses the alt-driven Image component. Use as a behind-the-scenes /
 * photo showcase for musicians, bands, or artist EPK pages. Renders fully with
 * no props via baked-in defaults.
 */
export const MusicArtistGallery = defineCapsule({
  name: 'MusicArtistGallery',
  description:
    "'Behind the music' poster photo grid for a music artist / band page: an asymmetric mono-rail header (label — hairline — index + giant uppercase heading) over a staggered grid of hard-bordered square tiles where the first tile spans a 2×2 feature block and alternating tiles offset vertically for a kinetic masonry rhythm, each image gently scaling on hover, all behind a giant ghost watermark. Bold poster aesthetic driven entirely by theme tokens (flips light/dark); binary rounded-none radius. All imagery uses the alt-driven Image component. Use as a behind-the-scenes / photo showcase for musicians, singers, bands, or artist EPK pages.",
  props: z.object({
    /** Small uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Thin-weight section heading. */
    heading: z.string().optional(),
    /** Image alt strings (the second one renders as a tall masonry tile). */
    images: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Gallery'
    const heading = props.heading ?? 'Behind the Music'
    const images = props.images?.length
      ? props.images
      : [
          'Musician playing acoustic guitar in recording studio with warm ambient lighting',
          'Band performing live concert on intimate stage with atmospheric lighting',
          'Close-up of hands playing mandolin strings during acoustic session',
          'Vintage microphones and recording equipment in professional music studio',
          'Silhouette of musician standing in field at sunset with guitar',
          'Detailed close-up of upright piano keys and wood grain texture',
          'Stack of vinyl records on wooden shelf with warm natural lighting',
          'Black and white portrait of three band members in casual outdoor setting',
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden px-6 pt-28 pb-20 lg:px-8 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-8 right-0 select-none font-extrabold uppercase leading-none tracking-tighter text-foreground/[0.04] text-[10rem] sm:text-[16rem] lg:text-[20rem]"
        >
          Photos
        </span>

        <Container size="lg" className="relative">
          <div className="mb-12 flex items-center gap-4 lg:mb-16">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {eyebrow}
            </span>
            <span aria-hidden="true" className="h-px w-16 bg-border" />
            <span
              aria-hidden="true"
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground"
            >
              Photos
            </span>
          </div>
          <h2 className="-mt-8 mb-12 text-4xl font-extrabold uppercase leading-[0.9] tracking-tighter text-foreground sm:text-5xl lg:mb-16 lg:text-6xl">
            {heading}
          </h2>

          <GalleryGrid>
            <GalleryGridItems columns={3}>
              {images
                .map((alt) => ({ alt }))
                .map((img, idx) => {
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
                        'aspect-square rounded-none border-2 border-foreground',
                        idx === 0 && 'sm:col-span-2 sm:row-span-2',
                        idx !== 0 && idx % 2 === 0 && 'lg:translate-y-8',
                      )}
                    >
                      <GalleryTileImage alt={__iv__.alt} />
                      {__iv__.caption && (
                        <GalleryTileCaption className="rounded-none font-mono text-[11px] uppercase tracking-[0.15em]">
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
