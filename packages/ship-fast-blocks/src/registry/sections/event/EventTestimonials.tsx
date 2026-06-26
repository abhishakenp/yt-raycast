import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * EventTestimonials — an attendee-testimonial grid for a conference or event page.
 * A centered heading + description above a responsive 3-up grid of bordered quote
 * cards, each with a 5-star row, the quote, and an attendee identity (circular
 * alt-driven avatar, name, role). Use to surface social proof from past attendees
 * on tech conference, summit, festival, meetup, or workshop pages.
 */
export const EventTestimonials = defineComponent({
  name: 'EventTestimonials',
  description:
    'Attendee-testimonial grid for a conference or event page: a centered heading + description above a responsive 3-up grid of bordered quote cards, each with a 5-star rating row, a quote, and an attendee identity (circular alt-driven avatar, name, role). Use to surface social proof and reviews from past attendees on tech conference, summit, festival, meetup, or workshop pages.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description beneath the heading. */
    description: z.string().optional(),
    /** Testimonial cards. */
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
    const heading = props.heading ?? 'What Attendees Say'
    const description =
      props.description ??
      'Hear from past DesignFront attendees about their experience.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'The quality of speakers and workshops was exceptional. I learned practical skills I could apply to my work immediately. Already registered for 2024!',
            name: 'Rachel Kim',
            role: 'Senior Product Designer at Figma',
            avatarAlt:
              'Professional headshot of a smiling woman with long brown hair',
          },
          {
            quote:
              'The React Server Components workshop alone was worth the ticket price. Marcus is an incredible teacher. Highly recommend the VIP pass for workshop access.',
            name: 'Tom Bradley',
            role: 'Frontend Engineer at Stripe',
            avatarAlt:
              'Professional headshot of a man with short hair and light stubble',
          },
          {
            quote:
              'As a solo founder, the networking opportunities were invaluable. I met my current design contractor at the breakfast meetups. The venue is absolutely stunning too!',
            name: 'Diego Santos',
            role: 'Founder at DesignLab',
            avatarAlt:
              'Professional headshot of a man with dark hair and warm smile',
          },
          {
            quote:
              "The accessibility session with Priya changed how I approach design. I brought back actionable insights that improved our product's WCAG compliance within weeks.",
            name: 'Amara Okafor',
            role: 'UX Lead at Notion',
            avatarAlt:
              'Professional headshot of a woman with dark curly hair and bright smile',
          },
          {
            quote:
              'DesignFront is now a must-attend for our entire product team. We send 8 people every year because the ROI on team alignment and skills development is incredible.',
            name: 'Michael Chen',
            role: 'VP Product at Linear',
            avatarAlt:
              'Professional headshot of a man in a suit with confident expression',
          },
          {
            quote:
              'First tech conference where I felt genuinely welcome as a junior developer. The community is incredibly supportive and I left with 20+ new LinkedIn connections.',
            name: 'Sophie Williams',
            role: 'Junior Developer at Vercel',
            avatarAlt:
              'Professional headshot of a young woman with red hair and freckles',
          },
        ]

    const StarRow = () => (
      <div
        className="mb-4 flex items-center gap-1 text-primary"
        aria-hidden="true"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )

    return (
      <section className={cn('py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <StarRow />
                <p className="mb-6 leading-relaxed text-card-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    className="size-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
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
