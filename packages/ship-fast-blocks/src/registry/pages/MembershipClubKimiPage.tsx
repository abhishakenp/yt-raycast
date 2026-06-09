import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * MembershipClubKimiPage — a complete, self-contained PRIVATE MEMBERSHIP CLUB
 * landing page ("The Guild").
 *
 * A faithful Tailwind v4 port of a Kimi-generated design: a calm, editorial,
 * warm-neutral aesthetic (light "stone" canvas) with airy whitespace, thin
 * light headings, rounded cards and a quietly premium, exclusive mood. It pairs
 * a split hero (eyebrow + thin display headline + dual CTAs + member-count proof
 * strip + photo with a floating quote card), a "members come from" logo strip,
 * a 6-up benefits grid with icon tiles, a masonry-style photo gallery of
 * gatherings, a 3-tier membership pricing block with a highlighted "Most
 * Popular" plan, a community stats band, a 3-step "How it works" join flow, a
 * 6-up member-testimonials grid with headshots, an accordion FAQ, a dark
 * full-width "Ready to join" CTA, and a multi-column footer.
 *
 * The block owns ALL layout, spacing, type hierarchy and surfaces via semantic
 * theme tokens. Every nav item / CTA / pricing button / FAQ / footer / social
 * link routes through `useNavigate` (never a dead "#"); navbar labels match the
 * `nav` array so PageSwitch can swap pages. All imagery (hero, gallery,
 * headshots) uses the alt-driven <Image> component (never a raw src). Callers
 * supply ONLY content data; rich defaults make it render great with no props.
 */
