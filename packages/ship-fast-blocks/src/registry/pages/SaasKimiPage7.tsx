import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * SaasKimiPage7 — a dark, glassy, premium SaaS LANDING page for an AI-powered
 * calendar and scheduling assistant.
 *
 * The 7th distinct visual style sibling to SaasKimiPage. Features a sticky
 * frosted navbar, a bold centered hero with a floating dashboard screenshot
 * backed by a subtle ambient glow, a "trusted by" logo strip, a 6-icon
 * feature grid on translucent frosted cards, numbered how-it-works steps,
 * a masonry-style product gallery with image cards, a 3-tier pricing table
 * with a highlighted "Most Popular" plan, a metrics stats band, a 6-up
 * testimonial grid with avatar photos, an interactive native <details> FAQ
 * accordion, a gradient CTA banner, and a rich multi-column footer.
 *
 * Use when the AI needs a sleek, dark-themed, conversion-focused landing page
 * with rich social proof, a product-demo gallery, and a premium frosted-glass
 * aesthetic for SaaS, AI tools, productivity apps, or modern B2B startups.
 */
export const SaasKimiPage7 = defineComponent({
  name: "SaasKimiPage7",
  description:
    "A dark, glassy, premium SaaS landing page for an AI-powered scheduling assistant — the 7th distinct visual style sibling to SaasKimiPage. Features a sticky frosted navbar, a bold centered hero with a floating dashboard screenshot, a trusted-by logo strip, a 6-icon feature grid on translucent cards, numbered how-it-works steps, a masonry product gallery, a 3-tier pricing table with a highlighted Most Popular plan, a metrics stats band, a 6-up testimonial grid with avatar photos, an interactive native-details FAQ accordion, a gradient CTA banner, and a multi-column footer. Use when a sleek, dark-themed, conversion-focused landing page with rich social proof and a frosted-glass aesthetic is wanted for SaaS, AI tools, productivity, or B2B startups.",
  props: z.object({
    /** Brand / product name shown in navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels. */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        socialProof: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** Trusted-by logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        names: z.array(z.string()).optional(),
      })
      .optional(),
    /** Feature grid content. */
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
    /** How-it-works steps. */
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
    /** Product gallery cards. */
    gallery: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              imageAlt: z.string(),
              w: z.number().optional(),
              h: z.number().optional(),
              tall: z.boolean().optional(),
            }),
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
              currency: z.string().optional(),
              price: z.string(),
              period: z.string().optional(),
              features: z.array(z.string()),
              cta: z.string(),
              popular: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Stats / metrics band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Testimonial cards. */
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
    /** FAQ accordion items. */
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
    /** Closing CTA banner. */
    cta: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        socialProof: z.string().optional(),
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
        location: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Chrono"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "How it works", "Pricing", "FAQ"]

    const heroBadge = props.hero?.badge ?? "Now with AI meeting prep"
    const heroHeading = props.hero?.heading ?? "Your calendar, "
    const heroHighlight = props.hero?.highlight ?? "automated."
    const heroSub =
      props.hero?.subheading ??
      "Chrono is an AI scheduling assistant that books meetings, resolves conflicts, and defends your focus time — so you can do deep work instead of calendar Tetris."
    const heroPrimary = props.hero?.primaryCta ?? "Start free trial"
    const heroSecondary = props.hero?.secondaryCta ?? "See it in action"
    const heroProof =
      props.hero?.socialProof ??
      "No credit card required • 14-day free trial • Cancel anytime"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Dashboard interface showing a weekly calendar with color-coded meetings and focus time blocks"

    const logosLabel =
      props.logos?.label ?? "Trusted by fast-moving teams at"
    const logoNames = props.logos?.names?.length
      ? props.logos.names
      : ["Linear", "Notion", "Vercel", "Figma", "Stripe", "Raycast", "Loom"]

    const featuresTag = props.features?.tag ?? "Features"
    const featuresHeading =
      props.features?.heading ?? "Do less scheduling. More shipping."
    const featuresDesc =
      props.features?.description ??
      "Chrono handles the busywork so your team stays in flow."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "AI Conflict Resolution",
            description:
              "Double-booked? Chrono suggests the best reschedule based on attendee priority, travel time, and your focus goals.",
          },
          {
            title: "Smart Availability",
            description:
              "Share a booking link that respects your energy levels, travel buffers, and no-meeting blocks automatically.",
          },
          {
            title: "Focus Time Defense",
            description:
              "Chrono auto-blocks focus sessions and declines low-priority meetings that would fragment your deep work.",
          },
          {
            title: "Timezone Intelligence",
            description:
              "Coordinate across 12 timezones without the math. Chrono finds the humane overlap and sends invites in local time.",
          },
          {
            title: "Meeting Prep Docs",
            description:
              "Before every call, Chrono compiles a one-page brief with attendee backgrounds, agendas, and related threads.",
          },
          {
            title: "Team Scheduling Policies",
            description:
              "Set org-wide rules like 'no meetings before 10am' or 'max 4 hours of meetings per day.' Chrono enforces them.",
          },
        ]

    const stepsTag = props.steps?.tag ?? "How it works"
    const stepsHeading = props.steps?.heading ?? "How it works"
    const stepsDesc =
      props.steps?.description ?? "From chaos to calm in three steps."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Connect your calendars",
            description:
              "Sync Google Calendar, Outlook, and Apple Calendar in under 60 seconds. Chrono reads your existing events — no migration needed.",
          },
          {
            title: "Set your preferences",
            description:
              "Tell Chrono your ideal week: focus blocks, meeting limits, travel buffers, and lunch breaks. It learns and adapts over time.",
          },
          {
            title: "Let AI run the show",
            description:
              "Chrono books, reschedules, and declines meetings on your behalf. You review a daily digest and make tweaks — or just let it ride.",
          },
        ]

    const galleryTag = props.gallery?.tag ?? "Gallery"
    const galleryHeading =
      props.gallery?.heading ?? "A window into your week"
    const galleryDesc =
      props.gallery?.description ??
      "Beautiful, fast, and designed for focus — on desktop, mobile, and tablet."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Weekly overview",
            description:
              "See your entire week at a glance with intelligent color coding for deep work, syncs, and personal time.",
            imageAlt:
              "MacBook on a wooden desk displaying a weekly calendar with colorful meeting blocks and focus sessions",
            w: 1200,
            h: 675,
            tall: true,
          },
          {
            title: "Daily agenda",
            description:
              "Morning briefings, travel alerts, and one-tap join links right on your lock screen.",
            imageAlt:
              "Smartphone on a coffee table showing a daily agenda with meeting reminders and travel time alerts",
            w: 600,
            h: 800,
            tall: true,
          },
          {
            title: "Attendee finder",
            description:
              "Pick the best slot for everyone without endless email chains.",
            imageAlt:
              "Tablet on a desk showing a scheduling sidebar with attendee availability and suggested time slots",
            w: 600,
            h: 800,
            tall: false,
          },
          {
            title: "Team insights",
            description:
              "Heatmaps show meeting load across your org so managers can protect maker time.",
            imageAlt:
              "Two colleagues reviewing a wall-mounted dashboard with team calendar analytics and heatmaps",
            w: 1200,
            h: 675,
            tall: false,
          },
        ]

    const pricingTag = props.pricing?.tag ?? "Pricing"
    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start free. Upgrade when your team grows."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Starter",
            description: "For individuals getting started with AI scheduling.",
            currency: "$",
            price: "0",
            period: "/mo",
            features: [
              "1 connected calendar",
              "Smart booking link",
              "Basic email support",
              "Web app access",
            ],
            cta: "Get started free",
            popular: false,
          },
          {
            name: "Pro",
            description:
              "For professionals who need AI to run their calendar end-to-end.",
            currency: "$",
            price: "12",
            period: "/user/mo",
            features: [
              "Unlimited calendars",
              "AI conflict resolution",
              "Focus time defense",
              "Meeting prep docs",
              "Priority support",
            ],
            cta: "Start 14-day trial",
            popular: true,
          },
          {
            name: "Enterprise",
            description:
              "For teams that need policies, analytics, and admin controls.",
            currency: "$",
            price: "29",
            period: "/user/mo",
            features: [
              "Everything in Pro",
              "Team scheduling policies",
              "Workload analytics",
              "SSO & SCIM",
              "Dedicated account manager",
            ],
            cta: "Contact sales",
            popular: false,
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "12.4M", label: "Meetings scheduled" },
          { value: "3.2 hrs", label: "Avg. weekly time saved" },
          { value: "98.7%", label: "Conflict-free bookings" },
          { value: "4,800+", label: "Teams using Chrono" },
        ]

    const testimonialsTag = props.testimonials?.tag ?? "Testimonials"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by busy people"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Here is what founders, operators, and makers say about Chrono."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Chrono reclaimed my mornings. I went from 6 hours of meetings a day to 3, and my team ships 40% faster because I am actually available for deep reviews.",
            name: "Sarah Lin",
            role: "VP Product at Linear",
            avatarAlt:
              "Professional headshot of a smiling product manager with short brown hair",
          },
          {
            quote:
              "The timezone intelligence is unreal. I work across SF, London, and Tokyo — Chrono finds the one humane slot without me doing mental math at midnight.",
            name: "Marcus Reid",
            role: "Staff Engineer at Vercel",
            avatarAlt:
              "Professional headshot of a bearded software engineer wearing glasses",
          },
          {
            quote:
              "I used to spend Sunday evenings planning my week. Now Chrono does it before I finish my Monday coffee. The meeting prep docs are a killer feature.",
            name: "Aisha Patel",
            role: "CMO at Raycast",
            avatarAlt:
              "Professional headshot of a smiling marketing director with dark curly hair",
          },
          {
            quote:
              "We rolled Chrono out to 120 people. Within two weeks, our average meeting load dropped and employee NPS went up 18 points. It pays for itself in morale alone.",
            name: "David Okafor",
            role: "CEO at Tasklane",
            avatarAlt:
              "Professional headshot of a cheerful startup founder with short dark hair",
          },
          {
            quote:
              "As a design lead, I need long blocks for creative work. Chrono defends my focus time like a bodyguard and reschedules syncs without me lifting a finger.",
            name: "Emily Carter",
            role: "Design Lead at Figma",
            avatarAlt:
              "Professional headshot of a design lead with red hair and freckles smiling warmly",
          },
          {
            quote:
              "The team scheduling policies are a game changer. We set 'no-meeting Wednesdays' and Chrono enforces it across the org. Finally, a tool that respects maker time.",
            name: "Nina Volkov",
            role: "Head of Ops at Stripe",
            avatarAlt:
              "Professional headshot of a smiling operations manager with long dark hair",
          },
        ]

    const faqTag = props.faq?.tag ?? "FAQ"
    const faqHeading =
      props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know before handing your calendar to AI."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "Is my calendar data secure?",
            answer:
              "Yes. Chrono is SOC 2 Type II certified and GDPR compliant. We encrypt data at rest with AES-256 and in transit with TLS 1.3. We never sell or train models on your calendar content.",
          },
          {
            question: "Which calendar providers do you support?",
            answer:
              "Google Calendar, Microsoft Outlook/Exchange, and Apple Calendar. You can connect multiple accounts and Chrono will keep them in sync.",
          },
          {
            question: "Can I override the AI?",
            answer:
              "Absolutely. Chrono suggests changes, but you approve them via a daily digest. You can set auto-pilot for low-stakes meetings and require approval for exec-level events.",
          },
          {
            question: "What happens when I invite external guests?",
            answer:
              "Chrono finds the best available slot and sends a standard calendar invite. Guests do not need a Chrono account. Your internal preferences and focus blocks stay private.",
          },
          {
            question: "Is there a free trial?",
            answer:
              "Yes. Every paid plan starts with a 14-day free trial. No credit card required. You can downgrade to the free Starter plan anytime.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? "Ready to reclaim your week?"
    const ctaSub =
      props.cta?.subheading ??
      "Join 4,800+ teams who let Chrono handle the calendar so they can focus on the work that matters."
    const ctaPrimary = props.cta?.primaryCta ?? "Start free trial"
    const ctaSecondary = props.cta?.secondaryCta ?? "Talk to sales"
    const ctaProof =
      props.cta?.socialProof ??
      "No credit card required • 14-day free trial • Cancel anytime"

    const footerTagline =
      props.footer?.tagline ??
      "AI scheduling that respects your time. Built for teams who ship."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Integrations", "Changelog", "API docs"],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Press kit", "Contact"],
          },
          {
            title: "Legal",
            links: ["Privacy", "Terms", "Security", "Cookies"],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`
    const footerLocation =
      props.footer?.location ?? "Made with care in San Francisco."

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </span>
    )

    const Check = () => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 size-5 shrink-0 text-primary"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )

    const featureIcons = [
      <svg
        key="sparkles"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
      </svg>,
      <svg
        key="clock"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>,
      <svg
        key="bolt"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>,
      <svg
        key="globe"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>,
      <svg
        key="doc"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>,
      <svg
        key="sliders"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.287.696.287 1.093m0-1.093c.18-.324.287-.696.287-1.093m0 1.093v2.186m0-2.186a2.25 2.25 0 0 1 0-2.186m0 2.186a2.25 2.25 0 0 0 0-2.186m4.5 2.186a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.287.696.287 1.093m0-1.093c.18-.324.287-.696.287-1.093m0 1.093v2.186m0-2.186a2.25 2.25 0 0 1 0-2.186m0 2.186a2.25 2.25 0 0 0 0-2.186m4.5 2.186a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.287.696.287 1.093m0-1.093c.18-.324.287-.696.287-1.093m0 1.093v2.186m0-2.186a2.25 2.25 0 0 1 0-2.186m0 2.186a2.25 2.25 0 0 0 0-2.186" />
      </svg>,
    ]

    return (
      <div
        className={cn(
          "flex min-h-svh flex-col bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground"
            >
              <LogoMark />
              {brand}
            </button>
            <ul className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
              {nav.map((label) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => go(label)}
                    className="transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => go("Log in")}
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => go(heroPrimary)}
                className="rounded-lg bg-gradient-to-br from-primary to-primary/80 px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg"
              >
                Get started
              </button>
            </div>
          </nav>
        </header>

        <main className="flex flex-1 flex-col">
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-1/2 left-1/2 size-[900px] -translate-x-1/2 rounded-full bg-primary/[0.06] blur-3xl"
            />
            <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-primary" />
                  </span>
                  {heroBadge}
                </div>
                <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
                  {heroHeading}
                  <span className="text-primary">{heroHighlight}</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                  {heroSub}
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="w-full rounded-xl bg-gradient-to-br from-primary to-primary/80 px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:-translate-y-px hover:shadow-xl sm:w-auto"
                  >
                    {heroPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="w-full rounded-xl border border-border bg-card px-8 py-3.5 text-base font-semibold text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-muted sm:w-auto"
                  >
                    {heroSecondary}
                  </button>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">{heroProof}</p>
              </div>

              <div className="mt-16 flex justify-center">
                <div className="relative w-full max-w-5xl rounded-2xl border border-border/60 bg-card/50 p-2 shadow-2xl backdrop-blur-md sm:p-3">
                  <Image
                    alt={heroImageAlt}
                    w={1600}
                    h={900}
                    loading="eager"
                    className="rounded-xl border border-border/60"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-border/60" />
                </div>
              </div>
            </div>
          </section>

          {/* Logo strip */}
          <section className="border-y border-border/60 bg-muted/40">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
              <p className="text-center text-sm font-medium text-muted-foreground">
                {logosLabel}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-70">
                {logoNames.map((name) => (
                  <span
                    key={name}
                    className="text-lg font-bold tracking-tight text-muted-foreground"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.05em] text-primary">
                  {featuresTag}
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {featuresHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {featuresDesc}
                </p>
              </div>
              <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-border/60 bg-card/60 p-7 backdrop-blur-md transition hover:bg-card"
                  >
                    <div className="flex size-11 items-center justify-center rounded-lg bg-primary/20 text-primary">
                      <div className="size-6">{featureIcons[i]}</div>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="border-t border-border/60 bg-muted/40 py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.05em] text-primary">
                  {stepsTag}
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {stepsDesc}
                </p>
              </div>
              <div className="mt-16 grid gap-8 md:grid-cols-3">
                {stepItems.map((step, i) => (
                  <article
                    key={step.title}
                    className="relative rounded-2xl border border-border/60 bg-card/60 p-8 backdrop-blur-md"
                  >
                    <div className="absolute -top-4 left-8 inline-flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-lg">
                      {i + 1}
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.05em] text-primary">
                  {galleryTag}
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {galleryHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {galleryDesc}
                </p>
              </div>
              <div className="mt-16 grid gap-6 md:grid-cols-12">
                {galleryItems.map((item, idx) => (
                  <div
                    key={item.title}
                    className={cn(
                      idx === 0 && "md:col-span-8",
                      idx === 1 && "md:col-span-4",
                      idx === 2 && "md:col-span-4",
                      idx === 3 && "md:col-span-8",
                    )}
                  >
                    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/60 shadow-xl backdrop-blur-md">
                      <Image
                        alt={item.imageAlt}
                        w={item.w ?? 1200}
                        h={item.h ?? 675}
                        loading="lazy"
                        className={cn(
                          "w-full object-cover",
                          item.tall ? "h-72 sm:h-96" : "h-72 sm:h-80",
                        )}
                      />
                      <div className="p-6">
                        <h3 className="text-base font-semibold text-foreground">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="border-t border-border/60 bg-muted/40 py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.05em] text-primary">
                  {pricingTag}
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {pricingDesc}
                </p>
              </div>
              <div className="mt-16 grid gap-6 lg:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <article
                    key={plan.name}
                    className={cn(
                      "relative rounded-2xl p-8 backdrop-blur-md",
                      plan.popular
                        ? "border border-primary/40 bg-primary/10 ring-1 ring-primary/20"
                        : "border border-border/60 bg-card/60",
                    )}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground shadow-lg">
                        Most popular
                      </div>
                    )}
                    <h3
                      className={cn(
                        "text-sm font-semibold uppercase tracking-wide",
                        plan.popular ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {plan.name}
                    </h3>
                    <p className="mt-4 flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">
                        {plan.currency}
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-muted-foreground">
                          {plan.period}
                        </span>
                      )}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                    <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-3">
                          <Check />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "mt-8 block w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors",
                        plan.popular
                          ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md hover:shadow-lg"
                          : "border border-border bg-card text-foreground hover:bg-muted",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="border-t border-border/60 py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
                {statsItems.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-md"
                  >
                    <p className="text-3xl font-extrabold text-foreground">
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
          <section className="py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.05em] text-primary">
                  {testimonialsTag}
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <figure
                    key={t.name}
                    className="rounded-2xl border border-border/60 bg-card/60 p-7 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={150}
                        h={150}
                        className="size-12 rounded-full object-cover ring-2 ring-border/60"
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {t.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </div>
                    <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                  </figure>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="border-t border-border/60 bg-muted/40 py-20 sm:py-28">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.05em] text-primary">
                  {faqTag}
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {faqDesc}
                </p>
              </div>
              <div className="mt-12 space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-md open:bg-card/80"
                  >
                    <summary className="flex cursor-pointer items-center justify-between text-base font-semibold text-foreground">
                      {item.question}
                      <svg
                        className="size-5 shrink-0 text-muted-foreground transition group-open:rotate-180"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-20 sm:py-28">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-accent p-10 text-center shadow-2xl sm:p-16">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-1/2 -left-[20%] size-[600px] rounded-full bg-primary-foreground/[0.12] blur-3xl"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-1/2 -right-[20%] size-[600px] rounded-full bg-primary-foreground/[0.08] blur-3xl"
                />
                <div className="relative">
                  <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                    {ctaHeading}
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/90">
                    {ctaSub}
                  </p>
                  <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(ctaPrimary)}
                      className="w-full rounded-xl bg-background px-8 py-3.5 text-base font-semibold text-primary shadow-lg transition-colors hover:bg-muted sm:w-auto"
                    >
                      {ctaPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(ctaSecondary)}
                      className="w-full rounded-xl border border-primary-foreground/30 px-8 py-3.5 text-base font-semibold text-primary-foreground backdrop-blur-sm transition-colors hover:bg-primary-foreground/10 sm:w-auto"
                    >
                      {ctaSecondary}
                    </button>
                  </div>
                  <p className="mt-4 text-xs text-primary-foreground/80">
                    {ctaProof}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/60 bg-muted/40">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="flex items-center gap-2 text-xl font-bold text-foreground"
                >
                  <LogoMark className="size-7" />
                  {brand}
                </button>
                <p className="mt-4 max-w-xs text-sm text-muted-foreground">
                  {footerTagline}
                </p>
                <div className="mt-6 flex gap-4">
                  {[
                    {
                      label: "Twitter",
                      path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
                    },
                    {
                      label: "GitHub",
                      path: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z",
                    },
                    {
                      label: "LinkedIn",
                      path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
                    },
                  ].map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      aria-label={s.label}
                      onClick={() => go(s.label)}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <svg
                        className="size-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d={s.path} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="text-sm font-semibold text-foreground">
                    {col.title}
                  </h4>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
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
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row">
              <p className="text-xs text-muted-foreground">
                {footerCopyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {footerLocation}
              </p>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
