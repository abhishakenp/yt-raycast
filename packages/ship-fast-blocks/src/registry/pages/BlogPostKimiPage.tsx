import { useState } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * BlogPostKimiPage — a complete, self-contained editorial BLOG POST / article
 * DETAIL page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Studio Journal" design: a
 * calm, light, magazine-style reading layout with serif pull-quotes, generous
 * whitespace, and a centered long-form column. It pairs a sticky publication
 * navbar with an article header (category pill, large headline, dek, author +
 * date + read-time byline), a full-width cover image, a richly typeset article
 * body (lead paragraph, section headings, sub-headings, an accented serif
 * pull-quote, an inline figure with caption, and a highlighted research-findings
 * callout), a tag list, an author bio card, a 3-up related-articles grid, a
 * newsletter subscribe band, and a multi-column footer.
 *
 * The block owns ALL layout, spacing, type hierarchy and color. Surfaces use
 * semantic tokens (light reading canvas, muted bands, primary accents). Every
 * nav item / link / CTA / form submit routes through `useNavigate` (never a
 * dead "#"), and navbar labels match the `nav` array so PageSwitch can swap
 * pages. All content imagery uses the alt-driven <Image> component (avatars are
 * decorative raw <img>). Callers supply ONLY content data; rich defaults make
 * it render great with no props at all.
 */
