import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { HeroSection } from '#/section-kit/HeroSection.tsx'
import { Watermark, MonoTag } from '#/section-kit/Decor.tsx'
import {
  FeaturedArticleMedia,
  FeaturedArticleContent,
  FeaturedArticleMeta,
} from '#/section-kit/FeaturedArticle.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { useSyncPublicationArticles } from './publication-interactions.tsx'
import { publicationLakebed } from './publication-lakebed.ts'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * BlogHero — newsprint front-page lead story for an editorial blog /
 * publication index. Under a mono dateline row (badge stamp · date · read
 * time) closed by a heavy double masthead rule, an asymmetric 7:5 editorial
 * split over a giant ghost pilcrow watermark: on the left a mono topic kicker
 * with hairline rule, a huge serif clamp-scaled headline, the excerpt set
 * against a hairline column rule with a serif drop cap, a small-caps author
 * byline row, and an underlined "read" arrow-link; on the right the cover
 * photograph as a sharp hairline-framed plate over an offset outline, printed
 * grayscale until hover restores color, with a mono "Fig. 1" caption rule
 * beneath. Every interactive element routes via section-kit route links. Use
 * as the lead / featured-article section above the story grid on blog
 * homepages, magazine indexes, or editorial landing pages.
 */
export const BlogHero = defineCapsule({
  name: 'BlogHero',
  description:
    'Newsprint front-page lead story for an editorial blog or publication index: a mono dateline row (badge stamp · date · read time) over a heavy double masthead rule, then an asymmetric 7:5 split above a giant ghost pilcrow watermark — mono topic kicker with hairline rule, huge serif clamp-scaled headline, drop-cap excerpt against a hairline column rule, small-caps author byline, and an underlined read arrow-link on the left; the cover photo as a sharp hairline-framed plate over an offset outline (grayscale until hover) with a mono "Fig. 1" caption rule on the right. Every interactive element routes through section-kit route links. Use as the lead featured-article section above the story grid on blog homepages, magazine indexes, or editorial landing pages.',
  props: z.object({
    /** Cover-image alt text (drives Image search). */
    alt: z.string().optional(),
    /** Topic tag above the title. */
    topic: z.string().optional(),
    /** Badge label on the image. */
    badge: z.string().optional(),
    /** Article headline. */
    title: z.string().optional(),
    /** Excerpt / lead paragraph. */
    excerpt: z.string().optional(),
    /** Author name. */
    author: z.string().optional(),
    /** Read time label. */
    readTime: z.string().optional(),
    /** Publish date. */
    date: z.string().optional(),
    /** Read-link label. */
    readLabel: z.string().optional(),
    /** Navigation target for clicks on the card / read-link. */
    postTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: publicationLakebed,
  component: ({ props, lakebed }) => {
    const alt =
      props.alt ??
      'A tidy desk with a laptop, notebook, and coffee bathed in warm morning light'
    const topic = props.topic ?? 'Systems & Craft'
    const badge = props.badge ?? 'Featured'
    const title = props.title ?? 'Design Systems That Survive Change'
    const excerpt =
      props.excerpt ??
      "Great design systems aren't libraries of components — they're agreements about how teams think, communicate, and ship. Here is how to build one that lasts."
    const author = props.author ?? 'Miles Chen'
    const readTime = props.readTime ?? '12 min read'
    const date = props.date ?? 'May 28, 2026'
    const readLabel = props.readLabel ?? 'Read the story'
    const postTarget = props.postTarget ?? 'Blog post'
    useSyncPublicationArticles(lakebed, [
      {
        author,
        category: topic,
        date,
        excerpt,
        target: postTarget,
        title,
      },
    ])

    const Arrow = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform group-hover:translate-x-1"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    )

    return (
      <HeroSection
        aria-label="Featured post"
        variant="default"
        className={cn(
          'relative overflow-hidden pt-10 pb-8 sm:pt-12',
          props.className,
        )}
      >
        <Watermark className="-bottom-24 right-[38%] font-serif text-[16rem] font-black text-foreground/[0.05] sm:text-[24rem] lg:-bottom-40 lg:text-[34rem]">
          ¶
        </Watermark>
        <Container size="lg" className="relative">
          {/* Dateline row closed by a heavy double masthead rule. */}
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5 border-b-2 border-foreground pb-3 shadow-[0_3px_0_-2px] shadow-border">
            <span className="inline-flex rotate-[-1.5deg] border border-foreground px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground">
              {badge}
            </span>
            <MonoTag>{date}</MonoTag>
            <span
              aria-hidden="true"
              className="hidden h-px flex-1 bg-border sm:block"
            />
            <MonoTag tone="faint">{readTime}</MonoTag>
          </div>

          <article className="mt-8 grid items-start gap-10 sm:mt-10 lg:grid-cols-12 lg:gap-12">
            <FeaturedArticleContent className="p-0 lg:col-span-7">
              <div className="mb-4 flex items-center gap-3">
                <MonoTag tone="primary" className="shrink-0">
                  {topic}
                </MonoTag>
                <span
                  aria-hidden="true"
                  className="h-px w-12 bg-foreground/40"
                />
              </div>
              <h1 className="font-serif text-[clamp(2.4rem,4.5vw+0.5rem,4.5rem)] font-black leading-[1.02] tracking-tight text-foreground">
                <NavbarRouteLink
                  className="text-left transition-colors hover:text-foreground/80"
                  href={postTarget}
                >
                  {title}
                </NavbarRouteLink>
              </h1>
              <p className="mt-6 max-w-xl border-l border-foreground/25 pl-5 text-base leading-relaxed text-muted-foreground first-letter:float-left first-letter:mr-2.5 first-letter:font-serif first-letter:text-5xl first-letter:font-black first-letter:leading-[0.85] first-letter:text-foreground sm:text-lg">
                {excerpt}
              </p>
              <FeaturedArticleMeta className="mt-7 gap-x-3 gap-y-2">
                <span className="inline-flex items-center gap-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-none border border-foreground font-serif text-sm font-black text-foreground">
                    {author.charAt(0)}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground">
                    By {author}
                  </span>
                </span>
              </FeaturedArticleMeta>
              <NavbarRouteLink
                className="group mt-7 inline-flex items-center gap-2.5 self-start border-b-2 border-foreground pb-1 font-mono text-[12px] uppercase tracking-[0.16em] text-foreground transition-colors hover:border-primary hover:text-primary active:translate-y-px"
                href={postTarget}
              >
                {readLabel}
                <Arrow />
              </NavbarRouteLink>
            </FeaturedArticleContent>

            <div className="lg:col-span-5">
              <FeaturedArticleMedia
                asChild
                className="relative block aspect-[4/3] w-full overflow-visible bg-transparent"
              >
                <NavbarRouteLink className="group" href={postTarget}>
                  {/* Offset outline behind the plate — printed double frame. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border border-border"
                  />
                  <Image
                    alt={alt}
                    w={1200}
                    h={900}
                    className="absolute inset-0 size-full border border-foreground/40 object-cover grayscale transition-[filter] duration-500 group-hover:grayscale-0"
                  />
                </NavbarRouteLink>
              </FeaturedArticleMedia>
              {/* Figure caption rule beneath the plate. */}
              <span
                aria-hidden="true"
                className="mt-6 flex items-center gap-2 text-border"
              >
                <span className="h-2 w-px bg-current" />
                <span className="h-px flex-1 bg-current" />
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Fig. 1 — {topic}
                </span>
                <span className="h-px flex-1 bg-current" />
                <span className="h-2 w-px bg-current" />
              </span>
            </div>
          </article>
        </Container>
      </HeroSection>
    )
  },
})
