import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
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

/**
 * AccountingFirmTeam — leadership team grid for a CPA / accounting-firm site. A
 * muted band with a centered heading + lede above a responsive 1-to-4 column
 * grid of bordered cards, each with a square headshot, name, role, and short
 * bio; below sits a centered footnote with an arrow-linked "meet the full team"
 * action. Calm, trustworthy professional-services aesthetic. Headshots use the
 * alt-driven Image component; the footnote action routes through useNavigate.
 * Use to introduce partners on accounting firms, CPA practices, tax/bookkeeping
 * providers, audit firms, or advisory practices. Renders fully with no props.
 */
export const AccountingFirmTeam = defineCapsule({
  name: 'AccountingFirmTeam',
  description:
    'Leadership team grid for a CPA / accounting-firm site: a muted band with a centered heading + lede above a responsive 1-to-4 column grid of bordered cards, each with a square headshot, name, role, and short bio, plus a centered footnote with an arrow-linked meet-the-full-team action. Calm professional-services look; headshots use the alt-driven Image component and the footnote action routes through useNavigate. Use to introduce partners on accounting firms, CPA practices, tax/bookkeeping providers, audit firms, or advisory practices.',
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
    const go = useNavigate()
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
      <section className={cn('bg-muted py-20 lg:py-28', props.className)}>
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mb-16 max-w-3xl gap-0"
            titleClassName="mb-4 tracking-tight sm:text-4xl"
            subtitleClassName="text-lg"
          />

          <ResponsiveGrid cols="1-2-4">
            {members.map((member) => (
              <PersonCard key={member.name} variant="outlined" rounded="lg">
                <Image
                  alt={member.avatarAlt}
                  w={400}
                  h={400}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
                <PersonCardContent>
                  <PersonCardName className="text-lg">
                    {member.name}
                  </PersonCardName>
                  <PersonCardRole className="mb-3">
                    {member.role}
                  </PersonCardRole>
                  <PersonCardBio>{member.bio}</PersonCardBio>
                </PersonCardContent>
              </PersonCard>
            ))}
          </ResponsiveGrid>

          <div className="mt-12 text-center">
            <p className="mb-4 text-muted-foreground">{footnote}</p>
            <button
              type="button"
              onClick={() => go(footnoteCta)}
              className="inline-flex items-center font-medium text-foreground transition-colors hover:text-muted-foreground"
            >
              {footnoteCta}
              <ArrowRight className="ml-2 size-4" />
            </button>
          </div>
        </Container>
      </section>
    )
  },
})
