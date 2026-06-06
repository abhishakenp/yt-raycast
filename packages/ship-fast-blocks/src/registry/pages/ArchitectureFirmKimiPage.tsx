import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * ArchitectureFirmKimiPage — a complete, self-contained architecture-studio
 * LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Atelier Móði" design: a
 * calm, editorial, Scandinavian-minimalist aesthetic on a warm light canvas
 * with light typographic weights, generous whitespace, wide letter-spaced
 * eyebrow labels and quiet monochrome contrast. It pairs a split hero
 * (eyebrow + serene headline + dual CTAs with a full-height facade photo) with
 * a "featured in" publication strip, a 6-up portrait project gallery with
 * image-zoom hover, a split philosophy section (three approach points + a
 * floating "years of practice" stat over a studio photo), an inverted dark
 * stats band, a 3-step numbered process, a 3-up testimonials grid with client
 * portraits, a split studio/about section with founding partners, an
 * accordion-free FAQ list, a centered contact CTA and a four-column footer.
 *
 * The block owns ALL layout, spacing, type hierarchy and the warm/inverted
 * surface contrast. Every nav item / CTA / footer link / social routes through
 * `useNavigate` (never a dead "#"), and navbar labels match the `nav` array so
 * PageSwitch can swap pages. All content imagery uses the alt-driven <Image>
 * component (never a raw src). Callers supply ONLY content data; rich defaults
 * make it render great with no props at all.
 */
