import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * SaasKimiPage2 — a complete, self-contained AI-product SaaS LANDING page,
 * VARIANT 2: a bolder, darker, screenshot-driven alternative to the lighter,
 * chat-mockup-led SaasKimiPage sibling.
 *
 * A faithful Tailwind v4 port of the Kimi-generated "Chronos AI" v02 design (an
 * intelligent calendar / scheduling assistant). It reproduces, in order: a
 * glassy sticky navbar with a Sign In link, a dramatic DARK hero over a violet
 * radial glow pairing big gradient-accented copy + trust checkmarks with a
 * framed product-screenshot dashboard card carrying two floating notification
 * chips, a grayscale "trusted by" logo strip, a 6-up colored-icon feature grid,
 * a numbered 01/02/03 "how it works" band on a dark surface, a 6-up product
 * GALLERY of captioned image tiles with gradient overlays, a 3-tier pricing
 * table (highlighted primary "Most Popular" plan), an indigo stats band, a 6-up
 * testimonial grid with star ratings + photo avatars, an FAQ accordion, a dark
 * glowing CTA banner with trust chips, and a 5-column dark footer with social
 * icons + a legal bar.
 *
 * Kimi's identity here is dark-surfaced with a violet/indigo primary accent; the
 * port maps the inline palette to Tailwind theme tokens (background/foreground/
 * card/muted/primary/accent/border + chart-* for the multi-color star/feature
 * sets) so it themes cleanly. Every nav item / CTA / link routes through
 * `useNavigate` (never a dead "#"); navbar labels match the `nav` array so
 * PageSwitch can swap pages. Callers supply ONLY content data; rich defaults
 * sourced from the original HTML make it render great with no props at all. Use
 * as the ROOT/home page for AI tools, SaaS apps, productivity/scheduling/
 * automation products, developer tools, or B2B startups wanting a darker,
 * conversion-focused page with a product screenshot, gallery, pricing, FAQ and
 * heavy social proof.
 */
