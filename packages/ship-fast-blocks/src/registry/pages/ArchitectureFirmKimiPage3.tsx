import { useState } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * ArchitectureFirmKimiPage3 — a complete, self-contained architecture-studio
 * LANDING page (variant 3: dark cinematic brutalist mood).
 *
 * A faithful Tailwind v4 token port of a Kimi-generated "Monolith Studio" design:
 * a deep, shadowy, warm-dark aesthetic with heavy stone backgrounds, warm amber
 * accent glows, elegant serif headings, monumental layout rhythm and ambient
 * decorative blur orbs. It pairs a split hero with eyebrow label + massive
 * serif headline + dual CTAs and a full-height brutalist building photo,
 * a "trusted by" minimalist logo strip, a three-card philosophy section with
 * warm-tinted map/cube/building icons, a four-step numbered process band on a
 * subtle mid-tone background, a 6-up masonry-style project gallery with zoom
 * hover and category badges, three transparent pricing tiers with a highlighted
 * "Most Popular" option, a bordered stats ribbon, a 3-up testimonial grid with
 * client portraits, an accordion FAQ list, a centered contact CTA with dual studio
 * address cards, and a four-column footer.
 *
 * Third style sibling to ArchitectureFirmKimiPage — choose this variant when a
 * dramatic dark cinematic brutalist mood with warm amber brand accents and
 * premium editorial type is preferred over the lighter Scandinavian-minimal
 * sibling. Supply content only — brand, nav, hero, logos, philosophy, process,
 * gallery, pricing, stats, testimonials, faq, contact, footer; the block owns all
 * layout, spacing, glow effects and typography.
 */
