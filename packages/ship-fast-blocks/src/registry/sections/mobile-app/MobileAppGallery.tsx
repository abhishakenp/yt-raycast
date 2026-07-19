import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * MobileAppGallery — a centered-intro, masonry-style app-screenshot gallery. A
 * centered heading + description sits above a responsive up-to-4-column grid of
 * rounded, shadowed screenshot tiles; alternating tiles are nudged down and
 * given a taller aspect for a staggered masonry rhythm. All imagery is
 * alt-driven via <Image>; no links. Use to showcase UI / product screenshots on
 * a habit tracker, fitness / wellness app, productivity or to-do app, or any
 * consumer app landing page. Renders fully with no props via baked-in defaults.
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
export const MobileAppGallery = defineCapsule({
  name: 'MobileAppGallery',
  description:
    'Centered-intro masonry-style app-screenshot gallery: a centered heading + description over a responsive up-to-4-column grid of rounded, shadowed screenshot tiles, with alternating tiles nudged down and given a taller aspect for a staggered masonry rhythm; all imagery is alt-driven via <Image>. Use to showcase UI / product screenshots on a habit tracker, fitness / wellness app, productivity or to-do app, or any consumer app landing page.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'See DailyFlow in action'
    const description =
      props.description ??
      'A clean, intuitive interface designed to keep you focused on what matters—your progress.'
    const items = props.items?.length
      ? props.items
      : [
          'iPhone displaying habit tracking app dashboard with weekly progress overview and daily check-in circles',
          'Tablet showing detailed habit analytics dashboard with charts and monthly statistics',
          'Smartphone showing habit creation interface with custom reminder time picker',
          'iPhone displaying streak celebration screen with confetti animation and achievement badge',
          'Mobile app showing accountability group chat with habit progress updates from team members',
          'Laptop screen displaying habit heat map visualization over a full year',
          'Smartphone dark mode interface showing evening habit checklist with muted colors',
          "iPhone widget on home screen displaying today's habit completion status at a glance",
        ]
    return (
      <section
        className={cn('pt-28 pb-20 lg:pt-32 lg:pb-28', props.className)}
        aria-labelledby="mobileapp-gallery-heading"
      >
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            titleId="mobileapp-gallery-heading"
            className="mb-16 max-w-2xl gap-0"
            titleClassName="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <GalleryGrid>
            <GalleryGridItems columns={4}>
              {items
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
