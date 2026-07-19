import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * KidsEducationTestimonials — parent & teacher testimonial grid for a kids /
 * family learning platform. A centered eyebrow + heading + description intro on a
 * muted band above a responsive 3-up grid of rounded white quote cards; each card
 * has a 5-star rating row, a quote, and a headshot avatar with name + role. Use
 * as social proof for kids-education startups, children's e-learning platforms,
 * tutoring services, and family learning apps. Renders fully with no props via
 * baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
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
    "Parent & teacher testimonial grid for a kids / family learning platform: a centered eyebrow + heading + description intro on a muted band above a responsive 3-up grid of rounded white quote cards; each card has a 5-star rating row, a quote, and a headshot avatar with name + role. Use as social proof for kids-education startups, children's e-learning platforms, tutoring services, and family learning apps.",
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
      <section className={cn('bg-muted/40 py-24', props.className)}>
        <Container>
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={description}
            className="mb-16 max-w-3xl gap-0"
            eyebrowClassName="mb-3 inline-block text-sm font-semibold tracking-wider text-secondary"
            titleClassName="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl"
            subtitleClassName="text-lg text-muted-foreground"
          />

          <TestimonialGrid columns={3}>
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
