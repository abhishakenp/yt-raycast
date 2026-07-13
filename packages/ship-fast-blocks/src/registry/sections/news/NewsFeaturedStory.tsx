import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

import { Container } from '#/section-kit/Container.tsx'

/**
 * NewsFeaturedStory — featured big lead story band for a news / editorial
 * outlet. A single bespoke lead/featured band on a card surface: a top
 * breaking-news banner (uppercase badge + clickable headline + timestamp), then
 * a 12-column grid anchored by one large lead article on the left (wide photo
 * with an overlaid tag, big headline, excerpt and author/date/read-time byline)
 * and a stacked rail of secondary headlines on the right (each with a category
 * label in a rotating accent tone, headline, excerpt, timestamp and a small
 * square thumbnail, divided by rules). Every story and the breaking headline
 * route through useNavigate. Use directly below the masthead as the lead/
 * featured big-story band of a newspaper, magazine or publication homepage.
 * Renders fully with no props via baked-in defaults.
 */
export const NewsFeaturedStory = defineCapsule({
  name: 'NewsFeaturedStory',
  description:
    'Featured big lead story band for a news / editorial outlet on a card surface: a top breaking-news banner (uppercase badge + clickable headline + timestamp), then a 12-column grid anchored by one large lead article on the left (wide photo with overlaid tag, big headline, excerpt and author/date/read-time byline) and a stacked rail of secondary headlines on the right (each with a rotating-accent category label, headline, excerpt, timestamp and small square thumbnail, divided by rules). Stories and the breaking headline route through useNavigate. Use directly below the masthead as the lead/featured big-story band of a newspaper, magazine or publication homepage.',
  props: z.object({
    /** Breaking-news badge label. */
    breakingBadge: z.string().optional(),
    /** Breaking-news headline. */
    breakingHeadline: z.string().optional(),
    /** Breaking-news timestamp. */
    breakingTime: z.string().optional(),
    /** Overlay tag on the lead story photo. */
    tag: z.string().optional(),
    /** Lead story headline. */
    title: z.string().optional(),
    /** Lead story excerpt. */
    excerpt: z.string().optional(),
    /** Lead story author byline. */
    author: z.string().optional(),
    /** Lead story date. */
    date: z.string().optional(),
    /** Lead story read time. */
    readTime: z.string().optional(),
    /** Lead story photo alt (drives the image search). */
    imageAlt: z.string().optional(),
    /** Stacked rail of secondary headlines. */
    secondary: z
      .array(
        z.object({
          category: z.string(),
          title: z.string(),
          excerpt: z.string(),
          time: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const breakingBadge = props.breakingBadge ?? 'Breaking'
    const breakingHeadline =
      props.breakingHeadline ??
      'Federal Reserve announces 0.25% interest rate cut amid economic uncertainty'
    const breakingTime = props.breakingTime ?? '2 min ago'
    const tag = props.tag ?? 'Featured'
    const title =
      props.title ??
      'Inside the Newsroom: How Investigative Journalism is Evolving in the Digital Age'
    const excerpt =
      props.excerpt ??
      "A year-long study reveals the transformation of investigative reporting as newsrooms adapt to shrinking budgets, AI tools, and changing reader habits across America's leading publications."
    const author = props.author ?? 'Sarah Mitchell'
    const date = props.date ?? 'January 15, 2026'
    const readTime = props.readTime ?? '12 min read'
    const imageAlt =
      props.imageAlt ??
      'Newsroom journalist working at computer screens in modern newsroom'
    const secondary = props.secondary?.length
      ? props.secondary
      : [
          {
            category: 'Politics',
            title:
              'Senate Passes Infrastructure Bill with Historic Climate Provisions',
            excerpt:
              'Bipartisan vote marks major legislative victory for Biden administration.',
            time: '4 hours ago',
            imageAlt: 'United States Capitol building dome against blue sky',
          },
          {
            category: 'Tech',
            title:
              'Apple Unveils Mixed Reality Headset Pro with Revolutionary Display',
            excerpt: '$3,499 device promises to transform spatial computing.',
            time: '6 hours ago',
            imageAlt:
              'Person wearing modern VR virtual reality headset in bright studio',
          },
          {
            category: 'Science',
            title:
              'James Webb Telescope Discovers Water Vapor on Distant Exoplanet',
            excerpt:
              'Finding suggests potential for habitable conditions 120 light-years away.',
            time: '8 hours ago',
            imageAlt:
              'James Webb Space Telescope golden hexagonal mirrors closeup',
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
        className={cn('bg-card pt-28 pb-8 lg:pt-32 lg:pb-12', props.className)}
      >
        <Container>
          {/* Breaking banner */}
          <div className="mb-8 flex items-center gap-3">
            <span className="rounded bg-destructive px-3 py-1 text-xs font-semibold uppercase tracking-wider text-destructive-foreground">
              {breakingBadge}
            </span>
            <button
              type="button"
              onClick={() => go(breakingHeadline)}
              className="text-left text-sm font-medium text-foreground hover:underline lg:text-base"
            >
              {breakingHeadline}
            </button>
            <span className="ml-auto whitespace-nowrap text-xs text-muted-foreground">
              {breakingTime}
            </span>
          </div>

          {/* Featured grid */}
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
            {/* Lead story */}
            <article className="group lg:col-span-8">
              <button
                type="button"
                onClick={() => go(title)}
                className="block w-full text-left"
              >
                <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-muted lg:aspect-[21/9]">
                  <Image
                    alt={imageAlt}
                    w={1200}
                    h={500}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded bg-foreground px-3 py-1 text-xs font-semibold uppercase tracking-wider text-background">
                    {tag}
                  </span>
                </div>
                <div className="mt-5">
                  <h1 className="text-2xl font-bold leading-tight text-foreground transition-colors group-hover:text-muted-foreground lg:text-4xl">
                    {title}
                  </h1>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground lg:text-lg">
                    {excerpt}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {author}
                    </span>
                    <span aria-hidden="true">•</span>
                    <span>{date}</span>
                    <span aria-hidden="true">•</span>
                    <span>{readTime}</span>
                  </div>
                </div>
              </button>
            </article>

            {/* Secondary rail */}
            <div className="flex flex-col gap-6 lg:col-span-4">
              {secondary.map((story, i) => (
                <div key={story.title}>
                  <article className="group">
                    <button
                      type="button"
                      onClick={() => go(story.title)}
                      className="flex w-full gap-4 text-left"
                    >
                      <div className="flex-1">
                        <span
                          className={cn(
                            'text-xs font-semibold uppercase tracking-wider',
                            toneFor(story.category),
                          )}
                        >
                          {story.category}
                        </span>
                        <h2 className="mt-1 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-muted-foreground lg:text-lg">
                          {story.title}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {story.excerpt}
                        </p>
                        <span className="mt-2 block text-xs text-muted-foreground">
                          {story.time}
                        </span>
                      </div>
                      <div className="size-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted lg:size-28">
                        <Image
                          alt={story.imageAlt}
                          w={200}
                          h={200}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    </button>
                  </article>
                  {i < secondary.length - 1 && (
                    <hr className="mt-6 border-border" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
