import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

/**
 * PlumbingHvacTestimonials — a social-proof band for a plumbing & HVAC trade
 * site. Thin configuration over the shared `TestimonialGrid` composite: a
 * centered heading + optional intro above a responsive grid of review cards,
 * each showing a star rating, a customer quote, and an avatar footer with the
 * person's name and role/source (e.g. "Homeowner · Google Review"). Use to
 * build trust with real customer voices on plumber, HVAC, or other
 * home-service landing pages. Renders fully with no props via baked-in defaults.
 */
export const PlumbingHvacTestimonials = defineCapsule({
  name: 'PlumbingHvacTestimonials',
  description:
    "A social-proof band for a plumbing & HVAC trade site built on the shared TestimonialGrid composite: a centered heading + optional intro above a responsive grid of review cards, each showing a star rating, a customer quote, and an avatar footer with the person's name and role/source (e.g. 'Homeowner · Google Review'). Use to build trust with real customer voices on plumber, HVAC, or other home-service landing pages.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Optional supporting intro under the heading. */
    subheading: z.string().optional(),
    /** Review cards; each renders a rating, quote, avatar, name, role, source. */
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
    const heading = props.heading ?? 'What our customers say'
    const subheading =
      props.subheading ??
      'Real reviews from neighbors who trusted us with their plumbing and HVAC emergencies.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Our water heater burst on a Sunday night and they had a tech at our door within the hour. Professional, tidy, and the price was exactly what they quoted.',
            name: 'Maria Alvarez',
            role: 'Homeowner',
            company: 'Google Review',
            rating: 5,
            avatarAlt: 'smiling homeowner Maria standing in her kitchen',
          },
          {
            quote:
              'Furnace died in the middle of a cold snap. They diagnosed it fast, walked me through the options with no pressure, and had heat restored the same day.',
            name: 'James Whitfield',
            role: 'Homeowner',
            company: 'Yelp Review',
            rating: 5,
            avatarAlt: 'homeowner James in his living room',
          },
          {
            quote:
              "We use them for our annual AC tune-up and they're always on time and honest. It's rare to find a contractor you can actually trust — these folks are it.",
            name: 'Priya Desai',
            role: 'Property Manager',
            company: 'Facebook Review',
            rating: 5,
            avatarAlt: 'property manager Priya at an apartment building',
          },
        ]

    return (
      <section className="bg-muted/30 pt-28 pb-20 lg:pt-32 lg:pb-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <TestimonialGrid
            heading={heading}
            subheading={subheading}
            items={items}
            columns={3}
            className={props.className}
          />
        </div>
      </section>
    )
  },
})
