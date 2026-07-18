import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * FitnessTestimonials — member testimonials grid for a gym or fitness studio, on a
 * muted card-surface band. A centered heading + lead paragraph above a 3-column grid
 * of muted-surface quote cards, each with a 5-star rating row, the member quote, and
 * a footer of a round avatar + name + membership meta. Avatars use the alt-driven
 * Image component. Use for member stories / reviews / social proof on gyms, fitness
 * studios, yoga / pilates / boxing / spin studios or personal-training businesses.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
export const FitnessTestimonials = defineCapsule({
  name: 'FitnessTestimonials',
  description:
    'Member testimonials grid for a gym or fitness studio on a muted card-surface band: a centered heading and lead paragraph above a 3-column grid of muted-surface quote cards, each with a 5-star rating row, the member quote and a footer of a round avatar + name + membership meta. Avatars use the alt-driven Image component. Use for member stories, reviews or social proof on gyms, fitness studios, CrossFit boxes, yoga, pilates, boxing or spin / cycle studios and personal-training businesses.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
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
    const testimonialsHeading = props.heading ?? 'Member stories'
    const testimonialsDesc =
      props.description ??
      'Real results from real members who made Base their fitness home.'
    const testimonialItems = props.items?.length
      ? props.items
      : [
          {
            quote:
              'The trainers here actually care. Marcus helped me deadlift 300lbs after two years of back pain. The community keeps me accountable—I actually look forward to 6am classes now.',
            name: 'Jennifer Walsh',
            meta: 'Member since 2021',
            avatarAlt:
              'headshot of Jennifer Walsh a smiling woman with blonde hair member testimonial',
          },
          {
            quote:
              "I've tried every boutique studio in the city. Base is the only one that combines serious equipment, expert instruction, and zero attitude. Elena's yoga classes transformed my practice.",
            name: 'David Park',
            meta: 'Member since 2023',
            avatarAlt:
              'headshot of David Park a man with glasses and short dark hair member testimonial',
          },
          {
            quote:
              'Lost 40 pounds in 8 months working with James on boxing and strength. The 5:30am crew is my second family now. Worth every penny of the Elite membership.',
            name: 'Michelle Torres',
            meta: 'Member since 2022',
            avatarAlt:
              'headshot of Michelle Torres a smiling woman with curly brown hair member testimonial',
          },
        ]
    return (
      <section className={cn('bg-card py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold text-foreground md:text-4xl">
              {testimonialsHeading}
            </h2>
            <p className="text-muted-foreground">{testimonialsDesc}</p>
          </div>

          <TestimonialGrid columns={3}>
            {testimonialItems.map((t) => {
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
