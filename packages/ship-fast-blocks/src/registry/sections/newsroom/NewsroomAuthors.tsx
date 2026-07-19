import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  PersonCard,
  PersonCardName,
  PersonCardRole,
  PersonCardBio,
} from '#/section-kit/PersonCard.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'

/**
 * NewsroomAuthors — editorial "meet our columnists" block for a digital
 * newsroom or magazine. A serif heading + supporting lede above a responsive
 * 1/2/3/4-up grid of contributor cards, each with a round alt-driven avatar, a
 * serif name, a primary-colored beat/role, a one-to-two-line bio, the linked
 * title of their latest column, and small social handles. Links route through
 * useNavigate; avatars use the Image component. Renders fully with no props.
 * Use to introduce columnists, correspondents, and contributors for a news,
 * magazine, or publication site.
 */
export const NewsroomAuthors = defineCapsule({
  name: 'NewsroomAuthors',
  description:
    "Editorial 'meet our columnists' block for a digital newsroom or magazine: a serif heading + supporting lede above a responsive 1/2/3/4-up grid of contributor cards, each with a round alt-driven avatar, a serif name, a primary-colored beat/role, a one-to-two-line bio, the linked title of their latest column, and small social handles. Links route through useNavigate; avatars use the Image component. Use to introduce columnists, correspondents, and contributors for a news, magazine, or publication site.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    subheading: z.string().optional(),
    /** Author / columnist cards. */
    authors: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
          bio: z.string(),
          latest: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Meet our columnists'
    const subheading =
      props.subheading ??
      'The voices behind our reporting — correspondents and contributors covering the stories that shape the day, from the capitol to the lab bench.'
    const authors = props.authors?.length
      ? props.authors
      : [
          {
            name: 'Eleanor Hayes',
            role: 'Chief Political Correspondent',
            bio: 'Two decades on the campaign trail, covering elections, the White House, and the machinery of power.',
            latest: 'Inside the Quiet Realignment of the Suburban Vote',
            avatarAlt:
              'professional headshot of a poised female political journalist with short silver hair',
          },
          {
            name: 'Marcus Adeyemi',
            role: 'Technology Editor',
            bio: 'Tracks the platforms, chips, and founders reshaping how the world computes — and who pays the price.',
            latest: "The AI Boom's Hidden Bill Is Coming Due",
            avatarAlt:
              'professional headshot of a confident male technology editor with glasses and a dark beard',
          },
          {
            name: 'Priya Raman',
            role: 'Economics Columnist',
            bio: 'Translates central-bank minutes and labor data into the story of your paycheck and your mortgage.',
            latest: 'Why the Soft Landing Still Feels Like Turbulence',
            avatarAlt:
              'professional headshot of a thoughtful female economics columnist with long dark hair',
          },
          {
            name: 'Daniel Whitcombe',
            role: 'Culture Critic',
            bio: 'Film, television, and the arguments we have about them — sharp, generous, and never breathless.',
            latest: 'The Streaming Era Finally Ran Out of Endings',
            avatarAlt:
              'professional headshot of a stylish male culture critic in a tweed jacket',
          },
          {
            name: 'Sofia Marchetti',
            role: 'Science Correspondent',
            bio: 'Reports from labs and field sites on climate, medicine, and the frontiers of what we can measure.',
            latest: "A New Map of the Brain's Quietest Cells",
            avatarAlt:
              'professional headshot of a smiling female science correspondent with curly auburn hair',
          },
          {
            name: 'James Okoro',
            role: 'Opinion Columnist',
            bio: 'Argues the hard cases on civil liberties, the courts, and the bargains democracies make.',
            latest: 'The Case Against Convenience',
            avatarAlt:
              'professional headshot of a distinguished male opinion columnist with a warm, serious expression',
          },
          {
            name: 'Hannah Lindqvist',
            role: 'Foreign Affairs Reporter',
            bio: 'Datelines from three continents, covering conflict, diplomacy, and the people in between.',
            latest: 'Dispatches From a Border That Keeps Moving',
            avatarAlt:
              'professional headshot of a determined female foreign correspondent with blonde hair pulled back',
          },
          {
            name: 'Theo Nakamura',
            role: 'Business Investigations',
            bio: 'Follows the money through shell companies, boardrooms, and the footnotes nobody reads.',
            latest: 'The Quiet Collapse of a Logistics Empire',
            avatarAlt:
              'professional headshot of a focused male investigative business reporter in a crisp shirt',
          },
        ]

    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <SectionHeading
            title={heading}
            subtitle={subheading}
            className="mx-auto mb-16 max-w-3xl gap-0"
            titleClassName="mb-4 font-serif text-3xl font-bold text-foreground sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <ResponsiveGrid cols="1-2-3" className="xl:grid-cols-4">
            {authors.map((a) => (
              <PersonCard
                key={a.name}
                variant="outlined"

                className="p-6 rounded-2xl"
              >
                <Image
                  alt={a.avatarAlt}
                  w={160}
                  h={160}
                  loading="lazy"
                  className="mb-5 size-20 rounded-full object-cover"
                />
                <PersonCardName className="font-serif text-xl font-bold text-card-foreground">
                  {a.name}
                </PersonCardName>
                <PersonCardRole className="mb-3 font-semibold uppercase tracking-wider text-primary">
                  {a.role}
                </PersonCardRole>
                <PersonCardBio className="mb-5 leading-relaxed">
                  {a.bio}
                </PersonCardBio>
                <div className="mt-auto">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Latest column
                  </p>
                  <button
                    type="button"
                    onClick={() => go(a.latest)}
                    className="text-left text-sm font-semibold text-accent underline-offset-4 hover:underline"
                  >
                    {a.latest}
                  </button>
                  <div className="mt-4 flex items-center gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
                    <button
                      type="button"
                      aria-label={`Follow ${a.name} on X`}
                      onClick={() => go(`${a.name} on X`)}
                      className="transition-colors hover:text-foreground"
                    >
                      @{a.name.split(' ')[0]?.toLowerCase()}
                    </button>
                    <span aria-hidden="true">·</span>
                    <button
                      type="button"
                      aria-label={`Email ${a.name}`}
                      onClick={() => go(`Email ${a.name}`)}
                      className="transition-colors hover:text-foreground"
                    >
                      Email
                    </button>
                  </div>
                </div>
              </PersonCard>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
