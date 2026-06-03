import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * AccountingFirmHero — split, editorial hero band for a CPA / accounting-firm
 * landing page. A two-column section on a card surface: on the left an uppercase
 * "Est." eyebrow, a large two-line headline, a supporting paragraph, dual CTAs
 * (filled primary + secondary), and an inline check-marked trust-badge row; on
 * the right a 4:3 photo with a floating tax-savings stat card pinned to its
 * lower-left corner. Calm, trustworthy professional-services aesthetic. CTAs
 * route through useNavigate; the photo uses the alt-driven Image component. Use
 * as the opening hero for accounting firms, CPA practices, tax-preparation
 * services, bookkeeping/payroll providers, or financial advisory practices.
 * Renders fully with no props via baked-in "Northridge" defaults.
 */
export const AccountingFirmHero = defineComponent({
  name: "AccountingFirmHero",
  description:
    "Split editorial hero band for a CPA / accounting-firm landing page: two-column section on a card surface with an uppercase Est.-year eyebrow, a large two-line headline, a supporting paragraph, dual CTAs (filled primary + secondary), and an inline check-marked trust-badge row on the left; a 4:3 photo with a floating tax-savings stat card pinned to its lower-left corner on the right. Calm, trustworthy professional-services look; CTAs route through useNavigate and the photo uses the alt-driven Image component. Use as the opening hero for accounting firms, CPA practices, tax-preparation services, bookkeeping/payroll providers, or financial advisory practices.",
  props: z.object({
    /** Uppercase eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** First headline line. */
    headingTop: z.string().optional(),
    /** Second headline line. */
    headingBottom: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Alt text driving the hero photo. */
    imageAlt: z.string().optional(),
    /** Big value on the floating stat card. */
    statValue: z.string().optional(),
    /** Caption under the floating stat value. */
    statLabel: z.string().optional(),
    /** Inline check-marked trust badges below the hero copy. */
    badges: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow =
      props.eyebrow ?? "Est. 1987 • Chartered Professional Accountants"
    const headingTop = props.headingTop ?? "Clarity in every number."
    const headingBottom =
      props.headingBottom ?? "Confidence in every decision."
    const subheading =
      props.subheading ??
      "Northridge Financial Partners provides comprehensive accounting, tax, and advisory services for growing businesses and individuals. Trusted by 800+ clients across the Pacific Northwest."
    const primaryCta = props.primaryCta ?? "Book Free Consultation"
    const secondaryCta = props.secondaryCta ?? "Explore Services"
    const imageAlt =
      props.imageAlt ??
      "professional accountant reviewing financial documents with laptop and calculator in modern office"
    const statValue = props.statValue ?? "$47M+"
    const statLabel =
      props.statLabel ?? "Tax savings secured for clients in 2024"
    const badges = props.badges?.length
      ? props.badges
      : ["CPA Certified", "A+ BBB Rating", "37 Years Experience"]

    const Check = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )

    return (
      <section
        className={cn("relative border-b border-border bg-card", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-2xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {eyebrow}
              </p>
              <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {headingTop}
                <br />
                {headingBottom}
              </h1>
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(primaryCta)}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {primaryCta}
                </button>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="inline-flex items-center justify-center rounded-md bg-secondary px-6 py-3.5 text-base font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                >
                  {secondaryCta}
                </button>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                {badges.map((badge) => (
                  <div key={badge} className="flex items-center gap-2">
                    <Check className="size-5 text-primary" />
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <Image
                alt={imageAlt}
                w={800}
                h={600}
                className="aspect-[4/3] w-full rounded-lg object-cover shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 hidden rounded-lg border border-border bg-card p-4 shadow-lg sm:block">
                <p className="text-3xl font-bold text-foreground">{statValue}</p>
                <p className="text-sm text-muted-foreground">{statLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
