import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * CloudInfraKimiPage2 — TEMPLATE VARIANT 2 (a visually DISTINCT sibling to
 * CloudInfraKimiPage) for the "cloud-infra" category.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "CloudScale" design. Where the
 * first variant leans calm/slate with a photo hero, THIS variant is punchier and
 * more product-forward: a vibrant indigo brand gradient (mapped to the primary
 * token), an animated gradient-text headline, and — instead of a hero photo — a
 * live CLI TERMINAL MOCKUP card (traffic-light chrome + green/blue prompt output)
 * with two floating "deploy successful" / "global edge regions" glass cards. It
 * pairs a status-pill two-column hero with a trusted-by logo wall, a colorful
 * 6-up features grid (rotating chart-token icon tiles), a DARK inverted 3-step
 * "deploy in minutes" band with numbered nodes, connector lines and tag chips, a
 * 4-image developer showcase gallery with captions BELOW each card, a 3-tier
 * PLAN-based pricing table (Starter / Pro "Most Popular" dark card / Enterprise)
 * followed by a 4-up usage-rates panel, a DARK KPI stats band, a 3-up star-rated
 * testimonials grid with avatars, a single-open accordion FAQ, a rounded GRADIENT
 * final-CTA card, and a fat 6-column footer (Product / Solutions / Resources /
 * Company) with brand-tile socials.
 *
 * Every nav item / CTA / link / form submit routes through `useNavigate` (never a
 * dead "#"); navbar labels match the `nav` array so PageSwitch can swap pages. All
 * content imagery uses the alt-driven <Image> component. Rich defaults from the
 * source copy make it render the full page with no props (the orchestrator calls
 * it positionally with just brand + nav).
 */
