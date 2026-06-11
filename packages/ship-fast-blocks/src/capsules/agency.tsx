import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * AgencyKimiPage — a complete, self-contained creative digital-agency LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Studio Rise" design: a
 * dark, cinematic aesthetic on a near-black canvas with indigo/violet accent
 * gradients, floating blurred orbs, a subtle grain overlay, and scroll-style
 * depth. It pairs a bold full-bleed hero (availability pill + huge gradient
 * headline + inline KPI strip) with a 6-up services grid, a 2-column selected
 * work gallery (image-zoom hover + case-study overlay), a split stats/about
 * band with a glowing photo, an oversized pull-quote testimonial, a contact
 * CTA with a real form, and a slim footer.
 *
 * The block owns ALL layout, spacing, gradients, depth and type hierarchy.
 * The base surface is intentionally dark (slate-950) to preserve Kimi's mood,
 * with indigo/violet gradients on the brand mark, CTAs, accents and glows.
 * Every nav item / CTA / link routes through `useNavigate` (never a dead "#"),
 * and the navbar labels match the `nav` array so PageSwitch can swap pages.
 * All content imagery uses the alt-driven <Image> component (never a raw src).
 * Callers supply ONLY content data; rich defaults make it render great with
 * no props at all.
 */
export const AgencyKimiPage = defineCapsule({
  name: "AgencyKimiPage",
  description:
    "Complete creative digital-agency / studio LANDING page with a bold, dark, cinematic aesthetic: near-black canvas, indigo-violet accent gradients, floating glow orbs and grain texture. Includes a full-bleed hero (availability badge, huge gradient headline, dual CTAs, inline KPI strip), a 6-up services/capabilities grid with hover-lift cards and icons, a 2-column selected-work gallery with image-zoom hover and case-study overlays, a split stats/about band with a glowing showcase photo, an oversized pull-quote testimonial, and a contact section with a real inquiry form plus social links. Use as the ROOT/home page for creative agencies, design studios, branding/marketing shops, freelance creatives, production houses, or portfolio sites when a moody, premium, conversion-focused page with strong work showcase and social proof is wanted. Supply content only — brand, nav, hero, services, work, stats, testimonial, contact, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / studio name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        /** Heading lines rendered stacked; one line may be highlighted via `highlight`. */
        headingTop: z.string().optional(),
        /** Phrase rendered with the indigo-violet gradient highlight. */
        highlight: z.string().optional(),
        headingBottom: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        /** Inline KPI strip beneath the hero copy. */
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Services / capabilities grid. */
    services: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Selected work gallery. */
    work: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              tag: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Split stats / about band. */
    stats: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        imageAlt: z.string().optional(),
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Oversized pull-quote testimonial. */
    testimonial: z
      .object({
        quote: z.string().optional(),
        /** Phrase inside the quote rendered in the accent color. */
        highlight: z.string().optional(),
        name: z.string().optional(),
        role: z.string().optional(),
        avatarAlt: z.string().optional(),
      })
      .optional(),
    /** Contact CTA + inquiry form. */
    contact: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        submit: z.string().optional(),
        emailLabel: z.string().optional(),
        email: z.string().optional(),
        /** Project-type options for the form select. */
        projectTypes: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        note: z.string().optional(),
        links: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Studio Rise"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Work", "About", "Contact"]

    const heroBadge = props.hero?.badge ?? "Available for new projects"
    const headingTop = props.hero?.headingTop ?? "We craft digital"
    const heroHighlight = props.hero?.highlight ?? "experiences"
    const headingBottom = props.hero?.headingBottom ?? "that define brands."
    const heroSub =
      props.hero?.subheading ??
      "Strategy, design, and technology fused into cohesive digital products that captivate users and drive measurable business growth."
    const heroPrimary = props.hero?.primaryCta ?? "View our work"
    const heroSecondary = props.hero?.secondaryCta ?? "Start a project"
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: "120+", label: "Projects delivered" },
          { value: "45", label: "Industry awards" },
          { value: "8 yrs", label: "In the game" },
          { value: "98%", label: "Client retention" },
        ]

    const servicesHeading =
      props.services?.heading ?? "Capabilities that cover the full journey."
    const servicesDesc =
      props.services?.description ??
      "From initial concept to final pixel, we offer end-to-end services designed to transform ambitious ideas into market-leading digital products."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: "Brand Strategy",
            description:
              "Positioning, messaging, and visual identity systems that resonate with your audience and differentiate you from competitors.",
          },
          {
            title: "UI/UX Design",
            description:
              "User-centered interfaces crafted through research, wireframing, and high-fidelity prototyping for web and mobile.",
          },
          {
            title: "Web Development",
            description:
              "Performance-first frontend engineering with modern frameworks, clean architecture, and scalable infrastructure.",
          },
          {
            title: "Digital Marketing",
            description:
              "Data-driven growth campaigns across SEO, content, paid media, and social to acquire and retain high-value customers.",
          },
          {
            title: "Motion Design",
            description:
              "Cinematic animations, micro-interactions, and video production that bring interfaces and stories to life.",
          },
          {
            title: "Creative Direction",
            description:
              "Holistic creative leadership ensuring every touchpoint aligns with your brand vision and business objectives.",
          },
        ]

    const workHeading = props.work?.heading ?? "Selected work"
    const workDesc =
      props.work?.description ??
      "A curated collection of projects where strategy, craft, and technology converged."
    const workViewAll = props.work?.viewAll ?? "View all projects"
    const workItems = props.work?.items?.length
      ? props.work.items
      : [
          {
            title: "Aurora Fintech",
            description:
              "Complete brand overhaul and product design for a next-generation trading platform.",
            tag: "Fintech",
          },
          {
            title: "Nova Commerce",
            description:
              "Headless e-commerce experience with 40% faster checkout and 3x conversion lift.",
            tag: "E-commerce",
          },
          {
            title: "Medilink Health",
            description:
              "Patient-centric telehealth platform serving over 2 million users across Europe.",
            tag: "Healthcare",
          },
          {
            title: "Vertex Real Estate",
            description:
              "Immersive property platform with 3D tours and AI-powered matching algorithms.",
            tag: "Real Estate",
          },
        ]

    const statsHeading = props.stats?.heading ?? "Numbers that speak volumes."
    const statsDesc =
      props.stats?.description ??
      "We are a tight-knit collective of strategists, designers, and engineers obsessed with quality. Every metric below reflects our commitment to outcomes over outputs."
    const statsImageAlt =
      props.stats?.imageAlt ?? "Creative agency team collaboration in studio"
    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "$400M+", label: "Revenue generated for clients" },
          { value: "12", label: "Countries served" },
          { value: "24h", label: "Average response time" },
          { value: "0", label: "Boring projects taken" },
        ]

    const testimonialQuote =
      props.testimonial?.quote ??
      "Studio Rise didn't just redesign our product — they redefined how our customers think about our brand. The results exceeded every KPI we set."
    const testimonialHighlight =
      props.testimonial?.highlight ??
      "redefined how our customers think"
    const testimonialName = props.testimonial?.name ?? "Sarah Chen"
    const testimonialRole = props.testimonial?.role ?? "CEO, Aurora Fintech"
    const testimonialAvatarAlt =
      props.testimonial?.avatarAlt ?? "Portrait of Sarah Chen, fintech CEO"

    const contactHeading =
      props.contact?.heading ?? "Let's build something great together."
    const contactDesc =
      props.contact?.description ??
      "Have a project in mind? We'd love to hear about it. Share your vision and we'll respond within 24 hours."
    const contactSubmit = props.contact?.submit ?? "Send message"
    const contactEmailLabel = props.contact?.emailLabel ?? "Prefer email?"
    const contactEmail = props.contact?.email ?? "hello@studiorise.co"
    const projectTypes = props.contact?.projectTypes?.length
      ? props.contact.projectTypes
      : [
          "Brand Strategy",
          "Web Design & Development",
          "Digital Marketing",
          "Motion Design",
          "Other",
        ]

    const footerNote = props.footer?.note ?? "All rights reserved."
    const footerLinks = props.footer?.links?.length
      ? props.footer.links
      : ["Privacy", "Terms"]

    // Brand logo tile — gradient with the brand initial (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-gradient-to-br from-primary to-accent font-black text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    const ArrowRight = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    )

    // Renders the testimonial quote, accent-highlighting `testimonialHighlight` if present.
    const renderQuote = () => {
      const idx = testimonialHighlight
        ? testimonialQuote.indexOf(testimonialHighlight)
        : -1
      if (idx === -1) return <>&ldquo;{testimonialQuote}&rdquo;</>
      return (
        <>
          &ldquo;{testimonialQuote.slice(0, idx)}
          <span className="text-primary">{testimonialHighlight}</span>
          {testimonialQuote.slice(idx + testimonialHighlight.length)}&rdquo;
        </>
      )
    }

    const serviceIcons: ReactNode[] = [
      // compass
      <svg
        key="compass"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>,
      // layout
      <svg
        key="layout"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>,
      // code
      <svg
        key="code"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>,
      // megaphone
      <svg
        key="megaphone"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m3 11 18-5v12L3 14v-3z" />
        <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
      </svg>,
      // video
      <svg
        key="video"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>,
      // sparkles
      <svg
        key="sparkles"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
        <path d="M19 15l.95 2.55L22.5 18.5l-2.55.95L19 22l-.95-2.55L15.5 18.5l2.55-.95L19 15z" />
      </svg>,
    ]

    const inputCls =
      "w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground transition-all focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"

    return (
      <div
        className={cn(
          "relative min-h-svh overflow-x-hidden bg-background text-foreground antialiased selection:bg-primary/30 selection:text-primary-foreground",
          props.className,
        )}
      >
        {/* Grain texture overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[9999] opacity-[0.025]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg%20viewBox='0%200%20256%20256'%20xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.85'%20numOctaves='4'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/70 backdrop-blur-md">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground"
            >
              <LogoMark className="size-8 text-sm" />
              {brand}
            </button>
            <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
              {nav.slice(0, -1).map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => go(nav[nav.length - 1])}
                className="rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {heroSecondary}
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
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
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
          <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-primary/15 via-accent/5 to-background pt-16">
            <div aria-hidden="true" className="absolute inset-0 opacity-20">
              <div className="absolute left-1/4 top-1/4 size-96 animate-pulse rounded-full bg-primary/30 blur-3xl" />
              <div className="absolute bottom-1/4 right-1/4 size-80 animate-pulse rounded-full bg-accent/20 blur-3xl [animation-delay:2s]" />
            </div>
            <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-accent/50 px-4 py-2 text-sm text-muted-foreground">
                <span className="size-2 animate-pulse rounded-full bg-primary" />
                {heroBadge}
              </div>
              <h1 className="mb-8 text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
                {headingTop}
                <br />
                <span className="bg-gradient-to-br from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                  {heroHighlight}
                </span>{" "}
                {headingBottom}
              </h1>
              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {heroSub}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground transition-all hover:bg-primary/90"
                >
                  {heroPrimary}
                  <ArrowRight />
                </button>
                <button
                  type="button"
                  onClick={() => go(heroSecondary)}
                  className="rounded-full border border-border bg-accent/50 px-8 py-4 font-medium text-foreground transition-all hover:bg-accent"
                >
                  {heroSecondary}
                </button>
              </div>

              <div className="mt-24 grid grid-cols-2 gap-8 border-t border-border pt-10 md:grid-cols-4">
                {heroStats.map((s) => (
                  <div key={s.label}>
                    <div className="text-3xl font-bold text-foreground">
                      {s.value}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="relative py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6">
              <div className="mb-16 max-w-3xl">
                <h2 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
                  {servicesHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {servicesDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {serviceItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.45)]"
                  >
                    <div className="mb-6 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-card-foreground">
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

          {/* Selected work */}
          <section className="bg-muted/30 py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6">
              <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div>
                  <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
                    {workHeading}
                  </h2>
                  <p className="max-w-xl text-lg text-muted-foreground">{workDesc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => go(workViewAll)}
                  className="inline-flex items-center gap-2 font-medium text-primary transition-colors hover:text-primary/80"
                >
                  {workViewAll} <ArrowRight />
                </button>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                {workItems.map((proj) => (
                  <button
                    key={proj.title}
                    type="button"
                    onClick={() => go(proj.title)}
                    className="group block w-full cursor-pointer text-left"
                  >
                    <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                      <Image
                        alt={proj.title}
                        w={800}
                        h={600}
                        loading="lazy"
                        className="size-full rounded-2xl object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-end rounded-2xl bg-gradient-to-t from-background/60 to-transparent p-6 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="rounded-full bg-accent/80 px-4 py-2 text-sm font-medium text-accent-foreground backdrop-blur">
                          View case study
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="mb-2 text-2xl font-semibold transition-colors group-hover:text-primary">
                          {proj.title}
                        </h3>
                        <p className="text-muted-foreground">{proj.description}</p>
                      </div>
                      <span className="mt-2 whitespace-nowrap rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                        {proj.tag}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Stats / About */}
          <section className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <div>
                  <h2 className="mb-8 text-4xl font-bold tracking-tight sm:text-5xl">
                    {statsHeading}
                  </h2>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                    {statsDesc}
                  </p>
                  <div className="grid grid-cols-2 gap-8">
                    {statsItems.map((s) => (
                      <div
                        key={s.label}
                        className="border-l-2 border-primary/30 pl-6"
                      >
                        <div className="mb-1 text-4xl font-bold text-foreground">
                          {s.value}
                        </div>
                        <div className="text-sm text-muted-foreground">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/20 to-accent/20 blur-2xl"
                  />
                  <Image
                    alt={statsImageAlt}
                    w={800}
                    h={600}
                    loading="lazy"
                    className="relative aspect-[4/3] w-full rounded-2xl border border-border object-cover"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Testimonial */}
          <section className="border-y border-border bg-muted/30 py-24 sm:py-32">
            <div className="mx-auto max-w-5xl px-6 text-center">
              <div className="mx-auto mb-8 grid size-16 place-items-center rounded-full bg-primary/10">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-primary"
                  aria-hidden="true"
                >
                  <path d="M9.5 6C6.5 6 4 8.5 4 11.5V18h6.5v-6.5H7.5C7.5 9.6 8.4 8.5 9.5 8.5V6zm9 0c-3 0-5.5 2.5-5.5 5.5V18H19.5v-6.5h-3C16.5 9.6 17.4 8.5 18.5 8.5V6z" />
                </svg>
              </div>
              <blockquote className="mb-10 text-3xl font-medium leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {renderQuote()}
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <Image
                  alt={testimonialAvatarAlt}
                  w={120}
                  h={120}
                  className="size-14 rounded-full border-2 border-border object-cover"
                />
                <div className="text-left">
                  <div className="font-semibold text-foreground">
                    {testimonialName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonialRole}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact CTA */}
          <section className="relative overflow-hidden py-24 sm:py-32">
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
            />
            <div className="relative z-10 mx-auto max-w-4xl px-6">
              <div className="mb-12 text-center">
                <h2 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  {contactHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {contactDesc}
                </p>
              </div>

              <form
                className="mx-auto max-w-xl space-y-5"
                onSubmit={(e) => {
                  e.preventDefault()
                  go(nav[nav.length - 1])
                }}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="agency-name"
                      className="mb-2 block text-sm font-medium text-muted-foreground"
                    >
                      Name
                    </label>
                    <input
                      id="agency-name"
                      type="text"
                      required
                      placeholder="Jane Doe"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="agency-email"
                      className="mb-2 block text-sm font-medium text-muted-foreground"
                    >
                      Email
                    </label>
                    <input
                      id="agency-email"
                      type="email"
                      required
                      placeholder="jane@company.com"
                      className={inputCls}
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="agency-type"
                    className="mb-2 block text-sm font-medium text-muted-foreground"
                  >
                    Project type
                  </label>
                  <select
                    id="agency-type"
                    className={cn(inputCls, "appearance-none")}
                  >
                    {projectTypes.map((opt) => (
                      <option key={opt} className="bg-background">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="agency-message"
                    className="mb-2 block text-sm font-medium text-muted-foreground"
                  >
                    Message
                  </label>
                  <textarea
                    id="agency-message"
                    rows={4}
                    required
                    placeholder="Tell us about your project, goals, and timeline."
                    className={cn(inputCls, "resize-none")}
                  />
                </div>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-lg font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {contactSubmit}
                  <svg
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
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>

              <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-border pt-10 sm:flex-row">
                <div className="text-center sm:text-left">
                  <div className="mb-1 text-sm text-muted-foreground">
                    {contactEmailLabel}
                  </div>
                  <button
                    type="button"
                    onClick={() => go(nav[nav.length - 1])}
                    className="text-lg font-medium transition-colors hover:text-primary"
                  >
                    {contactEmail}
                  </button>
                </div>
                <div className="flex items-center gap-6">
                  {(["Twitter", "Instagram", "LinkedIn", "Dribbble"] as const).map(
                    (social) => (
                      <button
                        key={social}
                        type="button"
                        aria-label={social}
                        onClick={() => go(social)}
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {social}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground md:flex-row">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <LogoMark className="size-6 text-xs" />
              {brand}
            </button>
            <div>
              © {new Date().getFullYear()} {brand}. {footerNote}
            </div>
            <div className="flex items-center gap-6">
              {footerLinks.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="transition-colors hover:text-foreground"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
