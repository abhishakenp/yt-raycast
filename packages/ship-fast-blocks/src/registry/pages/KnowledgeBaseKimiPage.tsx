import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * KnowledgeBaseKimiPage — a complete, self-contained help-center / knowledge-base
 * support page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Help Center" design: a calm,
 * light, editorial documentation aesthetic on a neutral surface with rounded
 * cards, soft hover lifts, and a clean type hierarchy. It pairs a centered hero
 * with a big search field + popular-topic chips, an 8-up category grid with
 * icons and article counts, a two-column "popular articles" list beside a
 * sticky sidebar (trending topics + contact links), a 3-up featured-guides
 * gallery with difficulty badges and read-time/step meta, a 4-up stats band, a
 * native accordion FAQ, a contrasting "still need help?" support CTA band, and
 * a five-column footer with product/resource/company links + socials + legal.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. The Kimi stone
 * palette maps onto semantic tokens (surface -> background/muted, cards ->
 * card, dark CTA -> primary, badges -> chart-* / secondary). Every nav item /
 * category / article / guide / chip / contact link / footer link / social /
 * search submit routes through `useNavigate` (never a dead "#"). All content
 * imagery uses the alt-driven <Image> component (never a raw src). Callers
 * supply ONLY content data; rich defaults make it render great with no props.
 */
