import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * DevToolKimiPage2 — TEMPLATE VARIANT 2 for the dev-tool category, a deliberately
 * DISTINCT sibling to DevToolKimiPage.
 *
 * Where DevToolKimiPage is a clean, LIGHT, slate-and-blue layout, this is a bold,
 * DARK, glow-heavy "DevPulse" API-monitoring / observability landing page: a
 * full-bleed dark surface (the root carries the `dark` class so every semantic
 * token resolves to its dark value) with radial brand-glow blobs behind a
 * CENTERED hero (live status pill + gradient-highlighted headline + dual CTAs +
 * three inline trust ticks), a grayscale logo strip, a split "integrate in
 * minutes" section pairing benefit rows with a dark traffic-light code window, a
 * 6-up bordered feature grid, a big-number 3-step timeline, a 4-up metrics band,
 * a 3-tier pricing table (Most Popular highlight), three star-rated
 * testimonials, an open-able FAQ, a glow CTA band, and a 5-column footer with
 * social icons. Use this variant when a repeat dev-tool / API-platform request
 * should yield a darker, punchier, monitoring/analytics aesthetic instead of the
 * light DevToolKimiPage. Renders fully on defaults — callers supply content only.
 */
export const DevToolKimiPage2 = defineComponent({
  name: "DevToolKimiPage2",
  description:
    "Second, visually DISTINCT dev-tool / API-platform LANDING page — the DARK, glow-heavy alternative to DevToolKimiPage (which is light/blue). 'DevPulse' aesthetic: a full-bleed dark surface with radial brand-glow blobs, a CENTERED hero featuring a pulsing live-status pill, a bold headline with a gradient-highlighted phrase, dual CTAs and inline trust ticks (free trial / no credit card / cancel anytime); a grayscale trusted-by company logo strip; a split 'integrate in minutes' section pairing one-line-setup / real-time-streams / zero-overhead benefit rows with a dark traffic-light code window showing a syntax-highlighted SDK snippet; a 6-up bordered feature grid (real-time metrics, intelligent alerting, request tracing, team collaboration, custom reports, open API); a big-number numbered 3-step 'get started' timeline; a 4-up stats/metrics band (API calls monitored, uptime SLA, alert latency, teams); a 3-tier pricing table with a 'Most Popular' highlighted plan and checklist features; three star-rated developer testimonials with avatars; an expandable FAQ; a glow closing CTA band; and a 5-column footer with social icons and legal links. Choose this when an API monitoring / observability / analytics / developer-infrastructure / DevOps product wants a darker, punchier, conversion-focused page — pick it over DevToolKimiPage to get a different mood for repeat prompts. Supply content only — brand, nav, hero, logos, code, features, steps, stats, pricing, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / product name shown in the navbar, CTA and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Centered hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingTop: z.string().optional(),
        /** Phrase rendered in the brand-gradient accent. */
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        ticks: z.array(z.string()).optional(),
      })
      .optional(),
    /** Trusted-by logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        companies: z.array(z.string()).optional(),
      })
      .optional(),
    /** Split "integrate" section with code window. */
    code: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        benefits: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        /** Filename label on the code-window title bar. */
        file: z.string().optional(),
        /** Raw code shown in the code-window mockup. */
        snippet: z.string().optional(),
      })
      .optional(),
    /** Product features grid. */
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** "Get started" numbered steps. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Stats / metrics band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Pricing tiers. */
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
    /** Developer testimonials. */
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
    /** FAQ. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Closing CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        footnote: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        blurb: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        legalLinks: z.array(z.string()).optional(),
        copyright: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "DevPulse"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Pricing", "Docs", "Changelog"]

    const heroBadge = props.hero?.badge ?? "New: Edge Analytics Dashboard"
    const headingTop = props.hero?.headingTop ?? "Monitor APIs with"
    const heroHighlight = props.hero?.highlight ?? "Precision"
    const heroSub =
      props.hero?.subheading ??
      "Real-time API monitoring, intelligent alerting, and deep analytics. Track latency, errors, and usage patterns across all your endpoints. Trusted by teams at Stripe, Vercel, and Linear."
    const heroPrimary = props.hero?.primaryCta ?? "Start Free Trial"
    const heroSecondary = props.hero?.secondaryCta ?? "View Demo"
    const heroTicks = props.hero?.ticks?.length
      ? props.hero.ticks
      : ["Free 14-day trial", "No credit card required", "Cancel anytime"]

    const logosLabel =
      props.logos?.label ?? "Trusted by engineering teams at"
    const logoCompanies = props.logos?.companies?.length
      ? props.logos.companies
      : ["Stripe", "Vercel", "Linear", "Figma", "Notion", "Slack"]

    const codeHeading =
      props.code?.heading ?? "Integrate in minutes, not days"
    const codeDesc =
      props.code?.description ??
      "Drop in our SDK and start collecting metrics immediately. Works with any HTTP framework or language."
    const codeBenefits = props.code?.benefits?.length
      ? props.code.benefits
      : [
          {
            title: "One-line setup",
            description:
              "Install the npm package and wrap your router. That's it.",
          },
          {
            title: "Real-time streams",
            description:
              "See API calls appear in your dashboard within 100ms.",
          },
          {
            title: "Zero performance impact",
            description: "Async logging with < 0.1ms overhead per request.",
          },
        ]
    const codeFile = props.code?.file ?? "server.js"
    const codeSnippet =
      props.code?.snippet ??
      `import express from 'express';
import { devpulse } from '@devpulse/node';

const app = express();

// Initialize DevPulse monitoring
app.use(devpulse({
  apiKey: process.env.DEVPULSE_KEY,
  endpoint: 'https://api.devpulse.io/v1/ingest'
}));

app.get('/api/users', async (req, res) => {
  const users = await db.users.findAll();
  res.json({ users });
});

app.listen(3000);`

    const featuresHeading =
      props.features?.heading ?? "Everything you need to ship with confidence"
    const featuresDesc =
      props.features?.description ??
      "Comprehensive monitoring, alerting, and analytics for modern API teams."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Real-time Metrics",
            description:
              "Track latency percentiles, error rates, throughput, and payload sizes with sub-second granularity.",
          },
          {
            title: "Intelligent Alerting",
            description:
              "Get notified via Slack, PagerDuty, or webhook when anomalies are detected using ML-based thresholds.",
          },
          {
            title: "Request Tracing",
            description:
              "Trace requests across microservices with automatic correlation IDs and distributed tracing support.",
          },
          {
            title: "Team Collaboration",
            description:
              "Share dashboards, annotate incidents, and collaborate on post-mortems with built-in incident management.",
          },
          {
            title: "Custom Reports",
            description:
              "Generate PDF reports for stakeholders with SLA compliance, uptime statistics, and trend analysis.",
          },
          {
            title: "Open API",
            description:
              "Query your metrics via GraphQL or REST API. Export to Datadog, Grafana, or custom pipelines.",
          },
        ]

    const stepsHeading = props.steps?.heading ?? "Get started in three steps"
    const stepsDesc =
      props.steps?.description ??
      "From signup to insights in under five minutes."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Create your account",
            description:
              "Sign up with GitHub or email. No credit card required for the 14-day trial.",
          },
          {
            title: "Install the SDK",
            description:
              "npm install @devpulse/node and add two lines of code to your Express, Fastify, or Next.js app.",
          },
          {
            title: "View your dashboard",
            description:
              "Watch requests flow in real-time. Set up alerts and invite your team.",
          },
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "10B+", label: "API calls monitored daily" },
          { value: "99.99%", label: "Platform uptime SLA" },
          { value: "150ms", label: "Average alert latency" },
          { value: "10,000+", label: "Developer teams trust us" },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start free, scale as you grow. No hidden fees or surprises."
    const popularLabel = props.pricing?.popularLabel ?? "Most Popular"
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Starter",
            tagline: "For side projects",
            price: "$0",
            period: "/month",
            features: [
              "10K API calls / month",
              "1 team member",
              "7-day data retention",
              "Email support",
            ],
            cta: "Get Started Free",
            featured: false,
          },
          {
            name: "Pro",
            tagline: "For growing teams",
            price: "$49",
            period: "/month",
            features: [
              "1M API calls / month",
              "10 team members",
              "90-day data retention",
              "Slack & PagerDuty alerts",
              "Priority support",
            ],
            cta: "Start Free Trial",
            featured: true,
          },
          {
            name: "Enterprise",
            tagline: "For large organizations",
            price: "Custom",
            features: [
              "Unlimited API calls",
              "Unlimited team members",
              "1-year data retention",
              "SSO & SAML",
              "Dedicated support engineer",
            ],
            cta: "Contact Sales",
            featured: false,
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by developers"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See what engineering teams are saying about DevPulse."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "DevPulse caught a latency spike in our payment API that would have cost us thousands. The alerting is lightning-fast and the dashboard is intuitive.",
            name: "Marcus Chen",
            role: "Senior Engineer at FinFlow",
            avatarAlt:
              "professional headshot of a male software engineer with short brown hair and glasses",
          },
          {
            quote:
              "We migrated from DataDog and cut our observability costs by 60%. DevPulse gives us everything we need without the bloat. Incredible value.",
            name: "Sarah Mitchell",
            role: "VP Engineering at TaskBase",
            avatarAlt:
              "professional headshot of a female engineering manager with blonde hair smiling warmly",
          },
          {
            quote:
              "The request tracing feature helped us identify a database N+1 query problem we'd been chasing for weeks. Game changer for debugging microservices.",
            name: "David Park",
            role: "Staff Engineer at CloudScale",
            avatarAlt:
              "professional headshot of a male backend developer with curly dark hair and a beard",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ?? "Everything you need to know about DevPulse."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How does the 14-day free trial work?",
            answer:
              "Sign up with any email or GitHub account and get full access to all Pro features for 14 days. No credit card required. At the end of your trial, choose a plan or continue with our free tier.",
          },
          {
            question: "What SDKs and frameworks are supported?",
            answer:
              "We support Node.js (Express, Fastify, Next.js), Python (Django, FastAPI, Flask), Go (Gin, Echo), Ruby on Rails, and any language via our REST API. New SDKs ship monthly based on community requests.",
          },
          {
            question: "Is my API data secure?",
            answer:
              "Absolutely. We collect only metadata (latency, status codes, headers) never request or response bodies. Data is encrypted in transit and at rest. We're SOC 2 Type II certified and GDPR compliant.",
          },
          {
            question: "Can I export my data?",
            answer:
              "Yes. Export metrics to CSV, query via GraphQL API, or stream to Datadog, Grafana, and custom webhooks. Enterprise plans include automated daily exports to your S3 bucket.",
          },
          {
            question: "What happens if I exceed my API call limit?",
            answer:
              "We never drop data. Overages are billed at $0.001 per 100 calls (Starter) or $0.0005 per 100 calls (Pro). Enterprise plans include custom volume pricing with committed use discounts.",
          },
          {
            question: "Do you offer on-premise deployment?",
            answer:
              "Enterprise customers can deploy DevPulse in their own VPC or data center. Contact our sales team for details on air-gapped deployments and custom security requirements.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to monitor your APIs?"
    const ctaDesc =
      props.cta?.description ??
      "Join 10,000+ developers who trust DevPulse for mission-critical API monitoring. Start free, scale when you're ready."
    const ctaPrimary = props.cta?.primaryCta ?? "Start Free Trial"
    const ctaSecondary = props.cta?.secondaryCta ?? "Schedule Demo"
    const ctaFootnote =
      props.cta?.footnote ??
      "No credit card required. 14-day free trial on all paid plans."

    const footerBlurb =
      props.footer?.blurb ??
      "Real-time API monitoring and analytics for modern development teams."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: [
              "Features",
              "Pricing",
              "Changelog",
              "Documentation",
              "API Reference",
            ],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Press", "Partners"],
          },
          {
            title: "Resources",
            links: ["Community", "Support", "Status", "Security", "Contact"],
          },
        ]
    const footerLegal = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`

    // Brand bolt logo tile (decorative brand asset).
    const BoltMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground",
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
        <line x1="3" y1="12" x2="21" y2="12" />
        <polyline points="14 6 21 12 14 18" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-5 flex-shrink-0 text-primary", className)}
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

    const PlayIcon = () => (
      <svg
        className="size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <polygon points="10 9 15 12 10 15 10 9" />
      </svg>
    )

    const codeIcons: ReactNode[] = [
      // bolt — one-line setup
      <svg
        key="b0"
        className="size-5"
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
      // clock — real-time streams
      <svg
        key="b1"
        className="size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15 15" />
      </svg>,
      // shield — zero performance impact
      <svg
        key="b2"
        className="size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3l8 3v6c0 4.5-3.2 7.5-8 9-4.8-1.5-8-4.5-8-9V6l8-3z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>,
    ]

    const featureIcons: ReactNode[] = [
      // bars — real-time metrics
      <svg
        key="f0"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="6" y1="20" x2="6" y2="12" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="18" y1="20" x2="18" y2="9" />
      </svg>,
      // alert — intelligent alerting
      <svg
        key="f1"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>,
      // search — request tracing
      <svg
        key="f2"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16" y2="16" />
      </svg>,
      // users — team collaboration
      <svg
        key="f3"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>,
      // document — custom reports
      <svg
        key="f4"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <polyline points="14 3 14 8 19 8" />
        <line x1="9" y1="17" x2="9" y2="13" />
        <line x1="12" y1="17" x2="12" y2="11" />
        <line x1="15" y1="17" x2="15" y2="14" />
      </svg>,
      // code — open API
      <svg
        key="f5"
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

    const stepIcons: ReactNode[] = [
      // user-add — create account
      <svg
        key="s0"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>,
      // code — install sdk
      <svg
        key="s1"
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
      // chart — view dashboard
      <svg
        key="s2"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="6" y1="20" x2="6" y2="12" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="18" y1="20" x2="18" y2="9" />
      </svg>,
    ]

    return (
      <div
        className={cn(
          "dark min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header
          className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl"
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
                <span className="text-xl font-bold tracking-tight text-foreground">
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
                  onClick={() => go("Sign in")}
                  className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => go("Get Started")}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Get Started
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section
            className="relative overflow-hidden"
            aria-labelledby="hero-heading"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background" />
            <div
              aria-hidden="true"
              className="absolute left-1/4 top-20 size-96 rounded-full bg-primary/20 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute bottom-20 right-1/4 size-96 rounded-full bg-accent/20 blur-3xl"
            />
            <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-32 lg:pt-32">
              <div className="mx-auto max-w-4xl text-center">
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  <span className="size-2 animate-pulse rounded-full bg-primary" />
                  {heroBadge}
                </div>
                <h1
                  id="hero-heading"
                  className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-7xl"
                >
                  {headingTop}{" "}
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    {heroHighlight}
                  </span>
                </h1>
                <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  {heroSub}
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:bg-primary/90"
                  >
                    {heroPrimary}
                    <ArrowRight />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-8 py-4 font-semibold text-card-foreground transition-all hover:bg-muted"
                  >
                    <PlayIcon />
                    {heroSecondary}
                  </button>
                </div>
                <div className="mt-12 flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground sm:flex-row sm:gap-8">
                  {heroTicks.map((tick) => (
                    <span key={tick} className="flex items-center gap-2">
                      <Check className="size-5 text-primary" />
                      {tick}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section
            className="border-y border-border bg-muted/30"
            aria-label="Trusted companies"
          >
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 md:grid-cols-3 lg:grid-cols-6">
                {logoCompanies.map((company) => (
                  <button
                    key={company}
                    type="button"
                    onClick={() => go(company)}
                    className="text-center text-lg font-semibold text-muted-foreground/60 transition-colors hover:text-foreground"
                  >
                    {company}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Code / integrate */}
          <section
            className="relative py-24 lg:py-32"
            aria-labelledby="code-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div>
                  <h2
                    id="code-heading"
                    className="mb-4 text-3xl font-bold text-foreground lg:text-4xl"
                  >
                    {codeHeading}
                  </h2>
                  <p className="mb-8 text-lg text-muted-foreground">
                    {codeDesc}
                  </p>
                  <div className="space-y-4">
                    {codeBenefits.map((b, i) => (
                      <div key={b.title} className="flex items-start gap-4">
                        <div className="grid size-10 flex-shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                          {codeIcons[i % codeIcons.length]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {b.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {b.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 blur-xl"
                  />
                  <div className="relative overflow-hidden rounded-xl border border-border bg-card">
                    <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
                      <div className="flex gap-1.5">
                        <div className="size-3 rounded-full bg-destructive" />
                        <div className="size-3 rounded-full bg-chart-4" />
                        <div className="size-3 rounded-full bg-chart-2" />
                      </div>
                      <span className="ml-2 font-mono text-xs text-muted-foreground">
                        {codeFile}
                      </span>
                    </div>
                    <div className="overflow-x-auto p-4">
                      <pre className="font-mono text-sm leading-relaxed text-card-foreground/90">
                        <code>{codeSnippet}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section
            className="relative border-t border-border py-24 lg:py-32"
            aria-labelledby="features-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2
                  id="features-heading"
                  className="mb-4 text-3xl font-bold text-foreground lg:text-5xl"
                >
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="group rounded-2xl border border-border bg-card/50 p-6 transition-all hover:-translate-y-1 hover:border-primary/50"
                  >
                    <div className="mb-4 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section
            className="relative border-t border-border py-24 lg:py-32"
            aria-labelledby="steps-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2
                  id="steps-heading"
                  className="mb-4 text-3xl font-bold text-foreground lg:text-5xl"
                >
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div
                      aria-hidden="true"
                      className="absolute -top-4 left-0 text-7xl font-bold text-muted-foreground/20"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="relative pt-8">
                      <div className="mb-4 grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                        {stepIcons[i % stepIcons.length]}
                      </div>
                      <h3 className="mb-2 text-xl font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section
            className="relative border-t border-border bg-gradient-to-b from-muted/30 to-background py-24 lg:py-32"
            aria-label="Platform statistics"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="mb-2 text-4xl font-bold text-primary lg:text-5xl">
                      {s.value}
                    </div>
                    <div className="text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section
            className="relative border-t border-border py-24 lg:py-32"
            aria-labelledby="pricing-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2
                  id="pricing-heading"
                  className="mb-4 text-3xl font-bold text-foreground lg:text-5xl"
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
                      "relative rounded-2xl p-6",
                      tier.featured
                        ? "border border-primary/50 bg-card shadow-xl shadow-primary/10"
                        : "border border-border bg-card/50",
                    )}
                  >
                    {tier.featured ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                          {popularLabel}
                        </span>
                      </div>
                    ) : null}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-card-foreground">
                        {tier.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {tier.tagline}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-card-foreground">
                        {tier.price}
                      </span>
                      {tier.period ? (
                        <span className="text-muted-foreground">
                          {tier.period}
                        </span>
                      ) : null}
                    </div>
                    <ul className="mb-6 space-y-3 text-sm text-muted-foreground">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-3">
                          <Check />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className={cn(
                        "w-full rounded-xl px-4 py-3 font-semibold transition-colors",
                        tier.featured
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-muted text-foreground hover:bg-accent",
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
            className="relative border-t border-border py-24 lg:py-32"
            aria-labelledby="testimonials-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2
                  id="testimonials-heading"
                  className="mb-4 text-3xl font-bold text-foreground lg:text-5xl"
                >
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <article
                    key={t.name}
                    className="rounded-2xl border border-border bg-card/50 p-6"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map((n) => (
                        <Star key={n} />
                      ))}
                    </div>
                    <blockquote className="mb-6 leading-relaxed text-card-foreground/90">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-3">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="size-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {t.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t.role}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section
            className="relative border-t border-border py-24 lg:py-32"
            aria-labelledby="faq-heading"
          >
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2
                  id="faq-heading"
                  className="mb-4 text-3xl font-bold text-foreground lg:text-5xl"
                >
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group overflow-hidden rounded-xl border border-border bg-card/50"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <h3 className="font-semibold text-foreground">
                        {item.question}
                      </h3>
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
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {item.answer}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Closing CTA */}
          <section
            className="relative border-t border-border py-24 lg:py-32"
            aria-labelledby="cta-heading"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent"
            />
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2
                id="cta-heading"
                className="mb-4 text-3xl font-bold text-foreground lg:text-5xl"
              >
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                {ctaDesc}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:bg-primary/90"
                >
                  {ctaPrimary}
                  <ArrowRight />
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-8 py-4 font-semibold text-card-foreground transition-all hover:bg-muted"
                >
                  <svg
                    className="size-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                {ctaFootnote}
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border" role="contentinfo">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
              <div className="col-span-2">
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
                <p className="mb-4 max-w-xs text-sm text-muted-foreground">
                  {footerBlurb}
                </p>
                <div className="flex items-center gap-4">
                  {(["Twitter", "GitHub", "LinkedIn"] as const).map(
                    (social) => (
                      <button
                        key={social}
                        type="button"
                        aria-label={social}
                        onClick={() => go(social)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {social === "Twitter" ? (
                          <svg
                            className="size-5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                          </svg>
                        ) : social === "GitHub" ? (
                          <svg
                            className="size-5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                        ) : (
                          <svg
                            className="size-5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                        )}
                      </button>
                    ),
                  )}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-foreground">
                    {col.title}
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
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">{footerCopyright}</p>
              <div className="flex items-center gap-6 text-sm">
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
