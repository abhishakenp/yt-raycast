import { useState, type ReactNode } from "react"
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
 * MarketingAgencyKimiPage2 — a complete, self-contained performance / growth
 * marketing-agency LANDING page, ported faithfully from a Kimi-generated
 * "GrowthLab" design.
 *
 * This is the SECOND, visually DISTINCT style sibling to MarketingAgencyKimiPage.
 * Where the first sibling is calm, editorial and neutral, THIS variant is bolder
 * and more energetic: a hot brand-accent hue, an animated infinite logo marquee,
 * rounded accent "pill" eyebrow chips on every section, a hero with a pulsing
 * status badge + duotone underline-stroke headline highlight + a floating ROI
 * stat card AND a floating "experts" avatar-stack badge over a team photo, an
 * accent stat band, a 6-up bordered services grid with rotating icon tiles, a
 * connector-line 4-step process, a high-contrast DARK case-study gallery with
 * colored category chips and dual result metrics, a 3-tier pricing table whose
 * "Most Popular" plan is a raised DARK card, a 6-up star-rated testimonial grid
 * with client avatars, an FAQ accordion with circular toggle buttons, an accent
 * closing CTA band with an inline email-capture audit form + reassurances, and a
 * rich DARK 5-column footer with social icons and contact details.
 *
 * FULL-STACK FEATURES: Includes Lakebed-powered saved case studies drawer
 * (bookmark icon on case cards), lead capture form with persisted submissions,
 * and Google authentication with account menu. All state is reactive and persisted
 * across sessions.
 *
 * The block owns ALL layout, spacing, type hierarchy and color. Surfaces use
 * semantic theme tokens only (no palette colors, no theme-variant prefixes);
 * dark bands use the `primary`/`foreground` surfaces to preserve Kimi's contrast
 * and the brand accent maps to `primary`. Every nav item / CTA / footer link /
 * social / form submit routes through `useNavigate` (never a dead "#"). All
 * content imagery uses the alt-driven <Image> component. Callers supply ONLY
 * content data; rich defaults make it render great with no props at all.
 */
