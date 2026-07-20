import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * LawFirmPracticeAreas — a practice-areas ledger for a law firm. An asymmetric
 * header (mono eyebrow, giant serif heading and lead paragraph left, tabular
 * area count right) sits above a collapsed-border ledger grid on the card
 * surface: each cell shares hairline column rules and carries a mono "No. 0x"
 * case index, a quiet line-icon corner mark, a serif title, a description and a
 * "Learn more →" routed link with press feedback, washing to muted on hover. A
 * giant faint serif watermark bleeds behind the band. Authoritative,
 * traditional-yet-modern newsprint aesthetic with sharp binary corners. Icons
 * rotate through a built-in line-svg set; each link routes through section-kit
 * route links. Use to showcase legal service lines (corporate, litigation,
 * employment, real estate, IP, tax) on law-firm, attorney, consulting or
 * professional-services pages. Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  PracticeAreaGrid,
  PracticeAreaCard,
  PracticeAreaIcon,
} from '#/section-kit/PracticeAreaGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'
export const LawFirmPracticeAreas = defineCapsule({
  name: 'LawFirmPracticeAreas',
  description:
    "Practice-areas ledger for a law firm: an asymmetric header (mono eyebrow, giant serif heading and lead paragraph left, tabular area count right) above a collapsed-border ledger grid on the card surface, each cell sharing hairline column rules and carrying a mono 'No. 0x' case index, a quiet line-icon corner mark, a serif title, a description and a 'Learn more →' routed link with press feedback, washing to muted on hover, behind a giant faint serif watermark. Authoritative, traditional-yet-modern newsprint aesthetic with sharp binary corners; icons rotate through a built-in line-svg set and each link routes through section-kit route links. Use to showcase legal service lines (corporate & securities, litigation, employment, real estate, intellectual property, tax & estates) on law-firm, attorney, consulting, accounting or professional-services pages.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    linkLabel: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Practice Areas'
    const heading = props.heading ?? 'Comprehensive Legal Expertise'
    const description =
      props.description ??
      'Our attorneys provide strategic counsel across the full spectrum of business and personal legal needs, from complex M&A transactions to high-stakes litigation.'
    const linkLabel = props.linkLabel ?? 'Learn more'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Corporate & Securities',
            description:
              'Mergers and acquisitions, corporate governance, SEC compliance, private placements, and strategic joint ventures for public and private companies.',
          },
          {
            title: 'Commercial Litigation',
            description:
              'Complex business disputes, breach of contract, shareholder litigation, intellectual property disputes, and class action defense in state and federal courts.',
          },
          {
            title: 'Employment Law',
            description:
              'Executive compensation, employment agreements, wrongful termination defense, workplace investigations, and ERISA compliance counseling.',
          },
          {
            title: 'Real Estate',
            description:
              'Commercial acquisitions and sales, development projects, leasing, financing, land use approvals, and construction law for developers and investors.',
          },
          {
            title: 'Intellectual Property',
            description:
              'Patent and trademark prosecution, copyright registration, IP litigation, technology licensing, and strategic portfolio management for innovators.',
          },
          {
            title: 'Tax & Estates',
            description:
              'Tax planning, IRS dispute resolution, trust and estate administration, wealth transfer strategies, and charitable planning for high-net-worth individuals.',
          },
        ]
    const practiceIcons: ReactNode[] = [
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
        key="scales"
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
        <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>,
      <svg
        key="briefcase"
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
        <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>,
      <svg
        key="home"
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
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>,
      <svg
        key="bulb"
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
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>,
      <svg
        key="calc"
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
        <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>,
    ]
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-20 sm:py-24 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-right-6 top-8 font-serif text-[9rem] font-normal tracking-tight sm:text-[13rem] lg:text-[17rem]">
          §
        </Watermark>
        <Container className="relative">
          <div className="mb-12 flex flex-col gap-6 sm:mb-16 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              className="max-w-3xl gap-0"
              eyebrowClassName="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mb-6 font-serif text-4xl font-semibold tracking-tight text-foreground lg:text-5xl"
              subtitleClassName="text-lg leading-relaxed text-muted-foreground"
            />
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums text-muted-foreground/60"
            >
              {String(items.length).padStart(2, '0')} areas
            </span>
          </div>
          <PracticeAreaGrid
            cols="1-2-3"
            className="gap-0 border-l border-t border-border"
          >
            {items.map((item, i) => (
              <PracticeAreaCard
                key={item.title}
                className="rounded-none border-0 border-b border-r border-border bg-card transition-colors hover:bg-muted/40"
              >
                <div className="flex h-full flex-col gap-3 p-6 sm:p-7">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] tabular-nums text-muted-foreground/60">
                      No. {String(i + 1).padStart(2, '0')}
                    </span>
                    <PracticeAreaIcon className="mb-0 inline-flex size-7 rounded-none bg-transparent text-muted-foreground transition-colors group-hover:bg-transparent group-hover:text-primary">
                      {practiceIcons[i % practiceIcons.length]}
                    </PracticeAreaIcon>
                  </div>
                  <h3 className="font-serif text-xl text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                  <NavbarRouteLink
                    href={item.title}
                    className="mt-auto inline-flex w-fit items-center gap-1.5 pt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-foreground transition-all duration-150 hover:text-primary active:translate-y-px"
                  >
                    {linkLabel}
                    <span aria-hidden="true">&rarr;</span>
                  </NavbarRouteLink>
                </div>
              </PracticeAreaCard>
            ))}
          </PracticeAreaGrid>
        </Container>
      </section>
    )
  },
})
