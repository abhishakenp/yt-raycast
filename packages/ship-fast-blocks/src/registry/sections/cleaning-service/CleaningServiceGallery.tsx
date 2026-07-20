import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * CleaningServiceGallery — playful-Swiss transformations gallery for a
 * home-cleaning / maid-service landing page. An asymmetric header row (left
 * mono "03 / Results" eyebrow + heading + lead, right tabular mono project
 * count) above a staggered 2/3-column grid of square 2px-bordered project
 * tiles with hard offset shadows: the middle column drops down on desktop,
 * each tile carries a small rotated mono index chip, a lazy-loaded photo that
 * subtly zooms on hover, and an always-visible bordered caption bar with a
 * bold title and a mono location line. Use for portfolio / results galleries
 * for residential cleaning companies, maid services, renovation cleaners, or
 * home-service brands that want visual proof. Renders fully with no props via
 * six baked-in default transformations.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'
export const CleaningServiceGallery = defineCapsule({
  name: 'CleaningServiceGallery',
  description:
    "Playful-Swiss transformations gallery for a home-cleaning / maid-service landing page: asymmetric header row (left mono '03 / Results' eyebrow + heading + lead, right tabular mono project count) above a staggered 2/3-column grid of square 2px-bordered project tiles with hard offset shadows. The middle column drops down on desktop; each tile has a rotated mono index chip, a lazy-loaded photo that zooms subtly on hover, and an always-visible bordered caption bar with bold title and mono location. Use for portfolio / results galleries for residential cleaning, maid services, renovation cleaners, or home-service brands that want visual proof.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Gallery items: title + location + alt text for the image. */
    items: z
      .array(
        z.object({
          title: z.string(),
          location: z.string(),
          alt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Transformations that speak for themselves'
    const description =
      props.description ??
      'See the difference professional cleaning makes in real homes across Seattle.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Kitchen Deep Clean',
            location: 'Capitol Hill, Seattle',
            alt: 'before and after comparison of kitchen deep cleaning showing greasy stove to sparkling clean',
          },
          {
            title: 'Bathroom Revival',
            location: 'Ballard, Seattle',
            alt: 'pristine bathroom with white subway tiles and clean glass shower enclosure',
          },
          {
            title: 'Living Room Refresh',
            location: 'Fremont, Seattle',
            alt: 'freshly cleaned living room with organized furniture and dust-free surfaces',
          },
          {
            title: 'Home Office Clean',
            location: 'Queen Anne, Seattle',
            alt: 'clean home office with organized desk and dusted shelves',
          },
          {
            title: 'Floor Restoration',
            location: 'Green Lake, Seattle',
            alt: 'sparkling hardwood floors after professional mopping in open concept space',
          },
          {
            title: 'Master Bedroom',
            location: 'Wallingford, Seattle',
            alt: 'immaculate bedroom with freshly laundered white linens and organized nightstands',
          },
        ]
    return (
      <section className={cn('bg-background py-16 lg:py-24', props.className)}>
        <Container>
          <div className="mb-10 flex flex-col gap-4 sm:mb-14 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              eyebrow="03 / Results"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              titleClassName="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              subtitleClassName="max-w-xl text-lg text-muted-foreground"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70"
            >
              <span className="tabular-nums">
                {String(items.length).padStart(2, '0')}
              </span>{' '}
              projects · documented
            </p>
          </div>
          <GalleryGrid>
            <GalleryGridItems
              columns={3}
              className="grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 lg:gap-8"
            >
              {items.map((img, i) => {
                const __iv__ = img as {
                  alt: string
                  caption?: string
                  title?: string
                  location?: string
                }
                const captionTitle = __iv__.title ?? __iv__.caption
                return (
                  <GalleryTile
                    key={__iv__.alt}
                    className={cn(
                      'aspect-auto rounded-none border-2 border-foreground bg-card shadow-[4px_4px_0_0] shadow-foreground',
                      i % 3 === 1 && 'lg:translate-y-8',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute left-2.5 top-2.5 z-10 inline-flex -rotate-2 border-2 border-foreground bg-background px-2 py-0.5 font-mono text-[10px] font-bold tabular-nums tracking-[0.12em] text-foreground sm:left-3 sm:top-3"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <GalleryTileImage
                      alt={__iv__.alt}
                      loading="lazy"
                      className="aspect-[4/3] h-auto w-full"
                    />
                    {(captionTitle || __iv__.location) && (
                      <GalleryTileCaption className="relative border-t-2 border-foreground bg-card px-3 py-2 backdrop-blur-none">
                        {captionTitle && (
                          <span className="block truncate text-xs font-bold text-card-foreground sm:text-sm">
                            {captionTitle}
                          </span>
                        )}
                        {__iv__.location && (
                          <span className="block truncate font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                            {__iv__.location}
                          </span>
                        )}
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
