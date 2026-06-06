import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * MarketingKimiPage — a complete, self-contained product-marketing LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Flowstate" design: an
 * all-in-one team workspace. Preserves Kimi's indigo accent, soft top-down
 * gradient hero, and its signature hero visual — a 3D-tilted browser mockup
 * (traffic-light dots + address bar) framing a mini product UI: an app rail,
 * an animated sprint-velocity bar chart, and a task checklist. Below: a
 * grayscale logo bar, a 6-up feature grid with raised hover lift, a single
 * large centered testimonial card with a quote glyph, a 3-tier pricing table
 * (highlighted "most popular" plan), a dark rounded CTA banner with an email
 * capture form, and a slim single-row footer.
 *
 * Base surfaces use theme tokens (bg-background/text-foreground) so dark mode
 * works; Kimi's indigo accent + gradients + the dark CTA are preserved. Every
 * nav item / CTA / link routes through `useNavigate` (never a dead "#"), and
 * the navbar labels match the `nav` array so PageSwitch can swap pages.
 * Callers supply ONLY content data; rich defaults make it render great with
 * no props at all.
 */
export const MarketingKimiPage = defineComponent({
  name: "MarketingKimiPage",
  description:
    "Complete product-marketing / SaaS LANDING page with a clean, premium indigo aesthetic: glassy navbar, a split hero pairing bold copy with a 3D-tilted browser mockup of a live product dashboard (app rail, animated bar chart, task checklist), a grayscale 'trusted by' logo bar, a 6-up feature grid with hover lift, one large centered testimonial card with a quote glyph, a 3-tier pricing table (with a highlighted 'most popular' plan), a dark rounded CTA banner with email capture, and a slim footer. Use as the ROOT/home page for B2B SaaS, team/project-management and productivity tools, developer platforms, workspaces, or any modern software product when a conversion-focused page with a product-UI visual, social proof and pricing is wanted. Supply content only — brand, nav, hero, logos, features, testimonial, pricing, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / product name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        note: z.string().optional(),
        /** Address-bar text shown in the browser mockup. */
        appUrl: z.string().optional(),
        /** Title shown in the mockup's inner product header. */
        appTitle: z.string().optional(),
        /** Title of the chart widget in the mockup. */
        chartTitle: z.string().optional(),
        /** Title of the task widget in the mockup. */
        tasksTitle: z.string().optional(),
      })
      .optional(),
    /** Grayscale "trusted by" logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        names: z.array(z.string()).optional(),
      })
      .optional(),
    /** Feature grid: heading + description + up to 6 items. */
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Single large centered testimonial. */
    testimonial: z
      .object({
        quote: z.string().optional(),
        name: z.string().optional(),
        role: z.string().optional(),
      })
      .optional(),
    /** Pricing tiers. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              description: z.string(),
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
    /** Closing dark CTA banner with email capture. */
    cta: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        placeholder: z.string().optional(),
        action: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        links: z.array(z.string()).optional(),
        copyright: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Flowstate"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Pricing", "Customers"]

    const heroBadge = props.hero?.badge ?? "Now with AI-powered insights"
    const heroHeading =
      props.hero?.heading ??
      `Focus on what matters. Let ${brand} handle the rest.`
    const heroSub =
      props.hero?.subheading ??
      "The all-in-one workspace that helps teams plan, track, and ship work 2x faster — without the chaos of endless tabs and status meetings."
    const heroPrimary = props.hero?.primaryCta ?? "Start free trial"
    const heroSecondary = props.hero?.secondaryCta ?? "Watch demo"
    const heroNote =
      props.hero?.note ?? "No credit card required. 14-day free trial."
    const appUrl = props.hero?.appUrl ?? "app.flowstate.io/dashboard"
    const appTitle = props.hero?.appTitle ?? "Product Roadmap"
    const chartTitle = props.hero?.chartTitle ?? "Sprint Velocity"
    const tasksTitle = props.hero?.tasksTitle ?? "Today's Tasks"

    const logosLabel = props.logos?.label ?? "Trusted by teams at"
    const logoNames = props.logos?.names?.length
      ? props.logos.names
      : ["Acme Corp", "Globex", "Initech", "Massive Dynamic", "Stark Ind"]

    const featuresHeading =
      props.features?.heading ?? "Everything your team needs to ship faster"
    const featuresDesc =
      props.features?.description ??
      "Powerful, flexible tools that adapt to how you work — not the other way around."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Intuitive Task Boards",
            description:
              "Drag-and-drop Kanban boards that make it easy to visualize work, limit WIP, and spot bottlenecks before they derail your sprint.",
          },
          {
            title: "Real-time Collaboration",
            description:
              "Work together in the same document, comment inline, and mention teammates so everyone stays aligned without endless threads.",
          },
          {
            title: "Advanced Analytics",
            description:
              "Track velocity, burndown, and cycle time with beautiful dashboards. Turn raw data into actionable insights in one click.",
          },
          {
            title: "Automated Workflows",
            description:
              "Automate repetitive tasks with customizable rules. Move cards, send updates, and trigger alerts so nothing slips through.",
          },
          {
            title: "Enterprise Security",
            description:
              "SOC 2 Type II certified with end-to-end encryption, SSO, and granular permissions. Your data stays yours — always.",
          },
          {
            title: "Seamless Integrations",
            description:
              "Connect with GitHub, Slack, Figma, and 50+ tools you already use. Keep your workflow in one place, not fifty.",
          },
        ]

    const testimonialQuote =
      props.testimonial?.quote ??
      `${brand} transformed how our product team operates. We've cut meeting time by 40% and shipped three major releases ahead of schedule. It's the operating system for our company.`
    const testimonialName = props.testimonial?.name ?? "Sarah Chen"
    const testimonialRole =
      props.testimonial?.role ?? "VP of Engineering, Acme Corp"

    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start free, scale as you grow. No hidden fees, no surprises."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Starter",
            description: "Perfect for personal projects and small experiments.",
            price: "$0",
            period: "/mo",
            features: [
              "Up to 3 projects",
              "Basic task boards",
              "Community support",
            ],
            cta: "Get started free",
            popular: false,
          },
          {
            name: "Pro",
            description: "For growing teams that need power and flexibility.",
            price: "$12",
            period: "/user/mo",
            features: [
              "Unlimited projects",
              "Advanced analytics",
              "Automated workflows",
              "Priority support",
            ],
            cta: "Start free trial",
            popular: true,
          },
          {
            name: "Enterprise",
            description:
              "For organizations with advanced security and scale needs.",
            price: "Custom",
            period: "",
            features: [
              "SSO & SCIM provisioning",
              "Dedicated success manager",
              "Custom contracts & SLA",
            ],
            cta: "Contact sales",
            popular: false,
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to get more done?"
    const ctaSub =
      props.cta?.subheading ??
      `Join 10,000+ teams already using ${brand} to ship faster and stress less.`
    const ctaPlaceholder = props.cta?.placeholder ?? "Enter your work email"
    const ctaAction = props.cta?.action ?? "Start free trial"
    const ctaNote =
      props.cta?.note ?? "No credit card required. 14-day free trial."

    const footerLinks = props.footer?.links?.length
      ? props.footer.links
      : ["Privacy", "Terms", "Security", "Contact"]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`

    // Shared logo mark — indigo tile + brand initial (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid size-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground",
          className,
        )}
      >
        {brand.charAt(0)}
      </span>
    )

    const Check = () => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 shrink-0 text-primary"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )

    const featureIcons: ReactNode[] = [
      <svg
        key="boards"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>,
      <svg
        key="collab"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>,
      <svg
        key="analytics"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>,
      <svg
        key="workflows"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>,
      <svg
        key="security"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>,
      <svg
        key="integrations"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>,
    ]

    // Chart bar heights — preserved from Kimi's nth-child rules.
    const barHeights = ["40%", "70%", "55%", "85%", "65%"]

    return (
      <div
        className={cn(
          "flex min-h-svh flex-col bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-background/60">
          <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-foreground"
            >
              <LogoMark />
              {brand}
            </button>
            <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
              {nav.map((label) => (
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
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => go("Log in")}
                className="hidden rounded-xl border border-border bg-muted/60 px-5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted sm:inline-flex"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => go(heroPrimary)}
                className="hidden rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-[0_4px_14px_rgba(79,70,229,0.35)] transition-colors hover:bg-primary/90 sm:inline-flex"
              >
                Get started
              </button>
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => go(nav[0])}
                className="grid size-10 place-items-center rounded-lg border border-border bg-background text-foreground md:hidden"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
          </nav>
        </header>

        <main className="flex flex-1 flex-col">
          {/* Hero */}
          <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-background pt-20 pb-28">
            <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[1fr_1.1fr]">
              <div className="text-center lg:text-left">
                <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-primary shadow-sm">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {heroBadge}
                </span>
                <h1 className="text-balance text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[3.6rem]">
                  {heroHeading}
                </h1>
                <p className="mx-auto mt-5 max-w-[48ch] text-lg leading-relaxed text-muted-foreground lg:mx-0">
                  {heroSub}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-[0_4px_14px_rgba(79,70,229,0.35)] transition-all hover:-translate-y-px hover:bg-primary/90"
                  >
                    {heroPrimary}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 px-7 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-muted"
                  >
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
                      <circle cx="12" cy="12" r="10" />
                      <polygon points="10 8 16 12 10 16 10 8" />
                    </svg>
                    {heroSecondary}
                  </button>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{heroNote}</p>
              </div>

              {/* Browser mockup / product visual (decorative). */}
              <div className="[perspective:1200px]" aria-hidden="true">
                <div className="group overflow-hidden rounded-2xl bg-card shadow-[0_30px_60px_-15px_rgba(0,0,0,0.18)] ring-1 ring-border transition-transform duration-500 [transform:rotateX(2deg)_rotateY(-2deg)] hover:[transform:rotateX(0deg)_rotateY(0deg)]">
                  {/* Browser header */}
                  <div className="flex items-center gap-3 border-b border-border bg-muted/60 px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="size-2.5 rounded-full bg-chart-1" />
                      <span className="size-2.5 rounded-full bg-chart-2" />
                      <span className="size-2.5 rounded-full bg-chart-3" />
                    </div>
                    <div className="flex-1 truncate rounded-md border border-border bg-background px-2.5 py-1 text-center text-[0.7rem] text-muted-foreground">
                      {appUrl}
                    </div>
                  </div>
                  {/* Browser body */}
                  <div className="flex min-h-[20rem]">
                    {/* App rail */}
                    <div className="flex w-14 flex-col items-center gap-4 border-r border-border bg-muted/60 py-3">
                      <span className="grid size-7 place-items-center rounded-md bg-primary text-[0.7rem] font-bold text-primary-foreground">
                        {brand.charAt(0)}
                      </span>
                      <span className="size-7 rounded-md bg-primary" />
                      <span className="size-7 rounded-md bg-muted-foreground/20" />
                      <span className="size-7 rounded-md bg-muted-foreground/20" />
                      <span className="size-7 rounded-md bg-muted-foreground/20" />
                    </div>
                    {/* App main */}
                    <div className="flex-1 p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="text-sm font-bold text-foreground">
                          {appTitle}
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="h-[22px] w-[60px] rounded bg-primary/90" />
                          <div className="flex">
                            <span className="size-[22px] rounded-full border-2 border-card bg-chart-4" />
                            <span className="-ml-1.5 size-[22px] rounded-full border-2 border-card bg-chart-5" />
                            <span className="-ml-1.5 size-[22px] rounded-full border-2 border-card bg-chart-3" />
                          </div>
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Chart widget */}
                        <div className="rounded-xl border border-border bg-muted/40 p-4">
                          <div className="mb-3 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
                            {chartTitle}
                          </div>
                          <div className="flex h-[5.625rem] items-end gap-2">
                            {barHeights.map((h, i) => (
                              <span
                                key={i}
                                style={{ height: h }}
                                className="flex-1 rounded-t bg-primary/85"
                              />
                            ))}
                          </div>
                        </div>
                        {/* Tasks widget */}
                        <div className="rounded-xl border border-border bg-muted/40 p-4">
                          <div className="mb-3 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
                            {tasksTitle}
                          </div>
                          <div className="flex flex-col gap-2.5">
                            {[false, false, false, true].map((checked, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "size-3.5 shrink-0 rounded border-2",
                                    checked
                                      ? "border-primary bg-primary"
                                      : "border-muted-foreground/30",
                                  )}
                                />
                                <span
                                  className={cn(
                                    "h-2 rounded-full bg-muted-foreground/20",
                                    checked ? "w-3/5" : "w-full",
                                  )}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logo bar */}
          <section className="border-y border-border py-10">
            <div className="mx-auto max-w-6xl px-6">
              <p className="mb-6 text-center text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
                {logoNames.map((name) => (
                  <span
                    key={name}
                    className="text-lg font-bold tracking-tight text-muted-foreground/60 transition-colors hover:text-muted-foreground"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-20">
            <div className="mx-auto max-w-6xl px-6">
              <div className="mx-auto mb-14 max-w-2xl text-center">
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {featuresHeading}
                </h2>
                <p className="mt-3 text-lg text-muted-foreground">
                  {featuresDesc}
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:border-muted-foreground/30 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]"
                  >
                    <div className="mb-4 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-1.5 text-[1.0625rem] font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-[0.92rem] leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonial */}
          <section className="bg-gradient-to-b from-muted/50 to-background py-20">
            <div className="mx-auto max-w-6xl px-6">
              <figure className="relative mx-auto max-w-3xl rounded-2xl border border-border bg-card px-8 py-12 text-center shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] sm:px-10">
                <span className="mx-auto mb-5 grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="none"
                    aria-hidden="true"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </span>
                <blockquote className="text-balance text-xl font-medium leading-snug text-foreground sm:text-2xl">
                  &ldquo;{testimonialQuote}&rdquo;
                </blockquote>
                <figcaption className="mt-7 flex items-center justify-center gap-3.5">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-base font-bold text-primary-foreground">
                    {testimonialName
                      .split(" ")
                      .map((w) => w.charAt(0))
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <div className="text-left">
                    <div className="text-[0.95rem] font-bold text-foreground">
                      {testimonialName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonialRole}
                    </div>
                  </div>
                </figcaption>
              </figure>
            </div>
          </section>

          {/* Pricing */}
          <section className="py-20">
            <div className="mx-auto max-w-6xl px-6">
              <div className="mx-auto mb-14 max-w-2xl text-center">
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="mt-3 text-lg text-muted-foreground">
                  {pricingDesc}
                </p>
              </div>
              <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative flex flex-col rounded-2xl border bg-card p-8 transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]",
                      plan.popular
                        ? "border-primary ring-1 ring-primary shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]"
                        : "border-border",
                    )}
                  >
                    {plan.popular ? (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-primary-foreground">
                        Most popular
                      </span>
                    ) : null}
                    <h3 className="text-lg font-bold text-foreground">
                      {plan.name}
                    </h3>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold tracking-tight text-foreground">
                        {plan.price}
                      </span>
                      {plan.period ? (
                        <span className="text-[0.95rem] font-medium text-muted-foreground">
                          {plan.period}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 mb-6 text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                    <ul className="mb-7 flex flex-1 flex-col gap-2.5">
                      {plan.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-center gap-2 text-[0.9rem] text-muted-foreground"
                        >
                          <Check />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "w-full rounded-xl px-5 py-2.5 text-sm font-semibold transition-all",
                        plan.popular
                          ? "bg-primary text-primary-foreground shadow-[0_4px_14px_rgba(79,70,229,0.35)] hover:-translate-y-px hover:bg-primary/90"
                          : "border border-border bg-muted/50 text-foreground hover:bg-muted",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA banner */}
          <section className="px-6 pb-20">
            <div className="mx-auto max-w-[calc(72rem-3rem)] rounded-2xl bg-foreground px-6 py-20 text-center text-background">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                {ctaHeading}
              </h2>
              <p className="mt-3 text-lg text-background/70">{ctaSub}</p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <input
                  type="email"
                  aria-label="Work email"
                  placeholder={ctaPlaceholder}
                  className="min-w-[16rem] rounded-xl border border-background/20 bg-background/10 px-4 py-3.5 text-base text-background outline-none placeholder:text-background/50 focus:border-ring"
                />
                <button
                  type="button"
                  onClick={() => go(ctaAction)}
                  className="rounded-xl bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {ctaAction}
                </button>
              </div>
              <p className="mt-4 text-sm text-background/60">{ctaNote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-center sm:flex-row sm:text-left">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-foreground"
            >
              <LogoMark className="size-6 text-xs" />
              {brand}
            </button>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
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
            <p className="text-sm text-muted-foreground">{footerCopyright}</p>
          </div>
        </footer>
      </div>
    )
  },
})
