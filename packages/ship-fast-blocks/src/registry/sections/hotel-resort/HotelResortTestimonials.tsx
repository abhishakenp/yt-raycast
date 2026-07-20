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
 * HotelResortTestimonials — guest pull-quotes for a luxury-editorial hotel /
 * resort & spa site. A muted-surface section carrying a giant ghost serif
 * quotation-mark watermark and an asymmetric intro row (mono eyebrow + thin
 * serif heading on the left, supporting paragraph on the right), then a
 * staggered 3-up grid of sharp-cornered cards, each a serif quote over a
 * hairline rule with the guest name and mono location/date meta. Warm and
 * reassuring. Use to surface reviews and social proof for hotels, resorts, spa
 * retreats, inns, or wellness destinations. Renders fully with no props via
 * baked-in guest defaults.
 */
export const HotelResortTestimonials = defineCapsule({
  name: 'HotelResortTestimonials',
  description:
    'Guest pull-quotes for a luxury-editorial hotel / resort & spa site: a muted-surface section with a giant ghost serif quotation-mark watermark and an asymmetric intro row (mono eyebrow + thin serif heading on the left, supporting paragraph on the right), then a staggered 3-up grid of sharp-cornered cards each a serif quote over a hairline rule with the guest name and mono location/date meta. Warm and reassuring. Use to surface reviews and social proof for hotels, resorts, spa retreats, inns, or wellness destinations.',
  props: z.object({
    /** Uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Testimonial cards. */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          meta: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Guest Experiences'
    const heading = props.heading ?? 'What our guests say'
    const description =
      props.description ??
      'Rated 4.9/5 across 2,400+ reviews on TripAdvisor, Google, and Booking.com'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'We celebrated our anniversary here and it exceeded every expectation. The Azure Suite was magnificent, the staff anticipated our needs before we even asked. Already planning our return.',
            name: 'Margaret Chen',
            meta: 'San Francisco, CA • March 2026',
            avatarAlt:
              'Professional headshot of a smiling woman with shoulder-length brown hair',
          },
          {
            quote:
              "The spa experience alone is worth the trip. I've visited wellness retreats worldwide and Azure's treatments are simply world-class. The heated pool at sunrise is pure magic.",
            name: 'Robert Mitchell',
            meta: 'London, UK • February 2026',
            avatarAlt:
              'Professional headshot of a smiling middle-aged man with short gray hair',
          },
          {
            quote:
              'We hosted our company retreat here and the service was impeccable. From the private dining setup to the team-building activities, everything was flawlessly executed.',
            name: 'Sarah Johnson',
            meta: 'Austin, TX • January 2026',
            avatarAlt:
              'Professional headshot of a confident woman with blonde hair and warm smile',
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted pt-24 pb-24 lg:pt-28 lg:pb-28',
          props.className,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 right-2 select-none font-serif text-[18rem] font-normal leading-none text-foreground/[0.05] lg:text-[26rem]"
        >
          &rdquo;
        </span>
        <Container size="xl" className="relative px-6">
          <div className="mb-16 grid items-end gap-8 lg:grid-cols-12 lg:gap-12">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              className="gap-3 lg:col-span-7"
              eyebrowClassName="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground"
              titleClassName="font-serif text-4xl font-normal text-foreground tracking-tight lg:text-5xl"
            />
            <p className="text-base leading-relaxed text-muted-foreground lg:col-span-5 lg:pb-1">
              {description}
            </p>
          </div>
          <TestimonialGrid columns={3} className="gap-6">
            {items
              .map((t) => ({
                quote: t.quote,
                name: t.name,
                role: t.meta,
                rating: 5,
                avatarAlt: t.avatarAlt,
              }))
              .map((t, i) => {
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
                  <TestimonialCard
                    key={__iv__.name}
                    className={cn(
                      'rounded-none border-border bg-card p-8 hover:border-foreground/40',
                      i % 3 === 1 && 'lg:translate-y-8',
                    )}
                  >
                    <TestimonialQuote className="font-serif text-lg font-normal leading-relaxed">
                      {__iv__.quote}
                    </TestimonialQuote>
                    <TestimonialAuthor className="mt-6 flex-col items-start gap-1 border-t border-border pt-5">
                      <TestimonialName>{__iv__.name}</TestimonialName>
                      {(__iv__.role || __iv__.company || __iv__.meta) && (
                        <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.12em]">
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
