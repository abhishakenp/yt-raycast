import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * MusicArtistGallery — "behind the music" masonry photo gallery for a music
 * artist / band page. A centered eyebrow + thin heading over a responsive grid
 * of square images where the second tile spans two rows for a masonry feel; each
 * image gently scales on hover. Warm, airy, editorial indie-folk aesthetic on a
 * soft neutral canvas. All imagery uses the alt-driven Image component. Use as a
 * behind-the-scenes / photo showcase for musicians, bands, or artist EPK pages.
 * Renders fully with no props via baked-in defaults.
 */
export const MusicArtistGallery = defineCapsule({
  name: 'MusicArtistGallery',
  description:
    "'Behind the music' masonry photo gallery for a music artist / band page: a centered eyebrow and thin heading over a responsive grid of square images where the second tile spans two rows for a masonry feel, each image gently scaling on hover. Warm, airy editorial indie-folk aesthetic on a soft neutral canvas. All imagery uses the alt-driven Image component. Use as a behind-the-scenes / photo showcase for musicians, singers, bands, or artist EPK pages.",
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
      <section className={cn('px-6 py-20 lg:px-8 lg:py-28', props.className)}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center lg:mb-24">
            <p className="mb-4 text-sm uppercase tracking-wide text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mb-6 text-3xl font-light text-foreground lg:text-5xl">
              {heading}
            </h2>
          </div>

          <ResponsiveGrid cols="2-3-4" gap="sm">
            {images.map((alt, i) => (
              <div
                key={alt}
                className={cn(
                  'aspect-square overflow-hidden rounded-sm bg-muted',
                  i === 1 && 'row-span-2',
                )}
              >
                <Image
                  alt={alt}
                  w={400}
                  h={i === 1 ? 800 : 400}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            ))}
          </ResponsiveGrid>
        </div>
      </section>
    )
  },
})
