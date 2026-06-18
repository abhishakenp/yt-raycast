import { useState } from "react"
import { z } from "zod/v4"
import { string, table } from "@ship-fast/lakebed/server"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "#/components/ui/sheet.tsx"

/**
 * DevToolKimiPage4 — a complete, self-contained developer-API / dev-tool platform
 * LANDING page (variant 4).
 *
 * A faithful Tailwind v4 port of a Kimi-generated "StreamForge" design: a polished,
 * high-contrast product-marketing page for developer infrastructure that alternates
 * light content bands with bold dark accent sections. It pairs a two-column hero
 * (release pill badge, serif headline with a primary accent highlight, dual CTAs,
 * a dark terminal code-window mockup with syntax-highlighted curl snippets, and a
 * floating "latency" performance card) with a trusted-by logo strip, a 6-up features
 * grid with multi-hued icon tiles, a 4-step numbered "get started" timeline with
 * dashed connectors, a 6-card dark overlay gallery with category labels, a 3-tier
 * pricing table (Most Popular highlight), a full-bleed primary stats band, three
 * star-rated developer testimonials with avatar headshots, an accordion FAQ with
 * animated chevron details, a dark closing CTA band with dual buttons, and a
 * 5-column footer with product / developers / company / legal link columns and
 * social icons.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy and colors itself
 * with semantic theme tokens only. Dark surfaces (code window, gallery cards, CTA
 * band, footer) use `bg-foreground`/`text-background`; the brand accent maps to
 * `primary`. Every nav item / CTA / footer link / social / form submit routes
 * through `useNavigate` (never a dead "#"). All content imagery uses the alt-driven
 * <Image> component (never a raw src); decorative SVGs stay inline.
 * Callers supply ONLY content data; rich defaults make it render great with no props.
 *
 * Fourth style sibling to DevToolKimiPage for the dev-tool category — use when you
 * want a sophisticated, conversion-focused developer marketing page that blends
 * editorial serif type with a terminal-style code preview, full-bleed dark accent
 * sections, and rich social proof.
 */