export const KnowledgeBaseKimiPage = defineComponent({
  name: "KnowledgeBaseKimiPage",
  description:
    "Complete help-center / knowledge-base / support documentation page with a clean, calm, light editorial aesthetic: neutral surface, rounded cards, soft hover lifts and a clear type hierarchy. Includes a centered hero with a large search bar and popular-topic chips, an 8-up category grid (icons + per-category article counts), a two-column popular-articles list with view counts and updated dates beside a sticky sidebar of trending topics and contact links, a 3-up featured-guides gallery with difficulty badges (Beginner/Intermediate/Advanced) plus read-time and step meta, a 4-up stats band (articles, tutorials, readers, self-service rate), a native expand/collapse FAQ accordion, a contrasting 'still need help?' support CTA with live-chat and email-support buttons, and a five-column footer with product/resources/company link lists, social icons and legal links. Use as the ROOT/home of a help center, support portal, knowledge base, docs landing, FAQ hub, or customer self-service site when an article-search-first, browsable, trust-building support experience is wanted. Supply content only — brand, nav, hero, categories, popular articles, guides, stats, FAQ, support CTA, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / help-center name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section: heading, search field, and popular-topic chips. */
    hero: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        searchPlaceholder: z.string().optional(),
        popularLabel: z.string().optional(),
        popular: z.array(z.string()).optional(),
      })
      .optional(),
    /** Browse-by-category grid. */
    categories: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              count: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Popular-articles list + trending/contact sidebar. */
    popular: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              views: z.string(),
              updated: z.string(),
            }),
          )
          .optional(),
        trendingHeading: z.string().optional(),
        trending: z
          .array(z.object({ title: z.string(), change: z.string() }))
          .optional(),
        helpHeading: z.string().optional(),
        helpLinks: z.array(z.string()).optional(),
      })
      .optional(),
    /** Featured step-by-step guides gallery. */
    guides: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              level: z.string(),
              readTime: z.string(),
              steps: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** FAQ accordion. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** "Still need help?" support CTA band. */
    support: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content: tagline, link columns, socials, legal. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
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
    const brand = props.brand ?? "Help Center"
    const nav = props.nav?.length
      ? props.nav
      : ["Categories", "Guides", "FAQ", "Contact"]

    const heroHeading = props.hero?.heading ?? "How can we help you?"
    const heroSub =
      props.hero?.subheading ??
      "Search our knowledge base for answers, browse by topic, or get in touch with our support team."
    const searchPlaceholder =
      props.hero?.searchPlaceholder ??
      "Search articles, guides, and documentation..."
    const popularLabel = props.hero?.popularLabel ?? "Popular:"
    const heroPopular = props.hero?.popular?.length
      ? props.hero.popular
      : ["Getting started", "Account setup", "Billing", "API keys"]

    const categoriesHeading =
      props.categories?.heading ?? "Browse by Category"
    const categoriesDesc =
      props.categories?.description ??
      "Find answers organized by topic, from getting started to advanced features."
    const categoryItems = props.categories?.items?.length
      ? props.categories.items
      : [
          {
            title: "Getting Started",
            description: "Quick setup guides and first steps",
            count: "24 articles",
          },
          {
            title: "Account Management",
            description: "Profiles, settings, and security",
            count: "18 articles",
          },
          {
            title: "Billing & Plans",
            description: "Payments, invoices, and subscriptions",
            count: "15 articles",
          },
          {
            title: "API & Developers",
            description: "Documentation and code examples",
            count: "42 articles",
          },
          {
            title: "Security & Privacy",
            description: "2FA, SSO, and data protection",
            count: "22 articles",
          },
          {
            title: "Integrations",
            description: "Third-party app connections",
            count: "31 articles",
          },
          {
            title: "Troubleshooting",
            description: "Common issues and solutions",
            count: "28 articles",
          },
          {
            title: "Product Updates",
            description: "Release notes and new features",
            count: "56 articles",
          },
        ]

    const popularHeading = props.popular?.heading ?? "Popular Articles"
    const popularDesc =
      props.popular?.description ??
      "The most viewed help articles from the past 30 days."
    const popularViewAll = props.popular?.viewAll ?? "View all 234 articles"
    const popularItems = props.popular?.items?.length
      ? props.popular.items
      : [
          {
            title: "How to set up two-factor authentication (2FA)",
            description:
              "Secure your account with an authenticator app or SMS verification",
            views: "12.4k views",
            updated: "Updated 3 days ago",
          },
          {
            title: "Understanding your monthly invoice and charges",
            description:
              "Breakdown of usage-based pricing, overages, and discounts",
            views: "9.8k views",
            updated: "Updated 1 week ago",
          },
          {
            title: "Getting started with the REST API",
            description:
              "Authentication, rate limits, and your first API request",
            views: "8.2k views",
            updated: "Updated 2 days ago",
          },
          {
            title: "Connecting Slack for team notifications",
            description: "Configure webhooks and customize alert channels",
            views: "7.5k views",
            updated: "Updated 5 days ago",
          },
          {
            title: "Managing team members and permissions",
            description: "Invite users, assign roles, and set access levels",
            views: "6.9k views",
            updated: "Updated 1 day ago",
          },
          {
            title: "How to migrate data from your old platform",
            description: "Step-by-step import guide with CSV templates",
            views: "6.3k views",
            updated: "Updated 2 weeks ago",
          },
        ]
    const trendingHeading = props.popular?.trendingHeading ?? "Trending Topics"
    const trendingItems = props.popular?.trending?.length
      ? props.popular.trending
      : [
          { title: "Webhook configuration errors", change: "+340% this week" },
          { title: "SSO setup with Okta", change: "+215% this week" },
          { title: "Exporting data to PDF", change: "+178% this week" },
          { title: "Custom domain SSL issues", change: "+142% this week" },
          { title: "API rate limit increases", change: "+98% this week" },
        ]
    const helpHeading = props.popular?.helpHeading ?? "Need More Help?"
    const helpLinks = props.popular?.helpLinks?.length
      ? props.popular.helpLinks
      : [
          "Start live chat",
          "Email support",
          "Documentation",
          "Community forum",
        ]

    const guidesHeading = props.guides?.heading ?? "Featured Guides"
    const guidesDesc =
      props.guides?.description ??
      "Step-by-step walkthroughs for common workflows and setups."
    const guidesViewAll = props.guides?.viewAll ?? "View all guides"
    const guideItems = props.guides?.items?.length
      ? props.guides.items
      : [
          {
            title: "Complete Setup Guide for New Teams",
            description:
              "Get your team up and running in under 30 minutes with workspaces, projects, and initial configurations.",
            level: "Beginner",
            readTime: "25 min read",
            steps: "12 steps",
            imageAlt:
              "Modern laptop displaying analytics dashboard with charts on a clean desk",
          },
          {
            title: "Building Custom Reports & Dashboards",
            description:
              "Learn to create, schedule, and share custom reports with filters, grouping, and visualization options.",
            level: "Intermediate",
            readTime: "40 min read",
            steps: "18 steps",
            imageAlt:
              "Data visualization dashboard showing colorful analytics charts and metrics",
          },
          {
            title: "Advanced API Integration Patterns",
            description:
              "Deep dive into webhooks, batch operations, error handling, and building resilient integrations.",
            level: "Advanced",
            readTime: "55 min read",
            steps: "24 steps",
            imageAlt:
              "Software developer writing code on multiple monitors showing programming interfaces",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "234", label: "Help Articles" },
          { value: "48", label: "Video Tutorials" },
          { value: "2.4M", label: "Monthly Readers" },
          { value: "94%", label: "Self-Service Rate" },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqDesc =
      props.faq?.description ??
      "Quick answers to the most common questions we receive."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What plans are available and how much do they cost?",
            answer:
              "We offer three plans: Starter ($9/month), Professional ($29/month), and Enterprise ($99/month). The Starter plan includes core features for individuals, Professional adds team collaboration and advanced analytics, and Enterprise includes dedicated support, custom integrations, and SLA guarantees. All plans start with a 14-day free trial.",
          },
          {
            question: "How do I reset my password or recover my account?",
            answer:
              'On the login page, click "Forgot password" and enter your email address. You\'ll receive a reset link valid for 24 hours. If you no longer have access to your email, contact support with proof of account ownership for manual recovery.',
          },
          {
            question: "Can I cancel my subscription at any time?",
            answer:
              "Yes, you can cancel anytime from your Account Settings under Billing. Your access continues until the end of your current billing period. We also offer a 30-day money-back guarantee for annual plans if you're not satisfied.",
          },
          {
            question: "What browsers and devices are supported?",
            answer:
              "We support Chrome 90+, Firefox 88+, Safari 14+, and Edge 90+ on Windows 10+, macOS 10.15+, and modern Linux distributions. Mobile apps are available for iOS 14+ and Android 10+. Internet Explorer is not supported.",
          },
          {
            question: "How do I contact support for urgent issues?",
            answer:
              "Professional and Enterprise plans have access to priority support via live chat (available 9 AM - 6 PM EST) and email with 4-hour response SLAs. Enterprise customers also receive a dedicated account manager and phone support for critical issues.",
          },
          {
            question: "Is my data secure and where is it stored?",
            answer:
              "Your data is encrypted at rest (AES-256) and in transit (TLS 1.3). We store data in SOC 2 Type II certified data centers in the US (Oregon), EU (Frankfurt), and APAC (Singapore). You can choose your data region during account setup. We never sell your data and comply with GDPR and CCPA.",
          },
        ]

    const supportHeading = props.support?.heading ?? "Still need help?"
    const supportDesc =
      props.support?.description ??
      "Our support team is available Monday through Friday, 9 AM to 6 PM EST. Enterprise customers have 24/7 priority support."
    const supportPrimary = props.support?.primaryCta ?? "Start live chat"
    const supportSecondary = props.support?.secondaryCta ?? "Email support"
    const supportNote =
      props.support?.note ??
      "Average response time: Under 2 hours for email, Instant for live chat"

    const footerTagline =
      props.footer?.tagline ??
      "Comprehensive documentation, guides, and support to help you get the most out of our platform."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Integrations", "API", "Security"],
          },
          {
            title: "Resources",
            links: ["Documentation", "Guides", "Blog", "Community", "Status"],
          },
          {
            title: "Company",
            links: ["About", "Careers", "Contact", "Privacy", "Terms"],
          },
        ]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Twitter", "LinkedIn", "GitHub", "YouTube"]
    const footerCopyright =
      props.footer?.copyright ?? `© ${new Date().getFullYear()} ${brand}. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]

    // Brand logo tile — solid mark with a book glyph (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-primary text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </span>
    )

    const SearchIcon = ({ className }: { className?: string }) => (
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
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="15" y2="15" />
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
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="3" y1="12" x2="19" y2="12" />
        <polyline points="13 6 19 12 13 18" />
      </svg>
    )

    const ChevronRight = ({ className }: { className?: string }) => (
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
        <polyline points="9 5 16 12 9 19" />
      </svg>
    )

    const ChevronDown = ({ className }: { className?: string }) => (
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
        <polyline points="6 9 12 15 18 9" />
      </svg>
    )

    const EyeIcon = () => (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )

    const ClockIcon = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15 14" />
      </svg>
    )

    const ListIcon = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6l6 6v10a2 2 0 0 1-2 2z" />
      </svg>
    )

    const ChatIcon = ({ className }: { className?: string }) => (
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
        <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 9.86 9.86 0 0 1-4.26-.95L3 20l1.4-3.72A8.5 8.5 0 0 1 12 3a8.38 8.38 0 0 1 9 8.5z" />
      </svg>
    )

    const MailIcon = ({ className }: { className?: string }) => (
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
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <polyline points="3 7 12 13 21 7" />
      </svg>
    )

    // Category icons — rotate through token-colored line glyphs.
    const categoryIcons: ReactNode[] = [
      // bolt
      <svg key="bolt" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
      </svg>,
      // user
      <svg key="user" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21a7 7 0 0 1 14 0" />
      </svg>,
      // card
      <svg key="card" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>,
      // code
      <svg key="code" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="6 16 2 12 6 8" />
        <polyline points="18 8 22 12 18 16" />
        <line x1="14" y1="4" x2="10" y2="20" />
      </svg>,
      // shield
      <svg key="shield" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>,
      // puzzle
      <svg key="puzzle" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 4a2 2 0 1 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a2 2 0 1 0 0 4h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-1a2 2 0 1 0-4 0v1a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H4a2 2 0 1 1 0-4h1a1 1 0 0 0 1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 0 1-1V4z" />
      </svg>,
      // wrench
      <svg key="wrench" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15H4a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 5.4 9.5l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 11 4.6V4a2 2 0 1 1 4 0v.09c0 .67.4 1.27 1 1.51" />
      </svg>,
      // doc
      <svg key="doc" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="13" y2="17" />
      </svg>,
    ]

    // Difficulty badge -> token color (Beginner/Intermediate/Advanced).
    const levelTone = (level: string) => {
      const l = level.toLowerCase()
      if (l.includes("begin")) return "bg-chart-2/15 text-chart-2"
      if (l.includes("inter")) return "bg-chart-4/15 text-chart-4"
      if (l.includes("adv")) return "bg-destructive/15 text-destructive"
      return "bg-secondary text-secondary-foreground"
    }

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <nav
            className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2"
              aria-label={`${brand} home`}
            >
              <LogoMark className="size-8" />
              <span className="text-lg font-semibold text-foreground">
                {brand}
              </span>
            </button>
            <div className="hidden items-center gap-8 md:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => go("Search")}
                className="hidden items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent sm:flex"
                aria-label="Search help articles"
              >
                <SearchIcon className="size-4" />
                <span>Search</span>
                <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 text-xs lg:inline-block">
                  ⌘K
                </kbd>
              </button>
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="p-2 text-muted-foreground hover:text-foreground md:hidden"
                aria-label="Open menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="border-b border-border bg-card">
            <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
              <h1 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {heroHeading}
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                {heroSub}
              </p>
              <form
                className="relative mx-auto max-w-2xl"
                onSubmit={(e) => {
                  e.preventDefault()
                  go("Search")
                }}
              >
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
                  <SearchIcon className="size-5" />
                </span>
                <input
                  type="search"
                  placeholder={searchPlaceholder}
                  aria-label="Search help articles"
                  className="w-full rounded-xl border border-input bg-background py-4 pl-12 pr-16 text-base text-foreground placeholder-muted-foreground shadow-sm transition-shadow focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <kbd className="hidden rounded border border-border bg-muted px-2 py-1 text-xs text-muted-foreground sm:inline-block">
                    ⌘K
                  </kbd>
                </span>
              </form>
              <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
                <span className="text-muted-foreground">{popularLabel}</span>
                {heroPopular.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => go(topic)}
                    className="rounded-full bg-muted px-3 py-1 text-secondary-foreground transition-colors hover:bg-accent"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Categories */}
          <section
            className="bg-background py-16 sm:py-20"
            aria-labelledby="kb-categories-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center">
                <h2
                  id="kb-categories-heading"
                  className="mb-3 text-2xl font-semibold text-foreground sm:text-3xl"
                >
                  {categoriesHeading}
                </h2>
                <p className="mx-auto max-w-xl text-muted-foreground">
                  {categoriesDesc}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {categoryItems.map((cat, i) => (
                  <button
                    key={cat.title}
                    type="button"
                    onClick={() => go(cat.title)}
                    className="group rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-primary/30 hover:shadow-md"
                    aria-label={`${cat.title} category, ${cat.count}`}
                  >
                    <div className="mb-4 grid size-12 place-items-center rounded-lg bg-muted text-primary transition-colors group-hover:bg-accent">
                      {categoryIcons[i % categoryIcons.length]}
                    </div>
                    <h3 className="mb-1 text-lg font-semibold text-card-foreground">
                      {cat.title}
                    </h3>
                    <p className="mb-3 text-sm text-muted-foreground">
                      {cat.description}
                    </p>
                    <span className="text-xs font-medium text-muted-foreground">
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Popular articles + sidebar */}
          <section
            className="border-b border-border bg-card py-16 sm:py-20"
            aria-labelledby="kb-popular-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <h2
                    id="kb-popular-heading"
                    className="mb-3 text-2xl font-semibold text-foreground sm:text-3xl"
                  >
                    {popularHeading}
                  </h2>
                  <p className="mb-8 text-muted-foreground">{popularDesc}</p>
                  <div className="space-y-4">
                    {popularItems.map((art) => (
                      <button
                        key={art.title}
                        type="button"
                        onClick={() => go(art.title)}
                        className="group flex w-full items-start gap-4 rounded-lg p-4 text-left transition-colors hover:bg-muted"
                      >
                        <span className="grid size-10 flex-shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-accent">
                          <EyeIcon />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-base font-medium text-foreground transition-colors group-hover:text-muted-foreground">
                            {art.title}
                          </span>
                          <span className="mt-1 block text-sm text-muted-foreground">
                            {art.description}
                          </span>
                          <span className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <EyeIcon />
                              {art.views}
                            </span>
                            <span>{art.updated}</span>
                          </span>
                        </span>
                        <ChevronRight className="size-5 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                      </button>
                    ))}
                  </div>
                  <div className="mt-8">
                    <button
                      type="button"
                      onClick={() => go(popularViewAll)}
                      className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                    >
                      {popularViewAll}
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                </div>

                <aside
                  className="lg:col-span-1"
                  aria-label="Trending topics and support links"
                >
                  <div className="mb-6 rounded-xl bg-muted p-6">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">
                      {trendingHeading}
                    </h3>
                    <div className="space-y-3">
                      {trendingItems.map((t) => (
                        <button
                          key={t.title}
                          type="button"
                          onClick={() => go(t.title)}
                          className="group block w-full text-left"
                        >
                          <span className="block text-sm font-medium text-secondary-foreground transition-colors group-hover:text-foreground">
                            {t.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {t.change}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">
                      {helpHeading}
                    </h3>
                    <ul className="space-y-3">
                      {helpLinks.map((link) => (
                        <li key={link}>
                          <button
                            type="button"
                            onClick={() => go(link)}
                            className="flex items-center gap-3 text-sm text-secondary-foreground transition-colors hover:text-foreground"
                          >
                            <ChatIcon className="size-5 text-muted-foreground" />
                            {link}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </aside>
              </div>
            </div>
          </section>

          {/* Featured guides */}
          <section
            className="bg-background py-16 sm:py-20"
            aria-labelledby="kb-guides-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2
                    id="kb-guides-heading"
                    className="mb-2 text-2xl font-semibold text-foreground sm:text-3xl"
                  >
                    {guidesHeading}
                  </h2>
                  <p className="text-muted-foreground">{guidesDesc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => go(guidesViewAll)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-muted"
                >
                  {guidesViewAll}
                  <ChevronRight className="size-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {guideItems.map((guide) => (
                  <button
                    key={guide.title}
                    type="button"
                    onClick={() => go(guide.title)}
                    className="group block overflow-hidden rounded-xl border border-border bg-card text-left transition-all hover:shadow-lg"
                  >
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <Image
                        alt={guide.imageAlt}
                        w={800}
                        h={450}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute left-3 top-3">
                        <span
                          className={cn(
                            "rounded px-2 py-1 text-xs font-medium",
                            levelTone(guide.level),
                          )}
                        >
                          {guide.level}
                        </span>
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="mb-2 text-lg font-semibold text-card-foreground transition-colors group-hover:text-muted-foreground">
                        {guide.title}
                      </h3>
                      <p className="mb-4 text-sm text-muted-foreground">
                        {guide.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ClockIcon />
                          {guide.readTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <ListIcon />
                          {guide.steps}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section
            className="border-y border-border bg-card py-12 sm:py-16"
            aria-label="Help center statistics"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <div className="mb-1 text-3xl font-semibold text-foreground sm:text-4xl">
                      {s.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section
            className="bg-background py-16 sm:py-20"
            aria-labelledby="kb-faq-heading"
          >
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center">
                <h2
                  id="kb-faq-heading"
                  className="mb-3 text-2xl font-semibold text-foreground sm:text-3xl"
                >
                  {faqHeading}
                </h2>
                <p className="text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group overflow-hidden rounded-xl border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6 transition-colors hover:bg-muted">
                      <span className="pr-8 text-base font-medium text-card-foreground">
                        {item.question}
                      </span>
                      <span className="ml-4 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-180">
                        <ChevronDown className="size-5" />
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-muted-foreground">
                      <p>{item.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Support CTA */}
          <section
            id="kb-support"
            className="bg-primary py-16 text-primary-foreground sm:py-20"
            aria-labelledby="kb-support-heading"
          >
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2
                id="kb-support-heading"
                className="mb-4 text-2xl font-semibold sm:text-3xl"
              >
                {supportHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-primary-foreground/70">
                {supportDesc}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(supportPrimary)}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-foreground px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary-foreground/90"
                >
                  <ChatIcon className="size-5" />
                  {supportPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(supportSecondary)}
                  className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/40 px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                >
                  <MailIcon className="size-5" />
                  {supportSecondary}
                </button>
              </div>
              <div className="mt-12 border-t border-primary-foreground/20 pt-8">
                <p className="text-sm text-primary-foreground/60">
                  {supportNote}
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-background">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
              <div className="col-span-2 lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                  aria-label={`${brand} home`}
                >
                  <LogoMark className="size-8" />
                  <span className="text-lg font-semibold text-foreground">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 max-w-xs text-sm text-muted-foreground">
                  {footerTagline}
                </p>
                <div className="flex items-center gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      onClick={() => go(social)}
                      aria-label={social}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <span className="text-sm font-medium">{social}</span>
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">
                    {col.title}
                  </h4>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-12 border-t border-border pt-8">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-sm text-muted-foreground">
                  {footerCopyright}
                </p>
                <div className="flex items-center gap-6">
                  {footerLegal.map((link) => (
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
        </footer>
      </div>
    )
  },
})
