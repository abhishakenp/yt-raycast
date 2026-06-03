import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * BlogPostHeader — magazine-style article header for an editorial blog post
 * detail page. A centered block above the content: a small upper-case category
 * pill (routable via useNavigate), a large multi-line headline, an italic
 * description (dek), and a byline row with an author avatar, role, date, and
 * estimated read-time. Uses semantic tokens only. Use as the article masthead
 * for blogs, journals, magazines, or editorial reading pages.
 */
export const BlogPostHeader = defineComponent({
  name: "BlogPostHeader",
  description:
    "Magazine-style article header for an editorial blog post detail page: a centered block with an uppercase category pill (routable via useNavigate), a large multi-line headline, an italic subtitle / dek, and a byline row showing an author avatar, name, role, publication date, and estimated read-time. Use as the article masthead for blogs, journals, magazines, or editorial reading pages.",
  props: z.object({
    /** Category / topic pill label (routable). */
    category: z.string().optional(),
    /** Article headline. */
    title: z.string().optional(),
    /** Subtitle / dek under the headline. */
    dek: z.string().optional(),
    /** Author name (routable). */
    authorName: z.string().optional(),
    /** Author role / title. */
    authorRole: z.string().optional(),
    /** Alt text for the author avatar image. */
    authorAvatarAlt: z.string().optional(),
    /** Publication date. */
    date: z.string().optional(),
    /** Estimated read time. */
    readTime: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const category = props.category ?? "Design Philosophy"
    const title =
      props.title ??
      "The Art of Slow Design: Why Taking Your Time Creates Better Products"
    const dek =
      props.dek ??
      "In an industry obsessed with speed, the most impactful designers are learning to pause, reflect, and let ideas mature."
    const authorName = props.authorName ?? "Elena Martinez"
    const authorRole = props.authorRole ?? "Design Director"
    const authorAvatarAlt =
      props.authorAvatarAlt ??
      "Professional headshot of Elena Martinez, a design director with warm smile and dark hair"
    const date = props.date ?? "March 15, 2024"
    const readTime = props.readTime ?? "12 min read"

    return (
      <header className={cn("pt-16 pb-12 lg:pt-24 lg:pb-16", props.className)}>
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <div className="mb-6">
            <button
              type="button"
              onClick={() => go(category)}
              className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              {category}
            </button>
          </div>
          <h1 className="mb-6 text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            {dek}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <button
              type="button"
              onClick={() => go(authorName)}
              className="flex items-center gap-3"
            >
              <Image
                alt={authorAvatarAlt}
                w={80}
                h={80}
                className="size-10 rounded-full object-cover"
              />
              <span className="text-left">
                <span className="block font-medium text-foreground">
                  {authorName}
                </span>
                <span className="block text-xs">{authorRole}</span>
              </span>
            </button>
            <span className="text-border" aria-hidden="true">
              |
            </span>
            <time>{date}</time>
            <span className="text-border" aria-hidden="true">
              |
            </span>
            <span>{readTime}</span>
          </div>
        </div>
      </header>
    )
  },
})
