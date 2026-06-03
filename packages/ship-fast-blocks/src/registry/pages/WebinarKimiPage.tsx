import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * WebinarKimiPage — a complete, self-contained virtual-event / webinar
 * REGISTRATION landing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Product Analytics Live"
 * design: a clean, editorial, neutral aesthetic (mapped from neutral-50/900 to
 * semantic tokens) with a sticky navbar, a split hero (live-event pill, big
 * tracking-tight headline, date/time row, inline email capture form, and a
 * floating "registered" social-proof card over a hero image), a trusted-by
 * logo strip, a 4-up "what you'll learn" topics grid with icon tiles, a
 * timeline-style event agenda with Keynote/Workshop/Break tags, a 4-up
 * featured-speakers gallery with headshots, a dark stats band, a 3-up
 * testimonial wall with star ratings, a 3-tier registration pricing block
 * (with a highlighted "Most Popular" plan), an accordion FAQ, a dark
 * closing CTA with a second email form, and a 4-column footer with social
 * links.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. Every nav
 * item / CTA / pricing button / footer + social link routes through
 * `useNavigate` (never a dead "#"), and the form submits route too. All
 * imagery (hero, speaker headshots, avatars) uses the alt-driven <Image>
 * component (never a raw src). Callers supply ONLY content data; rich
 * defaults make it render the full page with no props at all.
 */
