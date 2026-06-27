import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * MembershipClubFaq — accordion FAQ for a private membership club / exclusive
 * community page. A narrow centered column with an eyebrow + thin heading above a
 * stack of native <details> accordions: each rounded bordered card shows a medium
 * question and a chevron that rotates when open, revealing a relaxed answer. Use to
 * address eligibility, acceptance rate, tier switching and policy questions for
 * members clubs, professional networks, mastermind groups or curated communities.
 * Renders fully with no props.
 */
export const MembershipClubFaq = defineCapsule({
  name: 'MembershipClubFaq',
  description:
    'Accordion FAQ for a private membership club / exclusive community page: a narrow centered column with an eyebrow + thin heading above a stack of native <details> accordions, each a rounded bordered card showing a medium question and a chevron that rotates when open, revealing a relaxed answer. Use to address eligibility, acceptance rate, tier switching and policy questions for members clubs, professional networks, mastermind groups or curated communities.',
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

    const Chevron = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
        aria-hidden="true"
      >
        <path d="M19 9l-7 7-7-7" />
      </svg>
    )

    return (
      <section
        className={cn('w-full bg-background py-20 lg:py-32', props.className)}
        aria-labelledby="faq-heading"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
            <h2
              id="faq-heading"
              className="mb-6 text-3xl font-light text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
          </div>
          <div className="space-y-4">
            {items.map((item) => (
              <details
                key={item.q}
                className="group rounded-lg border border-border bg-card"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                  <span className="font-medium text-card-foreground">
                    {item.q}
                  </span>
                  <Chevron />
                </summary>
                <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
