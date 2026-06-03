import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * CrmKimiPage2 — a complete, self-contained CRM / sales-pipeline LANDING page.
 *
 * VARIANT 2 (a visually distinct sibling to CrmKimiPage). A faithful Tailwind
 * v4 port of a Kimi-generated "PipelinePro" design with a WARM, energetic,
 * gradient-driven aesthetic (red→orange primary/chart-4 brand, gradient
 * headline text, glow-blurred mockups) rather than the cool neutral-slate look
 * of CrmKimiPage. It pairs a split hero (pulsing live-status pill + bold
 * gradient headline + dual CTAs + trust checks) featuring a browser-chrome
 * dashboard screenshot card with a floating "Deal Progress" widget; a
 * trusted-by logo strip; a 6-up feature grid with multi-color icon tiles; a
 * DARK visual-pipeline showcase split (a Q3 "Sales Pipeline" panel showing
 * stacked, color-coded Prospecting/Discovery/Proposal/Closed-Won stage rows
 * with named deal cards + dollar values, beside a benefits checklist); a
 * 10-tile integrations grid with letter badges; a 3-card testimonial wall with
 * star ratings + avatars and a 4-up KPI stats band; a 3-tier pricing table
 * (highlighted "Most Popular" plan, one crossed-out feature); a 6-card FAQ
 * grid; a bold GRADIENT conversion CTA band with an email-capture form and
 * SOC 2 / GDPR / 256-bit compliance badges; and a dark 5-column footer.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy and colors
 * itself entirely with semantic theme tokens (no palette/hex). Every nav item
 * / CTA / link / form submit routes through `useNavigate` (never a dead "#"),
 * and the navbar labels match the `nav` array so PageSwitch can swap pages.
 * All content imagery uses the alt-driven <Image> component (never a raw src).
 * Callers supply ONLY content data; rich defaults make it render great with
 * no props at all.
 */
