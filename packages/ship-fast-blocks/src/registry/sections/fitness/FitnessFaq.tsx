import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * FitnessFaq — native-details FAQ accordion for a gym or fitness studio. A centered
 * heading + lead paragraph above a narrow stack of bordered card-surface
 * disclosure rows, each a question summary with a chevron that rotates open to
 * reveal the answer. No JS state — uses native <details>. Renders fully on zero args.
 * Use to answer common questions (trial, freezing, discounts, hours, booking,
 * cancellation) on gyms, fitness studios, yoga / pilates / boxing / spin studios.
 */
export const FitnessFaq = defineComponent({
  name: "FitnessFaq",
  description:
    "Native-details FAQ accordion for a gym or fitness studio: a centered heading and lead paragraph above a narrow stack of bordered card-surface disclosure rows, each a question summary with a chevron that rotates open to reveal the answer (uses native <details>, no JS state). Use to answer common questions — free trial, freezing membership, discounts, hours, advance booking, cancellation — on gyms, fitness studios, CrossFit boxes, yoga, pilates, boxing or spin / cycle studios.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const faqHeading = props.heading ?? "Common questions"
    const faqDesc =
      props.description ?? "Everything you need to know before joining."
    const faqItems = props.items?.length
      ? props.items
      : [
          {
            q: "What's included in the free trial?",
            a: "Your 7-day trial includes full access to all gym equipment, unlimited group classes, and locker room facilities. No credit card required to start—only if you decide to continue.",
          },
          {
            q: "Can I freeze my membership?",
            a: "Yes. All memberships can be frozen for up to 3 months per year for travel, injury, or other life events. Frozen memberships maintain your rate and booking privileges resume immediately upon return.",
          },
          {
            q: "Do you offer corporate or student discounts?",
            a: "Yes. We partner with 50+ local companies for corporate rates (15% off). Students with valid ID receive 20% off any membership tier. Military, healthcare workers, and teachers receive 25% off.",
          },
          {
            q: "What are your hours?",
            a: "Monday–Friday: 5:30 AM – 10:00 PM. Saturday–Sunday: 7:00 AM – 8:00 PM. The facility closes only for Thanksgiving, Christmas Day, and New Year's Day. First class starts at 6:00 AM weekdays.",
          },
          {
            q: "Do I need to book classes in advance?",
            a: "We recommend booking through our app 12-24 hours ahead, especially for evening and weekend classes which fill quickly. Unlimited and Elite members get priority booking 7 days in advance vs 3 days for Base members.",
          },
          {
            q: "What's your cancellation policy?",
            a: "Monthly memberships can be cancelled anytime with 7 days notice before your next billing date. Annual memberships cancelled early incur a $99 early termination fee. We do not offer refunds for partial months.",
          },
        ]

    const ChevronIcon = () => (
      <svg
        className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 9l-7 7-7-7" />
      </svg>
    )

    return (
      <section className={cn("py-20 md:py-32", props.className)}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-semibold text-foreground md:text-4xl">
              {faqHeading}
            </h2>
            <p className="text-muted-foreground">{faqDesc}</p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item) => (
              <details
                key={item.q}
                className="group cursor-pointer rounded-lg border border-border bg-card p-6"
              >
                <summary className="flex list-none items-center justify-between font-medium text-card-foreground">
                  {item.q}
                  <ChevronIcon />
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
