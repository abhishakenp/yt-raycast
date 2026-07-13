import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import {
  PersonCard,
  PersonCardName,
  PersonCardRole,
  PersonCardBio,
} from '#/section-kit/PersonCard.tsx'

import { Container } from '#/section-kit/Container.tsx'

/**
 * NewsAuthors — meet our columnists / contributors grid for a news outlet. On a
 * card surface: a heading with an optional intro, then a responsive grid of
 * journalist cards. Each card carries an avatar (via Image), the writer's name,
 * their beat / role, a short bio, an optional social handle and a "latest column"
 * link. The whole card, the latest-column link and the social handle route
 * through useNavigate. Use as a masthead / contributors band on a newspaper,
 * magazine or publication homepage or about page so readers can get to know the
 * bylines behind the reporting. Renders fully with no props via baked-in
 * defaults.
 */
export const NewsAuthors = defineCapsule({
  name: 'NewsAuthors',
  description:
    "Meet our columnists / contributors grid for a news outlet on a card surface: a heading with an optional intro, then a responsive grid of journalist cards. Each card has an avatar (via Image), the writer's name, their beat / role, a short bio, an optional social handle and a 'latest column' link. The card, the latest-column link and the social handle route through useNavigate. Use as a masthead / contributors band on a newspaper, magazine or publication homepage or about page so readers can get to know the bylines behind the reporting.",
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
    const go = useNavigate()
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

    const ArrowRight = ({ className }) => (
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
        className={cn('bg-card pt-28 pb-12 lg:pt-32 lg:pb-16', props.className)}
      >
        <Container>
          <div className="mb-10 max-w-2xl">
            <h2 className="text-xl font-bold text-foreground lg:text-2xl">
              {heading}
            </h2>
            {intro ? (
              <p className="mt-2 text-sm text-muted-foreground lg:text-base">
                {intro}
              </p>
            ) : null}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {authors.map((author) => (
              <PersonCard
                key={author.name}
                variant="outlined"
                rounded="xl"
                className="p-6 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => go(author.name)}
                  className="group flex items-start gap-4 text-left"
                >
                  <Image
                    alt={author.avatarAlt}
                    w={120}
                    h={120}
                    loading="lazy"
                    className="size-14 shrink-0 rounded-full object-cover"
                  />
                  <div>
                    <PersonCardName className="transition-colors group-hover:text-muted-foreground">
                      {author.name}
                    </PersonCardName>
                    <PersonCardRole>{author.role}</PersonCardRole>
                  </div>
                </button>

                <PersonCardBio className="mt-4 leading-relaxed">
                  {author.bio}
                </PersonCardBio>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-4">
                  {author.column ? (
                    <button
                      type="button"
                      onClick={() => go(author.column ?? author.name)}
                      className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                    >
                      {columnLabel}
                      <ArrowRight className="size-4" />
                    </button>
                  ) : (
                    <span />
                  )}
                  {author.handle ? (
                    <button
                      type="button"
                      onClick={() => go(author.handle ?? author.name)}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {author.handle}
                    </button>
                  ) : null}
                </div>
              </PersonCard>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
