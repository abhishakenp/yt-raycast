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
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * PlumbingHvacTestimonials — a trade-industrial social-proof band for a
 * plumbing & HVAC site. Thin configuration over the shared `TestimonialGrid`
 * composite: a left-aligned mono index header above a responsive row of
 * staggered squared border-2 hard-shadow review cards, each led by a giant ghost
 * quotation mark and a star rating, a customer quote, and a hairline-topped
 * footer pairing a squared alt-driven avatar with the person's name and a mono
 * role/source meta line (e.g. "Homeowner · Google Review"). Use to build trust
 * with real customer voices on plumber, HVAC, or other home-service landing
 * pages. Renders fully with no props via baked-in defaults.
 */
export const PlumbingHvacTestimonials = defineCapsule({
  name: 'PlumbingHvacTestimonials',
  description:
    "A trade-industrial social-proof band for a plumbing & HVAC site built on the shared TestimonialGrid composite: a left-aligned mono index header above a responsive row of staggered squared border-2 hard-shadow review cards, each led by a giant ghost quotation mark and a star rating, a customer quote, and a hairline-topped footer pairing a squared alt-driven avatar with the person's name and a mono role/source meta line (e.g. 'Homeowner · Google Review'). Use to build trust with real customer voices on plumber, HVAC, or other home-service landing pages.",
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

    const Stars = ({ count }: { count: number }) => (
      <div
        className="flex gap-0.5 text-primary"
        aria-label={`${count} out of 5 stars`}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className={cn('size-4', i >= count && 'text-muted-foreground/30')}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )

    return (
      <section className="bg-muted/30 pt-28 pb-20 lg:pt-32 lg:pb-28">
        <Container size="xl">
          <div className="mb-12 max-w-3xl">
            <span className="mb-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              <span className="tabular-nums">[ 04 ]</span>
              <span className="text-muted-foreground">Reviews</span>
            </span>
            <SectionHeading
              align="left"
              title={heading}
              subtitle={subheading}
              className="gap-3"
              titleClassName="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl"
              subtitleClassName="text-lg text-muted-foreground"
            />
          </div>
          <TestimonialGrid columns={3} className={props.className}>
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
                    'relative gap-4 overflow-hidden rounded-none border-2 border-foreground p-6 shadow-[6px_6px_0_0] shadow-foreground transition-transform duration-150 hover:-translate-y-1 motion-reduce:transform-none',
                    i % 2 === 1 && 'lg:translate-y-8',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-6 right-2 select-none font-serif text-8xl font-extrabold leading-none text-foreground/[0.06]"
                  >
                    &rdquo;
                  </span>
                  <Stars count={__iv__.rating ?? 5} />
                  <TestimonialQuote className="text-pretty">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-auto gap-3 border-t-2 border-dotted border-border pt-4">
                    {__iv__.avatarAlt ? (
                      <span className="size-10 shrink-0 overflow-hidden rounded-none border-2 border-foreground bg-muted">
                        <Image
                          alt={__iv__.avatarAlt}
                          w={80}
                          h={80}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      </span>
                    ) : null}
                    <span className="flex flex-col">
                      <TestimonialName className="font-bold tracking-tight">
                        {__iv__.name}
                      </TestimonialName>
                      {(__iv__.role || __iv__.company || __iv__.meta) && (
                        <TestimonialMeta className="font-mono text-[10px] uppercase tracking-[0.14em]">
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
