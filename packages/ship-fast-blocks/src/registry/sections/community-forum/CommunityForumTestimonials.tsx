import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

/**
 * CommunityForumTestimonials — star-rated testimonial grid for a community-platform /
 * discussion-forum landing page. A centered heading + description above a responsive
 * 3-column grid of bordered card tiles; each tile has a 5-star rating strip, a quote,
 * and an attribution row with a round avatar (via <Image>) + name + role. No links.
 * Use as the social-proof / customer-voices section for community platforms, SaaS
 * products, or professional networks.
 */
export const CommunityForumTestimonials = defineCapsule({
  name: 'CommunityForumTestimonials',
  description:
    'Star-rated testimonial grid for a community-platform / discussion-forum landing page: a centered heading and description above a responsive 3-column grid of bordered card tiles, each with a 5-star rating strip, a quote, and an attribution row with a round avatar (via Image) + name + role. No links. Use as the social-proof / customer-voices section for community platforms, SaaS products, or professional networks.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Testimonial cards: quote + name + role + avatarAlt. */
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
    const heading = props.heading ?? 'Loved by community builders'
    const description =
      props.description ??
      'See what leaders and creators say about growing their communities with Threadloom.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Threadloom transformed how our remote team stays connected. The threaded discussions make it easy to follow conversations, and the search is incredibly powerful.',
            name: 'Sarah Chen',
            role: 'VP of People, Linear',
            avatarAlt:
              'professional headshot of a smiling woman with shoulder-length brown hair',
          },
          {
            quote:
              'We migrated 50,000 members from a Facebook group to Threadloom. Member engagement increased 340% because people can actually find and follow discussions that matter to them.',
            name: 'Marcus Johnson',
            role: 'Founder, IndieHackers Pro',
            avatarAlt:
              'professional headshot of a man with short dark hair and glasses',
          },
          {
            quote:
              'The moderation tools are exceptional. We can set automated rules, review flagged content, and maintain quality without spending hours on manual work.',
            name: 'Elena Rodriguez',
            role: 'Community Lead, Notion',
            avatarAlt:
              'professional headshot of a woman with blonde hair wearing a business blazer',
          },
        ]

    return (
      <section className={cn('py-24 lg:py-28', props.className)}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
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
