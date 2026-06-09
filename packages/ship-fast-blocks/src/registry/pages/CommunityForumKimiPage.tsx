import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * CommunityForumKimiPage — a complete, self-contained community-platform /
 * discussion-forum MARKETING landing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Threadloom" design: a clean,
 * calm, light, slate-toned SaaS aesthetic with a sticky blurred navbar, generous
 * whitespace, soft rounded cards and a near-black dark band for stats/CTA. It
 * pairs a centered hero (live-status pill + big tracking-tight headline + dual
 * CTAs + trust checkmarks) with a logo trust strip, a 6-up features grid with
 * icon tiles, a colorful topic/category directory grid with emoji + discussion
 * counts, a 3-step "launch your community" timeline, a dark KPI stats band, a
 * 3-up star-rated testimonial grid with avatars, a 3-tier pricing table (with a
 * highlighted "Most Popular" dark plan), an accordion FAQ (details/summary), a
 * dark final CTA band, and a rich multi-column footer with social links.
 *
 * Every nav item / CTA / topic link / pricing button / footer link / social /
 * form-submit routes through `useNavigate` (never a dead "#"). All imagery uses
 * the alt-driven <Image> component (never a raw src). Callers supply ONLY content
 * data; rich defaults make it render the full page with no props at all.
 */
