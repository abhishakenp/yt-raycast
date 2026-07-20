import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

export const TravelAgencyTestimonials = defineCapsule({
  name: 'TravelAgencyTestimonials',
  description:
    'Editorial-wanderlust traveler pull-quotes for the Travel Agency page family. A muted-surface section carrying a giant ghost quotation-mark watermark and an asymmetric intro (mono eyebrow + heading left, supporting copy right), then a staggered 3-up grid of sharp-cornered cards, each a quote over a hairline rule with the traveler name and the mono trip-booked meta line. Use to build trust before the closing call to action. All reviews are prop-driven with wanderlust-themed defaults so it renders with no props.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
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
              "Our advisor planned a honeymoon we still can't stop talking about — every detail, from the overwater villa to the private sunset cruise, was flawless.",
            name: 'Maya & Daniel Rivera',
            company: 'Honeymoon package, 2025',
            rating: 5,
            avatarAlt: 'Portrait of a smiling honeymoon couple',
          },
          {
            quote:
              'Three countries in two weeks and not a single hiccup. They handled the flights, the transfers, the upgrades — I just showed up and enjoyed.',
            name: 'Priya Nair',
            company: 'Europe grand tour, 2024',
            rating: 5,
            avatarAlt: 'Portrait of a delighted solo traveler',
          },
          {
            quote:
              'Booking our family safari felt effortless. The kids were thrilled, the lodges were stunning, and the whole trip came in right on budget.',
            name: 'James Okafor',
            company: 'Family safari, 2025',
            rating: 5,
            avatarAlt: 'Portrait of a happy family traveler',
          },
        ]
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 right-2 select-none font-serif text-[18rem] font-normal leading-none text-foreground/[0.05] lg:text-[26rem]"
        >
          &rdquo;
        </span>
        <Container size="xl" className="relative">
          <div className="mb-14 grid items-end gap-8 lg:grid-cols-12 lg:gap-12">
            <SectionHeading
              align="left"
              eyebrow="Travelers"
              title={props.heading ?? 'Trusted by travelers worldwide'}
              className="gap-3 lg:col-span-7"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground"
              titleClassName="text-4xl font-semibold tracking-tight lg:text-5xl"
            />
            <p className="text-base leading-relaxed text-muted-foreground lg:col-span-5 lg:pb-1">
              {props.subheading ??
                "Real journeys, real stories — here's what our travelers say after coming home."}
            </p>
          </div>
          <TestimonialGrid columns={3} className="gap-6">
            {items.map((t, i) => {
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
                  <TestimonialQuote className="text-lg leading-relaxed">
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
