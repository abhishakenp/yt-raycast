import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
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
 * EventPlannerTestimonials — kinetic-poster client-love wall on a muted band. An
 * asymmetric intro (a mono metadata rail with a primary square, hairline rule and
 * count above a giant tight-tracked heading and lede) above a staggered 2-up/3-up
 * grid of hard-framed rounded-none quote cards, each with a five-star primary
 * rating row, a serif-italic quote behind a giant faint quotation mark, and a
 * footer pairing a squared alt-driven headshot with the client name and a mono
 * role/context label. Imagery is alt-driven. Use to surface social proof for
 * event/wedding planners, gala organizers, or premium hospitality services.
 */
export const EventPlannerTestimonials = defineCapsule({
  name: 'EventPlannerTestimonials',
  description:
    'Kinetic-poster client-love wall on a muted band: an asymmetric intro (a mono metadata rail with a primary square, hairline rule and count above a giant tight-tracked heading and lede) above a staggered 2-up/3-up grid of hard-framed rounded-none quote cards, each with a five-star primary rating row, a serif-italic quote behind a giant faint quotation mark, and a footer pairing a squared alt-driven headshot with the client name and a mono role/context label. All imagery is alt-driven. Use to surface social proof for event/wedding planners, gala organizers, or premium hospitality services.',
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
        <Container size="xl">
          <div className="mb-14 max-w-3xl lg:mb-16">
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 bg-primary"
              />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {testimonialsEyebrow}
              </span>
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
              <span
                aria-hidden="true"
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 tabular-nums"
              >
                {String(gridItems.length).padStart(2, '0')} / reviews
              </span>
            </div>
            <h2 className="mt-6 text-4xl font-extrabold leading-[0.95] tracking-tighter text-foreground text-balance sm:text-5xl lg:text-6xl">
              {testimonialsHeading}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {testimonialsDesc}
            </p>
          </div>
          <TestimonialGrid>
            {gridItems.map((t, i) => {
              const __iv__ = t as {
                quote: string
                name: string
                role?: string
                company?: string
                meta?: string
                rating?: number
                avatarAlt?: string
              }
              const stars = Math.max(0, Math.min(5, __iv__.rating ?? 5))
              return (
                <TestimonialCard
                  key={__iv__.name}
                  className={cn(
                    'relative gap-5 overflow-hidden rounded-none border-2 border-foreground/15 bg-background p-8 transition-transform duration-150 hover:-translate-y-1 motion-reduce:transform-none',
                    i % 3 === 1 && 'lg:translate-y-8',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-2 -top-6 select-none font-serif text-[7rem] leading-none text-primary/10"
                  >
                    &rdquo;
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex items-center gap-0.5 text-primary"
                  >
                    {Array.from({ length: stars }).map((_, s) => (
                      <svg
                        key={s}
                        className="size-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z" />
                      </svg>
                    ))}
                  </span>
                  <TestimonialQuote className="relative font-serif text-lg italic leading-relaxed text-foreground">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-auto flex items-center gap-3 border-t border-border pt-5">
                    {__iv__.avatarAlt ? (
                      <Image
                        alt={__iv__.avatarAlt}
                        w={96}
                        h={96}
                        loading="lazy"
                        className="size-11 shrink-0 rounded-none border-2 border-foreground/15 object-cover"
                      />
                    ) : null}
                    <span className="min-w-0">
                      <TestimonialName className="block truncate font-bold tracking-tight text-foreground">
                        {__iv__.name}
                      </TestimonialName>
                      {(__iv__.role || __iv__.company || __iv__.meta) && (
                        <TestimonialMeta className="mt-0.5 block truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          {__iv__.role || __iv__.company || __iv__.meta}
                        </TestimonialMeta>
                      )}
                    </span>
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
