import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * MobileAppTestimonials — a kinetic staggered app-review wall for a consumer
 * mobile-app page. An asymmetric header (left-aligned heading with a tilted
 * primary marker block behind the key word, mono "[ REVIEWS ]" meta right) over
 * a giant ghost quotation mark, above a 3-column grid of sharp hairline-bordered
 * review cards whose middle column is pushed down for a staggered rhythm: each
 * card opens with a mono "REVIEW 01" index tag beside a compact 5-star rating
 * row, carries the quote, and closes with a hairline-topped mono name / role
 * footer. Cards gain a foreground hairline on hover; no links. Use as the
 * social-proof / reviews wall on a habit tracker, fitness / wellness app,
 * productivity or to-do app, or any consumer app landing page. Renders fully
 * with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
export const MobileAppTestimonials = defineCapsule({
  name: 'MobileAppTestimonials',
  description:
    'Kinetic staggered app-review wall for a consumer mobile-app page: an asymmetric header (marker-highlighted heading left, mono reviews meta right) over a giant ghost quotation mark, above a 3-column grid of sharp hairline-bordered review cards with a pushed-down middle column, each opening with a mono REVIEW index tag beside a compact 5-star rating row and closing with a hairline-topped mono name / role footer. Use as the social-proof / reviews wall on a habit tracker, fitness / wellness app, productivity or to-do app, or any consumer app landing page.',
  props: z.object({
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
    const heading = props.heading ?? 'Loved by habit builders'
    const description =
      props.description ??
      'See what our community has to say about their DailyFlow journey.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "DailyFlow is the only habit tracker that didn't make me feel guilty for missing a day. I've meditated for 45 days straight now—the longest streak of my life.",
            name: 'Sarah Chen',
            role: 'Product Manager at Stripe',
            avatarAlt:
              'Professional headshot of Sarah Chen, a smiling woman with dark hair wearing a blue blouse',
          },
          {
            quote:
              'The accountability groups changed everything. Having 3 other people cheering me on made me actually stick to my morning workouts for the first time ever.',
            name: 'Marcus Johnson',
            role: 'Software Engineer at Google',
            avatarAlt:
              'Professional headshot of Marcus Johnson, a man with short curly hair and glasses wearing a gray sweater',
          },
          {
            quote:
              "I've tried 10+ habit apps. DailyFlow is the first one that actually feels peaceful to use. No clutter, no gamification addiction—just pure, simple tracking.",
            name: 'Emily Parker',
            role: 'UX Designer at Airbnb',
            avatarAlt:
              'Professional headshot of Emily Parker, a woman with blonde hair wearing a white turtleneck',
          },
          {
            quote:
              'The insights feature is incredible. I finally understand which habits trigger my best days. Data-driven self-improvement at its finest.',
            name: 'David Kim',
            role: 'Founder at TechStart',
            avatarAlt:
              'Professional headshot of David Kim, a man with a well-groomed beard and warm smile',
          },
          {
            quote:
              "As a therapist, I recommend DailyFlow to clients struggling with consistency. It's the only app that focuses on progress over perfection.",
            name: 'Dr. Lisa Thompson',
            role: 'Clinical Psychologist',
            avatarAlt:
              'Professional headshot of Dr. Lisa Thompson, a woman with shoulder-length brown hair wearing professional attire',
          },
          {
            quote:
              "The widget is a game-changer. I can check off habits without even opening the app. I've now journaled for 90 days straight!",
            name: 'Priya Sharma',
            role: 'Marketing Director',
            avatarAlt:
              'Professional headshot of Priya Sharma, a young woman with long dark hair and confident expression',
          },
        ]
    const headingWords = heading.split(' ')
    const headingLead = headingWords.slice(0, -1).join(' ')
    const headingMark = headingWords.at(-1) ?? ''
    const Stars = () => (
      <span aria-hidden="true" className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, s) => (
          <svg
            key={s}
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-3.5 text-primary"
          >
            <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z" />
          </svg>
        ))}
      </span>
    )
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted/40 pt-24 pb-20 lg:pt-28 lg:pb-28',
          props.className,
        )}
        aria-labelledby="mobileapp-testimonials-heading"
      >
        <Watermark className="-top-16 left-0 font-serif text-[16rem] sm:text-[22rem]">
          &ldquo;
        </Watermark>
        <Container className="relative">
          {/* Asymmetric header: marker-highlighted heading left, mono meta right. */}
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                Reviews
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  · 4.9 ★
                </span>
              </MonoTag>
              <h2
                id="mobileapp-testimonials-heading"
                className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              >
                {headingLead}{' '}
                <span className="relative ml-[0.12em] inline-block whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-0.15em] inset-y-[0.05em] -rotate-1 bg-primary"
                  />
                  <span className="relative text-primary-foreground">
                    {headingMark}
                  </span>
                </span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {description}
              </p>
            </div>
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ app store ] verified reviews
            </p>
          </div>
          <TestimonialGrid columns={3} className="gap-5 lg:gap-6">
            {items.map((t, index) => {
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
                    'rounded-none border border-border bg-card p-6 shadow-none transition-colors duration-150 hover:border-foreground/40',
                    index % 3 === 1 && 'lg:translate-y-8',
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <MonoTag className="flex items-center gap-2" tone="faint">
                      <span
                        aria-hidden="true"
                        className="size-1.5 shrink-0 bg-primary"
                      />
                      Review {String(index + 1).padStart(2, '0')}
                    </MonoTag>
                    <Stars />
                  </div>
                  <TestimonialQuote className="mt-4 text-[15px] leading-relaxed">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-6 flex-col items-start gap-0.5 border-t border-border pt-4">
                    <TestimonialName className="text-sm font-bold tracking-tight">
                      {__iv__.name}
                    </TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="font-mono text-[10px] uppercase tracking-[0.14em]">
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
