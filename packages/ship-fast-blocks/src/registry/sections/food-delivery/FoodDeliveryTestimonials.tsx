import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * FoodDeliveryTestimonials — card-surfaced 3-up testimonials grid for a
 * food-delivery / restaurant-marketplace site. A centered heading + supporting
 * paragraph above three soft-bordered review cards, each with a 5-star row, a
 * quoted blurb, and an alt-driven circular avatar beside a name and location.
 * Use to build trust with customer (and partner) social proof for food-delivery
 * apps, restaurant aggregators, or online-ordering platforms. Renders fully with
 * no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'
export const FoodDeliveryTestimonials = defineCapsule({
  name: 'FoodDeliveryTestimonials',
  description:
    'Card-surfaced 3-up testimonials grid for a food-delivery / restaurant-marketplace site: a centered heading + supporting paragraph above three soft-bordered review cards, each with a 5-star row, a quoted blurb, and an alt-driven circular avatar beside a name and location. Use to build trust with customer and partner social proof for food-delivery apps, restaurant aggregators, online-ordering platforms, or takeout services.',
  props: z.object({
    /** Centered section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Review cards (quote + name + location + avatarAlt). */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          location: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const testimonialsHeading = props.heading ?? 'What people are saying'
    const testimonialsDesc =
      props.description ??
      'Real reviews from real customers across the country.'
    const testimonialItems = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Nosh has completely changed how I order food. The tracking feature is incredible, and I have never had a late delivery. The app is so easy to use!',
            name: 'Sarah Mitchell',
            location: 'San Francisco, CA',
            avatarAlt:
              'Professional headshot of a smiling young woman with shoulder-length brown hair',
          },
          {
            quote:
              'As a restaurant owner, partnering with Nosh increased our delivery orders by 40%. Their driver network is reliable and the commission rates are fair.',
            name: 'Marcus Chen',
            location: 'Owner, Sakura Sushi',
            avatarAlt:
              'Professional headshot of a smiling man in his 40s with short dark hair and glasses',
          },
          {
            quote:
              'I use Nosh 3-4 times a week. The saved favorites feature makes reordering my usual lunch from work incredibly fast. Highly recommended!',
            name: 'David Rodriguez',
            location: 'Austin, TX',
            avatarAlt:
              'Professional headshot of a smiling middle-aged man with beard and casual attire',
          },
        ]
    return (
      <section
        className={cn('bg-card pt-28 pb-20 lg:pt-32 lg:pb-28', props.className)}
      >
        <Container>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {testimonialsHeading}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {testimonialsDesc}
            </p>
          </div>
          <TestimonialGrid items={testimonialItems} columns={3} />
        </Container>
      </section>
    )
  },
})