export const CrmKimiPage2 = defineComponent({
  name: "CrmKimiPage2",
  description:
    "Alternative / SECOND-style CRM / sales-pipeline SaaS LANDING page — a visually distinct sibling to CrmKimiPage with a WARM, energetic, gradient-driven aesthetic (red→orange primary brand, gradient headline text, glow-blurred mockups, light surfaces) instead of a cool neutral-slate look. Includes a split hero (pulsing AI-lead-scoring status pill, gradient 'Close deals 2x faster' headline, dual CTAs, no-credit-card / cancel-anytime / free-onboarding trust checks) featuring a browser-chrome dashboard SCREENSHOT card with a floating Deal-Progress widget; a trusted-by logo strip (Stripe, Notion, Figma, Salesforce, HubSpot, Zapier); a 6-up feature grid (visual pipeline management, AI lead scoring, smart email sequences, real-time analytics, activity tracking, team collaboration) with multi-color icon tiles; a DARK visual-pipeline SHOWCASE split panel rendering a Q3 Sales Pipeline with stacked, color-coded Prospecting / Discovery / Proposal / Closed-Won stage ROWS holding named deal cards with dollar values, beside a customizable-stages / multiple-pipelines / deal-rotting-alerts checklist; a 10-tile integrations grid with letter badges (Slack, Gmail, Zoom, LinkedIn, DocuSign, HubSpot, QuickBooks, Calendly, Aircall); a 3-card testimonial wall with 5-star ratings and customer avatars plus a 4-up KPI stats band (12,000+ teams, $2.8B pipeline, 35% close lift, 4.9/5 G2); a 3-tier pricing table (Starter / Professional / Enterprise) with a highlighted Most-Popular plan and a crossed-out feature; a 6-card FAQ grid; a bold GRADIENT conversion CTA band with an email-capture form and SOC 2 / GDPR / 256-bit compliance badges; and a dark 5-column footer with social icons. Use as the ROOT/home page for CRM products, sales-pipeline tools, sales-enablement, lead-management, deal-tracking or revenue-operations SaaS when a polished, vibrant, conversion-focused B2B marketing page is wanted and a warmer, more colorful alternative layout to CrmKimiPage is desired. Supply content only — brand, nav, hero, logos, features, pipeline, integrations, testimonials, stats, pricing, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / product name shown in navbar, hero copy and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content + the dashboard mockup widget. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingLead: z.string().optional(),
        headingHighlight: z.string().optional(),
        headingTrail: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        checks: z.array(z.string()).optional(),
        mockupUrl: z.string().optional(),
        imageAlt: z.string().optional(),
        widgetLabel: z.string().optional(),
        widgetBadge: z.string().optional(),
        widgetStages: z.array(z.string()).optional(),
      })
      .optional(),
    /** Trusted-by logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
        footnote: z.string().optional(),
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
    /** Dark visual-pipeline showcase split. */
    pipeline: z
      .object({
        eyebrow: z.string().optional(),
        headingLead: z.string().optional(),
        headingHighlight: z.string().optional(),
        description: z.string().optional(),
        panelTitle: z.string().optional(),
        panelTotal: z.string().optional(),
        stages: z
          .array(
            z.object({
              label: z.string(),
              total: z.string(),
              deals: z
                .array(
                  z.object({
                    name: z.string(),
                    value: z.string(),
                    won: z.boolean().optional(),
                  }),
                )
                .optional(),
              extra: z.string().optional(),
            }),
          )
          .optional(),
        benefits: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        cta: z.string().optional(),
      })
      .optional(),
    /** Integrations grid. */
    integrations: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              badge: z.string(),
              name: z.string(),
              label: z.string(),
            }),
          )
          .optional(),
        cta: z.string().optional(),
      })
      .optional(),
    /** Testimonial wall + KPI stats band. */
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
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
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
              description: z.string(),
              price: z.string(),
              unit: z.string(),
              features: z.array(z.string()),
              excluded: z.array(z.string()).optional(),
              cta: z.string(),
              featured: z.boolean().optional(),
            }),
          )
          .optional(),
        footnote: z.string().optional(),
      })
      .optional(),
    /** FAQ card grid. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
        footPrompt: z.string().optional(),
        footCta: z.string().optional(),
      })
      .optional(),
    /** Gradient conversion CTA band with email form + compliance badges. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        placeholder: z.string().optional(),
        submit: z.string().optional(),
        checks: z.array(z.string()).optional(),
        badges: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
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
    const brand = props.brand ?? "PipelinePro"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Pipeline", "Integrations", "Pricing", "Customers"]

    const heroBadge = props.hero?.badge ?? "Now with AI-powered lead scoring"
    const heroLead = props.hero?.headingLead ?? "Close deals"
    const heroHighlight = props.hero?.headingHighlight ?? "2x faster"
    const heroTrail =
      props.hero?.headingTrail ?? "with the CRM built for modern sales teams"
    const heroSub =
      props.hero?.subheading ??
      "Visual pipeline management, automated follow-ups, and real-time analytics. Join 12,000+ sales teams at companies like Stripe, Notion, and Figma who've ditched spreadsheets forever."
    const heroPrimary = props.hero?.primaryCta ?? "Start your 14-day free trial"
    const heroSecondary = props.hero?.secondaryCta ?? "Watch 2-min demo"
    const heroChecks = props.hero?.checks?.length
      ? props.hero.checks
      : ["No credit card required", "Cancel anytime", "Free onboarding"]
    const mockupUrl = props.hero?.mockupUrl ?? "pipelinepro.app/dashboard"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "CRM dashboard interface showing sales pipeline with colorful deal stages and analytics charts"
    const widgetLabel = props.hero?.widgetLabel ?? "Deal Progress"
    const widgetBadge = props.hero?.widgetBadge ?? "+24% this week"
    const widgetStages = props.hero?.widgetStages?.length
      ? props.hero.widgetStages
      : ["Discovery", "Proposal", "Negotiation", "Closed Won"]

    const logosHeading =
      props.logos?.heading ?? "Trusted by revenue teams at leading companies"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["stripe", "Notion", "Figma", "Salesforce", "HubSpot", "Zapier"]
    const logosFootnote =
      props.logos?.footnote ??
      "Integrates seamlessly with 200+ tools including Slack, Gmail, Zoom, LinkedIn Sales Navigator, DocuSign, and more"

    const featuresEyebrow = props.features?.eyebrow ?? "Powerful Features"
    const featuresHeading =
      props.features?.heading ??
      "Everything your sales team needs to win more deals"
    const featuresDesc =
      props.features?.description ??
      "Stop juggling spreadsheets, emails, and sticky notes. PipelinePro brings every stage of your sales process into one beautiful, powerful platform."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Visual Pipeline Management",
            description:
              "Drag-and-drop deals across customizable stages. See bottlenecks at a glance with color-coded priority levels and value indicators.",
          },
          {
            title: "AI Lead Scoring",
            description:
              "Our machine learning model analyzes 50+ data points to predict which leads are most likely to convert, so you focus on the right opportunities.",
          },
          {
            title: "Smart Email Sequences",
            description:
              "Automate personalized follow-ups that feel human. Trigger sequences based on deal stage, email opens, or time-based rules.",
          },
          {
            title: "Real-Time Analytics",
            description:
              "Beautiful dashboards track conversion rates, deal velocity, and rep performance. Export board-ready reports in one click.",
          },
          {
            title: "Activity Tracking",
            description:
              "Automatically log calls, emails, and meetings. Never forget a follow-up with smart reminders that sync to your calendar.",
          },
          {
            title: "Team Collaboration",
            description:
              "@mention teammates, assign tasks, and share deal notes. Keep everyone aligned with team inboxes and shared templates.",
          },
        ]

    const pipelineEyebrow = props.pipeline?.eyebrow ?? "Visual Pipeline"
    const pipelineLead = props.pipeline?.headingLead ?? "See every deal."
    const pipelineHighlight =
      props.pipeline?.headingHighlight ?? "Close more revenue."
    const pipelineDesc =
      props.pipeline?.description ??
      "Your deals are visual cards you can drag, drop, and organize. Color coding shows priority at a glance. Value indicators keep revenue front and center."
    const pipelinePanelTitle = props.pipeline?.panelTitle ?? "Q3 Sales Pipeline"
    const pipelinePanelTotal = props.pipeline?.panelTotal ?? "$2.4M total"
    const pipelineStages = props.pipeline?.stages?.length
      ? props.pipeline.stages
      : [
          {
            label: "Prospecting",
            total: "$420K",
            deals: [
              { name: "Acme Corp", value: "$85K" },
              { name: "TechStart", value: "$42K" },
            ],
            extra: "+3 more",
          },
          {
            label: "Discovery",
            total: "$680K",
            deals: [
              { name: "GrowthLabs", value: "$125K" },
              { name: "CloudNine", value: "$94K" },
              { name: "DataSync", value: "$67K" },
            ],
          },
          {
            label: "Proposal",
            total: "$890K",
            deals: [
              { name: "VentureCo", value: "$240K" },
              { name: "ScaleUp", value: "$180K" },
              { name: "NextGen", value: "$156K" },
            ],
          },
          {
            label: "Closed Won",
            total: "$410K",
            deals: [
              { name: "BrightIdeas", value: "$95K", won: true },
              { name: "FastTrack", value: "$72K", won: true },
              { name: "Innovate", value: "$61K", won: true },
            ],
          },
        ]
    const pipelineBenefits = props.pipeline?.benefits?.length
      ? props.pipeline.benefits
      : [
          {
            title: "Customizable Stages",
            description:
              "Match your exact sales process with unlimited custom pipeline stages.",
          },
          {
            title: "Multiple Pipelines",
            description:
              "Manage different products, regions, or teams with separate pipelines.",
          },
          {
            title: "Deal Rotting Alerts",
            description:
              "Get notified when deals stall so nothing falls through the cracks.",
          },
        ]
    const pipelineCta = props.pipeline?.cta ?? "Try the pipeline free"

    const integrationsEyebrow =
      props.integrations?.eyebrow ?? "200+ Integrations"
    const integrationsHeading =
      props.integrations?.heading ?? "Connects to the tools you already use"
    const integrationsDesc =
      props.integrations?.description ??
      "PipelinePro integrates seamlessly with your entire sales stack. No more switching between tabs or copy-pasting data."
    const integrationItems = props.integrations?.items?.length
      ? props.integrations.items
      : [
          { badge: "S", name: "Slack", label: "Deal notifications" },
          { badge: "G", name: "Gmail", label: "Email sync" },
          { badge: "Z", name: "Zoom", label: "Meeting logs" },
          { badge: "Li", name: "LinkedIn", label: "Lead import" },
          { badge: "D", name: "DocuSign", label: "Contract close" },
          { badge: "H", name: "HubSpot", label: "Marketing sync" },
          { badge: "Q", name: "QuickBooks", label: "Invoicing" },
          { badge: "C", name: "Calendly", label: "Scheduling" },
          { badge: "A", name: "Aircall", label: "Phone system" },
          { badge: "+", name: "And more", label: "200+ apps" },
        ]
    const integrationsCta = props.integrations?.cta ?? "View all integrations"

    const testimonialsEyebrow =
      props.testimonials?.eyebrow ?? "Customer Stories"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by sales teams everywhere"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See why 12,000+ companies switched from spreadsheets and legacy CRMs to PipelinePro."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "PipelinePro transformed our sales process. We went from 40% visibility on deals to 100%. Our close rate jumped 35% in the first quarter alone. The visual pipeline is a game-changer.",
            name: "Sarah Chen",
            role: "VP of Sales, TechScale",
            avatarAlt:
              "Professional headshot of Sarah Chen, VP of Sales at TechScale",
          },
          {
            quote:
              "We migrated from Salesforce in a weekend. PipelinePro is so intuitive our reps were productive on day one. The AI lead scoring alone has saved us 15 hours per week of manual research.",
            name: "Marcus Johnson",
            role: "Sales Director, GrowthLabs",
            avatarAlt:
              "Professional headshot of Marcus Johnson, Sales Director at GrowthLabs",
          },
          {
            quote:
              "As a startup, we needed something powerful but easy. PipelinePro scaled with us from 3 to 50 sales reps without missing a beat. Support is incredible — they actually answer in minutes.",
            name: "Emily Rodriguez",
            role: "CEO, CloudPath",
            avatarAlt:
              "Professional headshot of Emily Rodriguez, CEO at CloudPath",
          },
        ]
    const statsItems = props.testimonials?.stats?.length
      ? props.testimonials.stats
      : [
          { value: "12,000+", label: "Active teams" },
          { value: "$2.8B", label: "Pipeline managed" },
          { value: "35%", label: "Avg. close rate lift" },
          { value: "4.9/5", label: "G2 rating" },
        ]

    const pricingEyebrow = props.pricing?.eyebrow ?? "Simple Pricing"
    const pricingHeading =
      props.pricing?.heading ?? "Plans that scale with your team"
    const pricingDesc =
      props.pricing?.description ??
      "No hidden fees, no surprises. Start free and upgrade when you're ready. All plans include unlimited pipelines."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Starter",
            description:
              "Perfect for solo founders and small teams getting started.",
            price: "$0",
            unit: "/month",
            features: [
              "Up to 3 users",
              "1 pipeline",
              "100 contacts",
              "Basic email integration",
            ],
            excluded: ["AI lead scoring"],
            cta: "Get started free",
          },
          {
            name: "Professional",
            description:
              "For growing teams that need automation and insights.",
            price: "$49",
            unit: "/user/month",
            features: [
              "Unlimited users",
              "Unlimited pipelines",
              "10,000 contacts",
              "AI lead scoring",
              "Email sequences & automation",
              "Advanced analytics",
            ],
            cta: "Start 14-day trial",
            featured: true,
          },
          {
            name: "Enterprise",
            description:
              "For large organizations with advanced security and support needs.",
            price: "$99",
            unit: "/user/month",
            features: [
              "Everything in Professional",
              "Unlimited contacts",
              "SSO & advanced security",
              "Custom API access",
              "Dedicated success manager",
              "SLA guarantee",
            ],
            cta: "Contact sales",
          },
        ]
    const pricingFootnote =
      props.pricing?.footnote ??
      "All paid plans include a 14-day free trial. No credit card required to start."

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How long does it take to get set up?",
            answer:
              "Most teams are up and running within 30 minutes. Import your existing contacts from CSV, connect your email, and start building your pipeline. Our onboarding team offers free setup assistance for teams of 10+.",
          },
          {
            question: "Can I import data from my current CRM?",
            answer:
              "Absolutely. We offer one-click imports from Salesforce, HubSpot, Pipedrive, and Zoho. Our migration tool preserves your deal history, contact relationships, and pipeline structure. Enterprise customers get white-glove migration support.",
          },
          {
            question: "Is my data secure?",
            answer:
              "Security is our top priority. We're SOC 2 Type II certified, GDPR compliant, and use 256-bit encryption at rest and in transit. Enterprise plans include SSO, audit logs, and custom data retention policies.",
          },
          {
            question: "What happens when I hit my contact limit?",
            answer:
              "We'll notify you at 80% capacity. You can archive old contacts to free up space, or upgrade to a higher plan. We'll never delete your data — you remain in full control.",
          },
          {
            question: "Do you offer discounts for nonprofits or startups?",
            answer:
              "Yes! Qualified nonprofits receive 50% off any plan. Startups in accelerator programs (Y Combinator, Techstars, 500 Startups) get Professional free for 12 months. Contact our sales team to apply.",
          },
          {
            question: "How does the AI lead scoring work?",
            answer:
              "Our ML model analyzes firmographic data, engagement patterns, email responses, website activity, and historical conversion data to score leads 0-100. Scores update in real-time and you can customize the weighting factors for your business.",
          },
        ]
    const faqPrompt = props.faq?.footPrompt ?? "Still have questions?"
    const faqFootCta = props.faq?.footCta ?? "Chat with our team"

    const ctaHeading = props.cta?.heading ?? "Ready to close more deals?"
    const ctaDesc =
      props.cta?.description ??
      "Join 12,000+ sales teams who've switched to PipelinePro. Start your 14-day free trial today — no credit card required."
    const ctaPlaceholder = props.cta?.placeholder ?? "Enter your work email"
    const ctaSubmit = props.cta?.submit ?? "Start free trial"
    const ctaChecks = props.cta?.checks?.length
      ? props.cta.checks
      : ["Free 14-day trial", "No credit card", "Cancel anytime"]
    const ctaBadges = props.cta?.badges?.length
      ? props.cta.badges
      : [
          { value: "SOC 2", label: "Certified" },
          { value: "GDPR", label: "Compliant" },
          { value: "256-bit", label: "Encryption" },
        ]

    const footerDesc =
      props.footer?.description ??
      "The modern CRM for sales teams who want to move fast, stay organized, and close more deals."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Integrations", "Changelog", "API Docs"],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Press Kit", "Contact"],
          },
          {
            title: "Resources",
            links: [
              "Help Center",
              "Community",
              "Webinars",
              "Sales Templates",
              "ROI Calculator",
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Security", "Cookies"]

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
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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

    const Arrow = ({ className }: { className?: string }) => (
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
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
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

    // Feature icons — multi-color tiles rotate through theme tokens.
    const featureIcons: { node: ReactNode; tile: string }[] = [
      {
        tile: "bg-primary/10 text-primary",
        node: (
          <path d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        ),
      },
      {
        tile: "bg-chart-4/10 text-chart-4",
        node: <path d="M13 10V3L4 14h7v7l9-11h-7z" />,
      },
      {
        tile: "bg-chart-1/10 text-chart-1",
        node: (
          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        ),
      },
      {
        tile: "bg-chart-5/10 text-chart-5",
        node: (
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        ),
      },
      {
        tile: "bg-chart-2/10 text-chart-2",
        node: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
      },
      {
        tile: "bg-accent text-accent-foreground",
        node: (
          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        ),
      },
    ]

    // Pipeline stage accent tokens (Prospecting / Discovery / Proposal / Won).
    const stageAccents = [
      "bg-background/5 border-background/10",
      "bg-primary/15 border-primary/30",
      "bg-chart-4/15 border-chart-4/30",
      "bg-chart-2/15 border-chart-2/30",
    ]
    const stageLabelColors = [
      "text-background/70",
      "text-primary-foreground",
      "text-chart-4",
      "text-chart-2",
    ]

    const socialIcons: { label: string; path: string }[] = [
      {
        label: "Twitter",
        path: "M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84",
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

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="group flex items-center gap-2"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-4 text-primary-foreground">
                <LogoMark className="size-6" />
              </span>
              <span className="text-xl font-bold tracking-tight text-foreground">
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
                onClick={() => go("Sign in")}
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => go(heroPrimary)}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
              >
                Start free trial
              </button>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-background">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-chart-4/10 opacity-70" />
            <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-bl from-primary/10 to-transparent" />
            <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pb-32 lg:pt-24">
              <div className="items-center lg:grid lg:grid-cols-2 lg:gap-16">
                <div className="mb-12 text-center lg:mb-0 lg:text-left">
                  <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-sm font-medium text-primary">
                      {heroBadge}
                    </span>
                  </span>
                  <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {heroLead}{" "}
                    <span className="bg-gradient-to-r from-primary via-chart-4 to-accent-foreground bg-clip-text text-transparent">
                      {heroHighlight}
                    </span>{" "}
                    {heroTrail}
                  </h1>
                  <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl lg:mx-0">
                    {heroSub}
                  </p>
                  <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <Arrow className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-border bg-background px-8 py-4 text-base font-bold text-foreground transition-all hover:border-muted-foreground/40"
                    >
                      <svg
                        className="size-5 text-muted-foreground"
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
                  <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
                    {heroChecks.map((c) => (
                      <span key={c} className="flex items-center gap-2">
                        <Check className="size-5 text-chart-2" />
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Dashboard mockup card */}
                <div className="relative">
                  <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary to-chart-4 opacity-20 blur-2xl" />
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                    <div className="flex items-center gap-2 bg-foreground px-4 py-3">
                      <div className="flex gap-1.5">
                        <div className="size-3 rounded-full bg-destructive/70" />
                        <div className="size-3 rounded-full bg-chart-4/80" />
                        <div className="size-3 rounded-full bg-chart-2/80" />
                      </div>
                      <div className="flex-1 text-center font-mono text-xs text-background/60">
                        {mockupUrl}
                      </div>
                    </div>
                    <Image
                      alt={heroImageAlt}
                      w={1200}
                      h={800}
                      className="h-auto w-full object-cover"
                    />
                    <div className="absolute inset-x-6 bottom-6 rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur-sm">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-card-foreground">
                          {widgetLabel}
                        </span>
                        <span className="rounded-full bg-chart-2/10 px-2 py-1 text-xs font-medium text-chart-2">
                          {widgetBadge}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary to-chart-4" />
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                        {widgetStages.map((s) => (
                          <span key={s}>{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
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
                    className="flex items-center justify-center text-lg font-bold text-foreground transition-colors hover:text-primary"
                  >
                    {logo}
                  </button>
                ))}
              </div>
              <p className="mt-8 text-center text-sm text-muted-foreground">
                {logosFootnote}
              </p>
            </div>
          </section>

          {/* Features */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-chart-4/10 px-4 py-1.5 text-sm font-semibold text-chart-4">
                  {featuresEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => {
                  const icon = featureIcons[i % featureIcons.length]
                  return (
                    <div
                      key={item.title}
                      className="group rounded-2xl border border-transparent bg-muted/50 p-6 transition-all hover:border-border hover:bg-card hover:shadow-xl"
                    >
                      <div
                        className={cn(
                          "mb-4 grid size-12 place-items-center rounded-xl transition-transform group-hover:scale-110",
                          icon.tile,
                        )}
                      >
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
                          {icon.node}
                        </svg>
                      </div>
                      <h3 className="mb-2 text-lg font-bold text-foreground">
                        {item.title}
                      </h3>
                      <p className="leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Pipeline showcase (dark) */}
          <section className="overflow-hidden bg-foreground py-24 text-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="items-center lg:grid lg:grid-cols-2 lg:gap-16">
                <div className="order-2 mb-12 lg:order-1 lg:mb-0">
                  <div className="relative">
                    <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-primary to-chart-4 opacity-30 blur-3xl" />
                    <div className="relative rounded-xl border border-background/10 bg-background/5 p-6 shadow-2xl">
                      <div className="mb-6 flex items-center justify-between">
                        <h4 className="font-semibold text-background/90">
                          {pipelinePanelTitle}
                        </h4>
                        <span className="rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                          {pipelinePanelTotal}
                        </span>
                      </div>
                      <div className="space-y-4">
                        {pipelineStages.map((stage, si) => (
                          <div
                            key={stage.label}
                            className={cn(
                              "rounded-lg border p-4",
                              stageAccents[si % stageAccents.length],
                            )}
                          >
                            <div className="mb-3 flex items-center justify-between">
                              <span
                                className={cn(
                                  "text-sm font-medium",
                                  stageLabelColors[si % stageLabelColors.length],
                                )}
                              >
                                {stage.label}
                              </span>
                              <span className="text-sm font-bold text-background">
                                {stage.total}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              {(stage.deals ?? []).map((deal) => (
                                <div
                                  key={deal.name}
                                  className="h-16 flex-1 rounded border border-background/10 bg-background/5 p-2"
                                >
                                  <div className="text-xs text-background/60">
                                    {deal.name}
                                  </div>
                                  <div
                                    className={cn(
                                      "text-sm font-semibold",
                                      deal.won
                                        ? "text-chart-2"
                                        : "text-background",
                                    )}
                                  >
                                    {deal.value}
                                    {deal.won ? " ✓" : ""}
                                  </div>
                                </div>
                              ))}
                              {stage.extra ? (
                                <div className="flex h-16 flex-1 items-center justify-center rounded border border-dashed border-background/20 bg-background/5">
                                  <span className="text-xs text-background/50">
                                    {stage.extra}
                                  </span>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="order-1 lg:order-2">
                  <span className="mb-4 inline-block rounded-full border border-primary/40 bg-primary/15 px-4 py-1.5 text-sm font-semibold text-primary">
                    {pipelineEyebrow}
                  </span>
                  <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                    {pipelineLead}{" "}
                    <span className="text-primary">{pipelineHighlight}</span>
                  </h2>
                  <p className="mb-8 text-lg leading-relaxed text-background/70">
                    {pipelineDesc}
                  </p>
                  <div className="mb-8 space-y-4">
                    {pipelineBenefits.map((b) => (
                      <div key={b.title} className="flex items-start gap-4">
                        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-4" />
                        </span>
                        <div>
                          <h4 className="mb-1 font-semibold text-background">
                            {b.title}
                          </h4>
                          <p className="text-sm text-background/60">
                            {b.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => go(pipelineCta)}
                    className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-base font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    {pipelineCta}
                    <Arrow className="size-5" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Integrations */}
          <section className="bg-muted/50 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-secondary px-4 py-1.5 text-sm font-semibold text-secondary-foreground">
                  {integrationsEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {integrationsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {integrationsDesc}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
                {integrationItems.map((item, i) => {
                  const tiles = [
                    "bg-primary/10 text-primary",
                    "bg-chart-1/10 text-chart-1",
                    "bg-chart-4/10 text-chart-4",
                    "bg-chart-2/10 text-chart-2",
                    "bg-chart-5/10 text-chart-5",
                  ]
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => go(item.name)}
                      className="rounded-xl border border-border bg-card p-6 text-center transition-shadow hover:shadow-lg"
                    >
                      <div
                        className={cn(
                          "mx-auto mb-3 grid size-12 place-items-center rounded-lg text-xl font-bold",
                          tiles[i % tiles.length],
                        )}
                      >
                        {item.badge}
                      </div>
                      <h4 className="text-sm font-semibold text-card-foreground">
                        {item.name}
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.label}
                      </p>
                    </button>
                  )
                })}
              </div>
              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={() => go(integrationsCta)}
                  className="inline-flex items-center gap-1 font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  {integrationsCta}
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
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </section>

          {/* Testimonials + stats */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {testimonialsEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
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
                    className="rounded-2xl border border-border bg-muted/50 p-8"
                  >
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} />
                      ))}
                    </div>
                    <blockquote className="mb-6 leading-relaxed text-foreground/80">
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
                        <div className="font-semibold text-foreground">
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
              <div className="mt-16 grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <div className="mb-1 text-4xl font-black text-primary">
                      {s.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted/50 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {pricingEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative rounded-2xl bg-card p-8",
                      plan.featured
                        ? "border-2 border-primary shadow-xl shadow-primary/10"
                        : "border border-border transition-shadow hover:shadow-xl",
                    )}
                  >
                    {plan.featured ? (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="inline-block rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                          Most Popular
                        </span>
                      </div>
                    ) : null}
                    <div className="mb-6">
                      <h3 className="mb-2 text-xl font-bold text-card-foreground">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {plan.description}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-black text-card-foreground">
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground">{plan.unit}</span>
                    </div>
                    <ul className="mb-8 space-y-3">
                      {plan.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-center gap-3 text-sm text-foreground/80"
                        >
                          <Check className="size-5 shrink-0 text-chart-2" />
                          {feat}
                        </li>
                      ))}
                      {(plan.excluded ?? []).map((feat) => (
                        <li
                          key={feat}
                          className="flex items-center gap-3 text-sm text-muted-foreground/60"
                        >
                          <XIcon className="size-5 shrink-0 text-muted-foreground/40" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "block w-full rounded-xl py-3 text-center font-semibold transition-colors",
                        plan.featured
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-12 text-center">
                <p className="text-sm text-muted-foreground">
                  {pricingFootnote}
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full bg-chart-4/10 px-4 py-1.5 text-sm font-semibold text-chart-4">
                  {faqEyebrow}
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {faqHeading}
                </h2>
              </div>
              <div className="space-y-6">
                {faqItems.map((item) => (
                  <div
                    key={item.question}
                    className="rounded-xl bg-muted/50 p-6"
                  >
                    <h3 className="mb-3 text-lg font-bold text-foreground">
                      {item.question}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-12 text-center">
                <p className="mb-4 text-muted-foreground">{faqPrompt}</p>
                <button
                  type="button"
                  onClick={() => go(faqFootCta)}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-primary px-6 py-3 font-semibold text-primary transition-colors hover:bg-primary/10"
                >
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
                    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {faqFootCta}
                </button>
              </div>
            </div>
          </section>

          {/* CTA band (gradient) */}
          <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-chart-4 py-24 text-primary-foreground">
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-xl text-primary-foreground/80">
                {ctaDesc}
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  go(ctaSubmit)
                }}
                className="mx-auto mb-8 flex max-w-md flex-col gap-4 sm:flex-row"
              >
                <input
                  type="email"
                  required
                  placeholder={ctaPlaceholder}
                  aria-label={ctaPlaceholder}
                  className="flex-1 rounded-full border border-input bg-background px-6 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="submit"
                  className="whitespace-nowrap rounded-full bg-foreground px-8 py-4 font-bold text-background shadow-lg transition-colors hover:bg-foreground/90"
                >
                  {ctaSubmit}
                </button>
              </form>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/70">
                {ctaChecks.map((c) => (
                  <span key={c} className="flex items-center gap-2">
                    <Check className="size-5" />
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-12 flex items-center justify-center gap-8 opacity-60">
                {ctaBadges.map((b, i) => (
                  <div key={b.value} className="flex items-center gap-8">
                    {i > 0 ? (
                      <div className="h-10 w-px bg-primary-foreground/30" />
                    ) : null}
                    <div className="text-center">
                      <div className="text-2xl font-bold">{b.value}</div>
                      <div className="text-xs">{b.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-4 text-primary-foreground">
                    <LogoMark className="size-6" />
                  </span>
                  <span className="text-xl font-bold text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-sm text-background/60">{footerDesc}</p>
                <div className="flex gap-4">
                  {socialIcons.map((social) => (
                    <button
                      key={social.label}
                      type="button"
                      aria-label={social.label}
                      onClick={() => go(social.label)}
                      className="grid size-10 place-items-center rounded-lg bg-background/10 text-background/80 transition-colors hover:bg-background/20"
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
                  <h4 className="mb-4 font-semibold text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-3 text-sm">
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
              <div className="flex gap-6 text-sm text-background/50">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="transition-colors hover:text-background/80"
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
