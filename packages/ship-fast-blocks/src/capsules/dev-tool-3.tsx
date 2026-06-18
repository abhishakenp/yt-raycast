import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { number, string, table } from "@ship-fast/lakebed/server"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
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
 * DevToolKimiPage3 — a complete, self-contained developer-first API platform
 * LANDING page (variant 3 / style sibling to DevToolKimiPage).
 *
 * A faithful Tailwind v4 port of a Kimi-generated "OrbitAPI" dark design:
 * a moody, developer-centric product marketing page with a centered single-
 * column hero featuring a gradient-text headline, live-version badge with
 * pulse dot, dual CTAs with trust checks, and a full-width code-window
 * mockup showing a curl request + JSON response. Below the hero sit a
 * trusted-by logo strip with inline brand SVGs, a 6-up features grid with
 * multi-colored token-based icon tiles and hover gradient overlays, a two-
 * column docs section with language SDK pills, resource links, and a Python
 * code block with tab chrome, a 12-up integrations grid with colored icon
 * tiles, a 3-tier pricing table (Most Popular highlight), three star-rated
 * testimonials with avatar headshots, a 4-up stats band, an accordion FAQ,
 * a dark centered CTA band, and a 4-column footer with social icons.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy and colors
 * itself with semantic theme tokens only. Dark code-window surfaces use
 * `bg-foreground` / `text-background`. Every nav item / CTA / footer link /
 * social / tab routes through `useNavigate` (never a dead "#"). All content
 * imagery uses the alt-driven <Image> component (never a raw src). Callers
 * supply ONLY content data; rich defaults make it render great with no
 * props at all.
 */
