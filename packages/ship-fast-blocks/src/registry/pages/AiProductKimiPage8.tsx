import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * AiProductKimiPage8 — a complete, self-contained AI SaaS PRODUCT landing page.
 *
 * The 8th style sibling to AiProductKimiPage. A faithful Tailwind v4 token-compliant
 * port of a Kimi-generated "WRITR" design: a bold, high-contrast dark/light alternating
 * aesthetic with razor-sharp borders (no rounded corners), neon-on-black hero blocks,
 * uppercase mono typography, a seamless marquee logo strip, vividly color-blocked feature
 * cards with hover inversions, a numbered 3-step timeline with connector line, a 4×2
 * image gallery with hover overlays, a 3-tier pricing table with missing-feature
 * cross-marks and a "Most Popular" badge, a dark stats band with colored values, a
 * 6-card testimonial wall with alternating card palettes, a non-accordion FAQ stack,
 * a gradient-overlay final CTA, and a rich multi-column footer with social icons.
 *
 * Replaces the softer light look of AiProductKimiPage with a brash, editorial,
 * street-poster mood. All colors map to semantic tokens (no arbitrary palette).
 * Every nav item / CTA / link routes through useNavigate. All imagery uses the
 * alt-driven <Image> component.
 *
 * Use as the ROOT/home page for AI writing assistants, AI copilots, generative-AI
 * tools, AI productivity apps, developer-AI products, or any modern SaaS/startup launch
 * page when a bold, conversion-focused, high-contrast marketing site is wanted.
 * Supply content only — brand, nav, hero, logos, features, steps, gallery, pricing,
 * stats, testimonials, faq, finalCta, footer; the block owns all layout and styling.
 */
