import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Card } from '#/section-kit/Card.tsx'

import { Container } from '#/section-kit/Container.tsx'

/**
 * MembershipClubBenefits — 6-up member-benefits grid for a private membership club
 * / exclusive community page. A centered eyebrow + thin heading + supporting line
 * sit above a 3-column (responsive) grid of rounded bordered cards, each with a
 * muted rounded icon tile (introductions, clubhouses, events, retreats, library,
 * community), a medium title and a relaxed description. Use to explain what a
 * membership includes for members clubs, founders/social clubs, professional
 * networks, curated communities or coworking/clubhouse memberships. Renders fully
 * with no props.
 */
export const MembershipClubBenefits = defineCapsule({
  name: 'MembershipClubBenefits',
  description:
    '6-up member-benefits grid for a private membership club / exclusive community page: a centered eyebrow + thin heading + supporting line above a responsive 3-column grid of rounded bordered cards, each with a muted rounded icon tile (introductions, clubhouses, events, retreats, library, community), a medium title and a relaxed description. Use to explain what a membership includes for members clubs, founders/social clubs, professional networks, curated communities or coworking/clubhouse memberships.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Member Benefits'
    const heading =
      props.heading ?? 'Everything you need to connect, grow, and thrive'
    const description =
      props.description ??
      'Membership includes access to our full ecosystem of events, spaces, and private community channels.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Curated Introductions',
            description:
              'Our member success team facilitates 1-on-1 introductions based on your goals, interests, and industry. Average 4 quality matches per month.',
          },
          {
            title: 'Private Clubhouses',
            description:
              'Access to 8 private clubhouses across NYC, SF, London, Berlin, and Tokyo. Open 7am–10pm daily with meeting rooms, lounges, and cafés.',
          },
          {
            title: 'Weekly Events',
            description:
              '50+ events monthly: founder dinners, skill-sharing workshops, wellness mornings, and member-led sessions. Members can also host their own.',
          },
          {
            title: 'Global Retreats',
            description:
              'Quarterly 3-day retreats in locations like Joshua Tree, Tulum, and Lisbon. Includes accommodation, programming, and meals. 40–60 members per retreat.',
          },
          {
            title: 'Resource Library',
            description:
              'Exclusive templates, playbooks, and guides contributed by members. Covering fundraising, hiring, design systems, and operations.',
          },
          {
            title: 'Private Community',
            description:
              'Active Slack workspace with channels for advice, hiring, housing, creative collaboration, and city-specific coordination. 95% daily active rate.',
          },
        ]

    const benefitIcons: ReactNode[] = [
      <svg
        key="users"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      <svg
        key="building"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>,
      <svg
        key="calendar"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>,
      <svg
        key="globe"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg
        key="book"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>,
      <svg
        key="chat"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>,
    ]

    return (
      <section
        className={cn('w-full bg-background py-20 lg:py-32', props.className)}
        aria-labelledby="benefits-heading"
      >
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-24">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
            <h2
              id="benefits-heading"
              className="mb-6 text-3xl font-light text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {items.map((item, i) => (
              <Card
                key={item.title}
                padding="lg"
                className="transition-colors hover:border-border/60"
              >
                <div className="mb-6 grid size-12 place-items-center rounded-lg bg-muted text-foreground">
                  {benefitIcons[i % benefitIcons.length]}
                </div>
                <h3 className="mb-3 text-xl font-medium text-card-foreground">
                  {item.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
