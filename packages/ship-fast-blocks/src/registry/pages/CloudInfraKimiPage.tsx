import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * CloudInfraKimiPage — a complete, self-contained cloud-infrastructure SaaS
 * LANDING / marketing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "CloudShift" design: a clean,
 * bright, developer-focused aesthetic on a light canvas with a deep slate brand
 * tone (mapped to the primary token) and emerald-style success accents (mapped
 * to a chart token). It pairs a two-column hero (status pill + headline + dual
 * CTAs + trust row + a floating "avg deployment time" stat card over a network
 * photo) with a trusted-by logo wall, a 6-up product features grid, a 3-step
 * "deploy in minutes" guide with a code snippet, a 6-image developer showcase
 * gallery with caption overlays, a 3-tier usage-based pricing table (with a
 * "Most Popular" middle tier and an enterprise-commitments panel), a split
 * stats/trust band with KPI tiles and compliance badges, a 3-up star-rated
 * testimonials grid, an accordion FAQ, a dark inverted final CTA band, and a
 * fat multi-column footer with product/company/legal link groups and socials.
 *
 * The block owns ALL layout, spacing, gradients, depth and type hierarchy.
 * Every nav item / CTA / link / form submit routes through `useNavigate`
 * (never a dead "#"), and the navbar labels match the `nav` array so PageSwitch
 * can swap pages. All content imagery uses the alt-driven <Image> component.
 * Callers supply ONLY content data; rich defaults make it render great with no
 * props at all (the orchestrator calls it positionally with just brand + nav).
 */
