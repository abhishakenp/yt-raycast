import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * MusicFestivalTestimonials — a three-up starred testimonial grid for a music /
 * arts festival landing page. A centered eyebrow + heading above a row of three
 * bordered cards, each with a circular headshot avatar + name + role, a five-
 * star rating row, and a quote. Avatars use the alt-driven Image component. Use
 * for social proof on music festivals, arts festivals, concert series, or any
 * multi-day live event with returning attendees.
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
export const MusicFestivalTestimonials = defineCapsule({
  name: 'MusicFestivalTestimonials',
  description:
    'Three-up starred testimonial grid for a music / arts festival landing page: a centered eyebrow + heading above a row of three bordered cards, each with a circular headshot avatar plus name and role, a five-star rating row, and a quote in smart quotes. Avatars use the alt-driven Image component. Use for community social proof on music festivals, arts festivals, concert series, raves, or any multi-day live event with returning attendees.',
  props: z.object({
    /** Eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Testimonial cards. */
    items: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
          quote: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Community'
    const heading = props.heading ?? 'What People Say'
    const items = props.items?.length
      ? props.items
      : [
          {
            name: 'Maya Thompson',
            role: 'Festival veteran, 4 years',
            quote:
              "Horizon changed my life. The curation is impeccable — I've discovered at least five artists each year that are now in my daily rotation. The desert setting makes it magical.",
            avatarAlt:
              'Professional headshot of a smiling young woman with curly hair and natural makeup',
          },
          {
            name: 'David Chen',
            role: 'Photographer, LA',
            quote:
              "As a photographer, I've shot dozens of festivals. Horizon stands out for its attention to detail — the art installations, the lighting design, even the way the stages are positioned for golden hour. Pure visual poetry.",
            avatarAlt:
              'Professional headshot of a bearded man in his 30s with a friendly smile',
          },
          {
            name: 'Sarah Williams',
            role: 'First-timer, Portland',
            quote:
              'I was nervous about my first camping festival, but the Horizon community made me feel at home immediately. The wellness programs were a lifesaver, and I made friends for life. Already bought my 2025 ticket!',
            avatarAlt:
              'Professional headshot of a blonde woman with a warm smile and casual style',
          },
        ]
    return (
      <section className={cn('pt-28 pb-24 lg:pt-32 lg:pb-28', props.className)}>
        <Container>
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
              {eyebrow}
            </p>
            <h2 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">
              {heading}
            </h2>
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
