import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * EventGallery — a dark photo highlights gallery for a conference or event page. A
 * full-bleed inverted (foreground-background) band with a centered heading +
 * description above a responsive 3-up grid of 4:3 alt-driven photos that gently
 * zoom on hover. Use to show last year's highlights, venue atmosphere, or past
 * event photos on tech conference, summit, festival, or meetup pages.
 */
export const EventGallery = defineComponent({
  name: 'EventGallery',
  description:
    "Dark photo highlights gallery for a conference or event page: a full-bleed inverted (foreground background, light text) band with a centered heading + description above a responsive 3-up grid of 4:3 alt-driven photos that gently zoom on hover. Use to show last year's highlights, venue atmosphere, networking moments, or past event photos on tech conference, summit, festival, or meetup pages.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description beneath the heading. */
    description: z.string().optional(),
    /** Photo alt-text descriptions (drive the images). */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? "Last Year's Highlights"
    const description =
      props.description ?? 'A glimpse of what awaits you at DesignFront 2024.'
    const items = props.items?.length
      ? props.items
      : [
          'Conference attendees watching a presentation in a large theater with stage lighting',
          'Speaker on stage presenting to a large audience at a tech conference',
          'Conference attendees networking during a coffee break in a modern venue',
          'Workshop session with participants collaborating around laptops at tables',
          'Evening social event with attendees mingling under string lights',
          'Palace of Fine Arts dome architecture in San Francisco venue exterior',
        ]

    return (
      <section
        className={cn(
          'bg-foreground py-20 text-background lg:py-28',
          props.className,
        )}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-background/70">{description}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((alt) => (
              <div
                key={alt}
                className="aspect-[4/3] overflow-hidden rounded-xl"
              >
                <Image
                  alt={alt}
                  w={800}
                  h={600}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
