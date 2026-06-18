import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { string, table } from "@ship-fast/lakebed/server"
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
 * DevToolKimiPage5 — a complete, self-contained developer-API / dev-tool platform
 * LANDING page. Fifth style sibling to DevToolKimiPage.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Pixi API" design: a pastel,
 * light, airy, multi-accent product-marketing page for developer infrastructure
 * (payments, messaging, identity, storage). It pairs a two-column hero with a
 * release pill badge, bold headline with a gradient highlight phrase, dual CTAs,
 * a floating dark code-window mockup with colored traffic-light dots and a
 * syntax-highlighted SDK snippet, a floating "request completed" proof card, a
 * trusted-by logo strip, a 6-up product features grid with pastel-tinted cards
 * and gradient icon tiles (auth, payments, messaging, storage, edge,
 * observability), a 3-step "get started in minutes" timeline with embedded dark
 * code snippets, a 2x2 product screenshot gallery with dark gradient overlays,
 * a 3-tier pricing table with a scaled-up dark "Most Popular" Pro plan, a 4-up
 * stats/metrics band on a dark surface with gradient accent numbers, three
 * star-rated developer testimonials with avatar headshots, an accordion FAQ
 * with subtle open-state tinting, a closing CTA band with soft gradient blobs,
 * and a 5-column footer with social icons.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy and colors itself
 * with semantic theme tokens only. Every interactive element routes through
 * useNavigate. All content imagery uses the alt-driven <Image> component.
 * Callers supply ONLY content data; rich defaults make it render fully with no
 * props.
 */
