import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * AiProductKimiPage — a complete, self-contained AI SaaS PRODUCT landing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "WriteFlow AI" design: a
 * clean, light, minimal aesthetic (neutral surfaces, near-black ink CTAs,
 * generous whitespace, sticky blurred navbar). It pairs a split hero (live
 * status pill + huge headline + dual CTAs + trust microcopy) with a mocked
 * chat/editor preview card, a trusted-by logo strip, a 6-up feature grid with
 * icon tiles, a 3-step onboarding timeline, a product screenshot gallery, a
 * 3-tier pricing block with a highlighted "Most popular" plan, a 4-up stats
 * band, a 6-card star-rated testimonial wall, an FAQ accordion, a dark inverted
 * final CTA, and a rich multi-column footer with status indicator.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. Surfaces map to
 * semantic tokens (background/card/muted/primary), so it themes cleanly. Every
 * nav item / CTA / link / FAQ / social routes through `useNavigate` (never a
 * dead "#"). All content imagery uses the alt-driven <Image> component. Callers
 * supply ONLY content data; rich defaults make it render great with no props.
 */
export const AiProductKimiPage = defineComponent({
  name: "AiProductKimiPage",
  description:
    "Complete AI-product / AI-SaaS LANDING page with a clean, light, minimal aesthetic: neutral surfaces, near-black primary CTAs, sticky blurred navbar and generous whitespace. Includes a split hero (live status pill, large headline, dual CTAs, no-credit-card trust line) with a mocked AI chat/editor preview card, a trusted-by logo strip, a 6-up feature grid with icon tiles, a 3-step onboarding timeline, a product screenshot gallery, a 3-tier pricing table with a highlighted Most-Popular plan, a 4-up metrics/stats band, a 6-card star-rated testimonial wall, an FAQ accordion, a dark inverted final call-to-action, and a multi-column footer with social links and an all-systems-operational status. Use as the ROOT/home page for AI writing assistants, AI copilots, generative-AI tools, AI productivity apps, developer-AI products, or any modern SaaS/startup launch page when a polished, trustworthy, conversion-focused marketing site with features, pricing, social proof and FAQ is wanted. Supply content only — brand, nav, hero, logos, features, steps, gallery, pricing, stats, testimonials, faq, finalCta, footer; the block owns all layout and styling.",
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
        /** Second heading line, rendered muted under the first. */
        headingBottom: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        /** Trust microcopy beneath the CTAs. */
        trust: z.array(z.string()).optional(),
        /** Filename shown in the preview card title bar. */
        previewFile: z.string().optional(),
        /** AI suggestion intro line in the preview card. */
        previewIntro: z.string().optional(),
        /** AI suggestion body (italic) in the preview card. */
        previewQuote: z.string().optional(),
        /** Action chips beneath the AI suggestion. */
        previewActions: z.array(z.string()).optional(),
      })
      .optional(),
    /** Trusted-by logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
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
    /** 3-step onboarding timeline. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        cta: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Product screenshot gallery. */
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** 3-tier pricing block. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        note: z.string().optional(),
        noteLink: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              period: z.string(),
              cta: z.string(),
              featured: z.boolean().optional(),
              features: z.array(z.string()),
            }),
          )
          .optional(),
      })
      .optional(),
    /** 4-up stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Star-rated testimonial wall. */
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
        contactLink: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark inverted final call-to-action. */
    finalCta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        badges: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        copyright: z.string().optional(),
        status: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "WriteFlow"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Pricing", "Stories", "FAQ"]

    const heroBadge =
      props.hero?.badge ?? "Now with GPT-4 powered suggestions"
    const headingTop = props.hero?.headingTop ?? "Write faster."
    const headingBottom = props.hero?.headingBottom ?? "Think clearer."
    const heroSub =
      props.hero?.subheading ??
      "WriteFlow AI understands your voice and helps you draft, edit, and polish content in minutes instead of hours. Trusted by 50,000+ writers at companies like Notion, Figma, and Stripe."
    const heroPrimary = props.hero?.primaryCta ?? "Start writing free"
    const heroSecondary = props.hero?.secondaryCta ?? "Watch demo (2:34)"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["No credit card required", "14-day free trial"]
    const previewFile = props.hero?.previewFile ?? "blog-post-draft.md"
    const previewIntro =
      props.hero?.previewIntro ??
      "Here's a refined opening that hooks readers immediately:"
    const previewQuote =
      props.hero?.previewQuote ??
      "The blank page stares back. You've been here before—the cursor blinking, the deadline looming, the perfect words hiding just out of reach. What if writing didn't have to be this hard?"
    const previewActions = props.hero?.previewActions?.length
      ? props.hero.previewActions
      : ["Use this", "Try again", "Make shorter"]

    const logosLabel = props.logos?.label ?? "Trusted by teams at"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Notion", "Figma", "Stripe", "Linear", "Vercel", "Shopify"]

    const featuresHeading =
      props.features?.heading ?? "Everything you need to write better"
    const featuresDesc =
      props.features?.description ??
      "From first draft to final polish, WriteFlow accelerates every step of your writing workflow."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "AI-Powered Suggestions",
            description:
              "Get intelligent completions, rewrites, and tone adjustments as you type. Trained on millions of professional documents to match your style.",
          },
          {
            title: "Grammar & Clarity",
            description:
              "Catch grammar errors, awkward phrasing, and unclear sentences before you publish. Our AI explains every suggestion so you learn as you edit.",
          },
          {
            title: "Tone & Voice Control",
            description:
              "Switch between professional, casual, persuasive, or friendly tones with one click. Perfect for adapting content for different audiences.",
          },
          {
            title: "Templates Library",
            description:
              "Start with 200+ professionally crafted templates for emails, blog posts, social media, proposals, and more. Customizable to your brand voice.",
          },
          {
            title: "Team Collaboration",
            description:
              "Share documents, leave comments, and maintain a consistent brand voice across your entire team with shared style guides and approval workflows.",
          },
          {
            title: "API & Integrations",
            description:
              "Connect WriteFlow to your existing tools with our REST API and native integrations for VS Code, Chrome, Slack, Notion, and Google Docs.",
          },
        ]

    const stepsHeading =
      props.steps?.heading ?? "Start writing smarter in 3 steps"
    const stepsDesc =
      props.steps?.description ??
      "From signup to your first AI-assisted document in under 5 minutes."
    const stepsCta = props.steps?.cta ?? "Get started now — it's free"
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Create your account",
            description:
              "Sign up with your email or Google account. No credit card required for the 14-day trial. Choose your primary use case during onboarding.",
          },
          {
            title: "Set your preferences",
            description:
              "Tell us about your writing style, preferred tone, and industry. The AI learns from examples you provide to match your unique voice.",
          },
          {
            title: "Start creating",
            description:
              "Open the editor, pick a template or start from scratch, and experience AI-assisted writing. Export to any format or publish directly.",
          },
        ]

    const galleryHeading =
      props.gallery?.heading ?? "See WriteFlow in action"
    const galleryDesc =
      props.gallery?.description ??
      "Real screenshots from the app showing powerful features that transform your writing workflow."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Distraction-free editor",
            description: "Clean interface that keeps you focused on writing.",
          },
          {
            title: "Real-time collaboration",
            description: "Work together with your team in real-time.",
          },
          {
            title: "Writing analytics",
            description: "Track productivity and improvement over time.",
          },
          {
            title: "Template library",
            description: "200+ templates to jumpstart any writing project.",
          },
          {
            title: "Idea capture",
            description: "Quick capture tools for inspiration anywhere.",
          },
          {
            title: "Export anywhere",
            description: "Publish to Word, PDF, Markdown, or your CMS.",
          },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start free, upgrade when you're ready. No hidden fees, cancel anytime."
    const pricingNote =
      props.pricing?.note ??
      "All plans include a 14-day free trial. Need a custom enterprise solution?"
    const pricingNoteLink = props.pricing?.noteLink ?? "Let's talk"
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Free",
            tagline: "Perfect for trying out WriteFlow",
            price: "$0",
            period: "/month",
            cta: "Get started free",
            features: [
              "10 AI generations per day",
              "Basic grammar & spelling",
              "25 templates",
              "Chrome extension",
            ],
          },
          {
            name: "Pro",
            tagline: "For serious writers & professionals",
            price: "$19",
            period: "/month",
            cta: "Start 14-day free trial",
            featured: true,
            features: [
              "Unlimited AI generations",
              "Advanced tone & style controls",
              "200+ templates",
              "Plagiarism detection",
              "All integrations",
              "Priority support",
            ],
          },
          {
            name: "Team",
            tagline: "For teams that write together",
            price: "$49",
            period: "/user/month",
            cta: "Contact sales",
            features: [
              "Everything in Pro",
              "Team style guides",
              "Admin controls & analytics",
              "SSO & advanced security",
              "Dedicated success manager",
            ],
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "50K+", label: "Active writers" },
          { value: "12M+", label: "Documents created" },
          { value: "4.9", label: "Average rating" },
          { value: "3.2 hrs", label: "Saved per day on average" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by writers worldwide"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See what professionals say about how WriteFlow transformed their writing workflow."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "WriteFlow has completely changed how I approach content creation. What used to take me 4 hours now takes 90 minutes. The tone adjustment feature alone is worth the subscription.",
            name: "Sarah Chen",
            role: "Content Lead at Notion",
            avatarAlt:
              "Professional headshot of Sarah Chen, a content marketing manager with dark hair",
          },
          {
            quote:
              "As a freelance copywriter, I juggle 15+ clients with different brand voices. WriteFlow's style guides help me switch between them instantly. Game changer for my business.",
            name: "Marcus Thompson",
            role: "Freelance Copywriter",
            avatarAlt:
              "Professional headshot of Marcus Thompson, a copywriter with short beard and glasses",
          },
          {
            quote:
              "Our marketing team doubled output after adopting WriteFlow. The collaborative features and brand voice consistency have made us significantly more efficient.",
            name: "Elena Rodriguez",
            role: "Marketing Director at Figma",
            avatarAlt:
              "Professional headshot of Elena Rodriguez, a marketing director with curly brown hair",
          },
          {
            quote:
              "I was skeptical about AI writing tools until I tried WriteFlow. It doesn't replace my voice—it amplifies it. My editor noticed the improvement immediately.",
            name: "David Park",
            role: "Author & Journalist",
            avatarAlt:
              "Professional headshot of David Park, an author with thoughtful expression",
          },
          {
            quote:
              "The Chrome extension is incredible—I use it for emails, social posts, and even comments. It's like having a professional editor looking over my shoulder.",
            name: "Amara Wilson",
            role: "CEO at TechFlow",
            avatarAlt:
              "Professional headshot of Amara Wilson, a startup founder with bright smile",
          },
          {
            quote:
              "We evaluated 8 different AI writing tools. WriteFlow won on output quality, UI design, and customer support. Our whole team is on it now.",
            name: "James Miller",
            role: "CTO at StackBlitz",
            avatarAlt:
              "Professional headshot of James Miller, a CTO with confident expression",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about WriteFlow. Can't find what you're looking for?"
    const faqContactLink = props.faq?.contactLink ?? "Contact our team"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How does WriteFlow's AI actually work?",
            answer:
              "WriteFlow uses a combination of large language models (including GPT-4) trained specifically on high-quality professional writing. When you use our suggestions feature, the AI analyzes your context, writing style, and intent to provide relevant completions and improvements. Your data is never used to train our models—your writing stays private.",
          },
          {
            question: "Is my content secure and private?",
            answer:
              "Absolutely. We use enterprise-grade encryption (AES-256) for all data at rest and in transit. Your documents are never used to train AI models. We're SOC 2 Type II certified and GDPR compliant. For enterprise customers, we offer data residency options and custom security configurations.",
          },
          {
            question: "Can I cancel my subscription anytime?",
            answer:
              "Yes, you can cancel anytime with no questions asked. If you cancel, you'll continue to have access until the end of your billing period. We also offer a 30-day money-back guarantee for annual plans if you're not completely satisfied.",
          },
          {
            question: "What integrations do you support?",
            answer:
              "We offer native integrations with Google Docs, Notion, Slack, VS Code, Chrome, Microsoft Word, and Figma. Our REST API and Zapier integration let you connect to 5,000+ other apps. New integrations are released monthly based on user requests.",
          },
          {
            question: "Do you offer discounts for students or non-profits?",
            answer:
              "Yes! We offer 50% off Pro plans for verified students and educators through GitHub Education. Registered non-profits receive 40% off Team plans. Contact our sales team with your organization's documentation to get set up.",
          },
          {
            question: "What's included in the 14-day free trial?",
            answer:
              "The trial includes full access to all Pro features: unlimited AI generations, all 200+ templates, tone adjustments, plagiarism detection, and all integrations. No credit card required to start. At the end of 14 days, choose a plan or continue with our generous free tier.",
          },
        ]

    const finalHeading =
      props.finalCta?.heading ?? "Start writing better today"
    const finalDesc =
      props.finalCta?.description ??
      "Join 50,000+ writers who've already transformed their workflow. 14-day free trial, no credit card required."
    const finalPrimary = props.finalCta?.primaryCta ?? "Get started free"
    const finalSecondary = props.finalCta?.secondaryCta ?? "Talk to sales"
    const finalBadges = props.finalCta?.badges?.length
      ? props.finalCta.badges
      : ["Free 14-day trial", "No credit card", "Cancel anytime"]

    const footerTagline =
      props.footer?.tagline ??
      "AI-powered writing assistant that helps professionals write faster, clearer, and with more confidence."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: [
              "Features",
              "Pricing",
              "Integrations",
              "Changelog",
              "Roadmap",
            ],
          },
          {
            title: "Resources",
            links: [
              "Documentation",
              "API Reference",
              "Templates",
              "Blog",
              "Community",
            ],
          },
          {
            title: "Company",
            links: ["About", "Careers", "Press Kit", "Contact"],
          },
          {
            title: "Legal",
            links: [
              "Privacy Policy",
              "Terms of Service",
              "Cookie Policy",
              "Security",
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} AI, Inc. All rights reserved.`
    const footerStatus = props.footer?.status ?? "All systems operational"

    // Brand mark — near-black tile with a pen/edit glyph (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-foreground text-background",
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
          <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </span>
    )

    const Check = ({ className }: { className?: string }) => (
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
        <path d="M5 13l4 4L19 7" />
      </svg>
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

    const featureIcons: ReactNode[] = [
      // bolt
      <svg
        key="bolt"
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
      // chat
      <svg
        key="chat"
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
        <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>,
      // layout
      <svg
        key="layout"
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
        <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
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
      // code
      <svg
        key="code"
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
        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>,
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased selection:bg-primary/20",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
            <button
              type="button"
              onClick={() => go(brand)}
              className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground"
            >
              <LogoMark className="size-8" />
              {brand}
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
                className="inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                Start free trial
              </button>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pb-32 lg:pt-24">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="max-w-2xl">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {heroBadge}
                    </span>
                  </div>
                  <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {headingTop}
                    <br />
                    <span className="text-muted-foreground">
                      {headingBottom}
                    </span>
                  </h1>
                  <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    {heroSub}
                  </p>
                  <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-lg bg-foreground px-6 py-3 text-base font-medium text-background transition-colors hover:bg-foreground/90"
                    >
                      {heroPrimary}
                      <ArrowRight className="ml-2 size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
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
                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    {heroTrust.map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <Check className="size-5 text-primary" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview card */}
                <div className="relative">
                  <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
                    <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
                      <div className="flex gap-1.5">
                        <span className="size-3 rounded-full bg-destructive/70" />
                        <span className="size-3 rounded-full bg-chart-4" />
                        <span className="size-3 rounded-full bg-primary/70" />
                      </div>
                      <span className="ml-2 font-mono text-xs text-muted-foreground">
                        {previewFile}
                      </span>
                    </div>
                    <div className="space-y-4 p-6">
                      <div className="flex gap-3">
                        <span className="size-8 shrink-0 rounded-full bg-muted" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/4 rounded bg-muted" />
                          <div className="h-4 w-1/2 rounded bg-muted" />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-foreground text-background">
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
                            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </span>
                        <div className="flex-1 rounded-lg border border-border bg-muted/50 p-4">
                          <p className="mb-2 text-sm text-muted-foreground">
                            {previewIntro}
                          </p>
                          <p className="text-sm italic text-foreground">
                            &ldquo;{previewQuote}&rdquo;
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {previewActions.map((action, i) => (
                              <button
                                key={action}
                                type="button"
                                onClick={() => go(action)}
                                className={cn(
                                  "rounded px-3 py-1.5 text-xs font-medium transition-colors",
                                  i === 0
                                    ? "bg-foreground text-background hover:bg-foreground/90"
                                    : "text-muted-foreground hover:text-foreground",
                                )}
                              >
                                {action}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="size-8 shrink-0 rounded-full bg-muted" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-full rounded bg-muted" />
                          <div className="h-4 w-5/6 rounded bg-muted" />
                          <div className="h-4 w-4/6 rounded bg-muted" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    aria-hidden="true"
                    className="absolute -bottom-6 -right-6 size-24 rounded-full bg-muted blur-2xl"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute -left-6 -top-6 size-32 rounded-full bg-muted/50 blur-3xl"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border bg-muted/50">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-3 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="flex justify-center text-lg font-semibold text-muted-foreground transition-colors hover:text-foreground"
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
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
                {featureItems.map((item, i) => (
                  <div key={item.title} className="group">
                    <div className="mb-5 grid size-12 place-items-center rounded-xl bg-muted text-foreground transition-colors group-hover:bg-accent">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
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
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    {i < stepItems.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="absolute left-8 top-0 hidden h-full w-px bg-border md:block"
                      />
                    )}
                    <div className="relative flex items-start gap-6 md:block md:gap-0">
                      <div className="z-10 grid size-16 shrink-0 place-items-center rounded-2xl bg-foreground md:mb-6">
                        <span className="text-2xl font-bold text-background">
                          {i + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="mb-2 mt-4 text-lg font-semibold text-foreground md:mt-0">
                          {step.title}
                        </h3>
                        <p className="leading-relaxed text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-16 text-center">
                <button
                  type="button"
                  onClick={() => go(stepsCta)}
                  className="inline-flex items-center justify-center rounded-lg bg-foreground px-8 py-4 text-base font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  {stepsCta}
                </button>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{galleryDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => go(item.title)}
                    className="group block w-full overflow-hidden rounded-xl border border-border bg-card text-left transition-shadow hover:shadow-lg"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                      <Image
                        alt={item.title}
                        w={800}
                        h={600}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="mb-1 font-semibold text-card-foreground">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted/50 py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
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
                        ? "border-2 border-foreground"
                        : "border border-border",
                    )}
                  >
                    {plan.featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-block rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background">
                          Most popular
                        </span>
                      </div>
                    )}
                    <div className="mb-6">
                      <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                        {plan.name}
                      </h3>
                      <p className="mb-4 text-sm text-muted-foreground">
                        {plan.tagline}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-card-foreground">
                          {plan.price}
                        </span>
                        <span className="text-muted-foreground">
                          {plan.period}
                        </span>
                      </div>
                    </div>
                    <ul className="mb-8 space-y-4">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-3">
                          <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                          <span className="text-sm text-muted-foreground">
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "block w-full rounded-lg px-4 py-3 text-center font-medium transition-colors",
                        plan.featured
                          ? "bg-foreground text-background hover:bg-foreground/90"
                          : "bg-muted text-foreground hover:bg-accent",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-12 text-center">
                <p className="text-sm text-muted-foreground">
                  {pricingNote}{" "}
                  <button
                    type="button"
                    onClick={() => go(pricingNoteLink)}
                    className="text-foreground underline"
                  >
                    {pricingNoteLink}
                  </button>
                  .
                </p>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="border-y border-border py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statsItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="mb-2 text-4xl font-bold text-foreground lg:text-5xl">
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

          {/* Testimonials */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                    <div className="flex items-center gap-3">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-card-foreground">
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
          <section className="bg-muted/50 py-20 lg:py-32">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {faqDesc}{" "}
                  <button
                    type="button"
                    onClick={() => go(faqContactLink)}
                    className="text-foreground underline"
                  >
                    {faqContactLink}
                  </button>
                  .
                </p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-xl border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <h3 className="font-medium text-card-foreground">
                        {item.question}
                      </h3>
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
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl bg-foreground p-8 text-center sm:p-12 lg:p-16">
                <h2 className="mb-6 text-3xl font-semibold tracking-tight text-background sm:text-4xl lg:text-5xl">
                  {finalHeading}
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-background/70 sm:text-xl">
                  {finalDesc}
                </p>
                <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(finalPrimary)}
                    className="inline-flex items-center justify-center rounded-lg bg-background px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-background/90"
                  >
                    {finalPrimary}
                    <ArrowRight className="ml-2 size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(finalSecondary)}
                    className="inline-flex items-center justify-center rounded-lg border border-background/20 bg-background/10 px-8 py-4 text-base font-medium text-background transition-colors hover:bg-background/20"
                  >
                    {finalSecondary}
                  </button>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-background/60">
                  {finalBadges.map((badge) => (
                    <div key={badge} className="flex items-center gap-2">
                      <Check className="size-5 text-background" />
                      <span>{badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
              <div className="col-span-2 md:col-span-4 lg:col-span-1">
                <button
                  type="button"
                  onClick={() => go(brand)}
                  className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground"
                >
                  <LogoMark className="size-8" />
                  {brand}
                </button>
                <p className="mb-4 text-sm text-muted-foreground">
                  {footerTagline}
                </p>
                <div className="flex gap-4">
                  {(["Twitter", "LinkedIn", "GitHub"] as const).map(
                    (social) => (
                      <button
                        key={social}
                        type="button"
                        aria-label={social}
                        onClick={() => go(social)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {social}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-foreground">
                    {col.title}
                  </h4>
                  <ul className="space-y-3 text-sm">
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

            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">{footerCopyright}</p>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">
                  {footerStatus}
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
