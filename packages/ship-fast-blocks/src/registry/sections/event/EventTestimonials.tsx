import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

/**
 * EventTestimonials — an attendee-testimonial grid for a conference or event page.
 * A centered heading + description above a responsive 3-up grid of bordered quote
 * cards, each with a 5-star row, the quote, and an attendee identity (circular
 * alt-driven avatar, name, role). Use to surface social proof from past attendees
 * on tech conference, summit, festival, meetup, or workshop pages.
 */
export const EventTestimonials = defineCapsule({
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

    return (
      <section className={cn('py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <TestimonialGrid items={items} columns={3} />
        </div>
      </section>
    )
  },
})
