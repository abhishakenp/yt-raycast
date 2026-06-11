import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * BlogKimiPage2 — a complete, self-contained MAGAZINE-style BLOG INDEX / homepage.
 *
 * A faithful Tailwind v4 port of a second Kimi-generated design & technology
 * blog design and the BOLDER, denser ALTERNATIVE to BlogKimiPage. Where the
 * sibling is a calm, minimal editorial index, THIS variant is a punchy,
 * news-magazine layout: a sticky blurred navbar with a square brand tile +
 * Subscribe CTA, a scrolling NEWS-TICKER marquee of headlines, a big split
 * "Featured Story" hero (cover image + author meta), a horizontal TOPIC-CHIP
 * filter row, a dense 3-up author-bylined article grid, an "Editor's Picks"
 * band of wide cards, a centered newsletter sign-up with email capture, an
 * inverted dark "Free Resources" download grid, and a four-column dark footer
 * with social links. Vibrant red accents map to `primary`; dark bands use
 * `foreground`/`card` tokens so theming works. Every nav item, chip, card,
 * resource and the newsletter form route through `useNavigate`, all imagery
 * is alt-driven <Image>, and rich defaults render the full page with no props.
 */
export const BlogKimiPage2 = defineCapsule({
  name: "BlogKimiPage2",
  description:
    "Complete MAGAZINE-style BLOG INDEX / homepage — a bolder, denser ALTERNATIVE (second style, sibling to BlogKimiPage) with a punchy news-publication aesthetic: sticky blurred navbar with a square brand tile + Subscribe CTA, a scrolling NEWS-TICKER marquee of headlines, a large split 'Featured Story' hero (cover + author meta), a horizontal topic-chip filter row, a dense 3-up author-bylined article grid, an 'Editor's Picks' band of wide cards, a centered newsletter email sign-up, an inverted dark 'Free Resources' download grid, and a four-column dark footer with social icons. Use as the ROOT/home page for blogs, magazines, publications, newsrooms, design/tech journals, tech news sites, content hubs or company blogs when a vibrant, content-dense editorial listing page is wanted (pick this over BlogKimiPage for a louder, magazine feel). NOTE: this is a blog INDEX — no big marketing hero; it leads with a featured article, ticker and a grid of stories. Supply content only — brand, nav, ticker, featured, topics, posts, editorPicks, newsletter, resources, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / publication name shown in the header and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Scrolling news-ticker headlines. */
    ticker: z.array(z.string()).optional(),
    /** The single featured / lead article shown in the split hero. */
    featured: z
      .object({
        badge: z.string().optional(),
        topic: z.string().optional(),
        date: z.string().optional(),
        readTime: z.string().optional(),
        title: z.string().optional(),
        excerpt: z.string().optional(),
        author: z.string().optional(),
        authorRole: z.string().optional(),
        /** Alt text driving the featured cover image (never a raw src). */
        alt: z.string().optional(),
        /** Alt text driving the author headshot (never a raw src). */
        authorAlt: z.string().optional(),
      })
      .optional(),
    /** Topic-chip filter row. */
    topics: z
      .object({
        title: z.string().optional(),
        viewAll: z.string().optional(),
        chips: z.array(z.string()).optional(),
      })
      .optional(),
    /** Article grid cards. */
    posts: z
      .array(
        z.object({
          tag: z.string(),
          date: z.string(),
          title: z.string(),
          excerpt: z.string(),
          author: z.string(),
          /** Alt text driving the card cover image (never a raw src). */
          alt: z.string(),
          /** Alt text driving the author headshot (never a raw src). */
          authorAlt: z.string(),
        }),
      )
      .optional(),
    /** Editor's Picks band. */
    editorPicks: z
      .object({
        title: z.string().optional(),
        items: z
          .array(
            z.object({
              badge: z.string(),
              readTime: z.string(),
              title: z.string(),
              excerpt: z.string(),
              alt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Newsletter sign-up. */
    newsletter: z
      .object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        placeholder: z.string().optional(),
        cta: z.string().optional(),
        perks: z.array(z.string()).optional(),
      })
      .optional(),
    /** Free-resources download grid. */
    resources: z
      .object({
        title: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        columns: z
          .array(
            z.object({
              title: z.string(),
              links: z.array(z.string()),
            }),
          )
          .optional(),
        socials: z.array(z.string()).optional(),
        copyright: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Form & Flow"
    const nav = props.nav?.length
      ? props.nav
      : ["Design", "Technology", "Workflows", "Resources"]

    const ticker = props.ticker?.length
      ? props.ticker
      : [
          "Figma announces AI-powered auto-layout v2",
          "React 19 beta released with new compiler",
          "Apple Vision Pro: 6 months later",
          "Tailwind CSS v4 roadmap revealed",
          "Notion launches native databases API",
          "Linear introduces cycles for sprint planning",
        ]

    const featured = {
      badge: props.featured?.badge ?? "Featured Story",
      topic: props.featured?.topic ?? "Design Systems",
      date: props.featured?.date ?? "May 28, 2026",
      readTime: props.featured?.readTime ?? "12 min read",
      title:
        props.featured?.title ??
        "The Death of the Design System: Why Teams Are Starting Over in 2026",
      excerpt:
        props.featured?.excerpt ??
        "After years of bloated component libraries and rigid token systems, forward-thinking teams are ditching their legacy design systems for something lighter. We spoke with design leaders at Figma, Linear, and Vercel about the shift toward adaptive, AI-assisted design infrastructure that's actually usable.",
      author: props.featured?.author ?? "Sarah Chen",
      authorRole: props.featured?.authorRole ?? "Design Systems Lead, Linear",
      alt:
        props.featured?.alt ??
        "Bold geometric product packaging design with vibrant red and black shapes on retail shelf",
      authorAlt:
        props.featured?.authorAlt ??
        "Professional headshot of Sarah Chen, senior design systems architect",
    }

    const topics = {
      title: props.topics?.title ?? "Browse Topics",
      viewAll: props.topics?.viewAll ?? "View all",
      chips: props.topics?.chips?.length
        ? props.topics.chips
        : [
            "All",
            "Design Systems",
            "Frontend",
            "AI & ML",
            "Productivity",
            "Career",
            "Tools",
            "Accessibility",
          ],
    }

    const posts = props.posts?.length
      ? props.posts
      : [
          {
            tag: "Frontend",
            date: "May 26, 2026",
            title: "Why We Migrated 2 Million Lines to TypeScript in 90 Days",
            excerpt:
              "A deep dive into Stripe's massive codebase migration, the tooling that made it possible, and the unexpected benefits that emerged.",
            author: "Marcus Williams",
            alt: "Modern minimalist workspace with large ultrawide monitor displaying code editor",
            authorAlt:
              "Professional headshot of Marcus Williams, senior software engineer",
          },
          {
            tag: "AI & ML",
            date: "May 24, 2026",
            title: "The Designer-AI Partnership: 6 Months of Real Workflow Data",
            excerpt:
              "We analyzed time-tracking data from 47 design teams using AI tools daily. The productivity gains are real—but so are the new bottlenecks.",
            author: "Elena Rodriguez",
            alt: "Abstract visualization of neural network nodes with glowing connections",
            authorAlt:
              "Professional headshot of Elena Rodriguez, design researcher",
          },
          {
            tag: "Design Systems",
            date: "May 22, 2026",
            title: "Tokens, Variables, and the Figma Config Reset",
            excerpt:
              "Figma's latest update broke more workflows than it fixed. Here's what actually works for design token management in 2026.",
            author: "James Park",
            alt: "Designer drawing wireframes on tablet with stylus in bright studio",
            authorAlt:
              "Professional headshot of James Park, product designer",
          },
          {
            tag: "Productivity",
            date: "May 20, 2026",
            title: "The 4-Hour Deep Work Day: A Field Guide",
            excerpt:
              "After testing Cal Newport's methodology with 12 engineering teams at Shopify, we have the data on what actually moves the needle.",
            author: "Amara Johnson",
            alt: "Developer working on laptop with multiple terminal windows showing code",
            authorAlt:
              "Professional headshot of Amara Johnson, engineering manager",
          },
          {
            tag: "Tools",
            date: "May 18, 2026",
            title: "After Effects Is Dead: Motion Design in 2026",
            excerpt:
              "Rive, Spline, and a new wave of web-native motion tools are reshaping how designers think about animation. Here's the complete tool audit.",
            author: "David Kim",
            alt: "Abstract colorful geometric shapes flowing in liquid motion",
            authorAlt: "Professional headshot of David Kim, motion designer",
          },
          {
            tag: "Career",
            date: "May 15, 2026",
            title: "The $400K Design Career Path Nobody Talks About",
            excerpt:
              "Staff+ designer compensation at tech companies has quietly exploded. We break down the levels, the interview loops, and the skills that matter.",
            author: "Priya Sharma",
            alt: "Team collaboration session with sticky notes on whiteboard in modern office",
            authorAlt:
              "Professional headshot of Priya Sharma, staff product designer",
          },
        ]

    const editorPicks = {
      title: props.editorPicks?.title ?? "Editor's Picks",
      items: props.editorPicks?.items?.length
        ? props.editorPicks.items
        : [
            {
              badge: "Long Read",
              readTime: "18 min",
              title: "Spatial Computing's False Promise: A 6-Month Study",
              excerpt:
                "We gave 50 designers and developers Vision Pros. The productivity results surprised everyone.",
              alt: "Futuristic VR headset floating against gradient background",
            },
            {
              badge: "Data",
              readTime: "12 min",
              title: "The 2026 Design Tool Market Report",
              excerpt:
                "Complete market share analysis, pricing trends, and where the $4.2B industry is heading.",
              alt: "Analytics dashboard on laptop showing colorful charts and graphs",
            },
          ],
    }

    const newsletter = {
      title:
        props.newsletter?.title ?? "Join 47,000+ designers and developers",
      subtitle:
        props.newsletter?.subtitle ??
        "Get our weekly digest with the best design and technology insights, hand-picked tools, and exclusive content you won't find on the site.",
      placeholder: props.newsletter?.placeholder ?? "sarah@company.com",
      cta: props.newsletter?.cta ?? "Subscribe Free",
      perks: props.newsletter?.perks?.length
        ? props.newsletter.perks
        : ["No spam, ever", "Unsubscribe anytime"],
    }

    const resources = {
      title: props.resources?.title ?? "Free Resources",
      viewAll: props.resources?.viewAll ?? "Browse library",
      items: props.resources?.items?.length
        ? props.resources.items
        : [
            {
              title: "Color System Toolkit",
              description: "Figma variables & tokens for accessible palettes",
            },
            {
              title: "Component Audit Template",
              description: "Notion database for design system reviews",
            },
            {
              title: "React Starter Kit",
              description: "Opinionated Next.js setup with Tailwind",
            },
            {
              title: "Design Sprint Guide",
              description: "5-day facilitation deck and templates",
            },
          ],
    }

    const footer = {
      about:
        props.footer?.about ??
        "Design and technology insights for the modern product team. Published weekly since 2022.",
      columns: props.footer?.columns?.length
        ? props.footer.columns
        : [
            {
              title: "Content",
              links: [
                "Design Systems",
                "Frontend",
                "AI & ML",
                "Productivity",
                "Career",
              ],
            },
            {
              title: "Resources",
              links: [
                "Newsletter Archive",
                "Free Templates",
                "Tool Database",
                "RSS Feed",
                "Podcast",
              ],
            },
            {
              title: "Company",
              links: [
                "About",
                "Advertise",
                "Contact",
                "Privacy Policy",
                "Terms of Use",
              ],
            },
          ],
      socials: props.footer?.socials?.length
        ? props.footer.socials
        : ["Twitter", "LinkedIn", "YouTube"],
      copyright:
        props.footer?.copyright ??
        `© ${new Date().getFullYear()} ${brand} Media. All rights reserved.`,
    }

    // Decorative resource glyphs (token-colored inline SVG, rotate per item).
    const resourceIcons = [
      <path
        key="bookmark"
        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
      />,
      <path
        key="doc"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />,
      <path key="code" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />,
      <path
        key="clock"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />,
    ]

    const SocialIcon = ({ name }: { name: string }) => {
      const key = name.toLowerCase()
      if (key.includes("linkedin")) {
        return (
          <svg
            className="size-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 11.001-4.124 2.062 2.062 0 01-.001 4.124zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        )
      }
      if (key.includes("youtube")) {
        return (
          <svg
            className="size-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        )
      }
      return (
        <svg
          className="size-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    }

    const BrandTile = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid size-8 place-items-center rounded-lg bg-primary text-lg font-bold text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0)}
      </span>
    )

    // Ticker rendered twice for a seamless loop (pure CSS marquee via inline keyframes).
    const tickerRun = ticker

    return (
      <div
        className={cn(
          "flex min-h-svh flex-col bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        <style>{`@keyframes bkp2-marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}.bkp2-marquee{animation:bkp2-marquee 30s linear infinite}`}</style>

        {/* Navbar */}
        <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <BrandTile />
                <span className="text-xl font-bold tracking-tight">
                  {brand}
                </span>
              </button>

              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label="Search"
                  onClick={() => go("Search")}
                  className="hidden text-muted-foreground transition-colors hover:text-foreground sm:block"
                >
                  <svg
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => go("Subscribe")}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* News-ticker marquee */}
        <div className="overflow-hidden bg-foreground py-2 text-background">
          <div className="bkp2-marquee flex whitespace-nowrap">
            {[...tickerRun, ...tickerRun].map((item, i) => (
              <span key={i} className="flex items-center">
                <span className="mx-8 text-sm font-medium">{item}</span>
                <span className="text-primary" aria-hidden="true">
                  •
                </span>
              </span>
            ))}
          </div>
        </div>

        <main className="flex flex-1 flex-col">
          {/* Featured story */}
          <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="mb-6 flex items-center gap-3">
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              <span className="text-sm font-semibold uppercase tracking-wide text-primary">
                {featured.badge}
              </span>
            </div>

            <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
              <button
                type="button"
                onClick={() => go("Blog post")}
                className="group block overflow-hidden rounded-2xl"
              >
                <Image
                  alt={featured.alt}
                  w={800}
                  h={600}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
              <div>
                <div className="mb-4 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">
                    {featured.topic}
                  </span>
                  <span aria-hidden="true">•</span>
                  <span>{featured.date}</span>
                  <span aria-hidden="true">•</span>
                  <span>{featured.readTime}</span>
                </div>
                <h2 className="mb-6 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                  {featured.title}
                </h2>
                <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
                  {featured.excerpt}
                </p>
                <button
                  type="button"
                  onClick={() => go("Blog post")}
                  className="flex items-center gap-4 text-left"
                >
                  <Image
                    alt={featured.authorAlt}
                    w={100}
                    h={100}
                    className="size-12 rounded-full object-cover"
                  />
                  <span>
                    <span className="block font-semibold text-foreground">
                      {featured.author}
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      {featured.authorRole}
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* Topic chips */}
          <section className="border-y border-border">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">{topics.title}</h3>
                <button
                  type="button"
                  onClick={() => go(topics.viewAll)}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {topics.viewAll}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {topics.chips.map((chip, i) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => go(chip)}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      i === 1
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground hover:bg-primary hover:text-primary-foreground",
                    )}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Article grid */}
          <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article key={post.title} className="group flex flex-col">
                  <button
                    type="button"
                    onClick={() => go("Blog post")}
                    className="mb-4 block overflow-hidden rounded-xl"
                  >
                    <Image
                      alt={post.alt}
                      w={600}
                      h={400}
                      loading="lazy"
                      className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </button>
                  <div className="mb-2 flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">
                      {post.tag}
                    </span>
                    <span aria-hidden="true">•</span>
                    <span>{post.date}</span>
                  </div>
                  <h3 className="mb-2 text-xl font-bold transition-colors group-hover:text-primary">
                    <button
                      type="button"
                      onClick={() => go("Blog post")}
                      className="text-left"
                    >
                      {post.title}
                    </button>
                  </h3>
                  <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto flex items-center gap-3">
                    <Image
                      alt={post.authorAlt}
                      w={100}
                      h={100}
                      loading="lazy"
                      className="size-8 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium">{post.author}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Editor's Picks */}
          <section className="bg-muted py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8 flex items-center gap-3">
                <svg
                  className="size-5 text-primary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <h2 className="text-2xl font-bold">{editorPicks.title}</h2>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                {editorPicks.items.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => go("Blog post")}
                    className="rounded-2xl bg-card p-6 text-left shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <Image
                        alt={item.alt}
                        w={200}
                        h={200}
                        loading="lazy"
                        className="size-24 flex-shrink-0 rounded-xl object-cover"
                      />
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <span className="rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                            {item.badge}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {item.readTime}
                          </span>
                        </div>
                        <h4 className="mb-2 text-lg font-bold transition-colors group-hover:text-primary">
                          {item.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {item.excerpt}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Newsletter */}
          <section className="py-20">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <div className="mb-6 inline-flex size-16 items-center justify-center rounded-2xl bg-primary/10">
                <svg
                  className="size-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                {newsletter.title}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                {newsletter.subtitle}
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  go(newsletter.cta)
                }}
                className="mx-auto mb-6 flex max-w-lg flex-col gap-3 sm:flex-row"
              >
                <input
                  type="email"
                  required
                  placeholder={newsletter.placeholder}
                  className="flex-1 rounded-lg border border-input bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
                <button
                  type="submit"
                  className="whitespace-nowrap rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {newsletter.cta}
                </button>
              </form>

              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                {newsletter.perks.map((perk) => (
                  <span key={perk} className="flex items-center gap-2">
                    <svg
                      className="size-4 text-primary"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {perk}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Free resources (inverted dark band) */}
          <section className="bg-foreground py-16 text-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold">{resources.title}</h2>
                <button
                  type="button"
                  onClick={() => go(resources.viewAll)}
                  className="font-medium text-primary transition-colors hover:text-background"
                >
                  {resources.viewAll} →
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {resources.items.map((item, i) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => go(item.title)}
                    className="group rounded-xl bg-background/10 p-5 text-left transition-colors hover:bg-background/20"
                  >
                    <span className="mb-4 grid size-10 place-items-center rounded-lg bg-primary/20">
                      <svg
                        className="size-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        {resourceIcons[i % resourceIcons.length]}
                      </svg>
                    </span>
                    <h4 className="mb-1 font-semibold transition-colors group-hover:text-primary">
                      {item.title}
                    </h4>
                    <p className="text-sm text-background/60">
                      {item.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-12 text-background/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-8 md:grid-cols-4">
              <div>
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <BrandTile />
                  <span className="text-xl font-bold tracking-tight text-background">
                    {brand}
                  </span>
                </button>
                <p className="text-sm leading-relaxed">{footer.about}</p>
              </div>

              {footer.columns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="transition-colors hover:text-background"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 sm:flex-row">
              <p className="text-sm">{footer.copyright}</p>
              <div className="flex items-center gap-4">
                {footer.socials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="transition-colors hover:text-background"
                  >
                    <SocialIcon name={social} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
