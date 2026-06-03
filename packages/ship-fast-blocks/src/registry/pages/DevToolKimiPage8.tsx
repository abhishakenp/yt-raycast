import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * DevToolKimiPage8 — a monochrome + neon-green developer-infrastructure LANDING page.
 *
 * Faithful port of a Kimi-generated dark/light industrial dev-tool design (v08).
 * A DISTINCT sibling to DevToolKimiPage: heavy monospace typography, dark hero with
 * code-terminal mockup, bright primary stat bar, bordered cards, and a raw-terminal
 * aesthetic. Use when the brief calls for an API-first / CLI-forward / edge-platform
 * vibe with a high-contrast brand accent, scanline texture, and engineering-heavy copy.
 *
 * Sections: sticky dark navbar with bottom accent strip, hero with code-window,
 * trusted-by logo text strip, 6-up feature cards with icon tiles + metric tags,
 * dark 3-step numbered timeline with command snippets, 2x2 gallery, primary stat bar,
 * 3-tier pricing (Most Popular dark tier), integration framework grid, star-rated
 * testimonials, static FAQ cards, dark closing CTA, dark footer with social icons.
 */
export const DevToolKimiPage8 = defineComponent({
  name: "DevToolKimiPage8",
  description:
    "The 8th style sibling to DevToolKimiPage — a monochrome, high-contrast developer-tool landing page with a neon-green primary accent, monospace typography, dark hero code-terminal, numbered CLI-style steps, a bright metrics band, bordered feature cards, and a raw industrial aesthetic. Use for API platforms, edge infrastructure, developer SDKs, CLI tools, or serverless products when the design brief calls for an engineering-first, terminal-inspired mood distinct from the lighter/safer DevToolKimiPage default.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    hero: z
      .object({
        badge: z.string().optional(),
        headingTop: z.string().optional(),
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        statusLeft: z.string().optional(),
        statusRight: z.string().optional(),
        codeFile: z.string().optional(),
        code: z.string().optional(),
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
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              metric: z.string().optional(),
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
        helper: z.string().optional(),
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
              imageAlt: z.string().optional(),
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
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        popularLabel: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string().optional(),
              price: z.string().optional(),
              period: z.string().optional(),
              features: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
            }),
          )
          .optional(),
        helpTitle: z.string().optional(),
        helpDescription: z.string().optional(),
        helpCta: z.string().optional(),
      })
      .optional(),
    integrations: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.string()).optional(),
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
              role: z.string().optional(),
              avatarAlt: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    faq: z
      .object({
        heading: z.string().optional(),
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
  component: ({ props }) => {
    const go = useNavigate()

    const brand = props.brand ?? "QUBIT_API"
    const nav = props.nav?.length
      ? props.nav
      : ["FEATURES", "DOCS", "PRICING", "INTEGRATIONS"]

    const heroBadge = props.hero?.badge ?? "v3.2 NOW AVAILABLE"
    const headingTop = props.hero?.headingTop ?? "INFRASTRUCTURE THAT"
    const heroHighlight = props.hero?.highlight ?? "DOESN'T SLEEP"
    const heroSub =
      props.hero?.subheading ??
      "Deploy globally in 38ms. 99.999% uptime SLA. Process 2.4M requests per second. The API platform that powers Stripe, Vercel, and Linear."
    const heroPrimary = props.hero?.primaryCta ?? "START FREE TRIAL"
    const heroSecondary = props.hero?.secondaryCta ?? "VIEW DOCUMENTATION"
    const statusLeft = props.hero?.statusLeft ?? "ALL SYSTEMS OPERATIONAL"
    const statusRight = props.hero?.statusRight ?? "LATENCY: 38MS"
    const codeFile = props.hero?.codeFile ?? "qubit-api-demo.js"
    const heroCode =
      props.hero?.code ??
      `import { Qubit } from '@qubit/api';

const client = new Qubit({
  apiKey: process.env.QUBIT_KEY,
  region: 'us-east-1'
});

// Deploy edge function in 38ms
const deployment = await client.deploy({
  name: 'analytics-worker',
  runtime: 'node-20',
  regions: ['global']
});

console.log(\`Deployed to \${deployment.url}\`);`

    const logosLabel =
      props.logos?.label ?? "Trusted by engineering teams at"
    const logoCompanies = props.logos?.companies?.length
      ? props.logos.companies
      : [
          "Stripe",
          "Vercel",
          "Linear",
          "Notion",
          "Figma",
          "Discord",
          "GitHub",
          "Slack",
        ]

    const featuresHeading =
      props.features?.heading ?? "Everything you need to scale"
    const featuresDesc =
      props.features?.description ??
      "From edge deployment to global load balancing. One platform, infinite possibilities. No configuration drift, no surprises."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Edge Deployment",
            description:
              "Deploy to 250+ edge locations in under 40ms. Your code runs close to your users, automatically.",
            metric: "38ms avg deploy",
          },
          {
            title: "DDoS Protection",
            description:
              "Unmetered DDoS mitigation included. Block 500Gbps attacks without breaking a sweat or your budget.",
            metric: "500Gbps mitigation",
          },
          {
            title: "Real-time Analytics",
            description:
              "Millisecond-resolution metrics. Watch your traffic in real-time with 1-second granularity dashboards.",
            metric: "1s granularity",
          },
          {
            title: "Global Database",
            description:
              "SQLite-compatible edge database. Replicate to 35 regions with sub-50ms read consistency.",
            metric: "SQLite-compatible",
          },
          {
            title: "Zero-trust Security",
            description:
              "mTLS by default, SPIFFE identities, and automated certificate rotation. Security that just works.",
            metric: "mTLS default",
          },
          {
            title: "Developer SDKs",
            description:
              "Native SDKs for TypeScript, Python, Go, Rust, and Ruby. Type-safe APIs with full IntelliSense.",
            metric: "5 languages",
          },
        ]

    const stepsHeading = props.steps?.heading ?? "Deploy in 3 minutes flat"
    const stepsDesc =
      props.steps?.description ??
      "No credit card required. Start with 10 million free requests per month."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Install CLI",
            description:
              "One command to get the Qubit CLI on macOS, Linux, or Windows via npm or Homebrew.",
            code: "npm install -g @qubit/cli",
          },
          {
            title: "Authenticate",
            description:
              "Login with your API key or create a new account. SSO via GitHub, Google, or SAML.",
            code: "qubit login --api-key",
          },
          {
            title: "Deploy",
            description:
              "Push your code and watch it deploy globally in seconds. Automatic SSL, CDN, and edge caching.",
            code: "qubit deploy --prod",
          },
        ]
    const stepsHelper =
      props.steps?.helper ??
      "Need help? Read the quickstart guide or book a demo"

    const galleryHeading =
      props.gallery?.heading ?? "Built for engineers, by engineers"
    const galleryDesc =
      props.gallery?.description ??
      "See the tools that thousands of development teams use every day."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "VS Code Extension",
            caption:
              "Deploy from your editor. Real-time logs, one-click rollbacks, and IntelliSense for all APIs.",
            imageAlt:
              "Dark themed code editor showing JavaScript code with syntax highlighting",
          },
          {
            title: "Analytics Dashboard",
            caption:
              "Millisecond-resolution metrics. Watch your traffic in real-time with 1-second granularity.",
            imageAlt:
              "Analytics dashboard displaying real-time traffic metrics and charts",
          },
          {
            title: "Team Collaboration",
            caption:
              "Share preview deployments, collaborate on reviews, and manage access with fine-grained RBAC.",
            imageAlt:
              "Team collaboration interface showing deployment logs and status updates",
          },
          {
            title: "Mobile Monitoring",
            caption:
              "Get alerted on Slack, PagerDuty, or SMS. View status from anywhere with our mobile apps.",
            imageAlt:
              "Mobile phone displaying status monitoring app with green status indicators",
          },
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "2.4M", label: "Requests/sec" },
          { value: "38ms", label: "Global latency" },
          { value: "99.999%", label: "Uptime SLA" },
          { value: "250+", label: "Edge locations" },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Pay for what you use. No hidden fees, no surprise bills. Start free, scale infinitely."
    const popularLabel = props.pricing?.popularLabel ?? "MOST POPULAR"
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Hobby",
            tagline: "For side projects and experiments",
            price: "$0",
            period: "/month",
            features: [
              "10M requests/month",
              "100GB bandwidth",
              "Community support",
              "Basic analytics",
            ],
            cta: "GET STARTED",
            featured: false,
          },
          {
            name: "Pro",
            tagline: "For growing teams and startups",
            price: "$29",
            period: "/month",
            features: [
              "100M requests/month",
              "1TB bandwidth",
              "Priority email support",
              "Advanced analytics",
              "Team collaboration",
            ],
            cta: "START FREE TRIAL",
            featured: true,
          },
          {
            name: "Enterprise",
            tagline: "For large-scale deployments",
            price: "Custom",
            period: "",
            features: [
              "Unlimited requests",
              "Unlimited bandwidth",
              "24/7 phone support",
              "99.999% SLA",
              "SSO & SAML",
              "Dedicated infrastructure",
            ],
            cta: "CONTACT SALES",
            featured: false,
          },
        ]
    const helpTitle = props.pricing?.helpTitle ?? "Need help choosing?"
    const helpDescription =
      props.pricing?.helpDescription ??
      "Talk to our sales team for a custom quote based on your usage patterns."
    const helpCta = props.pricing?.helpCta ?? "SCHEDULE CALL"

    const integrationsHeading =
      props.integrations?.heading ?? "Works with your stack"
    const integrationsDesc =
      props.integrations?.description ??
      "Native integrations with the tools you already use. 200+ integrations and growing."
    const integrationItems = props.integrations?.items?.length
      ? props.integrations.items
      : [
          "Next.js",
          "React",
          "Vue",
          "Svelte",
          "Astro",
          "Nuxt",
          "Python",
          "Go",
          "Rust",
          "Ruby",
          "PHP",
          "Java",
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by developers"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Join thousands of engineers who ship faster with Qubit."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              'We migrated from AWS to Qubit and cut our infrastructure costs by 60%. The edge deployment is genuinely instant - we push code and it\'s live globally in seconds.',
            name: "Marcus Chen",
            role: "CTO at LinearSync",
            avatarAlt:
              "Professional headshot of a smiling male software engineer with short dark hair",
          },
          {
            quote:
              "The developer experience is unmatched. The CLI feels like it was designed by people who actually ship code every day. Zero-config deployments are game-changing.",
            name: "Sarah Mitchell",
            role: "Lead Dev at DataFlow",
            avatarAlt:
              "Professional headshot of a smiling female software developer with long brown hair",
          },
          {
            quote:
              'We process $50M daily through Qubit\'s infrastructure. The 99.999% SLA isn\'t marketing - we\'ve had 100% uptime for 18 months straight.',
            name: "David Park",
            role: "VP Eng at StripeScale",
            avatarAlt:
              "Professional headshot of a male tech lead with glasses and beard",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Common questions"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How does the free tier work?",
            answer:
              "The Hobby plan is free forever for side projects. You get 10 million requests per month, 100GB bandwidth, and community support. No credit card required to start.",
          },
          {
            question: "Can I self-host Qubit?",
            answer:
              "Yes. Our Enterprise plan supports on-premise deployment with full source code escrow. Contact sales for details on air-gapped installations and compliance certifications.",
          },
          {
            question: "What happens if I exceed my limits?",
            answer:
              "We never throttle or shut you down. Pay-as-you-go overages are charged at $0.50 per million requests (Pro) or custom rates (Enterprise). You'll get alerts at 80% and 100% usage.",
          },
          {
            question: "Do you support WebSockets?",
            answer:
              "Yes. Full WebSocket support with 10-minute connection timeouts, automatic reconnection, and horizontal scaling across edge nodes. Server-Sent Events and WebRTC signaling also supported.",
          },
          {
            question: "How do I migrate from Vercel/AWS?",
            answer:
              "We provide a migration CLI that converts your existing configuration. Most Next.js, Nuxt, and static sites deploy without code changes. Enterprise customers get hands-on migration assistance.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to ship faster?"
    const ctaDesc =
      props.cta?.description ??
      "Join 50,000+ developers building on Qubit. Start free, scale infinitely, and never worry about infrastructure again."
    const ctaPrimary = props.cta?.primaryCta ?? "GET STARTED FREE"
    const ctaSecondary = props.cta?.secondaryCta ?? "TALK TO SALES"
    const ctaFootnote =
      props.cta?.footnote ??
      "No credit card required • 10M free requests/month • Cancel anytime"

    const footerBlurb =
      props.footer?.blurb ??
      "The edge platform for developers who ship. Deploy globally in milliseconds."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "PRODUCT",
            links: ["Features", "Pricing", "Changelog", "Roadmap", "Status"],
          },
          {
            title: "DEVELOPERS",
            links: [
              "Documentation",
              "API Reference",
              "SDKs",
              "CLI",
              "Support",
            ],
          },
          {
            title: "COMPANY",
            links: ["About", "Blog", "Careers", "Contact", "Partners"],
          },
        ]
    const footerLegal = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ["Privacy", "Terms", "Security"]
    const footerCopyright =
      props.footer?.copyright ?? `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`

    const BrandMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center bg-primary text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          className="size-5 text-foreground"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </span>
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

    const CheckMini = () => (
      <svg
        className="size-5 flex-shrink-0 text-primary"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        />
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
          className="sticky top-0 z-50 border-b-4 border-primary bg-foreground"
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
                <BrandMark className="size-8" />
                <span className="font-mono text-xl font-bold tracking-tight text-background">
                  QUBIT<span className="text-primary">_</span>API
                </span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="font-mono text-sm text-background/80 transition-colors hover:text-primary"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => go("LOGIN")}
                  className="hidden font-mono text-sm text-background/80 transition-colors hover:text-primary sm:block"
                >
                  LOGIN
                </button>
                <button
                  type="button"
                  onClick={() => go("GET API KEY")}
                  className="bg-primary px-4 py-2 font-mono text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  GET API KEY
                </button>
              </div>
            </div>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section
            className="relative overflow-hidden bg-foreground text-background"
            aria-labelledby="hero-heading"
          >
            {/* Scanline overlay */}
            <div
              className="absolute inset-0 opacity-10"
              aria-hidden="true"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--primary)) 2px, hsl(var(--primary)) 4px)",
              }}
            />
            <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div>
                  <div className="mb-6 inline-flex items-center border border-primary bg-primary/20 px-3 py-1">
                    <span className="font-mono text-xs text-primary">
                      {heroBadge}
                    </span>
                  </div>
                  <h1
                    id="hero-heading"
                    className="mb-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
                  >
                    {headingTop}
                    <br />
                    <span className="font-mono text-primary">
                      {heroHighlight}
                    </span>
                  </h1>
                  <p className="mb-8 max-w-xl text-lg text-background/70">
                    {heroSub}
                  </p>
                  <div className="mb-12 flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="bg-primary px-8 py-4 font-mono font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="border-2 border-background/30 px-8 py-4 font-mono font-bold transition-colors hover:border-primary hover:text-primary"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center gap-6 font-mono text-sm text-background/60">
                    <div className="flex items-center gap-2">
                      <div className="size-2 animate-pulse rounded-full bg-primary" />
                      <span>{statusLeft}</span>
                    </div>
                    <span>{statusRight}</span>
                  </div>
                </div>

                {/* Code window */}
                <div className="overflow-hidden border-2 border-background/20 bg-foreground/95 font-mono text-sm shadow-2xl">
                  <div className="flex items-center gap-2 border-b border-background/20 px-6 py-4">
                    <div className="size-3 rounded-full bg-destructive" />
                    <div className="size-3 rounded-full bg-chart-4" />
                    <div className="size-3 rounded-full bg-chart-2" />
                    <span className="ml-4 text-xs text-background/60">
                      {codeFile}
                    </span>
                  </div>
                  <div className="overflow-x-auto p-6">
                    <pre className="text-background/90">
                      <code>{heroCode}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-2 bg-primary" />
          </section>

          {/* Logos */}
          <section
            className="border-b-2 border-border bg-muted py-12"
            aria-label="Trusted companies"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center justify-items-center gap-8 opacity-70 md:grid-cols-4 lg:grid-cols-8">
                {logoCompanies.map((company) => (
                  <button
                    key={company}
                    type="button"
                    onClick={() => go(company)}
                    className="font-mono text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {company}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section
            className="py-20 lg:py-32"
            aria-labelledby="features-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 max-w-3xl">
                <span className="font-mono text-sm uppercase tracking-wider text-primary">
                  FEATURES
                </span>
                <h2
                  id="features-heading"
                  className="mt-4 text-3xl font-bold sm:text-4xl"
                >
                  {featuresHeading}
                </h2>
                <p className="mt-6 text-lg text-muted-foreground">
                  {featuresDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="group border-2 border-border bg-background p-6 transition-colors hover:border-primary"
                  >
                    <div className="mb-4 grid size-12 place-items-center bg-foreground text-primary transition-colors group-hover:bg-primary group-hover:text-foreground">
                      {/* Icon */}
                      {i === 0 ? (
                        <svg
                          className="size-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      ) : i === 1 ? (
                        <svg
                          className="size-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                      ) : i === 2 ? (
                        <svg
                          className="size-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      ) : i === 3 ? (
                        <svg
                          className="size-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                          />
                        </svg>
                      ) : i === 4 ? (
                        <svg
                          className="size-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="size-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </div>
                    <h3 className="mb-2 font-mono text-lg font-bold">
                      {item.title}
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    {item.metric ? (
                      <code className="bg-muted px-2 py-1 font-mono text-xs text-primary">
                        {item.metric}
                      </code>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section
            className="bg-foreground py-20 text-background lg:py-32"
            aria-labelledby="steps-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 max-w-3xl">
                <span className="font-mono text-sm uppercase tracking-wider text-primary">
                  GET STARTED
                </span>
                <h2
                  id="steps-heading"
                  className="mt-4 text-3xl font-bold sm:text-4xl"
                >
                  {stepsHeading}
                </h2>
                <p className="mt-6 text-lg text-background/70">
                  {stepsDesc}
                </p>
              </div>
              <div className="grid gap-8 lg:grid-cols-3">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-4 font-mono text-6xl font-bold text-background/10">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="border-2 border-border/30 bg-background/10 p-6">
                      <h3 className="mb-3 font-mono text-lg font-bold text-primary">
                        {step.title}
                      </h3>
                      <p className="mb-4 text-sm text-background/70">
                        {step.description}
                      </p>
                      {step.code ? (
                        <code className="block overflow-x-auto bg-foreground p-3 font-mono text-xs text-primary">
                          {step.code}
                        </code>
                      ) : null}
                    </div>
                    {i < stepItems.length - 1 ? (
                      <div
                        aria-hidden="true"
                        className="absolute top-1/2 -right-4 hidden h-0.5 w-8 bg-primary lg:block"
                      />
                    ) : null}
                  </div>
                ))}
              </div>
              <div className="mt-12 text-center">
                <p className="font-mono text-sm text-background/60">
                  {stepsHelper}
                </p>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section
            className="py-20 lg:py-32"
            id="docs"
            aria-labelledby="gallery-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 max-w-3xl">
                <span className="font-mono text-sm uppercase tracking-wider text-primary">
                  DEVELOPER EXPERIENCE
                </span>
                <h2
                  id="gallery-heading"
                  className="mt-4 text-3xl font-bold sm:text-4xl"
                >
                  {galleryHeading}
                </h2>
                <p className="mt-6 text-lg text-muted-foreground">
                  {galleryDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {galleryItems.map((item) => (
                  <figure
                    key={item.title}
                    className="overflow-hidden border-2 border-border bg-background"
                  >
                    <button
                      type="button"
                      onClick={() => go(item.title)}
                      className="block w-full"
                    >
                      <Image
                        alt={item.imageAlt ?? item.title}
                        w={800}
                        h={500}
                        loading="lazy"
                        className="h-64 w-full object-cover"
                      />
                    </button>
                    <figcaption className="p-6">
                      <h3 className="font-mono text-lg font-bold">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
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
            className="bg-primary py-16"
            aria-label="Platform statistics"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statItems.map((s) => (
                  <div key={s.label}>
                    <div className="mb-2 font-mono text-4xl font-bold text-foreground sm:text-5xl">
                      {s.value}
                    </div>
                    <div className="font-mono text-sm uppercase tracking-wider text-foreground/80">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section
            id="pricing"
            className="py-20 lg:py-32"
            aria-labelledby="pricing-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="font-mono text-sm uppercase tracking-wider text-primary">
                  PRICING
                </span>
                <h2
                  id="pricing-heading"
                  className="mt-4 text-3xl font-bold sm:text-4xl"
                >
                  {pricingHeading}
                </h2>
                <p className="mt-6 text-lg text-muted-foreground">
                  {pricingDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
                {pricingTiers.map((tier) => (
                  <article
                    key={tier.name}
                    className={cn(
                      "relative border-2 p-6",
                      tier.featured
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background",
                    )}
                  >
                    {tier.featured ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary px-3 py-1 font-mono text-xs font-bold text-primary-foreground">
                        {popularLabel}
                      </div>
                    ) : null}
                    <div className="mb-6">
                      <h3 className="font-mono text-lg font-bold">
                        {tier.name}
                      </h3>
                      <p
                        className={cn(
                          "mt-2 text-sm",
                          tier.featured
                            ? "text-background/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {tier.tagline}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-foreground">
                        {tier.price}
                      </span>
                      {tier.period ? (
                        <span
                          className={cn(
                            tier.featured
                              ? "text-background/70"
                              : "text-muted-foreground",
                          )}
                        >
                          {tier.period}
                        </span>
                      ) : null}
                    </div>
                    <ul
                      className={cn(
                        "mb-6 space-y-3 text-sm",
                        tier.featured
                          ? "text-background/90"
                          : "text-muted-foreground",
                      )}
                    >
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-2">
                          <CheckMini />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className={cn(
                        "block w-full py-3 font-mono font-bold transition-colors",
                        tier.featured
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border-2 border-foreground text-foreground hover:bg-foreground hover:text-background",
                      )}
                    >
                      {tier.cta}
                    </button>
                  </article>
                ))}
              </div>
              <div className="mt-12 border-2 border-border bg-muted p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h4 className="font-mono font-bold">{helpTitle}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {helpDescription}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => go(helpCta)}
                    className="bg-foreground px-6 py-3 font-mono font-bold text-background transition-colors hover:bg-foreground/90"
                  >
                    {helpCta}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Integrations */}
          <section
            className="border-t-2 border-border bg-muted py-20 lg:py-32"
            aria-labelledby="integrations-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="font-mono text-sm uppercase tracking-wider text-primary">
                  INTEGRATIONS
                </span>
                <h2
                  id="integrations-heading"
                  className="mt-4 text-3xl font-bold sm:text-4xl"
                >
                  {integrationsHeading}
                </h2>
                <p className="mt-6 text-lg text-muted-foreground">
                  {integrationsDesc}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                {integrationItems.map((fw) => (
                  <button
                    key={fw}
                    type="button"
                    onClick={() => go(fw)}
                    className="flex h-24 items-center justify-center border-2 border-border bg-background p-4 font-mono font-bold transition-colors hover:border-primary"
                  >
                    {fw}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            className="py-20 lg:py-32"
            aria-labelledby="testimonials-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="font-mono text-sm uppercase tracking-wider text-primary">
                  TESTIMONIALS
                </span>
                <h2
                  id="testimonials-heading"
                  className="mt-4 text-3xl font-bold sm:text-4xl"
                >
                  {testimonialsHeading}
                </h2>
                <p className="mt-6 text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <article
                    key={t.name}
                    className="border-2 border-border bg-background p-6"
                  >
                    <div className="mb-4 flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt ?? t.name}
                        w={100}
                        h={100}
                        className="size-12 object-cover"
                      />
                      <div>
                        <div className="font-mono font-bold">
                          {t.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t.role}
                        </div>
                      </div>
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {"\u201C"}{t.quote}{"\u201D"}
                    </p>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((n) => (
                        <Star key={n} />
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section
            className="border-t-2 border-border bg-muted py-20 lg:py-32"
            aria-labelledby="faq-heading"
          >
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="font-mono text-sm uppercase tracking-wider text-primary">
                  FAQ
                </span>
                <h2
                  id="faq-heading"
                  className="mt-4 text-3xl font-bold sm:text-4xl"
                >
                  {faqHeading}
                </h2>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <div
                    key={item.question}
                    className="border-2 border-border bg-background p-6"
                  >
                    <h3 className="mb-2 font-mono text-lg font-bold">
                      {item.question}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section
            id="cta"
            className="bg-foreground py-20 text-background lg:py-32"
            aria-labelledby="cta-heading"
          >
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2
                id="cta-heading"
                className="mb-6 text-3xl font-bold sm:text-5xl"
              >
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-background/70">
                {ctaDesc}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="bg-primary px-8 py-4 font-mono font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="border-2 border-background/30 px-8 py-4 font-mono font-bold transition-colors hover:border-primary hover:text-primary"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-8 font-mono text-sm text-background/60">
                {ctaFootnote}
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer
          className="border-t-4 border-primary bg-foreground py-12 text-muted-foreground"
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
                  <BrandMark className="size-8" />
                  <span className="font-mono text-xl font-bold text-background">
                    QUBIT<span className="text-primary">_</span>API
                  </span>
                </button>
                <p className="mb-4 max-w-sm text-sm">{footerBlurb}</p>
                <div className="flex gap-4">
                  {/* GitHub */}
                  <button
                    type="button"
                    onClick={() => go("GitHub")}
                    className="text-muted-foreground transition-colors hover:text-primary"
                    aria-label="GitHub"
                  >
                    <svg
                      className="size-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </button>
                  {/* Twitter */}
                  <button
                    type="button"
                    onClick={() => go("Twitter")}
                    className="text-muted-foreground transition-colors hover:text-primary"
                    aria-label="Twitter"
                  >
                    <svg
                      className="size-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </button>
                  {/* LinkedIn */}
                  <button
                    type="button"
                    onClick={() => go("LinkedIn")}
                    className="text-muted-foreground transition-colors hover:text-primary"
                    aria-label="LinkedIn"
                  >
                    <svg
                      className="size-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </button>
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-mono font-bold text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-muted-foreground transition-colors hover:text-primary"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/30 pt-8">
              <p className="text-sm text-muted-foreground">
                {footerCopyright}
              </p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-muted-foreground transition-colors hover:text-primary"
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
