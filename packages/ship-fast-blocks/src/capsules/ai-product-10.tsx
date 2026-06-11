import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * AiProductKimiPage10 — a complete AI SaaS PRODUCT landing page (template variant 10).
 *
 * A faithful Tailwind v4 token-only port of a Kimi-generated "WriteFlow AI" design:
 * a bright, gradient-forward aesthetic with soft color washes, a split hero that
 * includes a chat/editor preview card, a trusted-by logo strip, a 6-up feature
 * grid with colored icon tiles, a 3-step onboarding timeline with imagery, a
 * bento-style product gallery, a 3-tier pricing block with a dark "Most Popular"
 * featured plan, a dark inverted stats band, a 6-card star-rated testimonial wall,
 * an always-open FAQ card list, a vibrant gradient final CTA, and a rich dark
 * multi-column footer with social links.
 *
 * This is the 10th style variant sibling to AiProductKimiPage — visually distinct
 * with more color, a bento gallery, and an editor-mockup hero. Use as a ROOT/home
 * page for AI writing assistants, generative AI tools, AI copilots, creative AI
 * SaaS, marketing tech, productivity apps, and modern startup launch pages when a
 * bright, modern, conversion-focused layout with rich visual variety and brand
 * warmth is wanted. Supply content only; the block owns all layout and styling.
 */
