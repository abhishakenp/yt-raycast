import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * KnowledgeBaseKimiPage2 — a bold, gradient-forward help-center / knowledge-base
 * support page (variant 2).
 *
 * A token-compliant, faithful Tailwind v4 port of a Kimi-generated "Help Center"
 * design: a vibrant, energetic knowledge base with a diagonal multi-tone hero
 * gradient, translucent trending chips, an overlapping stats band, icon-driven
 * topic cards in a 3-up grid (with color-coded glyphs), a 4-up category browse
 * grid with image thumbnails and dark overlays, 3-up testimonial cards with
 * headshots, native expand/collapse FAQ accordions, a dark support CTA band with
 * decorative blurs, and a five-column footer with social icons.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. Every nav item,
 * category, topic card, FAQ, contact link, footer link, social, and search
 * submit routes through `useNavigate` (never a dead "#"). All content imagery
 * uses the alt-driven <Image> component. Callers supply ONLY content data; rich
 * defaults make it render great with no props.
 *
 * Use this as the ROOT of a help center when a bolder, more playful, gradient-rich
 * knowledge-base landing is wanted. Its sibling KnowledgeBaseKimiPage offers a
 * calmer, editorial, neutral-surface alternative; KnowledgeBaseKimiPage2 leans
 * vivid, warm, and action-oriented.
 */
