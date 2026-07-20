import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * LogisticsGallery — an industrial-manifest global-network gallery for a
 * logistics / freight-forwarding company. An asymmetric header (left-aligned
 * heading + lede, mono `[ archive ] fleet` meta right) above a staggered grid of
 * square-cornered figure cards (2-col on mobile, 3-col on desktop with the middle
 * column shifted down) of ships, warehouses, trucks, cargo planes, terminals and
 * ports, each stamped with a mono `fig.NN` index chip and zooming slightly on
 * hover. Precise and operational, tokens-only. Use to showcase facilities, fleet
 * and infrastructure for logistics, freight-forwarding, shipping, courier,
 * warehousing or cargo/transport companies. Renders fully with no props via
 * alt-driven images.
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
export const LogisticsGallery = defineCapsule({
  name: 'LogisticsGallery',
  description:
    'Industrial-manifest global-network gallery for a logistics / freight-forwarding company: an asymmetric header (left heading + lede, mono meta right) above a staggered grid of square-cornered figure cards (2-col mobile, 3-col desktop with the middle column shifted down) of ships, warehouses, trucks, cargo planes, terminals and ports, each stamped with a mono fig-index chip and zooming on hover. Precise and operational, tokens-only. Use to showcase facilities, fleet and infrastructure for logistics, freight-forwarding, shipping, courier, warehousing, supply-chain or cargo/transport companies.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    images: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Our global network'
    const description =
      props.description ??
      'Facilities, fleet, and infrastructure that keep the world moving.'
    const images = props.images?.length
      ? props.images
      : [
          'Large commercial cargo ship loaded with colorful shipping containers sailing at sea',
          'Modern warehouse interior with tall shelves of packages and automated conveyor systems',
          'Fleet of white commercial delivery trucks parked at a distribution center',
          'Cargo airplane being loaded with freight containers at an airport tarmac',
          'Workers in safety vests coordinating logistics operations at a busy freight terminal',
          'Aerial view of a massive container port with cranes and stacked shipping containers',
        ]
    return (
      <section
        className={cn(
          'overflow-hidden bg-muted/40 py-14 sm:py-20 lg:py-24',
          props.className,
        )}
      >
        <Container>
          <div className="mb-10 flex flex-col gap-4 sm:mb-14 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              titleClassName="text-3xl font-extrabold tracking-tight lg:text-4xl"
              subtitleClassName="text-lg text-muted-foreground"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ archive ] fleet
            </p>
          </div>

          <GalleryGrid>
            <GalleryGridItems
              columns={3}
              className="grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:pb-8"
            >
              {images
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
                        'rounded-none border-border',
                        i % 3 === 1 && 'lg:translate-y-8',
                      )}
                    >
                      <GalleryTileImage alt={__iv__.alt} />
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-0 bg-foreground px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-background"
                      >
                        fig.{`0${i + 1}`.slice(-2)}
                      </span>
                      {__iv__.caption && (
                        <GalleryTileCaption className="border-t border-border bg-background/90 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
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