export const ArchitectureFirmKimiPage3 = defineComponent({
  name: "ArchitectureFirmKimiPage3",
  description:
    "Complete architecture-firm / design-studio LANDING page (variant 3) rendered in a dark cinematic brutalist mood: deep shadowy backgrounds, warm amber accent glows and highlights, monumental serif typography, generous whitespace with heavy contrast, and ambient decorative blur orbs. Includes a sticky navbar with solid dark backdrop, a split hero with eyebrow label and massive serif headline over a full-height brutalist facade photo, a trusted-by minimalist logo strip, a three-card philosophy section with warm-tinted inline icons, a four-step numbered process, a 6-up masonry project gallery with category badges and image-zoom hover, three transparent pricing tiers with a highlighted Most Popular option, an inverted bordered stats ribbon, a 3-up client testimonial grid with portraits, an accordion FAQ list, a centered contact CTA with dual studio address cards, and a four-column footer. Use as the ROOT/home page for architecture firms, architecture studios, design practices, interior-design studios, urban planners, landscape architects, building/construction design or built-environment portfolio sites when a dramatic dark premium editorial aesthetic with warm amber accents is wanted. Third style sibling to ArchitectureFirmKimiPage — richer and moodier than the light Scandinavian-minimal sibling. Supply content only — brand, nav, hero, logos, philosophy, process, gallery, pricing, stats, testimonials, faq, contact, footer; the block owns all layout and styling.",
  props: z.object({
    /** Studio / firm name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** "Trusted by" logo / publication strip. */
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Philosophy / approach section (three icon cards). */
    philosophy: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        points: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              iconPath: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** 4-step numbered process. */
    process: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        steps: z
          .array(
            z.object({ title: z.string(), description: z.string() }),
          )
          .optional(),
      })
      .optional(),
    /** Selected-work / project gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        ctaLabel: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              category: z.string(),
              location: z.string(),
              year: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Pricing / engagement models. */
    pricing: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              price: z.string(),
              description: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              highlighted: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Statistics ribbon. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Client testimonials grid. */
    testimonials: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
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
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(
            z.object({ question: z.string(), answer: z.string() }),
          )
          .optional(),
      })
      .optional(),
    /** Contact / CTA section. */
    contact: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        email: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        nyLabel: z.string().optional(),
        nyPhone: z.string().optional(),
        nyAddress: z.array(z.string()).optional(),
        cphLabel: z.string().optional(),
        cphPhone: z.string().optional(),
        cphAddress: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        studioLabel: z.string().optional(),
        studioLinks: z.array(z.string()).optional(),
        servicesLabel: z.string().optional(),
        servicesLinks: z.array(z.string()).optional(),
        connectLabel: z.string().optional(),
        connectLinks: z.array(z.string()).optional(),
        copyright: z.string().optional(),
        legalLinks: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)

    const brand = props.brand ?? "Monolith"
    const nav = props.nav?.length ? props.nav : ["Projects", "Philosophy", "Studio", "Contact"]

    // HERO
    const heroEyebrow = props.hero?.eyebrow ?? "Est. 2008 — Brooklyn & Copenhagen"
    const heroHeading = props.hero?.heading ?? "Architecture in its most honest form."
    const heroSub =
      props.hero?.subheading ??
      "We design buildings that listen to their sites. Through material research and spatial precision, Monolith Studio creates structures that feel inevitable—rooted, quiet, and enduring."
    const heroPrimary = props.hero?.primaryCta ?? "View Projects"
    const heroSecondary = props.hero?.secondaryCta ?? "Our Philosophy"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Dramatic upward view of a monumental brutalist concrete building with repeating geometric windows against a grey sky"

    // LOGOS
    const logosLabel = props.logos?.label ?? "Trusted by visionary clients"
    const logosItems = props.logos?.items?.length
      ? props.logos.items
      : ["AESIR", "HELIOS", "TERRA GROUP", "NORDISKA", "MET ARTS"]

    // PHILOSOPHY
    const philHeading = props.philosophy?.heading ?? "Our Philosophy"
    const philSub =
      props.philosophy?.subheading ??
      "We believe architecture should arise from obligation—to the client, the site, and the future occupant. Our work is disciplined, restrained, and deeply contextual."
    const philPoints = props.philosophy?.points?.length
      ? props.philosophy.points
      : [
          {
            title: "Contextual Design",
            description:
              "Every site has a story. We begin by listening to the land, the light, and the legacy of a place before drawing a single line. The result is architecture that belongs exactly where it stands.",
            iconPath:
              "M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z",
          },
          {
            title: "Material Honesty",
            description:
              "Concrete, timber, glass, and stone used as nature intended. We specify finishes that age with dignity—gaining patina, not losing purpose—so buildings grow more beautiful over decades.",
            iconPath:
              "m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9",
          },
          {
            title: "Sustainable Futures",
            description:
              "Net-zero ready structures, passive ventilation, and carbon-conscious sourcing are not upgrades—they are baseline. We design buildings that respect the climate they inhabit.",
            iconPath:
              "M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z",
          },
        ]

    // PROCESS
    const processHeading = props.process?.heading ?? "Our Process"
    const processSub =
      props.process?.subheading ??
      "A clear methodology keeps complex projects on track. From first sketch to final walkthrough, we manage every phase with transparency and rigor."
    const processSteps = props.process?.steps?.length
      ? props.process.steps
      : [
          {
            title: "Discover",
            description:
              "Site analysis, zoning review, and client workshops. We map constraints and opportunities before committing to a direction.",
          },
          {
            title: "Define",
            description:
              "Concept sketches, spatial programming, and budget alignment. We establish a clear vision that guides every subsequent decision.",
          },
          {
            title: "Develop",
            description:
              "Technical drawings, material samples, and three-dimensional visualization. We refine every joint, junction, and surface.",
          },
          {
            title: "Deliver",
            description:
              "Construction administration, weekly site visits, and final commissioning. We ensure the built reality matches the design intent.",
          },
        ]

    // GALLERY
    const galleryHeading = props.gallery?.heading ?? "Selected Works"
    const galleryDesc =
      props.gallery?.description ??
      "A cross-section of residential, cultural, and commercial projects from the past five years."
    const galleryCta = props.gallery?.ctaLabel ?? "View Archive"
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Cairn House",
            category: "Residential",
            location: "Portland, Maine",
            year: "2023",
            imageAlt:
              "Exterior view of a modern concrete residence with large glass panels surrounded by mature pine trees",
          },
          {
            title: "Void Gallery",
            category: "Cultural",
            location: "Berlin, Germany",
            year: "2022",
            imageAlt:
              "Sweeping interior atrium of a contemporary art museum with curved white staircases and dramatic skylights",
          },
          {
            title: "Harbor Loft",
            category: "Commercial",
            location: "Copenhagen, Denmark",
            year: "2024",
            imageAlt:
              "Bright open-plan commercial loft with exposed brick walls, industrial steel beams, and wide factory windows",
          },
          {
            title: "Terra Pavilion",
            category: "Civic",
            location: "Scottsdale, Arizona",
            year: "2021",
            imageAlt:
              "Arizona desert modern pavilion with rammed earth walls and deep overhangs blending into the arid landscape",
          },
          {
            title: "Nordic Chapel",
            category: "Religious",
            location: "Tromsø, Norway",
            year: "2023",
            imageAlt:
              "Minimalist wooden chapel interior with warm natural light streaming through tall clerestory windows",
          },
          {
            title: "Urban Stack",
            category: "Mixed-Use",
            location: "Tokyo, Japan",
            year: "2020",
            imageAlt:
              "Night view of a dense cluster of modern illuminated glass high-rise towers in central Tokyo",
          },
        ]

    // PRICING
    const pricingHeading = props.pricing?.heading ?? "Engagement Models"
    const pricingSub =
      props.pricing?.subheading ??
      "Transparent pricing for distinct scopes of work. Every tier includes direct principal involvement and weekly progress reviews."
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Design Consultation",
            price: "$2,500",
            description: "Flat fee, delivered in 10 business days",
            features: [
              "Single site visit and measure",
              "Zoning and feasibility report",
              "Conceptual massing sketches",
              "Preliminary budget estimate",
            ],
            cta: "Book Consultation",
            highlighted: false,
          },
          {
            name: "Residential Design",
            price: "$45,000",
            description: "Starting price for custom homes",
            features: [
              "Schematic design through CDs",
              "Interior material palette",
              "3D visualization & renderings",
              "Bidding & contractor selection",
              "Construction administration",
            ],
            cta: "Start Your Home",
            highlighted: true,
          },
          {
            name: "Commercial Masterplan",
            price: "$120,000",
            description: "Starting price, scaled to GSF",
            features: [
              "Full architectural services",
              "Landscape & site integration",
              "Sustainability certification support",
              "Stakeholder presentation deck",
            ],
            cta: "Discuss Project",
            highlighted: false,
          },
        ]

    // STATS
    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "16", label: "Years in Practice" },
          { value: "140", label: "Completed Projects" },
          { value: "28", label: "Design Awards" },
          { value: "4.2M", label: "Sq Ft Delivered" },
        ]

    // TESTIMONIALS
    const testHeading = props.testimonials?.heading ?? "Client Perspectives"
    const testItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Monolith delivered the Nordhavn mixed-use complex two weeks ahead of schedule. Their attention to daylighting strategy transformed the retail experience and cut our projected energy load by thirty percent.",
            name: "Elena Rostova",
            role: "Principal, Aesir Developments",
            avatarAlt:
              "Professional headshot of Elena Rostova, a real estate developer with dark hair and a confident smile",
          },
          {
            quote:
              "They turned a narrow nineteenth-century brownstone into a light-filled sanctuary. Every material choice was explained with such care—we felt like genuine collaborators rather than bystanders.",
            name: "Marcus Chen",
            role: "Private Client, Brooklyn NY",
            avatarAlt:
              "Professional headshot of Marcus Chen, a tech executive wearing a navy sweater and smiling warmly",
          },
          {
            quote:
              "The pavilion extension respects the original Brutalist structure while adding a warmth we didn't think concrete could possess. Visitor dwell time has doubled since reopening.",
            name: "Dr. Sarah Okafor",
            role: "Director, Terra Museum",
            avatarAlt:
              "Professional headshot of Dr. Sarah Okafor, a museum director wearing glasses with natural curly hair",
          },
        ]

    // FAQ
    const faqHeading = props.faq?.heading ?? "Common Questions"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What is your typical project timeline?",
            answer:
              "Residential projects span 12–18 months from concept to completion. Commercial developments typically require 24–36 months depending on scale, zoning complexity, and regulatory approvals.",
          },
          {
            question: "Do you work internationally?",
            answer:
              "Yes. While our studios are in Brooklyn and Copenhagen, we currently have active projects in Germany, Japan, and the western United States. We partner with local architects of record where licensing requires.",
          },
          {
            question: "How do you handle sustainability targets?",
            answer:
              "Every project begins with a climate analysis. We target Passive House certification where feasible and specify low-carbon concrete, FSC timber, and regenerative landscape practices as standard, not upgrades.",
          },
          {
            question: "What does your fee structure include?",
            answer:
              "Our fees cover schematic design, design development, construction documents, bidding support, and construction administration. Interior material palettes and 3D visualization are included in our Residential and Commercial tiers.",
          },
          {
            question: "Can you renovate or extend an existing building?",
            answer:
              "Absolutely. Adaptive reuse is a cornerstone of our practice. We specialize in reading the existing fabric and inserting contemporary interventions that honor the history of the original structure.",
          },
        ]

    // CONTACT
    const contactHeading = props.contact?.heading ?? "Begin with a conversation."
    const contactSub =
      props.contact?.subheading ??
      "Tell us about your site, your timeline, and your ambitions. We review every inquiry personally and respond within two business days."
    const contactEmail = props.contact?.email ?? "hello@monolith.studio"
    const contactPrimary = props.contact?.primaryCta ?? "Email Us"
    const contactSecondary = props.contact?.secondaryCta ?? "Download Portfolio (PDF)"
    const nyLabel = props.contact?.nyLabel ?? "New York Studio"
    const nyPhone = props.contact?.nyPhone ?? "+1 (718) 555-0142"
    const nyAddress = props.contact?.nyAddress?.length
      ? props.contact.nyAddress
      : ["47 North 3rd Street", "Brooklyn, NY 11249"]
    const cphLabel = props.contact?.cphLabel ?? "Copenhagen Studio"
    const cphPhone = props.contact?.cphPhone ?? "+45 32 55 89 01"
    const cphAddress = props.contact?.cphAddress?.length
      ? props.contact.cphAddress
      : ["Store Strandstræde 21", "1255 København"]

    // FOOTER
    const footerAbout =
      props.footer?.about ??
      "Architecture rooted in material honesty and spatial precision. Brooklyn & Copenhagen."
    const footerStudioLabel = props.footer?.studioLabel ?? "Studio"
    const footerStudioLinks = props.footer?.studioLinks?.length
      ? props.footer.studioLinks
      : ["About", "Team", "Careers", "Press"]
    const footerServicesLabel = props.footer?.servicesLabel ?? "Services"
    const footerServicesLinks = props.footer?.servicesLinks?.length
      ? props.footer.servicesLinks
      : ["Residential", "Commercial", "Cultural", "Consultation"]
    const footerConnectLabel = props.footer?.connectLabel ?? "Connect"
    const footerConnectLinks = props.footer?.connectLinks?.length
      ? props.footer.connectLinks
      : ["Instagram", "LinkedIn", "Journal", "Newsletter"]
    const footerCopyright =
      props.footer?.copyright ?? "© 2024 Monolith Studio. All rights reserved."
    const footerLegalLinks = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ["Privacy Policy", "Terms of Service"]

    const CheckIcon = () => (
      <svg
        className="h-5 w-5 shrink-0 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    )

    const ChevronIcon = () => (
      <svg
        className="h-5 w-5 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    )

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <nav
            aria-label="Main navigation"
            className="mx-auto max-w-7xl px-6 py-5 lg:px-8"
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="text-lg font-semibold tracking-widest text-foreground uppercase"
              >
                {brand}
              </button>
              <div className="hidden md:flex items-center gap-8">
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
                <button
                  type="button"
                  onClick={() => go("Start a Project")}
                  className="rounded-full border border-input bg-card px-5 py-2 text-sm font-medium text-foreground hover:border-primary/50 hover:bg-muted transition-all"
                >
                  Start a Project
                </button>
              </div>
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v) => !v)}
                className="p-2 text-foreground md:hidden"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </button>
            </div>
            {mobileOpen && (
              <div
                id="mobile-menu"
                className="mt-4 border-t border-border pt-4 space-y-4 md:hidden"
              >
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setMobileOpen(false)
                      go(label)
                    }}
                    className="block w-full text-left text-base font-medium text-muted-foreground hover:text-foreground"
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
          <section className="relative overflow-hidden">
            <div className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px] lg:right-20" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-muted/20 blur-[120px]" />
            <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-40">
              <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                <div>
                  <p className="mb-6 text-sm font-medium uppercase tracking-widest text-primary">
                    {heroEyebrow}
                  </p>
                  <h1 className="font-serif text-5xl font-medium leading-[1.1] text-foreground md:text-6xl lg:text-7xl">
                    {heroHeading}
                  </h1>
                  <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                    {heroSub}
                  </p>
                  <div className="mt-10 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/80 transition-colors"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="rounded-full border border-input px-8 py-3.5 text-sm font-semibold text-foreground hover:border-foreground/40 transition-colors"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                </div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl lg:aspect-square lg:rounded-2xl">
                  <Image
                    alt={heroImageAlt}
                    w={1200}
                    h={900}
                    loading="eager"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-background/30 to-transparent" />
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border bg-card py-12">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <p className="mb-8 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 md:gap-x-16">
                {logosItems.map((item) => (
                  <span
                    key={item}
                    className="text-sm font-semibold tracking-widest text-muted-foreground/60 uppercase"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Philosophy */}
          <section className="relative bg-background py-24 md:py-32">
            <div className="pointer-events-none absolute top-20 left-0 h-[400px] w-[400px] rounded-full bg-muted/20 blur-[100px]" />
            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
              <div className="max-w-2xl mb-16 md:mb-20">
                <h2 className="font-serif text-4xl font-medium text-foreground md:text-5xl">
                  {philHeading}
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                  {philSub}
                </p>
              </div>
              <div className="grid gap-12 md:grid-cols-3">
                {philPoints.map((point) => (
                  <article
                    key={point.title}
                    className="relative rounded-2xl border border-border bg-card/50 p-8 backdrop-blur-sm"
                  >
                    <div className="mb-6 inline-flex rounded-lg bg-muted p-3 text-primary">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={point.iconPath ?? ""}
                        />
                      </svg>
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">
                      {point.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {point.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Process */}
          <section className="bg-muted/30 py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="max-w-2xl mb-16 md:mb-20">
                <h2 className="font-serif text-4xl font-medium text-foreground md:text-5xl">
                  {processHeading}
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                  {processSub}
                </p>
              </div>
              <div className="grid gap-10 md:grid-cols-4">
                {processSteps.map((step, i) => (
                  <div key={step.title}>
                    <span className="font-serif text-5xl font-medium text-muted-foreground/30">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="relative bg-background py-24 md:py-32">
            <div className="pointer-events-none absolute -bottom-40 right-20 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="font-serif text-4xl font-medium text-foreground md:text-5xl">
                    {galleryHeading}
                  </h2>
                  <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                    {galleryDesc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => go(galleryCta)}
                  className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  {galleryCta} <span aria-hidden="true">→</span>
                </button>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((proj) => (
                  <button
                    key={proj.title}
                    type="button"
                    onClick={() => go(proj.title)}
                    className="group block w-full text-left"
                  >
                    <figure className="overflow-hidden rounded-xl bg-card">
                      <div className="aspect-[4/3] overflow-hidden">
                        <Image
                          alt={proj.imageAlt}
                          w={800}
                          h={600}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <figcaption className="p-6">
                        <span className="text-xs font-medium uppercase tracking-widest text-primary">
                          {proj.category}
                        </span>
                        <h3 className="mt-1 text-xl font-semibold text-foreground">
                          {proj.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {proj.location} — {proj.year}
                        </p>
                      </figcaption>
                    </figure>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-background py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="max-w-2xl mb-16 md:mb-20">
                <h2 className="font-serif text-4xl font-medium text-foreground md:text-5xl">
                  {pricingHeading}
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                  {pricingSub}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative rounded-2xl border p-8",
                      tier.highlighted
                        ? "border-primary/20 bg-card shadow-lg"
                        : "border-border bg-card/40",
                    )}
                  >
                    {tier.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                        Most Popular
                      </div>
                    )}
                    <h3
                      className={cn(
                        "text-sm font-semibold uppercase tracking-widest",
                        tier.highlighted ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {tier.name}
                    </h3>
                    <p className="mt-4 font-serif text-4xl font-medium text-foreground">
                      {tier.price}
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-sm",
                        tier.highlighted ? "text-muted-foreground" : "text-muted-foreground/60",
                      )}
                    >
                      {tier.description}
                    </p>
                    <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
                      {tier.features.map((f) => (
                        <li key={f} className="flex gap-3">
                          <CheckIcon />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className={cn(
                        "mt-8 block w-full rounded-full py-3 text-center text-sm font-semibold transition-colors",
                        tier.highlighted
                          ? "bg-primary text-primary-foreground hover:bg-primary/80"
                          : "border border-input text-foreground hover:border-foreground/40",
                      )}
                    >
                      {tier.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="border-y border-border bg-card py-16 md:py-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-y-10 text-center md:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <p className="font-serif text-4xl font-medium text-foreground md:text-5xl">
                      {s.value}
                    </p>
                    <p className="mt-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-background py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <h2 className="max-w-2xl font-serif text-4xl font-medium text-foreground md:text-5xl">
                {testHeading}
              </h2>
              <div className="mt-16 grid gap-8 md:grid-cols-3">
                {testItems.map((t) => (
                  <article
                    key={t.name}
                    className="rounded-2xl border border-border bg-card/40 p-8"
                  >
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {t.name}
                        </p>
                        <p className="text-xs text-muted-foreground/60">
                          {t.role}
                        </p>
                      </div>
                    </div>
                    <blockquote className="mt-6 leading-relaxed text-muted-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted/30 py-24 md:py-32">
            <div className="mx-auto max-w-3xl px-6 lg:px-8">
              <h2 className="font-serif text-4xl font-medium text-foreground md:text-5xl mb-12 md:mb-16">
                {faqHeading}
              </h2>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="rounded-xl border border-border bg-background p-6"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-foreground">
                      {item.question}
                      <ChevronIcon />
                    </summary>
                    <p className="mt-4 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Contact / CTA */}
          <section className="relative overflow-hidden bg-background py-24 md:py-32">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
            </div>
            <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
              <h2 className="font-serif text-4xl font-medium text-foreground md:text-5xl lg:text-6xl">
                {contactHeading}
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {contactSub}
              </p>

              <div className="mt-12 grid gap-8 sm:grid-cols-3 text-left">
                <div className="rounded-xl border border-border bg-card/40 p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Email
                  </p>
                  <button
                    type="button"
                    onClick={() => go(contactEmail)}
                    className="mt-2 block text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {contactEmail}
                  </button>
                </div>
                <div className="rounded-xl border border-border bg-card/40 p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {nyLabel}
                  </p>
                  <p className="mt-2 text-lg font-medium text-foreground">
                    {nyPhone}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {nyAddress.map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < nyAddress.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card/40 p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {cphLabel}
                  </p>
                  <p className="mt-2 text-lg font-medium text-foreground">
                    {cphPhone}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {cphAddress.map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < cphAddress.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                </div>
              </div>

              <div className="mt-12 flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={() => go(contactPrimary)}
                  className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/80 transition-colors"
                >
                  {contactPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(contactSecondary)}
                  className="rounded-full border border-input px-8 py-3.5 text-sm font-semibold text-foreground hover:border-foreground/40 transition-colors"
                >
                  {contactSecondary}
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-background py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-12 md:grid-cols-4">
              <div>
                <p className="text-lg font-semibold tracking-widest text-foreground uppercase">
                  {brand}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground/60">
                  {footerAbout}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  {footerStudioLabel}
                </p>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  {footerStudioLinks.map((link) => (
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
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  {footerServicesLabel}
                </p>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  {footerServicesLinks.map((link) => (
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
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  {footerConnectLabel}
                </p>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  {footerConnectLinks.map((link) => (
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
            </div>
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground/60">
                {footerCopyright}
              </p>
              <div className="flex gap-6 text-sm text-muted-foreground/60">
                {footerLegalLinks.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="transition-colors hover:text-muted-foreground"
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
