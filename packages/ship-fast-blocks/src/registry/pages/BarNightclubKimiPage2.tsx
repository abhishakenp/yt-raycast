import { useState } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * BarNightclubKimiPage2 — bold, neon-accented bar & nightclub landing + reservations page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "NOCTURNE" design: sticky
 * navigation, editorial uppercase display headings, rounded event cards with dark
 * photo overlays and neon-pill date badges, a two-column cocktail and bottle-service
 * menu with prices, a masonry photo gallery, guest testimonial cards with headshots
 * and star ratings, a 4-up stats strip, a centered booking form with time and guest
 * selectors, a walk-ins CTA section with a background image, and a multi-column
 * footer with social icon links.
 *
 * This is the second style sibling to BarNightclubKimiPage — use when a more
 * vibrant, poster-style nightlife layout is wanted (rounded cards, neon pills,
 * split drink menus) vs the monochrome NOIR aesthetic of the first variant.
 *
 * Every nav item / CTA / footer link / social / form-submit routes through
 * useNavigate. All imagery uses the alt-driven <Image> component. Callers
 * supply ONLY content data; rich defaults make it render fully on zero args.
 */
export const BarNightclubKimiPage2 = defineComponent({
  name: "BarNightclubKimiPage2",
  description:
    "Bold, neon-accented BAR & NIGHTCLUB landing and reservations page with a sticky navigation bar, editorial uppercase display headings, event cards with photo overlays and neon-pill date badges, a two-column cocktail and bottle-service menu with prices, a masonry photo gallery, guest testimonials with headshots and star ratings, a 4-up stat strip, a centered booking form with time and guest selectors, a walk-ins CTA section with a background image, and a multi-column footer with social icons. Use as the second style sibling to BarNightclubKimiPage when a more vibrant, poster-style nightlife layout is wanted — featuring rounded event cards, neon-pill date badges, split drink menus, and press-logos that suit cocktail bars, nightclubs, lounges, and late-night music venues offering table reservations and bottle service. Supply content only — brand, nav, hero, logos, events, menu, gallery, reviews, stats, reservations, cta, footer; the block owns all layout and styling.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    hero: z
      .object({
        eyebrow: z.string().optional(),
        headingTop: z.string().optional(),
        headingGradient: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    logos: z.array(z.string()).optional(),
    events: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        ctaLabel: z.string().optional(),
        items: z
          .array(
            z.object({
              dateBadge: z.string(),
              title: z.string(),
              description: z.string(),
              price: z.string(),
              imageAlt: z.string(),
              badgeStyle: z.enum(["primary", "secondary"]).optional(),
            }),
          )
          .optional(),
        extras: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              tag: z.string(),
              tagStyle: z.enum(["primary", "secondary"]).optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    menu: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        columns: z
          .array(
            z.object({
              title: z.string(),
              items: z
                .array(
                  z.object({
                    name: z.string(),
                    description: z.string(),
                    price: z.string(),
                  }),
                )
                .optional(),
            }),
          )
          .optional(),
        images: z.array(z.string()).optional(),
      })
      .optional(),
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        images: z.array(z.string()).optional(),
      })
      .optional(),
    reviews: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              avatarAlt: z.string(),
              quote: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    reservations: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        locationLine1: z.string().optional(),
        locationLine2: z.string().optional(),
        hoursLine1: z.string().optional(),
        hoursLine2: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        submitLabel: z.string().optional(),
        successMessage: z.string().optional(),
        timeOptions: z.array(z.string()).optional(),
        guestOptions: z.array(z.string()).optional(),
      })
      .optional(),
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    footer: z
      .object({
        about: z.string().optional(),
        exploreHeading: z.string().optional(),
        infoHeading: z.string().optional(),
        followHeading: z.string().optional(),
        explore: z.array(z.string()).optional(),
        info: z.array(z.string()).optional(),
        socials: z.array(z.string()).optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)
    const [formSubmitted, setFormSubmitted] = useState(false)

    const brand = props.brand ?? "Nocturne"
    const nav = props.nav?.length
      ? props.nav
      : ["Events", "Cocktails", "Gallery", "Reservations", "Reviews"]

    const heroEyebrow = props.hero?.eyebrow ?? "Downtown · Open Thu–Sun"
    const heroTop = props.hero?.headingTop ?? "The Night"
    const heroGradient = props.hero?.headingGradient ?? "Belongs Here"
    const heroSub =
      props.hero?.subheading ??
      "Craft cocktails, curated sound, and an atmosphere built for after-dark memories. Walk-ins welcome, tables by reservation."
    const heroPrimary = props.hero?.primaryCta ?? "Reserve a Table"
    const heroSecondary = props.hero?.secondaryCta ?? "This Week's Events"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Dark moody bar interior with amber neon lighting reflecting off bottles"

    const logos = props.logos?.length
      ? props.logos
      : ["Time Out", "Eater", "Thrillist", "The Infatuation", "Resident Advisor"]

    const eventsEyebrow = props.events?.eyebrow ?? "Up Next"
    const eventsHeading = props.events?.heading ?? "Events & DJs"
    const eventsCtaLabel =
      props.events?.ctaLabel ?? "Reserve for any night →"
    const eventItems = props.events?.items?.length
      ? props.events.items
      : [
          {
            dateBadge: "Thu, Jun 4",
            title: "Midnight Grooves",
            description: "DJ Marcus Vale · Deep house & disco until 3 AM",
            price: "$15 cover · 10 PM – 3 AM",
            imageAlt: "DJ performing at a nightclub with pink and blue stage lights",
            badgeStyle: "primary" as const,
          },
          {
            dateBadge: "Fri, Jun 5",
            title: "Neon Fridays",
            description: "Live sax + DJ set · open format dancefloor",
            price: "$20 cover · 10 PM – 4 AM",
            imageAlt:
              "Crowd dancing under warm golden and red nightclub lights",
            badgeStyle: "secondary" as const,
          },
          {
            dateBadge: "Sat, Jun 6",
            title: "Smoke & Mirrors",
            description: "Interactive cocktail show + resident DJs",
            price: "$25 cover · includes one signature drink",
            imageAlt:
              "Professional bartender pouring a flaming cocktail in a dark upscale bar",
            badgeStyle: "primary" as const,
          },
        ]
    const eventExtras = props.events?.extras?.length
      ? props.events.extras
      : [
          {
            title: "Sunday Industry Night",
            description: "50% off for service industry · 8 PM – midnight",
            tag: "FREE",
            tagStyle: "primary" as const,
          },
          {
            title: "Private Booth Package",
            description: "Bottle service + dedicated host · up to 8 guests",
            tag: "FROM $350",
            tagStyle: "secondary" as const,
          },
        ]

    const menuEyebrow = props.menu?.eyebrow ?? "The Menu"
    const menuHeading = props.menu?.heading ?? "Cocktails & Bottles"
    const menuDesc =
      props.menu?.description ??
      "Every drink is built fresh. No premix. House syrups, hand-cut ice, and spirits selected by our head bartender."
    const menuColumns = props.menu?.columns?.length
      ? props.menu.columns
      : [
          {
            title: "Signature Cocktails",
            items: [
              {
                name: "Velvet Nocturne",
                description:
                  "Mezcal, pomegranate, lime, jalapeño agave, smoked salt rim",
                price: "$18",
              },
              {
                name: "Electric Garden",
                description:
                  "Empress 190 gin, cucumber, elderflower, lemon, basil oil",
                price: "$17",
              },
              {
                name: "Dark Matter",
                description:
                  "Bourbon, cold-brew, vanilla bean, black walnut bitters",
                price: "$18",
              },
              {
                name: "Gold Rush",
                description:
                  "Rye whiskey, honey-ginger syrup, fresh lemon, angostura",
                price: "$16",
              },
              {
                name: "Negroni Sbagliato",
                description:
                  "Campari, sweet vermouth, prosecco, orange twist",
                price: "$15",
              },
              {
                name: "Midnight Mai Tai",
                description:
                  "Aged rum, orgeat, lime, orange curaçao, mint bouquet",
                price: "$17",
              },
            ],
          },
          {
            title: "Beer, Wine & Shots",
            items: [
              {
                name: "Local IPA",
                description: "Rotating tap from regional microbreweries",
                price: "$9",
              },
              {
                name: "Imported Lager",
                description: "Premium European pilsner, ice-cold serve",
                price: "$8",
              },
              {
                name: "Red / White by the Glass",
                description: "Curated small-producer rotation",
                price: "$12",
              },
              {
                name: "Champagne Split",
                description: "Mini bottle of brut for the table",
                price: "$28",
              },
              {
                name: "Premium Shot Selection",
                description: "Patrón, Casamigos, Macallan 12, Grey Goose",
                price: "$14",
              },
              {
                name: "Bottle Service — Vodka",
                description: "Beluga or Grey Goose with mixers & garnishes",
                price: "$280",
              },
            ],
          },
        ]
    const menuImages = props.menu?.images?.length
      ? props.menu.images
      : [
          "Three colorful cocktails in coupe glasses with dried citrus garnish on a marble bar",
          "Close-up of an amber cocktail with large clear ice cube in a rocks glass",
          "Bartender shaking a silver cocktail shaker under warm bar lighting",
          "Top-down view of a dark bar with bottles and neon reflections on the counter",
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? "Inside"
    const galleryHeading = props.gallery?.heading ?? "The Space"
    const galleryImages = props.gallery?.images?.length
      ? props.gallery.images
      : [
          "Wide angle interior of an upscale nightclub featuring dark leather banquettes and a long bar",
          "Abstract bokeh from colorful club lights in a dark venue",
          "Close-up of a cocktail being poured over crushed ice with fresh rosemary",
          "Friends laughing and toasting with drinks at a dimly lit bar table",
          "DJ mixing on turntables under purple and blue neon lighting in a club booth",
        ]

    const reviewsEyebrow = props.reviews?.eyebrow ?? "Reviews"
    const reviewsHeading = props.reviews?.heading ?? "What Guests Say"
    const reviewItems = props.reviews?.items?.length
      ? props.reviews.items
      : [
          {
            name: "Sarah Lin",
            role: "Food & Drink Editor · Thrillist",
            avatarAlt:
              "Professional headshot of a smiling woman with dark hair in a studio setting",
            quote:
              "The Velvet Nocturne might be the best mezcal cocktail in the city. The bartenders actually talk to you about flavor—not just recipes.",
          },
          {
            name: "David Cortez",
            role: "Resident DJ & Producer",
            avatarAlt:
              "Professional headshot of a smiling man with a beard wearing a dark jacket",
            quote:
              "I play here monthly. The sound system is dialed in, the crowd is there for music, and the staff treats artists like family.",
          },
          {
            name: "Elena Vo",
            role: "Event Planner · Bloom Agency",
            avatarAlt:
              "Professional headshot of a woman with blonde hair smiling warmly",
            quote:
              "Hosted a team celebration in the private booth. Seamless booking, attentive host, and the atmosphere made the entire night effortless.",
          },
        ]

    const stats = props.stats?.length
      ? props.stats
      : [
          { value: "140+", label: "Spirits on the back bar" },
          { value: "12", label: "Signature cocktails" },
          { value: "4.9", label: "Average guest rating" },
          { value: "3 AM", label: "Last call Friday & Saturday" },
        ]

    const resEyebrow = props.reservations?.eyebrow ?? "Plan Your Night"
    const resHeading = props.reservations?.heading ?? "Reservations"
    const resDesc =
      props.reservations?.description ??
      "Tables fill fast on weekends. Book ahead for booth seating, bottle service, or large groups."
    const resLoc1 = props.reservations?.locationLine1 ?? "1240 Vine Street"
    const resLoc2 =
      props.reservations?.locationLine2 ?? "Downtown Arts District"
    const resHours1 =
      props.reservations?.hoursLine1 ?? "Thu–Sat: 8 PM – 4 AM"
    const resHours2 = props.reservations?.hoursLine2 ?? "Sun: 8 PM – 12 AM"
    const resEmail = props.reservations?.email ?? "reservations@nocturne.bar"
    const resPhone = props.reservations?.phone ?? "(213) 555-0192"
    const resSubmit = props.reservations?.submitLabel ?? "Confirm Reservation"
    const resSuccess =
      props.reservations?.successMessage ??
      "Reservation request received. We will confirm shortly."
    const timeOptions = props.reservations?.timeOptions?.length
      ? props.reservations.timeOptions
      : ["8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM", "12:00 AM"]
    const guestOptions = props.reservations?.guestOptions?.length
      ? props.reservations.guestOptions
      : ["1", "2", "3", "4", "5", "6", "7", "8+"]

    const ctaHeading = props.cta?.heading ?? "Walk-Ins Welcome"
    const ctaDesc =
      props.cta?.description ??
      "No plan? No problem. The front bar is first come, first served. Bring your ID and your energy."
    const ctaPrimary = props.cta?.primaryCta ?? "Book a Table"
    const ctaSecondary = props.cta?.secondaryCta ?? "View the Menu"
    const ctaImageAlt =
      props.cta?.imageAlt ??
      "Wide shot of a nightclub dancefloor filled with silhouettes and laser beams cutting through fog"

    const footerAbout =
      props.footer?.about ??
      "A downtown bar and nightclub built for late nights, good drinks, and better company."
    const footerExploreHeading = props.footer?.exploreHeading ?? "Explore"
    const footerInfoHeading = props.footer?.infoHeading ?? "Info"
    const footerFollowHeading = props.footer?.followHeading ?? "Follow"
    const footerExplore = props.footer?.explore?.length
      ? props.footer.explore
      : ["Events", "Menu", "Gallery", "Reservations"]
    const footerInfo = props.footer?.info?.length
      ? props.footer.info
      : [
          "Age 21+ with valid ID",
          "Smart casual dress code",
          "Large bags subject to search",
          "Accessibility entrance on Lane St",
        ]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Instagram", "Facebook", "Twitter"]
    const footerCopyright =
      props.footer?.copyright ??
      "© 2026 Nocturne Bar & Nightclub. All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service"]

    const inputCls =
      "w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder-muted-foreground/60 outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
    const labelCls = "mb-2 block text-sm font-medium text-muted-foreground"

    const logoEls = logos.flatMap((name, i) => [
      <span key={`name-${i}`}>{name}</span>,
      ...(i < logos.length - 1
        ? [
            <span key={`star-${i}`} className="hidden text-primary sm:inline">
              ★
            </span>,
          ]
        : []),
    ])

    return (
      <div
        className={cn(
          "min-h-svh overflow-x-hidden bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(brand)}
                className="text-2xl font-bold uppercase tracking-[0.2em] text-foreground"
              >
                {brand}
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => go(heroPrimary)}
                className="hidden items-center rounded-full bg-primary px-6 py-2 text-sm font-medium tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 md:inline-flex"
              >
                {heroPrimary}
              </button>
              <button
                type="button"
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
                className="p-2 text-foreground md:hidden"
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
            {menuOpen && (
              <div className="flex flex-col gap-2 border-t border-border py-4 md:hidden">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      go(label)
                    }}
                    className="py-1 text-left text-sm tracking-wide text-muted-foreground transition-colors hover:text-foreground"
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
          <section className="relative flex min-h-screen items-center justify-center pt-20">
            <div className="absolute inset-0 z-0">
              <Image
                alt={heroImageAlt}
                w={1920}
                h={1080}
                className="size-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
            </div>
            <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
              <p className="mb-6 text-sm uppercase tracking-[0.3em] text-muted-foreground">
                {heroEyebrow}
              </p>
              <h1 className="mb-8 text-5xl font-bold uppercase tracking-tight sm:text-6xl lg:text-8xl">
                {heroTop}
                <br />
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {heroGradient}
                </span>
              </h1>
              <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {heroSub}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="w-full rounded-full bg-primary px-8 py-4 text-sm font-medium tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
                >
                  {heroPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(heroSecondary)}
                  className="w-full rounded-full border border-border px-8 py-4 text-sm tracking-wide text-foreground transition-colors hover:bg-card sm:w-auto"
                >
                  {heroSecondary}
                </button>
              </div>
            </div>
          </section>

          {/* Press logos */}
          <section className="border-y border-border py-8">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 text-sm uppercase tracking-[0.2em] text-muted-foreground sm:px-6 lg:px-8">
              {logoEls}
            </div>
          </section>

          {/* Events */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <p className="mb-4 text-sm uppercase tracking-[0.2em] text-primary">
                    {eventsEyebrow}
                  </p>
                  <h2 className="text-3xl font-bold uppercase sm:text-4xl lg:text-5xl">
                    {eventsHeading}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => go(eventsCtaLabel)}
                  className="text-sm font-medium tracking-wide text-primary transition-colors hover:text-primary/80"
                >
                  {eventsCtaLabel}
                </button>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {eventItems.map((ev) => (
                  <div
                    key={ev.title}
                    className="group overflow-hidden rounded-2xl border border-border bg-card"
                  >
                    <div className="relative">
                      <Image
                        alt={ev.imageAlt}
                        w={600}
                        h={400}
                        loading="lazy"
                        className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                      <span
                        className={cn(
                          "absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
                          ev.badgeStyle === "secondary"
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-primary text-primary-foreground",
                        )}
                      >
                        {ev.dateBadge}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="mb-2 text-xl font-bold">{ev.title}</h3>
                      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                        {ev.description}
                      </p>
                      <p className="mb-6 text-sm text-muted-foreground">
                        {ev.price}
                      </p>
                      <button
                        type="button"
                        onClick={() => go(`${ev.title} ${eventsCtaLabel}`)}
                        className="w-full rounded-full border border-border py-2 text-sm tracking-wide transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        Reserve
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {eventExtras.map((extra) => (
                  <div
                    key={extra.title}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6"
                  >
                    <div>
                      <h3 className="mb-1 font-bold">{extra.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {extra.description}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
                        extra.tagStyle === "secondary"
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-primary text-primary-foreground",
                      )}
                    >
                      {extra.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Menu */}
          <section className="border-t border-border py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <p className="mb-4 text-sm uppercase tracking-[0.2em] text-primary">
                  {menuEyebrow}
                </p>
                <h2 className="mb-6 text-3xl font-bold uppercase sm:text-4xl lg:text-5xl">
                  {menuHeading}
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  {menuDesc}
                </p>
              </div>

              <div className="grid gap-12 md:grid-cols-2 lg:gap-16">
                {menuColumns.map((col) => (
                  <div key={col.title}>
                    <h3 className="mb-8 border-b border-border pb-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">
                      {col.title}
                    </h3>
                    <div className="space-y-6">
                      {(col.items ?? []).map((drink) => (
                        <div
                          key={drink.name}
                          className="flex items-start justify-between gap-4"
                        >
                          <div>
                            <h4 className="mb-1 font-medium">{drink.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {drink.description}
                            </p>
                          </div>
                          <span className="whitespace-nowrap font-semibold text-primary">
                            {drink.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {menuImages.map((alt) => (
                  <Image
                    key={alt}
                    alt={alt}
                    w={400}
                    h={400}
                    loading="lazy"
                    className="aspect-square w-full rounded-xl object-cover"
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="border-t border-border py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 max-w-2xl">
                <p className="mb-4 text-sm uppercase tracking-[0.2em] text-primary">
                  {galleryEyebrow}
                </p>
                <h2 className="text-3xl font-bold uppercase sm:text-4xl lg:text-5xl">
                  {galleryHeading}
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {galleryImages.map((alt, i) => (
                  <div
                    key={alt}
                    className={cn(i === 0 && "lg:col-span-2 lg:row-span-2")}
                  >
                    <Image
                      alt={alt}
                      w={i === 0 ? 800 : 400}
                      h={i === 0 ? 800 : 300}
                      loading="lazy"
                      className={cn(
                        "w-full rounded-xl object-cover",
                        i === 0
                          ? "min-h-[300px] lg:h-full lg:min-h-full"
                          : "h-48 lg:h-64",
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Reviews */}
          <section className="border-t border-border py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <p className="mb-4 text-sm uppercase tracking-[0.2em] text-primary">
                  {reviewsEyebrow}
                </p>
                <h2 className="text-3xl font-bold uppercase sm:text-4xl lg:text-5xl">
                  {reviewsHeading}
                </h2>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {reviewItems.map((review) => (
                  <div
                    key={review.name}
                    className="rounded-2xl border border-border bg-card p-8"
                  >
                    <div className="mb-6 flex gap-1 text-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} aria-hidden="true">
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/90">
                      &ldquo;{review.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={review.avatarAlt}
                        w={96}
                        h={96}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{review.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {review.role}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="border-t border-border py-16">
            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="mb-2 text-4xl font-bold text-primary lg:text-5xl">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Reservations */}
          <section className="border-t border-border py-24 lg:py-32">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-4 text-sm uppercase tracking-[0.2em] text-primary">
                  {resEyebrow}
                </p>
                <h2 className="mb-6 text-3xl font-bold uppercase sm:text-4xl lg:text-5xl">
                  {resHeading}
                </h2>
                <p className="mx-auto max-w-2xl leading-relaxed text-muted-foreground">
                  {resDesc}
                </p>
              </div>

              <div className="grid gap-12 lg:grid-cols-2">
                <div className="space-y-8">
                  <div>
                    <p className={labelCls}>Location</p>
                    <p className="text-foreground">{resLoc1}</p>
                    <p className="text-muted-foreground">{resLoc2}</p>
                  </div>
                  <div>
                    <p className={labelCls}>Hours</p>
                    <p className="text-foreground">{resHours1}</p>
                    <p className="text-muted-foreground">{resHours2}</p>
                  </div>
                  <div>
                    <p className={labelCls}>Contact</p>
                    <button
                      type="button"
                      onClick={() => go(resEmail)}
                      className="block text-foreground transition-colors hover:text-primary"
                    >
                      {resEmail}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(resPhone)}
                      className="block text-muted-foreground transition-colors hover:text-primary"
                    >
                      {resPhone}
                    </button>
                  </div>
                </div>

                {formSubmitted ? (
                  <div className="flex items-center justify-center rounded-2xl border border-border bg-card p-8 text-center">
                    <p className="text-lg text-foreground">{resSuccess}</p>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      setFormSubmitted(true)
                    }}
                    className="space-y-5 rounded-2xl border border-border bg-card p-8"
                  >
                    <div>
                      <label htmlFor="res-name" className={labelCls}>
                        Name
                      </label>
                      <input
                        id="res-name"
                        type="text"
                        required
                        placeholder="Your name"
                        className={inputCls}
                      />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="res-time" className={labelCls}>
                          Time
                        </label>
                        <select id="res-time" className={inputCls}>
                          {timeOptions.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="res-guests" className={labelCls}>
                          Guests
                        </label>
                        <select id="res-guests" className={inputCls}>
                          {guestOptions.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-full bg-primary px-8 py-3 text-sm font-medium tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {resSubmit}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="relative overflow-hidden border-t border-border py-24 lg:py-32">
            <div className="absolute inset-0 z-0">
              <Image
                alt={ctaImageAlt}
                w={1920}
                h={1080}
                loading="lazy"
                className="size-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
            </div>
            <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold uppercase sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {ctaDesc}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="w-full rounded-full bg-primary px-8 py-4 text-sm font-medium tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="w-full rounded-full border border-border px-8 py-4 text-sm tracking-wide text-foreground transition-colors hover:bg-card sm:w-auto"
                >
                  {ctaSecondary}
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-1">
                <p className="mb-4 text-2xl font-bold uppercase tracking-[0.2em]">
                  {brand}
                </p>
                <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {footerAbout}
                </p>
              </div>
              <div>
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  {footerExploreHeading}
                </p>
                <ul className="space-y-2">
                  {footerExplore.map((label) => (
                    <li key={label}>
                      <button
                        type="button"
                        onClick={() => go(label)}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  {footerInfoHeading}
                </p>
                <ul className="space-y-2">
                  {footerInfo.map((label) => (
                    <li
                      key={label}
                      className="text-sm leading-relaxed text-muted-foreground"
                    >
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  {footerFollowHeading}
                </p>
                <ul className="space-y-2">
                  {footerSocials.map((label) => (
                    <li key={label}>
                      <button
                        type="button"
                        onClick={() => go(label)}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
              <p className="text-sm text-muted-foreground">{footerCopyright}</p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                {footerLegal.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="transition-colors hover:text-foreground"
                  >
                    {label}
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
