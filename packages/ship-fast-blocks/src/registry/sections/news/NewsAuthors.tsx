import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  PersonCard,
  PersonCardName,
  PersonCardRole,
  PersonCardBio,
} from '#/section-kit/PersonCard.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * NewsAuthors — newsprint "byline desk" columnist grid for a news outlet. On a
 * card surface: an asymmetric masthead header (mono "Masthead" tag + serif
 * heading, supporting intro against a hairline column rule) sits on a heavy
 * double rule above a responsive grid of hairline byline cards. Each card
 * opens on a mono "№ 01" index rule, then a grayscale round portrait that
 * regains color on hover, the writer's serif name and mono small-caps beat,
 * a short bio, and a footer rule carrying an underlined mono "latest column"
 * arrow-link plus the social handle. The whole card, the latest-column link
 * and the social handle route through section-kit route links. Use as a
 * masthead / contributors band on a newspaper, magazine or publication
 * homepage or about page so readers can get to know the bylines behind the
 * reporting. Renders fully with no props via baked-in defaults.
 */
export const NewsAuthors = defineCapsule({
  name: 'NewsAuthors',
  description:
    "Newsprint 'byline desk' columnist grid for a news outlet on a card surface: an asymmetric masthead header (mono Masthead tag + serif heading, supporting intro on a hairline column rule) on a heavy double rule above a responsive grid of hairline byline cards. Each card opens on a mono '№ 01' index rule, then a grayscale round portrait that regains color on hover, the writer's serif name and mono small-caps beat, a short bio, and a footer rule carrying an underlined mono 'latest column' arrow-link plus the social handle. The card, the latest-column link and the social handle route through section-kit route links. Use as a masthead / contributors band on a newspaper, magazine or publication homepage or about page so readers can get to know the bylines behind the reporting.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Short intro line under the heading. */
    intro: z.string().optional(),
    /** "Latest column" link label shared by every card. */
    columnLabel: z.string().optional(),
    /** Columnist / contributor cards. */
    authors: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
          bio: z.string(),
          handle: z.string().optional(),
          column: z.string().optional(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Meet Our Columnists'
    const intro =
      props.intro ??
      'The reporters, critics and correspondents behind the stories — get to know the bylines you read every day.'
    const columnLabel = props.columnLabel ?? 'Latest column'
    const authors = props.authors?.length
      ? props.authors
      : [
          {
            name: 'Maria Santos',
            role: 'Foreign Correspondent',
            bio: 'Reporting from conflict zones for 15 years, with recent dispatches from Gaza, Ukraine and Sudan.',
            handle: '@mariasantos',
            column: 'Letters from the Front',
            avatarAlt:
              'Professional headshot of journalist Maria Santos smiling in professional attire',
          },
          {
            name: 'James Okonkwo',
            role: 'Economics Editor',
            bio: 'Untangling markets, central banks and the global economy for readers who skipped business school.',
            handle: '@jamesokonkwo',
            column: 'The Bottom Line',
            avatarAlt:
              'Professional headshot of economics editor James Okonkwo in a dark suit',
          },
          {
            name: 'Priya Nair',
            role: 'Technology Columnist',
            bio: 'Covering AI, platforms and the people building them — with a healthy dose of skepticism.',
            handle: '@priyanair',
            column: 'Signal & Noise',
            avatarAlt:
              'Professional headshot of technology columnist Priya Nair in a bright office',
          },
          {
            name: 'Daniel Brooks',
            role: 'Political Correspondent',
            bio: 'On the campaign trail and inside the capital, following the money and the votes for over a decade.',
            handle: '@danielbrooks',
            column: 'On the Hill',
            avatarAlt:
              'Professional headshot of political correspondent Daniel Brooks in front of government building',
          },
          {
            name: 'Aisha Rahman',
            role: 'Health & Science Writer',
            bio: 'Translating peer-reviewed research into plain English, from new vaccines to the climate crisis.',
            handle: '@aisharahman',
            column: 'The Lab Notebook',
            avatarAlt:
              'Professional headshot of health and science writer Aisha Rahman wearing glasses',
          },
          {
            name: 'Marcus Lee',
            role: 'Culture Critic',
            bio: 'Film, music and the arts. Has strong opinions about endings and no patience for sequels.',
            handle: '@marcuslee',
            column: 'Final Cut',
            avatarAlt:
              'Professional headshot of culture critic Marcus Lee in a casual jacket',
          },
          {
            name: 'Elena Vogel',
            role: 'Investigations Editor',
            bio: 'Leads our investigative desk. Spent two years on the supply-chain probe that won the press award.',
            handle: '@elenavogel',
            column: 'Follow the Paper',
            avatarAlt:
              'Professional headshot of investigations editor Elena Vogel with short hair',
          },
          {
            name: 'Tariq Hassan',
            role: 'Sports Columnist',
            bio: 'From transfer windows to title races, covering the games and the business behind them.',
            handle: '@tariqhassan',
            column: 'Extra Time',
            avatarAlt:
              'Professional headshot of sports columnist Tariq Hassan in a stadium setting',
          },
        ]

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
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    )

    return (
      <section
        className={cn('bg-card pt-20 pb-16 lg:pt-24 lg:pb-20', props.className)}
      >
        <Container>
          {/* Asymmetric masthead header on a heavy double rule. */}
          <div className="mb-10 flex flex-col gap-3 border-b-2 border-foreground pb-4 shadow-[0_3px_0_-2px] shadow-border sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <div className="flex items-baseline gap-4">
              <MonoTag tone="faint" className="shrink-0">
                Masthead
              </MonoTag>
              <SectionHeading
                align="left"
                title={heading}
                className="gap-0"
                titleClassName="font-serif text-3xl font-black tracking-tight text-foreground sm:text-4xl"
              />
            </div>
            <p className="max-w-sm border-l border-border pl-4 text-sm leading-snug text-muted-foreground sm:border-l-0 sm:border-r sm:pb-1 sm:pl-0 sm:pr-4 sm:text-right">
              {intro}
            </p>
          </div>

          <ResponsiveGrid cols="1-2-4" className="gap-x-6 gap-y-6">
            {authors.map((author, i) => (
              <PersonCard
                key={author.name}
                variant="outlined"
                className={cn(
                  'group rounded-none border-border p-6 shadow-sm transition-colors duration-200 hover:border-foreground',
                  // Broken-grid stagger: every other card drops a step on desktop.
                  i % 2 === 1 && 'lg:translate-y-6',
                )}
              >
                {/* Mono index rule. */}
                <div className="flex items-baseline gap-3 border-b border-border pb-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
                    № {String(i + 1).padStart(2, '0')}
                  </span>
                  <span aria-hidden="true" className="h-px flex-1 bg-border" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                    {author.role.split(' ')[0]}
                  </span>
                </div>

                <NavbarRouteLink
                  className="mt-5 flex items-center gap-4 text-left"
                  href={author.name}
                >
                  <Image
                    alt={author.avatarAlt}
                    w={120}
                    h={120}
                    loading="lazy"
                    className="size-14 shrink-0 rounded-full border border-foreground/25 object-cover grayscale transition-[filter] duration-500 group-hover:grayscale-0"
                  />
                  <div className="min-w-0">
                    <PersonCardName className="truncate font-serif text-lg font-black tracking-tight transition-colors group-hover:text-foreground/80">
                      {author.name}
                    </PersonCardName>
                    <PersonCardRole className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em]">
                      {author.role}
                    </PersonCardRole>
                  </div>
                </NavbarRouteLink>

                <PersonCardBio className="mt-4 leading-relaxed">
                  {author.bio}
                </PersonCardBio>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-4">
                  {author.column ? (
                    <NavbarRouteLink
                      className="inline-flex items-center gap-1 border-b border-foreground pb-0.5 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground transition-colors hover:border-primary hover:text-primary active:translate-y-px"
                      href={author.column ?? author.name}
                    >
                      {columnLabel}
                      <ArrowRight className="size-3.5" />
                    </NavbarRouteLink>
                  ) : (
                    <span />
                  )}
                  {author.handle ? (
                    <NavbarRouteLink
                      className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
                      href={author.handle ?? author.name}
                    >
                      {author.handle}
                    </NavbarRouteLink>
                  ) : null}
                </div>
              </PersonCard>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
