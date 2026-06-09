import { useState } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * TestimonialsKimiPage — a complete, self-contained CUSTOMER-PROOF / TESTIMONIALS page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "FlowSync — Customer Success
 * Stories" design: a clean, light, editorial SaaS aesthetic on a neutral canvas
 * with crisp borders and subtle muted section bands. It opens with a sticky
 * navbar and a calm hero ("Trusted by 2,500+ teams worldwide"), a trusted-by
 * logo wall, a four-up metrics strip, a 3-column wall of star-rated quote cards
 * with avatar attributions, a 2-column in-depth case-study grid (cover image,
 * industry tag, headline, narrative, 3 result KPIs, read-more link), a verified-
 * reviews band (G2 / Capterra / Trustpilot / GetApp rating cards plus one
 * featured long-form review with a Verified-Buyer badge), a dark conversion CTA,
 * and a rich multi-column footer.
 *
 * The block owns ALL layout, spacing, borders and type hierarchy. Surfaces use
 * semantic theme tokens (background / muted / card / primary), star ratings and
 * the brand mark use `text-primary`, industry tags rotate the secondary / accent
 * / chart data tokens. Every nav item / CTA / footer link / social / form-submit
 * routes through `useNavigate` (never a dead "#"). All imagery (case-study covers
 * AND reviewer headshots) uses the alt-driven <Image> component (never a raw src).
 * Callers supply ONLY content data; rich defaults make it render great on no props.
 */
