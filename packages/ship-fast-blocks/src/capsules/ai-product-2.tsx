import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * AiProductKimiPage2 — VARIANT 2 of the AI-product / AI-SaaS landing page.
 *
 * A faithful Tailwind v4 port of a second Kimi-generated "WriteFlow AI" design,
 * intentionally DISTINCT from AiProductKimiPage: where the first sibling is a
 * clean, light, near-black-ink minimal layout, this variant is a bold, vivid,
 * high-contrast aesthetic built on a vibrant brand-primary hue. It pairs
 * dramatic dark/inverted sections (a glowing gradient hero, a dark "how it
 * works" band, a saturated stats strip, and a dark inverted CTA) against bright
 * light sections, gradient brand wordmark, animated pulse-glow primary CTAs, and
 * a live AI chat-bubble conversation preview card.
 */
export const AiProductKimiPage2 = defineCapsule({
  name: "AiProductKimiPage2",
  description:
    "ALTERNATIVE / second-style AI-product / AI-SaaS LANDING page — a bold, vivid, high-contrast sibling to AiProductKimiPage (use this when a more colorful, energetic, conversion-punchy generative-AI marketing site is wanted instead of the clean minimal look). Built on a saturated brand-primary hue with dramatic dark inverted bands: a glowing gradient hero with a live AI chat-bubble conversation preview, a trusted-by logo strip, a 6-up icon-tile feature grid, a dark 3-step 'how it works' timeline, an image use-case gallery with overlay captions, a 3-tier pricing table with a dark highlighted Most-Popular plan, a saturated 4-up stats band, a 6-card star-rated testimonial wall with avatars, an FAQ accordion, a dark inverted final call-to-action with pulse-glow CTAs, and a dark multi-column footer with social icons. Ideal as the ROOT/home page for AI writing assistants, generative-AI copilots, content-generation tools, AI productivity apps, or any modern SaaS/startup launch that wants a punchy, gradient-accented, trustworthy marketing site with features, pricing, social proof and FAQ. Supply content only — brand, nav, hero, logos, features, steps, gallery, pricing, stats, testimonials, faq, finalCta, footer; the block owns all layout and styling.",
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
        /** Second heading line, rendered in the brand gradient. */
        headingBottom: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        /** Trust microcopy beneath the CTAs. */
        trust: z.array(z.string()).optional(),
        /** Filename / URL shown in the preview card title bar. */
        previewFile: z.string().optional(),
        /** Chat turns inside the preview card (role + message). */
        chat: z
          .array(
            z.object({
              role: z.enum(["ai", "you"]),
              text: z.string(),
            }),
          )
          .optional(),
        /** Title of the generated-draft bubble. */
        draftTitle: z.string().optional(),
        /** Body of the generated-draft bubble. */
        draftBody: z.string().optional(),
        /** Action chips beneath the generated draft. */
        draftActions: z.array(z.string()).optional(),
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
        badge: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** 3-step onboarding timeline (dark band). */
    steps: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Use-case image gallery. */
    gallery: z
      .object({
        badge: z.string().optional(),
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
              period: z.string(),
              cta: z.string(),
              featured: z.boolean().optional(),
              features: z.array(z.string()),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Saturated 4-up stats band. */
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
    /** FAQ accordion. */
    faq: z
      .object({
        badge: z.string().optional(),
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
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "WriteFlow AI"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Pricing", "Reviews", "FAQ"]

    const heroBadge = props.hero?.badge ?? "Now with GPT-4 Turbo"
    const headingTop = props.hero?.headingTop ?? "Write faster."
    const headingBottom = props.hero?.headingBottom ?? "Think clearer."
    const heroSub =
      props.hero?.subheading ??
      "The generative AI writing assistant that helps marketing teams, creators, and professionals produce high-quality content in minutes—not hours."
    const heroPrimary = props.hero?.primaryCta ?? "Start free 14-day trial"
    const heroSecondary = props.hero?.secondaryCta ?? "Watch demo"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["No credit card required", "Cancel anytime"]
    const previewFile = props.hero?.previewFile ?? "writeflow.ai/editor"
    const chat = props.hero?.chat?.length
      ? props.hero.chat
      : [
          {
            role: "ai" as const,
            text: "I've analyzed your brand voice. Ready to draft that product announcement?",
          },
          {
            role: "you" as const,
            text: "Yes—launching WriteFlow 3.0 next Tuesday. Emphasize speed and collaboration.",
          },
        ]
    const draftTitle = props.hero?.draftTitle ?? "Draft generated (847 words)"
    const draftBody =
      props.hero?.draftBody ??
      "WriteFlow 3.0 launches Tuesday with real-time collaboration, AI-assisted editing, and 10x faster content workflows..."
    const draftActions = props.hero?.draftActions?.length
      ? props.hero.draftActions
      : ["Insert", "Regenerate", "Edit tone"]

    const logosLabel =
      props.logos?.label ?? "Trusted by content teams at leading companies"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Notion", "Shopify", "HubSpot", "Stripe", "Intercom", "Figma"]

    const featuresBadge = props.features?.badge ?? "Powerful Features"
    const featuresHeading =
      props.features?.heading ?? "Everything you need to write at scale"
    const featuresDesc =
      props.features?.description ??
      "From first draft to final polish, WriteFlow AI streamlines every step of your content creation workflow."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Lightning-fast drafts",
            description:
              "Generate blog posts, emails, social captions, and ad copy in seconds. Choose from 50+ content templates or create custom workflows.",
          },
          {
            title: "AI-powered editing",
            description:
              "Rewrite, expand, shorten, or change tone with one click. Fix grammar, improve clarity, and match your brand voice automatically.",
          },
          {
            title: "SEO optimization",
            description:
              "Built-in keyword research, readability scoring, and SERP analysis. Get real-time suggestions to rank higher on Google.",
          },
          {
            title: "Team collaboration",
            description:
              "Shared workspaces, real-time editing, comments, and approvals. Keep your entire content team aligned and moving fast.",
          },
          {
            title: "30+ languages",
            description:
              "Create content in English, Spanish, German, French, Japanese, and more. Maintain consistent quality across global markets.",
          },
          {
            title: "Integrations",
            description:
              "Connect with WordPress, HubSpot, Mailchimp, Google Docs, Notion, and more. Publish directly to your favorite platforms.",
          },
        ]

    const stepsBadge = props.steps?.badge ?? "How it works"
    const stepsHeading =
      props.steps?.heading ?? "From idea to published in 3 steps"
    const stepsDesc =
      props.steps?.description ??
      "WriteFlow AI eliminates writer's block and tedious editing so you can focus on strategy."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Describe your content",
            description:
              "Tell WriteFlow what you need—topic, audience, tone, and length. Or choose from 50+ proven templates for any content type.",
          },
          {
            title: "AI generates your draft",
            description:
              "Our GPT-4 powered engine creates a complete, ready-to-edit draft in seconds. Every output is original and plagiarism-free.",
          },
          {
            title: "Refine and publish",
            description:
              "Edit with AI assistance, get SEO suggestions, collaborate with your team, and publish to your CMS with one click.",
          },
        ]

    const galleryBadge = props.gallery?.badge ?? "Use cases"
    const galleryHeading = props.gallery?.heading ?? "Content that converts"
    const galleryDesc =
      props.gallery?.description ??
      "See what teams are creating with WriteFlow AI every day."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Blog posts & articles",
            description: "Long-form content that ranks",
          },
          {
            title: "Marketing copy",
            description: "Landing pages, ads & emails",
          },
          {
            title: "Social media",
            description: "Captions, threads & video scripts",
          },
          {
            title: "Product descriptions",
            description: "E-commerce & app store copy",
          },
          {
            title: "Video scripts",
            description: "YouTube, TikTok & webinars",
          },
          {
            title: "Email sequences",
            description: "Drip campaigns & newsletters",
          },
          {
            title: "Documentation",
            description: "Help centers & API docs",
          },
          {
            title: "Proposals & decks",
            description: "Sales & investor materials",
          },
        ]

    const pricingBadge = props.pricing?.badge ?? "Pricing"
    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ?? "Start free. Scale as you grow. No hidden fees."
    const pricingNote =
      props.pricing?.note ??
      "All plans include a 14-day free trial. No credit card required."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Starter",
            tagline: "Perfect for individuals trying AI writing",
            price: "$0",
            period: "/month",
            cta: "Get started free",
            features: [
              "10,000 words/month",
              "20+ templates",
              "Basic editor",
              "Email support",
            ],
          },
          {
            name: "Professional",
            tagline: "For freelancers and small teams",
            price: "$29",
            period: "/month",
            cta: "Start 14-day trial",
            featured: true,
            features: [
              "Unlimited words",
              "50+ templates",
              "AI editing & SEO tools",
              "5 team members",
              "Priority support",
              "API access",
            ],
          },
          {
            name: "Enterprise",
            tagline: "For large teams with custom needs",
            price: "$99",
            period: "/month",
            cta: "Contact sales",
            features: [
              "Everything in Pro",
              "Unlimited team members",
              "SSO & advanced security",
              "Custom AI training",
              "Dedicated account manager",
              "SLA guarantee",
            ],
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "50K+", label: "Active writers" },
          { value: "2M+", label: "Articles generated" },
          { value: "10x", label: "Faster content creation" },
          { value: "98%", label: "Customer satisfaction" },
        ]

    const testimonialsBadge = props.testimonials?.badge ?? "Testimonials"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by content teams"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See how professionals are transforming their writing workflow."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "WriteFlow cut our blog production time by 70%. What used to take a week now takes two days. The SEO suggestions alone are worth the subscription.",
            name: "Sarah Chen",
            role: "Marketing Director, TechFlow",
            avatarAlt:
              "Professional headshot of Sarah Chen, marketing director with dark hair",
          },
          {
            quote:
              "As a freelance copywriter, WriteFlow is my secret weapon. I can take on 3x more clients without sacrificing quality. The tone-matching feature is incredible.",
            name: "Marcus Williams",
            role: "Freelance Copywriter",
            avatarAlt:
              "Professional headshot of Marcus Williams, freelance copywriter with short beard",
          },
          {
            quote:
              "We onboarded our entire 12-person content team to WriteFlow Enterprise. The custom AI training means our brand voice stays consistent across all channels.",
            name: "Elena Rodriguez",
            role: "VP of Content, ScaleUp",
            avatarAlt:
              "Professional headshot of Elena Rodriguez, VP of content with curly brown hair",
          },
          {
            quote:
              "The multilingual support is a game-changer. We create content for 8 markets and WriteFlow maintains quality across all languages. Our international traffic is up 340%.",
            name: "James Park",
            role: "Growth Lead, GlobalMart",
            avatarAlt:
              "Professional headshot of James Park, growth lead with confident expression",
          },
          {
            quote:
              "I was skeptical about AI writing tools, but WriteFlow actually understands context. It doesn't just string keywords together—it crafts compelling narratives.",
            name: "Aisha Patel",
            role: "Content Strategist",
            avatarAlt:
              "Professional headshot of Aisha Patel, content strategist with warm smile",
          },
          {
            quote:
              "The API integration let us embed WriteFlow directly into our product. Our users now generate help articles automatically. Support tickets dropped 45%.",
            name: "David Kim",
            role: "CTO, HelpDesk Pro",
            avatarAlt:
              "Professional headshot of David Kim, CTO with glasses and thoughtful expression",
          },
        ]

    const faqBadge = props.faq?.badge ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ?? "Everything you need to know about WriteFlow AI."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "Is the content generated by WriteFlow original?",
            answer:
              "Yes. WriteFlow uses advanced AI models to generate completely original content. Every output is unique and passes plagiarism checks. We do not scrape or copy from existing sources—instead, the AI generates text based on patterns learned during training, similar to how humans write.",
          },
          {
            question: "Can I cancel my subscription at any time?",
            answer:
              "Absolutely. You can cancel your subscription at any time with no penalties or hidden fees. Your access will continue until the end of your current billing period. We also offer a 14-day free trial on all paid plans so you can try before you buy.",
          },
          {
            question: "What languages does WriteFlow support?",
            answer:
              "WriteFlow supports over 30 languages including English, Spanish, French, German, Italian, Portuguese, Dutch, Russian, Chinese (Simplified and Traditional), Japanese, Korean, Arabic, Hindi, and more. We're constantly adding new languages based on user demand.",
          },
          {
            question: "Is there a word limit on the Professional plan?",
            answer:
              "No. The Professional plan includes unlimited word generation. Write as much as you need without worrying about hitting caps or overage charges. Enterprise plans also include unlimited words with additional features like SSO and custom AI training.",
          },
          {
            question: "Can I train WriteFlow on my brand voice?",
            answer:
              "Yes! Professional and Enterprise plans include brand voice training. Upload samples of your existing content, define your tone guidelines (professional, casual, witty, etc.), and WriteFlow will adapt its output to match your unique style consistently.",
          },
          {
            question: "Do you offer API access?",
            answer:
              "Yes, API access is available on Professional and Enterprise plans. Our REST API lets you integrate WriteFlow's content generation into your own applications, workflows, and products. Comprehensive documentation and SDKs for Python, JavaScript, and Ruby are provided.",
          },
        ]

    const finalHeading =
      props.finalCta?.heading ?? "Ready to 10x your content output?"
    const finalDesc =
      props.finalCta?.description ??
      "Join 50,000+ writers, marketers, and teams who are creating better content faster with WriteFlow AI."
    const finalPrimary =
      props.finalCta?.primaryCta ?? "Start your free 14-day trial"
    const finalSecondary = props.finalCta?.secondaryCta ?? "Book a demo"
    const finalBadges = props.finalCta?.badges?.length
      ? props.finalCta.badges
      : ["No credit card required", "Cancel anytime", "24/7 support"]

    const footerTagline =
      props.footer?.tagline ??
      "The AI writing assistant that helps you create high-quality content 10x faster."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Integrations", "API", "Changelog"],
          },
          {
            title: "Resources",
            links: [
              "Documentation",
              "Blog",
              "Templates",
              "Help Center",
              "Community",
            ],
          },
          {
            title: "Company",
            links: ["About", "Careers", "Contact", "Privacy", "Terms"],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand}. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]

    // Brand mark — gradient tile with a pen/edit glyph (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          className="size-5"
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
        className="size-6"
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
      // pencil
      <svg
        key="pencil"
        className="size-6"
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
      // globe
      <svg
        key="globe-seo"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
      </svg>,
      // users
      <svg
        key="users"
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
      // translate
      <svg
        key="translate"
        className="size-6"
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
      // database
      <svg
        key="database"
        className="size-6"
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
    ]

    const trafficLights = ["bg-destructive", "bg-chart-4", "bg-primary"]

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased selection:bg-primary/20",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(brand)}
                className="flex items-center gap-2"
              >
                <LogoMark className="size-8" />
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
                  onClick={() => go("Sign in")}
                  className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-primary sm:block"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Start free trial
                </button>
              </div>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-foreground py-20 sm:py-24 lg:py-32">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-primary/30 via-foreground to-foreground"
            />
            <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
              <div className="absolute left-10 top-20 size-72 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute bottom-20 right-10 size-96 rounded-full bg-accent/20 blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-sm font-medium text-primary">
                      {heroBadge}
                    </span>
                  </div>
                  <h1 className="mb-6 text-4xl font-extrabold leading-tight text-background sm:text-5xl lg:text-6xl">
                    {headingTop}
                    <br />
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {headingBottom}
                    </span>
                  </h1>
                  <p className="mx-auto mb-8 max-w-xl text-lg text-background/70 sm:text-xl lg:mx-0">
                    {heroSub}
                  </p>
                  <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-lg shadow-primary/40 transition-all hover:scale-105 hover:bg-primary/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-background/20 bg-background/10 px-8 py-4 font-semibold text-background backdrop-blur transition-all hover:bg-background/20"
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
                  <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-background/60 lg:justify-start">
                    {heroTrust.map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <Check className="size-5 text-primary" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chat preview card */}
                <div className="relative">
                  <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                    <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-3">
                      <div className="flex gap-1.5">
                        {trafficLights.map((c) => (
                          <span key={c} className={cn("size-3 rounded-full", c)} />
                        ))}
                      </div>
                      <span className="ml-2 font-mono text-xs text-muted-foreground">
                        {previewFile}
                      </span>
                    </div>
                    <div className="space-y-4 p-6">
                      {chat.map((turn, i) =>
                        turn.role === "ai" ? (
                          <div key={i} className="flex items-start gap-3">
                            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                              AI
                            </span>
                            <div className="max-w-xs rounded-lg bg-muted px-4 py-3 text-sm text-card-foreground">
                              {turn.text}
                            </div>
                          </div>
                        ) : (
                          <div
                            key={i}
                            className="flex items-start justify-end gap-3"
                          >
                            <div className="max-w-xs rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-card-foreground">
                              {turn.text}
                            </div>
                            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                              You
                            </span>
                          </div>
                        ),
                      )}
                      <div className="flex items-start gap-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          AI
                        </span>
                        <div className="max-w-md space-y-2 rounded-lg bg-muted px-4 py-4 text-sm text-card-foreground">
                          <p className="font-medium text-card-foreground">
                            ✨ {draftTitle}
                          </p>
                          <p className="text-muted-foreground">{draftBody}</p>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {draftActions.map((action, i) => (
                              <button
                                key={action}
                                type="button"
                                onClick={() => go(action)}
                                className={cn(
                                  "rounded px-3 py-1 text-xs font-medium transition-colors",
                                  i === 0
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "bg-secondary text-secondary-foreground hover:bg-accent",
                                )}
                              >
                                {action}
                              </button>
                            ))}
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
          <section className="border-b border-border bg-background py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-70 md:grid-cols-3 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="flex justify-center text-lg font-bold text-foreground/80 transition-colors hover:text-primary"
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-background py-20 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  {featuresBadge}
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-border bg-muted/50 p-8 transition-colors hover:border-primary/40"
                  >
                    <div className="mb-6 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Steps (dark band) */}
          <section className="bg-foreground py-20 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  {stepsBadge}
                </span>
                <h2 className="mb-4 text-3xl font-bold text-background sm:text-4xl lg:text-5xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-background/60">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    {i < stepItems.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="absolute left-20 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-primary to-transparent md:block"
                      />
                    )}
                    <div className="mb-6 grid size-16 place-items-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
                      {i + 1}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-background">
                      {step.title}
                    </h3>
                    <p className="text-background/60">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-background py-20 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  {galleryBadge}
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{galleryDesc}</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {galleryItems.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => go(item.title)}
                    className="group relative block overflow-hidden rounded-2xl text-left"
                  >
                    <Image
                      alt={item.title}
                      w={600}
                      h={400}
                      loading="lazy"
                      className="h-64 w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-foreground/90 to-transparent p-6">
                      <h4 className="text-lg font-bold text-background">
                        {item.title}
                      </h4>
                      <p className="text-sm text-background/70">
                        {item.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted/50 py-20 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  {pricingBadge}
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <article
                    key={plan.name}
                    className={cn(
                      "relative rounded-2xl p-8",
                      plan.featured
                        ? "border-2 border-primary bg-foreground md:-translate-y-4"
                        : "border border-border bg-card",
                    )}
                  >
                    {plan.featured && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                          Most popular
                        </span>
                      </div>
                    )}
                    <h3
                      className={cn(
                        "mb-2 text-lg font-semibold",
                        plan.featured ? "text-background" : "text-card-foreground",
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
                    <div className="mb-6 flex items-baseline gap-1">
                      <span
                        className={cn(
                          "text-4xl font-bold",
                          plan.featured
                            ? "text-background"
                            : "text-card-foreground",
                        )}
                      >
                        {plan.price}
                      </span>
                      <span
                        className={cn(
                          plan.featured
                            ? "text-background/60"
                            : "text-muted-foreground",
                        )}
                      >
                        {plan.period}
                      </span>
                    </div>
                    <ul
                      className={cn(
                        "mb-8 space-y-3",
                        plan.featured
                          ? "text-background/80"
                          : "text-muted-foreground",
                      )}
                    >
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-3">
                          <Check
                            className={cn(
                              "size-5 shrink-0",
                              plan.featured ? "text-primary" : "text-primary",
                            )}
                          />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "w-full rounded-lg px-4 py-3 text-center font-semibold transition-colors",
                        plan.featured
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-secondary text-secondary-foreground hover:bg-accent",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </article>
                ))}
              </div>
              <p className="mt-8 text-center text-sm text-muted-foreground">
                {pricingNote}
              </p>
            </div>
          </section>

          {/* Stats (saturated band) */}
          <section className="bg-primary py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <div className="mb-2 text-4xl font-bold text-primary-foreground sm:text-5xl">
                      {s.value}
                    </div>
                    <div className="font-medium text-primary-foreground/80">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-background py-20 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  {testimonialsBadge}
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <article
                    key={t.name}
                    className="rounded-2xl border border-border bg-muted/50 p-8"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
                      ))}
                    </div>
                    <p className="mb-6 text-foreground/80">
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
                        <div className="font-semibold text-foreground">
                          {t.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t.role}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted/50 py-20 sm:py-24">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  {faqBadge}
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group overflow-hidden rounded-xl border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="font-semibold text-card-foreground">
                        {item.question}
                      </span>
                      <svg
                        className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
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
                    </summary>
                    <div className="px-6 pb-6 text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA (dark band) */}
          <section className="relative overflow-hidden bg-foreground py-20 sm:py-24">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-primary/20 via-foreground to-foreground"
            />
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold text-background sm:text-4xl lg:text-5xl">
                {finalHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-xl text-background/70">
                {finalDesc}
              </p>
              <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(finalPrimary)}
                  className="rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-lg shadow-primary/40 transition-all hover:scale-105 hover:bg-primary/90"
                >
                  {finalPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(finalSecondary)}
                  className="rounded-xl border border-background/20 bg-background/10 px-8 py-4 font-semibold text-background backdrop-blur transition-all hover:bg-background/20"
                >
                  {finalSecondary}
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-background/60">
                {finalBadges.map((badge) => (
                  <div key={badge} className="flex items-center gap-2">
                    <Check className="size-5 text-primary" />
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer (dark) */}
        <footer className="bg-foreground py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
              <div className="col-span-2 lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(brand)}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark className="size-8" />
                  <span className="text-xl font-bold text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 max-w-xs text-background/60">
                  {footerTagline}
                </p>
                <div className="flex gap-4">
                  {(["Twitter", "LinkedIn", "GitHub"] as const).map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-lg bg-background/10 text-sm font-medium text-background/70 transition-colors hover:bg-background/20 hover:text-background"
                    >
                      {social.slice(0, 2)}
                    </button>
                  ))}
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-3 text-background/60">
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
              <div className="flex items-center gap-6 text-sm text-background/50">
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
