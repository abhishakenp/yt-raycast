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

export const PodcastTestimonials = defineCapsule({
  name: 'PodcastTestimonials',
  description:
    "A 3-up listener-review wall for the Signal & Static podcast, built on TestimonialGrid. Each card renders a star row derived from the rating, the listener's quote, their name, and the review source (Apple Podcasts, Spotify, Overcast). Use it for warm, believable social proof on a podcast or audio-show site.",
  props: z.object({
    heading: z.string().optional(),
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          rating: z.number(),
          source: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'What listeners say'
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              'I started this show for the interviews and stayed for the sound. Every episode feels like someone made it just for my commute.',
            name: 'Mara Ellison',
            rating: 5,
            source: 'Apple Podcasts',
          },
          {
            quote:
              "The mix is so warm I can tell it apart from anything else in my feed. It's the rare show I rewind just to hear a moment again.",
            name: 'Devin Okafor',
            rating: 5,
            source: 'Spotify',
          },
          {
            quote:
              'Signal & Static treats audio like a craft, and it shows in every cut. Thoughtful, honest, and genuinely lovely to listen to.',
            name: 'Priya Nandakumar',
            rating: 4,
            source: 'Overcast',
          },
        ]
    const items = reviews.map((r) => ({
      quote: r.quote,
      name: r.name,
      rating: r.rating,
      company: r.source,
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
