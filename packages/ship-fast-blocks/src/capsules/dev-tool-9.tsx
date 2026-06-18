import { type FormEvent, type ReactNode, useState } from "react"
import { z } from "zod/v4"
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar.tsx"
import { Button } from "#/components/ui/button.tsx"
import { Popover, PopoverContent, PopoverTrigger } from "#/components/ui/popover.tsx"
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
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { string, table } from "@ship-fast/lakebed/server"

/**
 * DevToolKimiPage9 — a complete, self-contained developer-API / dev-tool platform
 * LANDING page. The 9th style sibling to DevToolKimiPage.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Vertex" design: a warm,
 * minimal, stone-and-emerald editorial aesthetic for developer infrastructure.
 * Features a two-column hero with an animated news badge, bold headline with
 * muted phrase highlight, dual CTAs, no-credit-card subtext, and a dark
 * code-window mockup showing a syntax-highlighted SDK snippet plus a floating
 * "Response Time" metrics card. Followed by a trusted-by logo strip, a 6-up
 * product features grid with icon tiles and inline tags, a dark 3-step
 * "ship in minutes" timeline with CLI code snippets, a dashboard showcase with
 * checklist and a floating stats card, a 3-tier pricing table with a
 * "Most Popular" highlighted plan, a dark stats band, three star-rated
 * testimonials with avatars, an accordion FAQ, a dark closing CTA band with
 * gradient and dual buttons, and a multi-column footer with social links.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy and colors
 * itself with semantic theme tokens only. Dark surfaces (code window, steps,
 * stats, CTA, footer) use `bg-foreground`/`text-background`; the brand/emerald
 * accent maps to `primary`. Every nav item / CTA / footer link / social /
 * form submit routes through `useNavigate` (never a dead "#"). All content
 * imagery uses the alt-driven <Image> component (never a raw src); avatars/logos
 * stay raw <img>. Callers supply ONLY content data; rich defaults make it render
 * great with no props at all.
 */
