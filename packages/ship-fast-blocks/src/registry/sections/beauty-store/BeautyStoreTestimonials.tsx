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
 * BeautyStoreTestimonials — a 3-up customer testimonials band for a beauty /
 * skincare / cosmetics storefront on a soft primary-tinted background. Centered
 * eyebrow and heading above a responsive grid of review cards: each card has a
 * row of star icons, a quoted review text, and an attribution row with a round
 * avatar and name / meta. Every avatar uses alt-driven <Image>. Use for social
 * proof, verified buyer reviews, community endorsements, or any e-commerce
 * testimonial section. Tokens-only, no links.
 */
export const BeautyStoreTestimonials = defineCapsule({
  name: 'BeautyStoreTestimonials',
  description:
    'Three-up customer testimonials band for a beauty / skincare / cosmetics storefront on a soft primary-tinted background: centered eyebrow and heading above a responsive grid of cards, each with a row of star icons, a quoted review text, and an attribution row with a round avatar and name / meta. Avatars use alt-driven <Image>. Use for social proof, verified buyer reviews, community endorsements, or any e-commerce testimonial section.',
  props: z.object({
    /** Eyebrow text above heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Testimonial items: quote, name, meta, avatarAlt. */
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
    const eyebrow = props.eyebrow ?? 'Customer Love'
    const heading = props.heading ?? 'What Our Community Says'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "I've struggled with sensitive skin for years. The products from Lumière have completely transformed my routine. No irritation, just glowing, healthy skin. The hyaluronic acid serum is now a holy grail!",
            name: 'Sophia Chen',
            meta: 'Verified Buyer • 3 months ago',
            avatarAlt:
              'professional headshot of a young woman with brown hair and warm smile',
          },
          {
            quote:
              "Finally, a beauty store that understands what 'clean' actually means. I love that they vet every brand for cruelty-free practices. Plus, the 2-day shipping is incredibly fast. My go-to for all things beauty!",
            name: 'Maya Johnson',
            meta: 'Verified Buyer • 1 month ago',
            avatarAlt:
              'professional headshot of a young woman with curly hair and confident expression',
          },
          {
            quote:
              "The Rare Beauty blush I ordered is absolutely stunning and lasts all day. Lumière's packaging was beautiful and eco-friendly too. I appreciate a company that cares about the environment as much as beauty.",
            name: 'Emma Williams',
            meta: 'Verified Buyer • 2 weeks ago',
            avatarAlt:
              'professional headshot of a smiling woman with blonde hair and natural makeup',
          },
        ]

    return (
      <section className={cn('bg-primary/10 py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <SectionHeading
              eyebrow={eyebrow}
              title={heading}
              className="gap-0"
              eyebrowClassName="mb-2 block text-xs font-semibold uppercase tracking-widest text-primary"
              titleClassName="mb-4 font-serif text-3xl font-semibold text-foreground sm:text-4xl"
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
        </Container>
      </section>
    )
  },
})
