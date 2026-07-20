import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'

/**
 * BarNightclubGallery — staggered poster contact sheet for a cocktail-bar /
 * nightclub page. An asymmetric header (ticket-stub eyebrow chip + giant
 * condensed uppercase heading left, lead paragraph and mono frame-count
 * right), then an asymmetric 12-column grid of hard-bordered photo plates: the
 * first frame anchors wide (7 cols), the second runs tall and drops on a
 * staggered offset, and the rest tile beneath with alternating vertical
 * offsets that persist on mobile's offset 2-up grid. Every plate is sharp
 * cornered with a 2px border, a mono index chip in the corner, and a
 * blurred-backdrop mono caption strip; a giant ghost heading watermark floats
 * behind. All photos use the alt-driven Image component. Use to show interior
 * atmosphere, bar craft, the dance floor, or ambient details for bars,
 * nightclubs, lounges, or speakeasies. Renders fully with no props via
 * baked-in defaults.
 */
export const BarNightclubGallery = defineCapsule({
  name: 'BarNightclubGallery',
  description:
    "Staggered poster contact sheet for a cocktail-bar / nightclub page: an asymmetric header (ticket-stub eyebrow chip + giant condensed uppercase heading left, lead paragraph and mono frame-count right), then an asymmetric 12-column grid of hard-bordered photo plates — the first frame anchors wide, the second runs tall on a staggered offset, and the rest tile with alternating vertical offsets that persist on mobile's offset 2-up grid. Every plate is sharp-cornered with a 2px border, mono index chip and blurred-backdrop mono caption strip; a giant ghost heading watermark floats behind. All photos use the alt-driven Image component. Use to show interior atmosphere, bar craft, the dance floor, or ambient details for bars, nightclubs, lounges, or speakeasies.",
  props: z.object({
    /** Wide letter-spaced uppercase eyebrow. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Right-aligned lead paragraph. */
    description: z.string().optional(),
    /** Alt texts driving each gallery photo (first one is the large anchor tile). */
    images: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Gallery'
    const heading = props.heading ?? 'Inside NOIR'
    const description =
      props.description ??
      'Intimate booths, ambient lighting, and a carefully curated atmosphere designed for conversation and celebration.'
    const images = props.images?.length
      ? props.images
      : [
          'Bartender crafting cocktail at marble bar counter with warm lighting',
          'Elegant lounge seating area with velvet booths and ambient lighting',
          'Close-up of craft cocktail in crystal glass with garnish',
          'Nightclub dance floor with people dancing under colorful lights',
          'Backlit bar shelves with premium liquor bottles glowing in amber light',
        ]

    const spanFor = (i: number) => {
      const slot = i % 5
      if (slot === 0) return 'col-span-2 lg:col-span-7'
      if (slot === 1) return 'lg:col-span-5 translate-y-4 lg:translate-y-10'
      if (slot === 2) return 'lg:col-span-4'
      if (slot === 3) return 'lg:col-span-4 translate-y-4 lg:translate-y-8'
      return 'lg:col-span-4'
    }
    const aspectFor = (i: number) => {
      const slot = i % 5
      if (slot === 0) return 'aspect-[16/10]'
      if (slot === 1) return 'aspect-[4/3] lg:aspect-[4/5]'
      return 'aspect-[4/3]'
    }

    return (
      <section
        className={cn(
          'relative overflow-hidden py-14 sm:py-20 lg:py-24',
          props.className,
        )}
      >
        <Watermark className="-left-6 top-2 text-[5.5rem] uppercase sm:text-[10rem]">
          {heading}
        </Watermark>
        <Container className="relative">
          <GalleryGrid className="gap-0">
            <div className="mb-10 grid grid-cols-1 gap-6 sm:mb-12 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <span className="inline-flex items-center gap-3 border border-foreground/40 px-3 py-1.5">
                  <MonoTag className="text-[10px] text-foreground">
                    {eyebrow}
                  </MonoTag>
                  <span
                    aria-hidden="true"
                    className="h-3 border-l border-dashed border-foreground/40"
                  />
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-primary"
                  />
                </span>
                <h2 className="mt-4 text-4xl font-black uppercase leading-[0.9] tracking-tighter sm:text-5xl lg:text-6xl">
                  {heading}
                </h2>
              </div>
              <div className="lg:col-span-5 lg:pb-1 lg:text-right">
                <p className="max-w-md leading-relaxed text-muted-foreground lg:ml-auto">
                  {description}
                </p>
                <MonoTag aria-hidden="true" className="mt-3 block text-[10px]">
                  {String(images.length).padStart(2, '0')} / frames
                </MonoTag>
              </div>
            </div>

            <GalleryGridItems
              columns={3}
              className="grid-cols-2 gap-3 pb-6 sm:gap-4 lg:grid-cols-12 lg:pb-12"
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
                        'rounded-none border-2 border-foreground',
                        spanFor(i),
                        aspectFor(i),
                      )}
                    >
                      <GalleryTileImage alt={__iv__.alt} />
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-0 bg-foreground px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-background"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <GalleryTileCaption className="hidden border-t border-foreground/20 bg-background/85 font-mono text-[9px] uppercase tracking-[0.14em] text-foreground/70 sm:block">
                        <span className="block truncate">
                          {__iv__.caption ?? __iv__.alt}
                        </span>
                      </GalleryTileCaption>
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
