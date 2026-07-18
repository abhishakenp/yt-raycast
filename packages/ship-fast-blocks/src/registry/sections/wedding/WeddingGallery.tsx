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

export const WeddingGallery = defineCapsule({
  name: 'WeddingGallery',
  description:
    'Photo gallery band for a wedding site, built on the shared GalleryGrid composite: a soft serif-friendly heading over a responsive grid of alt-driven engagement and couple photographs with short captions. Use to showcase engagement sessions, candid moments, and venue previews on a wedding invitation or celebration page.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    images: z
      .array(
        z.object({
          alt: z.string(),
          caption: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const images = props.images?.length
      ? props.images
      : [
          {
            alt: 'engaged couple laughing together in a sunlit wildflower field, candid engagement photo',
            caption: 'Where it all began',
          },
          {
            alt: 'close-up of two hands with engagement ring resting on lace fabric, soft natural light',
            caption: 'She said yes',
          },
          {
            alt: 'couple silhouette kissing at golden hour against a glowing sunset sky',
            caption: 'Golden hour',
          },
          {
            alt: 'bride and groom dancing slowly under string lights at an outdoor evening party',
            caption: 'Our first dance',
          },
          {
            alt: 'couple walking hand in hand along a cobblestone street in an old European town',
            caption: 'Adventures together',
          },
          {
            alt: 'intimate portrait of a couple foreheads touching with a blurred garden background',
            caption: 'Forever starts now',
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
              title={props.heading ?? 'Our moments'}
              subtitle={props.description ?? 'Engagement & beyond'}
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
