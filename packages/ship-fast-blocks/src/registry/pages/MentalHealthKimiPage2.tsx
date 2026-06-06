import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * MentalHealthKimiPage2 — a complete therapy / counseling / mental-health practice
 * LANDING page. A faithful Tailwind v4 port of a Kimi-generated "WholeMind Therapy"
 * design (Austin, TX). This is the SECOND, visually DISTINCT style sibling to
 * MentalHealthKimiPage: where that one is a calm sage-and-sand split-hero layout, this
 * variant is brighter and more energetic — a teal→cyan brand gradient on a light/white
 * canvas, a "now accepting new clients" pulse badge, a portrait hero with TWO floating
 * cards (next-available + 4.9 star rating), an early stats band, soft rounded cards with
 * tinted multi-color icon tiles, a vertical numbered "how it works" flow beside a photo
 * with a wait-time card, and an image-top clinician gallery.
 *
 * Sections: sticky navbar, gradient hero with availability badge + dual floating cards,
 * certifications/insurance trust strip, a 4-up stats band, a 6-up services grid
 * (individual, couples, trauma/EMDR, anxiety, teen, virtual) with colored icon tiles, a
 * split 4-step "how it works" flow with photo + wait-time card, a 4-up clinician team
 * gallery, and a multi-column footer. The block owns ALL layout, spacing, gradients and
 * type hierarchy. Every nav item / CTA / phone / link routes through `useNavigate`
 * (never a dead "#"). All imagery uses the alt-driven <Image> component (never a raw
 * src). Callers supply ONLY content; rich defaults make it render great with no props.
 */
