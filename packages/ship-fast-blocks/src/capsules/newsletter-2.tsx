import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { string, table } from "@ship-fast/lakebed/server"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar.tsx"
import { Button } from "#/components/ui/button.tsx"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover.tsx"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "#/components/ui/sheet.tsx"

/**
 * NewsletterKimiPage2 — a complete, self-contained NEWSLETTER landing /
 * subscription page in a BOLD, modern, brand-forward style.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "The Signal" design: a punchy,
 * high-energy aesthetic with heavy sans-serif (black-weight) display headings,
 * a vibrant primary brand accent, rounded pills, soft tinted feature cards, and
 * a featured-issue preview card in the hero. This is the SECOND/alternative
 * style sibling to NewsletterKimiPage (which is the warm, calm, serif
 * "editorial / paper" variant) — reach for THIS one when you want a louder,
 * startup/tech, conversion-aggressive vibe instead of the quiet literary mood.
 *
 * Layout: split hero (eyebrow live-pill, black headline + accent sub-line,
 * inline email subscribe form, avatar social-proof + rating, plus a floating
 * latest-issue preview card), a "Trusted by" wordmark logos strip, a 6-up
 * tinted features grid with icons, a dark recent-issues archive grid (cover
 * image, issue badge, date, share count, read link), a tinted testimonials
 * grid with 5-star ratings + avatars, a two-tier pricing comparison (Free vs
 * Premium, the Premium card inverted on the primary surface), a dark final-CTA
 * subscribe band, and a dark multi-column footer with social links.
 *
 * Every nav item, CTA, read link, footer/social link and form-submit routes
 * through `useNavigate` (never a dead "#"). Content imagery + avatars use the
 * alt-driven <Image> component. Callers supply ONLY content; rich defaults make
 * it render great with no props at all.
 */
