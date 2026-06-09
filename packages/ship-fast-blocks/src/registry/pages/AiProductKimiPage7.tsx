import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

export const AiProductKimiPage7 = defineComponent({
  name: "AiProductKimiPage7",
  description:
    "Complete AI-product / AI-SaaS landing page with a dark, cinematic glassmorphism aesthetic — the 7th sibling variant to AiProductKimiPage. Features a dramatic split hero with a live-integration pill, gradient headline, dual CTAs, and a frosted-glass AI editor preview card; a trusted-by logo strip; a 6-up feature grid with gradient token-colored icon tiles; a 3-step how-it-works timeline; a product screenshot gallery; a 3-tier pricing block with a gradient-highlighted Most Popular plan; a 4-up stats band; a 6-card star-rated testimonial wall; an FAQ accordion; a bold gradient final call-to-action; and a rich multi-column footer with social icons. Use as a bold, immersive, dark-themed ROOT page for AI writing assistants, generative-AI tools, AI copilots, SaaS startups, marketing agencies, or developer-AI products when a cinematic, conversion-focused marketing site with features, pricing, social proof, and FAQ is desired. All surfaces use semantic tokens for clean theme injection. Supply content only — brand, nav, hero, logos, features, steps, gallery, pricing, stats, testimonials, faq, finalCta, footer; the block owns all layout, spacing, depth, and type hierarchy.",
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
        previewFile: z.string().optional(),
        previewIntro: z.string().optional(),
        previewQuote: z.string().optional(),
        previewOptions: z.array(z.string()).optional(),
        previewUserMsg: z.string().optional(),
        previewUserAlt: z.string().optional(),
        floatingLabel: z.string().optional(),
        floatingSub: z.string().optional(),
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
              missingFeatures: z.array(z.string()).optional(),
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
        trust: z.string().optional(),
      })
      .optional(),
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(
            z.object({ title: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        copyright: z.string().optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "ScriptForge AI"
    const nav = props.nav?.length ? props.nav : ["Features", "Pricing", "Reviews", "FAQ"]

    const heroBadge = props.hero?.badge ?? "Now with GPT-4 Turbo Integration"
    const headingTop = props.hero?.headingTop ?? "Write Faster,"
    const headingBottom = props.hero?.headingBottom ?? "Think Smarter"
    const heroSub =
      props.hero?.subheading ??
      "ScriptForge AI helps content creators, marketers, and teams produce compelling blog posts, emails, and copy in minutes—not hours. Join 50,000+ writers who've transformed their workflow."
    const heroPrimary = props.hero?.primaryCta ?? "Start Writing Free"
    const heroSecondary = props.hero?.secondaryCta ?? "See How It Works"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["No credit card required", "14-day free trial"]
    const previewFile = props.hero?.previewFile ?? "ScriptForge Editor"
    const previewIntro = props.hero?.previewIntro ?? "AI Assistant"
    const previewQuote =
      props.hero?.previewQuote ??
      "I've drafted 3 headline options for your product launch:"
    const previewOptions = props.hero?.previewOptions?.length
      ? props.hero.previewOptions
      : [
          '1. "Revolutionize Your Workflow with AI-Powered Automation"',
          '2. "Save 10 Hours Every Week with Intelligent Task Management"',
          '3. "The AI Assistant That Actually Understands Your Business"',
        ]
    const previewUserMsg =
      props.hero?.previewUserMsg ??
      "Option 3 is perfect! Can you expand it into a full email?"
    const previewUserAlt =
      props.hero?.previewUserAlt ?? "professional headshot of a marketing manager"
    const floatingLabel = props.hero?.floatingLabel ?? "AI Generated"
    const floatingSub = props.hero?.floatingSub ?? "in 2.3 seconds"

    const logosLabel = props.logos?.label ?? "Trusted by teams at"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Notion", "Figma", "Vercel", "Stripe", "Slack", "Linear"]

    const featuresHeading =
      props.features?.heading ?? "Everything You Need to Write Better Content"
    const featuresDesc =
      props.features?.description ??
      "From first draft to final polish, ScriptForge AI streamlines every step of your writing process with intelligent assistance."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Instant Draft Generation",
            description:
              "Generate complete blog posts, emails, and marketing copy from simple prompts. Go from idea to publish-ready content in under 5 minutes.",
          },
          {
            title: "Smart Tone Adjustment",
            description:
              "Instantly adapt your writing tone from professional to casual, persuasive to informative. Match your brand voice across all channels.",
          },
          {
            title: "Grammar & Style Check",
            description:
              "Advanced AI catches grammar issues, awkward phrasing, and readability problems. Get suggestions that improve clarity and flow.",
          },
          {
            title: "50+ Content Templates",
            description:
              "Pre-built templates for blog posts, social media, product descriptions, emails, ad copy, and more. Start with proven frameworks.",
          },
          {
            title: "Team Collaboration",
            description:
              "Share projects, leave comments, and maintain brand consistency with team libraries. Perfect for marketing teams and agencies.",
          },
          {
            title: "One-Click Publishing",
            description:
              "Export to WordPress, Medium, Ghost, or download as DOCX, PDF, or Markdown. Publish directly to your CMS without copy-pasting.",
          },
        ]

    const stepsHeading =
      props.steps?.heading ?? "From Blank Page to Published in 3 Steps"
    const stepsDesc = props.steps?.description ?? ""
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Describe Your Goal",
            description:
              "Tell ScriptForge what you need—a blog post about sustainable fashion, a sales email for software, or social captions for your product launch.",
          },
          {
            title: "AI Generates Options",
            description:
              "Get 3 unique variations in seconds. Each option has a different angle, tone, and structure. Pick your favorite or blend elements together.",
          },
          {
            title: "Refine & Publish",
            description:
              "Use inline editing to fine-tune. Expand sections, change tone, or ask the AI to rewrite. Then export to your platform of choice.",
          },
        ]

    const galleryHeading = props.gallery?.heading ?? "See ScriptForge in Action"
    const galleryDesc =
      props.gallery?.description ??
      "Real screenshots from our editor showing the AI writing experience."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Clean Editor Interface",
            description: "Distraction-free writing with AI suggestions inline.",
            imageAlt:
              "modern laptop displaying a clean writing application interface on white desk",
          },
          {
            title: "Performance Analytics",
            description:
              "Track word count, reading time, and content quality scores.",
            imageAlt:
              "desktop monitor showing analytics dashboard with colorful charts and graphs",
          },
          {
            title: "Team Workspaces",
            description:
              "Collaborate with shared projects and brand libraries.",
            imageAlt:
              "team collaboration workspace with multiple screens showing project management tools",
          },
          {
            title: "API & Integrations",
            description:
              "Connect your existing workflow with our REST API.",
            imageAlt:
              "developer working on laptop with code editor and terminal windows open",
          },
          {
            title: "Content Calendar",
            description:
              "Schedule and plan your content strategy visually.",
            imageAlt:
              "content calendar displayed on tablet showing scheduled posts and campaigns",
          },
          {
            title: "Brand Voice Training",
            description:
              "Teach AI your unique tone with custom examples.",
            imageAlt:
              "marketing team meeting reviewing campaign materials on large display",
          },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Simple, Transparent Pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start free, upgrade when you need more power. No hidden fees, cancel anytime."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Starter",
            tagline: "Perfect for trying out ScriptForge",
            price: "Free",
            period: "",
            cta: "Get Started",
            featured: false,
            features: [
              "5,000 words/month",
              "Basic templates",
              "Grammar checker",
            ],
            missingFeatures: ["Team features"],
          },
          {
            name: "Pro",
            tagline: "For serious content creators",
            price: "$29",
            period: "/month",
            cta: "Start Free Trial",
            featured: true,
            features: [
              "Unlimited words",
              "All 50+ templates",
              "Brand voice training",
              "Priority support",
            ],
            missingFeatures: [],
          },
          {
            name: "Team",
            tagline: "For marketing teams & agencies",
            price: "$79",
            period: "/month",
            cta: "Contact Sales",
            featured: false,
            features: [
              "Everything in Pro",
              "5 team members",
              "Shared brand library",
              "API access",
            ],
            missingFeatures: [],
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "50K+", label: "Active Writers" },
          { value: "2M+", label: "Articles Generated" },
          { value: "10x", label: "Faster Writing" },
          { value: "4.9", label: "Average Rating" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by Writers Everywhere"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Here's what content creators, marketers, and teams say about ScriptForge AI."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "ScriptForge cut my blog writing time from 6 hours to 45 minutes. The AI understands context better than any other tool I've tried. My editor thinks I've hired a ghostwriter!",
            name: "Sarah Chen",
            role: "Marketing Director, TechFlow SaaS",
            avatarAlt:
              "professional headshot of a female marketing director with short brown hair",
          },
          {
            quote:
              "Our content agency went from 3 full-time writers to 1 writer plus ScriptForge. We're producing 40% more content and the quality is actually better. It's like having a senior copywriter on demand.",
            name: "Marcus Rodriguez",
            role: "Founder, Amplify Content Agency",
            avatarAlt:
              "professional headshot of a male agency founder in his 30s with dark hair",
          },
          {
            quote:
              "I was skeptical about AI writing tools until ScriptForge. It doesn't replace my voice—it amplifies it. I draft 5x faster and spend my energy on creative direction instead of staring at blank pages.",
            name: "Emma Thompson",
            role: "Freelance Writer & Author",
            avatarAlt:
              "professional headshot of a female freelance writer with blonde hair and warm smile",
          },
          {
            quote:
              "We integrated ScriptForge into our e-commerce workflow. Product descriptions that took 30 minutes now take 3. Our conversion rates improved 18% because the AI generates more persuasive copy than we ever did manually.",
            name: "David Park",
            role: "E-commerce Manager, StyleHub",
            avatarAlt:
              "professional headshot of a male ecommerce manager with glasses and beard",
          },
          {
            quote:
              "The brand voice training feature is a game-changer. We uploaded 50 of our best-performing emails and now every new piece sounds exactly like us. It's uncanny how well it captures our tone.",
            name: "Aisha Johnson",
            role: "Brand Strategist, Lumen Brands",
            avatarAlt:
              "professional headshot of a female brand strategist with curly dark hair",
          },
          {
            quote:
              "As a non-native English speaker, ScriptForge helps me write confidently. The grammar suggestions are subtle and smart—they fix issues without making my writing sound robotic.",
            name: "Raj Patel",
            role: "Founder, Nexus Startup",
            avatarAlt:
              "professional headshot of a male startup founder from southeast asia",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about ScriptForge AI."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How is ScriptForge different from ChatGPT?",
            answer:
              "ScriptForge is purpose-built for content creation. Unlike general AI chatbots, we offer 50+ writing templates, brand voice training, SEO optimization, and direct publishing integrations. Our AI is fine-tuned specifically for marketing copy, blog posts, and business content—not general conversation.",
          },
          {
            question: "Is the content original and plagiarism-free?",
            answer:
              "Yes. ScriptForge generates original content using advanced language models. Every piece is unique and passes Copyscape checks. We never copy from existing sources—the AI creates fresh content based on patterns learned during training, just like a human writer would.",
          },
          {
            question: "Can I cancel my subscription anytime?",
            answer:
              "Absolutely. There are no contracts or commitments. You can cancel your subscription at any time from your account settings. If you cancel, you'll continue to have access until the end of your billing period. We also offer a 14-day money-back guarantee for all paid plans.",
          },
          {
            question: "What languages does ScriptForge support?",
            answer:
              "ScriptForge supports 25+ languages including English, Spanish, French, German, Italian, Portuguese, Dutch, Polish, Russian, Japanese, Chinese, Korean, and Arabic. All templates and features work across supported languages with the same quality and customization options.",
          },
          {
            question: "Do you offer an API for developers?",
            answer:
              "Yes! Our REST API is available on Team plans and above. You can integrate ScriptForge into your own applications, CMS, or workflow automation tools. The API includes all core features: content generation, tone adjustment, and grammar checking. Contact our sales team for enterprise API pricing.",
          },
          {
            question: "How does the brand voice training work?",
            answer:
              "Upload 10-50 samples of your best content—emails, blog posts, social media, or any writing that represents your brand. Our AI analyzes tone, vocabulary, sentence structure, and style patterns. Within minutes, you'll have a custom voice profile that generates new content matching your brand perfectly.",
          },
        ]

    const finalHeading =
      props.finalCta?.heading ?? "Ready to Write 10x Faster?"
    const finalDesc =
      props.finalCta?.description ??
      "Join 50,000+ writers, marketers, and teams who've transformed their content creation process. Start your free 14-day trial today—no credit card required."
    const finalPrimary = props.finalCta?.primaryCta ?? "Start Free Trial"
    const finalSecondary = props.finalCta?.secondaryCta ?? "Book a Demo"
    const finalTrust =
      props.finalCta?.trust ??
      "Trusted by teams at Notion, Figma, Stripe, and 2,000+ companies worldwide"

    const footerTagline =
      props.footer?.tagline ??
      "The AI writing assistant that helps you create compelling content faster. Built for writers, marketers, and teams who demand quality."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Templates", "Integrations", "API"],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Press", "Contact"],
          },
          {
            title: "Resources",
            links: [
              "Help Center",
              "Documentation",
              "Community",
              "Status",
              "Security",
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Twitter", "GitHub", "LinkedIn"]

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary",
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

    const Cross = ({ className }: { className?: string }) => (
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
        <path d="M6 18L18 6M6 6l12 12" />
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
      <svg
        key="tone"
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
        key="check"
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
      <svg
        key="tag"
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
        <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>,
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
      <svg
        key="export"
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
        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>,
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-gradient-to-br from-background via-primary/20 to-background text-foreground antialiased selection:bg-primary/20",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border/10 bg-background/80 backdrop-blur-md">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
            <button
              type="button"
              onClick={() => go(brand)}
              className="flex items-center gap-2 text-xl font-bold text-foreground"
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
                onClick={() => go("Get Started Free")}
                className="inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
              >
                Get Started Free
              </button>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden py-20 lg:py-32">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent pointer-events-none" />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                {/* Left */}
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/20 bg-card/10 px-4 py-2 backdrop-blur-sm">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-sm font-medium text-foreground/90">
                      {heroBadge}
                    </span>
                  </div>
                  <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                    {headingTop}
                    <br />
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {headingBottom}
                    </span>
                  </h1>
                  <p className="mb-8 max-w-xl text-lg text-muted-foreground sm:text-xl">
                    {heroSub}
                  </p>
                  <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary px-8 py-4 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-full border border-border/20 bg-card/10 px-8 py-4 text-base font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-card/20"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground">
                    {heroTrust.map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <Check className="size-5 text-primary" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right - Preview Card */}
                <div className="relative">
                  <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/20 to-accent/20 blur-2xl" />
                  <div className="relative overflow-hidden rounded-2xl border border-border/10 bg-card/5 p-6 shadow-2xl backdrop-blur-xl">
                    {/* Title bar */}
                    <div className="flex items-center gap-3 border-b border-border/10 pb-4 mb-4">
                      <div className="flex gap-2">
                        <span className="size-3 rounded-full bg-destructive" />
                        <span className="size-3 rounded-full bg-chart-4" />
                        <span className="size-3 rounded-full bg-primary" />
                      </div>
                      <span className="ml-2 text-sm text-muted-foreground">
                        {previewFile}
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent">
                          <svg
                            className="size-4 text-primary-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 text-xs text-muted-foreground">
                            {previewIntro}
                          </div>
                          <div className="rounded-lg bg-card/5 p-3 text-sm text-foreground/80 backdrop-blur-sm">
                            {previewQuote}
                          </div>
                        </div>
                      </div>
                      <div className="ml-11 space-y-2">
                        {previewOptions.map((opt, i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm text-foreground/90 backdrop-blur-sm"
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        <Image
                          alt={previewUserAlt}
                          w={100}
                          h={100}
                          className="size-8 shrink-0 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="rounded-lg bg-card/10 p-3 text-sm text-foreground/80 backdrop-blur-sm">
                            {previewUserMsg}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Floating card */}
                  <div className="absolute -bottom-6 -right-6 rounded-xl border border-border/20 bg-card/10 p-4 shadow-xl backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-full bg-chart-3/20">
                        <svg
                          className="size-5 text-chart-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {floatingLabel}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {floatingSub}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border/10 bg-card/5 py-12 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-3 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <div
                    key={logo}
                    className="flex h-12 items-center justify-center text-lg font-semibold text-foreground"
                  >
                    {logo}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                  Features
                </span>
                <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {featureItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-border/10 bg-card/5 p-6 backdrop-blur-xl transition-all hover:bg-card/10 lg:p-8"
                  >
                    <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground transition-transform group-hover:scale-110">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">
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
          <section className="border-y border-border/10 bg-card/5 py-20 backdrop-blur-sm lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full border border-secondary/20 bg-secondary/10 px-4 py-1 text-sm font-medium text-secondary">
                  How It Works
                </span>
                <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {stepsHeading}
                </h2>
                {stepsDesc ? (
                  <p className="text-lg text-muted-foreground">{stepsDesc}</p>
                ) : null}
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="h-full rounded-2xl border border-border/10 bg-card/5 p-8 text-center backdrop-blur-xl">
                      <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-2xl font-bold text-primary-foreground">
                        {i + 1}
                      </div>
                      <h3 className="mb-3 text-xl font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                    {i < stepItems.length - 1 ? (
                      <div className="absolute -right-6 top-1/2 hidden -translate-y-1/2 md:block">
                        <ArrowRight className="size-8 text-foreground/20" />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full border border-accent/20 bg-accent/10 px-4 py-1 text-sm font-medium text-accent">
                  Gallery
                </span>
                <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{galleryDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((item) => (
                  <div
                    key={item.title}
                    className="group overflow-hidden rounded-2xl border border-border/10 bg-card/5 backdrop-blur-xl transition-colors hover:border-border/20"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-muted/30">
                      <Image
                        alt={item.imageAlt}
                        w={600}
                        h={450}
                        loading="lazy"
                        className="size-full object-cover opacity-80 transition-all group-hover:scale-105 group-hover:opacity-100"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="mb-2 text-lg font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="border-y border-border/10 bg-card/5 py-20 backdrop-blur-sm lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full border border-chart-3/20 bg-chart-3/10 px-4 py-1 text-sm font-medium text-chart-3">
                  Pricing
                </span>
                <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3 lg:gap-8">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative rounded-2xl border p-8 backdrop-blur-xl",
                      plan.featured
                        ? "border-primary/30 bg-gradient-to-b from-primary/20 to-secondary/20 md:-translate-y-4"
                        : "border-border/10 bg-card/5",
                    )}
                  >
                    {plan.featured ? (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-1 text-sm font-semibold text-primary-foreground">
                          Most Popular
                        </span>
                      </div>
                    ) : null}
                    <div className="mb-6">
                      <h3 className="mb-2 text-xl font-semibold text-foreground">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {plan.tagline}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-foreground">
                        {plan.price}
                      </span>
                      {plan.period ? (
                        <span className="text-muted-foreground">
                          {plan.period}
                        </span>
                      ) : null}
                    </div>
                    <ul className="mb-8 space-y-3">
                      {plan.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-center gap-3 text-sm text-foreground/80"
                        >
                          <Check className="size-5 shrink-0 text-chart-3" />
                          {feat}
                        </li>
                      ))}
                      {(plan.missingFeatures ?? []).map((feat) => (
                        <li
                          key={feat}
                          className="flex items-center gap-3 text-sm text-muted-foreground/60"
                        >
                          <Cross className="size-5 shrink-0" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "block w-full rounded-full py-3 text-center font-semibold transition-all",
                        plan.featured
                          ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90"
                          : "border border-border/20 text-foreground hover:bg-card/10",
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
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
                {statsItems.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-border/10 bg-card/5 p-6 text-center backdrop-blur-xl lg:p-8"
                  >
                    <div className="mb-2 text-3xl font-bold text-foreground lg:text-4xl">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="border-y border-border/10 bg-card/5 py-20 backdrop-blur-sm lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full border border-chart-4/20 bg-chart-4/10 px-4 py-1 text-sm font-medium text-chart-4">
                  Testimonials
                </span>
                <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl border border-border/10 bg-card/5 p-6 backdrop-blur-xl lg:p-8"
                  >
                    <div className="mb-4 flex gap-1">
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
            </div>
          </section>

          {/* FAQ */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                  FAQ
                </span>
                <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group overflow-hidden rounded-xl border border-border/10 bg-card/5 backdrop-blur-xl"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="text-lg font-semibold text-foreground">
                        {item.question}
                      </span>
                      <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
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
          <section className="relative overflow-hidden py-20 lg:py-32">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20" />
            <div className="absolute inset-0 backdrop-blur-3xl" />
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                {finalHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                {finalDesc}
              </p>
              <div className="mb-10 flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(finalPrimary)}
                  className="rounded-full bg-foreground px-8 py-4 text-center font-semibold text-background transition-colors hover:bg-foreground/90"
                >
                  {finalPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(finalSecondary)}
                  className="rounded-full border border-border/20 bg-card/10 px-8 py-4 text-center font-semibold text-foreground backdrop-blur-sm transition-all hover:bg-card/20"
                >
                  {finalSecondary}
                </button>
              </div>
              <p className="text-sm text-muted-foreground">{finalTrust}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/10 bg-card/5 py-16 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-5 lg:gap-12">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(brand)}
                  className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground"
                >
                  <LogoMark className="size-8" />
                  {brand}
                </button>
                <p className="mb-6 max-w-sm text-muted-foreground">
                  {footerTagline}
                </p>
                <div className="flex gap-4">
                  {footerSocials.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => go(s)}
                      className="rounded-full border border-border/10 bg-card/10 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-card/20 hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h3 className="mb-4 font-semibold text-foreground">
                    {col.title}
                  </h3>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border/10 pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">{footerCopyright}</p>
              <div className="flex flex-wrap gap-6">
                {["Privacy Policy", "Terms of Service", "Cookie Settings"].map(
                  (link) => (
                    <button
                      key={link}
                      type="button"
                      onClick={() => go(link)}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
