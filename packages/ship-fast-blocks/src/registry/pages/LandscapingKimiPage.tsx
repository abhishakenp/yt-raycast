import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * LandscapingKimiPage — a complete, self-contained landscaping / outdoor-design
 * marketing page. A faithful Tailwind v4 port of a Kimi-generated "Earth & Edge"
 * design: a calm, organic, premium aesthetic on a warm stone canvas with a sage
 * green primary accent, generous whitespace, rounded cards and soft shadows.
 *
 * It pairs a 2-column hero (headline + dual CTAs + star-rated social proof with
 * customer avatars + a floating "projects completed" stat card over a garden
 * photo) with a trusted-by logo strip, a 6-up services grid with line icons, a
 * 4-step "how we work" process band, a 6-image selected-projects portfolio
 * gallery with hover-reveal captions, and a 3-tier maintenance pricing section
 * (middle plan highlighted as POPULAR). A slim footer closes the page.
 *
 * The block owns ALL layout, spacing and type hierarchy and colors itself purely
 * with semantic theme tokens (sage green → primary, warm stone → background/muted,
 * amber stars → chart accents). Every nav item / CTA / footer link routes through
 * `useNavigate` (never a dead "#"), and all imagery uses the alt-driven <Image>
 * component (never a raw src). Callers supply ONLY content data; rich defaults
 * make it render great with no props at all.
 */
