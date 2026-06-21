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
 * NewsKimiPage2 — a complete, self-contained NEWS / EDITORIAL homepage in a
 * BOLD, DARK, high-contrast magazine style. This is the visually DISTINCT
 * second-style SIBLING to NewsKimiPage (which is a light broadsheet): where the
 * sibling is airy and neutral, this "Pulse" port is dark-surfaced with a punchy
 * accent color, ultra-bold black type, pill buttons and rounded-2xl cards.
 *
 * Faithful Tailwind v4 port of a Kimi "Pulse News" design. Layout: a dark
 * sticky navbar with a vivid breaking-news bar, a dark featured-story block
 * (one large lead article with photo + a stacked rail of secondary headlines —
 * NOT a marketing hero band), a "Trending Topics" four-up category card grid,
 * a two-column body (a "Latest Stories" feed of horizontal article cards with
 * author bylines beside a sidebar: a numbered Trending Now list, a dark
 * newsletter signup, a Popular Topics tag cloud and a Podcast promo), a dark
 * subscribe CTA with plan buttons, and a fat multi-column dark footer.
 *
 * The block owns ALL layout, spacing, type hierarchy and color via semantic
 * theme tokens only (no raw palette). Category labels rotate through accent
 * tokens. Every nav item, headline, CTA, tag, social and form submit routes
 * through `useNavigate` (never a dead "#"). All imagery — incl. avatars — uses
 * the alt-driven <Image>. Callers supply ONLY content; rich defaults render a
 * great full page with no props.
 */
