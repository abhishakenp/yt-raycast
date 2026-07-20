import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * MusicFestivalGallery — a kinetic-poster inverted photo gallery band of
 * past-year memories for a music / arts festival landing page. A full-bleed
 * inverted section (foreground background, light text) cut on a slanted
 * clip-path seam, with a giant ghost watermark year, a left-aligned mono
 * eyebrow + big uppercase heading + caption, then a square-cornered mosaic
 * photo grid (a wide two-column tile among four-up tiles) of festival moments.
 * Photos use the alt-driven Image component. Use to convey atmosphere and
 * social proof on music festivals, arts festivals, concert series, or any
 * recurring multi-day event.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'
export const MusicFestivalGallery = defineCapsule({
  name: 'MusicFestivalGallery',
  description:
    'Kinetic-poster inverted photo gallery band of past-year memories for a music / arts festival landing page: a full-bleed inverted (foreground background, light text) section cut on a slanted clip-path seam, with a giant ghost watermark year, a left-aligned mono eyebrow + big uppercase heading + caption, then a square-cornered mosaic photo grid (a wide two-column tile among four-up tiles) of festival moments like crowds, stages and installations. Photos use the alt-driven Image component. Use to convey atmosphere and social proof on music festivals, arts festivals, concert series, raves, or any recurring multi-day event.',
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
    const tileSpans = ['sm:col-span-2', '', '', '', 'lg:col-span-2', '']
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground py-24 text-background [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-right-4 top-6 text-background/[0.06] text-[11rem] leading-[0.75] sm:text-[18rem]">
          {heading.split(' ').at(-1)}
        </Watermark>
        <Container className="relative">
          <SectionHeading
            align="left"
            eyebrow={eyebrow}
            title={heading}
            subtitle={description}
            className="mb-14 gap-3"
            eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-background/50"
            titleClassName="text-4xl font-extrabold uppercase tracking-tight text-background lg:text-6xl"
            subtitleClassName="max-w-xl text-lg text-background/70"
          />
          <GalleryGrid>
            <GalleryGridItems columns={4}>
              {imageAlts
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
                        'rounded-none border-background/20',
                        tileSpans[i % tileSpans.length],
                      )}
                    >
                      <GalleryTileImage
                        alt={__iv__.alt}
                        className="grayscale-[0.15]"
                      />
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
