import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * ComingSoonTestimonials — early-access testimonial wall for a "launching soon" /
 * waitlist pre-launch landing page. A centered heading and lead paragraph above a
 * responsive 1/2/3-column grid of bordered quote cards on a card-colored band;
 * each card shows a 5-star rating row, the quote text, and an attribution row with
 * a round alt-driven avatar beside the reviewer's name and role. Avatars use the
 * alt-driven <Image> component. Use as social-proof / early-feedback section on
 * SaaS waitlists, app pre-launch pages, or beta sign-up landers. Renders fully
 * with no props via three baked-in default testimonials.
 */
export const ComingSoonTestimonials = defineCapsule({
  name: 'ComingSoonTestimonials',
  description:
    "Early-access testimonial wall for a 'launching soon' / waitlist pre-launch landing page: centered heading and lead paragraph above a responsive 1/2/3-column grid of bordered quote cards on a card-colored band. Each card shows a 5-star rating row, quote text, and an attribution row with a round alt-driven avatar beside reviewer name and role. Avatars use the alt-driven <Image> component. Use as social-proof / early-feedback section on SaaS waitlists, app pre-launch pages, or beta sign-up landers.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Testimonial cards: quote, name, role, avatarAlt. */
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
    const heading = props.heading ?? 'Early access feedback'
    const description =
      props.description ??
      'From design, engineering, and product teams already using Nexus'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Nexus replaced four tools in our stack. The unified workspace has transformed how our remote team collaborates.',
            name: 'Sarah Chen',
            role: 'Product Lead, Linear',
            avatarAlt:
              'Professional headshot of Sarah Chen, a smiling product manager with dark hair',
          },
          {
            quote:
              'The smart boards feature alone saved us 10 hours a week. Finally, a tool that thinks like designers do.',
            name: 'Marcus Williams',
            role: 'UX Director, Figma',
            avatarAlt:
              'Professional headshot of Marcus Williams, a bearded UX designer in his 30s',
          },
          {
            quote:
              'Security was our top concern. Nexus exceeded every compliance requirement our enterprise clients demand.',
            name: 'David Park',
            role: 'CTO, Vercel',
            avatarAlt:
              'Professional headshot of David Park, a CTO wearing glasses with a confident smile',
          },
        ]

    const Star = () => (
      <svg
        className="size-4 text-primary"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section
        className={cn(
          'w-full bg-card px-4 py-24 sm:px-6 lg:py-28 lg:px-8 xl:px-12',
          props.className,
        )}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-2xl font-light text-foreground sm:text-3xl lg:text-4xl">
              {heading}
            </h2>
            <p className="font-light text-muted-foreground">{description}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <blockquote
                key={t.name}
                className="rounded-xl border border-border bg-muted p-8"
              >
                <div
                  className="mb-4 flex items-center gap-1"
                  aria-label="5 star rating"
                >
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-foreground/80">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="flex items-center gap-3">
                  <Image
                    alt={t.avatarAlt}
                    w={96}
                    h={96}
                    loading="lazy"
                    className="size-10 rounded-full object-cover"
                  />
                  <div>
                    <cite className="text-sm font-medium not-italic text-foreground">
                      {t.name}
                    </cite>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
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