export const NewsKimiPage2 = defineCapsule({
  name: 'NewsKimiPage2',
  description:
    "Complete NEWS / EDITORIAL / journalism HOMEPAGE (newspaper, magazine, online publication, media brand, blog index) in a BOLD DARK high-contrast magazine aesthetic — the visually DISTINCT second-style alternative / sibling to NewsKimiPage (which is a clean LIGHT broadsheet). Dark sticky navbar with a vivid breaking-news bar, then a dark featured-story block (one large lead article with photo, category pill + timestamp, plus a stacked rail of secondary headlines with thumbnails — NOT a tall marketing hero band), a 'Trending Topics' four-up category card grid with images and excerpts, a two-column layout (a 'Latest Stories' feed of horizontal image+headline article cards with category pills, dates and author bylines/avatars, plus a filter row and Load More, beside a content sidebar: a numbered Trending Now most-read list with read counts, a dark newsletter / Daily Pulse email signup, a Popular Topics tag cloud, and a Podcast promo card), a dark 'Premium Journalism' subscribe CTA with primary + student plan buttons, and a five-column dark footer with sections, company, support links, social icons and legal links. Use as the ROOT/home or index page for news sites, newspapers, magazines, editorial publications, media brands, content portals or article-heavy blogs that want a punchy dark look with dense multi-section content discovery. Supply content only — brand, nav, breaking, featured + secondary stories, category grid, latest feed, sidebar, CTA, footer; the block owns all layout and styling.",
  props: z.object({
    /** Publication / masthead name shown in navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar section labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Breaking-news bar under the navbar. */
    breaking: z
      .object({
        badge: z.string().optional(),
        headline: z.string().optional(),
      })
      .optional(),
    /** Featured lead story (big card) + a rail of secondary headlines. */
    featured: z
      .object({
        category: z.string().optional(),
        date: z.string().optional(),
        readTime: z.string().optional(),
        title: z.string().optional(),
        excerpt: z.string().optional(),
        imageAlt: z.string().optional(),
        secondary: z
          .array(
            z.object({
              category: z.string(),
              title: z.string(),
              time: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** "Trending Topics" category card grid. */
    topics: z
      .object({
        heading: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
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
              date: z.string(),
              title: z.string(),
              excerpt: z.string(),
              author: z.string(),
              authorRole: z.string(),
              imageAlt: z.string(),
              avatarAlt: z.string(),
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
        newsletterTitle: z.string().optional(),
        newsletterDesc: z.string().optional(),
        newsletterCta: z.string().optional(),
        newsletterNote: z.string().optional(),
        topicsHeading: z.string().optional(),
        topicTags: z.array(z.string()).optional(),
        podcastLabel: z.string().optional(),
        podcastTitle: z.string().optional(),
        podcastDesc: z.string().optional(),
        podcastCta: z.string().optional(),
      })
      .optional(),
    /** Subscribe / support CTA band. */
    cta: z
      .object({
        headingLead: z.string().optional(),
        headingAccent: z.string().optional(),
        description: z.string().optional(),
        primary: z.string().optional(),
        secondary: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(z.object({ heading: z.string(), links: z.array(z.string()) }))
          .optional(),
        socials: z.array(z.string()).optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      savedArticles: table({
        articleTitle: string(),
        articleCategory: string(),
        articleImageAlt: string(),
        articleExcerpt: string(),
        articleAuthor: string(),
        articleDate: string(),
      }),
      newsletterSubscribers: table({
        email: string(),
      }),
      readArticles: table({
        articleTitle: string(),
      }),
    },
    queries: {
      savedArticles: ({ db }) => db.savedArticles.orderBy('createdAt').all(),
      savedArticleTitles: ({ db }) =>
        new Set(db.savedArticles.all().map((saved) => saved.articleTitle)),
      readArticleTitles: ({ db }) =>
        new Set(db.readArticles.all().map((read) => read.articleTitle)),
    },
    mutations: {
      saveArticle: (
        { db },
        articleTitle: string,
        articleCategory: string,
        articleImageAlt: string,
        articleExcerpt: string,
        articleAuthor: string,
        articleDate: string,
      ) => {
        const existing = db.savedArticles
          .where('articleTitle', articleTitle)
          .all()[0]
        if (existing) {
          db.savedArticles.delete(existing.id)
          return false
        }
        db.savedArticles.insert({
          articleTitle,
          articleCategory,
          articleImageAlt,
          articleExcerpt,
          articleAuthor,
          articleDate,
        })
        return true
      },
      removeSavedArticle: ({ db }, articleTitle: string) => {
        for (const item of db.savedArticles
          .where('articleTitle', articleTitle)
          .all()) {
          db.savedArticles.delete(item.id)
        }
        return db.savedArticles.all()
      },
      subscribeNewsletter: ({ db }, email: string) => {
        const existing = db.newsletterSubscribers.where('email', email).all()[0]
        if (existing) return false
        db.newsletterSubscribers.insert({ email })
        return true
      },
      markAsRead: ({ db }, articleTitle: string) => {
        const existing = db.readArticles
          .where('articleTitle', articleTitle)
          .all()[0]
        if (existing) return false
        db.readArticles.insert({ articleTitle })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [readingListOpen, setReadingListOpen] = useState(false)
    const brand = props.brand ?? 'PULSE'

    const savedArticles = lakebed.useQuery('savedArticles')
    const savedArticleTitles = lakebed.useQuery('savedArticleTitles')
    const readArticleTitles = lakebed.useQuery('readArticleTitles')
    const saveArticle = lakebed.useMutation('saveArticle')
    const removeSavedArticle = lakebed.useMutation('removeSavedArticle')
    const subscribeNewsletter = lakebed.useMutation('subscribeNewsletter')
    const markAsRead = lakebed.useMutation('markAsRead')
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
    const safeSavedArticles = savedArticles ?? []
    const savedCount = safeSavedArticles.length
    const nav = props.nav?.length
      ? props.nav
      : [
          'World',
          'Politics',
          'Business',
          'Tech',
          'Science',
          'Culture',
          'Sports',
        ]

    const breakingBadge = props.breaking?.badge ?? 'Breaking'
    const breakingHeadline =
      props.breaking?.headline ??
      'Global climate summit reaches historic agreement on carbon reduction targets • Markets react to Federal Reserve announcement'

    const featCategory = props.featured?.category ?? 'Technology'
    const featDate = props.featured?.date ?? 'May 31, 2026'
    const featReadTime = props.featured?.readTime ?? '8 min read'
    const featTitle =
      props.featured?.title ??
      'The AI Revolution Reshapes Silicon Valley: Inside the Race for Artificial General Intelligence'
    const featExcerpt =
      props.featured?.excerpt ??
      'Leading tech companies are investing billions in the quest for AGI. We go inside the labs where the future of humanity is being coded, line by line.'
    const featImageAlt =
      props.featured?.imageAlt ??
      'Aerial view of a massive tech convention with thousands of attendees and bright stage lighting'
    const secondary = props.featured?.secondary?.length
      ? props.featured.secondary
      : [
          {
            category: 'Politics',
            title:
              'Senate Passes Historic Infrastructure Bill After Marathon 14-Hour Session',
            time: '2 hours ago',
            imageAlt: 'US Capitol building dome against a dramatic sunset sky',
          },
          {
            category: 'Business',
            title:
              'Nasdaq Hits Record High as Tech Stocks Rally for Third Consecutive Week',
            time: '4 hours ago',
            imageAlt:
              'Stock market trading floor with multiple screens showing financial charts',
          },
          {
            category: 'Science',
            title:
              'Breakthrough Quantum Computing Experiment Opens New Frontiers in Medicine',
            time: 'Yesterday',
            imageAlt:
              'Data visualization dashboard with colorful charts and graphs on dark background',
          },
          {
            category: 'Culture',
            title:
              '“Echoes of Silence”: The Documentary That Won Sundance and Broke Records',
            time: 'Yesterday',
            imageAlt:
              'Dramatic mountain landscape with snow-capped peaks and alpine lake',
          },
        ]

    const topicsHeading = props.topics?.heading ?? 'Trending Topics'
    const topicsViewAll = props.topics?.viewAll ?? 'View All'
    const topicItems = props.topics?.items?.length
      ? props.topics.items
      : [
          {
            category: 'World',
            title:
              'Global Leaders Convene Emergency Summit on Food Security Crisis',
            excerpt:
              'Representatives from 47 nations gather in Brussels to address mounting concerns over supply chain disruptions and agricultural sustainability.',
            time: '3 hours ago',
            imageAlt:
              'International flags waving at United Nations headquarters in Geneva',
          },
          {
            category: 'Technology',
            title:
              'OpenAI Announces GPT-5 with Revolutionary Multimodal Capabilities',
            excerpt:
              'The latest model demonstrates unprecedented reasoning abilities across text, images, audio, and video in real-time demonstrations.',
            time: '5 hours ago',
            imageAlt:
              'Futuristic AI robot interface with holographic neural network visualization',
          },
          {
            category: 'Health',
            title:
              'Cancer Vaccine Trial Shows 78% Efficacy in Phase III Results',
            excerpt:
              'Revolutionary mRNA-based treatment demonstrates remarkable success in preventing recurrence among high-risk patient populations.',
            time: 'Yesterday',
            imageAlt:
              'Modern medical laboratory with scientists working with microscopes',
          },
          {
            category: 'Environment',
            title:
              'Record-Breaking Reforestation: 50 Million Trees Planted in Single Day',
            excerpt:
              'Global initiative involving 2.3 million volunteers sets new Guinness World Record across 67 countries.',
            time: 'Yesterday',
            imageAlt:
              'Dramatic mountain peaks emerging through sea of clouds at sunrise',
          },
        ]

    const latestHeading = props.latest?.heading ?? 'Latest Stories'
    const latestFilters = props.latest?.filters?.length
      ? props.latest.filters
      : ['All', 'Politics', 'Business']
    const latestLoadMore = props.latest?.loadMore ?? 'Load More Stories'
    const latestStories = props.latest?.stories?.length
      ? props.latest.stories
      : [
          {
            category: 'Tech',
            date: 'May 31, 2026',
            title:
              'The Foldable Phone Wars Heat Up: Samsung vs. Apple vs. Google',
            excerpt:
              'With three major players launching foldable devices this quarter, we break down the specs, prices, and real-world durability tests that matter most to consumers.',
            author: 'Marcus Chen',
            authorRole: 'Senior Tech Correspondent',
            imageAlt:
              'Modern smartphone displaying a futuristic mobile application interface',
            avatarAlt:
              'Professional headshot of technology journalist Marcus Chen',
          },
          {
            category: 'Urban',
            date: 'May 31, 2026',
            title: '15-Minute Cities: Utopian Vision or Privacy Nightmare?',
            excerpt:
              'As Barcelona and Melbourne expand their superblock programs, residents debate the trade-offs between convenience and surveillance in the age of smart cities.',
            author: 'Sarah Williams',
            authorRole: 'Urban Affairs Editor',
            imageAlt:
              'Urban cityscape with modern architecture and bustling streets',
            avatarAlt:
              'Professional headshot of urban planning reporter Sarah Williams',
          },
          {
            category: 'Wellness',
            date: 'May 30, 2026',
            title:
              "The $47 Billion Wellness Industry's Latest Obsession: Sleep Tourism",
            excerpt:
              'From Icelandic sleep pods to Japanese forest bathing retreats, travelers are paying premium prices for the promise of perfect rest.',
            author: 'James Park',
            authorRole: 'Lifestyle Contributor',
            imageAlt:
              'Group of people practicing yoga together in a bright wellness studio',
            avatarAlt:
              'Professional headshot of travel and lifestyle writer James Park',
          },
          {
            category: 'Sports',
            date: 'May 30, 2026',
            title:
              'Esports Overtake Traditional Sports in Global Viewership for First Time',
            excerpt:
              "The League of Legends World Championship Finals drew 142 million concurrent viewers, surpassing the Super Bowl's record audience.",
            author: 'Aisha Johnson',
            authorRole: 'Esports Lead',
            imageAlt:
              'Professional esports gaming arena with massive screens and crowd',
            avatarAlt:
              'Professional headshot of esports reporter Aisha Johnson',
          },
        ]

    const trendingHeading = props.sidebar?.trendingHeading ?? 'Trending Now'
    const trending = props.sidebar?.trending?.length
      ? props.sidebar.trending
      : [
          {
            title:
              'SpaceX Successfully Launches First Crewed Mission to Mars Orbit',
            reads: '284K reads',
          },
          {
            title:
              'Taylor Swift Announces Surprise Album Drop After Vienna Concert',
            reads: '192K reads',
          },
          {
            title:
              'Bitcoin Breaks $150,000 Barrier as Institutional Adoption Accelerates',
            reads: '156K reads',
          },
          {
            title:
              'Netflix Password Sharing Crackdown Adds 12 Million New Subscribers',
            reads: '134K reads',
          },
          {
            title:
              'Lab-Grown Meat Receives FDA Approval for Commercial Sale in US',
            reads: '98K reads',
          },
        ]

    const newsletterTitle = props.sidebar?.newsletterTitle ?? 'The Daily Pulse'
    const newsletterDesc =
      props.sidebar?.newsletterDesc ??
      'Get the most important stories delivered to your inbox every morning.'
    const newsletterCta = props.sidebar?.newsletterCta ?? 'Subscribe Free'
    const newsletterNote =
      props.sidebar?.newsletterNote ??
      'Join 2.4 million subscribers. Unsubscribe anytime.'

    const topicTagsHeading = props.sidebar?.topicsHeading ?? 'Popular Topics'
    const topicTags = props.sidebar?.topicTags?.length
      ? props.sidebar.topicTags
      : [
          'Artificial Intelligence',
          'Climate Change',
          'Cryptocurrency',
          'Mental Health',
          'Space Exploration',
          'Electric Vehicles',
          'Remote Work',
          'Sustainable Living',
        ]

    const podcastLabel = props.sidebar?.podcastLabel ?? 'Podcast'
    const podcastTitle = props.sidebar?.podcastTitle ?? 'The Weekly Briefing'
    const podcastDesc =
      props.sidebar?.podcastDesc ??
      'Deep dives into the stories that shape our world. New episodes every Tuesday.'
    const podcastCta = props.sidebar?.podcastCta ?? 'Listen Now'

    const ctaHeadingLead = props.cta?.headingLead ?? 'Get Unlimited Access to'
    const ctaHeadingAccent = props.cta?.headingAccent ?? 'Premium Journalism'
    const ctaDesc =
      props.cta?.description ??
      'Support independent reporting. Subscribe to Pulse for exclusive investigative pieces, early access to features, and an ad-free reading experience.'
    const ctaPrimary = props.cta?.primary ?? 'Subscribe Now — $12/month'
    const ctaSecondary = props.cta?.secondary ?? 'Student Plan — $4/month'
    const ctaNote =
      props.cta?.note ?? 'Cancel anytime. First month free for new subscribers.'

    const footerTagline =
      props.footer?.tagline ??
      'Independent journalism for the curious mind. Covering the stories that matter since 2018.'
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            heading: 'Sections',
            links: [
              'World',
              'Politics',
              'Business',
              'Technology',
              'Science',
              'Health',
            ],
          },
          {
            heading: 'Company',
            links: [
              'About Us',
              'Careers',
              'Code of Ethics',
              'Contact',
              'Advertise',
            ],
          },
          {
            heading: 'Support',
            links: [
              'Help Center',
              'Subscription',
              'Newsletters',
              'Apps',
              'Sitemap',
            ],
          },
        ]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ['Twitter', 'Facebook', 'Instagram']
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} Pulse Media Group. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Settings']

    // Rotate category labels through theme accent tokens (no raw palette).
    const catTones = [
      'text-primary',
      'text-chart-1',
      'text-chart-2',
      'text-chart-3',
      'text-chart-4',
      'text-chart-5',
    ]
    const toneFor = (key: string) => {
      let h = 0
      for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0
      return catTones[Math.abs(h) % catTones.length]
    }

    const PulseMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
        <path d="M10 4a1 1 0 011 1v4.5l3 1.8a1 1 0 11-1 1.732l-3.5-2.1a1 1 0 01-.5-.866V5a1 1 0 011-1z" />
      </svg>
    )

    const ChevronRight = ({ className }: { className?: string }) => (
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
        <path d="M9 5l7 7-7 7" />
      </svg>
    )

    const FlameIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
      </svg>
    )

    const SpeakerIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    )

    const BookmarkIcon = ({
      className,
      active = false,
    }: {
      className?: string
      active?: boolean
    }) => (
      <svg
        viewBox="0 0 20 20"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 19V5z" />
      </svg>
    )

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

    return (
      <div
        className={cn(
          'min-h-svh bg-background text-foreground antialiased',
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 bg-foreground text-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <span className="flex size-8 items-center justify-center rounded bg-primary">
                  <PulseMark className="size-5 text-primary-foreground" />
                </span>
                <span className="text-2xl font-black tracking-tight">
                  {brand}
                </span>
              </button>

              <nav className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm font-semibold text-background transition-colors hover:text-primary"
                  >
                    {label}
                  </button>
                ))}
              </nav>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label="Search"
                  onClick={() => go('Search')}
                  className="hidden text-background/60 transition-colors hover:text-background sm:block"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                <Sheet open={readingListOpen} onOpenChange={setReadingListOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="Reading list"
                      className="relative text-background/60 transition-colors hover:text-background"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-5"
                        aria-hidden="true"
                      >
                        <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 19V5z" />
                      </svg>
                      {savedCount > 0 ? (
                        <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary text-[0.625rem] font-bold text-primary-foreground">
                          {savedCount}
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
                        {savedCount > 0
                          ? `${savedCount} article${savedCount === 1 ? '' : 's'} saved for later.`
                          : 'Your reading list is empty.'}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {safeSavedArticles.length ? (
                        <div className="space-y-5">
                          {safeSavedArticles.map((item) => (
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
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                      {item.articleCategory}
                                    </p>
                                    <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                      {item.articleTitle}
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                      {item.articleAuthor}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                  <button
                                    type="button"
                                    onClick={() => go(item.articleTitle)}
                                    className="text-xs font-semibold text-primary hover:text-primary/80"
                                  >
                                    Read now
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void removeSavedArticle(item.articleTitle)
                                    }
                                    className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                                  >
                                    Remove
                                  </button>
                                </div>
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
                            Bookmark articles to read them later.
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
                          <ArrowRight />
                        </button>
                        <button
                          type="button"
                          onClick={() => go('Subscriptions')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Subscriptions
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
                  onClick={() => go('Subscribe')}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Subscribe
                </button>
                <button
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v: boolean) => !v)}
                  className="text-background md:hidden"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
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

          {/* Breaking news bar */}
          <div className="bg-primary text-primary-foreground">
            <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2 sm:px-6 lg:px-8">
              <span className="rounded bg-primary-foreground px-2 py-1 text-xs font-black uppercase tracking-wider text-primary">
                {breakingBadge}
              </span>
              <button
                type="button"
                onClick={() => go(breakingHeadline)}
                className="truncate text-left text-sm font-medium hover:underline"
              >
                {breakingHeadline}
              </button>
            </div>
          </div>
        </header>

        <main>
          {/* Featured */}
          <section className="bg-foreground py-8 text-background sm:py-12 lg:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
                {/* Lead story */}
                <article className="group lg:col-span-7 xl:col-span-8">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        void markAsRead(featTitle)
                        go(featTitle)
                      }}
                      className="block w-full text-left"
                    >
                      <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
                        <Image
                          alt={featImageAlt}
                          w={1200}
                          h={675}
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="mt-6">
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          <span className="rounded-full bg-primary px-3 py-1 text-xs font-black uppercase tracking-wider text-primary-foreground">
                            {featCategory}
                          </span>
                          <span className="text-sm text-background/60">
                            {featDate}
                          </span>
                          <span className="text-sm text-background/50">
                            • {featReadTime}
                          </span>
                          {readArticleTitles?.has(featTitle) && (
                            <span className="text-xs font-semibold text-primary">
                              Read
                            </span>
                          )}
                        </div>
                        <h1 className="mb-4 text-3xl font-black leading-tight transition-colors group-hover:text-primary sm:text-4xl lg:text-5xl">
                          {featTitle}
                        </h1>
                        <p className="max-w-3xl text-lg leading-relaxed text-background/70">
                          {featExcerpt}
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void saveArticle(
                          featTitle,
                          featCategory,
                          featImageAlt,
                          featExcerpt,
                          'Pulse Staff',
                          featDate,
                        )
                      }
                      aria-pressed={savedArticleTitles?.has(featTitle) ?? false}
                      aria-label="Save article to reading list"
                      className={cn(
                        'absolute top-4 right-4 grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105',
                        savedArticleTitles?.has(featTitle)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background/90 text-background hover:bg-background',
                      )}
                    >
                      <BookmarkIcon
                        active={savedArticleTitles?.has(featTitle) ?? false}
                        className="size-5"
                      />
                    </button>
                  </div>
                </article>

                {/* Secondary rail */}
                <div className="space-y-6 lg:col-span-5 xl:col-span-4">
                  {secondary.map((story) => (
                    <article key={story.title} className="group relative">
                      <button
                        type="button"
                        onClick={() => {
                          void markAsRead(story.title)
                          go(story.title)
                        }}
                        className="flex w-full gap-4 text-left"
                      >
                        <div className="h-24 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-muted sm:h-28 sm:w-40">
                          <Image
                            alt={story.imageAlt}
                            w={400}
                            h={300}
                            loading="lazy"
                            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="flex-1">
                          <span
                            className={cn(
                              'text-xs font-black uppercase tracking-wider',
                              toneFor(story.category),
                            )}
                          >
                            {story.category}
                          </span>
                          <h3 className="mt-1 text-lg font-bold leading-tight transition-colors group-hover:text-primary">
                            {story.title}
                          </h3>
                          <span className="mt-2 block text-sm text-background/50">
                            {story.time}
                          </span>
                          {readArticleTitles?.has(story.title) && (
                            <span className="mt-1 block text-xs font-semibold text-primary">
                              Read
                            </span>
                          )}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void saveArticle(
                            story.title,
                            story.category,
                            story.imageAlt,
                            '',
                            'Pulse Staff',
                            story.time,
                          )
                        }
                        aria-pressed={
                          savedArticleTitles?.has(story.title) ?? false
                        }
                        aria-label="Save article to reading list"
                        className={cn(
                          'absolute top-0 right-0 grid size-8 place-items-center rounded-full shadow-md transition-all hover:scale-105',
                          savedArticleTitles?.has(story.title)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background/90 text-background hover:bg-background',
                        )}
                      >
                        <BookmarkIcon
                          active={savedArticleTitles?.has(story.title) ?? false}
                          className="size-4"
                        />
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Trending Topics category grid */}
          <section className="bg-card py-12 text-card-foreground sm:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-black sm:text-3xl">
                  {topicsHeading}
                </h2>
                <button
                  type="button"
                  onClick={() => go(topicsViewAll)}
                  className="flex items-center gap-1 font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  {topicsViewAll}
                  <ChevronRight className="size-4" />
                </button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {topicItems.map((item) => (
                  <div key={item.title} className="group relative">
                    <button
                      type="button"
                      onClick={() => {
                        void markAsRead(item.title)
                        go(item.title)
                      }}
                      className="block w-full text-left"
                    >
                      <div className="mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                        <Image
                          alt={item.imageAlt}
                          w={600}
                          h={450}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <span
                        className={cn(
                          'text-xs font-black uppercase tracking-wider',
                          toneFor(item.category),
                        )}
                      >
                        {item.category}
                      </span>
                      <h3 className="mt-1 text-xl font-bold leading-snug transition-colors group-hover:text-primary">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {item.excerpt}
                      </p>
                      <span className="mt-3 block text-xs text-muted-foreground">
                        {item.time}
                      </span>
                      {readArticleTitles?.has(item.title) && (
                        <span className="mt-1 block text-xs font-semibold text-primary">
                          Read
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void saveArticle(
                          item.title,
                          item.category,
                          item.imageAlt,
                          item.excerpt,
                          'Pulse Staff',
                          item.time,
                        )
                      }
                      aria-pressed={
                        savedArticleTitles?.has(item.title) ?? false
                      }
                      aria-label="Save article to reading list"
                      className={cn(
                        'absolute top-4 right-4 grid size-8 place-items-center rounded-full shadow-md transition-all hover:scale-105',
                        savedArticleTitles?.has(item.title)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background/90 text-background hover:bg-background',
                      )}
                    >
                      <BookmarkIcon
                        active={savedArticleTitles?.has(item.title) ?? false}
                        className="size-4"
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Main content: latest + sidebar */}
          <section className="bg-muted py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
                {/* Latest stories */}
                <div className="lg:col-span-8">
                  <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-2xl font-black text-foreground sm:text-3xl">
                      {latestHeading}
                    </h2>
                    <div className="flex gap-2">
                      {latestFilters.map((f, i) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => go(f)}
                          className={cn(
                            'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                            i === 0
                              ? 'bg-foreground text-background'
                              : 'bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground',
                            i === 2 && 'hidden sm:block',
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
                        className="relative overflow-hidden rounded-2xl bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div className="sm:flex">
                          <button
                            type="button"
                            onClick={() => go(story.title)}
                            className="block aspect-[16/10] overflow-hidden sm:aspect-auto sm:w-2/5"
                          >
                            <Image
                              alt={story.imageAlt}
                              w={800}
                              h={500}
                              loading="lazy"
                              className="size-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                          </button>
                          <div className="flex flex-col justify-center p-6 sm:w-3/5">
                            <div className="mb-3 flex items-center gap-3">
                              <span
                                className={cn(
                                  'rounded bg-accent px-2 py-1 text-xs font-bold uppercase',
                                  toneFor(story.category),
                                )}
                              >
                                {story.category}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {story.date}
                              </span>
                              {readArticleTitles?.has(story.title) && (
                                <span className="text-xs font-semibold text-primary">
                                  Read
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                void markAsRead(story.title)
                                go(story.title)
                              }}
                              className="text-left"
                            >
                              <h3 className="mb-3 text-xl font-bold transition-colors hover:text-primary sm:text-2xl">
                                {story.title}
                              </h3>
                            </button>
                            <p className="mb-4 leading-relaxed text-muted-foreground">
                              {story.excerpt}
                            </p>
                            <div className="flex items-center gap-3">
                              <Image
                                alt={story.avatarAlt}
                                w={100}
                                h={100}
                                className="size-8 rounded-full object-cover"
                              />
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  {story.author}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {story.authorRole}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            void saveArticle(
                              story.title,
                              story.category,
                              story.imageAlt,
                              story.excerpt,
                              story.author,
                              story.date,
                            )
                          }
                          aria-pressed={
                            savedArticleTitles?.has(story.title) ?? false
                          }
                          aria-label="Save article to reading list"
                          className={cn(
                            'absolute top-4 right-4 grid size-8 place-items-center rounded-full shadow-md transition-all hover:scale-105',
                            savedArticleTitles?.has(story.title)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-background/90 text-background hover:bg-background',
                          )}
                        >
                          <BookmarkIcon
                            active={
                              savedArticleTitles?.has(story.title) ?? false
                            }
                            className="size-4"
                          />
                        </button>
                      </article>
                    ))}
                  </div>

                  <div className="mt-10 text-center">
                    <button
                      type="button"
                      onClick={() => go(latestLoadMore)}
                      className="rounded-full border-2 border-foreground bg-transparent px-8 py-3 font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background"
                    >
                      {latestLoadMore}
                    </button>
                  </div>
                </div>

                {/* Sidebar */}
                <aside className="space-y-8 lg:col-span-4">
                  {/* Trending Now */}
                  <div className="rounded-2xl bg-card p-6 text-card-foreground shadow-sm">
                    <h3 className="mb-6 flex items-center gap-2 text-xl font-black">
                      <FlameIcon className="size-5 text-primary" />
                      {trendingHeading}
                    </h3>
                    <div className="space-y-5">
                      {trending.map((item, i) => (
                        <button
                          key={item.title}
                          type="button"
                          onClick={() => {
                            void markAsRead(item.title)
                            go(item.title)
                          }}
                          className="group flex w-full gap-4 text-left"
                        >
                          <span className="text-3xl font-black text-muted-foreground/40 transition-colors group-hover:text-primary/60">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <div>
                            <h4 className="font-bold leading-snug transition-colors group-hover:text-primary">
                              {item.title}
                            </h4>
                            <span className="mt-1 block text-xs text-muted-foreground">
                              {item.reads}
                            </span>
                            {readArticleTitles?.has(item.title) && (
                              <span className="mt-1 block text-xs font-semibold text-primary">
                                Read
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Newsletter */}
                  <div className="rounded-2xl bg-foreground p-6 text-background">
                    <h3 className="mb-2 text-xl font-black">
                      {newsletterTitle}
                    </h3>
                    <p className="mb-4 text-sm text-background/60">
                      {newsletterDesc}
                    </p>
                    <form
                      className="space-y-3"
                      onSubmit={(e) => {
                        e.preventDefault()
                        const form = e.currentTarget
                        const email = form.querySelector(
                          'input[type="email"]',
                        ) as HTMLInputElement
                        if (email?.value) {
                          void subscribeNewsletter(email.value)
                          email.value = ''
                        }
                      }}
                    >
                      <input
                        type="email"
                        required
                        placeholder="Enter your email"
                        aria-label="Email address"
                        className="w-full rounded-xl border border-border/40 bg-background/10 px-4 py-3 text-background placeholder-background/50 transition-colors focus:border-primary focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        {newsletterCta}
                      </button>
                    </form>
                    <p className="mt-3 text-xs text-background/50">
                      {newsletterNote}
                    </p>
                  </div>

                  {/* Popular topics */}
                  <div className="rounded-2xl bg-card p-6 text-card-foreground shadow-sm">
                    <h3 className="mb-4 text-xl font-black">
                      {topicTagsHeading}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {topicTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => go(tag)}
                          className="rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Podcast promo */}
                  <div className="rounded-2xl border border-primary/20 bg-primary/10 p-6">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="flex size-12 items-center justify-center rounded-xl bg-primary">
                        <SpeakerIcon className="size-6 text-primary-foreground" />
                      </span>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-primary">
                          {podcastLabel}
                        </p>
                        <p className="font-bold text-foreground">
                          {podcastTitle}
                        </p>
                      </div>
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {podcastDesc}
                    </p>
                    <button
                      type="button"
                      onClick={() => go(podcastCta)}
                      className="w-full rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {podcastCta}
                    </button>
                  </div>
                </aside>
              </div>
            </div>
          </section>

          {/* Subscribe CTA */}
          <section className="bg-foreground py-16 text-background sm:py-20">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-black sm:text-4xl lg:text-5xl">
                {ctaHeadingLead}{' '}
                <span className="text-primary">{ctaHeadingAccent}</span>
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-background/60">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="rounded-full bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="rounded-full border-2 border-background bg-transparent px-8 py-4 text-lg font-bold text-background transition-colors hover:bg-background hover:text-foreground"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-6 text-sm text-background/50">{ctaNote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-background py-12 text-muted-foreground sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-12">
              {/* Brand */}
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <span className="flex size-8 items-center justify-center rounded bg-primary">
                    <PulseMark className="size-5 text-primary-foreground" />
                  </span>
                  <span className="text-2xl font-black tracking-tight text-foreground">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-xs text-sm">{footerTagline}</p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="flex size-10 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      {social.slice(0, 2)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Link columns */}
              {footerColumns.map((col) => (
                <div key={col.heading}>
                  <h4 className="mb-4 font-bold text-foreground">
                    {col.heading}
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="transition-colors hover:text-primary"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
              <p className="text-sm">{footerCopyright}</p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="transition-colors hover:text-primary"
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
