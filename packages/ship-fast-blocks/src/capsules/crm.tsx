import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * CrmKimiPage — a complete, self-contained CRM / sales-platform LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Pipeline Pro" design: a
 * clean, professional, light SaaS aesthetic with a neutral slate palette,
 * generous whitespace, soft rounded cards and crisp borders. It pairs a
 * split hero (live-status pill + bold headline + dual CTAs + an inline
 * Kanban "Sales Pipeline" mockup card with deal cards, stats bar and a
 * floating revenue-growth badge) with a logo trust-strip, a 6-up feature
 * grid, a 3-step onboarding flow, a 12-tile integrations grid, a 3-tier
 * pricing table (highlighted "Most Popular" plan), a 4-up KPI stats band,
 * a 6-up testimonial wall with star ratings and avatars, a 6-item FAQ
 * accordion, a dark conversion CTA band, and a 5-column footer.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy and colors
 * itself entirely with semantic theme tokens (no palette/hex). Every nav
 * item / CTA / link / form submit routes through `useNavigate` (never a
 * dead "#"), and the navbar labels match the `nav` array so PageSwitch can
 * swap pages. All content imagery uses the alt-driven <Image> component
 * (never a raw src). Callers supply ONLY content data; rich defaults make
 * it render great with no props at all.
 */
