import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

import { Container } from '#/section-kit/Container.tsx'

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

    const Star = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
      </svg>
    )

    return (
      <section className={cn('bg-primary/10 py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-primary">
              {eyebrow}
            </span>
            <h2 className="mb-4 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
              {heading}
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {items.map((t) => (
              <div key={t.name} className="rounded-xl bg-card p-8 shadow-sm">
                <div className="mb-4 flex text-primary">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="size-5" />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-card-foreground/90">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-card-foreground">
                      {t.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{t.meta}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
