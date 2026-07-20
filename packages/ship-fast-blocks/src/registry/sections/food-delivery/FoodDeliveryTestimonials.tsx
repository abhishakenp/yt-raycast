import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * FoodDeliveryTestimonials — playful-bold review board for a food-delivery /
 * restaurant-marketplace site. An asymmetric header (mono eyebrow + extrabold
 * heading + intro left, a mono "[ reviews ]" tag right) above a 3-up grid of
 * chunky 2px-bordered review cards that stagger in a checker rhythm, each with a
 * rotated rounded-full 5-star rating sticker, a giant ghost quotation-mark
 * watermark, a quoted blurb, and a name over a mono source/location label, with
 * a hard offset shadow lift on hover. Use to build trust with customer (and
 * partner) social proof for food-delivery apps, restaurant aggregators, or
 * online-ordering platforms. Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
export const FoodDeliveryTestimonials = defineCapsule({
  name: 'FoodDeliveryTestimonials',
  description:
    'Playful-bold review board for a food-delivery / restaurant-marketplace site: an asymmetric header (mono eyebrow + extrabold heading + intro left, mono "[ reviews ]" tag right) above a 3-up grid of chunky 2px-bordered review cards staggered in a checker rhythm, each with a rotated rounded-full 5-star rating sticker, a giant ghost quotation-mark watermark, a quoted blurb, and a name over a mono source/location label, with a hard offset shadow lift on hover. Use to build trust with customer and partner social proof for food-delivery apps, restaurant aggregators, online-ordering platforms, or takeout services.',
  props: z.object({
    /** Centered section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Review cards (quote + name + location + avatarAlt). */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          location: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const testimonialsHeading = props.heading ?? 'What people are saying'
    const testimonialsDesc =
      props.description ??
      'Real reviews from real customers across the country.'
    const testimonialItems = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Nosh has completely changed how I order food. The tracking feature is incredible, and I have never had a late delivery. The app is so easy to use!',
            name: 'Sarah Mitchell',
            location: 'San Francisco, CA',
            avatarAlt:
              'Professional headshot of a smiling young woman with shoulder-length brown hair',
          },
          {
            quote:
              'As a restaurant owner, partnering with Nosh increased our delivery orders by 40%. Their driver network is reliable and the commission rates are fair.',
            name: 'Marcus Chen',
            location: 'Owner, Sakura Sushi',
            avatarAlt:
              'Professional headshot of a smiling man in his 40s with short dark hair and glasses',
          },
          {
            quote:
              'I use Nosh 3-4 times a week. The saved favorites feature makes reordering my usual lunch from work incredibly fast. Highly recommended!',
            name: 'David Rodriguez',
            location: 'Austin, TX',
            avatarAlt:
              'Professional headshot of a smiling middle-aged man with beard and casual attire',
          },
        ]
    return (
      <section
        className={cn('bg-card pt-20 pb-16 lg:pt-28 lg:pb-24', props.className)}
      >
        <Container>
          <div className="mb-12 flex flex-col gap-4 sm:mb-16 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              eyebrow="Word of mouth"
              title={testimonialsHeading}
              subtitle={testimonialsDesc}
              className="max-w-2xl gap-3"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
              titleClassName="text-3xl font-extrabold leading-[1.03] tracking-tighter text-foreground sm:text-4xl"
              subtitleClassName="text-lg text-muted-foreground"
            />
            <MonoTag aria-hidden="true" tone="faint" className="shrink-0">
              [ reviews ]
            </MonoTag>
          </div>
          <TestimonialGrid columns={3} className="gap-6">
            {testimonialItems.map((t, i) => {
              const __iv__ = t as {
                quote: string
                name: string
                role?: string
                company?: string
                meta?: string
                location?: string
                rating?: number
                avatarAlt?: string
              }
              const source =
                __iv__.role || __iv__.company || __iv__.meta || __iv__.location
              return (
                <TestimonialCard
                  key={__iv__.name}
                  className={cn(
                    'relative gap-5 overflow-hidden rounded-none border-2 border-foreground bg-background p-6 transition-all hover:-translate-y-1 hover:border-foreground hover:shadow-[6px_6px_0_0] hover:shadow-foreground active:translate-y-px active:shadow-none motion-reduce:transform-none sm:p-7',
                    i % 2 === 1 && 'lg:translate-y-8',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-1 top-1 select-none font-serif text-8xl leading-none text-foreground/[0.06]"
                  >
                    &rdquo;
                  </span>
                  <span
                    aria-hidden="true"
                    className="relative inline-flex w-fit rotate-1 items-center gap-0.5 rounded-full border-2 border-foreground bg-background px-3 py-0.5 text-sm text-primary shadow-[2px_2px_0_0] shadow-primary/40"
                  >
                    ★★★★★
                  </span>
                  <TestimonialQuote className="relative text-base font-medium leading-relaxed text-foreground">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="relative mt-auto flex-col items-start gap-0.5 border-t-2 border-foreground/10 pt-4">
                    <TestimonialName className="text-base font-extrabold tracking-tight">
                      {__iv__.name}
                    </TestimonialName>
                    {source ? (
                      <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                        {source}
                      </TestimonialMeta>
                    ) : null}
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
