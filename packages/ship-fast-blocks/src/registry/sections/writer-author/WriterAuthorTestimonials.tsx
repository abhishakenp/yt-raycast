import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark, MonoTag } from '#/section-kit/Decor.tsx'
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
 * WriterAuthorTestimonials — literary-editorial critical-praise wall for an
 * author page. A mono manuscript rail and a serif heading sit over a giant
 * ghost serif quotation-mark watermark, above a staggered grid of rounded-none
 * praise cards. Each card renders a large serif pull-quote blurb over the
 * critic's serif name and a mono uppercase publication line ("— THE NEW YORK
 * TIMES"). The public `reviews` prop ({quote, name, company, rating}) maps to
 * the composite's items, with the publication shown as the card's meta line via
 * `company`. Use for social-proof and review pull-quotes on novelist, poet,
 * essayist, or memoirist sites. Renders fully with no props via baked critic
 * blurbs from The New York Times, The Guardian, and Booklist.
 */
export const WriterAuthorTestimonials = defineCapsule({
  name: 'WriterAuthorTestimonials',
  description:
    "Literary-editorial critical-praise wall for an author page: a mono manuscript rail and a serif heading over a giant ghost serif quotation-mark watermark, above a staggered grid of rounded-none praise cards. Each card renders a large serif pull-quote blurb over the critic's serif name and a mono uppercase publication line (The New York Times, The Guardian, Booklist). Use for review pull-quotes and social-proof on novelist, poet, essayist, or memoirist sites.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Section subheading shown beneath the heading. */
    subheading: z.string().optional(),
    /** Critic reviews: quote, name, company (publication), rating. */
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          company: z.string(),
          rating: z.number().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Praise'
    const subheading = props.subheading ?? 'What critics say'
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              'Vance writes sentences you want to read aloud. This is a novel of rare grace — patient, luminous, and quietly devastating. A landmark in contemporary fiction.',
            name: 'Margaret Holloway',
            company: 'The New York Times',
            rating: 5,
          },
          {
            quote:
              'A spellbinding storyteller at the height of her powers. Every chapter turns on a perfectly observed detail, and the ending lingers for days. Unmissable.',
            name: 'Daniel Okafor',
            company: 'The Guardian',
            rating: 5,
          },
          {
            quote:
              "Richly imagined and beautifully told, Vance's latest confirms her place among the finest novelists working today. Hand this to every reader you know.",
            name: 'Susan Whitfield',
            company: 'Booklist',
            rating: 5,
          },
        ]

    const items = reviews.map((r) => ({
      quote: r.quote,
      name: r.name,
      company: r.company,
      rating: r.rating ?? 5,
    }))

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Watermark className="-top-16 right-4 font-serif text-[16rem] leading-none text-primary/[0.06] sm:text-[24rem] lg:text-[30rem]">
          &ldquo;
        </Watermark>

        <Container>
          <div className="relative flex items-center gap-4">
            <MonoTag tone="primary">{heading}</MonoTag>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <MonoTag aria-hidden="true" tone="faint">
              Reviews
            </MonoTag>
          </div>
          <h2 className="relative mt-6 max-w-2xl font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
            {subheading}
          </h2>

          <TestimonialGrid columns={3} className="relative mt-12 gap-0">
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
                    'gap-6 rounded-none border-2 border-foreground/15 bg-card p-7 hover:border-foreground/30',
                    i % 2 === 1 && 'lg:translate-y-8',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="font-serif text-4xl leading-none text-primary/40"
                  >
                    &ldquo;
                  </span>
                  <TestimonialQuote className="font-serif text-lg leading-relaxed text-foreground">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-auto flex-col items-start gap-1 border-t border-border pt-4">
                    <TestimonialName className="font-serif text-base font-normal text-foreground">
                      {__iv__.name}
                    </TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        &mdash; {__iv__.role || __iv__.company || __iv__.meta}
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
