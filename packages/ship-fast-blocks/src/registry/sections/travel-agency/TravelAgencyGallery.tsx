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
    'Featured-destinations gallery for the Travel Agency page family. Composes the shared GalleryGrid kit composite into a three-column grid of six aspirational, alt-driven destination tiles (Santorini, Kyoto, Maldives, Swiss Alps, Marrakech, Patagonia), each with a captioned location. Use to showcase signature trips and inspire wanderlust mid-page. All images are alt-only and prop-driven with curated defaults so it renders with no props.',
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
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <GalleryGrid>
            <SectionHeading
              title={props.heading ?? 'Featured destinations'}
              subtitle={
                props.subheading ??
                'A taste of the journeys our travelers love most, each one ready to tailor to you.'
              }
            />
            <GalleryGridItems columns={3}>
              {images.map((img) => {
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
                      <GalleryTileCaption>{__iv__.caption}</GalleryTileCaption>
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
