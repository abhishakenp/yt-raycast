import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * MusicFestivalGallery — a dark photo gallery band of past-year memories for a
 * music / arts festival landing page. A full-bleed inverted (foreground)
 * section with a centered eyebrow + heading + caption, then a mosaic photo grid
 * (one tall portrait tile spanning two rows, one wide tile spanning two columns)
 * of festival moments. Photos use the alt-driven Image component. Use to convey
 * atmosphere and social proof on music festivals, arts festivals, concert
 * series, or any recurring multi-day event.
 */
export const MusicFestivalGallery = defineCapsule({
  name: 'MusicFestivalGallery',
  description:
    'Dark photo gallery band of past-year memories for a music / arts festival landing page: a full-bleed inverted (foreground background, light text) section with a centered eyebrow + heading + caption, then a mosaic photo grid (one tall portrait tile spanning two rows and one wide tile spanning two columns) of festival moments like crowds, stages and installations. Photos use the alt-driven Image component. Use to convey atmosphere and social proof on music festivals, arts festivals, concert series, raves, or any recurring multi-day event.',
  props: z.object({
    /** Eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Caption paragraph beneath the heading. */
    description: z.string().optional(),
    /** Alt texts for the gallery photos. */
    imageAlts: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Memories'
    const heading = props.heading ?? 'Horizon 2024'
    const description =
      props.description ??
      "Last year's magic. This year's memories are waiting to be made."
    const imageAlts = props.imageAlts?.length
      ? props.imageAlts
      : [
          'Festival main stage at night with colorful laser lights and a massive crowd',
          'Friends dancing together with arms raised at an outdoor music festival',
          'Aerial view of an illuminated ferris wheel at a music festival at dusk',
          'Concert crowd silhouettes against dramatic stage lighting and smoke',
          'Person on friends shoulders watching a sunset performance at a festival',
          'Neon art installation with people walking through at a night festival',
        ]

    return (
      <section
        className={cn(
          'bg-foreground py-24 text-background lg:py-32',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-background/50">
              {eyebrow}
            </p>
            <h2 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">
              {heading}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-background/70">
              {description}
            </p>
          </div>
          <ResponsiveGrid cols="2-md-4" gap="sm">
            {imageAlts.map((alt, i) => (
              <Image
                key={alt}
                alt={alt}
                w={600}
                h={i === 1 ? 800 : 400}
                loading="lazy"
                className={cn(
                  'h-48 w-full rounded-lg object-cover md:h-64',
                  i === 1 && 'md:row-span-2',
                  i === 5 && 'md:col-span-2',
                )}
              />
            ))}
          </ResponsiveGrid>
        </div>
      </section>
    )
  },
})
