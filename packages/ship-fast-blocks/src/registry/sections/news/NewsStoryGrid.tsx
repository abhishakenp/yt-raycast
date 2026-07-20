import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { StoryGrid } from '#/section-kit/StoryGrid.tsx'
import { Card } from '#/section-kit/Card.tsx'
import {
  ArticleGrid,
  ArticleCard,
  ArticleMedia,
  ArticleContent,
  ArticleMeta,
} from '#/section-kit/ArticleGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * NewsStoryGrid — latest-stories broadsheet grid for a news / editorial
 * outlet, in a full newsprint idiom. On a subtle muted band: a serif "Latest
 * Stories" heading on a heavy double masthead rule beside a row of mono
 * square-tab filters (All / News / Opinion / Analysis), then a hairline
 * article grid where the lead story spans two columns on desktop. Each card is
 * a sharp rounded-none hairline plate opening on a mono index + category
 * dateline rule, a grayscale cover that regains color on hover, a serif black
 * headline that underlines on hover, a clamped excerpt, and a mono "By" byline
 * / read-time footer rule — closing with a centered square invert-on-hover
 * "Load More" button. Every card, filter and the load-more button route
 * through section-kit route links. Use as the latest-articles grid of a
 * newspaper, magazine or publication homepage. Renders fully with no props via
 * baked-in defaults.
 */
