import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

/**
 * EventPlannerTestimonials — client-love testimonials grid on a muted band. A
 * centered intro (uppercase eyebrow, thin light heading, lede) above a responsive
 * 2-up/3-up grid of rounded card quotes, each with a five-star primary rating row,
 * an italic quote, and a footer pairing a circular headshot with the client name
 * and role/context. Imagery is alt-driven. Use to surface social proof for
 * event/wedding planners, gala organizers, or premium hospitality services.
 */
export const EventPlannerTestimonials = defineCapsule({
  name: 'EventPlannerTestimonials',
  description:
    'Client-love testimonials grid on a muted band: a centered intro (uppercase eyebrow, thin light heading, lede) above a responsive 2-up/3-up grid of rounded card quotes, each with a five-star primary rating row, an italic quote, and a footer pairing a circular headshot with the client name and role/context. All imagery is alt-driven. Use to surface social proof for event/wedding planners, gala organizers, or premium hospitality services.',
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
    const testimonialsEyebrow = props.eyebrow ?? 'Testimonials'
    const testimonialsHeading = props.heading ?? 'Client Love'
    const testimonialsDesc =
      props.description ??
      'Hear from couples and organizations who trusted us with their most important celebrations.'
    const testimonialItems = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Serene Events made our wedding day absolutely perfect. Sarah and her team thought of every detail we never even considered. Our guests are still talking about how beautiful everything was. Worth every penny!',
            name: 'Rebecca Martinez',
            role: 'Wedding at Napa Valley, June 2024',
            avatarAlt:
              'Professional headshot of Rebecca Martinez, marketing director and newlywed',
          },
          {
            quote:
              "Our company's 25th anniversary gala was flawless thanks to Serene Events. They handled everything from venue selection to entertainment booking. Our board was incredibly impressed with the professionalism.",
            name: 'David Chen',
            role: 'CEO, Meridian Technologies',
            avatarAlt: 'Professional headshot of David Chen, technology CEO',
          },
          {
            quote:
              "We hired Serene Events for my parents' 50th anniversary dinner, and it exceeded all expectations. The venue, the décor, the menu—everything was exactly what Mom dreamed of. Thank you for making it magical!",
            name: 'Jennifer Park',
            role: '50th Anniversary Celebration',
            avatarAlt:
              'Professional headshot of Jennifer Park, event coordinator and daughter of anniversary couple',
          },
          {
            quote:
              'As a nonprofit, we needed an event planner who understood our budget constraints while delivering a gala that felt luxurious. Serene Events struck the perfect balance. We raised 40% more than our goal!',
            name: 'Margaret Sullivan',
            role: 'Executive Director, Bay Arts Foundation',
            avatarAlt:
              'Professional headshot of Margaret Sullivan, nonprofit executive director',
          },
          {
            quote:
              'Destination weddings are stressful, but Sarah made our Tuscany wedding feel effortless. She coordinated with Italian vendors seamlessly and was available at every hour. Best decision we made!',
            name: 'Alexandra Rivera',
            role: 'Destination Wedding, Tuscany',
            avatarAlt: 'Professional headshot of Alexandra Rivera, newlywed',
          },
          {
            quote:
              'We used Serene Events for our product launch at CES. The turnout was incredible, media coverage exceeded expectations, and our team could focus on demos instead of logistics. Already booked them for next year!',
            name: 'Ryan Kim',
            role: 'CEO, Voltex Robotics',
            avatarAlt:
              'Professional headshot of Ryan Kim, startup founder and CEO',
          },
        ]

    const gridItems = testimonialItems.map((t) => ({
      quote: t.quote,
      name: t.name,
      role: t.role,
      avatarAlt: t.avatarAlt,
      rating: 5,
    }))

    return (
      <section
        className={cn(
          'bg-muted px-4 py-20 sm:px-6 lg:px-8 lg:py-28',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl">
          <TestimonialGrid
            eyebrow={testimonialsEyebrow}
            heading={testimonialsHeading}
            subheading={testimonialsDesc}
            items={gridItems}
            cardClassName="rounded-2xl border-0 shadow-sm p-8"
          />
        </div>
      </section>
    )
  },
})
