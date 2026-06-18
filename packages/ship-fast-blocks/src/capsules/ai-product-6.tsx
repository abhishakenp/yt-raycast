import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { number, string, table } from "@ship-fast/lakebed/server"
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
import { Button } from "#/components/ui/button.tsx"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover.tsx"
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar.tsx"

/**
 * AiProductKimiPage6 — a faithful, token-compliant OpenUI-lang port of the
 * Kimi-generated "WriteMind AI" v06 design (ai-product category, variant 6).
 *
 * This is the 6th style sibling to AiProductKimiPage. It pairs an airy, clean
 * enterprise SaaS aesthetic with a more structured, "corporate trust" mood:
 * sticky blurred navbar, a live collaboration badge in the hero, a detailed
 * chat/editor mockup floating beside the headline, a social-proof logo strip,
 * a 6-up feature grid with hand-picked icon tiles, a dark stats band, a
 * 6-card solutions grid with role-based imagery, a 3-step numbered timeline
 * with a connecting gradient line, a 4-up product gallery with gradient
 * overlays, a 6-card star-rated testimonial wall with headshots, a 3-tier
 * pricing table with a dark featured plan, a native details/summary FAQ accordion,
 * a dark CTA with gradient glow orbs, and a rich multi-column dark footer with
 * social icons.
 *
 * Every nav item / CTA / link / social / FAQ routes through useNavigate. All
 * content imagery uses the alt-driven <Image> component. Surfaces map to semantic
 * tokens so it themes cleanly.
 */
