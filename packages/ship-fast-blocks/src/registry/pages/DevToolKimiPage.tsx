import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * DevToolKimiPage — a complete, self-contained developer-API / dev-tool platform
 * LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "DevStack" design: a clean,
 * light, slate-and-blue product marketing page for developer infrastructure
 * (auth, storage, real-time, serverless). It pairs a two-column hero (release
 * pill + bold headline + dual CTAs + a dark code-window mockup with a syntax-
 * highlighted SDK snippet and a floating "trusted by 50,000+ developers"
 * avatar card) with a trusted-by logo strip, a 6-up product features grid, a
 * 3-step "get started" timeline, a 2x2 product screenshot gallery, a 3-tier
 * pricing table (Most Popular highlight), a 4-up metrics band, three star-rated
 * testimonials, an accordion FAQ, a dark closing CTA band, and a 5-column
 * footer with social links.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy and colors
 * itself with semantic theme tokens only. Dark surfaces (code window, CTA band)
 * use `bg-foreground`/`text-background`; the brand/accent blue maps to
 * `primary`. Every nav item / CTA / footer link / social / form submit routes
 * through `useNavigate` (never a dead "#"). All content imagery uses the
 * alt-driven <Image> component (never a raw src); avatars/logos stay raw <img>.
 * Callers supply ONLY content data; rich defaults make it render great with no
 * props at all.
 */
