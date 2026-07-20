import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
} from '#/section-kit/GalleryGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Container } from '#/section-kit/Container.tsx'

export const ProductDetailGallery = defineCapsule({
  name: 'ProductDetailGallery',
  description:
    'Editorial-product gallery band for the Aurora Pro Headphones detail page, built on the shared GalleryGrid composite. An asymmetric header (left-aligned extrabold tight-tracked heading + subheading, with a mono "[ gallery ]" frame count on the right) sits above a staggered grid of sharp square product plates that show the headphones from every angle — front profile, side, folded, on-desk, worn outdoors, and an ear-cushion close-up. The first plate spans wide as the primary shot; each plate is a hairline-framed Image sitting on a hard offset frame, followed by a hairline ledger row pairing a muted tabular index numeral with a mono caption. Alternating plates step down on desktop for a broken-grid rhythm. Fully prop-driven — heading, subheading, columns, and the images array can be overridden, with premium Aurora defaults baked in. Every image resolves from a descriptive alt through the alt-driven Image component. Place between features and reviews to let buyers inspect the product visually. Theme tokens only.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    images: z
      .array(
        z.object({
          alt: z.string(),
          caption: z.string().optional(),
        }),
      )
      .optional(),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'See it from every angle'
    const subheading =
      props.subheading ??
      'A closer look at the materials, fit, and finish of the Aurora Pro.'
    const columns = props.columns ?? 3
    const images = props.images?.length
      ? props.images
      : [
          {
            alt: 'Aurora Pro headphones front view on white marble surface',
            caption: 'Front profile',
          },
          {
            alt: 'Aurora Pro headphones side profile showing earcup hinge',
            caption: 'Side detail',
          },
          {
            alt: 'Aurora Pro headphones folded flat for travel on a soft surface',
            caption: 'Folds flat',
          },
          {
            alt: 'Aurora Pro headphones resting on a minimalist wooden desk beside a laptop',
            caption: 'On the desk',
          },
          {
            alt: 'Person wearing Aurora Pro headphones walking outdoors in soft daylight',
            caption: 'On the go',
          },
          {
            alt: 'Macro close-up of Aurora Pro plush memory-foam ear cushion and stitching',
            caption: 'Cushion close-up',
          },
        ]

    return (
      <section
        aria-label="Product gallery"
        className={cn('bg-muted/30 py-20 sm:py-24', props.className)}
      >
        <Container size="xl">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={subheading}
              className="max-w-2xl gap-3"
              titleClassName="text-3xl font-extrabold tracking-tighter text-foreground sm:text-4xl lg:text-5xl"
              subtitleClassName="max-w-xl text-sm text-muted-foreground sm:text-base"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 tabular-nums"
            >
              [ gallery ] {String(images.length).padStart(2, '0')} frames
            </p>
          </div>

          <GalleryGrid>
            <GalleryGridItems
              columns={columns}
              className="items-start gap-x-6 gap-y-12 sm:gap-y-10"
            >
              {images.map((img, i) => {
                const __iv__ = img as {
                  alt: string
                  caption?: string
                  title?: string
                  location?: string
                }
                const isPrimary = i === 0
                return (
                  <div
                    key={__iv__.alt}
                    className={cn(
                      'flex flex-col',
                      isPrimary && 'sm:col-span-2',
                      !isPrimary &&
                        i % 2 === 1 &&
                        'sm:translate-y-8 lg:translate-y-0',
                      !isPrimary && i % 3 === 1 && 'lg:translate-y-10',
                    )}
                  >
                    <div className="relative mr-2.5">
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 translate-x-2.5 translate-y-2.5 border border-border"
                      />
                      <GalleryTile
                        className={cn(
                          'rounded-none border-foreground/15 bg-muted',
                          isPrimary ? 'aspect-[16/10]' : 'aspect-square',
                        )}
                      >
                        <GalleryTileImage
                          alt={__iv__.alt}
                          w={isPrimary ? 1200 : 600}
                          h={isPrimary ? 750 : 600}
                          className="group-hover:scale-[1.03]"
                        />
                        {isPrimary && (
                          <span className="absolute left-0 top-0 border-b border-r border-foreground bg-background px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground">
                            Aurora Pro
                          </span>
                        )}
                      </GalleryTile>
                    </div>
                    {__iv__.caption && (
                      <div className="mt-4 flex items-baseline gap-3 border-b border-border pb-3">
                        <span
                          aria-hidden="true"
                          className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60 tabular-nums"
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-sm font-medium tracking-tight text-foreground">
                          {__iv__.caption}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </GalleryGridItems>
          </GalleryGrid>
        </Container>
      </section>
    )
  },
})