export const CrmKimiPage = defineCapsule({
  name: "CrmKimiPage",
  description:
    "Complete CRM / sales-pipeline SaaS LANDING page with a clean, professional, light aesthetic: neutral slate surfaces, soft rounded cards, crisp borders and lots of whitespace. Includes a split hero (live-status pill, bold headline, dual CTAs, no-credit-card note) featuring an inline visual Kanban SALES PIPELINE mockup with Lead/Contact/Proposal/Closed columns, deal cards with dollar values, a pipeline-value/win-rate/active-deals stats bar and a floating revenue-growth badge; a trusted-by logo strip; a 6-up feature grid (visual pipeline, activity tracking, AI forecasting, team collaboration, reporting, mobile) with icon tiles; a 3-step onboarding flow with images; a 12-tile integrations grid (Gmail, Slack, Stripe, Zapier, HubSpot, Zoom and more); a 3-tier pricing table (Starter/Professional/Enterprise) with a highlighted Most-Popular plan and feature checklists; a 4-up KPI stats band; a 6-card testimonial wall with 5-star ratings and customer avatars; a 6-item FAQ accordion; a dark conversion CTA band; and a 5-column footer with social icons. Use as the ROOT/home page for CRM products, sales-pipeline tools, sales-enablement or lead-management SaaS, deal-tracking and revenue-operations platforms when a polished, trustworthy, conversion-focused B2B SaaS marketing page with strong feature, pricing and social-proof coverage is wanted. Supply content only — brand, nav, hero, features, steps, integrations, pricing, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / product name shown in navbar, hero copy and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content, including the inline pipeline mockup card. */
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        note: z.string().optional(),
        /** Title shown in the mockup browser chrome. */
        mockupTitle: z.string().optional(),
        /** Kanban columns; each column has a label and deal cards. */
        columns: z
          .array(
            z.object({
              label: z.string(),
              deals: z
                .array(
                  z.object({
                    name: z.string(),
                    value: z.string(),
                    won: z.boolean().optional(),
                  }),
                )
                .optional(),
            }),
          )
          .optional(),
        /** Stats bar beneath the Kanban columns. */
        mockupStats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
        /** Floating badge over the mockup card. */
        badgeValue: z.string().optional(),
        badgeLabel: z.string().optional(),
      })
      .optional(),
    /** Trusted-by logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Feature grid. */
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** 3-step onboarding flow. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Integrations grid. */
    integrations: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ name: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Pricing table. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              description: z.string(),
              price: z.string(),
              unit: z.string(),
              features: z.array(z.string()),
              /** Features rendered as not-included (crossed out). */
              excluded: z.array(z.string()).optional(),
              cta: z.string(),
              featured: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** KPI stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Testimonial wall. */
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
    /** FAQ accordion. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark conversion CTA band. */
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
    const brand = props.brand ?? "Pipeline Pro"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Pricing", "Integrations", "Customers"]

    const heroBadge = props.hero?.badge ?? "Now with AI-powered forecasting"
    const heroHeading =
      props.hero?.heading ??
      "Close deals faster with a sales pipeline that actually works"
    const heroSub =
      props.hero?.subheading ??
      `${brand} gives your team a visual, intuitive way to track every opportunity from first contact to closed-won. Join 15,000+ sales teams who've transformed their process.`
    const heroPrimary = props.hero?.primaryCta ?? "Start 14-day free trial"
    const heroSecondary = props.hero?.secondaryCta ?? "Watch 2-min demo"
    const heroNote =
      props.hero?.note ?? "No credit card required. Setup takes 3 minutes."
    const mockupTitle = props.hero?.mockupTitle ?? "Sales Pipeline - Q2 2024"
    const columns = props.hero?.columns?.length
      ? props.hero.columns
      : [
          {
            label: "Lead",
            deals: [
              { name: "Acme Corp", value: "$24,000" },
              { name: "TechFlow", value: "$18,500" },
            ],
          },
          {
            label: "Contact",
            deals: [{ name: "StartupXYZ", value: "$45,000" }],
          },
          {
            label: "Proposal",
            deals: [
              { name: "GlobalTech", value: "$67,000" },
              { name: "Nexus Inc", value: "$32,000" },
            ],
          },
          {
            label: "Closed",
            deals: [{ name: "BrightCo", value: "$89,000", won: true }],
          },
        ]
    const mockupStats = props.hero?.mockupStats?.length
      ? props.hero.mockupStats
      : [
          { value: "$275,500", label: "Pipeline Value" },
          { value: "34%", label: "Win Rate" },
          { value: "6 active", label: "Deals" },
        ]
    const badgeValue = props.hero?.badgeValue ?? "+23% this month"
    const badgeLabel = props.hero?.badgeLabel ?? "Revenue growth"

    const logosHeading =
      props.logos?.heading ?? "Trusted by sales teams at leading companies"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Stripe", "Notion", "Vercel", "Slack", "Figma", "Mastercard"]

    const featuresHeading =
      props.features?.heading ?? "Everything your sales team needs"
    const featuresDesc =
      props.features?.description ??
      `From lead capture to deal closure, ${brand} provides a complete toolkit for modern sales operations.`
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Visual Pipeline",
            description:
              "Drag-and-drop Kanban boards customized to your sales process. See every deal's status at a glance with color-coded stages.",
          },
          {
            title: "Activity Tracking",
            description:
              "Log calls, emails, and meetings automatically. Never lose track of customer interactions with a complete activity timeline.",
          },
          {
            title: "AI Forecasting",
            description:
              "Predict revenue with machine learning based on historical data, deal velocity, and seasonal patterns. 94% accuracy rate.",
          },
          {
            title: "Team Collaboration",
            description:
              "Share contacts, assign leads, and collaborate on deals. @mentions, comments, and real-time notifications keep everyone aligned.",
          },
          {
            title: "Advanced Reporting",
            description:
              "Build custom dashboards with 50+ metrics. Track conversion rates, sales cycle length, and rep performance in real-time.",
          },
          {
            title: "Mobile App",
            description:
              "Update deals, check schedules, and log activities on the go. Native iOS and Android apps with offline mode support.",
          },
        ]

    const stepsHeading =
      props.steps?.heading ?? "Get started in minutes, not months"
    const stepsDesc =
      props.steps?.description ??
      "Our guided setup process helps you import data, configure your pipeline, and start closing deals quickly."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Import your data",
            description:
              "Connect your existing tools or upload a CSV. We automatically map fields and detect duplicates during import.",
            imageAlt:
              "computer screen showing data migration interface with progress bars",
          },
          {
            title: "Customize pipeline",
            description:
              "Define your stages, set probability weights, and create custom fields that match your unique sales process.",
            imageAlt:
              "digital kanban board showing workflow columns on tablet screen",
          },
          {
            title: "Close more deals",
            description:
              "Start tracking opportunities, automate follow-ups, and watch your conversion rates improve week over week.",
            imageAlt:
              "business professionals shaking hands in modern office meeting room",
          },
        ]

    const integrationsHeading =
      props.integrations?.heading ?? "Integrates with your entire stack"
    const integrationsDesc =
      props.integrations?.description ??
      "Connect 200+ tools to sync data, automate workflows, and eliminate manual data entry."
    const integrationItems = props.integrations?.items?.length
      ? props.integrations.items
      : [
          { name: "Gmail", label: "Email sync" },
          { name: "Slack", label: "Notifications" },
          { name: "Calendly", label: "Scheduling" },
          { name: "Stripe", label: "Payments" },
          { name: "Zapier", label: "Automation" },
          { name: "QuickBooks", label: "Accounting" },
          { name: "LinkedIn", label: "Prospecting" },
          { name: "Microsoft", label: "Office 365" },
          { name: "HubSpot", label: "Marketing" },
          { name: "Zoom", label: "Video calls" },
          { name: "Zendesk", label: "Support" },
          { name: "+190 more", label: "View all" },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "No hidden fees. Start free, upgrade when you're ready. Annual plans save 20%."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Starter",
            description: "For individuals and small teams getting started.",
            price: "$19",
            unit: "/user/month",
            features: [
              "Up to 1,000 contacts",
              "Visual pipeline",
              "Basic reporting",
              "Email integration",
            ],
            excluded: ["API access"],
            cta: "Start free trial",
          },
          {
            name: "Professional",
            description:
              "For growing teams that need automation and insights.",
            price: "$49",
            unit: "/user/month",
            features: [
              "Unlimited contacts",
              "Custom pipeline stages",
              "Workflow automation",
              "Advanced analytics",
              "API access + webhooks",
            ],
            cta: "Start free trial",
            featured: true,
          },
          {
            name: "Enterprise",
            description: "For large organizations with custom needs.",
            price: "$99",
            unit: "/user/month",
            features: [
              "Everything in Professional",
              "SSO & advanced security",
              "Dedicated account manager",
              "Custom integrations",
              "SLA guarantee",
            ],
            cta: "Contact sales",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "15,000+", label: "Active teams" },
          { value: "$2.4B", label: "Pipeline managed" },
          { value: "34%", label: "Avg. conversion lift" },
          { value: "4.9/5", label: "Customer rating" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by sales teams worldwide"
    const testimonialsDesc =
      props.testimonials?.description ??
      `See how companies are transforming their sales process with ${brand}.`
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Pipeline Pro transformed how our team operates. We went from chaotic spreadsheets to a streamlined process. Our close rate increased 28% in the first quarter alone.",
            name: "Marcus Chen",
            role: "VP of Sales, TechFlow Inc.",
            avatarAlt:
              "professional headshot of a smiling male executive in navy suit",
          },
          {
            quote:
              "The AI forecasting feature is a game-changer. I can now predict quarterly revenue with confidence and make data-driven decisions about hiring and resource allocation.",
            name: "Sarah Mitchell",
            role: "Sales Director, BrightPath Solutions",
            avatarAlt:
              "professional headshot of a confident female sales director with blonde hair",
          },
          {
            quote:
              "Setup took literally 10 minutes. The team was skeptical about switching CRMs, but after one week, everyone was asking why we didn't do this sooner.",
            name: "David Park",
            role: "CEO, StartupXYZ",
            avatarAlt:
              "professional headshot of a friendly male startup founder with glasses",
          },
          {
            quote:
              "We evaluated 8 different CRMs. Pipeline Pro had the cleanest interface, best mobile app, and most reasonable pricing. Six months in, we're still discovering new features we love.",
            name: "Jennifer Walsh",
            role: "Head of Revenue, GlobalTech",
            avatarAlt:
              "professional headshot of a businesswoman with curly brown hair and warm smile",
          },
          {
            quote:
              "The Slack integration alone saved us 5 hours a week. Notifications about deal updates happen instantly, and the team stays aligned without endless status meetings.",
            name: "Alex Rivera",
            role: "Sales Manager, Nexus Digital",
            avatarAlt:
              "professional headshot of a young male sales manager with short dark hair",
          },
          {
            quote:
              "Customer support is incredible. We had questions about custom workflows and got a detailed response within 2 hours with a video walkthrough. That's rare these days.",
            name: "Rachel Kim",
            role: "Operations Lead, CloudFirst",
            avatarAlt:
              "professional headshot of a female operations manager with red hair and friendly expression",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ?? `Everything you need to know about ${brand}.`
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How long does it take to get set up?",
            answer:
              "Most teams are up and running in under 30 minutes. Importing from another CRM typically takes 10-15 minutes depending on data size. Our onboarding wizard guides you through pipeline setup, team invites, and first deal creation. Enterprise customers get a dedicated onboarding specialist for white-glove setup.",
          },
          {
            question: "Can I import data from my existing CRM?",
            answer:
              "Absolutely. We support direct imports from Salesforce, HubSpot, Pipedrive, Zoho, and 20+ other platforms. You can also upload CSV/Excel files with our smart field mapping tool. We automatically detect duplicates and suggest merges during import. Your historical data, notes, and activities transfer seamlessly.",
          },
          {
            question: "Is there a limit on contacts or deals?",
            answer:
              "Starter plans include 1,000 contacts. Professional and Enterprise plans offer unlimited contacts, deals, and storage. We never throttle your usage or charge overage fees. If you're approaching your Starter plan limit, we'll notify you with upgrade options (and prorate any time remaining on your current plan).",
          },
          {
            question: "What integrations are available?",
            answer:
              "Pipeline Pro integrates with 200+ tools including Gmail, Outlook, Slack, Zoom, Stripe, QuickBooks, Zapier, and major marketing platforms. Our REST API and webhooks enable custom integrations. Enterprise customers get access to our Integration Partner Program for priority support on complex custom connections.",
          },
          {
            question: "Do you offer annual billing discounts?",
            answer:
              "Yes! Annual plans save you 20% compared to monthly billing. You can switch to annual billing anytime from your account settings. We also offer additional discounts for non-profits (25% off), educational institutions (40% off), and startups in their first year (30% off first 12 months).",
          },
          {
            question: "How secure is my data?",
            answer:
              "Security is our top priority. We use 256-bit SSL encryption, SOC 2 Type II certified infrastructure, and GDPR compliance. Data is stored in redundant data centers with daily backups. Enterprise plans include SSO (SAML 2.0), audit logs, and custom data retention policies. We never sell or share your data with third parties.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? "Ready to transform your sales process?"
    const ctaDesc =
      props.cta?.description ??
      `Join 15,000+ sales teams who've switched to ${brand}. Start your free trial today—no credit card required.`
    const ctaPrimary = props.cta?.primaryCta ?? "Start 14-day free trial"
    const ctaSecondary = props.cta?.secondaryCta ?? "Schedule a demo"
    const ctaNote =
      props.cta?.note ??
      "Free setup call included. Average onboarding time: 23 minutes."

    const footerDesc =
      props.footer?.description ??
      "The modern CRM for sales teams who want to close more deals with less effort. Visual, intuitive, and powerful."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: [
              "Features",
              "Pricing",
              "Integrations",
              "API Docs",
              "Changelog",
            ],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Press Kit", "Contact"],
          },
          {
            title: "Support",
            links: [
              "Help Center",
              "Community",
              "Webinars",
              "Status",
              "Security",
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]

    // Brand mark — bar-chart glyph (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
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
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
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

    const XIcon = ({ className }: { className?: string }) => (
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

    const Star = () => (
      <svg
        className="size-5 text-chart-4"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    )

    const featureIcons: ReactNode[] = [
      // visual pipeline (bar chart)
      <svg
        key="pipeline"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
      </svg>,
      // activity (clock)
      <svg
        key="activity"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // AI (bulb)
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
      // team (users)
      <svg
        key="team"
        className="size-6"
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
      // reporting (doc chart)
      <svg
        key="reporting"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>,
      // mobile (phone)
      <svg
        key="mobile"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>,
    ]

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

    const socialIcons: { label: string; path: string }[] = [
      {
        label: "Twitter",
        path: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z",
      },
      {
        label: "LinkedIn",
        path: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
      },
      {
        label: "GitHub",
        path: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z",
      },
    ]

    const columnAccents = [
      "bg-muted border-border",
      "bg-chart-1/10 border-chart-1/30",
      "bg-chart-4/10 border-chart-4/30",
      "bg-chart-2/10 border-chart-2/30",
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2"
            >
              <LogoMark className="size-8 text-primary" />
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
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Start Free Trial
              </button>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-muted/50">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="max-w-2xl">
                  <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-sm font-medium text-foreground/80">
                    <span className="size-2 animate-pulse rounded-full bg-chart-2" />
                    {heroBadge}
                  </span>
                  <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {heroHeading}
                  </h1>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    {heroSub}
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="rounded-lg bg-primary px-8 py-4 text-center font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="rounded-lg border border-border bg-background px-8 py-4 text-center font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">{heroNote}</p>
                </div>

                {/* Pipeline mockup card */}
                <div className="relative">
                  <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                    <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-3">
                      <div className="flex gap-1.5">
                        <div className="size-3 rounded-full bg-destructive/60" />
                        <div className="size-3 rounded-full bg-chart-4/70" />
                        <div className="size-3 rounded-full bg-chart-2/70" />
                      </div>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {mockupTitle}
                      </span>
                    </div>
                    <div className="space-y-4 p-6">
                      <div className="grid grid-cols-4 gap-3">
                        {columns.map((col, ci) => (
                          <div key={col.label} className="space-y-2">
                            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              {col.label}
                            </div>
                            {(col.deals ?? []).map((deal) => (
                              <div
                                key={deal.name}
                                className={cn(
                                  "rounded-lg border p-3",
                                  columnAccents[ci % columnAccents.length],
                                )}
                              >
                                <p className="text-sm font-medium text-card-foreground">
                                  {deal.name}
                                </p>
                                <p
                                  className={cn(
                                    "mt-1 text-xs",
                                    deal.won
                                      ? "font-medium text-chart-2"
                                      : "text-muted-foreground",
                                  )}
                                >
                                  {deal.value}
                                  {deal.won ? " ✓" : ""}
                                </p>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between border-t border-border pt-4">
                        <div className="flex items-center gap-6">
                          {mockupStats.map((s) => (
                            <div key={s.label}>
                              <p className="text-xs text-muted-foreground">
                                {s.label}
                              </p>
                              <p className="text-lg font-bold text-card-foreground">
                                {s.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Floating badge */}
                  <div className="absolute -bottom-4 -left-4 rounded-lg border border-border bg-card p-3 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-full bg-chart-2/15 text-chart-2">
                        <svg
                          className="size-5"
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
                        <p className="text-sm font-semibold text-card-foreground">
                          {badgeValue}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {badgeLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-b border-border bg-background py-12">
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
                    className="flex items-center justify-center text-lg font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-background py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-border hover:shadow-lg"
                  >
                    <div className="mb-4 grid size-12 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-card-foreground">
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
          <section className="bg-muted/50 py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                      {i + 1}
                    </div>
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                      <h3 className="mb-3 text-center text-xl font-semibold text-card-foreground">
                        {step.title}
                      </h3>
                      <p className="mb-4 text-center leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                      <Image
                        alt={step.imageAlt}
                        w={400}
                        h={200}
                        loading="lazy"
                        className="h-40 w-full rounded-lg object-cover"
                      />
                    </div>
                    {i < stepItems.length - 1 ? (
                      <div className="absolute left-full top-8 hidden h-0.5 w-12 -translate-x-6 bg-border md:block" />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Integrations */}
          <section className="bg-background py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {integrationsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {integrationsDesc}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-6">
                {integrationItems.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => go(item.name)}
                    className="flex flex-col items-center rounded-lg border border-border bg-card p-6 text-center transition-all hover:shadow-md"
                  >
                    <div className="mb-3 grid size-12 place-items-center rounded-lg bg-primary/10 text-primary">
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
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                      </svg>
                    </div>
                    <span className="font-medium text-card-foreground">
                      {item.name}
                    </span>
                    <span className="mt-1 text-xs text-muted-foreground">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted/50 py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative rounded-xl p-8 shadow-sm",
                      plan.featured
                        ? "border border-primary bg-primary text-primary-foreground shadow-xl"
                        : "border border-border bg-card",
                    )}
                  >
                    {plan.featured ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-background px-3 py-1 text-xs font-bold uppercase tracking-wide text-foreground">
                          Most Popular
                        </span>
                      </div>
                    ) : null}
                    <h3
                      className={cn(
                        "mb-2 text-xl font-semibold",
                        plan.featured
                          ? "text-primary-foreground"
                          : "text-card-foreground",
                      )}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={cn(
                        "mb-6",
                        plan.featured
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground",
                      )}
                    >
                      {plan.description}
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
                      <span
                        className={cn(
                          plan.featured
                            ? "text-primary-foreground/60"
                            : "text-muted-foreground",
                        )}
                      >
                        {plan.unit}
                      </span>
                    </div>
                    <ul className="mb-8 space-y-4">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-3">
                          <Check
                            className={cn(
                              "mt-0.5 size-5 shrink-0",
                              plan.featured
                                ? "text-primary-foreground/80"
                                : "text-chart-2",
                            )}
                          />
                          <span
                            className={cn(
                              plan.featured
                                ? "text-primary-foreground/90"
                                : "text-foreground/80",
                            )}
                          >
                            {feat}
                          </span>
                        </li>
                      ))}
                      {(plan.excluded ?? []).map((feat) => (
                        <li key={feat} className="flex items-start gap-3">
                          <XIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground/50" />
                          <span className="text-muted-foreground/60">
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "w-full rounded-lg py-3 font-semibold transition-colors",
                        plan.featured
                          ? "bg-background text-foreground hover:bg-muted"
                          : "border border-border text-foreground hover:bg-muted",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="border-y border-border bg-background py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="mb-2 text-4xl font-bold text-foreground sm:text-5xl">
                      {s.value}
                    </p>
                    <p className="text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-background py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-xl border border-border bg-muted/50 p-8"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">
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
          <section className="bg-muted/50 py-20 lg:py-32">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-lg border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer select-none items-center justify-between p-6">
                      <span className="font-semibold text-card-foreground">
                        {item.question}
                      </span>
                      <ChevronDown />
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA band */}
          <section className="bg-primary py-20 lg:py-32">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-xl text-primary-foreground/70">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="rounded-lg bg-background px-8 py-4 text-center font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="rounded-lg border border-primary-foreground/40 px-8 py-4 text-center font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-6 text-sm text-primary-foreground/60">{ctaNote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-background py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <div className="mb-4 flex items-center gap-2">
                  <LogoMark className="size-8 text-primary" />
                  <span className="text-xl font-semibold text-foreground">
                    {brand}
                  </span>
                </div>
                <p className="mb-6 max-w-sm text-muted-foreground">
                  {footerDesc}
                </p>
                <div className="flex items-center gap-4">
                  {socialIcons.map((social) => (
                    <button
                      key={social.label}
                      type="button"
                      aria-label={social.label}
                      onClick={() => go(social.label)}
                      className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <svg
                        className="size-5"
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
                  <h4 className="mb-4 font-semibold text-foreground">
                    {col.title}
                  </h4>
                  <ul className="space-y-3">
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
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
              <p className="text-sm text-muted-foreground">{footerCopyright}</p>
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
      </div>
    )
  },
})
