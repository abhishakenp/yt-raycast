import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * DevToolKimiPage10 — a complete, self-contained developer-API / dev-tool platform
 * LANDING page (variant 10 / style sibling to DevToolKimiPage).
 *
 * A faithful Tailwind v4 token-compliant port of a Kimi-generated "CloudVerse"
 * design: a light, airy, modern product-marketing page for developer infrastructure
 * with a two-column hero featuring a gradient background, a dark syntax-highlighted
 * code mockup with floating "Connected" and "50ms latency" stat cards, a trusted-by
 * logo strip rendered as text buttons, a 6-up product features grid with individually
 * tinted icon tiles and "Learn more" links, a 3-step numbered "get started" timeline
 * with code snippets, a 2x2 product screenshot gallery with dark gradient overlays,
 * a 3-tier pricing table with a "Most Popular" highlighted dark card and toggle UI,
 * a dark 4-up stats/metrics band, three star-rated testimonials with avatars,
 * an accordion FAQ, a dark gradient closing CTA band with dual buttons, and a
 * 5-column footer with social icons.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy and colors
 * itself with semantic theme tokens only. Dark surfaces use `bg-foreground`/
 * `text-background`. Every nav item / CTA / footer link / social routes through
 * `useNavigate` (never a dead "#"). All content imagery uses the alt-driven
 * <Image> component (never a raw src).
 * Callers supply ONLY content data; rich defaults make it render great with no
 * props at all.
 */
