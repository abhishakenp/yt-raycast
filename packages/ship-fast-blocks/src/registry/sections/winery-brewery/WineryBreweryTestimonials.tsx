import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'

/**
 * WineryBreweryTestimonials — dark, inverted visitor-review band for a winery
 * or brewery page. The page's one full ink inversion (bg-foreground /
 * text-background) cuts in on a slanted clip-path seam, over a giant faint
 * serif quotation-mark watermark. A left-aligned mono meta rail + serif heading
 * sit above a staggered grid of square-edged ghost cards, each holding a serif
 * quoted review and an attribution row pairing the visitor name with the review
 * source (Google, Tripadvisor, Wine Club). The public `reviews` prop ({quote,
 * name, rating, source}) maps to the composite's items, with `source` shown as
 * the card's meta line via `company`. Use for social-proof on wineries,
 * vineyards, cellar doors, breweries, taprooms, or cideries. Renders fully with
 * no props via baked defaults.
 */
export const WineryBreweryTestimonials = defineCapsule({
  name: 'WineryBreweryTestimonials',
  description:
    "Dark, inverted visitor-review band for a winery or brewery page: the page's one full ink inversion (bg-foreground / text-background) on a slanted clip-path seam, over a giant faint serif quotation-mark watermark. A left-aligned mono meta rail + serif heading above a staggered grid of square-edged ghost cards, each with a serif quoted review and an attribution row pairing the visitor name with the review source (Google, Tripadvisor, Wine Club). Use for social-proof on wineries, vineyards, cellar doors, breweries, taprooms, or cideries.",
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
          // Full ink inversion on a slanted clip-path seam (neighbor-independent).
          'relative overflow-hidden bg-foreground py-16 pt-24 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-28 lg:pt-36',
          props.className,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 right-4 select-none font-serif text-[16rem] italic leading-none text-background/[0.06] sm:text-[22rem] lg:-top-24 lg:text-[30rem]"
        >
          &rdquo;
        </span>

        <Container className="relative">
          <div className="mb-8 flex items-center gap-4">
            <span aria-hidden="true" className="size-1.5 shrink-0 bg-primary" />
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-background/60">
              In their words
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-background/20" />
          </div>

          <SectionHeading
            align="left"
            title={heading}
            titleClassName="font-serif text-3xl font-medium tracking-tight text-background sm:text-4xl lg:text-5xl"
            className="mb-14 max-w-2xl"
          />

          <TestimonialGrid>
            {items.map((t, i) => {
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
                  className={cn(
                    'rounded-none border-background/20 bg-background/[0.04] text-background transition-colors duration-150 hover:border-background/40',
                    i === 1 && 'lg:translate-y-8',
                  )}
                >
                  <TestimonialQuote className="font-serif text-lg italic leading-relaxed text-background/90">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="border-t border-background/15 pt-4">
                    <div className="flex flex-col">
                      <TestimonialName className="text-background">
                        {__iv__.name}
                      </TestimonialName>
                      {(__iv__.role || __iv__.company || __iv__.meta) && (
                        <TestimonialMeta className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-background/55">
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
