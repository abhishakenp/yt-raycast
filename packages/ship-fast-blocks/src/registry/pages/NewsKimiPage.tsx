import { z } from "zod/v4"
import { useState } from "react"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { useState } from "react"

/**
 * NewsKimiPage — a complete, self-contained NEWS / EDITORIAL homepage.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "The Chronicle" design: a
 * clean, light, broadsheet-style news index built on a neutral canvas. It is
 * deliberately NOT a marketing landing page — there is no tall hero band.
 * Instead it opens with a breaking-news ticker and a featured-story grid (one
 * big lead article + a stacked rail of secondary headlines), then a two-column
 * body: a "Latest Stories" feed of image+headline cards beside a sticky-feeling
 * sidebar (Trending Now ranked list, Most Discussed, a dark newsletter signup,
 * Popular Topics tag cloud, and a Writer Spotlight). It closes with a
 * browse-by-category image grid, reader testimonials, a "Support Independent
 * Journalism" subscribe CTA, and a fat multi-column footer.
 *
 * The block owns ALL layout, spacing, type hierarchy and color. Category labels
 * rotate through theme accent tokens (primary/secondary/accent/chart-*) — never
 * raw palette colors. Every nav item, headline link, CTA, tag, social and form
 * submit routes through `useNavigate` (never a dead "#"). All content imagery
 * uses the alt-driven <Image> component. Callers supply ONLY content data; rich
 * defaults make it render great with no props at all.
 */
