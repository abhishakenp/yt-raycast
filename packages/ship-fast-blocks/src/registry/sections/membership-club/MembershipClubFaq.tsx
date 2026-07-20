import { defineCapsule } from '#/capsules/openui.ts'

import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * MembershipClubFaq — editorial FAQ for a private membership club / exclusive
 * community page. An asymmetric 4:8 split pairs a left rail (mono micro-label
 * kicker + serif heading, sticky on desktop) with a right column of
 * hairline-divided native <details>/<summary> ledger rows, each with a serif
 * question, a chevron that rotates open, and a relaxed muted answer. Use to
 * address eligibility, acceptance rate, tier switching and policy questions for
 * members clubs, professional networks, mastermind groups or curated
 * communities. Renders fully with no props.
 */
export const MembershipClubFaq = defineCapsule({
  name: 'MembershipClubFaq',
  description:
    'Editorial FAQ for a private membership club / exclusive community page: an asymmetric 4:8 split pairing a left rail (mono micro-label kicker + serif heading, sticky on desktop) with a right column of hairline-divided native details/summary ledger rows, each with a serif question, a chevron that rotates open, and a relaxed muted answer. Use to address eligibility, acceptance rate, tier switching and policy questions for members clubs, professional networks, mastermind groups or curated communities.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Questions & Answers'
    const heading = props.heading ?? 'Frequently Asked'
    const items = props.items?.length
      ? props.items
      : [
          {
            q: 'Who is The Guild for?',
            a: 'The Guild is for professionals, founders, creatives, and leaders who value meaningful connection over transactional networking. Our members typically have 5+ years of experience and are looking for a community that prioritizes depth, learning, and genuine relationships.',
          },
          {
            q: "What's the acceptance rate?",
            a: "We accept approximately 40% of applicants. We're not looking for specific titles or companies— we're looking for curious, generous people who will contribute to the community. If you're not accepted, you can reapply in 6 months.",
          },
          {
            q: 'Can I switch membership tiers?',
            a: "Yes, you can upgrade or downgrade your membership at any time. Changes take effect at the start of your next billing cycle. If upgrading mid-cycle, we'll prorate the difference.",
          },
          {
            q: 'Do you offer corporate memberships?',
            a: 'We offer corporate packages for teams of 5+. Each member gets their own individual membership with full benefits, plus team-specific introductions and private group events. Contact us for custom pricing.',
          },
          {
            q: 'What cities have clubhouses?',
            a: 'Current clubhouses are in New York City (SoHo), San Francisco (Mission), London (Shoreditch), Berlin (Kreuzberg), Tokyo (Shibuya), Los Angeles (Arts District), Amsterdam (Jordaan), and Mexico City (Roma Norte). New locations added based on member demand.',
          },
          {
            q: 'Can I pause my membership?',
            a: "Yes, members can pause their membership for up to 3 months per year. This is perfect for extended travel, parental leave, or intense work periods. Your spot in the community is held, and you can resume whenever you're ready.",
          },
        ]
    return (
      <section
        className={cn(
          'w-full bg-background pt-20 pb-20 lg:pt-28 lg:pb-28',
          props.className,
        )}
        aria-labelledby="faq-heading"
      >
        <Container>
          <div className="grid gap-12 lg:grid-cols-[4fr_8fr] lg:gap-20">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              titleId="faq-heading"
              className="gap-3 lg:sticky lg:top-28 lg:self-start"
              eyebrowClassName="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground"
              titleClassName="font-serif text-4xl font-normal tracking-tight text-foreground lg:text-5xl"
            />
            <FaqAccordion className="space-y-0 divide-y divide-border border-y border-border">
              {items.map((item) => (
                <FaqItem key={item.q} variant="divided" className="py-2">
                  <FaqQuestion className="py-5">
                    <span className="font-serif text-lg font-normal text-foreground">
                      {item.q}
                    </span>
                    <FaqQuestionIcon className="text-muted-foreground" />
                  </FaqQuestion>
                  <FaqAnswer asChild className="pb-6 leading-relaxed">
                    <div>{item.a}</div>
                  </FaqAnswer>
                </FaqItem>
              ))}
            </FaqAccordion>
          </div>
        </Container>
      </section>
    )
  },
})