export const WebinarKimiPage = defineComponent({
  name: "WebinarKimiPage",
  description:
    "Complete virtual-event / WEBINAR REGISTRATION landing page with a clean, editorial, conversion-focused aesthetic. Includes a sticky navbar with a 'Register Free' CTA, a split hero (live-event status pill, big tracking-tight headline, event date + time row, inline work-email capture form, hero image with a floating 'registered attendees' social-proof card), a trusted-by company logo strip, a 4-up 'what you'll learn' topics grid with icon tiles, a timeline-style event agenda with Keynote/Workshop/Break colored tags and speaker bylines, a 4-up featured-speakers gallery with circular/square headshots and bios, a dark stats band (attendees, speakers, hours, companies), a 3-column testimonial wall with 5-star ratings and reviewer headshots, a 3-tier registration pricing table with a highlighted 'Most Popular' plan and check/cross feature lists, an accordion FAQ, a dark closing CTA with a second email-capture form, and a 4-column footer with event/resource/contact links and social icons. Use as the ROOT/home page for webinars, virtual summits, online conferences, masterclasses, workshops, live streams, training events, or any registration/RSVP/sign-up landing page where date, speakers, agenda, ticket tiers and social proof drive sign-ups. Supply content only — brand, nav, hero, logos, topics, agenda, speakers, stats, testimonials, pricing, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / event name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingBefore: z.string().optional(),
        /** Phrase rendered in the muted accent color (e.g. the year). */
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        date: z.string().optional(),
        time: z.string().optional(),
        emailPlaceholder: z.string().optional(),
        cta: z.string().optional(),
        fineprint: z.string().optional(),
        imageAlt: z.string().optional(),
        attendeeCount: z.string().optional(),
        attendeeLabel: z.string().optional(),
        /** Alt text for the small stacked attendee avatars. */
        attendeeAvatars: z.array(z.string()).optional(),
      })
      .optional(),
    /** Trusted-by logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        names: z.array(z.string()).optional(),
      })
      .optional(),
    /** "What you'll learn" topics grid. */
    topics: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Timeline-style event agenda. */
    agenda: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        /** Legend labels for the kind dots, in order [keynote, workshop, break]. */
        legend: z.array(z.string()).optional(),
        items: z
          .array(
            z.object({
              time: z.string(),
              kind: z.enum(["keynote", "workshop", "break"]),
              title: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Featured speakers gallery. */
    speakers: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              bio: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Dark stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Testimonial wall. */
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
    /** Registration pricing tiers. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        footnote: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              audience: z.string(),
              price: z.string(),
              unit: z.string().optional(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
              cta: z.string(),
              features: z
                .array(z.object({ label: z.string(), included: z.boolean() }))
                .optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Accordion FAQ. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Closing CTA + email form. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        emailPlaceholder: z.string().optional(),
        button: z.string().optional(),
        fineprint: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        note: z.string().optional(),
        copyright: z.string().optional(),
        columns: z
          .array(
            z.object({ title: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Product Analytics Live"
    const nav = props.nav?.length
      ? props.nav
      : ["Agenda", "Speakers", "Topics", "FAQ"]

    const heroBadge = props.hero?.badge ?? "Live Virtual Event"
    const heroBefore =
      props.hero?.headingBefore ?? "Mastering Product Analytics in"
    const heroHighlight = props.hero?.highlight ?? "2026"
    const heroSub =
      props.hero?.subheading ??
      "Join 2,500+ product leaders and data professionals for a deep dive into modern analytics frameworks, real-world case studies from Netflix and Spotify, and actionable strategies to drive product growth."
    const heroDate = props.hero?.date ?? "Tuesday, June 16, 2026"
    const heroTime = props.hero?.time ?? "11:00 AM — 3:00 PM EST"
    const heroEmailPlaceholder =
      props.hero?.emailPlaceholder ?? "Enter your work email"
    const heroCta = props.hero?.cta ?? "Register Free"
    const heroFineprint =
      props.hero?.fineprint ??
      "Registration closes June 14 • Recording sent to all registrants"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Modern office workspace with large data analytics dashboard displayed on multiple monitors showing charts and graphs"
    const attendeeCount = props.hero?.attendeeCount ?? "2,487 registered"
    const attendeeLabel = props.hero?.attendeeLabel ?? "Join the community"
    const attendeeAvatars = props.hero?.attendeeAvatars?.length
      ? props.hero.attendeeAvatars
      : [
          "Professional headshot of a female product manager with short brown hair",
          "Professional headshot of a male data analyst with glasses",
          "Professional headshot of a female engineer with blonde hair",
        ]

    const logosHeading =
      props.logos?.heading ?? "Trusted by product teams at leading companies"
    const logoNames = props.logos?.names?.length
      ? props.logos.names
      : ["Netflix", "Spotify", "Notion", "Figma", "Linear", "Stripe"]

    const topicsHeading = props.topics?.heading ?? "What you'll learn"
    const topicsDesc =
      props.topics?.description ??
      "Four focused sessions covering the complete product analytics lifecycle — from data collection to actionable insights."
    const topicItems = props.topics?.items?.length
      ? props.topics.items
      : [
          {
            title: "Funnel Optimization",
            description:
              "Identify drop-off points and optimize user flows using event tracking and cohort analysis techniques used by top SaaS companies.",
          },
          {
            title: "User Segmentation",
            description:
              "Build granular user segments based on behavior, engagement patterns, and lifecycle stages to personalize experiences at scale.",
          },
          {
            title: "Predictive Metrics",
            description:
              "Move beyond vanity metrics. Learn how to implement leading indicators that predict churn and forecast revenue accurately.",
          },
          {
            title: "Data Architecture",
            description:
              "Set up scalable analytics infrastructure with event taxonomy best practices, data governance, and warehouse integration strategies.",
          },
        ]

    const agendaHeading = props.agenda?.heading ?? "Event Agenda"
    const agendaDesc =
      props.agenda?.description ??
      "Four hours of focused content with breaks for networking and Q&A sessions."
    const agendaLegend = props.agenda?.legend?.length
      ? props.agenda.legend
      : ["Keynote", "Workshop", "Break"]
    const agendaItems = props.agenda?.items?.length
      ? props.agenda.items
      : [
          {
            time: "11:00 AM",
            kind: "keynote" as const,
            title: "The State of Product Analytics 2026",
            description:
              "Sarah Chen, VP of Product at Amplitude — An overview of emerging trends, AI-powered insights, and what's next for data-driven product teams.",
          },
          {
            time: "11:45 AM",
            kind: "workshop" as const,
            title: "Building Your First Funnel Analysis",
            description:
              "Marcus Johnson, Lead Analyst at Netflix — Live workshop: From raw event data to actionable funnel insights in 30 minutes.",
          },
          {
            time: "12:30 PM",
            kind: "break" as const,
            title: "Networking & Virtual Meetups",
            description:
              "Connect with fellow attendees in topic-specific breakout rooms.",
          },
          {
            time: "1:00 PM",
            kind: "keynote" as const,
            title: "Predictive Analytics for Retention",
            description:
              "Elena Rodriguez, Head of Data Science at Spotify — Using machine learning models to identify at-risk users before they churn.",
          },
          {
            time: "1:45 PM",
            kind: "workshop" as const,
            title: "Implementing Event Taxonomy at Scale",
            description:
              "David Park, Director of Engineering at Segment — Best practices for consistent, maintainable event naming and tracking plans.",
          },
          {
            time: "2:30 PM",
            kind: "keynote" as const,
            title: "Panel: The Future of Product Data",
            description:
              "All speakers plus special guest Lisa Thompson, CPO at Notion — Open discussion on AI, privacy, and the next decade of analytics.",
          },
        ]

    const speakersHeading = props.speakers?.heading ?? "Featured Speakers"
    const speakersDesc =
      props.speakers?.description ??
      "Industry leaders sharing real-world experiences from building analytics at scale."
    const speakerItems = props.speakers?.items?.length
      ? props.speakers.items
      : [
          {
            name: "Sarah Chen",
            role: "VP of Product, Amplitude",
            bio: "Formerly led analytics at Meta for 8 years. Author of “Data-Driven Product Decisions.”",
            imageAlt:
              "Professional headshot of Sarah Chen, an Asian female executive in her 40s wearing a navy blazer",
          },
          {
            name: "Marcus Johnson",
            role: "Lead Analyst, Netflix",
            bio: "Specializes in engagement metrics and predictive viewing models for 260M+ subscribers.",
            imageAlt:
              "Professional headshot of Marcus Johnson, an African American man in his 30s with a warm smile and glasses",
          },
          {
            name: "Elena Rodriguez",
            role: "Head of Data Science, Spotify",
            bio: "PhD in Machine Learning from MIT. Built Spotify's retention prediction engine.",
            imageAlt:
              "Professional headshot of Elena Rodriguez, a Latina woman with curly dark hair and confident expression",
          },
          {
            name: "David Park",
            role: "Director of Engineering, Segment",
            bio: "Expert in data infrastructure. Previously scaled analytics at Shopify through IPO.",
            imageAlt:
              "Professional headshot of David Park, an Asian male executive in a light grey suit with a professional demeanor",
          },
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "2,500+", label: "Registered Attendees" },
          { value: "4", label: "Expert Speakers" },
          { value: "4", label: "Hours of Content" },
          { value: "150+", label: "Companies Represented" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "What past attendees say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Join thousands of product professionals who've transformed their analytics approach."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "The Netflix case study on funnel optimization alone was worth the 4 hours. Implemented their framework the next week and saw a 23% improvement in activation rates.",
            name: "James Wilson",
            role: "Product Lead, Intercom",
            avatarAlt:
              "Professional headshot of James Wilson, a male product manager in his 30s with short brown hair",
          },
          {
            quote:
              "Finally, a webinar that goes beyond theory. The workshop on event taxonomy saved us months of technical debt. Our data team uses the framework as our bible now.",
            name: "Priya Sharma",
            role: "Head of Data, Notion",
            avatarAlt:
              "Professional headshot of Priya Sharma, a South Asian woman with long dark hair and professional attire",
          },
          {
            quote:
              "The networking breakout rooms connected me with a data scientist who became a mentor. The content was excellent, but the community aspect made it invaluable.",
            name: "Michael Torres",
            role: "Director of Product, HubSpot",
            avatarAlt:
              "Professional headshot of Michael Torres, a Hispanic man with a beard in his 40s",
          },
        ]

    const pricingHeading = props.pricing?.heading ?? "Registration Options"
    const pricingDesc =
      props.pricing?.description ??
      "Choose the experience that fits your learning goals. All tiers include lifetime access to recordings."
    const pricingFootnote =
      props.pricing?.footnote ??
      "Need more than 20 seats? Contact us for enterprise pricing with custom onboarding."
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Free Access",
            audience: "For individual learners",
            price: "$0",
            cta: "Register Free",
            features: [
              { label: "Live stream access", included: true },
              { label: "Recording access (30 days)", included: true },
              { label: "Q&A participation", included: true },
              { label: "Workshop materials", included: false },
              { label: "Certificate", included: false },
            ],
          },
          {
            name: "Professional",
            audience: "For serious practitioners",
            price: "$79",
            unit: "/person",
            featured: true,
            badge: "Most Popular",
            cta: "Get Professional",
            features: [
              { label: "Everything in Free", included: true },
              { label: "Lifetime recording access", included: true },
              { label: "Downloadable workshop kits", included: true },
              { label: "Slack community access", included: true },
              { label: "CPE/PDU certificate", included: true },
            ],
          },
          {
            name: "Team",
            audience: "For entire product teams",
            price: "$299",
            unit: "/5 seats",
            cta: "Contact Sales",
            features: [
              { label: "5 Professional seats", included: true },
              { label: "Team breakout rooms", included: true },
              { label: "Private Q&A session", included: true },
              { label: "Custom analytics audit", included: true },
              { label: "Bulk certificates", included: true },
            ],
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqDesc =
      props.faq?.description ?? "Everything you need to know about the event."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "Will recordings be available if I can't attend live?",
            a: "Absolutely. All registrants receive access to the full recording within 24 hours of the event. Free tier gets 30-day access; Professional and Team tiers get lifetime access to rewatch anytime.",
          },
          {
            q: "What technical setup do I need?",
            a: "Just a stable internet connection and modern web browser. We use Zoom Webinar — no software download required. For the best experience, we recommend joining on a desktop or laptop. Mobile is fully supported.",
          },
          {
            q: "Can my entire team watch with one registration?",
            a: "Individual registrations are for single viewers. For team viewing, choose our Team tier (5 seats for $299) or contact us for larger group licenses with volume discounts starting at 10 seats.",
          },
          {
            q: "Will I receive a certificate of attendance?",
            a: "Professional and Team tier attendees receive a verifiable digital certificate for 4 Continuing Professional Education (CPE) credits, recognized by major product management and data science certification bodies.",
          },
          {
            q: "Is there a refund policy?",
            a: "Yes. Full refunds are available until June 9, 2026. Between June 10-15, you may transfer your registration to a colleague at no cost. No refunds for no-shows, but you'll still receive the recording.",
          },
          {
            q: "Will the workshop require coding knowledge?",
            a: "The workshops are designed for all skill levels. Some sessions include optional SQL and Python examples, but the core concepts are accessible to non-technical product managers. All code samples are provided for reference.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? "Ready to level up your product analytics?"
    const ctaDesc =
      props.cta?.description ??
      "Join 2,500+ product leaders on June 16. Registration closes in 16 days. Don't miss the insights that will transform your 2026 strategy."
    const ctaEmailPlaceholder =
      props.cta?.emailPlaceholder ?? "Enter your work email"
    const ctaButton = props.cta?.button ?? "Register Free"
    const ctaFineprint =
      props.cta?.fineprint ??
      "Or upgrade to Professional for $79 — Lifetime access + CPE certificate"

    const footerNote =
      props.footer?.note ??
      "The premier virtual event for product analytics professionals. Hosted quarterly since 2022."
    const footerCopyright =
      props.footer?.copyright ?? "All rights reserved."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Event",
            links: ["Agenda", "Speakers", "Topics", "FAQ"],
          },
          {
            title: "Resources",
            links: [
              "Past Recordings",
              "Speaker Decks",
              "Analytics Templates",
              "Community Slack",
            ],
          },
          {
            title: "Contact",
            links: [
              "events@productanalytics.live",
              "Sponsorship",
              "Press Kit",
              "Code of Conduct",
            ],
          },
        ]

    // Brand logo tile — token surface with the brand initials (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        {brand
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w.charAt(0))
          .join("")
          .toUpperCase()}
      </span>
    )

    const CheckIcon = ({ className }: { className?: string }) => (
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

    const CrossIcon = ({ className }: { className?: string }) => (
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

    const StarIcon = () => (
      <svg
        className="size-5 text-primary"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    // Per-section icons for the topics grid.
    const topicIcons = [
      // bar chart
      <svg
        key="chart"
        className="size-6 text-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      // users
      <svg
        key="users"
        className="size-6 text-foreground"
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
      // bolt
      <svg
        key="bolt"
        className="size-6 text-foreground"
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
      // database
      <svg
        key="database"
        className="size-6 text-foreground"
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

    // Agenda tag styling per kind, mapped from neutral-900/400/200 to tokens.
    const kindTag: Record<string, string> = {
      keynote: "bg-primary text-primary-foreground",
      workshop: "bg-secondary text-secondary-foreground",
      break: "bg-muted text-muted-foreground",
    }
    const kindDot: Record<string, string> = {
      keynote: "bg-primary",
      workshop: "bg-secondary",
      break: "bg-muted-foreground/40",
    }

    const inputCls =
      "flex-1 rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <LogoMark className="size-8" />
                <span className="text-lg font-semibold tracking-tight">
                  {brand}
                </span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => go(heroCta)}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {heroCta}
              </button>
            </div>
          </div>
        </nav>

        <main>
          {/* Hero */}
          <section className="relative bg-muted">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-sm text-muted-foreground">
                      {heroBadge}
                    </span>
                  </div>
                  <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                    {heroBefore}{" "}
                    <span className="text-muted-foreground">
                      {heroHighlight}
                    </span>
                  </h1>
                  <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <svg
                        className="size-5 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-foreground/80">{heroDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="size-5 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-foreground/80">{heroTime}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                    <form
                      className="max-w-md flex-1"
                      onSubmit={(e) => {
                        e.preventDefault()
                        go(heroCta)
                      }}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                          type="email"
                          required
                          placeholder={heroEmailPlaceholder}
                          aria-label={heroEmailPlaceholder}
                          className={inputCls}
                        />
                        <button
                          type="submit"
                          className="whitespace-nowrap rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          {heroCta}
                        </button>
                      </div>
                    </form>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {heroFineprint}
                  </p>
                </div>
                <div className="relative">
                  <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                    <Image
                      alt={heroImageAlt}
                      w={1200}
                      h={900}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 rounded-xl border border-border bg-card p-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {attendeeAvatars.map((alt) => (
                          <Image
                            key={alt}
                            alt={alt}
                            w={80}
                            h={80}
                            className="size-10 rounded-full border-2 border-card object-cover"
                          />
                        ))}
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-card-foreground">
                          {attendeeCount}
                        </p>
                        <p className="text-muted-foreground">{attendeeLabel}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-b border-border py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm text-muted-foreground">
                {logosHeading}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground md:gap-16">
                {logoNames.map((name) => (
                  <span
                    key={name}
                    className="text-sm font-semibold tracking-tight"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Topics */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {topicsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{topicsDesc}</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {topicItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-border bg-muted p-6 transition-colors hover:border-foreground/30"
                  >
                    <div className="mb-4 grid size-12 place-items-center rounded-lg border border-border bg-background">
                      {topicIcons[i % topicIcons.length]}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Agenda */}
          <section className="bg-muted py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">
                <div className="lg:col-span-1">
                  <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                    {agendaHeading}
                  </h2>
                  <p className="mb-6 text-muted-foreground">{agendaDesc}</p>
                  <div className="flex items-center gap-4 text-sm">
                    {(["keynote", "workshop", "break"] as const).map(
                      (kind, i) => (
                        <div key={kind} className="flex items-center gap-2">
                          <span
                            className={cn(
                              "size-3 rounded-full",
                              kindDot[kind],
                            )}
                          />
                          <span className="text-muted-foreground">
                            {agendaLegend[i] ?? kind}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
                <div className="space-y-4 lg:col-span-2">
                  {agendaItems.map((slot) => (
                    <div
                      key={slot.time + slot.title}
                      className={cn(
                        "flex gap-4 rounded-xl border border-border p-4",
                        slot.kind === "break" ? "bg-muted" : "bg-card",
                      )}
                    >
                      <div className="w-20 text-sm font-medium text-muted-foreground">
                        {slot.time}
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs",
                              kindTag[slot.kind],
                            )}
                          >
                            {agendaLegend[
                              slot.kind === "keynote"
                                ? 0
                                : slot.kind === "workshop"
                                  ? 1
                                  : 2
                            ] ?? slot.kind}
                          </span>
                        </div>
                        <h3 className="mb-1 text-lg font-semibold">
                          {slot.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {slot.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Speakers */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {speakersHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{speakersDesc}</p>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {speakerItems.map((sp) => (
                  <div key={sp.name} className="text-center">
                    <div className="mb-4 aspect-square overflow-hidden rounded-2xl bg-muted">
                      <Image
                        alt={sp.imageAlt}
                        w={400}
                        h={400}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </div>
                    <h3 className="text-lg font-semibold">{sp.name}</h3>
                    <p className="text-sm text-muted-foreground">{sp.role}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {sp.bio}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-primary py-16 text-primary-foreground">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statItems.map((s) => (
                  <div key={s.label}>
                    <div className="mb-2 text-4xl font-semibold sm:text-5xl">
                      {s.value}
                    </div>
                    <p className="text-primary-foreground/70">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-xl border border-border bg-card p-6"
                  >
                    <div className="mb-4 flex gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <StarIcon key={i} />
                      ))}
                    </div>
                    <p className="mb-4 leading-relaxed text-card-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        alt={t.avatarAlt}
                        w={80}
                        h={80}
                        loading="lazy"
                        className="size-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium">{t.name}</p>
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

          {/* Pricing */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative rounded-2xl border p-6",
                      tier.featured
                        ? "border-2 border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card",
                    )}
                  >
                    {tier.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-foreground">
                          {tier.badge}
                        </span>
                      </div>
                    )}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold">{tier.name}</h3>
                      <p
                        className={cn(
                          "text-sm",
                          tier.featured
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {tier.audience}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-semibold">
                        {tier.price}
                      </span>
                      {tier.unit && (
                        <span
                          className={cn(
                            tier.featured
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground",
                          )}
                        >
                          {tier.unit}
                        </span>
                      )}
                    </div>
                    <ul className="mb-6 space-y-3 text-sm">
                      {(tier.features ?? []).map((f) => (
                        <li
                          key={f.label}
                          className={cn(
                            "flex items-center gap-2",
                            !f.included &&
                              (tier.featured
                                ? "text-primary-foreground/50"
                                : "text-muted-foreground"),
                          )}
                        >
                          {f.included ? (
                            <CheckIcon
                              className={cn(
                                "size-5",
                                tier.featured
                                  ? "text-primary-foreground"
                                  : "text-foreground",
                              )}
                            />
                          ) : (
                            <CrossIcon className="size-5" />
                          )}
                          {f.label}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className={cn(
                        "w-full rounded-lg py-3 font-medium transition-colors",
                        tier.featured
                          ? "bg-background text-foreground hover:bg-background/90"
                          : "border border-input hover:border-foreground",
                      )}
                    >
                      {tier.cta}
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-center text-sm text-muted-foreground">
                {pricingFootnote}
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted py-20 lg:py-32">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="font-medium">{item.q}</span>
                      <span className="ml-4 transition-transform group-open:rotate-180">
                        <svg
                          className="size-5 text-muted-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Closing CTA */}
          <section className="bg-primary py-20 text-primary-foreground lg:py-32">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/70">
                {ctaDesc}
              </p>
              <form
                className="mx-auto mb-4 max-w-md"
                onSubmit={(e) => {
                  e.preventDefault()
                  go(ctaButton)
                }}
              >
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    required
                    placeholder={ctaEmailPlaceholder}
                    aria-label={ctaEmailPlaceholder}
                    className="flex-1 rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30"
                  />
                  <button
                    type="submit"
                    className="whitespace-nowrap rounded-lg bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-background/90"
                  >
                    {ctaButton}
                  </button>
                </div>
              </form>
              <p className="text-sm text-primary-foreground/60">
                {ctaFineprint}
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-8 md:grid-cols-4">
              <div className="md:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark className="size-8" />
                  <span className="font-semibold">{brand}</span>
                </button>
                <p className="text-sm text-muted-foreground">{footerNote}</p>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 text-sm font-semibold">{col.title}</h4>
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
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {brand}. {footerCopyright}
              </p>
              <div className="flex items-center gap-6">
                {(["Twitter", "LinkedIn", "GitHub"] as const).map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {social === "Twitter" && (
                      <svg
                        className="size-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                      </svg>
                    )}
                    {social === "LinkedIn" && (
                      <svg
                        className="size-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    )}
                    {social === "GitHub" && (
                      <svg
                        className="size-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    )}
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