export const NewsKimiPage = defineComponent({
  name: "NewsKimiPage",
  description:
    "Complete NEWS / EDITORIAL / journalism HOMEPAGE (newspaper, magazine, online publication, blog index) with a clean light broadsheet aesthetic on a neutral canvas — NOT a marketing landing page and with NO tall hero band. Opens with a red breaking-news ticker plus a featured-story grid (one large lead article with photo + a stacked rail of secondary headlines with category labels and timestamps), then a two-column layout: a 'Latest Stories' feed of image+headline article cards with author, read-time and category tags beside a content sidebar (Trending Now numbered ranked list, Most Discussed with comment counts, a dark newsletter / Daily Briefing email signup, a Popular Topics tag cloud, and a Writer Spotlight author card). Continues with a browse-by-category image tile grid, reader testimonials with star ratings, a 'Support Independent Journalism' subscribe CTA with subscriber/Pulitzer stats, and a five-column footer with sections, company, support, legal links and social icons. Use as the ROOT/home or index page for news sites, newspapers, magazines, editorial publications, media brands, content portals or article-heavy blogs that need dense, multi-section content discovery with categories, trending lists and subscriptions. Supply content only — brand, nav, breaking headline, featured + secondary stories, latest feed, sidebar, categories, testimonials, CTA, footer; the block owns all layout and styling.",
  props: z.object({
    /** Publication / masthead name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar section labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Trending ticker shown under the navbar: a label + clickable topic links. */
    ticker: z
      .object({
        label: z.string().optional(),
        topics: z.array(z.string()).optional(),
      })
      .optional(),
    /** Breaking-news banner at the top of the featured section. */
    breaking: z
      .object({
        badge: z.string().optional(),
        headline: z.string().optional(),
        time: z.string().optional(),
      })
      .optional(),
    /** Featured lead story (big card) + a rail of secondary headlines. */
    featured: z
      .object({
        tag: z.string().optional(),
        title: z.string().optional(),
        excerpt: z.string().optional(),
        author: z.string().optional(),
        date: z.string().optional(),
        readTime: z.string().optional(),
        imageAlt: z.string().optional(),
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
      })
      .optional(),
    /** Main "Latest Stories" feed. */
    latest: z
      .object({
        heading: z.string().optional(),
        filters: z.array(z.string()).optional(),
        loadMore: z.string().optional(),
        stories: z
          .array(
            z.object({
              category: z.string(),
              time: z.string(),
              title: z.string(),
              excerpt: z.string(),
              author: z.string(),
              readTime: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Right-hand content sidebar. */
    sidebar: z
      .object({
        trendingHeading: z.string().optional(),
        trending: z
          .array(z.object({ title: z.string(), reads: z.string() }))
          .optional(),
        discussedHeading: z.string().optional(),
        discussed: z
          .array(z.object({ title: z.string(), comments: z.string() }))
          .optional(),
        newsletterTitle: z.string().optional(),
        newsletterDesc: z.string().optional(),
        newsletterCta: z.string().optional(),
        newsletterNote: z.string().optional(),
        topicsHeading: z.string().optional(),
        topics: z.array(z.string()).optional(),
        writerHeading: z.string().optional(),
        writerName: z.string().optional(),
        writerRole: z.string().optional(),
        writerBio: z.string().optional(),
        writerCta: z.string().optional(),
        writerAvatarAlt: z.string().optional(),
      })
      .optional(),
    /** Browse-by-category tile grid. */
    categories: z
      .object({
        heading: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              count: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Reader testimonials with star ratings. */
    testimonials: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        items: z
          .array(
            z.object({
              quote: z.string(),
              name: z.string(),
              role: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Subscribe / support CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primary: z.string().optional(),
        secondary: z.string().optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(
            z.object({ heading: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        socials: z.array(z.string()).optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "The Chronicle"
    const nav = props.nav?.length
      ? props.nav
      : ["News", "Politics", "Business", "Tech", "Culture", "Science", "Health"]

    const tickerLabel = props.ticker?.label ?? "Trending:"
    const tickerTopics = props.ticker?.topics?.length
      ? props.ticker.topics
      : [
          "Climate Summit",
          "AI Regulation",
          "Market Watch",
          "Oscar Nominations",
          "SpaceX Launch",
          "Premier League",
        ]

    const breakingBadge = props.breaking?.badge ?? "Breaking"
    const breakingHeadline =
      props.breaking?.headline ??
      "Federal Reserve announces 0.25% interest rate cut amid economic uncertainty"
    const breakingTime = props.breaking?.time ?? "2 min ago"

    const featTag = props.featured?.tag ?? "Featured"
    const featTitle =
      props.featured?.title ??
      "Inside the Newsroom: How Investigative Journalism is Evolving in the Digital Age"
    const featExcerpt =
      props.featured?.excerpt ??
      "A year-long study reveals the transformation of investigative reporting as newsrooms adapt to shrinking budgets, AI tools, and changing reader habits across America's leading publications."
    const featAuthor = props.featured?.author ?? "Sarah Mitchell"
    const featDate = props.featured?.date ?? "January 15, 2026"
    const featReadTime = props.featured?.readTime ?? "12 min read"
    const featImageAlt =
      props.featured?.imageAlt ??
      "Newsroom journalist working at computer screens in modern newsroom"
    const secondary = props.featured?.secondary?.length
      ? props.featured.secondary
      : [
          {
            category: "Politics",
            title:
              "Senate Passes Infrastructure Bill with Historic Climate Provisions",
            excerpt:
              "Bipartisan vote marks major legislative victory for Biden administration.",
            time: "4 hours ago",
            imageAlt: "United States Capitol building dome against blue sky",
          },
          {
            category: "Tech",
            title:
              "Apple Unveils Mixed Reality Headset Pro with Revolutionary Display",
            excerpt: "$3,499 device promises to transform spatial computing.",
            time: "6 hours ago",
            imageAlt:
              "Person wearing modern VR virtual reality headset in bright studio",
          },
          {
            category: "Science",
            title:
              "James Webb Telescope Discovers Water Vapor on Distant Exoplanet",
            excerpt:
              "Finding suggests potential for habitable conditions 120 light-years away.",
            time: "8 hours ago",
            imageAlt:
              "James Webb Space Telescope golden hexagonal mirrors closeup",
          },
        ]

    const latestHeading = props.latest?.heading ?? "Latest Stories"
    const latestFilters = props.latest?.filters?.length
      ? props.latest.filters
      : ["All", "News", "Opinion", "Analysis"]
    const latestLoadMore = props.latest?.loadMore ?? "Load More Stories"
    const latestStories = props.latest?.stories?.length
      ? props.latest.stories
      : [
          {
            category: "Business",
            time: "2 hours ago",
            title:
              "Global Markets Rally as Inflation Data Shows Promising Slowdown",
            excerpt:
              "S&P 500 reaches new all-time high as consumer price index rises just 2.8% annually, below economist expectations of 3.1%.",
            author: "By Michael Torres",
            readTime: "8 min read",
            imageAlt:
              "Stock market trading floor with multiple monitors showing charts",
          },
          {
            category: "Health",
            time: "3 hours ago",
            title:
              "New Alzheimer's Drug Shows Promise in Phase 3 Clinical Trials",
            excerpt:
              "Donanemab reduces cognitive decline by 35% in early-stage patients, offering new hope for millions of families worldwide.",
            author: "By Dr. Emily Chen",
            readTime: "10 min read",
            imageAlt:
              "Medical research laboratory with scientist examining samples",
          },
          {
            category: "Travel",
            time: "5 hours ago",
            title:
              "Switzerland's Hidden Alpine Villages: A Complete Guide to Off-Peak Exploration",
            excerpt:
              "Skip the crowds at Zermatt and discover these pristine mountain communities where traditional cheese-making still thrives.",
            author: "By James Whitmore",
            readTime: "15 min read",
            imageAlt: "Dramatic mountain landscape with snow peaks at sunrise",
          },
          {
            category: "Tech",
            time: "Yesterday",
            title:
              "NVIDIA's Blackwell Chips Promise 30x Performance Leap for AI Workloads",
            excerpt:
              "Next-generation GPUs reduce training time for large language models from months to days, reshaping the competitive landscape.",
            author: "By Lisa Park",
            readTime: "12 min read",
            imageAlt:
              "Advanced computer processor chip with intricate circuit patterns",
          },
          {
            category: "Culture",
            time: "Yesterday",
            title:
              "Indie Films Dominate Oscar Shortlists in Historic First for Streaming",
            excerpt:
              "Netflix and A24 lead nominations as traditional studios struggle to compete with bold, auteur-driven storytelling.",
            author: "By Alexandra Reed",
            readTime: "7 min read",
            imageAlt:
              "Film director reviewing footage on monitors in production studio",
          },
          {
            category: "Climate",
            time: "2 days ago",
            title:
              "Renewable Energy Surpasses Coal for First Time in U.S. History",
            excerpt:
              "Wind and solar now generate 22% of American electricity, marking a historic milestone in the clean energy transition.",
            author: "By David Martinez",
            readTime: "9 min read",
            imageAlt:
              "Wind turbines on green hills against dramatic sky at sunset",
          },
        ]

    const trendingHeading = props.sidebar?.trendingHeading ?? "Trending Now"
    const trending = props.sidebar?.trending?.length
      ? props.sidebar.trending
      : [
          {
            title:
              "Russia-Ukraine Peace Talks Resume in Geneva After Months of Silence",
            reads: "24.5K reads",
          },
          {
            title:
              "Tesla Cybertruck Deliveries Begin as Waitlist Reaches 2 Million",
            reads: "18.2K reads",
          },
          {
            title: "Taylor Swift Announces Surprise Album Release for Next Month",
            reads: "15.8K reads",
          },
          {
            title: "Manchester United Confirm New Manager Appointment",
            reads: "12.4K reads",
          },
          {
            title: "Bitcoin Breaks $75,000 as ETF Inflows Reach Record Highs",
            reads: "9.7K reads",
          },
        ]

    const discussedHeading = props.sidebar?.discussedHeading ?? "Most Discussed"
    const discussed = props.sidebar?.discussed?.length
      ? props.sidebar.discussed
      : [
          {
            title:
              "Should Remote Workers Be Paid Based on Location? Silicon Valley Debates",
            comments: "847 comments",
          },
          {
            title: "The End of Free Returns? Retailers Rethink Generous Policies",
            comments: "623 comments",
          },
          {
            title: "University Admissions: Is the SAT Making a Comeback?",
            comments: "512 comments",
          },
        ]

    const newsletterTitle =
      props.sidebar?.newsletterTitle ?? "The Daily Briefing"
    const newsletterDesc =
      props.sidebar?.newsletterDesc ??
      "Essential news, expert analysis, and exclusive features delivered to your inbox every morning."
    const newsletterCta = props.sidebar?.newsletterCta ?? "Subscribe Free"
    const newsletterNote =
      props.sidebar?.newsletterNote ??
      "Join 145,000+ subscribers. No spam, unsubscribe anytime."

    const topicsHeading = props.sidebar?.topicsHeading ?? "Popular Topics"
    const topics = props.sidebar?.topics?.length
      ? props.sidebar.topics
      : [
          "Artificial Intelligence",
          "Climate Change",
          "2026 Elections",
          "Gaza Conflict",
          "CEOs Under Pressure",
          "Streaming Wars",
          "Space Exploration",
          "Mental Health",
        ]

    const writerHeading = props.sidebar?.writerHeading ?? "Writer Spotlight"
    const writerName = props.sidebar?.writerName ?? "Maria Santos"
    const writerRole = props.sidebar?.writerRole ?? "Foreign Correspondent"
    const writerBio =
      props.sidebar?.writerBio ??
      "Reporting from conflict zones for 15 years. Recent coverage includes Gaza, Ukraine, and Sudan."
    const writerCta = props.sidebar?.writerCta ?? "View profile"
    const writerAvatarAlt =
      props.sidebar?.writerAvatarAlt ??
      "Professional headshot of journalist Maria Santos, smiling in professional attire"

    const categoriesHeading =
      props.categories?.heading ?? "Browse by Category"
    const categoriesViewAll = props.categories?.viewAll ?? "View all"
    const categoryItems = props.categories?.items?.length
      ? props.categories.items
      : [
          {
            name: "News",
            count: "1,247 stories",
            imageAlt: "News desk with journalists working in modern newsroom",
          },
          {
            name: "Politics",
            count: "892 stories",
            imageAlt:
              "United States Capitol building dome in Washington DC",
          },
          {
            name: "Business",
            count: "654 stories",
            imageAlt:
              "Business analytics dashboard with financial charts and graphs",
          },
          {
            name: "Technology",
            count: "1,532 stories",
            imageAlt: "Computer circuit board with glowing processor chip",
          },
          {
            name: "Culture",
            count: "421 stories",
            imageAlt:
              "Movie theater with red velvet seats and classic cinema interior",
          },
          {
            name: "Science",
            count: "378 stories",
            imageAlt:
              "Scientific laboratory with researcher examining microscope samples",
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "What Readers Say"
    const testimonialsSub =
      props.testimonials?.subheading ??
      "Trusted by over 2 million subscribers worldwide"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "The Chronicle's investigative reporting on climate policy helped me understand complex legislation better than any other source. Their journalists actually read the bills.",
            name: "Prof. Robert Chen",
            role: "Environmental Policy, Stanford",
            avatarAlt:
              "Professional headshot of Professor Robert Chen with glasses",
          },
          {
            quote:
              "I started my day with The Chronicle's briefing three years ago and haven't stopped. It's the perfect balance of depth and brevity for a busy executive.",
            name: "Jennifer Walsh",
            role: "CEO, Horizon Ventures",
            avatarAlt:
              "Professional headshot of Jennifer Walsh CEO in business attire",
          },
          {
            quote:
              "Finally, a news source that doesn't treat readers like attention-deficient children. Long-form journalism done right. Worth every penny of the subscription.",
            name: "David Park",
            role: "Software Architect, Seattle",
            avatarAlt:
              "Professional headshot of David Park software engineer",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Support Independent Journalism"
    const ctaDesc =
      props.cta?.description ??
      "Subscribe today for unlimited access to award-winning reporting, expert analysis, and exclusive features. No paywalls on breaking news—ever."
    const ctaPrimary = props.cta?.primary ?? "Subscribe Now — $1/Week"
    const ctaSecondary = props.cta?.secondary ?? "View All Plans"
    const ctaStats = props.cta?.stats?.length
      ? props.cta.stats
      : [
          { value: "2M+", label: "Subscribers" },
          { value: "47", label: "Journalists" },
          { value: "12", label: "Pulitzer Prizes" },
        ]

    const footerTagline =
      props.footer?.tagline ??
      "Independent journalism since 1923. Committed to truth, accuracy, and the public interest."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            heading: "Sections",
            links: [
              "World News",
              "Politics",
              "Business",
              "Technology",
              "Science",
              "Health",
            ],
          },
          {
            heading: "Company",
            links: [
              "About Us",
              "Careers",
              "Code of Ethics",
              "Press Center",
              "Advertise",
            ],
          },
          {
            heading: "Support",
            links: [
              "Help Center",
              "Contact Us",
              "Subscription",
              "Accessibility",
              "Apps",
            ],
          },
          {
            heading: "Legal",
            links: [
              "Privacy Policy",
              "Terms of Service",
              "Cookie Policy",
              "Your Privacy Choices",
            ],
          },
        ]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Twitter", "Facebook", "LinkedIn", "Instagram"]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand}. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy", "Terms", "Cookies", "Sitemap"]

    // Rotate category labels through theme accent tokens (no raw palette colors).
    const catTones = [
      "text-primary",
      "text-secondary-foreground",
      "text-accent-foreground",
      "text-chart-1",
      "text-chart-2",
      "text-chart-3",
      "text-chart-4",
      "text-chart-5",
    ]
    const toneFor = (key: string) => {
      let h = 0
      for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0
      return catTones[Math.abs(h) % catTones.length]
    }

    // Masthead mark — newspaper glyph (decorative brand asset).
    const Masthead = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={className}
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 8h10M7 12h10M7 16h6" />
      </svg>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    )

    const CommentIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={className}
        aria-hidden="true"
      >
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <Masthead className="size-8 text-foreground" />
                <span className="text-xl font-bold tracking-tight lg:text-2xl">
                  {brand}
                </span>
              </button>

              <nav className="hidden items-center gap-8 lg:flex">
                {nav.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-foreground",
                      i === 0 ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </nav>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label="Search"
                  onClick={() => go("Search")}
                  className="p-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => go("Subscribe")}
                  className="hidden items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:flex"
                >
                  Subscribe
                </button>
                <button
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v: boolean) => !v)}
                  className="p-2 text-muted-foreground lg:hidden"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="size-6"
                    aria-hidden="true"
                  >
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
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

          {/* Trending ticker */}
          <div className="hidden border-t border-border bg-card lg:block">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <nav className="flex items-center gap-6 py-3 text-sm">
                <span className="font-medium text-foreground">
                  {tickerLabel}
                </span>
                {tickerTopics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => go(topic)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {topic}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </header>

        <main>
          {/* Featured */}
          <section className="bg-card py-8 lg:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Breaking banner */}
              <div className="mb-8 flex items-center gap-3">
                <span className="rounded bg-destructive px-3 py-1 text-xs font-semibold uppercase tracking-wider text-destructive-foreground">
                  {breakingBadge}
                </span>
                <button
                  type="button"
                  onClick={() => go(breakingHeadline)}
                  className="text-left text-sm font-medium text-foreground hover:underline lg:text-base"
                >
                  {breakingHeadline}
                </button>
                <span className="ml-auto whitespace-nowrap text-xs text-muted-foreground">
                  {breakingTime}
                </span>
              </div>

              {/* Featured grid */}
              <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
                {/* Lead story */}
                <article className="group lg:col-span-8">
                  <button
                    type="button"
                    onClick={() => go(featTitle)}
                    className="block w-full text-left"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-muted lg:aspect-[21/9]">
                      <Image
                        alt={featImageAlt}
                        w={1200}
                        h={500}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute left-4 top-4 rounded bg-foreground px-3 py-1 text-xs font-semibold uppercase tracking-wider text-background">
                        {featTag}
                      </span>
                    </div>
                    <div className="mt-5">
                      <h1 className="text-2xl font-bold leading-tight text-foreground transition-colors group-hover:text-muted-foreground lg:text-4xl">
                        {featTitle}
                      </h1>
                      <p className="mt-3 text-base leading-relaxed text-muted-foreground lg:text-lg">
                        {featExcerpt}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {featAuthor}
                        </span>
                        <span aria-hidden="true">•</span>
                        <span>{featDate}</span>
                        <span aria-hidden="true">•</span>
                        <span>{featReadTime}</span>
                      </div>
                    </div>
                  </button>
                </article>

                {/* Secondary rail */}
                <div className="flex flex-col gap-6 lg:col-span-4">
                  {secondary.map((story, i) => (
                    <div key={story.title}>
                      <article className="group">
                        <button
                          type="button"
                          onClick={() => go(story.title)}
                          className="flex w-full gap-4 text-left"
                        >
                          <div className="flex-1">
                            <span
                              className={cn(
                                "text-xs font-semibold uppercase tracking-wider",
                                toneFor(story.category),
                              )}
                            >
                              {story.category}
                            </span>
                            <h2 className="mt-1 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-muted-foreground lg:text-lg">
                              {story.title}
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {story.excerpt}
                            </p>
                            <span className="mt-2 block text-xs text-muted-foreground">
                              {story.time}
                            </span>
                          </div>
                          <div className="size-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted lg:size-28">
                            <Image
                              alt={story.imageAlt}
                              w={200}
                              h={200}
                              loading="lazy"
                              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        </button>
                      </article>
                      {i < secondary.length - 1 && (
                        <hr className="mt-6 border-border" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Content grid: latest + sidebar */}
          <section className="bg-muted/40 py-8 lg:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
                {/* Latest stories */}
                <div className="lg:col-span-8">
                  <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground lg:text-2xl">
                      {latestHeading}
                    </h2>
                    <div className="hidden items-center gap-2 sm:flex">
                      {latestFilters.map((f, i) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => go(f)}
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                            i === 0
                              ? "border-border bg-card text-foreground"
                              : "border-transparent text-muted-foreground hover:border-border hover:bg-card hover:text-foreground",
                          )}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8">
                    {latestStories.map((story) => (
                      <article
                        key={story.title}
                        className="group rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6"
                      >
                        <button
                          type="button"
                          onClick={() => go(story.title)}
                          className="flex w-full flex-col gap-4 text-left sm:flex-row sm:gap-6"
                        >
                          <div className="aspect-[4/3] flex-shrink-0 overflow-hidden rounded-lg bg-muted sm:h-36 sm:w-48 sm:aspect-auto lg:w-56">
                            <Image
                              alt={story.imageAlt}
                              w={400}
                              h={300}
                              loading="lazy"
                              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <span
                                className={cn(
                                  "text-xs font-semibold uppercase tracking-wider",
                                  toneFor(story.category),
                                )}
                              >
                                {story.category}
                              </span>
                              <span
                                aria-hidden="true"
                                className="text-xs text-muted-foreground"
                              >
                                •
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {story.time}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-muted-foreground lg:text-xl">
                              {story.title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                              {story.excerpt}
                            </p>
                            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{story.author}</span>
                              <span aria-hidden="true">•</span>
                              <span>{story.readTime}</span>
                            </div>
                          </div>
                        </button>
                      </article>
                    ))}
                  </div>

                  <div className="mt-10 text-center">
                    <button
                      type="button"
                      onClick={() => go(latestLoadMore)}
                      className="rounded-lg border border-border bg-card px-6 py-3 font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {latestLoadMore}
                    </button>
                  </div>
                </div>

                {/* Sidebar */}
                <aside className="space-y-8 lg:col-span-4">
                  {/* Trending */}
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-foreground">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="size-5 text-destructive"
                        aria-hidden="true"
                      >
                        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      {trendingHeading}
                    </h3>
                    <div className="space-y-5">
                      {trending.map((item, i) => (
                        <button
                          key={item.title}
                          type="button"
                          onClick={() => go(item.title)}
                          className="group flex w-full gap-4 text-left"
                        >
                          <span className="text-2xl font-bold text-muted-foreground/40 transition-colors group-hover:text-muted-foreground">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div>
                            <h4 className="text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-muted-foreground">
                              {item.title}
                            </h4>
                            <span className="mt-1 block text-xs text-muted-foreground">
                              {item.reads}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Most discussed */}
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-foreground">
                      <CommentIcon className="size-5 text-primary" />
                      {discussedHeading}
                    </h3>
                    <div className="space-y-4">
                      {discussed.map((item) => (
                        <button
                          key={item.title}
                          type="button"
                          onClick={() => go(item.title)}
                          className="group block w-full border-b border-border pb-4 text-left last:border-0 last:pb-0"
                        >
                          <h4 className="text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-muted-foreground">
                            {item.title}
                          </h4>
                          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CommentIcon className="size-4" />
                              {item.comments}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Newsletter */}
                  <div className="rounded-xl bg-foreground p-6 text-background">
                    <h3 className="mb-2 text-lg font-bold">{newsletterTitle}</h3>
                    <p className="mb-4 text-sm text-background/70">
                      {newsletterDesc}
                    </p>
                    <form
                      className="space-y-3"
                      onSubmit={(e) => {
                        e.preventDefault()
                        go(newsletterCta)
                      }}
                    >
                      <input
                        type="email"
                        required
                        placeholder="Enter your email"
                        aria-label="Email address"
                        className="w-full rounded-lg border border-border/40 bg-background/10 px-4 py-2.5 text-sm text-background placeholder-background/50 focus:border-background/60 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="w-full rounded-lg bg-background px-4 py-2.5 font-medium text-foreground transition-colors hover:bg-background/90"
                      >
                        {newsletterCta}
                      </button>
                    </form>
                    <p className="mt-3 text-xs text-background/50">
                      {newsletterNote}
                    </p>
                  </div>

                  {/* Topics */}
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-foreground">
                      {topicsHeading}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {topics.map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => go(topic)}
                          className="rounded-full bg-secondary px-3 py-1.5 text-sm text-secondary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Writer spotlight */}
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-foreground">
                      {writerHeading}
                    </h3>
                    <div className="flex items-start gap-4">
                      <Image
                        alt={writerAvatarAlt}
                        w={100}
                        h={100}
                        className="size-14 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {writerName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {writerRole}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {writerBio}
                        </p>
                        <button
                          type="button"
                          onClick={() => go(writerCta)}
                          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                        >
                          {writerCta}
                          <ArrowRight className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </section>

          {/* Browse by category */}
          <section className="bg-card py-12 lg:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground lg:text-2xl">
                  {categoriesHeading}
                </h2>
                <button
                  type="button"
                  onClick={() => go(categoriesViewAll)}
                  className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {categoriesViewAll}
                  <ArrowRight className="size-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {categoryItems.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => go(cat.name)}
                    className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted"
                  >
                    <Image
                      alt={cat.imageAlt}
                      w={300}
                      h={225}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/30 to-transparent"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-left">
                      <h3 className="text-sm font-semibold text-background lg:text-base">
                        {cat.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-background/80">
                        {cat.count}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted py-12 lg:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-10 text-center">
                <h2 className="text-xl font-bold text-foreground lg:text-2xl">
                  {testimonialsHeading}
                </h2>
                <p className="mt-2 text-muted-foreground">{testimonialsSub}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-xl border border-border bg-card p-6 shadow-sm"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-4 text-chart-4" />
                      ))}
                    </div>
                    <p className="leading-relaxed text-card-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="size-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {t.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Support CTA */}
          <section className="bg-card py-12 lg:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="rounded-2xl bg-foreground p-8 text-center text-background lg:p-12 lg:text-left">
                <div className="grid items-center gap-8 lg:grid-cols-2">
                  <div>
                    <h2 className="text-2xl font-bold text-background lg:text-3xl">
                      {ctaHeading}
                    </h2>
                    <p className="mt-3 max-w-lg text-background/70">{ctaDesc}</p>
                    <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => go(ctaPrimary)}
                        className="rounded-lg bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-background/90"
                      >
                        {ctaPrimary}
                      </button>
                      <button
                        type="button"
                        onClick={() => go(ctaSecondary)}
                        className="rounded-lg bg-background/10 px-6 py-3 font-medium text-background transition-colors hover:bg-background/20"
                      >
                        {ctaSecondary}
                      </button>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <div className="flex items-center justify-end gap-4">
                      {ctaStats.map((s) => (
                        <div
                          key={s.label}
                          className="min-w-[100px] rounded-lg bg-background/10 p-4 text-center"
                        >
                          <p className="text-2xl font-bold text-background">
                            {s.value}
                          </p>
                          <p className="mt-1 text-xs text-background/70">
                            {s.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-muted">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
              {/* Brand column */}
              <div className="col-span-2 md:col-span-4 lg:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <Masthead className="size-6 text-foreground" />
                  <span className="text-lg font-bold text-foreground">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 text-sm text-muted-foreground">
                  {footerTagline}
                </p>
                <div className="flex items-center gap-3">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="rounded-md p-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {social}
                    </button>
                  ))}
                </div>
              </div>

              {/* Link columns */}
              {footerColumns.map((col) => (
                <div key={col.heading}>
                  <h4 className="mb-4 font-semibold text-foreground">
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

            {/* Bottom bar */}
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">{footerCopyright}</p>
              <div className="flex items-center gap-6 text-sm">
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