export const AiProductKimiPage8 = defineComponent({
  name: "AiProductKimiPage8",
  description:
    "Complete AI-product / AI-SaaS LANDING page in a bold, high-contrast 8th style variant (brash editorial dark/light alternating aesthetic, razor-sharp borders, neon hero, marquee logos, color-blocked feature cards with hover inversions, 3-step timeline, 4×2 image gallery, 3-tier pricing with missing-feature crosses and Most-Popular badge, colored stats band, alternating-palette testimonial wall, stacked FAQ, gradient final CTA, multi-column footer with social icons). Use as the ROOT/home page for AI writing assistants, AI copilots, generative-AI tools, AI productivity apps, or any modern SaaS/startup launch page when a bold, street-poster, conversion-focused marketing site with pricing, social proof and FAQ is wanted. Supply content only — brand, nav, hero, logos, features, steps, gallery, pricing, stats, testimonials, faq, finalCta, footer; the block owns all layout and styling. The 8th style sibling to AiProductKimiPage.",
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
        headingBottom: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        trust: z.array(z.string()).optional(),
        previewFile: z.string().optional(),
        previewIntro: z.string().optional(),
        previewQuote: z.string().optional(),
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
        label: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** 3-step onboarding + inline stats. */
    steps: z
      .object({
        label: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Product screenshot gallery. */
    gallery: z
      .object({
        label: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              category: z.string(),
              categoryColor: z.string().optional(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** 3-tier pricing block. */
    pricing: z
      .object({
        label: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        note: z.string().optional(),
        noteCta: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              period: z.string().optional(),
              cta: z.string(),
              featured: z.boolean().optional(),
              features: z.array(z.string()).optional(),
              missing: z.array(z.string()).optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** 4-up stats band. */
    stats: z
      .object({
        items: z
          .array(
            z.object({
              value: z.string(),
              label: z.string(),
              color: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Star-rated testimonial wall. */
    testimonials: z
      .object({
        label: z.string().optional(),
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
    /** FAQ stack. */
    faq: z
      .object({
        label: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
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
        trustLine: z.string().optional(),
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
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "WRITR"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Pricing", "Stories", "FAQ"]

    const heroBadge =
      props.hero?.badge ?? "New: Claude 3.7 Sonnet Integration"
    const headingTop = props.hero?.headingTop ?? "WRITE LIKE"
    const headingBottom = props.hero?.headingBottom ?? "IT'S 2026"
    const heroSub =
      props.hero?.subheading ??
      "The generative writing assistant that understands your voice. Draft blog posts, emails, ad copy, and novels 10x faster without losing your soul."
    const heroPrimary = props.hero?.primaryCta ?? "Start Free Trial"
    const heroSecondary = props.hero?.secondaryCta ?? "Watch Demo"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["No credit card", "14-day free trial", "Cancel anytime"]
    const previewFile = props.hero?.previewFile ?? "wrtr-editor.tsx"
    const previewIntro =
      props.hero?.previewIntro ?? "AI-powered content generation"
    const previewQuote =
      props.hero?.previewQuote ??
      "Generated 5-email sequence in 23 seconds matching your brand voice with 94% consistency score..."

    const logosLabel = props.logos?.label ?? "Trusted by teams at"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["NOTION", "STRIPE", "FIGMA", "LINEAR", "VERCEL", "RAMP", "BREX", "COPYAI"]

    const featuresLabel = props.features?.label ?? "Features"
    const featuresHeading =
      props.features?.heading ?? "EVERYTHING YOU NEED TO WRITE WITHOUT LIMITS"
    const featuresDesc =
      props.features?.description ??
      "From first draft to final polish. WRITR handles the heavy lifting so you can focus on what matters—your ideas."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Lightning Drafts",
            description:
              "Generate 2,000 words in under 30 seconds. Blog posts, essays, product descriptions—just describe what you need.",
          },
          {
            title: "Brand Voice Lock",
            description:
              "Train WRITR on your existing content. It learns your tone, vocabulary, and style rules—then never deviates.",
          },
          {
            title: "Content Calendar",
            description:
              "Plan, generate, and schedule weeks of content. Bulk-create 50 social posts or plan a month of blog articles.",
          },
          {
            title: "Smart Editor",
            description:
              "Inline suggestions, rewrite options, tone adjustments. Select any text and get 5 alternative versions instantly.",
          },
          {
            title: "Project Folders",
            description:
              "Organize by client, campaign, or content type. Each folder gets its own AI model tuned to that specific context.",
          },
          {
            title: "Team Workspaces",
            description:
              "Collaborate with your entire content team. Shared templates, approval workflows, and version history.",
          },
        ]

    const stepsLabel = props.steps?.label ?? "How It Works"
    const stepsHeading =
      props.steps?.heading ?? "FROM BLANK PAGE TO FINISHED PIECE IN 3 STEPS"
    const stepsDesc = props.steps?.description ?? ""
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Describe Your Goal",
            description:
              "Tell WRITR what you need—a product launch email, SEO blog post, or ad headline. The more context, the better the output.",
          },
          {
            title: "AI Generates Draft",
            description:
              "WRITR produces a complete first draft in seconds. It considers your brand voice, target audience, and content goals.",
          },
          {
            title: "Refine & Publish",
            description:
              "Use inline editing tools to polish. Export to your CMS, schedule for later, or share with your team for review.",
          },
        ]
    const stepStats = props.steps?.stats?.length
      ? props.steps.stats
      : [
          { value: "2.3s", label: "Average generation time" },
          { value: "94%", label: "Brand voice accuracy" },
          { value: "10x", label: "Faster than manual writing" },
        ]

    const galleryLabel = props.gallery?.label ?? "Use Cases"
    const galleryHeading = props.gallery?.heading ?? "WRITE ANYTHING. EVERYTHING."
    const galleryDesc =
      props.gallery?.description ??
      "See how teams use WRITR to create content across every channel and format."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Long-Form Articles",
            category: "Blog Content",
            categoryColor: "primary",
            imageAlt:
              "Minimalist desk setup with laptop showing blog editing interface",
          },
          {
            title: "Email Sequences",
            category: "Marketing",
            categoryColor: "accent",
            imageAlt:
              "Digital marketing analytics dashboard with colorful charts",
          },
          {
            title: "Social Posts",
            category: "Social",
            categoryColor: "secondary",
            imageAlt: "Social media content on smartphone screens",
          },
          {
            title: "Ad Copy",
            category: "Product",
            categoryColor: "primary",
            imageAlt:
              "Creative team brainstorming in modern office with sticky notes",
          },
          {
            title: "Website Copy",
            category: "Web",
            categoryColor: "accent",
            imageAlt:
              "Team meeting discussing website copy in conference room",
          },
          {
            title: "Scripts & Stories",
            category: "Creative",
            categoryColor: "secondary",
            imageAlt: "Screenplay script on desk with coffee",
          },
          {
            title: "Meta Descriptions",
            category: "SEO",
            categoryColor: "primary",
            imageAlt:
              "SEO specialist analyzing search rankings on multiple monitors",
          },
          {
            title: "Help Docs",
            category: "Support",
            categoryColor: "accent",
            imageAlt: "Customer support knowledge base interface",
          },
        ]

    const pricingLabel = props.pricing?.label ?? "Pricing"
    const pricingHeading =
      props.pricing?.heading ?? "SIMPLE PRICING. NO SURPRISES."
    const pricingDescription =
      props.pricing?.description ??
      "Start free. Scale when you're ready. All plans include core AI features."
    const pricingNote =
      props.pricing?.note ??
      "Need enterprise features? Contact our sales team for custom pricing."
    const pricingNoteCta = props.pricing?.noteCta ?? "Contact our sales team"
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Starter",
            tagline: "Perfect for trying WRITR",
            price: "$0",
            period: "/month",
            cta: "Get Started Free",
            featured: false,
            features: [
              "10,000 words / month",
              "Basic templates",
              "Email support",
            ],
            missing: ["No brand voice training", "No team features"],
          },
          {
            name: "Pro",
            tagline: "For serious content creators",
            price: "$29",
            period: "/month",
            cta: "Start 14-Day Trial",
            featured: true,
            features: [
              "Unlimited words",
              "All 50+ templates",
              "Brand voice training",
              "Priority support",
              "API access",
            ],
            missing: [],
          },
          {
            name: "Team",
            tagline: "For marketing teams (5 users)",
            price: "$79",
            period: "/month",
            cta: "Contact Sales",
            featured: false,
            features: [
              "Everything in Pro",
              "5 team members",
              "Shared workspaces",
              "Approval workflows",
              "Custom integrations",
            ],
            missing: [],
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "2M+", label: "Articles Generated", color: "primary" },
          { value: "50K+", label: "Active Writers", color: "accent" },
          { value: "4.9/5", label: "Average Rating", color: "secondary" },
          { value: "15M+", label: "Hours Saved", color: "background" },
        ]

    const testimonialsLabel = props.testimonials?.label ?? "Testimonials"
    const testimonialsHeading =
      props.testimonials?.heading ?? "WRITERS LOVE WRITR"
    const testimonialsDesc = props.testimonials?.description ?? ""
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "We cut our blog production time from 3 weeks to 3 days. WRITR doesn't just write—it understands our product and audience better than some of our junior writers.",
            name: "Sarah Chen",
            role: "Content Director, Notion",
            avatarAlt:
              "Professional headshot of Sarah Chen, content marketing director",
          },
          {
            quote:
              "As a solo founder, WRITR is my secret weapon. I generate my entire content calendar in one morning. The brand voice training is scary accurate.",
            name: "Marcus Williams",
            role: "Founder, TaskFlow",
            avatarAlt:
              "Professional headshot of Marcus Williams, founder of a SaaS startup",
          },
          {
            quote:
              "I was skeptical about AI writing tools. WRITR changed my mind. It handles the grunt work—first drafts, outlines—so I can focus on the creative refinement.",
            name: "Emma Rodriguez",
            role: "Freelance Copywriter",
            avatarAlt:
              "Professional headshot of Emma Rodriguez, freelance copywriter",
          },
          {
            quote:
              "Our email open rates increased 40% after switching to WRITR-generated subject lines. The AI understands what makes our dev audience click.",
            name: "David Park",
            role: "Marketing Manager, Figma",
            avatarAlt:
              "Professional headshot of David Park, marketing manager at Figma",
          },
          {
            quote:
              "I use WRITR for research and character development. It's like having a brainstorming partner that never gets tired. My latest novel hit the NYT bestseller list.",
            name: "Lisa Thompson",
            role: "Novelist & Coach",
            avatarAlt:
              "Professional headshot of Lisa Thompson, novelist and writing coach",
          },
          {
            quote:
              "We trained WRITR on 2 years of our content. Now it writes product updates that sound exactly like our team. It's become indispensable.",
            name: "James Miller",
            role: "Head of Content, Linear",
            avatarAlt:
              "Professional headshot of James Miller, head of content at a tech startup",
          },
        ]

    const faqLabel = props.faq?.label ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "QUESTIONS? ANSWERED."
    const faqDescription = props.faq?.description ?? ""
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "Is the content generated by WRITR original?",
            answer:
              "Yes. Every word is generated fresh by our AI models. We don't scrape or spin existing content. Plus, our built-in plagiarism checker scans against billions of web pages to ensure uniqueness.",
          },
          {
            question: "Can I train WRITR on my existing content?",
            answer:
              "Absolutely. Upload your blog posts, emails, or any writing samples. WRITR analyzes your tone, vocabulary, sentence structure, and style rules. Future outputs will match your voice with 94% accuracy on average.",
          },
          {
            question: "What languages does WRITR support?",
            answer:
              "WRITR writes fluently in 25+ languages including English, Spanish, French, German, Portuguese, Japanese, Chinese, and more. Brand voice training works across all supported languages.",
          },
          {
            question: "Do I need to install anything?",
            answer:
              "Nope. WRITR is 100% cloud-based. Access from any browser, anywhere. We also offer browser extensions for Chrome and Safari, plus plugins for WordPress, Webflow, and Notion.",
          },
          {
            question: "What happens to my data?",
            answer:
              "Your content is yours. We never train our AI models on customer data without explicit consent. Enterprise plans include SOC 2 Type II compliance, GDPR compliance, and custom data retention policies.",
          },
          {
            question: "Can I cancel my subscription?",
            answer:
              "Anytime. No questions asked. If you cancel, you keep access until the end of your billing period. We also offer a 30-day money-back guarantee for all paid plans.",
          },
        ]

    const finalHeading =
      props.finalCta?.heading ?? "STOP STARING AT\nBLANK PAGES"
    const finalDesc =
      props.finalCta?.description ??
      "Join 50,000+ writers who've already made the switch. Start your free trial today and write your first piece in the next 5 minutes."
    const finalPrimary = props.finalCta?.primaryCta ?? "Start Free Trial"
    const finalSecondary = props.finalCta?.secondaryCta ?? "Book a Demo"
    const finalTrust =
      props.finalCta?.trustLine ??
      "No credit card required • 14-day free trial • Cancel anytime"

    const footerTagline =
      props.footer?.tagline ??
      "The generative AI writing assistant that understands your voice. Write faster without losing your soul."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "API Docs", "Integrations", "Changelog"],
          },
          {
            title: "Resources",
            links: ["Blog", "Help Center", "Community", "Templates", "Webinars"],
          },
          {
            title: "Company",
            links: ["About", "Careers", "Press", "Contact", "Status"],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ?? `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`

    const featureSvgs = [
      <svg key="f0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
      <svg key="f1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      <svg key="f2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      <svg key="f3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
      <svg key="f4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
      <svg key="f5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    ]

    const featureCardMeta = [
      { card: "bg-foreground text-background hover:bg-background hover:text-foreground", icon: "bg-primary text-foreground", desc: "text-muted-foreground group-hover:text-foreground/70" },
      { card: "bg-background text-foreground hover:bg-foreground hover:text-background", icon: "bg-accent text-background", desc: "text-foreground/70 group-hover:text-muted-foreground" },
      { card: "bg-muted text-foreground hover:bg-foreground hover:text-background", icon: "bg-secondary text-foreground", desc: "text-foreground/70 group-hover:text-muted-foreground" },
      { card: "bg-foreground text-background hover:bg-primary hover:text-foreground", icon: "bg-background text-foreground", desc: "text-muted-foreground" },
      { card: "bg-background text-foreground hover:bg-accent hover:text-background", icon: "bg-foreground text-background", desc: "text-foreground/70 group-hover:text-background/80" },
      { card: "bg-primary text-foreground hover:bg-foreground hover:text-background", icon: "bg-foreground text-primary", desc: "text-foreground/70 group-hover:text-muted-foreground" },
    ]

    const stepNumberMeta = [
      { bg: "bg-primary", text: "text-foreground" },
      { bg: "bg-accent", text: "text-background" },
      { bg: "bg-secondary", text: "text-foreground" },
    ]

    const stepStatMeta = [
      { color: "text-primary" },
      { color: "text-accent" },
      { color: "text-secondary" },
    ]

    const testimonialMeta = [
      { card: "bg-muted border-foreground", text: "text-foreground", role: "text-muted-foreground", quote: "text-foreground/80", star: "text-primary", avatarBorder: "border-foreground" },
      { card: "bg-foreground border-foreground text-background", text: "text-background", role: "text-muted-foreground", quote: "text-background/70", star: "text-primary", avatarBorder: "border-background" },
      { card: "bg-muted border-foreground", text: "text-foreground", role: "text-muted-foreground", quote: "text-foreground/80", star: "text-primary", avatarBorder: "border-foreground" },
      { card: "bg-foreground border-foreground text-background", text: "text-background", role: "text-muted-foreground", quote: "text-background/70", star: "text-primary", avatarBorder: "border-background" },
      { card: "bg-muted border-foreground", text: "text-foreground", role: "text-muted-foreground", quote: "text-foreground/80", star: "text-primary", avatarBorder: "border-foreground" },
      { card: "bg-primary border-foreground text-foreground", text: "text-foreground", role: "text-foreground/70", quote: "text-foreground/80", star: "text-foreground", avatarBorder: "border-foreground" },
    ]

    const statsColorMeta = [
      "text-primary",
      "text-accent",
      "text-secondary",
      "text-background",
    ]

    return (
      <div className={cn("min-h-svh bg-background text-foreground antialiased", props.className)}>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 20s linear infinite;
          }
        ` }} />

        {/* Navbar */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b-4 border-foreground bg-foreground">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => go(brand)}
              className="flex items-center gap-2"
            >
              <span className="text-2xl font-black tracking-tighter text-background">
                {brand}
              </span>
              <span className="border border-primary px-1 font-mono text-xs text-primary">
                v3.0
              </span>
            </button>

            <div className="hidden items-center gap-8 md:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="font-mono text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-background"
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => go("Log In")}
                className="hidden font-mono text-sm text-muted-foreground transition-colors hover:text-background sm:block"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => go(heroPrimary)}
                className="border-2 border-primary bg-primary px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider text-foreground transition-all hover:bg-transparent hover:text-primary"
              >
                Start Free
              </button>
            </div>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section className="relative flex min-h-screen items-center overflow-hidden bg-foreground pt-16">
            <div className="absolute top-20 right-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
            <div className="absolute bottom-20 left-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 border border-background/10 bg-background/5 px-3 py-1">
                    <span className="h-2 w-2 animate-pulse bg-primary" />
                    <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      {heroBadge}
                    </span>
                  </div>

                  <h1 className="text-5xl font-black leading-[0.9] tracking-tight text-background sm:text-6xl lg:text-7xl">
                    {headingTop}
                    <br />
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {headingBottom}
                    </span>
                  </h1>

                  <p className="max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    {heroSub}
                  </p>

                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="border-2 border-primary bg-primary px-8 py-4 text-center font-mono text-sm font-bold uppercase tracking-wider text-foreground transition-all hover:bg-transparent hover:text-primary"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="border-2 border-background px-8 py-4 text-center font-mono text-sm font-bold uppercase tracking-wider text-background transition-all hover:bg-background hover:text-foreground"
                    >
                      {heroSecondary}
                    </button>
                  </div>

                  <div className="flex items-center gap-6 font-mono text-sm text-muted-foreground">
                    {heroTrust.map((t, i) => (
                      <span key={t} className="flex items-center gap-6">
                        <span>{t}</span>
                        {i < heroTrust.length - 1 && (
                          <span className="text-muted-foreground/40">|</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preview card */}
                <div className="relative">
                  <div className="overflow-hidden rounded-lg border-2 border-border bg-card shadow-2xl">
                    <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-2">
                      <div className="flex gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-destructive" />
                        <span className="h-3 w-3 rounded-full bg-chart-4" />
                        <span className="h-3 w-3 rounded-full bg-chart-3" />
                      </div>
                      <span className="ml-4 font-mono text-xs text-muted-foreground">
                        {previewFile}
                      </span>
                    </div>
                    <div className="p-6 font-mono text-sm">
                      <div className="mb-2 text-muted-foreground">// {previewIntro}</div>
                      <div className="space-y-1">
                        <div>
                          <span className="text-chart-1">const</span>{" "}
                          <span className="text-chart-2">campaign</span> ={" "}
                          <span className="text-chart-1">await</span> writr.
                          <span className="text-chart-4">generate</span>({"{"})
                        </div>
                        <div className="pl-4">
                          <span className="text-chart-3">type</span>:{" "}
                          <span className="text-chart-5">&apos;email_sequence&apos;</span>,
                        </div>
                        <div className="pl-4">
                          <span className="text-chart-3">tone</span>:{" "}
                          <span className="text-chart-5">&apos;confident_but_warm&apos;</span>,
                        </div>
                        <div className="pl-4">
                          <span className="text-chart-3">audience</span>:{" "}
                          <span className="text-chart-5">&apos;saas_founders&apos;</span>,
                        </div>
                        <div className="pl-4">
                          <span className="text-chart-3">goal</span>:{" "}
                          <span className="text-chart-5">&apos;trial_conversion&apos;</span>
                        </div>
                        <div>{"}"});</div>
                      </div>
                      <div className="mt-4 border-l-2 border-primary bg-muted/50 p-3">
                        <p className="italic text-card-foreground">
                          &ldquo;{previewQuote}&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 rotate-3 bg-accent px-4 py-2 font-mono text-sm font-bold text-background">
                    AI-POWERED
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y-4 border-foreground bg-muted py-12" aria-label="Trusted by">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-6 text-center font-mono text-sm uppercase tracking-widest text-muted-foreground">
                {logosLabel}
              </p>
            </div>
            <div className="relative overflow-hidden">
              <div className="flex animate-marquee whitespace-nowrap">
                <div className="flex items-center gap-16 px-8">
                  {logoItems.map((logo) => (
                    <button
                      key={`a-${logo}`}
                      type="button"
                      onClick={() => go(logo)}
                      className="shrink-0 text-2xl font-black text-muted-foreground"
                    >
                      {logo}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-16 px-8">
                  {logoItems.map((logo) => (
                    <button
                      key={`b-${logo}`}
                      type="button"
                      onClick={() => go(logo)}
                      className="shrink-0 text-2xl font-black text-muted-foreground"
                    >
                      {logo}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section id="features" className="bg-background py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 max-w-3xl">
                <span className="font-mono text-sm uppercase tracking-widest text-accent">
                  {featuresLabel}
                </span>
                <h2 className="mt-4 mb-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                  {featuresHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{featuresDesc}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => {
                  const meta = featureCardMeta[i % featureCardMeta.length]
                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => go(item.title)}
                      className={cn(
                        "group border-2 border-foreground p-8 text-left transition-all duration-300",
                        meta.card,
                      )}
                    >
                      <div
                        className={cn(
                          "mb-6 flex h-12 w-12 items-center justify-center",
                          meta.icon,
                        )}
                      >
                        {featureSvgs[i % featureSvgs.length]}
                      </div>
                      <h3 className="mb-3 font-mono text-xl font-bold uppercase">
                        {item.title}
                      </h3>
                      <p className={cn(meta.desc)}>{item.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section id="steps" className="bg-foreground py-24 text-background lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="font-mono text-sm uppercase tracking-widest text-primary">
                  {stepsLabel}
                </span>
                <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                  {stepsHeading}
                </h2>
                {stepsDesc && (
                  <p className="mt-4 text-xl text-muted-foreground">{stepsDesc}</p>
                )}
              </div>

              <div className="relative grid gap-8 lg:grid-cols-3">
                <div className="absolute top-1/2 left-0 right-0 hidden h-0.5 -translate-y-1/2 bg-border lg:block" />
                {stepItems.map((step, i) => {
                  const meta = stepNumberMeta[i % stepNumberMeta.length]
                  return (
                    <div key={step.title} className="relative z-10 text-center">
                      <div
                        className={cn(
                          "mx-auto mb-6 flex h-16 w-16 items-center justify-center border-4 border-foreground font-black text-2xl",
                          meta.bg,
                          meta.text,
                        )}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <h3 className="mb-4 font-mono text-xl font-bold uppercase">
                        {step.title}
                      </h3>
                      <p className="mx-auto max-w-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  )
                })}
              </div>

              <div className="mt-20 grid gap-8 text-center md:grid-cols-3">
                {stepStats.map((stat, i) => {
                  const color = stepStatMeta[i % stepStatMeta.length].color
                  return (
                    <div
                      key={stat.label}
                      className="border border-background/10 bg-background/5 p-6"
                    >
                      <div className={cn("mb-2 text-4xl font-black", color)}>
                        {stat.value}
                      </div>
                      <div className="font-mono text-sm uppercase text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section id="gallery" className="bg-background py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <span className="font-mono text-sm uppercase tracking-widest text-accent">
                    {galleryLabel}
                  </span>
                  <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                    {galleryHeading}
                  </h2>
                </div>
                <p className="max-w-md text-xl text-muted-foreground">
                  {galleryDesc}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {galleryItems.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => go(item.title)}
                    className="group relative overflow-hidden border-2 border-foreground"
                  >
                    <Image
                      alt={item.imageAlt}
                      w={600}
                      h={400}
                      loading="lazy"
                      className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex flex-col justify-end bg-foreground/80 p-6 opacity-0 transition-opacity group-hover:opacity-100">
                      <span
                        className={cn(
                          "mb-2 font-mono text-xs uppercase tracking-widest",
                          `text-${item.categoryColor}`,
                        )}
                      >
                        {item.category}
                      </span>
                      <h3 className="text-lg font-bold text-background">
                        {item.title}
                      </h3>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="bg-muted py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="font-mono text-sm uppercase tracking-widest text-accent">
                  {pricingLabel}
                </span>
                <h2 className="mt-4 mb-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                  {pricingHeading}
                </h2>
                <p className="text-xl text-muted-foreground">
                  {pricingDescription}
                </p>
              </div>

              <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "flex flex-col border-2 border-foreground p-8",
                      plan.featured
                        ? "relative bg-foreground text-background"
                        : "bg-card text-card-foreground",
                    )}
                  >
                    {plan.featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent px-4 py-1 font-mono text-xs font-bold uppercase tracking-wider text-background">
                        Most Popular
                      </div>
                    )}
                    <div className="mb-6">
                      <h3
                        className={cn(
                          "mb-2 font-mono text-lg uppercase tracking-wider",
                          plan.featured && "text-primary",
                        )}
                      >
                        {plan.name}
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black">{plan.price}</span>
                        <span className="font-mono text-muted-foreground">
                          {plan.period}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {plan.tagline}
                      </p>
                    </div>
                    <ul className="mb-8 flex-grow space-y-3">
                      {plan.features?.map((feat) => (
                        <li key={feat} className="flex items-center gap-3 font-mono text-sm">
                          <span className="text-primary">✓</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                      {plan.missing?.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-center gap-3 font-mono text-sm text-muted-foreground/60"
                        >
                          <span>×</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "w-full py-4 font-mono text-sm font-bold uppercase tracking-wider transition-all",
                        plan.featured
                          ? "bg-primary text-foreground hover:bg-background"
                          : "border-2 border-foreground hover:bg-foreground hover:text-background",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="font-mono text-sm text-muted-foreground">
                  {pricingNote}{" "}
                  <button
                    type="button"
                    onClick={() => go(pricingNoteCta)}
                    className="underline"
                  >
                    {pricingNoteCta}
                  </button>
                </p>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="border-y-4 border-primary bg-foreground py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statsItems.map((s, i) => {
                  const color = s.color ?? statsColorMeta[i % statsColorMeta.length]
                  return (
                    <div key={s.label}>
                      <div className={cn("mb-2 text-4xl font-black sm:text-5xl", color)}>
                        {s.value}
                      </div>
                      <div className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
                        {s.label}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section id="testimonials" className="bg-background py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="font-mono text-sm uppercase tracking-widest text-accent">
                  {testimonialsLabel}
                </span>
                <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                  {testimonialsHeading}
                </h2>
                {testimonialsDesc && (
                  <p className="mt-4 text-lg text-muted-foreground">
                    {testimonialsDesc}
                  </p>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t, i) => {
                  const meta = testimonialMeta[i % testimonialMeta.length]
                  return (
                    <div
                      key={t.name}
                      className={cn("border-2 p-8", meta.card)}
                    >
                      <div className="mb-6 flex items-center gap-4">
                        <Image
                          alt={t.avatarAlt}
                          w={100}
                          h={100}
                          loading="lazy"
                          className={cn(
                            "h-14 w-14 object-cover",
                            meta.avatarBorder,
                            "border-2",
                          )}
                        />
                        <div>
                          <div className={cn("font-bold", meta.text)}>
                            {t.name}
                          </div>
                          <div
                            className={cn(
                              "font-mono text-sm",
                              meta.role,
                            )}
                          >
                            {t.role}
                          </div>
                        </div>
                      </div>
                      <p className={cn("mb-4", meta.quote)}>{t.quote}</p>
                      <div className={cn("flex gap-1", meta.star)}>
                        ★★★★★
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="bg-muted py-24 lg:py-32">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="font-mono text-sm uppercase tracking-widest text-accent">
                  {faqLabel}
                </span>
                <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                  {faqHeading}
                </h2>
                {faqDescription && (
                  <p className="mt-4 text-lg text-muted-foreground">
                    {faqDescription}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <div
                    key={item.question}
                    className="border-2 border-foreground bg-card p-6"
                  >
                    <h3 className="mb-2 flex items-start gap-3 text-lg font-bold">
                      <span className="font-mono text-accent">Q:</span>
                      {item.question}
                    </h3>
                    <p className="pl-7 text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section
            id="cta"
            className="relative overflow-hidden bg-foreground py-24 text-background lg:py-32"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-primary/20" />
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-7xl">
                {finalHeading.split("\n").map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground">
                {finalDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(finalPrimary)}
                  className="border-2 border-primary bg-primary px-10 py-5 font-mono text-lg font-bold uppercase tracking-wider text-foreground transition-all hover:bg-transparent hover:text-primary"
                >
                  {finalPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(finalSecondary)}
                  className="border-2 border-background px-10 py-5 font-mono text-lg font-bold uppercase tracking-wider text-background transition-all hover:bg-background hover:text-foreground"
                >
                  {finalSecondary}
                </button>
              </div>
              <p className="mt-8 font-mono text-sm text-muted-foreground">
                {finalTrust}
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t-4 border-border bg-foreground pt-16 pb-8 text-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-3xl font-black tracking-tighter">
                    {brand}
                  </span>
                  <span className="border border-primary px-1 font-mono text-xs text-primary">
                    v3.0
                  </span>
                </div>
                <p className="mb-6 max-w-sm text-muted-foreground">
                  {footerTagline}
                </p>
                <div className="flex gap-4">
                  <button
                    type="button"
                    aria-label="Twitter"
                    onClick={() => go("Twitter")}
                    className="flex h-10 w-10 items-center justify-center border border-border transition-colors hover:border-primary hover:text-primary"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="LinkedIn"
                    onClick={() => go("LinkedIn")}
                    className="flex h-10 w-10 items-center justify-center border border-border transition-colors hover:border-primary hover:text-primary"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.14-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="GitHub"
                    onClick={() => go("GitHub")}
                    className="flex h-10 w-10 items-center justify-center border border-border transition-colors hover:border-primary hover:text-primary"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </button>
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-mono text-sm font-bold uppercase tracking-wider">
                    {col.title}
                  </h4>
                  <ul className="space-y-3 text-sm">
                    {col.links.map((link) => (
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
              <p className="font-mono text-sm text-muted-foreground">
                {footerCopyright}
              </p>
              <div className="flex gap-6 font-mono text-sm text-muted-foreground">
                <button type="button" onClick={() => go("Privacy")} className="transition-colors hover:text-background">
                  Privacy
                </button>
                <button type="button" onClick={() => go("Terms")} className="transition-colors hover:text-background">
                  Terms
                </button>
                <button type="button" onClick={() => go("Security")} className="transition-colors hover:text-background">
                  Security
                </button>
                <button type="button" onClick={() => go("Cookies")} className="transition-colors hover:text-background">
                  Cookies
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
