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
import { Container } from '#/section-kit/Container.tsx'

/**
 * IllustratorTestimonials — a client testimonials wall for an illustrator /
 * visual-artist portfolio on a raised card band. A mono index eyebrow + serif
 * heading sit above a responsive 3-up grid of quote cards drawn as sketchbook
 * frames (rounded-none dashed borders, hard offset shadows on hover, gentle
 * rotations and a staggered rhythm); each card carries a giant ghost quotation
 * mark, a blockquote, and a footer pairing the reviewer's name with a mono role
 * label. Use to surface social proof from editors, art directors, and
 * collectors. Renders fully with no props via baked-in defaults.
 */
export const IllustratorTestimonials = defineCapsule({
  name: 'IllustratorTestimonials',
  description:
    "Client testimonials wall for an illustrator / visual-artist portfolio on a raised card band: a mono index eyebrow + serif heading above a responsive 3-up grid of quote cards drawn as sketchbook frames (rounded-none dashed borders, hard offset shadows on hover, gentle rotations and a staggered rhythm), each with a giant ghost quotation mark, a blockquote, and a footer pairing the reviewer's name with a mono role label. Use to surface social proof from editors, art directors, and collectors.",
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
    const tilt = ['-rotate-1', 'rotate-1', '-rotate-1']

    return (
      <section
        className={cn(
          'bg-card px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-28',
          props.className,
        )}
      >
        <Container size="xl">
          <TestimonialGrid
            eyebrow={eyebrow}
            heading={heading}
            className="[&_[data-slot=section-heading-eyebrow]]:font-mono [&_[data-slot=section-heading-eyebrow]]:tracking-[0.2em] [&_[data-slot=section-heading-title]]:font-serif"
          >
            {items.map((t, i) => {
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
                  className={cn(
                    'relative gap-4 overflow-hidden rounded-none border-2 border-dashed border-foreground/50 bg-background p-8 transition-[transform,box-shadow] duration-150 hover:-translate-y-1 hover:rotate-0 hover:border-foreground hover:shadow-[6px_6px_0_0_var(--color-foreground)]',
                    tilt[i % tilt.length],
                    i % 3 === 1 && 'md:translate-y-8',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-0 select-none font-serif text-8xl leading-none text-foreground/[0.06]"
                  >
                    &rdquo;
                  </span>
                  <TestimonialQuote className="relative">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="flex-col items-start gap-0.5 border-t-2 border-dashed border-border pt-4">
                    <TestimonialName className="font-serif text-base">
                      {__iv__.name}
                    </TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="font-mono text-[10px] uppercase tracking-[0.14em]">
                        {__iv__.role || __iv__.company || __iv__.meta}
                      </TestimonialMeta>
                    )}
                  </TestimonialAuthor>
                </TestimonialCard>
              )
            })}
          </TestimonialGrid>
        </Container>
      </section>
    )
  },
})
