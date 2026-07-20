import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import {
  GalleryGrid,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'
import { Watermark, MonoTag } from '#/section-kit/Decor.tsx'

/**
 * PhotographyGallery — full-bleed portfolio plates for a fine-art / wedding
 * photographer site: the images ARE the design. An asymmetric editorial header
 * (mono index eyebrow + serif heading left, mono count meta right) sits above a
 * 7/5 staggered plate grid built on the shared `GalleryGrid` composite: wide
 * landscape frames and taller portrait frames alternate and drop out of rhythm,
 * each a square-cornered edge-to-edge photograph with a hover zoom and an
 * EXIF-style mono museum-label caption (`01 / …`) letterboxed across its foot. A
 * giant faint "PORTFOLIO" watermark ghosts behind the grid. All imagery is
 * alt-driven via the Image component. Use to showcase recent weddings,
 * portraits, and editorial work for photographers, studios, and elopement
 * shooters. Renders fully with no props via baked-in defaults (six frames).
 */
export const PhotographyGallery = defineCapsule({
  name: 'PhotographyGallery',
  description:
    'Full-bleed portfolio plates for a fine-art / wedding photographer site where the images are the design, built on the shared GalleryGrid composite: an asymmetric editorial header (mono index eyebrow + serif heading, mono count meta) above a 7/5 staggered plate grid of square-cornered edge-to-edge photographs — alternating wide landscape and taller portrait frames dropped out of rhythm — each with a hover zoom and an EXIF-style mono museum-label caption letterboxed across its foot, over a giant faint "PORTFOLIO" watermark. All imagery is alt-driven via the Image component. Use to showcase recent weddings, portraits, and editorial work for photographers, studios, and elopement shooters.',
  props: z.object({
    /** Section heading (serif, large). */
    heading: z.string().optional(),
    /** Supporting line under the heading (maps to GalleryGrid subheading). */
    description: z.string().optional(),
    /** Gallery tiles — each has alt text driving the photo and a short caption. */
    images: z
      .array(z.object({ alt: z.string(), caption: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Recent work'
    const description =
      props.description ??
      'A selection of weddings, elopements, and portrait sessions captured around the world — emotion over perfection, always.'
    const images = props.images?.length
      ? props.images
      : [
          {
            alt: 'Bride and groom embracing in golden-hour light in a wild meadow, soft documentary wedding portrait',
            caption: 'Golden hour, Tuscany',
          },
          {
            alt: 'Intimate elopement couple holding hands on a misty mountain ridge at dawn',
            caption: 'Dolomites elopement',
          },
          {
            alt: 'Candid black-and-white portrait of a bride laughing while getting ready, natural window light',
            caption: 'Getting ready',
          },
          {
            alt: 'Wedding reception under string lights at dusk with guests dancing in a rustic barn',
            caption: 'First dance',
          },
          {
            alt: 'Editorial portrait of a couple walking along a windswept coastal cliff at sunset',
            caption: 'Coastal session',
          },
          {
            alt: 'Close-up detail of a delicate wildflower bridal bouquet held in soft natural light',
            caption: 'The little details',
          },
        ]
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Watermark className="-left-4 top-16 text-[22vw] leading-none lg:text-[14rem]">
          PORTFOLIO
        </Watermark>
        <Container className="relative">
          <GalleryGrid>
            {/* Asymmetric editorial header — mono index + serif heading left, meta right. */}
            <div className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <MonoTag className="mb-4 block">01 / Selected Work</MonoTag>
                <h2 className="font-serif text-4xl font-medium leading-[1.05] tracking-tight text-foreground md:text-5xl">
                  {heading}
                </h2>
                <p className="mt-4 text-pretty text-base text-muted-foreground md:text-lg">
                  {description}
                </p>
              </div>
              <span
                aria-hidden="true"
                className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums text-muted-foreground/60"
              >
                {String(images.length).padStart(2, '0')} frames · 2019—2025
              </span>
            </div>

            {/* 7/5 staggered full-bleed plates. */}
            <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-12 sm:gap-5">
              {images.map((img, i) => {
                const __iv__ = img as {
                  alt: string
                  caption?: string
                  title?: string
                  location?: string
                }
                const wide = i % 2 === 0
                return (
                  <GalleryTile
                    key={__iv__.alt}
                    className={cn(
                      'rounded-none border-0',
                      wide
                        ? 'aspect-[3/2] sm:col-span-7'
                        : 'aspect-[4/5] sm:col-span-5 sm:mt-16',
                    )}
                  >
                    <GalleryTileImage alt={__iv__.alt} />
                    {__iv__.caption && (
                      <GalleryTileCaption className="flex items-center gap-3 rounded-none border-t border-background/15 bg-foreground/75 px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-background backdrop-blur-sm">
                        <span
                          aria-hidden="true"
                          className="tabular-nums text-background/60"
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span
                          className="h-3 w-px bg-background/25"
                          aria-hidden="true"
                        />
                        {__iv__.caption}
                      </GalleryTileCaption>
                    )}
                  </GalleryTile>
                )
              })}
            </div>
          </GalleryGrid>
        </Container>
      </section>
    )
  },
})
