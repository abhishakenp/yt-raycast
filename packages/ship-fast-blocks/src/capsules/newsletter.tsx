import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { number, string, table } from "@ship-fast/lakebed/server"
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
import { Button } from "#/components/ui/button.tsx"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover.tsx"
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar.tsx"

/**
 * NewsletterKimiPage — a complete, full-stack editorial NEWSLETTER landing /
 * subscription page with persisted state and reading list functionality.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "The Quiet Observer" design: a
 * warm, calm, literary aesthetic with serif display headings, generous
 * whitespace, and a soft paper-like surface. It opens with a centered hero
 * (eyebrow kicker + serif headline + inline email subscribe form + social
 * proof), a 4-up stats strip, a "What You Get" features grid with icons plus a
 * 4-up checklist of perks, reader testimonials (avatars + short pull-quotes),
 * a recent-issues archive grid (cover image, issue number, date, blurb, read
 * link, bookmark functionality), a two-tier pricing comparison (Free vs Paid,
 * each with its own email capture), an FAQ accordion, a dark CTA band with a
 * final subscribe form, and a multi-column footer.
 *
 * Full-stack features powered by Lakebed:
 * - Reading list drawer with bookmark/unbookmark functionality for issues
 * - Google authentication with account menu and profile management
 * - Subscription tracking (free/paid plans) with persisted subscriber data
 * - Dynamic subscriber count in stats strip
 * - Reactive queries for issues, reading list, and subscriber counts
 *
 * The base surface is intentionally light/paper-toned (mapped to background +
 * muted bands) to preserve Kimi's editorial mood; the paid pricing card, CTA
 * band and footer use the inverted foreground/primary surfaces. Every nav item,
 * CTA, read link, footer link, social and form-submit routes through
 * `useNavigate` (never a dead "#"). Content imagery uses the alt-driven
 * <Image> component; avatars are decorative raw <img>. Callers supply ONLY
 * content data; rich defaults make it render great with no props at all.
 */
