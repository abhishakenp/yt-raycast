import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * BlogPostRelated — related articles grid for an editorial blog post detail
 * page. A muted-background band with a left-aligned heading above a responsive
 * 1/2/3-column grid of article cards; each card has a hover-zoom thumbnail,
 * category/date meta, a bold title, and an excerpt. All cards are clickable
 * and route through useNavigate. Use as the "related reading" / "more articles"
 * section below the body on blogs, magazines, journals, or editorial reading
 * pages.
 */
export const BlogPostRelated = defineComponent({
  name: "BlogPostRelated",
  description:
    "Related articles grid for an editorial blog post detail page: a muted-background band with a left-aligned heading above a responsive 1/2/3-column grid of article cards, each with a hover-zoom thumbnail, category/date meta, a bold title, and an excerpt. All cards are clickable and route through useNavigate. Use as the 'related reading' / 'more articles' section below the body on blogs, magazines, journals, or editorial reading pages.",
  props: z.object({
    /** Section heading above the grid. */
    heading: z.string().optional(),
    /** Related article cards. */
    items: z
      .array(
        z.object({
          category: z.string(),
          date: z.string(),
          title: z.string(),
          excerpt: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Related Articles"
    const items = props.items?.length
      ? props.items
      : [
          {
            category: "Team Culture",
            date: "Feb 28, 2024",
            title: "Building Design Systems That Actually Get Used",
            excerpt:
              "Lessons from rolling out design systems at three different startups—and why adoption is harder than construction.",
            imageAlt:
              "Design team whiteboarding session with colorful sticky notes on glass wall",
          },
          {
            category: "UX Research",
            date: "Feb 10, 2024",
            title: "The Lost Art of Sketching Before Pixels",
            excerpt:
              "Why the best digital designers still start with analog tools—and how paper prototyping catches problems Figma misses.",
            imageAlt:
              "Close-up of hands sketching wireframes in a notebook with pencil",
          },
          {
            category: "Design Process",
            date: "Jan 22, 2024",
            title: "Measuring Design Quality: Beyond Vanity Metrics",
            excerpt:
              "A framework for quantifying design excellence using behavioral signals instead of NPS scores and gut feelings.",
            imageAlt:
              "Laptop screen showing data analytics dashboard with charts and metrics",
          },
        ]

    return (
      <section
        className={cn("bg-muted py-16 lg:py-24", props.className)}
      >
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <h2 className="mb-10 text-2xl font-semibold tracking-tight text-foreground">
            {heading}
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((post) => (
              <article key={post.title} className="group">
                <button
                  type="button"
                  onClick={() => go(post.title)}
                  className="block w-full text-left"
                >
                  <figure className="mb-4 overflow-hidden rounded-lg">
                    <Image
                      alt={post.imageAlt}
                      w={600}
                      h={400}
                      loading="lazy"
                      className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </figure>
                  <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{post.category}</span>
                    <span aria-hidden="true">•</span>
                    <time>{post.date}</time>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground transition-colors group-hover:text-muted-foreground">
                    {post.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </p>
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
