import type { ReactNode } from "react"
import { useState } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * MarketingAgencyKimiPage — a complete, self-contained growth / marketing-agency
 * LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Nexus Growth" design: a clean,
 * editorial, light B2B aesthetic (neutral canvas, generous whitespace, pill CTAs,
 * subtle borders) punctuated by two high-contrast dark bands. It pairs a split
 * hero (eyebrow + headline with a muted-highlight phrase + dual CTAs + trust
 * checks + a floating ROI stat card over a team photo) with a logo trust-strip,
 * a 6-up services grid (icon tile + bullet capabilities), a dark KPI stats band,
 * a 4-step process timeline, a 6-up case-study gallery (image + category tag +
 * dual result metrics), a 3-up star-rated testimonial grid with avatars, a 3-tier
 * pricing table (highlighted "Most Popular" plan), an FAQ accordion, a dark
 * closing CTA band with booking reassurances, and a 4-column footer.
 *
 * The block owns ALL layout, spacing, type hierarchy and color. Surfaces use
 * semantic theme tokens only (no palette colors, no theme-variant prefixes); dark bands
 * use the `primary` surface to preserve Kimi's contrast. Every nav item / CTA /
 * footer link / social / form submit routes through `useNavigate` (never a dead
 * "#"). All content imagery uses the alt-driven <Image> component. Callers supply
 * ONLY content data; rich defaults make it render great with no props at all.
 */
