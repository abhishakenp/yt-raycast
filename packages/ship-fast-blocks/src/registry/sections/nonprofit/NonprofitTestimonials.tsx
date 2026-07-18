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

/**
 * NonprofitTestimonials — impact-stories wall for a nonprofit / charity / NGO
 * page. Thin configuration over the shared `TestimonialGrid` composite: a
 * centered heading above a responsive card grid where each card renders a
 * heartfelt quote, an avatar, and an attribution line pairing a name with the
 * person's relationship to the cause (beneficiary, donor, volunteer). The
 * public `stories` prop ({quote, name, role}) maps to the composite's items.
 * Use for social proof and emotional resonance on nonprofit, foundation, or
 * humanitarian pages. Renders fully with no props via baked-in "Roots of Hope"
 * defaults.
 */
export const NonprofitTestimonials = defineCapsule({
  name: 'NonprofitTestimonials',
  description:
    "Impact-stories wall for a nonprofit / charity / NGO page built on the shared TestimonialGrid composite: a centered heading above a responsive card grid where each card renders a heartfelt quote, an avatar, and an attribution line pairing a name with the person's relationship to the cause (beneficiary, donor, volunteer). The public `stories` prop maps to the composite items. Use for social proof and emotional resonance on nonprofit, foundation, or humanitarian pages.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Impact stories: quote, name, and the person's role / relationship. */
    stories: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Stories of hope'
    const stories = props.stories?.length
      ? props.stories
      : [
          {
            quote:
              "Before the well, I walked three hours each day for water. Now my daughters spend that time in school. This program didn't just give us water — it gave them a future.",
            name: 'Amara Okoye',
            role: 'Program participant',
          },
          {
            quote:
              "I've given to a lot of causes, but here I actually see where my money goes. The updates, the photos, the lives changed — it's the most meaningful thing I do all year.",
            name: 'David Chen',
            role: 'Monthly donor',
          },
          {
            quote:
              "Volunteering on the ground changed me. Watching a community rebuild with dignity, not handouts, showed me what real hope looks like. I'll keep coming back as long as they'll have me.",
            name: 'Sofia Martínez',
            role: 'Field volunteer',
          },
        ]

    const items = stories.map((s) => ({
      quote: s.quote,
      name: s.name,
      role: s.role,
    }))

    return (
      <section className="pt-28 pb-20 lg:pt-32 lg:pb-28">
        <Container>
          <TestimonialGrid heading={heading} className={props.className}>
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