export const TestimonialsKimiPage = defineComponent({
  name: "TestimonialsKimiPage",
  description:
    "Complete CUSTOMER TESTIMONIALS / SOCIAL-PROOF / CASE-STUDIES page with a clean, light, editorial SaaS aesthetic: neutral canvas, crisp borders, muted section bands. Includes a sticky navbar, a calm hero ('Trusted by 2,500+ teams worldwide' with eyebrow + dual CTAs), a trusted-by logo wall, a four-up metrics/stats strip (productivity gain, tasks, uptime, savings), a 3-column WALL OF QUOTE TESTIMONIALS (five-star ratings, customer quotes, headshot avatars with name + role + company), a 2-column in-depth CASE-STUDY grid (cover photo, industry tag, headline, narrative, three result KPIs, read-full-case-study link), a VERIFIED-REVIEWS band (G2 / Capterra / Trustpilot / GetApp star-rating cards plus one featured long-form review with a Verified Buyer badge), a dark conversion CTA ('Ready to transform your workflows?' free-trial + demo), and a rich multi-column footer with social + sitemap links. Use as a dedicated testimonials / reviews / customer-stories / social-proof / case-studies page for any SaaS, B2B, agency, or product brand that wants credibility through real quotes, ratings, logos and metrics. Supply content only — brand, nav, hero, logos, stats, testimonials, caseStudies, reviews, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / product name shown in the navbar and footer. */
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
      })
      .optional(),
    /** Trusted-by logo wall. */
    logos: z
      .object({
        heading: z.string().optional(),
        companies: z.array(z.string()).optional(),
      })
      .optional(),
    /** Four-up metrics / stats strip. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** Quote-testimonial wall. */
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
    /** In-depth case studies. */
    caseStudies: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        readMore: z.string().optional(),
        items: z
          .array(
            z.object({
              tag: z.string(),
              meta: z.string(),
              title: z.string(),
              body: z.string(),
              imageAlt: z.string(),
              metrics: z
                .array(z.object({ value: z.string(), label: z.string() }))
                .optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Verified-reviews band: platform rating cards + featured review. */
    reviews: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        platforms: z
          .array(
            z.object({
              rating: z.string(),
              name: z.string(),
              count: z.string(),
            }),
          )
          .optional(),
        featured: z
          .object({
            posted: z.string().optional(),
            title: z.string().optional(),
            body: z.array(z.string()).optional(),
            name: z.string().optional(),
            role: z.string().optional(),
            badge: z.string().optional(),
            avatarAlt: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
    /** Dark conversion CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        description: z.string().optional(),
        socials: z.array(z.string()).optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "FlowSync"
    const nav = props.nav?.length
      ? props.nav
      : ["Testimonials", "Case Studies", "Results", "Get Started"]

    const heroEyebrow = props.hero?.eyebrow ?? "Customer Success"
    const heroHeading = props.hero?.heading ?? "Trusted by 2,500+ teams worldwide"
    const heroSub =
      props.hero?.subheading ??
      "See how industry leaders use FlowSync to streamline workflows, boost productivity, and deliver exceptional results. Real stories, real metrics, real impact."
    const heroPrimary = props.hero?.primaryCta ?? "Read Stories"
    const heroSecondary = props.hero?.secondaryCta ?? "View Results"

    const logosHeading =
      props.logos?.heading ?? "Powering teams at leading companies"
    const logoCompanies = props.logos?.companies?.length
      ? props.logos.companies
      : ["Stripe", "Notion", "Figma", "Linear", "Vercel", "Webflow"]

    const stats = props.stats?.length
      ? props.stats
      : [
          { value: "47%", label: "Average productivity gain" },
          { value: "2.5M+", label: "Tasks completed daily" },
          { value: "99.9%", label: "Uptime guarantee" },
          { value: "$12M", label: "Customer savings in 2024" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "What our customers say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Hear from the teams that transformed their workflows with FlowSync."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "FlowSync reduced our project handoff time by 62%. What used to take three days of back-and-forth emails now happens in real-time. Our client satisfaction scores jumped from 7.2 to 9.1.",
            name: "Sarah Chen",
            role: "VP of Operations, TechStream Solutions",
            avatarAlt:
              "Professional headshot of Sarah Chen, VP of Operations at TechStream Solutions",
          },
          {
            quote:
              "We onboarded 340 new employees in Q1 using FlowSync's automated workflows. Saved us roughly $180,000 in training costs and cut onboarding time from 5 days to 2. Absolutely transformative.",
            name: "Marcus Rodriguez",
            role: "Chief People Officer, Vertex Dynamics",
            avatarAlt:
              "Professional headshot of Marcus Rodriguez, Chief People Officer at Vertex Dynamics",
          },
          {
            quote:
              "The analytics dashboard alone paid for our annual subscription in the first month. We identified 14 redundant processes and consolidated vendor contracts, saving $47,000 per quarter.",
            name: "Dr. Elena Vasquez",
            role: "Director of Finance, Meridian Global",
            avatarAlt:
              "Professional headshot of Dr. Elena Vasquez, Director of Finance at Meridian Global",
          },
          {
            quote:
              "Our development team shipped 3x more features after implementing FlowSync. The cross-functional visibility eliminated the 'who's working on what' problem completely.",
            name: "James Nakamura",
            role: "Engineering Lead, CodeCraft Studios",
            avatarAlt:
              "Professional headshot of James Nakamura, Engineering Lead at CodeCraft Studios",
          },
          {
            quote:
              "Switching from our legacy project management tool to FlowSync was the best decision we made in 2024. Support response time dropped from 24 hours to under 2 hours.",
            name: "Amanda Foster",
            role: "Head of Customer Success, CloudBridge Inc",
            avatarAlt:
              "Professional headshot of Amanda Foster, Head of Customer Success at CloudBridge Inc",
          },
          {
            quote:
              "As a fully remote team of 89 people across 12 time zones, FlowSync is our virtual HQ. The async standups and workflow automation keep us in sync without endless meetings.",
            name: "David Park",
            role: "CEO, Distributed Labs",
            avatarAlt:
              "Professional headshot of David Park, CEO at Distributed Labs",
          },
        ]

    const caseHeading = props.caseStudies?.heading ?? "In-depth case studies"
    const caseDesc =
      props.caseStudies?.description ??
      "Detailed breakdowns of how organizations achieved measurable results with FlowSync."
    const caseReadMore = props.caseStudies?.readMore ?? "Read full case study"
    const defaultCaseItems = [
          {
            tag: "SaaS",
            meta: "250+ employees",
            title: "How Notionly cut sprint planning time by 73%",
            body: "Notionly's engineering team was spending 12 hours per week on sprint planning across three product squads. After implementing FlowSync's automated workflow templates and real-time capacity dashboards, planning time dropped to 3.2 hours per week—freeing up 468 engineering hours monthly for actual development work.",
            imageAlt:
              "Modern open-plan office workspace with teams collaborating at standing desks",
            metrics: [
              { value: "73%", label: "Time saved" },
              { value: "$340K", label: "Annual savings" },
              { value: "6 weeks", label: "ROI achieved" },
            ],
          },
          {
            tag: "Healthcare",
            meta: "1,200+ staff",
            title: "Metro Health reduced patient wait times by 41%",
            body: "Metro Health Systems was struggling with 47-minute average patient wait times across 12 outpatient clinics. FlowSync's patient flow optimization and staff scheduling modules helped them redesign their intake process. Average wait time dropped to 27 minutes, patient satisfaction scores rose 23 points, and they saw an 18% increase in daily patient volume.",
            imageAlt:
              "Healthcare professionals reviewing patient data on tablets in a modern clinic",
            metrics: [
              { value: "41%", label: "Wait time reduction" },
              { value: "18%", label: "Volume increase" },
              { value: "23 pts", label: "Satisfaction gain" },
            ],
          },
          {
            tag: "E-commerce",
            meta: "89 employees",
            title: "Boutique Co scaled order processing 5x without hiring",
            body: "Boutique Co was drowning in manual order processing during peak seasons, processing 340 orders daily with a team of 12. After integrating FlowSync with their Shopify store and warehouse systems, the same team now processes 1,700+ orders daily—handling Black Friday volume that previously required 8 seasonal temps, saving $67,000 in temp labor costs.",
            imageAlt:
              "E-commerce fulfillment warehouse with workers processing orders and packages",
            metrics: [
              { value: "5x", label: "Throughput increase" },
              { value: "$67K", label: "Labor cost saved" },
              { value: "12→12", label: "Zero new hires" },
            ],
          },
          {
            tag: "Agency",
            meta: "34 employees",
            title: "Pinnacle Creative doubled client retention to 94%",
            body: "Pinnacle Creative Agency was losing clients at a 23% annual churn rate due to missed deadlines and poor communication visibility. FlowSync's client portal and automated milestone tracking gave clients real-time project visibility. Churn dropped to 6%, NPS scores jumped from 32 to 71, and their sales cycle shortened by 19 days due to stronger reference pipeline.",
            imageAlt:
              "Creative marketing agency team brainstorming in a collaborative workspace",
            metrics: [
              { value: "94%", label: "Retention rate" },
              { value: "32→71", label: "NPS increase" },
              { value: "-19 days", label: "Sales cycle" },
            ],
          },
        ]
    const caseItems = props.caseStudies?.items?.length
      ? props.caseStudies.items.map((item, index) => ({
          ...item,
          metrics: item.metrics?.length
            ? item.metrics
            : (defaultCaseItems[index % defaultCaseItems.length]?.metrics ?? []),
        }))
      : defaultCaseItems

    const reviewsHeading = props.reviews?.heading ?? "Verified reviews"
    const reviewsDesc =
      props.reviews?.description ??
      "Authentic feedback from verified customers on independent platforms."
    const reviewPlatforms = props.reviews?.platforms?.length
      ? props.reviews.platforms
      : [
          { rating: "4.9", name: "G2 Rating", count: "2,847 reviews" },
          { rating: "4.8", name: "Capterra", count: "1,523 reviews" },
          { rating: "4.9", name: "Trustpilot", count: "4,192 reviews" },
          { rating: "4.7", name: "GetApp", count: "987 reviews" },
        ]
    const featuredPosted =
      props.reviews?.featured?.posted ?? "Posted on G2, March 2025"
    const featuredTitle =
      props.reviews?.featured?.title ??
      '"Best-in-class workflow automation with enterprise-grade security"'
    const featuredBody = props.reviews?.featured?.body?.length
      ? props.reviews.featured.body
      : [
          "We've evaluated 14 different workflow platforms over the past 18 months. FlowSync is the only solution that combines intuitive UX with robust enterprise security features. The SSO integration took 20 minutes to set up, and their SCIM provisioning automatically syncs with our Okta directory. Our security team finally approved a workflow tool without caveats.",
          "The API is exceptionally well-documented—we had our first custom integration running in under 3 hours. Support response times average under 4 minutes during business hours, and their solutions engineers actually understand complex technical requirements.",
        ]
    const featuredName = props.reviews?.featured?.name ?? "Thomas Andersson"
    const featuredRole = props.reviews?.featured?.role ?? "CTO, Nordic Ventures"
    const featuredBadge = props.reviews?.featured?.badge ?? "Verified Buyer"
    const featuredAvatarAlt =
      props.reviews?.featured?.avatarAlt ??
      "Professional headshot of Thomas Andersson, CTO at Nordic Ventures"

    const ctaHeading =
      props.cta?.heading ?? "Ready to transform your workflows?"
    const ctaDesc =
      props.cta?.description ??
      "Join 2,500+ teams already using FlowSync to streamline operations, boost productivity, and deliver better results. Start your free 14-day trial today."
    const ctaPrimary = props.cta?.primaryCta ?? "Start free trial"
    const ctaSecondary = props.cta?.secondaryCta ?? "Schedule demo"
    const ctaNote =
      props.cta?.note ?? "No credit card required. Full feature access during trial."

    const footerDesc =
      props.footer?.description ??
      "Workflow automation and team collaboration platform trusted by industry leaders worldwide."
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Twitter", "LinkedIn", "GitHub"]
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: [
              "Features",
              "Integrations",
              "Pricing",
              "Changelog",
              "API Docs",
            ],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Press", "Partners"],
          },
          {
            title: "Resources",
            links: [
              "Help Center",
              "Community",
              "Templates",
              "Webinars",
              "Contact",
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ?? `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]

    // Brand mark — decorative stacked-chevron glyph using the primary token.
    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={cn("text-primary", className)}
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="8" fill="currentColor" />
        <path
          d="M8 16L14 10L20 16L26 10"
          stroke="currentColor"
          className="text-primary-foreground"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 22L14 16L20 22L26 16"
          stroke="currentColor"
          className="text-primary-foreground"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )

    const Stars = ({ count = 5 }: { count?: number }) => (
      <div className="flex items-center gap-1" aria-label={`${count} out of 5 stars`}>
        {Array.from({ length: count }).map((_, i) => (
          <svg
            key={i}
            className="size-5 text-primary"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-4", className)}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    )

    // Industry tag accent classes — rotate semantic data tokens (no raw palette).
    const tagStyles = [
      "bg-chart-1/15 text-chart-1",
      "bg-chart-2/15 text-chart-2",
      "bg-chart-3/15 text-chart-3",
      "bg-chart-4/15 text-chart-4",
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
                aria-label={`${brand} Home`}
              >
                <LogoMark className="size-8" />
                <span className="text-xl font-semibold tracking-tight">
                  {brand}
                </span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.slice(0, -1).map((label) => (
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
                  onClick={() => go(nav[nav.length - 1])}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {nav[nav.length - 1]}
                </button>
              </div>
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
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
                    strokeWidth={2}
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
          <section className="relative border-b border-border bg-muted/40">
            <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32 lg:px-8">
              <div className="max-w-3xl">
                <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {heroEyebrow}
                </p>
                <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                  {heroHeading}
                </h1>
                <p className="mb-8 text-lg leading-relaxed text-muted-foreground md:text-xl">
                  {heroSub}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {heroPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {heroSecondary}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Trusted-by logos */}
          <section
            className="border-b border-border bg-background py-16"
            aria-label="Trusted companies"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-10 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 text-muted-foreground/70 md:grid-cols-3 lg:grid-cols-6">
                {logoCompanies.map((company) => (
                  <div
                    key={company}
                    className="flex h-12 items-center justify-center text-xl font-semibold tracking-tight"
                  >
                    {company}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-muted/40 py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="mb-2 text-4xl font-bold md:text-5xl">
                      {s.value}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials wall */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <article
                    key={t.name}
                    className="rounded-xl border border-border bg-muted/40 p-8"
                  >
                    <div className="mb-6">
                      <Stars />
                    </div>
                    <blockquote className="mb-6 leading-relaxed text-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Case studies */}
          <section className="bg-muted/40 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                  {caseHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{caseDesc}</p>
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                {caseItems.map((cs, i) => (
                  <article
                    key={cs.title}
                    className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm"
                  >
                    <Image
                      alt={cs.imageAlt}
                      w={800}
                      h={400}
                      loading="lazy"
                      className="h-56 w-full object-cover"
                    />
                    <div className="p-8">
                      <div className="mb-4 flex items-center gap-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                            tagStyles[i % tagStyles.length],
                          )}
                        >
                          {cs.tag}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {cs.meta}
                        </span>
                      </div>
                      <h3 className="mb-3 text-xl font-bold">{cs.title}</h3>
                      <p className="mb-6 leading-relaxed text-muted-foreground">
                        {cs.body}
                      </p>
                      <div className="grid grid-cols-3 gap-4 border-t border-border py-6">
                        {cs.metrics.map((m) => (
                          <div key={m.label}>
                            <p className="text-2xl font-bold">{m.value}</p>
                            <p className="text-xs text-muted-foreground">
                              {m.label}
                            </p>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => go(cs.title)}
                        className="inline-flex items-center text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                      >
                        {caseReadMore}
                        <ArrowRight className="ml-1" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Verified reviews */}
          <section className="border-t border-border bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                  {reviewsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{reviewsDesc}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {reviewPlatforms.map((p) => (
                  <div
                    key={p.name}
                    className="rounded-xl border border-border bg-muted/40 p-6 text-center"
                  >
                    <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-primary">
                      <svg
                        className="size-6 text-primary-foreground"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                    <p className="mb-1 text-3xl font-bold">{p.rating}</p>
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                      {p.name}
                    </p>
                    <p className="text-xs text-muted-foreground/80">{p.count}</p>
                  </div>
                ))}
              </div>

              {/* Featured review */}
              <div className="mt-12 rounded-2xl border border-border bg-muted/40 p-8 md:p-12">
                <div className="flex flex-col items-start gap-8 md:flex-row">
                  <div className="shrink-0">
                    <Image
                      alt={featuredAvatarAlt}
                      w={200}
                      h={200}
                      loading="lazy"
                      className="size-20 rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="mb-4 flex items-center gap-2">
                      <Stars />
                      <span className="ml-2 text-sm text-muted-foreground">
                        {featuredPosted}
                      </span>
                    </div>
                    <h3 className="mb-3 text-xl font-bold">{featuredTitle}</h3>
                    {featuredBody.map((para, i) => (
                      <p
                        key={i}
                        className={cn(
                          "leading-relaxed text-muted-foreground",
                          i < featuredBody.length - 1 ? "mb-4" : "mb-6",
                        )}
                      >
                        {para}
                      </p>
                    ))}
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <p className="font-semibold">{featuredName}</p>
                        <p className="text-sm text-muted-foreground">
                          {featuredRole}
                        </p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-chart-2/15 px-3 py-1 text-xs font-medium text-chart-2">
                        <svg
                          className="mr-1 size-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {featuredBadge}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Conversion CTA */}
          <section className="bg-primary py-24">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold text-primary-foreground md:text-4xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-foreground/70">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center rounded-lg bg-background px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center rounded-lg border border-primary-foreground/40 px-8 py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-6 text-sm text-primary-foreground/60">{ctaNote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-muted py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
              <div className="col-span-2 lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                  aria-label={`${brand} Home`}
                >
                  <LogoMark className="size-8" />
                  <span className="text-xl font-semibold tracking-tight">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {footerDesc}
                </p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {social}
                    </button>
                  ))}
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">
                    {col.title}
                  </h4>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">{footerCopyright}</p>
              <div className="flex gap-6">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
