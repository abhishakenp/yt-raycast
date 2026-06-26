import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * MobileAppGallery — a centered-intro, masonry-style app-screenshot gallery. A
 * centered heading + description sits above a responsive up-to-4-column grid of
 * rounded, shadowed screenshot tiles; alternating tiles are nudged down and
 * given a taller aspect for a staggered masonry rhythm. All imagery is
 * alt-driven via <Image>; no links. Use to showcase UI / product screenshots on
 * a habit tracker, fitness / wellness app, productivity or to-do app, or any
 * consumer app landing page. Renders fully with no props via baked-in defaults.
 */
export const MobileAppGallery = defineComponent({
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
        className={cn('py-20 lg:py-32', props.className)}
        aria-labelledby="mobileapp-gallery-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2
              id="mobileapp-gallery-heading"
              className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((alt, i) => (
              <div
                key={alt}
                className={cn(
                  'overflow-hidden rounded-2xl shadow-lg',
                  i % 2 === 1 && 'sm:mt-12',
                )}
              >
                <Image
                  alt={alt}
                  w={400}
                  h={i % 2 === 0 ? 800 : 600}
                  loading="lazy"
                  className="w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
