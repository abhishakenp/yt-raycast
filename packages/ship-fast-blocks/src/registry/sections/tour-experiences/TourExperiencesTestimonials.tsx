import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'

/** Row of filled/empty rating marks — currentColor → theme token. */
function RatingMarks({ rating }: { rating: number }) {
  const value = Math.max(0, Math.min(5, Math.round(rating)))
  return (
    <span className="inline-flex gap-1" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={cn('size-2', i < value ? 'bg-primary' : 'bg-border')}
        />
      ))}
    </span>
  )
}

/**
 * TourExperiencesTestimonials — editorial-wanderlust traveler-review wall for an
 * adventure / guided-tour brand. A mono metadata header above a staggered,
 * sharp-cornered grid of past-traveler reviews — each card carries a giant ghost
 * serif quotation mark, a vivid quote, a square-mark star rating, and a mono
 * name / tour-and-year source line ("Adventure tour, 2025"). Use to build trust
 * and social proof on tour-operator, expedition, and travel-experience landing
 * pages. Renders fully with no props via baked-in defaults.
 */
export const TourExperiencesTestimonials = defineCapsule({
  name: 'TourExperiencesTestimonials',
  description:
    "Editorial-wanderlust traveler-review wall for an adventure / guided-tour brand: a mono metadata header above a staggered sharp-cornered grid of past-traveler reviews, each card carrying a giant ghost serif quotation mark, a vivid quote, a square-mark star rating, and a mono name / tour-and-year source line ('Adventure tour, 2025'). Use to build trust and social proof on tour-operator, expedition, and travel-experience landing pages.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Traveler reviews (quote, name, rating, role/company). */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string().optional(),
          company: z.string().optional(),
          rating: z.number().optional(),
          avatarAlt: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "Hands down the best day of our whole trip. Our guide knew every shortcut and told stories you'd never get from a brochure.",
            name: 'Maya Okonkwo',
            role: 'Adventure tour, 2025',
            rating: 5,
            avatarAlt:
              'Smiling woman with curly hair on a sunny mountain trail',
          },
          {
            quote:
              'We ate things we never would have found alone and met the families who cook them. Pure magic from start to finish.',
            name: 'Diego Fuentes',
            role: 'Food tour, 2025',
            rating: 5,
            avatarAlt:
              'Cheerful man with a short beard standing in a vibrant street market',
          },
          {
            quote:
              'Small group, big heart. The multi-day expedition pushed us just enough and the sunset views were unreal.',
            name: 'Hannah Brooks',
            role: 'Multi-day expedition, 2024',
            rating: 5,
            avatarAlt:
              'Happy young woman with a backpack at a clifftop viewpoint at sunset',
          },
        ]

    return (
      <section className="bg-muted/30 px-6 pt-28 pb-20 lg:px-8 lg:pt-32 lg:pb-24">
        <Container size="xl" className={props.className}>
          {/* Mono metadata header. */}
          <div className="mb-12 flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 flex items-center gap-2 tracking-[0.18em]">
                <span aria-hidden="true" className="size-1.5 bg-primary" />
                Trail log
              </MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {props.heading ?? 'Stories from the trail'}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {props.subheading ??
                  'Real words from real travelers who came back with full memory cards and even fuller hearts.'}
              </p>
            </div>
            <MonoTag
              tone="faint"
              aria-hidden="true"
              className="shrink-0 tracking-[0.18em]"
            >
              {String(items.length).padStart(2, '0')} reviews
            </MonoTag>
          </div>

          {/* Staggered quote plates. */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
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
              const meta = __iv__.role || __iv__.company || __iv__.meta
              return (
                <figure
                  key={__iv__.name}
                  className={cn(
                    'relative flex flex-col overflow-hidden border border-border bg-card p-7 transition-colors duration-150 hover:border-foreground/30',
                    i % 3 === 1 && 'lg:mt-10',
                    i % 3 === 2 && 'lg:mt-5',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-6 right-3 select-none font-serif text-[7rem] leading-none text-foreground/[0.06]"
                  >
                    &rdquo;
                  </span>
                  {typeof __iv__.rating === 'number' && (
                    <RatingMarks rating={__iv__.rating} />
                  )}
                  <blockquote className="relative mt-4 text-lg font-medium leading-relaxed tracking-tight text-foreground">
                    {__iv__.quote}
                  </blockquote>
                  <figcaption className="mt-6 border-t border-border pt-4">
                    <span className="block text-sm font-bold tracking-tight text-foreground">
                      {__iv__.name}
                    </span>
                    {meta && (
                      <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        {meta}
                      </span>
                    )}
                  </figcaption>
                </figure>
              )
            })}
          </div>
        </Container>
      </section>
    )
  },
})
