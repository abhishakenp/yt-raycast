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

/**
 * PortfolioDevTestimonials — an editorial client-review wall for a modern
 * developer portfolio. Thin configuration over the shared `TestimonialGrid`
 * composite (grid only — the header is rendered locally so it can sit
 * left-aligned under a mono meta rule): sharp-cornered quote plates on an
 * alternating ±translate stagger, each opening with a giant ghost quotation
 * mark, the quoted testimonial, and a mono attribution rule pairing the client
 * name with their role and company. Theme-token only with mono accents. Use
 * mid-page on a freelance engineer or studio portfolio for social proof from
 * past clients and teams. Renders fully with no props via baked-in defaults.
 */
export const PortfolioDevTestimonials = defineCapsule({
  name: 'PortfolioDevTestimonials',
  description:
    'Editorial client-review wall for a modern developer portfolio: a left-aligned mono meta rule and heading above a responsive grid of sharp-cornered quote plates on an alternating ±translate stagger, each opening with a giant ghost quotation mark, the quoted testimonial, and a mono attribution rule pairing the client name with their role and company. Theme-token only with mono accents. Use mid-page on a freelance engineer or studio portfolio for social proof from past clients and teams.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Short supporting line under the heading. */
    subheading: z.string().optional(),
    /** Client testimonials: quote, name, role, company, rating. */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string().optional(),
          company: z.string().optional(),
          rating: z.number().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Testimonials'
    const subheading = props.subheading ?? 'What clients say'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Alex shipped our MVP weeks ahead of schedule and the code was the cleanest our team has reviewed. We hired again immediately.',
            name: 'Dana Mitchell',
            role: 'CTO',
            company: 'Northwind',
            rating: 5,
          },
          {
            quote:
              'Rare to find an engineer who owns both the frontend polish and the backend reliability. Our API latency dropped by half.',
            name: 'Sam Okafor',
            role: 'Engineering Lead',
            company: 'Brightpath',
            rating: 5,
          },
          {
            quote:
              'Clear communicator, pragmatic decisions, and zero hand-holding required. Exactly what a fast-moving startup needs.',
            name: 'Priya Shah',
            role: 'Founder',
            company: 'Loopwork',
            rating: 5,
          },
        ]

    return (
      <section
        className={cn(
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <div className="mb-10 flex items-center justify-between gap-4 border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              {subheading}
            </span>
            <span className="tabular-nums">
              {String(items.length).padStart(2, '0')} / voices
            </span>
          </div>
          <h2 className="mb-12 max-w-2xl text-4xl font-extrabold leading-[0.95] tracking-tighter text-foreground sm:text-5xl">
            {heading}
          </h2>
          <TestimonialGrid className="gap-6 sm:items-start">
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
                    'relative gap-5 overflow-hidden rounded-none border-border bg-card transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-1 hover:border-foreground/30 hover:shadow-[6px_6px_0_0] hover:shadow-foreground motion-reduce:transform-none',
                    i % 2 === 1 && 'lg:translate-y-10',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-4 right-3 select-none font-serif text-8xl leading-none text-primary/10"
                  >
                    &rdquo;
                  </span>
                  <TestimonialQuote className="relative text-base leading-relaxed text-foreground">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-auto flex-col items-start gap-1 border-t border-border pt-4">
                    <TestimonialName className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
                      {__iv__.name}
                    </TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        {[__iv__.role, __iv__.company]
                          .filter(Boolean)
                          .join(' · ') || __iv__.meta}
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
