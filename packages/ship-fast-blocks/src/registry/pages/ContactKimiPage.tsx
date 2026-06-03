import { useState } from "react"
import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * ContactKimiPage — a complete, self-contained CONTACT page.
 *
 * A faithful Tailwind v4 port of the Kimi-generated "Orbit Digital" contact
 * design. It reproduces, in order: a glassy sticky navbar, a centered hero
 * (eyebrow + bold heading + lead), a two-up band pairing a contact form
 * (name / email / message + send) with an indigo-iconned contact-details card
 * (email, phone, office, hours + social row), a split office/map section (info
 * column + a real office photo standing in for the embedded map), and a
 * two-column FAQ accordion, over a themed surface with soft primary glow blobs.
 *
 * Kimi's identity is dark-themed (deep canvas, raised card surfaces) with a
 * primary accent + soft glow; the block expresses that aesthetic entirely
 * through semantic theme tokens (background / card / muted / primary / border)
 * so it flips with the active theme, while preserving the gradients, glow
 * blobs, card depth, focus rings and hover lifts. Every nav item / CTA / link
 * routes through `useNavigate` (never a dead "#"), and the navbar labels match
 * the `nav` array so PageSwitch can swap pages. Callers supply ONLY content
 * data; rich defaults sourced from the original HTML make it render great with
 * no props at all.
 */
