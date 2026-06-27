import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * FashionStoreTestimonials — dark inverted customer testimonials band for a
 * minimalist fashion store. A foreground-colored section with a centered
 * uppercase eyebrow + serif heading above a responsive 1-to-3 column grid of
 * top-bordered quote blocks, each with a five-star rating row, a light italic
 * pull-quote, and a footer pairing a rounded avatar with the customer name and
 * role. Avatars use the alt-driven Image component. Use to build trust with
 * social proof for clothing brands, boutiques, or premium apparel labels.
 */
export const FashionStoreTestimonials = defineCapsule({
  name: 'FashionStoreTestimonials',
  description:
    'Dark inverted customer testimonials band for a minimalist fashion store: a foreground-colored section with a centered uppercase eyebrow + serif heading above a responsive 1-to-3 column grid of top-bordered quote blocks, each with a five-star rating row, a light italic pull-quote, and a footer pairing a rounded avatar with the customer name and role. Avatars use the alt-driven Image component. Use to build trust with social proof and client stories for clothing brands, boutiques, or premium apparel labels.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
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
    const testimonialsEyebrow = props.eyebrow ?? 'What They Say'
    const testimonialsHeading = props.heading ?? 'Client Stories'
    const testimonialItems = props.items?.length
      ? props.items
      : [
          {
            quote:
              "The quality is exceptional. I've had my linen blazer for two years and it still looks brand new. The neutral palette makes it so easy to build outfits.",
            name: 'Sarah Chen',
            role: 'Fashion Editor, Vogue Japan',
            avatarAlt:
              'Professional headshot of Sarah Chen, fashion editor at Vogue Japan',
          },
          {
            quote:
              "Finally, a brand that understands that less is more. The cashmere knit is the softest I've ever owned. Worth every penny.",
            name: 'James Morrison',
            role: 'Creative Director',
            avatarAlt:
              'Professional headshot of James Morrison, creative director',
          },
          {
            quote:
              'I love how everything coordinates. My closet is 80% NOIRE now, and I can mix and match effortlessly. The customer service is impeccable too.',
            name: 'Elena Vasquez',
            role: 'Architect',
            avatarAlt:
              'Professional headshot of Elena Vasquez, architect and design consultant',
          },
        ]

    const StarIcon = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section
        aria-label="Customer testimonials"
        className={cn(
          'bg-foreground py-20 text-background lg:py-32',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-background/60">
              {testimonialsEyebrow}
            </p>
            <h2 className="font-serif text-4xl font-normal sm:text-5xl lg:text-6xl">
              {testimonialsHeading}
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {testimonialItems.map((t) => (
              <blockquote
                key={t.name}
                className="border-t border-background/20 pt-8"
              >
                <div className="mb-4 flex items-center gap-1 text-background">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                </div>
                <p className="mb-6 text-lg font-light leading-relaxed text-background/80">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="flex items-center gap-4">
                  <Image
                    alt={t.avatarAlt}
                    w={120}
                    h={120}
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-background">{t.name}</p>
                    <p className="text-sm text-background/60">{t.role}</p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