export const MarketingAgencyKimiPage2 = defineCapsule({
  name: "MarketingAgencyKimiPage2",
  description:
    "Complete performance / growth marketing-agency LANDING page with a bold, energetic, conversion-focused aesthetic: a hot brand-accent hue, an animated infinite client-logo marquee, rounded accent 'pill' eyebrow chips, and several high-contrast dark accent bands. This is the SECOND visually DISTINCT style sibling / alternative to MarketingAgencyKimiPage (which is the calmer, editorial, neutral variant) — pick this one when a punchier, results-bragging, agency-energy look is wanted. Includes a split hero (pulsing 'trusted by' status badge, headline with an underline-stroke highlight word, dual CTAs, trust checkmarks, a floating ROI/ROAS stat card and a floating expert-avatar-stack badge over a team photo), an animated 'trusted by industry leaders' logo marquee strip, an accent KPI/stats band (revenue, brands, leads, ROAS), a 6-up bordered services grid with rotating icon tiles and capability check bullets (paid advertising, SEO & content, CRO & analytics, email marketing, creative production, strategy & consulting), a connector-line 4-step process timeline, a high-contrast DARK case-study gallery with colored category chips and dual result metrics plus campaign dates, a 3-tier pricing table with a raised DARK 'Most Popular' plan and performance-fee notes, a 6-card star-rated testimonial grid with client avatars, an FAQ accordion with circular toggle buttons, an accent closing call-to-action band with an inline email-capture free-audit form and reassurance points, and a rich DARK 5-column footer with brand blurb, social icons, link columns, and contact address/email/phone. FULL-STACK: Lakebed-powered saved case studies drawer (bookmark icon on case cards), lead capture form with persisted submissions, and Google authentication with account menu. Use as the ROOT/home page for marketing agencies, growth agencies, performance-marketing / paid-ads / media-buying shops, SEO and CRO consultancies, demand-gen and lead-gen firms, or B2B SaaS and e-commerce growth partners when a credible, metric-heavy, social-proof-rich page with case studies, pricing, and a free-audit offer is wanted. Supply content only — brand, nav, hero, logos, stats, services, process, cases, pricing, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Agency / brand name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingBefore: z.string().optional(),
        /** Word rendered with the accent underline-stroke highlight. */
        highlight: z.string().optional(),
        headingAfter: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        trust: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        statValue: z.string().optional(),
        statLabel: z.string().optional(),
        expertsLabel: z.string().optional(),
        /** Alt text for the stacked expert avatars in the floating badge. */
        expertAvatars: z.array(z.string()).optional(),
      })
      .optional(),
    /** Client logo marquee strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Accent KPI / stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
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
    /** Dark case-study gallery. */
    cases: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        cta: z.string().optional(),
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
              when: z.string(),
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
        noteLink: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              audience: z.string(),
              price: z.string(),
              period: z.string().optional(),
              fee: z.string().optional(),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
              features: z.array(z.string()),
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
    /** Accent closing call-to-action band with email-capture form. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        placeholder: z.string().optional(),
        button: z.string().optional(),
        reassurances: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        socials: z.array(z.string()).optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        address: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      leads: table({
        email: string(),
        company: string(),
        interest: string(),
      }),
      savedCases: table({
        caseName: string(),
      }),
    },
    queries: {
      leads: ({ db }) => db.leads.orderBy('createdAt').all(),
      savedCaseNames: ({ db }) =>
        new Set(db.savedCases.all().map((saved) => saved.caseName)),
    },
    mutations: {
      submitLead: ({ db }, email: string, company?: string, interest?: string) => {
        db.leads.insert({ email, company: company ?? '', interest: interest ?? '' })
        return db.leads.all()
      },
      toggleSavedCase: ({ db }, caseName: string) => {
        const existingSaved = db.savedCases.where('caseName', caseName).all()[0]

        if (existingSaved) {
          db.savedCases.delete(existingSaved.id)
          return false
        }

        db.savedCases.insert({ caseName })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [savedDrawerOpen, setSavedDrawerOpen] = useState(false)
    const brand = props.brand ?? "GrowthLab"

    // Lakebed queries and mutations
    const savedCaseNames = lakebed.useQuery('savedCaseNames')
    const submitLead = lakebed.useMutation('submitLead')
    const toggleSavedCase = lakebed.useMutation('toggleSavedCase')
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
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Case Studies", "Pricing", "Results", "FAQ", "Get Free Audit"]

    const heroBadge = props.hero?.badge ?? "Trusted by 250+ Brands Worldwide"
    const heroBefore = props.hero?.headingBefore ?? "We Turn Your"
    const heroHighlight = props.hero?.highlight ?? "Marketing"
    const heroAfter = props.hero?.headingAfter ?? "Into Revenue"
    const heroSub =
      props.hero?.subheading ??
      "Data-driven strategies that have generated $47M+ in client revenue. From SEO to paid ads, we deliver measurable growth for ambitious brands."
    const heroPrimary = props.hero?.primaryCta ?? "Start Your Growth Audit"
    const heroSecondary = props.hero?.secondaryCta ?? "View Case Studies"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["No Contracts Required", "Results in 90 Days", "Dedicated Growth Team"]
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Diverse marketing team collaborating around laptops in modern bright office space with large windows"
    const heroStatValue = props.hero?.statValue ?? "+312%"
    const heroStatLabel = props.hero?.statLabel ?? "Average ROAS"
    const heroExpertsLabel = props.hero?.expertsLabel ?? "50+ Experts"
    const heroExpertAvatars = props.hero?.expertAvatars?.length
      ? props.hero.expertAvatars
      : [
          "Professional headshot of smiling female marketing director with short brown hair",
          "Professional headshot of male growth strategist with beard and glasses",
          "Professional headshot of female data analyst with blonde hair and warm smile",
        ]

    const logosHeading = props.logos?.heading ?? "Trusted by Industry Leaders"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Stripe", "Notion", "Vercel", "Linear", "Figma", "Slack", "Shopify", "Webflow"]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "$47M+", label: "Revenue Generated" },
          { value: "250+", label: "Brands Grown" },
          { value: "8.5M+", label: "Leads Delivered" },
          { value: "312%", label: "Average ROAS" },
        ]

    const servicesEyebrow = props.services?.eyebrow ?? "Our Services"
    const servicesHeading =
      props.services?.heading ?? "Growth-First Marketing Services"
    const servicesDesc =
      props.services?.description ??
      "Full-funnel strategies tailored to your business goals. From awareness to conversion, we handle every touchpoint."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: "Paid Advertising",
            description:
              "Meta, Google, TikTok, and LinkedIn campaigns that deliver 5-10x ROAS. Full-funnel creative and media buying.",
            points: [
              "Meta & Google Ads Management",
              "TikTok & LinkedIn Advertising",
              "Programmatic Display",
            ],
          },
          {
            title: "SEO & Content",
            description:
              "Organic strategies that drive qualified traffic. Technical SEO, content marketing, and link building.",
            points: [
              "Technical SEO Audits",
              "Content Strategy & Creation",
              "Link Building Campaigns",
            ],
          },
          {
            title: "CRO & Analytics",
            description:
              "Data-driven optimization that increases conversion rates. A/B testing, user research, and funnel analysis.",
            points: [
              "Landing Page Optimization",
              "A/B & Multivariate Testing",
              "Advanced Analytics Setup",
            ],
          },
          {
            title: "Email Marketing",
            description:
              "Automated email sequences that nurture and convert. Average 35%+ open rates and $42 ROI per $1 spent.",
            points: [
              "Klaviyo & HubSpot Expertise",
              "Automated Flows & Campaigns",
              "List Growth & Segmentation",
            ],
          },
          {
            title: "Creative Production",
            description:
              "Scroll-stopping creative that converts. UGC, video ads, and brand assets optimized for performance.",
            points: [
              "UGC Content Creation",
              "Video & Motion Ads",
              "Static & Dynamic Creative",
            ],
          },
          {
            title: "Strategy & Consulting",
            description:
              "Comprehensive marketing strategy built for scale. Market research, competitive analysis, and growth roadmaps.",
            points: [
              "Go-to-Market Strategy",
              "Competitive Intelligence",
              "Growth Roadmapping",
            ],
          },
        ]

    const processEyebrow = props.process?.eyebrow ?? "Our Process"
    const processHeading = props.process?.heading ?? "How We Drive Growth"
    const processDesc =
      props.process?.description ??
      "A proven 4-phase methodology that delivers consistent, measurable results for every client."
    const processSteps = props.process?.steps?.length
      ? props.process.steps
      : [
          {
            title: "Discovery & Audit",
            description:
              "Deep dive into your business, market position, and current performance. We analyze competitors and identify growth opportunities.",
          },
          {
            title: "Strategy & Planning",
            description:
              "Custom growth roadmap with clear milestones. Channel selection, budget allocation, and creative direction aligned to your KPIs.",
          },
          {
            title: "Execution & Optimize",
            description:
              "Launch campaigns with rigorous testing. Continuous A/B testing, bid optimization, and creative iteration for peak performance.",
          },
          {
            title: "Scale & Report",
            description:
              "Double down on winning strategies. Weekly performance reports, monthly strategy reviews, and proactive recommendations.",
          },
        ]

    const casesEyebrow = props.cases?.eyebrow ?? "Case Studies"
    const casesHeading = props.cases?.heading ?? "Results That Speak"
    const casesDesc =
      props.cases?.description ??
      "Real campaigns, real brands, real revenue growth. Here's how we've transformed businesses."
    const casesCta = props.cases?.cta ?? "Get Your Custom Strategy"
    const caseItems = props.cases?.items?.length
      ? props.cases.items
      : [
          {
            name: "CloudSync",
            tag: "B2B SaaS",
            summary:
              "Workflow automation platform that needed to scale beyond product-led growth.",
            metricA: "+412%",
            labelA: "Demo Requests",
            metricB: "$2.4M",
            labelB: "Pipeline Added",
            when: "Campaign ran: Jan - June 2024",
          },
          {
            name: "Meridian Threads",
            tag: "E-commerce",
            summary:
              "Sustainable fashion brand seeking to triple their online revenue within 12 months.",
            metricA: "+287%",
            labelA: "Revenue Growth",
            metricB: "6.2x",
            labelB: "Facebook ROAS",
            when: "Campaign ran: March - Dec 2024",
          },
          {
            name: "VaultPay",
            tag: "Fintech",
            summary:
              "Digital wallet app competing in crowded market needed user acquisition at viable CAC.",
            metricA: "+156K",
            labelA: "App Installs",
            metricB: "$18",
            labelB: "Cost Per Install",
            when: "Campaign ran: June - Nov 2024",
          },
          {
            name: "MedConnect",
            tag: "Healthcare",
            summary:
              "Telehealth platform expanding into mental health services with patient acquisition focus.",
            metricA: "+523%",
            labelA: "New Patients",
            metricB: "42%",
            labelB: "Lower CAC",
            when: "Campaign ran: Feb - Aug 2024",
          },
          {
            name: "Apex Properties",
            tag: "Real Estate",
            summary:
              "Luxury real estate developer needed qualified buyer leads for new condo development.",
            metricA: "892",
            labelA: "Qualified Leads",
            metricB: "$47",
            labelB: "Cost Per Lead",
            when: "Campaign ran: Sept 2024 - Jan 2025",
          },
          {
            name: "LearnFlow",
            tag: "EdTech",
            summary:
              "Online course platform scaling from 10K to 100K students through paid acquisition.",
            metricA: "+198%",
            labelA: "Enrollments",
            metricB: "$3.8M",
            labelB: "Revenue Added",
            when: "Campaign ran: Jan - Dec 2024",
          },
        ]

    const pricingEyebrow = props.pricing?.eyebrow ?? "Pricing"
    const pricingHeading =
      props.pricing?.heading ?? "Transparent Pricing, Real Results"
    const pricingDesc =
      props.pricing?.description ??
      "No hidden fees, no surprises. Choose the plan that fits your growth stage."
    const pricingNote =
      props.pricing?.note ??
      "All plans include setup, pixel implementation, and conversion tracking."
    const pricingNoteLink =
      props.pricing?.noteLink ?? "See what's included in detail"
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Growth Starter",
            audience: "Perfect for early-stage startups",
            price: "$2,500",
            period: "/month",
            fee: "+ 8-12% of ad spend (performance fee)",
            cta: "Get Started",
            featured: false,
            features: [
              "Up to 2 Ad Platforms",
              "$5K-$25K Monthly Ad Budget",
              "4 Creative Assets/Month",
              "Weekly Performance Reports",
              "Dedicated Account Manager",
            ],
          },
          {
            name: "Growth Scale",
            audience: "For businesses ready to scale",
            price: "$5,000",
            period: "/month",
            fee: "+ 6-10% of ad spend (performance fee)",
            cta: "Schedule a Call",
            featured: true,
            badge: "Most Popular",
            features: [
              "Up to 4 Ad Platforms",
              "$25K-$100K Monthly Ad Budget",
              "12 Creative Assets/Month",
              "Landing Page Design",
              "CRO & A/B Testing",
              "Real-Time Dashboard Access",
              "Bi-Weekly Strategy Calls",
            ],
          },
          {
            name: "Growth Enterprise",
            audience: "Full-funnel marketing partner",
            price: "Custom",
            fee: "Tailored to your business goals",
            cta: "Contact Sales",
            featured: false,
            features: [
              "Unlimited Ad Platforms",
              "$100K+ Monthly Ad Budget",
              "Unlimited Creative Production",
              "Full CRO & Analytics Suite",
              "Dedicated Growth Team",
              "CMO-Level Strategic Support",
            ],
          },
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Testimonials"
    const testimonialsHeading =
      props.testimonials?.heading ?? "What Our Clients Say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Don't just take our word for it. Here's what founders and marketing leaders say about working with us."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "GrowthLab completely transformed our customer acquisition. We went from burning cash on underperforming ads to a 6.8x ROAS in just 3 months. Their team truly understands performance marketing.",
            name: "Marcus Chen",
            role: "CEO, CloudSync",
          },
          {
            quote:
              "Finally, an agency that delivers on their promises. Our e-commerce revenue tripled within 6 months, and our CPA dropped by 40%. Their strategic approach to creative testing is unmatched.",
            name: "Sarah Williams",
            role: "Founder, Meridian Threads",
          },
          {
            quote:
              "Working with GrowthLab feels like having an in-house team. They deeply understand our product and market, and their data-driven approach helped us acquire 150K+ users at a CAC 30% below target.",
            name: "David Park",
            role: "CTO, VaultPay",
          },
          {
            quote:
              "In the competitive telehealth space, GrowthLab helped us stand out. Their patient acquisition strategy drove a 523% increase in new patient sign-ups while maintaining HIPAA-compliant tracking.",
            name: "Dr. Emily Rodriguez",
            role: "CMO, MedConnect",
          },
          {
            quote:
              "High-value real estate leads at $47 each? I was skeptical until GrowthLab delivered. We sold 85% of our units within 6 months thanks to their laser-focused targeting and stunning creative.",
            name: "James Morrison",
            role: "Director, Apex Properties",
          },
          {
            quote:
              "From 10K to 100K students in one year. GrowthLab's full-funnel approach to our online courses—ads, email, SEO—created a growth engine that keeps delivering month after month.",
            name: "Jennifer Liu",
            role: "Founder, LearnFlow",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Common Questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about working with GrowthLab."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "How long does it take to see results?",
            a: "Most clients see initial performance improvements within 2-4 weeks as we optimize existing campaigns and launch new creative. Significant, sustained results typically emerge within 90 days, after we've completed our initial testing phase and identified your winning strategies. Our process is designed for quick wins followed by long-term scaling.",
          },
          {
            q: "Do you require long-term contracts?",
            a: "No. We believe in earning your business every month. Our Growth Starter and Growth Scale plans operate on a month-to-month basis with a 30-day notice period. Enterprise plans may include longer commitments based on project scope, but we always include performance guarantees. Our 94% client retention rate speaks to our confidence in delivering value.",
          },
          {
            q: "What's included in the setup process?",
            a: "Our comprehensive setup includes: full analytics audit and implementation (GA4, conversion tracking, attribution modeling), pixel setup across all platforms, audience research and segmentation, competitive analysis, initial creative asset development, landing page review and recommendations, and campaign structure buildout. Setup typically takes 1-2 weeks depending on complexity.",
          },
          {
            q: "How do you handle creative production?",
            a: "We have an in-house creative team plus a network of vetted UGC creators and video producers. Every creative brief is informed by performance data—we analyze what resonates with your audience and iterate accordingly. Scale and Enterprise plans include ongoing creative production; Starter plans can add creative services a la carte or use your existing assets.",
          },
          {
            q: "What industries do you specialize in?",
            a: "We have deep expertise in B2B SaaS, e-commerce (fashion, beauty, CPG), fintech and financial services, healthcare and telemedicine, real estate, and education/EdTech. Our data-driven methodology applies across industries, but our sector-specific experience means faster time-to-results and proven playbooks for your vertical.",
          },
          {
            q: "How do you report on performance?",
            a: "All clients receive weekly performance reports via email and real-time dashboard access powered by Google Data Studio. Scale and Enterprise plans include bi-weekly strategy calls and monthly business reviews. We focus on the metrics that matter: ROAS, CPA, LTV, and revenue attribution—not vanity metrics like impressions or clicks.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to Scale Your Growth?"
    const ctaDesc =
      props.cta?.description ??
      "Get a free growth audit worth $2,500. We'll analyze your current marketing performance and identify the biggest opportunities for revenue growth."
    const ctaPlaceholder = props.cta?.placeholder ?? "Enter your work email"
    const ctaButton = props.cta?.button ?? "Get My Audit"
    const ctaReassurances = props.cta?.reassurances?.length
      ? props.cta.reassurances
      : [
          "Free, no-obligation audit",
          "Delivered within 5 business days",
          "Includes custom strategy roadmap",
        ]

    const footerAbout =
      props.footer?.about ??
      "Performance marketing for ambitious brands. $47M+ in revenue generated for 250+ clients worldwide."
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["LinkedIn", "Twitter", "Instagram"]
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Services",
            links: [
              "Paid Advertising",
              "SEO & Content",
              "CRO & Analytics",
              "Email Marketing",
              "Creative Production",
            ],
          },
          {
            title: "Company",
            links: ["Case Studies", "Pricing", "Testimonials", "About Us", "Careers"],
          },
        ]
    const footerAddress =
      props.footer?.address ?? "580 Market St, Suite 400, San Francisco, CA 94104"
    const footerEmail = props.footer?.email ?? "hello@growthlab.com"
    const footerPhone = props.footer?.phone ?? "(415) 555-0147"
    const footerCopyright = props.footer?.copyright ?? "All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]

    const navCta = nav[nav.length - 1]

    // Calculate saved cases count
    const savedCasesCount = savedCaseNames?.size ?? 0
    const savedCases = caseItems.filter((c) => savedCaseNames?.has(c.name))

    // Brand logo mark — lightning / growth glyph (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
      </svg>
    )

    const CheckCircle = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    )

    const CheckMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
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

    const ChevronDown = ({ className }: { className?: string }) => (
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
        <path d="M19 9l-7 7-7-7" />
      </svg>
    )

    const BookmarkIcon = ({ active = false }: { active?: boolean }) => (
      <svg
        className={cn(
          'size-5',
          active ? 'text-primary-foreground' : 'text-foreground',
        )}
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
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
      // pie — paid advertising
      <svg
        key="pie"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
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
        className="size-7"
        aria-hidden="true"
      >
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>,
      // bar chart — CRO & analytics
      <svg
        key="chart"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
        className="size-7"
        aria-hidden="true"
      >
        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>,
      // film — creative production
      <svg
        key="film"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>,
      // cog — strategy
      <svg
        key="cog"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>,
    ]

    const iconTones = [
      "bg-chart-1/15 text-chart-1",
      "bg-chart-2/15 text-chart-2",
      "bg-chart-3/15 text-chart-3",
      "bg-chart-4/15 text-chart-4",
      "bg-chart-5/15 text-chart-5",
      "bg-primary/15 text-primary",
    ]

    const tagTones = [
      "bg-chart-1 text-primary-foreground",
      "bg-chart-2 text-primary-foreground",
      "bg-chart-3 text-primary-foreground",
      "bg-chart-4 text-primary-foreground",
      "bg-chart-5 text-primary-foreground",
      "bg-primary text-primary-foreground",
    ]

    const socialIcons: Record<string, ReactNode> = {
      LinkedIn: (
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      ),
      Twitter: (
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      ),
      Instagram: (
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      ),
    }

    const marqueeSet = (keyPrefix: string) => (
      <div className="flex min-w-max items-center gap-12 px-6">
        {logoItems.map((logo) => (
          <div
            key={`${keyPrefix}-${logo}`}
            className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-muted-foreground/15">
              <span className="size-3 rounded-full bg-current" />
            </span>
            <span className="text-xl font-bold">{logo}</span>
          </div>
        ))}
      </div>
    )

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        <style>{`@keyframes ma2-marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}.ma2-marquee{animation:ma2-marquee 30s linear infinite}.ma2-marquee:hover{animation-play-state:paused}`}</style>

        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <LogoMark className="size-5" />
                </span>
                <span className="text-xl font-bold text-foreground">{brand}</span>
              </button>
              <div className="hidden items-center gap-8 lg:flex">
                {nav.slice(0, -1).map((label) => (
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
              <div className="hidden items-center gap-4 lg:flex">
                <button
                  type="button"
                  onClick={() => go(footerPhone)}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {footerPhone}
                </button>
                <Sheet open={savedDrawerOpen} onOpenChange={setSavedDrawerOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="Saved case studies"
                      className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <svg
                        className="size-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                      {savedCasesCount > 0 ? (
                        <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                          {savedCasesCount}
                        </span>
                      ) : null}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full gap-0 p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle className="text-xl">Saved Case Studies</SheetTitle>
                      <SheetDescription>
                        {savedCasesCount > 0
                          ? `${savedCasesCount} case stud${savedCasesCount === 1 ? 'y' : 'ies'} saved.`
                          : 'No case studies saved yet.'}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {savedCases.length ? (
                        <div className="space-y-5">
                          {savedCases.map((c) => (
                            <div
                              key={c.name}
                              className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-5 last:border-0"
                            >
                              <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                                <Image
                                  alt={`${c.name} ${c.tag} marketing case study`}
                                  w={180}
                                  h={180}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                  {c.tag}
                                </p>
                                <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                  {c.name}
                                </h3>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-lg font-bold text-primary">
                                      {c.metricA}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {c.labelA}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-lg font-bold text-primary">
                                      {c.metricB}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {c.labelB}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                          <p className="text-base font-semibold text-foreground">
                            No saved case studies
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Click the bookmark icon on any case study to save it for later.
                          </p>
                        </div>
                      )}
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <Button
                        type="button"
                        className="w-full rounded-full"
                        onClick={() => {
                          setSavedDrawerOpen(false)
                          go('Case Studies')
                        }}
                      >
                        View All Case Studies
                      </Button>
                      <SheetClose asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          className="rounded-full"
                        >
                          Continue
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
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
                        <ChevronDown className="size-4" />
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
                          onClick={() => go('Saved')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Saved Case Studies
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
                <button
                  type="button"
                  onClick={() => go(navCta)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {navCta}
                  <ArrowRight className="size-4" />
                </button>
              </div>
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 text-muted-foreground hover:text-foreground lg:hidden"
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
            </div>
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
                <div className="mt-2 rounded-xl border border-border bg-muted/40 p-3">
                  {isSignedIn ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar size="lg">
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
                            {authEmail ?? 'Signed in'}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          setMobileOpen(false)
                          handleSignOut()
                        }}
                        className="w-full rounded-full"
                      >
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false)
                        handleSignIn()
                      }}
                      disabled={auth.isLoading}
                      className="w-full rounded-full"
                    >
                      <span className="mr-2 grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                        G
                      </span>
                      {authLabel}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden pb-20 pt-32 lg:pb-32 lg:pt-44">
            <div aria-hidden="true" className="absolute inset-0 -z-10">
              <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-primary/5 to-transparent" />
              <div className="absolute left-10 top-20 size-72 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute bottom-20 right-20 size-96 rounded-full bg-accent/40 blur-3xl" />
            </div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-sm font-semibold text-primary">
                      {heroBadge}
                    </span>
                  </div>
                  <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
                    {heroBefore}
                    <br />
                    <span className="relative text-primary">
                      {heroHighlight}
                      <svg
                        className="absolute -bottom-2 left-0 w-full text-primary"
                        viewBox="0 0 200 12"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M2 10C50 4 150 4 198 10"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>{" "}
                    {heroAfter}
                  </h1>
                  <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground lg:mx-0 lg:text-xl">
                    {heroSub}
                  </p>
                  <div className="mb-10 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl"
                    >
                      {heroPrimary}
                      <ArrowRight className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-border bg-background px-8 py-4 text-lg font-semibold text-foreground transition-all hover:bg-muted"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
                    {heroTrust.map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <CheckCircle className="size-5 text-primary" />
                        <span className="font-medium">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                    <Image
                      alt={heroImageAlt}
                      w={800}
                      h={600}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 rounded-xl border border-border bg-card p-4 shadow-xl sm:p-6">
                    <div className="flex items-center gap-4">
                      <div className="grid size-12 place-items-center rounded-lg bg-primary/10 text-primary">
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
                        <p className="text-2xl font-bold text-card-foreground sm:text-3xl">
                          {heroStatValue}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {heroStatLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-4 -top-4 rounded-xl bg-primary px-4 py-3 text-primary-foreground shadow-xl">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {heroExpertAvatars.map((alt) => (
                          <Image
                            key={alt}
                            alt={alt}
                            w={100}
                            h={100}
                            className="size-8 rounded-full border-2 border-primary object-cover"
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold">
                        {heroExpertsLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logo marquee */}
          <section className="border-y border-border bg-muted py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {logosHeading}
              </p>
              <div className="relative overflow-hidden">
                <div className="ma2-marquee flex">
                  {marqueeSet("a")}
                  {marqueeSet("b")}
                </div>
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statsItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="mb-2 text-4xl font-extrabold text-primary lg:text-5xl">
                      {s.value}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground lg:text-base">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {servicesEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {servicesHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{servicesDesc}</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {serviceItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-xl lg:p-8"
                  >
                    <div
                      className={cn(
                        "mb-6 grid size-14 place-items-center rounded-xl transition-transform group-hover:scale-110",
                        iconTones[i % iconTones.length],
                      )}
                    >
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-6 text-muted-foreground">
                      {item.description}
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {item.points.map((p) => (
                        <li key={p} className="flex items-center gap-2">
                          <CheckMark className="size-4 shrink-0 text-primary" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Process */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {processEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {processHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{processDesc}</p>
              </div>
              <div className="relative grid gap-8 lg:grid-cols-4">
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-16 hidden h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 lg:block"
                />
                {processSteps.map((step, i) => (
                  <div key={step.title} className="relative text-center">
                    <div className="relative z-10 mx-auto mb-6 grid size-12 place-items-center rounded-full bg-primary text-xl font-bold text-primary-foreground ring-4 ring-background">
                      {i + 1}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Case studies (dark) */}
          <section className="bg-foreground py-20 text-background lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <span className="mb-4 inline-block rounded-full bg-primary/20 px-4 py-1.5 text-sm font-semibold text-primary">
                  {casesEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {casesHeading}
                </h2>
                <p className="text-lg text-background/70">{casesDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {caseItems.map((c, i) => {
                  const isSaved = savedCaseNames?.has(c.name) ?? false

                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => go(c.name)}
                      className="group block w-full overflow-hidden rounded-2xl bg-background/5 text-left ring-1 ring-background/10"
                    >
                      <div className="relative overflow-hidden">
                        <Image
                          alt={`${c.name} ${c.tag} marketing case study`}
                          w={600}
                          h={400}
                          loading="lazy"
                          className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span
                          className={cn(
                            "absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold",
                            tagTones[i % tagTones.length],
                          )}
                        >
                          {c.tag}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            void toggleSavedCase(c.name)
                          }}
                          aria-pressed={isSaved}
                          aria-label={
                            isSaved
                              ? `Remove ${c.name} from saved`
                              : `Save ${c.name} for later`
                          }
                          className={cn(
                            'absolute bottom-3 right-3 grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105 group-hover:opacity-100',
                            isSaved
                              ? 'bg-primary text-primary-foreground opacity-100'
                              : 'bg-background/90 text-foreground opacity-0 hover:bg-background',
                          )}
                        >
                          <BookmarkIcon active={isSaved} />
                        </button>
                      </div>
                      <div className="p-6">
                        <h3 className="mb-2 text-xl font-bold">{c.name}</h3>
                        <p className="mb-4 text-sm text-background/60">
                          {c.summary}
                        </p>
                        <div className="mb-4 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-2xl font-bold text-primary">
                              {c.metricA}
                            </p>
                            <p className="text-xs text-background/50">{c.labelA}</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-primary">
                              {c.metricB}
                            </p>
                            <p className="text-xs text-background/50">{c.labelB}</p>
                          </div>
                        </div>
                        <p className="text-xs text-background/40">{c.when}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(casesCta)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                >
                  {casesCta}
                  <ArrowRight className="size-5" />
                </button>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {pricingEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
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
                        ? "bg-foreground text-background ring-2 ring-primary lg:-mt-4 lg:mb-4 lg:py-12"
                        : "border border-border bg-card text-card-foreground transition-colors hover:border-primary",
                    )}
                  >
                    {plan.badge && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                          {plan.badge}
                        </span>
                      </div>
                    )}
                    <div className="mb-6">
                      <h3 className="mb-2 text-xl font-bold">{plan.name}</h3>
                      <p
                        className={cn(
                          "text-sm",
                          plan.featured
                            ? "text-background/60"
                            : "text-muted-foreground",
                        )}
                      >
                        {plan.audience}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-extrabold">{plan.price}</span>
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
                    {plan.fee && (
                      <p
                        className={cn(
                          "mb-6 text-sm",
                          plan.featured
                            ? "text-background/60"
                            : "text-muted-foreground",
                        )}
                      >
                        {plan.fee}
                      </p>
                    )}
                    <ul className="mb-8 space-y-3">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className={cn(
                            "flex items-start gap-3 text-sm",
                            plan.featured
                              ? "text-background/80"
                              : "text-muted-foreground",
                          )}
                        >
                          <CheckMark
                            className={cn(
                              "size-5 shrink-0 text-primary",
                            )}
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "block w-full rounded-full px-6 py-3 text-center font-semibold transition-colors",
                        plan.featured
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border-2 border-foreground text-foreground hover:bg-foreground hover:text-background",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-center text-sm text-muted-foreground">
                {pricingNote}{" "}
                <button
                  type="button"
                  onClick={() => go(pricingNoteLink)}
                  className="text-primary hover:underline"
                >
                  {pricingNoteLink}
                </button>
              </p>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
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
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl bg-card p-6 shadow-sm lg:p-8"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="size-5 text-chart-4" />
                      ))}
                    </div>
                    <p className="mb-6 text-muted-foreground">
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
                        <p className="font-semibold text-card-foreground">
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

          {/* FAQ */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {faqEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group overflow-hidden rounded-xl bg-muted"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="pr-4 text-lg font-semibold text-foreground">
                        {item.q}
                      </span>
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-background transition-transform group-open:rotate-180">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-5 text-foreground"
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

          {/* Closing CTA band (accent) */}
          <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground lg:py-28">
            <div aria-hidden="true" className="absolute inset-0 opacity-10">
              <div className="absolute left-0 top-0 size-96 rounded-full bg-primary-foreground blur-3xl" />
              <div className="absolute bottom-0 right-0 size-96 rounded-full bg-primary-foreground blur-3xl" />
            </div>
            <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-xl text-primary-foreground/80">
                {ctaDesc}
              </p>
              <form
                className="mx-auto mb-8 max-w-lg"
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const email = formData.get('email') as string
                  if (email) {
                    void submitLead(email)
                    go(ctaButton)
                  }
                }}
              >
                <div className="flex flex-col gap-4 sm:flex-row">
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder={ctaPlaceholder}
                    aria-label={ctaPlaceholder}
                    className="flex-1 rounded-full border-0 bg-background px-6 py-4 text-foreground outline-none ring-ring focus:ring-2"
                  />
                  <button
                    type="submit"
                    className="whitespace-nowrap rounded-full bg-foreground px-8 py-4 font-semibold text-background transition-colors hover:bg-foreground/90"
                  >
                    {ctaButton}
                  </button>
                </div>
              </form>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/70">
                {ctaReassurances.map((r) => (
                  <div key={r} className="flex items-center gap-2">
                    <CheckCircle className="size-5" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer (dark) */}
        <footer className="bg-foreground py-16 text-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                    <LogoMark className="size-5" />
                  </span>
                  <span className="text-xl font-bold">{brand}</span>
                </button>
                <p className="mb-6 max-w-xs text-sm text-background/60">
                  {footerAbout}
                </p>
                <div className="flex items-center gap-4">
                  {footerSocials.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => go(s)}
                      aria-label={s}
                      className="grid size-10 place-items-center rounded-lg bg-background/10 text-background/60 transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-5"
                        aria-hidden="true"
                      >
                        {socialIcons[s] ?? socialIcons.LinkedIn}
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
                          className="text-background/60 transition-colors hover:text-background"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div>
                <h4 className="mb-4 font-semibold text-background">Contact</h4>
                <ul className="space-y-3 text-sm text-background/60">
                  <li className="flex items-start gap-3">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-5 shrink-0"
                      aria-hidden="true"
                    >
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{footerAddress}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-5 shrink-0"
                      aria-hidden="true"
                    >
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <button
                      type="button"
                      onClick={() => go(footerEmail)}
                      className="transition-colors hover:text-background"
                    >
                      {footerEmail}
                    </button>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-5 shrink-0"
                      aria-hidden="true"
                    >
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <button
                      type="button"
                      onClick={() => go(footerPhone)}
                      className="transition-colors hover:text-background"
                    >
                      {footerPhone}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 sm:flex-row">
              <p className="text-sm text-background/50">
                &copy; {new Date().getFullYear()} {brand} Marketing.{" "}
                {footerCopyright}
              </p>
              <div className="flex items-center gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-background/50 transition-colors hover:text-background"
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
