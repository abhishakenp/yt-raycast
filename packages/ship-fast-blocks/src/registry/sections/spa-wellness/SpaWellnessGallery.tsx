import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'

/**
 * SpaWellnessGallery — hairline mosaic tour of a spa's spaces and rituals. An
 * asymmetric header (mono index eyebrow + delicate serif heading + calming
 * intro, mono count meta on the right) sits above a hairline-connected mosaic
 * grid (gap-px over the border color) of photo tiles where the first image
 * spans two columns and two rows as a large feature plate; each tile carries a
 * small square mono index chip and a soft mono caption strip and zooms subtly
 * on hover. Imagery uses the alt-driven Image component. Use to give visitors a
 * calming visual tour of treatment rooms, relaxation lounges, pools, and
 * natural details. Renders fully with no props via baked-in defaults.
 */
export const SpaWellnessGallery = defineCapsule({
  name: 'SpaWellnessGallery',
  description:
    "Hairline mosaic tour of a spa's spaces and rituals: an asymmetric header (mono index eyebrow + delicate serif heading + calming intro, mono count meta right) above a hairline-connected mosaic grid of photo tiles where the first image spans two columns and rows as a large feature plate; each tile carries a small square mono index chip and a soft mono caption strip and zooms subtly on hover. Imagery uses the alt-driven Image component. Use to give visitors a calming visual tour of treatment rooms, relaxation lounges, pools, and natural details.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting intro under the heading. */
    subheading: z.string().optional(),
    /** Gallery tiles; each alt drives its Image and caption labels it. */
    images: z
      .array(
        z.object({
          alt: z.string(),
          caption: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Inside our sanctuary'
    const subheading =
      props.subheading ??
      'Spaces designed to slow your breath the moment you walk through the door.'
    const images = props.images?.length
      ? props.images
      : [
          {
            alt: 'softly lit spa treatment room with a draped massage table and warm wood tones',
            caption: 'Treatment suites',
          },
          {
            alt: 'tranquil relaxation lounge with linen chairs, plants, and a tea station',
            caption: 'Relaxation lounge',
          },
          {
            alt: 'calm indoor mineral pool surrounded by smooth stone and soft daylight',
            caption: 'Mineral pool',
          },
          {
            alt: 'cedar sauna interior glowing with warm amber light',
            caption: 'Cedar sauna',
          },
          {
            alt: 'shelf of natural botanical oils and folded towels in a serene spa palette',
            caption: 'Botanical apothecary',
          },
          {
            alt: 'outdoor garden courtyard with a quiet fountain and lush greenery',
            caption: 'Garden courtyard',
          },
        ]

    return (
      <section
        className={cn(
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">03 / The Spaces</MonoTag>
              <h2 className="font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]">
                {heading}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">{subheading}</p>
            </div>
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:pb-2"
            >
              {String(images.length).padStart(2, '0')} / spaces
            </MonoTag>
          </div>
          <GalleryGrid>
            <GalleryGridItems
              columns={3}
              className="grid-cols-2 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4"
            >
              {images.map((img, i) => (
                <GalleryTile
                  key={img.alt}
                  className={cn(
                    'rounded-none border-0 bg-background',
                    i === 0
                      ? 'col-span-2 row-span-2 aspect-auto'
                      : 'aspect-[4/3]',
                  )}
                >
                  <GalleryTileImage alt={img.alt} />
                  <MonoTag
                    aria-hidden="true"
                    className="absolute left-3 top-3 bg-background/90 px-2 py-1 text-foreground"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </MonoTag>
                  {img.caption && (
                    <GalleryTileCaption className="rounded-none font-mono text-[11px] uppercase tracking-[0.15em]">
                      {img.caption}
                    </GalleryTileCaption>
                  )}
                </GalleryTile>
              ))}
            </GalleryGridItems>
          </GalleryGrid>
        </Container>
      </section>
    )
  },
})
