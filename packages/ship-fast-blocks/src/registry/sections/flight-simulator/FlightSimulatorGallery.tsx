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
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'

/**
 * FlightSimulatorGallery — an instrument-framed screenshot showcase for a flight
 * simulator landing page. An asymmetric mono HUD header (heading left, capture
 * count right) sits above a sharp-cornered bento of in-game captures built from
 * the shared `GalleryTile` slots — a large lead plate plus mixed wide and square
 * tiles, each driven by an evocative alt prompt and a mono `CAM NN` capture strip
 * that carries the original caption. Six baked screenshots span airliners, bush
 * flying, and night ops. Use to flaunt the visual fidelity of a flight sim,
 * airliner / combat sim, or aviation title. Renders fully with no props via
 * baked defaults.
 */
export const FlightSimulatorGallery = defineCapsule({
  name: 'FlightSimulatorGallery',
  description:
    'Instrument-framed screenshot showcase for a flight-simulator landing page built on the shared GalleryTile slots: an asymmetric mono HUD header above a sharp-cornered bento of in-game captures — a large lead plate plus mixed wide and square tiles, each driven by an evocative alt prompt and a mono CAM NN capture strip that carries the original caption. Six baked screenshots span airliners, bush flying, and night ops. Use to flaunt the visual fidelity of a flight sim, airliner / combat sim, or aviation title.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Screenshots: alt prompt + caption. */
    images: z
      .array(z.object({ alt: z.string(), caption: z.string().optional() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Screenshots from the cockpit'
    const images = props.images?.length
      ? props.images
      : [
          {
            alt: 'Boeing 787 Dreamliner on final approach into a mountain airport at sunset with snow-capped peaks',
            caption: '787 on final into a mountain airport at sunset',
          },
          {
            alt: 'bush plane on floats parked on a glassy alpine lake surrounded by pine forest in early morning fog',
            caption: 'Floatplane moored on a glassy alpine lake',
          },
          {
            alt: 'airliner cockpit panel glowing at night with city lights twinkling far below through the windscreen',
            caption: 'Night cruise over a glittering coastal city',
          },
          {
            alt: 'fighter jet banking hard over a desert canyon kicking up vapor from the wingtips',
            caption: 'Low-level pass through a desert canyon',
          },
          {
            alt: 'wide ramp shot of a busy international airport with dozens of parked airliners under a dramatic cloudy sky',
            caption: 'Busy international ramp under storm clouds',
          },
          {
            alt: 'single-engine prop plane on short final over a grass runway in rolling green countryside at golden hour',
            caption: 'Short final to a grass strip at golden hour',
          },
        ]

    const spans = [
      'lg:col-span-2 lg:row-span-2',
      'lg:col-span-2',
      'lg:col-span-1',
      'lg:col-span-1',
      'lg:col-span-2',
      'lg:col-span-2',
    ]

    return (
      <section
        className={cn(
          'bg-background pb-20 pt-24 lg:pb-28 lg:pt-28',
          props.className,
        )}
      >
        <Container>
          <GalleryGrid className="gap-8">
            <div className="flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
              <SectionHeading
                align="left"
                title={heading}
                subtitle={props.subheading}
                titleClassName="text-3xl font-extrabold tracking-tight sm:text-4xl"
                className="gap-3"
              />
              <MonoTag tone="faint" className="shrink-0 tabular-nums">
                [ {String(images.length).padStart(2, '0')} captures ] rec
              </MonoTag>
            </div>
            <div className="grid auto-rows-[10rem] grid-cols-2 gap-3 sm:auto-rows-[12rem] lg:grid-cols-4">
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
                      'aspect-auto h-full rounded-none border-border',
                      spans[i % spans.length],
                    )}
                  >
                    <GalleryTileImage
                      alt={__iv__.alt}
                      className="grayscale-[0.2] transition-[filter,transform] duration-300 group-hover:grayscale-0"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-2 top-2 z-10 bg-foreground/70 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-background backdrop-blur-sm"
                    >
                      CAM {String(i + 1).padStart(2, '0')}
                    </span>
                    {__iv__.caption && (
                      <GalleryTileCaption className="bg-background/85 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-foreground">
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
