import { type FormEvent, type ReactNode, useState } from "react"
import { z } from "zod/v4"
import { number, string, table } from "@ship-fast/lakebed/server"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "#/components/ui/sheet.tsx"

/**
 * ComingSoonKimiPage — a complete, self-contained "launching soon" / waitlist
 * pre-launch LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Nexus — Launching Soon"
 * design: a calm, minimal, editorial light aesthetic with airy whitespace,
 * thin display type, and quiet neutral surfaces. It pairs a centered hero
 * (launch-date eyebrow + light headline + waitlist email capture) with a
 * four-cell countdown timer (Days / Hours / Minutes / Seconds), a trusted-by
 * logo strip, a 6-up product feature grid with line icons, a 3-up early-access
 * testimonial wall with star ratings and avatars, a 3-tier pricing table with a
 * highlighted "Most Popular" plan, an accordion FAQ, a final email-capture CTA
 * band, and a slim two-row footer with social links.
 *
 * The block owns ALL layout, spacing, type hierarchy and depth. Surfaces use
 * semantic theme tokens only (background / card / muted / primary), so it stays
 * theme-injectable. Every nav item, CTA, plan button, FAQ, social and footer
 * link routes through `useNavigate` (never a dead "#"), and both email forms
 * submit through `go()`. Testimonial avatars use the alt-driven <Image>
 * component (never a raw src). Callers supply ONLY content; rich defaults make
 * it render great with no props at all.
 */
