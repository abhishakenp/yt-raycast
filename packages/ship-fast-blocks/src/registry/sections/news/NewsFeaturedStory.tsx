import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  FeaturedArticleMedia,
  FeaturedArticleContent,
  FeaturedArticleMeta,
} from '#/section-kit/FeaturedArticle.tsx'
import { StorySection } from '#/section-kit/StorySection.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * NewsFeaturedStory — front-page lead-story band for a news / editorial
 * outlet, in a full newsprint idiom. A full-bleed inverted
 * (bg-foreground/text-background) breaking-news chyron opens the band with a
 * square stamp, a clickable headline and a timestamp; below it a "Front Page"
 * mono kicker on a heavy masthead rule, then a broadsheet 8:4 split. The lead
 * article fills the left column — a grayscale hairline-framed cover with an
 * inverted overlay tag, a huge serif black headline, a drop-capped excerpt,
 * and a mono "By" byline / dateline meta row. A hairline column rule divides
 * off the right rail of secondary headlines, each a mono index + category
 * dateline, serif headline, one-line excerpt and small square grayscale
 * thumbnail separated by hairline rules. Every story and the breaking headline
 * route through section-kit route links. Use directly below the masthead as
 * the lead / featured big-story band of a newspaper, magazine or publication
 * homepage. Renders fully with no props via baked-in defaults.
 */
export const NewsFeaturedStory = defineCapsule({
  name: 'NewsFeaturedStory',
  description:
    'Front-page lead-story band for a news / editorial outlet in a full newsprint idiom: a full-bleed inverted (bg-foreground/text-background) breaking-news chyron with a square stamp, clickable headline and timestamp opens the band; below it a "Front Page" mono kicker on a heavy masthead rule, then a broadsheet 8:4 split — the lead article on the left (grayscale hairline-framed cover with inverted overlay tag, huge serif black headline, drop-capped excerpt and a mono "By" byline / dateline meta row) divided by a hairline column rule from a right rail of secondary headlines (each a mono index + category dateline, serif headline, excerpt and small square grayscale thumbnail separated by hairline rules). Stories and the breaking headline route through section-kit route links. Use directly below the masthead as the lead / featured big-story band of a newspaper, magazine or publication homepage.',
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

    return (
      <StorySection
        className={cn('relative bg-background pt-20 lg:pt-24', props.className)}
      >
        {/* Full-bleed inverted breaking-news chyron. */}
        <div className="bg-foreground text-background">
          <Container className="flex items-center gap-3 py-2.5">
            <span className="shrink-0 rounded-none bg-background px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-foreground">
              {breakingBadge}
            </span>
            <NavbarRouteLink
              className="min-w-0 truncate text-left font-serif text-sm font-medium text-background underline-offset-2 hover:underline lg:text-base"
              href={breakingHeadline}
            >
              {breakingHeadline}
            </NavbarRouteLink>
            <span className="ml-auto shrink-0 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.16em] text-background/60">
              {breakingTime}
            </span>
          </Container>
        </div>

        <Container className="pt-10 pb-10 lg:pt-14 lg:pb-14">
          {/* Front-page kicker on a heavy masthead rule. */}
          <div className="mb-8 flex items-center gap-4 border-b-2 border-foreground pb-3 shadow-[0_3px_0_-2px] shadow-border">
            <MonoTag tone="primary" className="shrink-0">
              Front Page
            </MonoTag>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <MonoTag tone="faint" className="text-[10px]">
              {date}
            </MonoTag>
          </div>

          {/* Broadsheet 8:4 split with a hairline column rule. */}
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-0">
            {/* Lead story. */}
            <article className="group lg:col-span-8 lg:pr-10">
              <NavbarRouteLink className="block w-full text-left" href={title}>
                <FeaturedArticleMedia className="relative aspect-[16/9] overflow-hidden rounded-none border border-foreground/25 bg-muted lg:aspect-[21/9]">
                  <Image
                    alt={imageAlt}
                    w={1200}
                    h={500}
                    className="size-full object-cover grayscale transition-[filter,transform] duration-500 group-hover:scale-[1.02] group-hover:grayscale-0"
                  />
                  <span className="absolute left-0 top-0 rounded-none bg-foreground px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-background">
                    {tag}
                  </span>
                </FeaturedArticleMedia>
                <FeaturedArticleContent className="mt-6">
                  <h1 className="font-serif text-3xl font-black leading-[1.05] tracking-tight text-foreground transition-colors group-hover:text-foreground/80 lg:text-[2.75rem]">
                    {title}
                  </h1>
                  <p className="mt-4 border-l-2 border-foreground/25 pl-5 text-base leading-relaxed text-muted-foreground first-letter:float-left first-letter:mr-2.5 first-letter:font-serif first-letter:text-5xl first-letter:font-black first-letter:leading-[0.8] first-letter:text-foreground lg:text-lg">
                    {excerpt}
                  </p>
                  <FeaturedArticleMeta className="mt-5 gap-x-3 gap-y-1 border-t border-border pt-4">
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground">
                      By {author}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-muted-foreground/40"
                    >
                      ·
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      {date}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-muted-foreground/40"
                    >
                      ·
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      {readTime}
                    </span>
                  </FeaturedArticleMeta>
                </FeaturedArticleContent>
              </NavbarRouteLink>
            </article>

            {/* Secondary rail behind a hairline column rule. */}
            <div className="flex flex-col lg:col-span-4 lg:border-l lg:border-border lg:pl-10">
              <MonoTag
                tone="faint"
                className="mb-4 hidden text-[10px] lg:block"
              >
                Also in the news
              </MonoTag>
              {secondary.map((story, i) => (
                <article key={story.title} className="group">
                  <NavbarRouteLink
                    className={cn(
                      'flex w-full gap-4 py-5 text-left',
                      i > 0 && 'border-t border-border',
                    )}
                    href={story.title}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
                          № {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                          {story.category}
                        </span>
                      </div>
                      <h2 className="mt-1.5 font-serif text-base font-black leading-snug tracking-tight text-foreground underline-offset-4 transition-colors group-hover:underline lg:text-lg">
                        {story.title}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {story.excerpt}
                      </p>
                      <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        {story.time}
                      </span>
                    </div>
                    <div className="size-20 shrink-0 overflow-hidden rounded-none border border-foreground/25 bg-muted lg:size-24">
                      <Image
                        alt={story.imageAlt}
                        w={200}
                        h={200}
                        loading="lazy"
                        className="size-full object-cover grayscale transition-[filter] duration-500 group-hover:grayscale-0"
                      />
                    </div>
                  </NavbarRouteLink>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </StorySection>
    )
  },
})
