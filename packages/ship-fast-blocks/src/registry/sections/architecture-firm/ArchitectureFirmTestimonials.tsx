import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

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
export const ArchitectureFirmTestimonials = defineComponent({
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

    const QuoteMark = () => (
      <svg
        className="mb-4 size-8 text-muted-foreground/40"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>
    )

    return (
      <section
        aria-labelledby="architecture-firm-testimonials-heading"
        className={cn('bg-card py-24 lg:py-32', props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <blockquote key={t.name} className="bg-muted p-8">
                <QuoteMark />
                <p className="mb-6 leading-relaxed text-foreground/80">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="flex items-center gap-4">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    loading="lazy"
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-foreground">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