export const MarketingAgencyKimiPage = defineComponent({
  name: "MarketingAgencyKimiPage",
  description:
    "Complete growth / digital marketing-agency LANDING page with a clean, editorial, conversion-focused B2B aesthetic: light neutral canvas, generous whitespace, rounded pill CTAs, subtle borders, and two high-contrast dark accent bands. Includes a split hero (eyebrow, headline with highlight phrase, dual CTAs, trust checkmarks, and a floating ROI stat card over a team photo), a 'trusted by' client logo strip, a 6-up services grid with icon tiles and capability bullets (performance marketing, SEO & content, email, CRO, social, analytics), a dark KPI/results stats band, a 4-step 'how we work' process timeline, a 6-card case-study gallery with category tags and dual result metrics, a 3-up star-rated testimonial grid with client avatars, a 3-tier pricing table with a highlighted Most Popular plan, an expandable FAQ accordion, a dark closing call-to-action band with a strategy-call booking and reassurance points, and a 4-column footer. Use as the ROOT/home page for marketing agencies, growth agencies, performance-marketing / SEO / paid-ads shops, lead-gen and demand-gen consultancies, or B2B SaaS and e-commerce growth firms when a credible, results-driven, metric-heavy page with case studies, pricing, and strong social proof is wanted. Supply content only — brand, nav, hero, services, stats, process, cases, testimonials, pricing, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Agency / brand name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        headingBefore: z.string().optional(),
        /** Phrase rendered with the muted highlight color. */
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        /** Inline trust reassurances beside the CTAs. */
        trust: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        /** Floating stat card over the hero image. */
        statValue: z.string().optional(),
        statLabel: z.string().optional(),
      })
      .optional(),
    /** Client logo trust strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Services / capabilities grid. */
    services: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              points: z.array(z.string()),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Dark KPI / results stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** 'How we work' process timeline. */
    process: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        steps: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Case-study gallery. */
    cases: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              tag: z.string(),
              summary: z.string(),
              metricA: z.string(),
              labelA: z.string(),
              metricB: z.string(),
              labelB: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Testimonials grid. */
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
            }),
          )
          .optional(),
      })
      .optional(),
    /** Pricing table. */
    pricing: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        note: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              audience: z.string(),
              price: z.string(),
              period: z.string().optional(),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
              /** Features with `included: false` rendered struck/muted. */
              features: z.array(
                z.object({ label: z.string(), included: z.boolean() }),
              ),
            }),
          )
          .optional(),
      })
      .optional(),
    /** FAQ accordion. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Closing call-to-action band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        email: z.string().optional(),
        reassurances: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
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
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Nexus Growth"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Case Studies", "Pricing", "FAQ", "Get Started"]

    const heroEyebrow = props.hero?.eyebrow ?? "Growth Marketing Agency"
    const heroBefore = props.hero?.headingBefore ?? "Turn Visitors Into"
    const heroHighlight = props.hero?.highlight ?? "Loyal Customers"
    const heroSub =
      props.hero?.subheading ??
      "We help B2B SaaS and e-commerce brands scale with data-driven marketing strategies. From SEO to paid acquisition, we've generated $47M+ in revenue for our clients since 2019."
    const heroPrimary = props.hero?.primaryCta ?? "Book a Free Strategy Call"
    const heroSecondary = props.hero?.secondaryCta ?? "View Case Studies"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["No long-term contracts", "Results in 90 days"]
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Marketing team collaborating in modern office workspace with laptops and analytics dashboards"
    const heroStatValue = props.hero?.statValue ?? "340%"
    const heroStatLabel = props.hero?.statLabel ?? "Avg. ROI Increase"

    const logosHeading = props.logos?.heading ?? "Trusted by leading brands"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Stripe", "Notion", "Figma", "Vercel", "Linear", "Webflow"]

    const servicesEyebrow = props.services?.eyebrow ?? "Our Services"
    const servicesHeading =
      props.services?.heading ?? "Growth Strategies That Work"
    const servicesDesc =
      props.services?.description ??
      "We combine data science with creative excellence to deliver measurable results across every channel."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: "Performance Marketing",
            description:
              "Google Ads, Meta, LinkedIn, and TikTok campaigns optimized for ROAS. We manage $2M+ in monthly ad spend with an average 4.2x return.",
            points: [
              "Audience segmentation",
              "Creative A/B testing",
              "Conversion tracking",
            ],
          },
          {
            title: "SEO & Content",
            description:
              "Technical SEO audits, content strategy, and link building. We've helped clients rank #1 for 5,000+ competitive keywords.",
            points: [
              "Technical audits",
              "Content clusters",
              "Authority building",
            ],
          },
          {
            title: "Email Marketing",
            description:
              "Automated sequences, newsletters, and retention campaigns. Our clients see 35%+ open rates and $45 average revenue per email.",
            points: ["Lifecycle automation", "Segmentation", "A/B testing"],
          },
          {
            title: "Conversion Optimization",
            description:
              "CRO audits, user research, and landing page optimization. Average 23% lift in conversion rates within 60 days.",
            points: [
              "Heatmap analysis",
              "User testing",
              "Landing page design",
            ],
          },
          {
            title: "Social Media",
            description:
              "Organic strategy, content creation, and community management. We grew client followings by 2M+ across platforms last year.",
            points: [
              "Content calendars",
              "Video production",
              "Influencer outreach",
            ],
          },
          {
            title: "Analytics & Reporting",
            description:
              "Custom dashboards, attribution modeling, and actionable insights. Know exactly which campaigns drive revenue.",
            points: [
              "Custom dashboards",
              "Attribution modeling",
              "Weekly reports",
            ],
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "$47M+", label: "Revenue Generated" },
          { value: "127", label: "Clients Served" },
          { value: "340%", label: "Avg. ROI Increase" },
          { value: "5.8M", label: "Leads Generated" },
        ]

    const processEyebrow = props.process?.eyebrow ?? "Our Process"
    const processHeading = props.process?.heading ?? "How We Work"
    const processDesc =
      props.process?.description ??
      "A proven framework that delivers consistent results."
    const processSteps = props.process?.steps?.length
      ? props.process.steps
      : [
          {
            title: "Discovery",
            description:
              "Deep dive into your business, competitors, and current performance. We audit every channel and identify quick wins.",
          },
          {
            title: "Strategy",
            description:
              "Custom growth roadmap with clear milestones, budget allocation, and KPIs. Everything documented in Notion.",
          },
          {
            title: "Execution",
            description:
              "Campaign launches, creative production, and iterative optimization. Weekly standups and async updates.",
          },
          {
            title: "Scale",
            description:
              "Double down on winners, cut losers, and expand to new channels. Monthly strategy reviews and pivoting.",
          },
        ]

    const casesEyebrow = props.cases?.eyebrow ?? "Case Studies"
    const casesHeading = props.cases?.heading ?? "Results That Speak"
    const casesDesc =
      props.cases?.description ??
      "Real outcomes from real clients across SaaS, e-commerce, and B2B services."
    const caseItems = props.cases?.items?.length
      ? props.cases.items
      : [
          {
            name: "CloudSync",
            tag: "SaaS",
            summary:
              "Workflow automation platform for remote teams. Joined at $200K ARR.",
            metricA: "892%",
            labelA: "Revenue Growth",
            metricB: "$1.8M",
            labelB: "New ARR in 8 Months",
          },
          {
            name: "Luxe Threads",
            tag: "E-commerce",
            summary:
              "Sustainable luxury fashion brand. Shopify store struggling with CAC.",
            metricA: "156%",
            labelA: "ROAS Increase",
            metricB: "$420K",
            labelB: "Monthly Revenue",
          },
          {
            name: "Paywise",
            tag: "Fintech",
            summary:
              "B2B payment processing platform. Needed enterprise lead generation.",
            metricA: "3,400",
            labelA: "Qualified Leads",
            metricB: "$2.1M",
            labelB: "Pipeline Generated",
          },
          {
            name: "MedConnect",
            tag: "Healthcare",
            summary:
              "Telehealth platform for mental health providers. HIPAA-compliant marketing.",
            metricA: "247%",
            labelA: "Patient Signups",
            metricB: "12,500",
            labelB: "New Providers",
          },
          {
            name: "BuildRight",
            tag: "Construction",
            summary:
              "Commercial construction firm. Needed local SEO and lead generation.",
            metricA: "#1",
            labelA: "Local Rankings",
            metricB: "$5.2M",
            labelB: "Contracts Won",
          },
          {
            name: "LearnHub",
            tag: "EdTech",
            summary:
              "Online coding bootcamp. High competition for “learn to code” keywords.",
            metricA: "89K",
            labelA: "Organic Visitors/Mo",
            metricB: "$3.8M",
            labelB: "Course Sales",
          },
        ]

    const testimonialsEyebrow =
      props.testimonials?.eyebrow ?? "Testimonials"
    const testimonialsHeading =
      props.testimonials?.heading ?? "What Clients Say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Don't just take our word for it. Here's what founders and marketing leaders say about working with us."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Nexus transformed our marketing. Within 6 months, we went from $50K MRR to $180K MRR. Their data-driven approach and weekly insights helped us understand exactly what was working.",
            name: "Marcus Chen",
            role: "CEO, CloudSync",
          },
          {
            quote:
              "Finally, a marketing agency that understands attribution. Nexus built us a proper tracking infrastructure and our CAC dropped by 40% while volume increased. Game changer.",
            name: "Sarah Mitchell",
            role: "CMO, Luxe Threads",
          },
          {
            quote:
              "The SEO results have been phenomenal. We're ranking #1 for our top 20 target keywords and organic is now our #1 acquisition channel. Worth every penny.",
            name: "David Park",
            role: "Founder, LearnHub",
          },
        ]

    const pricingEyebrow = props.pricing?.eyebrow ?? "Pricing"
    const pricingHeading =
      props.pricing?.heading ?? "Simple, Transparent Pricing"
    const pricingDesc =
      props.pricing?.description ??
      "No hidden fees. No long-term contracts. Cancel anytime."
    const pricingNote =
      props.pricing?.note ??
      "All plans include a 30-day money-back guarantee. No questions asked."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Starter",
            audience: "For early-stage startups",
            price: "$3,500",
            period: "/month",
            cta: "Get Started",
            featured: false,
            features: [
              { label: "1 channel (SEO or Paid)", included: true },
              { label: "Monthly reporting", included: true },
              { label: "Email support", included: true },
              { label: "$10K monthly ad spend", included: true },
              { label: "CRO & landing pages", included: false },
              { label: "Dedicated strategist", included: false },
            ],
          },
          {
            name: "Growth",
            audience: "For scaling companies",
            price: "$7,500",
            period: "/month",
            cta: "Get Started",
            featured: true,
            badge: "Most Popular",
            features: [
              { label: "3 channels included", included: true },
              { label: "Weekly reporting", included: true },
              { label: "Priority support", included: true },
              { label: "$50K monthly ad spend", included: true },
              { label: "CRO & landing pages", included: true },
              { label: "Dedicated strategist", included: true },
            ],
          },
          {
            name: "Enterprise",
            audience: "For established brands",
            price: "Custom",
            cta: "Contact Sales",
            featured: false,
            features: [
              { label: "All channels included", included: true },
              { label: "Real-time dashboard", included: true },
              { label: "24/7 support", included: true },
              { label: "Unlimited ad spend", included: true },
              { label: "Full creative team", included: true },
              { label: "Quarterly business reviews", included: true },
            ],
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about working with Nexus Growth."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "How quickly can I expect to see results?",
            a: "Most clients see meaningful improvements within 60-90 days. Paid campaigns often show results within 2-4 weeks, while SEO typically takes 3-6 months for significant ranking improvements. We set clear milestone expectations during onboarding.",
          },
          {
            q: "Do I need to sign a long-term contract?",
            a: "No. All our plans are month-to-month with a 30-day cancellation notice. We believe in earning your business every month through results, not legal obligations. Enterprise clients may opt for annual agreements with pricing benefits.",
          },
          {
            q: "What's included in the ad spend?",
            a: "Our fees are separate from your actual ad spend (what you pay to Google, Meta, etc.). The ad spend limits in our pricing refer to how much we can effectively manage within that tier. You maintain ownership of all ad accounts and assets.",
          },
          {
            q: "How do you report on progress?",
            a: "All clients get access to a real-time dashboard showing key metrics. We also provide weekly email updates and monthly video calls to review performance, discuss learnings, and plan next month's priorities. Enterprise clients get custom reporting.",
          },
          {
            q: "Do you work with agencies or white-label?",
            a: "Yes, we offer white-label partnerships for marketing agencies, web design firms, and consultants who want to offer performance marketing to their clients. Contact us for partner pricing and case studies from successful partnerships.",
          },
          {
            q: "What industries do you specialize in?",
            a: "We have deep expertise in B2B SaaS, e-commerce, fintech, healthcare, and professional services. While we can work with any industry, these are where we've generated the most consistent, outsized results for our clients.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to Scale Your Growth?"
    const ctaDesc =
      props.cta?.description ??
      "Book a free 30-minute strategy call. We'll audit your current marketing, identify quick wins, and build a roadmap for sustainable growth."
    const ctaPrimary = props.cta?.primaryCta ?? "Book Your Free Call"
    const ctaEmail = props.cta?.email ?? "hello@nexusgrowth.com"
    const ctaReassurances = props.cta?.reassurances?.length
      ? props.cta.reassurances
      : ["30 minutes", "No pitch, just strategy", "Recording shared after"]

    const footerAbout =
      props.footer?.about ??
      "Data-driven marketing for ambitious brands. Based in San Francisco, working with clients globally."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Services",
            links: [
              "Performance Marketing",
              "SEO & Content",
              "Email Marketing",
              "CRO",
            ],
          },
          {
            title: "Company",
            links: ["About", "Case Studies", "Careers", "Contact"],
          },
          {
            title: "Connect",
            links: ["Twitter", "LinkedIn", "YouTube", "Newsletter"],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ?? "All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Policy"]

    const navCta = nav[nav.length - 1]

    // Brand logo mark — layered diamond glyph (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={className}
        aria-hidden="true"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const Cross = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const serviceIcons: ReactNode[] = [
      // bar chart — performance
      <svg
        key="chart"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      // search — SEO
      <svg
        key="search"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>,
      // mail — email
      <svg
        key="mail"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>,
      // pie — CRO
      <svg
        key="pie"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>,
      // users — social
      <svg
        key="users"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      // document — analytics
      <svg
        key="doc"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>,
    ]

    // Rotating category-tag colors (token surfaces only).
    const tagTones = [
      "bg-chart-1 text-primary-foreground",
      "bg-chart-2 text-primary-foreground",
      "bg-chart-3 text-primary-foreground",
      "bg-chart-4 text-primary-foreground",
      "bg-chart-5 text-primary-foreground",
      "bg-primary text-primary-foreground",
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
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <LogoMark className="size-8 text-foreground" />
                <span className="text-lg font-semibold tracking-tight">
                  {brand}
                </span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.slice(0, -1).map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => go(navCta)}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {navCta}
                </button>
              </div>
              <button
                type="button"
                aria-label="Menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 text-foreground md:hidden"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-6"
                  aria-hidden="true"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              {mobileOpen && (
                <div
                  id="mobile-menu"
                  className="flex flex-col border-t border-border bg-background px-4 py-6 pb-8 md:hidden gap-4"
                >
                  {nav.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        setMobileOpen(false)
                        go(label)
                      }}
                      className="text-base font-medium text-foreground/90 transition-colors hover:text-foreground text-left"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-background">
            <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="max-w-2xl">
                  <p className="mb-4 text-sm font-medium text-muted-foreground">
                    {heroEyebrow}
                  </p>
                  <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {heroBefore}{" "}
                    <span className="text-muted-foreground">
                      {heroHighlight}
                    </span>
                  </h1>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <ArrowRight className="ml-2 size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 font-medium text-foreground transition-all hover:border-foreground/40"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    {heroTrust.map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <Check className="size-5 text-primary" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <Image
                    alt={heroImageAlt}
                    w={800}
                    h={600}
                    className="w-full rounded-xl object-cover shadow-lg"
                  />
                  <div className="absolute -bottom-6 -left-6 rounded-xl bg-card p-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-6"
                          aria-hidden="true"
                        >
                          <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-card-foreground">
                          {heroStatValue}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {heroStatLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logo trust strip */}
          <section className="border-y border-border bg-muted py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-70 md:grid-cols-3 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <div
                    key={logo}
                    className="text-center text-lg font-semibold text-muted-foreground"
                  >
                    {logo}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-3 text-sm font-medium text-muted-foreground">
                  {servicesEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {servicesHeading}
                </h2>
                <p className="text-muted-foreground">{servicesDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {serviceItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="rounded-xl bg-muted p-8 transition-colors hover:bg-accent"
                  >
                    <div className="mb-6 grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-3 text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {item.points.map((p) => (
                        <li key={p} className="flex items-center gap-2">
                          <span className="size-1.5 rounded-full bg-muted-foreground" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats band (dark) */}
          <section className="bg-primary py-20 text-primary-foreground">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 text-4xl font-bold sm:text-5xl">
                      {s.value}
                    </p>
                    <p className="text-sm text-primary-foreground/70">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Process */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-3 text-sm font-medium text-muted-foreground">
                  {processEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {processHeading}
                </h2>
                <p className="text-muted-foreground">{processDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-4">
                {processSteps.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-6 grid size-12 place-items-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                      {i + 1}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                    {i < processSteps.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="absolute left-full top-6 hidden h-px w-full -translate-x-6 bg-border md:block"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Case studies */}
          <section className="bg-muted py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-3 text-sm font-medium text-muted-foreground">
                  {casesEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {casesHeading}
                </h2>
                <p className="text-muted-foreground">{casesDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {caseItems.map((c, i) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => go(c.name)}
                    className="group block w-full overflow-hidden rounded-xl bg-card text-left shadow-sm transition-shadow hover:shadow-lg"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        alt={`${c.name} ${c.tag} marketing case study`}
                        w={600}
                        h={400}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span
                        className={cn(
                          "absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-medium",
                          tagTones[i % tagTones.length],
                        )}
                      >
                        {c.tag}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                        {c.name}
                      </h3>
                      <p className="mb-4 text-sm text-muted-foreground">
                        {c.summary}
                      </p>
                      <div className="flex items-center gap-4 border-t border-border pt-4">
                        <div>
                          <p className="text-2xl font-bold text-card-foreground">
                            {c.metricA}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {c.labelA}
                          </p>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div>
                          <p className="text-2xl font-bold text-card-foreground">
                            {c.metricB}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {c.labelB}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-3 text-sm font-medium text-muted-foreground">
                  {testimonialsEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-muted-foreground">{testimonialsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div key={t.name} className="rounded-xl bg-muted p-8">
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="size-5 text-chart-4" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={`Portrait of ${t.name}, ${t.role}`}
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

          {/* Pricing */}
          <section className="bg-muted py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-3 text-sm font-medium text-muted-foreground">
                  {pricingEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative rounded-xl p-8",
                      plan.featured
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-card-foreground",
                    )}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-foreground">
                          {plan.badge}
                        </span>
                      </div>
                    )}
                    <div className="mb-6">
                      <h3
                        className={cn(
                          "text-lg font-semibold",
                          plan.featured
                            ? "text-primary-foreground"
                            : "text-card-foreground",
                        )}
                      >
                        {plan.name}
                      </h3>
                      <p
                        className={cn(
                          "text-sm",
                          plan.featured
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {plan.audience}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span
                          className={cn(
                            plan.featured
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground",
                          )}
                        >
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <ul className="mb-8 space-y-3 text-sm">
                      {plan.features.map((f) => (
                        <li
                          key={f.label}
                          className={cn(
                            "flex items-center gap-3",
                            f.included
                              ? plan.featured
                                ? "text-primary-foreground/90"
                                : "text-muted-foreground"
                              : "text-muted-foreground/50",
                          )}
                        >
                          {f.included ? (
                            <Check
                              className={cn(
                                "size-5 shrink-0",
                                plan.featured
                                  ? "text-primary-foreground"
                                  : "text-primary",
                              )}
                            />
                          ) : (
                            <Cross className="size-5 shrink-0" />
                          )}
                          {f.label}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "block w-full rounded-full py-3 text-center font-medium transition-colors",
                        plan.featured
                          ? "bg-background text-foreground hover:bg-background/90"
                          : "border border-border text-foreground hover:border-foreground/40",
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
          <section className="bg-background py-24">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-3 text-sm font-medium text-muted-foreground">
                  {faqEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl border border-border bg-muted transition-all open:bg-card open:shadow-sm"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="font-medium text-foreground">
                        {item.q}
                      </span>
                      <span className="transition-transform group-open:rotate-180">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-5 text-muted-foreground"
                          aria-hidden="true"
                        >
                          <path d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-muted-foreground">
                      <p>{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Closing CTA band (dark) */}
          <section className="bg-primary py-24 text-primary-foreground">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-foreground/70">
                {ctaDesc}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center rounded-full bg-background px-8 py-4 font-medium text-foreground transition-colors hover:bg-background/90"
                >
                  {ctaPrimary}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-2 size-5"
                    aria-hidden="true"
                  >
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => go(navCta)}
                  className="inline-flex items-center justify-center rounded-full border border-primary-foreground/40 px-8 py-4 font-medium text-primary-foreground transition-colors hover:border-primary-foreground/70"
                >
                  {ctaEmail}
                </button>
              </div>
              <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-primary-foreground/70">
                {ctaReassurances.map((r) => (
                  <div key={r} className="flex items-center gap-2">
                    <Check className="size-5 text-primary-foreground" />
                    {r}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-background py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-4">
              <div className="md:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark className="size-8 text-foreground" />
                  <span className="text-lg font-semibold tracking-tight">
                    {brand}
                  </span>
                </button>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {footerAbout}
                </p>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-foreground">
                    {col.title}
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="transition-colors hover:text-foreground"
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
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} {brand} Agency.{" "}
                {footerCopyright}
              </p>
              <div className="flex gap-6 text-sm text-muted-foreground">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="transition-colors hover:text-foreground"
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
