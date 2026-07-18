import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * LawFirmTestimonials — a centered-intro, star-rated client testimonials grid on
 * the card surface. A tracked-uppercase eyebrow, serif heading and lead
 * paragraph sit above a responsive 3-up grid of bordered quote cards; each card
 * shows a five-star row, an italic quote, and an avatar + name + role footer.
 * Refined, authoritative editorial aesthetic with sharp squared corners. Avatars
 * use the alt-driven Image component. Use to surface client social proof on
 * law-firm, attorney, consulting or professional-services pages. Renders fully
 * with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
export const LawFirmTestimonials = defineCapsule({
  name: 'LawFirmTestimonials',
  description:
    'Centered-intro, star-rated client testimonials grid on the card surface: a tracked-uppercase eyebrow, serif heading and lead paragraph above a responsive 3-up grid of bordered quote cards, each showing a five-star row, an italic quote and an avatar + name + role footer. Refined, authoritative editorial aesthetic with sharp squared corners; avatars use the alt-driven Image component. Use to surface client social proof and reviews on law-firm, attorney, consulting, accounting or professional-services pages.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
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
    const eyebrow = props.eyebrow ?? 'Client Perspectives'
    const heading = props.heading ?? 'What Our Clients Say'
    const description =
      props.description ??
      "Our relationships span decades and industries. Here's what leaders of some of America's most successful companies say about working with Reinhart & Associates."
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "Margaret Chen and her team guided us through our $340 million acquisition with precision I didn't think was possible in legal practice. They anticipated issues before they arose and kept the deal on track through complex regulatory hurdles.",
            name: 'Michael Chen',
            role: 'CEO, Meridian Technologies',
            avatarAlt:
              'Professional headshot of Michael Chen, CEO of Meridian Technologies, smiling confidently in business attire',
          },
          {
            quote:
              "When we faced a bet-the-company patent dispute, Elena Vasquez didn't just defend us—she turned the tables and secured a $12 million judgment in our favor. Her courtroom presence is simply commanding.",
            name: 'Jennifer Walsh',
            role: 'CTO, Axiom Robotics',
            avatarAlt:
              'Professional headshot of Jennifer Walsh, CTO of Axiom Robotics, with thoughtful confident expression',
          },
          {
            quote:
              "Robert Thornton restructured our family's estate plan with such elegance that we eliminated $4.2 million in potential estate taxes while preserving our business for the third generation. A true master of his craft.",
            name: 'William Forsythe',
            role: 'Chairman, Forsythe Industries',
            avatarAlt:
              'Professional headshot of William Forsythe, Chairman of Forsythe Industries, distinguished older gentleman in business suit',
          },
        ]
    return (
      <section className={cn('bg-card py-24 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-20 max-w-3xl text-center">
            <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mb-6 font-serif text-3xl text-foreground lg:text-5xl">
              {heading}
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
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
