import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * FoodDeliveryTestimonials — card-surfaced 3-up testimonials grid for a
 * food-delivery / restaurant-marketplace site. A centered heading + supporting
 * paragraph above three soft-bordered review cards, each with a 5-star row, a
 * quoted blurb, and an alt-driven circular avatar beside a name and location.
 * Use to build trust with customer (and partner) social proof for food-delivery
 * apps, restaurant aggregators, or online-ordering platforms. Renders fully with
 * no props via baked-in defaults.
 */
export const FoodDeliveryTestimonials = defineComponent({
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

    const StarIcon = () => (
      <svg
        className="size-5 fill-primary text-primary"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    )

    return (
      <section className={cn('bg-card py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {testimonialsHeading}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {testimonialsDesc}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonialItems.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-border bg-background p-8"
              >
                <div className="mb-4 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-foreground/80">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    loading="lazy"
                    className="size-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
