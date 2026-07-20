import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'

/**
 * MembershipClubGallery — staggered vitrine gallery of gatherings for a private
 * membership club / exclusive community page on a subtle muted band. A
 * left-aligned mono micro-label kicker + serif heading sit above a responsive
 * 4-column grid of alt-driven photographs, each set in a sharp-cornered hairline
 * vitrine mat that zooms gently on hover, with alternating columns nudged down
 * for a relaxed editorial rhythm. Use to show the lived experience — dinners,
 * retreats, clubhouses, panels — for members clubs, founders communities,
 * professional networks or curated collectives. Renders fully with no props.
 */
export const MembershipClubGallery = defineCapsule({
  name: 'MembershipClubGallery',
  description:
    'Staggered vitrine gallery of gatherings for a private membership club / exclusive community page on a subtle muted band: a left-aligned mono micro-label kicker + serif heading above a responsive 4-column grid of alt-driven photographs, each set in a sharp-cornered hairline vitrine mat that zooms gently on hover, with alternating columns nudged down for a relaxed editorial rhythm. Use to show the lived experience — dinners, retreats, clubhouses, panels — for members clubs, founders communities, professional networks or curated collectives.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    images: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Glimpses Inside'
    const heading = props.heading ?? 'Moments from recent gatherings'
    const images = props.images?.length
      ? props.images
      : [
          'members socializing at an outdoor rooftop dinner with string lights at dusk',
          'professionals collaborating in a modern coworking lounge with large windows',
          'speaker presenting at a fireside chat in an intimate venue',
          'members enjoying breakfast together at a long wooden table',
          'members networking in a minimalist clubhouse interior',
          'retreat attendees practicing yoga outdoors in the morning',
          'members listening intently at a panel discussion',
          'evening cocktail reception in a garden courtyard with ambient lighting',
        ]

    return (
      <section
        className={cn('w-full bg-card py-20 lg:py-28', props.className)}
        aria-label="Photo gallery of events and spaces"
      >
        <Container>
          <SectionHeading
            align="left"
            eyebrow={eyebrow}
            title={heading}
            className="mb-12 max-w-3xl gap-4 lg:mb-16"
            eyebrowClassName="font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground"
            titleClassName="font-serif text-4xl font-normal tracking-tight text-foreground lg:text-5xl"
          />
          <GalleryGrid>
            <GalleryGridItems
              columns={4}
              className="items-start gap-6 lg:[&>*:nth-child(even)]:translate-y-10"
            >
              {images
                .map((alt) => ({ alt }))
                .map((img) => {
                  const __iv__ = img as {
                    alt: string
                    caption?: string
                    title?: string
                    location?: string
                  }
                  return (
                    <GalleryTile
                      key={__iv__.alt}
                      className="rounded-none border-border bg-background p-2"
                    >
                      <GalleryTileImage alt={__iv__.alt} />
                      {__iv__.caption && (
                        <GalleryTileCaption className="font-mono text-[11px] uppercase tracking-[0.18em]">
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