export const SaasKimiPage2 = defineComponent({
  name: "SaasKimiPage2",
  description:
    "Complete AI-product / SaaS LANDING page, VARIANT 2 — a bolder, darker, screenshot-driven alternative to the lighter chat-mockup SaasKimiPage sibling. Features a glassy sticky navbar with Sign In, a dramatic DARK hero over a violet radial glow (big gradient-accented headline + trust checkmarks + a framed product-dashboard screenshot card with floating notification chips), a grayscale 'trusted by' logo strip, a 6-up colored-icon feature grid, a numbered 01/02/03 how-it-works band on a dark surface, a 6-up product GALLERY of captioned image tiles, a 3-tier pricing table with a highlighted primary 'Most Popular' plan, an indigo stats band, a 6-up testimonial grid with star ratings and photo avatars, an FAQ accordion, a dark glowing CTA banner with trust chips, and a rich 5-column dark footer with social icons. Use as the ROOT/home page for AI tools, SaaS apps, productivity/scheduling/automation products, developer tools, or modern B2B startups when a conversion-focused page with a product screenshot, gallery, pricing, FAQ and strong social proof is wanted. Supply content only — brand, nav, hero, logos, features, steps, gallery, pricing, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / product name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Dark hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        /** Phrase inside the heading rendered with the accent highlight. */
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        /** Small trust checkmark phrases under the CTAs. */
        trust: z.array(z.string()).optional(),
        /** Alt text for the framed product-dashboard screenshot. */
        screenshotAlt: z.string().optional(),
        /** Browser-bar URL shown above the screenshot. */
        screenshotUrl: z.string().optional(),
        /** Floating chip near the bottom of the screenshot. */
        floatTitle: z.string().optional(),
        floatSub: z.string().optional(),
        /** Floating "focus time" chip near the top of the screenshot. */
        focusTitle: z.string().optional(),
        focusSub: z.string().optional(),
      })
      .optional(),
    /** Grayscale "trusted by" logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        names: z.array(z.string()).optional(),
      })
      .optional(),
    /** Feature grid: tag + heading + description + up to 6 items. */
    features: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** "How it works" numbered steps (on dark band). */
    steps: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Product gallery: captioned image tiles. */
    gallery: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({ title: z.string(), caption: z.string(), alt: z.string() }),
          )
          .optional(),
      })
      .optional(),
    /** Pricing tiers. */
    pricing: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              description: z.string(),
              price: z.string(),
              period: z.string().optional(),
              cta: z.string(),
              features: z.array(z.string()),
              popular: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Indigo metrics band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Testimonial cards with star ratings + photo avatars. */
    testimonials: z
      .object({
        tag: z.string().optional(),
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
    /** Frequently asked questions accordion. */
    faq: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Closing dark CTA banner. */
    cta: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        trust: z.array(z.string()).optional(),
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
    const brand = props.brand ?? "Chronos AI"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "How It Works", "Pricing", "Customers", "FAQ"]

    const heroBadge = props.hero?.badge ?? "Now with AI Conflict Resolution"
    const heroHeading = props.hero?.heading ?? "Your calendar,"
    const heroHighlight = props.hero?.highlight ?? "intelligent."
    const heroSub =
      props.hero?.subheading ??
      "Chronos AI auto-schedules meetings, resolves double-bookings, and protects your deep-work blocks. Save 6+ hours every week."
    const heroPrimary = props.hero?.primaryCta ?? "Start 14-Day Free Trial"
    const heroSecondary = props.hero?.secondaryCta ?? "See How It Works"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["No credit card", "Cancel anytime", "14-day free"]
    const screenshotAlt =
      props.hero?.screenshotAlt ??
      "AI calendar dashboard showing scheduled meetings and focus time blocks in a modern interface"
    const screenshotUrl = props.hero?.screenshotUrl ?? "chronos.ai/dashboard"
    const floatTitle = props.hero?.floatTitle ?? "Meeting rescheduled"
    const floatSub = props.hero?.floatSub ?? "Product review moved to 2:00 PM"
    const focusTitle = props.hero?.focusTitle ?? "Focus time protected"
    const focusSub = props.hero?.focusSub ?? "Deep work: 9:00 AM — 12:00 PM"

    const logosLabel =
      props.logos?.label ?? "Trusted by 2,000+ teams at leading companies"
    const logoNames = props.logos?.names?.length
      ? props.logos.names
      : ["Stripe", "Notion", "Slack", "Spotify", "Airbnb", "Figma"]

    const featuresTag = props.features?.tag ?? "Powerful Features"
    const featuresHeading =
      props.features?.heading ?? "Everything you need to own your schedule"
    const featuresDesc =
      props.features?.description ??
      "From intelligent scheduling to team coordination, Chronos AI handles the busywork so you can focus on what matters."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Smart Auto-Scheduling",
            description:
              "Chronos finds the perfect meeting time across time zones, respecting everyone's working hours and focus blocks. No more back-and-forth emails.",
          },
          {
            title: "Conflict Resolution",
            description:
              "Double-booked? Chronos automatically proposes alternative times, reschedules non-critical meetings, and notifies all attendees instantly.",
          },
          {
            title: "Focus Time Guard",
            description:
              "Protect your deep-work blocks. Chronos defends scheduled focus time and only allows urgent meetings through with your explicit approval.",
          },
          {
            title: "Team Coordination",
            description:
              "See your entire team's availability at a glance. Find the one slot that works for 12 people across 4 time zones in under 3 seconds.",
          },
          {
            title: "AI Meeting Prep",
            description:
              "Chronos reads your calendar, emails, and docs to generate briefings, agendas, and pre-reads before every meeting. Walk in prepared.",
          },
          {
            title: "Time Analytics",
            description:
              "Understand where your time goes. Weekly reports show meeting load, focus time achieved, and actionable recommendations to reclaim your day.",
          },
        ]

    const stepsTag = props.steps?.tag ?? "How It Works"
    const stepsHeading =
      props.steps?.heading ?? "Set up in 3 minutes. Save hours every week."
    const stepsDesc =
      props.steps?.description ??
      "Getting started with Chronos AI is effortless. Connect, configure, and let the AI take over."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Connect Your Calendars",
            description:
              "Link Google Calendar, Outlook, and Apple Calendar in one click. Chronos syncs across all platforms in real-time with enterprise-grade security.",
          },
          {
            title: "Set Your Preferences",
            description:
              "Tell Chronos your working hours, meeting limits, focus time goals, and travel buffers. The AI learns and adapts to your unique scheduling style over time.",
          },
          {
            title: "Let AI Run Your Schedule",
            description:
              "Chronos auto-schedules, reschedules, and optimizes your calendar 24/7. You review and approve changes — or go fully autonomous. Your call.",
          },
        ]

    const galleryTag = props.gallery?.tag ?? "Product Gallery"
    const galleryHeading =
      props.gallery?.heading ?? "A beautiful interface for complex scheduling"
    const galleryDesc =
      props.gallery?.description ??
      "Every pixel designed to reduce friction and make managing your time feel effortless."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Weekly Overview",
            caption: "See your entire week at a glance with smart color coding.",
            alt: "Dashboard interface showing weekly calendar view with color-coded meeting blocks and focus time",
          },
          {
            title: "Time Analytics",
            caption: "Track where every hour goes with actionable insights.",
            alt: "Analytics dashboard showing time spent in meetings versus focus time with bar charts",
          },
          {
            title: "Team Scheduling",
            caption: "Find the perfect time for the whole team instantly.",
            alt: "Team scheduling interface showing multiple team members availability side by side",
          },
          {
            title: "Mobile App",
            caption: "Manage your schedule on the go with native apps.",
            alt: "Mobile calendar app showing day view with meeting notifications and quick actions",
          },
          {
            title: "AI Assistant",
            caption: "Chat with Chronos to reschedule, plan, and optimize.",
            alt: "AI assistant chat interface suggesting optimal meeting times based on calendar analysis",
          },
          {
            title: "Meeting Prep",
            caption: "Auto-generated agendas and briefings for every call.",
            alt: "Meeting preparation screen showing auto-generated agenda and attendee profiles",
          },
        ]

    const pricingTag = props.pricing?.tag ?? "Pricing"
    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start free, scale as you grow. No hidden fees, no surprise charges."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Starter",
            description: "For individuals getting started",
            price: "$0",
            period: "/month",
            cta: "Get Started Free",
            features: [
              "1 calendar connection",
              "Basic auto-scheduling",
              "Email notifications",
              "Mobile app access",
            ],
            popular: false,
          },
          {
            name: "Pro",
            description: "For busy professionals",
            price: "$12",
            period: "/month",
            cta: "Start 14-Day Trial",
            features: [
              "Unlimited calendars",
              "AI conflict resolution",
              "Focus time guard",
              "Weekly time analytics",
              "Priority support",
            ],
            popular: true,
          },
          {
            name: "Team",
            description: "For teams and organizations",
            price: "$29",
            period: "/user/month",
            cta: "Contact Sales",
            features: [
              "Everything in Pro",
              "Team coordination",
              "AI meeting prep",
              "SSO & admin controls",
              "Dedicated account manager",
            ],
            popular: false,
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "2,000+", label: "Teams onboarded" },
          { value: "4.8M", label: "Meetings scheduled" },
          { value: "6.2 hrs", label: "Saved per user weekly" },
          { value: "99.9%", label: "Uptime guaranteed" },
        ]

    const testimonialsTag = props.testimonials?.tag ?? "Customer Stories"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by teams worldwide"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See how Chronos AI is transforming the way people work across industries."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Chronos eliminated the scheduling chaos in our distributed team. We went from 45-minute 'find a time' sessions to instant auto-scheduling. Game changer.",
            name: "Sarah Chen",
            role: "VP of Engineering, Notion",
            avatarAlt:
              "Professional headshot of a smiling woman with dark hair in a navy blazer",
          },
          {
            quote:
              "The focus time guard is incredible. I finally have uninterrupted blocks for deep work. My productivity has doubled since we rolled Chronos out to the design team.",
            name: "Marcus Williams",
            role: "Design Director, Figma",
            avatarAlt:
              "Professional headshot of a man with short curly hair and glasses wearing a casual shirt",
          },
          {
            quote:
              "As a startup founder, every minute counts. Chronos handles my investor meetings, team standups, and travel — all without me lifting a finger. Absolutely essential.",
            name: "Elena Rodriguez",
            role: "CEO & Co-Founder, BuildKit",
            avatarAlt:
              "Professional headshot of a woman with blonde hair wearing a white blouse",
          },
          {
            quote:
              "We onboarded 340 employees in a week. The SSO integration was seamless, and the team scheduling feature alone saved our HR department 20 hours a month.",
            name: "David Park",
            role: "Head of IT, Vertex Health",
            avatarAlt:
              "Professional headshot of a man with a beard wearing a dark suit and tie",
          },
          {
            quote:
              "I was skeptical about AI scheduling, but Chronos proved me wrong within a day. It rescheduled 4 conflicting meetings perfectly and gave me back my Friday afternoon.",
            name: "Priya Sharma",
            role: "Product Manager, Linear",
            avatarAlt:
              "Professional headshot of a young woman with dark hair and earrings smiling warmly",
          },
          {
            quote:
              "The analytics dashboard showed me I was spending 28 hours a week in meetings. With Chronos, I cut that to 18 and doubled my output. The data doesn't lie.",
            name: "James O'Brien",
            role: "Engineering Lead, Stripe",
            avatarAlt:
              "Professional headshot of a man with short dark hair and a friendly smile in a light shirt",
          },
        ]

    const faqTag = props.faq?.tag ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Questions? Answers."
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about Chronos AI."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How does Chronos AI handle privacy and data security?",
            answer:
              "Your data is encrypted at rest and in transit using AES-256 and TLS 1.3. We are SOC 2 Type II certified and GDPR compliant. Chronos only accesses calendar metadata — never the contents of your emails or meeting transcripts unless you explicitly enable AI prep features.",
          },
          {
            question: "Can I keep control over final scheduling decisions?",
            answer:
              "Absolutely. Chronos operates in two modes: Suggest mode, where the AI proposes changes and you approve them with one click, and Autopilot mode, where Chronos acts autonomously within rules you define. You can switch modes anytime and set approval thresholds for different meeting types.",
          },
          {
            question: "Which calendar platforms does Chronos support?",
            answer:
              "Chronos integrates natively with Google Calendar, Microsoft Outlook/Exchange, Apple Calendar, and CalDAV. We also support scheduling links for external attendees who use any calendar service. All integrations sync bi-directionally in real-time.",
          },
          {
            question: "What happens during the 14-day free trial?",
            answer:
              "You get full access to all Pro features for 14 days — no credit card required. Connect your calendars, set up your preferences, and experience the full power of AI scheduling. At the end of the trial, choose a plan or continue free with Starter features.",
          },
          {
            question: "How does the AI conflict resolution work?",
            answer:
              "When Chronos detects a double-booking or scheduling conflict, it analyzes meeting importance, attendee seniority, and your preferences to find the best resolution. It can propose new times, suggest alternative attendees, or defer non-critical meetings — all while keeping everyone notified.",
          },
          {
            question: "Is there a discount for nonprofits and education?",
            answer:
              "Yes. Qualified nonprofits, educational institutions, and open-source projects receive 50% off Pro and Team plans. Contact our support team with your organization details to apply. We also offer free Starter plans to individual students with a valid .edu email.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to reclaim your time?"
    const ctaSub =
      props.cta?.subheading ??
      "Join 2,000+ teams who have eliminated scheduling headaches. Start your free trial today — no credit card required."
    const ctaPrimary = props.cta?.primaryCta ?? "Start Your 14-Day Free Trial"
    const ctaSecondary = props.cta?.secondaryCta ?? "Schedule a Demo"
    const ctaTrust = props.cta?.trust?.length
      ? props.cta.trust
      : ["Free 14-day trial", "No credit card", "Cancel anytime"]

    const footerTagline =
      props.footer?.tagline ??
      "Intelligent scheduling for modern teams. Save time, reduce stress, and focus on what matters."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Integrations", "Changelog", "Roadmap"],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Press Kit", "Contact"],
          },
          {
            title: "Resources",
            links: [
              "Documentation",
              "Help Center",
              "Community",
              "API Reference",
              "Status",
            ],
          },
          {
            title: "Legal",
            links: [
              "Privacy Policy",
              "Terms of Service",
              "Cookie Policy",
              "Security",
              "GDPR",
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ?? `${brand}, Inc. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy", "Terms", "Cookies"]

    const [openFaq, setOpenFaq] = useState<number | null>(0)

    // Shared logo mark — primary tile + clock glyph (decorative brand asset).
    const LogoMark = () => (
      <span
        className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"
        aria-hidden="true"
      >
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </span>
    )

    const CheckIcon = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-5", className)}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
    )

    const ArrowIcon = () => (
      <svg
        className="ml-2 size-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 7l5 5m0 0l-5 5m5-5H6"
        />
      </svg>
    )

    const Star = () => (
      <svg
        className="size-5"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    // Feature icon tints rotate through chart data-viz tokens + primary for a multi-color decorative set.
    const featureIconTints = [
      "bg-chart-1/10 text-chart-1",
      "bg-chart-2/10 text-chart-2",
      "bg-chart-3/10 text-chart-3",
      "bg-chart-4/10 text-chart-4",
      "bg-chart-5/10 text-chart-5",
      "bg-primary/10 text-primary",
    ]

    const featureIcons: ReactNode[] = [
      <svg key="cal" className="size-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>,
      <svg key="warn" className="size-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg key="shield" className="size-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>,
      <svg key="users" className="size-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>,
      <svg key="bolt" className="size-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      <svg key="chart" className="size-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
    ]

    const stepIcons: ReactNode[] = [
      <svg key="link" className="size-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>,
      <svg key="gear" className="size-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>,
      <svg key="play" className="size-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
    ]

    const socials = [
      {
        label: "Twitter",
        path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
      },
      {
        label: "LinkedIn",
        path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
      },
      {
        label: "GitHub",
        path: "M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z",
      },
    ]

    return (
      <div
        className={cn(
          "flex min-h-svh flex-col bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <nav
          className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70"
          aria-label="Main navigation"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
                aria-label={`${brand} home`}
              >
                <LogoMark />
                <span className="text-xl font-bold text-foreground">{brand}</span>
              </button>
              <ul className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <li key={label}>
                    <button
                      type="button"
                      onClick={() => go(label)}
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => go("Sign In")}
                  className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex flex-1 flex-col">
          {/* Hero */}
          <section className="relative overflow-hidden bg-foreground" aria-label="Hero">
            <div aria-hidden="true" className="absolute inset-0">
              <div className="absolute left-1/2 top-0 h-[600px] w-[1200px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
              <div className="absolute bottom-0 right-0 h-[400px] w-[800px] rounded-full bg-primary/10 blur-[100px]" />
            </div>
            <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-40 lg:pt-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="text-center lg:text-left">
                  <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-sm font-medium text-primary">
                      {heroBadge}
                    </span>
                  </div>
                  <h1 className="mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-background sm:text-5xl lg:text-6xl xl:text-7xl">
                    {heroHeading}
                    <br />
                    <span className="text-primary">{heroHighlight}</span>
                  </h1>
                  <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-background/60 sm:text-xl lg:mx-0">
                    {heroSub}
                  </p>
                  <div className="mb-10 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <ArrowIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-xl border border-background/10 bg-background/5 px-8 py-4 text-base font-semibold text-background transition-colors hover:bg-background/10"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-background/50 lg:justify-start">
                    {heroTrust.map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <CheckIcon className="text-chart-2" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Product screenshot mockup */}
                <div className="relative" aria-hidden="true">
                  <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card shadow-2xl">
                    <div className="flex items-center gap-2 border-b border-border/40 bg-muted/40 px-4 py-3">
                      <span className="size-3 rounded-full bg-chart-5" />
                      <span className="size-3 rounded-full bg-chart-4" />
                      <span className="size-3 rounded-full bg-chart-2" />
                      <span className="ml-2 text-xs text-muted-foreground">
                        {screenshotUrl}
                      </span>
                    </div>
                    <Image
                      alt={screenshotAlt}
                      w={800}
                      h={500}
                      className="h-auto w-full"
                    />
                    <div className="absolute bottom-4 right-4 rounded-xl border border-border/40 bg-card/90 p-4 shadow-lg backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
                          <CheckIcon />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-card-foreground">
                            {floatTitle}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {floatSub}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute left-4 top-16 rounded-xl border border-border/40 bg-card/90 p-3 shadow-lg backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-chart-2" />
                        <span className="text-xs font-medium text-card-foreground">
                          {focusTitle}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {focusSub}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logo cloud */}
          <section
            className="border-y border-border/60 bg-muted/40 py-16"
            aria-label="Trusted by companies"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-10 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 sm:grid-cols-3 md:grid-cols-6">
                {logoNames.map((name) => (
                  <div
                    key={name}
                    className="flex items-center justify-center text-lg font-bold text-foreground/80"
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-24 lg:py-32" aria-label="Features">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-20 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {featuresTag}
                </span>
                <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {featuresDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-border/60 bg-card p-8 shadow-sm transition-all hover:border-primary/30 hover:shadow-xl"
                  >
                    <div
                      className={cn(
                        "mb-6 grid size-14 place-items-center rounded-xl",
                        featureIconTints[i % featureIconTints.length],
                      )}
                    >
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* How it works (dark band) */}
          <section
            className="bg-foreground py-24 lg:py-32"
            aria-label="How it works"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-20 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {stepsTag}
                </span>
                <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-background sm:text-4xl lg:text-5xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg leading-relaxed text-background/60">
                  {stepsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-4 text-7xl font-black text-primary/20">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="mb-6 grid size-14 place-items-center rounded-xl bg-primary text-primary-foreground">
                      {stepIcons[i % stepIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-background">
                      {step.title}
                    </h3>
                    <p className="leading-relaxed text-background/60">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="py-24 lg:py-32" aria-label="Product gallery">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {galleryTag}
                </span>
                <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {galleryDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((tile) => (
                  <div
                    key={tile.title}
                    className="group relative overflow-hidden rounded-2xl border border-border/60 shadow-sm transition-all hover:shadow-xl"
                  >
                    <Image
                      alt={tile.alt}
                      w={600}
                      h={400}
                      loading="lazy"
                      className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent"
                    />
                    <div className="absolute inset-x-4 bottom-4">
                      <h3 className="text-lg font-bold text-background">
                        {tile.title}
                      </h3>
                      <p className="text-sm text-background/70">{tile.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section
            className="bg-muted/40 py-24 lg:py-32"
            aria-label="Pricing"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-20 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {pricingTag}
                </span>
                <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {pricingDesc}
                </p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <article
                    key={plan.name}
                    className={cn(
                      "relative rounded-2xl p-8",
                      plan.popular
                        ? "border border-primary bg-primary text-primary-foreground shadow-xl"
                        : "border border-border bg-card text-card-foreground shadow-sm",
                    )}
                  >
                    {plan.popular ? (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-accent px-4 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">
                          Most Popular
                        </span>
                      </div>
                    ) : null}
                    <div className="mb-6">
                      <h3
                        className={cn(
                          "mb-2 text-lg font-bold",
                          plan.popular
                            ? "text-primary-foreground"
                            : "text-card-foreground",
                        )}
                      >
                        {plan.name}
                      </h3>
                      <p
                        className={cn(
                          "text-sm",
                          plan.popular
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground",
                        )}
                      >
                        {plan.description}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span
                        className={cn(
                          "text-4xl font-extrabold",
                          plan.popular
                            ? "text-primary-foreground"
                            : "text-card-foreground",
                        )}
                      >
                        {plan.price}
                      </span>
                      {plan.period ? (
                        <span
                          className={cn(
                            plan.popular
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground",
                          )}
                        >
                          {plan.period}
                        </span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "mb-8 block w-full rounded-xl px-6 py-3 text-center font-semibold transition-colors",
                        plan.popular
                          ? "bg-background text-primary hover:bg-accent hover:text-accent-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                      )}
                    >
                      {plan.cta}
                    </button>
                    <ul className="space-y-4">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-3">
                          <CheckIcon
                            className={cn(
                              "mt-0.5 shrink-0",
                              plan.popular
                                ? "text-primary-foreground/80"
                                : "text-chart-2",
                            )}
                          />
                          <span
                            className={cn(
                              "text-sm",
                              plan.popular
                                ? "text-primary-foreground/90"
                                : "text-muted-foreground",
                            )}
                          >
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-primary py-20 text-primary-foreground" aria-label="Statistics">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4 lg:gap-12">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <div className="mb-2 text-4xl font-extrabold sm:text-5xl">
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
          <section className="py-24 lg:py-32" aria-label="Testimonials">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-20 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {testimonialsTag}
                </span>
                <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <figure
                    key={t.name}
                    className="rounded-2xl border border-border/60 bg-card p-8 shadow-sm"
                  >
                    <div
                      className="mb-6 flex items-center gap-1 text-chart-4"
                      aria-label="5 stars"
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
                      ))}
                    </div>
                    <blockquote className="mb-6 leading-relaxed text-card-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <figcaption className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={48}
                        h={48}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-bold text-card-foreground">
                          {t.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t.role}
                        </div>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section
            className="bg-muted/40 py-24 lg:py-32"
            aria-label="Frequently asked questions"
          >
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {faqTag}
                </span>
                <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {faqDesc}
                </p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item, i) => {
                  const open = openFaq === i
                  return (
                    <div
                      key={item.question}
                      className="rounded-xl border border-border bg-card shadow-sm transition-all"
                    >
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setOpenFaq(open ? null : i)}
                        className="flex w-full cursor-pointer items-center justify-between gap-4 p-6 text-left"
                      >
                        <h3 className="text-lg font-semibold text-card-foreground">
                          {item.question}
                        </h3>
                        <svg
                          className={cn(
                            "size-5 shrink-0 text-muted-foreground transition-transform",
                            open && "rotate-180",
                          )}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      <div
                        className={cn(
                          "grid overflow-hidden transition-all duration-300",
                          open
                            ? "grid-rows-[1fr] px-6 pb-6 opacity-100"
                            : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <p className="min-h-0 leading-relaxed text-muted-foreground">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* CTA banner (dark) */}
          <section
            className="relative overflow-hidden bg-foreground py-24 lg:py-32"
            aria-label="Call to action"
          >
            <div aria-hidden="true" className="absolute inset-0">
              <div className="absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
            </div>
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-background sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-background/60 sm:text-xl">
                {ctaSub}
              </p>
              <div className="mb-10 flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
                >
                  {ctaPrimary}
                  <ArrowIcon />
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center rounded-xl border border-background/10 bg-background/5 px-8 py-4 text-base font-semibold text-background transition-colors hover:bg-background/10"
                >
                  {ctaSecondary}
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-background/50">
                {ctaTrust.map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <CheckIcon className="text-chart-2" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground pb-8 pt-16 text-background" role="contentinfo">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
              <div className="col-span-2 md:col-span-4 lg:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                  aria-label={`${brand} home`}
                >
                  <LogoMark />
                  <span className="text-xl font-bold text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 text-sm leading-relaxed text-background/60">
                  {footerTagline}
                </p>
                <div className="flex items-center gap-4">
                  {socials.map((social) => (
                    <button
                      key={social.label}
                      type="button"
                      onClick={() => go(social.label)}
                      aria-label={social.label}
                      className="text-background/60 transition-colors hover:text-background"
                    >
                      <svg
                        className="size-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d={social.path} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-sm text-background/60 transition-colors hover:text-background"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 sm:flex-row">
              <p className="text-sm text-background/50">{footerCopyright}</p>
              <div className="flex items-center gap-6">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-sm text-background/50 transition-colors hover:text-background/80"
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
