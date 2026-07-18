import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * FashionStoreTestimonials — dark inverted customer testimonials band for a
 * minimalist fashion store. A foreground-colored section with a centered
 * uppercase eyebrow + serif heading above a responsive 1-to-3 column grid of
 * top-bordered quote blocks, each with a five-star rating row, a light italic
 * pull-quote, and a footer pairing a rounded avatar with the customer name and
 * role. Avatars use the alt-driven Image component. Use to build trust with
 * social proof for clothing brands, boutiques, or premium apparel labels.
 */
import { Container } from '#/section-kit/Container.tsx'
import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'
export const FashionStoreTestimonials = defineCapsule({
  name: 'FashionStoreTestimonials',
  description:
    'Dark inverted customer testimonials band for a minimalist fashion store: a foreground-colored section with a centered uppercase eyebrow + serif heading above a responsive 1-to-3 column grid of top-bordered quote blocks, each with a five-star rating row, a light italic pull-quote, and a footer pairing a rounded avatar with the customer name and role. Avatars use the alt-driven Image component. Use to build trust with social proof and client stories for clothing brands, boutiques, or premium apparel labels.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
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
    const testimonialsEyebrow = props.eyebrow ?? 'What They Say'
    const testimonialsHeading = props.heading ?? 'Client Stories'
    const testimonialItems = props.items?.length
      ? props.items
      : [
          {
            quote:
              "The quality is exceptional. I've had my linen blazer for two years and it still looks brand new. The neutral palette makes it so easy to build outfits.",
            name: 'Sarah Chen',
            role: 'Fashion Editor, Vogue Japan',
            avatarAlt:
              'Professional headshot of Sarah Chen, fashion editor at Vogue Japan',
          },
          {
            quote:
              "Finally, a brand that understands that less is more. The cashmere knit is the softest I've ever owned. Worth every penny.",
            name: 'James Morrison',
            role: 'Creative Director',
            avatarAlt:
              'Professional headshot of James Morrison, creative director',
          },
          {
            quote:
              'I love how everything coordinates. My closet is 80% NOIRE now, and I can mix and match effortlessly. The customer service is impeccable too.',
            name: 'Elena Vasquez',
            role: 'Architect',
            avatarAlt:
              'Professional headshot of Elena Vasquez, architect and design consultant',
          },
        ]
    return (
      <section
        aria-label="Customer testimonials"
        className={cn(
          'bg-foreground py-20 text-background lg:py-28',
          props.className,
        )}
      >
        <Container>
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-background/60">
              {testimonialsEyebrow}
            </p>
            <h2 className="font-serif text-4xl font-normal sm:text-5xl lg:text-6xl">
              {testimonialsHeading}
            </h2>
          </div>

          <TestimonialGrid items={testimonialItems} columns={3} />
        </Container>
      </section>
    )
  },
})