export const LandscapingKimiPage = defineComponent({
  name: "LandscapingKimiPage",
  description:
    "Complete landscaping, lawn-care, and outdoor-design company marketing page with a calm, organic, premium aesthetic: warm stone/cream canvas, sage-green primary accent, generous whitespace, soft rounded cards and amber star ratings. Includes a 2-column hero (headline, dual CTAs like Request Free Consultation / View Our Work, star-rated social proof with customer avatars, and a floating projects-completed stat card over a garden photo), a trusted-by neighborhood logo strip, a 6-up services grid with line icons (landscape design, installation, seasonal maintenance, hardscaping, irrigation, sustainable native gardens), a 4-step how-we-work process band (consultation, design, installation, care), a 6-image selected-projects portfolio gallery with hover-reveal location captions, and a 3-tier maintenance pricing section with a highlighted POPULAR plan. Use as the ROOT/home page for landscapers, lawn-care and yard-maintenance services, garden designers, hardscaping/patio contractors, irrigation specialists, tree and grounds-keeping companies, or any outdoor/horticulture business wanting a trustworthy, nature-forward, conversion-focused page. Supply content only — brand, nav, hero, logos, services, steps, gallery, pricing, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / company name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        rating: z.string().optional(),
        imageAlt: z.string().optional(),
        statValue: z.string().optional(),
        statLabel: z.string().optional(),
        /** Alt strings for the small customer avatars on the social-proof row. */
        avatars: z.array(z.string()).optional(),
      })
      .optional(),
    /** Trusted-by logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Services grid. */
    services: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** "How we work" process band. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Selected-projects portfolio gallery. */
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        cta: z.string().optional(),
        items: z
          .array(
            z.object({
              location: z.string(),
              title: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Maintenance pricing section. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              audience: z.string(),
              price: z.string(),
              period: z.string().optional(),
              features: z.array(z.string()),
              cta: z.string(),
              badge: z.string().optional(),
              featured: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        note: z.string().optional(),
        links: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Earth & Edge"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Portfolio", "Pricing", "About", "Get a Quote"]

    const heroHeading =
      props.hero?.heading ??
      "Transform your outdoor space into a living sanctuary"
    const heroSub =
      props.hero?.subheading ??
      "Award-winning landscape design and maintenance services for Portland homes and businesses. Over 500 completed projects since 2008. Licensed, insured, and committed to sustainable practices."
    const heroPrimary = props.hero?.primaryCta ?? "Request Free Consultation"
    const heroSecondary = props.hero?.secondaryCta ?? "View Our Work"
    const heroRating = props.hero?.rating ?? "4.9/5 from 127 reviews"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Modern landscaped garden with curved stone pathway, ornamental grasses, and native plants"
    const heroStatValue = props.hero?.statValue ?? "500+"
    const heroStatLabel = props.hero?.statLabel ?? "Projects Completed"
    const heroAvatars = props.hero?.avatars?.length
      ? props.hero.avatars
      : [
          "Headshot of a smiling male customer with short brown hair",
          "Headshot of a smiling female customer with blonde hair",
          "Headshot of a smiling older male customer with glasses",
        ]

    const logosLabel =
      props.logos?.label ?? "Trusted by leading Portland properties"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : [
          "Pearl District Condos",
          "Hawthorne Gardens",
          "Alberta Arts Lofts",
          "Sellwood Heights",
          "Laurelhurst Estates",
          "Forest Park HOA",
        ]

    const servicesHeading =
      props.services?.heading ?? "Comprehensive landscaping services"
    const servicesDesc =
      props.services?.description ??
      "From initial design to ongoing maintenance, we handle every aspect of your outdoor environment with precision and care."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: "Landscape Design",
            description:
              "Custom 3D-rendered designs tailored to your property's unique terrain, sunlight patterns, and your lifestyle needs. Includes plant selection and hardscape planning.",
          },
          {
            title: "Installation",
            description:
              "Complete project execution from soil preparation and irrigation to planting and hardscape construction. All work backed by our 2-year plant guarantee.",
          },
          {
            title: "Seasonal Maintenance",
            description:
              "Weekly or bi-weekly care including mowing, edging, pruning, fertilization, and seasonal cleanup. Flexible scheduling to match your property's needs.",
          },
          {
            title: "Hardscaping",
            description:
              "Patios, walkways, retaining walls, fire pits, and outdoor kitchens built with premium materials. Engineered for Portland's freeze-thaw cycles.",
          },
          {
            title: "Irrigation Systems",
            description:
              "Smart water-efficient irrigation design, installation, and repair. Weather-based controllers that reduce water usage by up to 40% while keeping plants healthy.",
          },
          {
            title: "Sustainable Gardens",
            description:
              "Native plant gardens, rain gardens, and pollinator habitats designed for minimal water use and maximum ecological benefit. Oregon native specialists.",
          },
        ]

    const stepsHeading = props.steps?.heading ?? "How we work"
    const stepsDesc =
      props.steps?.description ??
      "A proven process refined over 16 years and 500+ projects. Clear communication at every step."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Consultation",
            description:
              "Free 60-minute site visit. We assess your space, discuss your vision, and identify opportunities and constraints. No obligation.",
          },
          {
            title: "Design",
            description:
              "2-3 weeks to create detailed plans and 3D renderings. Two revision rounds included. Transparent pricing with no hidden fees.",
          },
          {
            title: "Installation",
            description:
              "Scheduled within 2-4 weeks of approval. Daily progress updates. Clean, respectful crews. Minimal disruption to your routine.",
          },
          {
            title: "Care",
            description:
              "Optional maintenance packages. Seasonal check-ins. 2-year plant guarantee. We're with you long after the last stone is set.",
          },
        ]

    const galleryHeading = props.gallery?.heading ?? "Selected projects"
    const galleryDesc =
      props.gallery?.description ??
      "A portfolio of residential and commercial transformations across Portland's most distinctive neighborhoods."
    const galleryCta = props.gallery?.cta ?? "Start Your Project"
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            location: "Laurelhurst Residence",
            title: "Mediterranean Courtyard",
            imageAlt:
              "Backyard patio with natural stone pavers, outdoor dining furniture, and perennial garden beds",
          },
          {
            location: "Pearl District Condo",
            title: "Urban Rooftop Garden",
            imageAlt:
              "Modern front yard with ornamental grasses, Japanese maple, and gravel pathways",
          },
          {
            location: "Lake Oswego Estate",
            title: "Formal English Garden",
            imageAlt:
              "Lush green lawn with curved garden beds filled with hydrangeas and hostas",
          },
          {
            location: "Alberta Arts District",
            title: "Mixed-Use Plaza",
            imageAlt:
              "Commercial plaza with raised planters, bench seating, and native Pacific Northwest plants",
          },
          {
            location: "Sellwood Family Home",
            title: "Entertainment Oasis",
            imageAlt:
              "Backyard fire pit area with Adirondack chairs, crushed stone base, and privacy hedges",
          },
          {
            location: "Forest Park Property",
            title: "Native Meadow Restoration",
            imageAlt:
              "Native wildflower meadow with walking path, tall grasses, and pollinator-friendly blooms",
          },
        ]

    const pricingHeading = props.pricing?.heading ?? "Maintenance plans"
    const pricingDesc =
      props.pricing?.description ??
      "Predictable pricing for ongoing care. All plans include scheduling flexibility and dedicated crew assignment."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Essential Care",
            audience: "For compact properties under 5,000 sq ft",
            price: "$285",
            period: "/month",
            features: [
              "Bi-weekly mowing and edging",
              "Seasonal fertilization (4x/year)",
              "Spring and fall cleanup",
              "Weed control in beds",
            ],
            cta: "Get Started",
          },
          {
            name: "Complete Care",
            audience: "For standard residential properties",
            price: "$495",
            period: "/month",
            features: [
              "Weekly mowing and edging",
              "Full pruning and shaping",
              "Monthly health inspections",
              "Irrigation monitoring",
              "Priority scheduling",
            ],
            cta: "Get Started",
            badge: "POPULAR",
            featured: true,
          },
          {
            name: "Estate Care",
            audience: "For properties 1+ acres or complex gardens",
            price: "Custom",
            features: [
              "Multiple weekly visits",
              "Dedicated garden specialist",
              "Seasonal color rotation",
              "Hardscape maintenance",
              "24-hour response guarantee",
            ],
            cta: "Contact Us",
          },
        ]

    const footerTagline =
      props.footer?.tagline ??
      "Premium outdoor design, installation, and maintenance for Portland homes and businesses."
    const footerNote = props.footer?.note ?? "All rights reserved."
    const footerLinks = props.footer?.links?.length
      ? props.footer.links
      : ["Privacy", "Terms", "Careers"]

    const ctaLabel = nav[nav.length - 1]

    // Brand mark — layered diamond (mountain/leaf glyph from the source), decorative.
    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("text-primary", className)}
        aria-hidden="true"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    )

    const StarIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={cn("size-4 text-chart-4", className)}
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const CheckIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("mt-0.5 size-5 flex-shrink-0", className)}
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const serviceIcons: ReactNode[] = [
      // collection / design boards
      <svg
        key="design"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>,
      // sparkle / installation
      <svg
        key="install"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>,
      // clock / seasonal maintenance
      <svg
        key="maintenance"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // pin / hardscaping
      <svg
        key="hardscape"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>,
      // bolt / irrigation
      <svg
        key="irrigation"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      // cube / sustainable gardens
      <svg
        key="sustainable"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
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
        <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <LogoMark className="size-8" />
                <span className="text-xl font-semibold tracking-tight text-foreground">
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
                <button
                  type="button"
                  onClick={() => go(ctaLabel)}
                  className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {ctaLabel}
                </button>
              </div>
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
        </header>

        <main>
          {/* Hero */}
          <section className="relative bg-muted">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {heroHeading}
                  </h1>
                  <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center rounded-full border border-border bg-background px-8 py-4 text-base font-medium text-primary transition-colors hover:bg-accent"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center gap-6 pt-4">
                    <div className="flex -space-x-2">
                      {heroAvatars.map((alt) => (
                        <Image
                          key={alt}
                          alt={alt}
                          w={100}
                          h={100}
                          className="size-10 rounded-full border-2 border-background object-cover"
                        />
                      ))}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon key={i} />
                        ))}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {heroRating}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <Image
                    alt={heroImageAlt}
                    w={800}
                    h={600}
                    className="h-[400px] w-full rounded-xl object-cover shadow-xl lg:h-[500px]"
                  />
                  <div className="absolute -bottom-6 -left-6 hidden rounded-xl bg-card p-6 shadow-lg sm:block">
                    <p className="text-3xl font-semibold text-primary">
                      {heroStatValue}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {heroStatLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Trusted-by logo strip */}
          <section className="border-b border-border bg-card py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-4 lg:grid-cols-6">
                {logoItems.map((logo, i) => (
                  <div
                    key={logo}
                    className={cn(
                      "flex h-12 items-center justify-center font-semibold text-muted-foreground",
                      i >= 4 && "hidden md:flex",
                    )}
                  >
                    {logo}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="bg-card py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl">
                  {servicesHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{servicesDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {serviceItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-xl bg-muted p-8 transition-colors hover:bg-accent"
                  >
                    <div className="mb-6 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">
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

          {/* How we work */}
          <section className="bg-accent py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-4">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-6 flex size-12 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
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
                        className="absolute left-12 top-6 hidden h-0.5 w-full bg-primary/20 md:block"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Selected projects gallery */}
          <section className="bg-card py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{galleryDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((proj) => (
                  <button
                    key={proj.title}
                    type="button"
                    onClick={() => go(proj.title)}
                    className="group relative block w-full cursor-pointer overflow-hidden rounded-xl text-left"
                  >
                    <Image
                      alt={proj.imageAlt}
                      w={600}
                      h={500}
                      loading="lazy"
                      className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="absolute bottom-0 left-0 p-6">
                        <p className="mb-1 text-sm font-medium text-primary-foreground/80">
                          {proj.location}
                        </p>
                        <h3 className="text-xl font-semibold text-background">
                          {proj.title}
                        </h3>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(galleryCta)}
                  className="inline-flex items-center rounded-full border border-border bg-muted px-8 py-4 text-base font-medium text-primary transition-colors hover:bg-accent"
                >
                  {galleryCta}
                </button>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative rounded-xl p-8",
                      plan.featured
                        ? "bg-primary text-primary-foreground shadow-lg md:-mt-4 md:mb-4"
                        : "bg-card text-card-foreground shadow-sm",
                    )}
                  >
                    {plan.badge && (
                      <div className="absolute right-0 top-0 rounded-bl-lg rounded-tr-xl bg-chart-4 px-3 py-1 text-xs font-bold text-foreground">
                        {plan.badge}
                      </div>
                    )}
                    <div className="mb-6">
                      <h3
                        className={cn(
                          "mb-2 text-lg font-semibold",
                          plan.featured
                            ? "text-primary-foreground"
                            : "text-foreground",
                        )}
                      >
                        {plan.name}
                      </h3>
                      <p
                        className={cn(
                          "text-sm",
                          plan.featured
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground",
                        )}
                      >
                        {plan.audience}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span
                        className={cn(
                          "text-4xl font-bold",
                          plan.featured
                            ? "text-primary-foreground"
                            : "text-foreground",
                        )}
                      >
                        {plan.price}
                      </span>
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
                    <ul className="mb-8 space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className={cn(
                            "flex items-start gap-3",
                            plan.featured
                              ? "text-primary-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          <CheckIcon
                            className={
                              plan.featured
                                ? "text-primary-foreground/70"
                                : "text-primary"
                            }
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "block w-full rounded-lg px-6 py-3 text-center font-medium transition-colors",
                        plan.featured
                          ? "bg-background text-primary hover:bg-muted"
                          : "bg-muted text-primary hover:bg-accent",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-start">
              <div className="max-w-sm text-center md:text-left">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-3 flex items-center justify-center gap-2 md:justify-start"
                >
                  <LogoMark className="size-7" />
                  <span className="text-lg font-semibold tracking-tight text-foreground">
                    {brand}
                  </span>
                </button>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {footerTagline}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6">
                {footerLinks.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} {brand}. {footerNote}
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
