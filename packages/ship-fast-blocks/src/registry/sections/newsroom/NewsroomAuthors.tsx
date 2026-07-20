import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
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
 * NewsroomAuthors — full newsprint "masthead of contributors" block for a
 * digital newsroom or magazine. A serif heading + supporting lede sit over a
 * heavy edition rule, above a responsive 1/2/3/4-up run of square (rounded-none)
 * hairline contributor cards that gain a hard offset shadow on hover. Each card
 * pairs a ghost index numeral with a grayscale square avatar, a serif name, a
 * mono uppercase beat/role in the accent, a short bio, the linked title of the
 * columnist's latest piece, and small mono social handles. Links route through
 * section-kit route links; avatars use the Image component. Renders fully with
 * no props. Use to introduce columnists, correspondents, and contributors for a
 * news, magazine, or publication site.
 */
export const NewsroomAuthors = defineCapsule({
  name: 'NewsroomAuthors',
  description:
    "Full newsprint 'masthead of contributors' block for a digital newsroom or magazine: a serif heading + supporting lede over a heavy edition rule, above a responsive 1/2/3/4-up run of square (rounded-none) hairline contributor cards that gain a hard offset shadow on hover. Each card pairs a ghost index numeral with a grayscale square avatar, a serif name, a mono uppercase beat/role in the accent, a short bio, the linked title of the columnist's latest piece, and small mono social handles. Links route through section-kit route links; avatars use the Image component. Use to introduce columnists, correspondents, and contributors for a news, magazine, or publication site.",
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
          <div className="mb-14 border-b-2 border-foreground pb-6">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={subheading}
              className="max-w-3xl gap-0"
              titleClassName="mb-4 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              subtitleClassName="text-lg text-muted-foreground"
            />
          </div>
          <ResponsiveGrid cols="1-2-3" className="gap-6 xl:grid-cols-4">
            {authors.map((a, i) => (
              <PersonCard
                key={a.name}
                variant="outlined"
                className="group relative rounded-none p-6 transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0] hover:shadow-foreground/15"
              >
                <span
                  aria-hidden="true"
                  className="absolute right-4 top-4 font-mono text-[11px] tabular-nums text-muted-foreground/60"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <Image
                  alt={a.avatarAlt}
                  w={160}
                  h={160}
                  loading="lazy"
                  className="mb-5 size-20 rounded-none border border-border object-cover grayscale"
                />
                <PersonCardName className="font-serif text-xl font-bold text-card-foreground">
                  {a.name}
                </PersonCardName>
                <PersonCardRole className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                  {a.role}
                </PersonCardRole>
                <PersonCardBio className="mb-5 leading-relaxed">
                  {a.bio}
                </PersonCardBio>
                <div className="mt-auto">
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Latest column
                  </p>
                  <NavbarRouteLink
                    className="text-left font-serif text-sm font-semibold text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                    href={a.latest}
                  >
                    {a.latest}
                  </NavbarRouteLink>
                  <div className="mt-4 flex items-center gap-3 border-t border-border pt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    <NavbarRouteLink
                      aria-label={`Follow ${a.name} on X`}
                      className="transition-colors hover:text-foreground"
                      href={`${a.name} on X`}
                    >
                      @{a.name.split(' ')[0]?.toLowerCase()}
                    </NavbarRouteLink>
                    <span aria-hidden="true">·</span>
                    <NavbarRouteLink
                      aria-label={`Email ${a.name}`}
                      className="transition-colors hover:text-foreground"
                      href={`Email ${a.name}`}
                    >
                      Email
                    </NavbarRouteLink>
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