export const MembershipClubKimiPage = defineComponent({
  name: "MembershipClubKimiPage",
  description:
    "Complete PRIVATE MEMBERSHIP CLUB / exclusive community landing page (e.g. 'The Guild') with a calm, editorial, warm-neutral aesthetic: light airy canvas, thin elegant display headings, generous whitespace, rounded cards and a quietly premium, invite-only mood. Includes a split hero (eyebrow label, thin display headline with highlighted phrase, dual CTAs, member-count proof strip and a lifestyle photo with a floating pull-quote card), a 'members come from' company logo strip, a 6-up member-benefits grid with icon tiles (introductions, clubhouses, events, retreats, library, community), a masonry photo gallery of gatherings, a 3-tier membership pricing block with a highlighted 'Most Popular' tier and feature checklists, a community stats band, a 3-step 'How it works' application flow, a 6-up member-testimonials grid with headshots and quotes, an accordion FAQ, a dark full-width 'Ready to join' conversion CTA with contact email, and a multi-column footer. Use as the ROOT/home page for private members clubs, social/founders clubs, professional networks, curated communities, alumni or invite-only collectives, coworking/clubhouse memberships, mastermind groups or paid community subscriptions when an exclusive, refined, trust-building page with strong social proof, tiers and application flow is wanted. Supply content only — brand, nav, hero, logos, benefits, gallery, pricing, stats, steps, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / club name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        headingBefore: z.string().optional(),
        /** Phrase rendered with emphasized (normal-weight) highlight. */
        highlight: z.string().optional(),
        headingAfter: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        proof: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
        quote: z.string().optional(),
        quoteAuthor: z.string().optional(),
      })
      .optional(),
    /** "Members come from" logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        companies: z.array(z.string()).optional(),
      })
      .optional(),
    /** Member benefits grid. */
    benefits: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Photo gallery of gatherings. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        images: z.array(z.string()).optional(),
      })
      .optional(),
    /** Membership pricing tiers. */
    pricing: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              blurb: z.string(),
              price: z.string(),
              period: z.string(),
              annual: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
        footnote: z.string().optional(),
      })
      .optional(),
    /** Community stats band. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** "How it works" join flow. */
    steps: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Member testimonials grid. */
    testimonials: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              quote: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Accordion FAQ. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark conversion CTA. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        email: z.string().optional(),
        footnote: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        columns: z
          .array(
            z.object({ title: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "The Guild"
    const nav = props.nav?.length
      ? props.nav
      : ["Benefits", "Membership", "About", "FAQ"]

    const heroEyebrow = props.hero?.eyebrow ?? "Est. 2019 — Private Collective"
    const headingBefore =
      props.hero?.headingBefore ?? "A private space for people who value "
    const heroHighlight = props.hero?.highlight ?? "depth over breadth"
    const headingAfter = props.hero?.headingAfter ?? ""
    const heroSub =
      props.hero?.subheading ??
      "The Guild is a curated membership of 500 professionals, founders, and creatives. We host intimate dinners, workshops, and retreats designed for genuine connection."
    const heroPrimary = props.hero?.primaryCta ?? "Apply for Membership"
    const heroSecondary = props.hero?.secondaryCta ?? "Explore Benefits"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "group of professionals having an engaging conversation in a modern airy loft space with large windows"
    const heroProof = props.hero?.proof?.length
      ? props.hero.proof
      : [
          { value: "487", label: "Members" },
          { value: "12", label: "Cities Worldwide" },
        ]
    const heroQuote =
      props.hero?.quote ??
      "The quality of conversations here is unlike anything I've found elsewhere."
    const heroQuoteAuthor =
      props.hero?.quoteAuthor ?? "— Sarah Chen, Product Lead at Stripe"

    const logosLabel = props.logos?.label ?? "Members come from"
    const logoCompanies = props.logos?.companies?.length
      ? props.logos.companies
      : ["Stripe", "Notion", "Figma", "Linear", "Vercel", "Webflow"]

    const benefitsEyebrow = props.benefits?.eyebrow ?? "Member Benefits"
    const benefitsHeading =
      props.benefits?.heading ??
      "Everything you need to connect, grow, and thrive"
    const benefitsDesc =
      props.benefits?.description ??
      "Membership includes access to our full ecosystem of events, spaces, and private community channels."
    const benefitItems = props.benefits?.items?.length
      ? props.benefits.items
      : [
          {
            title: "Curated Introductions",
            description:
              "Our member success team facilitates 1-on-1 introductions based on your goals, interests, and industry. Average 4 quality matches per month.",
          },
          {
            title: "Private Clubhouses",
            description:
              "Access to 8 private clubhouses across NYC, SF, London, Berlin, and Tokyo. Open 7am–10pm daily with meeting rooms, lounges, and cafés.",
          },
          {
            title: "Weekly Events",
            description:
              "50+ events monthly: founder dinners, skill-sharing workshops, wellness mornings, and member-led sessions. Members can also host their own.",
          },
          {
            title: "Global Retreats",
            description:
              "Quarterly 3-day retreats in locations like Joshua Tree, Tulum, and Lisbon. Includes accommodation, programming, and meals. 40–60 members per retreat.",
          },
          {
            title: "Resource Library",
            description:
              "Exclusive templates, playbooks, and guides contributed by members. Covering fundraising, hiring, design systems, and operations.",
          },
          {
            title: "Private Community",
            description:
              "Active Slack workspace with channels for advice, hiring, housing, creative collaboration, and city-specific coordination. 95% daily active rate.",
          },
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? "Glimpses Inside"
    const galleryHeading =
      props.gallery?.heading ?? "Moments from recent gatherings"
    const galleryImages = props.gallery?.images?.length
      ? props.gallery.images
      : [
          "members socializing at an outdoor rooftop dinner with string lights at dusk",
          "professionals collaborating in a modern coworking lounge with large windows",
          "speaker presenting at a fireside chat in an intimate venue",
          "members enjoying breakfast together at a long wooden table",
          "members networking in a minimalist clubhouse interior",
          "retreat attendees practicing yoga outdoors in the morning",
          "members listening intently at a panel discussion",
          "evening cocktail reception in a garden courtyard with ambient lighting",
        ]

    const pricingEyebrow = props.pricing?.eyebrow ?? "Membership Tiers"
    const pricingHeading = props.pricing?.heading ?? "Choose your level of access"
    const pricingDesc =
      props.pricing?.description ??
      "All memberships include our core benefits. Annual billing saves 20%."
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Contributor",
            blurb: "For individuals exploring the community",
            price: "$149",
            period: "/month",
            annual: "or $1,428/year (save $360)",
            features: [
              "Access to 1 clubhouse city of your choice",
              "2 curated introductions per month",
              "4 events per month",
              "Slack community access",
              "Resource library access",
            ],
            cta: "Apply Now",
          },
          {
            name: "Member",
            blurb: "For committed community builders",
            price: "$299",
            period: "/month",
            annual: "or $2,868/year (save $720)",
            features: [
              "Access to all 8 global clubhouses",
              "Unlimited curated introductions",
              "Unlimited events",
              "Priority retreat registration",
              "Host your own events (2/year)",
              "Member success concierge",
            ],
            cta: "Apply Now",
            featured: true,
            badge: "Most Popular",
          },
          {
            name: "Patron",
            blurb: "For leaders shaping the community",
            price: "$899",
            period: "/month",
            annual: "or $8,628/year (save $1,800)",
            features: [
              "Everything in Member, plus:",
              "Private office in any clubhouse",
              "Free retreat access (all 4/year)",
              "Host unlimited events",
              "Advisory board eligibility",
              "Guest passes (4/month)",
            ],
            cta: "Apply Now",
          },
        ]
    const pricingFootnote =
      props.pricing?.footnote ??
      "All applications reviewed within 48 hours. Full refund within 14 days if not satisfied."

    const statItems = props.stats?.length
      ? props.stats
      : [
          { value: "487", label: "Active Members" },
          { value: "8", label: "Global Clubhouses" },
          { value: "50+", label: "Events Per Month" },
          { value: "94%", label: "Annual Retention" },
        ]

    const stepsEyebrow = props.steps?.eyebrow ?? "How It Works"
    const stepsHeading = props.steps?.heading ?? "Joining The Guild"
    const stepsDesc =
      props.steps?.description ??
      "A simple process designed to ensure the right fit for everyone."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Apply Online",
            description:
              "Complete a 10-minute application sharing your background, interests, and what you're seeking in a community.",
          },
          {
            title: "Interview",
            description:
              "A casual 20-minute video call with our membership team to learn more about you and answer your questions.",
          },
          {
            title: "Get Matched",
            description:
              "If accepted, you'll receive your onboarding within 24 hours, including your first 3 curated member introductions.",
          },
        ]

    const testimonialsEyebrow =
      props.testimonials?.eyebrow ?? "Member Stories"
    const testimonialsHeading =
      props.testimonials?.heading ?? "What members are saying"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            name: "Sarah Chen",
            role: "Product Lead, Stripe",
            quote:
              "The Guild fundamentally changed how I think about professional relationships. I've made deeper connections here in 6 months than in 6 years of traditional networking.",
            avatarAlt:
              "professional headshot of a smiling woman with brown hair",
          },
          {
            name: "Marcus Johnson",
            role: "Founder, Blueprint Labs",
            quote:
              "I joined during a lonely founder phase. The retreats gave me clarity, the dinners gave me perspective, and the introductions gave me my co-founder.",
            avatarAlt:
              "professional headshot of a man with short dark hair and glasses",
          },
          {
            name: "Elena Voss",
            role: "Design Director, Figma",
            quote:
              "As someone who moved to a new city for work, The Guild became my instant community. The clubhouses feel like a second home now.",
            avatarAlt:
              "professional headshot of a woman with blonde hair smiling warmly",
          },
          {
            name: "David Park",
            role: "Engineering Manager, Linear",
            quote:
              "The quality of people here is remarkable. Every conversation teaches me something. It's become my primary source of learning outside of work.",
            avatarAlt:
              "professional headshot of a man with a beard wearing a casual shirt",
          },
          {
            name: "Amara Okafor",
            role: "Investor, Sequoia",
            quote:
              "I've sourced three investments through Guild connections. But more importantly, I've found genuine friendships with people who understand the journey.",
            avatarAlt:
              "professional headshot of a woman with curly dark hair and natural makeup",
          },
          {
            name: "James Mitchell",
            role: "Author & Consultant",
            quote:
              "After 20 years of corporate life, I found my tribe here. The Guild values wisdom and curiosity over titles—refreshing and rare.",
            avatarAlt:
              "professional headshot of a man with short gray hair and a friendly expression",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "Questions & Answers"
    const faqHeading = props.faq?.heading ?? "Frequently Asked"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "Who is The Guild for?",
            a: "The Guild is for professionals, founders, creatives, and leaders who value meaningful connection over transactional networking. Our members typically have 5+ years of experience and are looking for a community that prioritizes depth, learning, and genuine relationships.",
          },
          {
            q: "What's the acceptance rate?",
            a: "We accept approximately 40% of applicants. We're not looking for specific titles or companies— we're looking for curious, generous people who will contribute to the community. If you're not accepted, you can reapply in 6 months.",
          },
          {
            q: "Can I switch membership tiers?",
            a: "Yes, you can upgrade or downgrade your membership at any time. Changes take effect at the start of your next billing cycle. If upgrading mid-cycle, we'll prorate the difference.",
          },
          {
            q: "Do you offer corporate memberships?",
            a: "We offer corporate packages for teams of 5+. Each member gets their own individual membership with full benefits, plus team-specific introductions and private group events. Contact us for custom pricing.",
          },
          {
            q: "What cities have clubhouses?",
            a: "Current clubhouses are in New York City (SoHo), San Francisco (Mission), London (Shoreditch), Berlin (Kreuzberg), Tokyo (Shibuya), Los Angeles (Arts District), Amsterdam (Jordaan), and Mexico City (Roma Norte). New locations added based on member demand.",
          },
          {
            q: "Can I pause my membership?",
            a: "Yes, members can pause their membership for up to 3 months per year. This is perfect for extended travel, parental leave, or intense work periods. Your spot in the community is held, and you can resume whenever you're ready.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to join us?"
    const ctaDesc =
      props.cta?.description ??
      "Applications are reviewed on a rolling basis. We keep membership intentionally small to preserve the quality of connections. Join 487 members who've found their people."
    const ctaPrimary = props.cta?.primaryCta ?? "Apply for Membership"
    const ctaSecondary = props.cta?.secondaryCta ?? "Contact Us"
    const ctaFootnote =
      props.cta?.footnote ??
      "Questions? Email us at hello@theguild.club — we reply within 24 hours."

    const footerAbout =
      props.footer?.about ??
      "A private membership for people who value depth over breadth. Curated connections, intimate events, and spaces designed for genuine relationships."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Membership",
            links: [
              "Membership Tiers",
              "Benefits",
              "Gift Membership",
              "Corporate Plans",
            ],
          },
          {
            title: "Company",
            links: ["About", "Careers", "Press", "Contact"],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ?? "The Guild, Inc. All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy", "Terms", "Code of Conduct"]

    // Decorative club mark — concentric "compass" glyph mirroring the source SVG.
    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={className}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2L12 12L19 19" />
      </svg>
    )

    const Check = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 shrink-0"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const Chevron = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
        aria-hidden="true"
      >
        <path d="M19 9l-7 7-7-7" />
      </svg>
    )

    const benefitIcons: ReactNode[] = [
      // users / introductions
      <svg
        key="users"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      // building / clubhouses
      <svg
        key="building"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>,
      // calendar / events
      <svg
        key="calendar"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>,
      // globe / retreats
      <svg
        key="globe"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // book / library
      <svg
        key="book"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>,
      // chat / community
      <svg
        key="chat"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>,
    ]

    return (
      <div
        className={cn(
          "min-h-svh overflow-x-hidden bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
          <nav
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
                aria-label={`${brand} Home`}
              >
                <LogoMark className="size-8 text-foreground" />
                <span className="text-xl font-light tracking-tight text-foreground">
                  {brand}
                </span>
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
              <button
                type="button"
                onClick={() => go(heroPrimary)}
                className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Apply Now
              </button>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="w-full bg-background" aria-labelledby="hero-heading">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="space-y-8">
                  <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    {heroEyebrow}
                  </p>
                  <h1
                    id="hero-heading"
                    className="text-4xl font-light leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
                  >
                    {headingBefore}
                    <span className="font-normal">{heroHighlight}</span>
                    {headingAfter}
                  </h1>
                  <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-full border border-border bg-card px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center gap-6 pt-6 text-sm text-muted-foreground">
                    {heroProof.map((p) => (
                      <div key={p.label} className="flex items-center gap-2">
                        <span className="text-xl font-light text-foreground">
                          {p.value}
                        </span>
                        <span>{p.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <Image
                    alt={heroImageAlt}
                    w={800}
                    h={600}
                    loading="eager"
                    className="h-80 w-full rounded-xl object-cover shadow-xl lg:h-[500px]"
                  />
                  <div className="absolute -bottom-6 -left-6 hidden max-w-xs rounded-xl bg-card p-6 shadow-lg lg:block">
                    <p className="text-sm italic text-muted-foreground">
                      &ldquo;{heroQuote}&rdquo;
                    </p>
                    <p className="mt-3 text-sm font-medium text-foreground">
                      {heroQuoteAuthor}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section
            className="w-full border-y border-border bg-card"
            aria-label="Member companies"
          >
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center justify-items-center gap-8 md:grid-cols-4 lg:grid-cols-6">
                {logoCompanies.map((company, i) => (
                  <button
                    key={company}
                    type="button"
                    onClick={() => go(company)}
                    aria-label={`${company} company`}
                    className={cn(
                      "text-lg font-medium tracking-tight text-muted-foreground/70 transition-colors hover:text-foreground",
                      i >= 4 && "hidden md:block",
                    )}
                  >
                    {company}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section
            className="w-full bg-background py-20 lg:py-32"
            aria-labelledby="benefits-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-24">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {benefitsEyebrow}
                </p>
                <h2
                  id="benefits-heading"
                  className="mb-6 text-3xl font-light text-foreground sm:text-4xl"
                >
                  {benefitsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{benefitsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
                {benefitItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-border bg-card p-8 transition-colors hover:border-border/60"
                  >
                    <div className="mb-6 grid size-12 place-items-center rounded-lg bg-muted text-foreground">
                      {benefitIcons[i % benefitIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-medium text-card-foreground">
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

          {/* Gallery */}
          <section
            className="w-full bg-card py-20 lg:py-32"
            aria-label="Photo gallery of events and spaces"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 max-w-3xl lg:mb-16">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {galleryEyebrow}
                </p>
                <h2 className="text-3xl font-light text-foreground sm:text-4xl">
                  {galleryHeading}
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
                {galleryImages.map((alt, i) => (
                  <Image
                    key={alt}
                    alt={alt}
                    w={400}
                    h={i % 2 === 0 ? 500 : 300}
                    loading="lazy"
                    className={cn(
                      "w-full rounded-lg object-cover",
                      i % 2 === 0
                        ? "h-64 lg:h-80"
                        : "h-48 lg:h-56",
                    )}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section
            className="w-full bg-background py-20 lg:py-32"
            aria-labelledby="pricing-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-24">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {pricingEyebrow}
                </p>
                <h2
                  id="pricing-heading"
                  className="mb-6 text-3xl font-light text-foreground sm:text-4xl"
                >
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3 lg:gap-12">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative flex flex-col rounded-xl border p-8 lg:p-10",
                      tier.featured
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card",
                    )}
                  >
                    {tier.badge ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                          {tier.badge}
                        </span>
                      </div>
                    ) : null}
                    <div className="mb-6">
                      <h3
                        className={cn(
                          "mb-2 text-lg font-medium",
                          tier.featured
                            ? "text-primary-foreground"
                            : "text-card-foreground",
                        )}
                      >
                        {tier.name}
                      </h3>
                      <p
                        className={cn(
                          "mb-4 text-sm",
                          tier.featured
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {tier.blurb}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={cn(
                            "text-4xl font-light",
                            tier.featured
                              ? "text-primary-foreground"
                              : "text-foreground",
                          )}
                        >
                          {tier.price}
                        </span>
                        <span
                          className={cn(
                            tier.featured
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground",
                          )}
                        >
                          {tier.period}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "mt-1 text-sm",
                          tier.featured
                            ? "text-primary-foreground/60"
                            : "text-muted-foreground",
                        )}
                      >
                        {tier.annual}
                      </p>
                    </div>
                    <ul className="mb-8 flex-grow space-y-4">
                      {tier.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-3"
                        >
                          <span
                            className={cn(
                              tier.featured
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground",
                            )}
                          >
                            <Check />
                          </span>
                          <span
                            className={cn(
                              "text-sm",
                              tier.featured
                                ? "text-primary-foreground/90"
                                : "text-muted-foreground",
                            )}
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(`${tier.name} ${tier.cta}`)}
                      aria-label={`Apply for ${tier.name} membership`}
                      className={cn(
                        "w-full rounded-full px-6 py-3 text-sm font-medium transition-colors",
                        tier.featured
                          ? "bg-background text-foreground hover:bg-muted"
                          : "border border-border bg-card text-foreground hover:bg-muted",
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

          {/* Stats */}
          <section
            className="w-full border-y border-border bg-card py-16 lg:py-24"
            aria-label="Community statistics"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="mb-2 text-4xl font-light text-foreground lg:text-5xl">
                      {s.value}
                    </p>
                    <p className="text-sm uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section
            className="w-full bg-background py-20 lg:py-32"
            aria-labelledby="steps-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-24">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {stepsEyebrow}
                </p>
                <h2
                  id="steps-heading"
                  className="mb-6 text-3xl font-light text-foreground sm:text-4xl"
                >
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3 lg:gap-16">
                {stepItems.map((step, i) => (
                  <div
                    key={step.title}
                    className="text-center md:text-left"
                  >
                    <div className="mx-auto mb-6 grid size-12 place-items-center rounded-full bg-primary text-lg font-medium text-primary-foreground md:mx-0">
                      {i + 1}
                    </div>
                    <h3 className="mb-3 text-xl font-medium text-foreground">
                      {step.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            className="w-full bg-card py-20 lg:py-32"
            aria-labelledby="testimonials-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-24">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {testimonialsEyebrow}
                </p>
                <h2
                  id="testimonials-heading"
                  className="mb-6 text-3xl font-light text-foreground sm:text-4xl"
                >
                  {testimonialsHeading}
                </h2>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-xl bg-muted p-8"
                  >
                    <div className="mb-6 flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-14 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                    <p className="italic leading-relaxed text-muted-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section
            className="w-full bg-background py-20 lg:py-32"
            aria-labelledby="faq-heading"
          >
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {faqEyebrow}
                </p>
                <h2
                  id="faq-heading"
                  className="mb-6 text-3xl font-light text-foreground sm:text-4xl"
                >
                  {faqHeading}
                </h2>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-lg border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="font-medium text-card-foreground">
                        {item.q}
                      </span>
                      <Chevron />
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section
            className="w-full bg-primary py-20 text-primary-foreground lg:py-32"
            aria-labelledby="cta-heading"
          >
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2
                id="cta-heading"
                className="mb-6 text-3xl font-light text-primary-foreground sm:text-4xl lg:text-5xl"
              >
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-foreground/80">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center rounded-full bg-background px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center rounded-full border border-primary-foreground/40 px-8 py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-8 text-sm text-primary-foreground/60">
                {ctaFootnote}
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer
          className="w-full border-t border-border bg-muted"
          role="contentinfo"
        >
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-4">
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                  aria-label={`${brand} Home`}
                >
                  <LogoMark className="size-8 text-foreground" />
                  <span className="text-xl font-light tracking-tight text-foreground">
                    {brand}
                  </span>
                </button>
                <p className="max-w-sm leading-relaxed text-muted-foreground">
                  {footerAbout}
                </p>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 text-sm font-medium uppercase tracking-wider text-foreground">
                    {col.title}
                  </h4>
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
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {footerCopyright}
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
