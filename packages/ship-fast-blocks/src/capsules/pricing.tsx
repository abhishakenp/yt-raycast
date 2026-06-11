import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { Check, ChevronDown, Box } from "lucide-react"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * PricingKimiPage — a faithful Tailwind v4 port of a Kimi-generated "VaultCloud"
 * cloud-storage PRICING page. It owns its own sticky blurred-glass navbar, hero,
 * trust-logo row, 3-tier pricing grid, full feature-comparison table, accordion
 * FAQ, gradient CTA banner, and footer, so it works as a complete standalone page.
 *
 * Provenance preserved from the source HTML: VaultCloud brand + box mark, the
 * indigo (#4f46e5) / cyan (#06b6d4) accent palette, a centered hero ("Storage
 * that scales with your ambitions") with dual CTAs and a "no credit card" note,
 * a "Trusted by teams at" logo strip, exactly THREE tiers (Starter $9 / Pro $29
 * = Most Popular / Business $79 per user) with their real feature checklists, a
 * 14-row Starter/Pro/Business comparison table (yes / no / limited cells), a
 * 6-question FAQ accordion, and a dark indigo gradient closing CTA. Neutral base
 * uses theme tokens (bg-background / text-foreground / border) for dark mode,
 * while Kimi's indigo accent is kept for brand character. Callers supply ONLY
 * content; rich defaults sourced from the HTML render a complete page with no
 * props beyond brand + nav.
 */
export const PricingKimiPage = defineCapsule({
  name: "PricingKimiPage",
  description:
    "Faithful port of a Kimi 'VaultCloud' cloud-storage PRICING page. Sticky blurred glass navbar (Features / Pricing / FAQ / Enterprise), a centered hero ('Storage that scales with your ambitions') with dual CTAs and a no-credit-card note, a 'Trusted by teams at' logo strip, a 3-tier pricing grid (Starter $9 / Pro $29 = Most Popular / Business $79 per user) each with a real feature checklist and CTA, a full 14-row Starter/Pro/Business feature-comparison table (yes / cross / limited cells), a 6-question accordion FAQ, and a dark indigo gradient closing CTA banner. Use as the ROOT pricing/plans/subscription page for a cloud, storage, backup, or SaaS product when you want a clean, conversion-focused pricing layout with plan comparison + FAQ. Supply only content — brand, nav, hero, logos, plans, comparison, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / product name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section: heading + subheading + dual CTAs + reassurance note. */
    hero: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Trust / logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Pricing tiers. */
    plans: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string().describe("plan/tier name, e.g. Starter, Pro"),
              description: z.string().describe("one-line plan summary"),
              price: z
                .string()
                .describe("price as shown, e.g. 9 (rendered after a $)"),
              period: z
                .string()
                .describe("price suffix, e.g. / month or / user / month"),
              cta: z.string().describe("button label, e.g. Start free trial"),
              features: z
                .array(z.string())
                .describe("included features shown as a checklist"),
              isPopular: z
                .boolean()
                .optional()
                .describe("highlight this tier with a 'Most Popular' badge"),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Feature-comparison table. */
    comparison: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        /** Column headers AFTER the leading "Feature" column (one per plan). */
        columns: z.array(z.string()).optional(),
        /** Each row: a feature label + a cell per column. A cell is a string
         *  (rendered as text) or a boolean (rendered as a check / dash). */
        rows: z
          .array(
            z.object({
              feature: z.string(),
              values: z.array(z.union([z.string(), z.boolean()])),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Accordion FAQ. */
    faq: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Closing gradient CTA banner. */
    cta: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        action: z.string().optional(),
      })
      .optional(),
    /** Footer tagline / copyright / links. */
    footer: z
      .object({
        tagline: z.string().optional(),
        copyright: z.string().optional(),
        note: z.string().optional(),
        links: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [openFaq, setOpenFaq] = useState(0)

    const brand = props.brand ?? "VaultCloud"
    const navLinks =
      props.nav && props.nav.length > 0
        ? props.nav
        : ["Features", "Pricing", "FAQ", "Enterprise"]

    const heroHeading =
      props.hero?.heading ?? "Storage that scales with your ambitions"
    const heroSub =
      props.hero?.subheading ??
      "From solo creators to global teams, VaultCloud keeps your files safe, synced, and accessible — with straightforward pricing and no surprise fees."
    const heroPrimary = props.hero?.primaryCta ?? "See plans"
    const heroSecondary = props.hero?.secondaryCta ?? "Compare features"
    const heroNote =
      props.hero?.note ?? "No credit card required to start. Cancel anytime."

    const logosLabel = props.logos?.label ?? "Trusted by teams at"
    const logoItems =
      props.logos?.items && props.logos.items.length > 0
        ? props.logos.items
        : [
            "Acme Corp",
            "Stark Industries",
            "Waystar Royco",
            "Umbrella Inc",
            "Massive Dynamic",
          ]

    const plansHeading = props.plans?.heading ?? "Simple pricing for every stage"
    const plansSub =
      props.plans?.subheading ??
      "Choose a plan that fits your workflow. Upgrade or downgrade at any time — you’re never locked in."
    const plans =
      props.plans?.items && props.plans.items.length > 0
        ? props.plans.items
        : [
            {
              name: "Starter",
              description: "For individuals getting organized.",
              price: "9",
              period: "/ month",
              cta: "Start free trial",
              isPopular: false,
              features: [
                "100 GB secure storage",
                "Up to 3 shared folders",
                "Web & mobile apps",
                "30-day file recovery",
                "Email support",
              ],
            },
            {
              name: "Pro",
              description: "For power users who need speed.",
              price: "29",
              period: "/ month",
              cta: "Start free trial",
              isPopular: true,
              features: [
                "2 TB secure storage",
                "Unlimited shared folders",
                "Desktop sync (macOS, Windows, Linux)",
                "180-day file recovery",
                "Version history (30 days)",
                "Priority chat support",
              ],
            },
            {
              name: "Business",
              description: "For teams that need control.",
              price: "79",
              period: "/ user / month",
              cta: "Contact sales",
              isPopular: false,
              features: [
                "10 TB per user",
                "Admin dashboard & user roles",
                "SSO / SAML integration",
                "Audit logs & compliance",
                "1-year file recovery",
                "Dedicated account manager",
              ],
            },
          ]
    const normalizedPlans = plans.map((plan) => ({
      ...plan,
      features:
        Array.isArray(plan.features) && plan.features.length > 0
          ? plan.features
          : ["Core features included", "Flexible setup", "Support included"],
    }))

    const comparisonHeading =
      props.comparison?.heading ?? "Compare everything side-by-side"
    const comparisonSub =
      props.comparison?.subheading ??
      "See exactly what you get at every tier so you can choose with confidence."
    const columns =
      props.comparison?.columns && props.comparison.columns.length > 0
        ? props.comparison.columns
        : ["Starter", "Pro", "Business"]
    const rows =
      props.comparison?.rows && props.comparison.rows.length > 0
        ? props.comparison.rows
        : [
            { feature: "Storage", values: ["100 GB", "2 TB", "10 TB / user"] },
            { feature: "Max file size", values: ["2 GB", "50 GB", "Unlimited"] },
            {
              feature: "Shared folders",
              values: ["Up to 3", "Unlimited", "Unlimited"],
            },
            { feature: "Desktop sync", values: [false, true, true] },
            {
              feature: "Web & mobile apps",
              values: [true, true, true],
            },
            {
              feature: "Version history",
              values: [false, "30 days", "1 year"],
            },
            {
              feature: "File recovery",
              values: ["30 days", "180 days", "1 year"],
            },
            {
              feature: "Two-factor authentication",
              values: [true, true, true],
            },
            { feature: "SSO / SAML", values: [false, false, true] },
            { feature: "Admin dashboard", values: [false, false, true] },
            { feature: "Audit logs", values: [false, false, true] },
            {
              feature: "API access",
              values: ["Read-only", "Full access", "Full access"],
            },
            {
              feature: "Priority support",
              values: [false, "Chat", "Dedicated manager"],
            },
            { feature: "Custom onboarding", values: [false, false, true] },
          ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqSub =
      props.faq?.subheading ??
      "Everything you need to know before getting started. Can’t find what you’re looking for? Reach out to our team."
    const faqItems =
      props.faq?.items && props.faq.items.length > 0
        ? props.faq.items
        : [
            {
              question: "Can I change my plan later?",
              answer:
                "Yes. You can upgrade, downgrade, or cancel your plan at any time from your account settings. When you upgrade, you’ll get instant access to new features. If you downgrade, changes take effect at the start of your next billing cycle.",
            },
            {
              question: "Is there a free trial?",
              answer:
                "Absolutely. Every plan includes a 14-day free trial with full feature access. We don’t ask for a credit card to start, and you’ll get a reminder before the trial ends so you can decide without pressure.",
            },
            {
              question: "What happens if I exceed my storage limit?",
              answer:
                "We’ll notify you when you hit 80% and 95% of your limit. You can upgrade instantly or archive older files to free up space. We never delete your data without asking — uploads simply pause until you make room or upgrade.",
            },
            {
              question: "Do you offer refunds?",
              answer:
                "If you’re not satisfied, contact us within 30 days of your first payment for a full refund — no questions asked. After 30 days, you can still cancel anytime and won’t be billed again.",
            },
            {
              question: "How secure is VaultCloud?",
              answer:
                "Security is built in, not bolted on. All files are encrypted at rest with AES-256 and in transit with TLS 1.3. We offer two-factor authentication, optional client-side encryption on Business plans, and undergo annual SOC 2 Type II audits.",
            },
            {
              question: "Can I migrate from another provider?",
              answer:
                "Yes. Pro and Business plans include a self-serve migration tool that connects to Dropbox, Google Drive, OneDrive, and S3-compatible buckets. Business customers also get white-glove migration assistance from our onboarding team.",
            },
          ]

    const ctaHeading = props.cta?.heading ?? "Ready to get your files in order?"
    const ctaSub =
      props.cta?.subheading ??
      "Join thousands of teams who trust VaultCloud for fast, secure, and reliable storage. Start your free trial today — no credit card required."
    const ctaAction = props.cta?.action ?? "Get started for free"

    const footerTagline =
      props.footer?.tagline ??
      "Secure cloud storage that scales with your team. Built for speed, designed for trust."
    const footerLinks =
      props.footer?.links && props.footer.links.length > 0
        ? props.footer.links
        : ["Features", "Pricing", "Security", "About", "Privacy", "Terms"]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`
    const footerNote = props.footer?.note ?? "Built with care in San Francisco."

    return (
      <div
        className={cn(
          "flex min-h-svh flex-col bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Sticky blurred glass navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            <button
              type="button"
              onClick={() => go("Home")}
              className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight"
            >
              <span
                aria-hidden="true"
                className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground"
              >
                <Box className="size-5" strokeWidth={2.5} />
              </span>
              {brand}
            </button>

            <nav className="hidden items-center gap-1 md:flex">
              {navLinks.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="rounded-md px-3 py-2 text-[0.9375rem] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {label}
                </button>
              ))}
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              <button
                type="button"
                onClick={() => go("Sign in")}
                className="rounded-md px-3 py-2 text-[0.9375rem] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => go("Pricing")}
                className="rounded-lg bg-primary px-5 py-2.5 text-[0.9375rem] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get started
              </button>
            </div>

            <button
              type="button"
              onClick={() => go("Pricing")}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground md:hidden"
            >
              Get started
            </button>
          </div>
        </header>

        <main className="flex flex-1 flex-col">
          {/* Hero */}
          <section className="relative overflow-hidden px-6 pt-16 pb-12 text-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_50%_0%,var(--primary),transparent_60%),radial-gradient(800px_400px_at_70%_10%,var(--accent),transparent_55%)] opacity-10"
            />
            <div className="mx-auto max-w-3xl">
              <h1 className="mx-auto max-w-[18ch] text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]">
                {heroHeading}
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground text-pretty">
                {heroSub}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="rounded-xl bg-primary px-7 py-3.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {heroPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(heroSecondary)}
                  className="rounded-xl border border-border bg-card px-7 py-3.5 font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  {heroSecondary}
                </button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{heroNote}</p>
            </div>
          </section>

          {/* Trust logos */}
          <section className="border-t border-border px-6 py-10">
            <div className="mx-auto max-w-6xl">
              <p className="mb-6 text-center text-sm font-medium text-muted-foreground">
                {logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8">
                {logoItems.map((logo) => (
                  <span
                    key={logo}
                    className="text-base font-bold text-muted-foreground/70 transition-opacity hover:text-muted-foreground"
                  >
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing tiers */}
          <section id="pricing" className="px-6 py-16">
            <div className="mx-auto max-w-6xl">
              <div className="mx-auto mb-12 max-w-2xl text-center">
                <h2 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
                  {plansHeading}
                </h2>
                <p className="mt-3 text-[1.0625rem] text-muted-foreground text-pretty">
                  {plansSub}
                </p>
              </div>

              <div className="grid items-start gap-6 md:grid-cols-3">
                {normalizedPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative flex flex-col gap-6 rounded-3xl border bg-card px-6 py-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl",
                      plan.isPopular
                        ? "border-primary shadow-lg ring-1 ring-primary"
                        : "border-border shadow-sm",
                    )}
                  >
                    {plan.isPopular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3.5 py-1 text-xs font-bold tracking-wider text-primary-foreground uppercase">
                        Most Popular
                      </span>
                    )}
                    <div className="flex flex-col gap-2">
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      <p className="text-[0.9375rem] text-muted-foreground">
                        {plan.description}
                      </p>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">$</span>
                      <span className="text-5xl font-extrabold tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-[0.9375rem] text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "w-full rounded-lg px-5 py-2.5 text-[0.9375rem] font-semibold transition-colors",
                        plan.isPopular
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border border-border bg-card text-foreground hover:bg-muted",
                      )}
                    >
                      {plan.cta}
                    </button>
                    <ul className="flex flex-col gap-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-3 text-[0.9375rem] text-muted-foreground"
                        >
                          <Check
                            className="mt-0.5 size-4 shrink-0 text-primary"
                            strokeWidth={3}
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Feature comparison */}
          <section id="features" className="bg-muted/40 px-6 py-16">
            <div className="mx-auto max-w-6xl">
              <div className="mx-auto mb-10 max-w-2xl text-center">
                <h2 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
                  {comparisonHeading}
                </h2>
                <p className="mt-3 text-[1.0625rem] text-muted-foreground text-pretty">
                  {comparisonSub}
                </p>
              </div>
              <div
                className="overflow-x-auto rounded-2xl border border-border bg-card"
                tabIndex={0}
                role="region"
                aria-label="Feature comparison table"
              >
                <table className="w-full min-w-176 border-collapse text-[0.9375rem]">
                  <thead>
                    <tr>
                      <th className="w-2/5 border-b border-border px-6 py-4 text-left font-semibold">
                        Feature
                      </th>
                      {columns.map((col, i) => (
                        <th
                          key={col}
                          className={cn(
                            "w-1/5 border-b border-border px-6 py-4 text-center font-semibold",
                            i === columns.length - 1 && "text-primary",
                          )}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={row.feature}
                        className="transition-colors last:[&>td]:border-b-0 hover:bg-muted/50"
                      >
                        <td className="border-b border-border px-6 py-4 text-foreground">
                          {row.feature}
                        </td>
                        {row.values.map((value, i) => (
                          <td
                            key={`${row.feature}-${i}`}
                            className="border-b border-border px-6 py-4 text-center text-muted-foreground"
                          >
                            {typeof value === "boolean" ? (
                              value ? (
                                <span className="font-semibold text-primary">
                                  Included
                                </span>
                              ) : (
                                <span className="text-muted-foreground/60">
                                  —
                                </span>
                              )
                            ) : (
                              value
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="px-6 py-16">
            <div className="mx-auto max-w-6xl">
              <div className="mx-auto mb-10 max-w-2xl text-center">
                <h2 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="mt-3 text-[1.0625rem] text-muted-foreground text-pretty">
                  {faqSub}
                </p>
              </div>
              <div className="mx-auto flex max-w-3xl flex-col gap-4">
                {faqItems.map((item, i) => {
                  const open = openFaq === i
                  return (
                    <div
                      key={item.question}
                      className="overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
                    >
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setOpenFaq(open ? -1 : i)}
                        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold"
                      >
                        {item.question}
                        <ChevronDown
                          className={cn(
                            "size-5 shrink-0 text-muted-foreground transition-transform",
                            open && "rotate-180",
                          )}
                        />
                      </button>
                      <div
                        className={cn(
                          "grid transition-all duration-300",
                          open
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <div className="overflow-hidden">
                          <p className="px-6 pb-6 leading-relaxed text-muted-foreground">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Gradient CTA banner */}
          <section className="px-6 py-16">
            <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-foreground to-primary px-6 py-16 text-center text-background sm:px-12">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-35">
                <div className="absolute -top-40 -right-32 size-112 rounded-full bg-[radial-gradient(circle,var(--primary),transparent_70%)] blur-3xl" />
                <div className="absolute -bottom-32 -left-24 size-80 rounded-full bg-[radial-gradient(circle,var(--accent),transparent_70%)] blur-3xl" />
              </div>
              <div className="relative">
                <h2 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
                  {ctaHeading}
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-[1.0625rem] text-background/70 text-pretty">
                  {ctaSub}
                </p>
                <button
                  type="button"
                  onClick={() => go(ctaAction)}
                  className="mt-8 rounded-xl bg-primary px-7 py-3.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {ctaAction}
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-xs">
                <button
                  type="button"
                  onClick={() => go("Home")}
                  className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground"
                  >
                    <Box className="size-5" strokeWidth={2.5} />
                  </span>
                  {brand}
                </button>
                <p className="mt-3 text-[0.9375rem] text-muted-foreground">
                  {footerTagline}
                </p>
              </div>
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {footerLinks.map((label) => (
                  <li key={label}>
                    <button
                      type="button"
                      onClick={() => go(label)}
                      className="text-[0.9375rem] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
              <span>{footerCopyright}</span>
              <span>{footerNote}</span>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
