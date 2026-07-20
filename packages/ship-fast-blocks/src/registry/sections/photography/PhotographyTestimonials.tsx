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
import { Watermark, MonoTag } from '#/section-kit/Decor.tsx'

/**
 * PhotographyTestimonials — inverted, dark-editorial client-quote band for a
 * fine-art / wedding photographer site. A single `bg-foreground text-background`
 * inversion sliced by a slanted clip-path seam, over a giant faint quotation
 * watermark: an asymmetric header (mono eyebrow + serif heading) sits above a
 * staggered 3-up grid built on the shared `TestimonialGrid` composite. Each
 * square-cornered hairline card opens with an oversized serif quotation mark,
 * carries the quoted testimonial, and closes with the couple / client name
 * paired with their event as a mono source label (wedding, elopement,
 * portrait). The public `reviews` prop ({quote, name, rating, event}) maps to
 * the composite's items, with `event` shown as the mono meta line via
 * `company`. Tokens-only, so the dark band flips cleanly between themes. Use for
 * social proof on photographers, studios, and elopement shooters. Renders fully
 * with no props via baked-in defaults.
 */
export const PhotographyTestimonials = defineCapsule({
  name: 'PhotographyTestimonials',
  description:
    'Inverted, dark-editorial client-quote band for a fine-art / wedding photographer site built on the shared TestimonialGrid composite: a bg-foreground/text-background inversion sliced by a slanted clip-path seam over a giant faint quotation watermark, with an asymmetric mono-eyebrow + serif header above a staggered 3-up grid of square-cornered hairline cards. Each card opens with an oversized serif quotation mark, carries the quoted testimonial, and closes with the couple / client name paired with their event as a mono source label. Tokens-only and theme-adaptive. Use for social proof on photographers, studios, and elopement shooters.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Client reviews: quote, name, rating, event. */
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          rating: z.number(),
          event: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Loved by the couples we work with'
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              "Elena felt like a friend from the first call. She captured the quiet, in-between moments we didn't even notice — our gallery still makes us cry happy tears.",
            name: 'Sofia & James',
            rating: 5,
            event: 'Tuscany Wedding',
          },
          {
            quote:
              'We eloped in the mountains and trusted her completely. The photos are raw, emotional, and exactly us. Worth every single mile of travel.',
            name: 'Maya & Theo',
            rating: 5,
            event: 'Dolomites Elopement',
          },
          {
            quote:
              "Our family portraits are the most natural we've ever had. The kids actually had fun, and the editing is timeless — no trendy filters, just us.",
            name: 'The Bennett Family',
            rating: 5,
            event: 'Portrait Session',
          },
        ]

    const items = reviews.map((r) => ({
      quote: r.quote,
      name: r.name,
      rating: r.rating,
      company: r.event,
    }))

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground pt-24 pb-20 text-background [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Watermark className="-right-6 -top-4 text-[18rem] leading-none text-background/[0.05] lg:text-[24rem]">
          &rdquo;
        </Watermark>
        <Container className="relative">
          {/* Asymmetric header on the inverted band. */}
          <div className="mb-12 flex flex-col gap-4 lg:mb-16">
            <MonoTag tone="inverted">Testimonials · Field Notes</MonoTag>
            <h2 className="max-w-2xl text-balance font-serif text-3xl font-medium leading-[1.08] tracking-tight text-background md:text-4xl lg:text-5xl">
              {heading}
            </h2>
          </div>
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
                    'gap-5 rounded-none border-background/15 bg-transparent transition-[border-color] duration-150 hover:border-background/40',
                    i % 2 === 1 ? 'md:mt-10' : undefined,
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="font-serif text-5xl leading-none text-background/30"
                  >
                    &ldquo;
                  </span>
                  <TestimonialQuote className="text-background/90">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-auto flex-col items-start gap-1 border-t border-background/15 pt-4">
                    <TestimonialName className="text-background">
                      {__iv__.name}
                    </TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.18em] text-background/60">
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
