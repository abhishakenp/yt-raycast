import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { GalleryGrid } from '#/section-kit/GalleryGrid.tsx'

/**
 * BarNightclubGallery — masonry-style photo gallery for a cocktail-bar /
 * nightclub page. A split header (eyebrow + light-weight heading on the left, a
 * right-aligned lead on the right), then a responsive grid where the first
 * image spans two columns and rows to anchor the composition and the rest tile
 * at a fixed height. All photos use the alt-driven Image component. Moody,
 * editorial, monochrome. Use to show interior atmosphere, bar craft, the dance
 * floor, or ambient details for bars, nightclubs, lounges, or speakeasies.
 * Renders fully with no props via baked-in defaults.
 */
export const BarNightclubGallery = defineCapsule({
  name: 'BarNightclubGallery',
  description:
    'Masonry-style photo gallery for a cocktail-bar / nightclub page: a split header (eyebrow + light-weight heading on the left, right-aligned lead on the right), then a responsive grid where the first image spans two columns and rows to anchor the composition and the rest tile at a fixed height. All photos use the alt-driven Image component. Moody, editorial and monochrome. Use to show interior atmosphere, bar craft, the dance floor, or ambient details for bars, nightclubs, lounges, or speakeasies.',
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

    return (
      <section
        className={cn(
          'border-t border-border pt-28 pb-24 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">
                {eyebrow}
              </p>
              <h2 className="text-3xl font-light sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
            </div>
            <p className="max-w-md text-muted-foreground md:text-right">
              {description}
            </p>
          </div>

          <GalleryGrid images={images.map((alt) => ({ alt }))} columns={3} />
        </Container>
      </section>
    )
  },
})
