import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * BlogHero — split featured-post card for an editorial blog / publication index.
 * A two-column article card with a large cover image (left) that zooms on hover,
 * a badge label, and a rich text panel (right) with a topic label, serif headline,
 * excerpt, author meta row, and a read-link. Every interactive element routes via
 * useNavigate. Use as the lead / featured-article section above the story grid
 * on blog homepages, magazine indexes, or editorial landing pages.
 */
export const BlogHero = defineComponent({
  name: 'BlogHero',
  description:
    'Split featured-post card for an editorial blog or publication index: a two-column article card with a large cover image on the left that zooms on hover, a badge label, and a rich text panel on the right with a topic label, serif headline, excerpt, author meta row, and a read-link. Every interactive element routes through useNavigate. Use as the lead featured-article section above the story grid on blog homepages, magazine indexes, or editorial landing pages.',
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
  component: ({ props }) => {
    const go = useNavigate()
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
      <section
        aria-label="Featured post"
        className={cn(
          'mx-auto w-full max-w-6xl px-6 pt-12 pb-7',
          props.className,
        )}
      >
        <article className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-[0_10px_30px_rgba(0,0,0,0.06)] md:grid-cols-[1.15fr_1fr]">
          <button
            type="button"
            onClick={() => go(postTarget)}
            className="group relative block min-h-[15rem] w-full overflow-hidden bg-gradient-to-br from-primary/10 to-accent/20 md:min-h-[24rem]"
          >
            <Image
              alt={alt}
              w={1200}
              h={900}
              className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <span className="absolute left-[1.125rem] top-[1.125rem] rounded-full bg-background/90 px-2.5 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-foreground shadow-sm backdrop-blur">
              {badge}
            </span>
          </button>
          <div className="flex flex-col justify-center p-8 md:p-10">
            <div className="mb-3 inline-flex items-center gap-2 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-primary">
              {topic}
            </div>
            <h1 className="font-serif text-[clamp(1.6rem,2.2vw+0.2rem,2.4rem)] font-bold leading-[1.15] tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mt-3.5 text-base leading-relaxed text-muted-foreground">
              {excerpt}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-3.5 gap-y-2 text-[0.85rem] text-muted-foreground">
              <span className="inline-flex items-center gap-2.5 font-semibold text-foreground">
                <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-[0.7rem] font-bold text-primary-foreground">
                  {author.charAt(0)}
                </span>
                {author}
              </span>
              <span>{readTime}</span>
              <span>{date}</span>
            </div>
            <button
              type="button"
              onClick={() => go(postTarget)}
              className="group mt-6 inline-flex items-center gap-2.5 self-start text-[0.95rem] font-semibold text-primary"
            >
              {readLabel}
              <Arrow />
            </button>
          </div>
        </article>
      </section>
    )
  },
})
