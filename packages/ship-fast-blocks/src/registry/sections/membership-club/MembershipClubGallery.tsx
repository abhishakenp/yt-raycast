import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

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
        className={cn('w-full bg-card py-20 lg:py-32', props.className)}
        aria-label="Photo gallery of events and spaces"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-3xl lg:mb-16">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="text-3xl font-light text-foreground sm:text-4xl">
              {heading}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {images.map((alt, i) => (
              <Image
                key={alt}
                alt={alt}
                w={400}
                h={i % 2 === 0 ? 500 : 300}
                loading="lazy"
                className={cn(
                  'w-full rounded-lg object-cover',
                  i % 2 === 0 ? 'h-64 lg:h-80' : 'h-48 lg:h-56',
                )}
              />
            ))}
          </div>
        </div>
      </section>
    )
  },
})
