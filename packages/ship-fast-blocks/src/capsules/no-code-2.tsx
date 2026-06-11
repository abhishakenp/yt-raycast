import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * NoCodeKimiPage2 — a complete, self-contained no-code / drag-and-drop VISUAL
 * app-builder SaaS LANDING page ("BuildFlow").
 *
 * A faithful Tailwind v4 port of a second, visually DISTINCT Kimi design — the bold,
 * gradient-forward sibling to NoCodeKimiPage. Where the first sibling is calm, neutral
 * and inverse-banded, this variant leans into a vibrant brand gradient (primary → accent),
 * soft blurred glow orbs behind the hero, a gradient clip-text headline, a floating
 * animated "Product Card" inside the editor mockup, a horizontal 4-step numbered flow with
 * connector lines, gradient-tinted template thumbnails with usage counts + "Preview" links,
 * a saturated full-bleed brand STATS band, and a glowing gradient closing CTA. Use this when
 * a no-code / website-builder / app-builder product wants a punchier, more colorful landing
 * page than the understated NoCodeKimiPage.
 *
 * The block owns ALL layout, spacing, depth, and type hierarchy. The base surface is light;
 * brand color comes through tokens (primary/accent/chart-*) and token gradients. Every nav
 * item / CTA / link / form submit routes through `useNavigate` (never a dead "#"), and
 * navbar labels match the `nav` array so PageSwitch can swap pages. All content imagery uses
 * the alt-driven <Image> component (never a raw src). Callers supply ONLY content data; rich
 * defaults make it render great with no props at all.
 */