export const CloudInfraKimiPage = defineComponent({
  name: "CloudInfraKimiPage",
  description:
    "Complete cloud-infrastructure / developer-platform SaaS LANDING page with a clean, bright, engineering-focused aesthetic: light canvas, deep slate brand tone, emerald success accents, generous whitespace. Includes a two-column hero (status pill, headline, dual CTAs, no-credit-card trust row, floating deployment-time stat card over a global-network photo), a trusted-by logo wall, a 6-up product features grid (container registry, serverless functions, managed databases, edge security, object storage, observability) with icon tiles, a 3-step 'deploy in minutes' onboarding guide with a CLI code snippet, a developer-showcase image gallery with caption overlays, a 3-tier usage-based pricing table with a Most Popular middle tier plus an enterprise reserved-capacity panel, a split stats/trust band with big KPI tiles and SLA/SOC2 compliance badges, a 3-up star-rated testimonials grid with avatars, an accordion FAQ, a dark inverted final call-to-action band, and a fat multi-column footer with product/company/legal link groups and social icons. Use as the ROOT/home page for cloud hosting, IaaS/PaaS, serverless, container, hosting, DevOps, database, CDN, edge-compute or developer-tooling/platform startups when a credible, conversion-focused, feature-and-pricing-heavy page is wanted. Supply content only — brand, nav, hero, logos, features, steps, gallery, pricing, stats, testimonials, faq, finalCta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / product name shown in the navbar, CTA band and footer. */
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
        /** Small trust bullets beneath the CTAs. */
        trust: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        /** Floating stat card over the hero image. */
        statLabel: z.string().optional(),
        statValue: z.string().optional(),
      })
      .optional(),
    /** Trusted-by logo wall. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
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
    /** "Deploy in minutes" 3-step guide. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        /** CLI install command shown in step one. */
        code: z.string().optional(),
      })
      .optional(),
    /** Developer-showcase image gallery. */
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              alt: z.string(),
              title: z.string(),
              caption: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Usage-based pricing table. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              unit: z.string(),
              features: z.array(z.string()),
              popular: z.boolean().optional(),
            }),
          )
          .optional(),
        enterpriseHeading: z.string().optional(),
        enterpriseDescription: z.string().optional(),
        enterpriseItems: z.array(z.string()).optional(),
      })
      .optional(),
    /** Split stats / trust band. */
    stats: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        badges: z
          .array(z.object({ title: z.string(), subtitle: z.string() }))
          .optional(),
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Star-rated testimonials grid. */
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
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark inverted final call-to-action band. */
    finalCta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        trust: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        groups: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        note: z.string().optional(),
        meta: z.array(z.string()).optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "CloudShift"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Pricing", "Showcase", "FAQ"]

    const heroBadge = props.hero?.badge ?? "Now with GPU instances"
    const heroHeading =
      props.hero?.heading ?? "Cloud infrastructure that scales with you"
    const heroSub =
      props.hero?.subheading ??
      "Deploy containers, virtual machines, and serverless functions in seconds. Pay only for the compute you actually use—down to the millisecond."
    const heroPrimary = props.hero?.primaryCta ?? "Start free trial"
    const heroSecondary = props.hero?.secondaryCta ?? "View pricing"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["No credit card required", "$500 free credits"]
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Abstract visualization of global cloud network infrastructure with interconnected nodes"
    const heroStatLabel = props.hero?.statLabel ?? "Avg. deployment time"
    const heroStatValue = props.hero?.statValue ?? "12 seconds"

    const logosHeading =
      props.logos?.heading ?? "Trusted by engineering teams at"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Stripe", "Notion", "Figma", "Vercel", "Linear", "Raycast"]

    const featuresHeading =
      props.features?.heading ?? "Everything you need to ship faster"
    const featuresDesc =
      props.features?.description ??
      "From container orchestration to serverless functions, CloudShift provides the infrastructure building blocks modern applications demand."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Container Registry",
            description:
              "Secure, scalable Docker registry with vulnerability scanning. Push and pull images globally with edge caching.",
          },
          {
            title: "Serverless Functions",
            description:
              "Deploy functions in 12 languages. Auto-scaling from zero to thousands of instances in milliseconds.",
          },
          {
            title: "Managed Databases",
            description:
              "PostgreSQL, MySQL, and Redis with automated backups, point-in-time recovery, and read replicas.",
          },
          {
            title: "Edge Security",
            description:
              "DDoS protection, WAF rules, and bot management deployed across 300+ edge locations worldwide.",
          },
          {
            title: "Object Storage",
            description:
              "S3-compatible storage with 99.999999999% durability. Global CDN integration for instant asset delivery.",
          },
          {
            title: "Observability",
            description:
              "Real-time metrics, distributed tracing, and intelligent alerting. Pinpoint issues before users notice.",
          },
        ]

    const stepsHeading = props.steps?.heading ?? "Deploy in minutes, not days"
    const stepsDesc =
      props.steps?.description ??
      "Our CLI and web dashboard make infrastructure management simple. Here's how teams get started."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Install the CLI",
            description:
              "One command to install on macOS, Linux, or Windows. Authenticate with your API key and you're ready.",
          },
          {
            title: "Initialize your project",
            description:
              "Run cloudshift init in your repo. We detect your framework and generate the configuration automatically.",
          },
          {
            title: "Deploy globally",
            description:
              "Push your code and watch it deploy across 35 regions. Rollbacks, canary releases, and traffic splitting included.",
          },
        ]
    const stepsCode =
      props.steps?.code ?? "curl -sSL https://cloudshift.io/install | sh"

    const galleryHeading =
      props.gallery?.heading ?? "Built for developers, by developers"
    const galleryDesc =
      props.gallery?.description ??
      "See how teams use CloudShift to build, deploy, and scale their applications worldwide."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            alt: "Team of software developers collaborating at a modern desk with multiple monitors showing code",
            title: "Real-time collaboration tools",
            caption: "Shared terminals and live code reviews",
          },
          {
            alt: "Server room with rows of blinking LED lights on network equipment racks",
            title: "Global data centers",
            caption: "35 regions with sub-20ms latency",
          },
          {
            alt: "Analytics dashboard showing traffic graphs and performance metrics on a laptop screen",
            title: "Observability dashboard",
            caption: "Real-time metrics and alerting",
          },
          {
            alt: "Diverse engineering team meeting in a modern office discussing architecture diagrams",
            title: "Team workflows",
            caption: "RBAC and environment management",
          },
          {
            alt: "Close-up of circuit board with microprocessors and electronic components",
            title: "Bare metal performance",
            caption: "Dedicated instances when you need them",
          },
          {
            alt: "Developer working late at night with code editor and terminal windows on large curved monitor",
            title: "Developer experience first",
            caption: "CLI, SDKs, and IDE integrations",
          },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Usage-based pricing that scales"
    const pricingDesc =
      props.pricing?.description ??
      "Pay only for what you use. No minimums, no upfront commitments, no surprise bills."
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Compute",
            tagline: "Virtual machines and containers",
            price: "$0.004",
            unit: "/ vCPU-hour",
            features: [
              "Shared CPU instances from 1 vCPU / 512 MB",
              "Dedicated CPU at $0.028/vCPU-hour",
              "GPU instances (NVIDIA A100) at $2.50/hour",
              "Auto-scaling with per-second billing",
            ],
          },
          {
            name: "Serverless",
            tagline: "Functions and edge computing",
            price: "$0.15",
            unit: "/ million requests",
            popular: true,
            features: [
              "First 1M requests free every month",
              "$0.0001 per GB-second of compute",
              "128 MB to 8 GB memory tiers",
              "Global edge deployment included",
            ],
          },
          {
            name: "Storage & Data",
            tagline: "Databases, caches, and object storage",
            price: "$0.10",
            unit: "/ GB-month",
            features: [
              "Managed PostgreSQL and MySQL",
              "Redis cache from $15/month",
              "Object storage with free egress",
              "Automated daily backups included",
            ],
          },
        ]
    const enterpriseHeading =
      props.pricing?.enterpriseHeading ?? "Enterprise commitments"
    const enterpriseDescription =
      props.pricing?.enterpriseDescription ??
      "For predictable workloads, reserve capacity and save up to 40%. Annual commitments include dedicated support and custom SLAs."
    const enterpriseItems = props.pricing?.enterpriseItems?.length
      ? props.pricing.enterpriseItems
      : ["1-year: 15% discount", "2-year: 25% discount", "3-year: 40% discount"]

    const statsHeading =
      props.stats?.heading ?? "Trusted by thousands of engineering teams"
    const statsDesc =
      props.stats?.description ??
      "From startups to Fortune 500s, teams rely on CloudShift for mission-critical infrastructure. Our platform processes billions of requests daily across 35 global regions."
    const statsBadges = props.stats?.badges?.length
      ? props.stats.badges
      : [
          {
            title: "99.99% Uptime SLA",
            subtitle: "Backed by financial credits",
          },
          {
            title: "SOC 2 Type II Certified",
            subtitle: "GDPR and HIPAA compliant",
          },
        ]
    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "12K+", label: "Active deployments" },
          { value: "35", label: "Global regions" },
          { value: "50B+", label: "Requests/month" },
          { value: "<20ms", label: "Edge latency" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by engineering leaders"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See what teams say about building on CloudShift."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "We migrated our entire microservices stack from AWS to CloudShift and cut our infrastructure costs by 34%. The per-second billing made a huge difference for our batch processing workloads.",
            name: "David Chen",
            role: "VP Engineering, StripeScale",
            avatarAlt:
              "Professional headshot of David Chen, VP of Engineering at FinTech startup",
          },
          {
            quote:
              "The serverless functions cold start at 89ms—faster than anything we've tested. Our API response times dropped from 400ms to under 120ms after switching to CloudShift's edge deployment.",
            name: "Sarah Miller",
            role: "CTO, NeuralPath AI",
            avatarAlt: "Professional headshot of Sarah Miller, CTO at AI startup",
          },
          {
            quote:
              "We needed HIPAA-compliant infrastructure for our healthcare platform. CloudShift's compliance documentation and BAA process was the smoothest we've experienced. Live in 2 days.",
            name: "Dr. Marcus Johnson",
            role: "Founder, CareSync Health",
            avatarAlt:
              "Professional headshot of Dr. Marcus Johnson, founder of healthcare startup",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ?? "Everything you need to know about CloudShift."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "How does per-second billing work?",
            a: "You pay only for the compute time you actually use, measured in 1-second increments with a 60-second minimum. If you run a container for 3 minutes and 45 seconds, you're billed for exactly 225 seconds at the hourly rate. No rounding up to the nearest hour like traditional cloud providers.",
          },
          {
            q: "Can I bring my own container images?",
            a: "Absolutely. CloudShift supports any OCI-compliant container image from Docker Hub, GitHub Container Registry, AWS ECR, or our built-in registry. We also offer automated builds that trigger on every git push, with layer caching to speed up subsequent deployments.",
          },
          {
            q: "What regions are available?",
            a: "We operate 35 regions across 6 continents: 10 in North America, 8 in Europe, 6 in Asia-Pacific, 4 in South America, 4 in Africa, and 3 in the Middle East. All regions offer the same services and pricing. You can deploy to multiple regions for high availability or keep data within specific geographies for compliance.",
          },
          {
            q: "Do you offer managed databases?",
            a: "Yes. We offer managed PostgreSQL 15, MySQL 8.0, and Redis 7 with automated backups, point-in-time recovery, and read replicas. Database pricing starts at $15/month for 2GB RAM / 1 vCPU instances with 10GB storage. All databases run on dedicated hardware with encryption at rest and in transit.",
          },
          {
            q: "How does your free tier work?",
            a: "Every new account receives $500 in credits valid for 12 months. Additionally, our always-free tier includes 1 million serverless requests, 10GB object storage, and 1GB database storage per month. No credit card required to start, and we'll notify you before any billable usage occurs.",
          },
          {
            q: "What's your uptime guarantee?",
            a: "We offer a 99.99% uptime SLA for compute and database services (52.6 minutes of downtime per year max). If we fall below this threshold, you receive service credits: 10% for 99.9-99.99%, 25% for 99.5-99.9%, and 50% for below 99.5%. Enterprise customers can negotiate custom SLAs up to 99.999%.",
          },
        ]

    const finalCtaHeading =
      props.finalCta?.heading ?? "Ready to deploy your first app?"
    const finalCtaDesc =
      props.finalCta?.description ??
      "Join 12,000+ developers building on CloudShift. Start with $500 in free credits—no credit card required."
    const finalCtaPrimary = props.finalCta?.primaryCta ?? "Create free account"
    const finalCtaSecondary = props.finalCta?.secondaryCta ?? "Schedule demo"
    const finalCtaTrust = props.finalCta?.trust?.length
      ? props.finalCta.trust
      : ["$500 free credits", "No credit card required", "Cancel anytime"]

    const footerTagline =
      props.footer?.tagline ??
      "Elastic cloud infrastructure for modern engineering teams. Deploy globally in seconds."
    const footerGroups = props.footer?.groups?.length
      ? props.footer.groups
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
            links: ["About", "Blog", "Careers", "Contact", "Status"],
          },
          {
            title: "Legal",
            links: [
              "Privacy Policy",
              "Terms of Service",
              "Cookie Policy",
              "Security",
              "Compliance",
            ],
          },
        ]
    const footerNote =
      props.footer?.note ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`
    const footerMeta = props.footer?.meta?.length
      ? props.footer.meta
      : ["35 regions", "99.99% uptime", "SOC 2 certified"]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Twitter", "GitHub", "Discord"]

    // Brand logo tile — solid primary square with a cloud glyph (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-primary text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          className="size-[60%]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
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

    const Check = ({ className }: { className?: string }) => (
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
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const Chevron = ({ className }: { className?: string }) => (
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
        <path d="M19 9l-7 7-7-7" />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const featureIcons: ReactNode[] = [
      // archive / registry box
      <svg
        key="registry"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>,
      // bolt / serverless
      <svg
        key="serverless"
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
      // database
      <svg
        key="database"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>,
      // shield-check / security
      <svg
        key="security"
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
      // cloud-upload / storage
      <svg
        key="storage"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>,
      // bar-chart / observability
      <svg
        key="observability"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
    ]

    const statBadgeIcons: ReactNode[] = [
      // shield-check
      <svg
        key="sla"
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
      // lock-closed
      <svg
        key="soc2"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>,
    ]

    const socialIcons: Record<string, ReactNode> = {
      Twitter: (
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
      ),
      GitHub: (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        />
      ),
      Discord: (
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
      ),
    }

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <LogoMark className="size-8" />
                <span className="text-xl font-semibold tracking-tight">
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
                  onClick={() => go(heroPrimary)}
                  className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Get Started
                </button>
              </div>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-muted/40">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                    <span
                      aria-hidden="true"
                      className="mr-2 size-2 rounded-full bg-chart-2"
                    />
                    {heroBadge}
                  </div>
                  <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {heroHeading}
                  </h1>
                  <p className="max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    {heroSub}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <ArrowRight className="ml-2 size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center rounded-lg border border-border bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    {heroTrust.map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <Check className="size-5 text-chart-2" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-[4/3] overflow-hidden rounded-xl bg-muted shadow-2xl">
                    <Image
                      alt={heroImageAlt}
                      w={1200}
                      h={900}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-border bg-card p-4 shadow-lg sm:block">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-lg bg-chart-2/15 text-chart-2">
                        <svg
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
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {heroStatLabel}
                        </p>
                        <p className="text-lg font-semibold text-card-foreground">
                          {heroStatValue}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-b border-border py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-70 sm:grid-cols-3 md:grid-cols-6">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="flex items-center justify-center"
                  >
                    <span className="text-xl font-bold text-foreground/80">
                      {logo}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="group rounded-xl border border-border bg-card p-8 transition-colors hover:border-primary/40"
                  >
                    <div className="mb-6 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="bg-muted/40 py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="grid size-12 place-items-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                        {i + 1}
                      </div>
                      {i < stepItems.length - 1 && (
                        <div
                          aria-hidden="true"
                          className="hidden h-px flex-1 bg-border md:block"
                        />
                      )}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mb-4 text-muted-foreground">
                      {step.description}
                    </p>
                    {i === 0 && (
                      <div className="overflow-x-auto rounded-lg bg-primary p-4 font-mono text-sm text-primary-foreground/80">
                        <code>{stepsCode}</code>
                      </div>
                    )}
                    {i === 1 && (
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <Check className="size-4 text-chart-2" />
                          Auto-detects Node.js, Python, Go, Ruby
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="size-4 text-chart-2" />
                          Generates optimal resource profiles
                        </li>
                      </ul>
                    )}
                    {i === 2 && (
                      <div className="rounded-lg bg-primary/10 p-4">
                        <p className="text-sm text-muted-foreground">
                          Average cold start:{" "}
                          <span className="font-semibold text-foreground">
                            89ms
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Regions available:{" "}
                          <span className="font-semibold text-foreground">
                            35
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{galleryDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((item) => (
                  <figure
                    key={item.title}
                    className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted"
                  >
                    <Image
                      alt={item.alt}
                      w={800}
                      h={600}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-6">
                      <p className="font-medium text-background">{item.title}</p>
                      <p className="text-sm text-background/80">
                        {item.caption}
                      </p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted/40 py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative rounded-xl bg-card p-8",
                      tier.popular
                        ? "border-2 border-primary"
                        : "border border-border",
                    )}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-card-foreground">
                        {tier.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {tier.tagline}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-semibold text-card-foreground">
                        {tier.price}
                      </span>
                      <span className="text-muted-foreground"> {tier.unit}</span>
                    </div>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-3">
                          <Check className="mt-0.5 size-5 shrink-0 text-chart-2" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mx-auto mt-12 max-w-3xl">
                <div className="rounded-xl border border-border bg-card p-6">
                  <h4 className="mb-4 text-lg font-semibold text-card-foreground">
                    {enterpriseHeading}
                  </h4>
                  <p className="mb-4 text-muted-foreground">
                    {enterpriseDescription}
                  </p>
                  <div className="grid gap-4 text-sm sm:grid-cols-3">
                    {enterpriseItems.map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <Check className="size-5 text-chart-2" />
                        <span className="text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats / Trust */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div>
                  <h2 className="mb-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {statsHeading}
                  </h2>
                  <p className="mb-8 text-lg text-muted-foreground">
                    {statsDesc}
                  </p>
                  <div className="space-y-4">
                    {statsBadges.map((badge, i) => (
                      <div key={badge.title} className="flex items-center gap-3">
                        <div className="grid size-12 place-items-center rounded-lg bg-chart-2/15 text-chart-2">
                          {statBadgeIcons[i % statBadgeIcons.length]}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {badge.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {badge.subtitle}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {statsItems.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl bg-muted/60 p-8 text-center"
                    >
                      <p className="mb-2 text-4xl font-semibold text-foreground sm:text-5xl">
                        {s.value}
                      </p>
                      <p className="text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted/40 py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
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
                    className="rounded-xl border border-border bg-card p-8"
                  >
                    <div className="mb-6 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-5 text-chart-4" />
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
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-card-foreground">
                          {t.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl border border-border bg-card open:border-primary"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <h3 className="pr-8 text-lg font-medium text-card-foreground">
                        {item.q}
                      </h3>
                      <span
                        aria-hidden="true"
                        className="transition-transform group-open:rotate-180"
                      >
                        <Chevron className="size-5 text-muted-foreground" />
                      </span>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA (dark inverted band) */}
          <section className="bg-primary py-20 text-primary-foreground lg:py-32">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-semibold tracking-tight sm:text-4xl">
                {finalCtaHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/70">
                {finalCtaDesc}
              </p>
              <div className="mb-12 flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={() => go(finalCtaPrimary)}
                  className="inline-flex items-center rounded-lg bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-background/90"
                >
                  {finalCtaPrimary}
                  <ArrowRight className="ml-2 size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(finalCtaSecondary)}
                  className="inline-flex items-center rounded-lg border border-primary-foreground/40 px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                >
                  {finalCtaSecondary}
                </button>
              </div>
              <div className="flex flex-wrap justify-center gap-8 text-sm text-primary-foreground/70">
                {finalCtaTrust.map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <Check className="size-5 text-chart-2" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-16" role="contentinfo">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
              <div className="col-span-2 lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark className="size-8" />
                  <span className="text-xl font-semibold tracking-tight">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-xs text-muted-foreground">
                  {footerTagline}
                </p>
                <div className="flex items-center gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="text-muted-foreground/70 transition-colors hover:text-foreground"
                    >
                      <svg
                        className="size-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        {socialIcons[social] ?? socialIcons.Twitter}
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              {footerGroups.map((group) => (
                <div key={group.title}>
                  <h4 className="mb-4 font-semibold text-foreground">
                    {group.title}
                  </h4>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {group.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="transition-colors hover:text-foreground"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
              <p className="text-sm text-muted-foreground">{footerNote}</p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                {footerMeta.map((m, i) => (
                  <span key={m} className="flex items-center gap-6">
                    {i > 0 && <span aria-hidden="true">•</span>}
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