export const MentalHealthKimiPage2 = defineComponent({
  name: "MentalHealthKimiPage2",
  description:
    "Complete therapy, counseling and mental-health practice LANDING page — the SECOND, visually DISTINCT alternative style to MentalHealthKimiPage. Brighter and more energetic: a teal-to-cyan brand gradient on a light/white canvas, a 'now accepting new clients' pulse badge, a portrait hero photo with two floating cards (next-available appointment + 4.9 star rating), an early 4-up stats band, soft rounded service cards with tinted multi-color icon tiles, a vertical numbered 'how it works' flow beside a calming office photo with an average-wait-time card, and an image-top 4-up clinician team gallery with credentials. Includes sticky navbar with phone + book CTA, a certifications/insurance trust strip (APA, state board, EMDR, CAMFT, Aetna, BlueCross), services grid (individual, couples, trauma/EMDR, anxiety management, teen counseling, virtual telehealth) and a multi-column footer. Use as the ROOT/home page for therapists, counselors, psychologists, psychiatrists, mental-health clinics, wellness centers, telehealth or behavioral-health practices when a fresh, uplifting, trust-building, conversion-focused page is wanted and a more clinical sage variant (MentalHealthKimiPage) does not fit. Supply content only — brand, nav, hero, logos, stats, services, steps, team, footer; the block owns all layout and styling.",
  props: z.object({
    /** Practice / brand name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingTop: z.string().optional(),
        /** Phrase rendered in the brand gradient. */
        highlight: z.string().optional(),
        headingBottom: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        availableTitle: z.string().optional(),
        availableValue: z.string().optional(),
        rating: z.string().optional(),
        ratingCount: z.string().optional(),
        phone: z.string().optional(),
      })
      .optional(),
    /** Certifications / insurance trust strip. */
    logos: z
      .object({
        title: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Services grid. */
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
              meta: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** "How it works" steps flow. */
    steps: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        imageAlt: z.string().optional(),
        cardTitle: z.string().optional(),
        cardValue: z.string().optional(),
      })
      .optional(),
    /** Clinician team gallery. */
    team: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        members: z
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
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        servicesTitle: z.string().optional(),
        servicesLinks: z.array(z.string()).optional(),
        companyTitle: z.string().optional(),
        companyLinks: z.array(z.string()).optional(),
        contactTitle: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        hours: z.string().optional(),
        copyright: z.string().optional(),
        license: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "WholeMind"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Our Approach", "Team", "Pricing", "FAQ", "Book Session"]
    const bookLabel = nav[nav.length - 1] ?? "Book Session"

    const heroBadge = props.hero?.badge ?? "Now accepting new clients"
    const headingTop = props.hero?.headingTop ?? "Find your"
    const heroHighlight = props.hero?.highlight ?? "balance"
    const headingBottom = props.hero?.headingBottom ?? "begin your healing"
    const heroSub =
      props.hero?.subheading ??
      "Expert therapy services in Austin, Texas. Compassionate care for anxiety, depression, trauma, relationships, and personal growth. In-person and virtual sessions available."
    const heroPrimary = props.hero?.primaryCta ?? "Schedule Your Session"
    const heroSecondary = props.hero?.secondaryCta ?? "Explore Services"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Professional female therapist in a calm modern office with plants and soft natural lighting"
    const availableTitle = props.hero?.availableTitle ?? "Next Available"
    const availableValue = props.hero?.availableValue ?? "Today, 2:00 PM"
    const heroRating = props.hero?.rating ?? "4.9"
    const heroRatingCount = props.hero?.ratingCount ?? "(127 reviews)"
    const heroPhone = props.hero?.phone ?? "(512) 555-0147"

    const logosTitle =
      props.logos?.title ?? "Trusted certifications & partnerships"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : [
          "APA Member",
          "Texas State Board",
          "EMDR Certified",
          "CAMFT",
          "Aetna Provider",
          "BlueCross",
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "12+", label: "Years Experience" },
          { value: "3,200+", label: "Clients Helped" },
          { value: "8", label: "Licensed Therapists" },
          { value: "94%", label: "Client Satisfaction" },
        ]

    const servicesEyebrow = props.services?.eyebrow ?? "Our Services"
    const servicesHeading =
      props.services?.heading ?? "Comprehensive therapy for every journey"
    const servicesDesc =
      props.services?.description ??
      "Evidence-based treatments tailored to your unique needs. We combine proven methodologies with compassionate care to help you thrive."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: "Individual Therapy",
            description:
              "One-on-one sessions focused on your personal growth. Address anxiety, depression, life transitions, and self-discovery in a safe, confidential space.",
            meta: "50 min • $150-180",
          },
          {
            title: "Couples Therapy",
            description:
              "Strengthen your relationship with Gottman-informed techniques. Improve communication, rebuild trust, and rediscover connection with your partner.",
            meta: "80 min • $225",
          },
          {
            title: "Trauma Treatment",
            description:
              "EMDR and trauma-focused therapy to process past experiences. Find relief from PTSD, childhood trauma, and painful memories with expert guidance.",
            meta: "50-90 min • $170-240",
          },
          {
            title: "Anxiety Management",
            description:
              "CBT and mindfulness-based approaches to reduce worry and panic. Learn practical tools for managing stress and living with greater ease.",
            meta: "50 min • $150",
          },
          {
            title: "Teen Counseling",
            description:
              "Specialized support for adolescents aged 13-18. Address school stress, social challenges, identity questions, and family dynamics.",
            meta: "50 min • $140",
          },
          {
            title: "Virtual Sessions",
            description:
              "Secure telehealth from the comfort of home. HIPAA-compliant video therapy available for all Texas residents with evening and weekend slots.",
            meta: "50 min • $150",
          },
        ]

    const stepsEyebrow = props.steps?.eyebrow ?? "How It Works"
    const stepsHeading =
      props.steps?.heading ?? "Your journey to wellness starts here"
    const stepsDesc =
      props.steps?.description ??
      "We've designed a simple, supportive process to help you get the care you need without stress or confusion."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Schedule a Free Consultation",
            description:
              "Book a complimentary 15-minute phone call. We'll discuss your needs, answer questions, and match you with the right therapist.",
          },
          {
            title: "Complete Intake Forms",
            description:
              "Fill out our secure online forms at your convenience. Share your history, goals, and preferences before your first session.",
          },
          {
            title: "Begin Your Sessions",
            description:
              "Meet your therapist in our Austin office or via secure video. Start building the skills and insights for lasting change.",
          },
          {
            title: "Grow and Thrive",
            description:
              "Track your progress, adjust goals as needed, and develop lifelong tools for emotional wellbeing.",
          },
        ]
    const stepsImageAlt =
      props.steps?.imageAlt ??
      "Peaceful therapy office with comfortable seating, natural plants, and soft ambient lighting"
    const stepsCardTitle = props.steps?.cardTitle ?? "Average Wait Time"
    const stepsCardValue = props.steps?.cardValue ?? "3-5 Days"

    const teamEyebrow = props.team?.eyebrow ?? "Our Team"
    const teamHeading = props.team?.heading ?? "Meet your therapists"
    const teamDesc =
      props.team?.description ??
      "Licensed professionals with diverse specialties and a shared passion for helping you heal."
    const teamMembers = props.team?.members?.length
      ? props.team.members
      : [
          {
            name: "Dr. Sarah Chen",
            role: "Licensed Psychologist",
            bio: "PhD in Clinical Psychology. Specializes in trauma, EMDR, and anxiety disorders. 15 years experience.",
            imageAlt:
              "Professional headshot of Dr. Sarah Chen, a warm smiling therapist with shoulder-length dark hair",
          },
          {
            name: "Marcus Williams",
            role: "LCSW, Couples Therapist",
            bio: "Gottman Method Level 3 certified. Focuses on relationships, communication, and intimacy issues.",
            imageAlt:
              "Professional headshot of Marcus Williams, a friendly male therapist with a beard and warm smile",
          },
          {
            name: "Elena Rodriguez",
            role: "LPC, Teen Specialist",
            bio: "Specializes in adolescent mental health, family therapy, and school-related challenges. Bilingual (English/Spanish).",
            imageAlt:
              "Professional headshot of Elena Rodriguez, a therapist with curly hair and a welcoming expression",
          },
          {
            name: "Dr. James Park",
            role: "MD, Psychiatrist",
            bio: "Board-certified psychiatrist. Medication management, depression, bipolar disorder, and integrative approaches.",
            imageAlt:
              "Professional headshot of Dr. James Park, a psychiatrist with glasses and a calm professional demeanor",
          },
        ]

    const footerAbout =
      props.footer?.about ??
      "Compassionate, evidence-based mental health care in Austin, Texas. Licensed therapists for individuals, couples, teens, and families — in-person and virtual."
    const footerServicesTitle = props.footer?.servicesTitle ?? "Services"
    const footerServicesLinks = props.footer?.servicesLinks?.length
      ? props.footer.servicesLinks
      : [
          "Individual Therapy",
          "Couples Therapy",
          "Trauma Treatment",
          "Teen Counseling",
          "Virtual Sessions",
        ]
    const footerCompanyTitle = props.footer?.companyTitle ?? "Company"
    const footerCompanyLinks = props.footer?.companyLinks?.length
      ? props.footer.companyLinks
      : ["About Us", "Our Team", "Careers", "Blog", "Privacy Policy"]
    const footerContactTitle = props.footer?.contactTitle ?? "Contact"
    const footerAddress =
      props.footer?.address ?? "2200 S Lamar Blvd, Austin, TX 78704"
    const footerPhone = props.footer?.phone ?? "(512) 555-0147"
    const footerEmail = props.footer?.email ?? "hello@wholemindtherapy.com"
    const footerHours = props.footer?.hours ?? "Mon-Fri: 8am - 7pm"
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Therapy, PLLC. All rights reserved.`
    const footerLicense =
      props.footer?.license ?? "Licensed in Texas • HIPAA Compliant"

    // Brand mark — two-tone heart (decorative inline SVG, fixed brand asset analog).
    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    )

    const Phone = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    // Tinted icon tiles rotate through token surfaces for visual variety.
    const serviceTints = [
      "bg-primary/10 text-primary",
      "bg-accent/10 text-accent-foreground",
      "bg-destructive/10 text-destructive",
      "bg-secondary text-secondary-foreground",
      "bg-chart-4/15 text-chart-4",
      "bg-chart-2/15 text-chart-2",
    ]

    const serviceIcons: ReactNode[] = [
      // individual
      <svg
        key="person"
        className="size-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>,
      // couples
      <svg
        key="couples"
        className="size-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>,
      // trauma (heart)
      <svg
        key="heart"
        className="size-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>,
      // anxiety (clock)
      <svg
        key="clock"
        className="size-7"
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
      </svg>,
      // teen (globe)
      <svg
        key="globe"
        className="size-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 019-9m-9 9a9 9 0 01-9-9m9-9a9 9 0 019 9m-9-9a9 9 0 00-9 9"
        />
      </svg>,
      // virtual (video)
      <svg
        key="video"
        className="size-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>,
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  <LogoMark className="size-5" />
                </span>
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-xl font-bold text-transparent">
                  {brand}
                </span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
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
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => go(bookLabel)}
                  className="hidden items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary sm:flex"
                >
                  <Phone className="size-4" />
                  <span>{heroPhone}</span>
                </button>
                <button
                  type="button"
                  onClick={() => go(bookLabel)}
                  className="rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-shadow hover:shadow-lg hover:shadow-primary/25"
                >
                  {bookLabel}
                </button>
                <button
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v: boolean) => !v)}
                  className="p-2 text-muted-foreground md:hidden"
                >
                  <svg
                    className="size-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
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
              </div>
            )}
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden pb-20 pt-16 lg:pb-28 lg:pt-24">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10"
            />
            <div
              aria-hidden="true"
              className="absolute right-0 top-20 h-1/2 w-1/2 rounded-full bg-gradient-to-bl from-primary/20 to-transparent blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-0 h-1/3 w-1/3 rounded-full bg-gradient-to-tr from-accent/20 to-transparent blur-3xl"
            />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-sm">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-primary" />
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {heroBadge}
                    </span>
                  </div>
                  <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                    {headingTop}{" "}
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {heroHighlight}
                    </span>
                    <br />
                    {headingBottom}
                  </h1>
                  <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl lg:mx-0">
                    {heroSub}
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(bookLabel)}
                      className="rounded-full bg-gradient-to-r from-primary to-accent px-8 py-4 text-center text-lg font-bold text-primary-foreground transition-shadow hover:shadow-xl hover:shadow-primary/30"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="rounded-full border-2 border-border bg-background px-8 py-4 text-center text-lg font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
                    {["Licensed Therapists", "Insurance Accepted", "Same-Week Appointments"].map(
                      (t) => (
                        <div key={t} className="flex items-center gap-2">
                          <Check className="size-5 text-primary" />
                          <span>{t}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
                <div className="relative">
                  <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                    <Image
                      alt={heroImageAlt}
                      w={800}
                      h={1000}
                      loading="eager"
                      className="h-auto w-full object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 rounded-2xl bg-card p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="grid size-12 place-items-center rounded-full bg-primary/10">
                        <svg
                          className="size-6 text-primary"
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
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {availableTitle}
                        </p>
                        <p className="font-bold text-card-foreground">
                          {availableValue}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-4 -top-4 rounded-2xl bg-card p-4 shadow-xl">
                    <div className="flex items-center gap-1">
                      <Star className="size-5 text-primary" />
                      <span className="font-bold text-card-foreground">
                        {heroRating}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {heroRatingCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Certifications / logos */}
          <section className="border-y border-border bg-muted/50 py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {logosTitle}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-70 lg:gap-16">
                {logoItems.map((logo) => (
                  <div
                    key={logo}
                    className="flex items-center gap-2 font-semibold text-muted-foreground"
                  >
                    <svg
                      className="size-8"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <span>{logo}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-background py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="bg-gradient-to-r from-primary to-accent bg-clip-text text-4xl font-bold text-transparent lg:text-5xl">
                      {s.value}
                    </p>
                    <p className="mt-2 font-medium text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="bg-muted/50 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {servicesEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {servicesHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{servicesDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {serviceItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-border bg-card p-8 shadow-sm transition-all hover:border-primary/30 hover:shadow-xl"
                  >
                    <div
                      className={cn(
                        "mb-6 grid size-14 place-items-center rounded-2xl",
                        serviceTints[i % serviceTints.length],
                      )}
                    >
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 text-muted-foreground">
                      {item.description}
                    </p>
                    <p className="text-sm text-muted-foreground/80">
                      {item.meta}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How it works / Approach */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div>
                  <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                    {stepsEyebrow}
                  </span>
                  <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                    {stepsHeading}
                  </h2>
                  <p className="mb-10 text-lg text-muted-foreground">
                    {stepsDesc}
                  </p>
                  <div className="space-y-8">
                    {stepItems.map((step, i) => (
                      <div key={step.title} className="flex gap-5">
                        <div className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent font-bold text-primary-foreground">
                          {i + 1}
                        </div>
                        <div>
                          <h3 className="mb-2 text-xl font-bold text-foreground">
                            {step.title}
                          </h3>
                          <p className="text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 rotate-3 rounded-3xl bg-gradient-to-tr from-primary/30 to-accent/30"
                  />
                  <Image
                    alt={stepsImageAlt}
                    w={600}
                    h={750}
                    loading="lazy"
                    className="relative h-auto w-full rounded-3xl object-cover shadow-2xl"
                  />
                  <div className="absolute -bottom-8 -right-8 rounded-2xl bg-card p-6 shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="grid size-14 place-items-center rounded-full bg-primary/10">
                        <Check className="size-7 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-card-foreground">
                          {stepsCardTitle}
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {stepsCardValue}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Team */}
          <section className="bg-muted/50 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {teamEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {teamHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{teamDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {teamMembers.map((m) => (
                  <div
                    key={m.name}
                    className="overflow-hidden rounded-2xl bg-card shadow-sm transition-shadow hover:shadow-xl"
                  >
                    <div className="aspect-[3/4] overflow-hidden">
                      <Image
                        alt={m.imageAlt}
                        w={400}
                        h={533}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-card-foreground">
                        {m.name}
                      </h3>
                      <p className="mb-2 font-medium text-primary">{m.role}</p>
                      <p className="text-sm text-muted-foreground">{m.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    <LogoMark className="size-5" />
                  </span>
                  <span className="text-xl font-bold text-background">
                    {brand}
                  </span>
                </div>
                <p className="mb-6 text-sm leading-relaxed">{footerAbout}</p>
                <div className="flex gap-4">
                  {(["Facebook", "Instagram", "LinkedIn"] as const).map(
                    (social) => (
                      <button
                        key={social}
                        type="button"
                        aria-label={social}
                        onClick={() => go(social)}
                        className="grid size-10 place-items-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
                      >
                        <span className="text-xs font-semibold">
                          {social.charAt(0)}
                        </span>
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div>
                <h4 className="mb-4 font-semibold text-background">
                  {footerServicesTitle}
                </h4>
                <ul className="space-y-3 text-sm">
                  {footerServicesLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go("Services")}
                        className="transition-colors hover:text-background"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-4 font-semibold text-background">
                  {footerCompanyTitle}
                </h4>
                <ul className="space-y-3 text-sm">
                  {footerCompanyLinks.map((link) => (
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

              <div>
                <h4 className="mb-4 font-semibold text-background">
                  {footerContactTitle}
                </h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 size-5 shrink-0 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>{footerAddress}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="size-5 shrink-0 text-primary" />
                    <button
                      type="button"
                      onClick={() => go(bookLabel)}
                      className="transition-colors hover:text-background"
                    >
                      {footerPhone}
                    </button>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      className="size-5 shrink-0 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <button
                      type="button"
                      onClick={() => go(bookLabel)}
                      className="transition-colors hover:text-background"
                    >
                      {footerEmail}
                    </button>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      className="size-5 shrink-0 text-primary"
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
                    <span>{footerHours}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 text-sm md:flex-row">
              <p>{footerCopyright}</p>
              <p>{footerLicense}</p>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