export const DevToolKimiPage5 = defineCapsule({
  name: "DevToolKimiPage5",
  description:
    "Pastel, airy developer-API / dev-tool / SaaS-infrastructure LANDING page (fifth style sibling to DevToolKimiPage) with a soft multi-accent palette, rounded cards, and a light-plus-colorful aesthetic. Features a two-column hero with a release badge, bold headline with a gradient-highlight phrase, dual CTAs, and a dark code-window mockup with traffic-light dots and a syntax-highlighted snippet; a floating 'request completed' proof card; a trusted-by company logo strip; a 6-up features grid with tinted cards and gradient icon tiles (unified auth, payments engine, messaging, object storage, edge functions, observability); a 3-step getting-started timeline with embedded terminal code snippets; a 2x2 product gallery with dark gradient overlays; a 3-tier pricing table with a dark scaled-up 'Most Popular' plan; a 4-up metrics band with gradient accent stats; three star-rated testimonials with headshot avatars; an accordion FAQ; a soft gradient CTA band; and a 5-column footer. Use as the ROOT page for developer tools, API platforms, BaaS, unified-payment/messaging/identity SDKs, or technical SaaS when a friendly, colorful, conversion-focused landing page with docs cues and social proof is wanted. Supply content only — brand, nav, hero, logos, features, steps, gallery, pricing, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
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
        footnoteLeft: z.string().optional(),
        footnoteRight: z.string().optional(),
        codeFile: z.string().optional(),
        code: z.string().optional(),
        proofTitle: z.string().optional(),
        proofSubtitle: z.string().optional(),
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
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
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
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              caption: z.string(),
              alt: z.string().optional(),
            }),
          )
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
          .array(
            z.object({
              value: z.string(),
              label: z.string(),
              gradient: z.boolean().optional(),
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
      featureBookmarks: table({
        featureName: string(),
      }),
    },
    queries: {
      featureBookmarks: ({ db }) => db.featureBookmarks.orderBy("createdAt").all(),
    },
    mutations: {
      toggleFeatureBookmark: ({ db }, featureName: string) => {
        const existing = db.featureBookmarks
          .where("featureName", featureName)
          .all()[0]
        if (existing) {
          db.featureBookmarks.delete(existing.id)
          return db.featureBookmarks.all()
        }

        db.featureBookmarks.insert({ featureName })
        return db.featureBookmarks.all()
      },
      clearFeatureBookmarks: ({ db }) => {
        for (const item of db.featureBookmarks.all()) {
          db.featureBookmarks.delete(item.id)
        }

        return db.featureBookmarks.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [savedFeaturesOpen, setSavedFeaturesOpen] = useState(false)
    const featureBookmarks = lakebed.useQuery("featureBookmarks")
    const toggleFeatureBookmark = lakebed.useMutation("toggleFeatureBookmark")
    const clearFeatureBookmarks = lakebed.useMutation("clearFeatureBookmarks")
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authName =
      auth.displayName || auth.user?.displayName || authEmail || "Account"
    const authLabel = auth.isLoading ? "Checking..." : isSignedIn ? authName : "Sign in"
    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }
    const storedBookmarks = featureBookmarks ?? []
    const savedFeatureNameSet = new Set(
      storedBookmarks.map((bookmark) => bookmark.featureName),
    )
    const savedFeatureCount = storedBookmarks.length

    const brand = props.brand ?? "Pixi API"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Documentation", "Pricing", "Integrations"]

    const heroBadge = props.hero?.badge ?? "Now with WebSocket support"
    const headingTop = props.hero?.headingTop ?? "Build with APIs that"
    const heroHighlight = props.hero?.highlight ?? "just work"
    const headingBottom = props.hero?.headingBottom ?? ""
    const heroSub =
      props.hero?.subheading ??
      "One platform for payments, messaging, identity, and storage. 12 SDKs, 99.99% uptime, and documentation that actually makes sense."
    const heroPrimary = props.hero?.primaryCta ?? "Start Building Free"
    const heroSecondary = props.hero?.secondaryCta ?? "View Documentation"
    const heroFootnoteLeft = props.hero?.footnoteLeft ?? "Free forever tier"
    const heroFootnoteRight = props.hero?.footnoteRight ?? "No credit card required"
    const codeFile = props.hero?.codeFile ?? "example.js"
    const heroCode =
      props.hero?.code ??
      `<span class="text-primary">import</span> { Pixi } <span class="text-primary">from</span> <span class="text-chart-4">'@pixi/sdk'</span>;

<span class="text-background/50">// Initialize with your API key</span>
<span class="text-chart-2">const</span> pixi = <span class="text-chart-2">new</span> <span class="text-chart-3">Pixi</span>({ apiKey: <span class="text-chart-4">'pk_live_...'</span> });

<span class="text-background/50">// Create a payment intent</span>
<span class="text-chart-2">const</span> payment = <span class="text-chart-2">await</span> pixi.payments.<span class="text-chart-3">create</span>({
  amount: <span class="text-chart-4">2000</span>,
  currency: <span class="text-chart-4">'usd'</span>,
  customer: <span class="text-chart-4">'cus_m24x81...'</span>
});

console.<span class="text-chart-3">log</span>(payment.id);
<span class="text-background/50">// → 'pi_3O...'</span>`
    const proofTitle = props.hero?.proofTitle ?? "Request completed"
    const proofSubtitle = props.hero?.proofSubtitle ?? "142ms response time"

    const logosLabel =
      props.logos?.label ?? "Trusted by engineering teams at"
    const logoCompanies = props.logos?.companies?.length
      ? props.logos.companies
      : ["Stripe", "Notion", "Linear", "Vercel", "Shopify", "Slack"]

    const featuresHeading =
      props.features?.heading ?? "Everything you need to ship faster"
    const featuresDesc =
      props.features?.description ??
      "One platform with all the primitives modern applications need. Stop juggling multiple APIs and vendor relationships."
    const featuresLearnMore = props.features?.learnMore ?? "Learn more"
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Unified Auth",
            description:
              "OAuth 2.0, SAML, and passwordless auth with 50+ identity providers. Social login, SSO, and MFA out of the box.",
          },
          {
            title: "Payments Engine",
            description:
              "Accept payments in 135+ currencies. Support for cards, ACH, crypto, and 30+ local payment methods globally.",
          },
          {
            title: "Messaging",
            description:
              "Email, SMS, push, and in-app notifications. Templates with variables, scheduling, and delivery tracking built in.",
          },
          {
            title: "Object Storage",
            description:
              "S3-compatible storage with CDN delivery. Automatic image optimization, video transcoding, and access controls.",
          },
          {
            title: "Edge Functions",
            description:
              "Deploy serverless functions to 35+ edge locations. Cold start in <50ms. Supports Node, Python, Go, and Rust runtimes.",
          },
          {
            title: "Observability",
            description:
              "Real-time logs, metrics, and traces. Custom dashboards, alerting, and 30-day data retention included on all plans.",
          },
        ]

    const stepsHeading =
      props.steps?.heading ?? "From zero to production in minutes"
    const stepsDesc =
      props.steps?.description ??
      "Get your first API call working in under 5 minutes with our SDKs and clear documentation."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Create an account",
            description:
              "Sign up free and get your API keys instantly. No credit card, no approval process, no sales calls.",
            code: `$ npm install @pixi/sdk`,
          },
          {
            title: "Configure your SDK",
            description:
              "Set your API key and configure webhooks. Use our dashboard to test endpoints before going live.",
            code: `import { Pixi } from '@pixi/sdk';
const pixi = new Pixi({
  apiKey: process.env.PIXI_KEY
});`,
          },
          {
            title: "Ship to production",
            description:
              "Deploy with confidence. Real-time monitoring, automatic retries, and 99.99% uptime SLA.",
            code: `// Handle a webhook
app.post('/webhook', async (req, res) => {
  const event = await pixi.webhooks.verify(req);
  handleEvent(event);
});`,
          },
        ]

    const galleryHeading =
      props.gallery?.heading ?? "Powerful tools, delightful interface"
    const galleryDesc =
      props.gallery?.description ??
      "Manage everything from one clean dashboard. No more jumping between 5 different tools."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Analytics Overview",
            caption: "Real-time metrics and usage trends",
            alt: "Analytics dashboard showing payment metrics charts and graphs",
          },
          {
            title: "Request Logs",
            caption: "Debug with detailed request tracing",
            alt: "API request logs interface showing HTTP methods and response codes",
          },
          {
            title: "Webhook Manager",
            caption: "Configure and monitor event delivery",
            alt: "Webhooks configuration panel showing endpoint URLs and event types",
          },
          {
            title: "Team Management",
            caption: "Granular access controls and audit logs",
            alt: "Team member access control settings showing user permissions and roles",
          },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start free, scale as you grow. No hidden fees, no surprise charges, no long-term contracts."
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
              "1,000 API calls/month",
              "All core features",
              "Community support",
              "1 team member",
            ],
            cta: "Get Started Free",
            featured: false,
          },
          {
            name: "Pro",
            tagline: "For growing startups and teams",
            price: "$29",
            period: "/month",
            features: [
              "50,000 API calls/month",
              "Priority email support",
              "10 team members",
              "Advanced analytics",
              "Custom webhooks",
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
              "99.99% SLA guarantee",
              "Dedicated support",
              "SSO and audit logs",
              "Custom contracts",
            ],
            cta: "Contact Sales",
            featured: false,
          },
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "50K+", label: "Active developers", gradient: false },
          { value: "99.99%", label: "Uptime SLA", gradient: true },
          { value: "50ms", label: "Median latency", gradient: false },
          { value: "2B+", label: "Requests daily", gradient: true },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by developers"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Join thousands of developers who've switched to Pixi API for faster builds and fewer headaches."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "We migrated from three different APIs to Pixi and cut our integration time by 70%. The unified SDK is a game-changer.",
            name: "Sarah Chen",
            role: "CTO at Flowdesk",
            avatarAlt:
              "Professional headshot of Sarah Chen, smiling woman with dark hair",
          },
          {
            quote:
              "The documentation is incredible. We had payments running in production within a day. The webhook testing tools alone saved us weeks.",
            name: "Marcus Johnson",
            role: "Lead Engineer at Paddle",
            avatarAlt:
              "Professional headshot of Marcus Johnson, smiling man with short hair",
          },
          {
            quote:
              "We were skeptical about another API platform, but Pixi's reliability has been rock solid. 99.99% uptime is not marketing fluff—it's real.",
            name: "Elena Rodriguez",
            role: "VP Engineering at Orbiter",
            avatarAlt:
              "Professional headshot of Elena Rodriguez, smiling woman with brown hair",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Common questions"
    const faqDesc =
      props.faq?.description ?? "Everything you need to know about Pixi API."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What programming languages do you support?",
            answer:
              "We provide official SDKs for JavaScript/TypeScript, Python, Go, Ruby, PHP, Java, C#, Rust, Elixir, Kotlin, Swift, and Dart. Our REST API is also fully documented for any language we don't have an SDK for yet.",
          },
          {
            question: "How does the free tier work?",
            answer:
              "The free tier includes 1,000 API calls per month with access to all core features. It's designed for side projects, learning, and early-stage startups. No credit card required to start, and you'll never be charged without explicitly upgrading.",
          },
          {
            question: "Can I self-host Pixi API?",
            answer:
              "Yes, Enterprise customers can deploy Pixi API in their own infrastructure or VPC. This is ideal for businesses with strict compliance requirements or those that need complete data sovereignty.",
          },
          {
            question: "What happens if I exceed my plan limits?",
            answer:
              "We'll notify you when you approach your limit. You can enable overages at $0.001 per additional request, or upgrade to a higher tier. We never throttle or cut off service unexpectedly—your application keeps running.",
          },
          {
            question: "Do you offer migration assistance?",
            answer:
              "Absolutely. Pro and Enterprise plans include migration support from Stripe, Twilio, Auth0, AWS, and other platforms. Our team will help plan the migration, review your code, and ensure a smooth transition with zero downtime.",
          },
          {
            question: "Is my data secure?",
            answer:
              "Security is our top priority. We're SOC 2 Type II certified, GDPR compliant, and HIPAA ready. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We undergo regular third-party penetration testing and security audits.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to build something great?"
    const ctaDesc =
      props.cta?.description ??
      "Join 50,000+ developers shipping faster with Pixi API. Start free today—no credit card required, cancel anytime."
    const ctaPrimary = props.cta?.primaryCta ?? "Get Your API Key"
    const ctaSecondary = props.cta?.secondaryCta ?? "Talk to Sales"
    const ctaFootnote =
      props.cta?.footnote ??
      "Free forever tier • No credit card required • Cancel anytime"

    const footerBlurb =
      props.footer?.blurb ??
      "The unified API platform for modern applications. Build faster with less code."
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
              "Webhooks",
              "GitHub",
            ],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Contact", "Partners"],
          },
        ]
    const footerLegal = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ["Privacy Policy", "Terms of Service", "Security"]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-5 flex-shrink-0", className)}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
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
        <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
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
        <path d="M19 9l-7 7-7-7" />
      </svg>
    )

    const BoltMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-2xl bg-gradient-to-br from-chart-2 to-chart-1 text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </span>
    )

    // Tinted card palettes + gradient icon tiles for the features grid.
    const featureTints = [
      "bg-chart-2/10 border-chart-2/20",
      "bg-chart-3/10 border-chart-3/20",
      "bg-chart-4/10 border-chart-4/20",
      "bg-chart-1/10 border-chart-1/20",
      "bg-destructive/10 border-destructive/20",
      "bg-muted border-border",
    ]
    const featureIconBg = [
      "bg-gradient-to-br from-chart-2 to-chart-1",
      "bg-gradient-to-br from-chart-3 to-destructive",
      "bg-gradient-to-br from-chart-4 to-destructive",
      "bg-gradient-to-br from-chart-1 to-chart-2",
      "bg-gradient-to-br from-destructive to-chart-4",
      "bg-gradient-to-br from-foreground/70 to-foreground",
    ]
    const featureIcons = [
      "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
      "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
      "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
      "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
      "M13 10V3L4 14h7v7l9-11h-7z",
      "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    ]
    const stepNumberBg = ["bg-chart-2", "bg-chart-1", "bg-destructive"]
    const stepConnector = [
      "from-chart-2/40 to-transparent",
      "from-chart-1/40 to-transparent",
    ]

    return (
      <div
        className={cn(
          "relative min-h-svh overflow-x-hidden bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(brand)}
                className="flex items-center gap-2"
              >
                <BoltMark className="size-10" />
                <span className="text-xl font-bold text-foreground">{brand}</span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-chart-1"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <Sheet open={savedFeaturesOpen} onOpenChange={setSavedFeaturesOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      className="relative grid size-10 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-chart-1"
                      aria-label="Open saved features"
                    >
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
                        <path d="M6 2a2 2 0 0 0-2 2v18l8-3 8 3V2a2 2 0 0 0-2-2H6z" />
                      </svg>
                      {savedFeatureCount > 0 ? (
                        <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-destructive text-[0.65rem] font-bold text-background">
                          {savedFeatureCount}
                        </span>
                      ) : null}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full max-w-sm gap-0 p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle>Saved features</SheetTitle>
                      <SheetDescription>
                        Bookmark pages you want to revisit while planning your API
                        stack.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {storedBookmarks.length > 0 ? (
                        <ul className="space-y-3">
                          {storedBookmarks.map((item) => (
                            <li
                              key={item.id}
                              className="rounded-xl border border-border bg-muted p-4"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <p className="font-medium text-foreground">
                                  {item.featureName}
                                </p>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => void toggleFeatureBookmark(item.featureName)}
                                    className="text-sm font-medium text-destructive transition-colors hover:text-destructive/80"
                                    aria-label={`Remove ${item.featureName}`}
                                  >
                                    Remove
                                  </button>
                                  <SheetClose asChild>
                                    <button
                                      type="button"
                                      onClick={() => go(item.featureName)}
                                      className="text-sm font-medium text-chart-1 transition-colors hover:text-chart-1/80"
                                    >
                                      Open
                                    </button>
                                  </SheetClose>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-center">
                          <p className="text-sm font-medium text-foreground">
                            No saved features yet
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Click “{featuresLearnMore}” in feature cards to save items.
                          </p>
                        </div>
                      )}
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <div className="w-full space-y-2 text-sm">
                        <p className="text-muted-foreground">
                          {savedFeatureCount} saved feature
                          {savedFeatureCount === 1 ? "" : "s"}
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={!savedFeatureCount}
                            onClick={() => void clearFeatureBookmarks()}
                            className="inline-flex flex-1 items-center justify-center rounded-full bg-muted px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/70 disabled:opacity-50"
                          >
                            Clear saved
                          </button>
                          <SheetClose asChild>
                            <button
                              type="button"
                              className="inline-flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-destructive to-chart-4 px-4 py-2 text-sm font-semibold text-primary-foreground"
                            >
                              Close
                            </button>
                          </SheetClose>
                        </div>
                      </div>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                {isSignedIn ? (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
                  >
                    {authLabel}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      void handleSignIn()
                    }}
                    disabled={auth.isLoading}
                    className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block disabled:pointer-events-none disabled:opacity-60"
                  >
                    {authLabel}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="rounded-full bg-gradient-to-r from-destructive to-chart-4 px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg"
                >
                  Get API Key
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-chart-2/15 via-chart-3/10 to-chart-4/15" />
          <div className="absolute top-20 right-10 size-72 rounded-full bg-chart-1/30 opacity-40 blur-3xl" />
          <div className="absolute bottom-20 left-10 size-72 rounded-full bg-chart-3/30 opacity-40 blur-3xl" />
          <div className="absolute top-40 left-1/3 size-48 rounded-full bg-chart-4/30 opacity-40 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-sm">
                  <span className="size-2 animate-pulse rounded-full bg-chart-2" />
                  <span className="text-sm font-medium text-muted-foreground">{heroBadge}</span>
                </div>
                <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                  {headingTop}{" "}
                  <span className="bg-gradient-to-r from-destructive to-chart-4 bg-clip-text text-transparent">
                    {heroHighlight}
                  </span>
                  {headingBottom ? ` ${headingBottom}` : ""}
                </h1>
                <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                  {heroSub}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-destructive to-chart-4 px-8 py-4 font-semibold text-primary-foreground transition-all hover:shadow-xl"
                  >
                    <span>{heroPrimary}</span>
                    <ArrowRight className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="rounded-full border border-border bg-card px-8 py-4 font-semibold text-foreground transition-all hover:border-chart-1/50 hover:shadow-md"
                  >
                    {heroSecondary}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Check className="text-chart-2" />
                    <span>{heroFootnoteLeft}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="text-chart-2" />
                    <span>{heroFootnoteRight}</span>
                  </div>
                </div>
              </div>

              {/* Code window mockup */}
              <div className="relative">
                <div className="rounded-3xl bg-foreground p-6 shadow-2xl">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="size-3 rounded-full bg-destructive" />
                    <div className="size-3 rounded-full bg-chart-4" />
                    <div className="size-3 rounded-full bg-chart-2" />
                    <span className="ml-2 text-xs text-background/50">{codeFile}</span>
                  </div>
                  <pre className="overflow-x-auto text-sm leading-relaxed">
                    <code
                      className="text-background/80"
                      dangerouslySetInnerHTML={{ __html: heroCode }}
                    />
                  </pre>
                </div>
                <div className="absolute -bottom-6 -left-6 rounded-2xl border border-border bg-card p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-full bg-chart-2/15">
                      <svg
                        className="size-5 text-chart-2"
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
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{proofTitle}</p>
                      <p className="text-xs text-muted-foreground">{proofSubtitle}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Logos */}
        <section className="border-y border-border bg-card py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {logosLabel}
            </p>
            <div className="grid grid-cols-2 items-center gap-8 md:grid-cols-3 lg:grid-cols-6">
              {logoCompanies.map((company) => (
                <button
                  key={company}
                  type="button"
                  onClick={() => go(company)}
                  className="flex h-12 items-center justify-center opacity-60 transition-all hover:opacity-100"
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
        <section className="bg-card py-24" id="features">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <span className="mb-4 inline-block rounded-full bg-chart-1/15 px-4 py-1.5 text-sm font-medium text-chart-1">
                Features
              </span>
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">{featuresHeading}</h2>
              <p className="text-lg text-muted-foreground">{featuresDesc}</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featureItems.map((item, i) => (
                <div
                  key={item.title}
                  className={cn(
                    "group rounded-3xl border p-8 transition-all hover:shadow-xl",
                    featureTints[i % featureTints.length],
                  )}
                >
                  <div
                    className={cn(
                      "mb-6 grid size-14 place-items-center rounded-2xl text-primary-foreground transition-transform group-hover:scale-110",
                      featureIconBg[i % featureIconBg.length],
                    )}
                  >
                    <svg
                      className="size-7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d={featureIcons[i % featureIcons.length]} />
                    </svg>
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-foreground">{item.title}</h3>
                  <p className="mb-4 text-muted-foreground">{item.description}</p>
                  <button
                    type="button"
                    onClick={() => {
                      void toggleFeatureBookmark(item.title)
                      go(item.title)
                    }}
                    aria-label={`${featuresLearnMore}: ${item.title}${
                      savedFeatureNameSet.has(item.title) ? " (already saved)" : ""
                    }`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-chart-1 transition-colors hover:text-chart-1/80"
                  >
                    <span>{featuresLearnMore}</span>
                    {savedFeatureNameSet.has(item.title) ? (
                      <span className="text-xs text-chart-1/80">Saved</span>
                    ) : null}
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="bg-gradient-to-b from-chart-2/10 to-card py-24" id="docs">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <span className="mb-4 inline-block rounded-full bg-chart-4/15 px-4 py-1.5 text-sm font-medium text-chart-4">
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
                      className={cn(
                        "absolute top-8 left-8 right-0 hidden h-0.5 bg-gradient-to-r lg:block",
                        stepConnector[i % stepConnector.length],
                      )}
                    />
                  ) : null}
                  <div className="relative rounded-3xl border border-border bg-card p-8 shadow-sm">
                    <div
                      className={cn(
                        "mb-6 grid size-12 place-items-center rounded-2xl text-xl font-bold text-primary-foreground",
                        stepNumberBg[i % stepNumberBg.length],
                      )}
                    >
                      {i + 1}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">{step.title}</h3>
                    <p className="mb-6 text-muted-foreground">{step.description}</p>
                    {step.code ? (
                      <div className="overflow-x-auto rounded-2xl bg-foreground p-4">
                        <pre className="text-xs leading-relaxed text-background/80">
                          <code>{step.code}</code>
                        </pre>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="bg-card py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <span className="mb-4 inline-block rounded-full bg-chart-3/15 px-4 py-1.5 text-sm font-medium text-chart-3">
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
                  className="group relative overflow-hidden rounded-3xl border border-border text-left shadow-lg transition-shadow hover:shadow-xl"
                >
                  <Image
                    alt={item.alt ?? item.title}
                    w={800}
                    h={500}
                    loading="lazy"
                    className="h-64 w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-foreground/80 to-transparent p-6">
                    <div className="text-background">
                      <h3 className="mb-1 text-lg font-semibold">{item.title}</h3>
                      <p className="text-sm text-background/80">{item.caption}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-gradient-to-b from-card to-chart-2/10 py-24" id="pricing">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <span className="mb-4 inline-block rounded-full bg-destructive/15 px-4 py-1.5 text-sm font-medium text-destructive">
                Pricing
              </span>
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">{pricingHeading}</h2>
              <p className="text-lg text-muted-foreground">{pricingDesc}</p>
            </div>
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
              {pricingTiers.map((tier) =>
                tier.featured ? (
                  <div
                    key={tier.name}
                    className="relative rounded-3xl bg-gradient-to-br from-foreground to-foreground/90 p-8 shadow-xl lg:scale-105"
                  >
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-gradient-to-r from-destructive to-chart-4 px-4 py-1 text-sm font-semibold text-primary-foreground">
                        {popularLabel}
                      </span>
                    </div>
                    <div className="mb-6">
                      <h3 className="mb-2 text-xl font-semibold text-background">{tier.name}</h3>
                      <p className="text-sm text-background/60">{tier.tagline}</p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-background">{tier.price}</span>
                      {tier.period ? <span className="text-background/60">{tier.period}</span> : null}
                    </div>
                    <ul className="mb-8 space-y-4">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-3">
                          <Check className="mt-0.5 text-chart-2" />
                          <span className="text-background/80">{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className="w-full rounded-full bg-gradient-to-r from-destructive to-chart-4 px-6 py-3 font-semibold text-primary-foreground transition-all hover:shadow-lg"
                    >
                      {tier.cta}
                    </button>
                  </div>
                ) : (
                  <div
                    key={tier.name}
                    className="rounded-3xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-lg"
                  >
                    <div className="mb-6">
                      <h3 className="mb-2 text-xl font-semibold text-foreground">{tier.name}</h3>
                      <p className="text-sm text-muted-foreground">{tier.tagline}</p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                      {tier.period ? <span className="text-muted-foreground">{tier.period}</span> : null}
                    </div>
                    <ul className="mb-8 space-y-4">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-3">
                          <Check className="mt-0.5 text-chart-2" />
                          <span className="text-muted-foreground">{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className="w-full rounded-full bg-muted px-6 py-3 font-semibold text-foreground transition-colors hover:bg-muted/70"
                    >
                      {tier.cta}
                    </button>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-foreground py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
              {statItems.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div
                    className={cn(
                      "mb-2 text-4xl font-bold lg:text-5xl",
                      stat.gradient
                        ? "bg-gradient-to-r from-chart-2 to-chart-1 bg-clip-text text-transparent"
                        : "text-background",
                    )}
                  >
                    {stat.value}
                  </div>
                  <p className="text-background/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-gradient-to-b from-chart-2/10 to-card py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <span className="mb-4 inline-block rounded-full bg-chart-1/15 px-4 py-1.5 text-sm font-medium text-chart-1">
                Testimonials
              </span>
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">{testimonialsHeading}</h2>
              <p className="text-lg text-muted-foreground">{testimonialsDesc}</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {testimonialItems.map((t) => (
                <div
                  key={t.name}
                  className="rounded-3xl border border-border bg-card p-8 shadow-sm"
                >
                  <div className="mb-4 flex items-center gap-1">
                    {[0, 1, 2, 3, 4].map((s) => (
                      <Star key={s} />
                    ))}
                  </div>
                  <p className="mb-6 leading-relaxed text-foreground/90">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-4">
                    <Image
                      alt={t.avatarAlt}
                      w={100}
                      h={100}
                      loading="lazy"
                      className="size-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-foreground">{t.name}</p>
                      <p className="text-sm text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-card py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <span className="mb-4 inline-block rounded-full bg-chart-2/15 px-4 py-1.5 text-sm font-medium text-chart-2">
                FAQ
              </span>
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">{faqHeading}</h2>
              <p className="text-lg text-muted-foreground">{faqDesc}</p>
            </div>
            <div className="space-y-4">
              {faqItems.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-2xl bg-muted transition-colors open:bg-chart-2/10"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                    <span className="font-semibold text-foreground">{item.question}</span>
                    <ChevronDown />
                  </summary>
                  <div className="px-6 pb-6 text-muted-foreground">{item.answer}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-gradient-to-br from-chart-2/20 via-chart-3/10 to-chart-4/20 py-24" id="cta">
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 size-64 rounded-full bg-chart-2/30 opacity-30 blur-3xl" />
            <div className="absolute bottom-10 right-10 size-64 rounded-full bg-chart-3/30 opacity-30 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">{ctaHeading}</h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">{ctaDesc}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={() => go(ctaPrimary)}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-destructive to-chart-4 px-8 py-4 font-semibold text-primary-foreground transition-all hover:shadow-xl"
              >
                <span>{ctaPrimary}</span>
                <ArrowRight className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => go(ctaSecondary)}
                className="rounded-full border border-border bg-card px-8 py-4 font-semibold text-foreground transition-all hover:border-chart-1/50 hover:shadow-md"
              >
                {ctaSecondary}
              </button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">{ctaFootnote}</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <div className="mb-4 flex items-center gap-2">
                  <BoltMark className="size-10" />
                  <span className="text-xl font-bold text-background">{brand}</span>
                </div>
                <p className="mb-6 max-w-sm text-background/60">{footerBlurb}</p>
                <div className="flex gap-4">
                  {["Twitter", "GitHub", "LinkedIn"].map((social) => (
                    <button
                      key={social}
                      type="button"
                      onClick={() => go(social)}
                      aria-label={social}
                      className="grid size-10 place-items-center rounded-full bg-background/10 transition-colors hover:bg-background/20"
                    >
                      <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        {social === "Twitter" ? (
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                        ) : social === "GitHub" ? (
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        ) : (
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        )}
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-background">{col.title}</h4>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="transition-colors hover:text-background"
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
              <p className="text-sm text-background/50">{footerCopyright}</p>
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
