import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { StarRating } from '#/section-kit/StarRating.tsx'
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
 * OnlineCourseTestimonials — "Curriculum LMS" graduate-transcript wall for an
 * online-course page. An asymmetric header (left-aligned heading beside a mono
 * "[ NN certified ]" transcript count) sits above a staggered 1/2/3-column grid
 * of sharp hairline cards styled as completion transcripts: each card opens
 * with a hairline-divided mono header row (`log 01` index + a neutral star row
 * matching the rating), then the quoted review, and the graduate name over a
 * mono uppercase outcome-role line behind a hairline rule. Alternate cards
 * offset downward on desktop; a giant ghost "A+" watermark bleeds behind. Use
 * for social proof on e-learning, bootcamp, or academy landing pages. Renders
 * fully with no props.
 */
export const OnlineCourseTestimonials = defineCapsule({
  name: 'OnlineCourseTestimonials',
  description:
    'Curriculum-LMS graduate-transcript wall for an online-course page: an asymmetric header (left-aligned heading beside a mono "[ NN certified ]" transcript count) above a staggered 1/2/3-column grid of sharp hairline completion-transcript cards. Each card opens with a hairline-divided mono header row (`log 01` index + a neutral star row matching the rating), then the quoted review, and the graduate name over a mono uppercase outcome-role line behind a hairline rule; alternate cards offset downward on desktop over a giant ghost "A+" watermark. Use for social proof on e-learning, bootcamp, or academy landing pages.',
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
          'relative overflow-hidden bg-background pt-24 pb-16 lg:pt-28 lg:pb-24',
          props.className,
        )}
      >
        <Watermark className="right-0 top-4 font-mono text-[8rem] sm:text-[14rem]">
          A+
        </Watermark>
        <Container className="relative">
          <div className="mb-10 grid items-end gap-4 lg:mb-12 lg:grid-cols-12">
            <SectionHeading
              align="left"
              title={heading}
              className="max-w-2xl gap-0 lg:col-span-8"
              titleClassName="text-3xl font-bold tracking-tight sm:text-4xl"
            />
            <MonoTag tone="faint" className="lg:col-span-4 lg:justify-self-end">
              [ {String(items.length).padStart(2, '0')} certified ]
            </MonoTag>
          </div>
          <TestimonialGrid columns={3}>
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
                    'gap-3 rounded-none border-border bg-card p-6 transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-primary/50 motion-reduce:transform-none',
                    i % 2 === 1 && 'md:max-lg:translate-y-6',
                    i % 3 === 1 && 'lg:translate-y-8',
                  )}
                >
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <MonoTag tone="muted">
                      log {String(i + 1).padStart(2, '0')}
                    </MonoTag>
                    {typeof __iv__.rating === 'number' && (
                      <StarRating
                        rating={__iv__.rating}
                        size="sm"
                        color="foreground"
                      />
                    )}
                  </div>
                  <TestimonialQuote className="text-sm leading-relaxed">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-auto flex-col items-start gap-1 border-t border-border pt-3">
                    <TestimonialName className="text-sm font-semibold tracking-tight">
                      {__iv__.name}
                    </TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
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