export const KnowledgeBaseKimiPage2 = defineCapsule({
  name: "KnowledgeBaseKimiPage2",
  description:
    "Bold, gradient-forward help-center / knowledge-base / support documentation page (variant 2). Features a vibrant diagonal multi-tone hero gradient with translucent trending chips, an overlapping stats band, a 3-up color-coded topic-card grid, an 8-up image-driven category browse grid with dark overlays, a 3-up testimonial card wall with headshots, native FAQ accordions, a dark support CTA band with decorative blurred orbs, and a full five-column footer with social icons. A vivid, energetic sibling to KnowledgeBaseKimiPage — choose this when a bolder, warmer, more action-oriented knowledge-base landing experience is needed, such as product docs, API reference hubs, or support portals that benefit from visual punch and strong search-first orientation.",
  props: z.object({
    /** Brand / help-center name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section: heading, subheading, search field, and trending chips. */
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        searchPlaceholder: z.string().optional(),
        searchCta: z.string().optional(),
        trendingLabel: z.string().optional(),
        trending: z.array(z.string()).optional(),
      })
      .optional(),
    /** Stats band (overlapping hero). */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Popular topics card grid. */
    topics: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              count: z.string(),
              updated: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Browse-by-category image grid. */
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
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Testimonials wall. */
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
              imageAlt: z.string(),
            }),
          )
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
    /** "Still stuck?" support CTA band. */
    cta: z
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
    const brand = props.brand ?? "StreamLine"
    const nav = props.nav?.length
      ? props.nav
      : ["Popular Topics", "Categories", "FAQ", "Contact"]

    const heroBadge =
      props.hero?.badge ?? "New: Q2 2026 Performance Handbook is live"
    const heroHeading =
      props.hero?.heading ?? "How can we help you today?"
    const heroSub =
      props.hero?.subheading ??
      "Search 500+ guides, API references, tutorials, and troubleshooting articles built for teams shipping fast."
    const searchPlaceholder =
      props.hero?.searchPlaceholder ??
      "e.g. Billing, SAML setup, Webhooks, API rate limits…"
    const searchCta = props.hero?.searchCta ?? "Search"
    const trendingLabel = props.hero?.trendingLabel ?? "Trending:"
    const heroTrending = props.hero?.trending?.length
      ? props.hero.trending
      : ["SSO configuration", "Webhooks", "GDPR export", "Migrating from v1"]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "500+", label: "Help articles" },
          { value: "24/7", label: "Expert support" },
          { value: "<2m", label: "Avg. response" },
          { value: "99.9%", label: "Uptime SLA" },
        ]

    const topicsHeading = props.topics?.heading ?? "Popular topics"
    const topicsDesc =
      props.topics?.description ??
      "The most visited articles this week — from onboarding to advanced automation."
    const topicsViewAll = props.topics?.viewAll ?? "Browse all articles"
    const topicItems = props.topics?.items?.length
      ? props.topics.items
      : [
          {
            title: "Single Sign-On (SSO)",
            description:
              "Configure SAML 2.0 and OIDC with Okta, Azure AD, Google Workspace, and JumpCloud. Includes attribute mapping and JIT provisioning.",
            count: "12 articles",
            updated: "Updated 2 days ago",
          },
          {
            title: "API Rate Limits",
            description:
              "Understand tiered limits, burst buckets, and retry headers. Best practices for backoff strategies and error handling.",
            count: "8 articles",
            updated: "Updated 1 week ago",
          },
          {
            title: "Billing & Invoicing",
            description:
              "Manage seats, change plans, set up ACH or wire transfer, review usage metering, and reconcile invoices.",
            count: "15 articles",
            updated: "Updated today",
          },
          {
            title: "Workspace Settings",
            description:
              "Invite members, set roles and permissions, audit logs, custom domains, and security policies.",
            count: "22 articles",
            updated: "Updated 3 days ago",
          },
          {
            title: "Webhooks & Events",
            description:
              "Subscribe to event streams, verify signatures, replay deliveries, and troubleshoot failed hooks with delivery logs.",
            count: "9 articles",
            updated: "Updated 5 days ago",
          },
          {
            title: "Compliance & Legal",
            description:
              "GDPR data exports, DPA signing, SOC 2 reports, HIPAA readiness checklist, and penetration test summaries.",
            count: "11 articles",
            updated: "Updated 2 weeks ago",
          },
        ]

    const categoryIcons = [
      // user
      <svg key="user" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>,
      // lightning
      <svg key="bolt" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      // card
      <svg key="card" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>,
      // settings
      <svg key="settings" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>,
      // bell
      <svg key="bell" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>,
      // document
      <svg key="doc" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>,
    ]

    const topicTones = [
      { bg: "bg-primary/10", text: "text-primary" },
      { bg: "bg-secondary/10", text: "text-secondary" },
      { bg: "bg-accent/10", text: "text-accent" },
      { bg: "bg-chart-1/10", text: "text-chart-1" },
      { bg: "bg-destructive/10", text: "text-destructive" },
      { bg: "bg-chart-3/10", text: "text-chart-3" },
    ]

    const categoriesHeading =
      props.categories?.heading ?? "Browse by category"
    const categoriesDesc =
      props.categories?.description ??
      "Dive into curated collections organized by product area, skill level, and use case."
    const categoryItems = props.categories?.items?.length
      ? props.categories.items
      : [
          {
            title: "Getting Started",
            description:
              "Onboarding checklists, first-project tutorials, and quick-start templates for new teams.",
            count: "24 articles",
            imageAlt:
              "Close-up of hands typing on a laptop keyboard on a bright desk",
          },
          {
            title: "Analytics & Reporting",
            description:
              "Build dashboards, schedule exports, and connect to BI tools like Tableau and Looker.",
            count: "31 articles",
            imageAlt:
              "Data dashboard displayed on a large monitor with charts and graphs",
          },
          {
            title: "Collaboration",
            description:
              "Real-time editing, comments, mentions, and permission models for distributed teams.",
            count: "19 articles",
            imageAlt:
              "Team members collaborating over laptops in a modern open office",
          },
          {
            title: "Developer Tools",
            description:
              "CLI reference, SDKs, CI/CD plugins, Git integrations, and environment management.",
            count: "42 articles",
            imageAlt: "Lines of code on a screen with syntax highlighting",
          },
          {
            title: "Security",
            description:
              "2FA, session policies, IP allowlisting, encryption at rest, and vulnerability disclosure.",
            count: "28 articles",
            imageAlt:
              "Smartphone displaying security lock icon on a clean minimal desk",
          },
          {
            title: "Account Management",
            description:
              "Profile settings, team hierarchies, seat transfers, offboarding, and audit reports.",
            count: "16 articles",
            imageAlt:
              "Smiling customer support professional wearing a headset at a workstation",
          },
          {
            title: "Mobile App",
            description:
              "iOS and Android guides, offline mode, push notifications, and biometric unlock.",
            count: "13 articles",
            imageAlt:
              "Close-up of a person holding a smartphone using a mobile app",
          },
          {
            title: "Integrations",
            description:
              "Zapier, Slack, Salesforce, Jira, GitHub Actions, and custom outbound webhooks.",
            count: "36 articles",
            imageAlt: "Robotic arm in a modern automation factory",
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by support teams"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See why operations, engineering, and customer-success leaders rely on our docs daily."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              'We cut onboarding time by 40% after pointing new hires to the Getting Started hub. The search actually understands acronyms.',
            name: "Priya Sharma",
            role: "Head of Customer Ops — Novi Finance",
            imageAlt:
              "Professional headshot of a smiling marketing director with short hair",
          },
          {
            quote:
              '"The SSO docs saved us a full sprint. Attribute mapping was clearly illustrated and the troubleshooting checklist actually worked."',
            name: "Liam O'Brien",
            role: "Senior Platform Engineer — Relay Systems",
            imageAlt:
              "Professional headshot of a bearded senior engineer in a plaid shirt",
          },
          {
            quote:
              '"I send billing questions straight to the knowledge base now. Ticket volume dropped and our CSAT jumped to 94%."',
            name: "Ana Torres",
            role: "Support Manager — CloudPeak",
            imageAlt:
              "Professional headshot of a smiling support manager wearing glasses",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ??
      "Quick answers to common questions. Can't find what you need? Talk to our team below."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How do I upgrade or downgrade my plan?",
            answer:
              "Go to Billing → Plans in your workspace settings. You can preview pricing and feature changes before confirming. Downgrades take effect at the end of your current billing cycle. If you downgrade from Business to Starter, seats over the new limit will be archived.",
          },
          {
            question: "Is there a free trial?",
            answer:
              "Yes — every new workspace gets a 14-day trial on the Business plan with full API access and up to 25 seats. No credit card required. At the end of the trial, choose Starter (free, 3 seats), Growth ($29/seat/mo), or Business ($59/seat/mo).",
          },
          {
            question: "What compliance certifications do you hold?",
            answer:
              "StreamLine is SOC 2 Type II certified, GDPR-ready, and HIPAA-eligible for Business plan workspaces. You can request our latest penetration-test summary and signed DPA from your account settings under Compliance.",
          },
          {
            question: "How does billing work for annual plans?",
            answer:
              "Annual plans are billed upfront at a 17% discount versus monthly. You can add or remove seats anytime; true-up invoices are sent monthly for additional seats. Downgrades are prorated as account credit.",
          },
          {
            question: "Can I export my data?",
            answer:
              "Yes. Workspace admins can export projects, comments, attachments, and audit logs as structured JSON or CSV. For GDPR-related exports, use the Privacy → Data export workflow; reports are typically ready within 15 minutes.",
          },
          {
            question: "Do you offer onboarding and training?",
            answer:
              "Growth and Business plans include a dedicated onboarding specialist and live workshops. Enterprise customers also get a custom success plan, quarterly business reviews, and private training sessions for up to 200 attendees.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Still stuck? We're here."
    const ctaDesc =
      props.cta?.description ??
      "Our support engineers answer in under two minutes on average. No bots, no queues — just real humans who know the product."
    const ctaPrimary = props.cta?.primaryCta ?? "Email support"
    const ctaSecondary = props.cta?.secondaryCta ?? "Start live chat"
    const ctaNote =
      props.cta?.note ??
      "Or call us: +1 (800) 555-0199 · Mon–Fri, 9am–6pm ET"

    const footerTagline =
      props.footer?.tagline ??
      "The operating system for modern teams. Streamline workflows, automate busywork, and ship faster with a platform built for scale."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Integrations", "Pricing", "Changelog", "Roadmap"],
          },
          {
            title: "Resources",
            links: [
              "Documentation",
              "API Reference",
              "Community Forum",
              "Status Page",
              "Blog",
            ],
          },
          {
            title: "Company",
            links: ["About", "Careers", "Legal", "Privacy", "Contact"],
          },
        ]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Twitter", "GitHub", "LinkedIn"]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand}. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Terms of Service", "Privacy Policy", "Cookies"]

    // Brand logo mark (pyramid-like decorative SVG).
    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    )

    const SearchIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
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
        <path d="M19 9l-7 7-7-7" />
      </svg>
    )

    const TwitterIcon = () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0012 8v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
      </svg>
    )

    const GitHubIcon = () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.54 2.87 8.39 6.84 9.75.5.1.68-.22.68-.48v-1.7c-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.35 1.12 2.92.86.1-.67.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.08 0-1.12.38-2.03 1.03-2.75-.11-.26-.45-1.3.1-2.7 0 0 .86-.28 2.8 1.05a9.55 9.55 0 015.04 0c1.95-1.33 2.8-1.05 2.8-1.05.54 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.95-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9v2.82c0 .27.18.59.69.48A10.36 10.36 0 0022 12.26C22 6.58 17.52 2 12 2z" />
      </svg>
    )

    const LinkedInIcon = () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z" />
      </svg>
    )

    const socialIcon = (name: string) => {
      if (name === "Twitter" || name === "X") return <TwitterIcon />
      if (name === "GitHub") return <GitHubIcon />
      return <LinkedInIcon />
    }

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Skip to content */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:shadow-lg focus:text-foreground"
        >
          Skip to content
        </a>

        {/* Navbar */}
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-foreground"
              aria-label={`${brand} Home`}
            >
              <LogoMark className="h-8 w-8 text-primary" />
              {brand}
            </button>
            <nav className="hidden items-center gap-8 text-sm font-semibold text-muted-foreground md:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="transition-colors hover:text-primary"
                >
                  {label}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => go("Log in")}
                className="hidden items-center rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted sm:inline-flex"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => go("Start free trial")}
                className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                Start free trial
              </button>
            </div>
          </div>
        </header>

        <main id="main-content">
          {/* Hero */}
          <section className="relative overflow-hidden bg-gradient-to-br from-primary via-accent to-secondary pb-24 pt-20 md:pt-28">
            <div className="absolute inset-0 opacity-20" aria-hidden="true">
              <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary-foreground blur-3xl" />
              <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-secondary blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-7xl px-6 text-center">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-1.5 text-sm font-semibold text-primary-foreground backdrop-blur ring-1 ring-primary-foreground/20">
                {heroBadge}
              </p>
              <h1 className="mx-auto max-w-3xl text-5xl font-extrabold tracking-tight text-primary-foreground md:text-7xl">
                {heroHeading}
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/90 md:text-xl">
                {heroSub}
              </p>

              <form
                role="search"
                aria-label="Help center search"
                className="mx-auto mt-10 max-w-2xl"
                onSubmit={(e) => {
                  e.preventDefault()
                  go("Search")
                }}
              >
                <label htmlFor="hero-search" className="sr-only">
                  Search articles
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
                    <SearchIcon className="h-6 w-6" />
                  </div>
                  <input
                    id="hero-search"
                    type="search"
                    placeholder={searchPlaceholder}
                    className="w-full rounded-2xl border-0 bg-background py-4 pl-12 pr-36 text-base text-foreground shadow-2xl ring-1 ring-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring md:text-lg"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="hidden items-center rounded-md border border-border bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground md:inline-flex">
                      Ctrl K
                    </span>
                    <button
                      type="submit"
                      className="ml-2 inline-flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary"
                    >
                      {searchCta}
                    </button>
                  </div>
                </div>
              </form>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-primary-foreground/90">
                <span className="text-primary-foreground/70">{trendingLabel}</span>
                {heroTrending.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => go(topic)}
                    className="rounded-full bg-primary-foreground/10 px-3 py-1 transition-colors hover:bg-primary-foreground/20"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section aria-label="Knowledge base stats" className="relative -mt-10">
            <div className="mx-auto max-w-7xl px-6">
              <div className="grid grid-cols-2 gap-4 rounded-2xl bg-card p-6 shadow-lg ring-1 ring-border md:grid-cols-4 md:p-8">
                {statsItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-3xl font-extrabold text-foreground md:text-4xl">
                      {s.value}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Topics */}
          <section id="topics" className="py-20 md:py-28">
            <div className="mx-auto max-w-7xl px-6">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                  <h2 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
                    {topicsHeading}
                  </h2>
                  <p className="mt-4 text-lg text-muted-foreground">{topicsDesc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => go(topicsViewAll)}
                  className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-primary transition-colors hover:text-primary/90 md:mt-0"
                >
                  {topicsViewAll}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {topicItems.map((item, i) => {
                  const tone = topicTones[i % topicTones.length]
                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => go(item.title)}
                      className="group relative flex flex-col rounded-2xl bg-card p-6 text-left shadow-sm ring-1 ring-border transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                            tone.bg,
                            tone.text,
                          )}
                        >
                          {categoryIcons[i % categoryIcons.length]}
                        </div>
                        <h3 className="text-base font-bold text-foreground">
                          {item.title}
                        </h3>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                      <div className="mt-5 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                        <span>{item.count}</span>
                        <span>{item.updated}</span>
                      </div>
                      <span className="absolute inset-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring" aria-label={`${item.title} articles`} />
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Categories */}
          <section id="categories" className="bg-card py-20 md:py-28">
            <div className="mx-auto max-w-7xl px-6">
              <div className="max-w-2xl">
                <h2 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
                  {categoriesHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {categoriesDesc}
                </p>
              </div>

              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {categoryItems.map((cat) => (
                  <button
                    key={cat.title}
                    type="button"
                    onClick={() => go(cat.title)}
                    className="group relative flex flex-col overflow-hidden rounded-2xl text-left shadow-sm ring-1 ring-border transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <Image
                        alt={cat.imageAlt}
                        w={800}
                        h={320}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                      <span className="absolute bottom-3 left-4 text-sm font-bold text-primary-foreground">
                        {cat.title}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col justify-between bg-card p-5">
                      <p className="text-sm text-muted-foreground">
                        {cat.description}
                      </p>
                      <span className="mt-4 text-xs font-bold text-primary">
                        {cat.count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-20 md:py-28">
            <div className="mx-auto max-w-7xl px-6">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>

              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <figure
                    key={t.name}
                    className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border"
                  >
                    <blockquote className="text-sm leading-relaxed text-foreground">
                      <p>{t.quote}</p>
                    </blockquote>
                    <figcaption className="mt-5 flex items-center gap-3">
                      <Image
                        alt={t.imageAlt}
                        w={160}
                        h={160}
                        loading="lazy"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {t.name}
                        </p>
                        <p className="text-xs font-semibold text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="bg-card py-20 md:py-28">
            <div className="mx-auto max-w-3xl px-6">
              <div className="text-center">
                <h2 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
                  {faqHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">{faqDesc}</p>
              </div>

              <div className="mt-12 space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-2xl bg-muted ring-1 ring-border transition-all open:bg-card open:shadow-sm"
                  >
                    <summary className="flex cursor-pointer items-center justify-between rounded-2xl px-6 py-5 text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                      {item.question}
                      <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">
                      <p>{item.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section id="contact" className="py-20 md:py-28">
            <div className="mx-auto max-w-7xl px-6">
              <div className="relative overflow-hidden rounded-3xl bg-card px-6 py-16 text-center md:px-16 md:py-24">
                <div className="absolute inset-0 opacity-30" aria-hidden="true">
                  <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary blur-3xl" />
                  <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-accent blur-3xl" />
                </div>
                <div className="relative">
                  <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
                    {ctaHeading}
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                    {ctaDesc}
                  </p>
                  <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(ctaPrimary)}
                      className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-bold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card"
                    >
                      {ctaPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(ctaSecondary)}
                      className="inline-flex items-center justify-center rounded-xl bg-background px-6 py-3 text-base font-bold text-foreground shadow-lg transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card"
                    >
                      {ctaSecondary}
                    </button>
                  </div>
                  <p className="mt-6 text-sm font-semibold text-muted-foreground">
                    {ctaNote}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-background">
          <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
            <div className="grid gap-10 md:grid-cols-5">
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-foreground"
                  aria-label={`${brand} Home`}
                >
                  <LogoMark className="h-8 w-8 text-primary" />
                  {brand}
                </button>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {footerTagline}
                </p>
                <div className="mt-6 flex items-center gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      onClick={() => go(social)}
                      aria-label={social}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {socialIcon(social)}
                    </button>
                  ))}
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <p className="text-sm font-bold text-foreground">
                    {col.title}
                  </p>
                  <ul className="mt-4 space-y-3 text-sm font-semibold text-muted-foreground">
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

            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm font-semibold text-muted-foreground">
                {footerCopyright}
              </p>
              <div className="flex items-center gap-6 text-sm font-semibold text-muted-foreground">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="transition-colors hover:text-foreground"
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