export const AiProductKimiPage10 = defineCapsule({
  name: "AiProductKimiPage10",
  description:
    "Complete AI-product / AI-SaaS LANDING page with a bright, gradient-forward aesthetic, soft color washes, a chat-editor hero preview, a bento product gallery, steps with imagery, a dark featured pricing tier, a star-rated testimonial wall, always-open FAQ cards, and a vibrant gradient final CTA. This is the 10th style variant sibling to AiProductKimiPage. Use for AI writing assistants, generative AI tools, AI copilots, creative SaaS, marketing tech, and productivity startups that want a modern, conversion-focused page with rich visual variety and brand warmth.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    hero: z
      .object({
        badge: z.string().optional(),
        headingTop: z.string().optional(),
        headingGradient: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        trustLabel: z.string().optional(),
        previewTitle: z.string().optional(),
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
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
      })
      .optional(),
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
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
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
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
              avatarAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    finalCta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
      })
      .optional(),
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        copyright: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "WriteFlow"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Pricing", "Reviews", "FAQ"]

    const heroBadge =
      props.hero?.badge ?? "Now with GPT-4 Turbo integration"
    const headingTop =
      props.hero?.headingTop ?? "Write faster with "
    const headingGradient =
      props.hero?.headingGradient ?? "AI that sounds like you"
    const heroSub =
      props.hero?.subheading ??
      "WriteFlow helps marketing teams, founders, and content creators produce high-converting copy in minutes. Maintain your brand voice across every channel."
    const heroPrimary =
      props.hero?.primaryCta ?? "Start 14-day free trial"
    const heroSecondary =
      props.hero?.secondaryCta ?? "Watch 2-min demo"
    const heroTrust =
      props.hero?.trustLabel ?? "Trusted by 12,000+ writers"
    const previewTitle =
      props.hero?.previewTitle ?? "WriteFlow Editor"

    const logosLabel = props.logos?.label ?? "Trusted by teams at"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Notion", "Stripe", "Figma", "Linear", "Webflow", "Vercel"]

    const featuresHeading =
      props.features?.heading ?? "Everything you need to write at scale"
    const featuresDesc =
      props.features?.description ??
      "From first draft to final polish, WriteFlow streamlines your entire content workflow with AI that understands your brand."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Smart Draft Generation",
            description:
              "Generate blog posts, emails, and social content from a brief outline. Our AI produces 1,200-word articles in under 60 seconds.",
          },
          {
            title: "Brand Voice Training",
            description:
              "Upload your best content and WriteFlow learns your tone, style, and terminology. Maintain consistency across all channels and writers.",
          },
          {
            title: "Grammar & Clarity Check",
            description:
              "Catch errors, improve readability, and simplify complex sentences. Flesch Reading Ease scoring built into every document.",
          },
          {
            title: "Content Templates",
            description:
              "50+ pre-built templates for landing pages, product descriptions, LinkedIn posts, and email sequences. Custom template builder included.",
          },
          {
            title: "Team Collaboration",
            description:
              "Real-time editing, comments, and approval workflows. Role-based access for editors, reviewers, and external clients.",
          },
          {
            title: "SEO Optimization",
            description:
              "Built-in keyword suggestions, meta description generator, and content scoring against top-ranking competitors.",
          },
        ]

    const stepsHeading =
      props.steps?.heading ?? "From idea to publish in three steps"
    const stepsDesc =
      props.steps?.description ??
      "WriteFlow integrates seamlessly into your existing workflow. No complex setup or steep learning curve."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Describe your content",
            description:
              "Enter a brief description, paste existing content to rewrite, or choose from 50+ templates. Add your target audience and key points.",
          },
          {
            title: "AI generates drafts",
            description:
              "WriteFlow produces multiple variations in your brand voice. Choose the best version or blend elements from different drafts.",
          },
          {
            title: "Refine and publish",
            description:
              "Edit in real-time with AI suggestions, get team feedback, and publish directly to WordPress, HubSpot, or your CMS.",
          },
        ]

    const galleryHeading =
      props.gallery?.heading ?? "A workspace designed for flow"
    const galleryDesc =
      props.gallery?.description ??
      "Clean, distraction-free interface with powerful features just a keystroke away."

    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start free. Upgrade when you're ready. No credit card required to try."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Starter",
            tagline: "For individuals exploring AI writing",
            price: "$0",
            period: "/month",
            cta: "Get started free",
            featured: false,
            features: [
              "5,000 words per month",
              "10 content templates",
              "Basic grammar checking",
              "Brand voice training",
            ],
          },
          {
            name: "Professional",
            tagline: "For serious content creators",
            price: "$29",
            period: "/month",
            cta: "Start 14-day free trial",
            featured: true,
            features: [
              "Unlimited AI generations",
              "All 50+ templates",
              "Brand voice training (3 brands)",
              "SEO optimization tools",
              "Priority support",
            ],
          },
          {
            name: "Team",
            tagline: "For marketing teams & agencies",
            price: "$79",
            period: "/month",
            cta: "Contact sales",
            featured: false,
            features: [
              "Everything in Pro",
              "5 team members included",
              "Unlimited brand voices",
              "CMS integrations",
              "Dedicated account manager",
            ],
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "12K+", label: "Active writers" },
          { value: "45M+", label: "Words generated" },
          { value: "94%", label: "Time saved vs manual" },
          { value: "4.9/5", label: "Average rating" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by content teams"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See what marketing leaders and content creators say about WriteFlow."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "WriteFlow has completely transformed our content production. We went from publishing 2 blog posts a week to 8, while maintaining the same team size. The brand voice feature ensures everything sounds like us.",
            name: "Sarah Chen",
            role: "VP of Marketing, TechStart",
            avatarAlt:
              "professional headshot of Sarah Chen VP of Marketing at TechStart",
          },
          {
            quote:
              "As a freelance copywriter, I was skeptical of AI tools. WriteFlow surprised me—it doesn't replace my creativity, it accelerates it. I can deliver projects in half the time without sacrificing quality.",
            name: "Marcus Johnson",
            role: "Freelance Copywriter",
            avatarAlt:
              "professional headshot of Marcus Johnson freelance copywriter and content strategist",
          },
          {
            quote:
              "We onboarded 40 writers across 3 countries. WriteFlow's brand voice training meant every piece of content feels consistent, whether written by our New York or Singapore team. Game changer.",
            name: "Priya Patel",
            role: "Head of Content, Global Retail Co",
            avatarAlt:
              "professional headshot of Priya Patel Head of Content at Global Retail Co",
          },
          {
            quote:
              "The SEO optimization feature alone is worth the subscription. Our organic traffic increased 180% in 4 months after switching to WriteFlow for all our blog content.",
            name: "David Park",
            role: "SEO Director, GrowthLabs",
            avatarAlt:
              "professional headshot of David Park SEO Director at GrowthLabs",
          },
          {
            quote:
              "We used to spend $15K/month on external writers. With WriteFlow, our internal team handles everything and produces better content. ROI was positive within the first month.",
            name: "Jennifer Walsh",
            role: "CMO, FinanceApp",
            avatarAlt:
              "professional headshot of Jennifer Walsh CMO at FinanceApp",
          },
          {
            quote:
              "The mobile app lets me review and edit content during my commute. I can give feedback to my team before I even get to the office. Productivity win!",
            name: "Alex Rivera",
            role: "Content Manager, StartupXYZ",
            avatarAlt:
              "professional headshot of Alex Rivera content manager at StartupXYZ",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about WriteFlow. Can't find what you're looking for? Contact our team."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How does the brand voice training work?",
            answer:
              "Upload 3-5 samples of your best-performing content—blog posts, emails, landing pages, or social posts. Our AI analyzes vocabulary, sentence structure, tone markers, and stylistic preferences. Within minutes, WriteFlow generates a voice profile that guides all future content. You can create multiple profiles for different brands or content types.",
          },
          {
            question: "Is my content data secure and private?",
            answer:
              "Absolutely. WriteFlow is SOC 2 Type II certified and GDPR compliant. Your content is never used to train our AI models, and all data is encrypted in transit (TLS 1.3) and at rest (AES-256). Enterprise customers can request data residency in specific regions and sign BAAs for HIPAA compliance.",
          },
          {
            question: "Can I cancel my subscription anytime?",
            answer:
              "Yes. You can cancel, upgrade, or downgrade your plan at any time from your account settings. If you cancel, you'll retain access until the end of your current billing period. We also offer a 30-day money-back guarantee for annual plans—no questions asked.",
          },
          {
            question:
              "Do you offer discounts for nonprofits or students?",
            answer:
              "Yes! Verified nonprofits receive 50% off any paid plan. Students and educators with a .edu email address can access the Professional plan at $9/month. Contact our support team with documentation to apply these discounts to your account.",
          },
          {
            question: "What integrations do you support?",
            answer:
              "WriteFlow integrates with WordPress, HubSpot, Webflow, Notion, Google Docs, Slack, and 50+ other tools via Zapier. Our API is available on Team and Enterprise plans for custom integrations. New integrations are added monthly based on customer requests.",
          },
          {
            question: "How does the free trial work?",
            answer:
              "Start with full access to Professional features for 14 days—no credit card required. Generate up to 25,000 words, create 2 brand voice profiles, and invite 2 team members. At the end of your trial, choose a paid plan or continue with the free Starter plan with limited features.",
          },
        ]

    const finalHeading =
      props.finalCta?.heading ?? "Ready to write faster?"
    const finalDesc =
      props.finalCta?.description ??
      "Join 12,000+ writers who've transformed their content workflow. Start your free 14-day trial today—no credit card required."
    const finalPrimary =
      props.finalCta?.primaryCta ?? "Start free trial"
    const finalSecondary =
      props.finalCta?.secondaryCta ?? "Schedule a demo"

    const footerTagline =
      props.footer?.tagline ??
      "AI writing assistant that helps teams create high-quality content faster while maintaining their unique brand voice."
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
              "Blog",
              "Community",
              "Help Center",
            ],
          },
          {
            title: "Company",
            links: ["About", "Careers", "Contact", "Privacy", "Terms"],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} AI, Inc. All rights reserved.`

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-background",
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
        <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    )

    return (
      <div
        className={cn(
          "min-h-svh bg-muted text-foreground antialiased selection:bg-primary/20",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
            <button
              type="button"
              onClick={() => go(brand)}
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground"
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
                onClick={() => go("Log in")}
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                Log in
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
          <section className="relative overflow-hidden bg-background">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
            <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-40 lg:pt-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    {heroBadge}
                  </div>
                  <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {headingTop}
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {headingGradient}
                    </span>
                  </h1>
                  <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl lg:mx-0">
                    {heroSub}
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-xl bg-foreground px-8 py-4 text-base font-semibold text-background shadow-lg transition-colors hover:bg-foreground/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-8 py-4 text-base font-semibold text-foreground transition-colors hover:bg-muted"
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
                        <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-8 flex items-center justify-center gap-4 text-sm text-muted-foreground lg:justify-start">
                    <div className="flex -space-x-2">
                      <Image
                        alt="professional headshot of a smiling marketing director"
                        w={100}
                        h={100}
                        className="size-8 rounded-full object-cover ring-2 ring-background"
                      />
                      <Image
                        alt="professional headshot of a content strategist"
                        w={100}
                        h={100}
                        className="size-8 rounded-full object-cover ring-2 ring-background"
                      />
                      <Image
                        alt="professional headshot of a communications manager"
                        w={100}
                        h={100}
                        className="size-8 rounded-full object-cover ring-2 ring-background"
                      />
                    </div>
                    <span>{heroTrust}</span>
                  </div>
                </div>

                {/* Editor preview */}
                <div className="relative">
                  <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary to-accent opacity-20 blur-2xl" />
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                    <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
                      <div className="flex gap-1.5">
                        <span className="size-3 rounded-full bg-destructive/70" />
                        <span className="size-3 rounded-full bg-chart-4" />
                        <span className="size-3 rounded-full bg-primary/70" />
                      </div>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {previewTitle}
                      </span>
                    </div>
                    <div className="space-y-4 p-6">
                      <div className="flex items-start gap-3">
                        <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10">
                          <span className="text-xs font-bold text-primary">
                            WF
                          </span>
                        </div>
                        <div className="max-w-xs rounded-2xl rounded-tl-none bg-muted px-4 py-3">
                          <p className="text-sm text-foreground">
                            Draft a product announcement for our new AI feature
                            launch...
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-row-reverse items-start gap-3">
                        <div className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent">
                          <svg
                            className="size-4 text-background"
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
                        <div className="max-w-sm rounded-2xl rounded-tr-none border border-primary/20 bg-primary/5 px-4 py-3">
                          <p className="text-sm leading-relaxed text-foreground">
                            <span className="font-semibold">
                              Here's your announcement:
                            </span>
                            <br />
                            <br />
                            "We're thrilled to unveil SmartCompose AI—now
                            available in WriteFlow. Generate first drafts 10x
                            faster while maintaining your unique brand voice.
                            Early access starts June 15th..."
                          </p>
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => go("Regenerate")}
                              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                            >
                              Regenerate
                            </button>
                            <button
                              type="button"
                              onClick={() => go("Use this")}
                              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                              Use this
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10">
                          <span className="text-xs font-bold text-primary">
                            WF
                          </span>
                        </div>
                        <div className="flex items-center gap-2 rounded-2xl rounded-tl-none bg-muted px-4 py-3">
                          <div className="flex gap-1">
                            <div className="size-2 animate-bounce rounded-full bg-muted-foreground" />
                            <div
                              className="size-2 animate-bounce rounded-full bg-muted-foreground"
                              style={{ animationDelay: "0.1s" }}
                            />
                            <div
                              className="size-2 animate-bounce rounded-full bg-muted-foreground"
                              style={{ animationDelay: "0.2s" }}
                            />
                          </div>
                        </div>
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
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-3 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="flex items-center justify-center gap-2 text-lg font-bold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {logo === "Notion" && (
                      <svg
                        className="size-6"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    )}
                    {logo === "Stripe" && (
                      <svg
                        className="size-6"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    )}
                    {logo === "Figma" && (
                      <svg
                        className="size-6"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <rect x="2" y="2" width="20" height="20" rx="5" />
                      </svg>
                    )}
                    {logo === "Linear" && (
                      <svg
                        className="size-6"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    )}
                    {logo === "Webflow" && (
                      <svg
                        className="size-6"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M3 3h18v18H3V3zm16 16V5H5v14h14z" />
                      </svg>
                    )}
                    {logo === "Vercel" && (
                      <svg
                        className="size-6"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <polygon points="12,2 22,22 2,22" />
                      </svg>
                    )}
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent">
                  Powerful Features
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {featuresDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-lg"
                  >
                    <div
                      className={cn(
                        "mb-6 grid size-12 place-items-center rounded-xl",
                        i === 0 && "bg-primary/10 text-primary",
                        i === 1 && "bg-accent/10 text-accent",
                        i === 2 && "bg-chart-2/10 text-chart-2",
                        i === 3 && "bg-chart-4/10 text-chart-4",
                        i === 4 && "bg-destructive/10 text-destructive",
                        i === 5 && "bg-secondary/10 text-secondary",
                      )}
                    >
                      {i === 0 && (
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
                          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )}
                      {i === 1 && (
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
                          <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      )}
                      {i === 2 && (
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
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {i === 3 && (
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
                          <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                      )}
                      {i === 4 && (
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
                          <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      )}
                      {i === 5 && (
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
                          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      )}
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-foreground">
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

          {/* Steps */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                  How It Works
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {stepsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div
                      className={cn(
                        "h-full rounded-2xl border p-8",
                        i === 0 &&
                          "border-primary/20 bg-gradient-to-br from-primary/10 to-background",
                        i === 1 &&
                          "border-accent/20 bg-gradient-to-br from-accent/10 to-background",
                        i === 2 &&
                          "border-secondary/20 bg-gradient-to-br from-secondary/10 to-background",
                      )}
                    >
                      <div
                        className={cn(
                          "mb-6 grid size-12 place-items-center rounded-full text-xl font-bold",
                          i === 0 &&
                            "bg-primary text-primary-foreground",
                          i === 1 &&
                            "bg-accent text-accent-foreground",
                          i === 2 &&
                            "bg-secondary text-secondary-foreground",
                        )}
                      >
                        {i + 1}
                      </div>
                      <h3 className="mb-3 text-xl font-bold text-foreground">
                        {step.title}
                      </h3>
                      <p className="mb-6 text-muted-foreground">
                        {step.description}
                      </p>
                      <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                        {i === 0 && (
                          <Image
                            alt="laptop screen showing WriteFlow interface with content brief input fields"
                            w={400}
                            h={250}
                            className="h-40 w-full object-cover"
                          />
                        )}
                        {i === 1 && (
                          <Image
                            alt="computer display showing AI generated content variations side by side"
                            w={400}
                            h={250}
                            className="h-40 w-full object-cover"
                          />
                        )}
                        {i === 2 && (
                          <Image
                            alt="dashboard showing analytics and content publishing interface"
                            w={400}
                            h={250}
                            className="h-40 w-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                    {i < stepItems.length - 1 && (
                      <div className="absolute top-1/2 -right-6 hidden -translate-y-1/2 md:block lg:-right-8">
                        <ArrowRight className="size-8 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-secondary/10 px-4 py-1.5 text-xs font-semibold text-secondary">
                  Product Gallery
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {galleryDesc}
                </p>
              </div>
              <div className="grid auto-rows-[200px] grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {/* Large card */}
                <button
                  type="button"
                  onClick={() => go("Distraction-free editor")}
                  className="group relative overflow-hidden rounded-2xl md:col-span-2 lg:col-span-2 lg:row-span-2"
                >
                  <Image
                    alt="modern laptop on wooden desk displaying WriteFlow editor with dark mode interface"
                    w={800}
                    h={600}
                    className="size-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-left">
                    <h3 className="mb-2 text-xl font-bold text-background">
                      Distraction-free editor
                    </h3>
                    <p className="text-sm text-background/80">
                      Focus mode removes everything except your words. Flow state
                      activated.
                    </p>
                  </div>
                </button>

                {/* Tall card */}
                <button
                  type="button"
                  onClick={() => go("Write on mobile")}
                  className="relative overflow-hidden rounded-2xl md:col-span-1 lg:col-span-1 lg:row-span-2"
                >
                  <Image
                    alt="smartphone displaying WriteFlow mobile app with AI writing suggestions"
                    w={400}
                    h={600}
                    className="size-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-left">
                    <h3 className="mb-1 text-lg font-bold text-background">
                      Write on mobile
                    </h3>
                    <p className="text-xs text-background/80">
                      Capture ideas anywhere. Full editing power in your pocket.
                    </p>
                  </div>
                </button>

                {/* Stat card 1 */}
                <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6">
                  <div className="grid size-10 place-items-center rounded-lg bg-primary/10">
                    <svg
                      className="size-5 text-primary"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">50+</p>
                    <p className="text-sm text-muted-foreground">
                      Content templates
                    </p>
                  </div>
                </div>

                {/* Stat card 2 */}
                <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6">
                  <div className="grid size-10 place-items-center rounded-lg bg-accent/10">
                    <svg
                      className="size-5 text-accent"
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
                    <p className="text-2xl font-bold text-foreground">10x</p>
                    <p className="text-sm text-muted-foreground">
                      Faster first drafts
                    </p>
                  </div>
                </div>

                {/* Medium card 2 */}
                <button
                  type="button"
                  onClick={() => go("Real-time collaboration")}
                  className="relative overflow-hidden rounded-2xl md:col-span-2"
                >
                  <Image
                    alt="marketing team meeting reviewing content on large screen monitor"
                    w={600}
                    h={300}
                    className="size-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-left">
                    <h3 className="mb-1 text-lg font-bold text-background">
                      Real-time collaboration
                    </h3>
                    <p className="text-xs text-background/80">
                      See your team's edits as they happen. Built for modern
                      workflows.
                    </p>
                  </div>
                </button>

                {/* Dark stat card */}
                <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-foreground to-foreground/90 p-6">
                  <div className="grid size-10 place-items-center rounded-lg bg-background/10">
                    <svg
                      className="size-5 text-background"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-background">SOC 2</p>
                    <p className="text-sm text-background/70">Type II Certified</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-chart-2/10 px-4 py-1.5 text-xs font-semibold text-chart-2">
                  Pricing
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="mb-8 text-lg text-muted-foreground">
                  {pricingDesc}
                </p>
                <div className="inline-flex items-center gap-4 rounded-full bg-muted p-1.5">
                  <button
                    type="button"
                    className="rounded-full bg-card px-6 py-2 font-medium text-foreground shadow-sm"
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full px-6 py-2 font-medium text-muted-foreground"
                  >
                    Yearly
                    <span className="rounded-full bg-chart-2/10 px-2 py-0.5 text-xs font-semibold text-chart-2">
                      Save 20%
                    </span>
                  </button>
                </div>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative rounded-2xl p-8 shadow-sm",
                      plan.featured
                        ? "border border-background/10 bg-foreground shadow-xl"
                        : "border border-border bg-card",
                    )}
                  >
                    {plan.featured && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="inline-block rounded-full bg-gradient-to-r from-primary to-accent px-4 py-1.5 text-xs font-semibold text-background">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="mb-6">
                      <h3
                        className={cn(
                          "text-lg font-semibold",
                          plan.featured
                            ? "text-background"
                            : "text-foreground",
                        )}
                      >
                        {plan.name}
                      </h3>
                      <p
                        className={cn(
                          "mt-1 text-sm",
                          plan.featured
                            ? "text-background/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {plan.tagline}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span
                        className={cn(
                          "text-4xl font-bold",
                          plan.featured
                            ? "text-background"
                            : "text-foreground",
                        )}
                      >
                        {plan.price}
                      </span>
                      <span
                        className={cn(
                          plan.featured
                            ? "text-background/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {plan.period}
                      </span>
                    </div>
                    <ul className="mb-8 space-y-3">
                      {plan.features.map((feat, fi) => (
                        <li
                          key={feat}
                          className={cn(
                            "flex items-center gap-3 text-sm",
                            plan.featured
                              ? fi === 3 && plan.name === "Starter"
                                ? "text-muted-foreground"
                                : "text-background/80"
                              : fi === 3 && plan.name === "Starter"
                                ? "text-muted-foreground/60"
                                : "text-muted-foreground",
                          )}
                        >
                          {fi === 3 && plan.name === "Starter" ? (
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
                              <path d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          ) : (
                            <Check
                              className={cn(
                                "size-5 shrink-0",
                                plan.featured
                                  ? "text-primary"
                                  : "text-primary",
                              )}
                            />
                          )}
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "block w-full rounded-xl py-3 text-center font-medium transition-colors",
                        plan.featured
                          ? "bg-gradient-to-r from-primary to-accent text-background hover:opacity-90"
                          : "border border-border bg-card text-foreground hover:bg-muted",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-gradient-to-br from-foreground to-foreground/90 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4 lg:gap-12">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 text-4xl font-bold text-background sm:text-5xl">
                      {s.value}
                    </p>
                    <p className="text-sm text-background/70">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-chart-4/10 px-4 py-1.5 text-xs font-semibold text-chart-4">
                  Testimonials
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
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
                    className="rounded-2xl border border-border bg-card p-8 shadow-sm"
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
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full bg-muted px-4 py-1.5 text-xs font-semibold text-muted-foreground">
                  FAQ
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <div
                    key={item.question}
                    className="overflow-hidden rounded-xl border border-border bg-muted"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-card"
                    >
                      <span className="font-semibold text-foreground">
                        {item.question}
                      </span>
                      <svg
                        className="size-5 shrink-0 text-muted-foreground"
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
                    </button>
                    <div className="px-6 pb-5">
                      <p className="leading-relaxed text-muted-foreground">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-accent py-24">
            <div className="absolute inset-0 opacity-30" />
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold text-background sm:text-4xl lg:text-5xl">
                {finalHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-xl text-background/90">
                {finalDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(finalPrimary)}
                  className="inline-flex items-center justify-center rounded-xl bg-background px-8 py-4 text-base font-bold text-foreground shadow-lg transition-colors hover:bg-background/90"
                >
                  {finalPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(finalSecondary)}
                  className="inline-flex items-center justify-center rounded-xl border border-background/30 bg-background/10 px-8 py-4 text-base font-bold text-background transition-colors hover:bg-background/20"
                >
                  {finalSecondary}
                </button>
              </div>
              <p className="mt-8 text-sm text-background/70">
                Questions? Email us at{" "}
                <a
                  href="mailto:hello@writeflow.ai"
                  className="underline hover:text-background"
                >
                  hello@writeflow.ai
                </a>
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
              <div className="col-span-2 md:col-span-4 lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(brand)}
                  className="mb-4 flex items-center gap-2 text-xl font-bold tracking-tight text-background"
                >
                  <LogoMark className="size-8" />
                  {brand}
                </button>
                <p className="mb-6 max-w-xs text-sm text-background/70">
                  {footerTagline}
                </p>
                <div className="flex gap-4">
                  {["Twitter", "LinkedIn", "GitHub"].map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
                    >
                      {social === "Twitter" && (
                        <svg
                          className="size-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                        </svg>
                      )}
                      {social === "LinkedIn" && (
                        <svg
                          className="size-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      )}
                      {social === "GitHub" && (
                        <svg
                          className="size-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                      )}
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
                          className="text-background/70 transition-colors hover:text-background"
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
              <p className="text-sm text-background/50">
                {footerCopyright}
              </p>
              <div className="flex items-center gap-6 text-sm text-background/50">
                <button
                  type="button"
                  onClick={() => go("Privacy Policy")}
                  className="transition-colors hover:text-background"
                >
                  Privacy Policy
                </button>
                <button
                  type="button"
                  onClick={() => go("Terms of Service")}
                  className="transition-colors hover:text-background"
                >
                  Terms of Service
                </button>
                <button
                  type="button"
                  onClick={() => go("Cookie Settings")}
                  className="transition-colors hover:text-background"
                >
                  Cookie Settings
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
