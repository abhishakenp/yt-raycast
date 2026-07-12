import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

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

    const Star = () => (
      <svg
        className="size-5 text-primary"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section
        className={cn(
          'bg-muted px-4 py-20 sm:px-6 lg:px-8 lg:py-28',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-24">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              {testimonialsEyebrow}
            </p>
            <h2 className="mb-6 text-3xl font-light text-foreground sm:text-4xl lg:text-5xl">
              {testimonialsHeading}
            </h2>
            <p className="text-lg text-muted-foreground">{testimonialsDesc}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            {testimonialItems.map((t) => (
              <article
                key={t.name}
                className="rounded-2xl bg-card p-8 shadow-sm"
              >
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-card-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    loading="lazy"
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-card-foreground">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
