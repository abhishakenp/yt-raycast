import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'

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
          'bg-card px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-28',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl">
          <TestimonialGrid eyebrow={eyebrow} heading={heading}>
            {items.map((t) => {
              const __iv__ = t as {
                quote: string
                name: string
                role?: string
                company?: string
                meta?: string
                rating?: number
                avatarAlt?: string
              }
              return (
                <TestimonialCard
                  key={__iv__.name}
                  className={'bg-background border-0 p-8'}
                >
                  <TestimonialQuote>{__iv__.quote}</TestimonialQuote>
                  <TestimonialAuthor>
                    <TestimonialName>{__iv__.name}</TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta>
                        {__iv__.role || __iv__.company || __iv__.meta}
                      </TestimonialMeta>
                    )}
                  </TestimonialAuthor>
                </TestimonialCard>
              )
            })}
          </TestimonialGrid>
        </div>
      </section>
    )
  },
})
