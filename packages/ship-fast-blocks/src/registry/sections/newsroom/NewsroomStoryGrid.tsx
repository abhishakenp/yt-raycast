import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { useSyncPublicationArticles } from '../blog/publication-interactions.tsx'
import { publicationLakebed } from '../blog/publication-lakebed.ts'

import { Container } from '#/section-kit/Container.tsx'
import { Card } from '#/section-kit/Card.tsx'

/**
 * NewsroomStoryGrid — a dense editorial "Latest Stories" grid for a digital
 * newsroom or online magazine. A section header row pairs a serif heading with a
 * "View all" link on the right, separated from the grid by a hairline rule.
 * Below it, a responsive 1/2/3-column grid of magazine story cards: each card has
 * a 16:9 cover image, a small colored category tag, a serif headline, a 1-2 line
 * excerpt, and a meta line (author • date • read time). Every card routes through
 * useNavigate. Use for the main feed of a news site, publication, blog index, or
 * magazine homepage. Renders fully with no props.
 */
export const NewsroomStoryGrid = defineCapsule({
  name: 'NewsroomStoryGrid',
  description:
    "Dense editorial 'Latest Stories' grid for a digital newsroom or online magazine: a section header row with a serif heading and a 'View all' link on the right above a hairline rule, then a responsive 1/2/3-up grid of magazine story cards. Each card has a 16:9 cover image, a small colored category tag, a serif headline, a 1-2 line excerpt and a meta line (author • date • read time); cards route through useNavigate. Use for the main feed of a news site, publication, blog index, or magazine homepage.",
  props: z.object({
    /** Section heading shown on the left of the header row. */
    heading: z.string().optional(),
    /** Label for the "View all" link on the right of the header row. */
    viewAllCta: z.string().optional(),
    /** Story cards rendered in the grid. */
    stories: z
      .array(
        z.object({
          tag: z.string(),
          title: z.string(),
          excerpt: z.string(),
          author: z.string(),
          date: z.string(),
          readTime: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: publicationLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Latest Stories'
    const viewAllCta = props.viewAllCta ?? 'View all'
    const stories = props.stories?.length
      ? props.stories
      : [
          {
            tag: 'Politics',
            title: 'Senate Passes Landmark Infrastructure Bill After Late Vote',
            excerpt:
              'The sweeping package directs trillions toward roads, broadband, and clean energy in a rare show of bipartisan agreement.',
            author: 'Marcus Reed',
            date: 'Jun 22',
            readTime: '6 min read',
            imageAlt: 'Capitol building at dusk with lit dome',
          },
          {
            tag: 'Technology',
            title: 'Inside the Quiet Race to Build Smaller, Smarter AI Models',
            excerpt:
              'Startups are betting that lean, on-device models will outpace the giants on cost, privacy, and speed.',
            author: 'Priya Nair',
            date: 'Jun 22',
            readTime: '8 min read',
            imageAlt: 'Close-up of a glowing computer chip on a circuit board',
          },
          {
            tag: 'Business',
            title:
              'Markets Rally as Central Bank Signals a Pause on Rate Hikes',
            excerpt:
              'Investors cheered the shift, sending major indexes to fresh highs in afternoon trading.',
            author: 'Daniel Cho',
            date: 'Jun 21',
            readTime: '4 min read',
            imageAlt: 'Stock exchange trading floor with rising charts',
          },
          {
            tag: 'Culture',
            title: "How a Small Theater Troupe Became the Season's Biggest Hit",
            excerpt:
              'Word-of-mouth and a fearless adaptation turned a 90-seat venue into the most coveted ticket in town.',
            author: 'Sofia Marchetti',
            date: 'Jun 21',
            readTime: '5 min read',
            imageAlt: 'Stage performers under warm spotlights',
          },
          {
            tag: 'Science',
            title:
              'Astronomers Capture the Sharpest Image Yet of a Distant Galaxy',
            excerpt:
              'The new survey reveals star-forming regions in detail once thought impossible from the ground.',
            author: 'Dr. Lena Osei',
            date: 'Jun 20',
            readTime: '7 min read',
            imageAlt: 'Spiral galaxy against a deep field of stars',
          },
          {
            tag: 'Climate',
            title: 'Coastal Cities Test Floating Parks to Beat the Rising Tide',
            excerpt:
              'From Rotterdam to Lagos, engineers are reimagining the waterfront as climate pressure mounts.',
            author: 'Tomas Andersson',
            date: 'Jun 20',
            readTime: '9 min read',
            imageAlt: 'Floating green park platform on a city harbor',
          },
          {
            tag: 'Health',
            title: 'A New Approach to Sleep Could Rewrite Workplace Schedules',
            excerpt:
              'Researchers say aligning shifts with our internal clocks improves focus and cuts burnout.',
            author: 'Aisha Bello',
            date: 'Jun 19',
            readTime: '6 min read',
            imageAlt: 'Sunrise over a quiet bedroom window',
          },
          {
            tag: 'Sports',
            title: 'Underdog Side Stuns Champions in Extra-Time Thriller',
            excerpt:
              'A last-gasp goal sealed one of the most dramatic upsets the league has seen in years.',
            author: 'Jordan Hayes',
            date: 'Jun 19',
            readTime: '3 min read',
            imageAlt: 'Footballers celebrating a goal under floodlights',
          },
        ]
    useSyncPublicationArticles(
      lakebed,
      stories.map((story) => ({
        author: story.author,
        category: story.tag,
        date: story.date,
        excerpt: story.excerpt,
        target: story.title,
        title: story.title,
      })),
    )

    return (
      <section
        className={cn('bg-background py-16 lg:py-24', props.className)}
        aria-labelledby="newsroom-grid-heading"
      >
        <Container>
          <div className="flex items-end justify-between gap-4">
            <h2
              id="newsroom-grid-heading"
              className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
            <button
              type="button"
              onClick={() => go(viewAllCta)}
              className="shrink-0 text-sm font-semibold text-accent hover:underline"
            >
              {viewAllCta} &rarr;
            </button>
          </div>
          <div className="mt-6 border-t border-border" />
          <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <article key={story.title} className="group flex flex-col">
                <Card
                  asChild
                  variant="muted"
                  rounded="lg"
                  padding="none"
                  className="block w-full overflow-hidden"
                >
                  <button type="button" onClick={() => go(story.title)}>
                    <Image
                      alt={story.imageAlt}
                      w={800}
                      h={450}
                      loading="lazy"
                      className="aspect-[16/9] h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </button>
                </Card>
                <div className="mt-4 flex flex-col">
                  <span className="inline-flex w-fit items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
                    {story.tag}
                  </span>
                  <h3 className="mt-3 font-serif text-xl font-bold leading-snug text-foreground">
                    <button
                      type="button"
                      onClick={() => go(story.title)}
                      className="text-left transition-colors hover:text-accent"
                    >
                      {story.title}
                    </button>
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {story.excerpt}
                  </p>
                  <p className="mt-4 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {story.author}
                    </span>
                    {' · '}
                    {story.date}
                    {' · '}
                    {story.readTime}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
