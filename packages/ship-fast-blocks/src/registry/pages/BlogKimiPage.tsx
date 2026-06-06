import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * BlogKimiPage — a complete, self-contained editorial BLOG INDEX / homepage.
 *
 * A faithful Tailwind v4 port of a Kimi-generated design & technology blog
 * design: a glassy sticky header with a gradient brand tile + search button,
 * a split "featured post" card (large image + serif headline, topic, author
 * meta and a read link), a "Latest stories" section header, and a responsive
 * 3-up article grid where each card has a tagged cover image, serif-adjacent
 * title, clamped excerpt and an author/date footer. Closes with a slim
 * multi-link footer.
 *
 * This is a blog INDEX — intentionally editorial and content-first, with NO
 * big marketing hero. The block owns ALL layout, spacing, depth and type
 * hierarchy. Base surfaces use theme tokens (bg-background/text-foreground)
 * so dark mode works, while Kimi's blue→violet accent is preserved on the
 * brand mark, topic labels and read links. Every nav item / card / link
 * routes through `useNavigate` (never a dead "#"), and the navbar labels
 * match the `nav` array so PageSwitch can swap pages. All cover imagery is
 * rendered via <Image alt="…" /> (alt-driven, never a hardcoded src).
 * Callers supply ONLY content data; rich defaults make it render great with
 * no props at all.
 */
