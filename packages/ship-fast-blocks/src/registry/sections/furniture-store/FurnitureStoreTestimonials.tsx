import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * FurnitureStoreTestimonials — a centered, star-rated customer-review grid. A
 * padded section with a centered eyebrow + heading above a 1/3-column grid of
 * muted-card blockquotes; each card has a 5-star row (primary-tinted), the quote
 * in quotation marks, and a footer with a round customer avatar beside the name
 * and a location / purchase meta line. Use as social proof for furniture,
 * home-decor, interiors, or any warm retail brand. Renders fully with no props
 * via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'
export const FurnitureStoreTestimonials = defineCapsule({
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
    return (
      <section
        className={cn('py-16 lg:py-24', props.className)}
        aria-labelledby="furniture-testimonials-heading"
      >
        <Container>
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

          <TestimonialGrid items={items} columns={3} />
        </Container>
      </section>
    )
  },
})
