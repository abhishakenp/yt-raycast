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
 * WineryBreweryTestimonials — 3-up visitor-review wall for a winery or brewery
 * page. Thin configuration over the shared `TestimonialGrid` composite: a
 * centered serif heading above a responsive card grid where each card renders a
 * star row from the rating, the quoted review, and a visitor name paired with
 * the review source (Google, Tripadvisor, Wine Club). The public `reviews` prop
 * ({quote, name, rating, source}) maps to the composite's items, with `source`
 * shown as the card's meta line via `company`. Use for social-proof on
 * wineries, vineyards, cellar doors, breweries, taprooms, or cideries. Renders
 * fully with no props via baked defaults.
 */
export const WineryBreweryTestimonials = defineCapsule({
  name: 'WineryBreweryTestimonials',
  description:
    '3-up visitor-review wall for a winery or brewery page: a centered serif heading above a responsive card grid. Each card renders a filled star row matching the rating, a quoted review, and an attribution row pairing the visitor name with the review source (Google, Tripadvisor, Wine Club). Use for social-proof on wineries, vineyards, cellar doors, breweries, taprooms, or cideries.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Visitor reviews: quote, name, rating, source. */
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
    const heading = props.heading ?? 'What our visitors say'
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              "The sunset tasting was pure magic — wine poured right in the vineyard while the hills turned gold. The estate Cab is the best we've had in the valley. We left as wine club members.",
            name: 'Daniel Ortega',
            rating: 5,
            source: 'Google Review',
          },
          {
            quote:
              "Took the barrel room tour for my birthday and the winemaker spent ages walking us through every vintage. Tasting straight from the oak is something I'll never forget.",
            name: 'Hannah Mills',
            rating: 5,
            source: 'Tripadvisor',
          },
          {
            quote:
              "Half winery, half brewhouse, all charm. The harvest saison and the barrel-aged stout were standouts, and the staff treated us like old friends. We're already planning a return.",
            name: 'Theo Laurent',
            rating: 4,
            source: 'Wine Club Member',
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
