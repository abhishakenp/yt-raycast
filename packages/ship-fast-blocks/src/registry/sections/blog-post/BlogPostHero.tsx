import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * BlogPostHero — bespoke single-article masthead for an editorial blog post
 * detail page. A narrow reading column with a small category/eyebrow kicker,
 * a large editorial headline (routable via useNavigate), an optional dek, and
 * a byline row (author avatar + name, publish date, and reading-time, separated
 * by dots), followed by a wide rounded cover image that folds into the hero.
 * Uses semantic tokens only. Use as the article masthead for blogs, journals,
 * magazines, or editorial reading pages.
 */
export const BlogPostHero = defineComponent({
  name: 'BlogPostHero',
  description:
    'Bespoke single-article hero for an editorial blog post detail page: a narrow reading column with an uppercase category/eyebrow kicker, a large editorial headline (routable via useNavigate), an optional dek/subtitle, and a byline row showing an author avatar, name, publication date, and reading-time separated by dots, followed by a wide rounded cover image. Use as the article masthead for blogs, journals, magazines, or editorial reading pages.',
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
    const go = useNavigate()
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
      <section className={cn('bg-background py-16 lg:py-24', props.className)}>
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {kicker}
          </p>
          <h1 className="mb-6 font-serif text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
            <button
              type="button"
              onClick={() => go(title)}
              className="text-left"
            >
              {title}
            </button>
          </h1>
          <p className="mb-8 text-lg leading-relaxed text-muted-foreground md:text-xl">
            {dek}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-3">
              <Image
                alt={authorAvatarAlt}
                w={80}
                h={80}
                className="size-9 rounded-full object-cover"
              />
              <span className="font-medium text-foreground">{author}</span>
            </span>
            <span className="text-border" aria-hidden="true">
              &middot;
            </span>
            <time>{date}</time>
            <span className="text-border" aria-hidden="true">
              &middot;
            </span>
            <span>{readingTime}</span>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-5xl px-6 lg:px-8">
          <Image
            alt={coverAlt}
            w={1600}
            h={900}
            className="aspect-[16/9] w-full rounded-2xl object-cover"
          />
        </div>
      </section>
    )
  },
})
