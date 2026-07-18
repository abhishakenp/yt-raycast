import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

/**
 * ArchitectureFirmTestimonials — client testimonials grid for an
 * architecture-studio / design-practice page. On a subtle card surface: a
 * centered eyebrow + light heading above a responsive 1/2/3-column grid of quote
 * cards; each card has a faint quotation-mark glyph, the quote, and a footer
 * pairing a round client portrait with name + role. Calm, editorial, monochrome.
 * Tokens-only, no links. Use as a testimonials / client-words / social-proof
 * section for architecture firms, design studios, interior designers,
 * contractors or any practice that wants to showcase client praise. Renders
 * fully with no props via three baked-in testimonials.
 */
export const ArchitectureFirmTestimonials = defineCapsule({
  name: 'ArchitectureFirmTestimonials',
  description:
    'Client testimonials grid for an architecture-studio / design-practice page: on a subtle card surface, a centered eyebrow + light heading above a responsive 1/2/3-column grid of quote cards, each with a faint quotation-mark glyph, the quote, and a footer pairing a round client portrait with name + role. Calm, editorial, monochrome. Tokens-only, no links. Use as a testimonials / client-words / social-proof section for architecture firms, design studios, interior designers, contractors or any practice showcasing client praise.',
  props: z.object({
    /** Wide letter-spaced eyebrow label. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Testimonials: quote, client name, role, portrait alt. */
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
    const eyebrow = props.eyebrow ?? 'Client Words'
    const heading = props.heading ?? 'Testimonials'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Atelier Móði transformed our brief into something beyond what we imagined. They understood not just what we asked for, but how we actually live. The light in our home changes beautifully throughout the day.',
            name: 'Elena Rasmussen',
            role: 'Homeowner, Villa Kyst',
            avatarAlt:
              'Professional headshot of a smiling woman with shoulder-length brown hair',
          },
          {
            quote:
              'Working with Atelier Móði on our headquarters was exceptional. Their attention to acoustic detail and daylight created an office where people genuinely want to work. Productivity increased 23% after the move.',
            name: 'Magnus Lindström',
            role: 'CEO, Fjord Technologies',
            avatarAlt:
              'Professional headshot of a man with short dark hair and a navy blazer',
          },
          {
            quote:
              "The adaptive reuse of our warehouse exceeded every expectation. They preserved the building's soul while making it perfectly functional for modern living. Our tenants consistently mention the quality of space.",
            name: 'Johan Petersen',
            role: 'Developer, Pakhus 47',
            avatarAlt:
              'Professional headshot of a man with gray hair and glasses wearing a dark sweater',
          },
        ]

    return (
      <section
        aria-labelledby="architecture-firm-testimonials-heading"
        className={cn('bg-card py-24 lg:py-28', props.className)}
      >
        <Container>
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
            <h2
              id="architecture-firm-testimonials-heading"
              className="text-3xl font-light text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
          </div>

          <TestimonialGrid items={items} columns={3} />
        </Container>
      </section>
    )
  },
})
