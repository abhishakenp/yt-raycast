import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * DocsKimiPage2 — ALTERNATIVE / SECOND-STYLE developer documentation home, a sibling
 * to DocsKimiPage with a deliberately DISTINCT look and mood.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "FlowStack Docs" design: a bold,
 * dark, marketing-flavoured documentation landing page (vs. the calmer light,
 * purely-reference DocsKimiPage). It pairs a sticky blurred top navbar carrying an
 * inline search field + ⌘K hint + live version pill with a persistent grouped left
 * sidebar, then a wide reading column that OPENS with a confident headline hero
 * (gradient-clipped title, version badge, dual CTAs and a four-up stat row) — unlike
 * the no-hero sibling. Below the hero: a colorful getting-started quickstart card
 * grid (CLI / Docker / Cloud / SDK / API / Templates with rotating accent tiles and
 * inline shell snippets), a framed code-example panel with traffic-light window
 * chrome, a filename tab bar, a syntax-styled TypeScript workflow snippet, a line/size
 * footer and language tabs, a two-column core-features list with icon tiles, a
 * three-up developer testimonials grid (five-star ratings + author headshots), a
 * full-bleed gradient call-to-action band with trust chips, and a four-column footer
 * with social links.
 *
 * The block owns ALL layout, spacing, code styling and type hierarchy. Colors map to
 * semantic theme tokens only — the dark page surface → background/foreground, panels
 * → card/muted, the rose brand → primary, the sky accent + multi-color icon tiles and
 * syntax tokens rotate primary/secondary/accent/chart-1..5, dark code surfaces invert
 * to foreground/background. Every nav item, sidebar link, CTA, card, footer link,
 * social icon and both search forms route through `useNavigate` (never a dead "#");
 * the navbar labels match the `nav` array so PageSwitch can swap pages. Callers supply
 * ONLY content data; rich defaults make it render great with no props at all.
 */