export const NewsletterKimiPage2 = defineCapsule({
  name: "NewsletterKimiPage2",
  description:
    "Complete NEWSLETTER landing / email-subscription page in a BOLD, modern, brand-forward startup/tech style: heavy black-weight sans-serif display headings, a vibrant primary brand accent, rounded pills, tinted feature cards and a floating latest-issue preview card. This is the second/alternative visual style to NewsletterKimiPage (the calm, serif, paper-toned editorial variant) — choose THIS one for a louder, higher-energy, conversion-aggressive feel. Includes a split hero (live subscriber pill, big headline + accent sub-line, inline email signup form, avatar stack + star rating, featured-issue preview card), a 'Trusted by' wordmark logos strip, a 6-up features grid with icons, a dark recent-issues archive grid (cover photo, issue badge, date, share count, read link, view-all link), a tinted testimonials grid with 5-star ratings and avatars, a two-tier pricing comparison (Free vs Premium plan with feature checklists, Premium inverted on the primary surface), a dark final-CTA subscribe band, and a dark multi-column footer with social links. Use as the ROOT/home page for newsletters, email subscriptions, Substack/Beehiiv-style publications, startup digests, tech briefings, or content creators wanting a punchy signup page with archive showcase, social proof and free/paid tiers. Supply content only — brand, nav, hero, logos, features, issues, testimonials, pricing, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / publication name shown in the navbar, CTAs and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        pill: z.string().optional(),
        headingTop: z.string().optional(),
        headingAccent: z.string().optional(),
        subheading: z.string().optional(),
        emailPlaceholder: z.string().optional(),
        submit: z.string().optional(),
        proof: z.string().optional(),
        avatarAlts: z.array(z.string()).optional(),
        rating: z.string().optional(),
        ratingLabel: z.string().optional(),
        previewBadge: z.string().optional(),
        previewMeta: z.string().optional(),
        previewTitle: z.string().optional(),
        previewBlurb: z.string().optional(),
        previewStat1: z.string().optional(),
        previewStat2: z.string().optional(),
        previewImageAlt: z.string().optional(),
      })
      .optional(),
    /** "Trusted by" wordmark logos strip. */
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** "What you get" features section. */
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Recent-issues archive grid (dark band). */
    issues: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        readLabel: z.string().optional(),
        items: z
          .array(
            z.object({
              badge: z.string(),
              meta: z.string(),
              title: z.string(),
              blurb: z.string(),
              shares: z.string(),
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
        description: z.string().optional(),
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
    /** Two-tier pricing comparison. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        free: z
          .object({
            name: z.string().optional(),
            tagline: z.string().optional(),
            price: z.string().optional(),
            period: z.string().optional(),
            submit: z.string().optional(),
            features: z.array(z.string()).optional(),
          })
          .optional(),
        premium: z
          .object({
            badge: z.string().optional(),
            name: z.string().optional(),
            tagline: z.string().optional(),
            price: z.string().optional(),
            period: z.string().optional(),
            submit: z.string().optional(),
            features: z.array(z.string()).optional(),
          })
          .optional(),
      })
      .optional(),
    /** Final CTA subscribe band (dark). */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        emailPlaceholder: z.string().optional(),
        submit: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      subscribers: table({
        email: string(),
        source: string(),
        plan: string(),
      }),
      readingList: table({
        issueTitle: string(),
        issueMeta: string(),
        issueBadge: string(),
      }),
    },
    queries: {
      subscribers: ({ db }) => db.subscribers.orderBy("createdAt").all(),
      readingList: ({ db }) => db.readingList.orderBy("createdAt").all(),
    },
    mutations: {
      subscribe: ({ db }, email: string, source: string, plan: string) => {
        const normalizedEmail = email.trim().toLowerCase()
        if (!normalizedEmail) return db.subscribers.all()

        const existingSubscriber = db.subscribers
          .where("email", normalizedEmail)
          .all()[0]

        if (existingSubscriber) return db.subscribers.all()

        db.subscribers.insert({
          email: normalizedEmail,
          source: source.trim(),
          plan: plan.trim(),
        })

        return db.subscribers.all()
      },
      addReadingIssue: (
        { db },
        issueTitle: string,
        issueMeta: string,
        issueBadge: string,
      ) => {
        const title = issueTitle.trim()
        if (!title) return db.readingList.all()

        const existing = db.readingList.where("issueTitle", title).all()[0]

        if (existing) return db.readingList.all()

        db.readingList.insert({
          issueTitle: title,
          issueMeta: issueMeta.trim(),
          issueBadge: issueBadge.trim(),
        })

        return db.readingList.all()
      },
      removeReadingIssue: ({ db }, id: string) => {
        db.readingList.delete(id)
        return db.readingList.all()
      },
      clearReadingList: ({ db }) => {
        for (const item of db.readingList.all()) {
          db.readingList.delete(item.id)
        }

        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [heroEmail, setHeroEmail] = useState("")
    const [ctaEmail, setCtaEmail] = useState("")
    const [readingListOpen, setReadingListOpen] = useState(false)
    const subscribers = lakebed.useQuery("subscribers")
    const readingList = lakebed.useQuery("readingList")
    const subscribe = lakebed.useMutation("subscribe")
    const addReadingIssue = lakebed.useMutation("addReadingIssue")
    const removeReadingIssue = lakebed.useMutation("removeReadingIssue")
    const clearReadingList = lakebed.useMutation("clearReadingList")
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || "Account"
    const authInitials =
      authDisplayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "ME"
    const authLabel = auth.isLoading ? "Checking..." : isSignedIn ? authDisplayName : "Sign in"
    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }
    const persistedSubscribers = subscribers ?? []
    const persistedReadingList = readingList ?? []
    const brand = props.brand ?? "The Signal"
    const nav = props.nav?.length
      ? props.nav
      : ["About", "Issues", "Readers", "Subscribe Free"]

    const heroPill = props.hero?.pill ?? "Join 47,000+ subscribers"
    const heroTop = props.hero?.headingTop ?? "The Signal"
    const heroAccent = props.hero?.headingAccent ?? "Weekend Briefing"
    const heroSub =
      props.hero?.subheading ??
      "Every Saturday morning, get the week's most important stories in startups, tech, and culture — distilled into a 5-minute read that actually matters."
    const heroPlaceholder = props.hero?.emailPlaceholder ?? "your@email.com"
    const heroSubmit = props.hero?.submit ?? "Subscribe Free"
    const heroProof =
      props.hero?.proof ??
      "No spam. Unsubscribe anytime. Join readers from Google, a16z, and Stripe."
    const heroAvatars = props.hero?.avatarAlts?.length
      ? props.hero.avatarAlts
      : [
          "professional headshot of a smiling woman with curly brown hair",
          "professional headshot of a man with short dark hair wearing glasses",
          "professional headshot of a smiling woman with blonde hair",
          "professional headshot of a man with a beard and warm smile",
        ]
    const heroRating = props.hero?.rating ?? "4.9/5"
    const heroRatingLabel = props.hero?.ratingLabel ?? "from 2,400+ reviews"
    const previewBadge = props.hero?.previewBadge ?? "NEW"
    const previewMeta = props.hero?.previewMeta ?? "Issue #312 • May 24, 2026"
    const previewTitle =
      props.hero?.previewTitle ?? "The AI Tools Actually Worth Your Time"
    const previewBlurb =
      props.hero?.previewBlurb ??
      "We tested 47 new AI productivity tools this month. These 6 actually moved the needle for real teams."
    const previewStat1 = props.hero?.previewStat1 ?? "6 min read"
    const previewStat2 = props.hero?.previewStat2 ?? "2,847 shares"
    const previewImageAlt =
      props.hero?.previewImageAlt ??
      "team collaborating around a laptop in a modern startup office with natural lighting"

    const logosLabel = props.logos?.label ?? "Trusted by teams at"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Google", "Stripe", "Notion", "Figma", "a16z", "YC"]

    const featuresHeading =
      props.features?.heading ?? "What you get every week"
    const featuresDesc =
      props.features?.description ??
      "A carefully curated briefing that saves you hours of scrolling and keeps you ahead of the curve."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Startup Spotlights",
            description:
              "Deep dives into 3-5 breakout companies with revenue metrics, founder backgrounds, and growth tactics you can steal.",
          },
          {
            title: "Tech Analysis",
            description:
              "Plain-English breakdowns of emerging tech — AI models, dev tools, hardware — and what they actually mean for builders.",
          },
          {
            title: "Cultural Signals",
            description:
              "The memes, movements, and mindset shifts shaping how we work, create, and live online and offline.",
          },
          {
            title: "5-Minute Format",
            description:
              "Every issue designed to be read with coffee. No fluff. No clickbait. Just signal.",
          },
          {
            title: "Community Access",
            description:
              "Join 12,000+ members in our private Discord. Job board, founder intros, and weekly AMAs with VCs and operators.",
          },
          {
            title: "Resource Library",
            description:
              "Exclusive templates, pitch decks, and toolkits. New drops every month for paid subscribers.",
          },
        ]

    const issuesHeading = props.issues?.heading ?? "Recent Issues"
    const issuesDesc =
      props.issues?.description ?? "Deep dives you might have missed"
    const issuesViewAll = props.issues?.viewAll ?? "View all 312 issues"
    const issuesReadLabel = props.issues?.readLabel ?? "Read"
    const issueItems = props.issues?.items?.length
      ? props.issues.items
      : [
          {
            badge: "ISSUE #312",
            meta: "May 24, 2026 • 6 min read",
            title: "The AI Tools Actually Worth Your Time",
            blurb:
              "We tested 47 new AI productivity tools this month. These 6 actually moved the needle for real teams.",
            shares: "2,847 shares",
            imageAlt:
              "abstract visualization of artificial intelligence neural networks with glowing nodes",
          },
          {
            badge: "ISSUE #311",
            meta: "May 17, 2026 • 8 min read",
            title: "The $47B Bootstrapped Empire",
            blurb:
              "How Databricks grew to a $43B valuation without a single dollar of VC funding until Series F.",
            shares: "3,421 shares",
            imageAlt:
              "financial growth charts and investment data visualization on multiple screens",
          },
          {
            badge: "ISSUE #310",
            meta: "May 10, 2026 • 5 min read",
            title: "Remote Work is Dead. Long Live Remote Work.",
            blurb:
              "The RTO wave is here. But the best companies are doing something completely different.",
            shares: "4,102 shares",
            imageAlt:
              "diverse team of developers collaborating at a modern tech workspace with monitors",
          },
          {
            badge: "ISSUE #309",
            meta: "May 3, 2026 • 7 min read",
            title: "Web3 is Growing Up",
            blurb:
              "Forget the hype. These 12 crypto-adjacent startups are solving real problems for real customers.",
            shares: "1,893 shares",
            imageAlt:
              "blockchain technology and Web3 decentralized network visualization",
          },
          {
            badge: "ISSUE #308",
            meta: "April 26, 2026 • 6 min read",
            title: "The New Stack for 2026",
            blurb:
              "What 500+ startup tech leads told us about their go-to tools, frameworks, and cloud choices this year.",
            shares: "2,156 shares",
            imageAlt:
              "developer laptop screen showing modern code editor with syntax highlighting",
          },
          {
            badge: "ISSUE #307",
            meta: "April 19, 2026 • 9 min read",
            title: "Inside Sequoia's Secret AI Bets",
            blurb:
              "An exclusive look at the 8 AI startups Sequoia quietly backed before they hit TechCrunch.",
            shares: "5,203 shares",
            imageAlt:
              "startup founder presenting to investors in a modern conference room",
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "What readers say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Join 47,000+ founders, operators, and investors who start their weekend with The Signal."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "The Signal is the only newsletter I read every single week. It's saved me countless hours of tech news scrolling and actually helps me make better investment decisions.",
            name: "Marcus Chen",
            role: "Partner, Andreessen Horowitz",
            avatarAlt: "professional headshot of a man in a navy suit jacket",
          },
          {
            quote:
              "I've discovered three of our portfolio companies through The Signal before they hit the mainstream. The founder spotlights are genuinely unmatched.",
            name: "Sarah Williams",
            role: "Founder, Day One Ventures",
            avatarAlt:
              "professional headshot of a woman with dark hair wearing a professional blouse",
          },
          {
            quote:
              "As a solo founder, I don't have time to keep up with everything. The Signal keeps me informed without the fluff. It's basically my weekly cheat sheet.",
            name: "David Park",
            role: "CEO, Reflect (YC W23)",
            avatarAlt:
              "professional headshot of a man wearing glasses and a casual button-up shirt",
          },
          {
            quote:
              "I forward The Signal to my entire leadership team every Saturday. The quality of analysis and curation is genuinely exceptional.",
            name: "Elena Rodriguez",
            role: "CPO, Linear",
            avatarAlt:
              "professional headshot of a smiling woman with curly dark hair",
          },
          {
            quote:
              "The Signal helped me understand the AI landscape in a way that actually made sense. Signed up my whole team within a week of reading.",
            name: "James Liu",
            role: "Engineering Lead, Stripe",
            avatarAlt:
              "professional headshot of a man with short dark hair and glasses",
          },
          {
            quote:
              "Finally, a tech newsletter that respects my time. No hype, just genuine insights. The Signal has become essential reading.",
            name: "Maya Thompson",
            role: "Editor, TechCrunch",
            avatarAlt:
              "professional headshot of a woman with long dark hair and a warm smile",
          },
        ]

    const pricingHeading = props.pricing?.heading ?? "Simple pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Free for everyone. Upgrade when you're ready for more."
    const freeName = props.pricing?.free?.name ?? "Free"
    const freeTagline =
      props.pricing?.free?.tagline ?? "The essentials, delivered weekly."
    const freePrice = props.pricing?.free?.price ?? "$0"
    const freePeriod = props.pricing?.free?.period ?? "/month"
    const freeSubmit = props.pricing?.free?.submit ?? "Subscribe Free"
    const freeFeatures = props.pricing?.free?.features?.length
      ? props.pricing.free.features
      : [
          "Weekly newsletter every Saturday",
          "Access to all past issues",
          "Community Discord access",
        ]
    const premiumBadge = props.pricing?.premium?.badge ?? "POPULAR"
    const premiumName = props.pricing?.premium?.name ?? "Premium"
    const premiumTagline =
      props.pricing?.premium?.tagline ?? "For the builders who want more."
    const premiumPrice = props.pricing?.premium?.price ?? "$12"
    const premiumPeriod = props.pricing?.premium?.period ?? "/month"
    const premiumSubmit =
      props.pricing?.premium?.submit ?? "Upgrade to Premium"
    const premiumFeatures = props.pricing?.premium?.features?.length
      ? props.pricing.premium.features
      : [
          "Everything in Free",
          "Exclusive monthly deep-dives",
          "Resource library access",
          "Weekly AMAs with VCs & founders",
          "Private founder intros",
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to join?"
    const ctaDesc =
      props.cta?.description ??
      "Get the Signal delivered to your inbox every Saturday morning. Join 47,000+ readers who start their weekend informed."
    const ctaPlaceholder = props.cta?.emailPlaceholder ?? "your@email.com"
    const ctaSubmit = props.cta?.submit ?? "Subscribe Free"
    const ctaNote =
      props.cta?.note ??
      "No spam. Unsubscribe anytime. Read by teams at Google, Stripe, a16z, and 500+ startups."

    const footerTagline =
      props.footer?.tagline ??
      "The weekly briefing on startups, tech, and culture that matters. Delivered every Saturday to 47,000+ readers."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Content",
            links: ["Latest Issue", "Archive", "Topics", "Authors"],
          },
          {
            title: "Company",
            links: ["About", "Sponsor", "Careers", "Contact"],
          },
        ]
    const footerCopyright = props.footer?.copyright ?? "All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy", "Terms", "Unsubscribe"]

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-primary font-bold text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    )

    const Heart = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    )

    const featureIcons = [
      <svg
        key="bolt"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      <svg
        key="bulb"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>,
      <svg
        key="grid"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>,
      <svg
        key="clock"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg
        key="users"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      <svg
        key="library"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>,
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(brand)}
                className="flex items-center gap-2"
              >
                <LogoMark className="size-8 text-lg" />
                <span className="text-xl font-bold tracking-tight text-foreground">
                  {brand}
                </span>
              </button>
              <div className="hidden items-center gap-3 lg:gap-8 md:flex">
                {nav.slice(0, -1).map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => go(nav[nav.length - 1])}
                  className="rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
                >
                  {nav[nav.length - 1]}
                </button>
                <Sheet open={readingListOpen} onOpenChange={setReadingListOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open reading list"
                      className="relative flex h-10 items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-muted"
                    >
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
                        <path d="M6 3h9a1 1 0 0 1 1 1v16.5a.5.5 0 0 1-.8.4L12 19.2l-3.2 1.7a.5.5 0 0 1-.8-.4V4a1 1 0 0 1 1-1z" />
                        <path d="M6.6 3.4V18" />
                      </svg>
                      Reads
                      {persistedReadingList.length ? (
                        <span className="grid size-5 place-items-center rounded-full bg-primary px-0 text-xs font-bold text-primary-foreground">
                          {persistedReadingList.length}
                        </span>
                      ) : null}
                    </button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle>Reading list</SheetTitle>
                      <SheetDescription>
                        {persistedReadingList.length > 0
                          ? `${persistedReadingList.length} saved issue${
                              persistedReadingList.length === 1 ? "" : "s"
                            } for later`
                          : "Save issues from the archive and review them here."}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                      {persistedReadingList.length ? (
                        <div className="space-y-4">
                          {persistedReadingList.map((item) => (
                            <article
                              key={item.id}
                              className="rounded-lg border border-border bg-muted/40 p-4"
                            >
                              <div className="mb-2 flex items-center justify-between gap-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                  {item.issueBadge || "Issue"}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => void removeReadingIssue(item.id)}
                                  className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                                >
                                  Remove
                                </button>
                              </div>
                              <h4 className="text-sm font-semibold text-foreground">
                                {item.issueTitle}
                              </h4>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {item.issueMeta}
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  go(item.issueTitle)
                                  setReadingListOpen(false)
                                }}
                                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                              >
                                Open issue
                                <ArrowRight className="size-4" />
                              </button>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-border bg-muted/20 px-5 py-8 text-sm text-muted-foreground">
                          No items saved yet.
                        </div>
                      )}
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Subscribers</span>
                          <span>{persistedSubscribers.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reading list</span>
                          <span>{persistedReadingList.length}</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!persistedReadingList.length}
                        className="w-full rounded-full"
                        onClick={() => void clearReadingList()}
                      >
                        Clear reading list
                      </Button>
                      <SheetClose asChild>
                        <Button type="button" className="w-full rounded-full">
                          Continue
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
                        className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-1 text-sm font-semibold text-foreground"
                      >
                        <Avatar
                          size="sm"
                          className="ring-2 ring-background"
                          aria-hidden="true"
                        >
                          {authPicture ? (
                            <AvatarImage src={authPicture} alt={authDisplayName} />
                          ) : null}
                          <AvatarFallback className="bg-foreground text-[0.65rem] font-bold text-background">
                            {authInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden max-w-20 truncate md:block">
                          {authDisplayName}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      sideOffset={8}
                      className="w-64 border-border bg-background p-0 shadow-xl"
                    >
                      <div className="bg-muted/40 px-4 py-3">
                        <p className="text-sm font-bold text-foreground">
                          {authDisplayName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {authEmail ?? "Signed in to this session"}
                        </p>
                      </div>
                      <div className="border-t border-border p-2">
                        <button
                          type="button"
                          onClick={() => go("Account")}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                          Account
                        </button>
                        <button
                          type="button"
                          onClick={() => go("Profile")}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                          Profile
                        </button>
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="mt-2 w-full rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
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
                    className="h-10 rounded-full bg-foreground px-4 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-60"
                  >
                    {authLabel}
                  </button>
                )}
              </div>
              <button
                type="button"
                aria-label="Menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 text-muted-foreground transition-colors hover:text-primary md:hidden"
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
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
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
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false)
                      setReadingListOpen(true)
                    }}
                    className="text-base font-medium text-foreground/90 transition-colors hover:text-foreground text-left"
                  >
                    Reading list
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (isSignedIn) {
                        handleSignOut()
                      } else {
                        handleSignIn()
                      }
                    }}
                    disabled={auth.isLoading}
                    className="text-left text-base font-medium text-foreground/90 transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-60"
                  >
                    {isSignedIn ? "Sign out" : "Sign in"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-muted/40" />
            <div className="absolute right-0 top-0 h-full w-1/2 translate-x-1/4 rounded-l-full bg-primary/5" />

            <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    {heroPill}
                  </div>

                  <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                    {heroTop}
                    <span className="block text-primary">{heroAccent}</span>
                  </h1>

                  <p className="max-w-lg text-xl leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>

                  <form
                    className="max-w-md space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault()
                      void subscribe(heroEmail, heroSubmit, "hero")
                      setHeroEmail("")
                      go(heroSubmit)
                    }}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        type="email"
                        required
                        value={heroEmail}
                        placeholder={heroPlaceholder}
                        onChange={(e) => setHeroEmail(e.target.value)}
                        aria-label="Email address for newsletter subscription"
                        className="flex-1 rounded-xl border-2 border-input bg-background px-5 py-4 text-lg text-foreground placeholder-muted-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-ring/20"
                      />
                      <button
                        type="submit"
                        className="whitespace-nowrap rounded-xl bg-primary px-8 py-4 font-bold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
                      >
                        {heroSubmit}
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">{heroProof}</p>
                  </form>

                  <div className="flex items-center gap-6 pt-4">
                    <div className="flex -space-x-3">
                      {heroAvatars.map((alt) => (
                        <Image
                          key={alt}
                          alt={alt}
                          w={100}
                          h={100}
                          loading="lazy"
                          className="size-12 rounded-full border-2 border-background object-cover"
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-bold text-foreground">
                        {heroRating}
                      </span>{" "}
                      {heroRatingLabel}
                    </div>
                  </div>
                </div>

                {/* Featured-issue preview card */}
                <div className="relative">
                  <div className="absolute inset-0 rotate-3 rounded-3xl bg-primary/20" />
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl shadow-foreground/5">
                    <Image
                      alt={previewImageAlt}
                      w={800}
                      h={500}
                      className="h-64 w-full object-cover"
                    />
                    <div className="space-y-4 p-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="rounded bg-primary/15 px-2 py-1 font-semibold text-primary">
                          {previewBadge}
                        </span>
                        <span>{previewMeta}</span>
                      </div>
                      <h3 className="text-xl font-bold text-foreground">
                        {previewTitle}
                      </h3>
                      <p className="leading-relaxed text-muted-foreground">
                        {previewBlurb}
                      </p>
                      <div className="flex items-center gap-4 pt-2">
                        <span className="text-sm text-muted-foreground">
                          {previewStat1}
                        </span>
                        <span className="size-1 rounded-full bg-muted-foreground/40" />
                        <span className="text-sm text-muted-foreground">
                          {previewStat2}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border bg-muted/40">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-70 md:gap-16">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="text-2xl font-bold text-foreground/70 transition-colors hover:text-foreground"
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-6 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
                  {featuresHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{featuresDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-2xl bg-muted/50 p-8 transition-all hover:scale-[1.02] hover:bg-primary/10"
                  >
                    <div className="mb-6 grid size-14 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                      <span className="block size-7">
                        {featureIcons[i % featureIcons.length]}
                      </span>
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Recent Issues (dark band) */}
          <section className="bg-foreground py-20 text-background lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div>
                  <h2 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl">
                    {issuesHeading}
                  </h2>
                  <p className="text-xl text-background/60">{issuesDesc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => go(issuesViewAll)}
                  className="inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  {issuesViewAll}
                  <ArrowRight className="size-5" />
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {issueItems.map((issue) => (
                  <article
                    key={issue.title}
                    className="group overflow-hidden rounded-2xl bg-background/5 transition-all hover:scale-[1.02] hover:bg-background/10"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        alt={issue.imageAlt}
                        w={600}
                        h={400}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                        {issue.badge}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="mb-2 text-sm text-background/60">
                        {issue.meta}
                      </div>
                      <h3 className="mb-3 text-xl font-bold transition-colors group-hover:text-primary">
                        {issue.title}
                      </h3>
                      <p className="mb-4 leading-relaxed text-background/60">
                        {issue.blurb}
                      </p>
                      <div className="flex items-center justify-between text-sm text-background/50">
                        <span className="flex items-center gap-1">
                          <Heart className="size-4" />
                          {issue.shares}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            void addReadingIssue(
                              issue.title,
                              issue.meta,
                              issue.badge,
                            )
                            setReadingListOpen(true)
                            go(issue.title)
                          }}
                          className="inline-flex items-center gap-1 font-semibold text-primary transition-colors hover:text-primary/80"
                        >
                          {issuesReadLabel}
                          <ArrowRight className="size-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-primary/5 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-6 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-xl text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl bg-card p-8 text-card-foreground shadow-sm"
                  >
                    <div className="mb-4 flex items-center gap-1 text-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-5" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-bold text-foreground">
                          {t.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t.role}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-6 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
                  {pricingHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{pricingDesc}</p>
              </div>

              <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
                {/* Free */}
                <div className="rounded-2xl border-2 border-border bg-muted/50 p-8">
                  <h3 className="mb-2 text-2xl font-bold text-foreground">
                    {freeName}
                  </h3>
                  <p className="mb-6 text-muted-foreground">{freeTagline}</p>
                  <div className="mb-8 text-4xl font-black text-foreground">
                    {freePrice}
                    <span className="text-lg font-normal text-muted-foreground">
                      {freePeriod}
                    </span>
                  </div>
                  <ul className="mb-8 space-y-4">
                    {freeFeatures.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <Check className="size-6 flex-shrink-0 text-primary" />
                        <span className="text-foreground/80">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => go(freeSubmit)}
                    className="w-full rounded-xl border-2 border-input bg-background py-4 font-bold text-foreground transition-all hover:border-primary hover:text-primary"
                  >
                    {freeSubmit}
                  </button>
                </div>

                {/* Premium */}
                <div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-primary-foreground">
                  <div className="absolute right-4 top-4 rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-bold">
                    {premiumBadge}
                  </div>
                  <h3 className="mb-2 text-2xl font-bold">{premiumName}</h3>
                  <p className="mb-6 text-primary-foreground/80">
                    {premiumTagline}
                  </p>
                  <div className="mb-8 text-4xl font-black">
                    {premiumPrice}
                    <span className="text-lg font-normal text-primary-foreground/70">
                      {premiumPeriod}
                    </span>
                  </div>
                  <ul className="mb-8 space-y-4">
                    {premiumFeatures.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <Check className="size-6 flex-shrink-0 text-primary-foreground/80" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => go(premiumSubmit)}
                    className="w-full rounded-xl bg-background py-4 font-bold text-foreground transition-all hover:bg-background/90"
                  >
                    {premiumSubmit}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* CTA (dark) */}
          <section className="bg-foreground py-20 text-background lg:py-28">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-xl text-background/60">
                {ctaDesc}
              </p>
              <form
                className="mx-auto max-w-lg space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  void subscribe(ctaEmail, ctaSubmit, "cta")
                  setCtaEmail("")
                  go(ctaSubmit)
                }}
              >
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    required
                    value={ctaEmail}
                    placeholder={ctaPlaceholder}
                    onChange={(e) => setCtaEmail(e.target.value)}
                    aria-label="Email address for newsletter subscription"
                    className="flex-1 rounded-xl border-2 border-background/20 bg-background/10 px-5 py-4 text-lg text-background placeholder-background/50 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
                  />
                  <button
                    type="submit"
                    className="whitespace-nowrap rounded-xl bg-primary px-8 py-4 font-bold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
                  >
                    {ctaSubmit}
                  </button>
                </div>
                <p className="text-sm text-background/50">{ctaNote}</p>
              </form>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-4">
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={() => go(brand)}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark className="size-8 text-lg" />
                  <span className="text-xl font-bold tracking-tight text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-sm leading-relaxed">{footerTagline}</p>
                <div className="flex gap-4">
                  {(["Twitter", "LinkedIn", "YouTube"] as const).map(
                    (social) => (
                      <button
                        key={social}
                        type="button"
                        aria-label={social}
                        onClick={() => go(social)}
                        className="grid size-10 place-items-center rounded-lg bg-background/10 transition-all hover:bg-primary hover:text-primary-foreground"
                      >
                        {social === "Twitter" ? (
                          <svg
                            className="size-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        ) : social === "LinkedIn" ? (
                          <svg
                            className="size-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
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
                    ),
                  )}
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-bold text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-3">
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

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 md:flex-row">
              <p className="text-sm">
                © {new Date().getFullYear()} {brand}. {footerCopyright}
              </p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="transition-colors hover:text-background"
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
