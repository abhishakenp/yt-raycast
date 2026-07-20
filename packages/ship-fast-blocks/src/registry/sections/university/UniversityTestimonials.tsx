import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { cn } from '#/lib/utils.ts'

export const UniversityTestimonials = defineCapsule({
  name: 'UniversityTestimonials',
  description:
    'Editorial-academic student and alumni voices band for the University page family. A left-aligned mono eyebrow + serif heading + lede sits above the shared TestimonialGrid kit composite, mapping a public reviews prop (quote, name, class-year role, rating) into square hairline cards. Each card leads with a giant serif quotation mark, carries a serif pull-quote, and closes with a mono class-year source label; cards stagger vertically for an editorial rhythm. Use to build trust through authentic graduate and current-student perspectives on a university homepage.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string().optional(),
          rating: z.number().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Voices from our community'
    const subheading =
      props.subheading ??
      'Students and alumni on what a Whitmore education made possible.'
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              'The faculty treated me like a colleague from my first seminar. I co-authored a published paper as a sophomore — that opportunity changed my entire trajectory.',
            name: 'Maya Ellison',
            role: 'Class of 2023, Biology',
            rating: 5,
          },
          {
            quote:
              "Whitmore's alumni network opened every door I knocked on. The community here is fierce, generous, and lifelong.",
            name: 'Daniel Okafor',
            role: 'Class of 2019, Economics',
            rating: 5,
          },
          {
            quote:
              'I came for the academics and stayed for the people. Late nights in the library and lifelong friendships defined my four years.',
            name: 'Priya Nair',
            role: 'Class of 2024, Computer Science',
            rating: 5,
          },
        ]

    const items = reviews.map((r) => ({
      quote: r.quote,
      name: r.name,
      role: r.role,
      rating: r.rating ?? 5,
    }))

    return (
      <section className="bg-muted/30 pt-28 pb-20 text-foreground sm:pt-32 sm:pb-24">
        <Container size="xl" className="px-6">
          <div className="mb-14 max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
              Testimonials
            </p>
            <h2 className="mt-3 text-balance font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {heading}
            </h2>
            <p className="mt-4 text-pretty leading-7 text-muted-foreground">
              {subheading}
            </p>
          </div>
          <TestimonialGrid columns={3} className={props.className}>
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
                    'gap-5 rounded-none border-border bg-card p-7 transition-colors duration-150 hover:border-foreground/30',
                    i % 2 === 1 ? 'lg:translate-y-8' : '',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="font-serif text-5xl leading-none text-primary/40"
                  >
                    &ldquo;
                  </span>
                  <TestimonialQuote className="font-serif text-lg leading-relaxed text-foreground">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-auto flex-col items-start gap-1 border-t border-border pt-4">
                    <TestimonialName>{__iv__.name}</TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="font-mono text-[10px] uppercase tracking-[0.16em]">
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