export const NewsletterKimiPage = defineCapsule({
  name: "NewsletterKimiPage",
  description:
    "Complete full-stack editorial NEWSLETTER landing / email-subscription page with a warm, calm, literary aesthetic: serif display headings, paper-toned surface, generous whitespace. Includes a centered hero (eyebrow kicker, serif headline, inline email signup form, social-proof line), a 4-up subscriber stats strip (dynamic count), a 'What You Get' features grid with icons plus a checklist of perks, reader testimonial cards with avatars and short pull-quotes, a recent-issues archive grid (cover photo, issue number, date, blurb, read-issue link, bookmark functionality, view-all link), a two-tier pricing comparison (Free vs Paid plan, each with its own email capture + feature list), an FAQ accordion, a dark final-CTA subscribe band, and a multi-column footer with social links. Full-stack features: reading list drawer, Google auth, subscription tracking, persisted state. Use as the ROOT/home page for newsletters, email subscriptions, Substack-style publications, blogs, indie writers, essayists, digests, or content creators who want a thoughtful, conversion-focused signup page with archive showcase, social proof and free/paid tiers. Supply content only — brand, nav, hero, stats, features, testimonials, issues, pricing, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / publication name shown in the navbar, CTAs and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        headingTop: z.string().optional(),
        headingBottom: z.string().optional(),
        subheading: z.string().optional(),
        emailPlaceholder: z.string().optional(),
        submit: z.string().optional(),
        proofPrefix: z.string().optional(),
        proofBrands: z.string().optional(),
      })
      .optional(),
    /** Inline subscriber stats strip. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** "What You Get" features section. */
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        perks: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Reader testimonials. */
    testimonials: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              quote: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
        mini: z
          .array(z.object({ quote: z.string(), author: z.string() }))
          .optional(),
      })
      .optional(),
    /** Recent-issues archive grid. */
    issues: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        readLabel: z.string().optional(),
        items: z
          .array(
            z.object({
              number: z.string(),
              date: z.string(),
              title: z.string(),
              blurb: z.string(),
              imageAlt: z.string(),
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
        emailPlaceholder: z.string().optional(),
        free: z
          .object({
            price: z.string().optional(),
            tagline: z.string().optional(),
            submit: z.string().optional(),
            features: z.array(z.string()).optional(),
          })
          .optional(),
        paid: z
          .object({
            badge: z.string().optional(),
            price: z.string().optional(),
            period: z.string().optional(),
            tagline: z.string().optional(),
            submit: z.string().optional(),
            note: z.string().optional(),
            features: z.array(z.string()).optional(),
          })
          .optional(),
        footnotePrefix: z.string().optional(),
        footnoteLink: z.string().optional(),
        footnoteSuffix: z.string().optional(),
      })
      .optional(),
    /** FAQ accordion. */
    faq: z
      .object({
        heading: z.string().optional(),
        items: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Final CTA subscribe band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        emailPlaceholder: z.string().optional(),
        submit: z.string().optional(),
        notePrefix: z.string().optional(),
        noteLink: z.string().optional(),
        noteSuffix: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(
            z.object({ title: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      issues: table({
        number: string(),
        date: string(),
        title: string(),
        blurb: string(),
        imageAlt: string(),
      }),
      readingList: table({
        issueTitle: string(),
      }),
      subscribers: table({
        email: string(),
        plan: string(),
      }),
    },
    queries: {
      issues: ({ db }) => db.issues.orderBy('createdAt').all(),
      readingListTitles: ({ db }) =>
        new Set(db.readingList.all().map((item) => item.issueTitle)),
      subscriberCount: ({ db }) => db.subscribers.all().length,
    },
    mutations: {
      addToReadingList: ({ db }, issueTitle: string) => {
        const existing = db.readingList
          .where('issueTitle', issueTitle)
          .all()[0]
        if (existing) return db.readingList.all()

        db.readingList.insert({ issueTitle })
        return db.readingList.all()
      },
      removeFromReadingList: ({ db }, issueTitle: string) => {
        for (const item of db.readingList.where('issueTitle', issueTitle).all()) {
          db.readingList.delete(item.id)
        }
        return db.readingList.all()
      },
      subscribe: ({ db }, email: string, plan: string) => {
        const existing = db.subscribers.where('email', email).all()[0]
        if (existing) {
          db.subscribers.update(existing.id, { plan })
        } else {
          db.subscribers.insert({ email, plan })
        }
        return db.subscribers.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [readingListOpen, setReadingListOpen] = useState(false)
    const brand = props.brand ?? "The Quiet Observer"

    const storedIssues = lakebed.useQuery('issues')
    const readingListTitles = lakebed.useQuery('readingListTitles')
    const subscriberCount = lakebed.useQuery('subscriberCount')
    const addToReadingList = lakebed.useMutation('addToReadingList')
    const removeFromReadingList = lakebed.useMutation('removeFromReadingList')
    const subscribe = lakebed.useMutation('subscribe')
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
    const nav = props.nav?.length
      ? props.nav
      : ["Recent Issues", "About", "Subscribe"]

    const heroEyebrow = props.hero?.eyebrow ?? "Every Sunday Morning"
    const heroTop = props.hero?.headingTop ?? "Essays that slow down"
    const heroBottom = props.hero?.headingBottom ?? "the conversation"
    const heroSub =
      props.hero?.subheading ??
      "A weekly newsletter exploring the intersection of technology, creativity, and human connection. Join 12,000+ readers who start their Sundays with insight, not noise."
    const heroPlaceholder = props.hero?.emailPlaceholder ?? "your@email.com"
    const heroSubmit = props.hero?.submit ?? "Subscribe Free"
    const heroProofPrefix =
      props.hero?.proofPrefix ??
      "No spam. Unsubscribe anytime. Read by teams at "
    const heroProofBrands =
      props.hero?.proofBrands ?? "Notion, Figma, Stripe, and Vercel"

    const staticStats = props.stats?.length
      ? props.stats
      : [
          { value: "12,400+", label: "Subscribers" },
          { value: "47%", label: "Open Rate" },
          { value: "3 years", label: "Publishing" },
          { value: "156", label: "Issues Sent" },
        ]

    const displayStats =
      typeof subscriberCount === "number"
        ? [
            { value: `${subscriberCount.toLocaleString()}+`, label: "Subscribers" },
            ...staticStats.slice(1),
          ]
        : staticStats

    const featuresHeading = props.features?.heading ?? "What You Get"
    const featuresDesc =
      props.features?.description ??
      "Every issue is crafted with care. Here's what lands in your inbox each Sunday."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "One Deep Essay",
            description:
              "A 1,500-2,000 word essay exploring a single topic with nuance. No listicles. No clickbait. Just thoughtful analysis on technology's impact on our lives.",
          },
          {
            title: "Curated Links",
            description:
              "Five carefully selected articles, books, and podcasts that informed my thinking this week. Each with a personal note on why it matters.",
          },
          {
            title: "Community Replies",
            description:
              "Every email is a conversation. Reply directly and I'll respond. The best reader insights get featured (anonymously) in the next issue.",
          },
        ]
    const featurePerks = props.features?.perks?.length
      ? props.features.perks
      : [
          { title: "Archive Access", description: "All 156 past issues" },
          { title: "Audio Versions", description: "Listen on the go" },
          { title: "No Ads", description: "Reader-supported only" },
          { title: "Private Discord", description: "Join the conversation" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "What Readers Say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Join thousands of readers who make The Quiet Observer part of their Sunday ritual."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            name: "Sarah Chen",
            role: "Product Lead, Notion",
            quote:
              "The only newsletter I read start to finish every week. Sarah has this rare ability to find the signal in the noise of tech discourse.",
            avatarAlt:
              "professional headshot of a smiling woman with shoulder-length dark hair",
          },
          {
            name: "Marcus Rivera",
            role: "Engineering Manager, Stripe",
            quote:
              "I've been reading since issue #12. It's become essential context for my work—thoughtful, well-researched, and genuinely original.",
            avatarAlt:
              "professional headshot of a smiling man with short dark hair and glasses",
          },
          {
            name: "Emily Watson",
            role: "Design Director, Figma",
            quote:
              "Every Sunday, this is my first read with coffee. It's thoughtful, human, and consistently surfaces ideas that stay with me all week.",
            avatarAlt:
              "professional headshot of a woman with blonde hair pulled back wearing minimal jewelry",
          },
        ]
    const testimonialMini = props.testimonials?.mini?.length
      ? props.testimonials.mini
      : [
          { quote: "My favorite read", author: "David Park, Vercel" },
          { quote: "Essential context", author: "Lisa Thompson, Linear" },
          { quote: "Worth every minute", author: "James Chen, GitHub" },
          { quote: "Brilliant analysis", author: "Maria Garcia, Apple" },
        ]

    const issuesHeading = props.issues?.heading ?? "Recent Issues"
    const issuesDesc =
      props.issues?.description ??
      "A selection of our most-read essays from the past few months."
    const issuesViewAll = props.issues?.viewAll ?? "View All 156 Issues"
    const issuesReadLabel = props.issues?.readLabel ?? "Read issue"
    const staticIssueItems = props.issues?.items?.length
      ? props.issues.items
      : [
          {
            number: "Issue #" + "156",
            date: "May 25, 2026",
            title: "The Art of Digital Slowing",
            blurb:
              "On the paradox of building tools for focus in an age of infinite distraction—and why the answer might not be another app.",
            imageAlt:
              "minimal workspace desk with open notebook, coffee cup, and soft natural morning light",
          },
          {
            number: "Issue #" + "155",
            date: "May 18, 2026",
            title: "When AI Writes the Code",
            blurb:
              "What happens to craft when the tools get too good? A meditation on writing, coding, and the value of struggle.",
            imageAlt:
              "futuristic humanoid robot arm reaching toward glowing light representing AI and human interaction",
          },
          {
            number: "Issue #" + "154",
            date: "May 11, 2026",
            title: "The Remote Work Bet",
            blurb:
              "Five years in, the data is finally clear. What we got right, what we lost, and where we're headed next.",
            imageAlt:
              "diverse group of colleagues collaborating around a table with laptops in a modern office space",
          },
          {
            number: "Issue #" + "153",
            date: "May 4, 2026",
            title: "Writing as Thinking",
            blurb:
              "The lost art of using prose to clarify thought. Why the best product minds I know are obsessive note-takers.",
            imageAlt:
              "vintage typewriter with blank page representing the craft of thoughtful writing",
          },
          {
            number: "Issue #" + "152",
            date: "April 27, 2026",
            title: "Privacy After the Breach",
            blurb:
              "A personal account of having my data leaked—and the broader implications for how we build trust online.",
            imageAlt:
              "cybersecurity concept with digital lock and binary code overlay on dark background",
          },
          {
            number: "Issue #" + "151",
            date: "April 20, 2026",
            title: "The Cult of Productivity",
            blurb:
              "Why optimizing every moment might be making us miserable. A case for intentional inefficiency.",
            imageAlt:
              "serene mountain landscape at golden hour representing the search for meaning and perspective",
          },
        ]

    const displayIssues =
      storedIssues && storedIssues.length > 0
        ? storedIssues
        : staticIssueItems

    const pricingHeading = props.pricing?.heading ?? "Choose Your Experience"
    const pricingDesc =
      props.pricing?.description ??
      "Free to start. Upgrade when you're ready for more."
    const pricingPlaceholder =
      props.pricing?.emailPlaceholder ?? "your@email.com"
    const freePrice = props.pricing?.free?.price ?? "Free"
    const freeTagline =
      props.pricing?.free?.tagline ?? "Perfect for getting started"
    const freeSubmit = props.pricing?.free?.submit ?? "Subscribe Free"
    const freeFeatures = props.pricing?.free?.features?.length
      ? props.pricing.free.features
      : [
          "Weekly essay in your inbox",
          "Access to 3 months of archives",
          "Reply to any issue",
        ]
    const paidBadge = props.pricing?.paid?.badge ?? "Most Popular"
    const paidPrice = props.pricing?.paid?.price ?? "$8"
    const paidPeriod = props.pricing?.paid?.period ?? "/month"
    const paidTagline =
      props.pricing?.paid?.tagline ?? "For the dedicated reader"
    const paidSubmit = props.pricing?.paid?.submit ?? "Upgrade — $8/month"
    const paidNote =
      props.pricing?.paid?.note ?? "Annual billing saves 20% ($76/year)"
    const paidFeatures = props.pricing?.paid?.features?.length
      ? props.pricing.paid.features
      : [
          "Everything in Free",
          "Complete archive (156 issues)",
          "Audio versions (podcast feed)",
          "Private Discord community",
          "Monthly AMA sessions",
          "Support independent writing",
        ]
    const pricingFootnotePrefix =
      props.pricing?.footnotePrefix ?? "Need a team subscription? "
    const pricingFootnoteLink = props.pricing?.footnoteLink ?? "Contact us"
    const pricingFootnoteSuffix =
      props.pricing?.footnoteSuffix ?? " for enterprise pricing."

    const faqHeading = props.faq?.heading ?? "Questions & Answers"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "How often do you publish?",
            a: "Every Sunday morning, usually around 8 AM EST. Occasionally I'll send a mid-week issue if there's breaking news worth addressing, but I stick to the weekly schedule to respect your inbox.",
          },
          {
            q: "Can I access past issues?",
            a: "Free subscribers get access to the last 3 months of issues. Paid subscribers can browse the complete archive—all 156 issues since we started in 2023. Every issue is tagged and searchable.",
          },
          {
            q: "Do you offer refunds?",
            a: "Yes. If you're not satisfied with your paid subscription, contact me within 30 days for a full refund—no questions asked. After 30 days, you can cancel anytime and keep access until your billing period ends.",
          },
          {
            q: "Who writes this newsletter?",
            a: "Hi, I'm Sarah Mitchell. I'm a former product manager at Stripe who left to write full-time. I've been publishing The Quiet Observer since 2023, and I'm based in Brooklyn, New York.",
          },
          {
            q: "How do team subscriptions work?",
            a: "Team subscriptions give everyone at your company access to paid features, including the full archive, audio versions, and our private Discord. Pricing starts at $50/month for up to 10 team members. Get in touch for larger teams.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Start your Sunday with insight"
    const ctaDesc =
      props.cta?.description ??
      "Join 12,000+ readers who make The Quiet Observer part of their weekend ritual. No spam. Unsubscribe anytime."
    const ctaPlaceholder = props.cta?.emailPlaceholder ?? "your@email.com"
    const ctaSubmit = props.cta?.submit ?? "Subscribe Free"
    const ctaNotePrefix = props.cta?.notePrefix ?? "Or "
    const ctaNoteLink = props.cta?.noteLink ?? "upgrade to paid"
    const ctaNoteSuffix = props.cta?.noteSuffix ?? " for the full experience."

    const footerTagline =
      props.footer?.tagline ??
      "Thoughtful essays on technology, creativity, and human connection. Written by Sarah Mitchell in Brooklyn, NY."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Newsletter",
            links: ["Recent Issues", "Archive", "Audio Feed", "Subscribe"],
          },
          {
            title: "Connect",
            links: ["About", "Discord", "Contact", "Sponsor"],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ?? "All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy", "Terms"]

    // Brand logo tile — initial mark (decorative brand asset).
    const LogoMark = ({
      className,
      tone = "primary",
    }: {
      className?: string
      tone?: "primary" | "muted"
    }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg font-serif font-medium",
          tone === "primary"
            ? "bg-foreground text-background"
            : "bg-muted-foreground/30 text-background",
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
        width="20"
        height="20"
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
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const ChevronDown = () => (
      <svg
        className="size-5 text-muted-foreground transition-transform group-open:rotate-180"
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

    const BookmarkIcon = ({ active = false }: { active?: boolean }) => (
      <svg
        className={cn('size-5', active ? 'text-primary' : 'text-foreground')}
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

    const featureIcons = [
      // book
      <svg
        key="book"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>,
      // links / list
      <svg
        key="links"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>,
      // chat
      <svg
        key="chat"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>,
    ]

    const heroInputCls =
      "flex-1 rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(brand)}
                className="group flex items-center gap-2"
              >
                <LogoMark className="size-8 text-lg" />
                <span className="font-serif text-xl font-medium tracking-tight text-foreground">
                  {brand}
                </span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.slice(0, -1).map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => go(nav[nav.length - 1])}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground"
                >
                  {nav[nav.length - 1]}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <Sheet open={readingListOpen} onOpenChange={setReadingListOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="Reading list"
                      className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <BookmarkIcon />
                      {readingListTitles && readingListTitles.size > 0 ? (
                        <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                          {readingListTitles.size}
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
                        {readingListTitles && readingListTitles.size > 0
                          ? `${readingListTitles.size} issue${readingListTitles.size === 1 ? '' : 's'} saved`
                          : 'Your reading list is empty'}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {readingListTitles && readingListTitles.size > 0 ? (
                        <div className="space-y-4">
                          {displayIssues
                            .filter((issue) => readingListTitles.has(issue.title))
                            .map((issue) => (
                              <div
                                key={issue.title}
                                className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-4 last:border-0"
                              >
                                <div className="aspect-[16/10] overflow-hidden rounded-lg bg-muted">
                                  <Image
                                    alt={issue.imageAlt}
                                    w={180}
                                    h={112}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    {issue.number}
                                  </p>
                                  <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-foreground">
                                    {issue.title}
                                  </h3>
                                  <p className="text-xs text-muted-foreground">
                                    {issue.date}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                          <p className="text-base font-semibold text-foreground">
                            No saved issues
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Bookmark issues from the archive to build your
                            reading list.
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
                          <ArrowRight className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => go('Subscription')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Subscription
                          <ArrowRight className="size-4" />
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
                  aria-label="Menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v: boolean) => !v)}
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
                      strokeWidth="1.5"
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
          </div>
        </header>

        <main>
          {/* Hero */}
          <section className="pb-12 pt-16 md:pb-16 md:pt-24 lg:pb-24 lg:pt-32">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  {heroEyebrow}
                </p>
                <h1 className="mb-6 font-serif text-4xl font-medium leading-tight text-foreground sm:text-5xl lg:text-6xl">
                  {heroTop}
                  <br className="hidden sm:block" /> {heroBottom}
                </h1>
                <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  {heroSub}
                </p>

                <form
                  className="mx-auto mb-6 max-w-md"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const form = e.currentTarget
                    const email = form.querySelector('input[type="email"]') as HTMLInputElement
                    if (email?.value) {
                      void subscribe(email.value, 'free')
                      go(heroSubmit)
                    }
                  }}
                >
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="email"
                      required
                      placeholder={heroPlaceholder}
                      aria-label="Email address for newsletter subscription"
                      className={heroInputCls}
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-foreground px-6 py-3 font-medium text-background transition-colors hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      {heroSubmit}
                    </button>
                  </div>
                </form>

                <p className="text-sm text-muted-foreground">
                  {heroProofPrefix}
                  <span className="font-medium text-foreground">
                    {heroProofBrands}
                  </span>
                  .
                </p>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="border-t border-border bg-muted/40">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4 md:py-16">
                {displayStats.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="mb-1 font-serif text-3xl font-medium text-foreground md:text-4xl">
                      {s.value}
                    </p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-16 md:py-24 lg:py-32">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center md:mb-20">
                <h2 className="mb-4 font-serif text-3xl font-medium text-foreground sm:text-4xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {featureItems.map((item, i) => (
                  <div key={item.title} className="group">
                    <div className="mb-5 grid size-12 place-items-center rounded-xl bg-muted text-foreground transition-colors group-hover:bg-accent">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-3 font-serif text-xl font-medium text-foreground">
                      {item.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-16 border-t border-border pt-16 md:mt-20 md:pt-20">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {featurePerks.map((perk) => (
                    <div key={perk.title} className="flex items-start gap-3">
                      <span className="mt-0.5 grid size-5 flex-shrink-0 place-items-center rounded-full bg-muted text-foreground">
                        <Check className="size-3" />
                      </span>
                      <div>
                        <p className="font-medium text-foreground">
                          {perk.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {perk.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="border-y border-border bg-muted/40 py-16 md:py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
                <h2 className="mb-4 font-serif text-3xl font-medium text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl bg-card p-6 text-card-foreground md:p-8"
                  >
                    <div className="mb-4 flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </div>
                    <p className="italic leading-relaxed text-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 text-center sm:grid-cols-2 lg:grid-cols-4">
                {testimonialMini.map((m) => (
                  <div key={m.author} className="p-4">
                    <p className="mb-1 font-serif text-xl font-medium text-foreground">
                      &ldquo;{m.quote}&rdquo;
                    </p>
                    <p className="text-sm text-muted-foreground">
                      — {m.author}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Recent Issues */}
          <section className="py-16 md:py-24 lg:py-32">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
                <h2 className="mb-4 font-serif text-3xl font-medium text-foreground sm:text-4xl">
                  {issuesHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{issuesDesc}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {displayIssues.map((issue) => {
                  const isBookmarked =
                    readingListTitles?.has(issue.title) ?? false

                  return (
                    <article
                      key={issue.number}
                      className="group overflow-hidden rounded-2xl border border-border bg-card text-card-foreground transition-colors hover:border-muted-foreground/40"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          alt={issue.imageAlt}
                          w={600}
                          h={375}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (isBookmarked) {
                              void removeFromReadingList(issue.title)
                            } else {
                              void addToReadingList(issue.title)
                            }
                          }}
                          aria-pressed={isBookmarked}
                          aria-label={
                            isBookmarked
                              ? `Remove ${issue.title} from reading list`
                              : `Add ${issue.title} to reading list`
                          }
                          className={cn(
                            'absolute bottom-3 right-3 grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105',
                            isBookmarked
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-background/90 text-foreground',
                          )}
                        >
                          <BookmarkIcon active={isBookmarked} />
                        </button>
                      </div>
                      <div className="p-6">
                        <div className="mb-3 flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{issue.number}</span>
                          <span className="size-1 rounded-full bg-muted-foreground/50" />
                          <span>{issue.date}</span>
                        </div>
                        <h3 className="mb-2 font-serif text-xl font-medium text-foreground transition-colors group-hover:text-foreground/70">
                          {issue.title}
                        </h3>
                        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                          {issue.blurb}
                        </p>
                        <button
                          type="button"
                          onClick={() => go(issue.title)}
                          className="inline-flex items-center text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                        >
                          {issuesReadLabel}
                          <ArrowRight className="ml-1 size-4" />
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>

              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(issuesViewAll)}
                  className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 font-medium text-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  {issuesViewAll}
                  <ArrowRight className="ml-2 size-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="border-y border-border bg-muted/40 py-16 md:py-24 lg:py-32">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
                <h2 className="mb-4 font-serif text-3xl font-medium text-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>

              <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
                {/* Free Plan */}
                <div className="rounded-2xl border border-border bg-card p-8 text-card-foreground lg:p-10">
                  <div className="mb-2 flex items-baseline gap-1">
                    <span className="font-serif text-4xl font-medium text-foreground">
                      {freePrice}
                    </span>
                  </div>
                  <p className="mb-6 text-muted-foreground">{freeTagline}</p>

                  <ul className="mb-8 space-y-4">
                    {freeFeatures.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <Check className="mt-0.5 size-5 flex-shrink-0 text-muted-foreground" />
                        <span className="text-foreground/80">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <form
                    className="space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault()
                      const form = e.currentTarget
                      const email = form.querySelector('input[type="email"]') as HTMLInputElement
                      if (email?.value) {
                        void subscribe(email.value, 'free')
                        go(freeSubmit)
                      }
                    }}
                  >
                    <input
                      type="email"
                      required
                      placeholder={pricingPlaceholder}
                      aria-label="Email address for free subscription"
                      className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-foreground px-6 py-3 font-medium text-background transition-colors hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      {freeSubmit}
                    </button>
                  </form>
                </div>

                {/* Paid Plan */}
                <div className="relative overflow-hidden rounded-2xl bg-foreground p-8 text-background lg:p-10">
                  <div className="absolute right-4 top-4">
                    <span className="inline-flex items-center rounded-full bg-background/20 px-3 py-1 text-xs font-medium text-background">
                      {paidBadge}
                    </span>
                  </div>

                  <div className="mb-2 flex items-baseline gap-1">
                    <span className="font-serif text-4xl font-medium text-background">
                      {paidPrice}
                    </span>
                    <span className="text-background/60">{paidPeriod}</span>
                  </div>
                  <p className="mb-6 text-background/70">{paidTagline}</p>

                  <ul className="mb-8 space-y-4">
                    {paidFeatures.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <Check className="mt-0.5 size-5 flex-shrink-0 text-background/60" />
                        <span className="text-background/80">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <form
                    className="space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault()
                      const form = e.currentTarget
                      const email = form.querySelector('input[type="email"]') as HTMLInputElement
                      if (email?.value) {
                        void subscribe(email.value, 'paid')
                        go(paidSubmit)
                      }
                    }}
                  >
                    <input
                      type="email"
                      required
                      placeholder={pricingPlaceholder}
                      aria-label="Email address for paid subscription"
                      className="w-full rounded-lg border border-background/20 bg-background/10 px-4 py-3 text-background placeholder-background/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-background"
                    />
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-background/90 focus:outline-none focus:ring-2 focus:ring-background focus:ring-offset-2"
                    >
                      {paidSubmit}
                    </button>
                  </form>

                  <p className="mt-4 text-center text-sm text-background/60">
                    {paidNote}
                  </p>
                </div>
              </div>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                {pricingFootnotePrefix}
                <button
                  type="button"
                  onClick={() => go(pricingFootnoteLink)}
                  className="text-foreground underline hover:no-underline"
                >
                  {pricingFootnoteLink}
                </button>
                {pricingFootnoteSuffix}
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-16 md:py-24 lg:py-32">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center md:mb-16">
                <h2 className="mb-4 font-serif text-3xl font-medium text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
              </div>

              <div className="space-y-6">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group overflow-hidden rounded-xl border border-border bg-card text-card-foreground"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="font-medium text-foreground">
                        {item.q}
                      </span>
                      <span className="flex size-5 flex-shrink-0 items-center justify-center">
                        <ChevronDown />
                      </span>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-foreground py-16 md:py-24">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-4 font-serif text-3xl font-medium text-background sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-background/70">
                {ctaDesc}
              </p>

              <form
                className="mx-auto max-w-md"
                onSubmit={(e) => {
                  e.preventDefault()
                  const form = e.currentTarget
                  const email = form.querySelector('input[type="email"]') as HTMLInputElement
                  if (email?.value) {
                    void subscribe(email.value, 'free')
                    go(ctaSubmit)
                  }
                }}
              >
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    required
                    placeholder={ctaPlaceholder}
                    aria-label="Email address for newsletter subscription"
                    className="flex-1 rounded-lg border border-background/20 bg-background/10 px-4 py-3 text-background placeholder-background/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-background"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-background/90 focus:outline-none focus:ring-2 focus:ring-background focus:ring-offset-2"
                  >
                    {ctaSubmit}
                  </button>
                </div>
              </form>

              <p className="mt-6 text-sm text-background/60">
                {ctaNotePrefix}
                <button
                  type="button"
                  onClick={() => go(ctaNoteLink)}
                  className="text-background/80 underline hover:no-underline"
                >
                  {ctaNoteLink}
                </button>
                {ctaNoteSuffix}
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-12 text-background/60 md:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-8 md:grid-cols-4 md:gap-12">
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={() => go(brand)}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark tone="muted" className="size-8 text-lg" />
                  <span className="font-serif text-xl font-medium tracking-tight text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-sm text-sm leading-relaxed">
                  {footerTagline}
                </p>
                <div className="flex gap-4">
                  {(["Twitter", "RSS Feed"] as const).map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-lg bg-background/10 text-background transition-colors hover:bg-background/20"
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
                      ) : (
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
                            strokeWidth="1.5"
                            d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z"
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-medium text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-3 text-sm">
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

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 sm:flex-row">
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