export const CommunityForumKimiPage = defineComponent({
  name: "CommunityForumKimiPage",
  description:
    "Complete community-platform / discussion-forum MARKETING landing page with a clean, calm, light slate-toned SaaS aesthetic: sticky blurred navbar, generous whitespace, soft rounded cards and dark contrast bands. Includes a centered hero (live-status pill, large tracking-tight headline, dual CTAs, trust checkmarks for free trial / no card / cancel anytime), a logo trust strip, a 6-up features grid with icon tiles (organized topics, powerful search, granular permissions, real-time updates, community insights, rich text editor), a colorful topic/category directory grid with emoji icons and active-discussion counts, a 3-step launch-your-community timeline, a dark KPI stats band (communities, discussions, uptime, countries), a 3-up star-rated testimonial grid with avatars, a 3-tier pricing table with a highlighted Most Popular plan, an accordion FAQ, a dark final call-to-action band, and a multi-column footer with social links. Use as the ROOT/home page for community platforms, online forums, discussion boards, membership communities, group/social SaaS, knowledge bases, creator/professional networks, or any product helping people gather and have threaded conversations. Supply content only — brand, nav, hero, logos, features, topics, steps, stats, testimonials, pricing, faq, cta, footer; the block owns all layout and styling.",
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
        /** Sign-in link label in the navbar. */
        signIn: z.string().optional(),
        /** Primary navbar CTA label. */
        navCta: z.string().optional(),
        /** Trust checkmark chips beneath the hero CTAs. */
        trust: z.array(z.string()).optional(),
      })
      .optional(),
    /** Logo trust strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Features grid. */
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Topic / category directory grid. */
    topics: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              emoji: z.string(),
              title: z.string(),
              count: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** "Launch in minutes" step timeline. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark KPI stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Testimonial grid. */
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
    /** Pricing tiers. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              price: z.string(),
              cadence: z.string(),
              description: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
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
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Final dark CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(
            z.object({
              heading: z.string(),
              links: z.array(z.string()),
            }),
          )
          .optional(),
        note: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Threadloom"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Topics", "Pricing", "Stories", "FAQ"]

    const heroBadge =
      props.hero?.badge ?? "Over 12,000 communities already connected"
    const headingTop = props.hero?.headingTop ?? "Where conversations"
    const headingBottom = props.hero?.headingBottom ?? "actually matter"
    const heroSub =
      props.hero?.subheading ??
      "Threadloom brings professionals, creators, and enthusiasts together in structured, searchable discussions. No noise. No algorithms. Just genuine exchange."
    const heroPrimary = props.hero?.primaryCta ?? "Start Your Community"
    const heroSecondary = props.hero?.secondaryCta ?? "See How It Works"
    const signIn = props.hero?.signIn ?? "Sign In"
    const navCta = props.hero?.navCta ?? "Get Started"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["Free 14-day trial", "No credit card required", "Cancel anytime"]

    const logosHeading =
      props.logos?.heading ?? "Trusted by teams at innovative companies"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Vercel", "Notion", "Linear", "Figma", "Stripe", "Slack"]

    const featuresHeading =
      props.features?.heading ?? "Everything you need for thriving discussions"
    const featuresDesc =
      props.features?.description ??
      "Purpose-built features that make community management effortless and conversations delightful."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Organized Topics",
            description:
              "Create unlimited categories and subcategories. Keep discussions structured so members can find exactly what they need without endless scrolling.",
          },
          {
            title: "Powerful Search",
            description:
              "Instant full-text search across all posts, comments, and member profiles. Find that specific conversation from months ago in seconds.",
          },
          {
            title: "Granular Permissions",
            description:
              "Control who can view, post, moderate, and manage. Create private spaces for premium members or open discussions for everyone.",
          },
          {
            title: "Real-time Updates",
            description:
              "See new posts and replies instantly without refreshing. Stay in the flow of conversation with live notifications and typing indicators.",
          },
          {
            title: "Community Insights",
            description:
              "Track engagement metrics, popular topics, member growth, and activity patterns. Make data-driven decisions to nurture your community.",
          },
          {
            title: "Rich Text Editor",
            description:
              "Compose beautiful posts with markdown support, code blocks, embeds, and file attachments. Express ideas clearly with formatting that just works.",
          },
        ]

    const topicsHeading = props.topics?.heading ?? "Explore active communities"
    const topicsDesc =
      props.topics?.description ??
      "Join thousands of ongoing conversations across diverse topics and interests."
    const topicItems = props.topics?.items?.length
      ? props.topics.items
      : [
          { emoji: "💻", title: "Software Engineering", count: "2,847 active discussions" },
          { emoji: "🎨", title: "Design & UX", count: "1,523 active discussions" },
          { emoji: "📊", title: "Data Science", count: "956 active discussions" },
          { emoji: "🚀", title: "Startups", count: "1,104 active discussions" },
          { emoji: "📷", title: "Photography", count: "742 active discussions" },
          { emoji: "🌱", title: "Sustainability", count: "628 active discussions" },
          { emoji: "💼", title: "Remote Work", count: "1,891 active discussions" },
          { emoji: "🎵", title: "Music Production", count: "534 active discussions" },
        ]

    const stepsHeading =
      props.steps?.heading ?? "Launch your community in minutes"
    const stepsDesc =
      props.steps?.description ??
      "From zero to thriving community in three simple steps."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Create your space",
            description:
              "Choose your community name, customize the look and feel, and set up your initial topic categories. No technical skills required.",
          },
          {
            title: "Invite your people",
            description:
              "Send invitation links, import your existing mailing list, or make your community discoverable. Set membership rules that work for you.",
          },
          {
            title: "Start conversations",
            description:
              "Post your first discussion topic, welcome new members, and watch your community flourish with meaningful exchanges.",
          },
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "12,000+", label: "Active Communities" },
          { value: "2.4M", label: "Monthly Discussions" },
          { value: "98.7%", label: "Uptime SLA" },
          { value: "156", label: "Countries Reached" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by community builders"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See what leaders and creators say about growing their communities with Threadloom."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Threadloom transformed how our remote team stays connected. The threaded discussions make it easy to follow conversations, and the search is incredibly powerful.",
            name: "Sarah Chen",
            role: "VP of People, Linear",
            avatarAlt:
              "professional headshot of a smiling woman with shoulder-length brown hair",
          },
          {
            quote:
              "We migrated 50,000 members from a Facebook group to Threadloom. Member engagement increased 340% because people can actually find and follow discussions that matter to them.",
            name: "Marcus Johnson",
            role: "Founder, IndieHackers Pro",
            avatarAlt:
              "professional headshot of a man with short dark hair and glasses",
          },
          {
            quote:
              "The moderation tools are exceptional. We can set automated rules, review flagged content, and maintain quality without spending hours on manual work.",
            name: "Elena Rodriguez",
            role: "Community Lead, Notion",
            avatarAlt:
              "professional headshot of a woman with blonde hair wearing a business blazer",
          },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start free and scale as your community grows. No hidden fees, no surprises."
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Starter",
            price: "$0",
            cadence: "Forever free",
            description:
              "Perfect for small groups getting started with community building.",
            features: [
              "Up to 100 members",
              "5 topic categories",
              "Basic analytics",
              "Community support",
            ],
            cta: "Get Started",
            featured: false,
          },
          {
            name: "Growth",
            price: "$49",
            cadence: "per month",
            description:
              "For growing communities that need more power and flexibility.",
            features: [
              "Up to 5,000 members",
              "Unlimited categories",
              "Advanced analytics",
              "Priority email support",
              "Custom domain",
            ],
            cta: "Start 14-Day Trial",
            featured: true,
            badge: "Most Popular",
          },
          {
            name: "Enterprise",
            price: "$299",
            cadence: "per month",
            description:
              "For large organizations with advanced security and scaling needs.",
            features: [
              "Unlimited members",
              "SSO & SAML",
              "API access",
              "Dedicated support",
              "SLA guarantee",
            ],
            cta: "Contact Sales",
            featured: false,
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ?? `Everything you need to know about ${brand}.`
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "Can I migrate from another platform?",
            answer:
              "Absolutely. We offer free migration services from Facebook Groups, Discord, Circle, and other platforms. Our team will help you export your data, preserve all posts and member relationships, and set up your new community space with minimal disruption.",
          },
          {
            question: "Is there a limit on file uploads?",
            answer:
              "Starter plans include 1GB of storage. Growth plans offer 50GB, and Enterprise plans have unlimited storage. Individual file uploads are limited to 100MB on all plans. We support images, documents, PDFs, and most common file formats.",
          },
          {
            question: "Can I make my community private?",
            answer:
              "Yes, you have full control over visibility. Set your entire community to public, private, or invitation-only. You can also create private subgroups within a public community, perfect for premium members, moderators, or specific project teams.",
          },
          {
            question: "What kind of analytics do you provide?",
            answer:
              "All plans include member growth tracking, active user counts, and popular topics. Growth and Enterprise plans add engagement metrics, retention analysis, content performance reports, and the ability to export data for further analysis in your preferred tools.",
          },
          {
            question: "Do you offer mobile apps?",
            answer:
              "Threadloom is fully responsive and works beautifully on mobile browsers. Native iOS and Android apps are in development and will be available to Growth and Enterprise customers later this year with full white-label options for Enterprise plans.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to build your community?"
    const ctaDesc =
      props.cta?.description ??
      "Join thousands of communities already fostering meaningful conversations on Threadloom. Start free, upgrade when you're ready."
    const ctaPrimary = props.cta?.primaryCta ?? "Create Free Community"
    const ctaSecondary = props.cta?.secondaryCta ?? "Schedule a Demo"
    const ctaNote =
      props.cta?.note ??
      "Free 14-day trial on all paid plans • No credit card required"

    const footerTagline =
      props.footer?.tagline ??
      "The modern platform for communities that value depth, organization, and meaningful connection."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            heading: "Product",
            links: ["Features", "Pricing", "Integrations", "Changelog", "Roadmap"],
          },
          {
            heading: "Resources",
            links: ["Documentation", "API Reference", "Community", "Blog", "Guides"],
          },
          {
            heading: "Company",
            links: ["About", "Careers", "Contact", "Privacy", "Terms"],
          },
        ]
    const footerNote = props.footer?.note ?? "All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Status", "Security", "Sitemap"]

    // Brand mark — three connected nodes (decorative inline SVG, currentColor).
    const BrandMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 32 32"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <circle cx="8" cy="16" r="3" />
        <circle cx="16" cy="16" r="3" />
        <circle cx="24" cy="16" r="3" />
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

    const Star = ({ className }: { className?: string }) => (
      <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    // Rotating token tints for the colorful topic tiles (no raw palette).
    const topicTints = [
      "bg-primary/10 text-primary",
      "bg-secondary text-secondary-foreground",
      "bg-accent text-accent-foreground",
      "bg-chart-1/15 text-chart-1",
      "bg-chart-2/15 text-chart-2",
      "bg-chart-3/15 text-chart-3",
      "bg-chart-4/15 text-chart-4",
      "bg-chart-5/15 text-chart-5",
    ]

    const featureIcons: ReactNode[] = [
      // organized topics — list/lines
      <svg key="topics" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>,
      // powerful search
      <svg key="search" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>,
      // granular permissions — lock
      <svg key="lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>,
      // real-time updates — bolt
      <svg key="bolt" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      // community insights — chart
      <svg key="chart" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      // rich text editor — lines
      <svg key="editor" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M10 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>,
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground/80 antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <BrandMark className="size-8 text-foreground" />
                <span className="text-xl font-semibold text-foreground">{brand}</span>
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
                  onClick={() => go(signIn)}
                  className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
                >
                  {signIn}
                </button>
                <button
                  type="button"
                  onClick={() => go(navCta)}
                  className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {navCta}
                </button>
              </div>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden pb-24 pt-20 lg:pb-40 lg:pt-32">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  <span className="flex size-2 rounded-full bg-primary" />
                  {heroBadge}
                </div>
                <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  {headingTop}
                  <br className="hidden sm:block" /> {headingBottom}
                </h1>
                <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  {heroSub}
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-8 py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
                  >
                    {heroPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex w-full items-center justify-center rounded-lg border border-input bg-background px-8 py-4 text-base font-medium text-foreground/80 transition-colors hover:bg-muted sm:w-auto"
                  >
                    {heroSecondary}
                  </button>
                </div>
                <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
                  {heroTrust.map((t) => (
                    <div key={t} className="flex items-center gap-2">
                      <Check className="size-5 text-primary" />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border bg-muted/50 py-12">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium text-muted-foreground">
                {logosHeading}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="flex items-center gap-2 font-semibold text-foreground/80 transition-opacity hover:opacity-100"
                  >
                    <span className="grid size-6 place-items-center rounded-sm bg-foreground/10 text-xs font-bold text-foreground">
                      {logo.charAt(0)}
                    </span>
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-xl border border-border bg-card p-8 transition-colors hover:border-foreground/20"
                  >
                    <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-muted text-foreground/80">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-card-foreground">
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

          {/* Topics */}
          <section className="bg-muted py-24 lg:py-32">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {topicsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{topicsDesc}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {topicItems.map((topic, i) => (
                  <button
                    key={topic.title}
                    type="button"
                    onClick={() => go(topic.title)}
                    className="group rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-foreground/20 hover:shadow-sm"
                  >
                    <div
                      className={cn(
                        "mb-4 flex size-10 items-center justify-center rounded-lg text-xl",
                        topicTints[i % topicTints.length],
                      )}
                    >
                      <span aria-hidden="true">{topic.emoji}</span>
                    </div>
                    <h4 className="mb-1 font-semibold text-card-foreground">
                      {topic.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">{topic.count}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground">
                      {i + 1}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                    {i < stepItems.length - 1 && (
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

          {/* Stats */}
          <section className="bg-foreground py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statItems.map((s) => (
                  <div key={s.label}>
                    <div className="mb-2 text-3xl font-bold text-background sm:text-4xl">
                      {s.value}
                    </div>
                    <div className="text-sm text-background/60">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{testimonialsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-xl border border-border bg-card p-8"
                  >
                    <div className="mb-4 flex items-center gap-1 text-chart-4">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="size-5" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-card-foreground">
                          {t.name}
                        </div>
                        <div className="text-sm text-muted-foreground">{t.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted py-24 lg:py-32">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative rounded-xl border p-8",
                      tier.featured
                        ? "border-foreground bg-foreground"
                        : "border-border bg-card",
                    )}
                  >
                    {tier.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                        {tier.badge}
                      </div>
                    )}
                    <div
                      className={cn(
                        "mb-2 text-sm font-medium",
                        tier.featured ? "text-background/60" : "text-muted-foreground",
                      )}
                    >
                      {tier.name}
                    </div>
                    <div
                      className={cn(
                        "mb-2 text-4xl font-bold",
                        tier.featured ? "text-background" : "text-foreground",
                      )}
                    >
                      {tier.price}
                    </div>
                    <div
                      className={cn(
                        "mb-6 text-sm",
                        tier.featured ? "text-background/60" : "text-muted-foreground",
                      )}
                    >
                      {tier.cadence}
                    </div>
                    <p
                      className={cn(
                        "mb-6 text-sm",
                        tier.featured ? "text-background/80" : "text-muted-foreground",
                      )}
                    >
                      {tier.description}
                    </p>
                    <ul className="mb-8 space-y-3">
                      {tier.features.map((feat) => (
                        <li
                          key={feat}
                          className={cn(
                            "flex items-center gap-3 text-sm",
                            tier.featured ? "text-background/90" : "text-foreground/80",
                          )}
                        >
                          <Check className="size-5 shrink-0 text-primary" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className={cn(
                        "block w-full rounded-lg py-3 text-center text-sm font-medium transition-colors",
                        tier.featured
                          ? "bg-background text-foreground hover:bg-background/90"
                          : "border border-input bg-card text-foreground/80 hover:bg-muted",
                      )}
                    >
                      {tier.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-xl border border-border bg-card p-6 transition-colors open:border-foreground/20"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between">
                      <h3 className="text-lg font-semibold text-card-foreground">
                        {item.question}
                      </h3>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-5 text-muted-foreground transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <p className="mt-4 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-foreground py-24 lg:py-32">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold text-background sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-background/70 sm:text-xl">
                {ctaDesc}
              </p>
              <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-background px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-background/90 sm:w-auto"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex w-full items-center justify-center rounded-lg border border-background/30 px-8 py-4 text-base font-medium text-background transition-colors hover:bg-background/10 sm:w-auto"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="text-sm text-background/60">{ctaNote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-background py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
              <div className="col-span-2 lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <BrandMark className="size-8 text-foreground" />
                  <span className="text-xl font-semibold text-foreground">{brand}</span>
                </button>
                <p className="mb-4 max-w-xs text-muted-foreground">{footerTagline}</p>
                <div className="flex items-center gap-4">
                  {(["Twitter", "GitHub", "Instagram"] as const).map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <SocialIcon name={social} />
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.heading}>
                  <h4 className="mb-4 font-semibold text-foreground">{col.heading}</h4>
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
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {brand} Inc. {footerNote}
              </p>
              <div className="flex items-center gap-6">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
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

// Footer social icons (decorative inline SVG, currentColor).
function SocialIcon({ name }: { name: "Twitter" | "GitHub" | "Instagram" }) {
  if (name === "Twitter") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
      </svg>
    )
  }
  if (name === "GitHub") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}
