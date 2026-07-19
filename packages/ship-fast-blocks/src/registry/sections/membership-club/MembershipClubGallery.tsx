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
 * MembershipClubGallery — masonry-style photo gallery of gatherings for a private
 * membership club / exclusive community page. A left-aligned eyebrow + thin heading
 * sit above a responsive 4-column grid of alt-driven photos with alternating
 * heights (taller on even indices, shorter on odd) for a relaxed editorial rhythm,
 * all on a muted surface band. Use to show the lived experience — dinners, retreats,
 * clubhouses, panels — for members clubs, founders communities, professional
 * networks or curated collectives. Renders fully with no props.
 */
export const MembershipClubGallery = defineCapsule({
  name: 'MembershipClubGallery',
  description:
    'Masonry-style photo gallery of gatherings for a private membership club / exclusive community page: a left-aligned eyebrow + thin heading above a responsive 4-column grid of alt-driven photos with alternating heights (taller on even indices, shorter on odd) for a relaxed editorial rhythm, on a muted surface band. Use to show the lived experience — dinners, retreats, clubhouses, panels — for members clubs, founders communities, professional networks or curated collectives.',
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
            className="mb-12 max-w-3xl lg:mb-16 gap-0"
            eyebrowClassName="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground"
            titleClassName="text-3xl font-light text-foreground sm:text-4xl"
          />
          <GalleryGrid>
            <GalleryGridItems columns={4}>
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
                    <GalleryTile key={__iv__.alt}>
                      <GalleryTileImage alt={__iv__.alt} />
                      {__iv__.caption && (
                        <GalleryTileCaption>
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