export const DevToolKimiPage = defineComponent({
  name: "DevToolKimiPage",
  description:
    "Complete developer-API / dev-tool / SaaS-infrastructure LANDING page with a clean, light, modern product-marketing aesthetic (slate neutrals + a single blue brand accent). Includes a two-column hero (release/version badge, bold headline with highlighted phrase, dual CTAs, no-credit-card subtext, and a dark code-window mockup showing a syntax-highlighted SDK snippet plus a floating developer-avatar social-proof card), a trusted-by company logo strip, a 6-up product features grid with icon tiles and 'Learn more' links (authentication, database/storage, real-time events, serverless & edge functions, observability), a 3-step numbered 'get started in minutes' timeline, a 2x2 product screenshot gallery (dashboard, API explorer, edge network, team workspaces), a 3-tier pricing table with a 'Most Popular' highlighted plan and checklist features, a 4-up stats/metrics band, three star-rated developer testimonials with avatars, an accordion FAQ, a dark closing CTA band with dual buttons, and a 5-column footer with product/resources/company link columns and social icons. Use as the ROOT/home page for developer tools, API platforms, backend-as-a-service, infrastructure/cloud SDKs, auth/database/real-time/serverless products, or technical SaaS when a credible, conversion-focused page with a code sample, pricing, and social proof is wanted. Supply content only — brand, nav, hero, logos, features, steps, gallery, pricing, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / product name shown in the navbar, CTA and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingTop: z.string().optional(),
        /** Phrase rendered in the brand/primary accent color. */
        highlight: z.string().optional(),
        headingBottom: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        footnote: z.string().optional(),
        /** Filename label on the code-window title bar. */
        codeFile: z.string().optional(),
        /** Raw code shown in the code-window mockup. */
        code: z.string().optional(),
        /** Floating social-proof card. */
        proofTitle: z.string().optional(),
        proofSubtitle: z.string().optional(),
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
        learnMore: z.string().optional(),
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
    /** Product screenshot gallery. */
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), caption: z.string() }))
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
    const brand = props.brand ?? "DevStack"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Pricing", "Docs", "Blog"]

    const heroBadge = props.hero?.badge ?? "v2.4 Now Available"
    const headingTop = props.hero?.headingTop ?? "Build faster with developer APIs that"
    const heroHighlight = props.hero?.highlight ?? "just work"
    const headingBottom = props.hero?.headingBottom ?? ""
    const heroSub =
      props.hero?.subheading ??
      "Authentication, storage, real-time events, and more — all in one platform. Used by 50,000+ developers at companies like Stripe, Notion, and Linear."
    const heroPrimary = props.hero?.primaryCta ?? "Start Building Free"
    const heroSecondary = props.hero?.secondaryCta ?? "View Documentation"
    const heroFootnote =
      props.hero?.footnote ??
      "No credit card required. 10,000 free requests/month."
    const codeFile = props.hero?.codeFile ?? "example.js"
    const heroCode =
      props.hero?.code ??
      `import { DevStack } from '@devstack/sdk';

const ds = new DevStack({
  apiKey: process.env.DS_API_KEY
});

// Authenticate a user
const user = await ds.auth.verify({
  email: 'sarah@acme.com',
  token: 'otp_123456'
});

// Store user data
await ds.storage.set(\`user:\${user.id}\`, {
  preferences: { theme: 'dark' },
  lastLogin: new Date().toISOString()
});`
    const proofTitle = props.hero?.proofTitle ?? "50,000+ developers"
    const proofSubtitle = props.hero?.proofSubtitle ?? "trust DevStack"

    const logosLabel =
      props.logos?.label ?? "Trusted by engineering teams at"
    const logoCompanies = props.logos?.companies?.length
      ? props.logos.companies
      : ["Stripe", "Notion", "Linear", "Vercel", "Shopify", "Slack"]

    const featuresHeading =
      props.features?.heading ?? "Everything you need to ship"
    const featuresDesc =
      props.features?.description ??
      "One platform for authentication, storage, real-time events, and serverless functions. No more stitching together multiple services."
    const featuresLearnMore = props.features?.learnMore ?? "Learn more"
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Authentication",
            description:
              "Complete auth with email, OAuth, SSO, and MFA. Support for React, Vue, Svelte, and native mobile SDKs.",
          },
          {
            title: "Database & Storage",
            description:
              "Auto-scaling PostgreSQL with real-time subscriptions. Key-value store with sub-10ms latency. Object storage with CDN.",
          },
          {
            title: "Real-time Events",
            description:
              "WebSocket-based pub/sub with 99.99% uptime. Broadcast to millions of connections instantly. Presence detection built-in.",
          },
          {
            title: "Serverless Functions",
            description:
              "Deploy functions in Node.js, Python, Go, or Rust. Cold starts under 50ms. Automatic scaling from zero to thousands.",
          },
          {
            title: "Edge Functions",
            description:
              "Run code at 250+ edge locations worldwide. Cache at the edge. Geolocation, bot detection, and A/B testing utilities.",
          },
          {
            title: "Observability",
            description:
              "Built-in logging, metrics, and tracing. Custom dashboards. Alerts via Slack, PagerDuty, or webhook. 30-day retention.",
          },
        ]

    const stepsHeading = props.steps?.heading ?? "Get started in minutes"
    const stepsDesc =
      props.steps?.description ??
      "From signup to production in three simple steps. No complex configuration needed."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Create your project",
            description:
              "Sign up free and create a new project. Choose your framework — we support React, Vue, Svelte, Next.js, and more.",
          },
          {
            title: "Install the SDK",
            description:
              "Run npm install @devstack/sdk and initialize with your API key. Auto-generated code for your stack.",
          },
          {
            title: "Deploy to production",
            description:
              "Push your code. We handle scaling, security, and monitoring. Go from localhost to global in seconds.",
          },
        ]

    const galleryHeading = props.gallery?.heading ?? "Built for modern teams"
    const galleryDesc =
      props.gallery?.description ??
      "From the dashboard to your IDE, every touchpoint is designed for developer productivity."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Analytics Dashboard",
            caption: "Real-time metrics and request logs",
          },
          {
            title: "API Explorer",
            caption: "Interactive documentation and testing",
          },
          {
            title: "Global Edge Network",
            caption: "250+ locations worldwide",
          },
          {
            title: "Team Workspaces",
            caption: "Collaborate with your entire engineering team",
          },
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
            tagline: "For side projects and learning",
            price: "$0",
            period: "/month",
            features: [
              "10,000 API requests/month",
              "1 GB storage",
              "Community support",
              "3 team members",
            ],
            cta: "Get Started",
            featured: false,
          },
          {
            name: "Pro",
            tagline: "For production applications",
            price: "$29",
            period: "/month",
            features: [
              "500,000 API requests/month",
              "50 GB storage",
              "Priority email support",
              "15 team members",
              "Custom domains & SSL",
            ],
            cta: "Start Free Trial",
            featured: true,
          },
          {
            name: "Enterprise",
            tagline: "For large-scale teams",
            price: "Custom",
            features: [
              "Unlimited API requests",
              "Unlimited storage",
              "24/7 phone & Slack support",
              "Unlimited team members",
              "SSO, audit logs, SLAs",
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
          { value: "2B+", label: "Requests/Day" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by developers"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See what engineering teams are building with DevStack."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "DevStack cut our API development time by 70%. Authentication, storage, and real-time — all working out of the box. We went from prototype to production in under two weeks.",
            name: "Marcus Chen",
            role: "CTO, Velocity Labs",
            avatarAlt:
              "professional headshot of a male CTO with beard and glasses smiling",
          },
          {
            quote:
              "The observability features alone are worth the price. We caught a performance issue in staging that would have cost us thousands in production. Support team is incredibly responsive.",
            name: "Sarah Williams",
            role: "Engineering Manager, DataFlow",
            avatarAlt:
              "professional headshot of a female engineering manager with dark curly hair",
          },
          {
            quote:
              "We migrated from Firebase to DevStack and reduced our infrastructure costs by 60%. The TypeScript SDK is fantastic — everything is fully typed and documented.",
            name: "David Park",
            role: "Senior Developer, NexGen Apps",
            avatarAlt:
              "professional headshot of a male senior developer with short dark hair and friendly smile",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ?? "Everything you need to know about DevStack."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What happens when I exceed my plan limits?",
            answer:
              "We never throttle or shut down your service. On the Starter plan, requests beyond 10,000/month return a 429 status. On Pro and Enterprise, overages are billed at $0.0001 per request — about $1 per 10,000 requests. We'll always notify you before any charges occur.",
          },
          {
            question: "Can I self-host DevStack?",
            answer:
              "Yes, Enterprise customers can run DevStack on their own infrastructure — private cloud, AWS, GCP, or Azure. This includes full source code access and dedicated support for setup and maintenance. Contact our sales team for Enterprise pricing.",
          },
          {
            question: "What frameworks and languages do you support?",
            answer:
              "We offer official SDKs for JavaScript/TypeScript (React, Vue, Svelte, Next.js), Python, Go, Ruby, and PHP. Our REST API works with any language that can make HTTP requests. Serverless functions support Node.js 18+, Python 3.9+, Go 1.20+, and Rust 1.70+.",
          },
          {
            question: "Is my data secure?",
            answer:
              "Security is our top priority. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We're SOC 2 Type II certified, GDPR compliant, and undergo regular third-party penetration testing. Enterprise plans include additional features like SSO, audit logs, and custom data retention policies.",
          },
          {
            question: "How does the 14-day free trial work?",
            answer:
              "Start with full Pro plan access — no credit card required. Build and test with up to 500,000 requests. At the end of 14 days, choose to upgrade or automatically downgrade to the free Starter plan. No surprise charges, ever.",
          },
          {
            question: "Do you offer startup or non-profit discounts?",
            answer:
              "Absolutely. Approved startups receive 50% off Pro plans for 12 months. Non-profits and open-source projects can apply for our free Non-Profit tier with expanded limits. Contact our team with your organization details to apply.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to ship faster?"
    const ctaDesc =
      props.cta?.description ??
      "Join 50,000+ developers building with DevStack. Start free, scale as you grow. No credit card required."
    const ctaPrimary = props.cta?.primaryCta ?? "Start Building Free"
    const ctaSecondary = props.cta?.secondaryCta ?? "Talk to Sales"
    const ctaFootnote =
      props.cta?.footnote ?? "Free forever plan includes 10,000 requests/month"

    const footerBlurb =
      props.footer?.blurb ??
      "The complete developer platform for authentication, storage, real-time events, and serverless functions. Built for teams that ship."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Changelog", "Roadmap", "Status"],
          },
          {
            title: "Resources",
            links: ["Documentation", "API Reference", "Guides", "Blog", "Support"],
          },
          {
            title: "Company",
            links: ["About", "Careers", "Legal", "Privacy", "Contact"],
          },
        ]
    const footerLegal = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`

    // Brand bolt logo tile (decorative brand asset).
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

    const Check = () => (
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

    const featureIcons: ReactNode[] = [
      // shield/lock — authentication
      <svg
        key="auth"
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
      // database — storage
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
      // bolt — real-time
      <svg
        key="rt"
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
      // cloud — serverless
      <svg
        key="fn"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.5A4.5 4.5 0 0 1 17 18H7z" />
      </svg>,
      // document — edge
      <svg
        key="edge"
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
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="15" y2="17" />
      </svg>,
      // bars — observability
      <svg
        key="obs"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="18" y1="20" x2="18" y2="10" />
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
                  className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section
            className="relative overflow-hidden bg-muted/40"
            aria-labelledby="hero-heading"
          >
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="max-w-2xl">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    {heroBadge}
                  </div>
                  <h1
                    id="hero-heading"
                    className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
                  >
                    {headingTop} <span className="text-primary">{heroHighlight}</span>
                    {headingBottom ? ` ${headingBottom}` : null}
                  </h1>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    {heroSub}
                  </p>
                  <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <ArrowRight />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-6 py-3 font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">{heroFootnote}</p>
                </div>

                {/* Code window mockup */}
                <div className="relative">
                  <div className="overflow-hidden rounded-xl border border-border bg-foreground shadow-2xl">
                    <div className="flex items-center gap-2 border-b border-border/30 bg-foreground/95 px-4 py-3">
                      <div className="flex gap-1.5">
                        <div className="size-3 rounded-full bg-destructive" />
                        <div className="size-3 rounded-full bg-chart-4" />
                        <div className="size-3 rounded-full bg-chart-2" />
                      </div>
                      <span className="ml-2 font-mono text-xs text-background/60">
                        {codeFile}
                      </span>
                    </div>
                    <div className="overflow-x-auto p-4">
                      <pre className="font-mono text-sm leading-relaxed text-background/90">
                        <code>{heroCode}</code>
                      </pre>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 hidden rounded-lg border border-border bg-background p-3 shadow-lg sm:block">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <Image
                          alt="portrait headshot of a female product manager"
                          w={80}
                          h={80}
                          className="size-8 rounded-full border-2 border-background"
                        />
                        <Image
                          alt="portrait headshot of a male software engineer with glasses"
                          w={80}
                          h={80}
                          className="size-8 rounded-full border-2 border-background"
                        />
                        <Image
                          alt="portrait headshot of a female developer with blonde hair"
                          w={80}
                          h={80}
                          className="size-8 rounded-full border-2 border-background"
                        />
                      </div>
                      <div className="text-xs">
                        <p className="font-semibold text-foreground">{proofTitle}</p>
                        <p className="text-muted-foreground">{proofSubtitle}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section
            className="border-b border-border py-12"
            aria-label="Trusted companies"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-3 items-center justify-items-center gap-8 md:grid-cols-6">
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
            className="py-20 lg:py-28"
            aria-labelledby="features-heading"
          >
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
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg"
                  >
                    <div className="mb-4 grid size-12 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
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
            className="bg-muted/40 py-20 lg:py-28"
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
                        className="absolute left-12 top-6 -z-10 hidden h-0.5 w-full bg-border md:block"
                      />
                    ) : null}
                    <div className="mb-4 grid size-12 place-items-center rounded-full bg-primary font-bold text-primary-foreground">
                      {i + 1}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section
            className="py-20 lg:py-28"
            aria-labelledby="gallery-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2
                  id="gallery-heading"
                  className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
                >
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{galleryDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2">
                {galleryItems.map((item) => (
                  <figure key={item.title} className="group">
                    <button
                      type="button"
                      onClick={() => go(item.title)}
                      className="block w-full overflow-hidden rounded-xl border border-border bg-foreground shadow-lg"
                    >
                      <Image
                        alt={item.title}
                        w={800}
                        h={500}
                        loading="lazy"
                        className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </button>
                    <figcaption className="mt-4 text-center">
                      <h3 className="font-semibold text-foreground">
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

          {/* Pricing */}
          <section
            className="bg-muted/40 py-20 lg:py-28"
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
                      "relative rounded-2xl bg-background p-6 lg:p-8",
                      tier.featured
                        ? "border-2 border-primary shadow-lg"
                        : "border border-border",
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
                      <h3 className="mb-1 text-lg font-semibold text-foreground">
                        {tier.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {tier.tagline}
                      </p>
                    </div>
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
                    <ul className="mb-8 space-y-3 text-sm text-muted-foreground">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-3">
                          <Check />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className={cn(
                        "block w-full rounded-lg px-4 py-2.5 text-center font-medium transition-colors",
                        tier.featured
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border border-input text-foreground hover:bg-muted",
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
            className="border-y border-border py-16"
            aria-label="Platform statistics"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                {statItems.map((s) => (
                  <div key={s.label}>
                    <div className="mb-1 text-3xl font-bold text-foreground sm:text-4xl">
                      {s.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            className="py-20 lg:py-28"
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
              <div className="grid gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <article
                    key={t.name}
                    className="rounded-xl border border-border bg-card p-6"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map((n) => (
                        <Star key={n} />
                      ))}
                    </div>
                    <blockquote className="mb-6 leading-relaxed text-card-foreground/90">
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

          {/* FAQ */}
          <section
            className="bg-muted/40 py-20 lg:py-28"
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
                    className="group overflow-hidden rounded-xl border border-border bg-background"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <h3 className="font-semibold text-foreground">
                        {item.question}
                      </h3>
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
          <section className="py-20 lg:py-28" aria-labelledby="cta-heading">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="rounded-2xl bg-foreground p-8 text-center lg:p-16">
                <h2
                  id="cta-heading"
                  className="mb-4 text-3xl font-bold text-background sm:text-4xl"
                >
                  {ctaHeading}
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-background/70">
                  {ctaDesc}
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(ctaPrimary)}
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {ctaPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(ctaSecondary)}
                    className="inline-flex items-center justify-center rounded-lg border border-background/30 bg-transparent px-8 py-3 font-semibold text-background transition-colors hover:bg-background/10"
                  >
                    {ctaSecondary}
                  </button>
                </div>
                <p className="mt-6 text-sm text-background/50">{ctaFootnote}</p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-16" role="contentinfo">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <BoltMark className="size-8" />
                  <span className="text-xl font-semibold text-foreground">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {footerBlurb}
                </p>
                <div className="flex gap-4">
                  {(["Twitter", "GitHub", "Discord"] as const).map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      {social === "Twitter" ? (
                        <svg
                          className="size-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      ) : social === "GitHub" ? (
                        <svg
                          className="size-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="size-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.293a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                        </svg>
                      )}
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
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">{footerCopyright}</p>
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