export const DevToolKimiPage9 = defineCapsule({
  name: "DevToolKimiPage9",
  description:
    "Complete developer-API / dev-tool / SaaS-infrastructure LANDING page — the 9th style sibling to DevToolKimiPage — with a warm, minimal, stone-and-emerald editorial aesthetic. Includes a two-column hero with animated news badge, bold headline with muted secondary phrase, dual CTAs, no-credit-card subtext, and a dark code-window mockup showing an SDK snippet plus a floating 'Response Time' metrics card. Followed by a trusted-by logo strip, six feature cards with inline tags, a dark three-step 'ship in minutes' timeline with CLI code snippets, a dashboard showcase with checklist and floating stats card, a three-tier pricing table with 'Most Popular' dark highlight, a dark stats band, three star-rated testimonials with avatars, an accordion FAQ, a dark closing CTA band with gradient and dual buttons, and a multi-column footer with social links. Use when a warm, editorial, developer-focused layout with live code examples, transparent pricing, and rich social proof is wanted. Supply content only — brand, nav, hero, logos, features, steps, dashboard, pricing, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / product name shown in the navbar, CTA and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        footnotes: z.array(z.string()).optional(),
        /** Filename label on the code-window title bar. */
        codeFile: z.string().optional(),
        /** Raw code shown in the code-window mockup. */
        code: z.string().optional(),
        /** Floating proof card label. */
        proofLabel: z.string().optional(),
        /** Floating proof card value. */
        proofValue: z.string().optional(),
        /** Floating proof card sub-value. */
        proofSubvalue: z.string().optional(),
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
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              tags: z.array(z.string()).optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** "Get started" numbered steps with code snippets. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              code: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Dashboard showcase section. */
    dashboard: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        checklist: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        statValue: z.string().optional(),
        statLabel: z.string().optional(),
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
        footnote: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        blurb: z.string().optional(),
        columns: z
          .array(
            z.object({
              title: z.string(),
              links: z.array(z.string()),
            }),
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
      apiRequests: table({
        email: string(),
        source: string(),
        message: string(),
      }),
    },
    queries: {
      apiRequests: ({ db }) => db.apiRequests.orderBy("createdAt").all(),
    },
    mutations: {
      submitApiRequest: (
        { db },
        email: string,
        source: string,
        message: string,
      ) => {
        const normalizedEmail = email.trim()
        const normalizedSource = source.trim() || "Developer API access"
        const normalizedMessage = message.trim()

        if (!normalizedEmail) return db.apiRequests.all()

        db.apiRequests.insert({
          email: normalizedEmail,
          source: normalizedSource,
          message: normalizedMessage,
        })

        return db.apiRequests.all()
      },
      removeApiRequest: ({ db }, requestId: string) => {
        if (!requestId) return db.apiRequests.all()

        db.apiRequests.delete(requestId)
        return db.apiRequests.all()
      },
      clearApiRequests: ({ db }) => {
        for (const request of db.apiRequests.all()) {
          db.apiRequests.delete(request.id)
        }

        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Vertex"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Documentation", "Pricing", "Enterprise"]

    const heroBadge =
      props.hero?.badge ?? "New: Edge Functions now support WebSocket"
    const heroHeading =
      props.hero?.heading ?? "Build APIs that scale forever"
    const heroSub =
      props.hero?.subheading ??
      "Vertex is the developer-first platform for building, deploying, and scaling APIs. Global edge deployment, 99.99% uptime SLA, and the tools your team actually wants to use."
    const heroPrimary = props.hero?.primaryCta ?? "Start Building Free"
    const heroSecondary = props.hero?.secondaryCta ?? "Watch Demo"
    const heroFootnotes =
      props.hero?.footnotes?.length
        ? props.hero.footnotes
        : ["No credit card required", "Free tier forever"]
    const heroCodeFile = props.hero?.codeFile ?? "vertex-api-example.js"
    const heroCode =
      props.hero?.code ??
      `// Initialize Vertex client
import { VertexClient } from '@vertex/sdk';
const client = new VertexClient({
  apiKey: 'vx_live_7f8a9b2c3d4e5f6',
  region: 'us-east-1',
  version: '2024-05-15'
});

// Deploy an edge function
const response = await client.functions.deploy({
  name: 'payment-webhook',
  runtime: 'node-20',
  memory: 512,
  regions: ['us-east-1', 'eu-west-1', 'ap-south-1']
});
// Deployed in 847ms → https://vx.dev/f/payment-webhook`
    const proofLabel = props.hero?.proofLabel ?? "Response Time"
    const proofValue = props.hero?.proofValue ?? "23ms"
    const proofSubvalue = props.hero?.proofSubvalue ?? "p99"
    const [requestDrawerOpen, setRequestDrawerOpen] = useState(false)
    const [requestEmail, setRequestEmail] = useState("")
    const [requestMessage, setRequestMessage] = useState("")
    const [requestSource, setRequestSource] = useState("")
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || "Account"
    const authInitials = authDisplayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ME"
    const storedApiRequests = lakebed.useQuery("apiRequests")
    const submitApiRequest = lakebed.useMutation("submitApiRequest")
    const removeApiRequest = lakebed.useMutation("removeApiRequest")
    const clearApiRequests = lakebed.useMutation("clearApiRequests")
    const requestItems = storedApiRequests ?? []
    const requestCount = requestItems.length
    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }
    const openRequestDrawer = (source = "Get API Key") => {
      setRequestSource(source)
      setRequestEmail(isSignedIn ? authEmail ?? requestEmail : requestEmail)
      setRequestDrawerOpen(true)
    }
    const handleRequestSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const normalizedEmail = requestEmail.trim()
      const normalizedMessage = requestMessage.trim()

      if (!normalizedEmail) return

      void submitApiRequest(
        normalizedEmail,
        requestSource || "Get API Key",
        normalizedMessage || "General API access request",
      )

      setRequestMessage("")
      setRequestDrawerOpen(false)
    }

    const authLabel = auth.isLoading
      ? "Checking..."
      : isSignedIn
        ? "Account"
        : "Sign in"

    const logosLabel =
      props.logos?.label ?? "Trusted by engineering teams at"
    const logoCompanies = props.logos?.companies?.length
      ? props.logos.companies
      : ["Stripe", "Notion", "Vercel", "Figma", "Shopify", "Linear"]

    const featuresHeading =
      props.features?.heading ?? "Everything you need to ship APIs"
    const featuresDesc =
      props.features?.description ??
      "From local development to global deployment, Vertex provides the complete toolkit for modern API development. No glue code. No configuration drift."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Edge Deployment",
            description:
              "Deploy to 300+ edge locations worldwide in under a second. Your code runs within 50ms of 95% of the global population.",
            tags: ["Global CDN", "Auto-scaling"],
          },
          {
            title: "Built-in Auth",
            description:
              "JWT, API keys, OAuth2, and SAML—out of the box. Rotate secrets automatically. Audit every request with full traceability.",
            tags: ["JWT", "OAuth2", "SAML"],
          },
          {
            title: "Real-time Analytics",
            description:
              "Request logs, latency percentiles, error rates, and custom metrics—streamed live to your dashboard. Export to Datadog, Grafana, or BigQuery.",
            tags: ["Live Metrics", "Custom Dashboards"],
          },
          {
            title: "CLI & SDK",
            description:
              "Powerful CLI for local development. Native SDKs for TypeScript, Python, Go, Ruby, and Rust with full type safety.",
            tags: ["TypeScript", "Python", "Go"],
          },
          {
            title: "Managed Databases",
            description:
              "PostgreSQL, Redis, and MongoDB instances provisioned instantly. Automated backups, point-in-time recovery, and read replicas.",
            tags: ["PostgreSQL", "Redis", "MongoDB"],
          },
          {
            title: "Enterprise Security",
            description:
              "SOC 2 Type II, GDPR, HIPAA compliant. Private VPCs, dedicated clusters, and custom encryption keys for enterprise needs.",
            tags: ["SOC 2", "GDPR", "HIPAA"],
          },
        ]

    const stepsHeading = props.steps?.heading ?? "Ship in minutes, not months"
    const stepsDesc =
      props.steps?.description ??
      "Get from idea to production with our streamlined developer experience. No DevOps required."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Install the CLI",
            description:
              "One command to install. Works on macOS, Linux, and Windows. Authenticate with your API key and you're ready.",
            code: `$\nnpm install -g @vertex/cli\n$\nvertex login`,
          },
          {
            title: "Write your function",
            description:
              "Use any framework you love. Express, Fastify, Flask, Django—we handle the boilerplate so you focus on business logic.",
            code: `export default async function(req) {\n  const { userId } = req.params;\n  const user = await db.users.find(userId);\n  return { data: user };\n}`,
          },
          {
            title: "Deploy instantly",
            description:
              "One command deploys to our global edge network. Automatic HTTPS, custom domains, and instant rollbacks included.",
            code: `$\nvertex deploy\n# Building...\n# Uploading...\n→ https://api.example.com (847ms)`,
          },
        ]

    const dashHeading =
      props.dashboard?.heading ??
      "A dashboard that actually makes sense"
    const dashDesc =
      props.dashboard?.description ??
      "No more digging through logs. Our developer dashboard surfaces what matters—errors, performance bottlenecks, and cost insights in real-time."
    const dashChecklist = props.dashboard?.checklist?.length
      ? props.dashboard.checklist
      : [
          "Request tracing with 100% sampling for debugging",
          "Cost breakdown by endpoint, region, and team",
          "Auto-generated API documentation from your code",
          "One-click rollbacks to any previous deployment",
        ]
    const dashImageAlt =
      props.dashboard?.imageAlt ??
      "Modern analytics dashboard with charts and metrics displayed on a large monitor"
    const dashStatValue = props.dashboard?.statValue ?? "2.4M"
    const dashStatLabel = props.dashboard?.statLabel ?? "Requests served today"

    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start free, scale as you grow. No surprise bills. No long-term contracts."
    const popularLabel = props.pricing?.popularLabel ?? "Most Popular"
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Starter",
            tagline: "Perfect for side projects",
            price: "$0",
            period: "/month",
            features: [
              "100,000 requests/month",
              "3 edge functions",
              "Community support",
              "1GB database storage",
            ],
            cta: "Get Started",
            featured: false,
          },
          {
            name: "Pro",
            tagline: "For growing applications",
            price: "$29",
            period: "/month",
            features: [
              "2M requests/month",
              "25 edge functions",
              "Priority email support",
              "50GB database storage",
              "Custom domains + SSL",
            ],
            cta: "Start Free Trial",
            featured: true,
          },
          {
            name: "Enterprise",
            tagline: "For large organizations",
            price: "Custom",
            period: "",
            features: [
              "Unlimited requests",
              "Unlimited functions",
              "24/7 dedicated support",
              "Unlimited storage",
              "SOC 2 + HIPAA compliance",
              "Custom SLAs",
            ],
            cta: "Contact Sales",
            featured: false,
          },
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "99.99%", label: "Uptime SLA" },
          { value: "23ms", label: "Average Latency" },
          { value: "300+", label: "Edge Locations" },
          { value: "50K+", label: "Developers" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by developers"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See what engineering teams are saying about Vertex."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "We migrated our entire payment processing infrastructure to Vertex in a weekend. The developer experience is unmatched—we went from deploy to production in under 10 minutes.",
            name: "Sarah Chen",
            role: "CTO, Payflow Systems",
            avatarAlt:
              "Professional headshot of a smiling woman with shoulder-length brown hair wearing a dark blazer",
          },
          {
            quote:
              "The built-in observability tools saved us weeks of engineering time. We can trace any request in seconds and the alerting actually works—no more 3 AM mystery outages.",
            name: "Marcus Williams",
            role: "VP Engineering, DataStream",
            avatarAlt:
              "Professional headshot of a man with short dark hair and glasses wearing a casual button-up shirt",
          },
          {
            quote:
              "We cut our infrastructure costs by 60% while improving our API response times. Vertex's edge caching and smart routing are game-changers for high-traffic applications.",
            name: "Elena Rodriguez",
            role: "Director of Platform, HealthSync",
            avatarAlt:
              "Professional headshot of a smiling woman with blonde hair wearing professional attire",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ?? "Everything you need to know about Vertex."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How does the free tier work?",
            answer:
              "The Starter tier is free forever and includes 100,000 requests per month, 3 edge functions, 1GB of database storage, and community support. No credit card required to sign up. When you exceed limits, we'll notify you but never surprise you with bills.",
          },
          {
            question: "What programming languages do you support?",
            answer:
              "Vertex supports JavaScript/TypeScript (Node.js 18, 20), Python (3.10, 3.11, 3.12), Go (1.21+), Ruby (3.2+), and Rust (1.75+). We're constantly adding new runtimes based on community feedback. You can even run multiple languages in the same project.",
          },
          {
            question: "Can I use my own domain?",
            answer:
              "Yes, custom domains are available on Pro and Enterprise plans. We automatically provision and renew SSL certificates via Let's Encrypt. You can also bring your own certificates if your organization requires specific CAs or extended validation.",
          },
          {
            question: "What happens if I exceed my plan limits?",
            answer:
              "On the free tier, requests beyond 100,000/month return a 429 status code with a clear error message. On paid plans, we automatically handle traffic spikes and bill for overages at transparent rates ($0.50 per million requests). You can set spending caps to prevent surprises.",
          },
          {
            question: "Is my data secure?",
            answer:
              "Security is our top priority. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We're SOC 2 Type II certified, GDPR compliant, and offer HIPAA-compliant infrastructure for healthcare applications. Enterprise customers get dedicated VPCs and custom encryption keys.",
          },
          {
            question: "Do you offer support?",
            answer:
              "Starter plans include community support via Discord and our documentation. Pro plans get priority email support with 4-hour response times during business hours. Enterprise customers receive 24/7 phone support, a dedicated account manager, and quarterly architecture reviews.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to ship faster?"
    const ctaDesc =
      props.cta?.description ??
      "Join 50,000+ developers building on Vertex. Start free today—no credit card required, no time limits."
    const ctaPrimary = props.cta?.primaryCta ?? "Get Started Free"
    const ctaSecondary = props.cta?.secondaryCta ?? "Talk to Sales"
    const ctaFootnote =
      props.cta?.footnote ?? "Questions? Email us at hello@vertex.dev"

    const footerBlurb =
      props.footer?.blurb ??
      "Developer-first infrastructure for modern applications. Build, deploy, and scale APIs with confidence."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Changelog", "Roadmap", "Status"],
          },
          {
            title: "Resources",
            links: [
              "Documentation",
              "API Reference",
              "Guides",
              "Examples",
              "Blog",
            ],
          },
          {
            title: "Company",
            links: ["About", "Careers", "Contact", "Privacy", "Terms"],
          },
        ]
    const footerLegal = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ["Status", "Security", "Sitemap"]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} API Platform, Inc. All rights reserved.`

    // Decorative icons
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
        <line x1="3" y1="12" x2="21" y2="12" />
        <polyline points="14 6 21 12 14 18" />
      </svg>
    )

    const PlayIcon = ({ className }: { className?: string }) => (
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
        <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={cn("mt-0.5 size-4 flex-shrink-0 text-primary", className)}
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

    const featureIcons: ReactNode[] = [
      // bolt — edge deployment
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
      // lock — auth
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
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        <line x1="12" y1="15" x2="12" y2="17" />
      </svg>,
      // bars — analytics
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
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
      </svg>,
      // terminal — CLI
      <svg
        key="terminal"
        className="size-6"
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
      // database
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
        <path d="M4 5v10c0 2.21 3.58 4 8 4s8-1.79 8-4V5" />
        <path d="M4 11v6c0 2.21 3.58 4 8 4s8-1.79 8-4v-6" />
      </svg>,
      // shield check — security
      <svg
        key="shield"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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
        <header
          className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md"
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
                <BoltMark className="size-8" />
                <span className="text-lg font-semibold tracking-tight text-foreground">
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
                            <AvatarImage src={authPicture} alt={authDisplayName} />
                          ) : null}
                          <AvatarFallback className="bg-foreground text-[0.65rem] font-bold text-background">
                            {authInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden max-w-20 truncate text-xs font-semibold md:block">
                          {authDisplayName}
                        </span>
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
                              {authEmail ?? "Signed in to this session"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          type="button"
                          onClick={() => go("Account")}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Account
                        </button>
                        <button
                          type="button"
                          onClick={() => go("Dashboard")}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          API Activity
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
                <Sheet
                  open={requestDrawerOpen}
                  onOpenChange={setRequestDrawerOpen}
                >
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      onClick={() => openRequestDrawer("Get API Key")}
                      className="relative inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {requestCount > 0 ? (
                        <span className="absolute -right-2 -top-2 inline-grid size-5 place-items-center rounded-full bg-background text-[0.65rem] font-bold text-foreground">
                          {requestCount}
                        </span>
                      ) : null}
                      Get API Key
                    </button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle>API access requests</SheetTitle>
                      <SheetDescription>
                        Submit a request and our team will provision your starter
                        API resources.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      <form
                        onSubmit={handleRequestSubmit}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <label
                            htmlFor="api-request-email"
                            className="block text-sm font-medium text-foreground"
                          >
                            Work email
                          </label>
                          <input
                            id="api-request-email"
                            type="email"
                            required
                            value={requestEmail}
                            onChange={(event) =>
                              setRequestEmail(event.target.value)
                            }
                            placeholder="you@company.com"
                            className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="api-request-source"
                            className="block text-sm font-medium text-foreground"
                          >
                            Source campaign
                          </label>
                          <input
                            id="api-request-source"
                            type="text"
                            value={requestSource}
                            onChange={(event) =>
                              setRequestSource(event.target.value)
                            }
                            className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder={heroPrimary}
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="api-request-message"
                            className="block text-sm font-medium text-foreground"
                          >
                            Use case
                          </label>
                          <textarea
                            id="api-request-message"
                            rows={3}
                            value={requestMessage}
                            onChange={(event) =>
                              setRequestMessage(event.target.value)
                            }
                            placeholder="Tell us what you plan to build"
                            className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full rounded-lg"
                          disabled={auth.isLoading}
                        >
                          Submit request
                        </Button>
                      </form>
                      <div className="mt-6">
                        <div className="mb-3 flex items-center justify-between text-sm">
                          <p className="font-medium text-muted-foreground">
                            Recent requests
                          </p>
                          <p className="text-foreground">
                            {requestCount}
                          </p>
                        </div>
                        {requestItems.length ? (
                          <ul className="space-y-3 max-h-56 overflow-y-auto pr-1">
                            {requestItems.map((request) => (
                              <li
                                key={request.id}
                                className="rounded-lg border border-border bg-background p-3"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-foreground">
                                      {request.email}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {request.source}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void removeApiRequest(request.id)
                                    }
                                    className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                                  >
                                    Remove
                                  </button>
                                </div>
                                {request.message ? (
                                  <p className="mt-2 text-xs text-muted-foreground">
                                    {request.message}
                                  </p>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
                            No API access requests yet.
                          </p>
                        )}
                      </div>
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {requestCount} request
                          {requestCount === 1 ? "" : "s"} captured in your
                          session.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={!requestCount}
                            onClick={() => void clearApiRequests()}
                            className="rounded-lg"
                          >
                            Clear all
                          </Button>
                          <SheetClose asChild>
                            <Button
                              type="button"
                              variant="secondary"
                              className="rounded-lg"
                            >
                              Done
                            </Button>
                          </SheetClose>
                        </div>
                      </div>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
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
            <div className="absolute inset-0 bg-gradient-to-br from-muted/60 via-background to-muted/30" />
            <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-muted/30 to-transparent" />
            <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:px-8 lg:pt-32 lg:pb-40">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="max-w-2xl">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    {heroBadge}
                  </div>
                  <h1
                    id="hero-heading"
                    className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
                  >
                    {heroHeading}
                  </h1>
                  <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    {heroSub}
                  </p>
                  <div className="mb-12 flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 shadow-lg"
                    >
                      {heroPrimary}
                      <ArrowRight className="ml-1 size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 py-3.5 font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <PlayIcon className="size-5" />
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    {heroFootnotes.map((note) => (
                      <div key={note} className="flex items-center gap-2">
                        <Check className="size-5" />
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Code window mockup */}
                <div className="relative">
                  <div className="overflow-hidden rounded-xl border border-border bg-foreground shadow-2xl">
                    <div className="flex items-center gap-2 border-b border-background/10 bg-foreground/95 px-4 py-3">
                      <div className="flex gap-1.5">
                        <div className="size-3 rounded-full bg-destructive" />
                        <div className="size-3 rounded-full bg-chart-4" />
                        <div className="size-3 rounded-full bg-primary" />
                      </div>
                      <span className="ml-2 font-mono text-xs text-background/60">
                        {heroCodeFile}
                      </span>
                    </div>
                    <div className="overflow-x-auto p-6">
                      <pre className="font-mono text-sm leading-relaxed text-background/90">
                        <code>{heroCode}</code>
                      </pre>
                    </div>
                  </div>
                  {/* Floating card */}
                  <div className="absolute -bottom-4 -right-4 hidden rounded-lg border border-border bg-background p-4 shadow-xl lg:block">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-lg bg-primary/10">
                        <svg
                          className="size-5 text-primary"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">
                          {proofLabel}
                        </div>
                        <div className="text-lg font-semibold text-foreground">
                          {proofValue}{" "}
                          <span className="text-sm font-normal text-primary">
                            {proofSubvalue}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section
            className="border-y border-border bg-muted/50 py-16"
            aria-label="Trusted companies"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-10 text-center text-sm font-medium tracking-wider text-muted-foreground uppercase">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center justify-items-center gap-8 md:grid-cols-3 lg:grid-cols-6">
                {logoCompanies.map((company) => (
                  <button
                    key={company}
                    type="button"
                    onClick={() => go(company)}
                    className="text-lg font-semibold text-muted-foreground/70 transition-colors hover:text-foreground"
                  >
                    {company}
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
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <h2
                  id="features-heading"
                  className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                >
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {featuresDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/40 hover:shadow-lg"
                  >
                    <div className="mb-6 grid size-12 place-items-center rounded-xl bg-muted text-primary transition-colors group-hover:bg-muted/80">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-3 text-lg font-semibold text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    {item.tags?.length ? (
                      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-muted px-2 py-1"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section
            className="bg-foreground py-24 text-background lg:py-32"
            aria-labelledby="steps-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <h2
                  id="steps-heading"
                  className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
                >
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {stepsDesc}
                </p>
              </div>
              <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="grid size-12 place-items-center rounded-xl border border-background/20 bg-background/10">
                        <span className="text-xl font-bold text-background/80">
                          {i + 1}
                        </span>
                      </div>
                      {i < stepItems.length - 1 ? (
                        <div
                          aria-hidden="true"
                          className="hidden h-px flex-1 bg-background/20 lg:block"
                        />
                      ) : null}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold">
                      {step.title}
                    </h3>
                    <p className="mb-6 leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                    {step.code ? (
                      <div className="overflow-hidden rounded-lg border border-background/20 bg-background/10 p-4">
                        <pre className="overflow-x-auto font-mono text-sm text-background/80">
                          <code>{step.code}</code>
                        </pre>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Dashboard Showcase */}
          <section
            className="py-24 lg:py-32"
            aria-labelledby="dashboard-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div>
                  <h2
                    id="dashboard-heading"
                    className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                  >
                    {dashHeading}
                  </h2>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                    {dashDesc}
                  </p>
                  <ul className="space-y-4">
                    {dashChecklist.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3"
                      >
                        <Check className="size-5" />
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => go("Dashboard")}
                    className="block w-full overflow-hidden rounded-2xl border border-border shadow-2xl"
                  >
                    <Image
                      alt={dashImageAlt}
                      w={800}
                      h={600}
                      loading="lazy"
                      className="h-auto w-full object-cover"
                    />
                  </button>
                  <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-border bg-background p-4 shadow-xl lg:block">
                    <div className="flex items-center gap-3">
                      <div className="grid size-12 place-items-center rounded-lg bg-primary/10">
                        <svg
                          className="size-6 text-primary"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          {dashStatValue}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {dashStatLabel}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section
            className="bg-muted/50 py-24 lg:py-32"
            aria-labelledby="pricing-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2
                  id="pricing-heading"
                  className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                >
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {pricingDesc}
                </p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <article
                    key={tier.name}
                    className={cn(
                      "relative rounded-2xl border p-8",
                      tier.featured
                        ? "border-border bg-foreground"
                        : "border-border bg-card",
                    )}
                  >
                    {tier.featured ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                          {popularLabel}
                        </span>
                      </div>
                    ) : null}
                    <div className="mb-6">
                      <h3
                        className={cn(
                          "mb-2 text-lg font-semibold",
                          tier.featured
                            ? "text-background"
                            : "text-foreground",
                        )}
                      >
                        {tier.name}
                      </h3>
                      <p
                        className={cn(
                          "text-sm",
                          tier.featured
                            ? "text-background/60"
                            : "text-muted-foreground",
                        )}
                      >
                        {tier.tagline}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span
                        className={cn(
                          "text-4xl font-bold",
                          tier.featured
                            ? "text-background"
                            : "text-foreground",
                        )}
                      >
                        {tier.price}
                      </span>
                      {tier.period ? (
                        <span
                          className={cn(
                            tier.featured
                              ? "text-background/60"
                              : "text-muted-foreground",
                          )}
                        >
                          {tier.period}
                        </span>
                      ) : null}
                    </div>
                    <ul className="mb-8 space-y-3">
                      {tier.features.map((feat) => (
                        <li
                          key={feat}
                          className={cn(
                            "flex items-center gap-2 text-sm",
                            tier.featured
                              ? "text-background/80"
                              : "text-foreground",
                          )}
                        >
                          <Check
                            className={cn(
                              "size-4",
                              tier.featured
                                ? "text-primary"
                                : "text-primary",
                            )}
                          />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className={cn(
                        "block w-full rounded-lg px-4 py-3 text-center font-medium transition-colors",
                        tier.featured
                          ? "bg-background text-foreground hover:bg-background/90"
                          : "bg-muted text-foreground hover:bg-muted/80",
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
          <section
            className="bg-foreground py-16"
            aria-label="Platform statistics"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                {statItems.map((s) => (
                  <div key={s.label}>
                    <div className="mb-2 text-3xl font-bold text-background sm:text-4xl">
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

          {/* Testimonials */}
          <section
            className="py-24 lg:py-32"
            aria-labelledby="testimonials-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2
                  id="testimonials-heading"
                  className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                >
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <article
                    key={t.name}
                    className="rounded-2xl border border-border bg-card p-8"
                  >
                    <div className="mb-6 flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map((n) => (
                        <Star key={n} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-card-foreground/90">
                      &ldquo;{t.quote}&rdquo;
                    </p>
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

          {/* FAQ */}
          <section
            className="bg-muted/50 py-24 lg:py-32"
            aria-labelledby="faq-heading"
          >
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2
                  id="faq-heading"
                  className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                >
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group overflow-hidden rounded-xl border border-border bg-background"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <h3 className="font-medium text-foreground">
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
                    <div className="px-6 pb-6 text-muted-foreground">
                      <p className="leading-relaxed">{item.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Closing CTA */}
          <section
            className="relative overflow-hidden bg-foreground py-24 lg:py-32"
            aria-labelledby="cta-heading"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-foreground to-background/20" />
            <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-muted/20 to-transparent" />
            <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
              <h2
                id="cta-heading"
                className="mb-6 text-3xl font-bold tracking-tight text-background sm:text-4xl lg:text-5xl"
              >
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-background/70 sm:text-xl">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-background px-8 py-4 font-medium text-foreground transition-colors hover:bg-background/90 shadow-lg"
                >
                  {ctaPrimary}
                  <ArrowRight className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center rounded-lg border border-background/30 bg-transparent px-8 py-4 font-medium text-background/80 transition-colors hover:bg-background/10"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-8 text-sm text-background/50">
                {ctaFootnote}
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer
          className="border-t border-border bg-foreground py-16"
          role="contentinfo"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-5 lg:gap-12">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-3"
                >
                  <BoltMark className="size-8" />
                  <span className="text-lg font-semibold text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-xs text-sm leading-relaxed text-background/60">
                  {footerBlurb}
                </p>
                <div className="flex gap-4">
                  {(["GitHub", "Twitter", "LinkedIn"] as const).map(
                    (social) => (
                      <button
                        key={social}
                        type="button"
                        aria-label={social}
                        onClick={() => go(social)}
                        className="grid size-10 place-items-center rounded-lg bg-background/10 text-background/60 transition-colors hover:bg-background/20 hover:text-background"
                      >
                        {social === "GitHub" ? (
                          <svg
                            className="size-5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                        ) : social === "Twitter" ? (
                          <svg
                            className="size-5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
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
                  <h4 className="mb-4 font-semibold text-background/90">
                    {col.title}
                  </h4>
                  <ul className="space-y-3 text-sm">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-background/60 transition-colors hover:text-background"
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
              <p className="text-sm text-background/50">
                {footerCopyright}
              </p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-background/50 transition-colors hover:text-background"
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
