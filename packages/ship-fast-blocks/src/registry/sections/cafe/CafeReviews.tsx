import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { Card } from '#/section-kit/Card.tsx'
import { ReviewList, ReviewItem } from '#/section-kit/ReviewList.tsx'

/**
 * CafeReviews — 3-up customer-review wall for a cozy cafe / coffee shop page.
 * A centered cap and serif heading above a responsive card grid. Each card
 * shows a 5-star rating row, a quoted testimonial, and an attribution row with
 * a round avatar, name, and role. Below the grid, a text link with an arrow
 * icon routes to a "more reviews" destination via useNavigate. Use for
 * social-proof on cafes, bakeries, tea houses, or any local service business.
 * Renders fully with no props via baked-in defaults.
 */
export const CafeReviews = defineCapsule({
  name: 'CafeReviews',
  description:
    "3-up customer-review wall for a cozy cafe page: centered cap and serif heading above a responsive card grid. Each card shows a 5-star rating row, a quoted testimonial, and an attribution row with a round avatar, name, and role. Below the grid, a text link with an arrow routes to a 'more reviews' destination via useNavigate. Use for social-proof on cafes, bakeries, tea houses, or local service businesses.",
  props: z.object({
    /** Eyebrow / cap text. */
    cap: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** "More reviews" link label. */
    moreLink: z.string().optional(),
    /** Navigation target for the more-link button. */
    moreTarget: z.string().optional(),
    /** Review cards: quote, name, role, avatarAlt. */
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
    const go = useNavigate()
    const cap = props.cap ?? 'What People Say'
    const heading = props.heading ?? 'Loved by the neighborhood'
    const moreLink = props.moreLink ?? 'Read 247 more reviews on Google'
    const moreTarget = props.moreTarget ?? 'Reviews'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'This is my third place. The baristas know my name, my order, and genuinely ask about my day. The Ethiopian pour over is consistently the best in the city.',
            name: 'David Park',
            role: 'Software Engineer, Pearl District',
            avatarAlt:
              'Professional headshot of David Park, a smiling man with short black hair in a casual button-up shirt',
          },
          {
            quote:
              'As a pastry chef myself, I can tell you their croissants are the real deal. Proper lamination, French butter, perfect honeycomb structure. Worth every penny.',
            name: 'Maria Gonzalez',
            role: 'Pastry Chef, Le Cordon Bleu Graduate',
            avatarAlt:
              'Professional headshot of Maria Gonzalez, a smiling woman with curly brown hair and warm brown eyes',
          },
          {
            quote:
              "I bring all my out-of-town clients here. The space is beautiful without trying too hard, the coffee is impeccable, and it's quiet enough for actual conversation.",
            name: 'Jennifer Walsh',
            role: 'Real Estate Broker, Compass',
            avatarAlt:
              'Professional headshot of Jennifer Walsh, a smiling woman in her 40s wearing a navy blazer',
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
      <section className={cn('pt-28 pb-20 lg:pt-32 lg:pb-28', props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
              {cap}
            </p>
            <h2 className="mb-6 font-serif text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
          </div>

          <ReviewList className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((r) => (
              <ReviewItem asChild key={r.name}>
                <Card padding="lg" shadow="sm">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-card-foreground">
                  &ldquo;{r.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    alt={r.avatarAlt}
                    w={100}
                    h={100}
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-card-foreground">{r.name}</p>
                    <p className="text-sm text-muted-foreground">{r.role}</p>
                  </div>
                </div>
                </Card>
              </ReviewItem>
            ))}
          </ReviewList>

          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => go(moreTarget)}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {moreLink}
              <svg
                className="size-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>
    )
  },
})
