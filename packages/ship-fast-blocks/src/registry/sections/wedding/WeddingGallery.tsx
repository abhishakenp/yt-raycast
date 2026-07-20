import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'

export const WeddingGallery = defineCapsule({
  name: 'WeddingGallery',
  description:
    'Romantic-editorial photo gallery band for a wedding site on the shared GalleryGrid composite: an asymmetric header (mono index eyebrow + serif-italic heading, mono photo count on the right) over a soft wash with a giant ghost watermark word, above a responsive grid of alt-driven engagement and couple photographs in sharp hairline-framed plates whose middle column steps down on desktop for a gentle stagger, each with a hairline-topped mono caption. Use to showcase engagement sessions, candid moments, and venue previews on a wedding invitation or celebration page.',
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
    const heading = props.heading ?? 'Our moments'
    const description = props.description ?? 'Engagement & beyond'
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
          'relative overflow-hidden bg-muted/30 pt-24 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Watermark className="-top-6 right-2 font-serif text-[9rem] font-normal italic leading-none sm:text-[13rem]">
          moments
        </Watermark>
        <Container>
          <GalleryGrid>
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <MonoTag className="mb-4 block">Gallery</MonoTag>
                <h2 className="font-serif text-4xl font-normal italic leading-[1.05] tracking-tight text-foreground sm:text-5xl">
                  {heading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {description}
                </p>
              </div>
              <MonoTag
                aria-hidden="true"
                tone="faint"
                className="shrink-0 tabular-nums md:pb-2"
              >
                {String(images.length).padStart(2, '0')} / photos
              </MonoTag>
            </div>
            <GalleryGridItems columns={3}>
              {images.map((img, i) => {
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
                      'rounded-none border-border',
                      i % 3 === 1 && 'lg:translate-y-10',
                    )}
                  >
                    <GalleryTileImage alt={__iv__.alt} />
                    {__iv__.caption && (
                      <GalleryTileCaption className="border-t border-border bg-background/85 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground">
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