export const NewsStoryGrid = defineCapsule({
  name: 'NewsStoryGrid',
  description:
    "Latest-stories broadsheet grid for a news outlet in a full newsprint idiom: on a subtle muted band, a serif 'Latest Stories' heading on a heavy double masthead rule beside a row of mono square-tab filters (All / News / Opinion / Analysis), then a hairline article grid where the lead story spans two columns on desktop. Each card is a sharp rounded-none hairline plate with a mono index + category dateline rule, a grayscale cover that regains color on hover, a serif black headline that underlines on hover, a clamped excerpt, and a mono 'By' byline / read-time footer rule, closing with a centered square invert-on-hover 'Load More' button. Cards, filters and the load-more button route through section-kit route links. Use as the latest-articles grid of a newspaper, magazine or publication homepage.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Filter chip labels (first is the active default). */
    filters: z.array(z.string()).optional(),
    /** Load-more button label. */
    loadMore: z.string().optional(),
    /** Article cards. */
    stories: z
      .array(
        z.object({
          category: z.string(),
          time: z.string(),
          title: z.string(),
          excerpt: z.string(),
          author: z.string(),
          readTime: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Latest Stories'
    const filters = props.filters?.length
      ? props.filters
      : ['All', 'News', 'Opinion', 'Analysis']
    const loadMore = props.loadMore ?? 'Load More Stories'
    const stories = props.stories?.length
      ? props.stories
      : [
          {
            category: 'Business',
            time: '2 hours ago',
            title:
              'Global Markets Rally as Inflation Data Shows Promising Slowdown',
            excerpt:
              'S&P 500 reaches new all-time high as consumer price index rises just 2.8% annually, below economist expectations of 3.1%.',
            author: 'By Michael Torres',
            readTime: '8 min read',
            imageAlt:
              'Stock market trading floor with multiple monitors showing charts',
          },
          {
            category: 'Health',
            time: '3 hours ago',
            title:
              "New Alzheimer's Drug Shows Promise in Phase 3 Clinical Trials",
            excerpt:
              'Donanemab reduces cognitive decline by 35% in early-stage patients, offering new hope for millions of families worldwide.',
            author: 'By Dr. Emily Chen',
            readTime: '10 min read',
            imageAlt:
              'Medical research laboratory with scientist examining samples',
          },
          {
            category: 'Travel',
            time: '5 hours ago',
            title:
              "Switzerland's Hidden Alpine Villages: A Complete Guide to Off-Peak Exploration",
            excerpt:
              'Skip the crowds at Zermatt and discover these pristine mountain communities where traditional cheese-making still thrives.',
            author: 'By James Whitmore',
            readTime: '15 min read',
            imageAlt: 'Dramatic mountain landscape with snow peaks at sunrise',
          },
          {
            category: 'Tech',
            time: 'Yesterday',
            title:
              "NVIDIA's Blackwell Chips Promise 30x Performance Leap for AI Workloads",
            excerpt:
              'Next-generation GPUs reduce training time for large language models from months to days, reshaping the competitive landscape.',
            author: 'By Lisa Park',
            readTime: '12 min read',
            imageAlt:
              'Advanced computer processor chip with intricate circuit patterns',
          },
          {
            category: 'Culture',
            time: 'Yesterday',
            title:
              'Indie Films Dominate Oscar Shortlists in Historic First for Streaming',
            excerpt:
              'Netflix and A24 lead nominations as traditional studios struggle to compete with bold, auteur-driven storytelling.',
            author: 'By Alexandra Reed',
            readTime: '7 min read',
            imageAlt:
              'Film director reviewing footage on monitors in production studio',
          },
          {
            category: 'Climate',
            time: '2 days ago',
            title:
              'Renewable Energy Surpasses Coal for First Time in U.S. History',
            excerpt:
              'Wind and solar now generate 22% of American electricity, marking a historic milestone in the clean energy transition.',
            author: 'By David Martinez',
            readTime: '9 min read',
            imageAlt:
              'Wind turbines on green hills against dramatic sky at sunset',
          },
        ]

    return (
      <StoryGrid
        className={cn(
          'bg-muted/40 pt-20 pb-14 lg:pt-24 lg:pb-20',
          props.className,
        )}
      >
        <Container>
          {/* Section header on a heavy double masthead rule. */}
          <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 border-b-2 border-foreground pb-3 shadow-[0_3px_0_-2px] shadow-border">
            <SectionHeading
              align="left"
              title={heading}
              className="gap-0"
              titleClassName="font-serif text-2xl font-black tracking-tight text-foreground lg:text-3xl"
            />
            <div className="hidden items-center sm:flex">
              {filters.map((f, i) => (
                <NavbarRouteLink
                  key={f}
                  className={cn(
                    'px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors',
                    i > 0 && 'border-l border-border',
                    i === 0
                      ? 'text-foreground underline decoration-2 underline-offset-4'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  href={f}
                >
                  {f}
                </NavbarRouteLink>
              ))}
            </div>
          </div>

          <ArticleGrid cols="1-2-3" className="gap-6 lg:gap-8">
            {stories.map((story, i) => {
              const isLead = i === 0
              // The final story closes the band as a full-width horizontal
              // ledger row so the broadsheet never ends on a lone ragged cell.
              const isCloser = i === stories.length - 1 && stories.length > 4
              return (
                <ArticleCard
                  key={story.title}
                  asChild
                  variant="none"
                  className={cn(
                    'rounded-none border border-border bg-card transition-[border-color] duration-200 hover:border-foreground',
                    isLead && 'sm:col-span-2 lg:col-span-2',
                    isCloser && 'sm:col-span-2 lg:col-span-3',
                  )}
                >
                  <article>
                    <NavbarRouteLink
                      className={cn(
                        'flex h-full w-full flex-col text-left',
                        isCloser && 'lg:flex-row lg:items-stretch',
                      )}
                      href={story.title}
                    >
                      <ArticleMedia
                        aspect={isLead || isCloser ? '16-9' : '4-3'}
                        className={cn(
                          'w-full flex-shrink-0 border-b border-border',
                          isCloser &&
                            'lg:aspect-auto lg:w-[42%] lg:border-b-0 lg:border-r',
                        )}
                      >
                        <Image
                          alt={story.imageAlt}
                          w={isLead || isCloser ? 800 : 400}
                          h={isLead || isCloser ? 450 : 300}
                          loading="lazy"
                          className="size-full object-cover grayscale transition-[filter,transform] duration-500 group-hover:scale-[1.02] group-hover:grayscale-0"
                        />
                      </ArticleMedia>
                      <ArticleContent
                        className={cn('p-5', isCloser && 'lg:flex-1 lg:p-8')}
                      >
                        <ArticleMeta className="items-baseline gap-2 border-b border-border pb-3">
                          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
                            № {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                            {story.category}
                          </span>
                          <span
                            aria-hidden="true"
                            className="h-px flex-1 bg-border"
                          />
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                            {story.time}
                          </span>
                        </ArticleMeta>
                        <h3
                          className={cn(
                            'mt-3 font-serif font-black leading-snug tracking-tight text-foreground underline-offset-4 group-hover:underline group-hover:decoration-2',
                            isLead || isCloser
                              ? 'text-2xl lg:text-3xl'
                              : 'text-xl',
                          )}
                        >
                          {story.title}
                        </h3>
                        <p
                          className={cn(
                            'mt-2.5 text-sm leading-relaxed text-muted-foreground',
                            (isLead || isCloser) && 'lg:max-w-2xl lg:text-base',
                          )}
                        >
                          {story.excerpt}
                        </p>
                        <div className="mt-auto flex items-baseline justify-between gap-3 border-t border-border pt-4">
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground">
                            {story.author}
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                            {story.readTime}
                          </span>
                        </div>
                      </ArticleContent>
                    </NavbarRouteLink>
                  </article>
                </ArticleCard>
              )
            })}
          </ArticleGrid>

          <div className="mt-12 flex items-center gap-4">
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <Card
              asChild
              variant="default"
              className="cursor-pointer rounded-none border border-foreground bg-foreground p-0 px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-background transition-colors duration-150 hover:bg-background hover:text-foreground active:translate-y-px"
            >
              <NavbarRouteLink href={loadMore}>{loadMore}</NavbarRouteLink>
            </Card>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
          </div>
        </Container>
      </StoryGrid>
    )
  },
})
