import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * IllustratorTestimonials — a client testimonials wall for an illustrator /
 * visual-artist portfolio on a raised card-colored band. A centered uppercase
 * accent eyebrow + serif heading sit above a responsive 3-up grid of quote
 * cards; each card is a soft background-colored panel with a curly-quoted
 * blockquote and a footer pairing a round avatar with the reviewer's name and
 * role. Use to surface social proof from editors, art directors, and
 * collectors. Renders fully with no props via baked-in defaults.
 */
export const IllustratorTestimonials = defineCapsule({
  name: 'IllustratorTestimonials',
  description:
    "Client testimonials wall for an illustrator / visual-artist portfolio on a raised card-colored band: a centered uppercase accent eyebrow + serif heading above a responsive 3-up grid of quote cards, each a soft background-colored panel with a curly-quoted blockquote and a footer pairing a round avatar with the reviewer's name and role. Use to surface social proof from editors, art directors, and collectors.",
  props: z.object({
    /** Uppercase accent eyebrow label. */
    eyebrow: z.string().optional(),
    /** Serif section heading. */
    heading: z.string().optional(),
    /** Testimonial cards. */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Kind Words'
    const heading = props.heading ?? 'What Clients Say'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "Mira brought our story to life with such warmth and imagination. Her illustrations for 'The Star Collector' captured exactly the whimsical tone we envisioned. Children immediately connect with her characters.",
            name: 'Sarah Mitchell',
            role: 'Editor, Chronicle Books',
            avatarAlt:
              "Professional headshot of Sarah Mitchell, children's book editor with warm smile",
          },
          {
            quote:
              'Working with Mira on our spring campaign was seamless. She understood our brand voice immediately and delivered illustrations that elevated our entire editorial presence. Truly a collaborative partner.',
            name: 'James Okonkwo',
            role: 'Creative Director, Kinfolk',
            avatarAlt:
              'Professional headshot of James Okonkwo, creative director with glasses and thoughtful expression',
          },
          {
            quote:
              "The art prints we purchased have become the centerpiece of our nursery. The quality is exceptional, and Mira's attention to packaging and presentation shows how much she cares about her collectors.",
            name: 'Elena Rodriguez',
            role: 'Collector & Art Enthusiast',
            avatarAlt:
              'Professional headshot of Elena Rodriguez, new mother and art collector with kind eyes',
          },
        ]

    return (
      <section
        className={cn(
          'bg-card px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-16 max-w-3xl text-center sm:mb-20">
            <p className="mb-2 text-sm font-medium uppercase tracking-wider text-chart-4">
              {eyebrow}
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
          </div>
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <figure key={t.name} className="rounded-xl bg-background p-8">
                <blockquote className="mb-6 leading-relaxed text-foreground">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-4">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <cite className="text-sm font-medium not-italic">
                      {t.name}
                    </cite>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
