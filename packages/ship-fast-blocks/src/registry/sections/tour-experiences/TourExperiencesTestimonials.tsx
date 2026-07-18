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

/**
 * TourExperiencesTestimonials — traveler-review wall for an adventure /
 * guided-tour brand. Composes the shared TestimonialGrid composite as three
 * five-star reviews from past travelers, each with a vivid quote, name, star
 * rating, and a tour/role line (e.g. "Adventure tour, 2025"). Use to build trust
 * and social proof on tour-operator, expedition, and travel-experience landing
 * pages. Renders fully with no props via baked-in defaults.
 */
export const TourExperiencesTestimonials = defineCapsule({
  name: 'TourExperiencesTestimonials',
  description:
    "Traveler-review wall for an adventure / guided-tour brand. Composes the shared TestimonialGrid composite as three five-star reviews from past travelers, each with a vivid quote, name, star rating, and a tour/role line (e.g. 'Adventure tour, 2025'). Use to build trust and social proof on tour-operator, expedition, and travel-experience landing pages.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Traveler reviews (quote, name, rating, role/company). */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string().optional(),
          company: z.string().optional(),
          rating: z.number().optional(),
          avatarAlt: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "Hands down the best day of our whole trip. Our guide knew every shortcut and told stories you'd never get from a brochure.",
            name: 'Maya Okonkwo',
            role: 'Adventure tour, 2025',
            rating: 5,
            avatarAlt:
              'Smiling woman with curly hair on a sunny mountain trail',
          },
          {
            quote:
              'We ate things we never would have found alone and met the families who cook them. Pure magic from start to finish.',
            name: 'Diego Fuentes',
            role: 'Food tour, 2025',
            rating: 5,
            avatarAlt:
              'Cheerful man with a short beard standing in a vibrant street market',
          },
          {
            quote:
              'Small group, big heart. The multi-day expedition pushed us just enough and the sunset views were unreal.',
            name: 'Hannah Brooks',
            role: 'Multi-day expedition, 2024',
            rating: 5,
            avatarAlt:
              'Happy young woman with a backpack at a clifftop viewpoint at sunset',
          },
        ]

    return (
      <section className="bg-muted/30 px-6 pt-28 pb-20 lg:px-8 lg:pt-32 lg:pb-24">
        <div className="mx-auto max-w-7xl">
          <TestimonialGrid
            heading={props.heading ?? 'Stories from the trail'}
            subheading={
              props.subheading ??
              'Real words from real travelers who came back with full memory cards and even fuller hearts.'
            }
            columns={3}
            className={props.className}
          >
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
        </div>
      </section>
    )
  },
})
