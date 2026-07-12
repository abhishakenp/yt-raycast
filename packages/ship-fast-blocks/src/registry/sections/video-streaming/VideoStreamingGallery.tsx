import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import { GalleryGrid } from '#/section-kit/GalleryGrid.tsx'

/**
 * VideoStreamingGallery — captioned "Trending now" poster wall for a
 * video-streaming page. Thin configuration over the shared `GalleryGrid`
 * composite: a centered header above a responsive grid of show thumbnails, each
 * an alt-driven cinematic poster / scene still with a title caption overlay.
 * Use to surface the catalog — trending titles, originals, and new arrivals —
 * on streaming services, OTT apps, or on-demand video platforms. Renders fully
 * with no props via baked-in defaults (eight titles + captions).
 */
export const VideoStreamingGallery = defineCapsule({
  name: 'VideoStreamingGallery',
  description:
    "Captioned 'Trending now' poster wall for a video-streaming page built on the shared GalleryGrid composite: a centered header above a responsive grid of show thumbnails, each an alt-driven cinematic poster / scene still with a title caption overlay. Use to surface the catalog — trending titles, originals, and new arrivals — on streaming services, OTT apps, or on-demand video platforms.",
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
    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <GalleryGrid
            heading={props.heading ?? 'Trending now'}
            subheading={
              props.description ??
              "The titles everyone's streaming this week — originals, blockbusters, and fresh arrivals added all the time."
            }
            images={images}
            columns={4}
          />
        </Container>
      </section>
    )
  },
})
