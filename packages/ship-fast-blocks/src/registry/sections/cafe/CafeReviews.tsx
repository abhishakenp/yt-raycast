import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
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
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * CafeReviews — 3-up customer-review wall for a cozy cafe / coffee shop page.
 * A centered cap and serif heading above a responsive card grid. Each card
 * shows a 5-star rating row, a quoted testimonial, and an attribution row with
 * a round avatar, name, and role. Below the grid, a text link with an arrow
 * icon routes to a "more reviews" destination via section-kit route links. Use for
 * social-proof on cafes, bakeries, tea houses, or any local service business.
 * Renders fully with no props via baked-in defaults.
 */
export const CafeReviews = defineCapsule({
  name: 'CafeReviews',
  description:
    "3-up customer-review wall for a cozy cafe page: centered cap and serif heading above a responsive card grid. Each card shows a 5-star rating row, a quoted testimonial, and an attribution row with a round avatar, name, and role. Below the grid, a text link with an arrow routes to a 'more reviews' destination via section-kit route links. Use for social-proof on cafes, bakeries, tea houses, or local service businesses.",
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

    return (
      <section className={cn('pt-28 pb-20 lg:pt-32 lg:pb-28', props.className)}>
        <Container size="xl" className="px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <SectionHeading
              eyebrow={cap}
              title={heading}
              className="gap-0"
              eyebrowClassName="mb-3 text-sm font-medium uppercase tracking-wider text-primary"
              titleClassName="mb-6 font-serif text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl"
            />
          </div>

          <TestimonialGrid columns={3}>
            {items.map((t) => {
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
                <TestimonialCard key={__iv__.name}>
                  <TestimonialQuote>{__iv__.quote}</TestimonialQuote>
                  <TestimonialAuthor>
                    <TestimonialName>{__iv__.name}</TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta>
                        {__iv__.role || __iv__.company || __iv__.meta}
                      </TestimonialMeta>
                    )}
                  </TestimonialAuthor>
                </TestimonialCard>
              )
            })}
          </TestimonialGrid>

          <div className="mt-12 text-center">
            <NavbarRouteLink
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              href={moreTarget}
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
            </NavbarRouteLink>
          </div>
        </Container>
      </section>
    )
  },
})
