import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

export const AiProductKimiPage3 = defineComponent({
  name: "AiProductKimiPage3",
  description:
    "Complete AI-product / AI-SaaS landing page VARIANT 3 — a dark, cinematic, gradient-accented alternative to AiProductKimiPage. Features a glass-morphism fixed navbar, a split hero with floating demo card and glowing backdrop orbs, a trusted-by press strip, a 6-up feature grid with colorful token-mapped icon tiles, a 3-step onboarding timeline with editorial images, a 6-item screenshot gallery with gradient hover overlays, a 4-up stats band plus 3 bottom metric callouts, a 3-tier pricing table with an interactive monthly/yearly toggle and a highlighted Most Popular plan, a 6-card star-rated testimonial wall with alt-driven avatars, a native details FAQ accordion, a dramatic final CTA with gradient background orbs, and a rich multi-column footer with social links. Use when you want a bold, high-contrast, futuristic AI writing-assistant or generative-AI tool launch page with vivid primary-to-accent gradients, depth effects, and social proof. The third style sibling to AiProductKimiPage.",
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
        imageAlt: z.string().optional(),
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
        headingAccent: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    steps: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        headingAccent: z.string().optional(),
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
    gallery: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              tag: z.string(),
              title: z.string(),
              subtitle: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    stats: z
      .object({
        heading: z.string().optional(),
        headingAccent: z.string().optional(),
        description: z.string().optional(),
        top: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
        bottom: z
          .array(
            z.object({
              value: z.string(),
              label: z.string(),
              icon: z.enum(["clock", "trending", "check"]).optional(),
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
              monthlyPrice: z.string(),
              yearlyPrice: z.string(),
              period: z.string(),
              cta: z.string(),
              featured: z.boolean().optional(),
              features: z.array(
                z.object({ text: z.string(), included: z.boolean() }),
              ),
            }),
          )
          .optional(),
      })
      .optional(),
    testimonials: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        headingAccent: z.string().optional(),
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
        badge: z.string().optional(),
        heading: z.string().optional(),
        headingAccent: z.string().optional(),
        description: z.string().optional(),
        contactLink: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    finalCta: z
      .object({
        heading: z.string().optional(),
        headingAccent: z.string().optional(),
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
          .array(
            z.object({
              title: z.string(),
              links: z.array(z.string()),
            }),
          )
          .optional(),
        bottomLinks: z.array(z.string()).optional(),
        copyright: z.string().optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)
    const [yearly, setYearly] = useState(false)

    const brand = props.brand ?? "ScriptForge"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "How It Works", "Pricing", "Reviews", "FAQ"]

    const heroBadge =
      props.hero?.badge ?? "Trusted by 50,000+ writers worldwide"
    const headingTop = props.hero?.headingTop ?? "Write Faster."
    const headingBottom = props.hero?.headingBottom ?? "Create Better."
    const heroSub =
      props.hero?.subheading ??
      "ScriptForge uses advanced AI to help you draft compelling content in seconds. From blog posts to marketing copy, emails to social media — create professional content 10x faster."
    const heroPrimary = props.hero?.primaryCta ?? "Start Writing Free"
    const heroSecondary = props.hero?.secondaryCta ?? "Watch Demo"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["No credit card required", "14-day free trial", "Cancel anytime"]
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Modern AI writing assistant interface showing text generation dashboard with editing tools"

    const logosLabel =
      props.logos?.label ?? "Trusted by leading companies worldwide"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["TechCrunch", "Forbes", "Wired", "TheVerge", "Bloomberg", "CNBC"]

    const featuresBadge = props.features?.badge ?? "Powerful Features"
    const featuresHeading =
      props.features?.heading ?? "Everything you need to"
    const featuresHeadingAccent =
      props.features?.headingAccent ?? "write like a pro"
    const featuresDesc =
      props.features?.description ??
      "From idea generation to final edits, ScriptForge provides AI-powered tools that streamline every step of your writing process."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Lightning Fast Generation",
            description:
              "Generate 1,000+ words in under 30 seconds. Our optimized AI models deliver high-quality content faster than any competitor.",
          },
          {
            title: "50+ Content Templates",
            description:
              "Pre-built templates for blogs, emails, ads, social posts, product descriptions, and more. Start with a proven framework.",
          },
          {
            title: "Multilingual Support",
            description:
              "Write fluently in 30+ languages including English, Spanish, French, German, Japanese, and Arabic with native-level quality.",
          },
          {
            title: "Plagiarism-Free Guarantee",
            description:
              "Every piece of content is 100% original. Built-in plagiarism checker ensures your work is unique and safe to publish.",
          },
          {
            title: "Tone & Style Control",
            description:
              "Adjust tone from professional to casual, persuasive to informative. Match your brand voice perfectly every time.",
          },
          {
            title: "SEO Optimization",
            description:
              "Built-in SEO analysis suggests keywords, meta descriptions, and readability improvements to rank higher on Google.",
          },
        ]

    const stepsBadge = props.steps?.badge ?? "How It Works"
    const stepsHeading = props.steps?.heading ?? "Three steps to"
    const stepsHeadingAccent = props.steps?.headingAccent ?? "better content"
    const stepsDesc =
      props.steps?.description ??
      "No learning curve required. Start creating professional content in minutes, not hours."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Choose Your Template",
            description:
              "Select from 50+ professionally designed templates for blogs, emails, ads, social media, and more. Each template is optimized for specific content types.",
            imageAlt:
              "Content template selection interface showing various blog and email template options",
          },
          {
            title: "Add Your Context",
            description:
              "Enter a brief description of what you want to write about. Add keywords, tone preferences, and any specific requirements. The more context, the better the output.",
            imageAlt:
              "AI writing input form with topic description field and keyword selection options",
          },
          {
            title: "Generate & Refine",
            description:
              "Click generate and watch as AI creates your content in seconds. Edit, refine, and export to your favorite format. It's that simple.",
            imageAlt:
              "Generated blog article displayed in a modern text editor with editing and export options",
          },
        ]

    const galleryBadge = props.gallery?.badge ?? "See It In Action"
    const galleryHeading = props.gallery?.heading ?? "Content that converts"
    const galleryDesc =
      props.gallery?.description ??
      "Browse examples of real content created with ScriptForge across different industries and formats."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            tag: "Blog Post",
            title: "Tech Industry Analysis",
            subtitle: "2,400 words • Generated in 45s",
            imageAlt:
              "Professional blog article layout with typography and structured content headings",
          },
          {
            tag: "Email Campaign",
            title: "Product Launch Series",
            subtitle: "5-email sequence • 34% open rate",
            imageAlt:
              "Marketing email template showing compelling subject line and call to action button design",
          },
          {
            tag: "Social Media",
            title: "Instagram Content Pack",
            subtitle: "30 posts • 3,200 engagements",
            imageAlt:
              "Social media content grid showing Instagram post designs with engaging captions and hashtags",
          },
          {
            tag: "Product Copy",
            title: "SaaS Feature Pages",
            subtitle: "12 descriptions • 28% conversion lift",
            imageAlt:
              "Professional product description page showing e-commerce copy with feature highlights",
          },
          {
            tag: "Presentation",
            title: "Investor Pitch Deck",
            subtitle: "15 slides • $2.4M raised",
            imageAlt:
              "Professional presentation slide deck with executive summary and data visualization",
          },
          {
            tag: "Web Copy",
            title: "Landing Page Hero",
            subtitle: "Full page • 42% lower bounce rate",
            imageAlt:
              "Website landing page mockup with compelling headline and hero section design",
          },
        ]

    const statsHeading = props.stats?.heading ?? "Numbers that speak"
    const statsHeadingAccent =
      props.stats?.headingAccent ?? "for themselves"
    const statsDesc =
      props.stats?.description ??
      "Join thousands of professionals who trust ScriptForge to power their content creation."
    const statsTop = props.stats?.top?.length
      ? props.stats.top
      : [
          { value: "50K+", label: "Active Writers" },
          { value: "12M+", label: "Articles Generated" },
          { value: "98%", label: "Satisfaction Rate" },
          { value: "4.9/5", label: "Average Rating" },
        ]
    const statsBottom = props.stats?.bottom?.length
      ? props.stats.bottom
      : [
          {
            value: "70%",
            label: "Time Saved on First Drafts",
            icon: "clock" as const,
          },
          {
            value: "3.2x",
            label: "Increase in Content Output",
            icon: "trending" as const,
          },
          {
            value: "45%",
            label: "Reduction in Editing Time",
            icon: "check" as const,
          },
        ]

    const pricingBadge = props.pricing?.badge ?? "Simple Pricing"
    const pricingHeading = props.pricing?.heading ?? "Choose your plan"
    const pricingDesc =
      props.pricing?.description ??
      "Start free, upgrade when you need more. All plans include core features with no hidden fees."
    const pricingNote =
      props.pricing?.note ??
      "All prices in USD. Taxes may apply. Cancel anytime."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Starter",
            tagline: "Perfect for trying ScriptForge",
            monthlyPrice: "$0",
            yearlyPrice: "$0",
            period: "/month",
            cta: "Get Started Free",
            featured: false,
            features: [
              { text: "5,000 words per month", included: true },
              { text: "10 content templates", included: true },
              { text: "Basic grammar & spelling", included: true },
              { text: "Email support", included: true },
              { text: "Plagiarism checker", included: false },
              { text: "Team collaboration", included: false },
            ],
          },
          {
            name: "Professional",
            tagline: "For serious content creators",
            monthlyPrice: "$29",
            yearlyPrice: "$23",
            period: "/month",
            cta: "Start 14-Day Free Trial",
            featured: true,
            features: [
              { text: "Unlimited words", included: true },
              { text: "All 50+ templates", included: true },
              { text: "Advanced tone control", included: true },
              { text: "Plagiarism checker", included: true },
              { text: "SEO optimization tools", included: true },
              { text: "Priority support (24h)", included: true },
            ],
          },
          {
            name: "Enterprise",
            tagline: "For teams and organizations",
            monthlyPrice: "$79",
            yearlyPrice: "$63",
            period: "/month",
            cta: "Contact Sales",
            featured: false,
            features: [
              { text: "Everything in Professional", included: true },
              { text: "Unlimited team members", included: true },
              { text: "Custom templates", included: true },
              { text: "SSO & advanced security", included: true },
              { text: "Dedicated account manager", included: true },
              { text: "SLA guarantee", included: true },
            ],
          },
        ]

    const testimonialsBadge = props.testimonials?.badge ?? "Customer Stories"
    const testimonialsHeading = props.testimonials?.heading ?? "Loved by writers"
    const testimonialsHeadingAccent =
      props.testimonials?.headingAccent ?? "everywhere"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See what professionals from startups to Fortune 500 companies say about ScriptForge."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "ScriptForge cut our content production time by 60%. What used to take 3 days now takes a few hours. The quality is consistently excellent, and our blog traffic increased by 45% in just two months.",
            name: "Sarah Chen",
            role: "Marketing Director, TechFlow Inc.",
            avatarAlt:
              "Professional headshot of Sarah Chen, a marketing director with short dark hair",
          },
          {
            quote:
              "As a freelance copywriter, ScriptForge has been a game-changer. I can handle 3x more clients without sacrificing quality. The tone customization feature is incredibly precise—it feels like having a writing partner who knows exactly what I need.",
            name: "Marcus Rodriguez",
            role: "Freelance Copywriter",
            avatarAlt:
              "Professional headshot of Marcus Rodriguez, a freelance copywriter with glasses and beard",
          },
          {
            quote:
              "We onboarded ScriptForge for our 12-person content team and saw immediate results. Our editorial calendar went from 8 articles/month to 25. The collaboration features make it easy for our editors to review and refine AI-generated drafts.",
            name: "Emily Watson",
            role: "Content Strategy Lead, ScaleUp Labs",
            avatarAlt:
              "Professional headshot of Emily Watson, a content strategy lead with blonde hair",
          },
          {
            quote:
              "The SEO features alone are worth the subscription. Our organic traffic grew 120% in 6 months. ScriptForge doesn't just write content—it writes content that ranks.",
            name: "David Kim",
            role: "SEO Specialist, GrowthRocket",
            avatarAlt:
              "Professional headshot of David Kim, an SEO specialist at a digital agency",
          },
          {
            quote:
              "I was skeptical at first, but ScriptForge helped me launch my side business. I wrote my entire website copy, product descriptions, and email sequences in one weekend. It's like having a world-class copywriter on demand.",
            name: "Aisha Patel",
            role: "Founder, EcoLiving Store",
            avatarAlt:
              "Professional headshot of Aisha Patel, an entrepreneur and founder of an e-commerce startup",
          },
          {
            quote:
              "Our agency uses ScriptForge Enterprise for 40+ clients. The custom templates and team collaboration features have streamlined our entire workflow. Client satisfaction scores are up 35%.",
            name: "James Thompson",
            role: "CEO, Thompson Digital Agency",
            avatarAlt:
              "Professional headshot of James Thompson, CEO of a marketing agency in a business suit",
          },
        ]

    const faqBadge = props.faq?.badge ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Frequently asked"
    const faqHeadingAccent = props.faq?.headingAccent ?? "questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about ScriptForge. Can't find what you're looking for? Contact our support team."
    const faqContactLink =
      props.faq?.contactLink ?? "Contact our support team"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How does ScriptForge generate content?",
            answer:
              "ScriptForge uses advanced large language models (LLMs) trained on high-quality content across various industries. When you provide a prompt or select a template, our AI analyzes your requirements and generates original, contextually relevant content. Every piece is checked for plagiarism and optimized for readability and engagement.",
          },
          {
            question: "Is the content generated by ScriptForge original?",
            answer:
              "Yes, absolutely. Every piece of content generated by ScriptForge is 100% original and created in real-time based on your input. We use a built-in plagiarism checker to ensure uniqueness. Our AI doesn't copy from existing sources—it creates new content using learned patterns and language understanding.",
          },
          {
            question: "Can I cancel my subscription anytime?",
            answer:
              "Yes, you can cancel your subscription at any time with no questions asked. If you cancel, you'll continue to have access until the end of your current billing period. We also offer a 14-day money-back guarantee for all paid plans—if you're not satisfied, contact us for a full refund.",
          },
          {
            question: "What languages does ScriptForge support?",
            answer:
              "ScriptForge supports 30+ languages including English, Spanish, French, German, Italian, Portuguese, Dutch, Russian, Japanese, Chinese (Simplified & Traditional), Korean, Arabic, Hindi, and more. Our multilingual capabilities are available on all plans, with the same quality standards across all supported languages.",
          },
          {
            question: "Do you offer team or enterprise plans?",
            answer:
              "Yes! Our Enterprise plan is designed for teams of any size and includes features like unlimited team members, custom templates, SSO integration, advanced security controls, dedicated account management, and SLA guarantees. Contact our sales team for a customized quote based on your organization's needs.",
          },
          {
            question: "How does the free plan work?",
            answer:
              "Our free Starter plan gives you 5,000 words per month and access to 10 popular templates. No credit card is required to sign up. It's perfect for trying out ScriptForge and light usage. When you need more words or advanced features, you can upgrade to a paid plan at any time.",
          },
        ]

    const finalHeading = props.finalCta?.heading ?? "Ready to transform your"
    const finalHeadingAccent =
      props.finalCta?.headingAccent ?? "writing workflow?"
    const finalDesc =
      props.finalCta?.description ??
      "Join 50,000+ writers who are creating better content faster with ScriptForge. Start your free trial today—no credit card required."
    const finalPrimary = props.finalCta?.primaryCta ?? "Start Writing Free"
    const finalSecondary = props.finalCta?.secondaryCta ?? "Schedule a Demo"
    const finalBadges = props.finalCta?.badges?.length
      ? props.finalCta.badges
      : ["14-day free trial", "No credit card needed", "Cancel anytime"]

    const footerTagline =
      props.footer?.tagline ??
      "AI-powered writing assistant helping professionals create compelling content 10x faster. Trusted by 50,000+ writers worldwide."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Templates", "API", "Integrations"],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Press", "Partners"],
          },
          {
            title: "Support",
            links: ["Help Center", "Contact", "Privacy", "Terms", "Security"],
          },
        ]
    const footerBottomLinks = props.footer?.bottomLinks?.length
      ? props.footer.bottomLinks
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Twitter", "LinkedIn", "GitHub"]

    // Inline icon components ------------------------------------------------
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground",
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

    const XIcon = ({ className }: { className?: string }) => (
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
      <svg key="bolt" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
      <svg key="chat" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>,
      <svg key="lang" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>,
      <svg key="check-circle" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      <svg key="sliders" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>,
      <svg key="code" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    ]

    const featureColors = [
      { text: "text-primary", bg: "bg-primary/20" },
      { text: "text-accent", bg: "bg-accent/20" },
      { text: "text-chart-2", bg: "bg-chart-2/20" },
      { text: "text-chart-1", bg: "bg-chart-1/20" },
      { text: "text-chart-5", bg: "bg-chart-5/20" },
      { text: "text-chart-3", bg: "bg-chart-3/20" },
    ]

    const galleryColors = [
      "text-primary", "text-accent", "text-chart-5", "text-chart-2", "text-chart-3", "text-chart-1",
    ]

    const stepColors = [
      { from: "from-primary", to: "to-primary" },
      { from: "from-accent", to: "to-accent" },
      { from: "from-chart-2", to: "to-chart-2" },
    ]

    const statIcon = (icon?: "clock" | "trending" | "check") => {
      if (icon === "trending") return <ArrowRight className="size-6" />
      if (icon === "check") return <Check className="size-6" />
      return <Star />
    }

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <button
              type="button"
              onClick={() => go("/")}
              className="flex items-center gap-2"
            >
              <LogoMark className="size-9" />
              <span className="text-lg font-bold">{brand}</span>
            </button>
            <div className="hidden items-center gap-8 md:flex">
              {nav.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => go("/")}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="hidden items-center gap-3 md:flex">
              <button
                type="button"
                onClick={() => go("/")}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => go("/")}
                className="rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-105"
              >
                {heroPrimary}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <XIcon className="size-6" />
              ) : (
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
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </nav>
          {menuOpen && (
            <div className="border-t border-border/60 bg-background/95 px-6 py-4 md:hidden">
              <div className="flex flex-col gap-3">
                {nav.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      go("/")
                    }}
                    className="text-left text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden pt-32 pb-20">
          <div
            className="pointer-events-none absolute -left-24 top-20 size-96 rounded-full bg-primary/30 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-24 top-40 size-96 rounded-full bg-accent/30 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-sm font-medium text-muted-foreground">
                <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
                {heroBadge}
              </span>
              <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-6xl">
                <span className="block">{headingTop}</span>
                <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {headingBottom}
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                {heroSub}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => go("/")}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-7 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-105"
                >
                  {heroPrimary}
                  <ArrowRight className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go("/")}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-7 py-3 text-base font-semibold text-foreground transition-colors hover:bg-card"
                >
                  {heroSecondary}
                </button>
              </div>
              <ul className="mt-8 flex flex-wrap gap-6">
                {heroTrust.map((t) => (
                  <li
                    key={t}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="size-4 text-accent" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="rounded-2xl border border-border/60 bg-card/60 p-2 shadow-2xl shadow-primary/10 backdrop-blur-xl">
                <Image
                  alt={heroImageAlt}
                  w={800}
                  h={600}
                  className="aspect-[4/3] w-full rounded-xl object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Logos */}
        <section className="border-y border-border/60 bg-card/30 py-12">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {logosLabel}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {logoItems.map((logo) => (
                <span
                  key={logo}
                  className="text-xl font-semibold text-muted-foreground/70"
                >
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-sm font-medium text-primary">
                {featuresBadge}
              </span>
              <h2 className="mt-4 text-4xl font-bold tracking-tight">
                {featuresHeading}{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {featuresHeadingAccent}
                </span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">{featuresDesc}</p>
            </div>
            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featureItems.map((feature, i) => {
                const color = featureColors[i % featureColors.length]
                return (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-border/60 bg-card/60 p-6 transition-colors hover:border-primary/40"
                  >
                    <div
                      className={cn(
                        "grid size-12 place-items-center rounded-xl",
                        color.bg,
                        color.text,
                      )}
                    >
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="border-t border-border/60 bg-card/30 py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-sm font-medium text-accent">
                {stepsBadge}
              </span>
              <h2 className="mt-4 text-4xl font-bold tracking-tight">
                {stepsHeading}{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {stepsHeadingAccent}
                </span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">{stepsDesc}</p>
            </div>
            <div className="mt-16 space-y-16">
              {stepItems.map((step, i) => {
                const color = stepColors[i % stepColors.length]
                return (
                  <div
                    key={step.title}
                    className={cn(
                      "grid items-center gap-10 lg:grid-cols-2",
                      i % 2 === 1 && "lg:[&>*:first-child]:order-2",
                    )}
                  >
                    <div>
                      <div
                        className={cn(
                          "inline-grid size-12 place-items-center rounded-xl bg-gradient-to-br text-lg font-bold text-primary-foreground",
                          color.from,
                          color.to,
                        )}
                      >
                        {i + 1}
                      </div>
                      <h3 className="mt-5 text-2xl font-semibold">{step.title}</h3>
                      <p className="mt-3 text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-card/60 p-2 shadow-xl">
                      <Image
                        alt={step.imageAlt}
                        w={800}
                        h={500}
                        loading="lazy"
                        className="aspect-[8/5] w-full rounded-xl object-cover"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-sm font-medium text-primary">
                {galleryBadge}
              </span>
              <h2 className="mt-4 text-4xl font-bold tracking-tight">
                {galleryHeading}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">{galleryDesc}</p>
            </div>
            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {galleryItems.map((item, i) => (
                <div
                  key={item.title}
                  className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60"
                >
                  <Image
                    alt={item.imageAlt}
                    w={600}
                    h={400}
                    loading="lazy"
                    className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <span
                      className={cn(
                        "text-xs font-semibold uppercase tracking-wide",
                        galleryColors[i % galleryColors.length],
                      )}
                    >
                      {item.tag}
                    </span>
                    <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-border/60 bg-card/30 py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-4xl font-bold tracking-tight">
                {statsHeading}{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {statsHeadingAccent}
                </span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">{statsDesc}</p>
            </div>
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {statsTop.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="bg-gradient-to-r from-primary to-accent bg-clip-text text-4xl font-bold text-transparent">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {statsBottom.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card/60 p-6"
                >
                  <div className="grid size-12 place-items-center rounded-xl bg-primary/20 text-primary">
                    {statIcon(stat.icon)}
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-sm font-medium text-primary">
                {pricingBadge}
              </span>
              <h2 className="mt-4 text-4xl font-bold tracking-tight">
                {pricingHeading}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">{pricingDesc}</p>
              <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border/60 bg-card/60 p-1">
                <button
                  type="button"
                  onClick={() => setYearly(false)}
                  className={cn(
                    "rounded-full px-5 py-2 text-sm font-medium transition-colors",
                    !yearly
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setYearly(true)}
                  className={cn(
                    "rounded-full px-5 py-2 text-sm font-medium transition-colors",
                    yearly
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  Yearly
                  <span className="ml-1 text-xs text-accent">Save 20%</span>
                </button>
              </div>
            </div>
            <div className="mt-16 grid gap-8 lg:grid-cols-3">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={cn(
                    "relative flex flex-col rounded-2xl border bg-card/60 p-8",
                    plan.featured
                      ? "border-primary/60 shadow-xl shadow-primary/10"
                      : "border-border/60",
                  )}
                >
                  {plan.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-1 text-xs font-semibold text-primary-foreground">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.tagline}
                  </p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      {yearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => go("/")}
                    className={cn(
                      "mt-6 rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:scale-105",
                      plan.featured
                        ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25"
                        : "border border-border bg-card text-foreground hover:bg-muted",
                    )}
                  >
                    {plan.cta}
                  </button>
                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feat) => (
                      <li
                        key={feat.text}
                        className={cn(
                          "flex items-center gap-3 text-sm",
                          feat.included
                            ? "text-foreground"
                            : "text-muted-foreground/60",
                        )}
                      >
                        {feat.included ? (
                          <Check className="size-5 text-accent" />
                        ) : (
                          <XIcon className="size-5" />
                        )}
                        {feat.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-sm text-muted-foreground">
              {pricingNote}
            </p>
          </div>
        </section>

        {/* Testimonials */}
        <section className="border-t border-border/60 bg-card/30 py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-sm font-medium text-accent">
                {testimonialsBadge}
              </span>
              <h2 className="mt-4 text-4xl font-bold tracking-tight">
                {testimonialsHeading}{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {testimonialsHeadingAccent}
                </span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {testimonialsDesc}
              </p>
            </div>
            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonialItems.map((t) => (
                <div
                  key={t.name}
                  className="flex flex-col rounded-2xl border border-border/60 bg-card/60 p-6"
                >
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} />
                    ))}
                  </div>
                  <p className="mt-4 flex-1 text-sm text-muted-foreground">
                    {t.quote}
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <Image
                      alt={t.avatarAlt}
                      w={48}
                      h={48}
                      loading="lazy"
                      className="size-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">
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
        <section className="py-24">
          <div className="mx-auto max-w-3xl px-6">
            <div className="text-center">
              <span className="inline-flex items-center rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-sm font-medium text-primary">
                {faqBadge}
              </span>
              <h2 className="mt-4 text-4xl font-bold tracking-tight">
                {faqHeading}{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {faqHeadingAccent}
                </span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">{faqDesc}</p>
            </div>
            <div className="mt-12 space-y-4">
              {faqItems.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-2xl border border-border/60 bg-card/60 p-6"
                >
                  <summary className="flex cursor-pointer items-center justify-between text-base font-semibold">
                    {item.question}
                    <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
            <p className="mt-8 text-center text-sm text-muted-foreground">
              <button
                type="button"
                onClick={() => go("/")}
                className="font-medium text-primary hover:underline"
              >
                {faqContactLink}
              </button>
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden border-t border-border/60 py-24">
          <div
            className="pointer-events-none absolute -left-24 bottom-0 size-96 rounded-full bg-primary/30 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-24 top-0 size-96 rounded-full bg-accent/30 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {finalHeading}{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {finalHeadingAccent}
              </span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">{finalDesc}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={() => go("/")}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-7 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-105"
              >
                {finalPrimary}
                <ArrowRight className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => go("/")}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-7 py-3 text-base font-semibold text-foreground transition-colors hover:bg-card"
              >
                {finalSecondary}
              </button>
            </div>
            <ul className="mt-8 flex flex-wrap justify-center gap-6">
              {finalBadges.map((b) => (
                <li
                  key={b}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Check className="size-4 text-accent" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/60 bg-card/30 py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-10 lg:grid-cols-4">
              <div className="lg:col-span-1">
                <div className="flex items-center gap-2">
                  <LogoMark className="size-9" />
                  <span className="text-lg font-bold">{brand}</span>
                </div>
                <p className="mt-4 max-w-xs text-sm text-muted-foreground">
                  {footerTagline}
                </p>
                <div className="mt-6 flex gap-3">
                  {footerSocials.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => go("/")}
                      className="rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h3 className="text-sm font-semibold">{col.title}</h3>
                  <ul className="mt-4 space-y-3">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go("/")}
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
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row">
              <p className="text-sm text-muted-foreground">{footerCopyright}</p>
              <div className="flex flex-wrap gap-6">
                {footerBottomLinks.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go("/")}
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
