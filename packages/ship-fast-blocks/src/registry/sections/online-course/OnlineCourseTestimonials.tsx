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
 * OnlineCourseTestimonials — a 3-up graduate-review wall for an online-course
 * page. Thin configuration over the shared TestimonialGrid composite: a
 * centered heading above a responsive card grid where each card renders a star
 * row from the rating, the quoted review, and a graduate name paired with their
 * outcome role. The public `reviews` prop ({quote, name, role, rating}) maps to
 * the composite's items, with `role` shown as the card's meta line. Use for
 * social proof on e-learning, bootcamp, or academy landing pages. Renders fully
 * with no props.
 */
export const OnlineCourseTestimonials = defineCapsule({
  name: 'OnlineCourseTestimonials',
  description:
    'A 3-up graduate-review wall for an online-course page built on the shared TestimonialGrid composite: a centered heading above a responsive card grid where each card renders a filled star row matching the rating, a quoted review, and a graduate name paired with their outcome role. Use for social proof on e-learning, bootcamp, or academy landing pages.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Graduate reviews: quote, name, role, rating. */
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string(),
          rating: z.number(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Graduates who shipped'
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              'I went from copy-pasting tutorials to building my own app from scratch. The hands-on projects made everything click, and I landed a frontend role two months after finishing.',
            name: 'Priya Nair',
            role: 'Graduate · Frontend Developer',
            rating: 5,
          },
          {
            quote:
              "The pacing is perfect for working full-time. Bite-sized lessons, real assignments, and a community that actually answers questions. Best learning investment I've made.",
            name: 'Marcus Bell',
            role: 'Graduate · Self-taught Engineer',
            rating: 5,
          },
          {
            quote:
              'The certificate gave my résumé instant credibility, but the skills are what got me hired. I reference the downloadable resources at work almost every week.',
            name: 'Lena Petrova',
            role: 'Graduate · Product Engineer',
            rating: 4,
          },
        ]

    const items = reviews.map((r) => ({
      quote: r.quote,
      name: r.name,
      role: r.role,
      rating: r.rating,
    }))

    return (
      <section
        className={cn(
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <TestimonialGrid heading={heading}>
            {items.map((t) => {
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
