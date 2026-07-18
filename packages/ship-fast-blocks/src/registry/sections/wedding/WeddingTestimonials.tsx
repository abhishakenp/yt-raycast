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

export const WeddingTestimonials = defineCapsule({
  name: 'WeddingTestimonials',
  description:
    "Well-wishes band for a wedding site, built on the shared TestimonialGrid composite: warm notes from family and friends rendered as elegant quote cards with the sender's name and relationship to the couple. No star ratings — just heartfelt messages. Use to share blessings and congratulations on a wedding invitation or celebration page.",
  props: z.object({
    heading: z.string().optional(),
    wishes: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          relation: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const wishes = props.wishes?.length
      ? props.wishes
      : [
          {
            quote:
              "Watching you two grow together has been the greatest joy. You bring out the very best in each other, and I couldn't be happier to call him family.",
            name: 'Sophie',
            relation: "Bride's sister",
          },
          {
            quote:
              'From late-night talks in our tiny dorm to your wedding day — I always knew your heart would find someone who deserves it. Wishing you a lifetime of love.',
            name: 'Maya',
            relation: 'College roommate',
          },
          {
            quote:
              "A son could not have chosen better. You've welcomed our family with open arms and an even bigger heart. Here's to forever, with all our love.",
            name: 'Robert',
            relation: "Groom's father",
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
            heading={props.heading ?? 'Well wishes'}
            subheading={'Notes from our favorite people'}
            columns={3}
          >
            {wishes
              .map((w) => ({
                quote: w.quote,
                name: w.name,
                role: w.relation,
              }))
              .map((t) => {
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
