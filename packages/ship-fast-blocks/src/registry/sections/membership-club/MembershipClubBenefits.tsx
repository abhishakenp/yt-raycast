import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * MembershipClubBenefits — collapsed-border member-benefits ledger for a private
 * membership club / exclusive community page. A left-aligned mono micro-label
 * kicker + serif heading + supporting line sit above a sharp-cornered,
 * collapsed-border 2-column ledger of benefit cells divided by shared hairlines,
 * each opening with a mono index numeral, a serif title, and a relaxed muted
 * description. Use to spell out what a membership includes — introductions,
 * clubhouses, events, retreats, resources, community — for members clubs,
 * founders/social clubs, professional networks, curated communities or
 * coworking/clubhouse memberships. Renders fully with no props.
 */
export const MembershipClubBenefits = defineCapsule({
  name: 'MembershipClubBenefits',
  description:
    'Collapsed-border member-benefits ledger for a private membership club / exclusive community page: a left-aligned mono micro-label kicker + serif heading + supporting line above a sharp-cornered, collapsed-border 2-column ledger of benefit cells divided by shared hairlines, each opening with a mono index numeral, a serif title, and a relaxed muted description. Use to spell out what a membership includes — introductions, clubhouses, events, retreats, resources, community — for members clubs, founders/social clubs, professional networks, curated communities or coworking/clubhouse memberships.',
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

    return (
      <section
        className={cn('w-full bg-background py-20 lg:py-28', props.className)}
        aria-labelledby="benefits-heading"
      >
        <Container>
          <SectionHeading
            align="left"
            eyebrow={eyebrow}
            title={heading}
            subtitle={description}
            titleId="benefits-heading"
            className="mb-14 max-w-3xl gap-4 lg:mb-20"
            eyebrowClassName="font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground"
            titleClassName="font-serif text-4xl font-normal tracking-tight text-foreground lg:text-5xl"
            subtitleClassName="text-lg leading-relaxed text-muted-foreground"
          />
          <div className="grid border-l border-t border-border sm:grid-cols-2">
            {items.map((item, i) => (
              <div
                key={item.title}
                className="border-b border-r border-border p-8 lg:p-10"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 font-serif text-2xl font-normal text-foreground">
                  {item.title}
                </h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
