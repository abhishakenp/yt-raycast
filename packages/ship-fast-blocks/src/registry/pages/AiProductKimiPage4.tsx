import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * AiProductKimiPage4 — warm editorial AI SaaS landing page (VARIANT 4).
 *
 * A faithful token-only port of a Kimi-generated "VerseAI" design with a
 * warm, literary aesthetic: serif headlines, generous whitespace, a centered
 * hero with a full-bleed editorial image and floating quote card, a
 * publication-trust logo strip, a 6-up feature grid with tinted icon tiles,
 * a dark 3-step timeline with oversized watermark numbers, a split gallery
 * with a checklist and masonry image grid, a 3-tier pricing block with a
 * dark featured "Professional" plan, a 4-up stats band, a 6-card star-rated
 * testimonial wall on a warm surface, an FAQ accordion using native details
 * elements, a dark email-capture CTA with form input, and a rich multi-column
 * footer with social icons.
 *
 * Surfaces map to semantic tokens (background/foreground/card/muted/primary),
 * so it themes cleanly. Every nav item, CTA, pricing button, FAQ, footer
 * link and social icon routes through `useNavigate` (never dead hrefs).
 * All content imagery uses the alt-driven <Image> component. Rich defaults let
 * it render fully on zero props, while callers can inject content per section.
 *
 * Use this variant when you want an editorial, warm, literary tone — distinct
 * from the minimal neutral aesthetic of AiProductKimiPage. Ideal for AI writing
 * assistants, generative content tools, author platforms, or literary/artistic
 * AI-product launches.
 */