export const BlogKimiPage = defineComponent({
  name: "BlogKimiPage",
  description:
    "Complete editorial BLOG INDEX / homepage with a clean, content-first aesthetic: glassy sticky header with a gradient brand tile + search affordance, a split 'featured post' card (large cover image + serif headline, topic label, author meta and read link), a 'Latest stories' header, and a responsive 3-up article grid of tagged cover cards with title, excerpt and author/date footer, plus a slim multi-link footer. Use as the ROOT/home page for blogs, magazines, publications, newsrooms, design/tech journals, content hubs or company blogs when an editorial article-listing page is wanted. NOTE: this is a blog INDEX — it has NO big marketing hero; it leads with a featured article and a grid of stories. Supply content only — brand, nav, header, featured, posts, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / publication name shown in the header and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Section header above the article grid. */
    header: z
      .object({
        /** Heading for the latest-stories section. */
        title: z.string().optional(),
        /** Label for the "view all" link beside the heading. */
        viewAll: z.string().optional(),
      })
      .optional(),
    /** The single featured / lead article shown in the split card. */
    featured: z
      .object({
        badge: z.string().optional(),
        topic: z.string().optional(),
        title: z.string().optional(),
        excerpt: z.string().optional(),
        author: z.string().optional(),
        readTime: z.string().optional(),
        date: z.string().optional(),
        readLabel: z.string().optional(),
        /** Alt text driving the featured cover image (never a raw src). */
        alt: z.string().optional(),
      })
      .optional(),
    /** Article grid cards. */
    posts: z
      .array(
        z.object({
          tag: z.string(),
          title: z.string(),
          excerpt: z.string(),
          author: z.string(),
          date: z.string(),
          /** Alt text driving the card cover image (never a raw src). */
          alt: z.string(),
        }),
      )
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        links: z.array(z.string()).optional(),
        copyright: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Form & Function"
    const nav = props.nav?.length
      ? props.nav
      : ["Home", "Design", "Engineering", "Product", "About"]

    const sectionTitle = props.header?.title ?? "Latest stories"
    const viewAll = props.header?.viewAll ?? "View all"

    const featured = {
      badge: props.featured?.badge ?? "Featured",
      topic: props.featured?.topic ?? "Systems & Craft",
      title: props.featured?.title ?? "Design Systems That Survive Change",
      excerpt:
        props.featured?.excerpt ??
        "Great design systems aren’t libraries of components — they’re agreements about how teams think, communicate, and ship. Here is how to build one that lasts.",
      author: props.featured?.author ?? "Miles Chen",
      readTime: props.featured?.readTime ?? "12 min read",
      date: props.featured?.date ?? "May 28, 2026",
      readLabel: props.featured?.readLabel ?? "Read the story",
      alt:
        props.featured?.alt ??
        "A tidy desk with a laptop, notebook, and coffee bathed in warm morning light",
    }

    const posts = props.posts?.length
      ? props.posts
      : [
          {
            tag: "Engineering",
            title: "Why We Moved to Edge-First Rendering",
            excerpt:
              "Latency matters more than raw throughput. Shifting rendering to the edge cut our time-to-interactive in half — and simplified our mental model.",
            author: "Noah Reeves",
            date: "May 25",
            alt: "MacBook on a minimalist desk with a plant",
          },
          {
            tag: "Product",
            title: "Running Discovery Without a Brief",
            excerpt:
              "Some of the most useful research starts messy. A look at how unstructured conversations with users can reveal problems no survey ever would.",
            author: "Ava Morales",
            date: "May 22",
            alt: "Colorful sticky notes on a glass wall during a workshop",
          },
          {
            tag: "Design",
            title: "Typography as Interface",
            excerpt:
              "Type is not decoration — it is navigation, tone, and structure. Here is how we use hierarchy to guide attention without adding a single extra pixel.",
            author: "Liam Park",
            date: "May 19",
            alt: "Wireframes on a tablet and printed sheets on a desk",
          },
          {
            tag: "Engineering",
            title: "Refactoring for Deletion",
            excerpt:
              "The best code is the code you do not have to maintain. A practical guide to shrinking surface area while keeping systems reliable.",
            author: "Sofia Andersson",
            date: "May 15",
            alt: "Code editor on a dark theme with syntax highlighting",
          },
          {
            tag: "Technology",
            title: "The Infrastructure Behind Real-Time Collaboration",
            excerpt:
              "Operational transforms, CRDTs, and WebSockets — a plain-language tour of what keeps multiplayer documents in sync at scale.",
            author: "Raj Patel",
            date: "May 12",
            alt: "Futuristic server room with blue ambient lighting",
          },
          {
            tag: "Design",
            title: "Color Palettes That Respect Accessibility",
            excerpt:
              "Contrast is not enough. Learn how to build flexible color scales that stay accessible across themes, modes, and devices.",
            author: "Emma Lin",
            date: "May 08",
            alt: "Abstract geometric shapes in soft pastel colors",
          },
        ]

    const footerLinks = props.footer?.links?.length
      ? props.footer.links
      : ["Privacy", "Terms", "RSS", "Contact"]
    const copyright =
      props.footer?.copyright ?? `© ${new Date().getFullYear()} ${brand}`

    // Shared brand mark — blue→violet gradient tile + bezier glyph (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm",
          className,
        )}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="5" cy="19" r="2" />
          <circle cx="19" cy="5" r="2" />
          <path d="M5 17C5 9 11 5 17 5" />
        </svg>
      </span>
    )

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
      <div
        className={cn(
          "flex min-h-svh flex-col bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-6">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2.5 text-[1.15rem] font-bold tracking-tight text-foreground"
            >
              <LogoMark />
              {brand}
            </button>
            <nav
              aria-label="Primary"
              className="hidden items-center gap-1 md:flex"
            >
              {nav.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className={cn(
                    "rounded-md px-3 py-2 text-[0.92rem] font-medium transition-colors",
                    i === 0
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </nav>
            <button
              type="button"
              aria-label="Search"
              onClick={() => go("Search")}
              className="grid size-[2.375rem] place-items-center rounded-md border border-border bg-background text-muted-foreground transition-all hover:-translate-y-px hover:text-foreground hover:shadow-sm"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
        </header>

        <main className="flex flex-1 flex-col">
          {/* Featured post */}
          <section
            aria-label="Featured post"
            className="mx-auto w-full max-w-6xl px-6 pt-12 pb-7"
          >
            <article className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-[0_10px_30px_rgba(0,0,0,0.06)] md:grid-cols-[1.15fr_1fr]">
              <button
                type="button"
                onClick={() => go("Blog post")}
                className="group relative block min-h-[15rem] w-full overflow-hidden bg-gradient-to-br from-primary/10 to-accent/20 md:min-h-[24rem]"
              >
                <Image
                  alt={featured.alt}
                  w={1200}
                  h={900}
                  className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <span className="absolute left-[1.125rem] top-[1.125rem] rounded-full bg-background/90 px-2.5 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-foreground shadow-sm backdrop-blur">
                  {featured.badge}
                </span>
              </button>
              <div className="flex flex-col justify-center p-8 md:p-10">
                <div className="mb-3 inline-flex items-center gap-2 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-primary">
                  {featured.topic}
                </div>
                <h1 className="font-serif text-[clamp(1.6rem,2.2vw+0.2rem,2.4rem)] font-bold leading-[1.15] tracking-tight text-foreground">
                  {featured.title}
                </h1>
                <p className="mt-3.5 text-base leading-relaxed text-muted-foreground">
                  {featured.excerpt}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-x-3.5 gap-y-2 text-[0.85rem] text-muted-foreground">
                  <span className="inline-flex items-center gap-2.5 font-semibold text-foreground">
                    <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-[0.7rem] font-bold text-primary-foreground">
                      {featured.author.charAt(0)}
                    </span>
                    {featured.author}
                  </span>
                  <span>{featured.readTime}</span>
                  <span>{featured.date}</span>
                </div>
                <button
                  type="button"
                  onClick={() => go("Blog post")}
                  className="group mt-6 inline-flex items-center gap-2.5 self-start text-[0.95rem] font-semibold text-primary"
                >
                  {featured.readLabel}
                  <Arrow />
                </button>
              </div>
            </article>
          </section>

          {/* Latest stories */}
          <section
            aria-label="Latest articles"
            className="mx-auto w-full max-w-6xl px-6 pb-14"
          >
            <div className="flex flex-col items-start gap-1.5 py-5 sm:flex-row sm:items-baseline sm:justify-between">
              <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">
                {sectionTitle}
              </h2>
              <button
                type="button"
                onClick={() => go(viewAll)}
                className="group inline-flex items-center gap-2 text-[0.85rem] font-semibold text-primary"
              >
                {viewAll}
                <Arrow />
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <button
                  key={post.title}
                  type="button"
                  onClick={() => go("Blog post")}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
                >
                  <div className="relative h-[12.5rem] overflow-hidden bg-muted">
                    <Image
                      alt={post.alt}
                      w={800}
                      h={500}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.06em] text-foreground shadow-sm backdrop-blur">
                      {post.tag}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-[1.05rem] font-bold leading-snug tracking-tight text-foreground">
                      {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 flex-1 text-[0.92rem] leading-relaxed text-muted-foreground">
                      {post.excerpt}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3.5">
                      <span className="inline-flex items-center gap-2.5 text-[0.82rem] font-semibold text-foreground">
                        <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-[0.625rem] font-bold text-primary-foreground">
                          {post.author.charAt(0)}
                        </span>
                        {post.author}
                      </span>
                      <span className="text-[0.78rem] text-muted-foreground">
                        {post.date}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-border py-10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="font-bold tracking-tight text-foreground"
            >
              {brand}
            </button>
            <nav
              aria-label="Footer"
              className="flex flex-wrap gap-x-[1.125rem] gap-y-2 text-[0.9rem] text-muted-foreground"
            >
              {footerLinks.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="transition-colors hover:text-foreground"
                >
                  {link}
                </button>
              ))}
            </nav>
            <div className="text-[0.85rem] text-muted-foreground">
              {copyright}
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
