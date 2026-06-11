import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * DevToolKimiPage6 — the 6th style-sibling to DevToolKimiPage.
 *
 * A faithful Tailwind v4 token port of a Kimi-generated "APIForge" design:
 * a clean, light developer-API landing page with navy-inspired muted surfaces
 * and a structured, information-dense layout. It pairs a two-column hero
 * (release pill + bold headline + dual CTAs + terminal code-window mockup with
 * floating uptime/latency stat cards) with a trusted-by image logo strip, a
 * 6-up product features grid, a dark 3-step "How it Works" timeline with an
 * embedded developer-avatar social-proof banner, a two-column integrations
 * section (tool-grid + live metrics card), a dual-language SDK code sample
 * showcase, a 3-tier pricing table with a dark highlighted "Most Popular"
 * plan, a dark 4-up metrics band followed by review rating cards, three
 * star-rated testimonials, an accordion FAQ with a support CTA, a dark closing
 * CTA band, and a 5-column footer.
 *
 * Use when an AI-generated page block needs a more editorial, data-rich
 * developer SaaS layout with terminal/code-window visuals, integration grids,
 * SDK language tabs, and metric/review social proof. All colors use semantic
 * theme tokens; all navigation routes through useNavigate; all images use the
 * <Image> component.
 */
export const DevToolKimiPage6 = defineCapsule({
  name: "DevToolKimiPage6",
  description:
    "Complete developer-API / dev-tool / SaaS-infrastructure LANDING page in the 6th style sibling to DevToolKimiPage. Features a clean, light, structured product-marketing aesthetic with muted navy-toned surfaces. Includes a two-column hero (release pill badge, bold headline with highlighted phrase, dual CTAs with checkmark subtext, and a dark terminal code-window mockup showing CLI init + deploy output plus floating uptime and latency stat cards), a trusted-by company image logo strip, a 6-up product features grid with icon tiles (auto-generated SDKs, enterprise security, global edge, real-time analytics, version management, team collaboration), a dark 3-step 'How It Works' timeline with large step numbers and connector lines plus an embedded developer-avatar social-proof banner with CTA, a two-column integrations section (6 integration tool badges with a '200+ more' link and a live Auth0 integration metrics card with progress bars), a dual-language SDK code sample showcase (TypeScript + Python) with syntax-colored blocks and a language tag row, a 3-tier pricing table with a dark highlighted 'Most Popular' Professional plan plus mixed checkmark/X feature lists, a dark 4-up stats band (API requests, teams, edge locations, uptime) followed by review rating cards (G2, Capterra, Product Hunt), three star-rated developer testimonials with avatars, an accordion FAQ with a support CTA, a dark closing CTA band with dual buttons and trust badges, and a 5-column footer with social icons. Use for developer tools, API platforms, infrastructure SaaS, backend services, SDK products, or enterprise dev-facing landing pages when a more data-dense, editorial layout with code windows, integration grids, and metric social proof is wanted.",
  props: z.object({
    /** Brand / product name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels. */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        footnote1: z.string().optional(),
        footnote2: z.string().optional(),
        uptimeLabel: z.string().optional(),
        uptimeSub: z.string().optional(),
        latencyLabel: z.string().optional(),
        latencySub: z.string().optional(),
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
        overline: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** How it works steps. */
    steps: z
      .object({
        overline: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        bannerText: z.string().optional(),
        bannerSub: z.string().optional(),
        bannerCta: z.string().optional(),
      })
      .optional(),
    /** Integrations section. */
    integrations: z
      .object({
        overline: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ name: z.string(), icon: z.string().optional() }))
          .optional(),
        moreLabel: z.string().optional(),
        cardTitle: z.string().optional(),
        cardStatus: z.string().optional(),
        metrics: z
          .array(
            z.object({
              label: z.string(),
              value: z.string(),
              width: z.number().optional(),
              barColor: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Code examples section. */
    codeExamples: z
      .object({
        overline: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        languages: z.array(z.string()).optional(),
      })
      .optional(),
    /** Pricing tiers. */
    pricing: z
      .object({
        overline: z.string().optional(),
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
              included: z.array(z.boolean()).optional(),
              cta: z.string(),
              featured: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
        reviews: z
          .array(
            z.object({
              score: z.string(),
              source: z.string(),
              detail: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Testimonials. */
    testimonials: z
      .object({
        overline: z.string().optional(),
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
        overline: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
        ctaLabel: z.string().optional(),
      })
      .optional(),
    /** Closing CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        trustBadges: z.array(z.string()).optional(),
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
    const brand = props.brand ?? "APIForge"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Integrations", "Pricing", "Docs"]

    const heroBadge = props.hero?.badge ?? "Now with GraphQL support"
    const heroHeading =
      props.hero?.heading ?? "Build APIs that"
    const heroHighlight = props.hero?.highlight ?? "just work"
    const heroSub =
      props.hero?.subheading ??
      "The complete developer platform for designing, testing, and deploying production-grade APIs. Trusted by 10,000+ engineering teams at Stripe, Shopify, and Vercel."
    const heroPrimary = props.hero?.primaryCta ?? "Start Building Free"
    const heroSecondary = props.hero?.secondaryCta ?? "Watch Demo"
    const heroFootnote1 = props.hero?.footnote1 ?? "No credit card required"
    const heroFootnote2 = props.hero?.footnote2 ?? "14-day free trial"
    const uptimeLabel = props.hero?.uptimeLabel ?? "99.99% Uptime"
    const uptimeSub = props.hero?.uptimeSub ?? "Last 30 days"
    const latencyLabel = props.hero?.latencyLabel ?? "50ms Latency"
    const latencySub = props.hero?.latencySub ?? "Global edge network"

    const logosLabel =
      props.logos?.label ?? "Trusted by engineering teams at"
    const logoCompanies = props.logos?.companies?.length
      ? props.logos.companies
      : ["Stripe", "Shopify", "Vercel", "Notion", "Figma", "Linear"]

    const featuresOverline =
      props.features?.overline ?? "Features"
    const featuresHeading =
      props.features?.heading ?? "Everything you need to ship APIs faster"
    const featuresDesc =
      props.features?.description ??
      "From design to deployment, APIForge handles the infrastructure so you can focus on building great products."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Auto-Generated SDKs",
            description:
              "Generate type-safe client libraries for TypeScript, Python, Go, Rust, and more. Keep them in sync automatically as your API evolves.",
          },
          {
            title: "Enterprise Security",
            description:
              "SOC 2 Type II certified with end-to-end encryption, audit logging, and fine-grained access controls. SSO and RBAC built-in.",
          },
          {
            title: "Global Edge Network",
            description:
              "Deploy to 300+ edge locations worldwide. Sub-50ms latency for 95% of global users. Automatic failover and DDoS protection.",
          },
          {
            title: "Real-time Analytics",
            description:
              "Monitor request volume, error rates, and latency in real-time. Set up alerts for anomalies and get insights into API usage patterns.",
          },
          {
            title: "Version Management",
            description:
              "Seamless API versioning with automatic deprecation warnings. Route traffic between versions and sunset old endpoints gracefully.",
          },
          {
            title: "Team Collaboration",
            description:
              "Shared workspaces, code reviews, and collaborative editing. Comment on endpoints and get notified when APIs change.",
          },
        ]

    const stepsOverline = props.steps?.overline ?? "How It Works"
    const stepsHeading =
      props.steps?.heading ?? "From zero to production in minutes"
    const stepsDesc =
      props.steps?.description ??
      "Get your API up and running with our streamlined workflow designed for developer productivity."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Design Your API",
            description:
              "Use our visual editor or write OpenAPI specs directly. Define endpoints, schemas, authentication, and rate limits with intelligent autocomplete.",
          },
          {
            title: "Generate & Implement",
            description:
              "We generate server stubs, client SDKs, and documentation. Implement your business logic while we handle the boilerplate and infrastructure.",
          },
          {
            title: "Deploy & Scale",
            description:
              "One command deploys to our global edge network. Auto-scaling, monitoring, and analytics included. No ops team required.",
          },
        ]
    const stepsBanner = props.steps?.bannerText ?? "Join 50,000+ developers"
    const stepsBannerSub = props.steps?.bannerSub ?? "Average setup time: 4 minutes"
    const stepsBannerCta = props.steps?.bannerCta ?? "Get Started Now"

    const intOverline = props.integrations?.overline ?? "Integrations"
    const intHeading =
      props.integrations?.heading ?? "Connect with your entire stack"
    const intDesc =
      props.integrations?.description ??
      "APIForge integrates seamlessly with the tools you already use. From authentication providers to monitoring solutions, we've got you covered."
    const intItems = props.integrations?.items?.length
      ? props.integrations.items
      : [
          { name: "Postman" },
          { name: "GitHub" },
          { name: "GitLab" },
          { name: "Auth0" },
          { name: "Datadog" },
          { name: "Sentry" },
        ]
    const intMore = props.integrations?.moreLabel ?? "and 200+ more integrations"
    const intCardTitle = props.integrations?.cardTitle ?? "Auth0 Integration"
    const intCardStatus = props.integrations?.cardStatus ?? "Active"
    const intMetrics = props.integrations?.metrics?.length
      ? props.integrations.metrics
      : [
          { label: "API Requests (24h)", value: "2.4M", width: 78 },
          { label: "Success Rate", value: "99.97%", width: 99.97 },
          { label: "Avg. Latency", value: "42ms", width: 35 },
        ]

    const codeOverline = props.codeExamples?.overline ?? "Code Samples"
    const codeHeading =
      props.codeExamples?.heading ?? "SDKs in your favorite languages"
    const codeDesc =
      props.codeExamples?.description ??
      "Generate type-safe SDKs that stay in sync with your API. No more manual client maintenance."
    const codeLangs = props.codeExamples?.languages?.length
      ? props.codeExamples.languages
      : [
          "TypeScript",
          "Python",
          "Go",
          "Rust",
          "Ruby",
          "Java",
          "PHP",
          "+12 more",
        ]

    const pricingOverline = props.pricing?.overline ?? "Pricing"
    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start free and scale as you grow. No hidden fees, no surprises."
    const popularLabel = props.pricing?.popularLabel ?? "MOST POPULAR"
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Starter",
            tagline: "Perfect for side projects",
            price: "$0",
            period: "/month",
            features: [
              "10,000 API requests/mo",
              "3 team members",
              "Basic analytics",
              "Community support",
              "Custom domains",
            ],
            included: [true, true, true, true, false],
            cta: "Get Started Free",
            featured: false,
          },
          {
            name: "Professional",
            tagline: "For growing teams",
            price: "$49",
            period: "/month",
            features: [
              "500,000 API requests/mo",
              "10 team members",
              "Advanced analytics & alerts",
              "Priority email support",
              "3 custom domains",
            ],
            included: [true, true, true, true, true],
            cta: "Start 14-Day Trial",
            featured: true,
          },
          {
            name: "Enterprise",
            tagline: "For large organizations",
            price: "Custom",
            period: "",
            features: [
              "Unlimited API requests",
              "Unlimited team members",
              "SSO & advanced security",
              "24/7 phone support",
              "Unlimited custom domains",
            ],
            included: [true, true, true, true, true],
            cta: "Contact Sales",
            featured: false,
          },
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "10B+", label: "API requests served daily" },
          { value: "50k+", label: "Developer teams" },
          { value: "300+", label: "Global edge locations" },
          { value: "99.99%", label: "Uptime guarantee" },
        ]
    const reviewItems = props.stats?.reviews?.length
      ? props.stats.reviews
      : [
          { score: "4.9/5", source: "G2", detail: "Based on 2,847 reviews" },
          { score: "4.8/5", source: "Capterra", detail: "1,523 verified reviews" },
          { score: "4.9/5", source: "Product Hunt", detail: "#1 Product of the Month" },
        ]

    const testimonialsOverline = props.testimonials?.overline ?? "Testimonials"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by developers worldwide"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See what engineering teams are saying about APIForge."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "APIForge cut our API development time by 60%. The auto-generated SDKs are a game-changer - our customers love the developer experience.",
            name: "Sarah Chen",
            role: "CTO, FinTech Solutions",
            avatarAlt: "professional headshot of Sarah Chen CTO",
          },
          {
            quote:
              "The analytics and monitoring tools are incredible. We caught a performance issue in production within minutes instead of hours. Best investment for our API infrastructure.",
            name: "Marcus Johnson",
            role: "Senior Developer, CloudScale",
            avatarAlt: "professional headshot of Marcus Johnson senior developer",
          },
          {
            quote:
              "We migrated from a custom solution and haven't looked back. The team collaboration features and version management have transformed how we work. Highly recommended!",
            name: "Emily Rodriguez",
            role: "Engineering Manager, DataFlow",
            avatarAlt: "professional headshot of Emily Rodriguez engineering manager",
          },
        ]

    const faqOverline = props.faq?.overline ?? "FAQ"
    const faqHeading =
      props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about APIForge. Can't find the answer you're looking for? Reach out to our support team."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What is APIForge and who is it for?",
            answer:
              "APIForge is a complete API development platform designed for engineering teams of all sizes. Whether you're a solo developer building your first API or an enterprise team managing hundreds of microservices, APIForge provides the tools to design, build, test, deploy, and monitor your APIs. Our customers range from startups to Fortune 500 companies across fintech, healthcare, e-commerce, and SaaS industries.",
          },
          {
            question: "How does the free tier work?",
            answer:
              "Our free tier includes 10,000 API requests per month, up to 3 team members, and access to basic analytics. It's perfect for side projects, prototyping, and small applications. No credit card required to sign up, and you can stay on the free tier indefinitely. When you're ready to scale, upgrading takes just a few clicks.",
          },
          {
            question: "Can I self-host APIForge?",
            answer:
              "Yes! Our Enterprise plan includes a self-hosted option for organizations with strict compliance requirements. You can deploy APIForge on your own infrastructure—on-premises or in your private cloud (AWS, Azure, GCP). Self-hosted deployments include the same features as our cloud offering, plus additional security and audit capabilities.",
          },
          {
            question: "What programming languages do you support?",
            answer:
              "APIForge auto-generates SDKs for 19 programming languages including TypeScript/JavaScript, Python, Go, Rust, Ruby, Java, PHP, C#, Swift, Kotlin, Scala, Elixir, and more. Our server stubs support Node.js, Python, Go, Java, Ruby, and PHP. If you need a language we don't currently support, our Enterprise customers can request custom SDK generation.",
          },
          {
            question: "How does billing work for the Professional plan?",
            answer:
              "The Professional plan is $49/month and includes 500,000 API requests. If you exceed this limit, additional requests are billed at $0.0001 per request (that's $10 per 100k requests). We'll notify you when you're approaching your limit, and you can set up billing alerts to avoid surprises. You can upgrade, downgrade, or cancel your plan at any time.",
          },
          {
            question: "What security certifications do you have?",
            answer:
              "APIForge is SOC 2 Type II certified, GDPR compliant, and HIPAA ready (Business Associate Agreements available on Enterprise plans). We undergo annual third-party security audits and penetration testing. All data is encrypted at rest and in transit using AES-256 and TLS 1.3. Our infrastructure is hosted on AWS and GCP with 99.99% uptime SLA.",
          },
          {
            question: "How do I migrate from my existing API solution?",
            answer:
              "We offer free migration assistance for Professional and Enterprise customers. Our import tools support OpenAPI, Postman collections, Swagger, and GraphQL schemas. The typical migration takes 2-3 days. Our customer success team will work with you to ensure a smooth transition with zero downtime. Book a migration consultation through your dashboard or contact sales.",
          },
        ]
    const faqCtaLabel = props.faq?.ctaLabel ?? "Chat with Support"

    const ctaHeading = props.cta?.heading ?? "Ready to ship APIs faster?"
    const ctaDesc =
      props.cta?.description ??
      "Join 50,000+ developers who are building better APIs with APIForge. Start free today—no credit card required."
    const ctaPrimary = props.cta?.primaryCta ?? "Get Started Free"
    const ctaSecondary = props.cta?.secondaryCta ?? "Schedule a Demo"
    const ctaBadges = props.cta?.trustBadges?.length
      ? props.cta.trustBadges
      : ["Free 14-day trial", "No credit card required", "Cancel anytime"]

    const footerBlurb =
      props.footer?.blurb ??
      "The complete developer platform for building, testing, and deploying production-grade APIs."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Integrations", "Pricing", "Changelog", "Roadmap"],
          },
          {
            title: "Developers",
            links: ["Documentation", "API Reference", "SDKs", "Status", "Community"],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Press", "Contact"],
          },
          {
            title: "Legal",
            links: ["Privacy Policy", "Terms of Service", "Security", "Cookies", "Compliance"],
          },
        ]
    const footerLegal = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ["Privacy", "Terms", "Sitemap"]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`

    // ── Reusable icons ──
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
          <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
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
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
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

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={cn("mt-0.5 size-5 flex-shrink-0", className)}
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

    const Cross = ({ className }: { className?: string }) => (
      <svg
        className={cn("mt-0.5 size-5 flex-shrink-0", className)}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        />
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

    const ShieldCheck = () => (
      <svg className="size-5 text-primary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
      </svg>
    )

    const Lock = () => (
      <svg className="size-5 text-primary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" clipRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" />
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

    const ExternalLink = () => (
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
        <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    )

    // Integration grid decorative icons
    const integrationSvgs: Record<string, ReactNode> = {
      Postman: (
        <svg className="size-5 text-accent-foreground" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.523 0-10-4.477-10-10S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        </svg>
      ),
      GitHub: (
        <svg className="size-5 text-accent-foreground" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
      ),
      GitLab: (
        <svg className="size-5 text-accent-foreground" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      ),
      Auth0: (
        <svg className="size-5 text-accent-foreground" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0L1.607 6.002v11.996L12 24l10.393-6.002V6.002L12 0zm0 2.453l8.571 4.952-3.214 1.854L12 8.153l-5.357 3.096-3.214-1.854L12 2.453z" />
        </svg>
      ),
      Datadog: (
        <svg className="size-5 text-accent-foreground" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
      Sentry: (
        <svg className="size-5 text-accent-foreground" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99z" />
        </svg>
      ),
    }

    const featureIcons: ReactNode[] = [
      <svg key="sdk" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>,
      <svg key="sec" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>,
      <svg key="edge" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      <svg key="anal" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      <svg key="ver" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>,
      <svg key="team" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
    ]

    const stepIcons: ReactNode[] = [
      <svg key="s1" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>,
      <svg key="s2" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>,
      <svg key="s3" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>,
    ]

    // Social icons
    const TwitterIcon = () => (
      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
      </svg>
    )
    const GitHubIcon = () => (
      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.393-3.369-1.393-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    )
    const LinkedInIcon = () => (
      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" clipRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    )
    const DiscordIcon = () => (
      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
      </svg>
    )
    const CalendarIcon = () => (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
    const ChatIcon = () => (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
          className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm"
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
                <span className="text-xl font-bold text-foreground">{brand}</span>
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
                  className="hidden text-sm font-medium text-primary transition-colors hover:text-primary/90 sm:block"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Get Started Free
                </button>
              </div>
            </div>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section
            className="relative overflow-hidden bg-gradient-to-b from-muted/60 to-background"
            aria-label="Hero section"
          >
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    {heroBadge}
                  </div>
                  <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                    {heroHeading}{" "}
                    <span className="text-primary">{heroHighlight}</span>
                  </h1>
                  <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
                    {heroSub}
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <ArrowRight />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-border bg-background px-8 py-4 font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      <PlayIcon />
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
                    <div className="flex items-center gap-2">
                      <ShieldCheck />
                      <span>{heroFootnote1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck />
                      <span>{heroFootnote2}</span>
                    </div>
                  </div>
                </div>

                {/* Code terminal mockup */}
                <div className="relative">
                  <div className="overflow-hidden rounded-2xl bg-foreground shadow-2xl">
                    <div className="flex items-center gap-2 border-b border-border/30 bg-card/50 px-4 py-3">
                      <div className="flex gap-2">
                        <div className="size-3 rounded-full bg-destructive" />
                        <div className="size-3 rounded-full bg-chart-4" />
                        <div className="size-3 rounded-full bg-chart-2" />
                      </div>
                      <span className="ml-2 font-mono text-xs text-muted-foreground">apiforge-cli</span>
                    </div>
                    <div className="p-6 font-mono text-sm">
                      <div className="text-muted-foreground">
                        $ <span className="text-background">apiforge init my-api</span>
                      </div>
                      <div className="mt-2 text-primary">✓ Created project structure</div>
                      <div className="text-primary">✓ Generated OpenAPI 3.0 spec</div>
                      <div className="text-primary">✓ Setup authentication middleware</div>
                      <div className="mt-4 text-muted-foreground">
                        $ <span className="text-background">apiforge deploy</span>
                      </div>
                      <div className="mt-2 text-chart-1">→ Building container...</div>
                      <div className="text-chart-1">→ Pushing to edge network...</div>
                      <div className="mt-2 text-primary">✓ Deployed to https://api.my-project.io</div>
                      <div className="mt-4 text-muted-foreground">// Test your API</div>
                      <div className="text-muted-foreground">
                        $ <span className="text-background">curl https://api.my-project.io/v1/users \</span>
                      </div>
                      <div className="ml-4 text-background">-H "Authorization: Bearer $TOKEN"</div>
                      <div className="mt-2 text-muted-foreground">{"{"}</div>
                      <div className="ml-4 text-chart-1">
                        "data"<span className="text-background">:</span>{" "}<span className="text-chart-4">{"["}</span>
                      </div>
                      <div className="ml-8 text-muted-foreground">
                        {"{"} <span className="text-primary">"id"</span>: <span className="text-chart-4">"usr_123"</span>, <span className="text-primary">"name"</span>: <span className="text-chart-4">"Alex Chen"</span>{" "}{"}"}
                      </div>
                      <div className="ml-4 text-chart-4">{"]"}</div>
                      <div className="text-muted-foreground">{"}"}</div>
                    </div>
                  </div>
                  {/* Floating uptime card */}
                  <div className="absolute -top-4 -right-4 hidden rounded-xl border border-border bg-background p-4 shadow-lg sm:block">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-lg bg-primary/10">
                        <svg className="size-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{uptimeLabel}</div>
                        <div className="text-xs text-muted-foreground">{uptimeSub}</div>
                      </div>
                    </div>
                  </div>
                  {/* Floating latency card */}
                  <div className="absolute -bottom-4 -left-4 hidden rounded-xl border border-border bg-background p-4 shadow-lg sm:block">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-lg bg-chart-1/10">
                        <svg className="size-5 text-chart-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{latencyLabel}</div>
                        <div className="text-xs text-muted-foreground">{latencySub}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-b border-border bg-background py-16" aria-label="Trusted by section">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center justify-items-center gap-8 opacity-70 md:grid-cols-3 lg:grid-cols-6">
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
                      className="h-8 object-contain grayscale transition hover:grayscale-0"
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-24" id="features" aria-label="Features section">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">{featuresOverline}</p>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">{featuresHeading}</h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="group rounded-2xl border border-border bg-muted/40 p-8 transition-all hover:shadow-lg"
                  >
                    <div className="mb-6 grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">{item.title}</h3>
                    <p className="mb-4 text-muted-foreground">{item.description}</p>
                    <button
                      type="button"
                      onClick={() => go(item.title)}
                      className="inline-flex items-center gap-1 font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      Learn more
                      <ArrowRight className="size-4" />
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="bg-foreground py-24" id="steps" aria-label="How it works section">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{stepsOverline}</p>
                <h2 className="mb-4 text-3xl font-bold text-background sm:text-4xl">{stepsHeading}</h2>
                <p className="text-lg text-background/70">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-4 text-6xl font-bold text-muted-foreground/30">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="mb-6 grid size-12 place-items-center rounded-xl bg-muted-foreground/20 text-background">
                      {stepIcons[i % stepIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-background">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                    {i < stepItems.length - 1 ? (
                      <div
                        aria-hidden="true"
                        className="absolute top-8 left-full ml-4 hidden h-px w-full bg-gradient-to-r from-muted-foreground/30 to-transparent md:block"
                      />
                    ) : null}
                  </div>
                ))}
              </div>
              {/* Banner */}
              <div className="mt-16 text-center">
                <div className="inline-flex flex-col items-center gap-4 rounded-2xl border border-border/30 bg-card/50 p-6 sm:flex-row">
                  <div className="flex -space-x-3">
                    {[
                      "professional headshot of a male engineer with glasses",
                      "professional headshot of a female product manager smiling",
                      "professional headshot of a male developer with short hair",
                      "professional headshot of a female engineer with curly hair",
                    ].map((alt, idx) => (
                      <Image
                        key={idx}
                        alt={alt}
                        w={80}
                        h={80}
                        className="size-10 rounded-full border-2 border-foreground object-cover"
                      />
                    ))}
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="font-medium text-background">{stepsBanner}</p>
                    <p className="text-sm text-muted-foreground">{stepsBannerSub}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => go(stepsBannerCta)}
                    className="rounded-lg bg-background px-6 py-3 font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    {stepsBannerCta}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Integrations */}
          <section className="bg-muted/40 py-24" id="integrations" aria-label="Integrations section">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <div>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">{intOverline}</p>
                  <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl">{intHeading}</h2>
                  <p className="mb-8 text-lg text-muted-foreground">{intDesc}</p>
                  <div className="grid grid-cols-2 gap-4">
                    {intItems.map((item, i) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => go(item.name)}
                        className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:bg-muted"
                      >
                        <div
                          className={cn(
                            "grid size-10 place-items-center rounded-lg",
                            i % 3 === 0 && "bg-primary/10",
                            i % 3 === 1 && "bg-secondary/20",
                            i % 3 === 2 && "bg-accent/20",
                          )}
                        >
                          {integrationSvgs[item.name] ?? (
                            <svg className="size-5 text-accent-foreground" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <circle cx="12" cy="12" r="10" />
                            </svg>
                          )}
                        </div>
                        <span className="font-medium text-foreground">{item.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-8 flex items-center gap-2 text-primary">
                    <span>{intMore}</span>
                    <ArrowRight className="size-5" />
                  </div>
                </div>
                {/* Integration metrics card */}
                <div className="relative">
                  <div className="rounded-2xl border border-border bg-background p-6 shadow-xl">
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{intCardTitle}</div>
                          <div className="text-sm text-muted-foreground">Authentication provider</div>
                        </div>
                      </div>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">{intCardStatus}</span>
                    </div>
                    <div className="space-y-4">
                      {intMetrics.map((m, idx) => (
                        <div key={m.label} className="rounded-xl bg-muted/60 p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-primary">{m.label}</span>
                            <span className="text-sm font-semibold text-foreground">{m.value}</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div
                              className={cn(
                                "h-2 rounded-full",
                                idx === 0 && "bg-primary",
                                idx === 1 && "bg-primary",
                                idx === 2 && "bg-chart-1",
                              )}
                              style={{ width: `${Math.min(m.width ?? 0, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-border pt-6 text-sm">
                      <span className="text-muted-foreground">Last synced: 2 minutes ago</span>
                      <button
                        type="button"
                        onClick={() => go("View Details")}
                        className="font-medium text-primary transition-colors hover:text-primary/80"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Code Examples */}
          <section className="py-24" aria-label="Code examples section">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">{codeOverline}</p>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">{codeHeading}</h2>
                <p className="text-lg text-muted-foreground">{codeDesc}</p>
              </div>
              <div className="grid gap-8 lg:grid-cols-2">
                {/* TypeScript block */}
                <div className="overflow-hidden rounded-2xl bg-foreground">
                  <div className="flex items-center justify-between border-b border-border/30 bg-card/50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="size-3 rounded-full bg-chart-4" />
                      <span className="text-sm font-medium text-muted-foreground">TypeScript</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => go("Copy")}
                      className="text-xs text-muted-foreground transition-colors hover:text-background"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="overflow-x-auto p-6 font-mono text-sm">
                    <div className="text-muted-foreground">// Install: npm install @apiforge/sdk</div>
                    <div className="mt-2 text-muted-foreground">
                      import <span className="text-chart-4">{"{"}</span>{" "}<span className="text-background">APIForgeClient</span>{" "}<span className="text-chart-4">{"}"}</span>{" "}<span className="text-muted-foreground">from</span>{" "}<span className="text-primary">&apos;@apiforge/sdk&apos;</span>;
                    </div>
                    <div className="mt-4 text-muted-foreground">
                      const <span className="text-background">client</span>{" "}<span className="text-muted-foreground">=</span>{" "}<span className="text-muted-foreground">new</span>{" "}<span className="text-chart-1">APIForgeClient</span>({"{"}
                    </div>
                    <div className="ml-4 text-background">
                      apiKey<span className="text-muted-foreground">:</span>{" "}<span className="text-primary">&apos;af_live_123456789&apos;</span>,
                    </div>
                    <div className="ml-4 text-background">
                      environment<span className="text-muted-foreground">:</span>{" "}<span className="text-primary">&apos;production&apos;</span>
                    </div>
                    <div className="text-muted-foreground">{"}"});</div>
                    <div className="mt-4 text-muted-foreground">
                      <span className="text-muted-foreground">async function</span>{" "}<span className="text-chart-1">getUser</span>() {"{"}
                    </div>
                    <div className="ml-4 text-muted-foreground">
                      const <span className="text-background">user</span>{" "}<span className="text-muted-foreground">=</span>{" "}<span className="text-muted-foreground">await</span> client.<span className="text-chart-1">users</span>.<span className="text-chart-1">get</span>({"{"}
                    </div>
                    <div className="ml-8 text-background">
                      id<span className="text-muted-foreground">:</span>{" "}<span className="text-primary">&apos;usr_123&apos;</span>
                    </div>
                    <div className="ml-4 text-muted-foreground">{"}"});</div>
                    <div className="ml-4 text-muted-foreground">
                      console.<span className="text-chart-1">log</span>(user.<span className="text-background">name</span>);
                    </div>
                    <div className="text-muted-foreground">{"}"}</div>
                  </div>
                </div>
                {/* Python block */}
                <div className="overflow-hidden rounded-2xl bg-foreground">
                  <div className="flex items-center justify-between border-b border-border/30 bg-card/50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="size-3 rounded-full bg-chart-1" />
                      <span className="text-sm font-medium text-muted-foreground">Python</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => go("Copy")}
                      className="text-xs text-muted-foreground transition-colors hover:text-background"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="overflow-x-auto p-6 font-mono text-sm">
                    <div className="text-muted-foreground"># Install: pip install apiforge-sdk</div>
                    <div className="mt-2 text-muted-foreground">
                      from <span className="text-background">apiforge</span>{" "}<span className="text-muted-foreground">import</span>{" "}<span className="text-background">APIForgeClient</span>
                    </div>
                    <div className="mt-4 text-muted-foreground">
                      client <span className="text-muted-foreground">=</span>{" "}<span className="text-chart-1">APIForgeClient</span>(
                    </div>
                    <div className="ml-4 text-background">
                      api_key<span className="text-muted-foreground">=</span><span className="text-primary">&apos;af_live_123456789&apos;</span>,
                    </div>
                    <div className="ml-4 text-background">
                      environment<span className="text-muted-foreground">=</span><span className="text-primary">&apos;production&apos;</span>
                    </div>
                    <div className="text-muted-foreground">)</div>
                    <div className="mt-4 text-muted-foreground">
                      user <span className="text-muted-foreground">=</span> client.users.<span className="text-chart-1">get</span>(id<span className="text-muted-foreground">=</span><span className="text-primary">&apos;usr_123&apos;</span>)
                    </div>
                    <div className="text-muted-foreground">print(user.name)</div>
                    <div className="mt-4 text-muted-foreground"># Batch operations</div>
                    <div className="text-muted-foreground">
                      users <span className="text-muted-foreground">=</span> client.users.<span className="text-chart-1">list</span>(limit<span className="text-muted-foreground">=</span><span className="text-chart-4">100</span>)
                    </div>
                    <div className="text-muted-foreground">
                      <span className="text-muted-foreground">for</span> user <span className="text-muted-foreground">in</span> users.data:
                    </div>
                    <div className="ml-4 text-muted-foreground">print(user.email)</div>
                  </div>
                </div>
              </div>
              {/* Language pills */}
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                {codeLangs.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => go(lang)}
                    className="rounded-full bg-muted px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted/40 py-24" id="pricing" aria-label="Pricing section">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">{pricingOverline}</p>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">{pricingHeading}</h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <article
                    key={tier.name}
                    className={cn(
                      "relative rounded-2xl p-8",
                      tier.featured
                        ? "bg-foreground shadow-2xl md:-translate-y-1"
                        : "border border-border bg-background",
                    )}
                  >
                    {tier.featured ? (
                      <div className="absolute -top-3 right-0 rounded-bl-xl rounded-tr-xl bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                        {popularLabel}
                      </div>
                    ) : null}
                    <div className="mb-6">
                      <h3 className={cn("text-xl font-semibold", tier.featured ? "text-background" : "text-foreground")}>
                        {tier.name}
                      </h3>
                      <p className={cn("text-sm", tier.featured ? "text-muted-foreground" : "text-muted-foreground")}>
                        {tier.tagline}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span className={cn("text-4xl font-bold", tier.featured ? "text-background" : "text-foreground")}>
                        {tier.price}
                      </span>
                      {tier.period ? (
                        <span className={cn(tier.featured ? "text-muted-foreground" : "text-muted-foreground")}>
                          {tier.period}
                        </span>
                      ) : null}
                    </div>
                    <ul className="mb-8 space-y-4">
                      {tier.features.map((feat, fi) => {
                        const included = tier.included?.[fi] ?? true
                        return (
                          <li key={feat} className="flex items-start gap-3">
                            {included ? (
                              <Check className={tier.featured ? "text-primary" : "text-primary"} />
                            ) : (
                              <Cross className="text-muted-foreground/50" />
                            )}
                            <span
                              className={cn(
                                included
                                  ? tier.featured
                                    ? "text-background/90"
                                    : "text-muted-foreground"
                                  : tier.featured
                                    ? "text-background/50"
                                    : "text-muted-foreground/50",
                              )}
                            >
                              {feat}
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className={cn(
                        "block w-full rounded-xl py-3 text-center font-semibold transition-colors",
                        tier.featured
                          ? "bg-background text-foreground hover:bg-muted"
                          : "bg-muted text-primary hover:bg-muted/80",
                      )}
                    >
                      {tier.cta}
                    </button>
                  </article>
                ))}
              </div>
              {/* Trust badges */}
              <div className="mt-12 text-center">
                <p className="mb-4 text-muted-foreground">
                  Need more details? Compare all features in our{" "}
                  <button
                    type="button"
                    onClick={() => go("full pricing breakdown")}
                    className="font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    full pricing breakdown
                  </button>.
                </p>
                <div className="inline-flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Lock />
                    SOC 2 Compliant
                  </span>
                  <span className="flex items-center gap-2">
                    <Lock />
                    GDPR Ready
                  </span>
                  <span className="flex items-center gap-2">
                    <Lock />
                    99.99% SLA
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-foreground py-24" aria-label="Statistics section">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4 lg:gap-12">
                {statItems.map((s) => (
                  <div key={s.label}>
                    <div className="mb-2 text-4xl font-bold text-background sm:text-5xl">{s.value}</div>
                    <div className="text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Review cards */}
              <div className="mt-16 grid gap-8 md:grid-cols-3">
                {reviewItems.map((r) => (
                  <div
                    key={r.source}
                    className="rounded-xl border border-border/30 bg-card/50 p-6"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map((n) => (
                        <Star key={n} />
                      ))}
                    </div>
                    <div className="mb-1 font-semibold text-background">{r.score} on {r.source}</div>
                    <div className="text-sm text-muted-foreground">{r.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-24" aria-label="Testimonials section">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">{testimonialsOverline}</p>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">{testimonialsHeading}</h2>
                <p className="text-lg text-muted-foreground">{testimonialsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <article
                    key={t.name}
                    className="rounded-2xl border border-border bg-muted/40 p-8"
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
                        <div className="font-semibold text-foreground">{t.name}</div>
                        <div className="text-sm text-muted-foreground">{t.role}</div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              {/* Review links */}
              <div className="mt-12 text-center">
                <div className="inline-flex flex-wrap items-center gap-2 text-muted-foreground">
                  <span>Read more reviews on</span>
                  {["G2", "TrustRadius"].map((site, i) => (
                    <span key={site} className="inline-flex items-center gap-1">
                      {i > 0 ? <span>,</span> : null}
                      <button
                        type="button"
                        onClick={() => go(site)}
                        className="inline-flex items-center gap-1 font-medium text-primary transition-colors hover:text-primary/80"
                      >
                        {site}
                        <ExternalLink />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted/40 py-24" id="faq" aria-label="FAQ section">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">{faqOverline}</p>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">{faqHeading}</h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group overflow-hidden rounded-xl border border-border bg-background"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6 transition-colors hover:bg-muted/50">
                      <span className="font-semibold text-foreground">{item.question}</span>
                      <ChevronDown />
                    </summary>
                    <div className="px-6 pb-6">
                      <p className="leading-relaxed text-muted-foreground">{item.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
              <div className="mt-12 text-center">
                <p className="mb-4 text-muted-foreground">Still have questions?</p>
                <button
                  type="button"
                  onClick={() => go(faqCtaLabel)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <ChatIcon />
                  {faqCtaLabel}
                </button>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-foreground py-24" id="cta" aria-label="Call to action section">
            <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold text-background sm:text-4xl lg:text-5xl">{ctaHeading}</h2>
              <p className="mx-auto mb-10 max-w-3xl text-xl text-background/70">{ctaDesc}</p>
              <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-background px-8 py-4 font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  {ctaPrimary}
                  <ArrowRight />
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-background/30 bg-transparent px-8 py-4 font-semibold text-background transition-colors hover:bg-background/10"
                >
                  <CalendarIcon />
                  {ctaSecondary}
                </button>
              </div>
              <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
                {ctaBadges.map((badge) => (
                  <span key={badge} className="flex items-center gap-2">
                    <ShieldCheck />
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-foreground py-16" aria-label="Footer">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-5 lg:gap-12">
              <div className="lg:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <BoltMark className="size-8" />
                  <span className="text-xl font-bold text-background">{brand}</span>
                </button>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{footerBlurb}</p>
                <div className="flex gap-4">
                  {[
                    { name: "Twitter", Icon: TwitterIcon },
                    { name: "GitHub", Icon: GitHubIcon },
                    { name: "LinkedIn", Icon: LinkedInIcon },
                    { name: "Discord", Icon: DiscordIcon },
                  ].map(({ name, Icon }) => (
                    <button
                      key={name}
                      type="button"
                      aria-label={name}
                      onClick={() => go(name)}
                      className="grid size-8 place-items-center rounded-lg bg-card/50 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      <Icon />
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-background">{col.title}</h4>
                  <ul className="space-y-3 text-sm">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-muted-foreground transition-colors hover:text-background"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border/30 pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">{footerCopyright}</p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-muted-foreground transition-colors hover:text-background"
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
