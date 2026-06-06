import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * CorporateKimiPage2 — a complete, self-contained ENTERPRISE / B2B SaaS
 * marketing homepage. TEMPLATE VARIANT 2 of the "corporate" category and a
 * visually DISTINCT sibling to CorporateKimiPage.
 *
 * Where CorporateKimiPage is a restrained, neutral near-black corporate look,
 * this variant is a vibrant, modern PRODUCT-LED indigo/violet SaaS aesthetic
 * (a faithful Tailwind v4 port of a Kimi "Nexus Enterprise" design). It pairs a
 * split hero (animated live trust pill + bold gradient-accent headline + dual
 * CTAs + free-trial assurances + a showcase product screenshot with floating
 * "Uptime SLA" / "Security Score" glass stat cards and a 5-star reviewer
 * overlay), a 6-brand logo trust-bar, a colorful 6-up solutions grid with
 * tinted chart-token icon tiles (cloud orchestration, zero-trust security,
 * real-time analytics, AI/ML workloads, team collaboration, 24/7 support), a
 * dark "deploy in minutes" 3-step onboarding section with a faux terminal CLI
 * window, a 6-up product gallery with gradient caption overlays, a 3-tier
 * Starter / Professional (featured) / Enterprise pricing table, a vibrant
 * primary KPI stats band with secondary metrics row, a 5-up testimonial grid
 * with star ratings + avatars, an 8-item accordion FAQ, a bold primary
 * conversion CTA band, and a fat dark 4-column footer with social icons.
 *
 * Use as the ROOT/home page for cloud-infrastructure platforms, developer
 * tooling, PaaS / IaaS vendors, AI/ML & analytics products, or any modern
 * enterprise SaaS that wants energy and product polish rather than buttoned-up
 * gravitas. Choose THIS over CorporateKimiPage when the brand should feel
 * colorful, product-led and startup-fast. Supply content only — brand, nav,
 * hero, logos, solutions, steps, gallery, pricing, stats, testimonials, faq,
 * cta, footer; the block owns all layout and styling.
 */
