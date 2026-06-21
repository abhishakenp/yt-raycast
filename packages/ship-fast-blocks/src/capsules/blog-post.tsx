import { useState } from 'react'
import { z } from 'zod/v4'
import { defineCapsule } from './openui.ts'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { string, table } from '@ship-fast/lakebed/server'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet.tsx'
import { Button } from '#/components/ui/button.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar.tsx'

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
export const BlogPostKimiPage = defineCapsule({
  name: 'BlogPostKimiPage',
  description:
    'Complete editorial BLOG POST / long-form ARTICLE DETAIL page with a calm, light, magazine reading aesthetic: centered prose column, generous whitespace, serif pull-quotes and a publication feel. Includes a sticky publication navbar, an article header (category pill, large headline, dek/subtitle, author avatar + date + read-time byline), a full-width cover image, a typeset article body (lead paragraph, h2/h3 section headings, an accented serif blockquote pull-quote, an inline figure with caption, bold inline emphasis, and a highlighted key-findings callout panel), a tag/topic list, an author bio card with social links, a 3-up related-articles grid with hover-zoom thumbnails, a newsletter subscribe band with email form, and a multi-column footer. Use for a blog post, journal/magazine article, essay, editorial story, news article, case study writeup, changelog or documentation article — any single-article reading page (NOT a marketing landing hero). Supply content only — brand, nav, header, cover, body sections, tags, author, related posts, newsletter, footer; the block owns all layout and styling.',
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
  lakebed: {
    schema: {
      readingList: table({
        articleTitle: string(),
        articleCategory: string(),
        articleDate: string(),
        articleExcerpt: string(),
        articleImageAlt: string(),
      }),
      subscribers: table({
        email: string(),
      }),
    },
    queries: {
      readingList: ({ db }) => db.readingList.orderBy('createdAt').all(),
      subscriberCount: ({ db }) => db.subscribers.all().length,
    },
    mutations: {
      addToReadingList: (
        { db },
        articleTitle: string,
        articleCategory: string,
        articleDate: string,
        articleExcerpt: string,
        articleImageAlt: string,
      ) => {
        const existing = db.readingList
          .where('articleTitle', articleTitle)
          .all()[0]
        if (!existing) {
          db.readingList.insert({
            articleTitle,
            articleCategory,
            articleDate,
            articleExcerpt,
            articleImageAlt,
          })
        }
        return db.readingList.all()
      },
      removeFromReadingList: ({ db }, articleTitle: string) => {
        for (const item of db.readingList
          .where('articleTitle', articleTitle)
          .all()) {
          db.readingList.delete(item.id)
        }
        return db.readingList.all()
      },
      subscribeToNewsletter: ({ db }, email: string) => {
        const existing = db.subscribers.where('email', email).all()[0]
        if (!existing) {
          db.subscribers.insert({ email })
        }
        return db.subscribers.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [readingListOpen, setReadingListOpen] = useState(false)
    const brand = props.brand ?? 'Studio Journal'

    const readingList = lakebed.useQuery('readingList')
    const subscriberCount = lakebed.useQuery('subscriberCount')
    const addToReadingList = lakebed.useMutation('addToReadingList')
    const removeFromReadingList = lakebed.useMutation('removeFromReadingList')
    const subscribeToNewsletter = lakebed.useMutation('subscribeToNewsletter')
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || 'Account'
    const authInitials =
      authDisplayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'ME'
    const authLabel = auth.isLoading
      ? 'Checking...'
      : isSignedIn
        ? authDisplayName
        : 'Sign in'
    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }
    const readingListCount = readingList?.length ?? 0

    const ChevronDown = () => (
      <svg
        className="size-5 text-muted-foreground group-open:rotate-180 transition-transform"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    )

    const BookIcon = () => (
      <svg
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    )

    const CheckIcon = () => (
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
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )

    const TrashIcon = () => (
      <svg
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    )

    const nav = props.nav?.length
      ? props.nav
      : ['Articles', 'Authors', 'Topics', 'About']

    const category = props.header?.category ?? 'Design Philosophy'
    const title =
      props.header?.title ??
      'The Art of Slow Design: Why Taking Your Time Creates Better Products'
    const dek =
      props.header?.dek ??
      'In an industry obsessed with speed, the most impactful designers are learning to pause, reflect, and let ideas mature.'
    const authorName = props.header?.authorName ?? 'Elena Martinez'
    const authorRole = props.header?.authorRole ?? 'Design Director'
    const headerAvatarAlt =
      props.header?.authorAvatarAlt ??
      'Professional headshot of Elena Martinez, a design director with warm smile and dark hair'
    const date = props.header?.date ?? 'March 15, 2024'
    const readTime = props.header?.readTime ?? '12 min read'

    const coverAlt =
      props.cover?.imageAlt ??
      'Minimalist design workspace with natural light, featuring a clean desk with notebook and single plant'
    const coverCaption =
      props.cover?.caption ??
      'A serene, minimalist workspace representing the philosophy of slow design'

    const lead = props.lead?.length
      ? props.lead
      : [
          'Last October, I watched a junior designer spend three days perfecting a button hover state. The rest of the team was racing toward a deadline, cranking out screens at breakneck speed. But there was Sarah, adjusting micro-interactions by milliseconds, testing color shifts in different lighting conditions, documenting her rationale in excruciating detail.',
        ]

    const introParagraphs = [
      "On day four, she presented her work. The room went quiet. That button wasn't just functional—it was delightful. Users would feel it before they understood it. The micro-interaction communicated trust, responsiveness, and care. It was a tiny detail that elevated the entire product experience.",
      'This is the paradox of modern design: we\'re told to move fast, ship constantly, iterate quickly. Yet the work that endures—the products people truly love—often comes from designers who resist the pressure to rush. They practice what I call "slow design," and it\'s becoming the competitive advantage nobody talks about.',
    ]

    const sections = props.sections?.length
      ? props.sections
      : [
          {
            heading: 'The Speed Trap',
            blocks: [
              {
                p: 'Silicon Valley has fetishized velocity. We celebrate teams that ship features weekly, designers who produce dozens of screens daily, companies that "move fast and break things." The underlying assumption is that speed equals innovation, that the first to market wins, that iteration beats deliberation.',
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
            heading: 'What Slow Design Looks Like',
            blocks: [
              {
                p: "Slow design isn't about working less or missing deadlines. It's about allocating time where it matters most. Here's what I've observed in teams that practice it well:",
              },
              { h3: '1. Extended Problem Immersion' },
              {
                p: "Instead of jumping to solutions, slow designers spend disproportionate time understanding the problem space. When Airbnb redesigned their host onboarding in 2021, the team spent six weeks just shadowing hosts, mapping emotional journeys, and identifying moments of anxiety that weren't obvious in analytics. The resulting design increased host activation by 34%—but it required patience that many teams would have bypassed.",
              },
              { h3: '2. Deliberate Constraint Setting' },
              {
                p: 'Paradoxically, slowing down often means setting stricter constraints. When Figma built their multiplayer editing feature, they deliberately limited the initial scope to text editing only. This constraint allowed the team to perfect the underlying synchronization engine rather than spreading their attention across multiple feature surfaces. The result felt magical because it was polished, not because it was comprehensive.',
              },
              {
                imageAlt:
                  'Team of designers collaborating around a large table with sketches and wireframes',
                caption:
                  "Team collaboration session at Notion's San Francisco office, 2023",
              },
              { h3: '3. Maturation Periods' },
              {
                p: 'Notion\'s infamous for their approach to features: they often sit on completed designs for months before shipping. CEO Ivan Zhao has explained that this "maturation period" allows the team to experience their own product daily, identifying friction points that weren\'t visible during initial design. The waitlist feature, which drove significant growth in 2022, was built and then shelved for eight months while the team refined the invitation flow.',
              },
            ],
          },
          {
            heading: 'The Business Case for Patience',
            blocks: [
              {
                p: 'Skeptics will ask: how do you justify slow design to stakeholders demanding velocity? The answer lies in measuring what matters. Feature velocity is easy to quantify; user satisfaction, retention impact, and brand perception are harder but ultimately more valuable.',
              },
              {
                p: 'When Linear built their issue tracking product, they famously rejected VC pressure to scale quickly. The small team spent two years on a product that competitors might have built in six months. But those 18 "extra" months produced a tool so refined that it commands a premium price in a crowded market. Linear\'s annual recurring revenue crossed $20 million in 2023—a testament to the economics of excellence.',
              },
              {
                callout: 'Key Research Findings',
                items: [
                  'McKinsey\'s 2023 design study found that companies with formal "thinking time" policies saw 47% higher customer satisfaction scores',
                  'Teams that conduct 3+ rounds of user testing (vs. 1-2) reduce post-launch bug reports by 62%',
                  'Products with 6+ month development cycles show 3x higher 2-year retention than those built in under 3 months',
                ],
              },
            ],
          },
          {
            heading: 'Practical Slow Design',
            blocks: [
              {
                p: "Adopting slow design doesn't require corporate policy changes or executive buy-in. Individual designers and small teams can implement it immediately:",
              },
              {
                p: 'Start with a "waiting list" for your own ideas. When you have a design solution, write it down and revisit it in 48 hours. Most initial solutions benefit from this cooling period—you\'ll spot assumptions, simplifications, and missed opportunities that weren\'t visible in the moment of creation.',
              },
              {
                p: "Protect deep work blocks aggressively. Cal Newport's research on deep work applies directly to design. Two hours of uninterrupted focus produces better outcomes than six hours of fragmented attention. Schedule these blocks during your peak cognitive hours and defend them ruthlessly.",
              },
              {
                p: 'Build "beauty sprints" into your timeline. After functional completion, allocate 20% of remaining project time purely for refinement. This isn\'t gold-plating—it\'s the period when good products become great. Use it for micro-interactions, edge cases, and those details that separate professional work from exceptional work.',
              },
            ],
          },
          {
            heading: 'The Future is Thoughtful',
            blocks: [
              {
                p: "As AI tools accelerate the production of mediocre design, human judgment and taste become more valuable, not less. The designers who thrive won't be those who produce the fastest—they'll be those who know when to slow down, when to question defaults, when to let ideas mature.",
              },
              {
                p: 'Sarah, that junior designer obsessing over button states? She was promoted to senior within 18 months. Her work on that micro-interaction became a case study that her current team—a Series B fintech startup—still references. The three days that seemed extravagant were, in retrospect, an investment that paid dividends far beyond the immediate project.',
              },
            ],
          },
        ]

    const pullQuote =
      props.pullQuote?.quote ??
      "Speed is the enemy of nuance. When we rush, we default to patterns we've used before, solutions we've seen work elsewhere. We stop seeing the unique context in front of us."
    const pullQuoteAttribution =
      props.pullQuote?.attribution ??
      'From a 2022 interview with Jony Ive in The Design Journal'

    const closing = props.closing?.length
      ? props.closing
      : [
          "The art of slow design isn't about working less. It's about working where it counts. In a world addicted to speed, patience is the ultimate competitive advantage.",
        ]

    const tags = props.tags?.length
      ? props.tags
      : ['Design Process', 'Product Strategy', 'UX Research', 'Team Culture']

    const authorBioName = props.author?.name ?? 'Elena Martinez'
    const authorBio =
      props.author?.bio ??
      'Elena is a Design Director with 15 years of experience building products at Stripe, Airbnb, and Notion. She writes about the intersection of craft, strategy, and team culture. Her work has been featured in Communication Arts, Fast Company, and the AIGA Design Journal.'
    const authorBioAvatarAlt =
      props.author?.avatarAlt ??
      'Professional headshot of Elena Martinez, design director and writer'
    const authorLinks = props.author?.links?.length
      ? props.author.links
      : ['Twitter', 'LinkedIn', 'Portfolio']

    const relatedHeading = props.related?.heading ?? 'Related Articles'
    const relatedItems = props.related?.items?.length
      ? props.related.items
      : [
          {
            category: 'Team Culture',
            date: 'Feb 28, 2024',
            title: 'Building Design Systems That Actually Get Used',
            excerpt:
              'Lessons from rolling out design systems at three different startups—and why adoption is harder than construction.',
            imageAlt:
              'Design team whiteboarding session with colorful sticky notes on glass wall',
          },
          {
            category: 'UX Research',
            date: 'Feb 10, 2024',
            title: 'The Lost Art of Sketching Before Pixels',
            excerpt:
              'Why the best digital designers still start with analog tools—and how paper prototyping catches problems Figma misses.',
            imageAlt:
              'Close-up of hands sketching wireframes in a notebook with pencil',
          },
          {
            category: 'Design Process',
            date: 'Jan 22, 2024',
            title: 'Measuring Design Quality: Beyond Vanity Metrics',
            excerpt:
              'A framework for quantifying design excellence using behavioral signals instead of NPS scores and gut feelings.',
            imageAlt:
              'Laptop screen showing data analytics dashboard with charts and metrics',
          },
        ]

    const newsletterHeading =
      props.newsletter?.heading ?? 'Subscribe to Studio Journal'
    const newsletterDesc =
      props.newsletter?.description ??
      'Get weekly articles on design craft, strategy, and team culture. No spam, unsubscribe anytime.'
    const newsletterPlaceholder =
      props.newsletter?.placeholder ?? 'your@email.com'
    const newsletterSubmit = props.newsletter?.submit ?? 'Subscribe'
    const newsletterFootnote =
      props.newsletter?.footnote ??
      'Join 12,400+ designers. Delivered every Tuesday.'

    const footerBlurb =
      props.footer?.blurb ??
      'A publication for designers who care about craft. Exploring the intersection of aesthetics, strategy, and human-centered product development.'
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            heading: 'Explore',
            links: ['All Articles', 'Topics', 'Authors', 'Podcast'],
          },
          {
            heading: 'Connect',
            links: ['Twitter', 'LinkedIn', 'YouTube', 'RSS Feed'],
          },
        ]
    const footerNote = props.footer?.note ?? 'All rights reserved.'
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ['Privacy Policy', 'Terms of Service']

    return (
      <div
        className={cn(
          'min-h-svh bg-background font-sans text-foreground antialiased',
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
              <div className="flex items-center gap-4">
                <Sheet open={readingListOpen} onOpenChange={setReadingListOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="Reading list"
                      className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <BookIcon />
                      {readingListCount > 0 ? (
                        <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                          {readingListCount}
                        </span>
                      ) : null}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full gap-0 p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle className="text-xl">Reading List</SheetTitle>
                      <SheetDescription>
                        {readingListCount > 0
                          ? `${readingListCount} article${readingListCount === 1 ? '' : 's'} saved for later.`
                          : 'Your reading list is empty.'}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {readingList && readingList.length > 0 ? (
                        <div className="space-y-4">
                          {readingList.map((item) => (
                            <div
                              key={item.id}
                              className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-4 last:border-0"
                            >
                              <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                                <Image
                                  alt={item.articleImageAlt}
                                  w={120}
                                  h={120}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{item.articleCategory}</span>
                                  <span aria-hidden="true">•</span>
                                  <time>{item.articleDate}</time>
                                </div>
                                <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-foreground">
                                  {item.articleTitle}
                                </h3>
                                <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
                                  {item.articleExcerpt}
                                </p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void removeFromReadingList(
                                      item.articleTitle,
                                    )
                                  }
                                  className="flex items-center gap-2 text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                                >
                                  <TrashIcon />
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                          <BookIcon />
                          <p className="mt-4 text-base font-semibold text-foreground">
                            No articles saved
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Click the bookmark icon on any article to add it to
                            your reading list.
                          </p>
                        </div>
                      )}
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <SheetClose asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full rounded-full"
                        >
                          Continue Reading
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                {isSignedIn ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label="Open account menu"
                        className="hidden h-10 max-w-48 items-center gap-2 rounded-full border border-border bg-background/90 px-2 py-1 text-foreground shadow-sm transition hover:border-foreground/20 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
                      >
                        <Avatar
                          size="sm"
                          className="ring-2 ring-background"
                          aria-hidden="true"
                        >
                          {authPicture ? (
                            <AvatarImage
                              src={authPicture}
                              alt={authDisplayName}
                            />
                          ) : null}
                          <AvatarFallback className="bg-foreground text-[0.65rem] font-bold text-background">
                            {authInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden max-w-24 truncate text-sm font-semibold md:block">
                          {authDisplayName}
                        </span>
                        <ChevronDown />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      sideOffset={10}
                      className="w-72 overflow-hidden rounded-xl border-border bg-background p-0 shadow-xl"
                    >
                      <div className="bg-muted/40 px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar size="lg" className="ring-2 ring-background">
                            {authPicture ? (
                              <AvatarImage
                                src={authPicture}
                                alt={authDisplayName}
                              />
                            ) : null}
                            <AvatarFallback className="bg-foreground text-sm font-bold text-background">
                              {authInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-foreground">
                              {authDisplayName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {authEmail ?? 'Signed in to this session'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          type="button"
                          onClick={() => go('Account')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Account
                        </button>
                        <button
                          type="button"
                          onClick={() => go('Settings')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Settings
                        </button>
                      </div>
                      <div className="border-t border-border p-2">
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="flex w-full items-center justify-center rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          Sign out
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <button
                    type="button"
                    onClick={handleSignIn}
                    disabled={auth.isLoading}
                    aria-label="Sign in with Google"
                    className="hidden h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background shadow-sm transition hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 sm:inline-flex"
                  >
                    <span className="grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                      G
                    </span>
                    <span>{authLabel}</span>
                  </button>
                )}
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
                <div className="mt-2 rounded-xl border border-border bg-muted/40 p-3">
                  {isSignedIn ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar size="lg">
                          {authPicture ? (
                            <AvatarImage
                              src={authPicture}
                              alt={authDisplayName}
                            />
                          ) : null}
                          <AvatarFallback className="bg-foreground text-sm font-bold text-background">
                            {authInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-foreground">
                            {authDisplayName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {authEmail ?? 'Signed in'}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          setMobileOpen(false)
                          handleSignOut()
                        }}
                        className="w-full rounded-full"
                      >
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false)
                        handleSignIn()
                      }}
                      disabled={auth.isLoading}
                      className="w-full rounded-full"
                    >
                      <span className="mr-2 grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                        G
                      </span>
                      {authLabel}
                    </Button>
                  )}
                </div>
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
              <span className="mr-2 text-sm text-muted-foreground">
                Tagged:
              </span>
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
              {relatedItems.map((post) => {
                const isInReadingList =
                  readingList?.some(
                    (item) => item.articleTitle === post.title,
                  ) ?? false

                return (
                  <article key={post.title} className="group">
                    <div className="relative">
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
                      <button
                        type="button"
                        onClick={() => {
                          if (isInReadingList) {
                            void removeFromReadingList(post.title)
                          } else {
                            void addToReadingList(
                              post.title,
                              post.category,
                              post.date,
                              post.excerpt,
                              post.imageAlt,
                            )
                          }
                        }}
                        aria-pressed={isInReadingList}
                        aria-label={
                          isInReadingList
                            ? `Remove ${post.title} from reading list`
                            : `Add ${post.title} to reading list`
                        }
                        className={cn(
                          'absolute top-4 right-4 grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105',
                          isInReadingList
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background/90 text-foreground hover:bg-background',
                        )}
                      >
                        {isInReadingList ? <CheckIcon /> : <BookIcon />}
                      </button>
                    </div>
                  </article>
                )
              })}
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
                const form = e.currentTarget
                const emailInput = form.querySelector(
                  '#newsletter-email',
                ) as HTMLInputElement
                if (emailInput?.value) {
                  void subscribeToNewsletter(emailInput.value)
                  emailInput.value = ''
                }
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
              {subscriberCount && subscriberCount > 0
                ? `Join ${subscriberCount.toLocaleString()}+ subscribers. ${newsletterFootnote}`
                : newsletterFootnote}
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
