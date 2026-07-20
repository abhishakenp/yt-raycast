import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { z } from 'zod/v4'

import {
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'

/**
 * NutritionTestimonials — fresh clean-editorial client-transformation reviews
 * for a nutrition-coaching or wellness site, built on the shared Testimonial
 * kit slots. An asymmetric left header (mono eyebrow + big tracking-tight
 * heading + lede) sits above a staggered three-up grid of sharp-cornered
 * hairline review cards; each card carries a giant ghost quotation mark, a
 * results-focused quote, a hairline rule, and an author row pairing the client
 * name with a mono result label (e.g. "Lost 30 lbs") and a tabular primary star
 * rating. A giant ghost watermark bleeds behind the band. All props are optional
 * with baked defaults so it renders standalone. Use as social proof on nutrition
 * coaches, registered dietitians, meal-plan subscriptions, diet / wellness
 * programs or healthy-eating apps.
 */
export const NutritionTestimonials = defineCapsule({
  name: 'NutritionTestimonials',
  description:
    "Fresh clean-editorial client-transformation reviews for a nutrition-coaching or wellness site, built on the shared Testimonial kit slots: an asymmetric left header (mono eyebrow + big tracking-tight heading + lede) above a staggered three-up grid of sharp-cornered hairline review cards, each with a giant ghost quotation mark, a results-focused quote, a hairline rule, and an author row pairing the client name with a mono result label (e.g. 'Lost 30 lbs') and a tabular primary star rating, behind a giant ghost watermark. Use as social proof on nutrition coaches, registered dietitians, meal-plan subscriptions, diet / wellness programs or healthy-eating apps to show real before-and-after outcomes.",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    /** Client reviews mapped to the testimonial grid items. */
    reviews: z
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
    const heading = props.heading ?? 'Real food, real results'
    const subheading =
      props.subheading ??
      'Thousands of clients have rebuilt their relationship with food—and the scale, energy, and confidence to prove it.'
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              'I finally stopped dieting and started eating. My coach built a plan around the food I actually love, and the weight came off without ever feeling deprived.',
            name: 'Maya Thompson',
            role: 'Lost 30 lbs',
            rating: 5,
            avatarAlt:
              'smiling woman with curly brown hair in athletic wear outdoors',
          },
          {
            quote:
              "The macro coaching changed everything for my training. I'm leaner, my lifts went up, and I actually understand how to fuel my body now.",
            name: 'Daniel Reyes',
            role: 'Down 4% body fat',
            rating: 5,
            avatarAlt: 'fit man with short dark hair smiling after a workout',
          },
          {
            quote:
              "After two kids I had zero energy. Six months in I'm cooking fresh meals my whole family loves and I feel like myself again.",
            name: 'Priya Nair',
            role: 'More energy, every day',
            rating: 5,
            avatarAlt: 'happy woman with long dark hair in a bright kitchen',
          },
        ]

    const Star = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted/30 py-16 lg:py-24',
          props.className,
        )}
      >
        <Watermark className="-top-10 left-0 text-[10rem] leading-none sm:text-[14rem] lg:text-[20rem]">
          &ldquo;
        </Watermark>
        <Container className="relative">
          {/* Asymmetric left header. */}
          <div className="mb-12 max-w-2xl lg:mb-16">
            <MonoTag className="mb-4 block">02 / Client stories</MonoTag>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{subheading}</p>
          </div>

          {/* Staggered review cards. */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((t, i) => {
              const rating = Math.max(0, Math.min(5, Math.round(t.rating ?? 5)))
              const meta = t.role || t.company
              return (
                <TestimonialCard
                  key={t.name}
                  className={cn(
                    'group relative gap-5 rounded-none border-border bg-card p-6 transition-colors duration-150 hover:border-foreground/25 lg:p-7',
                    i === 1 ? 'lg:translate-y-8' : '',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-5 top-2 font-serif text-6xl leading-none text-foreground/[0.06]"
                  >
                    &rdquo;
                  </span>
                  <TestimonialQuote className="relative leading-relaxed">
                    {t.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
                    <span className="flex flex-col">
                      <TestimonialName className="text-sm font-bold tracking-tight">
                        {t.name}
                      </TestimonialName>
                      {meta ? (
                        <TestimonialMeta className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.12em] tabular-nums">
                          {meta}
                        </TestimonialMeta>
                      ) : null}
                    </span>
                    <span
                      className="flex shrink-0 items-center gap-0.5 text-primary"
                      aria-label={`Rated ${rating} out of 5`}
                    >
                      {Array.from({ length: rating }).map((_, s) => (
                        <Star key={s} className="size-3.5" />
                      ))}
                    </span>
                  </TestimonialAuthor>
                </TestimonialCard>
              )
            })}
          </div>
        </Container>
      </section>
    )
  },
})
