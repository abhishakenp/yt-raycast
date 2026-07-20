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
 * MembershipClubTestimonials — member-stories wall for a private membership club
 * / exclusive community page on a subtle muted band. A left-aligned mono
 * micro-label kicker + serif heading introduce a responsive 1/3-column grid of
 * sharp-cornered hairline-framed vitrine quote cards, each opening with an
 * oversized serif quotation mark, a relaxed serif quote, and a member name over a
 * mono role caption. Use as warm social proof for members clubs, founders/social
 * clubs, professional networks, curated communities or alumni collectives.
 * Renders fully with no props.
 */
export const MembershipClubTestimonials = defineCapsule({
  name: 'MembershipClubTestimonials',
  description:
    'Member-stories wall for a private membership club / exclusive community page on a subtle muted band: a left-aligned mono micro-label kicker + serif heading introduce a responsive 1/3-column grid of sharp-cornered hairline-framed vitrine quote cards, each opening with an oversized serif quotation mark, a relaxed serif quote, and a member name over a mono role caption. Use as warm social proof for members clubs, founders/social clubs, professional networks, curated communities or alumni collectives.',
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
          <SectionHeading
            align="left"
            eyebrow={eyebrow}
            title={heading}
            titleId="testimonials-heading"
            className="mb-16 max-w-2xl gap-4"
            eyebrowClassName="font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground"
            titleClassName="font-serif text-4xl font-normal tracking-tight text-foreground lg:text-5xl"
          />
          <TestimonialGrid columns={3} className="gap-0">
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
                <TestimonialCard
                  key={__iv__.name}
                  className="gap-5 rounded-none border-border bg-background p-8 transition-[border-color] duration-150 hover:border-foreground/30 lg:p-10"
                >
                  <span
                    aria-hidden="true"
                    className="font-serif text-6xl leading-[0.6] text-border"
                  >
                    &ldquo;
                  </span>
                  <TestimonialQuote className="font-serif text-lg font-normal leading-relaxed text-foreground">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-auto block">
                    <TestimonialName className="font-medium text-foreground">
                      {__iv__.name}
                    </TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="mt-1 block font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
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
