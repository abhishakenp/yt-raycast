import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

export const DevToolKimiPage7 = defineComponent({
  name: "DevToolKimiPage7",
  description:
    "Complete developer-API / data-streaming / dev-tool LANDING page with a glassmorphic, gradient-accented atmospheric product-marketing design. The 7th style sibling to DevToolKimiPage — visually distinct with a floating syntax-highlighted code-window mockup, translucent frosted-glass feature cards over gradient-tinted backgrounds, a numbered 3-step gradient timeline with connecting stripe lines, an image-driven 6-card industry case-study gallery with category color tags, a 4-up metrics stat band with gradient text, a 3-tier pricing table with highlighted Most Popular plan and checklist features, star-rated testimonials with avatar headshots, an accordion FAQ using native details/summary elements, a closing gradient-orb CTA band with dual action buttons, and a 5-column footer with social icons and an operational status badge. Use for developer tools, API platforms, real-time data infrastructure, CDC connectors, streaming pipelines, or technical SaaS when a sleek immersive landing page with code samples, social proof, and conversion pricing is wanted. Richly defaulted so it renders fully with no props at all; call with DevToolKimiPage7(brand, nav) for quick content swaps.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        footnoteLeft: z.string().optional(),
        footnoteRight: z.string().optional(),
        codeFile: z.string().optional(),
        code: z.string().optional(),
        statusTitle: z.string().optional(),
        statusSubtitle: z.string().optional(),
      })
      .optional(),
    logos: z
      .object({
        label: z.string().optional(),
        companies: z.array(z.string()).optional(),
      })
      .optional(),
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        learnMore: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              tag: z.string().optional(),
              title: z.string(),
              caption: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    stats: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        popularLabel: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              period: z.string().optional(),
              features: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
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
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        footnote: z.string().optional(),
      })
      .optional(),
    footer: z
      .object({
        blurb: z.string().optional(),
        columns: z
          .array(
            z.object({ title: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        legalLinks: z.array(z.string()).optional(),
        copyright: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "StreamAPI"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Pricing", "Docs", "Integrations"]

    const heroBadge =
      props.hero?.badge ?? "Now with real-time WebSocket streaming"
    const heroHeading = props.hero?.heading ?? "Build data pipelines"
    const heroHighlight = props.hero?.highlight ?? "in minutes"
    const heroSub =
      props.hero?.subheading ??
      "StreamAPI is the developer-first platform for building real-time data pipelines. Connect 200+ sources, transform with SQL, and stream to any destination with 99.99% uptime."
    const heroPrimary = props.hero?.primaryCta ?? "Get started free"
    const heroSecondary = props.hero?.secondaryCta ?? "View documentation"
    const heroFootLeft =
      props.hero?.footnoteLeft ?? "No credit card required"
    const heroFootRight = props.hero?.footnoteRight ?? "14-day free trial"
    const heroCodeFile = props.hero?.codeFile ?? "streamapi-demo.js"
    const heroCode =
      props.hero?.code ??
      `import { StreamAPI } from '@streamapi/sdk';

const client = new StreamAPI({
  apiKey: 'sk_live_51H8x...'
});

const stream = await client.createStream({
  source: 'postgresql://prod-db',
  destination: 'kafka://events-topic',
  transform: 'SELECT * FROM events WHERE type = $1',
  realtime: true
});

// Stream active: 2.4M events/day
// Latency: 12ms p99`
    const statusTitle = props.hero?.statusTitle ?? "Stream Connected"
    const statusSubtitle =
      props.hero?.statusSubtitle ?? "12ms latency \u00b7 99.99% uptime"

    const logosLabel =
      props.logos?.label ?? "Trusted by engineering teams at"
    const logoCompanies = props.logos?.companies?.length
      ? props.logos.companies
      : ["Stripe", "Slack", "Vercel", "Notion", "Linear", "Figma"]

    const featuresHeading =
      props.features?.heading ?? "Everything you need to stream data"
    const featuresDesc =
      props.features?.description ??
      "Built by developers, for developers. Our platform handles the infrastructure so you can focus on building."
    const featuresLearnMore = props.features?.learnMore ?? "Learn more"
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Real-time Streaming",
            description:
              "WebSocket and SSE support for sub-second latency. Stream millions of events with automatic backpressure handling.",
          },
          {
            title: "200+ Connectors",
            description:
              "Pre-built integrations for PostgreSQL, MySQL, Kafka, S3, BigQuery, Snowflake, and more. Custom connectors in minutes.",
          },
          {
            title: "Enterprise Security",
            description:
              "SOC 2 Type II certified, end-to-end encryption, RBAC, audit logs. Your data never leaves your VPC.",
          },
          {
            title: "SQL Transforms",
            description:
              "Write transformations in familiar SQL. Auto-scaling compute handles complex joins, aggregations, and window functions.",
          },
          {
            title: "Observability",
            description:
              "Real-time metrics, distributed tracing, and alerting. Integrates with Datadog, Grafana, and PagerDuty out of the box.",
          },
          {
            title: "Developer SDKs",
            description:
              "Native SDKs for TypeScript, Python, Go, Ruby, and Java. RESTful API with OpenAPI 3.0 spec and code generation.",
          },
        ]

    const stepsHeading =
      props.steps?.heading ?? "Get streaming in 3 simple steps"
    const stepsDesc =
      props.steps?.description ??
      "From signup to production in under 10 minutes. No credit card required to start."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Connect your source",
            description:
              "Choose from 200+ pre-built connectors or bring your own. Supports PostgreSQL, MySQL, MongoDB, Kafka, S3, and more.",
          },
          {
            title: "Write your transform",
            description:
              "Use familiar SQL to filter, join, and aggregate. Our query optimizer handles the complexity automatically.",
          },
          {
            title: "Stream to destination",
            description:
              "Deploy in one click. Monitor in real-time with automatic scaling and 99.99% uptime guarantee.",
          },
        ]

    const galleryHeading =
      props.gallery?.heading ?? "Built for modern data teams"
    const galleryDesc =
      props.gallery?.description ??
      "See how leading companies use StreamAPI to power their data infrastructure."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            tag: "Fintech",
            title: "Real-time fraud detection",
            caption:
              "How Stripe uses StreamAPI to process 2M+ transactions per second with sub-50ms latency.",
            imageAlt:
              "Engineer monitoring real-time data dashboard with charts and metrics",
          },
          {
            tag: "E-commerce",
            title: "Inventory synchronization",
            caption:
              "Shopify keeps 500M+ SKUs in sync across warehouses with StreamAPI's CDC connectors.",
            imageAlt:
              "Data analyst reviewing analytics dashboard on multiple monitors",
          },
          {
            tag: "Healthcare",
            title: "HL7 FHIR streaming",
            caption:
              "Epic Systems processes 50M+ patient records daily with HIPAA-compliant streaming.",
            imageAlt:
              "Software engineer working with data pipeline visualization on large screen",
          },
          {
            tag: "Gaming",
            title: "Live player analytics",
            caption:
              "Unity tracks 10M+ concurrent players with real-time telemetry pipelines.",
            imageAlt:
              "DevOps engineer monitoring server infrastructure in modern office",
          },
          {
            tag: "SaaS",
            title: "Multi-tenant data isolation",
            caption:
              "Notion streams tenant data to isolated warehouses with row-level security.",
            imageAlt:
              "Network operations center with multiple screens showing data flows",
          },
          {
            tag: "IoT",
            title: "Connected device streams",
            caption:
              "Tesla ingests 5B+ sensor readings daily from their fleet of vehicles.",
            imageAlt:
              "Software development team collaborating in modern workspace",
          },
        ]

    const statsHeading =
      props.stats?.heading ?? "Trusted by developers worldwide"
    const statsDesc =
      props.stats?.description ??
      "Join 50,000+ developers building on the StreamAPI platform."
    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "50K+", label: "Active developers" },
          { value: "2.5B", label: "Events streamed daily" },
          { value: "12ms", label: "Average latency p99" },
          { value: "99.99%", label: "Uptime SLA" },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start free, scale as you grow. No hidden fees, no surprises."
    const popularLabel = props.pricing?.popularLabel ?? "Most Popular"
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Starter",
            tagline: "Perfect for side projects and learning",
            price: "$0",
            period: "/month",
            features: [
              "Up to 100K events/month",
              "5 connectors",
              "Community support",
              "SDK access",
            ],
            cta: "Get started free",
            featured: false,
          },
          {
            name: "Pro",
            tagline: "For growing teams and production workloads",
            price: "$99",
            period: "/month",
            features: [
              "Up to 10M events/month",
              "Unlimited connectors",
              "Priority email support",
              "Advanced transforms",
              "Team collaboration",
            ],
            cta: "Start 14-day trial",
            featured: true,
          },
          {
            name: "Enterprise",
            tagline: "Custom solutions for large organizations",
            price: "Custom",
            features: [
              "Unlimited events",
              "Dedicated infrastructure",
              "24/7 phone support",
              "Custom SLAs",
              "SSO & audit logs",
            ],
            cta: "Contact sales",
            featured: false,
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by developers"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See what engineering teams are saying about StreamAPI."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "We migrated our entire data pipeline from Kafka to StreamAPI in 2 days. The SQL transforms alone saved us weeks of engineering time.",
            name: "Sarah Chen",
            role: "VP of Engineering, Stripe",
            avatarAlt:
              "professional headshot of Sarah Chen VP of Engineering at Stripe",
          },
          {
            quote:
              "The WebSocket streaming is incredibly reliable. We process 10M+ events daily for our gaming platform with zero downtime.",
            name: "Marcus Rodriguez",
            role: "CTO, Unity Technologies",
            avatarAlt:
              "professional headshot of Marcus Rodriguez CTO at Unity Technologies",
          },
          {
            quote:
              "Best-in-class observability. We can trace every event from source to destination. The Datadog integration is seamless.",
            name: "Emily Watson",
            role: "Principal Engineer, Datadog",
            avatarAlt:
              "professional headshot of Emily Watson Principal Engineer at Datadog",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ?? "Everything you need to know about StreamAPI."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What is StreamAPI?",
            answer:
              "StreamAPI is a developer-first platform for building real-time data pipelines. Connect 200+ data sources, transform with SQL, and stream to any destination with sub-second latency.",
          },
          {
            question: "How does pricing work?",
            answer:
              "We charge based on events processed per month. The Starter plan is free up to 100K events. Pro is $99/month for up to 10M events. Enterprise pricing is custom for high-volume workloads.",
          },
          {
            question: "What connectors do you support?",
            answer:
              "We support 200+ connectors including PostgreSQL, MySQL, MongoDB, Kafka, S3, BigQuery, Snowflake, Redshift, Elasticsearch, and more. You can also build custom connectors using our SDK.",
          },
          {
            question: "Is StreamAPI SOC 2 compliant?",
            answer:
              "Yes, StreamAPI is SOC 2 Type II certified, GDPR compliant, and HIPAA eligible. We offer end-to-end encryption, VPC peering, and dedicated infrastructure for enterprise customers.",
          },
          {
            question: "What kind of support do you offer?",
            answer:
              "Starter plans include community support via Discord and GitHub. Pro plans get priority email support with 4-hour SLA. Enterprise customers receive 24/7 phone support and a dedicated account manager.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to stream your data?"
    const ctaDesc =
      props.cta?.description ??
      "Join 50,000+ developers building on StreamAPI. Start free, no credit card required, upgrade when you're ready."
    const ctaPrimary = props.cta?.primaryCta ?? "Get started for free"
    const ctaSecondary = props.cta?.secondaryCta ?? "Schedule a demo"
    const ctaFootnote =
      props.cta?.footnote ??
      "Free 14-day trial \u00b7 No credit card required \u00b7 Cancel anytime"

    const footerBlurb =
      props.footer?.blurb ??
      "The developer-first platform for building real-time data pipelines. Process billions of events with sub-second latency."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: [
              "Features",
              "Pricing",
              "Connectors",
              "Changelog",
              "Roadmap",
            ],
          },
          {
            title: "Developers",
            links: [
              "Documentation",
              "API Reference",
              "SDKs",
              "Status",
              "GitHub",
            ],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Press", "Contact"],
          },
          {
            title: "Legal",
            links: ["Privacy", "Terms", "Security", "Cookies", "Compliance"],
          },
        ]
    const footerLegal = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : []
    const footerCopyright =
      props.footer?.copyright ??
      `\u00a9 ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`

    const BoltMark = ({ className }: { className?: string }) => (
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
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </span>
    )

    const Check = () => (
      <svg
        className="mt-0.5 size-5 flex-shrink-0 text-chart-1"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="5 13 9 17 19 7" />
      </svg>
    )

    const Star = () => (
      <svg
        className="size-5 text-primary"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const ChevronRight = () => (
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
        <polyline points="9 5 16 12 9 19" />
      </svg>
    )

    const featureIcons: ReactNode[] = [
      <svg
        key="bolt"
        className="size-6"
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
        key="db"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
        <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
      </svg>,
      <svg
        key="lock"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>,
      <svg
        key="bars"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>,
      <svg
        key="pie"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21.21 15.89A10 10 0 118 2.83" />
        <path d="M22 12A10 10 0 0012 2v10z" />
      </svg>,
      <svg
        key="code"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>,
    ]

    const featureColors = [
      "bg-primary/20 text-primary",
      "bg-secondary/20 text-secondary",
      "bg-chart-1/20 text-chart-1",
      "bg-chart-2/20 text-chart-2",
      "bg-chart-3/20 text-chart-3",
      "bg-chart-4/20 text-chart-4",
    ]

    const galleryColors = [
      "text-primary",
      "text-secondary",
      "text-chart-1",
      "text-chart-2",
      "text-chart-3",
      "text-chart-4",
    ]

    const stepColors = ["bg-primary", "bg-secondary", "bg-chart-1"]

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header
          className="sticky top-0 z-50 border-b border-border/50 bg-background/50 backdrop-blur-xl"
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <BoltMark className="size-8" />
                <span className="text-xl font-semibold text-foreground">
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
                  onClick={() => go("Sign In")}
                  className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="inline-flex items-center rounded-lg bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Start free trial
                </button>
              </div>
            </div>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section
            className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10"
            aria-labelledby="hero-heading"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-40 -right-40 size-96 rounded-full bg-primary/30 blur-3xl animate-pulse" />
              <div
                className="absolute top-1/2 -left-40 size-80 rounded-full bg-secondary/20 blur-3xl animate-pulse"
                style={{ animationDelay: "2s" }}
              />
            </div>
            <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8 lg:pt-32 lg:pb-24">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-card/40 border border-border/50 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm">
                    <span className="size-2 animate-pulse rounded-full bg-chart-1" />
                    {heroBadge}
                  </div>
                  <h1
                    id="hero-heading"
                    className="mb-6 text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl"
                  >
                    {heroHeading}{" "}
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {heroHighlight}
                    </span>
                  </h1>
                  <p className="mb-8 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto lg:mx-0">
                    {heroSub}
                  </p>
                  <div className="flex flex-col gap-4 justify-center lg:justify-start mb-8 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-8 py-4 font-semibold text-primary-foreground transition-opacity hover:opacity-90 text-center shadow-xl"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-xl bg-card/40 border border-border/50 px-8 py-4 font-semibold text-foreground transition-colors hover:bg-card/60 backdrop-blur-sm text-center"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex flex-col items-center gap-4 justify-center text-sm text-muted-foreground sm:flex-row lg:justify-start">
                    <div className="flex items-center gap-2">
                      <Check />
                      <span>{heroFootLeft}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check />
                      <span>{heroFootRight}</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-xl p-6 shadow-2xl">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex gap-1.5">
                        <div className="size-3 rounded-full bg-destructive" />
                        <div className="size-3 rounded-full bg-chart-3" />
                        <div className="size-3 rounded-full bg-chart-1" />
                      </div>
                      <span className="ml-4 font-mono text-xs text-muted-foreground">
                        {heroCodeFile}
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <pre className="font-mono text-sm leading-relaxed text-foreground/90">
                        <code>{heroCode}</code>
                      </pre>
                    </div>
                  </div>
                  <div className="absolute -bottom-6 -right-6 rounded-xl border border-border bg-card/80 backdrop-blur-xl p-4 shadow-xl hidden sm:block">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-full bg-chart-1/20">
                        <svg
                          className="size-5 text-chart-1"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {statusTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {statusSubtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section
            className="relative border-y border-border/20 py-12 bg-muted/20 backdrop-blur-sm"
            aria-label="Trusted companies"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-3 lg:grid-cols-6">
                {logoCompanies.map((company) => (
                  <div
                    key={company}
                    className="flex items-center justify-center"
                  >
                    <button
                      type="button"
                      onClick={() => go(company)}
                      className="text-lg font-semibold text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {company}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-24 lg:py-32" aria-labelledby="features-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2
                  id="features-heading"
                  className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
                >
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="group rounded-2xl bg-card/40 border border-border backdrop-blur-xl p-6 lg:p-8 transition-all hover:bg-card/60"
                  >
                    <div
                      className={cn(
                        "mb-4 grid size-12 place-items-center rounded-xl transition-transform group-hover:scale-110",
                        featureColors[i % featureColors.length],
                      )}
                    >
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => go(item.title)}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      {featuresLearnMore}
                      <ChevronRight />
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section
            className="relative bg-gradient-to-b from-background via-muted/30 to-background py-24 lg:py-32"
            aria-labelledby="steps-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2
                  id="steps-heading"
                  className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
                >
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    {i < stepItems.length - 1 ? (
                      <div
                        aria-hidden="true"
                        className="absolute top-8 left-1/2 -z-10 hidden h-0.5 w-full md:block"
                        style={{
                          background:
                            i === 0
                              ? "linear-gradient(to right, hsl(var(--primary)), transparent)"
                              : i === 1
                                ? "linear-gradient(to right, transparent, hsl(var(--secondary)), transparent)"
                                : "linear-gradient(to left, hsl(var(--chart-1)), transparent)",
                        }}
                      />
                    ) : null}
                    <div className="text-center">
                      <div
                        className={cn(
                          "mx-auto mb-6 grid size-16 place-items-center rounded-2xl text-2xl font-bold text-primary-foreground shadow-lg",
                          stepColors[i % stepColors.length],
                        )}
                      >
                        {i + 1}
                      </div>
                      <h3 className="mb-3 text-xl font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="py-24 lg:py-32" aria-labelledby="gallery-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2
                  id="gallery-heading"
                  className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
                >
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {galleryDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((item, i) => (
                  <figure
                    key={item.title}
                    className="group relative overflow-hidden rounded-2xl bg-card/40 border border-border backdrop-blur-xl"
                  >
                    <button
                      type="button"
                      onClick={() => go(item.title)}
                      className="block w-full overflow-hidden"
                    >
                      <Image
                        alt={item.imageAlt}
                        w={800}
                        h={500}
                        loading="lazy"
                        className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </button>
                    <figcaption className="p-6">
                      <p
                        className={cn(
                          "mb-2 text-xs font-medium uppercase tracking-wider",
                          galleryColors[i % galleryColors.length],
                        )}
                      >
                        {item.tag}
                      </p>
                      <h3 className="mb-2 text-lg font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.caption}
                      </p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section
            className="relative bg-gradient-to-b from-background via-muted/30 to-background py-24 lg:py-32"
            aria-labelledby="stats-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2
                  id="stats-heading"
                  className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
                >
                  {statsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{statsDesc}</p>
              </div>
              <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                {statItems.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl bg-card/40 border border-border backdrop-blur-xl p-6 lg:p-8 text-center"
                  >
                    <div className="mb-2 text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent lg:text-5xl">
                      {s.value}
                    </div>
                    <p className="text-muted-foreground font-medium">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section
            className="py-24 lg:py-32"
            id="pricing"
            aria-labelledby="pricing-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2
                  id="pricing-heading"
                  className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
                >
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <article
                    key={tier.name}
                    className={cn(
                      "relative rounded-2xl p-8 backdrop-blur-xl",
                      tier.featured
                        ? "border-2 border-primary/50 bg-gradient-to-b from-primary/20 to-secondary/20"
                        : "border border-border bg-card/40",
                    )}
                  >
                    {tier.featured ? (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-1 text-xs font-bold text-primary-foreground">
                        {popularLabel}
                      </div>
                    ) : null}
                    <h3 className="mb-2 text-xl font-semibold text-foreground">
                      {tier.name}
                    </h3>
                    <p className="mb-6 text-sm text-muted-foreground">
                      {tier.tagline}
                    </p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-foreground">
                        {tier.price}
                      </span>
                      {tier.period ? (
                        <span className="text-muted-foreground">
                          {tier.period}
                        </span>
                      ) : null}
                    </div>
                    <ul className="mb-8 space-y-3">
                      {tier.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-3 text-sm text-muted-foreground"
                        >
                          <Check />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className={cn(
                        "block w-full rounded-xl px-4 py-3 text-center font-semibold transition-all",
                        tier.featured
                          ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg hover:opacity-90"
                          : "border border-border bg-card/60 text-foreground hover:bg-card/80",
                      )}
                    >
                      {tier.cta}
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            className="relative bg-gradient-to-b from-background via-muted/30 to-background py-24 lg:py-32"
            aria-labelledby="testimonials-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2
                  id="testimonials-heading"
                  className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
                >
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-2xl border border-border bg-card/40 p-6 backdrop-blur-xl"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map((n) => (
                        <Star key={n} />
                      ))}
                    </div>
                    <p className="mb-6 text-muted-foreground">{t.quote}</p>
                    <footer className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <cite className="font-semibold not-italic text-foreground">
                          {t.name}
                        </cite>
                        <p className="text-sm text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section
            className="py-24 lg:py-32"
            aria-labelledby="faq-heading"
          >
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2
                  id="faq-heading"
                  className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
                >
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-2xl border border-border bg-card/40 backdrop-blur-xl"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="font-semibold text-foreground">
                        {item.question}
                      </span>
                      <svg
                        className="size-5 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
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
                    </summary>
                    <div className="px-6 pb-6 text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section
            className="relative py-24 lg:py-32"
            aria-labelledby="cta-heading"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute left-1/2 top-1/2 size-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2
                id="cta-heading"
                className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl"
              >
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="rounded-xl bg-gradient-to-r from-primary to-secondary px-8 py-4 font-semibold text-primary-foreground shadow-xl transition-opacity hover:opacity-90"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="rounded-xl border border-border bg-card/40 px-8 py-4 font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-card/60"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-8 text-sm text-muted-foreground">
                {ctaFootnote}
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer
          className="relative border-t border-border/50 bg-muted/20 backdrop-blur-xl"
          role="contentinfo"
        >
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <BoltMark className="size-8" />
                  <span className="text-xl font-bold text-foreground">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                  {footerBlurb}
                </p>
                <div className="flex gap-4">
                  {[
                    {
                      name: "Twitter",
                      path: "M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84",
                    },
                    {
                      name: "GitHub",
                      path: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z",
                    },
                    {
                      name: "Discord",
                      path: "M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z",
                    },
                  ].map(({ name, path }) => (
                    <button
                      key={name}
                      type="button"
                      aria-label={name}
                      onClick={() => go(name)}
                      className="grid size-10 place-items-center rounded-lg bg-card/40 text-muted-foreground transition-all hover:bg-card/60 hover:text-foreground"
                    >
                      <svg
                        className="size-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d={path} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h3 className="mb-4 font-semibold text-foreground">
                    {col.title}
                  </h3>
                  <ul className="space-y-3 text-sm">
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
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">{footerCopyright}</p>
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
                <span className="inline-flex items-center gap-2 rounded-full bg-card/40 px-3 py-1 text-xs text-muted-foreground">
                  <span className="size-2 rounded-full bg-chart-1" />
                  All systems operational
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
