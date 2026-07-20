import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

export const TravelAgencyGallery = defineCapsule({
  name: 'TravelAgencyGallery',
  description:
    'Featured-destinations mosaic for the Travel Agency page family. An asymmetric intro (mono eyebrow + heading left, supporting copy right) above a sharp-cornered responsive grid where the lead plate widens to a cinematic double-column feature and the rest sit in a 4:3 rhythm, each an alt-driven destination photo tagged with a mono index numeral and a mono ledger caption of its location (Santorini, Kyoto, Maldives, Swiss Alps, Marrakech, Patagonia). Use to showcase signature destinations and inspire wanderlust mid-page. All images are alt-only and prop-driven with curated defaults so it renders with no props.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
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
            alt: 'Whitewashed cliffside village above the Aegean Sea in Santorini',
            caption: 'Santorini, Greece',
          },
          {
            alt: 'Vermilion torii gates and temple gardens in Kyoto',
            caption: 'Kyoto, Japan',
          },
          {
            alt: 'Overwater villas above turquoise lagoon in the Maldives',
            caption: 'Maldives',
          },
          {
            alt: 'Snow-capped peaks and alpine village in the Swiss Alps',
            caption: 'Swiss Alps, Switzerland',
          },
          {
            alt: 'Bustling colorful souk and lanterns in Marrakech',
            caption: 'Marrakech, Morocco',
          },
          {
            alt: 'Dramatic glacial mountains and lakes in Patagonia',
            caption: 'Patagonia, Argentina',
          },
        ]
    return (
      <section
        className={cn(
          'bg-muted/30 pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container size="xl">
          <div className="mb-14 grid items-end gap-8 lg:grid-cols-12 lg:gap-12">
            <SectionHeading
              align="left"
              eyebrow="Destinations"
              title={props.heading ?? 'Featured destinations'}
              className="gap-3 lg:col-span-7"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground"
              titleClassName="text-4xl font-semibold tracking-tight lg:text-5xl"
            />
            <p className="text-base leading-relaxed text-muted-foreground lg:col-span-5 lg:pb-1">
              {props.subheading ??
                'A taste of the journeys our travelers love most, each one ready to tailor to you.'}
            </p>
          </div>
          <GalleryGrid>
            <GalleryGridItems columns={3} className="gap-3">
              {images.map((img, i) => {
                const __iv__ = img as {
                  alt: string
                  caption?: string
                  title?: string
                  location?: string
                }
                const feature = i === 0
                return (
                  <GalleryTile
                    key={__iv__.alt}
                    className={cn(
                      'rounded-none border-0 bg-muted',
                      feature ? 'aspect-[16/10] sm:col-span-2' : 'aspect-[4/3]',
                    )}
                  >
                    <GalleryTileImage alt={__iv__.alt} />
                    <span
                      aria-hidden="true"
                      className="absolute left-3 top-3 font-mono text-[11px] uppercase tracking-[0.14em] text-background/90"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {__iv__.caption && (
                      <GalleryTileCaption className="rounded-none font-mono text-[11px] uppercase tracking-[0.14em]">
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