export const DocsKimiPage2 = defineComponent({
  name: "DocsKimiPage2",
  description:
    "ALTERNATIVE / second-style developer DOCUMENTATION / docs-home / developer-portal page — a visually DISTINCT sibling to DocsKimiPage. A bold, dark, marketing-flavoured documentation landing for a workflow-automation / API platform: sticky blurred top navbar with an inline search field (⌘K hint), GitHub link and a live version pill; a persistent grouped left sidebar (Getting Started / Core Features / API Reference / Deployment / Resources); and a wide reading column that OPENS with a confident gradient-title hero (version badge, Start Building + Watch Demo CTAs and a four-up stats row — unlike the no-hero sibling). Then a colorful getting-started quickstart card grid (CLI Quickstart / Docker Compose / Cloud Platform / SDK Integration / API Reference / Templates Gallery with rotating accent icon tiles and inline shell snippets), a framed code-example panel with traffic-light window chrome, filename tab, a syntax-highlighted TypeScript workflow snippet, line/size footer and language tabs, a two-column core-features list (event-driven, error handling, encryption, observability, integrations, branching), a three-up developer testimonials grid (five-star ratings + author headshots), a full-bleed gradient call-to-action band with trust chips, and a four-column footer with social links. Use as a docs home, getting-started, developer portal, SDK/quickstart guide, knowledge base or technical-documentation index when a punchier, darker, code-and-marketing docs landing is wanted (pick this over DocsKimiPage for a bolder, hero-led second style). Supply content only — brand, nav, sidebar, hero, quickstart, codeExample, features, testimonials, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / product name shown in the navbar, sidebar context and footer. */
    brand: z.string().optional(),
    /** Top-level navbar / sidebar group labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navbar search placeholder, version pill + GitHub label + primary nav CTA. */
    topbar: z
      .object({
        searchPlaceholder: z.string().optional(),
        version: z.string().optional(),
        githubLabel: z.string().optional(),
        ctaLabel: z.string().optional(),
      })
      .optional(),
    /** Left-sidebar grouped navigation. */
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
    /** Opening hero block in the reading column (badge + gradient title + CTAs + stats). */
    hero: z
      .object({
        badge: z.string().optional(),
        changelogLabel: z.string().optional(),
        title: z.string().optional(),
        titleAccent: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Getting-started quickstart card grid. */
    quickstart: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        cards: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              code: z.string().optional(),
              badge: z.string().optional(),
              meta: z.string().optional(),
              tags: z.array(z.string()).optional(),
              langs: z.array(z.string()).optional(),
              cta: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Framed code-example panel with window chrome + language tabs. */
    codeExample: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        fileName: z.string().optional(),
        language: z.string().optional(),
        code: z.string().optional(),
        lines: z.string().optional(),
        size: z.string().optional(),
        playgroundCta: z.string().optional(),
        tabs: z.array(z.string()).optional(),
      })
      .optional(),
    /** Two-column core-features list. */
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Developer testimonials grid (rating + quote + author headshot). */
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
    /** Full-bleed gradient call-to-action band. */
    cta: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        chips: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        note: z.string().optional(),
        legal: z.array(z.string()).optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "FlowStack"
    const nav = props.nav?.length
      ? props.nav
      : ["Getting Started", "Core Features", "API Reference", "Deployment"]

    const searchPlaceholder =
      props.topbar?.searchPlaceholder ?? "Search documentation..."
    const version = props.topbar?.version ?? "v3.2.1"
    const githubLabel = props.topbar?.githubLabel ?? "GitHub"
    const topCta = props.topbar?.ctaLabel ?? "Get Started"

    const sidebarGroups = props.sidebar?.groups?.length
      ? props.sidebar.groups
      : [
          {
            title: "Getting Started",
            items: [
              "Introduction",
              "Quick Start",
              "Installation",
              "Core Concepts",
              "Architecture",
            ],
          },
          {
            title: "Core Features",
            items: [
              "Workflow Builder",
              "Event System",
              "State Management",
              "Integrations",
              "Webhooks",
            ],
          },
          {
            title: "API Reference",
            items: [
              "REST API",
              "GraphQL",
              "SDK - Node.js",
              "SDK - Python",
              "SDK - Go",
              "WebSocket API",
            ],
          },
          {
            title: "Deployment",
            items: ["Cloud Hosting", "Self-Hosted", "Docker", "Kubernetes"],
          },
          {
            title: "Resources",
            items: [
              "Changelog",
              "Migration Guide",
              "Troubleshooting",
              "Community",
            ],
          },
        ]

    const heroBadge = props.hero?.badge ?? "v3.2.1 Released May 28, 2026"
    const heroChangelog = props.hero?.changelogLabel ?? "View Changelog"
    const heroTitle = props.hero?.title ?? "Build workflows"
    const heroTitleAccent = props.hero?.titleAccent ?? "that scale forever"
    const heroDesc =
      props.hero?.description ??
      "FlowStack is the modern workflow automation platform for developers. Design, deploy, and monitor event-driven workflows with TypeScript-native APIs and enterprise-grade reliability."
    const heroPrimary = props.hero?.primaryCta ?? "Start Building"
    const heroSecondary = props.hero?.secondaryCta ?? "Watch Demo"
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: "50M+", label: "Workflows Executed Daily" },
          { value: "99.99%", label: "Uptime SLA" },
          { value: "<50ms", label: "Average Latency" },
          { value: "12k+", label: "Active Developers" },
        ]

    const quickstartHeading = props.quickstart?.heading ?? "Getting Started"
    const quickstartDesc =
      props.quickstart?.description ??
      "Choose your path. Get up and running with FlowStack in minutes, whether you prefer the CLI, Docker, or our managed cloud platform."
    const quickstartCards = props.quickstart?.cards?.length
      ? props.quickstart.cards
      : [
          {
            title: "CLI Quickstart",
            description:
              "Install the FlowStack CLI and scaffold your first workflow project in 60 seconds.",
            code: "npm install -g @flowstack/cli",
            cta: "Start with CLI",
          },
          {
            title: "Docker Compose",
            description:
              "Self-host FlowStack locally with our official Docker Compose configuration.",
            code: "docker compose up -d",
            cta: "Docker Guide",
          },
          {
            title: "Cloud Platform",
            description:
              "Deploy to our managed cloud in one click. Free tier includes 10,000 executions/month.",
            badge: "Free Tier",
            meta: "No credit card required",
            cta: "Deploy to Cloud",
          },
          {
            title: "SDK Integration",
            description:
              "Native SDKs for Node.js, Python, Go, and Ruby with full TypeScript support.",
            langs: ["JS", "PY", "GO", "RB"],
            cta: "SDK Documentation",
          },
          {
            title: "API Reference",
            description:
              "Complete REST, GraphQL, and WebSocket API documentation with interactive examples.",
            tags: ["REST", "GraphQL", "WebSocket"],
            cta: "Browse APIs",
          },
          {
            title: "Templates Gallery",
            description:
              "Pre-built workflow templates for e-commerce, SaaS, fintech, and AI integrations.",
            meta: "42 templates · Community powered",
            cta: "Browse Templates",
          },
        ]

    const codeHeading = props.codeExample?.heading ?? "Code Example"
    const codeDesc =
      props.codeExample?.description ??
      "Build powerful workflows with TypeScript-native syntax. Define steps, handle errors, and manage state with ease."
    const codeFile = props.codeExample?.fileName ?? "workflow.ts"
    const codeLang = props.codeExample?.language ?? "TypeScript"
    const codeBody =
      props.codeExample?.code ??
      `import { Workflow, Step, Event } from '@flowstack/core';
import { sendEmail } from './integrations/email';
import { processPayment } from './integrations/stripe';

// Define a workflow for order processing
const orderWorkflow = new Workflow({
  name: 'order-processing',
  idempotencyKey: 'orderId',
  retries: 3,
  timeout: '5m',
});

// Step 1: Validate order
orderWorkflow.addStep({
  name: 'validate-order',
  async execute({ context }) {
    const order = await fetchOrder(context.orderId);

    if (!order.isValid()) {
      throw new ValidationError('Order validation failed');
    }

    return { validated: true, order };
  },
});

// Step 2: Process payment
orderWorkflow.addStep({
  name: 'process-payment',
  async execute({ context, previousOutput }) {
    const { order } = previousOutput;

    const payment = await processPayment({
      amount: order.total,
      currency: order.currency,
      customerId: order.customerId,
      metadata: { orderId: order.id },
    });

    return { paymentId: payment.id, status: payment.status };
  },
});

// Step 3: Send confirmation email
orderWorkflow.addStep({
  name: 'send-confirmation',
  async execute({ context, previousOutput }) {
    await sendEmail({
      to: context.customerEmail,
      template: 'order-confirmed',
      data: {
        orderId: context.orderId,
        paymentId: previousOutput.paymentId,
      },
    });

    return { emailSent: true };
  },
});

// Deploy the workflow
export default orderWorkflow;`
    const codeLines = props.codeExample?.lines ?? "43 lines"
    const codeSize = props.codeExample?.size ?? "1.2 KB"
    const playgroundCta =
      props.codeExample?.playgroundCta ?? "Try it in Playground"
    const codeTabs = props.codeExample?.tabs?.length
      ? props.codeExample.tabs
      : ["TypeScript", "Python", "Go", "cURL"]

    const featuresHeading = props.features?.heading ?? "Core Features"
    const featuresDesc =
      props.features?.description ??
      "Everything you need to build, deploy, and scale workflow automation at any size."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Event-Driven Architecture",
            description:
              "Trigger workflows from HTTP webhooks, scheduled jobs, database changes, or message queues. Handle millions of events with automatic partitioning.",
          },
          {
            title: "Built-in Error Handling",
            description:
              "Automatic retries with exponential backoff, dead letter queues, and circuit breakers. Never lose a workflow execution due to transient failures.",
          },
          {
            title: "End-to-End Encryption",
            description:
              "All workflow data encrypted at rest and in transit. SOC 2 Type II certified with support for bring-your-own-key encryption policies.",
          },
          {
            title: "Real-time Observability",
            description:
              "Built-in metrics, distributed tracing, and structured logging. Integrate with Datadog, Grafana, or export to any OpenTelemetry collector.",
          },
          {
            title: "200+ Integrations",
            description:
              "Native connectors for Stripe, Slack, Salesforce, AWS, GCP, and more. Build custom integrations with our SDK in under 30 minutes.",
          },
          {
            title: "Branching & Parallelism",
            description:
              "Execute steps in parallel, create conditional branches, and implement fan-out/fan-in patterns. Visual workflow builder included.",
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Trusted by Developers"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See how engineering teams use FlowStack to automate critical workflows."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "FlowStack cut our payment processing time by 80%. The TypeScript SDK is a joy to work with and the debugging tools saved us countless hours.",
            name: "Marcus Chen",
            role: "VP Engineering at Payloom",
            avatarAlt:
              "professional headshot of a senior engineering manager in a navy blazer",
          },
          {
            quote:
              "We migrated 47 cron jobs to FlowStack workflows in one week. The observability is incredible — we can finally trace exactly what happens when things go wrong.",
            name: "Sarah Okafor",
            role: "Principal Architect at DataSync",
            avatarAlt:
              "professional headshot of a female software architect with glasses",
          },
          {
            quote:
              "The self-hosted option was crucial for our HIPAA compliance. We run FlowStack on our own infrastructure with full data sovereignty. Support has been phenomenal.",
            name: "David Park",
            role: "CTO at HealthBridge",
            avatarAlt:
              "professional headshot of a male CTO with short dark hair",
          },
        ]

    const ctaTitle =
      props.cta?.title ?? "Ready to automate your workflows?"
    const ctaDesc =
      props.cta?.description ??
      "Join 12,000+ developers building with FlowStack. Start free, scale as you grow."
    const ctaPrimary = props.cta?.primaryCta ?? "Get Started Free"
    const ctaSecondary = props.cta?.secondaryCta ?? "Talk to Sales"
    const ctaChips = props.cta?.chips?.length
      ? props.cta.chips
      : ["Free forever tier", "No credit card required", "14-day Pro trial"]

    const footerTagline =
      props.footer?.tagline ??
      "The modern workflow automation platform for developers who demand reliability, scale, and elegant APIs."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: [
              "Features",
              "Integrations",
              "Pricing",
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
              "Community",
              "Status",
            ],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Security", "Contact"],
          },
        ]
    const footerNote = props.footer?.note ?? "All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["GitHub", "Twitter", "Discord", "YouTube"]

    // Brand logo tile — rose→sky gradient square with a bolt glyph (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground",
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
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
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
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="18"
        height="18"
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

    const StarIcon = () => (
      <svg
        className="size-5 text-chart-4"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    // Quickstart card icon tiles (rotate token tints, multi-color decorative set).
    const cardIcons: ReactNode[] = [
      // terminal / cli
      <svg
        key="terminal"
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
        <path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>,
      // docker / cube
      <svg
        key="cube"
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
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>,
      // cloud
      <svg
        key="cloud"
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
        <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>,
      // code / sdk
      <svg
        key="code"
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
        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>,
      // document / api
      <svg
        key="doc"
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
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>,
      // templates / grid
      <svg
        key="grid"
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
        <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>,
    ]

    // Core-feature icon set (rotates token tints).
    const featureIcons: ReactNode[] = [
      <svg
        key="bolt"
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
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      <svg
        key="check"
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
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg
        key="lock"
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
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>,
      <svg
        key="chart"
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
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      <svg
        key="cog"
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
        <path d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>,
      <svg
        key="branch"
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
        <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>,
    ]

    // Token tints rotate across the quickstart / feature icon tiles (no raw palette).
    const tileTints = [
      "bg-primary/10 text-primary",
      "bg-secondary/10 text-secondary",
      "bg-chart-3/10 text-chart-3",
      "bg-chart-2/10 text-chart-2",
      "bg-chart-4/10 text-chart-4",
      "bg-chart-5/10 text-chart-5",
    ]

    const socialIcon = (name: string) => {
      const n = name.toLowerCase()
      if (n.includes("git")) {
        return (
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        )
      }
      if (n.includes("discord")) {
        return (
          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6521-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0025-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z" />
        )
      }
      if (n.includes("you")) {
        return (
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        )
      }
      // twitter / x default
      return (
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      )
    }

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
          <nav
            className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-16 items-center justify-between lg:h-20">
              {/* Logo */}
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-3"
              >
                <LogoMark className="size-10" />
                <span className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-foreground lg:text-2xl">
                    {brand}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    Docs
                  </span>
                </span>
              </button>

              {/* Desktop search */}
              <form
                className="mx-8 hidden max-w-xl flex-1 md:flex lg:mx-12"
                onSubmit={(e) => {
                  e.preventDefault()
                  go(nav[0])
                }}
              >
                <div className="relative w-full">
                  <label htmlFor="docs2-nav-search" className="sr-only">
                    Search documentation
                  </label>
                  <input
                    type="search"
                    id="docs2-nav-search"
                    placeholder={searchPlaceholder}
                    className="w-full rounded-lg border border-input bg-muted py-2.5 pl-11 pr-20 text-sm text-foreground placeholder-muted-foreground transition-all focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
                  />
                  <SearchIcon className="pointer-events-none absolute left-4 top-3 size-5 text-muted-foreground" />
                  <kbd className="absolute right-3 top-2.5 hidden rounded border border-border bg-card px-2 py-1 font-mono text-xs text-muted-foreground sm:inline-block">
                    ⌘K
                  </kbd>
                </div>
              </form>

              {/* Right actions */}
              <div className="flex items-center gap-3 lg:gap-4">
                <span className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
                  <span className="size-2 animate-pulse rounded-full bg-chart-2" />
                  {version}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    go(
                      footerSocials.find((s) =>
                        s.toLowerCase().includes("git"),
                      ) ?? githubLabel,
                    )
                  }
                  className="hidden items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    {socialIcon("github")}
                  </svg>
                  {githubLabel}
                </button>
                <button
                  type="button"
                  onClick={() => go(topCta)}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90 lg:px-5 lg:py-2.5"
                >
                  {topCta}
                  <ArrowRight className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Toggle menu"
                  onClick={() => go(nav[0])}
                  className="p-2 text-muted-foreground hover:text-foreground lg:hidden"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </nav>
        </header>

        <div className="mx-auto flex max-w-[1600px]">
          {/* Sidebar */}
          <aside
            className="hidden w-64 shrink-0 border-r border-border bg-background lg:block xl:w-72"
            aria-label="Documentation navigation"
          >
            <nav className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto px-6 py-8 space-y-8">
              {sidebarGroups.map((group, gi) => (
                <div key={group.title}>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
                              "block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                              active
                                ? "border-l-2 border-primary bg-primary/10 font-medium text-primary"
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
          <main className="min-w-0 flex-1">
            {/* Hero */}
            <section className="relative overflow-hidden px-4 pb-12 pt-16 sm:px-6 lg:px-8 lg:pb-16 lg:pt-24 xl:px-12">
              <div
                className="pointer-events-none absolute inset-0 overflow-hidden"
                aria-hidden="true"
              >
                <div className="absolute -right-1/4 -top-1/2 size-[800px] rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -left-1/4 top-1/3 size-[600px] rounded-full bg-secondary/10 blur-3xl" />
              </div>

              <div className="relative max-w-5xl">
                {/* Version badge */}
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    {heroBadge}
                  </span>
                  <button
                    type="button"
                    onClick={() => go(heroChangelog)}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-secondary"
                  >
                    {heroChangelog}
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
                      <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </div>

                <h1 className="mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
                  {heroTitle}
                  <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                    {heroTitleAccent}
                  </span>
                </h1>

                <p className="mb-10 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl lg:text-2xl">
                  {heroDesc}
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-lg font-semibold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
                  >
                    {heroPrimary}
                    <ArrowRight className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-lg font-semibold text-card-foreground transition-all hover:bg-muted"
                  >
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
                      <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {heroSecondary}
                  </button>
                </div>

                {/* Stats */}
                <div className="mt-12 grid grid-cols-2 gap-6 border-t border-border pt-12 sm:grid-cols-4">
                  {heroStats.map((stat) => (
                    <div key={stat.label}>
                      <div className="text-2xl font-bold text-foreground sm:text-3xl">
                        {stat.value}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Getting started / quickstart cards */}
            <section className="border-t border-border px-4 py-16 sm:px-6 lg:px-8 lg:py-20 xl:px-12">
              <div className="max-w-5xl">
                <div className="mb-10">
                  <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                    {quickstartHeading}
                  </h2>
                  <p className="max-w-2xl text-lg text-muted-foreground">
                    {quickstartDesc}
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {quickstartCards.map((card, i) => (
                    <button
                      key={card.title}
                      type="button"
                      onClick={() => go(card.cta)}
                      className="group relative rounded-2xl border border-border bg-card p-6 text-left transition-all hover:-translate-y-1 hover:border-primary/50"
                    >
                      <div
                        className={cn(
                          "mb-4 grid size-12 place-items-center rounded-xl transition-transform group-hover:scale-110",
                          tileTints[i % tileTints.length],
                        )}
                      >
                        {cardIcons[i % cardIcons.length]}
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-card-foreground">
                        {card.title}
                      </h3>
                      <p className="mb-4 text-muted-foreground">
                        {card.description}
                      </p>

                      {card.code ? (
                        <code className="mb-4 block rounded-lg bg-foreground px-3 py-2 font-mono text-sm text-background">
                          {card.code}
                        </code>
                      ) : null}

                      {card.badge ? (
                        <div className="mb-4 flex items-center gap-2">
                          <span className="rounded bg-secondary/10 px-2 py-1 text-xs font-medium text-secondary">
                            {card.badge}
                          </span>
                          {card.meta ? (
                            <span className="text-xs text-muted-foreground">
                              {card.meta}
                            </span>
                          ) : null}
                        </div>
                      ) : null}

                      {card.langs?.length ? (
                        <div className="mb-4 flex gap-2">
                          {card.langs.map((lang) => (
                            <span
                              key={lang}
                              className="grid size-8 place-items-center rounded bg-muted font-mono text-xs text-muted-foreground"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {card.tags?.length ? (
                        <div className="mb-4 flex items-center gap-2">
                          {card.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {!card.badge && card.meta ? (
                        <div className="mb-4 text-xs text-muted-foreground">
                          {card.meta}
                        </div>
                      ) : null}

                      <span className="inline-flex items-center gap-1.5 font-medium text-primary transition-colors group-hover:text-primary/80">
                        {card.cta}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Code example */}
            <section className="border-t border-border bg-muted/40 px-4 py-16 sm:px-6 lg:px-8 lg:py-20 xl:px-12">
              <div className="max-w-5xl">
                <div className="mb-10">
                  <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                    {codeHeading}
                  </h2>
                  <p className="max-w-2xl text-lg text-muted-foreground">
                    {codeDesc}
                  </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                  {/* Code header */}
                  <div className="flex items-center justify-between border-b border-border bg-card/80 px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2" aria-hidden="true">
                        <span className="size-3 rounded-full bg-destructive" />
                        <span className="size-3 rounded-full bg-chart-4" />
                        <span className="size-3 rounded-full bg-chart-2" />
                      </div>
                      <span className="h-6 w-px bg-border" />
                      <span className="text-sm font-medium text-muted-foreground">
                        {codeFile}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="hidden items-center gap-1.5 rounded bg-muted px-2 py-1 text-xs text-muted-foreground sm:inline-flex">
                        <svg
                          className="size-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {codeLang}
                      </span>
                      <button
                        type="button"
                        aria-label="Copy code"
                        onClick={() => go(codeFile)}
                        className="p-2 text-muted-foreground transition-colors hover:text-foreground"
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
                          aria-hidden="true"
                        >
                          <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Code content */}
                  <div className="overflow-x-auto bg-foreground p-4 sm:p-6">
                    <pre className="font-mono text-sm leading-relaxed text-background">
                      <code>{codeBody}</code>
                    </pre>
                  </div>

                  {/* Code footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card/50 px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{codeLines}</span>
                      <span className="hidden sm:inline">{codeSize}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => go(playgroundCta)}
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      {playgroundCta}
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
                        <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Language tabs */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {codeTabs.map((tab, i) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => go(tab)}
                      className={cn(
                        "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                        i === 0
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Core features */}
            <section className="border-t border-border px-4 py-16 sm:px-6 lg:px-8 lg:py-20 xl:px-12">
              <div className="max-w-5xl">
                <div className="mb-12">
                  <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                    {featuresHeading}
                  </h2>
                  <p className="max-w-2xl text-lg text-muted-foreground">
                    {featuresDesc}
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
                  {featureItems.map((feature, i) => (
                    <div
                      key={feature.title}
                      className="flex gap-4 rounded-xl border border-border/60 bg-card/40 p-6 transition-colors hover:border-border"
                    >
                      <div
                        className={cn(
                          "grid size-12 shrink-0 place-items-center rounded-lg",
                          tileTints[i % tileTints.length],
                        )}
                      >
                        {featureIcons[i % featureIcons.length]}
                      </div>
                      <div>
                        <h3 className="mb-1 text-lg font-bold text-foreground">
                          {feature.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Testimonials */}
            <section className="border-t border-border bg-gradient-to-b from-background to-muted/40 px-4 py-16 sm:px-6 lg:px-8 lg:py-20 xl:px-12">
              <div className="max-w-5xl">
                <div className="mb-12">
                  <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                    {testimonialsHeading}
                  </h2>
                  <p className="max-w-2xl text-lg text-muted-foreground">
                    {testimonialsDesc}
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {testimonialItems.map((t) => (
                    <blockquote
                      key={t.name}
                      className="rounded-xl border border-border bg-card p-6"
                    >
                      <div className="mb-4 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <StarIcon key={s} />
                        ))}
                      </div>
                      <p className="mb-6 leading-relaxed text-card-foreground">
                        {t.quote}
                      </p>
                      <footer className="flex items-center gap-3">
                        <Image
                          alt={t.avatarAlt}
                          w={80}
                          h={80}
                          className="size-10 rounded-full object-cover"
                        />
                        <div>
                          <cite className="font-medium not-italic text-foreground">
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

            {/* CTA band */}
            <section className="border-t border-border px-4 py-16 sm:px-6 lg:px-8 lg:py-24 xl:px-12">
              <div className="max-w-5xl">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-8 sm:p-12 lg:p-16">
                  <div
                    className="absolute right-0 top-0 size-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary-foreground/10 blur-3xl"
                    aria-hidden="true"
                  />
                  <div className="relative max-w-2xl">
                    <h2 className="mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
                      {ctaTitle}
                    </h2>
                    <p className="mb-8 text-lg text-primary-foreground/80 sm:text-xl">
                      {ctaDesc}
                    </p>

                    <div className="flex flex-wrap gap-4">
                      <button
                        type="button"
                        onClick={() => go(ctaPrimary)}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary-foreground px-6 py-3.5 text-lg font-semibold text-primary transition-all hover:scale-105 hover:bg-primary-foreground/90"
                      >
                        {ctaPrimary}
                        <ArrowRight className="size-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => go(ctaSecondary)}
                        className="inline-flex items-center gap-2 rounded-xl border border-primary-foreground/30 bg-primary-foreground/10 px-6 py-3.5 text-lg font-semibold text-primary-foreground transition-all hover:bg-primary-foreground/20"
                      >
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
                          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {ctaSecondary}
                      </button>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-primary-foreground/30 pt-8">
                      {ctaChips.map((chip) => (
                        <div
                          key={chip}
                          className="flex items-center gap-2 text-sm text-primary-foreground/80"
                        >
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
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                          {chip}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border bg-background px-4 py-12 sm:px-6 lg:px-8 lg:py-16 xl:px-12">
              <div className="max-w-5xl">
                <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
                  <div className="sm:col-span-2 lg:col-span-1">
                    <button
                      type="button"
                      onClick={() => go(nav[0])}
                      className="mb-4 flex items-center gap-3"
                    >
                      <LogoMark className="size-10" />
                      <span className="text-xl font-bold text-foreground">
                        {brand}
                      </span>
                    </button>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {footerTagline}
                    </p>
                    <div className="flex items-center gap-4">
                      {footerSocials.map((social) => (
                        <button
                          key={social}
                          type="button"
                          aria-label={social}
                          onClick={() => go(social)}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            {socialIcon(social)}
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>

                  {footerColumns.map((col) => (
                    <div key={col.title}>
                      <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">
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

                <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
                  <p className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} {brand}, Inc. {footerNote}
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
            </footer>
          </main>
        </div>
      </div>
    )
  },
})