export const ArchitectureFirmKimiPage = defineComponent({
  name: "ArchitectureFirmKimiPage",
  description:
    "Complete architecture-firm / design-studio LANDING page with a calm, editorial, Scandinavian-minimalist aesthetic: warm light canvas, light type weights, wide letter-spaced eyebrow labels, generous whitespace and quiet monochrome contrast. Includes a split hero (eyebrow, serene headline, dual CTAs, full-height facade photo), a 'featured in' publication strip, a 6-up portrait project/portfolio gallery with image-zoom hover and location/year captions, a split philosophy/approach section (icon points plus a floating years-of-practice stat over a studio photo), an inverted dark statistics band, a 3-step numbered process, a 3-up client testimonials grid with portraits, a split studio/about section with founding partners, a FAQ list, a centered contact CTA and a four-column footer with address and social links. Use as the ROOT/home page for architecture firms, architecture studios, design practices, interior-design studios, urban planners, landscape architects, building/construction design or built-environment portfolio sites when an understated, premium, project-forward page with strong work showcase and social proof is wanted. Supply content only — brand, nav, hero, logos, gallery, philosophy, stats, process, testimonials, studio, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Studio / firm name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        /** Heading lines rendered stacked. */
        headingLine1: z.string().optional(),
        headingLine2: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** "Featured in" publication strip. */
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Selected-work / project gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              meta: z.string(),
              location: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Philosophy / approach section. */
    philosophy: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        points: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        imageAlt: z.string().optional(),
        statValue: z.string().optional(),
        statLabel: z.string().optional(),
      })
      .optional(),
    /** Inverted statistics band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Numbered process steps. */
    process: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        steps: z
          .array(z.object({ title: z.string(), description: z.string() }))
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
    /** Studio / about section. */
    studio: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        body1: z.string().optional(),
        body2: z.string().optional(),
        imageAlt: z.string().optional(),
        people: z
          .array(z.object({ name: z.string(), role: z.string() }))
          .optional(),
      })
      .optional(),
    /** FAQ list. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Centered contact CTA. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        button: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        contactLabel: z.string().optional(),
        address: z.array(z.string()).optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        studioLabel: z.string().optional(),
        studioLinks: z.array(z.string()).optional(),
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
    const brand = props.brand ?? "Atelier Móði"
    const nav = props.nav?.length
      ? props.nav
      : ["Work", "Philosophy", "Studio", "Contact"]

    const heroEyebrow =
      props.hero?.eyebrow ?? "Architecture Studio — Copenhagen"
    const heroLine1 = props.hero?.headingLine1 ?? "Spaces that breathe,"
    const heroLine2 = props.hero?.headingLine2 ?? "structures that endure"
    const heroSub =
      props.hero?.subheading ??
      "Atelier Móði creates architecture rooted in place, informed by climate, and designed for the way people actually live. From intimate residential renovations to cultural institutions, we build with intention."
    const heroPrimary = props.hero?.primaryCta ?? "View Projects"
    const heroSecondary = props.hero?.secondaryCta ?? "Our Philosophy"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Minimalist modern building facade with clean geometric lines and natural stone cladding"

    const logosLabel = props.logos?.label ?? "Featured in"
    const logosItems = props.logos?.items?.length
      ? props.logos.items
      : [
          "Dezeen",
          "ArchDaily",
          "Dwell",
          "Wallpaper*",
          "Monocle",
          "Architectural Digest",
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? "Selected Work"
    const galleryHeading = props.gallery?.heading ?? "Projects"
    const galleryDesc =
      props.gallery?.description ??
      "A selection of completed and ongoing work spanning residential, commercial, and cultural typologies across Northern Europe."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Villa Kyst",
            meta: "Residential — 2023",
            location: "Århus, DK",
            imageAlt:
              "Minimalist coastal villa with floor-to-ceiling glass windows overlooking the ocean at golden hour",
          },
          {
            title: "Nordic Contemporary",
            meta: "Cultural — 2022",
            location: "Oslo, NO",
            imageAlt:
              "Contemporary art museum interior with dramatic spiral staircase and skylight illumination",
          },
          {
            title: "Tårnby Housing",
            meta: "Multi-family — 2021",
            location: "Copenhagen, DK",
            imageAlt:
              "Modern apartment complex with warm wood cladding and balconies integrated into the facade",
          },
          {
            title: "Fjord Headquarters",
            meta: "Commercial — 2023",
            location: "Bergen, NO",
            imageAlt:
              "Minimalist office workspace with natural wood finishes and abundant daylight through large windows",
          },
          {
            title: "Pakhus 47",
            meta: "Adaptive Reuse — 2020",
            location: "Aalborg, DK",
            imageAlt:
              "Restored historic warehouse converted to residential lofts with preserved brickwork and modern interventions",
          },
          {
            title: "Hotel Sanders",
            meta: "Hospitality — 2019",
            location: "Copenhagen, DK",
            imageAlt:
              "Elegant boutique hotel lobby with terrazzo floors and sculptural wooden reception desk",
          },
        ]

    const philEyebrow = props.philosophy?.eyebrow ?? "Our Approach"
    const philHeading =
      props.philosophy?.heading ??
      "Architecture as a conversation between place and purpose"
    const philPoints = props.philosophy?.points?.length
      ? props.philosophy.points
      : [
          {
            title: "Contextual Sensitivity",
            description:
              "Every site tells a story. We listen to the landscape, the neighborhood's rhythm, and the existing built environment before drawing a single line. Our buildings respond to their place rather than imposing upon it.",
          },
          {
            title: "Daylight & Material",
            description:
              "Natural light is our primary material. We choreograph how daylight moves through spaces across seasons, pairing this with honest materials that age gracefully—stone, wood, steel, and glass selected for longevity.",
          },
          {
            title: "Human-Centered Design",
            description:
              "Buildings exist for people. We design for the subtle rituals of daily life—the quality of morning light in a kitchen, the acoustics of conversation, the threshold between public and private.",
          },
        ]
    const philImageAlt =
      props.philosophy?.imageAlt ??
      "Architectural model on work table showing building massing study with natural lighting"
    const philStatValue = props.philosophy?.statValue ?? "12"
    const philStatLabel = props.philosophy?.statLabel ?? "Years of practice"

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "47", label: "Completed Projects" },
          { value: "12", label: "Design Awards" },
          { value: "8", label: "Countries" },
          { value: "14", label: "Team Members" },
        ]

    const processEyebrow = props.process?.eyebrow ?? "How We Work"
    const processHeading = props.process?.heading ?? "Our Process"
    const processSteps = props.process?.steps?.length
      ? props.process.steps
      : [
          {
            title: "Discovery & Strategy",
            description:
              "We begin with deep listening—understanding your needs, the site's constraints and opportunities, and the broader context. This phase includes site analysis, programming, and establishing project goals.",
          },
          {
            title: "Design Development",
            description:
              "Through iterative exploration, we develop concepts into refined solutions. Physical models, detailed drawings, and material studies help us perfect every detail before construction begins.",
          },
          {
            title: "Realization",
            description:
              "We maintain involvement through construction, conducting site reviews and collaborating closely with builders to ensure the built work matches the design intent.",
          },
        ]

    const testEyebrow = props.testimonials?.eyebrow ?? "Client Words"
    const testHeading = props.testimonials?.heading ?? "Testimonials"
    const testItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Atelier Móði transformed our brief into something beyond what we imagined. They understood not just what we asked for, but how we actually live. The light in our home changes beautifully throughout the day.",
            name: "Elena Rasmussen",
            role: "Homeowner, Villa Kyst",
            avatarAlt:
              "Professional headshot of a smiling woman with shoulder-length brown hair",
          },
          {
            quote:
              "Working with Atelier Móði on our headquarters was exceptional. Their attention to acoustic detail and daylight created an office where people genuinely want to work. Productivity increased 23% after the move.",
            name: "Magnus Lindström",
            role: "CEO, Fjord Technologies",
            avatarAlt:
              "Professional headshot of a man with short dark hair and a navy blazer",
          },
          {
            quote:
              "The adaptive reuse of our warehouse exceeded every expectation. They preserved the building's soul while making it perfectly functional for modern living. Our tenants consistently mention the quality of space.",
            name: "Johan Petersen",
            role: "Developer, Pakhus 47",
            avatarAlt:
              "Professional headshot of a man with gray hair and glasses wearing a dark sweater",
          },
        ]

    const studioEyebrow = props.studio?.eyebrow ?? "The Studio"
    const studioHeading =
      props.studio?.heading ?? "A practice built on collaboration"
    const studioBody1 =
      props.studio?.body1 ??
      "Founded in 2012 by partners Solvej Madsen and Erik Bjørnsson, Atelier Móði began as a small workshop in Copenhagen's Nordhavn district. Today, we're a team of fourteen architects, interior designers, and model makers united by a commitment to craft."
    const studioBody2 =
      props.studio?.body2 ??
      "Our studio operates as a collective—every project benefits from multiple perspectives. We build physical models for every design, believing that material and scale reveal truths that screens cannot."
    const studioImageAlt =
      props.studio?.imageAlt ??
      "Bright architecture studio workspace with large desks, physical building models, and floor-to-ceiling windows"
    const studioPeople = props.studio?.people?.length
      ? props.studio.people
      : [
          { name: "Solvej Madsen", role: "Founding Partner" },
          { name: "Erik Bjørnsson", role: "Founding Partner" },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "Common Questions"
    const faqHeading = props.faq?.heading ?? "FAQ"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What types of projects do you take on?",
            answer:
              "We work across residential, commercial, cultural, and hospitality projects. Scale ranges from intimate interior renovations to multi-building developments. We're particularly drawn to projects where we can create meaningful, lasting impact—whether that's a family home or a public institution.",
          },
          {
            question: "What is your typical project timeline?",
            answer:
              "A single-family residence typically takes 12-18 months from initial concept to completion. Larger commercial or cultural projects may span 2-4 years. We provide detailed timelines during our initial consultation, tailored to your specific project scope.",
          },
          {
            question: "Do you work internationally?",
            answer:
              "While our studio is based in Copenhagen, we actively work across Northern Europe and occasionally beyond. We've completed projects in Norway, Sweden, Germany, and the UK. We're licensed to practice throughout the EU.",
          },
          {
            question: "How do you approach sustainability?",
            answer:
              "Sustainability is embedded in our process, not added on. We prioritize passive design strategies—orientation, natural ventilation, thermal mass—before adding technology. We specify materials with low embodied carbon and design for longevity, creating buildings that will last centuries, not decades.",
          },
          {
            question: "What are your fees?",
            answer:
              "Our fees are typically structured as a percentage of construction cost, ranging from 8-12% depending on project complexity. For smaller projects or specific design services, we can work on hourly rates or fixed fees. We're transparent about costs from our first meeting.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? "Ready to build something meaningful?"
    const ctaDesc =
      props.cta?.description ??
      "Whether you're envisioning a new home, transforming an existing space, or developing a larger project, we'd love to hear from you."
    const ctaButton = props.cta?.button ?? "Start a Conversation"

    const footerAbout =
      props.footer?.about ??
      "Creating thoughtful, sustainable architecture that honors context and human experience since 2012."
    const footerContactLabel = props.footer?.contactLabel ?? "Contact"
    const footerAddress = props.footer?.address?.length
      ? props.footer.address
      : ["Strandgade 27, 4th Floor", "1401 Copenhagen, Denmark"]
    const footerEmail = props.footer?.email ?? "hello@atelier-modi.dk"
    const footerPhone = props.footer?.phone ?? "+45 33 12 45 78"
    const footerStudioLabel = props.footer?.studioLabel ?? "Studio"
    const footerStudioLinks = props.footer?.studioLinks?.length
      ? props.footer.studioLinks
      : ["Projects", "Philosophy", "About", "Careers"]
    const footerConnectLabel = props.footer?.connectLabel ?? "Connect"
    const footerConnectLinks = props.footer?.connectLinks?.length
      ? props.footer.connectLinks
      : ["Instagram", "LinkedIn", "Pinterest", "Newsletter"]
    const footerCopyright =
      props.footer?.copyright ?? "All rights reserved."
    const footerLegalLinks = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ["Privacy Policy", "Cookie Settings"]

    // Philosophy approach-point icons (decorative; tint via currentColor token).
    const philIcons: ReactNode[] = [
      // share / network (contextual sensitivity)
      <svg
        key="context"
        className="size-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
        />
      </svg>,
      // sun (daylight & material)
      <svg
        key="daylight"
        className="size-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>,
      // heart (human-centered design)
      <svg
        key="human"
        className="size-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>,
    ]

    const QuoteMark = () => (
      <svg
        className="mb-4 size-8 text-muted-foreground/40"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
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
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav
            aria-label="Main navigation"
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          >
            <div className="flex h-20 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="text-xl font-light tracking-tight text-foreground"
              >
                {brand}
              </button>
              <div className="hidden items-center space-x-8 md:flex">
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
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v) => !v)}
                className="p-2 md:hidden"
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
                    strokeWidth="1.5"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
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
              </div>
            )}
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section
            aria-labelledby="hero-heading"
            className="relative flex min-h-[70vh] items-center"
          >
            <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
              <div className="max-w-3xl">
                <p className="mb-6 text-sm uppercase tracking-widest text-muted-foreground">
                  {heroEyebrow}
                </p>
                <h1
                  id="hero-heading"
                  className="mb-8 text-4xl font-light leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
                >
                  {heroLine1}
                  <br />
                  {heroLine2}
                </h1>
                <p className="mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  {heroSub}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {heroPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground/40"
                  >
                    {heroSecondary}
                  </button>
                </div>
              </div>
            </div>
            <div className="absolute right-0 top-0 hidden h-full w-2/5 lg:block">
              <Image
                alt={heroImageAlt}
                w={1200}
                h={1600}
                loading="eager"
                className="size-full object-cover"
              />
            </div>
          </section>

          {/* Featured in */}
          <section
            aria-label="Featured publications"
            className="border-y border-border bg-card py-16"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-10 text-center text-xs uppercase tracking-widest text-muted-foreground">
                {logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60">
                {logosItems.map((item) => (
                  <span
                    key={item}
                    className="text-lg font-light text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery / Projects */}
          <section
            aria-labelledby="work-heading"
            className="py-24 lg:py-32"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
                    {galleryEyebrow}
                  </p>
                  <h2
                    id="work-heading"
                    className="text-3xl font-light text-foreground sm:text-4xl"
                  >
                    {galleryHeading}
                  </h2>
                </div>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground md:mt-0">
                  {galleryDesc}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((proj) => (
                  <button
                    key={proj.title}
                    type="button"
                    onClick={() => go(proj.title)}
                    className="group block w-full text-left"
                  >
                    <div className="mb-5 aspect-[4/5] overflow-hidden bg-muted">
                      <Image
                        alt={proj.imageAlt}
                        w={800}
                        h={1000}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-foreground">
                          {proj.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {proj.meta}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {proj.location}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Philosophy / Approach */}
          <section
            aria-labelledby="philosophy-heading"
            className="bg-card py-24 lg:py-32"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24">
                <div>
                  <p className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">
                    {philEyebrow}
                  </p>
                  <h2
                    id="philosophy-heading"
                    className="mb-8 text-3xl font-light text-foreground sm:text-4xl"
                  >
                    {philHeading}
                  </h2>

                  <div className="space-y-8">
                    {philPoints.map((point, i) => (
                      <div key={point.title} className="flex gap-5">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                          {philIcons[i % philIcons.length]}
                        </div>
                        <div>
                          <h3 className="mb-2 text-lg font-medium text-foreground">
                            {point.title}
                          </h3>
                          <p className="leading-relaxed text-muted-foreground">
                            {point.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <Image
                    alt={philImageAlt}
                    w={800}
                    h={1000}
                    loading="lazy"
                    className="h-auto w-full object-cover"
                  />
                  <div className="absolute -bottom-8 -left-8 hidden bg-background p-6 shadow-lg sm:block">
                    <p className="text-3xl font-light text-foreground">
                      {philStatValue}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {philStatLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats band (inverted) */}
          <section
            aria-label="Studio statistics"
            className="bg-foreground py-20 text-background"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 text-4xl font-light sm:text-5xl">
                      {s.value}
                    </p>
                    <p className="text-sm text-background/70">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Process steps */}
          <section
            aria-labelledby="process-heading"
            className="py-24 lg:py-32"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
                  {processEyebrow}
                </p>
                <h2
                  id="process-heading"
                  className="text-3xl font-light text-foreground sm:text-4xl"
                >
                  {processHeading}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
                {processSteps.map((step, i) => (
                  <div key={step.title} className="relative">
                    <span className="absolute -left-2 -top-4 select-none text-7xl font-light text-muted-foreground/30">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="relative pt-8">
                      <h3 className="mb-3 text-lg font-medium text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            aria-labelledby="testimonials-heading"
            className="bg-card py-24 lg:py-32"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
                  {testEyebrow}
                </p>
                <h2
                  id="testimonials-heading"
                  className="text-3xl font-light text-foreground sm:text-4xl"
                >
                  {testHeading}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testItems.map((t) => (
                  <blockquote key={t.name} className="bg-muted p-8">
                    <QuoteMark />
                    <p className="mb-6 leading-relaxed text-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <footer className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* Studio / About */}
          <section
            aria-labelledby="studio-heading"
            className="py-24 lg:py-32"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
                <div className="order-2 lg:order-1">
                  <Image
                    alt={studioImageAlt}
                    w={900}
                    h={700}
                    loading="lazy"
                    className="h-auto w-full object-cover"
                  />
                </div>
                <div className="order-1 lg:order-2">
                  <p className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">
                    {studioEyebrow}
                  </p>
                  <h2
                    id="studio-heading"
                    className="mb-6 text-3xl font-light text-foreground sm:text-4xl"
                  >
                    {studioHeading}
                  </h2>
                  <p className="mb-6 leading-relaxed text-muted-foreground">
                    {studioBody1}
                  </p>
                  <p className="mb-8 leading-relaxed text-muted-foreground">
                    {studioBody2}
                  </p>

                  <div className="grid grid-cols-2 gap-6 border-t border-border pt-6">
                    {studioPeople.map((person) => (
                      <div key={person.name}>
                        <p className="font-medium text-foreground">
                          {person.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {person.role}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section aria-labelledby="faq-heading" className="bg-card py-24 lg:py-32">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
                  {faqEyebrow}
                </p>
                <h2
                  id="faq-heading"
                  className="text-3xl font-light text-foreground sm:text-4xl"
                >
                  {faqHeading}
                </h2>
              </div>

              <dl className="space-y-6">
                {faqItems.map((item) => (
                  <div
                    key={item.question}
                    className="border-b border-border pb-6"
                  >
                    <dt className="mb-2 text-lg font-medium text-foreground">
                      {item.question}
                    </dt>
                    <dd className="leading-relaxed text-muted-foreground">
                      {item.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          {/* CTA */}
          <section aria-labelledby="cta-heading" className="py-24 lg:py-32">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2
                id="cta-heading"
                className="mb-6 text-3xl font-light text-foreground sm:text-4xl lg:text-5xl"
              >
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
                {ctaDesc}
              </p>
              <button
                type="button"
                onClick={() => go(ctaButton)}
                className="inline-flex items-center bg-primary px-8 py-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {ctaButton}
              </button>
            </div>
          </section>
        </main>

        {/* Footer (inverted) */}
        <footer
          aria-label="Footer"
          className="bg-foreground py-16 text-background"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="mb-4 text-xl font-light">{brand}</p>
                <p className="text-sm leading-relaxed text-background/70">
                  {footerAbout}
                </p>
              </div>

              <div>
                <p className="mb-4 text-sm font-medium uppercase tracking-wider text-background/60">
                  {footerContactLabel}
                </p>
                <address className="space-y-1 text-sm not-italic leading-relaxed text-background/70">
                  {footerAddress.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  <p className="mt-3">
                    <button
                      type="button"
                      onClick={() => go(footerEmail)}
                      className="transition-colors hover:text-background"
                    >
                      {footerEmail}
                    </button>
                  </p>
                  <p>{footerPhone}</p>
                </address>
              </div>

              <div>
                <p className="mb-4 text-sm font-medium uppercase tracking-wider text-background/60">
                  {footerStudioLabel}
                </p>
                <ul className="space-y-2 text-sm text-background/70">
                  {footerStudioLinks.map((link) => (
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
                <p className="mb-4 text-sm font-medium uppercase tracking-wider text-background/60">
                  {footerConnectLabel}
                </p>
                <ul className="space-y-2 text-sm text-background/70">
                  {footerConnectLinks.map((link) => (
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
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 sm:flex-row">
              <p className="text-xs text-background/60">
                © {new Date().getFullYear()} {brand}. {footerCopyright}
              </p>
              <div className="flex gap-6 text-xs text-background/60">
                {footerLegalLinks.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="transition-colors hover:text-background/90"
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