export const CloudInfraKimiPage2 = defineComponent({
  name: "CloudInfraKimiPage2",
  description:
    "ALTERNATIVE / second-style cloud-infrastructure / developer-platform SaaS LANDING page — a visually distinct SIBLING to CloudInfraKimiPage for when a repeat 'cloud-infra' request should yield a different look. Punchy, product-forward, vibrant-indigo aesthetic on a light canvas: animated gradient-text headline, status pill, and a live CLI TERMINAL MOCKUP card in the hero (traffic-light window chrome, green/blue prompt output, floating 'deploy successful' and 'global edge / 23 regions' glass badges) instead of a photo. Includes a trusted-by logo wall, a colorful 6-up product features grid (instant deployments, auto-scaling, enterprise security, global edge network, managed databases, AI-powered insights) with rotating icon tiles, a DARK inverted 3-step 'deploy in minutes' onboarding band with numbered nodes, connector lines and framework tag chips, a developer-showcase image gallery with captions below, a 3-tier PLAN-based pricing table (Starter free / Pro 'Most Popular' dark highlighted card / Enterprise custom) plus a 4-up usage-rates panel (compute, storage, bandwidth, database), a DARK KPI stats band (uptime SLA, regions, deploy time, active developers), a 3-up star-rated testimonials grid with avatars, a single-open accordion FAQ, a rounded GRADIENT final call-to-action card, and a fat 6-column footer with Product/Solutions/Resources/Company link groups and social brand tiles. Use as the ROOT/home page for cloud hosting, IaaS/PaaS, serverless, container, hosting, DevOps, CDN, edge-compute, database or developer-tooling startups when a bolder, more colorful, conversion-and-pricing-heavy alternative to the calmer CloudInfraKimiPage is wanted. Supply content only — brand, nav, hero, logos, features, steps, gallery, pricing, stats, testimonials, faq, finalCta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / product name shown in the navbar, CTA band and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content (with a CLI terminal mockup). */
    hero: z
      .object({
        badge: z.string().optional(),
        headingLead: z.string().optional(),
        headingHighlight: z.string().optional(),
        headingTrail: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        note: z.string().optional(),
        /** Terminal window title. */
        terminalTitle: z.string().optional(),
        /** Lines rendered inside the CLI terminal mockup. */
        terminalLines: z
          .array(z.object({ text: z.string(), tone: z.string().optional() }))
          .optional(),
        deployCardTitle: z.string().optional(),
        deployCardSubtitle: z.string().optional(),
        edgeCardTitle: z.string().optional(),
        edgeCardSubtitle: z.string().optional(),
        /** Region initials shown in the floating edge card. */
        edgeRegions: z.array(z.string()).optional(),
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
    /** "Deploy in minutes" dark 3-step band. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              tags: z.array(z.string()),
            }),
          )
          .optional(),
        cta: z.string().optional(),
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
    /** Plan-based pricing table + usage-rates panel. */
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
              unit: z.string().optional(),
              cta: z.string(),
              popular: z.boolean().optional(),
              features: z.array(
                z.object({ label: z.string(), included: z.boolean() }),
              ),
            }),
          )
          .optional(),
        ratesHeading: z.string().optional(),
        rates: z
          .array(
            z.object({
              label: z.string(),
              price: z.string(),
              unit: z.string(),
              note: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Dark KPI stats band. */
    stats: z
      .object({
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
        items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      })
      .optional(),
    /** Gradient final call-to-action card. */
    finalCta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        note: z.string().optional(),
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
        legal: z.array(z.string()).optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "CloudScale"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Pricing", "Solutions", "Docs"]

    const heroBadge = props.hero?.badge ?? "Now with AI-powered auto-scaling"
    const heroLead = props.hero?.headingLead ?? "Infrastructure that "
    const heroHighlight = props.hero?.headingHighlight ?? "scales"
    const heroTrail = props.hero?.headingTrail ?? " with you"
    const heroSub =
      props.hero?.subheading ??
      "Deploy containers, virtual machines, and serverless functions in seconds. Pay only for what you use with zero hidden fees. Starting at $0.004/hour."
    const heroPrimary = props.hero?.primaryCta ?? "Start Building Free"
    const heroSecondary = props.hero?.secondaryCta ?? "See How It Works"
    const heroNote =
      props.hero?.note ??
      "Free $200 credit for new accounts. No credit card required."
    const terminalTitle = props.hero?.terminalTitle ?? "cloudscale-cli"
    const terminalLines = props.hero?.terminalLines?.length
      ? props.hero.terminalLines
      : [
          { text: "$ cloudscale init myapp --framework=nextjs", tone: "prompt" },
          { text: "Creating new CloudScale project...", tone: "muted" },
          { text: "✓ Project initialized successfully", tone: "ok" },
          { text: "$ cloudscale deploy", tone: "prompt" },
          { text: "Building container image... done (12.4s)", tone: "muted" },
          { text: "Pushing to registry... done (8.2s)", tone: "muted" },
          { text: "Deploying to us-east-1... done (4.1s)", tone: "muted" },
          {
            text: "✓ Deployed to https://myapp-7f3d.cloudscale.app",
            tone: "ok",
          },
          {
            text: "Build time: 24.7s | Instance: micro (0.5 CPU, 512MB)",
            tone: "muted",
          },
          { text: "$ cloudscale scale --instances=3 --auto", tone: "prompt" },
          {
            text: "✓ Auto-scaling enabled: 1-10 instances based on CPU 70%",
            tone: "ok",
          },
        ]
    const deployCardTitle = props.hero?.deployCardTitle ?? "Deploy Successful"
    const deployCardSubtitle =
      props.hero?.deployCardSubtitle ?? "Build #2847 completed"
    const edgeCardTitle = props.hero?.edgeCardTitle ?? "Global Edge"
    const edgeCardSubtitle = props.hero?.edgeCardSubtitle ?? "23 regions active"
    const edgeRegions = props.hero?.edgeRegions?.length
      ? props.hero.edgeRegions
      : ["US", "EU", "AP"]

    const logosHeading =
      props.logos?.heading ?? "Trusted by engineering teams at"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Stripe", "Notion", "Vercel", "Figma", "Airbyte", "Linear"]

    const featuresHeading =
      props.features?.heading ?? "Built for modern development"
    const featuresDesc =
      props.features?.description ??
      "Everything you need to deploy, scale, and manage applications in the cloud—without the complexity."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Instant Deployments",
            description:
              "Push code and see it live in under 30 seconds. Zero-config CI/CD with automatic preview environments for every pull request.",
          },
          {
            title: "Auto-Scaling",
            description:
              "Handle traffic spikes without breaking a sweat. Scale from zero to thousands of instances automatically based on demand.",
          },
          {
            title: "Enterprise Security",
            description:
              "SOC 2 Type II certified with automatic SSL, DDoS protection, and private networking. Your data never touches a public IP.",
          },
          {
            title: "Global Edge Network",
            description:
              "Deploy to 23 regions across 6 continents. Content is automatically cached and served from the location closest to your users.",
          },
          {
            title: "Managed Databases",
            description:
              "PostgreSQL, MySQL, Redis, and MongoDB with automatic backups, point-in-time recovery, and read replicas across regions.",
          },
          {
            title: "AI-Powered Insights",
            description:
              "Intelligent recommendations for cost optimization, performance tuning, and security improvements based on your usage patterns.",
          },
        ]

    const stepsHeading = props.steps?.heading ?? "Deploy in minutes, not days"
    const stepsDesc =
      props.steps?.description ??
      "Get from zero to production with three simple steps. No DevOps experience required."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Connect your code",
            description:
              "Import from GitHub, GitLab, or Bitbucket. We automatically detect your framework—Next.js, Django, Rails, or anything else.",
            tags: ["GitHub", "GitLab", "Bitbucket"],
          },
          {
            title: "Configure & deploy",
            description:
              "Set environment variables, choose your regions, and hit deploy. Preview environments are created automatically for every branch.",
            tags: ["env vars", "multi-region", "previews"],
          },
          {
            title: "Scale effortlessly",
            description:
              "Your app scales automatically as traffic grows. Set usage alerts and budgets to stay in control of your costs.",
            tags: ["auto-scale", "budget alerts", "analytics"],
          },
        ]
    const stepsCta = props.steps?.cta ?? "Read Quick Start Guide"

    const galleryHeading =
      props.gallery?.heading ?? "Powerful infrastructure, beautiful interface"
    const galleryDesc =
      props.gallery?.description ??
      "Manage everything from one intuitive dashboard. Monitor performance, view logs, and scale resources with a click."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            alt: "Cloud infrastructure analytics dashboard showing CPU usage graphs and server metrics",
            title: "Real-time Analytics",
            caption:
              "Monitor request latency, error rates, and resource utilization with customizable dashboards.",
          },
          {
            alt: "Server deployment management interface with world map showing global infrastructure locations",
            title: "Global Deployment Map",
            caption:
              "Deploy to multiple regions and see your infrastructure mapped across our global edge network.",
          },
          {
            alt: "Database management console showing query performance and storage metrics",
            title: "Managed Databases",
            caption:
              "Provision, scale, and monitor databases with automatic backups and query performance insights.",
          },
          {
            alt: "Team collaboration workspace showing container orchestration and microservices architecture",
            title: "Team Collaboration",
            caption:
              "Role-based access control, audit logs, and shared environments for your entire engineering team.",
          },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Simple, usage-based pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Pay only for what you use. No upfront costs, no long-term contracts, and no hidden fees. Start free and scale as you grow."
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Starter",
            tagline: "Perfect for side projects and prototypes",
            price: "$0",
            unit: "/month",
            cta: "Start Free",
            features: [
              { label: "3 projects", included: true },
              { label: "512MB RAM per instance", included: true },
              { label: "100GB bandwidth", included: true },
              { label: "Community support", included: true },
              { label: "Custom domains", included: false },
            ],
          },
          {
            name: "Pro",
            tagline: "For growing businesses and teams",
            price: "$29",
            unit: "/month base",
            cta: "Start 14-Day Trial",
            popular: true,
            features: [
              { label: "Unlimited projects", included: true },
              { label: "Up to 8GB RAM per instance", included: true },
              { label: "1TB bandwidth included", included: true },
              { label: "Priority email support", included: true },
              { label: "Unlimited custom domains", included: true },
              { label: "99.95% SLA guarantee", included: true },
            ],
          },
          {
            name: "Enterprise",
            tagline: "For organizations at scale",
            price: "Custom",
            cta: "Contact Sales",
            features: [
              { label: "Dedicated infrastructure", included: true },
              { label: "Unlimited RAM & CPU", included: true },
              { label: "Unlimited bandwidth", included: true },
              { label: "24/7 phone support & SLAs", included: true },
              { label: "SSO & advanced security", included: true },
              { label: "99.99% SLA with penalties", included: true },
            ],
          },
        ]
    const ratesHeading = props.pricing?.ratesHeading ?? "Usage Rates (Pro Plan)"
    const rates = props.pricing?.rates?.length
      ? props.pricing.rates
      : [
          {
            label: "Compute",
            price: "$0.004",
            unit: "/hour",
            note: "Per 1 vCPU + 1GB RAM",
          },
          {
            label: "Storage (SSD)",
            price: "$0.10",
            unit: "/GB/mo",
            note: "Block & object storage",
          },
          {
            label: "Bandwidth",
            price: "$0.05",
            unit: "/GB",
            note: "First 1TB free on Pro",
          },
          {
            label: "Database",
            price: "$0.15",
            unit: "/hour",
            note: "Managed PostgreSQL",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "99.99%", label: "Uptime SLA" },
          { value: "23", label: "Global Regions" },
          { value: "<30s", label: "Deploy Time" },
          { value: "50K+", label: "Active Developers" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by developers"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Join thousands of engineering teams who trust CloudScale for their infrastructure."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "CloudScale cut our infrastructure costs by 40% while improving our deployment speed by 10x. The auto-scaling handled Black Friday traffic without any manual intervention.",
            name: "Sarah Chen",
            role: "CTO, TechVentures Inc.",
            avatarAlt:
              "Professional headshot of Sarah Chen, CTO of TechVentures",
          },
          {
            quote:
              "We migrated 200+ microservices from AWS and reduced our monthly bill by $85,000. The CLI is incredibly intuitive and the support team is genuinely world-class.",
            name: "Marcus Rodriguez",
            role: "VP Engineering, DataFlow",
            avatarAlt:
              "Professional headshot of Marcus Rodriguez, VP of Engineering at DataFlow",
          },
          {
            quote:
              "As a solo founder, I need infrastructure that just works. CloudScale lets me focus on building product instead of managing servers. Best dev experience I've had.",
            name: "Elena Kim",
            role: "Founder, StartupXYZ",
            avatarAlt:
              "Professional headshot of Elena Kim, founder of StartupXYZ",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about CloudScale pricing, features, and migration."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "How does usage-based pricing work?",
            a: "You only pay for resources you actually consume. Compute is billed per second based on vCPU and RAM allocation. Storage is billed by the GB-month. Bandwidth is billed per GB transferred. There are no minimums, and you can scale to zero when your app isn't running.",
          },
          {
            q: "Can I migrate from AWS, GCP, or Azure?",
            a: "Absolutely. We provide automated migration tools for common services like EC2, GKE, and App Service. Our migration specialists can help plan and execute complex multi-service migrations with zero downtime. Average migration time is 2-4 weeks depending on complexity.",
          },
          {
            q: "What frameworks and languages are supported?",
            a: "We support virtually any language or framework that runs in a container. First-class support includes Node.js, Python, Ruby, Go, Java, PHP, Rust, and .NET. Frameworks like Next.js, Django, Rails, Laravel, and Spring Boot have zero-config deployment templates.",
          },
          {
            q: "Is there a free trial?",
            a: "Yes! New accounts receive $200 in free credits valid for 60 days. No credit card required to start. The Starter plan remains free indefinitely for small projects with limited resources.",
          },
          {
            q: "What security certifications do you have?",
            a: "CloudScale is SOC 2 Type II certified, ISO 27001 compliant, and GDPR compliant. Enterprise plans include HIPAA BAA and PCI DSS compliance support. All data is encrypted at rest and in transit using AES-256.",
          },
          {
            q: "What happens if I exceed my plan limits?",
            a: "We never throttle or shut down production workloads. Overage usage is billed at the same per-unit rate as your plan. You'll receive email alerts at 75% and 90% of any limits, and you can set custom spending caps and budget alerts.",
          },
        ]

    const finalCtaHeading = props.finalCta?.heading ?? "Ready to ship faster?"
    const finalCtaDesc =
      props.finalCta?.description ??
      "Join 50,000+ developers who have already made the switch. Start free and scale as you grow."
    const finalCtaPrimary = props.finalCta?.primaryCta ?? "Get Started Free"
    const finalCtaSecondary = props.finalCta?.secondaryCta ?? "Talk to Sales"
    const finalCtaNote =
      props.finalCta?.note ??
      "$200 free credit • No credit card required • Cancel anytime"

    const footerTagline =
      props.footer?.tagline ??
      "Elastic infrastructure for modern applications. Deploy, scale, and manage applications with zero config."
    const footerGroups = props.footer?.groups?.length
      ? props.footer.groups
      : [
          {
            title: "Product",
            links: ["Compute", "Storage", "Databases", "Networking", "Pricing"],
          },
          {
            title: "Solutions",
            links: ["Startups", "Enterprise", "Agencies", "E-commerce", "SaaS"],
          },
          {
            title: "Resources",
            links: [
              "Documentation",
              "API Reference",
              "Changelog",
              "Status",
              "Support",
            ],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Contact", "Partners"],
          },
        ]
    const footerNote =
      props.footer?.note ??
      `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Twitter", "GitHub", "LinkedIn"]

    // Brand logo tile — solid gradient square with a cloud glyph (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground",
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

    const XMark = ({ className }: { className?: string }) => (
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
        <path d="M6 18L18 6M6 6l12 12" />
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

    // Feature icon tiles rotate across chart tokens for a colorful but token-safe set.
    const featureIcons: ReactNode[] = [
      // bolt / instant deploys
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
      // bar chart / auto-scaling
      <svg
        key="scale"
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
      // globe / edge network
      <svg
        key="globe"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>,
      // archive / databases
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
        <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>,
      // sparkles / AI insights
      <svg
        key="ai"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>,
    ]
    // Token rotation for the icon tile backgrounds/text — colorful, gate-safe.
    const featureTones = [
      "bg-primary/10 text-primary",
      "bg-chart-1/15 text-chart-1",
      "bg-chart-2/15 text-chart-2",
      "bg-chart-3/15 text-chart-3",
      "bg-chart-4/15 text-chart-4",
      "bg-chart-5/15 text-chart-5",
    ]

    const socialIcons: Record<string, ReactNode> = {
      Twitter: (
        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
      ),
      GitHub: (
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      ),
      LinkedIn: (
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      ),
    }

    // Map a terminal line tone to a token-safe text color.
    const lineTone = (tone?: string) =>
      tone === "ok"
        ? "text-chart-2"
        : tone === "muted"
          ? "text-primary-foreground/50"
          : "text-primary-foreground/90"

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
          <nav
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <LogoMark className="size-8 lg:size-10" />
                <span className="text-xl font-bold tracking-tight lg:text-2xl">
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
              <div className="flex items-center gap-3 lg:gap-4">
                <button
                  type="button"
                  onClick={() => go("Sign in")}
                  className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => go("Get Started")}
                  className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 lg:px-5 lg:py-2.5"
                >
                  Get Started
                </button>
              </div>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-gradient-to-br from-accent/30 via-background to-primary/5 py-20 lg:py-32">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-20 -z-0 size-1/2 rounded-full bg-gradient-to-bl from-primary/20 to-transparent blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-0 -z-0 size-1/3 rounded-full bg-gradient-to-tr from-accent/40 to-transparent blur-3xl"
            />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                    <span
                      aria-hidden="true"
                      className="size-2 animate-pulse rounded-full bg-chart-2"
                    />
                    {heroBadge}
                  </div>
                  <h1 className="mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
                    {heroLead}
                    <span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
                      {heroHighlight}
                    </span>
                    {heroTrail}
                  </h1>
                  <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl lg:mx-0">
                    {heroSub}
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl"
                    >
                      {heroPrimary}
                      <ArrowRight className="ml-2 size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-xl border-2 border-border bg-background px-6 py-3.5 text-base font-semibold text-foreground transition-all hover:bg-accent"
                    >
                      <svg
                        className="mr-2 size-5"
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
                      {heroSecondary}
                    </button>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {heroNote}
                  </p>
                </div>

                <div className="relative">
                  {/* CLI terminal mockup */}
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-primary shadow-2xl shadow-primary/20">
                    <div className="flex items-center gap-2 border-b border-primary-foreground/10 bg-primary-foreground/5 px-4 py-3">
                      <div className="flex gap-1.5">
                        <span className="size-3 rounded-full bg-destructive" />
                        <span className="size-3 rounded-full bg-chart-4" />
                        <span className="size-3 rounded-full bg-chart-2" />
                      </div>
                      <div className="flex-1 text-center">
                        <span className="font-mono text-xs text-primary-foreground/60">
                          {terminalTitle}
                        </span>
                      </div>
                    </div>
                    <div className="overflow-x-auto p-4 font-mono text-sm lg:p-6">
                      <div className="space-y-1">
                        {terminalLines.map((line, i) => (
                          <p key={i} className={lineTone(line.tone)}>
                            {line.tone === "prompt" ? (
                              <>
                                <span className="text-chart-2">$</span>
                                {line.text.replace(/^\$\s?/, " ")}
                              </>
                            ) : (
                              line.text
                            )}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Floating deploy-success card */}
                  <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-border bg-card p-4 shadow-xl lg:block">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-lg bg-chart-2/15 text-chart-2">
                        <Check className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-card-foreground">
                          {deployCardTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {deployCardSubtitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Floating global-edge card */}
                  <div className="absolute -right-4 -top-4 hidden rounded-xl border border-border bg-card p-4 shadow-xl lg:block">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {edgeRegions.map((r, i) => (
                          <span
                            key={r}
                            className={cn(
                              "grid size-8 place-items-center rounded-full border-2 border-card text-xs font-semibold text-primary-foreground",
                              ["bg-chart-1", "bg-chart-3", "bg-chart-4"][i % 3],
                            )}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-card-foreground">
                          {edgeCardTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {edgeCardSubtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border bg-muted/40 py-12 lg:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-70 md:grid-cols-3 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="flex items-center justify-center text-lg font-bold text-foreground/70 transition-colors hover:text-foreground"
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 lg:p-8"
                  >
                    <div
                      className={cn(
                        "mb-5 grid size-12 place-items-center rounded-xl transition-transform group-hover:scale-110",
                        featureTones[i % featureTones.length],
                      )}
                    >
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-card-foreground">
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

          {/* Steps (dark band) */}
          <section className="bg-primary py-20 text-primary-foreground lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-primary-foreground/60">
                  {stepsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-6 grid size-16 place-items-center rounded-full bg-accent text-2xl font-bold text-accent-foreground">
                      {i + 1}
                    </div>
                    {i < stepItems.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="absolute left-16 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-accent to-transparent opacity-40 md:block"
                      />
                    )}
                    <h3 className="mb-3 text-xl font-bold">{step.title}</h3>
                    <p className="leading-relaxed text-primary-foreground/60">
                      {step.description}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {step.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-primary-foreground/10 px-3 py-1 text-sm text-primary-foreground/80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-16 text-center lg:mt-20">
                <button
                  type="button"
                  onClick={() => go(stepsCta)}
                  className="inline-flex items-center rounded-xl bg-background px-6 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-background/90"
                >
                  {stepsCta}
                  <ArrowRight className="ml-2 size-5" />
                </button>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{galleryDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
                {galleryItems.map((item) => (
                  <figure
                    key={item.title}
                    className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5"
                  >
                    <div className="aspect-[8/5] overflow-hidden bg-muted">
                      <Image
                        alt={item.alt}
                        w={800}
                        h={500}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </div>
                    <figcaption className="p-6">
                      <h3 className="mb-2 text-lg font-bold text-card-foreground">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground">{item.caption}</p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-gradient-to-b from-muted/50 to-background py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative overflow-hidden rounded-2xl p-6 lg:p-8",
                      tier.popular
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card",
                    )}
                  >
                    {tier.popular && (
                      <span className="absolute right-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                        Most Popular
                      </span>
                    )}
                    <div className="mb-6">
                      <h3
                        className={cn(
                          "mb-2 text-lg font-semibold",
                          tier.popular
                            ? "text-primary-foreground"
                            : "text-card-foreground",
                        )}
                      >
                        {tier.name}
                      </h3>
                      <p
                        className={cn(
                          "text-sm",
                          tier.popular
                            ? "text-primary-foreground/60"
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
                          tier.popular
                            ? "text-primary-foreground"
                            : "text-card-foreground",
                        )}
                      >
                        {tier.price}
                      </span>
                      {tier.unit && (
                        <span
                          className={cn(
                            tier.popular
                              ? "text-primary-foreground/60"
                              : "text-muted-foreground",
                          )}
                        >
                          {tier.unit}
                        </span>
                      )}
                    </div>
                    <ul className="mb-8 space-y-3">
                      {tier.features.map((feat) => (
                        <li
                          key={feat.label}
                          className={cn(
                            "flex items-center text-sm",
                            feat.included
                              ? tier.popular
                                ? "text-primary-foreground/80"
                                : "text-muted-foreground"
                              : tier.popular
                                ? "text-primary-foreground/40"
                                : "text-muted-foreground/50",
                          )}
                        >
                          {feat.included ? (
                            <Check
                              className={cn(
                                "mr-3 size-5 shrink-0",
                                tier.popular
                                  ? "text-accent-foreground"
                                  : "text-chart-2",
                              )}
                            />
                          ) : (
                            <XMark className="mr-3 size-5 shrink-0 text-muted-foreground/40" />
                          )}
                          {feat.label}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className={cn(
                        "w-full rounded-xl px-4 py-3 font-semibold transition-colors",
                        tier.popular
                          ? "bg-accent text-accent-foreground hover:bg-accent/90"
                          : "border-2 border-border text-foreground hover:border-primary hover:text-primary",
                      )}
                    >
                      {tier.cta}
                    </button>
                  </div>
                ))}
              </div>

              {/* Usage rates panel */}
              <div className="mt-16 rounded-2xl border border-border bg-card p-8">
                <h3 className="mb-6 text-xl font-bold text-card-foreground">
                  {ratesHeading}
                </h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {rates.map((rate) => (
                    <div
                      key={rate.label}
                      className="rounded-xl bg-muted/60 p-4"
                    >
                      <p className="mb-1 text-sm text-muted-foreground">
                        {rate.label}
                      </p>
                      <p className="text-2xl font-bold text-card-foreground">
                        {rate.price}
                        <span className="text-sm font-normal text-muted-foreground">
                          {rate.unit}
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground/70">
                        {rate.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Stats (dark band) */}
          <section className="bg-primary py-20 text-primary-foreground lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 text-center md:grid-cols-2 lg:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label} className="p-6">
                    <p className="mb-2 text-4xl font-bold text-accent-foreground lg:text-5xl">
                      {s.value}
                    </p>
                    <p className="text-primary-foreground/60">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
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
                    className="rounded-2xl bg-muted/50 p-6 lg:p-8"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-5 text-chart-4" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-muted-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-foreground">
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
          <section className="bg-muted/40 py-20 lg:py-32">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group overflow-hidden rounded-xl border border-border bg-card open:border-primary"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5">
                      <span className="pr-8 font-semibold text-card-foreground">
                        {item.q}
                      </span>
                      <span
                        aria-hidden="true"
                        className="transition-transform group-open:rotate-180"
                      >
                        <Chevron className="size-5 text-muted-foreground" />
                      </span>
                    </summary>
                    <div className="px-6 pb-5 leading-relaxed text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA (gradient card) */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-accent-foreground p-8 text-center text-primary-foreground lg:p-16">
                <div className="relative z-10">
                  <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                    {finalCtaHeading}
                  </h2>
                  <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/70 lg:text-xl">
                    {finalCtaDesc}
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(finalCtaPrimary)}
                      className="inline-flex items-center justify-center rounded-xl bg-background px-8 py-4 text-base font-semibold text-foreground shadow-lg transition-colors hover:bg-background/90"
                    >
                      {finalCtaPrimary}
                      <ArrowRight className="ml-2 size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(finalCtaSecondary)}
                      className="inline-flex items-center justify-center rounded-xl border-2 border-primary-foreground/30 px-8 py-4 text-base font-semibold text-primary-foreground transition-colors hover:border-primary-foreground hover:bg-primary-foreground/10"
                    >
                      {finalCtaSecondary}
                    </button>
                  </div>
                  <p className="mt-6 text-sm text-primary-foreground/60">
                    {finalCtaNote}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer
          className="border-t border-border bg-muted/40 py-16 lg:py-20"
          role="contentinfo"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-6 lg:gap-12">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark className="size-8" />
                  <span className="text-xl font-bold tracking-tight">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 max-w-xs text-muted-foreground">
                  {footerTagline}
                </p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-lg bg-secondary text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
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
                  <ul className="space-y-3">
                    {group.links.map((link) => (
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
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">{footerNote}</p>
              <div className="flex gap-6">
                {footerLegal.map((legal) => (
                  <button
                    key={legal}
                    type="button"
                    onClick={() => go(legal)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {legal}
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
