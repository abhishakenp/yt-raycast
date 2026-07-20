import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { HeroSection, HeroContent } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * BlogPostHero — newsprint front-page masthead for a single-article blog post
 * detail page. A double-ruled mono dateline row (category kicker with a small
 * primary square on the left, publication date on the right) sits above a huge
 * serif headline (routable via section-kit route links) set over a giant ghost
 * serif watermark of the headline's first letter. The dek reads against a
 * hairline column rule, and the byline is a ruled ledger row — square
 * grayscale author portrait, "By <author>" in serif, and a mono reading-time
 * stamp. The wide cover photograph breaks wider than the reading column in a
 * sharp hairline frame over an offset outline, finished with a mono "Fig. 01"
 * caption rule. Uses semantic tokens only. Use as the article masthead for
 * blogs, journals, magazines, or editorial reading pages.
 */
export const BlogPostHero = defineCapsule({
  name: 'BlogPostHero',
  description:
    "Newsprint front-page masthead for a single-article blog post detail page: a double-ruled mono dateline row (category kicker + publication date) above a huge serif headline (routable via section-kit route links) over a giant ghost serif first-letter watermark, an optional dek set against a hairline column rule, and a ruled byline ledger row with a square grayscale author portrait, 'By <author>' in serif, and a mono reading-time stamp — followed by a wide sharp-framed cover image breaking wider than the reading column with a mono 'Fig. 01' caption rule. Use as the article masthead for blogs, journals, magazines, or editorial reading pages.",
  props: z.object({
    /** Category / topic eyebrow kicker label. */
    kicker: z.string().optional(),
    /** Article headline (routable). */
    title: z.string().optional(),
    /** Subtitle / dek under the headline. */
    dek: z.string().optional(),
    /** Author name. */
    author: z.string().optional(),
    /** Alt text for the author avatar image. */
    authorAvatarAlt: z.string().optional(),
    /** Publication date. */
    date: z.string().optional(),
    /** Estimated reading time, e.g. "8 min read". */
    readingTime: z.string().optional(),
    /** Alt text for the wide cover image. */
    coverAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const kicker = props.kicker ?? 'Engineering'
    const title = props.title ?? 'The Quiet Art of Writing Software That Lasts'
    const dek =
      props.dek ??
      "Durable systems aren't built in a hurry. They're shaped by patience, restraint, and a willingness to delete more than you add."
    const author = props.author ?? 'Jordan Avery'
    const authorAvatarAlt =
      props.authorAvatarAlt ??
      'Professional headshot of Jordan Avery, a software engineer with a warm, thoughtful expression'
    const date = props.date ?? 'June 18, 2026'
    const readingTime = props.readingTime ?? '8 min read'
    const coverAlt =
      props.coverAlt ??
      'A sunlit wooden workshop desk with a laptop, an open notebook, and a cup of coffee, shot from above'

    return (
      <HeroSection
        variant="default"
        className={cn(
          'relative overflow-hidden border-b border-border bg-background py-14 lg:py-20',
          props.className,
        )}
      >
        {/* Giant ghost first letter of the headline — the front-page initial. */}
        <Watermark className="-top-6 right-[2%] font-serif font-bold text-foreground/[0.05] text-[11rem] sm:text-[16rem] lg:text-[22rem]">
          {title.charAt(0)}
        </Watermark>

        <Container asChild size="sm" className="relative px-6 lg:px-6">
          <HeroContent>
            {/* Double-ruled dateline: kicker — rule — date. */}
            <div className="border-y-[3px] border-foreground/40 [border-top-style:double] [border-bottom-style:double] py-2.5">
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
                <MonoTag className="flex items-center gap-2 text-foreground">
                  <span
                    aria-hidden="true"
                    className="size-1.5 shrink-0 bg-primary"
                  />
                  {kicker}
                </MonoTag>
                <MonoTag>
                  <time>{date}</time>
                </MonoTag>
              </div>
            </div>

            <h1 className="mt-8 font-serif text-4xl font-bold leading-[1.04] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              <NavbarRouteLink className="text-left" href={title}>
                {title}
              </NavbarRouteLink>
            </h1>

            {/* Dek against a hairline column rule. */}
            <p className="mt-6 max-w-xl border-l border-foreground/25 pl-5 font-serif text-lg italic leading-relaxed text-muted-foreground md:text-xl">
              {dek}
            </p>

            {/* Byline ledger row. */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-y border-foreground/20 py-3">
              <span className="flex min-w-0 items-center gap-3">
                <Image
                  alt={authorAvatarAlt}
                  w={80}
                  h={80}
                  className="size-9 shrink-0 rounded-none border border-foreground/20 object-cover grayscale"
                />
                <span className="truncate font-serif text-base text-foreground">
                  <span className="italic text-muted-foreground">By </span>
                  <span className="font-semibold">{author}</span>
                </span>
              </span>
              <MonoTag className="shrink-0">{readingTime}</MonoTag>
            </div>
          </HeroContent>
        </Container>

        {/* Cover plate breaking wider than the reading column. */}
        <div className="relative mx-auto mt-12 max-w-5xl px-6 lg:px-8">
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border border-border"
            />
            <Image
              alt={coverAlt}
              w={1600}
              h={900}
              className="relative aspect-[16/9] w-full rounded-none border border-foreground/25 object-cover"
            />
          </div>
          {/* Mono figure caption rule. */}
          <span
            aria-hidden="true"
            className="mt-4 flex items-center gap-3 text-border"
          >
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Fig. 01
            </span>
            <span className="h-px flex-1 bg-current" />
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
              Cover
            </span>
          </span>
        </div>
      </HeroSection>
    )
  },
})
