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
 * BlogPostKimiPage2 — SECOND, visually distinct editorial BLOG POST / article
 * DETAIL template (a sibling alternative to BlogPostKimiPage).
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Atlas Design Journal" design:
 * a WARM, confident magazine layout with big serif (Playfair-style) display
 * headlines, an accent-colored category pill, a centered article header, a
 * FULL-WIDTH rounded cover photo with a caption, a long-form reading column, an
 * accent-bordered serif pull-quote with an oversized decorative quote mark, a
 * tag list, an author bio card on a muted band, a 3-up related-articles grid
 * with hover-zoom thumbnails, a BOLD primary-colored newsletter subscribe band,
 * and an inverted multi-column footer with social icons.
 *
 * Distinct from BlogPostKimiPage's pale, minimal studio look: this variant leans
 * editorial/journalistic with a saturated primary newsletter band + dark footer,
 * a serif display voice, and a magazine cover-image treatment. The block owns ALL
 * layout, spacing, type hierarchy and color via semantic tokens. Every nav item /
 * link / CTA / form submit routes through `useNavigate` (never a dead "#"). All
 * imagery (incl. avatars) uses the alt-driven <Image> component. Callers supply
 * ONLY content; rich defaults make it render great with no props at all.
 */
export const BlogPostKimiPage2 = defineCapsule({
  name: 'BlogPostKimiPage2',
  description:
    'SECOND, alternative editorial BLOG POST / long-form ARTICLE DETAIL page — a warmer, more journalistic magazine style and a visually distinct sibling to BlogPostKimiPage. Big serif (Playfair-style) display headline, accent category pill, centered article header (author avatar + date + read-time byline), a FULL-WIDTH rounded cover photo with caption, a typeset reading column, an accent-bordered serif pull-quote with an oversized decorative quote mark, h2/h3 section headings, a tag/topic list, an author bio card on a muted band, a 3-up related-articles grid with hover-zoom thumbnails, a BOLD primary-colored newsletter subscribe band with email form, and an inverted dark multi-column footer with social icons. Use this when you want a blog post, journal/magazine article, essay, editorial story, design or engineering journal, news article, case study writeup or changelog entry rendered in a confident, cover-led publication aesthetic (NOT a marketing landing hero) — pick this over the calmer BlogPostKimiPage for a more saturated, magazine feel. Supply content only — brand, nav, header, cover, body sections, tags, author, related posts, newsletter, footer; the block owns all layout and styling.',
  props: z.object({
    /** Publication / brand name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Subscribe CTA label in the navbar. */
    navCta: z.string().optional(),
    /** Article header (category, title, dek, byline). */
    header: z
      .object({
        category: z.string().optional(),
        title: z.string().optional(),
        titleAccent: z.string().optional(),
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
     * paragraph ({ p }) or a sub-heading ({ h3 }).
     */
    sections: z
      .array(
        z.object({
          heading: z.string(),
          blocks: z.array(
            z.object({
              p: z.string().optional(),
              h3: z.string().optional(),
            }),
          ),
        }),
      )
      .optional(),
    /** Accent-bordered serif pull-quote inserted after the first section. */
    pullQuote: z
      .object({
        quote: z.string().optional(),
        attribution: z.string().optional(),
      })
      .optional(),
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
        social: z.array(z.string()).optional(),
        note: z.string().optional(),
        madeNote: z.string().optional(),
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
      comments: table({
        articleTitle: string(),
        authorName: string(),
        authorEmail: string(),
        content: string(),
      }),
      subscribers: table({
        email: string(),
      }),
    },
    queries: {
      readingList: ({ db }) => db.readingList.orderBy('createdAt').all(),
      comments: ({ db }) =>
        db.comments.where('articleTitle', 'The Art of Resilient Design').all(),
      isSubscribed: ({ db }) => db.subscribers.all().length > 0,
    },
    mutations: {
      addToReadingList: (
        { db },
        articleData: {
          title: string
          category: string
          date: string
          excerpt: string
          imageAlt: string
        },
      ) => {
        const existing = db.readingList
          .where('articleTitle', articleData.title)
          .all()[0]
        if (existing) return db.readingList.all()

        db.readingList.insert({
          articleTitle: articleData.title,
          articleCategory: articleData.category,
          articleDate: articleData.date,
          articleExcerpt: articleData.excerpt,
          articleImageAlt: articleData.imageAlt,
        })
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
      addComment: (
        { db },
        commentData: {
          articleTitle: string
          authorName: string
          authorEmail: string
          content: string
        },
      ) => {
        db.comments.insert({
          articleTitle: commentData.articleTitle,
          authorName: commentData.authorName,
          authorEmail: commentData.authorEmail,
          content: commentData.content,
        })
        return db.comments.where('articleTitle', commentData.articleTitle).all()
      },
      subscribe: ({ db }, email: string) => {
        const existing = db.subscribers.where('email', email).all()[0]
        if (existing) return db.subscribers.all()

        db.subscribers.insert({ email })
        return db.subscribers.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [readingListOpen, setReadingListOpen] = useState(false)
    const brand = props.brand ?? 'Atlas'
    const nav = props.nav?.length
      ? props.nav
      : ['Articles', 'Case Studies', 'Podcast', 'Resources']
    const navCta = props.navCta ?? 'Subscribe'

    const category = props.header?.category ?? 'Design Systems'
    const title = props.header?.title ?? 'The Art of'
    const titleAccent = props.header?.titleAccent ?? 'Resilient Design'
    const dek =
      props.header?.dek ??
      "How the world's most reliable systems are built on principles of graceful degradation, redundancy, and adaptive architecture."
    const authorName = props.header?.authorName ?? 'Elena Vasquez'
    const authorRole =
      props.header?.authorRole ?? 'Senior Design Director, Shopify'
    const headerAvatarAlt =
      props.header?.authorAvatarAlt ??
      'Professional headshot of a smiling woman with shoulder-length dark hair'
    const date = props.header?.date ?? 'March 15, 2026'
    const readTime = props.header?.readTime ?? '18 min read'

    const coverAlt =
      props.cover?.imageAlt ??
      'Close-up view of a complex electronic circuit board with golden traces and red components'
    const coverCaption =
      props.cover?.caption ??
      'The interconnected nature of modern systems demands new approaches to reliability. · Photo by Umberto'

    const lead = props.lead?.length
      ? props.lead
      : [
          'In October 2024, a single configuration error at a major cloud provider cascaded into a global outage affecting 42 million websites, 12,000 enterprises, and an estimated $4.2 billion in lost revenue. It was the largest infrastructure failure since the 2021 Facebook blackout, and it reignited a crucial conversation about how we design for failure.',
        ]

    const introParagraphs = [
      "Resilient design isn't new. Engineers have been building systems to withstand failure since the first redundant electrical grid in the 1920s. But the stakes are higher now. A modern e-commerce platform isn't just a website—it's inventory management, payment processing, fraud detection, logistics coordination, and customer service all operating as a distributed system. When one component fails, the others must continue, gracefully.",
    ]

    const sections = props.sections?.length
      ? props.sections
      : [
          {
            heading: 'The Three Pillars of Resilience',
            blocks: [
              {
                p: 'After studying 147 major system failures across fintech, healthcare, and e-commerce platforms over the past five years, patterns emerge. Every resilient architecture rests on three foundational principles: graceful degradation, strategic redundancy, and circuit-breaking patterns.',
              },
              { h3: 'Graceful Degradation in Practice' },
              {
                p: "When Netflix's recommendation engine went down during peak hours on New Year's Eve 2023, the streaming service didn't go dark. Instead, users saw a simplified \"Trending Now\" carousel powered by cached data. The core experience—watching video—remained intact. This is graceful degradation: the art of maintaining essential functionality while non-essential features gracefully retreat.",
              },
              {
                p: 'Amazon employs a similar strategy during Prime Day events. When personalization services experience strain, the site falls back to category-level recommendations rather than user-specific suggestions. Conversion rates drop by 8-12% during these fallback periods—significant, but far better than the 100% revenue loss of a complete outage.',
              },
            ],
          },
          {
            heading: 'Strategic Redundancy',
            blocks: [
              {
                p: 'Redundancy is expensive. Running duplicate infrastructure can increase operational costs by 40-60%. The key is being strategic about what you duplicate and how those duplicates behave.',
              },
              {
                p: "Consider Stripe's approach to payment processing. They maintain three independent payment processors with automatic failover at 200ms latency thresholds. If the primary processor shows any degradation, traffic shifts seamlessly to a secondary. Users never see a declined card due to processor timeout. The cost? An estimated $18 million annually in redundant infrastructure. The benefit? Zero payment downtime in six years of operation.",
              },
              {
                p: 'Not every system needs triple redundancy. A content management system might prioritize read replicas over write availability. An analytics dashboard might accept 5-minute data delays during peak load. The art is in understanding user expectations and designing redundancy that protects what matters most.',
              },
              { h3: 'Circuit Breakers and Bulkheads' },
              {
                p: 'The circuit breaker pattern, popularized by Michael Nygard\'s "Release It!" in 2007, remains one of the most effective tools for preventing cascade failures. When a service starts failing, the circuit breaker opens, stopping requests from flooding the already-struggling component. After a cooling-off period, it attempts a partial reset.',
              },
              {
                p: "Shopify's platform processes over $200 billion in annual GMV. Their implementation of circuit breakers across 847 microservices has prevented an estimated 340 potential cascade failures in the past 18 months alone. Each prevented outage represents millions in saved revenue and preserved customer trust.",
              },
              {
                p: "Bulkheads take this further by isolating failure domains. Just as a ship's hull is divided into watertight compartments, software systems can partition critical functions. When Etsy rebuilt their search infrastructure in 2022, they implemented bulkheads that isolate personalized search from inventory search. If personalization fails, users still find products. If inventory sync lags, they still see relevant recommendations.",
              },
            ],
          },
          {
            heading: 'Designing for Chaos',
            blocks: [
              {
                p: 'Netflix pioneered chaos engineering with their Chaos Monkey tool in 2010. The philosophy is counterintuitive: by intentionally causing failures in production, teams build confidence in their resilience mechanisms.',
              },
              {
                p: "Today, chaos engineering has matured. Amazon Web Services runs over 2 million controlled failure experiments annually across their infrastructure. These aren't random acts of destruction—they're carefully designed scenarios that validate specific resilience hypotheses.",
              },
              {
                p: 'A typical chaos experiment might simulate a database failover during peak traffic, measuring not just whether the system stays up, but whether latency stays below 500ms and error rates remain under 0.1%. These quantified resilience metrics become part of service level objectives, with on-call rotations trained to respond to automated chaos events just as they would real incidents.',
              },
            ],
          },
          {
            heading: 'The Human Element',
            blocks: [
              {
                p: "Technical resilience means nothing without organizational resilience. The most sophisticated circuit breakers won't save you if your on-call engineer has been awake for 36 hours or your incident response playbook hasn't been updated since the last major architecture change.",
              },
              {
                p: "Google's Site Reliability Engineering book emphasizes blameless postmortems not as a nicety, but as a resilience requirement. When engineers fear punishment for mistakes, they hide systemic problems. When the culture encourages learning from failure, patterns emerge that lead to better designs.",
              },
              {
                p: "PagerDuty's 2024 State of Unplanned Work Report found that teams practicing regular chaos engineering and blameless postmortems resolved incidents 67% faster than industry averages. More importantly, those teams reported 43% lower burnout rates—resilience isn't just for systems; it's for the people who maintain them.",
              },
            ],
          },
          {
            heading: 'Building Resilient Design Systems',
            blocks: [
              {
                p: 'These principles extend beyond backend infrastructure into the design systems that power user interfaces. A resilient component library anticipates failure modes: What happens when the API for user avatars times out? What does a data table look like with partial information? How does a checkout flow behave when the address validation service is unavailable?',
              },
              {
                p: "Airbnb's design system includes \"stress states\" for every component—visual representations of how elements appear when data is missing, loading, or in error conditions. These aren't afterthoughts; they're first-class design patterns with the same attention to detail as the happy path.",
              },
              {
                p: 'The result is interfaces that feel reliable even when the systems behind them struggle. Users might notice a simplified experience, but they rarely encounter broken screens or confusing error messages. This perceived reliability builds trust at a fundamental level.',
              },
            ],
          },
          {
            heading: 'Looking Forward',
            blocks: [
              {
                p: "As systems grow more complex—AI-powered features, real-time collaboration, edge computing—the challenge of resilience intensifies. The next frontier is adaptive resilience: systems that don't just survive failure modes but automatically reconfigure to optimize for changing conditions.",
              },
              {
                p: "Already, machine learning models predict component failures hours before they occur, enabling proactive failover. Self-healing systems detect anomalous patterns and trigger remediation without human intervention. The goal isn't perfect uptime—that's impossible—but graceful adaptation to an imperfect world.",
              },
              {
                p: "Resilient design is ultimately an act of respect for users. It's acknowledging that their time, their business, and their trust are valuable enough to protect through thoughtful architecture. When we design for chaos, we design for the reality that systems fail, networks partition, and human error is inevitable. The resilient system isn't the one that never fails—it's the one that makes failure invisible to the people who matter most.",
              },
            ],
          },
        ]

    const pullQuote =
      props.pullQuote?.quote ??
      "The question isn't whether your system will fail. It's whether your users will notice when it does."
    const pullQuoteAttribution =
      props.pullQuote?.attribution ??
      'Susan Fowler, author of "Production-Ready Microservices"'

    const tags = props.tags?.length
      ? props.tags
      : ['#DesignSystems', '#Resilience', '#Infrastructure', '#UXStrategy']

    const authorBioName = props.author?.name ?? 'Elena Vasquez'
    const authorBio =
      props.author?.bio ??
      'Senior Design Director at Shopify, where she leads design systems and platform experience. Previously built resilience patterns at AWS and Airbnb. Author of "Designing for Scale" (O\'Reilly, 2024). Speaking at DesignOps Summit and Config 2026.'
    const authorBioAvatarAlt =
      props.author?.avatarAlt ??
      'Professional headshot of Elena Vasquez, Senior Design Director at Shopify'
    const authorLinks = props.author?.links?.length
      ? props.author.links
      : ['Follow on X', 'LinkedIn', 'More articles']

    const relatedHeading = props.related?.heading ?? 'More from Atlas'
    const relatedItems = props.related?.items?.length
      ? props.related.items
      : [
          {
            category: 'Engineering',
            date: 'Feb 28',
            title: 'Scaling to 10 Million Users: A Postgres Story',
            excerpt:
              "How Figma's engineering team redesigned their database architecture to handle 10x growth without downtime.",
            imageAlt:
              'Server room with rows of blue-lit server racks extending into the distance',
          },
          {
            category: 'Analytics',
            date: 'Feb 14',
            title: 'The Metrics That Actually Matter',
            excerpt:
              "Stop drowning in vanity metrics. Here's how product teams at Linear and Notion focus on actionable signals.",
            imageAlt:
              'Laptop screen displaying a colorful data analytics dashboard with charts and graphs',
          },
          {
            category: 'Leadership',
            date: 'Jan 30',
            title: 'Building Design-Engineering Partnerships',
            excerpt:
              'How Figma, Linear, and Vercel structure their teams for shipping velocity without sacrificing quality.',
            imageAlt:
              'Diverse team of designers and engineers collaborating around a laptop in a modern office',
          },
        ]

    const newsletterHeading =
      props.newsletter?.heading ?? 'Join 47,000+ designers and engineers'
    const newsletterDesc =
      props.newsletter?.description ??
      'Get our best articles on design systems, engineering culture, and building products at scale. No spam, unsubscribe anytime.'
    const newsletterPlaceholder =
      props.newsletter?.placeholder ?? 'your@email.com'
    const newsletterSubmit = props.newsletter?.submit ?? 'Subscribe Free'
    const newsletterFootnote =
      props.newsletter?.footnote ??
      'Join readers from Shopify, Figma, Linear, Vercel, and 2,400+ other companies'

    const footerBlurb =
      props.footer?.blurb ??
      'The journal for people who build products at scale. Design systems, engineering culture, and the craft of reliable software.'
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            heading: 'Content',
            links: [
              'Articles',
              'Case Studies',
              'Podcast',
              'Video Library',
              'Newsletter Archive',
            ],
          },
          {
            heading: 'Resources',
            links: [
              'Design Systems',
              'Component Library',
              'Templates',
              'Engineering Guides',
              'API Reference',
            ],
          },
          {
            heading: 'Atlas',
            links: [
              'About',
              'Careers',
              'Advertise',
              'Contact',
              'Privacy Policy',
            ],
          },
        ]
    const footerSocial = props.footer?.social?.length
      ? props.footer.social
      : ['Twitter', 'LinkedIn', 'YouTube']
    const footerNote =
      props.footer?.note ?? 'Atlas Media Inc. All rights reserved.'
    const footerMadeNote =
      props.footer?.madeNote ??
      'Made with care in San Francisco and distributed worldwide.'

    // Lakebed integration
    const readingList = lakebed.useQuery('readingList')
    const auth = lakebed.useAuth()
    const addToReadingList = lakebed.useMutation('addToReadingList')
    const removeFromReadingList = lakebed.useMutation('removeFromReadingList')
    const subscribe = lakebed.useMutation('subscribe')

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

    const currentArticleTitle = `${title} ${titleAccent}`.trim()
    const isInReadingList =
      readingList?.some((item) => item.articleTitle === currentArticleTitle) ??
      false

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

    const ArrowRight = () => (
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
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    )

    const BookmarkIcon = ({ active = false }: { active?: boolean }) => (
      <svg
        className={cn(
          'size-5',
          active ? 'text-primary-foreground' : 'text-foreground',
        )}
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    )

    return (
      <div
        className={cn(
          'min-h-svh bg-background font-sans text-foreground antialiased',
          props.className,
        )}
      >
        {/* Navbar */}
        <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(brand)}
                className="flex items-center gap-2"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <svg
                    className="size-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
                <span className="font-serif text-xl font-bold tracking-tight">
                  {brand}
                </span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => go('Search')}
                  className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
                >
                  Search
                </button>

                {/* Reading list drawer trigger */}
                <Sheet open={readingListOpen} onOpenChange={setReadingListOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="Reading list"
                      className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <BookmarkIcon active={isInReadingList} />
                      {readingList && readingList.length > 0 ? (
                        <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                          {readingList.length}
                        </span>
                      ) : null}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full gap-0 p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle className="text-xl">Reading list</SheetTitle>
                      <SheetDescription>
                        {readingList && readingList.length > 0
                          ? `${readingList.length} article${readingList.length === 1 ? '' : 's'} saved.`
                          : 'Your reading list is empty.'}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {readingList && readingList.length > 0 ? (
                        <div className="space-y-5">
                          {readingList.map((item) => (
                            <div
                              key={item.id}
                              className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-5 last:border-0"
                            >
                              <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                                <Image
                                  alt={item.articleImageAlt}
                                  w={180}
                                  h={180}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="mb-2 flex items-center gap-2">
                                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                                    {item.articleCategory}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {item.articleDate}
                                  </span>
                                </div>
                                <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                  {item.articleTitle}
                                </h3>
                                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                                  {item.articleExcerpt}
                                </p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void removeFromReadingList(
                                      item.articleTitle,
                                    )
                                  }
                                  className="mt-3 text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                          <p className="text-base font-semibold text-foreground">
                            No articles saved
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Bookmark articles to read later by clicking the
                            bookmark icon.
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
                          Continue reading
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>

                {/* Account menu with auth */}
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
                          onClick={() => go('Reading List')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Reading list
                          <ArrowRight />
                        </button>
                        <button
                          type="button"
                          onClick={() => go('Account Settings')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Account settings
                          <ArrowRight />
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
                  onClick={() => go(navCta)}
                  className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {navCta}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Article header */}
        <header className="pt-16 pb-8 sm:pt-20 sm:pb-12 lg:pt-24">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => go(category)}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary"
              >
                {category}
              </button>
              <span className="text-muted-foreground/60" aria-hidden="true">
                ·
              </span>
              <span className="text-sm text-muted-foreground">{date}</span>
              <span className="text-muted-foreground/60" aria-hidden="true">
                ·
              </span>
              <span className="text-sm text-muted-foreground">{readTime}</span>
            </div>
            <h1 className="mb-6 font-serif text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
              {title}
              <br className="hidden sm:block" />{' '}
              <span className="text-primary">{titleAccent}</span>
            </h1>
            <p className="mx-auto max-w-3xl text-xl font-light leading-relaxed text-muted-foreground sm:text-2xl">
              {dek}
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => go(authorName)}
                className="flex items-center gap-4"
              >
                <Image
                  alt={headerAvatarAlt}
                  w={200}
                  h={200}
                  className="size-14 rounded-full object-cover ring-2 ring-border"
                />
                <span className="text-left">
                  <span className="block font-semibold text-foreground">
                    {authorName}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {authorRole}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isInReadingList) {
                    void removeFromReadingList(currentArticleTitle)
                  } else {
                    void addToReadingList({
                      title: currentArticleTitle,
                      category,
                      date,
                      excerpt: dek,
                      imageAlt: coverAlt,
                    })
                  }
                }}
                aria-pressed={isInReadingList}
                aria-label={
                  isInReadingList
                    ? `Remove ${currentArticleTitle} from reading list`
                    : `Add ${currentArticleTitle} to reading list`
                }
                className={cn(
                  'ml-4 grid size-12 place-items-center rounded-full border-2 transition-all hover:scale-105',
                  isInReadingList
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:border-primary/50',
                )}
              >
                <BookmarkIcon active={isInReadingList} />
              </button>
            </div>
          </div>
        </header>

        {/* Cover image */}
        <section className="px-4 sm:px-6 lg:px-8">
          <figure className="mx-auto max-w-6xl">
            <Image
              alt={coverAlt}
              w={1600}
              h={900}
              className="aspect-video w-full rounded-2xl object-cover shadow-2xl sm:aspect-[21/9] sm:rounded-3xl"
            />
            <figcaption className="mt-4 text-center text-sm text-muted-foreground">
              {coverCaption}
            </figcaption>
          </figure>
        </section>

        {/* Article body */}
        <article className="py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            {lead.map((p) => (
              <p
                key={p}
                className="mb-8 text-xl font-light leading-relaxed text-foreground/90 sm:text-2xl"
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
                <h2 className="mt-12 mb-6 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {section.heading}
                </h2>

                {section.blocks.map((block, bIdx) => {
                  if (block.h3) {
                    return (
                      <h3
                        key={`${section.heading}-h3-${bIdx}`}
                        className="mt-10 mb-4 font-serif text-2xl font-bold text-foreground"
                      >
                        {block.h3}
                      </h3>
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

                {/* Accent serif pull-quote after the first section */}
                {sIdx === 0 ? (
                  <blockquote className="relative my-12 rounded-r-xl border-l-4 border-primary bg-muted p-6 pl-6 sm:my-16 sm:p-8 sm:pl-8">
                    <span
                      className="absolute -top-6 left-6 font-serif text-7xl leading-none text-primary/20 sm:text-8xl"
                      aria-hidden="true"
                    >
                      &ldquo;
                    </span>
                    <p className="relative z-10 font-serif text-2xl italic leading-tight text-foreground sm:text-3xl lg:text-4xl">
                      {pullQuote}
                    </p>
                    <cite className="mt-4 block font-medium not-italic text-muted-foreground">
                      — {pullQuoteAttribution}
                    </cite>
                  </blockquote>
                ) : null}
              </div>
            ))}

            {/* Tags */}
            <div className="mt-12 border-t border-border pt-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Tagged:
                </span>
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => go(tag)}
                    className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </article>

        {/* Author bio */}
        <section className="bg-muted py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-card p-6 text-card-foreground shadow-sm sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row">
                <Image
                  alt={authorBioAvatarAlt}
                  w={400}
                  h={400}
                  className="size-24 shrink-0 rounded-full object-cover ring-4 ring-muted"
                />
                <div>
                  <h3 className="mb-2 font-serif text-xl font-bold text-foreground">
                    {authorBioName}
                  </h3>
                  <p className="mb-4 leading-relaxed text-muted-foreground">
                    {authorBio}
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    {authorLinks.map((link, i) => (
                      <span key={link} className="flex items-center gap-4">
                        {i > 0 ? (
                          <span
                            className="text-muted-foreground/50"
                            aria-hidden="true"
                          >
                            ·
                          </span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                        >
                          {link}
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related posts */}
        <section className="py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-10 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {relatedHeading}
            </h2>
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {relatedItems.map((post) => {
                const postInReadingList =
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
                        <figure className="mb-4 aspect-[16/10] overflow-hidden rounded-xl">
                          <Image
                            alt={post.imageAlt}
                            w={800}
                            h={500}
                            loading="lazy"
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </figure>
                        <div className="mb-3 flex items-center gap-2">
                          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                            {post.category}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {post.date}
                          </span>
                        </div>
                        <h3 className="mb-2 font-serif text-xl font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
                          {post.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {post.excerpt}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (postInReadingList) {
                            void removeFromReadingList(post.title)
                          } else {
                            void addToReadingList({
                              title: post.title,
                              category: post.category,
                              date: post.date,
                              excerpt: post.excerpt,
                              imageAlt: post.imageAlt,
                            })
                          }
                        }}
                        aria-pressed={postInReadingList}
                        aria-label={
                          postInReadingList
                            ? `Remove ${post.title} from reading list`
                            : `Add ${post.title} to reading list`
                        }
                        className={cn(
                          'absolute right-2 top-2 grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105',
                          postInReadingList
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background/90 text-foreground hover:bg-background',
                        )}
                      >
                        <BookmarkIcon active={postInReadingList} />
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="bg-primary py-16 text-primary-foreground sm:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-4 font-serif text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {newsletterHeading}
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/80 sm:text-xl">
              {newsletterDesc}
            </p>
            <form
              className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault()
                const form = e.currentTarget
                const emailInput = form.querySelector(
                  '#newsletter-email',
                ) as HTMLInputElement
                if (emailInput?.value) {
                  void subscribe(emailInput.value)
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
                className="flex-1 rounded-full bg-background px-5 py-3.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                className="whitespace-nowrap rounded-full bg-foreground px-8 py-3.5 font-semibold text-background transition-colors hover:bg-foreground/90"
              >
                {newsletterSubmit}
              </button>
            </form>
            <p className="mt-4 text-sm text-primary-foreground/70">
              {newsletterFootnote}
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background/70">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
              <div className="sm:col-span-2 lg:col-span-1">
                <button
                  type="button"
                  onClick={() => go(brand)}
                  className="mb-4 flex items-center gap-2"
                >
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <svg
                      className="size-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                  <span className="font-serif text-lg font-bold text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 text-sm leading-relaxed">{footerBlurb}</p>
                <div className="flex items-center gap-4">
                  {footerSocial.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => go(s)}
                      aria-label={s}
                      className="text-background/70 transition-colors hover:text-background"
                    >
                      {s === 'Twitter' ? (
                        <svg
                          className="size-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      ) : s === 'LinkedIn' ? (
                        <svg
                          className="size-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      ) : (
                        <svg
                          className="size-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.heading}>
                  <h4 className="mb-4 font-semibold text-background">
                    {col.heading}
                  </h4>
                  <ul className="space-y-3 text-sm">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-background/70 transition-colors hover:text-background"
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
              <p className="text-sm">
                © {new Date().getFullYear()} {footerNote}
              </p>
              <p className="text-sm">{footerMadeNote}</p>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
