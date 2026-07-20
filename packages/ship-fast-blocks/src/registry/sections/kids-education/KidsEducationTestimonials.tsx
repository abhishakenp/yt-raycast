import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * KidsEducationTestimonials — parent & teacher testimonial grid for a kids /
 * family learning platform, in the playful-primary language. On a muted band
 * under a giant ghost quotation watermark: an asymmetric mono-labeled header
 * (eyebrow + heading left, index meta right) above a staggered 3-up grid of
 * chunky sharp-cornered 2px-bordered quote cards; each card carries an oversized
 * ghost quote mark, the quote, and a bold name with a mono role label, lifting
 * on a hard offset token shadow on hover. Use as social proof for kids-education
 * startups, children's e-learning platforms, tutoring services, and family
 * learning apps. Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
export const KidsEducationTestimonials = defineCapsule({
  name: 'KidsEducationTestimonials',
  description:
    "Parent & teacher testimonial grid for a kids / family learning platform in the playful-primary language: on a muted band under a giant ghost quotation watermark, an asymmetric mono-labeled header (eyebrow + heading left, index meta right) above a staggered 3-up grid of chunky sharp-cornered 2px-bordered quote cards, each with an oversized ghost quote mark, the quote, and a bold name with a mono role label, lifting on a hard offset token shadow on hover. Use as social proof for kids-education startups, children's e-learning platforms, tutoring services, and family learning apps.",
  props: z.object({
    /** Uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Testimonial cards. */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Testimonials'
    const heading = props.heading ?? 'Loved by Families'
    const description =
      props.description ??
      'See what parents and teachers are saying about their WonderLearn experience.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "WonderLearn has completely transformed our afternoon routine. My daughter used to beg for screen time, now she begs for 'learning time.' The science experiments are her absolute favorite!",
            name: 'Sarah Mitchell',
            role: 'Mother of two, Austin TX',
            avatarAlt:
              'Professional headshot of Sarah Mitchell, a smiling mother of two',
          },
          {
            quote:
              "As a 2nd grade teacher, I've tried many platforms. WonderLearn is the first one that truly engages every student. The progress reports help me identify who needs extra support in specific areas.",
            name: 'David Chen',
            role: '2nd Grade Teacher, Seattle WA',
            avatarAlt:
              'Professional headshot of David Chen, an elementary school teacher',
          },
          {
            quote:
              'My twins are 6 and have very different interests—one loves art, the other math. WonderLearn somehow engages both of them equally. The progress they made in 3 months is incredible!',
            name: 'Maria Gonzalez',
            role: 'Parent of twins, Chicago IL',
            avatarAlt:
              'Professional headshot of Maria Gonzalez, a mother of twins',
          },
        ]
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted/40 py-20 lg:py-24',
          props.className,
        )}
      >
        <Watermark className="-left-4 top-4 text-[9rem] leading-none sm:text-[13rem] lg:text-[17rem]">
          &ldquo;
        </Watermark>
        <Container className="relative">
          <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-0"
              eyebrowClassName="mb-3 inline-block font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mb-5 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              subtitleClassName="text-lg text-muted-foreground"
            />
            <MonoTag
              aria-hidden="true"
              className="shrink-0 text-muted-foreground/60"
            >
              [ 05 ] loved by families
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
                    'relative gap-5 rounded-none border-2 border-foreground bg-card p-6 shadow-[5px_5px_0_0] shadow-transparent transition-[transform,box-shadow] duration-150 hover:-translate-y-1 hover:border-foreground hover:shadow-foreground motion-reduce:transform-none',
                    i % 3 === 1 && 'lg:mt-10',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="font-mono text-5xl font-extrabold leading-none text-primary/25"
                  >
                    &ldquo;
                  </span>
                  <TestimonialQuote className="text-base leading-relaxed text-foreground">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-auto flex-col items-start gap-1 border-t-2 border-border pt-4">
                    <TestimonialName className="text-sm font-extrabold uppercase tracking-tight text-foreground">
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