export const DevToolKimiPage4 = defineCapsule({
  name: "DevToolKimiPage4",
  description:
    "Complete developer-API / dev-tool / SaaS-infrastructure LANDING page with a polished, high-contrast product-marketing aesthetic that alternates light content bands with bold dark accent sections. Includes a sticky navbar with a geometric wireframe brand mark, a two-column hero with an animated release pill badge, a serif headline with a primary accent highlight phrase, dual CTAs, a dark terminal code-window mockup showing syntax-highlighted curl snippets plus a floating latency stats card, a trusted-by engineering logo strip, a 6-up features grid with multi-hued icon tiles (real-time streaming, enterprise security, observability suite, global edge cache, developer SDKs, flexible deployment), a 4-step numbered onboarding timeline with dashed connector lines, a 6-card dark overlay gallery with category labels and imagery (REST API docs, client libraries, starter templates, event handling, authentication, developer forum), a 3-tier pricing table with a 'Most Popular' highlighted Pro plan and checklist features, a full-bleed primary-colored stats band, three star-rated developer testimonials with avatar headshots, an accordion FAQ with animated chevron details, a dark closing CTA band with dual buttons, and a 5-column footer with product, developers, company, and legal link columns plus social icons. Fourth style sibling to DevToolKimiPage for the dev-tool category; use when you want a sophisticated, conversion-focused developer marketing page that combines editorial serif type with a terminal-style code preview, full-bleed dark accent bands, and rich social proof. Supply content only — brand, nav, hero, logos, features, steps, gallery, pricing, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
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
        highlight: z.string().optional(),
        headingBottom: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        footnote: z.string().optional(),
        codeFile: z.string().optional(),
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
    /** Product screenshot / docs gallery. */
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              category: z.string(),
              title: z.string(),
              caption: z.string(),
              alt: z.string(),
            }),
          )
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
  lakebed: {
    schema: {
      interactions: table({
        section: string(),
        action: string(),
        target: string(),
        destination: string(),
      }),
    },
    queries: {
      interactions: ({ db }) => db.interactions.orderBy('createdAt').all(),
    },
    mutations: {
      logInteraction: ({ db }, section: string, action: string, target: string, destination: string) => {
        db.interactions.insert({
          section,
          action,
          target,
          destination,
        })

        return db.interactions.all()
      },
      clearInteractions: ({ db }) => {
        for (const item of db.interactions.all()) {
          db.interactions.delete(item.id)
        }

        return []
      },
      removeInteraction: ({ db }, interactionId: string) => {
        db.interactions.delete(interactionId)
        return db.interactions.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [activityOpen, setActivityOpen] = useState(false)
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authDisplayName =
      auth.displayName ||
      auth.user?.displayName ||
      authEmail ||
      (isSignedIn ? 'Account' : 'Sign in')
    const authLabel =
      auth.isLoading
        ? 'Checking...'
        : isSignedIn
          ? authDisplayName
          : 'Sign in'
    const trackedInteractions = lakebed.useQuery('interactions')
    const logInteraction = lakebed.useMutation('logInteraction')
    const clearInteractions = lakebed.useMutation('clearInteractions')
    const removeInteraction = lakebed.useMutation('removeInteraction')
    const activityItems = trackedInteractions ?? []
    const activityCount = activityItems.length

    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }

    const handleSignOut = () => {
      lakebed.signOut()
    }

    const brand = props.brand ?? "StreamForge"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Documentation", "Pricing", "Enterprise"]

    const heroBadge = props.hero?.badge ?? "v3.2 Now Available"
    const headingTop = props.hero?.headingTop ?? "Build APIs that"
    const heroHighlight = props.hero?.highlight ?? "scale"
    const headingBottom =
      props.hero?.headingBottom ?? "with your ambition"
    const heroSub =
      props.hero?.subheading ??
      "The complete platform for developers who refuse to compromise. Real-time streaming, 99.99% uptime SLA, and the fastest SDKs in the industry."
    const heroPrimary = props.hero?.primaryCta ?? "Start Building Free"
    const heroSecondary = props.hero?.secondaryCta ?? "Watch Demo"
    const heroFootnote =
      props.hero?.footnote ??
      "10,000 calls/mo free • No credit card required"
    const codeFile = props.hero?.codeFile ?? "curl example.sh"
    const proofTitle =
      props.hero?.proofTitle ?? "12.4ms avg latency"
    const proofSubtitle =
      props.hero?.proofSubtitle ?? "Global edge network"

    const logosLabel =
      props.logos?.label ?? "Trusted by engineering teams at"
    const logoCompanies = props.logos?.companies?.length
      ? props.logos.companies
      : ["Vercel", "Stripe", "Notion", "Linear", "Figma", "Supabase"]

    const featuresHeading =
      props.features?.heading ?? "Everything you need to ship faster"
    const featuresDesc =
      props.features?.description ??
      "From prototyping to production, StreamForge provides the infrastructure, tools, and observability your team needs to build world-class APIs."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Real-time Streaming",
            description:
              "WebSocket and Server-Sent Events with automatic failover. Sub-50ms latency to any edge location worldwide.",
          },
          {
            title: "Enterprise Security",
            description:
              "SOC 2 Type II certified, GDPR compliant, end-to-end encryption. Role-based access control and audit logging.",
          },
          {
            title: "Observability Suite",
            description:
              "Real-time metrics, distributed tracing, and intelligent alerting. Integrates with Datadog, New Relic, and Grafana.",
          },
          {
            title: "Global Edge Cache",
            description:
              "280+ edge locations worldwide. Automatic cache invalidation, edge functions, and smart routing.",
          },
          {
            title: "Developer SDKs",
            description:
              "First-class support for TypeScript, Python, Go, Rust, and Ruby. Auto-generated clients from OpenAPI specs.",
          },
          {
            title: "Flexible Deployment",
            description:
              "Multi-region failover, blue-green deployments, and automatic scaling from zero to millions of requests.",
          },
        ]

    const stepsHeading =
      props.steps?.heading ?? "From zero to production in minutes"
    const stepsDesc =
      props.steps?.description ??
      "Our streamlined onboarding gets you from signup to your first API call faster than brewing coffee."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Create Account",
            description:
              "Sign up with GitHub or email. No credit card required for the free tier with 10,000 API calls monthly.",
          },
          {
            title: "Generate API Key",
            description:
              "Create your first project and API key. Choose from 12 global regions to minimize latency for your users.",
          },
          {
            title: "Install SDK",
            description:
              "npm install @streamforge/sdk — or use our REST API directly.",
          },
          {
            title: "Ship to Production",
            description:
              "Deploy with confidence. Built-in rate limiting, automatic retries, and comprehensive error handling.",
          },
        ]

    const galleryHeading =
      props.gallery?.heading ?? "Built for developers, by developers"
    const galleryDesc =
      props.gallery?.description ??
      "Explore our documentation, SDKs, and example projects to see how teams build with StreamForge."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            category: "Documentation",
            title: "REST API Reference",
            caption: "Complete endpoint documentation with interactive examples",
            alt: "developer working with code on multiple monitors",
          },
          {
            category: "SDKs",
            title: "Client Libraries",
            caption: "TypeScript, Python, Go, Rust, and Ruby SDKs",
            alt: "team of engineers collaborating around a laptop",
          },
          {
            category: "Examples",
            title: "Starter Templates",
            caption: "Production-ready examples for Next.js, FastAPI, and more",
            alt: "computer screen showing programming code",
          },
          {
            category: "Webhooks",
            title: "Event Handling",
            caption: "Configure and verify webhook signatures",
            alt: "developer typing on keyboard with code on screen",
          },
          {
            category: "Security",
            title: "Authentication",
            caption: "JWT, OAuth 2.0, and API key best practices",
            alt: "software engineers in a modern office meeting room",
          },
          {
            category: "Community",
            title: "Developer Forum",
            caption: "Join 12,000+ developers sharing tips and solutions",
            alt: "developers in a startup office working together",
          },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start free and scale as you grow. No hidden fees, no surprises."
    const popularLabel =
      props.pricing?.popularLabel ?? "Most Popular"
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Starter",
            tagline: "For side projects and prototypes",
            price: "$0",
            period: "/month",
            features: [
              "10,000 API calls/month",
              "3 projects",
              "Community support",
              "7-day log retention",
            ],
            cta: "Get Started Free",
            featured: false,
          },
          {
            name: "Pro",
            tagline: "For growing applications",
            price: "$49",
            period: "/month",
            features: [
              "500,000 API calls/month",
              "20 projects",
              "Priority email support",
              "30-day log retention",
              "Advanced analytics",
            ],
            cta: "Start Pro Trial",
            featured: true,
          },
          {
            name: "Enterprise",
            tagline: "For large-scale deployments",
            price: "Custom",
            features: [
              "Unlimited API calls",
              "Unlimited projects",
              "24/7 phone support",
              "1-year log retention",
              "Custom SLAs",
              "Dedicated success manager",
            ],
            cta: "Contact Sales",
            featured: false,
          },
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "12.4ms", label: "Average latency" },
          { value: "280+", label: "Edge locations" },
          { value: "99.99%", label: "Uptime SLA" },
          { value: "50B+", label: "Requests served" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ??
      "Loved by developers worldwide"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See what engineering teams are saying about StreamForge."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "StreamForge cut our API latency by 60%. The WebSocket implementation is flawless, and their support team actually understands engineering problems.",
            name: "Sarah Chen",
            role: "Senior Engineer at Linear",
            avatarAlt:
              "professional headshot of Sarah Chen, a senior software engineer",
          },
          {
            quote:
              "We migrated 3 million users to StreamForge without a single minute of downtime. The edge caching alone saves us $40k monthly on bandwidth.",
            name: "Marcus Rodriguez",
            role: "CTO at Notion",
            avatarAlt:
              "professional headshot of Marcus Rodriguez, a CTO and tech lead",
          },
          {
            quote:
              "The TypeScript SDK is a work of art. Type safety, excellent DX, and the documentation actually stays current. Rare combination.",
            name: "Elena Vasquez",
            role: "Staff Developer Advocate at Vercel",
            avatarAlt:
              "professional headshot of Elena Vasquez, a staff developer advocate",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about StreamForge."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What happens when I exceed my plan limits?",
            answer:
              "We never shut off your API. Instead, you'll receive email notifications at 80% and 100% of your limit. Additional requests are billed at $0.001 per call for the Starter plan and $0.0005 for Pro. Enterprise customers have custom overage terms.",
          },
          {
            question: "Do you offer refunds?",
            answer:
              "Yes. If you're not satisfied within the first 30 days of your paid plan, contact support for a full refund—no questions asked. Annual plan refunds are prorated after the first month.",
          },
          {
            question: "Which programming languages are supported?",
            answer:
              "We provide official SDKs for TypeScript/JavaScript, Python, Go, Ruby, and Rust. Our REST API is fully documented with OpenAPI specs, so you can generate clients for any language. Community SDKs exist for PHP, Java, C#, and Elixir.",
          },
          {
            question: "Is StreamForge SOC 2 compliant?",
            answer:
              "Yes. We are SOC 2 Type II certified, GDPR compliant, and HIPAA eligible. Enterprise customers receive access to our security documentation, penetration test results, and can complete custom security questionnaires.",
          },
          {
            question: "Can I self-host StreamForge?",
            answer:
              "Enterprise customers can deploy StreamForge in their own AWS, GCP, or Azure accounts. This includes dedicated infrastructure, VPC peering, and custom compliance configurations. Contact our sales team for details.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? "Ready to build something amazing?"
    const ctaDesc =
      props.cta?.description ??
      "Join 50,000+ developers who trust StreamForge for their mission-critical APIs. Start free, scale infinitely."
    const ctaPrimary = props.cta?.primaryCta ?? "Get Started Free"
    const ctaSecondary = props.cta?.secondaryCta ?? "Schedule a Demo"
    const ctaFootnote =
      props.cta?.footnote ??
      "No credit card required for free tier. 14-day free trial for Pro features."

    const footerBlurb =
      props.footer?.blurb ??
      "The complete API platform for developers who refuse to compromise."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Changelog", "Roadmap", "Status"],
          },
          {
            title: "Developers",
            links: [
              "Documentation",
              "API Reference",
              "SDKs",
              "Examples",
              "Community",
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
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`

    const BrandMark = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M16 2L2 9L16 16L30 9L16 2Z"
          fill="currentColor"
          fillOpacity="0.2"
        />
        <path
          d="M16 16L2 9V23L16 30V16Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M16 16L30 9V23L16 30V16Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
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
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const PlayCircle = ({ className }: { className?: string }) => (
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
        <circle cx="12" cy="12" r="10" />
        <polygon points="10 8 16 12 10 16 10 8" />
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
        className="size-5 text-chart-4"
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

    const Calendar = ({ className }: { className?: string }) => (
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
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    )

    const featureIcons = [
      // 0 - bolt (real-time)
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
      // 1 - shield-check (security)
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
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>,
      // 2 - bar-chart-2 (observability)
      <svg
        key="chart"
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
      // 3 - database (edge cache)
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
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>,
      // 4 - code (SDKs)
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
      // 5 - sliders (deployment)
      <svg
        key="sliders"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" />
        <line x1="9" y1="8" x2="15" y2="8" />
        <line x1="17" y1="16" x2="23" y2="16" />
      </svg>,
    ]

    const featureIconColors = [
      { bg: "bg-primary/10", text: "text-primary" },
      { bg: "bg-secondary/10", text: "text-secondary" },
      { bg: "bg-accent/10", text: "text-accent" },
      { bg: "bg-chart-1/10", text: "text-chart-1" },
      { bg: "bg-chart-2/10", text: "text-chart-2" },
      { bg: "bg-chart-3/10", text: "text-chart-3" },
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
          className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm"
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => {
                  void logInteraction('navigation', 'home', nav[0], nav[0])
                  go(nav[0])
                }}
                className="flex items-center gap-3"
              >
                <BrandMark className="size-8 text-primary" />
                <span className="text-xl font-semibold text-foreground">
                  {brand}
                </span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      void logInteraction('navigation', 'top-nav', label, label)
                      go(label)
                    }}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={
                    isSignedIn
                      ? () => {
                          void logInteraction(
                            'auth',
                            'account-action',
                            'Sign out',
                            'Account',
                          )
                          handleSignOut()
                        }
                      : handleSignIn
                  }
                  disabled={auth.isLoading}
                  className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
                >
                  {authLabel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void logInteraction(
                      'toolbar',
                      'open activity center',
                      'Get API Key',
                      'Get API Key',
                    )
                    setActivityOpen(true)
                    go('Get API Key')
                  }}
                  className="relative inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {activityCount > 0 ? (
                    <span className="absolute -right-1 -top-1 grid size-4 min-w-4 place-items-center rounded-full bg-primary-foreground px-1 text-[0.65rem] font-black leading-none text-primary">
                      {activityCount}
                    </span>
                  ) : null}
                  Get API Key
                </button>
              </div>
            </div>
          </div>
        </header>

        <Sheet
          open={activityOpen}
          onOpenChange={setActivityOpen}
        >
          <SheetContent
            side="right"
            className="w-full max-w-md border-l border-border p-0"
          >
            <SheetHeader className="border-b border-border p-6">
              <SheetTitle>Developer Activity Center</SheetTitle>
              <SheetDescription>
                Track your recent interactions and quick actions from this
                session.
              </SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              {activityItems.length > 0 ? (
                <div className="space-y-3">
                  {activityItems
                    .slice()
                    .reverse()
                    .map((item) => (
                      <article
                        key={item.id}
                        className="rounded-lg border border-border bg-muted p-3"
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {item.action}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.section} • {item.destination}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              void logInteraction(
                                'activity-center',
                                'remove-interaction',
                                item.action,
                                item.destination,
                              )
                              void removeInteraction(item.id)
                            }}
                            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                          >
                            Remove
                          </button>
                        </div>
                        {item.target ? (
                          <p className="text-xs text-muted-foreground">
                            {item.target}
                          </p>
                        ) : null}
                      </article>
                    ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                  No activity yet. Use this drawer to capture your key
                  interactions while evaluating StreamForge.
                </div>
              )}
            </div>
            <SheetFooter className="border-t border-border p-6">
              <div className="flex flex-col gap-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Total events: {activityCount}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      void logInteraction(
                        'activity-center',
                        'clear-interactions',
                        'Clear history',
                        'Get API Key',
                      )
                      void clearInteractions()
                    }}
                    className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    Clear history
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivityOpen(false)}
                    className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Continue
                  </button>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => {
                    if (isSignedIn) {
                      void logInteraction(
                        'account',
                        'auth',
                        'Sign out',
                        'Get API Key',
                      )
                      handleSignOut()
                    } else {
                      void logInteraction(
                        'account',
                        'auth',
                        'Sign in',
                        'Get API Key',
                      )
                      handleSignIn()
                    }
                    setActivityOpen(false)
                  }}
                >
                  {isSignedIn ? 'Sign out from this session' : 'Sign in with Google'}
                </button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <main>
          {/* Hero */}
          <section
            className="relative overflow-hidden bg-gradient-to-br from-muted via-background to-primary/5"
            aria-labelledby="hero-heading"
          >
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    {heroBadge}
                  </div>
                  <h1
                    id="hero-heading"
                    className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
                  >
                    {headingTop}{" "}
                    <span className="text-primary">{heroHighlight}</span>{" "}
                    {headingBottom}
                  </h1>
                  <p className="max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    {heroSub}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        void logInteraction(
                          'hero',
                          'primary-cta',
                          heroPrimary,
                          heroPrimary,
                        )
                        go(heroPrimary)
                      }}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <ArrowRight />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void logInteraction(
                          'hero',
                          'secondary-cta',
                          heroSecondary,
                          heroSecondary,
                        )
                        go(heroSecondary)
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <PlayCircle className="text-muted-foreground" />
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    {heroFootnote.split("•").map((part) => (
                      <span key={part} className="flex items-center gap-2">
                        <Check />
                        {part.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Code window mockup */}
                <div className="relative">
                  <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/20 to-secondary/20 blur-2xl opacity-60" />
                  <div className="relative overflow-hidden rounded-xl border border-background/20 bg-foreground shadow-2xl">
                    <div className="flex items-center gap-2 border-b border-background/20 bg-background/10 px-4 py-3">
                      <div className="flex gap-1.5">
                        <div className="size-3 rounded-full bg-destructive" />
                        <div className="size-3 rounded-full bg-chart-4" />
                        <div className="size-3 rounded-full bg-chart-2" />
                      </div>
                      <span className="ml-4 font-mono text-xs text-background/60">
                        {codeFile}
                      </span>
                    </div>
                    <div className="overflow-x-auto p-6 font-mono text-sm">
                      <div className="mb-2 text-background/50">
                        # Initialize StreamForge client
                      </div>
                      <div className="text-primary">const</div>
                      <span className="text-background/90"> stream = </span>
                      <span className="text-primary">new</span>
                      <span className="text-background/90">{" "}StreamForge{"({"}</span>
                      <div className="pl-4 text-background/50">
                        apiKey:{" "}
                        <span className="text-chart-2">
                          &apos;sf_live_xxxxxxxx&apos;
                        </span>
                        ,
                      </div>
                      <div className="pl-4 text-background/50">
                        region:{" "}
                        <span className="text-chart-2">
                          &apos;us-east-1&apos;
                        </span>
                        ,
                      </div>
                      <div className="pl-4 text-background/50">
                        version:{" "}
                        <span className="text-chart-2">&apos;v3&apos;</span>
                      </div>
                      <span className="text-background/90">{"});"}</span>
                      <div className="mb-2 mt-4 text-background/50">
                        # Create real-time stream
                      </div>
                      <span className="text-primary">await</span>
                      <span className="text-background/90">
                        {" "}stream.create{"({"}
                      </span>
                      <div className="pl-4 text-background/50">
                        name:{" "}
                        <span className="text-chart-2">
                          &apos;user-events&apos;
                        </span>
                        ,
                      </div>
                      <div className="pl-4 text-background/50">
                        retention:{" "}
                        <span className="text-chart-3">86400</span>,
                      </div>
                      <div className="pl-4 text-background/50">
                        partitions:{" "}
                        <span className="text-chart-3">12</span>
                      </div>
                      <span className="text-background/90">{"});"}</span>
                      <div className="mb-2 mt-4 text-background/50">
                        # Stream response: 201 Created
                      </div>
                      <div className="text-chart-2">
                        {"{"} id: &quot;str_8f4a2b1c&quot;, status: &quot;active&quot;, url: &quot;wss://...&quot; {"}"}
                      </div>
                    </div>
                  </div>

                  {/* Floating latency card */}
                  <div className="absolute -bottom-6 -right-6 hidden rounded-lg border border-border bg-background p-4 shadow-xl sm:block">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-full bg-chart-2/20">
                        <svg
                          className="size-5 text-chart-2"
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
                        <div className="text-sm font-semibold text-foreground">
                          {proofTitle}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {proofSubtitle}
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
            className="border-y border-border bg-background py-12"
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
                    onClick={() => {
                      void logInteraction(
                        'social-proof',
                        'trusted-company',
                        company,
                        company,
                      )
                      go(company)
                    }}
                    className="text-lg font-semibold text-muted-foreground/70 transition-opacity hover:opacity-100"
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
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <h2
                  id="features-heading"
                  className="mb-6 text-3xl font-semibold text-foreground sm:text-4xl lg:text-5xl"
                >
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {featuresDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => {
                  const colors =
                    featureIconColors[i % featureIconColors.length]
                  return (
                    <article
                      key={item.title}
                      className="group rounded-2xl border border-border bg-muted p-8 transition-all hover:border-primary/40 hover:shadow-lg"
                    >
                      <div
                        className={cn(
                          "mb-6 grid size-12 place-items-center rounded-xl transition-transform group-hover:scale-110",
                          colors.bg,
                          colors.text,
                        )}
                      >
                        {featureIcons[i % featureIcons.length]}
                      </div>
                      <h3 className="mb-3 text-xl font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </article>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="bg-muted/40 py-20 lg:py-28" aria-labelledby="steps-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2
                  id="steps-heading"
                  className="mb-6 text-3xl font-semibold text-foreground sm:text-4xl lg:text-5xl"
                >
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {stepsDesc}
                </p>
              </div>
              <div className="grid gap-8 lg:grid-cols-4">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    {i < stepItems.length - 1 ? (
                      <div
                        aria-hidden="true"
                        className="absolute left-full top-8 -z-10 hidden w-full border-t-2 border-dashed border-primary/30 lg:block"
                      />
                    ) : null}
                    <div className="mb-4 text-6xl font-bold leading-none text-primary/10">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section
            id="docs"
            className="py-20 lg:py-28"
            aria-labelledby="gallery-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2
                  id="gallery-heading"
                  className="mb-6 text-3xl font-semibold text-foreground sm:text-4xl lg:text-5xl"
                >
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {galleryDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => {
                      void logInteraction(
                        'gallery',
                        'open-item',
                        item.title,
                        item.title,
                      )
                      go(item.title)
                    }}
                    className="group relative block overflow-hidden rounded-2xl bg-foreground aspect-[4/3]"
                  >
                    <Image
                      alt={item.alt}
                      w={800}
                      h={600}
                      loading="lazy"
                      className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-60"
                    />
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <span className="mb-2 text-xs font-medium uppercase tracking-wide text-primary">
                        {item.category}
                      </span>
                      <h3 className="text-xl font-semibold text-background">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-background/70">
                        {item.caption}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section
            id="pricing"
            className="bg-muted/40 py-20 lg:py-28"
            aria-labelledby="pricing-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2
                  id="pricing-heading"
                  className="mb-6 text-3xl font-semibold text-foreground sm:text-4xl lg:text-5xl"
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
                      "relative rounded-2xl bg-background p-8",
                      tier.featured
                        ? "border-2 border-primary shadow-lg"
                        : "border border-border shadow-sm",
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
                      <h3 className="text-xl font-semibold text-foreground">
                        {tier.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {tier.tagline}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-semibold text-foreground">
                        {tier.price}
                      </span>
                      {tier.period ? (
                        <span className="text-muted-foreground">
                          {tier.period}
                        </span>
                      ) : null}
                    </div>
                    <ul className="mb-8 space-y-3">
                      {tier.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-start gap-3 text-sm text-muted-foreground"
                        >
                          <Check />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        void logInteraction(
                          'pricing',
                          tier.featured ? 'choose-featured-plan' : 'choose-plan',
                          tier.cta,
                          tier.name,
                        )
                        go(tier.cta)
                      }}
                      className={cn(
                        "block w-full rounded-lg px-4 py-3 text-center text-sm font-medium transition-colors",
                        tier.featured
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
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
            className="bg-primary py-16"
            aria-label="Platform statistics"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statItems.map((s) => (
                  <div key={s.label}>
                    <div className="mb-2 text-4xl font-semibold text-primary-foreground sm:text-5xl">
                      {s.value}
                    </div>
                    <div className="text-sm font-medium uppercase tracking-wide text-primary-foreground/70">
                      {s.label}
                    </div>
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
                  className="mb-6 text-3xl font-semibold text-foreground sm:text-4xl lg:text-5xl"
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
                    className="rounded-2xl border border-border bg-muted p-8"
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

          {/* FAQ */}
          <section className="bg-muted/40 py-20 lg:py-28" aria-labelledby="faq-heading">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2
                  id="faq-heading"
                  className="mb-6 text-3xl font-semibold text-foreground sm:text-4xl lg:text-5xl"
                >
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {faqDesc}
                </p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group overflow-hidden rounded-xl border border-border bg-background open:border-primary"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <h3 className="font-semibold text-foreground">
                        {item.question}
                      </h3>
                      <ChevronDown />
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      <p>{item.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Closing CTA */}
          <section className="bg-foreground py-20 lg:py-28" aria-labelledby="cta-heading">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
              <h2
                id="cta-heading"
                className="mb-6 text-3xl font-semibold text-background sm:text-4xl lg:text-5xl"
              >
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-background/70">
                {ctaDesc}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    void logInteraction('cta', 'primary-cta', ctaPrimary, ctaPrimary)
                    go(ctaPrimary)
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-background px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-background/90"
                >
                  {ctaPrimary}
                  <ArrowRight />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void logInteraction(
                      'cta',
                      'secondary-cta',
                      ctaSecondary,
                      ctaSecondary,
                    )
                    go(ctaSecondary)
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-background/30 px-8 py-4 text-base font-medium text-background transition-colors hover:bg-background/10"
                >
                  <Calendar />
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
        <footer className="border-t border-background/20 bg-foreground py-16" role="contentinfo">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-5 lg:gap-12">
              <div className="md:col-span-2 lg:col-span-1">
                <button
                  type="button"
                  onClick={() => {
                    void logInteraction(
                      'navigation',
                      'footer-brand',
                      nav[0],
                      nav[0],
                    )
                    go(nav[0])
                  }}
                  className="mb-4 flex items-center gap-3"
                >
                  <BrandMark className="size-8 text-primary" />
                  <span className="text-xl font-semibold text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-xs text-sm leading-relaxed text-background/60">
                  {footerBlurb}
                </p>
                <div className="flex gap-4">
                  {(["Twitter", "GitHub", "Discord"] as const).map(
                    (social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => {
                        void logInteraction(
                          'footer',
                          'social-link',
                          social,
                          social,
                        )
                        go(social)
                      }}
                      className="grid size-10 place-items-center rounded-lg bg-background/10 text-background/70 transition-colors hover:bg-background/20 hover:text-background"
                    >
                        {social === "Twitter" ? (
                          <svg
                            className="size-5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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
                            <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.293a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                          </svg>
                        )}
                      </button>
                    ),
                  )}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-3 text-sm">
                    {col.links.map((link) => (
                        <li key={link}>
                          <button
                            type="button"
                            onClick={() => {
                              void logInteraction(
                                col.title.toLowerCase(),
                                'footer-link',
                                link,
                                link,
                              )
                              go(link)
                            }}
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
            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
              <p className="text-sm text-background/50">
                {footerCopyright}
              </p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => {
                      void logInteraction('footer', 'legal-link', link, link)
                      go(link)
                    }}
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