export const DevToolKimiPage3 = defineCapsule({
  name: "DevToolKimiPage3",
  description:
    "A complete developer-first API platform LANDING page — the THIRD visually-distinct style variant and style sibling to DevToolKimiPage. Features a dark, moody aesthetic with decorative radial-gradient backdrops, a centered single-column hero with a gradient-text headline, live-version badge with pulse dot, dual CTAs with trust checks, a full-width syntax-highlighted curl + JSON response code window with traffic-light chrome, a trusted-by logo strip with brand SVGs, a 6-up features grid with multi-colored token-based icon tiles and hover gradient overlays, a two-column docs section with language SDK pills, resource links, and a Python code block with tab chrome, a 12-up integrations grid with colored icon tiles, a 3-tier pricing table with a 'Most Popular' highlighted Pro plan and feature checklists, three star-rated testimonials with avatar headshots, a 4-up stats/metrics band, an accordion FAQ using native details elements, a centered CTA with dual buttons and trust checks, and a 4-column footer with social link icons. Use as the ROOT/home page for developer tools, API platforms, GraphQL/REST services, backend-as-a-service, or technical SaaS when a dark, code-centric, integration-rich design with social proof and pricing is preferred. Supply content only — brand, nav, hero, logos, features, docs, integrations, pricing, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / product name shown in the navbar, hero and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingTop: z.string().optional(),
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        footnoteChecks: z.array(z.string()).optional(),
        codeFile: z.string().optional(),
        code: z.string().optional(),
        response: z.string().optional(),
        responseStatus: z.string().optional(),
      })
      .optional(),
    /** Trusted-by logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        companies: z.array(z.string()).optional(),
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
    /** Docs / code-examples section. */
    docs: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        langs: z.array(z.string()).optional(),
        activeLang: z.string().optional(),
        links: z
          .array(z.object({ title: z.string(), subtitle: z.string() }))
          .optional(),
        code: z.string().optional(),
      })
      .optional(),
    /** Integrations grid. */
    integrations: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.object({ name: z.string() })).optional(),
        viewAll: z.string().optional(),
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
    /** Stats / metrics band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
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
    /** Accordion FAQ. */
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
        footnoteChecks: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
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
  lakebed: {
    schema: {
      savedItems: table({
        item: string(),
        section: string(),
        sort: number(),
      }),
    },
    queries: {
      savedItems: ({ db }) => db.savedItems.orderBy("sort").all(),
    },
    mutations: {
      addSavedItem: ({ db }, item: string, section: string) => {
        const normalizedItem = item.trim()
        const normalizedSection = section.trim()
        if (!normalizedItem || !normalizedSection) return db.savedItems.all()

        const exists = db.savedItems
          .where("section", normalizedSection)
          .all()
          .some((entry) => entry.item === normalizedItem)

        if (exists) return db.savedItems.all()

        db.savedItems.insert({
          item: normalizedItem,
          section: normalizedSection,
          sort: Date.now(),
        })

        return db.savedItems.all()
      },
      removeSavedItem: ({ db }, id: string) => {
        db.savedItems.delete(id)
        return db.savedItems.all()
      },
      clearSavedItems: ({ db }) => {
        for (const item of db.savedItems.all()) {
          db.savedItems.delete(item.id)
        }
        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [savedOpen, setSavedOpen] = useState(false)
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authActionLabel =
      auth.isLoading ? "Checking..." : isSignedIn ? "Sign out" : "Sign in"
    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }
    const savedItems = lakebed.useQuery("savedItems")
    const addSavedItem = lakebed.useMutation("addSavedItem")
    const removeSavedItem = lakebed.useMutation("removeSavedItem")
    const clearSavedItems = lakebed.useMutation("clearSavedItems")
    const storedSavedItems = savedItems ?? []
    const savedCount = storedSavedItems.length
    const savedSectionCounts = storedSavedItems.reduce<Record<string, number>>(
      (acc, row) => {
        const section = row.section
          .trim()
          .toLowerCase()
          .replace(/\b\w/g, (char) => char.toUpperCase())
        acc[section] = (acc[section] ?? 0) + 1
        return acc
      },
      {},
    )
    const savedSectionLabels = Object.entries(savedSectionCounts).sort(
      (a, b) => b[1] - a[1],
    )
    const brand = props.brand ?? "OrbitAPI"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Pricing", "Docs", "Integrations"]

    const heroBadge = props.hero?.badge ?? "v2.4 is live — now with GraphQL support"
    const headingTop = props.hero?.headingTop ?? "Build APIs that"
    const heroHighlight = props.hero?.highlight ?? "scale effortlessly"
    const heroSub =
      props.hero?.subheading ??
      "The complete platform for developers. Deploy REST and GraphQL APIs in seconds with built-in authentication, real-time analytics, and enterprise-grade security. Join 50,000+ developers shipping faster."
    const heroPrimary = props.hero?.primaryCta ?? "Start building free"
    const heroSecondary = props.hero?.secondaryCta ?? "View documentation"
    const heroFootnoteChecks = props.hero?.footnoteChecks?.length
      ? props.hero.footnoteChecks
      : ["No credit card required", "10,000 free requests/month"]
    const codeFile = props.hero?.codeFile ?? "curl example.sh"
    const heroCode =
      props.hero?.code ??
      `curl -X POST https://api.orbitapi.com/v1/projects \\
  -H "Authorization: Bearer ORBIT_API_KEY_REDACTED" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "payment-gateway",
    "region": "us-east-1",
    "scale": "auto"
  }'`
    const heroResponse =
      props.hero?.response ??
      `{
  "id": "proj_8f7d6a5e4c3b",
  "status": "deploying",
  "endpoint": "https://payment-gateway.api.orbitapi.com",
  "created_at": "2024-01-15T09:23:47Z"
}`
    const responseStatus = props.hero?.responseStatus ?? "200 OK — 142ms"

    const logosLabel =
      props.logos?.label ?? "Trusted by engineering teams at leading companies"
    const logoCompanies = props.logos?.companies?.length
      ? props.logos.companies
      : ["Stripe", "Vercel", "Linear", "Notion", "Figma", "Supabase"]

    const featuresHeading =
      props.features?.heading ?? "Everything you need to ship APIs"
    const featuresDesc =
      props.features?.description ??
      "From authentication to analytics, OrbitAPI provides the complete toolkit for modern API development."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Instant Deployments",
            description:
              "Push your code and watch your API go live in seconds. Automatic scaling from zero to thousands of requests per second.",
          },
          {
            title: "Enterprise Security",
            description:
              "Built-in authentication, API key management, rate limiting, and DDoS protection. SOC 2 Type II certified infrastructure.",
          },
          {
            title: "Real-time Analytics",
            description:
              "Monitor request latency, error rates, and throughput in real-time. Set up alerts and dive deep with detailed logs.",
          },
          {
            title: "GraphQL & REST",
            description:
              "Support for both GraphQL and REST APIs with automatic schema generation, playground integration, and type-safe clients.",
          },
          {
            title: "Global Edge Network",
            description:
              "Deploy to 35+ regions worldwide. Your APIs run at the edge, closest to your users, with sub-50ms latency globally.",
          },
          {
            title: "Team Collaboration",
            description:
              "Unlimited team members with role-based access control. Share environments, collaborate on endpoints, and review changes.",
          },
        ]

    const docsHeading =
      props.docs?.heading ?? "Built for developers, by developers"
    const docsDesc =
      props.docs?.description ??
      "Clean APIs, comprehensive SDKs, and documentation that actually helps. Get started in minutes with your favorite language."
    const docsLangs = props.docs?.langs?.length
      ? props.docs.langs
      : ["TypeScript", "Python", "Go", "Ruby", "PHP", "Rust"]
    const docsActiveLang = props.docs?.activeLang ?? "Python"
    const docsLinks = props.docs?.links?.length
      ? props.docs.links
      : [
          {
            title: "API Reference",
            subtitle: "Complete endpoint documentation",
          },
          {
            title: "SDKs & Libraries",
            subtitle: "Official client libraries",
          },
          {
            title: "Quick Start Guide",
            subtitle: "Get up and running in 5 minutes",
          },
        ]
    const docsCode =
      props.docs?.code ??
      `import orbit from "@orbitapi/sdk"

# Initialize the client
client = orbit.Client(api_key="ORBIT_API_KEY_REDACTED")

# Create a new endpoint
endpoint = await client.endpoints.create({
    "name": "users-api",
    "schema": {
        "GET /users": {
            "response": {
                "id": "string",
                "email": "string",
                "name": "string"
            }
        }
    }
})

# Deploy instantly
await endpoint.deploy()
print(endpoint.url)
# → https://users-api.api.orbitapi.com`

    const integrationsHeading =
      props.integrations?.heading ?? "Integrates with your stack"
    const integrationsDesc =
      props.integrations?.description ??
      "Connect with 100+ tools you already use. From databases to monitoring, we've got you covered."
    const integrationsViewAll =
      props.integrations?.viewAll ?? "View all 100+ integrations"
    const integrationItems = props.integrations?.items?.length
      ? props.integrations.items
      : [
          { name: "PostgreSQL" },
          { name: "MongoDB" },
          { name: "Redis" },
          { name: "Kafka" },
          { name: "Datadog" },
          { name: "Sentry" },
          { name: "Stripe" },
          { name: "Slack" },
          { name: "Auth0" },
          { name: "AWS" },
          { name: "GCP" },
          { name: "Vercel" },
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
              "10,000 requests/month",
              "3 API endpoints",
              "Community support",
              "REST & GraphQL",
            ],
            cta: "Get started free",
            featured: false,
          },
          {
            name: "Pro",
            tagline: "For growing teams and production workloads",
            price: "$49",
            period: "/month",
            features: [
              "500,000 requests/month",
              "Unlimited endpoints",
              "Priority email support",
              "Advanced analytics",
              "Custom domains",
              "Team collaboration",
            ],
            cta: "Start 14-day trial",
            featured: true,
          },
          {
            name: "Enterprise",
            tagline: "For organizations with advanced needs",
            price: "Custom",
            period: "",
            features: [
              "Unlimited requests",
              "Dedicated infrastructure",
              "24/7 phone support",
              "SSO & SAML",
              "Custom contracts",
              "SLA guarantees",
            ],
            cta: "Contact sales",
            featured: false,
          },
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "50K+", label: "Active developers" },
          { value: "2B+", label: "Requests served daily" },
          { value: "99.99%", label: "Uptime SLA" },
          { value: "35+", label: "Global regions" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by developers"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See what engineering teams are saying about OrbitAPI."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "We migrated our entire API infrastructure to OrbitAPI and cut our deployment time from hours to seconds. The real-time analytics alone saved us thousands in debugging time.",
            name: "Marcus Chen",
            role: "VP Engineering at TechFlow",
            avatarAlt:
              "Professional headshot of a male software engineer with short dark hair",
          },
          {
            quote:
              "The GraphQL support is incredible. We went from zero to production-grade API in under a week. The documentation is the best I've seen—clear examples, no fluff.",
            name: "Sarah Williams",
            role: "Lead Developer at ScaleUp",
            avatarAlt:
              "Professional headshot of a female developer with shoulder-length brown hair",
          },
          {
            quote:
              "We evaluated 5 different API platforms before choosing OrbitAPI. The combination of performance, pricing, and developer experience was unbeatable. Our API response times dropped by 40%.",
            name: "David Park",
            role: "CTO at Nexus Labs",
            avatarAlt:
              "Professional headshot of a smiling engineering manager with glasses",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ?? "Everything you need to know about OrbitAPI."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How does the free tier work?",
            answer:
              "Our free tier includes 10,000 API requests per month, 3 endpoints, and access to REST and GraphQL support. It's perfect for side projects, prototypes, and learning. No credit card required to sign up.",
          },
          {
            question: "Can I self-host OrbitAPI?",
            answer:
              "Yes! Enterprise customers can deploy OrbitAPI on their own infrastructure, including private cloud and on-premise data centers. Contact our sales team for custom deployment options and pricing.",
          },
          {
            question: "What programming languages do you support?",
            answer:
              "We provide official SDKs for TypeScript/JavaScript, Python, Go, Ruby, PHP, and Rust. Our REST API is language-agnostic, so you can use any language that supports HTTP requests. We also have community SDKs for Java, C#, and more.",
          },
          {
            question: "How does billing work for the Pro plan?",
            answer:
              "Pro plan is $49/month and includes 500,000 requests. Beyond that, pay-as-you-go at $0.0001 per request. We automatically scale with your usage—no need to worry about hitting limits during traffic spikes.",
          },
          {
            question: "Is my data secure with OrbitAPI?",
            answer:
              "Absolutely. We're SOC 2 Type II certified and GDPR compliant. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We offer private endpoints, IP allowlisting, and can sign BAAs for healthcare customers.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to ship faster?"
    const ctaDesc =
      props.cta?.description ??
      "Join 50,000+ developers building with OrbitAPI. Start free, no credit card required."
    const ctaPrimary = props.cta?.primaryCta ?? "Start building free"
    const ctaSecondary = props.cta?.secondaryCta ?? "Schedule a demo"
    const ctaFootnoteChecks = props.cta?.footnoteChecks?.length
      ? props.cta.footnoteChecks
      : ["Free forever tier", "No credit card required", "14-day Pro trial"]

    const footerBlurb =
      props.footer?.blurb ??
      "The complete platform for developers to build, deploy, and scale APIs with confidence."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Integrations", "Changelog", "Roadmap"],
          },
          {
            title: "Developers",
            links: [
              "Documentation",
              "API Reference",
              "SDKs",
              "Status",
              "Open Source",
            ],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Contact", "Partners"],
          },
        ]
    const footerLegal = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ["Privacy Policy", "Terms of Service", "Cookie Policy"]
    const footerCopyright =
      props.footer?.copyright ?? `© 2024 ${brand}, Inc. All rights reserved.`

    const BrandMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg",
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
          className="text-primary-foreground"
        >
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </span>
    )

    const CheckIcon = () => (
      <svg
        className="mt-0.5 size-5 flex-shrink-0 text-primary"
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
        <polyline points="6 9 12 15 18 9" />
      </svg>
    )

    const ArrowRight = () => (
      <svg
        className="size-4"
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

    const Bookmark = () => (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
      </svg>
    )

    const XIcon = () => (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    )

    const featureIcons: ReactNode[] = [
      <svg key="1" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      <svg key="2" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>,
      <svg key="3" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      <svg key="4" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>,
      <svg key="5" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>,
      <svg key="6" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
    ]

    const featureIconColors = [
      { text: "text-primary", bg: "bg-primary/10", grad: "from-primary/5" },
      { text: "text-accent", bg: "bg-accent/10", grad: "from-accent/5" },
      { text: "text-chart-1", bg: "bg-chart-1/10", grad: "from-chart-1/5" },
      { text: "text-chart-2", bg: "bg-chart-2/10", grad: "from-chart-2/5" },
      { text: "text-chart-3", bg: "bg-chart-3/10", grad: "from-chart-3/5" },
      { text: "text-chart-4", bg: "bg-chart-4/10", grad: "from-chart-4/5" },
    ]

    const logoSvgs: ReactNode[] = [
      <svg key="stripe" className="size-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>,
      <svg key="vercel" className="size-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
      </svg>,
      <svg key="linear" className="size-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>,
      <svg key="notion" className="size-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" /><path fill="currentColor" d="M7 7h10v10H7z" />
      </svg>,
      <svg key="figma" className="size-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-2a8 8 0 100-16 8 8 0 000 16z" />
      </svg>,
      <svg key="supabase" className="size-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.23 10.56V10c0-1.94-1.57-3.5-3.5-3.5S6.23 8.06 6.23 10v.56c-.55 0-1.07.16-1.5.44C4.15 11.41 3.73 12.16 3.73 13v4c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-4c0-.84-.42-1.59-1.07-2.03-.43-.28-.95-.44-1.5-.44v-.43c0-1.94-1.57-3.5-3.5-3.5s-3.5 1.56-3.5 3.5v.56h2v-.56c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v.56h2z" />
      </svg>,
    ]

    const integrationColors = [
      { text: "text-chart-3", bg: "bg-chart-3/10" },
      { text: "text-chart-1", bg: "bg-chart-1/10" },
      { text: "text-destructive", bg: "bg-destructive/10" },
      { text: "text-chart-4", bg: "bg-chart-4/10" },
      { text: "text-primary", bg: "bg-primary/10" },
      { text: "text-chart-2", bg: "bg-chart-2/10" },
      { text: "text-chart-5", bg: "bg-chart-5/10" },
      { text: "text-chart-2", bg: "bg-chart-2/10" },
      { text: "text-chart-3", bg: "bg-chart-3/10" },
      { text: "text-chart-1", bg: "bg-chart-1/10" },
      { text: "text-primary", bg: "bg-primary/10" },
      { text: "text-chart-4", bg: "bg-chart-4/10" },
    ]

    const integrationSvgs: ReactNode[] = [
      <svg key="pg" className="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5"/><path d="M7 7h10v10H7z"/></svg>,
      <svg key="mongo" className="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="10"/></svg>,
      <svg key="redis" className="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
      <svg key="kafka" className="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 3h18v18H3V3zm16 16V5H5v14h14z"/></svg>,
      <svg key="datadog" className="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>,
      <svg key="sentry" className="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2L2 22h20L12 2zm0 3.5L18.5 20H5.5L12 5.5z"/></svg>,
      <svg key="stripe2" className="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>,
      <svg key="slack" className="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>,
      <svg key="auth0" className="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"/></svg>,
      <svg key="aws" className="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>,
      <svg key="gcp" className="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>,
      <svg key="vercel2" className="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>,
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header
          className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-3"
              >
                <BrandMark className="size-10 shadow-primary/20" />
                <span className="text-xl font-bold tracking-tight">
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
                  onClick={() => {
                    if (isSignedIn) {
                      handleSignOut()
                    } else {
                      handleSignIn()
                    }
                  }}
                  disabled={auth.isLoading}
                  className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
                >
                  {authActionLabel}
                </button>
                <Sheet
                  open={savedOpen}
                  onOpenChange={setSavedOpen}
                >
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open saved resources"
                      className="relative flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-semibold text-foreground/90 transition-colors hover:bg-muted"
                    >
                      <Bookmark />
                      <span className="hidden sm:inline">Saved</span>
                      {savedCount > 0 ? (
                        <span className="grid size-5 place-items-center rounded-full bg-primary px-1 text-[0.7rem] font-bold text-primary-foreground">
                          {savedCount}
                        </span>
                      ) : null}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full gap-0 p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border px-6 py-4">
                      <SheetTitle>Saved resources</SheetTitle>
                      <SheetDescription>
                        Save integrations and docs links to continue later.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {storedSavedItems.length ? (
                        <div className="space-y-4">
                          {storedSavedItems.map((entry) => (
                            <article
                              key={entry.id}
                              className="rounded-xl border border-border bg-card/50 p-4"
                            >
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                {entry.section}
                              </p>
                              <p className="mt-1 text-sm font-semibold text-foreground">
                                {entry.item}
                              </p>
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSavedOpen(false)
                                    go(entry.item)
                                  }}
                                  className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background"
                                >
                                  Open
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void removeSavedItem(entry.id)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/70 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                                  aria-label={`Remove ${entry.item}`}
                                >
                                  <XIcon />
                                  Remove
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-4 text-center text-sm text-muted-foreground">
                          <p>No saved resources yet.</p>
                        </div>
                      )}
                    </div>
                    <SheetFooter className="border-t border-border px-6 py-5">
                      <div className="w-full space-y-4">
                        <div className="space-y-1">
                          {savedSectionLabels.map(([label, count]) => (
                            <div
                              key={label}
                              className="flex justify-between text-sm text-muted-foreground"
                            >
                              <span>{label}</span>
                              <span>{count}</span>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => void clearSavedItems()}
                            disabled={savedCount === 0}
                            className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Clear all
                          </button>
                          <SheetClose asChild>
                            <button
                              type="button"
                              className="rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background"
                            >
                              Continue
                            </button>
                          </SheetClose>
                        </div>
                      </div>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90"
                >
                  Get started
                </button>
              </div>
            </div>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section
            className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32"
            aria-labelledby="hero-heading"
          >
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59,130,246,0.15), transparent)",
              }}
            />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {heroBadge}
                  </span>
                  <ArrowRight />
                </div>
                <h1
                  id="hero-heading"
                  className="mt-8 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-7xl"
                >
                  {headingTop}{" "}
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    {heroHighlight}
                  </span>
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground lg:text-xl">
                  {heroSub}
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition-colors hover:bg-primary/90 sm:w-auto"
                  >
                    {heroPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-muted/50 px-8 py-4 text-base font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-muted sm:w-auto"
                  >
                    {heroSecondary}
                  </button>
                </div>
                <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                  {heroFootnoteChecks.map((check) => (
                    <div key={check} className="flex items-center gap-2">
                      <CheckIcon />
                      <span>{check}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Preview */}
              <div className="mx-auto mt-16 max-w-4xl">
                <div className="relative rounded-2xl border border-border bg-card/80 p-1 shadow-2xl backdrop-blur-sm">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-lg" />
                  <div className="relative rounded-xl bg-foreground p-6">
                    <div className="flex items-center justify-between border-b border-border/30 pb-4">
                      <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full bg-destructive" />
                        <div className="size-3 rounded-full bg-chart-4" />
                        <div className="size-3 rounded-full bg-chart-2" />
                      </div>
                      <span className="text-xs font-medium text-background/60">
                        {codeFile}
                      </span>
                      <button
                        type="button"
                        className="rounded-lg border border-border/50 px-3 py-1 text-xs font-medium text-background/60 transition-colors hover:border-border hover:text-background/80"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <pre className="mt-4 text-sm leading-relaxed">
                        <code className="font-mono text-background/90">
                          {heroCode}
                        </code>
                      </pre>
                    </div>
                    <div className="mt-4 rounded-lg border border-border/50 bg-card p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="text-primary">●</span> {responseStatus}
                      </div>
                      <pre className="text-sm">
                        <code className="font-mono text-background/90">
                          {heroResponse}
                        </code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section
            className="border-y border-border/50 bg-muted/30 py-12"
            aria-label="Trusted companies"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-3 lg:grid-cols-6">
                {logoCompanies.map((company, i) => (
                  <button
                    key={company}
                    type="button"
                    onClick={() => go(company)}
                    className="flex items-center justify-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {logoSvgs[i % logoSvgs.length]}
                    <span className="text-lg font-bold">{company}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section
            className="py-24 lg:py-32"
            aria-labelledby="features-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2
                  id="features-heading"
                  className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                >
                  {featuresHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {featuresDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => {
                  const col = featureIconColors[i % featureIconColors.length]
                  return (
                    <article
                      key={item.title}
                      className="group relative rounded-2xl border border-border bg-card/50 p-8 backdrop-blur-sm transition-all hover:border-border hover:bg-card"
                    >
                      <div className={cn("absolute inset-0 rounded-2xl bg-gradient-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100", col.grad)} />
                      <div className="relative">
                        <div
                          className={cn(
                            "grid size-12 place-items-center rounded-xl",
                            col.bg,
                            col.text,
                          )}
                        >
                          {featureIcons[i % featureIcons.length]}
                        </div>
                        <h3 className="mt-6 text-lg font-semibold text-foreground">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Docs / Code Examples */}
          <section
            id="docs"
            className="relative overflow-hidden py-24 lg:py-32"
            aria-labelledby="docs-heading"
          >
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(139,92,246,0.1), transparent)",
              }}
            />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="items-center lg:grid lg:grid-cols-2 lg:gap-16">
                <div>
                  <h2
                    id="docs-heading"
                    className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                  >
                    {docsHeading}
                  </h2>
                  <p className="mt-4 text-lg text-muted-foreground">
                    {docsDesc}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    {docsLangs.map((lang) => (
                      <span
                        key={lang}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-sm text-foreground"
                      >
                        <CheckIcon />
                        {lang}
                      </span>
                    ))}
                  </div>
                  <div className="mt-8 space-y-4">
                    {docsLinks.map((link) => (
                      <button
                        key={link.title}
                        type="button"
                        onClick={() => {
                          void addSavedItem(link.title, "docs")
                          go(link.title)
                        }}
                        className="flex w-full items-center gap-3 rounded-lg border border-border bg-card/50 p-4 transition-colors hover:border-border hover:bg-card"
                      >
                        <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
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
                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-foreground">
                            {link.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {link.subtitle}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <ArrowRight />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-12 lg:mt-0">
                  <div className="rounded-2xl border border-border bg-foreground shadow-2xl">
                    <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full bg-destructive" />
                        <div className="size-3 rounded-full bg-chart-4" />
                        <div className="size-3 rounded-full bg-chart-2" />
                      </div>
                      <div className="flex gap-1">
                        {["Node.js", "Python", "Go"].map((lang) => (
                          <button
                            key={lang}
                            type="button"
                            className={cn(
                              "rounded px-3 py-1 text-xs font-medium transition-colors",
                              lang === docsActiveLang
                                ? "bg-card text-foreground"
                                : "text-background/60 hover:bg-card/50 hover:text-background/80",
                            )}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="p-6">
                      <pre className="overflow-x-auto text-sm leading-relaxed">
                        <code className="font-mono text-background/90">
                          {docsCode}
                        </code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Integrations */}
          <section
            id="integrations"
            className="py-24 lg:py-32"
            aria-labelledby="integrations-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2
                  id="integrations-heading"
                  className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                >
                  {integrationsHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {integrationsDesc}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {integrationItems.map((item, i) => {
                  const col = integrationColors[i % integrationColors.length]
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        void addSavedItem(item.name, "integration")
                        go(item.name)
                      }}
                      className="group flex flex-col items-center justify-center rounded-xl border border-border bg-card/50 p-6 transition-all hover:border-border hover:bg-card"
                    >
                      <div
                        className={cn(
                          "mb-3 grid size-12 place-items-center rounded-lg",
                          col.bg,
                          col.text,
                        )}
                      >
                        {integrationSvgs[i % integrationSvgs.length]}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {item.name}
                      </span>
                    </button>
                  )
                })}
              </div>
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(integrationsViewAll)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  {integrationsViewAll}
                  <ArrowRight />
                </button>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section
            id="pricing"
            className="relative overflow-hidden py-24 lg:py-32"
            aria-labelledby="pricing-heading"
          >
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(59,130,246,0.1), transparent)",
              }}
            />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2
                  id="pricing-heading"
                  className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                >
                  {pricingHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {pricingDesc}
                </p>
              </div>
              <div className="grid gap-8 lg:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <article
                    key={tier.name}
                    className={cn(
                      "relative rounded-2xl bg-card/50 p-8 backdrop-blur-sm",
                      tier.featured
                        ? "border-2 border-primary shadow-xl shadow-primary/10"
                        : "border border-border",
                    )}
                  >
                    {tier.featured ? (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-gradient-to-r from-primary to-accent px-4 py-1 text-xs font-semibold text-primary-foreground shadow-lg">
                          {popularLabel}
                        </span>
                      </div>
                    ) : null}
                    <h3 className="text-lg font-semibold text-foreground">
                      {tier.name}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {tier.tagline}
                    </p>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">
                        {tier.price}
                      </span>
                      {tier.period ? (
                        <span className="text-muted-foreground">
                          {tier.period}
                        </span>
                      ) : null}
                    </div>
                    <ul className="mt-8 space-y-4">
                      {tier.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-start gap-3 text-foreground"
                        >
                          <CheckIcon />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        void addSavedItem(tier.cta, "pricing")
                        go(tier.cta)
                      }}
                      className={cn(
                        "mt-8 block w-full rounded-lg py-3 text-center font-semibold transition-colors",
                        tier.featured
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
                          : "border border-border bg-muted/50 text-foreground hover:bg-muted",
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
            className="py-24 lg:py-32"
            aria-labelledby="testimonials-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2
                  id="testimonials-heading"
                  className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                >
                  {testimonialsHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <article
                    key={t.name}
                    className="rounded-2xl border border-border bg-card/50 p-8"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map((n) => (
                        <Star key={n} />
                      ))}
                    </div>
                    <blockquote className="mb-6 leading-relaxed text-foreground/90">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-foreground">
                          {t.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t.role}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section
            className="border-y border-border/50 bg-muted/30 py-16"
            aria-label="Platform statistics"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                {statItems.map((s) => (
                  <div key={s.label}>
                    <div className="text-4xl font-bold text-foreground">
                      {s.value}
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-24 lg:py-32" aria-labelledby="faq-heading">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2
                  id="faq-heading"
                  className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                >
                  {faqHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {faqDesc}
                </p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group overflow-hidden rounded-xl border border-border bg-card/50 [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-6 text-left">
                      <h3 className="font-semibold text-foreground">
                        {item.question}
                      </h3>
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
          <section
            id="cta"
            className="relative overflow-hidden py-24 lg:py-32"
            aria-labelledby="cta-heading"
          >
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(59,130,246,0.15), transparent)",
              }}
            />
            <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl" />
            <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
              <h2
                id="cta-heading"
                className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              >
                {ctaHeading}
              </h2>
              <p className="mt-6 text-lg text-muted-foreground">
                {ctaDesc}
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition-colors hover:bg-primary/90 sm:w-auto"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-muted/50 px-8 py-4 text-base font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-muted sm:w-auto"
                >
                  {ctaSecondary}
                </button>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                {ctaFootnoteChecks.map((check) => (
                  <div key={check} className="flex items-center gap-2">
                    <CheckIcon />
                    <span>{check}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer
          className="border-t border-border/50 py-16"
          role="contentinfo"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-3"
                >
                  <BrandMark className="size-10" />
                  <span className="text-xl font-bold text-foreground">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {footerBlurb}
                </p>
                <div className="flex gap-4">
                  {(
                    [
                      {
                        label: "GitHub",
                        path: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.069-.729.069-.729 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.304 3.492.832.107-.775.418-1.305.636-1.338-2.665-.253-4.555-1.113-4.555-4.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.339 4.695-4.566 4.943.359.372.678 1.02.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z",
                      },
                      {
                        label: "Twitter",
                        path: "M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84",
                      },
                      {
                        label: "LinkedIn",
                        path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
                      },
                    ] as const
                  ).map((social) => (
                    <button
                      key={social.label}
                      type="button"
                      aria-label={social.label}
                      onClick={() => go(social.label)}
                      className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      <svg
                        className="size-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d={social.path} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-foreground">
                    {col.title}
                  </h4>
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
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">
                {footerCopyright}
              </p>
              <div className="flex gap-6 text-sm">
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
