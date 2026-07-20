import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * DentalGallery — hairline mosaic office tour for a dental practice site. An
 * asymmetric header (left-aligned mono eyebrow + heading + lede, mono index
 * meta right) above a hairline-connected mosaic grid (gap-px over the border
 * color) of square photo tiles where the first image spans two columns and two
 * rows as a large feature plate; each tile carries a small square mono index
 * chip and zooms subtly on hover. Imagery uses the alt-driven Image component.
 * Use to show off the reception, treatment rooms, and waiting area for
 * dentists, dental offices, or clinics.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'
export const DentalGallery = defineCapsule({
  name: 'DentalGallery',
  description:
    'Hairline mosaic office tour for a dental practice site: an asymmetric header (left-aligned mono eyebrow + heading + lede, mono index meta right) above a hairline-connected mosaic grid of square photo tiles where the first image spans two columns and rows as a large feature plate; each tile carries a small square mono index chip and zooms subtly on hover. Imagery uses the Image component. Use to show off the reception, treatment rooms, and waiting area for dentists, dental offices, or clinics.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    images: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const galleryEyebrow = props.eyebrow ?? 'Our Office'
    const galleryHeading =
      props.heading ?? 'A welcoming space designed for your comfort'
    const galleryDesc =
      props.description ??
      'Step into our modern, calming environment where every detail is designed to make your dental visit as pleasant as possible.'
    const galleryImages = props.images?.length
      ? props.images
      : [
          'Spacious modern dental clinic reception area with comfortable seating and natural light',
          'Modern dental examination room with advanced dental equipment and patient chair',
          'State-of-the-art digital dental x-ray machine in clean modern clinic',
          'Bright clean dental treatment room with advanced technology and ergonomic patient chair',
          'Welcoming dental office waiting area with plants and comfortable modern furniture',
        ]
    return (
      <section
        className={cn('bg-background py-20 sm:py-24 lg:py-28', props.className)}
      >
        <Container>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              eyebrow={galleryEyebrow}
              title={galleryHeading}
              subtitle={galleryDesc}
              className="max-w-2xl gap-0"
              eyebrowClassName="mb-4 inline-block font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.05]"
              subtitleClassName="text-base text-muted-foreground sm:text-lg"
            />
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:pb-1"
            >
              {String(galleryImages.length).padStart(2, '0')} / rooms
            </MonoTag>
          </div>
          <GalleryGrid>
            <GalleryGridItems
              columns={3}
              className="grid-cols-2 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4"
            >
              {galleryImages
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
                        'rounded-none border-0 bg-background',
                        i === 0
                          ? 'col-span-2 row-span-2 aspect-auto'
                          : 'aspect-[4/3]',
                      )}
                    >
                      <GalleryTileImage alt={__iv__.alt} />
                      <MonoTag
                        aria-hidden="true"
                        className="absolute left-3 top-3 bg-background/90 px-2 py-1 text-foreground"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </MonoTag>
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
