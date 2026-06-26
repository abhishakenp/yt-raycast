import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * LawFirmTestimonials — a centered-intro, star-rated client testimonials grid on
 * the card surface. A tracked-uppercase eyebrow, serif heading and lead
 * paragraph sit above a responsive 3-up grid of bordered quote cards; each card
 * shows a five-star row, an italic quote, and an avatar + name + role footer.
 * Refined, authoritative editorial aesthetic with sharp squared corners. Avatars
 * use the alt-driven Image component. Use to surface client social proof on
 * law-firm, attorney, consulting or professional-services pages. Renders fully
 * with no props via baked-in defaults.
 */
export const LawFirmTestimonials = defineComponent({
  name: 'LawFirmTestimonials',
  description:
    'Centered-intro, star-rated client testimonials grid on the card surface: a tracked-uppercase eyebrow, serif heading and lead paragraph above a responsive 3-up grid of bordered quote cards, each showing a five-star row, an italic quote and an avatar + name + role footer. Refined, authoritative editorial aesthetic with sharp squared corners; avatars use the alt-driven Image component. Use to surface client social proof and reviews on law-firm, attorney, consulting, accounting or professional-services pages.',
  props: z.object({
    eyebrow: z.string().optional(),
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
    const eyebrow = props.eyebrow ?? 'Client Perspectives'
    const heading = props.heading ?? 'What Our Clients Say'
    const description =
      props.description ??
      "Our relationships span decades and industries. Here's what leaders of some of America's most successful companies say about working with Reinhart & Associates."
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "Margaret Chen and her team guided us through our $340 million acquisition with precision I didn't think was possible in legal practice. They anticipated issues before they arose and kept the deal on track through complex regulatory hurdles.",
            name: 'Michael Chen',
            role: 'CEO, Meridian Technologies',
            avatarAlt:
              'Professional headshot of Michael Chen, CEO of Meridian Technologies, smiling confidently in business attire',
          },
          {
            quote:
              "When we faced a bet-the-company patent dispute, Elena Vasquez didn't just defend us—she turned the tables and secured a $12 million judgment in our favor. Her courtroom presence is simply commanding.",
            name: 'Jennifer Walsh',
            role: 'CTO, Axiom Robotics',
            avatarAlt:
              'Professional headshot of Jennifer Walsh, CTO of Axiom Robotics, with thoughtful confident expression',
          },
          {
            quote:
              "Robert Thornton restructured our family's estate plan with such elegance that we eliminated $4.2 million in potential estate taxes while preserving our business for the third generation. A true master of his craft.",
            name: 'William Forsythe',
            role: 'Chairman, Forsythe Industries',
            avatarAlt:
              'Professional headshot of William Forsythe, Chairman of Forsythe Industries, distinguished older gentleman in business suit',
          },
        ]

    const StarIcon = () => (
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
      <section className={cn('bg-card py-24 lg:py-32', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-20 max-w-3xl text-center">
            <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mb-6 font-serif text-3xl text-foreground lg:text-5xl">
              {heading}
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <div
                key={t.name}
                className="border border-border bg-background p-8"
              >
                <div className="mb-6 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                </div>
                <p className="mb-6 italic leading-relaxed text-foreground/80">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    loading="lazy"
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-foreground">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
