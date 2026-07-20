import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * MobileAppGallery — a kinetic staggered device-frame screenshot showcase. An
 * asymmetric header (left-aligned heading with a tilted primary marker block
 * behind the key word, mono "[ SCREENS ]" meta right) sits above a responsive
 * up-to-4-column grid of sharp hairline-chromed device-frame tiles with hard
 * offset shadows; alternating tiles are nudged down for a staggered rhythm and
 * each carries a mono index numeral caption. All imagery is alt-driven via
 * <Image>; no links. Use to showcase UI / product screenshots on a habit
 * tracker, fitness / wellness app, productivity or to-do app, or any consumer
 * app landing page. Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
} from '#/section-kit/GalleryGrid.tsx'
export const MobileAppGallery = defineCapsule({
  name: 'MobileAppGallery',
  description:
    'Kinetic staggered device-frame screenshot showcase: an asymmetric header (marker-highlighted heading left, mono screens meta right) over a responsive up-to-4-column grid of sharp hairline-chromed device-frame tiles with hard offset shadows, alternating tiles nudged down for a staggered rhythm and each carrying a mono index numeral caption; all imagery is alt-driven via <Image>. Use to showcase UI / product screenshots on a habit tracker, fitness / wellness app, productivity or to-do app, or any consumer app landing page.',
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
    const headingWords = heading.split(' ')
    const headingLead = headingWords.slice(0, -1).join(' ')
    const headingMark = headingWords.at(-1) ?? ''
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background pt-24 pb-20 lg:pt-28 lg:pb-28',
          props.className,
        )}
        aria-labelledby="mobileapp-gallery-heading"
      >
        <Container>
          {/* Asymmetric header: marker-highlighted heading left, mono meta right. */}
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                Screens
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  · gallery
                </span>
              </MonoTag>
              <h2
                id="mobileapp-gallery-heading"
                className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              >
                {headingLead}{' '}
                <span className="relative ml-[0.12em] inline-block whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-0.15em] inset-y-[0.05em] -rotate-1 bg-primary"
                  />
                  <span className="relative text-primary-foreground">
                    {headingMark}
                  </span>
                </span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {description}
              </p>
            </div>
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ screens ] tap to explore
            </p>
          </div>
          <GalleryGrid>
            <GalleryGridItems columns={4} className="gap-6">
              {items
                .map((alt) => ({ alt }))
                .map((img, i) => {
                  const __iv__ = img as {
                    alt: string
                    caption?: string
                    title?: string
                    location?: string
                  }
                  return (
                    <figure
                      key={__iv__.alt}
                      className={cn(
                        'relative',
                        i % 2 === 1 && 'sm:translate-y-8',
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="absolute -top-3 left-0 z-10 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                      >
                        {String(i + 1).padStart(2, '0')}
                        <span className="text-primary"> /</span>
                      </span>
                      {/* Hairline-chromed device frame with hard offset shadow. */}
                      <div className="rounded-[1.75rem] border-[6px] border-foreground bg-foreground shadow-[6px_6px_0_0] shadow-foreground/20">
                        <GalleryTile className="aspect-[9/16] overflow-hidden rounded-[1.25rem] border-0">
                          <GalleryTileImage
                            alt={__iv__.alt}
                            className="rounded-none"
                          />
                        </GalleryTile>
                      </div>
                    </figure>
                  )
                })}
            </GalleryGridItems>
          </GalleryGrid>
        </Container>
      </section>
    )
  },
})