export const DevToolKimiPage10 = defineComponent({
  name: "DevToolKimiPage10",
  description:
    "Complete developer-API / dev-tool / SaaS-infrastructure LANDING page (variant 10 — style sibling to DevToolKimiPage) with a light, airy, modern product-marketing aesthetic featuring gradient hero backgrounds, floating stat cards, a dark syntax-highlighted code mockup, trusted-by logo strip, 6-up tinted-icon features grid with Learn-more links, 3-step get-started timeline with terminal snippets, 2x2 dark-overlay gallery, 3-tier pricing with Most Popular dark highlight and monthly/yearly toggle UI, dark stats band, 3 star-rated testimonials with avatars, accordion FAQ, gradient dark CTA band, and 5-column footer with social icons. Use as the ROOT/home page for developer tools, API platforms, backend-as-a-service, infrastructure/cloud SDKs, auth/database/real-time/serverless products, or technical SaaS when a conversion-focused page with code sample, pricing, and social proof is wanted. Supply content only — brand, nav, hero, logos, features, steps, gallery, pricing, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    hero: z
      .object({
        badge: z.string().optional(),
        headingTop: z.string().optional(),
        highlight: z.string().optional(),
        headingBottom: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        footnote: z.string().optional(),
        codeFile: z.string().optional(),
        code: z.string().optional(),
        proofLabel: z.string().optional(),
        proofSubtitle: z.string().optional(),
        statLabel: z.string().optional(),
        statValue: z.string().optional(),
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
          .array(z.object({ title: z.string(), description: z.string(), code: z.string().optional() }))
          .optional(),
      })
      .optional(),
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), caption: z.string() }))
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
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
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
    const brand = props.brand ?? "CloudVerse"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Pricing", "Documentation", "Changelog"]

    const heroBadge = props.hero?.badge ?? "v3.2 is live with Edge Functions"
    const heroHeadingTop = props.hero?.headingTop ?? "Infrastructure that"
    const heroHighlight = props.hero?.highlight ?? "just works"
    const heroHeadingBottom = props.hero?.headingBottom ?? ""
    const heroSub =
      props.hero?.subheading ??
      "CloudVerse combines authentication, databases, storage, and real-time sync into one unified platform. Ship your backend in minutes, not months."
    const heroPrimary = props.hero?.primaryCta ?? "Start Building Free"
    const heroSecondary = props.hero?.secondaryCta ?? "Watch Demo"
    const heroFootnote = props.hero?.footnote ?? "Free forever tier"
    const heroFootnote2 = "No credit card required"
    const heroCodeFile = props.hero?.codeFile ?? "cloudverse-sdk.js"
    const heroProofLabel = props.hero?.proofLabel ?? "Connected"
    const heroProofSubtitle = props.hero?.proofSubtitle ?? "us-east-1 region"
    const heroStatValue = props.hero?.statValue ?? "50ms"
    const heroStatLabel = props.hero?.statLabel ?? "avg latency"

    const logosLabel = props.logos?.label ?? "Trusted by engineering teams at"
    const logoCompanies = props.logos?.companies?.length
      ? props.logos.companies
      : ["Stripe", "Notion", "Linear", "Vercel", "Shopify", "Slack"]

    const featuresHeading =
      props.features?.heading ?? "Everything you need to ship faster"
    const featuresDesc =
      props.features?.description ??
      "Replace your fragmented stack with one unified platform. Authentication, databases, storage, and real-time sync — all working together seamlessly."
    const featuresLearnMore = props.features?.learnMore ?? "Learn more"
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Authentication",
            description:
              "Drop-in auth with OAuth, SAML, and passwordless magic links. Support for social providers like Google, GitHub, and Twitter out of the box.",
          },
          {
            title: "PostgreSQL Database",
            description:
              "Fully managed Postgres with automated backups, point-in-time recovery, and connection pooling. Scale from zero to millions of rows seamlessly.",
          },
          {
            title: "Object Storage",
            description:
              "S3-compatible storage for images, videos, and documents. Built-in CDN, image optimization, and on-the-fly transformations at the edge.",
          },
          {
            title: "Edge Functions",
            description:
              "Deploy serverless functions to 35+ edge locations worldwide. Cold starts under 10ms with full Node.js and Python runtime support.",
          },
          {
            title: "Real-time Sync",
            description:
              "WebSocket-based sync for live collaborative experiences. Presence detection, conflict resolution, and offline support built right in.",
          },
          {
            title: "Observability",
            description:
              "Built-in logging, metrics, and distributed tracing. Custom dashboards, alerting, and integrations with Datadog and Grafana.",
          },
        ]

    const stepsHeading =
      props.steps?.heading ?? "From zero to production in minutes"
    const stepsDesc =
      props.steps?.description ??
      "Get up and running with CloudVerse in three simple steps. No complex configuration or DevOps required."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Create your project",
            description:
              "Sign up and create a new project from the dashboard. We'll provision your infrastructure instantly across our global network.",
            code: "npx create-cloudverse-app my-app",
          },
          {
            title: "Install the SDK",
            description:
              "Add our SDK to your application. Available for JavaScript, Python, Go, Ruby, and more with comprehensive type support.",
            code: "npm install @cloudverse/sdk",
          },
          {
            title: "Deploy to the edge",
            description:
              "Run the deploy command and your application goes live across 35+ edge locations with automatic SSL and CDN.",
            code: "cloudverse deploy",
          },
        ]

    const galleryHeading =
      props.gallery?.heading ?? "Powerful tools at your fingertips"
    const galleryDesc =
      props.gallery?.description ??
      "Manage your entire infrastructure from one unified dashboard. Monitor performance, manage databases, and deploy with confidence."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Analytics Dashboard",
            caption:
              "Real-time metrics and performance monitoring across all your services.",
          },
          {
            title: "Database Management",
            caption:
              "Built-in SQL editor with autocomplete, query history, and execution plans.",
          },
          {
            title: "Deployment Pipeline",
            caption:
              "Git-integrated CI/CD with preview environments and automated rollbacks.",
          },
          {
            title: "Team Collaboration",
            caption:
              "Role-based access control and team management for enterprise workflows.",
          },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start free and scale as you grow. No hidden fees, no surprises. Pay only for what you use."
    const popularLabel = props.pricing?.popularLabel ?? "Most Popular"
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Starter",
            tagline: "Perfect for side projects and learning.",
            price: "$0",
            period: "/month",
            features: [
              "Up to 3 projects",
              "500MB database storage",
              "1GB file storage",
              "Community support",
            ],
            cta: "Get Started Free",
            featured: false,
          },
          {
            name: "Pro",
            tagline: "For serious developers and small teams.",
            price: "$29",
            period: "/month",
            features: [
              "Unlimited projects",
              "10GB database storage",
              "100GB file storage",
              "Priority support",
              "Custom domains & SSL",
              "Team collaboration (5 seats)",
            ],
            cta: "Start Pro Trial",
            featured: true,
          },
          {
            name: "Enterprise",
            tagline: "For organizations with advanced needs.",
            price: "Custom",
            period: "",
            features: [
              "Everything in Pro",
              "Unlimited team seats",
              "SSO & advanced security",
              "Dedicated support engineer",
              "Custom SLAs & contracts",
              "On-premise deployment",
            ],
            cta: "Contact Sales",
            featured: false,
          },
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "50K+", label: "Active Developers" },
          { value: "99.99%", label: "Uptime SLA" },
          { value: "50ms", label: "Global Latency" },
          { value: "2B+", label: "Requests Daily" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by developers worldwide"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See what engineering teams are saying about CloudVerse."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "CloudVerse cut our backend development time by 70%. What used to take weeks now takes days. The real-time sync is incredibly reliable for our collaborative features.",
            name: "Alex Chen",
            role: "Senior Engineer at Linear",
            avatarAlt:
              "Professional headshot of Alex Chen, a senior software engineer with short black hair and glasses wearing a navy blue sweater",
          },
          {
            quote:
              "We migrated from a complex self-hosted setup to CloudVerse in one weekend. The edge functions performance is phenomenal—sub-50ms response times globally.",
            name: "Sarah Mitchell",
            role: "CTO at Notion",
            avatarAlt:
              "Professional headshot of Sarah Mitchell, a CTO with blonde hair wearing a black blazer and pearl earrings",
          },
          {
            quote:
              "The observability features alone are worth it. We caught a performance issue in minutes that would have taken days with our old setup. The support team is incredible too.",
            name: "Marcus Johnson",
            role: "DevOps Lead at Vercel",
            avatarAlt:
              "Professional headshot of Marcus Johnson, a DevOps lead with dark skin and short curly hair wearing a grey t-shirt",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about CloudVerse. Can't find the answer you're looking for? Contact our support team."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How does the free tier work?",
            answer:
              "Our Starter tier is free forever with no credit card required. You get up to 3 projects, 500MB of database storage, and 1GB of file storage. Perfect for side projects, learning, and prototyping. When you're ready to scale, upgrading takes just one click.",
          },
          {
            question: "What databases do you support?",
            answer:
              "We currently offer managed PostgreSQL with automated backups, point-in-time recovery, and connection pooling. MySQL and MongoDB support are coming in Q3 2024. All databases run on NVMe SSDs with daily automated backups and optional cross-region replication.",
          },
          {
            question: "Can I self-host CloudVerse?",
            answer:
              "Yes! Enterprise customers can deploy CloudVerse on-premise or in their own VPC. This is ideal for organizations with strict compliance requirements or those who need complete data sovereignty. Contact our sales team for a custom quote and implementation timeline.",
          },
          {
            question: "What is your uptime guarantee?",
            answer:
              "We guarantee 99.99% uptime for Pro customers and 99.999% for Enterprise customers. If we fall short, you receive service credits proportional to the downtime. Our infrastructure runs across multiple availability zones with automatic failover, so your app stays online even during regional outages.",
          },
          {
            question: "How does billing work for overages?",
            answer:
              "We believe in transparent, usage-based pricing. Database storage overages are billed at $0.25/GB/month, file storage at $0.02/GB/month, and edge function invocations at $0.15 per million requests. You'll receive email alerts when you hit 80% and 100% of your plan limits.",
          },
          {
            question: "Do you support multi-region deployments?",
            answer:
              "Absolutely. CloudVerse operates 35+ edge locations across 6 continents. Your data can be replicated across regions for low-latency access and disaster recovery. Pro and Enterprise plans include automatic geo-routing, directing users to the nearest edge location for optimal performance.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to ship faster?"
    const ctaDesc =
      props.cta?.description ??
      "Join 50,000+ developers building on CloudVerse today. Start free and upgrade when you're ready to scale."
    const ctaPrimary = props.cta?.primaryCta ?? "Get Started Free"
    const ctaSecondary = props.cta?.secondaryCta ?? "Talk to Sales"
    const ctaFootnote =
      props.cta?.footnote ?? "No credit card required • Free forever tier available"

    const footerBlurb =
      props.footer?.blurb ??
      "The all-in-one platform for modern applications. Ship faster with unified infrastructure."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Changelog", "Documentation", "API Reference"],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Press", "Partners"],
          },
          {
            title: "Resources",
            links: ["Community", "Help Center", "Status", "Security", "Status Page"],
          },
          {
            title: "Legal",
            links: ["Privacy", "Terms", "Cookie Policy", "GDPR", "SOC 2"],
          },
        ]
    const footerLegal = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`

    // ── Icons ──
    const BoltMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-primary text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          className="size-5"
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
        <path d="M9 5l7 7-7 7" />
      </svg>
    )

    const PlayIcon = ({ className }: { className?: string }) => (
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
        <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

    const CheckMark = ({ className }: { className?: string }) => (
      <svg
        className={cn("mt-0.5 size-5 flex-shrink-0", className)}
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

    const ChevronDown = () => (
      <svg
        className="size-5 text-muted-foreground transition-transform group-open:rotate-180"
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

    const featureIcons: ReactNode[] = [
      <svg key="auth" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>,
      <svg key="db" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>,
      <svg key="store" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>,
      <svg key="edge" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      <svg key="sync" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>,
      <svg key="obs" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
    ]

    const TwitterIcon = () => (
      <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
      </svg>
    )
    const GitHubIcon = () => (
      <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    )
    const DiscordIcon = () => (
      <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.293a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    )

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
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
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <BoltMark className="size-8" />
                <span className="text-xl font-bold tracking-tight text-foreground">{brand}</span>
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
                  onClick={() => go(heroPrimary)}
                  className="inline-flex items-center rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
                >
                  Get API Key
                </button>
              </div>
            </div>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-gradient-to-br from-muted via-background to-accent/10" aria-label="Hero section">
            <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-32 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="max-w-2xl">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 shadow-sm">
                    <span className="size-2 animate-pulse rounded-full bg-chart-2" />
                    <span className="text-sm font-medium text-foreground">{heroBadge}</span>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                  <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {heroHeadingTop}{" "}
                    <span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
                      {heroHighlight}
                    </span>
                    {heroHeadingBottom ? <> {heroHeadingBottom}</> : null}
                  </h1>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground sm:text-xl">{heroSub}</p>
                  <div className="mb-10 flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="rounded-xl bg-foreground px-6 py-3 text-center font-semibold text-background shadow-lg transition-all hover:bg-foreground/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-3 text-center font-semibold text-foreground shadow-sm transition-all hover:bg-muted"
                    >
                      <PlayIcon />
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckMark className="text-chart-2" />
                      {heroFootnote}
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckMark className="text-chart-2" />
                      {heroFootnote2}
                    </div>
                  </div>
                </div>

                {/* Code mockup */}
                <div className="relative">
                  <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-foreground shadow-2xl">
                    <div className="flex items-center gap-2 border-b border-border/30 bg-card/40 px-4 py-3">
                      <div className="flex gap-1.5">
                        <div className="size-3 rounded-full bg-destructive" />
                        <div className="size-3 rounded-full bg-chart-4" />
                        <div className="size-3 rounded-full bg-chart-2" />
                      </div>
                      <span className="ml-2 font-mono text-xs text-muted-foreground">{heroCodeFile}</span>
                    </div>
                    <div className="overflow-x-auto p-6 font-mono text-sm">
                      <div className="text-muted-foreground">// Initialize CloudVerse client</div>
                      <div className="mt-2">
                        <span className="text-chart-5">import</span>{" "}
                        <span className="text-background">{"{ CloudVerse }"}</span>{" "}
                        <span className="text-chart-5">from</span>{" "}
                        <span className="text-chart-2">&apos;@cloudverse/sdk&apos;</span>
                      </div>
                      <div className="mt-4">
                        <span className="text-chart-5">const</span>{" "}
                        <span className="text-chart-1">cv</span> ={" "}
                        <span className="text-chart-5">new</span>{" "}
                        <span className="text-chart-4">CloudVerse</span>({"{"}
                      </div>
                      <div className="pl-4">
                        <span className="text-primary">apiKey</span>:{" "}
                        <span className="text-chart-2">&apos;cv_live_...&apos;</span>,
                      </div>
                      <div className="pl-4">
                        <span className="text-primary">region</span>:{" "}
                        <span className="text-chart-2">&apos;us-east-1&apos;</span>
                      </div>
                      <div className="text-background">{"})"}</div>
                      <div className="mt-4 text-muted-foreground">// Create a real-time document</div>
                      <div>
                        <span className="text-chart-5">const</span>{" "}
                        <span className="text-chart-1">doc</span> ={" "}
                        <span className="text-chart-5">await</span> cv.
                        <span className="text-chart-4">docs</span>().
                        <span className="text-chart-4">create</span>({"{"}
                      </div>
                      <div className="pl-4">
                        <span className="text-primary">type</span>:{" "}
                        <span className="text-chart-2">&apos;task&apos;</span>,
                      </div>
                      <div className="pl-4">
                        <span className="text-primary">data</span>: {"{"}
                      </div>
                      <div className="pl-8">
                        <span className="text-primary">title</span>:{" "}
                        <span className="text-chart-2">&apos;Deploy to production&apos;</span>,
                      </div>
                      <div className="pl-8">
                        <span className="text-primary">assignee</span>:{" "}
                        <span className="text-chart-2">&apos;alex@acme.com&apos;</span>,
                      </div>
                      <div className="pl-8">
                        <span className="text-primary">priority</span>:{" "}
                        <span className="text-chart-3">&apos;high&apos;</span>
                      </div>
                      <div className="pl-4 text-background">{"}"}</div>
                      <div className="text-background">{"})"}</div>
                      <div className="mt-4 text-muted-foreground">// Subscribe to changes</div>
                      <div>
                        doc.<span className="text-chart-4">onUpdate</span>((
                        <span className="text-chart-1">snapshot</span>){" "}
                        <span className="text-chart-5">{"=>"}</span> {"{"}
                      </div>
                      <div className="pl-4 text-background">
                        console.<span className="text-chart-4">log</span>(
                        <span className="text-chart-2">&apos;Updated:&apos;</span>, snapshot.
                        <span className="text-primary">data</span>)
                      </div>
                      <div className="text-background">{"})"}</div>
                    </div>
                  </div>
                  {/* Floating Connected card */}
                  <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-border bg-background p-4 shadow-lg sm:block">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-lg bg-chart-2/15">
                        <CheckMark className="mt-0 text-chart-2" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{heroProofLabel}</div>
                        <div className="text-xs text-muted-foreground">{heroProofSubtitle}</div>
                      </div>
                    </div>
                  </div>
                  {/* Floating latency card */}
                  <div className="absolute -top-4 -right-4 hidden rounded-xl border border-border bg-background p-4 shadow-lg sm:block">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-lg bg-primary/10">
                        <svg className="size-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{heroStatValue}</div>
                        <div className="text-xs text-muted-foreground">{heroStatLabel}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border bg-background py-16" aria-label="Trusted by section">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-3 items-center justify-items-center gap-8 opacity-70 md:grid-cols-6">
                {logoCompanies.map((company) => (
                  <button
                    key={company}
                    type="button"
                    onClick={() => go(company)}
                    className="flex items-center justify-center transition-opacity hover:opacity-100"
                  >
                    <Image
                      alt={`${company} company logo`}
                      w={120}
                      h={40}
                      className="h-8 w-auto object-contain grayscale transition hover:grayscale-0"
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-background py-24" id="features" aria-label="Features section">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  Features
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">{featuresHeading}</h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="group rounded-2xl border border-border bg-muted/40 p-6 transition-all hover:border-primary/30 hover:shadow-lg"
                  >
                    <div className="mb-4 grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                    <button
                      type="button"
                      onClick={() => go(item.title)}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-all hover:text-primary/80 group-hover:gap-2"
                    >
                      {featuresLearnMore}
                      <ArrowRight className="size-4" />
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="bg-muted/40 py-24" id="steps" aria-label="Getting started section">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full border border-border bg-background px-4 py-1.5 text-sm font-semibold text-foreground">
                  Getting Started
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">{stepsHeading}</h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 lg:grid-cols-3">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    {i < stepItems.length - 1 ? (
                      <div
                        aria-hidden="true"
                        className="absolute top-8 left-8 hidden h-0.5 w-full bg-gradient-to-r from-primary/30 to-transparent lg:block"
                      />
                    ) : null}
                    <div className="relative rounded-2xl border border-border bg-background p-6 shadow-sm">
                      <div className="mb-4 grid size-12 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-md">
                        {i + 1}
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
                      <p className="mb-4 text-sm text-muted-foreground">{step.description}</p>
                      {step.code ? (
                        <div className="overflow-x-auto rounded-lg bg-foreground p-3 font-mono text-xs text-background">
                          <span className="text-muted-foreground">$</span> {step.code}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-background py-24" id="dashboard" aria-label="Dashboard gallery section">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  Dashboard
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">{galleryHeading}</h2>
                <p className="text-lg text-muted-foreground">{galleryDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {galleryItems.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => go(item.title)}
                    className="group relative overflow-hidden rounded-2xl bg-foreground text-left shadow-lg"
                  >
                    <Image
                      alt={`${item.title} interface — ${item.caption}`}
                      w={800}
                      h={600}
                      loading="lazy"
                      className="h-64 w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <h3 className="mb-1 text-lg font-semibold text-background">{item.title}</h3>
                      <p className="text-sm text-background/80">{item.caption}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted/40 py-24" id="pricing" aria-label="Pricing section">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full border border-border bg-background px-4 py-1.5 text-sm font-semibold text-foreground">
                  Pricing
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">{pricingHeading}</h2>
                <p className="mb-8 text-lg text-muted-foreground">{pricingDesc}</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">Monthly</span>
                  <button
                    type="button"
                    onClick={() => go("Yearly billing")}
                    className="relative h-7 w-14 rounded-full bg-foreground transition-colors"
                    role="switch"
                    aria-checked="true"
                    aria-label="Toggle yearly billing"
                  >
                    <span className="absolute top-1 left-1 size-5 translate-x-7 rounded-full bg-background shadow transition-transform" />
                  </button>
                  <span className="text-sm font-medium text-foreground">Yearly</span>
                  <span className="rounded-full bg-chart-2/15 px-2 py-0.5 text-xs font-semibold text-chart-2">Save 20%</span>
                </div>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <article
                    key={tier.name}
                    className={cn(
                      "relative rounded-2xl p-8",
                      tier.featured
                        ? "bg-foreground shadow-2xl"
                        : "border border-border bg-background shadow-sm",
                    )}
                  >
                    {tier.featured ? (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-accent-foreground px-4 py-1 text-sm font-semibold text-primary-foreground">
                        {popularLabel}
                      </div>
                    ) : null}
                    <div className="mb-6">
                      <h3 className={cn("mb-2 text-lg font-semibold", tier.featured ? "text-background" : "text-foreground")}>
                        {tier.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{tier.tagline}</p>
                    </div>
                    <div className="mb-6">
                      <span className={cn("text-4xl font-bold", tier.featured ? "text-background" : "text-foreground")}>
                        {tier.price}
                      </span>
                      {tier.period ? <span className="text-muted-foreground">{tier.period}</span> : null}
                    </div>
                    <ul className="mb-8 space-y-4">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-3">
                          <CheckMark className={tier.featured ? "text-primary" : "text-chart-2"} />
                          <span className={cn("text-sm", tier.featured ? "text-background/80" : "text-muted-foreground")}>
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className={cn(
                        "block w-full rounded-xl px-4 py-3 text-center font-semibold transition-all",
                        tier.featured
                          ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg hover:from-primary/90 hover:to-primary"
                          : tier.name === "Enterprise"
                            ? "bg-foreground text-background hover:bg-foreground/90"
                            : "bg-muted text-foreground hover:bg-muted/70",
                      )}
                    >
                      {tier.cta}
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-foreground py-20" aria-label="Statistics section">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="mb-2 text-4xl font-bold text-background sm:text-5xl">{s.value}</div>
                    <div className="text-sm text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-background py-24" aria-label="Testimonials section">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  Testimonials
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">{testimonialsHeading}</h2>
                <p className="text-lg text-muted-foreground">{testimonialsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <article key={t.name} className="rounded-2xl border border-border bg-muted/40 p-8">
                    <div className="mb-4 flex gap-1">
                      {[0, 1, 2, 3, 4].map((n) => (
                        <Star key={n} />
                      ))}
                    </div>
                    <blockquote className="mb-6 leading-relaxed text-foreground/90">&ldquo;{t.quote}&rdquo;</blockquote>
                    <div className="flex items-center gap-3">
                      <Image alt={t.avatarAlt} w={100} h={100} className="size-12 rounded-full object-cover" />
                      <div>
                        <div className="font-semibold text-foreground">{t.name}</div>
                        <div className="text-sm text-muted-foreground">{t.role}</div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted/40 py-24" id="faq" aria-label="FAQ section">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full border border-border bg-background px-4 py-1.5 text-sm font-semibold text-foreground">
                  FAQ
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">{faqHeading}</h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details key={item.question} className="group overflow-hidden rounded-xl border border-border bg-background">
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6 transition-colors hover:bg-muted/50">
                      <span className="font-semibold text-foreground">{item.question}</span>
                      <ChevronDown />
                    </summary>
                    <div className="px-6 pb-6 text-muted-foreground">
                      <p className="leading-relaxed">{item.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-background py-24" id="cta" aria-label="Call to action section">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-foreground via-foreground to-primary/40 p-12 text-center sm:p-16">
                <div className="relative">
                  <h2 className="mb-4 text-3xl font-bold text-background sm:text-4xl">{ctaHeading}</h2>
                  <p className="mx-auto mb-8 max-w-2xl text-lg text-background/70">{ctaDesc}</p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(ctaPrimary)}
                      className="rounded-xl bg-background px-8 py-4 font-semibold text-foreground shadow-lg transition-colors hover:bg-muted"
                    >
                      {ctaPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(ctaSecondary)}
                      className="rounded-xl border border-background/30 bg-background/10 px-8 py-4 font-semibold text-background transition-colors hover:bg-background/20"
                    >
                      {ctaSecondary}
                    </button>
                  </div>
                  <p className="mt-6 text-sm text-background/60">{ctaFootnote}</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-muted/40 py-16" aria-label="Footer">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
              <div className="col-span-2 md:col-span-4 lg:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <BoltMark className="size-8" />
                  <span className="text-xl font-bold text-foreground">{brand}</span>
                </button>
                <p className="mb-4 text-sm text-muted-foreground">{footerBlurb}</p>
                <div className="flex gap-4">
                  {[
                    { name: "Twitter", Icon: TwitterIcon },
                    { name: "GitHub", Icon: GitHubIcon },
                    { name: "Discord", Icon: DiscordIcon },
                  ].map(({ name, Icon }) => (
                    <button
                      key={name}
                      type="button"
                      aria-label={name}
                      onClick={() => go(name)}
                      className="grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                    >
                      <Icon />
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-foreground">{col.title}</h4>
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
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
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
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
