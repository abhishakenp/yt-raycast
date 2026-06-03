import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * LendingBenefits — a "why borrowers choose us" benefits grid for a lending or
 * fintech marketing page. A centered heading + supporting description above a
 * responsive 3-up grid of white benefit cards, each with a rounded muted
 * icon tile (cycling through a set of line glyphs), a bold title, and a
 * descriptive paragraph. Use to spell out product advantages — fast funding,
 * no hidden fees, fixed rates, paperless apply, human support, soft credit
 * check — on loan, debt-consolidation, or fintech landing pages. Renders fully
 * with no props via baked-in "ClearLoan" defaults.
 */
export const LendingBenefits = defineComponent({
  name: "LendingBenefits",
  description:
    "'Why borrowers choose us' benefits grid for a lending or fintech marketing page: centered heading + supporting description above a responsive 3-up grid of white benefit cards, each with a rounded muted icon tile (cycling line glyphs), a bold title and a descriptive paragraph. Use to spell out product advantages — fast funding, no hidden fees, fixed rates, paperless apply, human support, soft credit check — on loan, debt-consolidation, or fintech landing pages.",
  props: z.object({
    /** Brand / lender name woven into the default heading. */
    brand: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? "ClearLoan"
    const benefitsHeading =
      props.heading ?? `Why borrowers choose ${brand}`
    const benefitsDesc =
      props.description ??
      "No hidden fees, no surprises. Just honest lending with terms that work for you."
    const benefitItems = props.items?.length
      ? props.items
      : [
          {
            title: "Funds in 24 hours",
            description:
              "Once approved, money hits your account as soon as the next business day. No waiting, no stress.",
          },
          {
            title: "No hidden fees",
            description:
              "Zero origination fees, zero prepayment penalties, zero late fees. What you see is what you pay.",
          },
          {
            title: "Fixed rates for life",
            description:
              "Your rate never changes. Budget with confidence knowing exactly what you'll pay every month.",
          },
          {
            title: "Paperless application",
            description:
              "Apply in under 2 minutes from your phone or laptop. No printing, no faxing, no branch visits.",
          },
          {
            title: "Human support",
            description:
              "Real people, real help. Our California-based team is available 7 days a week by phone or chat.",
          },
          {
            title: "Soft credit check",
            description:
              "Checking your rate won't affect your credit score. Apply with confidence, no strings attached.",
          },
        ]

    const benefitIcons = [
      "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
      "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
    ]

    return (
      <section className={cn("py-24 lg:py-32", props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {benefitsHeading}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{benefitsDesc}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {benefitItems.map((item, i) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card p-8 shadow-sm"
              >
                <div className="mb-5 grid size-12 place-items-center rounded-xl bg-muted text-foreground">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-6"
                    aria-hidden="true"
                  >
                    <path d={benefitIcons[i % benefitIcons.length]} />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">
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
    )
  },
})
