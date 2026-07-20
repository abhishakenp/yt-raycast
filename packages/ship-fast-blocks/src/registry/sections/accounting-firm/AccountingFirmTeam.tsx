import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import {
  PersonCard,
  PersonCardContent,
  PersonCardName,
  PersonCardRole,
  PersonCardBio,
} from '#/section-kit/PersonCard.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * AccountingFirmTeam — Swiss-ledger staggered editorial team grid for a CPA /
 * accounting-firm site. An asymmetric header (left-aligned oversized title +
 * lede, right-aligned mono tabular partner count) above a 2-to-4 column grid of
 * sharp-cornered, hairline-framed partner cards where every second card steps
 * down (md:translate-y-8) for an offset editorial rhythm; portraits sit
 * grayscale and regain color on hover, each card carries a mono index rule row
 * with a primary square tick, a serif name, a mono uppercase micro-label role,
 * and a short bio. Below, a hairline-ruled footer row pairs the footnote with an
 * underline-slide arrow link. Newsprint portrait-gallery gravitas over uniform
 * card slop. Headshots use the alt-driven Image component; the footnote action
 * routes through section-kit route links. Use to introduce partners on
 * accounting firms, CPA practices, tax/bookkeeping providers, audit firms, or
 * advisory practices. Renders fully with no props.
 */
export const AccountingFirmTeam = defineCapsule({
  name: 'AccountingFirmTeam',
  description:
    'Swiss-ledger staggered editorial team grid for a CPA / accounting-firm site: an asymmetric header (left-aligned oversized title + lede, right-aligned mono tabular partner count) above a 2-to-4 column grid of sharp-cornered hairline-framed partner cards with every second card stepped down for offset rhythm; portraits render grayscale and regain color on hover, each card carries a mono index rule row with a primary square, a serif name, a mono uppercase role micro-label, and a short bio, plus a hairline-ruled footer row with the footnote and an underline-slide arrow link. Headshots use the alt-driven Image component and the footnote action routes through section-kit route links. Use to introduce partners on accounting firms, CPA practices, tax/bookkeeping providers, audit firms, or advisory practices.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting lede under the heading. */
    description: z.string().optional(),
    /** Team members: name, role, bio and headshot alt. */
    members: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
          bio: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    /** Footnote line under the grid. */
    footnote: z.string().optional(),
    /** Arrow-linked footnote action label. */
    footnoteCta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Meet our leadership'
    const description =
      props.description ??
      'Experienced professionals committed to your financial success.'
    const members = props.members?.length
      ? props.members
      : [
          {
            name: 'Robert Northridge',
            role: 'Founder & Managing Partner, CPA',
            bio: '37 years of experience. Specializes in complex business advisory and estate planning.',
            avatarAlt:
              'professional headshot of Robert Northridge senior partner in charcoal suit with confident expression',
          },
          {
            name: 'Sarah Chen',
            role: 'Tax Partner, CPA, MST',
            bio: '18 years in taxation. Expert in multi-state tax planning and IRS dispute resolution.',
            avatarAlt:
              'professional headshot of Sarah Chen tax partner with warm smile and professional blazer',
          },
          {
            name: 'Michael Torres',
            role: 'Audit Partner, CPA',
            bio: '15 years in assurance services. Leads our nonprofit and healthcare audit practice.',
            avatarAlt:
              'professional headshot of Michael Torres audit partner with dark hair and navy suit',
          },
          {
            name: 'Jennifer Walsh',
            role: 'Advisory Partner, CPA, CFP',
            bio: '12 years in financial planning. Focuses on retirement strategies and wealth management.',
            avatarAlt:
              'professional headshot of Jennifer Walsh advisory partner with blonde hair and elegant professional attire',
          },
        ]
    const footnote =
      props.footnote ??
      'Our full team includes 20 additional professionals including senior accountants, bookkeepers, and support staff.'
    const footnoteCta = props.footnoteCta ?? 'Get to know our full team'

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    return (
      <section
        className={cn(
          'border-b border-border bg-background py-16 sm:py-20 lg:py-28',
          props.className,
        )}
      >
        <Container>
          <div className="mb-10 grid items-end gap-6 sm:mb-14 lg:mb-16 lg:grid-cols-12">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="gap-4 lg:col-span-8"
              titleClassName="text-4xl font-semibold tracking-tight sm:text-5xl"
              subtitleClassName="max-w-xl text-lg"
            />
            <div
              aria-hidden="true"
              className="flex items-center justify-between gap-2 border-y border-border py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground lg:col-span-4 lg:flex-col lg:items-end lg:justify-start lg:gap-1.5 lg:border-y-0 lg:py-0"
            >
              <span className="flex items-center gap-2">
                <span className="size-1.5 bg-primary" />
                Partners
              </span>
              <span className="tabular-nums">
                {String(members.length).padStart(2, '0')}
              </span>
            </div>
          </div>

          <ResponsiveGrid
            cols="2-lg-4"
            className="gap-x-3 gap-y-8 pb-6 sm:gap-x-6 sm:gap-y-10 md:pb-8"
          >
            {members.map((member, i) => (
              <PersonCard
                key={member.name}
                variant="outlined"
                className={cn(
                  'group rounded-none',
                  i % 2 === 1 && 'translate-y-6 md:translate-y-8',
                )}
              >
                <Image
                  alt={member.avatarAlt}
                  w={400}
                  h={400}
                  loading="lazy"
                  className="aspect-square w-full object-cover grayscale transition duration-300 group-hover:grayscale-0"
                />
                <PersonCardContent className="p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between border-b border-border pb-2.5 sm:mb-4 sm:pb-3">
                    <span className="font-mono text-[11px] tabular-nums tracking-[0.2em] text-muted-foreground">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span aria-hidden="true" className="size-1.5 bg-primary" />
                  </div>
                  <PersonCardName className="font-serif text-base sm:text-lg">
                    {member.name}
                  </PersonCardName>
                  <PersonCardRole className="mb-3 mt-1 font-mono text-[10px] uppercase tracking-[0.14em]">
                    {member.role}
                  </PersonCardRole>
                  <PersonCardBio className="text-xs leading-relaxed sm:text-sm">
                    {member.bio}
                  </PersonCardBio>
                </PersonCardContent>
              </PersonCard>
            ))}
          </ResponsiveGrid>

          <div className="mt-14 flex flex-col gap-4 border-t border-border pt-6 md:mt-20 md:flex-row md:items-center md:justify-between">
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              {footnote}
            </p>
            <NavbarRouteLink
              className="group inline-flex shrink-0 items-center gap-2 font-medium text-foreground"
              href={footnoteCta}
            >
              <span className="relative">
                {footnoteCta}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-primary transition-transform duration-200 group-hover:scale-x-100"
                />
              </span>
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </NavbarRouteLink>
          </div>
        </Container>
      </section>
    )
  },
})