export const ComingSoonKimiPage = defineCapsule({
  name: "ComingSoonKimiPage",
  description:
    "Complete 'launching soon' / pre-launch / coming-soon waitlist LANDING page with a calm, minimal, editorial light aesthetic: airy whitespace, thin display headline, quiet neutral surfaces. Includes a centered hero with a launch-date eyebrow, a big light headline, a waitlist email-capture form and an early-access incentive line; a four-cell countdown timer (Days/Hours/Minutes/Seconds); a 'Trusted by teams at' logo strip; a 6-up product feature grid with line icons (real-time sync, security, boards, chat, docs, automations); a 3-up early-access testimonial wall with 5-star ratings and avatar headshots; a 3-tier pricing table (Starter / Pro 'Most Popular' / Enterprise) with feature checklists; an accordion FAQ; a final email-capture CTA band with a contact email; and a slim footer with social and legal links. Use as the ROOT/home page for products that are not yet launched — SaaS waitlists, app pre-launch, beta sign-ups, countdown / 'notify me' / early-access landing pages — when a clean, premium, conversion-focused pre-launch page with countdown, waitlist capture and social proof is wanted. Supply content only — brand, nav, hero, countdown, logos, features, testimonials, pricing, faq, cta, footer; the block owns all layout and styling.",
  lakebed: {
    schema: {
      waitlistEntries: table({
        email: string(),
        source: string(),
        count: number(),
      }),
    },
    queries: {
      waitlistEntries: ({ db }) =>
        db.waitlistEntries.orderBy("createdAt").all(),
    },
    mutations: {
      addWaitlistEntry: ({ db }, email: string, source: string) => {
        const normalizedEmail = email.trim().toLowerCase()
        if (!normalizedEmail) return db.waitlistEntries.all()

        const existing = db.waitlistEntries
          .where("email", normalizedEmail)
          .all()[0]

        if (existing) {
          const sameSource = existing.source
            .split(",")
            .map((item) => item.trim())
            .includes(source)

          db.waitlistEntries.update(existing.id, {
            source: sameSource
              ? existing.source
              : existing.source
                  ? `${existing.source}, ${source}`
                  : source,
            count: existing.count + 1,
          })

          return db.waitlistEntries.all()
        }

        db.waitlistEntries.insert({
          email: normalizedEmail,
          source,
          count: 1,
        })

        return db.waitlistEntries.all()
      },
      removeWaitlistEntry: ({ db }, id: string) => {
        const entry = db.waitlistEntries.get(id)
        if (entry) {
          db.waitlistEntries.delete(entry.id)
        }

        return db.waitlistEntries.all()
      },
      clearWaitlistEntries: ({ db }) => {
        for (const entry of db.waitlistEntries.all()) {
          db.waitlistEntries.delete(entry.id)
        }

        return []
      },
    },
  },
  props: z.object({
    /** Brand / product name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Centered hero: launch eyebrow, headline, waitlist capture. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        headingTop: z.string().optional(),
        /** Phrase rendered with the emphasis weight on its own line. */
        headingEmphasis: z.string().optional(),
        subheading: z.string().optional(),
        emailPlaceholder: z.string().optional(),
        submit: z.string().optional(),
        disclaimer: z.string().optional(),
      })
      .optional(),
    /** Four-cell countdown timer beneath the hero copy. */
    countdown: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** Trusted-by logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        names: z.array(z.string()).optional(),
      })
      .optional(),
    /** Product feature grid. */
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Early-access testimonial wall. */
    testimonials: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
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
    /** Three-tier pricing table. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              period: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Accordion FAQ. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Final email-capture CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        emailPlaceholder: z.string().optional(),
        submit: z.string().optional(),
        contactPrefix: z.string().optional(),
        contactEmail: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        note: z.string().optional(),
        copyright: z.string().optional(),
        socials: z.array(z.string()).optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [drawerOpen, setDrawerOpen] = useState(false)
    const brand = props.brand ?? "Nexus"
    const nav = props.nav?.length ? props.nav : ["Features", "Join Waitlist"]

    const storedWaitlistEntries = lakebed.useQuery("waitlistEntries")
    const addWaitlistEntry = lakebed.useMutation("addWaitlistEntry")
    const removeWaitlistEntry = lakebed.useMutation("removeWaitlistEntry")
    const clearWaitlistEntries = lakebed.useMutation("clearWaitlistEntries")
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authLabel = auth.isLoading
      ? "Checking..."
      : isSignedIn
        ? auth.displayName || auth.email || "Account"
        : "Sign in"

    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }

    const handleSignOut = () => {
      lakebed.signOut()
    }

    const waitlistEntries = storedWaitlistEntries ?? []
    const waitlistCount = waitlistEntries.length

    const handleWaitlistSubmit = (source: string, e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const email = String(new FormData(e.currentTarget).get("email") ?? "").trim()
      if (!email) return

      void addWaitlistEntry(email, source)
      e.currentTarget.reset()
      setDrawerOpen(true)
    }

    const heroEyebrow = props.hero?.eyebrow ?? "Launching March 15, 2025"
    const headingTop = props.hero?.headingTop ?? "The future of"
    const headingEmphasis =
      props.hero?.headingEmphasis ?? "collaborative work"
    const heroSub =
      props.hero?.subheading ??
      "Nexus brings your team's documents, conversations, and workflows into one beautiful, unified space. Join 12,000+ teams on the waitlist."
    const heroPlaceholder = props.hero?.emailPlaceholder ?? "Enter your email"
    const heroSubmit = props.hero?.submit ?? "Join Waitlist"
    const heroDisclaimer =
      props.hero?.disclaimer ??
      "Early access members receive 50% off for 6 months. No spam, unsubscribe anytime."

    const countdown = props.countdown?.length
      ? props.countdown
      : [
          { value: "00", label: "Days" },
          { value: "00", label: "Hours" },
          { value: "00", label: "Minutes" },
          { value: "00", label: "Seconds" },
        ]

    const logosHeading = props.logos?.heading ?? "Trusted by teams at"
    const logoNames = props.logos?.names?.length
      ? props.logos.names
      : ["Notion", "Linear", "Vercel", "Figma", "Stripe", "Shopify"]

    const featuresHeading = props.features?.heading ?? "Everything you need"
    const featuresDesc =
      props.features?.description ??
      "Built for modern teams who value clarity, speed, and thoughtful design."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Real-time Sync",
            description:
              "Changes appear instantly across all devices. No refresh needed, no version conflicts.",
          },
          {
            title: "Enterprise Security",
            description:
              "SOC 2 Type II certified with end-to-end encryption. Your data stays yours.",
          },
          {
            title: "Smart Boards",
            description:
              "Visual canvases that connect to your data. Drag, drop, and watch ideas come alive.",
          },
          {
            title: "Contextual Chat",
            description:
              "Discuss work where it happens. Comments, DMs, and channels unified in one stream.",
          },
          {
            title: "Living Documents",
            description:
              "Docs that stay current. Embed data, automate updates, track changes effortlessly.",
          },
          {
            title: "Workflow Automations",
            description:
              "Build custom workflows without code. Connect 100+ apps and automate the routine.",
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Early access feedback"
    const testimonialsDesc =
      props.testimonials?.description ??
      "From design, engineering, and product teams already using Nexus"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Nexus replaced four tools in our stack. The unified workspace has transformed how our remote team collaborates.",
            name: "Sarah Chen",
            role: "Product Lead, Linear",
            avatarAlt:
              "Professional headshot of Sarah Chen, a smiling product manager with dark hair",
          },
          {
            quote:
              "The smart boards feature alone saved us 10 hours a week. Finally, a tool that thinks like designers do.",
            name: "Marcus Williams",
            role: "UX Director, Figma",
            avatarAlt:
              "Professional headshot of Marcus Williams, a bearded UX designer in his 30s",
          },
          {
            quote:
              "Security was our top concern. Nexus exceeded every compliance requirement our enterprise clients demand.",
            name: "David Park",
            role: "CTO, Vercel",
            avatarAlt:
              "Professional headshot of David Park, a CTO wearing glasses with a confident smile",
          },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Choose the plan that fits your team. All plans include a 14-day free trial."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Starter",
            tagline: "For small teams getting started",
            price: "$0",
            period: "/month",
            features: [
              "Up to 5 team members",
              "10GB storage",
              "Basic integrations",
              "Community support",
            ],
            cta: "Get started free",
            featured: false,
          },
          {
            name: "Pro",
            tagline: "For growing teams",
            price: "$12",
            period: "/user/month",
            features: [
              "Unlimited team members",
              "100GB storage",
              "Advanced integrations",
              "Priority support",
              "Analytics dashboard",
            ],
            cta: "Start 14-day trial",
            featured: true,
            badge: "Most Popular",
          },
          {
            name: "Enterprise",
            tagline: "For large organizations",
            price: "$49",
            period: "/user/month",
            features: [
              "Everything in Pro",
              "Unlimited storage",
              "SSO & SCIM",
              "Custom contracts",
              "Dedicated success manager",
            ],
            cta: "Contact sales",
            featured: false,
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ?? "Everything you need to know about Nexus"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "When will Nexus officially launch?",
            answer:
              "Nexus officially launches on March 15, 2025. Waitlist members will receive early access starting March 1st, two weeks before the public launch. Early access includes exclusive onboarding sessions with our founding team.",
          },
          {
            question:
              "Can I import data from Notion, Confluence, or other tools?",
            answer:
              "Yes. We offer one-click import from Notion, Confluence, Google Docs, Dropbox Paper, and more. Our import engine preserves formatting, comments, and file attachments. Enterprise plans include assisted migration with a dedicated specialist.",
          },
          {
            question: "Is there a free plan available?",
            answer:
              "Absolutely. Our Starter plan is free forever for up to 5 team members. It includes 10GB storage, core features, and community support. It's perfect for small teams, personal projects, or trying Nexus before committing.",
          },
          {
            question: "How does the 50% early access discount work?",
            answer:
              "Waitlist members who sign up before launch receive 50% off any paid plan for their first 6 months. This discount applies to both monthly and annual billing. The discount is automatically applied when you upgrade from your free trial.",
          },
          {
            question: "What security certifications does Nexus have?",
            answer:
              "Nexus is SOC 2 Type II certified, GDPR compliant, and HIPAA ready. We use end-to-end encryption for all data at rest and in transit. Enterprise customers can opt for dedicated infrastructure with custom data residency requirements.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? "Ready to transform how your team works?"
    const ctaDesc =
      props.cta?.description ??
      "Join 12,000+ teams on the waitlist. Early access members save 50% for 6 months."
    const ctaPlaceholder = props.cta?.emailPlaceholder ?? "Enter your email"
    const ctaSubmit = props.cta?.submit ?? "Get early access"
    const ctaContactPrefix = props.cta?.contactPrefix ?? "Questions? Reach us at"
    const ctaContactEmail = props.cta?.contactEmail ?? "hello@nexus.app"

    const footerNote = props.footer?.note ?? "Launching March 2025"
    const footerCopyright =
      props.footer?.copyright ?? `© 2025 ${brand} Inc. All rights reserved.`
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Twitter", "LinkedIn", "GitHub"]
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy", "Terms"]

    const featureIcons: ReactNode[] = [
      // bolt — real-time sync
      <svg
        key="bolt"
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
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>,
      // lock — security
      <svg
        key="lock"
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
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>,
      // boards
      <svg
        key="boards"
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
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
      </svg>,
      // chat
      <svg
        key="chat"
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
          d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
        />
      </svg>,
      // document
      <svg
        key="document"
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
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>,
      // automations
      <svg
        key="automations"
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
          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
        />
      </svg>,
    ]

    const Star = () => (
      <svg
        className="size-4 text-primary"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-5 shrink-0", className)}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
    )

    const inputCls =
      "flex-1 rounded-lg border border-input bg-background px-5 py-3.5 text-sm text-foreground placeholder-muted-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"

    const submitCls =
      "whitespace-nowrap rounded-lg bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"

    const formatEntryDate = (
      value: string | number | Date | undefined | null,
    ) => {
      if (!value) return "—"

      const parsed = new Date(value)
      if (Number.isNaN(parsed.getTime())) return "—"

      return parsed.toLocaleString()
    }

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <nav className="w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-12">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <button
              type="button"
              onClick={() => go(brand)}
              aria-label={`${brand} Home`}
              className="text-xl font-semibold tracking-tight text-foreground"
            >
              {brand}
            </button>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                {nav[0]}
              </button>
              <button
                type="button"
                onClick={() => go(nav[nav.length - 1])}
                className="border-b border-foreground text-sm font-medium text-foreground transition-colors hover:border-muted-foreground hover:text-muted-foreground"
              >
                {nav[nav.length - 1]}
              </button>
              <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="relative flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground sm:text-sm"
                  >
                    <span>Waitlist</span>
                    <span className="grid size-6 place-items-center rounded-full bg-foreground/10 px-1.5 py-0.5 text-[11px] font-semibold text-foreground">
                      {waitlistCount}
                    </span>
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="flex w-full flex-col sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border pb-4">
                    <SheetTitle>Waitlist entries</SheetTitle>
                    <SheetDescription>
                      {waitlistCount === 0
                        ? "No submissions yet. Capture one from the hero or CTA form."
                        : `${waitlistCount} captured lead${waitlistCount === 1 ? "" : "s"} for this session.`}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-4">
                    {waitlistEntries.length ? (
                      <div className="space-y-4">
                        {waitlistEntries.map((entry) => (
                          <div
                            key={entry.id}
                            className="rounded-lg border border-border bg-muted/40 p-3"
                          >
                            <p className="font-medium text-sm text-foreground">
                              {entry.email}
                            </p>
                            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                              <span className="mr-2">
                                {entry.source || "Direct"}
                                {entry.count > 1 ? ` (${entry.count}x)` : ""}
                              </span>
                              <span>{formatEntryDate(entry.createdAt)}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => void removeWaitlistEntry(entry.id)}
                              className="mt-3 text-xs font-medium text-destructive hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center">
                        <p className="text-sm text-muted-foreground">
                          No waitlist submissions yet.
                        </p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border px-6 py-4">
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        <p>
                          Signed in as{" "}
                          <span className="font-medium text-foreground">
                            {authLabel}
                          </span>
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        {isSignedIn ? (
                          <button
                            type="button"
                            onClick={handleSignOut}
                            className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:text-foreground"
                          >
                            Sign out
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSignIn}
                            disabled={auth.isLoading}
                            className="inline-flex items-center justify-center rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {authLabel}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => void clearWaitlistEntries()}
                          disabled={waitlistCount === 0}
                          className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Clear all
                        </button>
                        <SheetClose asChild>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                          >
                            Close
                          </button>
                        </SheetClose>
                      </div>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <header className="w-full px-4 pb-24 pt-16 sm:px-6 sm:pb-32 sm:pt-24 lg:px-8 lg:pb-40 lg:pt-32 xl:px-12">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-6 text-xs font-medium uppercase tracking-widest text-muted-foreground sm:text-sm">
              {heroEyebrow}
            </p>
            <h1 className="mb-8 text-4xl font-light leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
              {headingTop}
              <br className="hidden sm:block" />{" "}
              <span className="font-normal">{headingEmphasis}</span>
            </h1>
            <p className="mx-auto mb-12 max-w-2xl text-lg font-light leading-relaxed text-muted-foreground sm:text-xl">
              {heroSub}
            </p>

            {/* Countdown timer */}
            <div
              className="mb-12 flex flex-wrap justify-center gap-4 sm:gap-6"
              aria-label="Time remaining until launch"
            >
              {countdown.map((unit) => (
                <div key={unit.label} className="flex flex-col items-center">
                  <div className="flex size-16 items-center justify-center rounded-lg border border-border bg-card shadow-sm sm:size-20">
                    <span className="text-2xl font-light text-card-foreground sm:text-3xl">
                      {unit.value}
                    </span>
                  </div>
                  <span className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Email capture */}
            <form
              className="mx-auto max-w-md"
              aria-label="Join the waitlist"
              onSubmit={(e) => void handleWaitlistSubmit("Hero Form", e)}
            >
              <div className="flex flex-col gap-3 sm:flex-row">
                <label htmlFor="hero-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="hero-email"
                  type="email"
                  name="email"
                  required
                  placeholder={heroPlaceholder}
                  className={inputCls}
                />
                <button type="submit" className={submitCls}>
                  {heroSubmit}
                </button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {heroDisclaimer}
              </p>
            </form>
          </div>
        </header>

        {/* Logos */}
        <section
          className="w-full border-t border-border px-4 py-16 sm:px-6 lg:px-8 xl:px-12"
          aria-label="Trusted by innovative teams"
        >
          <div className="mx-auto max-w-6xl">
            <p className="mb-10 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {logosHeading}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 opacity-60 sm:gap-x-16 lg:gap-x-20">
              {logoNames.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => go(name)}
                  className="text-lg font-semibold tracking-tight text-muted-foreground sm:text-xl"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="w-full px-4 py-24 sm:px-6 sm:py-32 lg:px-8 xl:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-20 text-center">
              <h2 className="mb-4 text-2xl font-light text-foreground sm:text-3xl lg:text-4xl">
                {featuresHeading}
              </h2>
              <p className="mx-auto max-w-xl font-light text-muted-foreground">
                {featuresDesc}
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
              {featureItems.map((item, i) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-border bg-card p-8 shadow-sm"
                >
                  <div className="mb-6 flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    {featureIcons[i % featureIcons.length]}
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-card-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full bg-card px-4 py-24 sm:px-6 sm:py-32 lg:px-8 xl:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-2xl font-light text-foreground sm:text-3xl lg:text-4xl">
                {testimonialsHeading}
              </h2>
              <p className="font-light text-muted-foreground">
                {testimonialsDesc}
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {testimonialItems.map((t) => (
                <blockquote
                  key={t.name}
                  className="rounded-xl border border-border bg-muted p-8"
                >
                  <div
                    className="mb-4 flex items-center gap-1"
                    aria-label="5 star rating"
                  >
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} />
                    ))}
                  </div>
                  <p className="mb-6 leading-relaxed text-foreground/80">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="flex items-center gap-3">
                    <Image
                      alt={t.avatarAlt}
                      w={96}
                      h={96}
                      loading="lazy"
                      className="size-10 rounded-full object-cover"
                    />
                    <div>
                      <cite className="text-sm font-medium not-italic text-foreground">
                        {t.name}
                      </cite>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="w-full px-4 py-24 sm:px-6 sm:py-32 lg:px-8 xl:px-12">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-2xl font-light text-foreground sm:text-3xl lg:text-4xl">
                {pricingHeading}
              </h2>
              <p className="font-light text-muted-foreground">{pricingDesc}</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={cn(
                    "relative rounded-xl p-8",
                    plan.featured
                      ? "border border-primary bg-primary text-primary-foreground shadow-lg"
                      : "border border-border bg-card text-card-foreground shadow-sm",
                  )}
                >
                  {plan.featured && plan.badge ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-card px-3 py-1 text-xs font-medium text-card-foreground">
                        {plan.badge}
                      </span>
                    </div>
                  ) : null}
                  <h3
                    className={cn(
                      "mb-2 text-lg font-medium",
                      plan.featured
                        ? "text-primary-foreground"
                        : "text-card-foreground",
                    )}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={cn(
                      "mb-6 text-sm",
                      plan.featured
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground",
                    )}
                  >
                    {plan.tagline}
                  </p>
                  <div className="mb-6">
                    <span
                      className={cn(
                        "text-4xl font-light",
                        plan.featured
                          ? "text-primary-foreground"
                          : "text-card-foreground",
                      )}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={cn(
                        plan.featured
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground",
                      )}
                    >
                      {plan.period}
                    </span>
                  </div>
                  <ul className="mb-8 space-y-3" role="list">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className={cn(
                          "flex items-start gap-3 text-sm",
                          plan.featured
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground",
                        )}
                      >
                        <Check
                          className={cn(
                            "mt-0.5",
                            plan.featured
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground/60",
                          )}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => go(plan.cta)}
                    className={cn(
                      "w-full rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                      plan.featured
                        ? "bg-card text-card-foreground hover:bg-muted"
                        : "border border-input text-muted-foreground hover:border-foreground hover:text-foreground",
                    )}
                  >
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="w-full bg-card px-4 py-24 sm:px-6 sm:py-32 lg:px-8 xl:px-12">
          <div className="mx-auto max-w-3xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-2xl font-light text-foreground sm:text-3xl lg:text-4xl">
                {faqHeading}
              </h2>
              <p className="font-light text-muted-foreground">{faqDesc}</p>
            </div>

            <div className="space-y-4">
              {faqItems.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-lg border border-border bg-muted open:bg-card"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                    <h3 className="pr-4 text-base font-medium text-foreground">
                      {item.question}
                    </h3>
                    <span className="transition-transform group-open:rotate-180">
                      <svg
                        className="size-5 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full px-4 py-24 sm:px-6 sm:py-32 lg:px-8 xl:px-12">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-3xl font-light text-foreground sm:text-4xl lg:text-5xl">
              {ctaHeading}
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg font-light text-muted-foreground">
              {ctaDesc}
            </p>
            <form
              className="mx-auto max-w-md"
              aria-label="Final waitlist signup"
              onSubmit={(e) => void handleWaitlistSubmit("CTA Form", e)}
            >
              <div className="flex flex-col gap-3 sm:flex-row">
                <label htmlFor="cta-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="cta-email"
                  type="email"
                  name="email"
                  required
                  placeholder={ctaPlaceholder}
                  className={inputCls}
                />
                <button type="submit" className={submitCls}>
                  {ctaSubmit}
                </button>
              </div>
            </form>
            <p className="mt-8 text-xs text-muted-foreground">
              {ctaContactPrefix}{" "}
              <button
                type="button"
                onClick={() => go(ctaContactEmail)}
                className="underline transition-colors hover:text-foreground"
              >
                {ctaContactEmail}
              </button>
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full border-t border-border px-4 py-12 sm:px-6 lg:px-8 xl:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => go(brand)}
                  className="text-lg font-semibold tracking-tight text-foreground"
                >
                  {brand}
                </button>
                <span className="text-muted-foreground/60">|</span>
                <span className="text-sm text-muted-foreground">
                  {footerNote}
                </span>
              </div>
              <div className="flex items-center gap-6">
                {footerSocials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    onClick={() => go(social)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {social}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
              <p className="text-xs text-muted-foreground">{footerCopyright}</p>
              <div className="flex items-center gap-6">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
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
