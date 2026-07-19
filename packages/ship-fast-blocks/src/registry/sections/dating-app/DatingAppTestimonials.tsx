import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

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

/**
 * DatingAppTestimonials — a 3-up "love stories" testimonial grid for a dating /
 * matchmaking app. A centered heading + supporting paragraph above a responsive
 * 1/2/3-column grid of soft muted cards, each with a round couple avatar beside the
 * pair's names and a "matched" date, a row of five primary stars, and an italic
 * quote. All avatars are alt-driven <Image>. Use as social proof / success stories
 * for dating apps, singles platforms, or relationship products. Renders fully with
 * no props via baked-in couple-story defaults.
 */
export const DatingAppTestimonials = defineCapsule({
  name: 'DatingAppTestimonials',
  description:
    "3-up 'love stories' testimonial grid for a dating / matchmaking app: a centered heading + supporting paragraph above a responsive 1/2/3-column grid of soft muted cards, each with a round couple avatar beside the pair's names and a 'matched' date, a row of five primary stars, and an italic quote. Avatars are alt-driven <Image>. Use as social proof / success stories for dating apps, singles platforms, or relationship products.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          names: z.string(),
          meta: z.string(),
          quote: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const testimonialsHeading =
      props.heading ?? 'Love stories that started here'
    const testimonialsDesc =
      props.description ?? 'Real couples who found each other on HeartLink.'
    const testimonialItems = props.items?.length
      ? props.items
      : [
          {
            names: 'Jessica & Marcus',
            meta: 'Matched March 2024',
            quote:
              "The compatibility quiz actually worked! We discovered we both love hiking and craft beer before we even met. First date was at a brewery—now we're planning our wedding there.",
            avatarAlt:
              'happy couple portrait of Jessica and Marcus smiling together',
          },
          {
            names: 'David & Priya',
            meta: 'Matched January 2024',
            quote:
              "I was skeptical about dating apps until HeartLink. The video date feature let us connect before meeting. Six months later, we're moving in together!",
            avatarAlt: 'happy couple portrait of David and Priya at a park',
          },
          {
            names: 'Michael & Elena',
            meta: 'Matched November 2023',
            quote:
              "We met at a HeartLink singles mixer in Austin. The app made me feel safe enough to try meeting in person, and I'm so glad I did. Best decision ever!",
            avatarAlt:
              'happy couple portrait of Michael and Elena embracing outdoors',
          },
        ]

    return (
      <section className={cn('bg-background py-24', props.className)}>
        <Container>
          <SectionHeading
            title={testimonialsHeading}
            subtitle={testimonialsDesc}
            className="mb-16 max-w-3xl gap-0"
            titleClassName="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <TestimonialGrid columns={3}>
            {testimonialItems
              .map((t) => ({
                quote: t.quote,
                name: t.names,
                role: t.meta,
                avatarAlt: t.avatarAlt,
              }))
              .map((t) => {
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
