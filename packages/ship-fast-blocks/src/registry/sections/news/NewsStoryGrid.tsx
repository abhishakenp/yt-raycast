import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

import { Container } from '#/section-kit/Container.tsx'

/**
 * NewsStoryGrid — latest stories grid for a news / editorial outlet. On a subtle
 * muted band: a "Latest Stories" heading with a row of filter chips (All / News /
 * Opinion / Analysis) on the right, then a responsive grid of recent article
 * cards (sm:2-up, lg:3-up) — each a bordered card with a 4:3 photo on top, a
 * category label (rotating accent tone) + timestamp, headline, excerpt and an
 * author/read-time byline — closing with a centered "Load More" button. Every
 * card, filter and the load-more button route through useNavigate. Use as the
 * latest-articles grid of a newspaper, magazine or publication homepage. Renders
 * fully with no props via baked-in defaults.
 */
export const NewsStoryGrid = defineCapsule({
  name: 'NewsStoryGrid',
  description:
    "Latest stories grid for a news outlet on a subtle muted band: a 'Latest Stories' heading with a row of filter chips (All / News / Opinion / Analysis) on the right, then a responsive grid of recent article cards (sm:grid-cols-2 lg:grid-cols-3) — each a bordered card with a 4:3 photo on top, a rotating-accent category label + timestamp, headline, excerpt and author/read-time byline — closing with a centered 'Load More' button. Cards, filters and the load-more button route through useNavigate. Use as the latest-articles grid of a newspaper, magazine or publication homepage.",
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
    const go = useNavigate()
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

    // Rotate category labels through theme accent tokens (no raw palette colors).
    const catTones = [
      'text-primary',
      'text-secondary-foreground',
      'text-accent-foreground',
      'text-chart-1',
      'text-chart-2',
      'text-chart-3',
      'text-chart-4',
      'text-chart-5',
    ]
    const toneFor = (key) => {
      let h = 0
      for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0
      return catTones[Math.abs(h) % catTones.length]
    }

    return (
      <section
        className={cn(
          'bg-muted/40 pt-28 pb-8 lg:pt-32 lg:pb-12',
          props.className,
        )}
      >
        <Container>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground lg:text-2xl">
              {heading}
            </h2>
            <div className="hidden items-center gap-2 sm:flex">
              {filters.map((f, i) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => go(f)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                    i === 0
                      ? 'border-border bg-card text-foreground'
                      : 'border-transparent text-muted-foreground hover:border-border hover:bg-card hover:text-foreground',
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {stories.map((story) => (
              <article
                key={story.title}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => go(story.title)}
                  className="flex h-full w-full flex-col text-left"
                >
                  <div className="aspect-[4/3] w-full flex-shrink-0 overflow-hidden bg-muted">
                    <Image
                      alt={story.imageAlt}
                      w={400}
                      h={300}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={cn(
                          'text-xs font-semibold uppercase tracking-wider',
                          toneFor(story.category),
                        )}
                      >
                        {story.category}
                      </span>
                      <span
                        aria-hidden="true"
                        className="text-xs text-muted-foreground"
                      >
                        •
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {story.time}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-muted-foreground">
                      {story.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {story.excerpt}
                    </p>
                    <div className="mt-auto flex items-center gap-3 pt-4 text-xs text-muted-foreground">
                      <span>{story.author}</span>
                      <span aria-hidden="true">•</span>
                      <span>{story.readTime}</span>
                    </div>
                  </div>
                </button>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => go(loadMore)}
              className="rounded-lg border border-border bg-card px-6 py-3 font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {loadMore}
            </button>
          </div>
        </Container>
      </section>
    )
  },
})
