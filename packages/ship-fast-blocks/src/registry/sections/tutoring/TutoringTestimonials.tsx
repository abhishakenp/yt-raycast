import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

const DEFAULT_REVIEWS: {
  quote: string
  name: string
  role?: string
  rating?: number
}[] = [
  {
    quote:
      'My daughter went from dreading math to actually looking forward to her sessions. Her tutor is so patient and kind — her grade jumped a full letter in one term.',
    name: 'Maria Alvarez',
    role: 'Parent of 10th grader',
    rating: 5,
  },
  {
    quote:
      'I was nervous about the SAT, but my tutor broke everything down and made practice feel doable. My score went up 180 points and I got into my first-choice school.',
    name: 'Devon Carter',
    role: 'Student, Grade 11',
    rating: 5,
  },
  {
    quote:
      "Booking was easy, the tutor was background-checked, and we got a friendly summary after every session. It's the first thing that's actually worked for my son.",
    name: 'James Whitfield',
    role: 'Parent',
    rating: 5,
  },
]

export const TutoringTestimonials = defineCapsule({
  name: 'TutoringTestimonials',
  description:
    "Editorial-academic social-proof band for tutoring sites, composing the TestimonialGrid kit composite into staggered hairline quote plates beneath an asymmetric mono-eyebrow header (with a giant serif ghost quotation-mark watermark and a mono review count). Each sharp-cornered plate carries a mono review index, a small primary star rating, a warm serif quote about real progress, and a hairline-topped footer with the reviewer's name and role (e.g. 'Parent of 10th grader', 'Student, Grade 11') in mono labels. Accepts a public `reviews` prop to override the quotes. Use it to build trust and reassure hesitant families before they book.",
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
    columns: z.union([z.literal(2), z.literal(3)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Families love learning with us'
    const subheading =
      props.subheading ??
      "Real words from the parents and students we've helped grow."
    const reviews = props.reviews?.length ? props.reviews : DEFAULT_REVIEWS

    const items = reviews.map((r) => ({
      quote: r.quote,
      name: r.name,
      role: r.role,
      rating: r.rating ?? 5,
    }))

    return (
      <section
        className={
          'relative overflow-hidden bg-muted/30 py-20 sm:py-24' +
          (props.className ? ' ' + props.className : '')
        }
      >
        <Watermark
          aria-hidden="true"
          className="-right-2 top-4 font-serif text-[12rem] leading-none sm:text-[20rem]"
        >
          &rdquo;
        </Watermark>
        <Container size="xl" className="relative px-6">
          <div className="mb-12 flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block" tone="primary">
                Reviews
              </MonoTag>
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                {subheading}
              </p>
            </div>
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              {String(items.length).padStart(2, '0')} testimonies
            </span>
          </div>
          <TestimonialGrid columns={props.columns ?? 3}>
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
              const stars = Math.max(
                0,
                Math.min(5, Math.round(__iv__.rating ?? 5)),
              )
              return (
                <TestimonialCard
                  key={__iv__.name}
                  className={cn(
                    'gap-5 rounded-none border-border bg-card p-6 shadow-none transition-[border-color,transform] duration-150 hover:border-foreground/40 sm:p-8',
                    i % 2 === 1 ? 'lg:translate-y-8' : undefined,
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      aria-hidden="true"
                      className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
                    >
                      {String(i + 1).padStart(2, '0')} / review
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-sm tracking-[0.15em] text-primary"
                    >
                      {'★'.repeat(stars)}
                    </span>
                  </div>
                  <TestimonialQuote className="font-serif text-lg leading-relaxed text-foreground">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-auto flex-col items-start gap-1 border-t border-border pt-4">
                    <TestimonialName className="text-base font-semibold tracking-tight">
                      {__iv__.name}
                    </TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.14em]">
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