export const AiProductKimiPage6 = defineCapsule({
  name: "AiProductKimiPage6",
  description:
    "Enterprise AI SaaS landing page (ai-product variant 6 / style sibling to AiProductKimiPage) with a clean, corporate-trust aesthetic: sticky blurred navbar, live collaboration pill, split hero with a detailed chat/editor mockup, social-proof logo strip, 6-up feature grid with hand-picked icons, dark stats band, 6-card role-based solutions gallery, 3-step numbered timeline with gradient connector, 4-up product screenshot gallery with gradient overlays, 6-card star-rated testimonial wall with headshots, 3-tier pricing table with a dark featured Professional plan, native details/summary FAQ accordion, dark CTA with gradient glow orbs, and a rich multi-column dark footer with social icons. Use when building a polished, conversion-focused marketing site for AI writing assistants, enterprise productivity tools, or B2B SaaS where trust, features, pricing and social proof are all essential.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    hero: z
      .object({
        badge: z.string().optional(),
        headingTop: z.string().optional(),
        headingBottom: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        trust: z.array(z.string()).optional(),
        previewTitle: z.string().optional(),
        previewIntro: z.string().optional(),
        previewBody: z.string().optional(),
        previewActions: z.array(z.string()).optional(),
        floatingCards: z
          .array(z.object({ label: z.string(), sub: z.string() }))
          .optional(),
      })
      .optional(),
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    features: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    stats: z
      .object({
        items: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
      })
      .optional(),
    solutions: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              imageAlt: z.string(),
              cta: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    steps: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.object({ title: z.string(), description: z.string() })).optional(),
      })
      .optional(),
    gallery: z
      .object({
        badge: z.string().optional(),
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
    testimonials: z
      .object({
        badge: z.string().optional(),
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
    pricing: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        note: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              period: z.string().optional(),
              cta: z.string(),
              featured: z.boolean().optional(),
              included: z.array(z.string()),
              excluded: z.array(z.string()).optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    faq: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
      })
      .optional(),
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        badges: z.array(z.string()).optional(),
      })
      .optional(),
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      trialRequests: table({
        email: string(),
        company: string(),
        plan: string(),
      }),
    },
    queries: {
      trialRequests: ({ db }) => db.trialRequests.orderBy('createdAt').all(),
    },
    mutations: {
      submitTrialRequest: ({ db }, email: string, company: string, plan: string) => {
        db.trialRequests.insert({ email, company, plan })
        return db.trialRequests.all()
      },
      removeTrialRequest: ({ db }, id: string) => {
        db.trialRequests.delete(id)
        return db.trialRequests.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [trialDrawerOpen, setTrialDrawerOpen] = useState(false)
    const [emailInput, setEmailInput] = useState("")
    const [companyInput, setCompanyInput] = useState("")
    const [selectedPlan, setSelectedPlan] = useState("Professional")

    const trialRequests = lakebed.useQuery('trialRequests')
    const submitTrialRequest = lakebed.useMutation('submitTrialRequest')
    const removeTrialRequest = lakebed.useMutation('removeTrialRequest')
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || 'Account'
    const authInitials =
      authDisplayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'ME'
    const authLabel = auth.isLoading
      ? 'Checking...'
      : isSignedIn
        ? authDisplayName
        : 'Sign in'

    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }

    const handleSignOut = () => {
      lakebed.signOut()
    }

    const handleSubmitTrial = () => {
      if (!emailInput || !companyInput) return
      void submitTrialRequest(emailInput, companyInput, selectedPlan)
      setEmailInput("")
      setCompanyInput("")
      setTrialDrawerOpen(false)
    }

    const brand = props.brand ?? "WriteMind AI"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Solutions", "Pricing", "Customers", "Resources"]

    const heroBadge = props.hero?.badge ?? "Now with real-time collaboration"
    const headingTop = props.hero?.headingTop ?? "Write faster."
    const headingBottom = props.hero?.headingBottom ?? "Think clearer."
    const heroSub =
      props.hero?.subheading ??
      "The AI writing platform that transforms how enterprise teams create proposals, reports, emails, and documentation. Trusted by 2,400+ companies including Microsoft, Deloitte, and Salesforce."
    const heroPrimary = props.hero?.primaryCta ?? "Start 14-day free trial"
    const heroSecondary = props.hero?.secondaryCta ?? "Watch Demo (3 min)"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["No credit card required", "SOC 2 Type II certified"]
    const previewTitle = props.hero?.previewTitle ?? "WriteMind Editor"
    const previewIntro =
      props.hero?.previewIntro ??
      "Draft a quarterly business review for Acme Corp's marketing division. Focus on Q3 performance, campaign ROI, and Q4 projections."
    const previewBody =
      props.hero?.previewBody ??
      "Q3 2024 Business Review — Marketing Division. Executive Summary: Marketing delivered 127% of pipeline target with $4.2M attributed revenue..."
    const previewActions = props.hero?.previewActions?.length
      ? props.hero.previewActions
      : ["Expand", "Add Charts", "Insert"]
    const floatingCards = props.hero?.floatingCards?.length
      ? props.hero.floatingCards
      : [
          {
            label: "Grammar: 98/100",
            sub: "Professional tone detected",
          },
          {
            label: "Saved 4.5 hours",
            sub: "vs. manual drafting",
          },
        ]

    const logosLabel = props.logos?.label ?? "Trusted by 2,400+ enterprise teams"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Notion", "Stripe", "Figma", "Jira", "HubSpot", "Slack"]

    const featuresBadge = props.features?.badge ?? "Features"
    const featuresHeading =
      props.features?.heading ?? "Everything your team needs to write better, faster"
    const featuresDesc =
      props.features?.description ??
      "From first draft to final approval, WriteMind streamlines every step of enterprise content creation with AI that understands your brand voice."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Smart Document Generation",
            description:
              "Generate proposals, SOPs, reports, and emails from briefs, outlines, or voice memos. Maintains consistent formatting and brand voice across all outputs.",
          },
          {
            title: "Brand Voice Training",
            description:
              "Train AI on your company's content library. WriteMind learns your terminology, tone guidelines, and style preferences for on-brand every time.",
          },
          {
            title: "Enterprise Compliance",
            description:
              "SOC 2 Type II certified with GDPR compliance. Data never trains public models. On-premise deployment options for regulated industries.",
          },
          {
            title: "Workflow Automation",
            description:
              "Build custom workflows with approvals, reviews, and publishing steps. Integrates with SharePoint, Google Workspace, and 50+ enterprise tools.",
          },
          {
            title: "Quality Scoring & Analytics",
            description:
              "Real-time readability scores, tone analysis, and plagiarism detection. Dashboard insights on team productivity and content performance metrics.",
          },
          {
            title: "Role-Based Access Control",
            description:
              "Granular permissions by department, project, or content type. SSO with Okta, Azure AD, and Google Workspace. Audit logs for all activity.",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "2,400+", label: "Enterprise customers" },
          { value: "47M", label: "Documents created" },
          { value: "8.5x", label: "Average productivity gain" },
          { value: "99.97%", label: "Uptime SLA" },
        ]

    const solutionsBadge = props.solutions?.badge ?? "Solutions"
    const solutionsHeading = props.solutions?.heading ?? "Built for every team"
    const solutionsDesc =
      props.solutions?.description ??
      "Specialized AI workflows tailored to the unique writing needs of different departments and industries."
    const solutionItems = props.solutions?.items?.length
      ? props.solutions.items
      : [
          {
            title: "Marketing & Communications",
            description:
              "Campaign briefs, press releases, social content, and email sequences that maintain brand consistency across channels.",
            imageAlt: "business professionals collaborating in modern conference room",
            cta: "Learn more",
          },
          {
            title: "Executive Leadership",
            description:
              "Board presentations, shareholder letters, all-hands communications, and strategic vision documents.",
            imageAlt: "business executive in formal attire",
            cta: "Learn more",
          },
          {
            title: "Human Resources",
            description:
              "Job descriptions, policy documentation, performance reviews, and internal communications at scale.",
            imageAlt: "hr professional conducting interview",
            cta: "Learn more",
          },
          {
            title: "Product & Engineering",
            description:
              "Technical specifications, API documentation, release notes, and product requirement documents.",
            imageAlt: "software development team working together",
            cta: "Learn more",
          },
          {
            title: "Legal & Compliance",
            description:
              "Contract drafts, compliance documentation, risk assessments with built-in regulatory templates.",
            imageAlt: "legal professional reviewing documents",
            cta: "Learn more",
          },
          {
            title: "Sales & Business Development",
            description:
              "Proposals, RFP responses, outreach sequences, and sales enablement materials.",
            imageAlt: "sales team meeting with client presentation",
            cta: "Learn more",
          },
        ]

    const stepsBadge = props.steps?.badge ?? "How it works"
    const stepsHeading =
      props.steps?.heading ?? "From idea to polished document in minutes"
    const stepsDesc =
      props.steps?.description ??
      "Three simple steps to transform your writing workflow with enterprise-grade AI assistance."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Describe your needs",
            description:
              "Enter a brief description, upload existing documents, or use voice input. Specify document type, target audience, and desired tone.",
          },
          {
            title: "AI generates draft",
            description:
              "WriteMind creates a complete first draft in seconds, applying your brand guidelines, preferred terminology, and formatting standards automatically.",
          },
          {
            title: "Refine and publish",
            description:
              "Collaborate with your team, apply AI suggestions, run compliance checks, and publish directly to your document management system.",
          },
        ]

    const galleryBadge = props.gallery?.badge ?? "Product"
    const galleryHeading =
      props.gallery?.heading ?? "Powerful tools, intuitive interface"
    const galleryDesc =
      props.gallery?.description ??
      "A complete writing environment designed for professional teams who demand both capability and simplicity."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Smart Editor",
            description: "Real-time suggestions, inline comments, and collaborative editing",
            imageAlt: "modern laptop displaying writing application on desk",
          },
          {
            title: "Analytics Dashboard",
            description: "Track team productivity and content performance metrics",
            imageAlt: "data dashboard with charts and analytics",
          },
          {
            title: "Review Workflows",
            description: "Custom approval chains and version control",
            imageAlt: "team reviewing documents with tablets",
          },
          {
            title: "Enterprise Security",
            description: "SOC 2 certified with on-premise deployment options",
            imageAlt: "server room with racks of equipment",
          },
        ]

    const testimonialsBadge = props.testimonials?.badge ?? "Testimonials"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Trusted by industry leaders"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See how enterprise teams are transforming their content operations with WriteMind AI."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "WriteMind has reduced our proposal turnaround time from 3 days to 4 hours. The ROI was evident within the first month. Our sales team now focuses on strategy instead of formatting.",
            name: "James Mitchell",
            role: "VP Sales, Salesforce",
            avatarAlt: "professional headshot of a smiling executive in navy suit",
          },
          {
            quote:
              "As a compliance-heavy industry, we needed an AI solution that takes security seriously. WriteMind's on-premise option and SOC 2 certification made it an easy choice.",
            name: "Sarah Chen",
            role: "General Counsel, Morgan Stanley",
            avatarAlt: "professional headshot of a woman executive with dark hair",
          },
          {
            quote:
              "Our marketing team scaled content production 340% in Q3 without adding headcount. The brand voice training feature ensures everything sounds authentically like us.",
            name: "Michael Torres",
            role: "CMO, HubSpot",
            avatarAlt: "professional headshot of a man with glasses and beard in business casual",
          },
          {
            quote:
              "The quality scoring caught a compliance issue in a client report that would have cost us the account. It's like having a senior editor and legal reviewer on every document.",
            name: "Jennifer Walsh",
            role: "Managing Director, Deloitte",
            avatarAlt: "professional headshot of a woman with blonde hair in business attire",
          },
          {
            quote:
              "We deployed WriteMind to 4,200 employees in 3 weeks. The SSO integration and training resources made enterprise rollout seamless. Adoption hit 78% in month one.",
            name: "David Kim",
            role: "CIO, Microsoft",
            avatarAlt: "professional headshot of a middle-aged man in suit and tie",
          },
          {
            quote:
              "Technical documentation used to take our team weeks. With WriteMind, we ship docs alongside releases. The API integration for auto-generating changelogs is brilliant.",
            name: "Robert Chang",
            role: "VP Engineering, Stripe",
            avatarAlt: "professional headshot of a man with short hair in tech company setting",
          },
        ]

    const pricingBadge = props.pricing?.badge ?? "Pricing"
    const pricingHeading = props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Choose the plan that fits your team. All plans include a 14-day free trial with no credit card required."
    const pricingNote =
      props.pricing?.note ??
      "All prices in USD. Billed annually. Monthly billing available at +20%."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Starter",
            tagline: "For small teams getting started",
            price: "$29",
            period: "/user/month",
            cta: "Start free trial",
            featured: false,
            included: [
              "5,000 words per user/month",
              "10 document templates",
              "Basic grammar & style checks",
              "Email support",
            ],
            excluded: ["Brand voice training", "SSO integration"],
          },
          {
            name: "Professional",
            tagline: "For growing teams",
            price: "$79",
            period: "/user/month",
            cta: "Start free trial",
            featured: true,
            included: [
              "Unlimited words",
              "100+ document templates",
              "Advanced grammar & tone analysis",
              "Brand voice training (1 voice)",
              "Priority support",
            ],
            excluded: ["SSO integration"],
          },
          {
            name: "Enterprise",
            tagline: "For large organizations",
            price: "Custom",
            period: "",
            cta: "Contact Sales",
            featured: false,
            included: [
              "Everything in Professional",
              "Unlimited brand voices",
              "SSO & SCIM provisioning",
              "On-premise deployment option",
              "Custom AI model training",
              "Dedicated account manager",
            ],
            excluded: [],
          },
        ]

    const faqBadge = props.faq?.badge ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ?? "Everything you need to know about WriteMind AI."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "Is my data used to train AI models?",
            answer:
              "Absolutely not. Your data is never used to train our models or any third-party AI systems. We maintain strict data isolation with enterprise-grade encryption at rest and in transit. For Enterprise customers, we offer on-premise deployment options for complete data sovereignty.",
          },
          {
            question: "What integrations do you support?",
            answer:
              "WriteMind integrates with 50+ enterprise tools including Microsoft 365, Google Workspace, Salesforce, HubSpot, Slack, Notion, SharePoint, and major CRM platforms. Our Enterprise plan includes custom API access and webhooks for building tailored integrations.",
          },
          {
            question: "How does brand voice training work?",
            answer:
              "Upload your existing content library—style guides, past documents, approved messaging—and WriteMind analyzes patterns to learn your terminology, tone preferences, formatting standards, and industry-specific language. The AI then applies these patterns to all new content generation.",
          },
          {
            question: "What security certifications do you have?",
            answer:
              "WriteMind is SOC 2 Type II certified, GDPR compliant, and HIPAA ready. We undergo annual third-party security audits and maintain 99.97% uptime with redundant infrastructure across multiple geographic regions.",
          },
          {
            question: "Can I cancel or change plans anytime?",
            answer:
              "Yes, you can upgrade, downgrade, or cancel your subscription at any time. Annual plans receive prorated refunds if canceled. We offer a 14-day free trial on all plans so you can evaluate WriteMind before committing.",
          },
          {
            question: "Do you offer onboarding and training?",
            answer:
              "Professional plans include self-service onboarding resources and video tutorials. Enterprise customers receive dedicated implementation support, live training sessions, custom template development, and a dedicated success manager to ensure maximum team adoption.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? "Ready to transform your team's writing?"
    const ctaDesc =
      props.cta?.description ??
      "Join 2,400+ enterprise teams already using WriteMind to create better content, faster. Start your 14-day free trial today."
    const ctaPrimary = props.cta?.primaryCta ?? "Start free trial"
    const ctaSecondary = props.cta?.secondaryCta ?? "Watch demo"
    const ctaBadges = props.cta?.badges?.length
      ? props.cta.badges
      : ["No credit card required", "14-day free trial", "Cancel anytime"]

    const footerTagline =
      props.footer?.tagline ??
      "The enterprise AI writing platform that helps teams create better content, faster. Trusted by Fortune 500 companies worldwide."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Integrations", "Changelog", "Documentation"],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Press", "Partners"],
          },
          {
            title: "Resources",
            links: ["Help Center", "Community", "Webinars", "Templates", "API Reference"],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ?? `\u00A9 ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Security", "Cookies"]

    // Logo mark — geometric layers icon (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )

    const Cross = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
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

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    )

    const Play = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
          clipRule="evenodd"
        />
      </svg>
    )

    const ChevronDown = () => (
      <svg
        className="size-5 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    )

    const featureIcons: ReactNode[] = [
      // edit/pen
      <svg
        key="edit"
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
        <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>,
      // users
      <svg
        key="users"
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
        <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>,
      // check-circle
      <svg
        key="check-circle"
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
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // calendar/workflow
      <svg
        key="calendar"
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
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>,
      // star
      <svg
        key="star"
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
        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>,
      // shield
      <svg
        key="shield"
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
      </svg>,
    ]

    const stepIcons: ReactNode[] = [
      <svg
        key="s1"
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
        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>,
      <svg
        key="s2"
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
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      <svg
        key="s3"
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
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
    ]

    const socialIcons: ReactNode[] = [
      // Twitter
      <svg key="tw" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
      </svg>,
      // LinkedIn
      <svg key="li" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>,
      // GitHub
      <svg key="gh" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.393-3.369-1.393-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          clipRule="evenodd"
        />
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
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
          <nav
            className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
            aria-label="Primary navigation"
          >
            <button
              type="button"
              onClick={() => go(brand)}
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground"
            >
              <LogoMark className="size-8 text-primary" />
              {brand}
            </button>

            <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {isSignedIn ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open account menu"
                      className="hidden h-10 max-w-48 items-center gap-2 rounded-full border border-border bg-background/90 px-2 py-1 text-foreground shadow-sm transition hover:border-foreground/20 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
                    >
                      <Avatar
                        size="sm"
                        className="ring-2 ring-background"
                        aria-hidden="true"
                      >
                        {authPicture ? (
                          <AvatarImage
                            src={authPicture}
                            alt={authDisplayName}
                          />
                        ) : null}
                        <AvatarFallback className="bg-foreground text-[0.65rem] font-bold text-background">
                          {authInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden max-w-24 truncate text-sm font-semibold md:block">
                        {authDisplayName}
                      </span>
                      <ChevronDown />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    sideOffset={10}
                    className="w-72 overflow-hidden rounded-xl border-border bg-background p-0 shadow-xl"
                  >
                    <div className="bg-muted/40 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar size="lg" className="ring-2 ring-background">
                          {authPicture ? (
                            <AvatarImage
                              src={authPicture}
                              alt={authDisplayName}
                            />
                          ) : null}
                          <AvatarFallback className="bg-foreground text-sm font-bold text-background">
                            {authInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-foreground">
                            {authDisplayName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {authEmail ?? 'Signed in to this session'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        type="button"
                        onClick={() => go('Account')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Account
                        <ArrowRight className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => go('Settings')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Settings
                        <ArrowRight className="size-4" />
                      </button>
                    </div>
                    <div className="border-t border-border p-2">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center justify-center rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        Sign out
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={auth.isLoading}
                  aria-label="Sign in with Google"
                  className="hidden h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background shadow-sm transition hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 sm:inline-flex"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                    G
                  </span>
                  <span>{authLabel}</span>
                </button>
              )}
              <Sheet open={trialDrawerOpen} onOpenChange={setTrialDrawerOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setTrialDrawerOpen(true)}
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Start Free Trial
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full gap-0 p-0 sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">Start your free trial</SheetTitle>
                    <SheetDescription>
                      {trialRequests && trialRequests.length > 0
                        ? `${trialRequests.length} trial request${trialRequests.length === 1 ? '' : 's'} submitted.`
                        : 'Enter your details to start your 14-day free trial.'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {trialRequests && trialRequests.length > 0 ? (
                      <div className="space-y-4">
                        {trialRequests.map((request) => (
                          <div
                            key={request.id}
                            className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-4 last:border-0"
                          >
                            <div className="grid size-12 place-items-center rounded-lg bg-muted">
                              <span className="text-lg font-bold text-foreground">
                                {request.plan[0]}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                {request.plan}
                              </p>
                              <p className="text-sm font-semibold text-foreground">
                                {request.company}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {request.email}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-foreground"
                          >
                            Work email
                          </label>
                          <input
                            id="email"
                            type="email"
                            placeholder="you@company.com"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="company"
                            className="mb-2 block text-sm font-medium text-foreground"
                          >
                            Company name
                          </label>
                          <input
                            id="company"
                            type="text"
                            placeholder="Acme Corp"
                            value={companyInput}
                            onChange={(e) => setCompanyInput(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="plan"
                            className="mb-2 block text-sm font-medium text-foreground"
                          >
                            Select plan
                          </label>
                          <select
                            id="plan"
                            value={selectedPlan}
                            onChange={(e) => setSelectedPlan(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="Starter">Starter</option>
                            <option value="Professional">Professional</option>
                            <option value="Enterprise">Enterprise</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    {trialRequests && trialRequests.length > 0 ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-full"
                        onClick={() => {
                          for (const request of trialRequests) {
                            void removeTrialRequest(request.id)
                          }
                        }}
                      >
                        Clear all requests
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        disabled={!emailInput || !companyInput}
                        className="w-full rounded-full"
                        onClick={handleSubmitTrial}
                      >
                        Submit request
                      </Button>
                    )}
                    <SheetClose asChild>
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full rounded-full"
                      >
                        Close
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-gradient-to-br from-muted via-background to-primary/5" aria-label="Hero">
            <div className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-40 lg:pt-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div>
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    {heroBadge}
                  </div>
                  <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {headingTop}
                    <br />
                    <span className="text-primary">{headingBottom}</span>
                  </h1>
                  <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    {heroSub}
                  </p>
                  <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setTrialDrawerOpen(true)}
                      className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <ArrowRight className="ml-2 size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-lg border border-input bg-card px-6 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      <Play className="mr-2 size-5 text-muted-foreground" />
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

                {/* Chat/editor mockup */}
                <div className="relative">
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                    <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
                      <div className="flex gap-1.5">
                        <span className="size-3 rounded-full bg-destructive/70" />
                        <span className="size-3 rounded-full bg-chart-4" />
                        <span className="size-3 rounded-full bg-chart-2" />
                      </div>
                      <div className="flex-1 text-center">
                        <span className="text-xs font-medium text-muted-foreground">
                          {previewTitle}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4 p-6">
                      <div className="flex gap-3">
                        <div className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs font-bold shadow-sm">
                          AI
                        </div>
                        <div className="flex-1 rounded-lg bg-muted px-4 py-2 text-sm text-muted-foreground">
                          {previewIntro}
                        </div>
                      </div>
                      <div className="flex flex-row-reverse gap-3">
                        <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-sm">
                          WM
                        </div>
                        <div className="flex-1 rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-muted-foreground">
                          <p className="mb-2 font-semibold text-foreground">{previewBody}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {previewActions.map((action, i) => (
                              <button
                                key={action}
                                type="button"
                                onClick={() => go(action)}
                                className={cn(
                                  "rounded px-3 py-1 text-xs font-medium transition-colors",
                                  i === 2
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "border border-input bg-card text-muted-foreground hover:text-foreground hover:bg-muted",
                                )}
                              >
                                {action}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs font-bold shadow-sm">
                          AI
                        </div>
                        <div className="flex flex-1 items-center gap-2 text-sm text-muted-foreground">
                          <span className="size-2 animate-pulse rounded-full bg-primary" />
                          WriteMind is refining tone for executive audience...
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating status cards */}
                  <div className="absolute -top-6 -right-6 hidden rounded-xl border border-border bg-card p-4 shadow-lg lg:block">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-lg bg-chart-2/10">
                        <Check className="size-6 text-chart-2" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{floatingCards[0].label}</p>
                        <p className="text-xs text-muted-foreground">{floatingCards[0].sub}</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -left-6 hidden rounded-xl border border-border bg-card p-4 shadow-lg lg:block">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-lg bg-chart-4/10">
                        <svg
                          className="size-6 text-chart-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{floatingCards[1].label}</p>
                        <p className="text-xs text-muted-foreground">{floatingCards[1].sub}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </section>

          {/* Logos */}
          <section className="border-b border-border bg-background py-12" aria-label="Trusted by">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-70 grayscale transition-all duration-500 hover:grayscale-0 md:grid-cols-3 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="flex h-12 items-center justify-center text-xl font-bold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-muted py-24" aria-label="Features">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/20 px-3 py-1 text-sm font-semibold text-primary">
                  {featuresBadge}
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
                  >
                    <div className="mb-4 grid size-12 place-items-center rounded-lg bg-muted text-foreground transition-colors">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-foreground py-16" aria-label="Statistics">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <div className="mb-2 text-4xl font-bold text-background sm:text-5xl">
                      {s.value}
                    </div>
                    <div className="text-sm text-primary/60">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Solutions */}
          <section className="bg-background py-24" aria-label="Solutions">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/20 px-3 py-1 text-sm font-semibold text-primary">
                  {solutionsBadge}
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {solutionsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{solutionsDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {solutionItems.map((item) => (
                  <div
                    key={item.title}
                    className="group relative overflow-hidden rounded-xl border border-border transition-colors hover:border-primary/30"
                  >
                    <Image
                      alt={item.imageAlt}
                      w={800}
                      h={400}
                      loading="lazy"
                      className="aspect-[2/1] w-full object-cover"
                    />
                    <div className="p-6">
                      <h3 className="mb-2 text-lg font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="mb-4 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                      <button
                        type="button"
                        onClick={() => go(item.cta ?? "Learn more")}
                        className="text-sm font-medium text-primary transition-colors hover:underline"
                      >
                        Learn more →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="bg-muted py-24" aria-label="How it works">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/20 px-3 py-1 text-sm font-semibold text-primary">
                  {stepsBadge}
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="relative grid gap-8 lg:grid-cols-3">
                <div
                  aria-hidden="true"
                  className="absolute left-[16%] right-[16%] top-12 hidden h-0.5 bg-gradient-to-r from-primary via-primary/60 to-primary lg:block"
                />
                {stepItems.map((step, i) => (
                  <div
                    key={step.title}
                    className="relative rounded-xl border border-border bg-card p-8"
                  >
                    <div className="absolute -top-4 left-8 grid size-8 place-items-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-sm">
                      {i + 1}
                    </div>
                    <div className="pt-4">
                      <div className="mb-4 grid size-12 place-items-center rounded-lg bg-muted text-foreground transition-colors">
                        {stepIcons[i % stepIcons.length]}
                      </div>
                      <h3 className="mb-3 text-xl font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-background py-24" aria-label="Product gallery">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/20 px-3 py-1 text-sm font-semibold text-primary">
                  {galleryBadge}
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{galleryDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {galleryItems.map((item) => (
                  <div
                    key={item.title}
                    className="group relative overflow-hidden rounded-xl border border-border bg-muted"
                  >
                    <Image
                      alt={item.imageAlt}
                      w={900}
                      h={600}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-foreground/80 via-transparent to-transparent p-6">
                      <div className="text-background">
                        <h3 className="mb-1 text-lg font-semibold">
                          {item.title}
                        </h3>
                        <p className="text-sm text-background/80">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted py-24" aria-label="Customer testimonials">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/20 px-3 py-1 text-sm font-semibold text-primary">
                  {testimonialsBadge}
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{testimonialsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-xl border border-border bg-card p-6"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
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
                        className="size-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-foreground">
                          {t.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-background py-24" aria-label="Pricing">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/20 px-3 py-1 text-sm font-semibold text-primary">
                  {pricingBadge}
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative rounded-2xl p-8",
                      plan.featured
                        ? "border border-background/20 bg-foreground text-background"
                        : "border border-border bg-card text-foreground",
                    )}
                  >
                    {plan.featured && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="inline-block rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="mb-6">
                      <h3
                        className={cn(
                          "mb-2 text-xl font-semibold",
                          plan.featured ? "text-background" : "text-foreground",
                        )}
                      >
                        {plan.name}
                      </h3>
                      <p
                        className={cn(
                          "mb-6 text-sm",
                          plan.featured
                            ? "text-background/60"
                            : "text-muted-foreground",
                        )}
                      >
                        {plan.tagline}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={cn(
                            "text-4xl font-bold",
                            plan.featured ? "text-background" : "text-foreground",
                          )}
                        >
                          {plan.price}
                        </span>
                        {plan.period && (
                          <span
                            className={cn(
                              plan.featured
                                ? "text-background/60"
                                : "text-muted-foreground",
                            )}
                          >
                            {plan.period}
                          </span>
                        )}
                      </div>
                    </div>
                    <ul className="mb-8 space-y-3">
                      {plan.included.map((feat) => (
                        <li key={feat} className="flex items-center gap-3 text-sm">
                          <Check
                            className={cn(
                              "size-5 shrink-0",
                              plan.featured ? "text-primary" : "text-chart-2",
                            )}
                          />
                          <span
                            className={cn(
                              plan.featured
                                ? "text-background/80"
                                : "text-foreground",
                            )}
                          >
                            {feat}
                          </span>
                        </li>
                      ))}
                      {(plan.excluded ?? []).map((feat) => (
                        <li
                          key={feat}
                          className="flex items-center gap-3 text-sm"
                        >
                          <Cross
                            className={cn(
                              "size-5 shrink-0",
                              plan.featured
                                ? "text-background/40"
                                : "text-muted-foreground/40",
                            )}
                          />
                          <span
                            className={cn(
                              plan.featured
                                ? "text-background/50"
                                : "text-muted-foreground",
                            )}
                          >
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlan(plan.name)
                        setTrialDrawerOpen(true)
                      }}
                      className={cn(
                        "block w-full rounded-lg px-6 py-3 text-center font-semibold transition-colors",
                        plan.featured
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-primary/10 text-primary hover:bg-primary/20",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-center text-sm text-muted-foreground">
                {pricingNote}
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted py-24" aria-label="FAQ">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/20 px-3 py-1 text-sm font-semibold text-primary">
                  {faqBadge}
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-xl border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="font-semibold text-foreground">
                        {item.question}
                      </span>
                      <span className="ml-6 shrink-0">
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
                      </span>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section
            className="relative overflow-hidden bg-foreground py-24"
            aria-label="Call to action"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background/20"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-20"
            >
              <div className="absolute top-0 left-1/4 size-96 rounded-full bg-primary/30 blur-3xl" />
              <div className="absolute bottom-0 right-1/4 size-96 rounded-full bg-secondary/30 blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold text-background sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-xl text-background/70">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setTrialDrawerOpen(true)}
                  className="inline-flex items-center justify-center rounded-lg bg-background px-8 py-4 text-lg font-semibold text-foreground shadow-xl transition-colors hover:bg-background/90"
                >
                  {ctaPrimary}
                  <ArrowRight className="ml-2 size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center rounded-lg border-2 border-background/30 px-8 py-4 text-lg font-semibold text-background transition-colors hover:border-background/60"
                >
                  <Play className="mr-2 size-5" />
                  {ctaSecondary}
                </button>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-background/60">
                {ctaBadges.map((badge) => (
                  <div key={badge} className="flex items-center gap-2">
                    <Check className="size-5 text-background" />
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background/60" aria-label="Footer">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="md:col-span-2 lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(brand)}
                  className="mb-4 flex items-center gap-2 text-xl font-bold text-background"
                >
                  <LogoMark className="size-8 text-primary" />
                  {brand}
                </button>
                <p className="mb-6 max-w-sm text-sm text-background/60">
                  {footerTagline}
                </p>
                <div className="flex gap-4">
                  {["Twitter", "LinkedIn", "GitHub"].map((social, i) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-lg bg-background/10 text-background/60 transition-colors hover:bg-background/20 hover:text-background"
                    >
                      {socialIcons[i]}
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
              <p className="text-sm text-background/60">{footerCopyright}</p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="transition-colors hover:text-background"
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
