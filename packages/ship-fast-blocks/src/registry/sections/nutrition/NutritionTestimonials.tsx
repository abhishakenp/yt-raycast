import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'

/**
 * NutritionTestimonials — client transformation reviews for a nutrition-coaching
 * or wellness site, built on the shared TestimonialGrid kit composite. Renders
 * an optional heading + subheading above three star-rated review cards, each
 * with a results-focused quote, client name, a result role (e.g. "Lost 30 lbs"),
 * and an avatar. The public `reviews` prop maps to the kit's items; all props
 * are optional with baked defaults so it renders standalone. Use as social proof
 * on nutrition coaches, dietitians, meal-plan subscriptions, diet / wellness
 * programs or healthy-eating apps.
 */
export const NutritionTestimonials = defineCapsule({
  name: 'NutritionTestimonials',
  description:
    "Client transformation reviews for a nutrition-coaching or wellness site, built on the shared TestimonialGrid kit composite: an optional heading + subheading above three star-rated review cards, each with a results-focused quote, client name, a result role (e.g. 'Lost 30 lbs'), and an avatar. Use as social proof on nutrition coaches, registered dietitians, meal-plan subscriptions, diet / wellness programs or healthy-eating apps to show real before-and-after outcomes.",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    /** Client reviews mapped to the testimonial grid items. */
    reviews: z
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
    const heading = props.heading ?? 'Real food, real results'
    const subheading =
      props.subheading ??
      'Thousands of clients have rebuilt their relationship with food—and the scale, energy, and confidence to prove it.'
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              'I finally stopped dieting and started eating. My coach built a plan around the food I actually love, and the weight came off without ever feeling deprived.',
            name: 'Maya Thompson',
            role: 'Lost 30 lbs',
            rating: 5,
            avatarAlt:
              'smiling woman with curly brown hair in athletic wear outdoors',
          },
          {
            quote:
              "The macro coaching changed everything for my training. I'm leaner, my lifts went up, and I actually understand how to fuel my body now.",
            name: 'Daniel Reyes',
            role: 'Down 4% body fat',
            rating: 5,
            avatarAlt: 'fit man with short dark hair smiling after a workout',
          },
          {
            quote:
              "After two kids I had zero energy. Six months in I'm cooking fresh meals my whole family loves and I feel like myself again.",
            name: 'Priya Nair',
            role: 'More energy, every day',
            rating: 5,
            avatarAlt: 'happy woman with long dark hair in a bright kitchen',
          },
        ]

    return (
      <section
        className={cn(
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <TestimonialGrid
            heading={heading}
            subheading={subheading}
            columns={3}
          >
            {reviews.map((t) => {
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
                <TestimonialCard key={__iv__.name}>
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
        </Container>
      </section>
    )
  },
})