export const CorporateKimiPage2 = defineComponent({
  name: "CorporateKimiPage2",
  description:
    "Second/alternative ENTERPRISE corporate B2B SaaS marketing homepage — a vibrant, modern, product-led indigo/violet aesthetic that is a visually distinct sibling to CorporateKimiPage (use this when the brand should feel colorful, energetic and startup-fast rather than buttoned-up neutral). Includes a split hero (animated live 'SOC 2 Type II Certified' pill, bold headline with a gradient-accent word, dual CTAs, no-credit-card / free-trial assurances, and a showcase product screenshot with floating glass 'Uptime SLA 99.999%' and 'Security Score A+' stat cards plus a 5-star reviewer overlay), a 6-brand client logo trust-bar, a colorful 6-up enterprise solutions grid with tinted icon tiles (cloud orchestration, zero-trust security, real-time analytics, AI/ML GPU workloads, team collaboration, 24/7 expert support), a dark 'deploy in minutes' 3-step onboarding section with a faux terminal CLI window, a 6-up product gallery with gradient caption overlays, a 3-tier Starter / Professional (featured 'Most Popular') / Enterprise pricing table, a vibrant primary KPI stats band with a secondary metrics row, a 5-up customer testimonial grid with star ratings and avatars, an 8-item accordion FAQ, a bold primary conversion CTA band, and a fat dark 4-column footer with social icons and legal links. Use as the ROOT/home page for cloud-infrastructure platforms, developer tooling and PaaS/IaaS vendors, AI/ML and analytics products, fintech/healthcare infrastructure, or any modern enterprise SaaS company. Supply content only; the block owns all layout and styling.",
  props: z.object({
    /** Brand / company name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Split hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        /** Accent word inside the heading (rendered with gradient text). */
        accent: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        /** Free-trial assurance check-marks under the CTAs. */
        assurances: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        /** Reviewer overlay over the hero image. */
        reviewerLabel: z.string().optional(),
        rating: z.string().optional(),
        /** Floating stat cards over the hero image. */
        statCards: z
          .array(z.object({ label: z.string(), value: z.string() }))
          .optional(),
      })
      .optional(),
    /** Client logo trust-bar. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Enterprise solutions / features grid. */
    solutions: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark "deploy in minutes" onboarding steps with terminal mockup. */
    steps: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        cta: z.string().optional(),
        note: z.string().optional(),
        /** Terminal mockup window title + lines. */
        terminalTitle: z.string().optional(),
        terminalLines: z.array(z.string()).optional(),
      })
      .optional(),
    /** Product gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              caption: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Transparent pricing table. */
    pricing: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              blurb: z.string(),
              price: z.string(),
              period: z.string().optional(),
              features: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Vibrant KPI stats band. */
    stats: z
      .object({
        primary: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
        secondary: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Customer testimonial grid. */
    testimonials: z
      .object({
        eyebrow: z.string().optional(),
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
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Final conversion CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        assurances: z.array(z.string()).optional(),
      })
      .optional(),
    /** Fat footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        columns: z
          .array(
            z.object({ title: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Nexus"
    const nav = props.nav?.length
      ? props.nav
      : ["Solutions", "Customers", "Pricing", "Investors", "Company"]

    const heroBadge = props.hero?.badge ?? "Now SOC 2 Type II Certified"
    const heroHeading =
      props.hero?.heading ?? "Enterprise Infrastructure"
    const heroAccent = props.hero?.accent ?? "Reimagined"
    const heroSub =
      props.hero?.subheading ??
      "Powering 847+ Fortune 500 companies with AI-driven cloud orchestration, zero-trust security, and real-time analytics. Deploy in minutes, scale infinitely."
    const heroPrimary = props.hero?.primaryCta ?? "Start Free Trial"
    const heroSecondary = props.hero?.secondaryCta ?? "Watch Platform Tour"
    const heroAssurances = props.hero?.assurances?.length
      ? props.hero.assurances
      : ["No credit card required", "14-day free trial", "Cancel anytime"]
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Modern enterprise cloud infrastructure dashboard interface showing real-time analytics graphs and server monitoring data on a desktop screen"
    const heroReviewerLabel =
      props.hero?.reviewerLabel ?? "Trusted by 2,400+ engineers"
    const heroRating = props.hero?.rating ?? "4.9/5"
    const heroStatCards = props.hero?.statCards?.length
      ? props.hero.statCards
      : [
          { label: "Uptime SLA", value: "99.999%" },
          { label: "Security Score", value: "A+ Rated" },
        ]

    const logosHeading = props.logos?.heading ?? "Trusted by industry leaders"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Stripe", "Notion", "Figma", "Slack", "Shopify", "Vercel"]

    const solutionsEyebrow = props.solutions?.eyebrow ?? "Platform"
    const solutionsHeading =
      props.solutions?.heading ?? "Everything you need to scale"
    const solutionsDesc =
      props.solutions?.description ??
      "From startups to Fortune 500s, our unified platform delivers enterprise-grade infrastructure without the enterprise-grade complexity."
    const solutionItems = props.solutions?.items?.length
      ? props.solutions.items
      : [
          {
            title: "Cloud Orchestration",
            description:
              "Auto-scale across 47 global regions with intelligent workload distribution. Cut infrastructure costs by up to 60%.",
          },
          {
            title: "Zero-Trust Security",
            description:
              "SOC 2 Type II certified with end-to-end encryption, RBAC, and real-time threat detection powered by AI.",
          },
          {
            title: "Real-Time Analytics",
            description:
              "Sub-second query performance on petabyte-scale data. Visualize trends, predict outcomes, act instantly.",
          },
          {
            title: "AI/ML Workloads",
            description:
              "GPU clusters on demand for training and inference. Support for TensorFlow, PyTorch, and custom frameworks.",
          },
          {
            title: "Team Collaboration",
            description:
              "Shared workspaces, granular permissions, and audit logs. Built for teams of 5 to 50,000.",
          },
          {
            title: "24/7 Expert Support",
            description:
              "Average response time under 3 minutes. Dedicated success engineers for enterprise accounts.",
          },
        ]

    const stepsEyebrow = props.steps?.eyebrow ?? "Get Started"
    const stepsHeading =
      props.steps?.heading ?? "Deploy in minutes, not months"
    const stepsDesc =
      props.steps?.description ??
      "Our streamlined onboarding process gets you from signup to production in under 30 minutes. No complex configurations, no hidden steps."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Create your account",
            description:
              "Sign up with your work email. No credit card required for the 14-day trial.",
          },
          {
            title: "Connect your infrastructure",
            description:
              "Use our CLI or web dashboard to link existing cloud providers or start fresh.",
          },
          {
            title: "Deploy and scale",
            description:
              "Push your code. We'll handle the rest—auto-scaling, monitoring, and optimization.",
          },
        ]
    const stepsCta = props.steps?.cta ?? "Read Documentation"
    const stepsNote = props.steps?.note ?? "28-minute average setup"
    const terminalTitle = props.steps?.terminalTitle ?? "nexus-cli deploy"
    const terminalLines = props.steps?.terminalLines?.length
      ? props.steps.terminalLines
      : [
          "$ nexus login",
          "Authenticating with Nexus Enterprise...",
          "✓ Successfully authenticated",
          "$ nexus init my-project",
          "Initializing project structure...",
          "✓ Project initialized",
          "✓ Connected to 12 regions",
          "✓ Auto-scaling enabled",
          "$ nexus deploy",
          "Building application...",
          "Optimizing assets (3.2MB → 847KB)",
          "✓ Deployed to production",
          "→ https://my-project.nexus.app",
          "Deploy time: 47 seconds",
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? "Platform Overview"
    const galleryHeading = props.gallery?.heading ?? "Built for modern teams"
    const galleryDesc =
      props.gallery?.description ??
      "Explore the tools that power thousands of engineering teams worldwide."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Analytics Dashboard",
            caption: "Real-time insights across all your deployments",
            imageAlt:
              "Analytics dashboard interface showing colorful data visualizations with line charts bar graphs and metrics cards on a computer monitor",
          },
          {
            title: "Global Infrastructure",
            caption: "47 regions with 99.999% uptime SLA",
            imageAlt:
              "Server room with rows of illuminated rack-mounted servers and fiber optic cables showing data center infrastructure",
          },
          {
            title: "Team Collaboration",
            caption: "Shared workspaces with granular permissions",
            imageAlt:
              "Software engineering team collaborating around a large screen showing code and discussing project architecture in modern office",
          },
          {
            title: "Security Center",
            caption: "Zero-trust architecture with AI threat detection",
            imageAlt:
              "Cybersecurity visualization with digital lock icons shield graphics and encrypted data streams on dark background",
          },
          {
            title: "Developer Experience",
            caption: "CLI, SDKs, and API-first design",
            imageAlt:
              "Code editor IDE interface with syntax highlighting showing JavaScript programming on a developer laptop screen",
          },
          {
            title: "Observability",
            caption: "Logs, metrics, and traces in one place",
            imageAlt:
              "DevOps engineer monitoring infrastructure metrics and performance graphs on multiple screens in network operations center",
          },
        ]

    const pricingEyebrow = props.pricing?.eyebrow ?? "Pricing"
    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start free, scale as you grow. No hidden fees, no surprises."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Starter",
            blurb: "Perfect for side projects and small teams",
            price: "$0",
            period: "/month",
            features: [
              "Up to 3 projects",
              "100GB bandwidth/month",
              "Community support",
              "Basic analytics",
            ],
            cta: "Get Started Free",
            featured: false,
          },
          {
            name: "Professional",
            blurb: "For growing businesses and teams",
            price: "$149",
            period: "/month",
            features: [
              "Unlimited projects",
              "10TB bandwidth/month",
              "Priority support (4hr response)",
              "Advanced analytics & logs",
              "Custom domains & SSL",
              "Team collaboration tools",
            ],
            cta: "Start 14-Day Trial",
            featured: true,
            badge: "Most Popular",
          },
          {
            name: "Enterprise",
            blurb: "For large-scale organizations",
            price: "Custom",
            period: "",
            features: [
              "Everything in Professional",
              "Unlimited bandwidth",
              "24/7 phone support (< 3min)",
              "Dedicated success engineer",
              "SLA guarantees & audits",
              "Custom contracts & invoicing",
            ],
            cta: "Contact Sales",
            featured: false,
          },
        ]

    const statsPrimary = props.stats?.primary?.length
      ? props.stats.primary
      : [
          { value: "847+", label: "Fortune 500 Customers" },
          { value: "99.999%", label: "Uptime SLA" },
          { value: "47", label: "Global Regions" },
          { value: "$4.2B", label: "Customer Revenue Enabled" },
        ]
    const statsSecondary = props.stats?.secondary?.length
      ? props.stats.secondary
      : [
          { value: "2.4M+", label: "API requests processed daily" },
          { value: "156ms", label: "Average response time globally" },
          { value: "18TB", label: "Data processed per second" },
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Testimonials"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by engineering teams"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See what industry leaders say about partnering with Nexus."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Nexus cut our infrastructure costs by 62% while improving our API response times by 40%. The auto-scaling handled Black Friday traffic flawlessly—we served 12M requests without a single hiccup.",
            name: "David Park",
            role: "CTO, CommerceFlow",
            avatarAlt:
              "Professional headshot of David Park, Chief Technology Officer at CommerceFlow",
          },
          {
            quote:
              "The security features alone justify the switch. We passed our SOC 2 audit in record time, and the zero-trust architecture gives our compliance team peace of mind. Best infrastructure decision we made.",
            name: "Elena Vasquez",
            role: "VP Engineering, SecureHealth",
            avatarAlt:
              "Professional headshot of Elena Vasquez, VP of Engineering at SecureHealth",
          },
          {
            quote:
              "We migrated 400+ microservices to Nexus in under 3 months. The developer experience is unmatched—the CLI is intuitive, docs are excellent, and support actually understands complex problems.",
            name: "Marcus Chen",
            role: "Director of Platform, Finova Bank",
            avatarAlt:
              "Professional headshot of Marcus Chen, Director of Platform at Finova Bank",
          },
          {
            quote:
              "The analytics platform transformed how we make decisions. We went from batch reports to real-time dashboards overnight. Our data team is 3x more productive, and executives love the instant insights.",
            name: "Sarah Mitchell",
            role: "Chief Data Officer, RetailMax",
            avatarAlt:
              "Professional headshot of Sarah Mitchell, Chief Data Officer at RetailMax",
          },
          {
            quote:
              "As a startup, we needed enterprise infrastructure without enterprise complexity. Nexus gave us exactly that. We went from zero to handling 50,000 concurrent users in 6 months without hiring a single DevOps engineer.",
            name: "James Wilson",
            role: "Founder & CEO, StreamLine AI",
            avatarAlt:
              "Professional headshot of James Wilson, Founder & CEO at StreamLine AI",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about Nexus Enterprise."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "How does the 14-day free trial work?",
            a: "Start with full access to all Professional tier features—no credit card required. Build, deploy, and scale your applications for 14 days. At the end of your trial, choose a plan that fits your needs or continue with the free Starter tier. We'll send you a reminder 3 days before the trial ends.",
          },
          {
            q: "Can I use my existing cloud provider?",
            a: "Absolutely. Nexus integrates seamlessly with AWS, Google Cloud Platform, and Microsoft Azure. You can connect existing infrastructure or let us provision resources for you. Our multi-cloud orchestration ensures optimal performance and redundancy across providers. No vendor lock-in—migrate in or out anytime.",
          },
          {
            q: "What security certifications do you have?",
            a: "Nexus maintains SOC 2 Type II, ISO 27001, GDPR, and HIPAA compliance. Enterprise customers receive detailed compliance documentation and audit reports. Our security team conducts quarterly penetration tests and maintains a bug bounty program. All data is encrypted at rest (AES-256) and in transit (TLS 1.3).",
          },
          {
            q: "How does your pricing compare to managing our own infrastructure?",
            a: "Most customers see 40-70% cost reduction compared to self-managed infrastructure when factoring in DevOps salaries, tooling costs, and idle resource waste. Our auto-scaling ensures you only pay for what you use, and our negotiated cloud rates pass savings directly to you. Use our TCO calculator for a personalized estimate.",
          },
          {
            q: "What happens if I exceed my plan limits?",
            a: "We never throttle or shut down your services. If you approach your limits, we'll notify you and offer flexible options: automatic plan upgrade, pay-as-you-go overages, or a custom Enterprise arrangement. For bandwidth, overages are billed at $0.08/GB—well below market rates. No surprise bills: set spending alerts and hard caps in your dashboard.",
          },
          {
            q: "Do you offer SLAs for Enterprise customers?",
            a: "Yes. Enterprise contracts include a 99.999% uptime SLA with financial credits for any downtime. We guarantee 3-minute response times for critical issues, 24/7 phone support, and quarterly business reviews with your dedicated success engineer. Custom SLAs with enhanced guarantees are available for mission-critical workloads.",
          },
          {
            q: "How do I migrate from my current infrastructure?",
            a: "Our migration specialists handle the entire process at no extra cost for Professional and Enterprise plans. We use a phased approach: assessment, pilot migration, validation, and full cutover. Most customers complete migration in 2-6 weeks. Zero-downtime migrations are standard for Enterprise accounts using our blue-green deployment strategy.",
          },
          {
            q: "What programming languages and frameworks do you support?",
            a: "We support virtually every modern stack: Node.js, Python, Go, Ruby, PHP, Java, .NET, Rust, and more. Popular frameworks like Next.js, Django, Rails, Laravel, Spring Boot deploy with zero configuration. Container-based deployments support any language. GPU instances are available for PyTorch, TensorFlow, and CUDA workloads.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? "Ready to transform your infrastructure?"
    const ctaDesc =
      props.cta?.description ??
      "Join 847+ Fortune 500 companies and thousands of startups building on Nexus. Start free, scale infinitely."
    const ctaPrimary = props.cta?.primaryCta ?? "Start Free Trial"
    const ctaSecondary = props.cta?.secondaryCta ?? "Schedule Demo"
    const ctaAssurances = props.cta?.assurances?.length
      ? props.cta.assurances
      : ["No credit card required", "14-day full access", "Cancel anytime"]

    const footerAbout =
      props.footer?.about ??
      "Enterprise infrastructure that just works. Deploy in minutes, scale infinitely, sleep soundly."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: [
              "Cloud Orchestration",
              "Security",
              "Analytics",
              "AI/ML Workloads",
              "Pricing",
              "Changelog",
            ],
          },
          {
            title: "Company",
            links: [
              "About Us",
              "Blog",
              "Careers",
              "Press Kit",
              "Contact",
              "Investors",
            ],
          },
          {
            title: "Resources",
            links: [
              "Documentation",
              "API Reference",
              "Community",
              "Status",
              "Partners",
              "Legal",
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      "© 2026 Nexus Enterprise Inc. All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Policy"]

    // Brand logo tile — solid primary surface with a decorative bolt glyph.
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-primary text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="60%"
          height="60%"
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

    const Check = ({ className }: { className?: string }) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M9 5l7 7-7 7" />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={cn("text-chart-4", className)}
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    // Multi-color solution icon tiles — rotate chart tokens for vibrancy.
    const solutionIcons: ReactNode[] = [
      // cloud orchestration
      <svg
        key="cloud"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>,
      // zero-trust security
      <svg
        key="shield"
        width="28"
        height="28"
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
      // real-time analytics
      <svg
        key="chart"
        width="28"
        height="28"
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
      // AI/ML workloads
      <svg
        key="bolt"
        width="28"
        height="28"
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
      // team collaboration
      <svg
        key="team"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      // 24/7 support
      <svg
        key="support"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>,
    ]

    // Tint pairs for the solution icon tiles (token-only, rotated for variety).
    const iconTints = [
      "bg-primary/10 text-primary",
      "bg-chart-2/10 text-chart-2",
      "bg-chart-1/10 text-chart-1",
      "bg-chart-3/10 text-chart-3",
      "bg-chart-4/10 text-chart-4",
      "bg-chart-5/10 text-chart-5",
    ]

    const socialIcons: { label: string; path: string }[] = [
      {
        label: "Twitter",
        path: "M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84",
      },
      {
        label: "GitHub",
        path: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z",
      },
      {
        label: "LinkedIn",
        path: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
      },
      {
        label: "YouTube",
        path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
      },
    ]

    const sectionHead = (eyebrow: string, heading: string, desc: string) => (
      <div className="mx-auto mb-16 max-w-3xl text-center">
        <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
          {eyebrow}
        </span>
        <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {heading}
        </h2>
        <p className="text-lg text-muted-foreground">{desc}</p>
      </div>
    )

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
            aria-label="Main navigation"
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          >
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <LogoMark className="size-10" />
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
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="hidden items-center justify-center rounded-lg bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 sm:inline-flex"
                >
                  Contact Sales
                </button>
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90"
                >
                  Get Demo
                </button>
                <button
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v: boolean) => !v)}
                  className="p-2 text-muted-foreground hover:text-foreground md:hidden"
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
                    aria-hidden="true"
                  >
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
            {mobileOpen && (
              <div
                id="mobile-menu"
                className="flex flex-col border-t border-border bg-background px-4 py-6 pb-8 md:hidden gap-4"
              >
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setMobileOpen(false)
                      go(label)
                    }}
                    className="text-base font-medium text-foreground/90 transition-colors hover:text-foreground text-left"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/20"
            />
            <div
              aria-hidden="true"
              className="absolute right-0 top-20 h-1/2 w-1/2 rounded-full bg-gradient-to-bl from-primary/20 to-transparent blur-3xl"
            />
            <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8 lg:pb-32 lg:pt-40">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    {heroBadge}
                  </div>
                  <h1 className="mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
                    {heroHeading}{" "}
                    <span className="bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
                      {heroAccent}
                    </span>
                  </h1>
                  <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl lg:mx-0">
                    {heroSub}
                  </p>
                  <div className="mb-10 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-xl shadow-primary/30 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <ArrowRight className="ml-2 size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-xl border-2 border-border bg-background px-8 py-4 text-lg font-bold text-foreground transition-all hover:border-primary/40 hover:text-primary"
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
                        className="mr-2"
                        aria-hidden="true"
                      >
                        <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
                    {heroAssurances.map((a) => (
                      <span key={a} className="flex items-center gap-2">
                        <Check className="size-5 text-chart-2" />
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-primary to-chart-1 opacity-20 blur-2xl"
                  />
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                    <Image
                      alt={heroImageAlt}
                      w={800}
                      h={600}
                      loading="eager"
                      className="h-auto w-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-6">
                      <div className="flex items-center gap-4">
                        <p className="text-sm font-semibold text-background">
                          {heroReviewerLabel}
                        </p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="size-4" />
                          ))}
                          <span className="ml-1 text-xs text-background">
                            {heroRating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {heroStatCards[0] && (
                    <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-border bg-card p-4 shadow-lg lg:block">
                      <div className="flex items-center gap-3">
                        <div className="grid size-12 place-items-center rounded-lg bg-chart-2/10 text-chart-2">
                          <svg
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
                            <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {heroStatCards[0].label}
                          </p>
                          <p className="text-lg font-bold text-card-foreground">
                            {heroStatCards[0].value}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {heroStatCards[1] && (
                    <div className="absolute -right-4 -top-4 hidden rounded-xl border border-border bg-card p-4 shadow-lg lg:block">
                      <div className="flex items-center gap-3">
                        <div className="grid size-12 place-items-center rounded-lg bg-primary/10 text-primary">
                          <svg
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
                            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {heroStatCards[1].label}
                          </p>
                          <p className="text-lg font-bold text-card-foreground">
                            {heroStatCards[1].value}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Logo trust-bar */}
          <section className="border-y border-border bg-muted/50 py-16">
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
                    className="flex h-12 items-center justify-center"
                  >
                    <span className="text-xl font-bold text-muted-foreground">
                      {logo}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Solutions / features */}
          <section className="bg-background py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {sectionHead(solutionsEyebrow, solutionsHeading, solutionsDesc)}
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {solutionItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
                  >
                    <div
                      className={cn(
                        "mb-6 grid size-14 place-items-center rounded-xl transition-transform group-hover:scale-110",
                        iconTints[i % iconTints.length],
                      )}
                    >
                      {solutionIcons[i % solutionIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => go(item.title)}
                      className="inline-flex items-center text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                    >
                      Learn more
                      <ArrowRight className="ml-1 size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Deploy-in-minutes steps + terminal */}
          <section className="bg-foreground py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <div>
                  <span className="mb-4 inline-block rounded-full bg-primary/20 px-4 py-1.5 text-sm font-semibold text-primary">
                    {stepsEyebrow}
                  </span>
                  <h2 className="mb-6 text-3xl font-bold tracking-tight text-background sm:text-4xl lg:text-5xl">
                    {stepsHeading}
                  </h2>
                  <p className="mb-10 text-lg text-background/60">
                    {stepsDesc}
                  </p>

                  <div className="space-y-8">
                    {stepItems.map((step, i) => (
                      <div key={step.title} className="flex gap-4">
                        <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground">
                          {i + 1}
                        </div>
                        <div>
                          <h3 className="mb-2 text-xl font-bold text-background">
                            {step.title}
                          </h3>
                          <p className="text-background/60">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 flex items-center gap-6">
                    <button
                      type="button"
                      onClick={() => go(stepsCta)}
                      className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {stepsCta}
                    </button>
                    <div className="flex items-center gap-2 text-sm text-background/60">
                      <Check className="size-5 text-chart-2" />
                      <span>{stepsNote}</span>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-primary to-chart-1 opacity-30 blur-2xl"
                  />
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
                    <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-3">
                      <span className="size-3 rounded-full bg-chart-5" />
                      <span className="size-3 rounded-full bg-chart-4" />
                      <span className="size-3 rounded-full bg-chart-2" />
                      <span className="ml-2 font-mono text-sm text-muted-foreground">
                        {terminalTitle}
                      </span>
                    </div>
                    <div className="space-y-1 p-6 font-mono text-sm">
                      {terminalLines.map((line, i) => {
                        const isPrompt = line.startsWith("$")
                        const isOk = line.startsWith("✓")
                        const isUrl = line.startsWith("→")
                        return (
                          <p
                            key={`${i}-${line}`}
                            className={cn(
                              isPrompt && "text-card-foreground",
                              isOk && "text-chart-2",
                              isUrl && "text-primary",
                              !isPrompt &&
                                !isOk &&
                                !isUrl &&
                                "text-muted-foreground",
                            )}
                          >
                            {line}
                          </p>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Product gallery */}
          <section className="bg-muted/50 py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {sectionHead(galleryEyebrow, galleryHeading, galleryDesc)}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((item, i) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => go(item.title)}
                    className={cn(
                      "group relative block overflow-hidden rounded-2xl bg-card text-left shadow-lg",
                      i === 3 && "md:col-span-2 lg:col-span-1",
                    )}
                  >
                    <Image
                      alt={item.imageAlt}
                      w={600}
                      h={400}
                      loading="lazy"
                      className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <h3 className="mb-1 text-xl font-bold text-background">
                        {item.title}
                      </h3>
                      <p className="text-sm text-background/80">
                        {item.caption}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-background py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {sectionHead(pricingEyebrow, pricingHeading, pricingDesc)}
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative rounded-2xl border p-8",
                      plan.featured
                        ? "border-primary bg-primary"
                        : "border-border bg-card",
                    )}
                  >
                    {plan.badge && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-chart-4 px-4 py-1 text-sm font-bold text-foreground">
                          {plan.badge}
                        </span>
                      </div>
                    )}
                    <h3
                      className={cn(
                        "mb-2 text-lg font-semibold",
                        plan.featured
                          ? "text-primary-foreground"
                          : "text-card-foreground",
                      )}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={cn(
                        "mb-6 text-sm",
                        plan.featured
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground",
                      )}
                    >
                      {plan.blurb}
                    </p>
                    <div className="mb-6">
                      <span
                        className={cn(
                          "text-4xl font-bold",
                          plan.featured
                            ? "text-primary-foreground"
                            : "text-card-foreground",
                        )}
                      >
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span
                          className={cn(
                            plan.featured
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground",
                          )}
                        >
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <ul className="mb-8 space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-3 text-sm"
                        >
                          <Check
                            className={cn(
                              "size-5 flex-shrink-0",
                              plan.featured
                                ? "text-primary-foreground"
                                : "text-chart-2",
                            )}
                          />
                          <span
                            className={cn(
                              plan.featured
                                ? "text-primary-foreground/90"
                                : "text-muted-foreground",
                            )}
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "block w-full rounded-lg py-3 text-center text-sm font-semibold transition-colors",
                        plan.featured
                          ? "bg-background text-primary hover:bg-muted"
                          : "bg-primary/10 text-primary hover:bg-primary/20",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Vibrant KPI stats band */}
          <section className="bg-primary py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4 lg:gap-12">
                {statsPrimary.map((stat) => (
                  <div key={stat.label}>
                    <div className="mb-2 text-4xl font-bold text-primary-foreground sm:text-5xl lg:text-6xl">
                      {stat.value}
                    </div>
                    <p className="font-medium text-primary-foreground/70">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-16 border-t border-primary-foreground/20 pt-16">
                <div className="grid gap-8 text-center md:grid-cols-3">
                  {statsSecondary.map((stat) => (
                    <div key={stat.label}>
                      <p className="mb-1 text-3xl font-bold text-primary-foreground">
                        {stat.value}
                      </p>
                      <p className="text-sm text-primary-foreground/70">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted/50 py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {sectionHead(
                testimonialsEyebrow,
                testimonialsHeading,
                testimonialsDesc,
              )}
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl border border-border bg-card p-8 shadow-lg"
                  >
                    <div className="mb-6 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
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
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-background py-24 lg:py-32">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {faqEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group overflow-hidden rounded-xl border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6 transition-colors hover:bg-muted/50">
                      <span className="font-semibold text-card-foreground">
                        {item.q}
                      </span>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-muted-foreground transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="bg-primary py-24 lg:py-32">
            <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-3xl text-xl text-primary-foreground/80">
                {ctaDesc}
              </p>
              <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center rounded-xl bg-background px-8 py-4 text-lg font-bold text-primary shadow-xl transition-colors hover:bg-muted"
                >
                  {ctaPrimary}
                  <ArrowRight className="ml-2 size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center rounded-xl border-2 border-primary-foreground/30 px-8 py-4 text-lg font-bold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
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
                    className="mr-2"
                    aria-hidden="true"
                  >
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {ctaSecondary}
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/80">
                {ctaAssurances.map((a) => (
                  <span key={a} className="flex items-center gap-2">
                    <Check className="size-5" />
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
              <div className="col-span-2 lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark className="size-10" />
                  <span className="text-xl font-bold text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-xs text-background/60">
                  {footerAbout}
                </p>
                <div className="flex gap-4">
                  {socialIcons.map((social) => (
                    <button
                      key={social.label}
                      type="button"
                      aria-label={social.label}
                      onClick={() => go(social.label)}
                      className="grid size-10 place-items-center rounded-lg bg-background/10 text-background/70 transition-colors hover:bg-background/20 hover:text-background"
                    >
                      <svg
                        width="20"
                        height="20"
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
                  <h4 className="mb-4 font-semibold text-background">
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
