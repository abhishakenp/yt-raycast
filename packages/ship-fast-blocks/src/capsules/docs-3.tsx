import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * DocsKimiPage3 — a dark, immersive developer DOCUMENTATION / API-reference page.
 *
 * The third style sibling to DocsKimiPage. A faithful token-compliant port of a
 * Kimi-generated "Velox Docs" design: fixed search navbar with branded logo tile
 * and distribution CTA, persistent left sidebar with grouped navigation
 * (Getting Started / Core Concepts / API Reference / SDKs) including HTTP method
 * badges, a centered hero band with pulsing version badge, gradient headline text,
 * live stats grid, and dual CTAs, a quickstart card grid with gradient icon tiles,
 * dark installation code blocks with tab headers and copy buttons, a six-item
 * feature grid with colored token icons, API endpoint cards with method badges,
 * parameter tables and JSON response examples, a three-column testimonial grid
 * with avatar images and star ratings, a three-tier pricing section with a
 * highlighted Most Popular plan, a gradient CTA band, and a multi-column footer
 * with social links.
 *
 * Use when a dark, code-heavy, API-first documentation site with statistics,
 * social proof, and transparent pricing is desired for developer platforms,
 * SDK guides, edge-deployment services, or SaaS API docs.
 */
export const DocsKimiPage3 = defineCapsule({
  name: "DocsKimiPage3",
  description:
    "Dark, immersive developer DOCUMENTATION and API reference page (third style sibling to DocsKimiPage). Features a fixed search navbar with branded logo tile and distribution CTA, persistent left sidebar with grouped navigation (Getting Started, Core Concepts, API Reference, SDKs) including HTTP method badges, a centered hero band with pulsing version badge, gradient headline text, a live stats grid, and dual CTAs, a quickstart card grid with gradient icon tiles and directional arrows, dark installation code blocks with tab headers and copy buttons, a six-item feature grid with colored token icons, API endpoint cards with method badges, parameter tables, and JSON response examples, a three-column testimonial grid with avatar images and star ratings, a three-tier pricing section with a highlighted Most Popular plan, a gradient CTA band, and a multi-column footer with social links. Use when a dark, code-heavy, API-first documentation site with statistics, social proof, and transparent pricing is desired for developer platforms, SDK guides, edge-deployment services, or SaaS API docs.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
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
    hero: z
      .object({
        badge: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        stats: z
          .array(
            z.object({
              value: z.string(),
              label: z.string(),
            }),
          )
          .optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
      })
      .optional(),
    quickstart: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        cards: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              cta: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    install: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        npmInstall: z.string().optional(),
        usageExample: z.string().optional(),
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
            }),
          )
          .optional(),
      })
      .optional(),
    apiReference: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        endpoints: z
          .array(
            z.object({
              method: z.string(),
              path: z.string(),
              summary: z.string(),
              description: z.string(),
              params: z
                .array(
                  z.object({
                    name: z.string(),
                    type: z.string(),
                    required: z.string(),
                    description: z.string(),
                  }),
                )
                .optional(),
              response: z.string().optional(),
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
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              description: z.string(),
              price: z.string(),
              period: z.string().optional(),
              features: z.array(z.string()),
              cta: z.string(),
              popular: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    cta: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(
            z.object({
              title: z.string(),
              links: z.array(z.string()),
            }),
          )
          .optional(),
        legal: z.array(z.string()).optional(),
        socials: z.array(z.string()).optional(),
        note: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()

    const brand = props.brand ?? "Velox"
    const nav = props.nav?.length
      ? props.nav
      : ["Getting Started", "Core Concepts", "API Reference", "SDKs"]

    const sidebarGroups = props.sidebar?.groups?.length
      ? props.sidebar.groups
      : [
          {
            title: "Getting Started",
            items: ["Introduction", "Quick Start", "Installation", "Configuration"],
          },
          {
            title: "Core Concepts",
            items: [
              "Authentication",
              "Making Requests",
              "Response Format",
              "Pagination",
              "Error Handling",
            ],
          },
          {
            title: "API Reference",
            items: ["Users", "Projects", "Deployments", "Webhooks"],
          },
          {
            title: "SDKs",
            items: ["Node.js", "Python", "Go"],
          },
        ]

    const heroBadge = props.hero?.badge ?? "Documentation v2.4"
    const heroTitle =
      props.hero?.title ?? "Build with Velox API"
    const heroDescription =
      props.hero?.description ??
      "The edge-ready platform for modern applications. Deploy globally in seconds with our distributed infrastructure across 45 regions worldwide."
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: "45ms", label: "Avg. Latency" },
          { value: "99.99%", label: "Uptime SLA" },
          { value: "45+", label: "Regions" },
          { value: "2M+", label: "Requests/Day" },
        ]
    const heroPrimary = props.hero?.primaryCta ?? "Quick Start"
    const heroSecondary = props.hero?.secondaryCta ?? "API Reference"

    const quickstartHeading =
      props.quickstart?.heading ?? "Get Started in Minutes"
    const quickstartDescription =
      props.quickstart?.description ??
      "Choose your path and start building with Velox. From zero to production in under 5 minutes."
    const quickstartCards = props.quickstart?.cards?.length
      ? props.quickstart.cards
      : [
          {
            title: "Quick Start",
            description:
              "Get up and running with Velox in under 5 minutes with our step-by-step guide.",
            cta: "Start building",
          },
          {
            title: "API Keys",
            description:
              "Generate and manage API keys. Secure your requests with Bearer token authentication.",
            cta: "Get API key",
          },
          {
            title: "SDKs",
            description:
              "Official SDKs for Node.js, Python, Go, Ruby, and more with full type support.",
            cta: "View SDKs",
          },
          {
            title: "Examples",
            description:
              "Explore real-world examples and starter templates for common use cases.",
            cta: "Browse examples",
          },
        ]

    const installHeading = props.install?.heading ?? "Installation"
    const installDescription =
      props.install?.description ??
      "Install the Velox SDK in your project. We support all major package managers and languages."
    const installNpm =
      props.install?.npmInstall ??
      `# Install the Velox SDK\nnpm install @velox/sdk\n\n# Or install the CLI globally\nnpm install -g @velox/cli`
    const installUsage =
      props.install?.usageExample ??
      `// Initialize the Velox client\nimport { VeloxClient } from '@velox/sdk';\n\nconst client = new VeloxClient({\n  apiKey: 'vlx_live_abc123xyz789',\n  region: 'us-east-1'\n});\n\n// Create a new deployment\nconst deployment = await client.deployments.create({\n  name: 'my-awesome-app',\n  source: './dist',\n  env: { NODE_ENV: 'production' }\n});\n\nconsole.log(\`Deployed to: \${deployment.url}\`);\n// Output: Deployed to: https://my-awesome-app-abc123.velox.run`

    const featuresHeading = props.features?.heading ?? "Why Velox?"
    const featuresDescription =
      props.features?.description ??
      "Built for developers who demand speed, reliability, and global scale."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Global Edge Network",
            description:
              "Deploy to 45+ regions worldwide with automatic anycast routing. Your users connect to the nearest edge node for sub-50ms latency.",
          },
          {
            title: "Enterprise Security",
            description:
              "SOC 2 Type II certified with automatic SSL, DDoS protection, and granular access controls. Your data is encrypted at rest and in transit.",
          },
          {
            title: "Instant Deployments",
            description:
              "Push to deploy in under 10 seconds. Our build pipeline optimizes and distributes your application globally automatically.",
          },
          {
            title: "Real-time Analytics",
            description:
              "Monitor requests, latency, and errors in real-time. Set up alerts and get insights into your application's performance.",
          },
          {
            title: "Preview Deployments",
            description:
              "Every pull request gets a unique preview URL. Share with your team and stakeholders before merging to production.",
          },
          {
            title: "24/7 Support",
            description:
              "Get help from our engineering team any time. Average response time under 5 minutes for paid plans.",
          },
        ]

    const apiHeading = props.apiReference?.heading ?? "API Reference"
    const apiDescription =
      props.apiReference?.description ??
      "Complete reference for the Velox REST API. Base URL: https://api.velox.run/v2"
    const apiEndpoints = props.apiReference?.endpoints?.length
      ? props.apiReference.endpoints
      : [
          {
            method: "GET",
            path: "/projects",
            summary: "List all projects",
            description:
              "Returns a paginated list of all projects associated with your account.",
            params: [
              {
                name: "limit",
                type: "integer",
                required: "Optional",
                description: "Number of results (max 100, default 20)",
              },
              {
                name: "cursor",
                type: "string",
                required: "Optional",
                description: "Pagination cursor from previous response",
              },
            ],
            response: `{\n  "data": [\n    {\n      "id": "proj_abc123",\n      "name": "ecommerce-api",\n      "region": "us-east-1",\n      "status": "active",\n      "created_at": "2024-01-15T09:23:45Z",\n      "url": "https://ecommerce-api-abc123.velox.run"\n    }\n  ],\n  "pagination": {\n    "next_cursor": "c1JpZ2h0IG5vd24u",\n    "has_more": true\n  }\n}`,
          },
          {
            method: "POST",
            path: "/deployments",
            summary: "Create new deployment",
            description:
              "Deploy a new version of your project. Returns deployment details including the live URL.",
          },
        ]

    const testimonialHeading =
      props.testimonials?.heading ?? "Trusted by Developers"
    const testimonialDescription =
      props.testimonials?.description ??
      "Join thousands of developers building on Velox."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Velox cut our deployment time from 15 minutes to under 30 seconds. The global edge network means our users in Asia and Europe get the same blazing-fast experience.",
            name: "Sarah Chen",
            role: "CTO at FlowCommerce",
            imageAlt:
              "Professional headshot of a smiling female software engineer with dark hair",
          },
          {
            quote:
              "The SDK is incredibly well-designed. I had our API integrated within an hour. The TypeScript support is top-notch with full autocomplete on every method.",
            name: "Marcus Johnson",
            role: "Senior Engineer at DataSync",
            imageAlt:
              "Professional headshot of a male developer with short brown hair and a friendly smile",
          },
          {
            quote:
              "We migrated 50+ microservices to Velox and saw a 40% reduction in infrastructure costs. The documentation made the migration process straightforward.",
            name: "Emma Williams",
            role: "VP Engineering at TechScale",
            imageAlt:
              "Professional headshot of a woman with blonde hair in a corporate setting",
          },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Simple, Transparent Pricing"
    const pricingDescription =
      props.pricing?.description ??
      "Start free and scale as you grow. No hidden fees, no surprises."
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Starter",
            description: "For personal projects",
            price: "$0",
            period: "/month",
            features: [
              "100,000 requests/month",
              "3 projects",
              "Community support",
              "SSL certificates",
            ],
            cta: "Get Started Free",
            popular: false,
          },
          {
            name: "Pro",
            description: "For growing teams",
            price: "$49",
            period: "/month",
            features: [
              "1M requests/month",
              "Unlimited projects",
              "Priority support",
              "Analytics dashboard",
              "Custom domains",
            ],
            cta: "Start Pro Trial",
            popular: true,
          },
          {
            name: "Enterprise",
            description: "For large organizations",
            price: "Custom",
            features: [
              "Unlimited requests",
              "SLA guarantees",
              "Dedicated support",
              "SSO & SAML",
              "Audit logs",
            ],
            cta: "Contact Sales",
            popular: false,
          },
        ]

    const ctaTitle = props.cta?.title ?? "Ready to Start Building?"
    const ctaDescription =
      props.cta?.description ??
      "Join 10,000+ developers shipping faster with Velox. Get started in under 5 minutes with our free tier."
    const ctaPrimary = props.cta?.primaryCta ?? "Get Started Free"
    const ctaSecondary = props.cta?.secondaryCta ?? "Talk to Sales"
    const ctaNote =
      props.cta?.note ??
      "No credit card required. Free forever for starter projects."

    const footerTagline =
      props.footer?.tagline ??
      "The edge-ready platform for modern applications. Deploy globally in seconds."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Changelog", "Roadmap"],
          },
          {
            title: "Developers",
            links: ["Documentation", "API Reference", "SDKs", "Status"],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Contact"],
          },
        ]
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Policy"]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Twitter", "GitHub", "LinkedIn", "YouTube"]
    const footerNote =
      props.footer?.note ?? `© ${new Date().getFullYear()} Velox, Inc. All rights reserved.`

    // SVG Icon helpers (all use currentColor + token text colors)
    const ZapIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
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
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
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

    const ArrowRightIcon = ({ className }: { className?: string }) => (
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
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const CopyIcon = ({ className }: { className?: string }) => (
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
        <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    )

    const StarIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    )

    const CheckIcon = ({ className }: { className?: string }) => (
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
        <path d="M20 6L9 17l-5-5" />
      </svg>
    )

    const GithubIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    )

    const TwitterIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )

    const LinkedInIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    )

    const YouTubeIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    )

    // Sidebar item icon lookup
    const sidebarItemIcon = (item: string) => {
      const cls = "h-4 w-4 shrink-0 text-muted-foreground"
      switch (item) {
        case "Introduction":
          return (
            <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></svg>
          )
        case "Quick Start":
          return <ZapIcon className={cls} />
        case "Installation":
          return (
            <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></svg>
          )
        case "Configuration":
          return (
            <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.09a2 2 0 01-1-1.74v-.47a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.39a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
          )
        case "Authentication":
          return (
            <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          )
        case "Making Requests":
          return (
            <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></svg>
          )
        case "Response Format":
          return (
            <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
          )
        case "Pagination":
          return (
            <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" /></svg>
          )
        case "Error Handling":
          return (
            <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><path d="M12 9v4" /><path d="M12 16h.01" /></svg>
          )
        case "Node.js":
          return (
            <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 17l6-14 6 14M6.5 12h7" /></svg>
          )
        case "Python":
          return (
            <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 3H7a2 2 0 00-2 2v5a2 2 0 01-2 2 2 2 0 012 2v5a2 2 0 002 2h1" /><path d="M16 3h1a2 2 0 012 2v5a2 2 0 002 2 2 2 0 00-2 2v5a2 2 0 01-2 2h-1" /></svg>
          )
        case "Go":
          return (
            <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>
          )
        default:
          return <ArrowRightIcon className={cls} />
      }
    }

    const methodBadgeStyle = (method: string) => {
      const m = method.toUpperCase()
      if (m === "POST") return "bg-chart-2/10 text-chart-2"
      if (m === "WEB") return "bg-chart-4/10 text-chart-4"
      return "bg-chart-1/10 text-chart-1"
    }

    const quickstartCardTints = [
      "bg-primary/10 text-primary",
      "bg-chart-4/10 text-chart-4",
      "bg-chart-1/10 text-chart-1",
      "bg-chart-5/10 text-chart-5",
    ]

    const quickstartCardIcon = (title: string): ReactNode => {
      const cls = "h-6 w-6 text-primary-foreground"
      switch (title) {
        case "Quick Start":
          return <ZapIcon className={cls} />
        case "API Keys":
          return (
            <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 01-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
          )
        case "SDKs":
          return (
            <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><path d="M3.27 6.96L12 12.01l8.73-5.05" /><path d="M12 22.08V12" /></svg>
          )
        case "Examples":
          return (
            <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M17.636 17.636l-.707-.707M12 21v-1M6.343 17.636l.707-.707M3 12h1m1.636-6.364l.707.707M12 7a5 5 0 110 10 5 5 0 010-10z" /></svg>
          )
        default:
          return <ArrowRightIcon className={cls} />
      }
    }

    const featureIcon = (title: string): ReactNode => {
      const cls = "h-5 w-5"
      switch (title) {
        case "Global Edge Network":
          return (
            <svg className={cn(cls, "text-primary")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
          )
        case "Enterprise Security":
          return (
            <svg className={cn(cls, "text-chart-1")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>
          )
        case "Instant Deployments":
          return (
            <svg className={cn(cls, "text-chart-4")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
          )
        case "Real-time Analytics":
          return (
            <svg className={cn(cls, "text-chart-5")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></svg>
          )
        case "Preview Deployments":
          return (
            <svg className={cn(cls, "text-chart-3")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3v12" /><path d="M18 9a3 3 0 100-6 3 3 0 000 6z" /><path d="M6 21a3 3 0 100-6 3 3 0 000 6z" /><path d="M15 6a9 9 0 00-9 9" /><path d="M15 18a9 9 0 01-9-9" /></svg>
          )
        case "24/7 Support":
          return (
            <svg className={cn(cls, "text-chart-2")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 18v-6a9 9 0 0118 0v6" /><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" /></svg>
          )
        default:
          return <ZapIcon className={cls} />
      }
    }

    const socialIcon = (name: string) => {
      const n = name.toLowerCase()
      if (n.includes("git")) return <GithubIcon className="h-5 w-5" />
      if (n.includes("twitter") || n.includes("x")) return <TwitterIcon className="h-5 w-5" />
      if (n.includes("linkedin")) return <LinkedInIcon className="h-5 w-5" />
      if (n.includes("youtube")) return <YouTubeIcon className="h-5 w-5" />
      return <GithubIcon className="h-5 w-5" />
    }

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-4 lg:px-8">
            {/* Logo */}
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-3"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                <ZapIcon className="h-5 w-5" />
              </span>
              <span className="text-lg font-semibold text-foreground">
                {brand}
              </span>
              <span className="hidden rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground md:inline-block">
                v2.4.0
              </span>
            </button>

            {/* Search Bar */}
            <form
              className="mx-8 hidden max-w-xl flex-1 md:flex"
              onSubmit={(e) => { e.preventDefault(); go(nav[0]) }}
            >
              <div className="group relative w-full">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  className="w-full rounded-lg border border-border bg-muted/50 py-2 pl-10 pr-10 text-sm text-foreground placeholder-muted-foreground focus:border-primary/50 focus:bg-muted focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                />
                <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground lg:block">
                  ⌘K
                </kbd>
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => go(footerSocials.find((s) => s.toLowerCase().includes("git")) ?? nav[0])}
                className="hidden items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground sm:flex"
              >
                <GithubIcon className="h-4 w-4" />
                <span>GitHub</span>
              </button>
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
              >
                <span>Get Started</span>
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Layout */}
        <div className="flex pt-16">
          {/* Sidebar */}
          <aside className="fixed left-0 top-16 hidden h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r border-border/60 bg-background lg:block">
            <div className="p-6">
              {/* Mobile Search (hidden on lg) */}
              <div className="mb-6 lg:hidden">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search docs..."
                    className="w-full rounded-lg border border-border bg-muted py-2 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-8" aria-label="Sidebar navigation">
                {sidebarGroups.map((group, gi) => (
                  <div key={group.title}>
                    <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.title}
                    </h3>
                    <ul className="space-y-1">
                      {group.items.map((item, ii) => {
                        const active = gi === 0 && ii === 0
                        const isApiMethod = group.title === "API Reference"
                        return (
                          <li key={item}>
                            <button
                              type="button"
                              onClick={() => go(item)}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                                active
                                  ? "bg-muted text-foreground"
                                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                              )}
                            >
                              {isApiMethod ? (
                                <span
                                  className={cn(
                                    "flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-semibold",
                                    methodBadgeStyle(item),
                                  )}
                                >
                                  {item === "Users" || item === "Projects"
                                    ? "GET"
                                    : item === "Deployments"
                                      ? "POST"
                                      : "WEB"}
                                </span>
                              ) : (
                                sidebarItemIcon(item)
                              )}
                              {item}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 lg:ml-64">
            {/* Hero */}
            <section className="relative overflow-hidden border-b border-border/60 px-4 py-16 lg:px-12 lg:py-24">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-4/5" />
              <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-chart-4/10 blur-3xl" />
              <div className="relative mx-auto max-w-4xl text-center">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                  <span className="text-sm font-medium text-primary">
                    {heroBadge}
                  </span>
                </div>
                <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  {heroTitle}
                </h1>
                <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                  {heroDescription}
                </p>
                {/* Stats */}
                <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-8">
                  {heroStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-lg border border-border bg-muted/50 p-4"
                    >
                      <div className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
                {/* CTAs */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 px-6 py-3 text-base font-semibold text-primary-foreground transition-all hover:opacity-90"
                  >
                    <ZapIcon className="h-5 w-5" />
                    {heroPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-6 py-3 text-base font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M16 18l6-6-6-6" />
                      <path d="M8 6l-6 6 6 6" />
                    </svg>
                    {heroSecondary}
                  </button>
                </div>
              </div>
            </section>

            {/* Quickstart */}
            <section className="border-b border-border/60 px-4 py-16 lg:px-12">
              <div className="mx-auto max-w-6xl">
                <div className="mb-12 text-center">
                  <h2 className="mb-4 text-3xl font-bold text-foreground">
                    {quickstartHeading}
                  </h2>
                  <p className="mx-auto max-w-2xl text-muted-foreground">
                    {quickstartDescription}
                  </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {quickstartCards.map((card, i) => {
                    const tint = quickstartCardTints[i % quickstartCardTints.length]
                    return (
                      <button
                        key={card.title}
                        type="button"
                        onClick={() => go(card.title)}
                        className="group relative block overflow-hidden rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-primary/50"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="relative">
                          <div className={cn("mb-4 grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground")}>
                            {quickstartCardIcon(card.title)}
                          </div>
                          <h3 className="mb-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                            {card.title}
                          </h3>
                          <p className="mb-4 text-sm text-muted-foreground">
                            {card.description}
                          </p>
                          <div className={cn("flex items-center gap-2 text-sm font-medium", tint.split(" ")[1])}>
                            <span>{card.cta}</span>
                            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </section>

            {/* Installation */}
            <section className="border-b border-border/60 px-4 py-16 lg:px-12">
              <div className="mx-auto max-w-6xl">
                <div className="mb-12">
                  <h2 className="mb-4 text-3xl font-bold text-foreground">
                    {installHeading}
                  </h2>
                  <p className="max-w-3xl text-muted-foreground">
                    {installDescription}
                  </p>
                </div>

                {/* Code Block 1 */}
                <div className="overflow-hidden rounded-xl border border-border bg-foreground">
                  <div className="flex items-center justify-between border-b border-border/60 bg-muted/50 px-4 py-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="pb-3 text-sm font-medium text-foreground">npm</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Copy to clipboard"
                      onClick={() => go(nav[0])}
                      className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <CopyIcon className="h-3.5 w-3.5" />
                      Copy
                    </button>
                  </div>
                  <div className="overflow-x-auto p-4">
                    <pre className="text-sm leading-relaxed text-background">
                      <code>{installNpm}</code>
                    </pre>
                  </div>
                </div>

                {/* Code Block 2 */}
                <div className="mt-6 overflow-hidden rounded-xl border border-border bg-foreground">
                  <div className="flex items-center justify-between border-b border-border/60 bg-muted/50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">Usage Example</span>
                      <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">JavaScript</span>
                    </div>
                    <button
                      type="button"
                      aria-label="Copy to clipboard"
                      onClick={() => go(nav[0])}
                      className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <CopyIcon className="h-3.5 w-3.5" />
                      Copy
                    </button>
                  </div>
                  <div className="overflow-x-auto p-4">
                    <pre className="text-sm leading-relaxed text-background">
                      <code>{installUsage}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* Features */}
            <section className="border-b border-border/60 px-4 py-16 lg:px-12">
              <div className="mx-auto max-w-6xl">
                <div className="mb-12 text-center">
                  <h2 className="mb-4 text-3xl font-bold text-foreground">
                    {featuresHeading}
                  </h2>
                  <p className="mx-auto max-w-2xl text-muted-foreground">
                    {featuresDescription}
                  </p>
                </div>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {featureItems.map((feature) => {
                    const bgTint =
                      feature.title === "Global Edge Network"
                        ? "bg-primary/10"
                        : feature.title === "Enterprise Security"
                          ? "bg-chart-1/10"
                          : feature.title === "Instant Deployments"
                            ? "bg-chart-4/10"
                            : feature.title === "Real-time Analytics"
                              ? "bg-chart-5/10"
                              : feature.title === "Preview Deployments"
                                ? "bg-chart-3/10"
                                : "bg-chart-2/10"
                    return (
                      <div
                        key={feature.title}
                        className="group rounded-xl border border-border bg-card/30 p-6 transition-colors hover:border-border"
                      >
                        <div className={cn("mb-4 grid h-10 w-10 place-items-center rounded-lg", bgTint)}>
                          {featureIcon(feature.title)}
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-foreground">
                          {feature.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>

            {/* API Reference */}
            <section className="border-b border-border/60 px-4 py-16 lg:px-12">
              <div className="mx-auto max-w-6xl">
                <div className="mb-12">
                  <h2 className="mb-4 text-3xl font-bold text-foreground">
                    {apiHeading}
                  </h2>
                  <p className="max-w-3xl text-muted-foreground">
                    {apiDescription}
                  </p>
                </div>
                <div className="space-y-6">
                  {apiEndpoints.map((ep) => (
                    <div
                      key={`${ep.method}-${ep.path}`}
                      className="overflow-hidden rounded-xl border border-border bg-card/30"
                    >
                      <button
                        type="button"
                        onClick={() => go(ep.summary)}
                        className="flex w-full items-center justify-between border-b border-border/60 bg-muted/50 px-6 py-4 text-left transition-colors hover:bg-muted"
                      >
                        <div className="flex items-center gap-4">
                          <span
                            className={cn(
                              "flex h-7 w-16 items-center justify-center rounded text-xs font-bold",
                              methodBadgeStyle(ep.method),
                            )}
                          >
                            {ep.method}
                          </span>
                          <code className="font-mono text-sm text-foreground">
                            {ep.path}
                          </code>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {ep.summary}
                        </span>
                      </button>
                      <div className="p-6">
                        <p className="mb-4 text-sm text-muted-foreground">
                          {ep.description}
                        </p>
                        {ep.params?.length ? (
                          <div className="mb-6">
                            <h4 className="mb-3 text-sm font-semibold text-foreground">
                              Query Parameters
                            </h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="border-b border-border text-left">
                                  <tr>
                                    <th className="pb-2 pr-4 font-medium text-muted-foreground">
                                      Parameter
                                    </th>
                                    <th className="pb-2 pr-4 font-medium text-muted-foreground">
                                      Type
                                    </th>
                                    <th className="pb-2 pr-4 font-medium text-muted-foreground">
                                      Required
                                    </th>
                                    <th className="pb-2 font-medium text-muted-foreground">
                                      Description
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {ep.params.map((p) => (
                                    <tr
                                      key={p.name}
                                      className="border-b border-border/50"
                                    >
                                      <td className="py-3 pr-4 font-mono text-xs text-primary">
                                        {p.name}
                                      </td>
                                      <td className="py-3 pr-4 text-foreground">
                                        {p.type}
                                      </td>
                                      <td className="py-3 pr-4 text-muted-foreground">
                                        {p.required}
                                      </td>
                                      <td className="py-3 text-foreground">
                                        {p.description}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : null}
                        {ep.response ? (
                          <div>
                            <h4 className="mb-3 text-sm font-semibold text-foreground">
                              Response Example
                            </h4>
                            <div className="overflow-x-auto rounded-lg border border-border bg-foreground p-4">
                              <pre className="text-xs text-background">
                                <code>{ep.response}</code>
                              </pre>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Testimonials */}
            <section className="border-b border-border/60 px-4 py-16 lg:px-12">
              <div className="mx-auto max-w-6xl">
                <div className="mb-12 text-center">
                  <h2 className="mb-4 text-3xl font-bold text-foreground">
                    {testimonialHeading}
                  </h2>
                  <p className="mx-auto max-w-2xl text-muted-foreground">
                    {testimonialDescription}
                  </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {testimonialItems.map((t) => (
                    <div
                      key={t.name}
                      className="rounded-xl border border-border bg-card/30 p-6"
                    >
                      <div className="mb-4 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon
                            key={i}
                            className="h-4 w-4 fill-chart-3 text-chart-3"
                          />
                        ))}
                      </div>
                      <p className="mb-6 text-sm leading-relaxed text-foreground">
                        &ldquo;{t.quote}&rdquo;
                      </p>
                      <div className="flex items-center gap-3">
                        <Image
                          alt={t.imageAlt}
                          w={40}
                          h={40}
                          className="rounded-full object-cover"
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
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Pricing */}
            <section className="border-b border-border/60 px-4 py-16 lg:px-12">
              <div className="mx-auto max-w-6xl">
                <div className="mb-12 text-center">
                  <h2 className="mb-4 text-3xl font-bold text-foreground">
                    {pricingHeading}
                  </h2>
                  <p className="mx-auto max-w-2xl text-muted-foreground">
                    {pricingDescription}
                  </p>
                </div>
                <div className="grid gap-6 lg:grid-cols-3">
                  {pricingTiers.map((tier) => (
                    <div
                      key={tier.name}
                      className={cn(
                        "relative rounded-xl p-6",
                        tier.popular
                          ? "border border-primary/50 bg-gradient-to-b from-primary/10 to-transparent"
                          : "border border-border bg-card/30",
                      )}
                    >
                      {tier.popular ? (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-primary/80 px-3 py-1 text-xs font-semibold text-primary-foreground">
                          Most Popular
                        </div>
                      ) : null}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-foreground">
                          {tier.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {tier.description}
                        </p>
                      </div>
                      <div className="mb-6">
                        <span className="text-4xl font-bold text-foreground">
                          {tier.price}
                        </span>
                        {tier.period ? (
                          <span className="text-muted-foreground">{tier.period}</span>
                        ) : null}
                      </div>
                      <ul className="mb-6 space-y-3">
                        {tier.features.map((f) => (
                          <li key={f} className="flex items-center gap-3 text-sm text-foreground">
                            <CheckIcon className="h-4 w-4 shrink-0 text-chart-1" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => go(tier.cta)}
                        className={cn(
                          "w-full rounded-lg py-2.5 text-sm font-medium transition-all",
                          tier.popular
                            ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90"
                            : "border border-border bg-muted/50 text-foreground hover:bg-muted",
                        )}
                      >
                        {tier.cta}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="relative overflow-hidden border-b border-border/60 px-4 py-16 lg:px-12">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-chart-4/10" />
              <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative mx-auto max-w-4xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground lg:text-4xl">
                  {ctaTitle}
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
                  {ctaDescription}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => go(ctaPrimary)}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 px-8 py-4 text-base font-semibold text-primary-foreground transition-all hover:opacity-90"
                  >
                    <ZapIcon className="h-5 w-5" />
                    {ctaPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(ctaSecondary)}
                    className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-8 py-4 text-base font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                    </svg>
                    {ctaSecondary}
                  </button>
                </div>
                <p className="mt-6 text-sm text-muted-foreground">{ctaNote}</p>
              </div>
            </section>

            {/* Footer */}
            <footer className="px-4 py-12 lg:px-12">
              <div className="mx-auto max-w-6xl">
                <div className="grid gap-8 lg:grid-cols-5">
                  {/* Brand */}
                  <div className="lg:col-span-2">
                    <button
                      type="button"
                      onClick={() => go(nav[0])}
                      className="mb-4 flex items-center gap-2"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                        <ZapIcon className="h-4 w-4" />
                      </span>
                      <span className="text-lg font-semibold text-foreground">
                        {brand}
                      </span>
                    </button>
                    <p className="mb-4 max-w-xs text-sm text-muted-foreground">
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
                          {socialIcon(social)}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Columns */}
                  {footerColumns.map((col) => (
                    <div key={col.title}>
                      <h4 className="mb-4 text-sm font-semibold text-foreground">
                        {col.title}
                      </h4>
                      <ul className="space-y-2">
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
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 lg:flex-row">
                  <p className="text-sm text-muted-foreground">{footerNote}</p>
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
