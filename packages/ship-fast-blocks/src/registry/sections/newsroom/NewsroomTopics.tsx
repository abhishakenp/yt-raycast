import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { TopicGrid, TopicCard } from '#/section-kit/TopicGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * NewsroomTopics — an editorial "Browse by section" block for a digital
 * newsroom / magazine. A serif heading + supporting subheading above a
 * responsive 1/2/4-up grid of topic cards. Each card has an image band, the
 * topic name set in serif, a one-line blurb, the current top headline, and a
 * small story-count badge; cards lift on hover and route through section-kit route links.
 * Use to let readers explore by section (Politics, World, Business, Technology,
 * Science, Culture, Sport, Health…) on a news or magazine homepage. Renders
 * fully with no props.
 */
export const NewsroomTopics = defineCapsule({
  name: 'NewsroomTopics',
  description:
    "Editorial 'Browse by section/topic' block for a digital newsroom or magazine: a serif heading + supporting subheading above a responsive 1/2/4-up grid of topic cards, each with an image band, the topic name in serif, a one-line blurb, the current top headline, and a small story-count badge; cards lift on hover and route through section-kit route links. Use to let readers explore by section (Politics, World, Business, Technology, Science, Culture, Sport, Health) on a news or magazine homepage. Renders fully with no props.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Topic cards. */
    topics: z
      .array(
        z.object({
          name: z.string(),
          count: z.number(),
          blurb: z.string(),
          topHeadline: z.string().optional(),
          imageAlt: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Explore by topic'
    const subheading =
      props.subheading ??
      'Follow the stories that matter to you. Browse our newsroom by section and dive into the latest reporting.'
    const topics = props.topics?.length
      ? props.topics
      : [
          {
            name: 'Politics',
            count: 248,
            blurb: 'Power, policy, and the decisions shaping the nation.',
            topHeadline:
              'Senate clears sweeping reform bill after marathon debate',
            imageAlt: 'The dome of a national capitol building at dusk',
          },
          {
            name: 'World',
            count: 312,
            blurb: 'Global affairs, conflict, and diplomacy across borders.',
            topHeadline:
              'Leaders gather for emergency summit on regional crisis',
            imageAlt: 'A row of international flags against a grey sky',
          },
          {
            name: 'Business',
            count: 196,
            blurb: 'Markets, mergers, and the engines of the economy.',
            topHeadline: "Tech giant's earnings surprise lifts global markets",
            imageAlt: 'A glass financial district skyline at golden hour',
          },
          {
            name: 'Technology',
            count: 174,
            blurb: 'Innovation, startups, and the future of the web.',
            topHeadline: 'New open model rewrites the rules of on-device AI',
            imageAlt: 'Close-up of a circuit board with glowing traces',
          },
          {
            name: 'Science',
            count: 138,
            blurb: 'Discovery, research, and the frontiers of knowledge.',
            topHeadline:
              'Astronomers capture sharpest image yet of a distant world',
            imageAlt: 'A radio telescope array under a starlit sky',
          },
          {
            name: 'Culture',
            count: 221,
            blurb: 'Film, books, music, and the conversations of the moment.',
            topHeadline: "A debut novelist's quiet masterpiece tops the charts",
            imageAlt: 'Rows of books on a warmly lit library shelf',
          },
          {
            name: 'Sport',
            count: 287,
            blurb: 'Results, rivalries, and the drama of the game.',
            topHeadline: 'Underdogs stun champions in a final for the ages',
            imageAlt: 'A floodlit stadium packed with cheering fans',
          },
          {
            name: 'Health',
            count: 159,
            blurb: 'Medicine, wellbeing, and the science of living well.',
            topHeadline: 'Landmark trial points to a new approach in care',
            imageAlt: 'A bright modern hospital corridor',
          },
        ]

    return (
      <section
        className={cn('bg-background py-20 lg:py-28', props.className)}
        aria-labelledby="newsroom-topics-heading"
      >
        <Container>
          <SectionHeading
            title={heading}
            subtitle={subheading}
            className="mx-auto mb-14 max-w-3xl gap-0"
            titleId="newsroom-topics-heading"
            titleClassName="mb-4 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <TopicGrid cols="1-2-4" className="gap-8">
            {topics.map((topic) => (
              <TopicCard
                asChild
                key={topic.name}
                className="text-left transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <NavbarRouteLink href={topic.name}>
                  <div className="relative overflow-hidden bg-muted">
                    <Image
                      alt={topic.imageAlt ?? topic.name}
                      w={600}
                      h={360}
                      loading="lazy"
                      className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                      {topic.count} stories
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="mb-2 font-serif text-xl font-semibold text-card-foreground transition-colors group-hover:text-accent">
                      {topic.name}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {topic.blurb}
                    </p>
                    {topic.topHeadline ? (
                      <p className="mt-4 border-t border-border pt-3 text-sm font-medium leading-snug text-foreground">
                        {topic.topHeadline}
                      </p>
                    ) : null}
                  </div>
                </NavbarRouteLink>
              </TopicCard>
            ))}
          </TopicGrid>
        </Container>
      </section>
    )
  },
})
