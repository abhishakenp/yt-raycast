import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * FurnitureStoreTestimonials — a centered, star-rated customer-review grid. A
 * padded section with a centered eyebrow + heading above a 1/3-column grid of
 * muted-card blockquotes; each card has a 5-star row (primary-tinted), the quote
 * in quotation marks, and a footer with a round customer avatar beside the name
 * and a location / purchase meta line. Use as social proof for furniture,
 * home-decor, interiors, or any warm retail brand. Renders fully with no props
 * via baked-in defaults.
 */
export const FurnitureStoreTestimonials = defineComponent({
  name: 'FurnitureStoreTestimonials',
  description:
    'Centered star-rated customer-review grid: a padded section with a centered eyebrow + heading above a 1/3-column grid of muted-card blockquotes; each card has a 5-star row (primary-tinted), the quote in quotation marks, and a footer with a round customer avatar beside the name and a location / purchase meta line. Use as social proof for furniture, home-decor, interiors, or any warm retail brand.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          meta: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Testimonials'
    const heading = props.heading ?? 'Loved by 15,000+ homes'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'The Cloud Sofa completely transformed our living room. The quality is exceptional, and the white glove delivery team was professional and careful. Worth every penny.',
            name: 'Sarah Mitchell',
            meta: 'Austin, TX · Purchased March 2026',
            avatarAlt:
              'Professional headshot of a smiling woman with shoulder-length brown hair in a light sweater',
          },
          {
            quote:
              'The design consultation was a game-changer. Elena helped us maximize our small apartment space. The furniture arrived on time and the quality exceeded our expectations.',
            name: 'James Chen',
            meta: 'Brooklyn, NY · Purchased February 2026',
            avatarAlt:
              'Professional headshot of a young man with short curly hair and glasses wearing a navy shirt',
          },
          {
            quote:
              'We furnished our entire home with Haven & Home. Three years later, everything still looks brand new. The 10-year warranty gives us peace of mind. Truly investment pieces.',
            name: 'Emma Rodriguez',
            meta: 'Denver, CO · Purchased January 2023',
            avatarAlt:
              'Professional headshot of a woman with blonde hair pulled back, wearing a white blouse and warm smile',
          },
        ]

    const Star = () => (
      <svg
        className="size-5 text-primary"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section
        className={cn('py-16 lg:py-24', props.className)}
        aria-labelledby="furniture-testimonials-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center lg:mb-16">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
            <h2
              id="furniture-testimonials-heading"
              className="text-3xl font-medium lg:text-4xl"
            >
              {heading}
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {items.map((t) => (
              <blockquote key={t.name} className="rounded-lg bg-muted p-8">
                <div className="mb-4 flex gap-1" aria-label="5 out of 5 stars">
                  {[0, 1, 2, 3, 4].map((n) => (
                    <Star key={n} />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-foreground/80">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="flex items-center gap-3">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    loading="lazy"
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <cite className="font-medium not-italic">{t.name}</cite>
                    <p className="text-sm text-muted-foreground">{t.meta}</p>
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
