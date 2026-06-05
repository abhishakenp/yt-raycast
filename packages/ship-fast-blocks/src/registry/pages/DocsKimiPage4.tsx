import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * DocsKimiPage4 — the fourth variant of a developer DOCUMENTATION / API-reference page,
 * sibling to DocsKimiPage. A serif-accented editorial layout with a sticky top navbar
 * (integrated search ⌘K, brand mark, nav links, CTA), a persistent three-column docs
 * frame (left sidebar with grouped navigation, a wide reading column, and a right-side
 * table-of-contents), version-badge hero, site-wide search with popular quick-links, a
 * six-card getting-started grid with colored icon tiles, an interactive code example
 * with dark syntax block and language tabs, a stacked feature list, platform stats,
 * changelog timeline, accordion FAQ, gradient CTA banner, and a full footer with socials
 * and live status indicator.
 *
 * Every interactive element routes through useNavigate. All colors are semantic theme
 * tokens only. Rich defaults make it render fully with zero props.
 */
export const DocsKimiPage4 = defineComponent({
  name: "DocsKimiPage4",
  description:
    "The fourth variant of a developer DOCUMENTATION / API-reference page, sibling to DocsKimiPage, featuring a serif-accented editorial layout with a sticky top navbar (integrated search ⌘K, brand mark, nav links, CTA), a persistent three-column docs frame (left sidebar with grouped navigation — Getting Started / Core Concepts / API Reference / Resources — and active-item highlighting, a wide reading column with a version-badge hero, a prominent site-wide search bar with popular quick-links, a six-card getting-started grid with colored icon tiles, an interactive code example with dark syntax-highlighted language tabs and request/response blocks, a stacked feature list with icon tiles, platform stats counters, a changelog timeline with version badges, an accordion FAQ, a gradient CTA banner, a right-side table-of-contents sidebar, and a full footer with social links and live status indicator). Use when a polished, content-dense docs site with multiple sidebars, a live code preview, editorial typography, and rich defaults is desired over the simpler single-sidebar DocsKimiPage layout. Supports brand, nav, hero, search, gettingStarted, codeExample, features, stats, changelog, faq, cta, sidebar, toc, footer content slots with rich defaults.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    hero: z
      .object({
        badge: z.string().optional(),
        badgeDate: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
      })
      .optional(),
    search: z
      .object({
        placeholder: z.string().optional(),
        popular: z.array(z.object({ label: z.string() })).optional(),
      })
      .optional(),
    gettingStarted: z
      .object({
        heading: z.string().optional(),
        cards: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    codeExample: z
      .object({
        heading: z.string().optional(),
        tabs: z.array(z.string()).optional(),
        code: z.string().optional(),
        response: z.string().optional(),
      })
      .optional(),
    features: z
      .object({
        heading: z.string().optional(),
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
    stats: z
      .object({
        items: z
          .array(
            z.object({
              value: z.string(),
              label: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    changelog: z
      .object({
        heading: z.string().optional(),
        linkLabel: z.string().optional(),
        items: z
          .array(
            z.object({
              version: z.string(),
              title: z.string(),
              description: z.string(),
              date: z.string(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    faq: z
      .object({
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              question: z.string(),
              answer: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    cta: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
      })
      .optional(),
    sidebar: z
      .object({
        groups: z
          .array(
            z.object({
              title: z.string(),
              items: z.array(z.string()),
            }),
          )
          .optional(),
      })
      .optional(),
    toc: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
        helpText: z.string().optional(),
        helpLink: z.string().optional(),
      })
      .optional(),
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(
            z.object({
              title: z.string(),
              links: z.array(z.string()),
            }),
          )
          .optional(),
        socials: z.array(z.string()).optional(),
        statusText: z.string().optional(),
        copyright: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()

    const brand = props.brand ?? "Atlas"
    const nav = props.nav?.length
      ? props.nav
      : ["Documentation", "API Reference", "Changelog", "Community"]

    const heroBadge = props.hero?.badge ?? "v2.4.1"
    const heroBadgeDate =
      props.hero?.badgeDate ?? "Latest release — May 28, 2026"
    const heroTitle =
      props.hero?.title ?? "Build faster with the Atlas platform"
    const heroDesc =
      props.hero?.description ??
      "Complete documentation for building, deploying, and scaling applications with Atlas. From your first API call to production deployment, we've got you covered."
    const heroPrimary = props.hero?.primaryCta ?? "Get Started"
    const heroSecondary = props.hero?.secondaryCta ?? "View API Reference"

    const searchPlaceholder =
      props.search?.placeholder ?? "Search documentation, APIs, guides..."
    const searchPopular = props.search?.popular ?? [
      { label: "Authentication" },
      { label: "Webhooks" },
      { label: "Rate Limits" },
      { label: "Error Codes" },
    ]

    const gettingStartedHeading =
      props.gettingStarted?.heading ?? "Getting Started"
    const gettingStartedCards = props.gettingStarted?.cards?.length
      ? props.gettingStarted.cards
      : [
          {
            title: "Quick Start Guide",
            description:
              "Get your first API request working in under 5 minutes with our step-by-step tutorial.",
          },
          {
            title: "SDK Installation",
            description:
              "Official SDKs for JavaScript, Python, Ruby, Go, and PHP with full type support.",
          },
          {
            title: "Authentication",
            description:
              "Secure your API requests with Bearer tokens, OAuth 2.0, and API key best practices.",
          },
          {
            title: "API Reference",
            description:
              "Complete endpoint documentation with request/response examples and error codes.",
          },
          {
            title: "Community",
            description:
              "Join 12,000+ developers. Get help, share projects, and contribute to the ecosystem.",
          },
          {
            title: "Guides",
            description:
              "In-depth tutorials for common patterns: webhooks, pagination, batch operations.",
          },
        ]

    const codeExampleHeading =
      props.codeExample?.heading ?? "Make Your First API Call"
    const codeTabs = props.codeExample?.tabs?.length
      ? props.codeExample.tabs
      : ["cURL", "JavaScript", "Python"]
    const codeSnippet =
      props.codeExample?.code ??
      `curl https://api.atlas.dev/v1/projects \\
  -H "Authorization: Bearer ATLAS_API_KEY_REDACTED" \\
  -H "Content-Type: application/json" \\
  -X POST \\
  -d '{
    "name": "My First Project",
    "description": "A sample project created via the Atlas API",
    "region": "us-east-1",
    "plan": "pro"
  }'`
    const codeResponse =
      props.codeExample?.response ??
      `{
  "id": "proj_2vPqN5L8xWtK9jM4",
  "name": "My First Project",
  "description": "A sample project created via the Atlas API",
  "region": "us-east-1",
  "plan": "pro",
  "status": "active",
  "created_at": "2026-05-31T09:23:47Z",
  "url": "https://api.atlas.dev/v1/projects/proj_2vPqN5L8xWtK9jM4"
}`

    const featuresHeading =
      props.features?.heading ?? "Why Developers Choose Atlas"
    const featuresList = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "99.99% Uptime SLA",
            description:
              "Enterprise-grade infrastructure with automatic failover, load balancing, and 24/7 monitoring. Our status page shows 847 days of continuous availability.",
          },
          {
            title: "Bank-Grade Security",
            description:
              "SOC 2 Type II certified, GDPR compliant, and HIPAA ready. All data encrypted at rest with AES-256 and in transit with TLS 1.3.",
          },
          {
            title: "Developer-First Support",
            description:
              "Average response time of 4 minutes for paid plans. Direct access to engineers via Slack Connect and GitHub issue tracking.",
          },
          {
            title: "Transparent Pricing",
            description:
              "Pay only for what you use. No hidden fees, no surprise overages. Volume discounts start at 1 million requests per month.",
          },
        ]

    const statsList = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "12K+", label: "Active Developers" },
          { value: "847", label: "Days Uptime" },
          { value: "2.4B", label: "API Requests/Month" },
          { value: "<50ms", label: "Median Latency" },
        ]

    const changelogHeading = props.changelog?.heading ?? "Latest Updates"
    const changelogLinkLabel =
      props.changelog?.linkLabel ?? "View Changelog →"
    const changelogItems = props.changelog?.items?.length
      ? props.changelog.items
      : [
          {
            version: "v2.4",
            title: "GraphQL API Public Beta",
            description:
              "Introducing our GraphQL endpoint with real-time subscriptions, query batching, and built-in analytics.",
            date: "Released May 28, 2026",
            badge: "New",
          },
          {
            version: "v2.3",
            title: "WebSocket Support for Live Data",
            description:
              "Native WebSocket connections for real-time updates. Supports auto-reconnect, presence detection, and custom events.",
            date: "Released May 15, 2026",
          },
          {
            version: "v2.2",
            title: "Enhanced Rate Limit Headers",
            description:
              "New X-RateLimit-* headers provide better visibility into quota usage and reset windows.",
            date: "Released April 30, 2026",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What's included in the free tier?",
            answer:
              "The free tier includes 100,000 API requests per month, 3 team members, community support, and access to all core API endpoints. Perfect for side projects, prototypes, and small applications. No credit card required to get started.",
          },
          {
            question: "How do I migrate from v1 to v2?",
            answer:
              "We provide a compatibility layer that translates v1 requests to v2 automatically. Enable it by adding the X-API-Version: 1 header. We recommend migrating incrementally using our migration guide and SDK upgrade tools.",
          },
          {
            question: "Where are your data centers located?",
            answer:
              "Atlas operates in 9 regions: US East (N. Virginia), US West (Oregon), EU (Ireland, Frankfurt, London), Asia Pacific (Singapore, Tokyo, Sydney), and South America (São Paulo). Choose a region during project creation to minimize latency.",
          },
          {
            question: "Do you offer custom enterprise plans?",
            answer:
              "Yes. Enterprise plans include dedicated infrastructure, custom rate limits, SSO integration, audit logs, SLA guarantees, and a dedicated account manager. Contact our sales team for pricing starting at $2,000/month.",
          },
        ]

    const ctaTitle = props.cta?.title ?? "Ready to start building?"
    const ctaDesc =
      props.cta?.description ??
      "Get started for free today. No credit card required. Deploy your first project in under 5 minutes with our quick start guide."
    const ctaPrimary = props.cta?.primaryCta ?? "Create Free Account"
    const ctaSecondary = props.cta?.secondaryCta ?? "Contact Sales"

    const sidebarGroups = props.sidebar?.groups?.length
      ? props.sidebar.groups
      : [
          {
            title: "Getting Started",
            items: [
              "Quick Start",
              "Installation",
              "Configuration",
              "Your First App",
            ],
          },
          {
            title: "Core Concepts",
            items: [
              "Architecture Overview",
              "Authentication",
              "Rate Limiting",
              "Error Handling",
              "Webhooks",
            ],
          },
          {
            title: "API Reference",
            items: ["REST API", "GraphQL", "SDK Reference", "CLI Commands"],
          },
          {
            title: "Resources",
            items: ["Changelog", "Community Forum", "Support", "Status Page"],
          },
        ]

    const tocHeading = props.toc?.heading ?? "On This Page"
    const tocItems = props.toc?.items?.length
      ? props.toc.items
      : [
          "Getting Started",
          "Make Your First API Call",
          "Why Developers Choose Atlas",
          "Latest Updates",
          "FAQ",
        ]
    const tocHelpText = props.toc?.helpText ?? "Need help getting started?"
    const tocHelpLink = props.toc?.helpLink ?? "Schedule a demo →"

    const footerTagline =
      props.footer?.tagline ??
      "The complete platform for building, deploying, and scaling modern applications. Built by developers, for developers."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Documentation", "API Reference", "Changelog", "Status Page"],
          },
          {
            title: "Resources",
            links: ["Community Forum", "GitHub", "Blog", "Support"],
          },
          {
            title: "Company",
            links: ["About", "Careers", "Privacy", "Terms"],
          },
        ]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["GitHub", "Twitter", "Discord"]
    const footerStatus = props.footer?.statusText ?? "All systems operational"
    const footerCopyright =
      props.footer?.copyright ?? `© 2026 ${brand} Technologies, Inc. All rights reserved.`

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="60%"
          height="60%"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </span>
    )

    const SearchIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )

    const socialPath = (name: string) => {
      const n = name.toLowerCase()
      if (n.includes("git")) {
        return "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
      }
      if (n.includes("discord")) {
        return "M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0286.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6521-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.198.3728.2924a.077.077 0 01-.0066.1276 12.299 12.299 0 01-1.873.8914.077.077 0 00-.041.107c.36.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286 19.839 19.839 0 006.0025-3.0294a.077.077 0 00.032-.054c.5-5.177-.838-9.6739-3.5485-13.6598a.061.061 0 00-.0312-.0286zM8.02 15.331c-1.183 0-2.157-1.0853-2.157-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2107 0 2.1754 1.0956 2.157 2.42-.0183 1.3332-.9554 2.4189-2.157 2.4189zm7.9749 0c-1.183 0-2.157-1.0853-2.157-2.419 0-1.3332.9548-2.4189 2.157-2.4189 1.2106 0 2.1754 1.0956 2.1569 2.42-.0182 1.3332-.9553 2.4189-2.1569 2.4189z"
      }
      return "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
    }

    const cardIconPaths = [
      "M13 10V3L4 14h7v7l9-11h-7z",
      "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
      "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
      "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
      "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    ]

    const cardTints = [
      "bg-chart-1/10 text-chart-1 group-hover:bg-chart-1/20",
      "bg-chart-3/10 text-chart-3 group-hover:bg-chart-3/20",
      "bg-chart-2/10 text-chart-2 group-hover:bg-chart-2/20",
      "bg-chart-4/10 text-chart-4 group-hover:bg-chart-4/20",
      "bg-chart-5/10 text-chart-5 group-hover:bg-chart-5/20",
      "bg-accent/20 text-accent-foreground group-hover:bg-accent/30",
    ]

    const featureIconPaths = [
      "M13 10V3L4 14h7v7l9-11h-7z",
      "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
      "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
    ]

    const featureTints = [
      "bg-chart-1/10 text-chart-1",
      "bg-chart-3/10 text-chart-3",
      "bg-chart-2/10 text-chart-2",
      "bg-chart-4/10 text-chart-4",
    ]

    const changelogTints = [
      "bg-chart-2/10 text-chart-2",
      "bg-chart-1/10 text-chart-1",
      "bg-chart-3/10 text-chart-3",
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-8">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="flex items-center gap-2"
                >
                  <LogoMark className="size-8" />
                  <span className="font-serif text-xl font-semibold text-foreground">
                    {brand} Docs
                  </span>
                </button>
                <nav className="hidden md:flex items-center gap-6">
                  {nav.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => go(label)}
                      className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="hidden sm:flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/80"
                >
                  <SearchIcon className="size-4" />
                  <span>Search docs...</span>
                  <kbd className="rounded border border-input bg-card px-1.5 py-0.5 text-xs text-muted-foreground/60">
                    ⌘K
                  </kbd>
                </button>
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Three-column docs frame */}
        <div className="mx-auto flex max-w-7xl min-h-[calc(100svh-4rem)]">
          {/* Left sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 border-r border-border py-8 pr-6">
            <nav className="space-y-6">
              {sidebarGroups.map((group, gi) => (
                <div key={group.title}>
                  <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.title}
                  </h3>
                  <ul className="space-y-1">
                    {group.items.map((item, ii) => {
                      const active = gi === 0 && ii === 0
                      return (
                        <li key={item}>
                          <button
                            type="button"
                            onClick={() => go(item)}
                            className={cn(
                              "block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                              active
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                          >
                            {item}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          {/* Main reading column */}
          <main className="min-w-0 flex-1 py-8 lg:py-12">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              {/* Hero */}
              <section className="mb-12">
                <div className="mb-4 flex items-center gap-2">
                  <span className="rounded-full bg-chart-2/10 px-2.5 py-1 text-xs font-semibold text-chart-2">
                    {heroBadge}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {heroBadgeDate}
                  </span>
                </div>
                <h1 className="mb-4 font-serif text-4xl font-bold leading-tight text-foreground sm:text-5xl">
                  {heroTitle}
                </h1>
                <p className="mb-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  {heroDesc}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {heroPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="rounded-lg border border-border bg-card px-5 py-2.5 font-medium text-card-foreground transition-colors hover:bg-muted"
                  >
                    {heroSecondary}
                  </button>
                </div>
              </section>

              {/* Search */}
              <section className="mb-12">
                <form
                  className="relative"
                  onSubmit={(e) => {
                    e.preventDefault()
                    go(nav[0])
                  }}
                >
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <SearchIcon className="size-5 text-muted-foreground" />
                  </div>
                  <input
                    type="search"
                    placeholder={searchPlaceholder}
                    className="w-full rounded-xl border border-input bg-card py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <kbd className="hidden sm:block rounded border border-input bg-muted px-2 py-1 text-sm font-medium text-muted-foreground">
                      ⌘K
                    </kbd>
                  </div>
                </form>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">Popular:</span>
                  {searchPopular.map((item, i) => (
                    <span key={item.label} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => go(item.label)}
                        className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        {item.label}
                      </button>
                      {i < searchPopular.length - 1 && (
                        <span className="text-muted-foreground/40">•</span>
                      )}
                    </span>
                  ))}
                </div>
              </section>

              {/* Getting Started cards */}
              <section id="getting-started" className="mb-16">
                <h2 className="mb-6 font-serif text-2xl font-semibold text-foreground">
                  {gettingStartedHeading}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {gettingStartedCards.map((card, i) => (
                    <button
                      key={card.title}
                      type="button"
                      onClick={() => go(card.title)}
                      className="group block rounded-xl border border-border bg-card p-5 text-left transition-all hover:shadow-sm"
                    >
                      <div
                        className={cn(
                          "mb-4 grid size-10 place-items-center rounded-lg transition-colors",
                          cardTints[i % cardTints.length],
                        )}
                      >
                        <svg
                          className="size-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d={cardIconPaths[i % cardIconPaths.length]} />
                        </svg>
                      </div>
                      <h3 className="mb-1 font-semibold text-foreground">
                        {card.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {card.description}
                      </p>
                    </button>
                  ))}
                </div>
              </section>

              {/* Code example */}
              <section className="mb-16">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-serif text-2xl font-semibold text-foreground">
                    {codeExampleHeading}
                  </h2>
                  <div className="flex rounded-lg bg-muted p-1">
                    {codeTabs.map((tab, i) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => go(tab)}
                        className={cn(
                          "rounded px-3 py-1.5 text-sm font-medium transition-colors",
                          i === 0
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl bg-foreground">
                  <div className="flex items-center justify-between border-b border-border/20 bg-muted/80 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-destructive" />
                      <div className="size-3 rounded-full bg-chart-4" />
                      <div className="size-3 rounded-full bg-chart-2" />
                    </div>
                    <button
                      type="button"
                      onClick={() => go(nav[0])}
                      className="flex items-center gap-1.5 text-sm text-background/60 transition-colors hover:text-background"
                    >
                      <svg
                        className="size-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </button>
                  </div>
                  <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-background/90">
                    <code>{codeSnippet}</code>
                  </pre>
                </div>
                <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
                  <div className="border-b border-border bg-muted px-4 py-3">
                    <span className="text-sm font-medium text-foreground">
                      Response
                    </span>
                  </div>
                  <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-foreground">
                    <code>{codeResponse}</code>
                  </pre>
                </div>
              </section>

              {/* Features */}
              <section className="mb-16">
                <h2 className="mb-6 font-serif text-2xl font-semibold text-foreground">
                  {featuresHeading}
                </h2>
                <div className="space-y-4">
                  {featuresList.map((item, i) => (
                    <div
                      key={item.title}
                      className="flex gap-4 rounded-xl border border-border bg-card p-4"
                    >
                      <div
                        className={cn(
                          "grid size-12 shrink-0 place-items-center rounded-lg",
                          featureTints[i % featureTints.length],
                        )}
                      >
                        <svg
                          className="size-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d={featureIconPaths[i % featureIconPaths.length]} />
                        </svg>
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-foreground">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Stats */}
              <section className="mb-16">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {statsList.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-border bg-card p-5 text-center"
                    >
                      <div className="mb-1 font-serif text-3xl font-bold text-primary">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Changelog */}
              <section className="mb-16">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-serif text-2xl font-semibold text-foreground">
                    {changelogHeading}
                  </h2>
                  <button
                    type="button"
                    onClick={() => go("Changelog")}
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    {changelogLinkLabel}
                  </button>
                </div>
                <div className="space-y-3">
                  {changelogItems.map((item, i) => (
                    <div
                      key={item.version}
                      className="flex items-start gap-4 rounded-xl border border-border bg-card p-4"
                    >
                      <div
                        className={cn(
                          "grid size-10 shrink-0 place-items-center rounded-full",
                          changelogTints[i % changelogTints.length],
                        )}
                      >
                        <span className="text-xs font-bold">
                          {item.version}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">
                            {item.title}
                          </h3>
                          {item.badge && (
                            <span className="rounded-full bg-chart-2/10 px-2 py-0.5 text-xs font-medium text-chart-2">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="mb-2 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                        <span className="text-xs text-muted-foreground/60">
                          {item.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQ */}
              <section className="mb-16">
                <h2 className="mb-6 font-serif text-2xl font-semibold text-foreground">
                  {faqHeading}
                </h2>
                <div className="space-y-3">
                  {faqItems.map((item) => (
                    <details
                      key={item.question}
                      className="group overflow-hidden rounded-xl border border-border bg-card"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between p-4 transition-colors hover:bg-muted">
                        <span className="font-medium text-foreground">
                          {item.question}
                        </span>
                        <svg
                          className="size-5 text-muted-foreground transition-transform group-open:rotate-180"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="px-4 pb-4 text-muted-foreground">
                        <p className="text-sm leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>

              {/* CTA */}
              <section className="mb-16">
                <div className="rounded-2xl bg-gradient-to-br from-primary to-background p-8 text-center">
                  <h2 className="mb-3 font-serif text-2xl font-bold text-primary-foreground sm:text-3xl">
                    {ctaTitle}
                  </h2>
                  <p className="mx-auto mb-6 max-w-lg text-primary-foreground/80">
                    {ctaDesc}
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => go(ctaPrimary)}
                      className="rounded-lg bg-card px-6 py-3 font-semibold text-primary transition-colors hover:bg-card/90"
                    >
                      {ctaPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(ctaSecondary)}
                      className="rounded-lg bg-primary/80 px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/70"
                    >
                      {ctaSecondary}
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </main>

          {/* Right TOC */}
          <aside className="hidden xl:block w-64 shrink-0 py-8 pl-8">
            <div className="sticky top-24">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {tocHeading}
              </h3>
              <nav className="space-y-2 border-l-2 border-border">
                {tocItems.map((item, i) => {
                  const active = i === 0
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => go(item)}
                      className={cn(
                        "-ml-0.5 block pl-4 text-sm font-medium transition-colors",
                        active
                          ? "border-l-2 border-primary text-primary"
                          : "border-l-2 border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                      )}
                    >
                      {item}
                    </button>
                  )
                })}
              </nav>
              <div className="mt-8 rounded-lg bg-muted p-4">
                <p className="mb-2 text-sm text-muted-foreground">
                  {tocHelpText}
                </p>
                <button
                  type="button"
                  onClick={() => go(tocHelpLink.replace(" →", ""))}
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  {tocHelpLink}
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <footer className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
              <div className="col-span-2 lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark className="size-8" />
                  <span className="font-serif text-xl font-semibold text-foreground">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 max-w-xs text-sm text-muted-foreground">
                  {footerTagline}
                </p>
                <div className="flex gap-3">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                    >
                      <svg
                        className="size-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d={socialPath(social)} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-3 font-semibold text-foreground">
                    {col.title}
                  </h4>
                  <ul className="space-y-2">
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
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                {footerCopyright}
              </p>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span className="size-2 rounded-full bg-chart-2" />
                  {footerStatus}
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
