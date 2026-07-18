import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

/**
 * MembershipClubTestimonials — 6-up member-testimonials grid for a private
 * membership club / exclusive community page. A centered eyebrow + thin heading
 * sit above a responsive 3-column grid of muted rounded quote cards, each leading
 * with a round headshot beside the member's name and role, followed by an italic
 * pull quote. Headshots use the alt-driven Image component. Use as warm social
 * proof for members clubs, founders/social clubs, professional networks, curated
 * communities or alumni collectives. Renders fully with no props.
 */
export const MembershipClubTestimonials = defineCapsule({
  name: 'MembershipClubTestimonials',
  description:
    "6-up member-testimonials grid for a private membership club / exclusive community page: a centered eyebrow + thin heading above a responsive 3-column grid of muted rounded quote cards, each leading with a round headshot beside the member's name and role, followed by an italic pull quote. Headshots use the alt-driven Image component. Use as warm social proof for members clubs, founders/social clubs, professional networks, curated communities or alumni collectives.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    items: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
          quote: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Member Stories'
    const heading = props.heading ?? 'What members are saying'
    const items = props.items?.length
      ? props.items
      : [
          {
            name: 'Sarah Chen',
            role: 'Product Lead, Stripe',
            quote:
              "The Guild fundamentally changed how I think about professional relationships. I've made deeper connections here in 6 months than in 6 years of traditional networking.",
            avatarAlt:
              'professional headshot of a smiling woman with brown hair',
          },
          {
            name: 'Marcus Johnson',
            role: 'Founder, Blueprint Labs',
            quote:
              'I joined during a lonely founder phase. The retreats gave me clarity, the dinners gave me perspective, and the introductions gave me my co-founder.',
            avatarAlt:
              'professional headshot of a man with short dark hair and glasses',
          },
          {
            name: 'Elena Voss',
            role: 'Design Director, Figma',
            quote:
              'As someone who moved to a new city for work, The Guild became my instant community. The clubhouses feel like a second home now.',
            avatarAlt:
              'professional headshot of a woman with blonde hair smiling warmly',
          },
          {
            name: 'David Park',
            role: 'Engineering Manager, Linear',
            quote:
              "The quality of people here is remarkable. Every conversation teaches me something. It's become my primary source of learning outside of work.",
            avatarAlt:
              'professional headshot of a man with a beard wearing a casual shirt',
          },
          {
            name: 'Amara Okafor',
            role: 'Investor, Sequoia',
            quote:
              "I've sourced three investments through Guild connections. But more importantly, I've found genuine friendships with people who understand the journey.",
            avatarAlt:
              'professional headshot of a woman with curly dark hair and natural makeup',
          },
          {
            name: 'James Mitchell',
            role: 'Author & Consultant',
            quote:
              'After 20 years of corporate life, I found my tribe here. The Guild values wisdom and curiosity over titles—refreshing and rare.',
            avatarAlt:
              'professional headshot of a man with short gray hair and a friendly expression',
          },
        ]

    return (
      <section
        className={cn('w-full bg-card py-20 lg:py-28', props.className)}
        aria-labelledby="testimonials-heading"
      >
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-24">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
            <h2
              id="testimonials-heading"
              className="mb-6 text-3xl font-light text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
          </div>
          <TestimonialGrid items={items} columns={3} />
        </Container>
      </section>
    )
  },
})
