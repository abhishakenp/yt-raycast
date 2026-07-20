import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { useSyncPublicationArticles } from '../blog/publication-interactions.tsx'
import { publicationLakebed } from '../blog/publication-lakebed.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { StoryGrid } from '#/section-kit/StoryGrid.tsx'
import {
  ArticleGrid,
  ArticleCard,
  ArticleMedia,
  ArticleContent,
  ArticleMeta,
} from '#/section-kit/ArticleGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * NewsroomStoryGrid — full newsprint "Latest Stories" ledger for a digital
 * newsroom or online magazine. A masthead header row pairs a serif heading with
 * a mono "View all" link over a heavy edition rule, then a collapsed-border
 * newspaper grid: hairline dividers between every cell, the lead story
 * spanning two columns as an oversized front-page well, and the rest set as a
 * dense multi-column run. Each cell has a 16:9 grayscale cover image, a mono
 * uppercase category rule, a serif headline and a mono meta line (author · date
 * · read time); cards route through section-kit route links. Use for the main
 * feed of a news site, publication, blog index, or magazine homepage. Renders
 * fully with no props.
 */
export const NewsroomStoryGrid = defineCapsule({
  name: 'NewsroomStoryGrid',
  description:
    "Full newsprint 'Latest Stories' ledger for a digital newsroom or online magazine: a masthead header row with a serif heading and a mono 'View all' link over a heavy edition rule, then a collapsed-border newspaper grid — hairline dividers between every cell, the lead story spanning two columns as an oversized front-page well, and the rest set as a dense multi-column run. Each cell has a 16:9 grayscale cover image, a mono uppercase category rule, a serif headline and a mono meta line (author · date · read time); cards route through section-kit route links. Use for the main feed of a news site, publication, blog index, or magazine homepage.",
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
      <StoryGrid
        className={cn('bg-background py-16 lg:py-24', props.className)}
        aria-labelledby="newsroom-grid-heading"
      >
        <Container>
          <div className="flex items-end justify-between gap-4 border-b-2 border-foreground pb-4">
            <SectionHeading
              align="left"
              title={heading}
              className="gap-0"
              titleId="newsroom-grid-heading"
              titleClassName="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            />
            <NavbarRouteLink
              className="shrink-0 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary transition-colors hover:text-foreground"
              href={viewAllCta}
            >
              {viewAllCta} &rarr;
            </NavbarRouteLink>
          </div>
          <ArticleGrid
            cols="1-2-3"
            className="mt-0 gap-0 border-l border-t border-border"
          >
            {stories.map((story, i) => {
              const lead = i === 0
              return (
                <ArticleCard
                  key={story.title}
                  variant="none"
                  className={cn(
                    'group rounded-none border-b border-r border-border p-5 transition-colors hover:bg-muted/40',
                    lead ? 'sm:col-span-2 lg:col-span-2' : '',
                  )}
                >
                  <ArticleMedia
                    aspect="16-9"
                    className="block w-full rounded-none border border-border"
                  >
                    <NavbarRouteLink href={story.title}>
                      <Image
                        alt={story.imageAlt}
                        w={lead ? 1200 : 800}
                        h={lead ? 675 : 450}
                        loading="lazy"
                        className="aspect-[16/9] h-auto w-full object-cover grayscale transition-all duration-300 group-hover:grayscale-0"
                      />
                    </NavbarRouteLink>
                  </ArticleMedia>
                  <ArticleContent className="mt-4">
                    <span className="inline-flex w-fit items-center border-l-2 border-primary pl-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                      {story.tag}
                    </span>
                    <h3
                      className={cn(
                        'mt-3 font-serif font-bold leading-snug text-foreground',
                        lead ? 'text-2xl sm:text-3xl' : 'text-xl',
                      )}
                    >
                      <NavbarRouteLink
                        className="text-left transition-colors hover:text-primary"
                        href={story.title}
                      >
                        {story.title}
                      </NavbarRouteLink>
                    </h3>
                    <p
                      className={cn(
                        'mt-2 text-sm leading-relaxed text-muted-foreground',
                        lead ? 'line-clamp-3' : 'line-clamp-2',
                      )}
                    >
                      {story.excerpt}
                    </p>
                    <ArticleMeta className="mt-4 font-mono text-[11px] uppercase tracking-[0.12em]">
                      <span className="font-medium text-foreground">
                        {story.author}
                      </span>
                      {' · '}
                      {story.date}
                      {' · '}
                      {story.readTime}
                    </ArticleMeta>
                  </ArticleContent>
                </ArticleCard>
              )
            })}
          </ArticleGrid>
        </Container>
      </StoryGrid>
    )
  },
})