export const BlogPostKimiPage = defineComponent({
  name: "BlogPostKimiPage",
  description:
    "Complete editorial BLOG POST / long-form ARTICLE DETAIL page with a calm, light, magazine reading aesthetic: centered prose column, generous whitespace, serif pull-quotes and a publication feel. Includes a sticky publication navbar, an article header (category pill, large headline, dek/subtitle, author avatar + date + read-time byline), a full-width cover image, a typeset article body (lead paragraph, h2/h3 section headings, an accented serif blockquote pull-quote, an inline figure with caption, bold inline emphasis, and a highlighted key-findings callout panel), a tag/topic list, an author bio card with social links, a 3-up related-articles grid with hover-zoom thumbnails, a newsletter subscribe band with email form, and a multi-column footer. Use for a blog post, journal/magazine article, essay, editorial story, news article, case study writeup, changelog or documentation article — any single-article reading page (NOT a marketing landing hero). Supply content only — brand, nav, header, cover, body sections, tags, author, related posts, newsletter, footer; the block owns all layout and styling.",
  props: z.object({
    /** Publication / brand name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Article header (category, title, dek, byline). */
    header: z
      .object({
        category: z.string().optional(),
        title: z.string().optional(),
        dek: z.string().optional(),
        authorName: z.string().optional(),
        authorRole: z.string().optional(),
        authorAvatarAlt: z.string().optional(),
        date: z.string().optional(),
        readTime: z.string().optional(),
      })
      .optional(),
    /** Full-width cover image. */
    cover: z
      .object({
        imageAlt: z.string().optional(),
        caption: z.string().optional(),
      })
      .optional(),
    /** Lead (intro) paragraphs rendered above the first heading. */
    lead: z.array(z.string()).optional(),
    /**
     * Body sections. Each has a heading and ordered blocks. A block is either a
     * paragraph ({ p }), a sub-heading ({ h3 }), a figure ({ imageAlt, caption }),
     * or a bullet callout ({ callout, items }).
     */
    sections: z
      .array(
        z.object({
          heading: z.string(),
          blocks: z.array(
            z.object({
              p: z.string().optional(),
              h3: z.string().optional(),
              imageAlt: z.string().optional(),
              caption: z.string().optional(),
              callout: z.string().optional(),
              items: z.array(z.string()).optional(),
            }),
          ),
        }),
      )
      .optional(),
    /** Accented serif pull-quote inserted after the first section. */
    pullQuote: z
      .object({
        quote: z.string().optional(),
        attribution: z.string().optional(),
      })
      .optional(),
    /** Closing paragraphs rendered after the last section. */
    closing: z.array(z.string()).optional(),
    /** Tag / topic chips beneath the article. */
    tags: z.array(z.string()).optional(),
    /** Author bio card. */
    author: z
      .object({
        name: z.string().optional(),
        bio: z.string().optional(),
        avatarAlt: z.string().optional(),
        links: z.array(z.string()).optional(),
      })
      .optional(),
    /** Related articles grid. */
    related: z
      .object({
        heading: z.string().optional(),
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
      })
      .optional(),
    /** Newsletter subscribe band. */
    newsletter: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        placeholder: z.string().optional(),
        submit: z.string().optional(),
        footnote: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        blurb: z.string().optional(),
        columns: z
          .array(z.object({ heading: z.string(), links: z.array(z.string()) }))
          .optional(),
        note: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Studio Journal"
    const nav = props.nav?.length
      ? props.nav
      : ["Articles", "Authors", "Topics", "About"]

    const category = props.header?.category ?? "Design Philosophy"
    const title =
      props.header?.title ??
      "The Art of Slow Design: Why Taking Your Time Creates Better Products"
    const dek =
      props.header?.dek ??
      "In an industry obsessed with speed, the most impactful designers are learning to pause, reflect, and let ideas mature."
    const authorName = props.header?.authorName ?? "Elena Martinez"
    const authorRole = props.header?.authorRole ?? "Design Director"
    const headerAvatarAlt =
      props.header?.authorAvatarAlt ??
      "Professional headshot of Elena Martinez, a design director with warm smile and dark hair"
    const date = props.header?.date ?? "March 15, 2024"
    const readTime = props.header?.readTime ?? "12 min read"

    const coverAlt =
      props.cover?.imageAlt ??
      "Minimalist design workspace with natural light, featuring a clean desk with notebook and single plant"
    const coverCaption =
      props.cover?.caption ??
      "A serene, minimalist workspace representing the philosophy of slow design"

    const lead = props.lead?.length
      ? props.lead
      : [
          "Last October, I watched a junior designer spend three days perfecting a button hover state. The rest of the team was racing toward a deadline, cranking out screens at breakneck speed. But there was Sarah, adjusting micro-interactions by milliseconds, testing color shifts in different lighting conditions, documenting her rationale in excruciating detail.",
        ]

    const introParagraphs = [
      "On day four, she presented her work. The room went quiet. That button wasn't just functional—it was delightful. Users would feel it before they understood it. The micro-interaction communicated trust, responsiveness, and care. It was a tiny detail that elevated the entire product experience.",
      "This is the paradox of modern design: we're told to move fast, ship constantly, iterate quickly. Yet the work that endures—the products people truly love—often comes from designers who resist the pressure to rush. They practice what I call \"slow design,\" and it's becoming the competitive advantage nobody talks about.",
    ]

    const sections = props.sections?.length
      ? props.sections
      : [
          {
            heading: "The Speed Trap",
            blocks: [
              {
                p: "Silicon Valley has fetishized velocity. We celebrate teams that ship features weekly, designers who produce dozens of screens daily, companies that \"move fast and break things.\" The underlying assumption is that speed equals innovation, that the first to market wins, that iteration beats deliberation.",
              },
              {
                p: "But this narrative ignores a crucial truth: most products don't fail because they launched too slowly. They fail because they solve the wrong problem, or solve it poorly, or create more friction than they remove. In my 15 years of designing digital products, I've seen rushed launches kill promising concepts more often than missed deadlines ever have.",
              },
              {
                p: "Consider the data. According to a 2023 study by the Design Management Institute, design-led companies that prioritize thorough research and iteration outperform their peers by 228% on the S&P 500 over ten years. The correlation isn't just about having designers—it's about giving those designers time to think deeply.",
              },
            ],
          },
          {
            heading: "What Slow Design Looks Like",
            blocks: [
              {
                p: "Slow design isn't about working less or missing deadlines. It's about allocating time where it matters most. Here's what I've observed in teams that practice it well:",
              },
              { h3: "1. Extended Problem Immersion" },
              {
                p: "Instead of jumping to solutions, slow designers spend disproportionate time understanding the problem space. When Airbnb redesigned their host onboarding in 2021, the team spent six weeks just shadowing hosts, mapping emotional journeys, and identifying moments of anxiety that weren't obvious in analytics. The resulting design increased host activation by 34%—but it required patience that many teams would have bypassed.",
              },
              { h3: "2. Deliberate Constraint Setting" },
              {
                p: "Paradoxically, slowing down often means setting stricter constraints. When Figma built their multiplayer editing feature, they deliberately limited the initial scope to text editing only. This constraint allowed the team to perfect the underlying synchronization engine rather than spreading their attention across multiple feature surfaces. The result felt magical because it was polished, not because it was comprehensive.",
              },
              {
                imageAlt:
                  "Team of designers collaborating around a large table with sketches and wireframes",
                caption:
                  "Team collaboration session at Notion's San Francisco office, 2023",
              },
              { h3: "3. Maturation Periods" },
              {
                p: "Notion's infamous for their approach to features: they often sit on completed designs for months before shipping. CEO Ivan Zhao has explained that this \"maturation period\" allows the team to experience their own product daily, identifying friction points that weren't visible during initial design. The waitlist feature, which drove significant growth in 2022, was built and then shelved for eight months while the team refined the invitation flow.",
              },
            ],
          },
          {
            heading: "The Business Case for Patience",
            blocks: [
              {
                p: "Skeptics will ask: how do you justify slow design to stakeholders demanding velocity? The answer lies in measuring what matters. Feature velocity is easy to quantify; user satisfaction, retention impact, and brand perception are harder but ultimately more valuable.",
              },
              {
                p: "When Linear built their issue tracking product, they famously rejected VC pressure to scale quickly. The small team spent two years on a product that competitors might have built in six months. But those 18 \"extra\" months produced a tool so refined that it commands a premium price in a crowded market. Linear's annual recurring revenue crossed $20 million in 2023—a testament to the economics of excellence.",
              },
              {
                callout: "Key Research Findings",
                items: [
                  "McKinsey's 2023 design study found that companies with formal \"thinking time\" policies saw 47% higher customer satisfaction scores",
                  "Teams that conduct 3+ rounds of user testing (vs. 1-2) reduce post-launch bug reports by 62%",
                  "Products with 6+ month development cycles show 3x higher 2-year retention than those built in under 3 months",
                ],
              },
            ],
          },
          {
            heading: "Practical Slow Design",
            blocks: [
              {
                p: "Adopting slow design doesn't require corporate policy changes or executive buy-in. Individual designers and small teams can implement it immediately:",
              },
              {
                p: "Start with a \"waiting list\" for your own ideas. When you have a design solution, write it down and revisit it in 48 hours. Most initial solutions benefit from this cooling period—you'll spot assumptions, simplifications, and missed opportunities that weren't visible in the moment of creation.",
              },
              {
                p: "Protect deep work blocks aggressively. Cal Newport's research on deep work applies directly to design. Two hours of uninterrupted focus produces better outcomes than six hours of fragmented attention. Schedule these blocks during your peak cognitive hours and defend them ruthlessly.",
              },
              {
                p: "Build \"beauty sprints\" into your timeline. After functional completion, allocate 20% of remaining project time purely for refinement. This isn't gold-plating—it's the period when good products become great. Use it for micro-interactions, edge cases, and those details that separate professional work from exceptional work.",
              },
            ],
          },
          {
            heading: "The Future is Thoughtful",
            blocks: [
              {
                p: "As AI tools accelerate the production of mediocre design, human judgment and taste become more valuable, not less. The designers who thrive won't be those who produce the fastest—they'll be those who know when to slow down, when to question defaults, when to let ideas mature.",
              },
              {
                p: "Sarah, that junior designer obsessing over button states? She was promoted to senior within 18 months. Her work on that micro-interaction became a case study that her current team—a Series B fintech startup—still references. The three days that seemed extravagant were, in retrospect, an investment that paid dividends far beyond the immediate project.",
              },
            ],
          },
        ]

    const pullQuote =
      props.pullQuote?.quote ??
      "Speed is the enemy of nuance. When we rush, we default to patterns we've used before, solutions we've seen work elsewhere. We stop seeing the unique context in front of us."
    const pullQuoteAttribution =
      props.pullQuote?.attribution ??
      "From a 2022 interview with Jony Ive in The Design Journal"

    const closing = props.closing?.length
      ? props.closing
      : [
          "The art of slow design isn't about working less. It's about working where it counts. In a world addicted to speed, patience is the ultimate competitive advantage.",
        ]

    const tags = props.tags?.length
      ? props.tags
      : ["Design Process", "Product Strategy", "UX Research", "Team Culture"]

    const authorBioName = props.author?.name ?? "Elena Martinez"
    const authorBio =
      props.author?.bio ??
      "Elena is a Design Director with 15 years of experience building products at Stripe, Airbnb, and Notion. She writes about the intersection of craft, strategy, and team culture. Her work has been featured in Communication Arts, Fast Company, and the AIGA Design Journal."
    const authorBioAvatarAlt =
      props.author?.avatarAlt ??
      "Professional headshot of Elena Martinez, design director and writer"
    const authorLinks = props.author?.links?.length
      ? props.author.links
      : ["Twitter", "LinkedIn", "Portfolio"]

    const relatedHeading = props.related?.heading ?? "Related Articles"
    const relatedItems = props.related?.items?.length
      ? props.related.items
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

    const newsletterHeading =
      props.newsletter?.heading ?? "Subscribe to Studio Journal"
    const newsletterDesc =
      props.newsletter?.description ??
      "Get weekly articles on design craft, strategy, and team culture. No spam, unsubscribe anytime."
    const newsletterPlaceholder =
      props.newsletter?.placeholder ?? "your@email.com"
    const newsletterSubmit = props.newsletter?.submit ?? "Subscribe"
    const newsletterFootnote =
      props.newsletter?.footnote ??
      "Join 12,400+ designers. Delivered every Tuesday."

    const footerBlurb =
      props.footer?.blurb ??
      "A publication for designers who care about craft. Exploring the intersection of aesthetics, strategy, and human-centered product development."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            heading: "Explore",
            links: ["All Articles", "Topics", "Authors", "Podcast"],
          },
          {
            heading: "Connect",
            links: ["Twitter", "LinkedIn", "YouTube", "RSS Feed"],
          },
        ]
    const footerNote = props.footer?.note ?? "All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service"]

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(brand)}
                className="text-xl font-semibold tracking-tight text-foreground"
              >
                {brand}
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v) => !v)}
                className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
              >
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
            {mobileOpen && (
              <div
                id="mobile-menu"
                className="flex flex-col border-t border-border bg-background px-4 py-6 pb-8 md:hidden gap-4"
              >
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setMobileOpen(false)
                      go(label)
                    }}
                    className="text-base font-medium text-foreground/90 transition-colors hover:text-foreground text-left"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Article header */}
        <header className="pt-16 pb-12 lg:pt-24 lg:pb-16">
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
                  alt={headerAvatarAlt}
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

        {/* Cover image */}
        <div className="mx-auto mb-16 max-w-5xl px-6 lg:px-8">
          <figure className="relative">
            <Image
              alt={coverAlt}
              w={1600}
              h={900}
              className="h-[400px] w-full rounded-lg object-cover md:h-[500px] lg:h-[600px]"
            />
            <figcaption className="sr-only">{coverCaption}</figcaption>
          </figure>
        </div>

        {/* Article body */}
        <article className="mx-auto max-w-3xl px-6 pb-24 lg:px-8">
          <div className="max-w-none">
            {lead.map((p) => (
              <p
                key={p}
                className="mb-8 text-xl font-light leading-relaxed text-foreground/90 md:text-2xl"
              >
                {p}
              </p>
            ))}

            {introParagraphs.map((p) => (
              <p
                key={p}
                className="mb-6 text-lg leading-relaxed text-muted-foreground"
              >
                {p}
              </p>
            ))}

            {sections.map((section, sIdx) => (
              <div key={section.heading}>
                <h2 className="mt-12 mb-6 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                  {section.heading}
                </h2>

                {section.blocks.map((block, bIdx) => {
                  if (block.h3) {
                    return (
                      <h3
                        key={`${section.heading}-h3-${bIdx}`}
                        className="mt-8 mb-4 text-xl font-semibold text-foreground"
                      >
                        {block.h3}
                      </h3>
                    )
                  }
                  if (block.imageAlt) {
                    return (
                      <figure
                        key={`${section.heading}-fig-${bIdx}`}
                        className="my-12"
                      >
                        <Image
                          alt={block.imageAlt}
                          w={1200}
                          h={675}
                          loading="lazy"
                          className="h-64 w-full rounded-lg object-cover md:h-80"
                        />
                        {block.caption ? (
                          <figcaption className="mt-3 text-center text-sm text-muted-foreground">
                            {block.caption}
                          </figcaption>
                        ) : null}
                      </figure>
                    )
                  }
                  if (block.callout) {
                    return (
                      <div
                        key={`${section.heading}-callout-${bIdx}`}
                        className="my-12 rounded-lg bg-muted p-8"
                      >
                        <h4 className="mb-4 text-lg font-semibold text-foreground">
                          {block.callout}
                        </h4>
                        <ul className="space-y-3 text-muted-foreground">
                          {(block.items ?? []).map((item) => (
                            <li key={item} className="flex items-start gap-3">
                              <span
                                className="mt-1 text-primary"
                                aria-hidden="true"
                              >
                                •
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  }
                  return (
                    <p
                      key={`${section.heading}-p-${bIdx}`}
                      className="mb-6 text-lg leading-relaxed text-muted-foreground"
                    >
                      {block.p}
                    </p>
                  )
                })}

                {/* Pull-quote after the first section */}
                {sIdx === 0 ? (
                  <blockquote className="my-12 border-l-4 border-primary py-2 pl-6">
                    <p className="font-serif text-2xl italic leading-relaxed text-foreground md:text-3xl">
                      &ldquo;{pullQuote}&rdquo;
                    </p>
                    <footer className="mt-4 text-sm text-muted-foreground">
                      — {pullQuoteAttribution}
                    </footer>
                  </blockquote>
                ) : null}
              </div>
            ))}

            {closing.map((p) => (
              <p
                key={p}
                className="mb-8 text-lg leading-relaxed text-muted-foreground"
              >
                {p}
              </p>
            ))}
          </div>

          {/* Tags */}
          <div className="mt-12 border-t border-border pt-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-2 text-sm text-muted-foreground">Tagged:</span>
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => go(tag)}
                  className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Author bio */}
          <div className="mt-12 rounded-lg bg-muted p-8">
            <div className="flex flex-col items-start gap-6 sm:flex-row">
              <Image
                alt={authorBioAvatarAlt}
                w={160}
                h={160}
                className="size-20 shrink-0 rounded-full object-cover"
              />
              <div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {authorBioName}
                </h3>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  {authorBio}
                </p>
                <div className="flex gap-4">
                  {authorLinks.map((link) => (
                    <button
                      key={link}
                      type="button"
                      onClick={() => go(link)}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Related posts */}
        <section className="bg-muted py-16 lg:py-24">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <h2 className="mb-10 text-2xl font-semibold tracking-tight text-foreground">
              {relatedHeading}
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {relatedItems.map((post) => (
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

        {/* Newsletter */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
              {newsletterHeading}
            </h2>
            <p className="mb-8 text-muted-foreground">{newsletterDesc}</p>
            <form
              className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault()
                go(newsletterSubmit)
              }}
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                type="email"
                id="newsletter-email"
                placeholder={newsletterPlaceholder}
                required
                className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {newsletterSubmit}
              </button>
            </form>
            <p className="mt-4 text-xs text-muted-foreground">
              {newsletterFootnote}
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-12 lg:py-16">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <div className="mb-12 grid gap-8 md:grid-cols-4">
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={() => go(brand)}
                  className="mb-4 block text-xl font-semibold tracking-tight text-foreground"
                >
                  {brand}
                </button>
                <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {footerBlurb}
                </p>
              </div>
              {footerColumns.map((col) => (
                <div key={col.heading}>
                  <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">
                    {col.heading}
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {brand}. {footerNote}
              </p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link}
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