export const ContactKimiPage = defineComponent({
  name: "ContactKimiPage",
  description:
    "Complete, polished CONTACT page with a premium dark indigo aesthetic (deep slate canvas, soft indigo/violet glow blobs, glassy navbar). Layout: centered hero (eyebrow + bold heading + lead), a two-up band pairing a working-looking contact form (full name / email / message + send button) with an indigo-iconned contact-details card (email, phone, office address, business hours) plus a social-links row, a split office/map section (directions + parking + accessibility notes alongside a real office photo), and a two-column FAQ accordion. Use as the CONTACT / 'get in touch' / support / book-a-demo page for SaaS, agencies, startups, studios, or any modern B2B site when a conversion-minded contact layout with form, contact details, location and FAQ is wanted. Supply content only — brand, nav, hero, form labels, contact details, office, faq, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / product name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Centered hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        lead: z.string().optional(),
      })
      .optional(),
    /** Contact form copy: field labels, placeholders, submit + confirmation. */
    form: z
      .object({
        nameLabel: z.string().optional(),
        namePlaceholder: z.string().optional(),
        emailLabel: z.string().optional(),
        emailPlaceholder: z.string().optional(),
        messageLabel: z.string().optional(),
        messagePlaceholder: z.string().optional(),
        submit: z.string().optional(),
        confirmation: z.string().optional(),
      })
      .optional(),
    /** Contact-details card: heading, items (icon + label + value) + social labels. */
    details: z
      .object({
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              icon: z
                .enum(["mail", "phone", "map-pin", "clock"])
                .optional(),
              label: z.string(),
              value: z.string(),
              /** Optional second line for the value (e.g. address line 2). */
              value2: z.string().optional(),
            }),
          )
          .optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    /** Split office / map section. */
    office: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        meta: z.array(z.string()).optional(),
        /** Alt text driving the office photo that stands in for the map. */
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** Two-column FAQ accordion. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Footer copyright line. */
    footer: z
      .object({
        copyright: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Orbit Digital"
    const nav = props.nav?.length
      ? props.nav
      : ["Home", "Features", "Pricing", "About", "Contact"]

    const heroEyebrow = props.hero?.eyebrow ?? "Get in Touch"
    const heroHeading = props.hero?.heading ?? "Let's start a conversation"
    const heroLead =
      props.hero?.lead ??
      "Whether you have a question about our services, pricing, need a demo, or anything else, our team is ready to answer all your questions."

    const nameLabel = props.form?.nameLabel ?? "Full Name"
    const namePlaceholder = props.form?.namePlaceholder ?? "John Doe"
    const emailLabel = props.form?.emailLabel ?? "Email Address"
    const emailPlaceholder = props.form?.emailPlaceholder ?? "john@company.com"
    const messageLabel = props.form?.messageLabel ?? "Message"
    const messagePlaceholder =
      props.form?.messagePlaceholder ??
      "Tell us about your project, timeline, and budget..."
    const submitLabel = props.form?.submit ?? "Send Message"
    const confirmation =
      props.form?.confirmation ??
      "Thanks for reaching out! We will get back to you shortly."

    const detailsHeading = props.details?.heading ?? "Contact Information"
    const detailItems = props.details?.items?.length
      ? props.details.items
      : [
          {
            icon: "mail" as const,
            label: "Email",
            value: "hello@orbitdigital.co",
          },
          {
            icon: "phone" as const,
            label: "Phone",
            value: "+1 (415) 555-1234",
          },
          {
            icon: "map-pin" as const,
            label: "Office",
            value: "1201 Mission Street, Suite 400",
            value2: "San Francisco, CA 94103",
          },
          {
            icon: "clock" as const,
            label: "Business Hours",
            value: "Mon — Fri: 9:00 AM – 6:00 PM PST",
          },
        ]
    const socials = props.details?.socials?.length
      ? props.details.socials
      : ["Twitter", "LinkedIn", "GitHub", "Instagram"]

    const officeHeading = props.office?.heading ?? "Visit our HQ"
    const officeDesc =
      props.office?.description ??
      "Our headquarters are located in the heart of San Francisco. We are always happy to welcome partners, clients, and friends for a coffee and a chat."
    const officeMeta = props.office?.meta?.length
      ? props.office.meta
      : [
          "12 min walk from Montgomery BART",
          "Parking available on-site",
          "Wheelchair accessible entrance",
        ]
    const officeImageAlt =
      props.office?.imageAlt ?? "San Francisco downtown office building"

    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know before reaching out. Can't find the answer you're looking for? Send us a message."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What is the typical response time?",
            answer:
              "We aim to respond to all inquiries within 24 hours during business days. For enterprise support, response times are under 2 hours.",
          },
          {
            question: "Do you offer custom pricing?",
            answer:
              "Yes. We tailor packages based on team size, usage volume, and feature requirements. Contact sales for a personalized quote.",
          },
          {
            question: "Can I schedule a product demo?",
            answer:
              "Absolutely. Use the form on this page or email us directly. We offer live demos with screen sharing and Q&A every Tuesday and Thursday.",
          },
          {
            question: "Where are your servers located?",
            answer:
              "Our infrastructure runs on a global edge network with core compute in US-East, EU-West, and APAC regions. Data residency options are available.",
          },
          {
            question: "Do you provide SLA guarantees?",
            answer:
              "Yes. Business plans include a 99.99% uptime SLA with credit-backed guarantees. Enterprise plans can negotiate custom SLAs.",
          },
          {
            question: "How do I report a security issue?",
            answer:
              "Please send sensitive reports to security@orbitdigital.co using our PGP key. We participate in responsible disclosure and offer bug bounties.",
          },
        ]

    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`

    const [openFaq, setOpenFaq] = useState<number | null>(null)

    // Decorative brand mark — indigo gradient tile + orbit glyph.
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-[0_4px_12px_rgba(0,0,0,0.4)]",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <ellipse cx="12" cy="12" rx="10" ry="4.5" />
        </svg>
      </span>
    )

    // Contact-detail icon set keyed by the schema enum.
    const detailIcons: Record<string, ReactNode> = {
      mail: (
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
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      ),
      phone: (
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
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
      "map-pin": (
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
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      clock: (
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
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    }

    // Small inline icons for the office meta rows.
    const metaIcons: ReactNode[] = [
      <svg
        key="nav"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>,
      <svg
        key="car"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 17h2v-3.34a4 4 0 0 0-.8-2.4L18 8H6L3.8 11.26a4 4 0 0 0-.8 2.4V17h2" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>,
      <svg
        key="access"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="16" cy="4" r="1" />
        <path d="m18 19-1-7-6 1.5" />
        <path d="M5 8.5 9 7l1.5 4 4 1.5" />
        <path d="M4.24 19.5a5 5 0 1 0 6.88-6.55" />
      </svg>,
    ]

    // Social glyph paths, keyed loosely by label.
    const socialPath = (label: string) => {
      const l = label.toLowerCase()
      if (l.includes("linkedin"))
        return {
          path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z",
          extra: true,
        }
      if (l.includes("github"))
        return {
          path: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22",
          extra: false,
        }
      if (l.includes("instagram"))
        return {
          path: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z",
          extra: false,
          insta: true,
        }
      // default: twitter / x
      return {
        path: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z",
        extra: false,
      }
    }

    return (
      <div
        className={cn(
          "relative flex min-h-svh flex-col overflow-hidden bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Decorative glow blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed -top-44 -left-28 size-[500px] rounded-full bg-primary/20 blur-[90px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed -bottom-32 -right-24 size-[420px] rounded-full bg-accent/15 blur-[90px]"
        />

        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <nav className="mx-auto flex h-16 max-w-[1160px] items-center justify-between px-6">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-foreground"
            >
              <LogoMark />
              {brand}
            </button>
            <ul className="hidden items-center gap-8 text-[0.9375rem] font-medium text-muted-foreground md:flex">
              {nav.map((label) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => go(label)}
                    className="transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => go("Contact")}
              className="rounded-[10px] bg-primary px-5 py-2.5 text-[0.9375rem] font-semibold text-primary-foreground shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-px hover:bg-primary/90 hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
            >
              Get Started
            </button>
          </nav>
        </header>

        <main className="relative z-[1] mx-auto w-full max-w-[1160px] px-6">
          {/* Hero */}
          <section className="pt-20 pb-14 text-center">
            <span className="mb-[18px] inline-flex items-center gap-2 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-primary">
              <span
                aria-hidden="true"
                className="inline-block h-0.5 w-7 rounded-full bg-primary"
              />
              {heroEyebrow}
            </span>
            <h1 className="mx-auto mb-[18px] max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-[3.4rem]">
              {heroHeading}
            </h1>
            <p className="mx-auto max-w-[560px] text-lg leading-[1.7] text-muted-foreground">
              {heroLead}
            </p>
          </section>

          {/* Form + details */}
          <section className="grid items-start gap-10 lg:grid-cols-2">
            {/* Contact form */}
            <div className="rounded-2xl border border-border bg-card p-9 shadow-[0_24px_64px_rgba(0,0,0,0.45)] transition-colors hover:border-border/60">
              <h2 className="sr-only">Contact form</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  go("Contact")
                }}
              >
                <div className="mb-[22px]">
                  <label
                    htmlFor="ck-name"
                    className="mb-2 block text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
                  >
                    {nameLabel}
                  </label>
                  <input
                    type="text"
                    id="ck-name"
                    name="name"
                    placeholder={namePlaceholder}
                    className="w-full rounded-[10px] border border-input bg-background px-4 py-3.5 text-[0.97rem] text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/50"
                  />
                </div>
                <div className="mb-[22px]">
                  <label
                    htmlFor="ck-email"
                    className="mb-2 block text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
                  >
                    {emailLabel}
                  </label>
                  <input
                    type="email"
                    id="ck-email"
                    name="email"
                    placeholder={emailPlaceholder}
                    className="w-full rounded-[10px] border border-input bg-background px-4 py-3.5 text-[0.97rem] text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/50"
                  />
                </div>
                <div className="mb-[22px]">
                  <label
                    htmlFor="ck-message"
                    className="mb-2 block text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
                  >
                    {messageLabel}
                  </label>
                  <textarea
                    id="ck-message"
                    name="message"
                    placeholder={messagePlaceholder}
                    className="min-h-[140px] w-full resize-y rounded-[10px] border border-input bg-background px-4 py-3.5 text-[0.97rem] text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/50"
                  />
                </div>
                <p className="sr-only" aria-live="polite">
                  {confirmation}
                </p>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2.5 rounded-[10px] bg-primary px-7 py-4 text-[0.95rem] font-semibold text-primary-foreground transition-all hover:-translate-y-px hover:bg-primary/90 hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)] active:translate-y-0"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M22 2 11 13" />
                    <path d="M22 2 15 22l-4-9-9-4 20-7z" />
                  </svg>
                  {submitLabel}
                </button>
              </form>
            </div>

            {/* Contact details */}
            <div className="rounded-2xl border border-border bg-card p-9 shadow-[0_24px_64px_rgba(0,0,0,0.45)] transition-colors hover:border-border/60">
              <h2 className="mb-[22px] text-xl font-bold text-foreground">
                {detailsHeading}
              </h2>
              <div className="flex flex-col gap-[22px]">
                {detailItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-4 rounded-[10px] border border-transparent bg-muted/40 p-[18px] transition-all hover:border-border hover:bg-muted/60"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                      {detailIcons[item.icon ?? "mail"]}
                    </span>
                    <div>
                      <h3 className="mb-0.5 text-[0.95rem] font-semibold text-foreground">
                        {item.label}
                      </h3>
                      <p className="text-[0.9rem] leading-[1.5] text-muted-foreground">
                        {item.value}
                        {item.value2 ? (
                          <>
                            <br />
                            {item.value2}
                          </>
                        ) : null}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-2.5">
                {socials.map((label) => {
                  const s = socialPath(label)
                  return (
                    <button
                      key={label}
                      type="button"
                      aria-label={label}
                      onClick={() => go(label)}
                      className="grid size-[42px] place-items-center rounded-xl border border-border bg-background text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        {s.insta ? (
                          <>
                            <rect
                              x="2"
                              y="2"
                              width="20"
                              height="20"
                              rx="5"
                              ry="5"
                            />
                            <path d={s.path} />
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                          </>
                        ) : s.extra ? (
                          <>
                            <path d={s.path} />
                            <rect x="2" y="9" width="4" height="12" />
                            <circle cx="4" cy="4" r="2" />
                          </>
                        ) : (
                          <path d={s.path} />
                        )}
                      </svg>
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Office / Map */}
          <section className="mt-16 grid overflow-hidden rounded-2xl border border-border shadow-[0_24px_64px_rgba(0,0,0,0.45)] md:grid-cols-[1fr_1.3fr]">
            <div className="flex flex-col justify-center bg-card p-11">
              <h2 className="mb-2.5 text-2xl font-bold text-foreground">
                {officeHeading}
              </h2>
              <p className="mb-6 text-[0.95rem] leading-[1.7] text-muted-foreground">
                {officeDesc}
              </p>
              <div className="flex flex-col gap-3.5">
                {officeMeta.map((line, i) => (
                  <div
                    key={line}
                    className="flex items-center gap-2.5 text-[0.92rem] text-muted-foreground"
                  >
                    <span className="text-primary">
                      {metaIcons[i % metaIcons.length]}
                    </span>
                    {line}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative min-h-[260px] bg-muted md:min-h-[340px]">
              <Image
                alt={officeImageAlt}
                w={900}
                h={680}
                loading="lazy"
                className="absolute inset-0 size-full object-cover"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-background/70 via-transparent to-primary/10"
              />
              <span className="absolute bottom-4 left-4 grid size-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-20 mb-24">
            <div className="mb-11 text-center">
              <h2 className="mb-2.5 text-[1.9rem] font-bold text-foreground">
                {faqHeading}
              </h2>
              <p className="mx-auto max-w-[480px] text-muted-foreground">{faqDesc}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {faqItems.map((item, i) => {
                const open = openFaq === i
                return (
                  <div
                    key={item.question}
                    className={cn(
                      "rounded-[10px] border border-border px-[22px] py-[18px] transition-colors hover:border-border/60",
                      open ? "bg-muted/40" : "bg-card",
                    )}
                  >
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="flex w-full items-center justify-between gap-3 text-left text-[0.98rem] font-semibold leading-[1.4] text-foreground"
                    >
                      {item.question}
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className={cn(
                          "shrink-0 transition-transform",
                          open ? "rotate-180 text-primary" : "text-muted-foreground",
                        )}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    <div
                      className={cn(
                        "grid overflow-hidden transition-all duration-300",
                        open
                          ? "grid-rows-[1fr] pt-3 opacity-100"
                          : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <p className="min-h-0 text-[0.92rem] leading-[1.7] text-muted-foreground">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="relative z-[1] border-t border-border py-9 text-center text-[0.85rem] text-muted-foreground">
          <div className="mx-auto max-w-[1160px] px-6">{footerCopyright}</div>
        </footer>
      </div>
    )
  },
})
