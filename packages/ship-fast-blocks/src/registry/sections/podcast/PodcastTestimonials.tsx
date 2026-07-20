import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { z } from 'zod/v4'

import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'

function RatingStars({ rating }: { rating: number }) {
  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-0.5 font-mono text-sm leading-none"
    >
      {Array.from({ length: 5 }).map((_, k) => (
        <span key={k} className={k < rating ? 'text-primary' : 'text-border'}>
          ★
        </span>
      ))}
    </div>
  )
}

export const PodcastTestimonials = defineCapsule({
  name: 'PodcastTestimonials',
  description:
    "A 3-up listener-review wall for the Signal & Static podcast, built on TestimonialGrid, set against a giant ghost quotation watermark. Each square hard-shadowed card leads with a token star row derived from the rating, then the listener's quote, their name, and the review source (Apple Podcasts, Spotify, Overcast) as a mono label. Use it for warm, believable social proof on a podcast or audio-show site.",
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
          'relative overflow-hidden bg-background pt-24 pb-16 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Watermark className="-top-10 right-2 text-[16rem] leading-none">
          &rdquo;
        </Watermark>
        <Container className="relative">
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
                <TestimonialCard
                  key={__iv__.name}
                  className="rounded-none border-foreground/20 transition-[transform,border-color,box-shadow] duration-150 hover:-translate-y-0.5 hover:border-foreground hover:shadow-[8px_8px_0_0] hover:shadow-foreground/10 motion-reduce:transform-none"
                >
                  <RatingStars rating={__iv__.rating ?? 5} />
                  <TestimonialQuote className="text-pretty">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="border-t border-border pt-4">
                    <div className="flex w-full items-center justify-between gap-3">
                      <TestimonialName>{__iv__.name}</TestimonialName>
                      {(__iv__.role || __iv__.company || __iv__.meta) && (
                        <TestimonialMeta className="font-mono uppercase tracking-[0.14em]">
                          {__iv__.role || __iv__.company || __iv__.meta}
                        </TestimonialMeta>
                      )}
                    </div>
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