export const AiProductKimiPage4 = defineComponent({
  name: "AiProductKimiPage4",
  description:
    "Complete AI-product / AI-SaaS LANDING page variant 4 (warm editorial style, fourth style sibling to AiProductKimiPage): serif typography, warm surfaces, a centered hero with full-bleed editorial image and floating quote card, a publication-trusted logo strip, a 6-up feature grid with tinted icon tiles, a dark 3-step onboarding timeline with oversized watermark numbers, a split gallery with a checklist and masonry image grid, a 3-tier pricing table with a dark featured Professional plan, a 4-up metrics band, a 6-card star-rated testimonial wall, an FAQ accordion with details/summary, a dark email-capture call-to-action with form input, and a rich multi-column footer with social links. Use for AI writing assistants, generative content platforms, author tools, or any AI SaaS that wants a literary, warm, conversion-focused landing page with features, pricing, social proof and FAQ. Supply content only — brand, nav, hero, logos, features, steps, gallery, pricing, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / product name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headline: z.string().optional(),
        subhead: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        trust: z.string().optional(),
        imageAlt: z.string().optional(),
        quote: z.string().optional(),
        quoteAuthor: z.string().optional(),
      })
      .optional(),
    /** Trusted-by logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        items: z
          .array(z.object({ name: z.string(), icon: z.string().optional() }))
          .optional(),
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
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Gallery / editor showcase. */
    gallery: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        checklist: z.array(z.string()).optional(),
        statValue: z.string().optional(),
        statLabel: z.string().optional(),
        imageAlt1: z.string().optional(),
        imageAlt2: z.string().optional(),
        quote: z.string().optional(),
        quoteSub: z.string().optional(),
      })
      .optional(),
    /** 3-tier pricing block. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        note: z.string().optional(),
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
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark email-capture CTA. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        inputPlaceholder: z.string().optional(),
        buttonLabel: z.string().optional(),
        trust: z.string().optional(),
        badges: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(
            z.object({ title: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        copyright: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "VerseAI"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Pricing", "Stories", "FAQ"]

    const heroBadge = props.hero?.badge ?? "Now with GPT-4 Turbo"
    const heroHeadline =
      props.hero?.headline ??
      "Write like the *masters*, publish like lightning."
    const heroSubhead =
      props.hero?.subhead ??
      "VerseAI helps authors, marketers, and teams draft essays, articles, and stories 10x faster. From first idea to polished prose—in minutes, not days."
    const heroPrimary = props.hero?.primaryCta ?? "Start free trial"
    const heroSecondary = props.hero?.secondaryCta ?? "Watch demo"
    const heroTrust =
      props.hero?.trust ?? "14-day free trial · No credit card required"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Minimalist desk with vintage typewriter, coffee, and scattered papers in soft morning light"
    const heroQuote =
      props.hero?.quote ??
      '"The best writing tool I\'ve used since Scrivener."'
    const heroQuoteAuthor =
      props.hero?.quoteAuthor ?? "Margaret Chen, Pulitzer finalist"

    const logosLabel =
      props.logos?.label ?? "Trusted by writers at leading publications"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : [
          { name: "The Atlantic", icon: "layers" },
          { name: "Wired", icon: "square" },
          { name: "Substack", icon: "circle" },
          { name: "Medium", icon: "box" },
          { name: "NYT Opinion", icon: "triangle" },
        ]

    const featuresHeading =
      props.features?.heading ?? "The complete writer's toolkit"
    const featuresDesc =
      props.features?.description ??
      "From brainstorming to final draft, every tool you need to write faster without losing your voice."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Instant Outlines",
            description:
              "Type your premise, get a complete narrative arc in 30 seconds. Our AI structures your story beats so you can focus on prose.",
          },
          {
            title: "Style Matching",
            description:
              "Upload your past work. VerseAI learns your tone, vocabulary, and rhythm—then writes suggestions that sound like you.",
          },
          {
            title: "Fact Checking",
            description:
              "Every statistic and quote is cross-referenced against 200+ authoritative sources before it hits your draft.",
          },
          {
            title: "Deadline Mode",
            description:
              "Racing against the clock? Deadline Mode accelerates suggestions, reduces frills, and gets you publish-ready fast.",
          },
          {
            title: "Team Collaboration",
            description:
              "Shared workspaces, real-time comments, and version history. Built for editorial teams who move fast together.",
          },
          {
            title: "50+ Languages",
            description:
              "Write fluently in English, Spanish, Mandarin, French, German, Japanese, and more with native-level nuance.",
          },
        ]

    const stepsHeading =
      props.steps?.heading ?? "From idea to published in three steps"
    const stepsDesc =
      props.steps?.description ??
      "No steep learning curve. Start writing better content in minutes, not weeks."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Describe your piece",
            description:
              "Tell us what you're writing—an op-ed, a product description, a short story—and your target audience. Be as brief or detailed as you like.",
          },
          {
            title: "Review your outline",
            description:
              "Our AI generates a structured outline with headings, talking points, and suggested word counts. Edit it, approve it, or start over.",
          },
          {
            title: "Draft and refine",
            description:
              "Generate your first draft in seconds. Use inline suggestions to polish tone, expand arguments, or trim for length. Export when ready.",
          },
        ]

    const galleryBadge = props.gallery?.badge ?? "Inside the editor"
    const galleryHeading =
      props.gallery?.heading ?? "An interface that disappears"
    const galleryDesc =
      props.gallery?.description ??
      "No distracting toolbars. No clunky sidebars. Just your words, gently enhanced by AI that knows when to suggest and when to stay quiet."
    const galleryChecklist = props.gallery?.checklist?.length
      ? props.gallery.checklist
      : [
          "Distraction-free writing mode with focus sounds",
          "Inline suggestions that feel like a thoughtful editor",
          "One-click export to Word, Google Docs, Markdown, and PDF",
          "Offline mode for writing on planes, trains, and retreats",
        ]
    const galleryStatValue = props.gallery?.statValue ?? "3.2M"
    const galleryStatLabel =
      props.gallery?.statLabel ?? "Articles written this month"
    const galleryImageAlt1 =
      props.gallery?.imageAlt1 ??
      "Close-up of hands typing on a clean white laptop keyboard on a wooden desk"
    const galleryImageAlt2 =
      props.gallery?.imageAlt2 ??
      "Person journaling in a notebook with a fountain pen in warm café lighting"
    const galleryQuote = props.gallery?.quote ?? '"It just works."'
    const galleryQuoteSub =
      props.gallery?.quoteSub ?? "— 4.9/5 from 12,000+ writers"

    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start free. Scale when you're ready. No hidden fees, no usage traps."
    const pricingNote =
      props.pricing?.note ?? "Annual billing saves 20%. Cancel anytime."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Starter",
            tagline: "For hobby writers trying AI",
            price: "$0",
            period: "/month",
            cta: "Start for free",
            features: [
              "5,000 words / month",
              "Basic outlines",
              "3 saved documents",
            ],
          },
          {
            name: "Professional",
            tagline: "For working writers",
            price: "$29",
            period: "/month",
            cta: "Start 14-day trial",
            featured: true,
            features: [
              "Unlimited words",
              "Advanced outlines with research",
              "Unlimited documents",
              "Style matching (3 voices)",
              "Priority support",
            ],
          },
          {
            name: "Team",
            tagline: "For editorial teams",
            price: "$79",
            period: "/seat/month",
            cta: "Contact sales",
            features: [
              "Everything in Pro",
              "Shared team workspace",
              "Unlimited style voices",
              "Dedicated account manager",
              "SSO and audit logs",
            ],
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "12,000+", label: "Active writers" },
          { value: "3.2M", label: "Articles written" },
          { value: "47 min", label: "Average time saved" },
          { value: "4.9/5", label: "User satisfaction" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by writers everywhere"
    const testimonialsDesc =
      props.testimonials?.description ??
      "From Pulitzer finalists to indie bloggers, hear how VerseAI changed their writing process."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "VerseAI doesn't just speed up my writing—it makes me a better writer. The suggestions feel like a brilliant editor whispering in my ear.",
            name: "Margaret Chen",
            role: "Pulitzer finalist, The Atlantic",
            avatarAlt:
              "Professional headshot of a smiling woman with shoulder-length brown hair",
          },
          {
            quote:
              "I went from 4 articles a week to 12 without sacrificing quality. My editor thinks I've hired a ghostwriter. I just smile and say it's magic.",
            name: "James O'Brien",
            role: "Tech columnist, Wired",
            avatarAlt:
              "Professional headshot of a man with short dark hair and beard in a navy shirt",
          },
          {
            quote:
              "The style matching is uncanny. VerseAI captured my voice perfectly—witty, slightly sarcastic, data-driven. Readers haven't noticed a difference.",
            name: "Sarah Mitchell",
            role: "Founder, CryptoDaily Newsletter",
            avatarAlt:
              "Professional headshot of a woman with blonde hair and glasses in a black turtleneck",
          },
          {
            quote:
              "Our editorial team cut production time by 60%. Deadlines that used to induce panic are now just... Tuesday. VerseAI is our secret weapon.",
            name: "David Park",
            role: "Editor-in-Chief, FutureSync Media",
            avatarAlt:
              "Professional headshot of a man with curly hair and a friendly smile in a grey sweater",
          },
          {
            quote:
              "As a non-native English speaker, VerseAI helps me sound natural and confident. I've doubled my freelance rates since I started using it.",
            name: "Elena Voss",
            role: "Freelance copywriter, Berlin",
            avatarAlt:
              "Professional headshot of a young woman with dark hair and natural makeup in a white blouse",
          },
          {
            quote:
              "I was skeptical. Then I wrote a 3,000-word feature in 90 minutes that normally takes 8 hours. VerseAI is now in my daily workflow.",
            name: "Marcus Johnson",
            role: "Staff writer, Sports Illustrated",
            avatarAlt:
              "Professional headshot of a man with short hair and a confident expression in a blue shirt",
          },
        ]

    const faqHeading =
      props.faq?.heading ?? "Questions? We've got answers."
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know before you start."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How does the AI know my writing style?",
            answer:
              "Upload 3-5 samples of your writing—blog posts, essays, emails, anything. Our AI analyzes your sentence structure, vocabulary choices, tone markers, and rhythm patterns. Within minutes, it builds a personalized voice model that guides all future suggestions to match your unique style.",
          },
          {
            question: "Is my content private and secure?",
            answer:
              "Absolutely. Your drafts are encrypted at rest and in transit. We never use your content to train our AI models, and we never share your work with third parties. Team plans include additional SSO, audit logs, and data retention controls for enterprise compliance.",
          },
          {
            question: "Can I cancel my subscription anytime?",
            answer:
              "Yes. No contracts, no cancellation fees. If you cancel, you'll keep access until the end of your current billing period. We also offer a 30-day money-back guarantee for new subscribers—if VerseAI doesn't transform your writing, we'll refund every penny.",
          },
          {
            question: "What's included in the free trial?",
            answer:
              "The 14-day trial gives you full Professional plan access: unlimited words, all outline types, style matching, and priority support. No credit card required to start. At the end of the trial, choose a plan or automatically downgrade to the free Starter tier.",
          },
          {
            question: "Does VerseAI work offline?",
            answer:
              "Professional and Team plans include an offline mode for distraction-free writing. AI features like suggestions and outlines require connectivity, but you can write, edit, and organize drafts anywhere. Changes sync automatically when you reconnect.",
          },
          {
            question: "How is this different from ChatGPT?",
            answer:
              "ChatGPT is a general-purpose AI. VerseAI is built specifically for writers—long-form content, editorial workflows, style consistency, and publication-ready formatting. We include fact-checking, citation tools, team collaboration, and export options that generic AI tools simply don't offer.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? "Ready to write your best work?"
    const ctaDesc =
      props.cta?.description ??
      "Join 12,000+ writers who've transformed their craft. Start your free 14-day trial today—no credit card required."
    const ctaPlaceholder =
      props.cta?.inputPlaceholder ?? "Enter your email"
    const ctaButton = props.cta?.buttonLabel ?? "Start free trial"
    const ctaTrust =
      props.cta?.trust ?? "14-day free trial · No credit card · Cancel anytime"
    const ctaBadges = props.cta?.badges?.length
      ? props.cta.badges
      : ["SOC 2 Compliant", "End-to-end encrypted"]

    const footerTagline =
      props.footer?.tagline ??
      "The generative writing assistant for serious writers. Draft faster, edit smarter, publish sooner."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Integrations", "Changelog", "Roadmap"],
          },
          {
            title: "Resources",
            links: ["Documentation", "Tutorials", "Blog", "Style Guide", "Community"],
          },
          {
            title: "Company",
            links: ["About", "Careers", "Press", "Contact", "Status"],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ?? `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "inline-flex items-center justify-center text-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
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

    const Star = () => (
      <svg
        className="size-4 text-chart-4"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const ChevronDown = ({ className }: { className?: string }) => (
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
      // terminal/keyboard
      <svg
        key="terminal"
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
        <path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
      // clock
      <svg
        key="clock"
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
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      // globe/languages
      <svg
        key="globe"
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
        <path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>,
    ]

    const iconBg = [
      "bg-primary/10 text-primary",
      "bg-secondary/10 text-secondary-foreground",
      "bg-accent/10 text-accent-foreground",
      "bg-muted text-muted-foreground",
      "bg-chart-1/10 text-chart-1",
      "bg-chart-2/10 text-chart-2",
    ]

    const publicationIcon = (type: string) => {
      switch (type) {
        case "layers":
          return (
            <svg
              className="size-6 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          )
        case "square":
          return (
            <svg
              className="size-6 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
          )
        case "circle":
          return (
            <svg
              className="size-6 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
            </svg>
          )
        case "box":
          return (
            <svg
              className="size-6 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M4 4h16v16H4z" />
            </svg>
          )
        case "triangle":
          return (
            <svg
              className="size-6 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <polygon points="12,2 22,22 2,22" />
            </svg>
          )
        default:
          return (
            <svg
              className="size-6 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
            </svg>
          )
      }
    }

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased selection:bg-primary/20",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
            <button
              type="button"
              onClick={() => go(brand)}
              className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground"
            >
              <LogoMark />
              <span className="font-serif">{brand}</span>
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

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => go("Sign in")}
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => go(heroPrimary)}
                className="inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                Get started
              </button>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8 lg:pt-32">
              <div className="mx-auto max-w-3xl text-center">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
                  {heroBadge}
                </p>
                <h1 className="mb-6 font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  {heroHeadline.split("*").map((part, i) =>
                    i % 2 === 1 ? (
                      <em key={i} className="italic">
                        {part}
                      </em>
                    ) : (
                      part
                    ),
                  )}
                </h1>
                <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                  {heroSubhead}
                </p>
                <div className="mb-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-foreground px-6 py-3.5 text-base font-medium text-background transition-colors hover:bg-foreground/90 sm:w-auto"
                  >
                    {heroPrimary}
                    <ArrowRight className="ml-2 size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex w-full items-center justify-center rounded-lg border border-input bg-muted px-6 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-accent sm:w-auto"
                  >
                    <PlayIcon className="mr-2 size-4" />
                    {heroSecondary}
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">{heroTrust}</p>
              </div>
            </div>

            {/* Hero image */}
            <div className="mx-auto mt-16 max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-xl border border-border shadow-2xl">
                <div className="relative bg-card">
                  <Image
                    alt={heroImageAlt}
                    w={1400}
                    h={800}
                    loading="eager"
                    className="w-full opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
                    <div className="max-w-xs rounded-lg bg-background/95 px-4 py-3 shadow-lg backdrop-blur">
                      <p className="text-sm italic text-muted-foreground">
                        {heroQuote}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        — {heroQuoteAuthor}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-b border-border py-16 md:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-10 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60">
                {logoItems.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => go(item.name)}
                    className="flex items-center gap-2 text-lg font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {publicationIcon(item.icon ?? "circle")}
                    <span className="font-serif">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center lg:mb-24">
                <h2 className="mb-4 font-serif text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {featuresDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
                {featureItems.map((item, i) => (
                  <div key={item.title}>
                    <div
                      className={cn(
                        "mb-5 grid size-12 place-items-center rounded-xl",
                        iconBg[i % iconBg.length],
                      )}
                    >
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-2 font-serif text-xl font-semibold">
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
          <section className="bg-foreground py-20 text-background lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center lg:mb-24">
                <h2 className="mb-4 font-serif text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg leading-relaxed text-background/70">
                  {stepsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="font-serif text-6xl font-bold text-background/20 md:text-7xl">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="relative pt-4">
                      <div className="mb-5 grid size-12 place-items-center rounded-xl bg-background/10">
                        <span className="text-xl font-bold">{i + 1}</span>
                      </div>
                      <h3 className="mb-3 font-serif text-xl font-semibold">
                        {step.title}
                      </h3>
                      <p className="leading-relaxed text-background/70">
                        {step.description}
                      </p>
                    </div>
                    {i < stepItems.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="absolute top-1/2 -right-6 hidden h-px w-12 bg-background/20 md:block"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div>
                  <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
                    {galleryBadge}
                  </p>
                  <h2 className="mb-6 font-serif text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
                    {galleryHeading}
                  </h2>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                    {galleryDesc}
                  </p>
                  <ul className="space-y-4">
                    {galleryChecklist.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="aspect-[3/4] overflow-hidden rounded-xl bg-card">
                      <Image
                        alt={galleryImageAlt1}
                        w={600}
                        h={800}
                        loading="lazy"
                        className="size-full object-cover opacity-80"
                      />
                    </div>
                    <div className="flex aspect-square flex-col justify-center rounded-xl bg-secondary p-6">
                      <p className="mb-2 font-serif text-2xl italic text-secondary-foreground">
                        {galleryQuote}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {galleryQuoteSub}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="flex aspect-square flex-col justify-center rounded-xl bg-muted p-6">
                      <p className="mb-2 font-serif text-5xl font-bold text-foreground">
                        {galleryStatValue}
                      </p>
                      <p className="text-muted-foreground">
                        {galleryStatLabel}
                      </p>
                    </div>
                    <div className="aspect-[3/4] overflow-hidden rounded-xl bg-card">
                      <Image
                        alt={galleryImageAlt2}
                        w={600}
                        h={800}
                        loading="lazy"
                        className="size-full object-cover opacity-70"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center lg:mb-24">
                <h2 className="mb-4 font-serif text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {pricingDesc}
                </p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3 lg:gap-8">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative flex flex-col rounded-2xl p-8",
                      plan.featured
                        ? "bg-foreground text-background"
                        : "border border-border bg-card",
                    )}
                  >
                    {plan.featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
                          Most popular
                        </span>
                      </div>
                    )}
                    <div className="mb-6">
                      <h3 className="mb-2 font-serif text-xl font-semibold">
                        {plan.name}
                      </h3>
                      <p
                        className={cn(
                          "text-sm",
                          plan.featured
                            ? "text-background/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {plan.tagline}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span className="font-serif text-4xl font-semibold">
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
                    <ul className="mb-8 flex-1 space-y-3">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-3 text-sm">
                          <Check
                            className={cn(
                              "size-4 shrink-0",
                              plan.featured
                                ? "text-background"
                                : "text-primary",
                            )}
                          />
                          <span
                            className={cn(
                              plan.featured
                                ? "text-background/70"
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
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "block w-full rounded-lg py-2.5 text-center text-sm font-medium transition-colors",
                        plan.featured
                          ? "bg-background text-foreground hover:bg-background/90"
                          : "border border-input hover:bg-accent",
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

          {/* Stats */}
          <section className="border-b border-border py-16 md:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <p className="font-serif text-3xl font-semibold text-foreground md:text-4xl">
                      {s.value}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center lg:mb-24">
                <h2 className="mb-4 font-serif text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-xl bg-card p-6 md:p-8"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
                      ))}
                    </div>
                    <p className="mb-6 font-serif text-lg italic text-foreground/80">
                      "{t.quote}"
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
                        <p className="text-sm font-medium text-foreground">
                          {t.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
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
          <section className="bg-muted py-20 lg:py-32">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 font-serif text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-xl bg-card"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="font-medium text-foreground">
                        {item.question}
                      </span>
                      <span className="ml-4 shrink-0">
                        <ChevronDown className="size-5 text-muted-foreground transition-transform group-open:rotate-180" />
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

          {/* CTA */}
          <section className="bg-foreground py-20 text-background lg:py-32">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 font-serif text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-background/70 md:text-xl">
                {ctaDesc}
              </p>
              <form
                className="mx-auto mb-4 flex max-w-md flex-col gap-3 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault()
                  go(ctaButton)
                }}
              >
                <label htmlFor="email-cta" className="sr-only">
                  Email address
                </label>
                <input
                  type="email"
                  id="email-cta"
                  placeholder={ctaPlaceholder}
                  required
                  className="flex-1 rounded-lg border-0 bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="whitespace-nowrap rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {ctaButton}
                </button>
              </form>
              <p className="text-sm text-background/50">{ctaTrust}</p>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 opacity-50">
                {ctaBadges.map((badge) => (
                  <div key={badge} className="flex items-center gap-2">
                    <Check className="size-5 text-background" />
                    <span className="text-sm">{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-background/10 bg-foreground py-12 text-background/70 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-5 lg:gap-12">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(brand)}
                  className="mb-4 flex items-center gap-2 text-lg font-semibold text-background"
                >
                  <LogoMark className="text-background" />
                  <span className="font-serif">{brand}</span>
                </button>
                <p className="mb-4 max-w-sm text-sm leading-relaxed">
                  {footerTagline}
                </p>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => go("Twitter")}
                    className="text-background/70 transition-colors hover:text-background"
                    aria-label="Twitter"
                  >
                    <svg
                      className="size-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => go("LinkedIn")}
                    className="text-background/70 transition-colors hover:text-background"
                    aria-label="LinkedIn"
                  >
                    <svg
                      className="size-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => go("YouTube")}
                    className="text-background/70 transition-colors hover:text-background"
                    aria-label="YouTube"
                  >
                    <svg
                      className="size-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </button>
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-medium text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-2 text-sm">
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
            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 text-sm md:flex-row">
              <p className="text-background/70">{footerCopyright}</p>
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => go("Privacy Policy")}
                  className="text-background/70 transition-colors hover:text-background"
                >
                  Privacy Policy
                </button>
                <button
                  type="button"
                  onClick={() => go("Terms of Service")}
                  className="text-background/70 transition-colors hover:text-background"
                >
                  Terms of Service
                </button>
                <button
                  type="button"
                  onClick={() => go("Cookie Settings")}
                  className="text-background/70 transition-colors hover:text-background"
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
