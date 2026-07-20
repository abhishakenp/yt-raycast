import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import { GalleryTile, GalleryTileImage } from '#/section-kit/GalleryGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'

/**
 * VideoStreamingGallery — inverted, cinematic "Trending now" poster wall for a
 * video-streaming page. On a bg-foreground/text-background band (token-driven,
 * theme-adaptive) cut by a slanted clip-path seam over a giant faint "STREAMING"
 * ghost watermark: a mono slate meta rule with a title count, an asymmetric
 * left-aligned header, and a staggered grid of aspect-[2/3] poster tiles — each
 * an alt-driven cinematic still with a mono rank slate, a darkening hover scrim,
 * a centered play button, and a bottom-anchored mono `4K · HDR` metadata + title
 * caption. Alternating columns are nudged on a translate rhythm so the wall
 * never reads as a uniform grid. Use to surface the catalog — trending titles,
 * originals, and new arrivals — on streaming services, OTT apps, or on-demand
 * video platforms. Renders fully with no props via baked-in defaults (eight
 * titles + captions).
 */
export const VideoStreamingGallery = defineCapsule({
  name: 'VideoStreamingGallery',
  description:
    "Inverted, cinematic 'Trending now' poster wall for a video-streaming page: on a bg-foreground/text-background band cut by a slanted clip-path seam over a giant faint 'STREAMING' ghost watermark, a mono slate meta rule with a title count, an asymmetric left-aligned header, and a staggered grid of aspect-[2/3] poster tiles — each an alt-driven cinematic still with a mono rank slate, a darkening hover scrim, a centered play button, and a bottom-anchored mono metadata + title caption; alternating columns ride a translate rhythm so the wall never reads uniform. Tokens-only and theme-adaptive. Use to surface the catalog — trending titles, originals, and new arrivals — on streaming services, OTT apps, or on-demand video platforms.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting line under the heading (maps to GalleryGrid subheading). */
    description: z.string().optional(),
    /** Poster tiles — each has alt text driving the still and a title caption. */
    images: z
      .array(z.object({ alt: z.string(), caption: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Trending now'
    const description =
      props.description ??
      "The titles everyone's streaming this week — originals, blockbusters, and fresh arrivals added all the time."
    const images = props.images?.length
      ? props.images
      : [
          {
            alt: 'cinematic sci-fi poster, lone astronaut adrift against a vast neon nebula, moody teal lighting, dramatic widescreen still',
            caption: 'Midnight Echo',
          },
          {
            alt: 'moody noir crime drama poster, detective in a rain-soaked alley under a flickering streetlight, deep shadows and amber glow',
            caption: 'The Long Night',
          },
          {
            alt: 'epic fantasy poster, armored rider on a ridge overlooking a misty castle valley at golden hour, sweeping cinematic landscape',
            caption: 'Ashen Crown',
          },
          {
            alt: 'high-energy heist thriller poster, masked crew silhouetted against an exploding vault, dramatic orange and black contrast',
            caption: 'Cold Vault',
          },
          {
            alt: 'warm coming-of-age drama still, two teens on a sunlit rooftop at dusk overlooking a glowing city skyline, soft film grain',
            caption: 'Rooftop Summer',
          },
          {
            alt: 'tense survival thriller poster, hiker dwarfed by a towering snow-capped mountain in a whiteout storm, cold blue palette',
            caption: 'Whiteout',
          },
          {
            alt: 'stylish spy series poster, elegant figure in a tailored suit walking through a neon Tokyo street at night, reflections on wet pavement',
            caption: 'Cipher',
          },
          {
            alt: 'dark supernatural horror poster, candlelit hallway of an old manor with a shadowed figure at the far end, eerie green glow',
            caption: 'The Hollow',
          },
        ]

    const PlayIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M6 4.5v11a1 1 0 0 0 1.52.85l9-5.5a1 1 0 0 0 0-1.7l-9-5.5A1 1 0 0 0 6 4.5Z" />
      </svg>
    )

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground pb-20 pt-24 text-background [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] sm:pt-28 lg:pb-28 lg:pt-36',
          props.className,
        )}
      >
        <Watermark className="-right-8 top-8 text-[24vw] leading-none text-background/[0.05] lg:text-[15rem]">
          STREAMING
        </Watermark>
        <Container className="relative">
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-background/20 pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              Trending now
            </span>
            <span className="tabular-nums">
              {String(images.length).padStart(2, '0')} titles
            </span>
          </div>

          <SectionHeading
            align="left"
            title={heading}
            subtitle={description}
            className="mb-12 gap-0"
            titleClassName="mb-4 text-4xl font-extrabold tracking-tight text-background md:text-5xl"
            subtitleClassName="max-w-xl text-background/70"
          />

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
                    'aspect-[2/3] rounded-none border-background/15',
                    i % 2 === 1 && 'sm:translate-y-8',
                  )}
                >
                  <GalleryTileImage alt={__iv__.alt} w={400} h={600} />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/10 to-transparent"
                  />
                  <span className="absolute left-3 top-3 font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums text-background/70">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:transition-none">
                    <span className="grid size-14 place-items-center rounded-full bg-background/20 backdrop-blur-sm">
                      <PlayIcon className="ml-0.5 size-7 text-background" />
                    </span>
                  </div>
                  {__iv__.caption && (
                    <figcaption className="absolute inset-x-3 bottom-3">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-background/60">
                        4K · HDR
                      </span>
                      <span className="mt-1 block text-sm font-bold tracking-tight text-background">
                        {__iv__.caption}
                      </span>
                    </figcaption>
                  )}
                </GalleryTile>
              )
            })}
          </div>
        </Container>
      </section>
    )
  },
})