export const NoCodeKimiPage2 = defineCapsule({
  name: "NoCodeKimiPage2",
  description:
    "Bold, gradient-forward no-code / low-code drag-and-drop VISUAL app & website BUILDER SaaS landing page ('BuildFlow') — the punchier, more colorful sibling and visual alternative to NoCodeKimiPage. Light canvas with a vibrant brand gradient (primary→accent), blurred glow orbs behind a two-column hero, a gradient clip-text 'Build apps without code' headline, dual CTAs, no-credit-card trust microcopy, and a faux visual-EDITOR mockup (browser chrome with traffic-light dots, draggable Components rail with a selected Card, gridded canvas with a floating animated Product Card and a + action button). Includes a trusted-by logo strip (Stripe, Notion, Figma, Webflow, Zapier, Airtable), a 6-up feature grid (visual canvas, AI components, clean code export, built-in auth, database + CMS, one-click deploy) with color-rotating icon tiles, a horizontal 4-step how-it-works flow with numbered tiles and connector lines, a filterable TEMPLATE gallery of gradient-tinted thumbnails with category tags, usage counts and Preview links, a 3-tier pricing table (Starter free / Pro highlighted / Enterprise) with check lists, a saturated full-bleed brand STATS band (apps created, active builders, templates, uptime), a 3-column star-rated testimonials grid with avatars, an accordion FAQ, a glowing gradient closing CTA band, and a dark multi-column footer with social icons. Use as the ROOT/home page for no-code / website-builder / app-builder / page-builder / SaaS platform products, drag-and-drop site creators, or any 'build without code' startup wanting a colorful, conversion-focused product landing page. Supply content only — brand, nav, hero, logos, features, steps, templates, pricing, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / product name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingTop: z.string().optional(),
        /** Gradient clip-text continuation of the headline. */
        headingAccent: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        /** Short trust microcopy chips under the CTAs. */
        trust: z.array(z.string()).optional(),
        /** URL-style label shown in the editor mockup's title bar. */
        editorLabel: z.string().optional(),
      })
      .optional(),
    /** Trusted-by logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        names: z.array(z.string()).optional(),
      })
      .optional(),
    /** Feature grid. */
    features: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** How-it-works steps (horizontal numbered flow). */
    steps: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Template gallery. */
    templates: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        filters: z.array(z.string()).optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              tag: z.string(),
              description: z.string(),
              uses: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Pricing table. */
    pricing: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              period: z.string().optional(),
              cta: z.string(),
              features: z.array(z.string()),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Saturated brand stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Testimonials grid. */
    testimonials: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
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
    /** FAQ accordion. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      })
      .optional(),
    /** Closing gradient CTA band. */
    cta: z
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
        description: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "BuildFlow"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Templates", "Pricing", "Stories", "FAQ"]

    const heroBadge = props.hero?.badge ?? "Now with AI-powered components"
    const headingTop = props.hero?.headingTop ?? "Build apps"
    const headingAccent = props.hero?.headingAccent ?? "without code"
    const heroSub =
      props.hero?.subheading ??
      "The visual app builder that turns your ideas into production-ready applications. Drag, drop, and deploy in minutes—not months."
    const heroPrimary = props.hero?.primaryCta ?? "Start Building Free"
    const heroSecondary = props.hero?.secondaryCta ?? "Watch Demo"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["No credit card", "Free forever plan", "14-day Pro trial"]
    const editorLabel = props.hero?.editorLabel ?? "buildflow.app/editor"

    const logosLabel = props.logos?.label ?? "Trusted by teams at"
    const logoNames = props.logos?.names?.length
      ? props.logos.names
      : ["Stripe", "Notion", "Figma", "Webflow", "Zapier", "Airtable"]

    const featuresEyebrow = props.features?.eyebrow ?? "Features"
    const featuresHeading =
      props.features?.heading ?? "Everything you need to build"
    const featuresDesc =
      props.features?.description ??
      "From idea to launch, BuildFlow gives you the tools to create professional applications without touching a line of code."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Visual Canvas",
            description:
              "Drag and drop components onto a responsive canvas. Arrange, resize, and style with pixel-perfect precision.",
          },
          {
            title: "AI Components",
            description:
              "Generate entire sections with AI. Describe what you need and watch as BuildFlow creates production-ready components.",
          },
          {
            title: "Clean Code Export",
            description:
              "Export to React, Vue, or vanilla HTML/CSS. Your apps compile to clean, maintainable code with zero bloat.",
          },
          {
            title: "Built-in Auth",
            description:
              "Add user authentication in one click. Support for email, social logins, SSO, and enterprise identity providers.",
          },
          {
            title: "Database + CMS",
            description:
              "Built-in database with visual schema builder. Create collections, define relationships, and manage content without SQL.",
          },
          {
            title: "One-Click Deploy",
            description:
              "Deploy to global CDN in seconds. Custom domains, SSL certificates, and automatic scaling included.",
          },
        ]

    const stepsEyebrow = props.steps?.eyebrow ?? "How It Works"
    const stepsHeading =
      props.steps?.heading ?? "From idea to live in 4 steps"
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Choose Template",
            description:
              "Start with 200+ professional templates or a blank canvas. Every template is fully customizable.",
          },
          {
            title: "Visual Design",
            description:
              "Drag components, adjust styles, and see changes instantly. Our visual editor feels like design tools you already know.",
          },
          {
            title: "Connect Data",
            description:
              "Add databases, APIs, and integrations. Build dynamic apps with real data without writing backend code.",
          },
          {
            title: "Deploy Live",
            description:
              "Hit publish and your app goes live on our global CDN. Updates deploy instantly with every change.",
          },
        ]

    const templatesEyebrow = props.templates?.eyebrow ?? "Template Gallery"
    const templatesHeading =
      props.templates?.heading ?? "Start with a head start"
    const templatesDesc =
      props.templates?.description ??
      "Professional templates for every use case. Each one is fully customizable and ready to make your own."
    const templateFilters = props.templates?.filters?.length
      ? props.templates.filters
      : ["All", "SaaS", "E-commerce", "Portfolio", "Dashboard"]
    const templatesViewAll =
      props.templates?.viewAll ?? "Browse All 200+ Templates"
    const templateItems = props.templates?.items?.length
      ? props.templates.items
      : [
          {
            title: "Analytics Dashboard",
            tag: "SaaS",
            description: "Complete SaaS dashboard with charts and metrics",
            uses: "2,847 uses",
            imageAlt:
              "SaaS analytics dashboard template with charts and metrics interface",
          },
          {
            title: "Modern Shop",
            tag: "E-commerce",
            description: "Full-featured storefront with cart and checkout",
            uses: "4,192 uses",
            imageAlt:
              "E-commerce product page template with shopping cart interface",
          },
          {
            title: "Creative Portfolio",
            tag: "Portfolio",
            description: "Stunning showcase for photographers and designers",
            uses: "3,105 uses",
            imageAlt: "Creative portfolio template with photography grid layout",
          },
          {
            title: "Conversion Landing",
            tag: "Marketing",
            description: "High-converting page with forms and CTAs",
            uses: "5,673 uses",
            imageAlt: "Marketing landing page template with lead capture form",
          },
          {
            title: "Restaurant & Menu",
            tag: "Restaurant",
            description: "Elegant dining site with reservations",
            uses: "1,892 uses",
            imageAlt:
              "Restaurant website template with menu and reservation system",
          },
          {
            title: "Startup Launch",
            tag: "SaaS",
            description: "Modern startup page with pricing and features",
            uses: "6,234 uses",
            imageAlt:
              "SaaS startup landing page template with feature highlights",
          },
        ]

    const pricingEyebrow = props.pricing?.eyebrow ?? "Pricing"
    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start free and scale as you grow. No hidden fees, no surprises."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Starter",
            tagline: "For personal projects",
            price: "$0",
            period: "/month",
            cta: "Get Started Free",
            features: [
              "3 projects",
              "100 components",
              "Community support",
              "BuildFlow subdomain",
            ],
          },
          {
            name: "Pro",
            tagline: "For serious builders",
            price: "$29",
            period: "/month",
            cta: "Start 14-Day Trial",
            featured: true,
            badge: "Most Popular",
            features: [
              "Unlimited projects",
              "All 500+ components",
              "Priority support",
              "Custom domain",
              "AI component generation",
              "Code export",
            ],
          },
          {
            name: "Enterprise",
            tagline: "For teams and organizations",
            price: "$99",
            period: "/month",
            cta: "Contact Sales",
            features: [
              "Everything in Pro",
              "Team collaboration",
              "SSO & advanced security",
              "Dedicated support",
              "Custom integrations",
            ],
          },
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "2M+", label: "Apps Created" },
          { value: "500K+", label: "Active Builders" },
          { value: "200+", label: "Templates" },
          { value: "99.9%", label: "Uptime SLA" },
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Testimonials"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by builders worldwide"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "BuildFlow completely changed how we launch products. What used to take our dev team 3 weeks now happens in a day. We've shipped 12 apps in 6 months.",
            name: "Sarah Chen",
            role: "Product Lead, Vercel",
            avatarAlt:
              "Professional headshot of Sarah Chen, a product manager with short dark hair",
          },
          {
            quote:
              "As a designer, I always felt blocked by needing developers. BuildFlow let me turn my Figma designs into real apps. I built my entire portfolio and a client dashboard solo.",
            name: "Marcus Johnson",
            role: "Independent Designer",
            avatarAlt:
              "Professional headshot of Marcus Johnson, a UX designer with glasses and beard",
          },
          {
            quote:
              "We replaced 6 different tools with BuildFlow. Our marketing team now builds their own landing pages, freeing up engineering for core product work. ROI was immediate.",
            name: "David Park",
            role: "CTO, Linear",
            avatarAlt:
              "Professional headshot of David Park, a startup CTO wearing a casual button-down shirt",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Common questions"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "Can I export my app's code?",
            a: "Yes! Pro and Enterprise plans include code export to React, Vue, Svelte, or vanilla HTML/CSS. The exported code is clean, well-structured, and ready for further development or handoff to engineering teams.",
          },
          {
            q: "Do I need coding knowledge to use BuildFlow?",
            a: "Not at all. BuildFlow is designed for users with zero coding experience. Everything is visual—drag, drop, and configure through intuitive panels. However, developers can also extend apps with custom code when needed.",
          },
          {
            q: "Can I connect external APIs and databases?",
            a: "Absolutely. BuildFlow connects to any REST or GraphQL API, PostgreSQL, MySQL, MongoDB, Airtable, Notion, Google Sheets, and 100+ integrations via Zapier. You can also use our built-in database for simple data needs.",
          },
          {
            q: "What happens to my apps if I cancel?",
            a: "Your apps remain live even on the free plan, though with BuildFlow branding. If you export code before canceling Pro, you keep full ownership of that code. We believe in no lock-in—you own what you build.",
          },
          {
            q: "Is there a limit on traffic or storage?",
            a: "Starter includes 1GB storage and 10K monthly visits. Pro increases to 10GB and 100K visits. Enterprise offers unlimited storage and traffic with dedicated resources. All plans include global CDN and SSL.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to start building?"
    const ctaDesc =
      props.cta?.description ??
      "Join 500,000+ creators who've shipped apps without writing code. Start free today—no credit card required."
    const ctaPrimary = props.cta?.primaryCta ?? "Get Started Free"
    const ctaSecondary = props.cta?.secondaryCta ?? "Watch 2-Min Demo"
    const ctaNote =
      props.cta?.note ??
      "Free forever plan • No credit card required • Cancel anytime"

    const footerDesc =
      props.footer?.description ??
      "The visual app builder for everyone. Turn ideas into production-ready applications without writing code."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Templates", "Pricing", "Changelog", "Roadmap"],
          },
          {
            title: "Resources",
            links: [
              "Documentation",
              "Tutorials",
              "Blog",
              "Community",
              "Support",
            ],
          },
          {
            title: "Company",
            links: ["About", "Careers", "Press", "Partners", "Contact"],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Policy"]

    // Brand mark — gradient-filled cube glyph tile (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </span>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className={className}
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    )

    const PlayIcon = ({ className }: { className?: string }) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className={className}
      >
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
      </svg>
    )

    const Star = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className="text-chart-4"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    // Feature icon tiles rotate through token surfaces (source used 6 palette hues).
    const featureIconTints = [
      "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
      "bg-accent text-accent-foreground group-hover:bg-accent/80",
      "bg-chart-2/15 text-chart-2 group-hover:bg-chart-2 group-hover:text-background",
      "bg-chart-1/15 text-chart-1 group-hover:bg-chart-1 group-hover:text-background",
      "bg-chart-4/15 text-chart-4 group-hover:bg-chart-4 group-hover:text-background",
      "bg-chart-5/15 text-chart-5 group-hover:bg-chart-5 group-hover:text-background",
    ]
    // Template thumbnail gradient overlays rotate through token gradients.
    const templateGradients = [
      "from-chart-1 to-primary",
      "from-accent to-chart-5",
      "from-chart-5 to-destructive",
      "from-chart-2 to-chart-1",
      "from-chart-4 to-destructive",
      "from-primary to-chart-1",
    ]

    const featureIcons: ReactNode[] = [
      // visual canvas / grid
      <svg
        key="canvas"
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
        <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>,
      // AI / bolt
      <svg
        key="ai"
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
      // code export
      <svg
        key="code"
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
        <path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>,
      // auth / lock
      <svg
        key="auth"
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
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>,
      // database
      <svg
        key="db"
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
        <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>,
      // deploy / globe
      <svg
        key="deploy"
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
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
          <nav
            className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8"
            aria-label="Main navigation"
          >
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2"
            >
              <LogoMark className="size-10" />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-xl font-bold text-transparent">
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
                onClick={() => go("Sign In")}
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => go(heroPrimary)}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
              >
                Start Free
              </button>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section
            className="relative overflow-hidden pb-20 pt-20 lg:pb-32 lg:pt-28"
            aria-labelledby="nc2-hero"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
            <div className="absolute left-10 top-20 size-72 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute bottom-20 right-10 size-96 rounded-full bg-accent/20 blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    {heroBadge}
                  </div>
                  <h1
                    id="nc2-hero"
                    className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl"
                  >
                    {headingTop}{" "}
                    <span className="block bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                      {headingAccent}
                    </span>
                  </h1>
                  <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0 sm:text-xl">
                    {heroSub}
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="rounded-xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-border bg-card px-8 py-4 text-lg font-bold text-foreground transition-all hover:border-border/70 hover:bg-accent"
                    >
                      <PlayIcon className="size-5" />
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
                    {heroTrust.map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <Check className="size-5 text-chart-2" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Editor mockup (decorative product UI) */}
                <div className="relative" aria-hidden="true">
                  <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-primary to-accent opacity-30 blur-2xl" />
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                    <div className="flex items-center gap-2 bg-foreground px-4 py-3">
                      <div className="flex gap-1.5">
                        <div className="size-3 rounded-full bg-destructive" />
                        <div className="size-3 rounded-full bg-chart-4" />
                        <div className="size-3 rounded-full bg-chart-2" />
                      </div>
                      <div className="flex-1 text-center font-mono text-xs text-background/60">
                        {editorLabel}
                      </div>
                    </div>
                    <div className="grid h-80 grid-cols-12 lg:h-96">
                      <div className="col-span-4 space-y-2 border-r border-border bg-muted/50 p-3 sm:col-span-3">
                        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Components
                        </div>
                        {[
                          { label: "Header", letter: "H" },
                          { label: "Button", letter: "B" },
                          { label: "Form", letter: "F" },
                          { label: "Image", letter: "I" },
                        ].map((c, i) => (
                          <div
                            key={c.label}
                            className="flex items-center gap-2 rounded-lg border border-border bg-card p-2 shadow-sm"
                          >
                            <div
                              className={cn(
                                "grid size-8 place-items-center rounded text-xs font-semibold",
                                [
                                  "bg-chart-1/15 text-chart-1",
                                  "bg-chart-2/15 text-chart-2",
                                  "bg-chart-5/15 text-chart-5",
                                  "bg-chart-4/15 text-chart-4",
                                ][i],
                              )}
                            >
                              {c.letter}
                            </div>
                            <span className="text-sm font-medium text-card-foreground">
                              {c.label}
                            </span>
                          </div>
                        ))}
                        <div className="flex items-center gap-2 rounded-lg border-2 border-primary bg-primary/10 p-2 shadow-sm">
                          <div className="grid size-8 place-items-center rounded bg-primary text-xs font-semibold text-primary-foreground">
                            C
                          </div>
                          <span className="text-sm font-medium text-primary">
                            Card
                          </span>
                        </div>
                      </div>
                      <div className="relative col-span-8 bg-card p-4 sm:col-span-9">
                        <div className="absolute left-1/2 top-1/2 w-56 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-xl border-2 border-primary bg-card p-4 shadow-xl">
                          <div className="mb-3 grid h-28 place-items-center rounded-lg bg-gradient-to-br from-primary/15 to-primary/5">
                            <svg
                              width="44"
                              height="44"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-primary/60"
                            >
                              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <h3 className="mb-1 font-bold text-card-foreground">
                            Product Card
                          </h3>
                          <p className="mb-3 text-sm text-muted-foreground">
                            Beautiful component ready to customize
                          </p>
                          <span className="block rounded-lg bg-primary py-2 text-center text-sm font-medium text-primary-foreground">
                            Add to Cart
                          </span>
                        </div>
                        <div className="absolute bottom-4 right-4 grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg">
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
                            <path d="M12 4v16m8-8H4" />
                          </svg>
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
            className="border-y border-border bg-muted/40 py-12"
            aria-label="Trusted by companies"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-70 md:grid-cols-3 lg:grid-cols-6">
                {logoNames.map((name) => (
                  <div
                    key={name}
                    className="flex items-center justify-center text-xl font-bold text-muted-foreground"
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section
            className="bg-background py-24 lg:py-32"
            aria-labelledby="nc2-features"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                  {featuresEyebrow}
                </span>
                <h2
                  id="nc2-features"
                  className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                >
                  {featuresHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {featuresDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
                  >
                    <div
                      className={cn(
                        "mb-6 grid size-14 place-items-center rounded-xl transition-colors",
                        featureIconTints[i % featureIconTints.length],
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
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section
            className="bg-gradient-to-b from-muted/40 to-background py-24 lg:py-32"
            aria-labelledby="nc2-steps"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                  {stepsEyebrow}
                </span>
                <h2
                  id="nc2-steps"
                  className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                >
                  {stepsHeading}
                </h2>
              </div>
              <div className="grid gap-8 lg:grid-cols-4">
                {stepItems.map((step, i) => {
                  const last = i === stepItems.length - 1
                  return (
                    <div key={step.title} className="relative">
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={cn(
                            "mb-6 grid size-16 place-items-center rounded-2xl text-2xl font-bold shadow-lg",
                            last
                              ? "bg-accent text-accent-foreground shadow-accent/30"
                              : "bg-primary text-primary-foreground shadow-primary/30",
                          )}
                        >
                          {i + 1}
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-foreground">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                      {!last && (
                        <div
                          aria-hidden="true"
                          className="absolute left-full top-8 hidden h-0.5 w-full bg-gradient-to-r from-primary/40 to-transparent lg:block"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Template gallery */}
          <section
            className="bg-background py-24 lg:py-32"
            aria-labelledby="nc2-templates"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                    {templatesEyebrow}
                  </span>
                  <h2
                    id="nc2-templates"
                    className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                  >
                    {templatesHeading}
                  </h2>
                  <p className="mt-4 text-lg text-muted-foreground">
                    {templatesDesc}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {templateFilters.map((f, i) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => go(f)}
                      className={cn(
                        "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                        i === 0
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {templateItems.map((tpl, i) => (
                  <div
                    key={tpl.title}
                    className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div
                      className={cn(
                        "relative aspect-[4/3] overflow-hidden bg-gradient-to-br",
                        templateGradients[i % templateGradients.length],
                      )}
                    >
                      <Image
                        alt={tpl.imageAlt}
                        w={600}
                        h={450}
                        loading="lazy"
                        className="size-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
                      <div className="absolute inset-x-4 bottom-4">
                        <span className="inline-block rounded bg-background/20 px-2 py-1 text-xs font-medium text-background backdrop-blur-sm">
                          {tpl.tag}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="mb-1 font-bold text-card-foreground">
                        {tpl.title}
                      </h3>
                      <p className="mb-4 text-sm text-muted-foreground">
                        {tpl.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground/70">
                          {tpl.uses}
                        </span>
                        <button
                          type="button"
                          onClick={() => go(tpl.title)}
                          className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                        >
                          Preview →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(templatesViewAll)}
                  className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 font-semibold text-background transition-all hover:bg-foreground/90 hover:shadow-lg"
                >
                  <span>{templatesViewAll}</span>
                  <ArrowRight className="size-5" />
                </button>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section
            className="bg-muted/40 py-24 lg:py-32"
            aria-labelledby="nc2-pricing"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                  {pricingEyebrow}
                </span>
                <h2
                  id="nc2-pricing"
                  className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                >
                  {pricingHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {pricingDesc}
                </p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
                {pricingPlans.map((plan) => {
                  const featured = plan.featured ?? false
                  return (
                    <div
                      key={plan.name}
                      className={cn(
                        "relative rounded-2xl bg-card p-8",
                        featured
                          ? "border-2 border-primary shadow-xl shadow-primary/10 lg:scale-105"
                          : "border border-border shadow-sm",
                      )}
                    >
                      {plan.badge && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <span className="rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                            {plan.badge}
                          </span>
                        </div>
                      )}
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-card-foreground">
                          {plan.name}
                        </h3>
                        <p className="mt-1 text-muted-foreground">
                          {plan.tagline}
                        </p>
                      </div>
                      <div className="mb-6">
                        <span className="text-4xl font-extrabold text-card-foreground">
                          {plan.price}
                        </span>
                        {plan.period && (
                          <span className="text-muted-foreground">
                            {plan.period}
                          </span>
                        )}
                      </div>
                      <ul className="mb-8 space-y-4" role="list">
                        {plan.features.map((feat) => (
                          <li key={feat} className="flex items-start gap-3">
                            <Check
                              className={cn(
                                "mt-0.5 size-5 shrink-0",
                                featured ? "text-primary" : "text-chart-2",
                              )}
                            />
                            <span className="text-muted-foreground">
                              {feat}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => go(plan.cta)}
                        className={cn(
                          "w-full rounded-xl px-4 py-3 font-semibold transition-all",
                          featured
                            ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
                            : plan.name === "Enterprise"
                              ? "bg-foreground text-background hover:bg-foreground/90"
                              : "bg-muted text-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        {plan.cta}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Stats (saturated brand band) */}
          <section
            className="bg-primary py-20 text-primary-foreground"
            aria-label="Company statistics"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
                {statItems.map((s) => (
                  <div key={s.label}>
                    <div className="mb-2 text-4xl font-extrabold sm:text-5xl">
                      {s.value}
                    </div>
                    <div className="font-medium text-primary-foreground/70">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            className="bg-background py-24 lg:py-32"
            aria-labelledby="nc2-testimonials"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                  {testimonialsEyebrow}
                </span>
                <h2
                  id="nc2-testimonials"
                  className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                >
                  {testimonialsHeading}
                </h2>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl border border-border bg-card p-8 shadow-sm"
                  >
                    <div className="mb-4 flex gap-1" aria-label="5 star rating">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-card-foreground">
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
                        <div className="font-bold text-card-foreground">
                          {t.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t.role}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section
            className="bg-muted/40 py-24 lg:py-32"
            aria-labelledby="nc2-faq"
          >
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                  {faqEyebrow}
                </span>
                <h2
                  id="nc2-faq"
                  className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                >
                  {faqHeading}
                </h2>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6 transition-colors hover:bg-accent/50">
                      <span className="font-semibold text-card-foreground">
                        {item.q}
                      </span>
                      <span className="ml-6 shrink-0">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="text-muted-foreground transition-transform group-open:rotate-180"
                        >
                          <path d="M19 9l-7 7-7-7" />
                        </svg>
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

          {/* Closing CTA (gradient band) */}
          <section
            className="relative overflow-hidden py-24 lg:py-32"
            aria-labelledby="nc2-cta"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
            <div className="absolute -left-24 -top-24 size-96 rounded-full bg-primary-foreground/10 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 size-96 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2
                id="nc2-cta"
                className="mb-6 text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl"
              >
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-foreground/80 sm:text-xl">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="rounded-xl bg-background px-8 py-4 text-lg font-bold text-primary transition-all hover:-translate-y-0.5 hover:bg-background/90 hover:shadow-xl"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-foreground/40 bg-primary-foreground/10 px-8 py-4 text-lg font-bold text-primary-foreground backdrop-blur-sm transition-all hover:bg-primary-foreground/20"
                >
                  <PlayIcon className="size-5" />
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-8 text-sm text-primary-foreground/70">
                {ctaNote}
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer
          className="bg-foreground py-16 text-background/80"
          role="contentinfo"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
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
                <p className="mb-6 max-w-sm text-background/60">{footerDesc}</p>
                <div className="flex gap-4">
                  {(["Twitter", "GitHub", "LinkedIn"] as const).map(
                    (social) => (
                      <button
                        key={social}
                        type="button"
                        aria-label={social}
                        onClick={() => go(social)}
                        className="grid size-10 place-items-center rounded-lg bg-background/10 text-background transition-colors hover:bg-background/20"
                      >
                        <span className="text-xs font-semibold">
                          {social.charAt(0)}
                        </span>
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
                  <ul className="space-y-3">
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
            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 sm:flex-row">
              <p className="text-sm text-background/50">{footerCopyright}</p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-background/50 transition-colors hover:text-background/80"
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
