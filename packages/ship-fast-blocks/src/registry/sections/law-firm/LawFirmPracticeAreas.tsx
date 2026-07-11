import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * LawFirmPracticeAreas — a centered-intro practice-areas grid for a law firm. A
 * tracked-uppercase eyebrow, serif heading and lead paragraph sit above a
 * responsive 3-up grid of bordered cards on the card surface; each card pairs a
 * squared icon tile that fills with the primary color on hover, a serif title,
 * a description, and a "Learn more →" link. Refined, authoritative editorial
 * aesthetic with sharp squared corners. Icons rotate through a built-in line-svg
 * set; each card link routes through useNavigate. Use to showcase legal service
 * lines (corporate, litigation, employment, real estate, IP, tax) on law-firm,
 * attorney, consulting or professional-services pages. Renders fully with no
 * props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
export const LawFirmPracticeAreas = defineCapsule({
  name: 'LawFirmPracticeAreas',
  description:
    "Centered-intro practice-areas grid for a law firm: a tracked-uppercase eyebrow, serif heading and lead paragraph above a responsive 3-up grid of bordered cards on the card surface, each pairing a squared icon tile that fills with the primary color on hover, a serif title, a description and a 'Learn more →' link. Refined, authoritative editorial aesthetic with sharp squared corners; icons rotate through a built-in line-svg set and each card link routes through useNavigate. Use to showcase legal service lines (corporate & securities, litigation, employment, real estate, intellectual property, tax & estates) on law-firm, attorney, consulting, accounting or professional-services pages.",
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
    const go = useNavigate()
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
      <section className={cn('bg-background py-24 lg:py-32', props.className)}>
        <Container>
          <div className="mx-auto mb-20 max-w-3xl text-center">
            <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mb-6 font-serif text-3xl text-foreground lg:text-5xl">
              {heading}
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <div
                key={item.title}
                className="group border border-border bg-card p-8 transition-colors hover:border-foreground/40"
              >
                <div className="mb-6 grid size-12 place-items-center bg-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {practiceIcons[i % practiceIcons.length]}
                </div>
                <h3 className="mb-3 font-serif text-xl text-foreground">
                  {item.title}
                </h3>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <button
                  type="button"
                  onClick={() => go(item.title)}
                  className="text-sm font-medium text-foreground hover:underline"
                >
                  {linkLabel} &rarr;
                </button>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
